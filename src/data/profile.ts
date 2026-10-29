/**
 * Fonte única de conteúdo do site.
 * Todo texto visível vem daqui, em PT e EN.
 */

export const LANGS = ['pt', 'en'] as const;
export type Lang = (typeof LANGS)[number];

/** Texto bilíngue. */
export type L = { pt: string; en: string };

export const t = (value: L, lang: Lang): string => value[lang];

/* ---------- tipos ---------- */

export type CareerEventType = 'role.started' | 'contract.started';

export interface CareerEvent {
  id: string;
  type: CareerEventType;
  version: number;
  /** AAAA-MM */
  timestamp: string;
  /** AAAA-MM ou null quando em andamento */
  end?: string | null;
  org: string;
  role: L;
  location: L;
  summary: L;
  /** Payload resumido mostrado como JSON. */
  payload: Record<string, string | number | string[]>;
  /** Métricas de destaque (opcional). */
  metrics?: { value: string; label: L }[];
  details: L[];
}

export interface StackGroup {
  id: string;
  title: L;
  items: string[];
  /** Itens destacados no grupo. */
  highlight?: string[];
}

export interface Certificate {
  issuer: 'Alura' | 'Google' | 'Udemy';
  title: string;
  date: string; // AAAA-MM ou AAAA
  featured: boolean;
}

export interface Education {
  institution: string;
  course: L;
  start: string;
  end: string;
  ongoing?: boolean;
}

/* ---------- identidade ---------- */

export const identity = {
  name: 'Matheus Andrell',
  firstName: 'Matheus',
  lastName: 'Andrell',
  role: { pt: 'Backend Software Engineer', en: 'Backend Software Engineer' } satisfies L,
  headline:
    'Java · Spring Boot · Node.js · TypeScript | AWS · Event-Driven Architecture · Microservices | Applied GenAI (RAG, MCP, Amazon Bedrock)',
  tagline: {
    pt: 'Backends confiáveis para sistemas que escalam.',
    en: 'Reliable backends for systems that scale.',
  } satisfies L,
  /** Palavra da tagline destacada com degradê. */
  taglineAccent: { pt: 'confiáveis', en: 'Reliable' } satisfies L,
  summary: {
    pt: 'Engenheiro de software backend com foco em Java/Spring Boot, arquitetura orientada a eventos, mensageria e AWS, aplicando IA generativa a processos reais de negócio. Desenvolve sistemas backend desde 2023.',
    en: 'Backend software engineer focused on Java/Spring Boot, event-driven architecture, messaging and AWS, applying generative AI to real business processes. Building backend systems since 2023.',
  } satisfies L,
  location: { pt: 'São Paulo, Brasil', en: 'São Paulo, Brazil' } satisfies L,
  workModes: { pt: 'Presencial · híbrido · remoto', en: 'On-site · hybrid · remote' } satisfies L,
  contact: {
    email: 'matheusandrell27@gmail.com',
    linkedin: 'https://linkedin.com/in/matheus-andrell',
    linkedinLabel: '/in/matheus-andrell',
    github: 'https://github.com/MatheusAndrell',
    githubLabel: '/MatheusAndrell',
  },
  /** Currículos em PDF (arquivos em public/cv). */
  resumes: [
    { lang: 'pt', label: 'Português', href: '/cv/matheus-andrell-curriculo-pt.pdf' },
    { lang: 'en', label: 'English', href: '/cv/matheus-andrell-resume-en.pdf' },
  ] satisfies { lang: Lang; label: string; href: string }[],
  languages: [
    { name: { pt: 'Português', en: 'Portuguese' }, level: { pt: 'Nativo', en: 'Native' } },
    { name: { pt: 'Inglês', en: 'English' }, level: { pt: 'Avançado', en: 'Advanced' } },
  ] satisfies { name: L; level: L }[],
};

/* ---------- carreira (event log) — só experiências profissionais, mais recente primeiro.
   Formação fica em `education` e voluntariado em `volunteering` (seção Projetos). ---------- */

