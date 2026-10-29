/**
 * Simulação do pipeline api → outbox → broker → worker → webhook (+ DLQ).
 * Sem dependências: DOM + Web Animations API.
 *
 * Garantias que a simulação mostra:
 *  - broker fora: o relay pausa e as mensagens ficam no outbox; ao voltar, drena.
 *  - receiver lento: timeouts com retry, backoff exponencial e jitter; esgotou → DLQ.
 *  - mensagem inválida: vai direto para a DLQ; "replay" reprocessa (schema corrigido).
 */

type NodeId = 'api' | 'outbox' | 'broker' | 'worker' | 'webhook' | 'dlq';

interface Message {
  id: string;
  type: string;
  invalid: boolean;
}

interface Strings {
  online: string;
  offline: string;
  idle: string;
  waiting: string;
  queued: string;
  brokerDown: string;
  brokerUp: string;
  traceEmpty: string;
  log: Record<
    'accepted' | 'published' | 'held' | 'delivered' | 'timeout' | 'dlq' | 'exhausted' | 'replay' | 'brokerDown' | 'brokerUp',
    string
  >;
}

const MAX_ATTEMPTS = 5;
const BACKOFF_BASE_MS = 500;
const BACKOFF_CAP_MS = 6000;
const TRACE_LIMIT = 6;
const EVENT_TYPES = ['order.created v1', 'invoice.matched v1', 'quote.requested v2', 'payment.confirmed v1', 'stock.updated v1'];
const WIRES: [NodeId, NodeId, boolean?][] = [
  ['api', 'outbox'],
  ['outbox', 'broker'],
  ['broker', 'worker'],
  ['worker', 'webhook'],
  ['worker', 'dlq', true],
];

