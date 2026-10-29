# Matheus Andrell: portfólio

Portfólio pessoal de engenheiro de software backend. A carreira aparece como um sistema orientado a eventos: um pipeline interativo (api → outbox → broker → worker → webhook) e um *event log* com replay.

- **Astro 7 + TypeScript**, CSS puro com variáveis. Sem Tailwind e sem biblioteca de componentes.
- **100% estático**, pronto para a Vercel sem configuração.
- **Bilíngue** em `/pt` e `/en`. Todo o conteúdo vem de `src/data/profile.ts`.
- **Tema escuro (padrão) e claro**, com a escolha salva no navegador.
- **Lighthouse 98–100** (mobile e desktop), sem violações no axe nos dois temas.
- Animações só com `transform`/`opacity`, todas desligadas com `prefers-reduced-motion`.

## Rodando localmente

Requer **Node 22.12+**.

```bash
npm install
npm run dev       # http://localhost:4321  (redireciona para /pt)
npm run build     # gera ./dist
npm run preview   # serve o build
npm run check     # checagem de tipos (astro check)
```

## Estrutura

```
src/
├── data/profile.ts          # TODO o conteúdo (PT/EN), tipado
├── layouts/BaseLayout.astro # <head>, meta/OG, JSON-LD, tema sem flash
├── pages/
│   ├── [lang]/index.astro   # /pt e /en (rotas estáticas)
│   ├── 404.astro
│   └── robots.txt.ts
├── components/
│   ├── SiteHeader.astro     # menu em pílula, scroll-spy, menu móvel
│   ├── LangToggle.astro     # PT/EN mantendo a seção atual
│   ├── ThemeToggle.astro
│   ├── Hero.astro
│   ├── LiquidBlob.astro     # forma "líquida" em SVG animada
│   ├── PipelineSim.astro    # 01 · simulação do pipeline
│   ├── EventLog.astro       # 02 · event log da carreira + replay
│   ├── ProjectCard.astro    # 03 · EventCore + voluntariado
│   ├── StackGrid.astro      # 04 · stack por domínio
│   ├── Education.astro      # 05 · formação, certificações, idiomas
│   ├── Contact.astro        # 06 · contato (sem formulário)
│   └── SiteFooter.astro
├── scripts/
│   ├── pipeline.ts          # lógica da simulação (sem dependências)
│   └── reveal.ts            # entrada dos blocos ao rolar
└── styles/global.css        # tokens de cor/tipo, temas, botões
public/
├── favicon.svg
├── apple-touch-icon.png
└── og-image.png             # 1200×630
```

## Editando o conteúdo

Tudo fica em `src/data/profile.ts`:

- `identity`: nome, headline, frase do banner, contato, idiomas.
- `careerEvents`: eventos do log (mais recente primeiro). Cada um tem `type` versionado, `timestamp`, `payload`, `metrics` opcionais e `details`.
- `eventCore`, `volunteering`: projetos.
- `stack`: grupos por domínio. `highlight` destaca itens com borda em degradê.
- `education`, `certificates`: `featured: true` deixa o certificado visível; os demais ficam em "Ver todas".
- `ui`: textos de interface nos dois idiomas.

Textos bilíngues usam o tipo `L = { pt: string; en: string }`, então o TypeScript avisa se faltar uma tradução.

## A simulação

`src/scripts/pipeline.ts` roda um fluxo assíncrono por mensagem:

| Ação | O que acontece |
| --- | --- |
| **Emitir evento** | api grava no outbox; o relay publica no broker; o worker entrega no webhook. |
| **Derrubar broker** | O relay pausa. As mensagens ficam no outbox e são drenadas quando o broker volta. |
| **Receiver lento** | ~65% das entregas dão timeout. Retry com backoff exponencial (base 500 ms, teto 6 s) e *equal jitter*. Após 5 tentativas, a mensagem vai para a DLQ. |
| **Mensagem inválida** | Falha de schema e vai direto para a DLQ. **Replay** reprocessa (schema corrigido). |

Os contadores (entregues, pendentes, retries, DLQ) e o trace são atualizados ao vivo. O último evento entregue também aparece no cartão do hero.

## Acessibilidade

- Navegação completa por teclado, link "pular para o conteúdo" e foco visível.
- `aria-expanded` nos eventos, `aria-pressed` nos toggles e `role="log"` no trace.
- Contraste AA nos dois temas.
- `prefers-reduced-motion`: sem animações de movimento; a simulação continua funcionando com mudanças de estado instantâneas.