export const careerEvents: CareerEvent[] = [
  {
    id: 'vmarket',
    type: 'role.started',
    version: 1,
    timestamp: '2026-03',
    end: null,
    org: 'VMarket Food Solutions',
    role: { pt: 'Engenheiro de Software Pleno', en: 'Software Engineer (Mid-level)' },
    location: { pt: 'São Paulo · híbrido', en: 'São Paulo · hybrid' },
    summary: {
      pt: 'Plataforma B2B de e-commerce e compras para Food Service. Time de 5 devs.',
      en: 'B2B e-commerce and procurement platform for Food Service. Team of 5 developers.',
    },
    payload: {
      stack: ['node', 'typescript', 'nestjs', 'laravel', 'aws'],
      focus: ['mcp', 'rag', 'sqs', 'lambda', 'dynamodb', 'elasticsearch'],
    },
    metrics: [
      { value: '−80%', label: { pt: 'esforço manual em cotações', en: 'manual effort on quotes' } },
      { value: '~6.000', label: { pt: 'NF-e conciliadas por dia', en: 'invoices reconciled per day' } },
      { value: '~60.000', label: { pt: 'mensagens por dia', en: 'messages per day' } },
    ],
    details: [
      {
        pt: 'Desenvolveu, em dupla, a camada MCP de uma automação de cotações com RAG sobre Amazon Bedrock. O esforço manual caiu mais de 80% (comparação mês a mês, antes e depois).',
        en: 'Co-built the MCP layer of a quote automation using RAG on Amazon Bedrock. Manual effort dropped by more than 80% (month-over-month, before vs. after).',
      },
      {
        pt: 'Conciliação automática de NF-e com pedidos de compra usando Elasticsearch (~6.000 notas/dia).',
        en: 'Automatic reconciliation of invoices (NF-e) against purchase orders with Elasticsearch (~6,000 invoices/day).',
      },
      {
        pt: 'Pipeline assíncrono com SQS, Lambda e DynamoDB (~60.000 mensagens/dia), com idempotência, DLQ e tratamento de picos.',
        en: 'Asynchronous pipeline with SQS, Lambda and DynamoDB (~60,000 messages/day) with idempotency, DLQ and spike handling.',
      },
      {
        pt: 'Envio de e-mails assíncrono (SQS, Lambda, Serverless Framework).',
        en: 'Asynchronous email delivery (SQS, Lambda, Serverless Framework).',
      },
      {
        pt: 'Cache Redis com invalidação orientada a eventos, para reduzir chamadas aos serviços de IA.',
        en: 'Redis cache with event-driven invalidation to cut calls to AI services.',
      },
      {
        pt: 'APIs REST e microsserviços, code reviews, discussões de arquitetura e investigação de incidentes com Grafana e logs estruturados (Pino, Monolog).',
        en: 'REST APIs and microservices, code reviews, architecture discussions and incident investigation with Grafana and structured logs (Pino, Monolog).',
      },
    ],
  },
  {
    id: 'evence',
    type: 'role.started',
    version: 1,
    timestamp: '2024-10',
    end: '2026-02',
    org: 'Evence Telecom',
    role: { pt: 'Engenheiro de Software Júnior', en: 'Junior Software Engineer' },
    location: { pt: 'São Paulo · híbrido', en: 'São Paulo · hybrid' },
    summary: {
      pt: 'Microsserviços orientados a eventos para telecom e gestão de clientes.',
      en: 'Event-driven microservices for telecom and customer management.',
    },
    payload: { messaging: 'rabbitmq', infra: ['k8s', 'lambda', 'sqs'], obs: ['grafana', 'loki', 'zabbix'] },
    details: [
      { pt: 'APIs com Java, Spring Boot e Node.js; RabbitMQ.', en: 'APIs with Java, Spring Boot and Node.js; RabbitMQ.' },
      { pt: 'Integração da Evolution API (WhatsApp) à mensageria.', en: 'Integrated the Evolution API (WhatsApp) into the messaging layer.' },
      { pt: 'AWS (EC2, S3, Lambda, SQS), Docker e Kubernetes; observabilidade com Grafana, Loki e Zabbix.', en: 'AWS (EC2, S3, Lambda, SQS), Docker and Kubernetes; observability with Grafana, Loki and Zabbix.' },
      { pt: 'Refatoração do Vue.js com Atomic Design (~70% menos complexidade de manutenção).', en: 'Vue.js refactor with Atomic Design (~70% less maintenance complexity).' },
    ],
  },
  {
    id: 'dinamk',
    type: 'role.started',
    version: 1,
    timestamp: '2024-01',
    end: '2024-10',
    org: 'Dinamk Tech',
    role: { pt: 'Estagiário → Engenheiro de Software Júnior', en: 'Intern → Junior Software Engineer' },
    location: { pt: 'São Paulo · presencial', en: 'São Paulo · on-site' },
    summary: {
      pt: 'Plataforma de pesquisa acadêmica com Java e Spring Boot. Promovido a júnior após 3 meses.',
      en: 'Academic research platform with Java and Spring Boot. Promoted to junior after 3 months.',
    },
    payload: { stack: ['java', 'spring', 'jpa/hibernate'], promoted: 'intern -> junior', after_months: 3 },
    metrics: [
      { value: '+40%', label: { pt: 'pagamentos concluídos', en: 'completed payments' } },
      { value: '90%', label: { pt: 'deploy mais eficiente', en: 'more efficient deploys' } },
    ],
    details: [
      { pt: 'Júnior (mar – out/2024): APIs e microsserviços com Java e Spring Boot.', en: 'Junior (Mar – Oct 2024): APIs and microservices with Java and Spring Boot.' },
      { pt: 'Integração com o gateway Iugu (+40% de pagamentos concluídos) e com o ERP TOTVS.', en: 'Integrations with the Iugu gateway (+40% completed payments) and the TOTVS ERP.' },
      { pt: 'CI/CD com GitHub Actions para AWS, no lugar do deploy manual por FTP (90% mais eficiente).', en: 'CI/CD with GitHub Actions to AWS, replacing manual FTP deploys (90% more efficient).' },
      { pt: 'Participou de decisões de arquitetura e code reviews; usou inglês com usuários estrangeiros e em eventos.', en: 'Took part in architecture decisions and code reviews; used English with international users and at events.' },
      { pt: 'Estágio (jan – mar/2024): migração do Java 8 para o Java 17; APIs REST com Spring Boot, JPA e Hibernate.', en: 'Internship (Jan – Mar 2024): Java 8 to Java 17 migration; REST APIs with Spring Boot, JPA and Hibernate.' },
      { pt: 'Otimização de SQL; testes com JUnit e Mockito.', en: 'SQL optimization; tests with JUnit and Mockito.' },
    ],
  },
  {
    id: 'mentat',
    type: 'contract.started',
    version: 1,
    timestamp: '2024-01',
    end: '2024-07',
    org: 'Mentat Solutions',
    role: { pt: 'Engenheiro de Software Freelancer', en: 'Freelance Software Engineer' },
    location: { pt: 'Remoto · paralelo, ~4h/dia', en: 'Remote · part-time, ~4h/day' },
    summary: {
      pt: 'Solução com IA que consolida múltiplos documentos.',
      en: 'AI solution that consolidates multiple documents.',
    },
    payload: { docs_process: '-60% time', stack: ['spring', 'postgres', 'python', 'react'] },
    details: [
      { pt: 'Solução com IA que consolida múltiplos documentos (processo de documentação 60% mais eficiente).', en: 'AI solution consolidating multiple documents (documentation process 60% more efficient).' },
      { pt: 'APIs com Java, Spring Boot e PostgreSQL; serviços em Python; React; Docker e CI/CD.', en: 'APIs with Java, Spring Boot and PostgreSQL; Python services; React; Docker and CI/CD.' },
    ],
  },
  {
    id: 'unis',
    type: 'role.started',
    version: 1,
    timestamp: '2023-02',
    end: '2024-01',
    org: 'Grupo Educacional UNIS',
    role: { pt: 'Estagiário de TI (Desenvolvimento e Suporte)', en: 'IT Intern (Development and Support)' },
    location: { pt: 'Varginha-MG · meio período', en: 'Varginha, Brazil · part-time' },
    summary: {
      pt: 'Primeiro evento do log: APIs Java/Spring, PostgreSQL e suporte N1.',
      en: 'First event in the log: Java/Spring APIs, PostgreSQL and L1 support.',
    },
    payload: { tickets: '-70%', stack: ['java', 'spring', 'postgres'] },
    details: [
      { pt: 'APIs com Java e Spring Boot; otimização de PostgreSQL; testes com JUnit e Mockito.', en: 'APIs with Java and Spring Boot; PostgreSQL tuning; tests with JUnit and Mockito.' },
      { pt: 'Suporte N1; as correções de falhas recorrentes reduziram os chamados em ~70%.', en: 'L1 support; fixing recurring failures cut tickets by ~70%.' },
      { pt: 'Integração de IA generativa para produção de conteúdo.', en: 'Generative AI integration for content production.' },
    ],
  },
];