const SVG_NS = 'http://www.w3.org/2000/svg';
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function initPipeline(root: HTMLElement) {
  const S = JSON.parse(root.dataset.strings ?? '{}') as Strings;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const stage = root.querySelector<HTMLElement>('[data-stage]')!;
  const wiresSvg = root.querySelector<SVGSVGElement>('[data-wires]')!;
  const tokens = root.querySelector<HTMLElement>('[data-tokens]')!;
  const trace = root.querySelector<HTMLOListElement>('[data-trace]')!;
  const node = (id: NodeId) => root.querySelector<HTMLElement>(`[data-node="${id}"]`)!;
  const status = (id: NodeId) => node(id).querySelector<HTMLElement>('[data-status]')!;
  const btn = (action: string) => root.querySelector<HTMLButtonElement>(`[data-action="${action}"]`)!;
  const counterEls = {
    delivered: root.querySelector<HTMLElement>('[data-count="delivered"]')!,
    pending: root.querySelector<HTMLElement>('[data-count="pending"]')!,
    retries: root.querySelector<HTMLElement>('[data-count="retries"]')!,
    dlq: root.querySelector<HTMLElement>('[data-count="dlq"]')!,
  };
  const heroType = document.querySelector<HTMLElement>('[data-hero-event-type]');
  const heroStatus = document.querySelector<HTMLElement>('[data-hero-event-status]');
  const heroChip = document.querySelector<HTMLElement>('[data-hero-event]');

  /* ---------- estado ---------- */
  let generation = 0;
  let brokerDown = false;
  let slow = false;
  let relaying = false;
  let outbox: Message[] = [];
  let dlq: Message[] = [];
  let brokerQueue = 0;
  let workerActive = 0;
  const retrying = new Map<string, { until: number; attempt: number }>();
  const counts = { delivered: 0, pending: 0, retries: 0, dlq: 0 };
  let traceHasItems = false;

  /* ---------- geometria ---------- */
  function center(id: NodeId) {
    const s = stage.getBoundingClientRect();
    const r = node(id).getBoundingClientRect();
    return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2, w: r.width, h: r.height };
  }

  /** Ponto na borda da caixa A na direção de B. */
  function edge(a: ReturnType<typeof center>, b: ReturnType<typeof center>) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const tx = dx === 0 ? Infinity : a.w / 2 / Math.abs(dx);
    const ty = dy === 0 ? Infinity : a.h / 2 / Math.abs(dy);
    const t = Math.min(tx, ty);
    return { x: a.x + dx * t, y: a.y + dy * t };
  }

  const wirePaths = new Map<string, SVGPathElement>();
  function drawWires() {
    const s = stage.getBoundingClientRect();
    wiresSvg.setAttribute('viewBox', `0 0 ${s.width} ${s.height}`);
    for (const [a, b, dashed] of WIRES) {
      const key = `${a}-${b}`;
      let path = wirePaths.get(key);
      if (!path) {
        path = document.createElementNS(SVG_NS, 'path');
        path.classList.add('wire');
        if (dashed) path.classList.add('wire--dashed');
        wiresSvg.appendChild(path);
        wirePaths.set(key, path);
      }
      const ca = center(a);
      const cb = center(b);
      const p1 = edge(ca, cb);
      const p2 = edge(cb, ca);
      path.setAttribute('d', `M${p1.x.toFixed(1)} ${p1.y.toFixed(1)} L${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`);
    }
  }

  function flashWire(a: NodeId, b: NodeId, ms: number) {
    const path = wirePaths.get(`${a}-${b}`) ?? wirePaths.get(`${b}-${a}`);
    if (!path) return;
    path.classList.add('is-active');
    window.setTimeout(() => path.classList.remove('is-active'), ms);
  }

  /** Move um token de um nó a outro. Resolve quando chega. */
  async function travel(m: Message, from: NodeId, to: NodeId, opts: { speed?: number; variant?: string } = {}) {
    if (reduceMotion.matches) {
      await sleep(160);
      return;
    }
    const a = center(from);
    const b = center(to);
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    const duration = Math.min(1100, Math.max(380, dist * 2.4)) * (opts.speed ?? 1);
    const el = document.createElement('span');
    el.className = 'token';
    if (m.invalid) el.classList.add('token--invalid');
    if (opts.variant) el.classList.add(`token--${opts.variant}`);
    tokens.appendChild(el);
    flashWire(from, to, duration);
    const anim = el.animate(
      [
        { transform: `translate(${a.x}px, ${a.y}px) scale(0.6)`, opacity: 0 },
        { transform: `translate(${a.x + (b.x - a.x) * 0.12}px, ${a.y + (b.y - a.y) * 0.12}px) scale(1)`, opacity: 1, offset: 0.12 },
        { transform: `translate(${a.x + (b.x - a.x) * 0.88}px, ${a.y + (b.y - a.y) * 0.88}px) scale(1)`, opacity: 1, offset: 0.88 },
        { transform: `translate(${b.x}px, ${b.y}px) scale(0.6)`, opacity: 0 },
      ],
      { duration, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'forwards' },
    );
    try {
      await anim.finished;
    } catch {
      /* cancelado no reset */
    }
    el.remove();
  }

  function pulse(id: NodeId, cls = 'is-hit') {
    const el = node(id);
    el.classList.remove(cls);
    void el.offsetWidth; // reinicia a animação
    el.classList.add(cls);
  }

  /* ---------- render ---------- */
  function setCount(key: keyof typeof counts, value: number) {
    const el = counterEls[key];
    const prev = counts[key];
    counts[key] = value;
    el.textContent = String(value);
    if (value > prev && !reduceMotion.matches) {
      el.classList.remove('is-pop');
      void el.offsetWidth;
      el.classList.add('is-pop');
    }
  }

  function render() {
    // outbox
    const ob = node('outbox');
    status('outbox').textContent = `${outbox.length} ${S.queued}`;
    ob.classList.toggle('is-holding', outbox.length > 0 && brokerDown);
    const dots = ob.querySelector<HTMLElement>('[data-dots]')!;
    const want = Math.min(outbox.length, 8);
    while (dots.children.length < want) dots.appendChild(document.createElement('i'));
    while (dots.children.length > want) dots.lastElementChild?.remove();

    // broker
    node('broker').classList.toggle('is-down', brokerDown);
    status('broker').textContent = brokerDown ? S.offline : `${S.online} · ${brokerQueue} ${S.queued}`;

    // worker
    const w = node('worker');
    const now = performance.now();
    const next = [...retrying.values()].sort((x, y) => x.until - y.until)[0];
    if (next) {
      const secs = Math.max(0, (next.until - now) / 1000).toFixed(1);
      status('worker').textContent = `retry ${next.attempt}/${MAX_ATTEMPTS} · ${secs}s`;
    } else {
      status('worker').textContent = workerActive > 0 ? `${workerActive} · ${S.waiting}` : S.idle;
    }
    w.classList.toggle('is-busy', workerActive > 0);
    w.classList.toggle('is-retrying', retrying.size > 0);

    // webhook
    node('webhook').classList.toggle('is-slow', slow);
    status('webhook').textContent = slow ? '~2.4 s · timeout 1 s' : '~40 ms';

    // dlq
    status('dlq').textContent = String(dlq.length);
    node('dlq').classList.toggle('has-items', dlq.length > 0);
    btn('replay').disabled = dlq.length === 0;

    // botões
    const b = btn('broker');
    b.setAttribute('aria-pressed', String(brokerDown));
    b.querySelector('span')!.textContent = brokerDown ? S.brokerUp : S.brokerDown;
    btn('slow').setAttribute('aria-pressed', String(slow));
  }

  // contagem regressiva dos retries
  let ticking = false;
  function tick() {
    if (retrying.size === 0) {
      ticking = false;
      render();
      return;
    }
    render();
    requestAnimationFrame(tick);
  }
  function startTick() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(tick);
    }
  }

  function clock() {
    const d = new Date();
    const p = (n: number, l = 2) => String(n).padStart(l, '0');
    return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}`;
  }

  function log(m: Message | null, text: string, tone: 'ok' | 'warn' | 'err' | 'info' = 'info') {
    if (!traceHasItems) {
      trace.innerHTML = '';
      traceHasItems = true;
    }
    const li = document.createElement('li');
    li.className = `trace__row trace__row--${tone}`;
    const ts = document.createElement('span');
    ts.className = 'trace__ts';
    ts.textContent = clock();
    const id = document.createElement('span');
    id.className = 'trace__id';
    id.textContent = m ? m.id : '—';
    const type = document.createElement('span');
    type.className = 'trace__type';
    type.textContent = m ? m.type : 'system';
    const msg = document.createElement('span');
    msg.className = 'trace__msg';
    msg.textContent = text;
    li.append(ts, id, type, msg);
    trace.prepend(li);
    while (trace.children.length > TRACE_LIMIT) trace.lastElementChild?.remove();
  }

  /* ---------- fluxo ---------- */
  const newId = () => `evt_${Math.random().toString(16).slice(2, 6)}${Date.now().toString(16).slice(-2)}`;

  async function emit(invalid = false) {
    const gen = generation;
    const m: Message = { id: newId(), type: EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)], invalid };
    if (invalid) m.type = m.type.replace(/v\d$/, 'v?');
    setCount('pending', counts.pending + 1);
    pulse('api');
    await travel(m, 'api', 'outbox');
    if (gen !== generation) return;
    outbox.push(m);
    pulse('outbox');
    log(m, brokerDown ? S.log.held : S.log.accepted, brokerDown ? 'warn' : 'info');
    render();
    void relay();
  }

  async function relay() {
    if (relaying) return;
    relaying = true;
    const gen = generation;
    while (!brokerDown && outbox.length > 0) {
      const m = outbox.shift()!;
      render();
      await travel(m, 'outbox', 'broker');
      if (gen !== generation) return;
      brokerQueue++;
      pulse('broker');
      log(m, S.log.published, 'info');
      render();
      void consume(m);
      await sleep(reduceMotion.matches ? 60 : 180);
    }
    relaying = false;
  }

  async function waitBroker(gen: number) {
    while (brokerDown && gen === generation) await sleep(200);
  }

  async function consume(m: Message) {
    const gen = generation;
    await sleep(220);
    await waitBroker(gen);
    if (gen !== generation) return;
    await travel(m, 'broker', 'worker');
    if (gen !== generation) return;
    brokerQueue--;
    workerActive++;
    pulse('worker');
    render();

    if (m.invalid) {
      await sleep(260);
      if (gen !== generation) return;
      await toDlq(m, S.log.dlq, gen);
      return;
    }
    await deliver(m, gen);
  }

  async function toDlq(m: Message, reason: string, gen: number) {
    await travel(m, 'worker', 'dlq', { variant: 'dead' });
    if (gen !== generation) return;
    workerActive--;
    dlq.push(m);
    setCount('dlq', counts.dlq + 1);
    setCount('pending', counts.pending - 1);
    pulse('dlq', 'is-alarm');
    log(m, reason, 'err');
    render();
  }

  async function deliver(m: Message, gen: number) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const failing = slow && Math.random() < 0.65;
      await travel(m, 'worker', 'webhook', { speed: slow ? 1.7 : 1 });
      if (gen !== generation) return;

      if (!failing) {
        workerActive--;
        setCount('delivered', counts.delivered + 1);
        setCount('pending', counts.pending - 1);
        pulse('webhook', 'is-ok');
        log(m, attempt > 1 ? `${S.log.delivered} (${attempt}/${MAX_ATTEMPTS})` : S.log.delivered, 'ok');
        updateHero(m, attempt);
        render();
        return;
      }

      pulse('webhook', 'is-fail');
      await travel(m, 'webhook', 'worker', { variant: 'retry' });
      if (gen !== generation) return;

      if (attempt === MAX_ATTEMPTS) {
        await toDlq(m, S.log.exhausted, gen);
        return;
      }

      // backoff exponencial com "equal jitter": metade fixa + metade aleatória
      const exp = Math.min(BACKOFF_CAP_MS, BACKOFF_BASE_MS * 2 ** (attempt - 1));
      const wait = Math.round(exp / 2 + Math.random() * (exp / 2));
      setCount('retries', counts.retries + 1);
      log(m, `${S.log.timeout} ${(wait / 1000).toFixed(1)}s (${attempt + 1}/${MAX_ATTEMPTS})`, 'warn');
      retrying.set(m.id, { until: performance.now() + wait, attempt: attempt + 1 });
      startTick();
      await sleep(wait);
      retrying.delete(m.id);
      if (gen !== generation) return;
      render();
    }
  }

  async function replay() {
    if (dlq.length === 0) return;
    const gen = generation;
    const items = dlq;
    dlq = [];
    setCount('dlq', 0);
    render();
    log(null, `${S.log.replay} (${items.length})`, 'info');
    for (const m of items) {
      m.invalid = false;
      m.type = m.type.replace(/v\?$/, 'v1');
      setCount('pending', counts.pending + 1);
      void (async () => {
        await travel(m, 'dlq', 'worker', { variant: 'retry' });
        if (gen !== generation) return;
        workerActive++;
        render();
        await deliver(m, gen);
      })();
      await sleep(reduceMotion.matches ? 60 : 260);
    }
  }

  function updateHero(m: Message, attempt: number) {
    if (!heroType || !heroStatus) return;
    heroType.textContent = `${m.id} · ${m.type}`;
    heroStatus.textContent = `webhook · 200 OK${attempt > 1 ? ` · ${attempt}/${MAX_ATTEMPTS}` : ''}`;
    if (heroChip && !reduceMotion.matches) {
      heroChip.classList.remove('is-bump');
      void heroChip.offsetWidth;
      heroChip.classList.add('is-bump');
    }
  }

  function reset() {
    generation++;
    brokerDown = false;
    slow = false;
    relaying = false;
    outbox = [];
    dlq = [];
    brokerQueue = 0;
    workerActive = 0;
    retrying.clear();
    tokens.querySelectorAll('.token').forEach((t) => {
      t.getAnimations().forEach((a) => a.cancel());
      t.remove();
    });
    (Object.keys(counts) as (keyof typeof counts)[]).forEach((k) => {
      counts[k] = 0;
      counterEls[k].textContent = '0';
    });
    trace.innerHTML = '';
    const li = document.createElement('li');
    li.className = 'trace__empty';
    li.textContent = S.traceEmpty;
    trace.append(li);
    traceHasItems = false;
    render();
  }

  /* ---------- eventos ---------- */
  btn('emit').addEventListener('click', () => void emit(false));
  btn('invalid').addEventListener('click', () => void emit(true));
  btn('replay').addEventListener('click', () => void replay());
  btn('reset').addEventListener('click', reset);
  btn('slow').addEventListener('click', () => {
    slow = !slow;
    render();
  });
  btn('broker').addEventListener('click', () => {
    brokerDown = !brokerDown;
    log(null, brokerDown ? S.log.brokerDown : S.log.brokerUp, brokerDown ? 'err' : 'ok');
    render();
    if (!brokerDown) void relay();
  });

  new ResizeObserver(() => drawWires()).observe(stage);
  drawWires();
  render();

  // Ao entrar na tela pela primeira vez, mostra um evento percorrendo o fluxo.
  if (!reduceMotion.matches && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          window.setTimeout(() => {
            if (counts.delivered === 0 && counts.pending === 0) void emit(false);
          }, 500);
        }
      },
      { threshold: 0.5 },
    );
    io.observe(stage);
  }
}