/* ---------- projetos ---------- */

export const eventCore = {
  name: 'EventCore',
  repo: 'https://github.com/MatheusAndrell/eventcore',
  tags: ['Java 25', 'Spring Boot', 'PostgreSQL', 'RabbitMQ'],
  description: {
    pt: 'Plataforma open source de ingestão de eventos e entrega por webhooks assinados. Monólito modular com três papéis (api, relay e worker) e fronteiras entre módulos validadas com ArchUnit.',
    en: 'Open-source platform for event ingestion and signed webhook delivery. A modular monolith with three roles (api, relay and worker) and module boundaries enforced with ArchUnit.',
  } satisfies L,
  architecture: [
    { name: 'api', note: { pt: 'valida · grava evento + outbox', en: 'validates · writes event + outbox' } },
    { name: 'postgres', note: { pt: 'events · outbox', en: 'events · outbox' }, store: true },
    { name: 'relay', note: { pt: 'lease · publish · confirm', en: 'lease · publish · confirm' } },
    { name: 'rabbitmq', note: { pt: 'delivery · retry · dlq', en: 'delivery · retry · dlq' }, store: true },
    { name: 'worker', note: { pt: 'assina HMAC · entrega', en: 'signs HMAC · delivers' }, accent: true },
  ] as { name: string; note: L; store?: boolean; accent?: boolean }[],
  guarantees: [
    {
      kicker: { pt: 'Entrega', en: 'Delivery' },
      title: { pt: 'Transactional outbox', en: 'Transactional outbox' },
      body: {
        pt: 'Publisher confirms e leases. At-least-once com retry, backoff e jitter, DLQ e replay.',
        en: 'Publisher confirms and leases. At-least-once with retry, backoff and jitter, DLQ and replay.',
      },
    },
    {
      kicker: { pt: 'Idempotência', en: 'Idempotency' },
      title: { pt: 'Idempotency-Key + RFC 8785', en: 'Idempotency-Key + RFC 8785' },
      body: {
        pt: 'Chave vinculada ao corpo canônico. Mesmo request, mesmo resultado.',
        en: 'Key bound to the canonical body. Same request, same result.',
      },
    },
    {
      kicker: { pt: 'Segurança', en: 'Security' },
      title: { pt: 'Standard Webhooks', en: 'Standard Webhooks' },
      body: {
        pt: 'Assinatura HMAC-SHA256, segredos em AES-256-GCM, proteção contra SSRF e DNS rebinding.',
        en: 'HMAC-SHA256 signatures, AES-256-GCM encrypted secrets, SSRF and DNS rebinding protection.',
      },
    },
    {
      kicker: { pt: 'Falhas', en: 'Failure testing' },
      title: { pt: 'Testcontainers + Toxiproxy', en: 'Testcontainers + Toxiproxy' },
      body: {
        pt: 'Quedas de banco e de broker, crashes e corridas de idempotência. Métricas no Prometheus, tracing com OpenTelemetry e logs JSON.',
        en: 'Database and broker outages, crashes and idempotency races. Prometheus metrics, OpenTelemetry tracing and JSON logs.',
      },
    },
  ] satisfies { kicker: L; title: L; body: L }[],
};

export const volunteering = {
  org: 'Associação Chico Mendes',
  since: { pt: 'Voluntariado · desde out/2026', en: 'Volunteering · since Oct 2026' } satisfies L,
  role: { pt: 'Desenvolvedor Front-end', en: 'Front-end Developer' } satisfies L,
  description: {
    pt: 'Novo site para a ONG (antes em Wix), em React, Vite e Three.js, organizado em Clean Architecture e Atomic Design.',
    en: 'New website for the NGO (previously on Wix), built with React, Vite and Three.js, organized with Clean Architecture and Atomic Design.',
  } satisfies L,
  highlights: [
    { value: '63', label: { pt: 'documentos no Portal da Transparência', en: 'documents in the transparency portal' } },
    { value: '3D', label: { pt: 'experiência “Floresta Viva”', en: '“Floresta Viva” experience' } },
    { value: 'PIX', label: { pt: 'doações com QR Code', en: 'donations via QR code' } },
    { value: 'a11y', label: { pt: 'pronto para leitores de tela', en: 'screen-reader ready' } },
  ] satisfies { value: string; label: L }[],
};

/* ---------- stack ---------- */

export const stack: StackGroup[] = [
  {
    id: 'backend',
    title: { pt: 'Backend', en: 'Backend' },
    items: ['Java', 'Spring Boot', 'Spring Data', 'Spring Security', 'JPA/Hibernate', 'Node.js', 'TypeScript', 'NestJS', 'Express', 'PHP/Laravel', 'Python'],
    highlight: ['Java', 'Spring Boot', 'Node.js', 'TypeScript'],
  },
  {
    id: 'cloud',
    title: { pt: 'Cloud / AWS', en: 'Cloud / AWS' },
    items: ['Lambda', 'SQS', 'SNS', 'DynamoDB', 'EC2', 'S3', 'CloudWatch', 'Serverless Framework', 'Docker', 'Kubernetes'],
    highlight: ['Lambda', 'SQS', 'DynamoDB'],
  },
  {
    id: 'messaging',
    title: { pt: 'Mensageria e arquitetura', en: 'Messaging & architecture' },
    items: ['RabbitMQ', 'Event-Driven Architecture', 'Microservices', 'Transactional Outbox', 'Clean Architecture', 'DDD', 'SOLID'],
    highlight: ['RabbitMQ', 'Event-Driven Architecture', 'Transactional Outbox'],
  },
  {
    id: 'data',
    title: { pt: 'Dados', en: 'Data' },
    items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch'],
    highlight: ['PostgreSQL', 'Redis'],
  },
  {
    id: 'ai',
    title: { pt: 'IA', en: 'AI' },
    items: ['RAG', 'MCP', 'Amazon Bedrock', 'LLMs'],
    highlight: ['RAG', 'MCP', 'Amazon Bedrock'],
  },
  {
    id: 'obs',
    title: { pt: 'Observabilidade, CI/CD e testes', en: 'Observability, CI/CD & testing' },
    items: ['Grafana', 'Loki', 'Zabbix', 'Prometheus', 'OpenTelemetry', 'GitHub Actions', 'JUnit', 'Mockito', 'Testcontainers'],
    highlight: ['OpenTelemetry', 'Testcontainers'],
  },
];

/* ---------- formação ---------- */

export const education: Education[] = [
  {
    institution: 'FIAP',
    course: { pt: 'Pós-graduação Lato Sensu em Software Architecture', en: 'Postgraduate degree in Software Architecture' },
    start: '2026-08',
    end: '2027-06',
    ongoing: true,
  },
  {
    institution: 'Centro Universitário Eniac',
    course: { pt: 'Tecnólogo em Análise e Desenvolvimento de Sistemas', en: 'Associate degree in Systems Analysis and Development' },
    start: '2022-08',
    end: '2025-01',
  },
];

export const certificates: Certificate[] = [
  { issuer: 'Alura', title: 'Microsserviços na prática: implementando com Java e Spring', date: '2024-07', featured: true },
  { issuer: 'Alura', title: 'Microsserviços na prática: mensageria com RabbitMQ', date: '2025-01', featured: true },
  { issuer: 'Alura', title: 'Microsserviços na prática: IaC com CDK e deploy na AWS', date: '2025-02', featured: true },
  { issuer: 'Alura', title: 'Arquitetura Java: crie uma infraestrutura escalável', date: '2025-04', featured: true },
  { issuer: 'Alura', title: 'Arquitetura Java: descomplicando a Clean Architecture', date: '2024-08', featured: true },
  { issuer: 'Alura', title: 'Observabilidade na AWS: utilizando o CloudWatch', date: '2025-02', featured: true },
  { issuer: 'Alura', title: 'GPT e Java: desenvolva um Chatbot com IA', date: '2025-04', featured: true },
  { issuer: 'Google', title: 'Manage Kubernetes in Google Cloud Skill Badge', date: '2024-11', featured: true },
  { issuer: 'Google', title: 'Managing Cloud Infrastructure with Terraform', date: '2025-03', featured: true },
  { issuer: 'Udemy', title: 'Fundamentals of Backend Engineering', date: '2024-09', featured: true },
  { issuer: 'Alura', title: 'Fundamentos da Arquitetura de Software Moderna', date: '2025-02', featured: false },
  { issuer: 'Alura', title: 'Microsserviços: explorando os conceitos', date: '2025-01', featured: false },
  { issuer: 'Alura', title: 'Cloud: realize o deploy de aplicações na AWS', date: '2025-03', featured: false },
  { issuer: 'Alura', title: 'Cloud: usando recursos de armazenamento na AWS', date: '2025-03', featured: false },
  { issuer: 'Alura', title: 'AWS: entendendo e controlando os custos dos serviços', date: '2025-03', featured: false },
  { issuer: 'Alura', title: 'Java JRE e JDK: compile e execute o seu programa', date: '2025-04', featured: false },
  { issuer: 'Alura', title: 'Java: consumindo API, gravando arquivos e lidando com erros', date: '2024-12', featured: false },
  { issuer: 'Alura', title: 'Java: trabalhando com lambdas, streams e Spring Framework', date: '2024-12', featured: false },
  { issuer: 'Alura', title: 'Java Polimorfismo: entenda herança e interfaces', date: '2024-08', featured: false },
  { issuer: 'Alura', title: 'Java: aplicando a Orientação a Objetos', date: '2024-07', featured: false },
  { issuer: 'Alura', title: 'Node.js: criando uma API REST com Express e MongoDB', date: '2024-08', featured: false },
  { issuer: 'Google', title: 'AI Infrastructure: Cloud GPUs', date: '2025-02', featured: false },
  { issuer: 'Google', title: 'Google Cloud Fundamentals: Core Infrastructure', date: '2024-11', featured: false },
  { issuer: 'Udemy', title: 'Fundamentals of Network Engineering', date: '2024-09', featured: false },
  { issuer: 'Udemy', title: 'SOLID Principles: Introducing Software Architecture & Design', date: '2025-01', featured: false },
  { issuer: 'Udemy', title: 'Node.js do Zero a Maestria com diversos Projetos', date: '2024-10', featured: false },
  { issuer: 'Udemy', title: 'Desenvolvimento Web Avançado com PHP, Laravel e Vue.JS', date: '2025-01', featured: false },
  { issuer: 'Udemy', title: 'Git: Básico ao Avançado', date: '2024', featured: false },
];

/* ---------- textos de interface ---------- */

export const ui = {
  meta: {
    title: {
      pt: 'Matheus Andrell — Backend Software Engineer',
      en: 'Matheus Andrell — Backend Software Engineer',
    },
    description: {
      pt: 'Engenheiro de software backend em São Paulo: Java, Spring Boot, Node.js, AWS, arquitetura orientada a eventos e IA generativa aplicada.',
      en: 'Backend software engineer in São Paulo: Java, Spring Boot, Node.js, AWS, event-driven architecture and applied generative AI.',
    },
  },
  skip: { pt: 'Pular para o conteúdo', en: 'Skip to content' },
  nav: {
    pipeline: { pt: 'Pipeline', en: 'Pipeline' },
    career: { pt: 'Carreira', en: 'Career' },
    projects: { pt: 'Projetos', en: 'Projects' },
    stack: { pt: 'Stack', en: 'Stack' },
    education: { pt: 'Formação', en: 'Education' },
    contact: { pt: 'Fale comigo', en: 'Get in touch' },
    menu: { pt: 'Menu', en: 'Menu' },
    sections: { pt: 'Seções', en: 'Sections' },
  },
  theme: {
    toDark: { pt: 'Mudar para tema escuro', en: 'Switch to dark theme' },
    toLight: { pt: 'Mudar para tema claro', en: 'Switch to light theme' },
  },
  lang: {
    label: { pt: 'Idioma', en: 'Language' },
  },
  hero: {
    cta: { pt: 'Disparar um evento', en: 'Fire an event' },
    resume: { pt: 'Currículo (PDF)', en: 'Resume (PDF)' },
  },
  pipeline: {
    kicker: { pt: '01 · O que eu construo', en: '01 · What I build' },
    title: { pt: 'Um evento, do request ao webhook.', en: 'One event, from request to webhook.' },
    lead: {
      pt: 'Emita eventos, derrube o broker, deixe o receiver lento ou mande uma mensagem inválida. As garantias continuam valendo.',
      en: 'Emit events, take the broker down, slow the receiver or send an invalid message. The guarantees still hold.',
    },
    emit: { pt: 'Emitir evento', en: 'Emit event' },
    brokerDown: { pt: 'Derrubar broker', en: 'Take broker down' },
    brokerUp: { pt: 'Restaurar broker', en: 'Restore broker' },
    slow: { pt: 'Receiver lento', en: 'Slow receiver' },
    invalid: { pt: 'Mensagem inválida', en: 'Invalid message' },
    replay: { pt: 'Replay', en: 'Replay' },
    reset: { pt: 'Zerar', en: 'Reset' },
    delivered: { pt: 'Entregues', en: 'Delivered' },
    pending: { pt: 'Pendentes', en: 'Pending' },
    retries: { pt: 'Retries', en: 'Retries' },
    dlq: { pt: 'DLQ', en: 'DLQ' },
    online: { pt: 'online', en: 'online' },
    offline: { pt: 'offline', en: 'offline' },
    idle: { pt: 'ocioso', en: 'idle' },
    waiting: { pt: 'aguardando', en: 'waiting' },
    queued: { pt: 'na fila', en: 'queued' },
    traceEmpty: { pt: 'Nenhum evento ainda. Clique em “Emitir evento”.', en: 'No events yet. Click “Emit event”.' },
    note: {
      pt: 'Simulação local em TypeScript. Nenhuma mensagem sai do navegador.',
      en: 'Local TypeScript simulation. No message leaves your browser.',
    },
    log: {
      accepted: { pt: 'gravado no outbox (tx commit)', en: 'written to outbox (tx commit)' },
      published: { pt: 'publicado no broker · confirm', en: 'published to broker · confirm' },
      held: { pt: 'broker fora · mantido no outbox', en: 'broker down · held in outbox' },
      delivered: { pt: 'entregue · 200 OK', en: 'delivered · 200 OK' },
      timeout: { pt: 'timeout · retry em', en: 'timeout · retry in' },
      dlq: { pt: 'schema inválido · enviado à DLQ', en: 'invalid schema · sent to DLQ' },
      exhausted: { pt: 'tentativas esgotadas · DLQ', en: 'attempts exhausted · DLQ' },
      replay: { pt: 'replay da DLQ · reprocessando', en: 'DLQ replay · reprocessing' },
      brokerDown: { pt: 'broker caiu · relay pausado', en: 'broker down · relay paused' },
      brokerUp: { pt: 'broker voltou · drenando outbox', en: 'broker back · draining outbox' },
    },
  },
  career: {
    kicker: { pt: '02 · Event log da carreira', en: '02 · Career event log' },
    title: { pt: 'Cada etapa, um evento.', en: 'Every step, an event.' },
    lead: {
      pt: 'Um stream append-only: tipo versionado, timestamp e payload. Abra um evento para ver os detalhes.',
      en: 'An append-only stream: versioned type, timestamp and payload. Open an event to see the details.',
    },
    replay: { pt: 'Replay da carreira', en: 'Replay career' },
    replaying: { pt: 'Reproduzindo', en: 'Replaying' },
    open: { pt: 'Ver detalhes', en: 'Show details' },
    close: { pt: 'Ocultar detalhes', en: 'Hide details' },
    now: { pt: 'agora', en: 'now' },
  },
  projects: {
    kicker: { pt: '03 · Projetos', en: '03 · Projects' },
    title: { pt: 'Entrega de webhooks que não perde evento.', en: 'Webhook delivery that never drops an event.' },
    github: { pt: 'Ver no GitHub', en: 'View on GitHub' },
    architecture: { pt: 'Arquitetura', en: 'Architecture' },
    client: { pt: 'cliente', en: 'client' },
    endpoint: { pt: 'endpoint do cliente', en: 'client endpoint' },
    monolith: { pt: 'monólito modular · ArchUnit', en: 'modular monolith · ArchUnit' },
  },
  stack: {
    kicker: { pt: '04 · Stack', en: '04 · Stack' },
    title: { pt: 'Ferramentas por domínio.', en: 'Tools by domain.' },
  },
  education: {
    kicker: { pt: '05 · Formação', en: '05 · Education' },
    title: { pt: 'Formação, certificações e idiomas.', en: 'Education, certifications and languages.' },
    ongoing: { pt: 'Em curso', en: 'In progress' },
    certs: { pt: 'Certificações', en: 'Certifications' },
    featuredOf: { pt: 'em destaque de', en: 'featured of' },
    showAll: { pt: 'Ver todas', en: 'Show all' },
    languages: { pt: 'Idiomas', en: 'Languages' },
  },
  contact: {
    kicker: { pt: '06 · Contato', en: '06 · Contact' },
    title: { pt: 'Vamos construir algo que aguenta o pico.', en: "Let's build something that holds up at peak." },
    lead: {
      pt: 'Aberto a oportunidades presenciais, híbridas ou remotas.',
      en: 'Open to on-site, hybrid or remote opportunities.',
    },
    email: { pt: 'E-mail', en: 'Email' },
    copy: { pt: 'Copiar e-mail', en: 'Copy email' },
    copied: { pt: 'E-mail copiado', en: 'Email copied' },
    resume: { pt: 'Currículo', en: 'Resume' },
    resumeHint: { pt: 'PDF · 2 páginas', en: 'PDF · 2 pages' },
    download: { pt: 'Baixar currículo em', en: 'Download resume in' },
  },
  footer: {
    built: { pt: 'Feito com Astro, TypeScript e CSS.', en: 'Built with Astro, TypeScript and CSS.' },
  },
} as const;
