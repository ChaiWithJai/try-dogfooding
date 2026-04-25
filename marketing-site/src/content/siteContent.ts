import uxCopy from './ux-copy.json'

const brand = uxCopy.brand
const marketing = uxCopy.marketing
const home = marketing.homepage

const iconUrls = {
  doc: 'https://res.cloudinary.com/dmukukwp6/image/upload/doc_2fa451a8e4.png',
  notebook: 'https://res.cloudinary.com/dmukukwp6/image/upload/document_001e7ec29a.png',
  pricing: 'https://res.cloudinary.com/dmukukwp6/image/upload/pricing_04a97aa301.png',
  spreadsheet: 'https://res.cloudinary.com/dmukukwp6/image/upload/spreadsheet_2d556ac08a.png',
  video: 'https://res.cloudinary.com/dmukukwp6/image/upload/video_4159554b6d.png',
  envelope: 'https://res.cloudinary.com/dmukukwp6/image/upload/envelope_modern_f1c74ae9dd.png',
  forums: 'https://res.cloudinary.com/dmukukwp6/image/upload/forums_b1926ec5fa.png',
  compass: 'https://res.cloudinary.com/dmukukwp6/image/upload/tour_2994e40ea9.png',
  switch: 'https://res.cloudinary.com/dmukukwp6/image/upload/switch_modern_5aa70666d1.png',
  posthog: 'https://res.cloudinary.com/dmukukwp6/image/upload/posthog_bdd451f4e8.png',
  invite: 'https://res.cloudinary.com/dmukukwp6/image/upload/invite_8454a37bed.png',
  handbook: 'https://res.cloudinary.com/dmukukwp6/image/upload/handbook_modern_cf862d2ae6.png',
  shoppingBag: 'https://res.cloudinary.com/dmukukwp6/image/upload/Icon_Shopping_Bag_Style_Modern_cd937c7872.png',
  typewriter: 'https://res.cloudinary.com/dmukukwp6/image/upload/typewriter_modern_ac5baf1493.png',
  trash: 'https://res.cloudinary.com/dmukukwp6/image/upload/trash_modern_b4f09eff8f.png',
} as const

export type DesktopIconItem = {
  label: string
  href: string
  icon: string
  external?: boolean
}

export type FeatureTab = {
  id: string
  label: string
  title: string
  bodyLeft: string
  bodyRight: string
  leftLinks: string[]
  rightLinks: string[]
  promptPlaceholder: string
  chips: string[]
}

export type OperatorCard = {
  fileLabel: string
  title: string
  body: string
  note: string
}

const operatorCards: OperatorCard[] = home.personaStrip.personas.map((persona, index) => ({
  fileLabel:
    index === 0
      ? 'gtm.mdx'
      : index === 1
        ? 'cx.mdx'
        : index === 2
          ? 'marketing.mdx'
          : 'back-office.mdx',
  title: persona.label,
  body: persona.description,
  note:
    index === 0
      ? 'Use your own CRM, call notes, and account context.'
      : index === 1
        ? 'Keep the tone, escalation rules, and system boundaries intact.'
        : index === 2
          ? 'Ship variations fast, then score them against past winners.'
          : 'Reconcile the repetitive work without inventing a new SaaS layer.',
}))

export const siteContent = {
  brand: {
    name: brand.name,
    shortName: brand.nameShort,
    tagline: brand.tagline,
    taglineLong: brand.taglineLong,
    philosophy: brand.philosophy,
    shortDescription: marketing.global.shortDescription,
  },
  taskbar: {
    links: [
      { label: 'Product OS', href: '#product-os' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Docs', href: '#reading' },
      { label: 'Meet Jai', href: '#meet-jai' },
      { label: 'Company', href: '#why' },
      { label: 'More', href: '#cta' },
    ],
    ctaLabel: 'Join a live session',
  },
  desktopIcons: {
    switchIcon: iconUrls.switch,
    left: [
      { label: 'home.mdx', href: '#top', icon: iconUrls.doc },
      { label: 'starter-kit.mdx', href: '#product-os', icon: iconUrls.notebook },
      { label: 'pricing.csv', href: '#pricing', icon: iconUrls.pricing },
      { label: 'operators.mdx', href: '#operators', icon: iconUrls.spreadsheet },
      { label: 'demo.mov', href: '#demo', icon: iconUrls.video },
      { label: 'docs/', href: '#reading', icon: iconUrls.notebook },
      { label: 'talk-to-jai.txt', href: 'mailto:hello@trydogfooding.com', icon: iconUrls.envelope, external: true },
      { label: 'ask-a-question.md', href: 'mailto:hello@trydogfooding.com', icon: iconUrls.forums, external: true },
      { label: 'join-live-session.ics', href: '#cta', icon: iconUrls.compass },
    ] satisfies DesktopIconItem[],
    right: [
      { label: 'Why dogfooding?', href: '#why', icon: iconUrls.posthog },
      { label: 'Devlog', href: 'https://github.com/trydogfooding/cli', icon: iconUrls.invite, external: true },
      { label: 'Community handbook', href: '#reading', icon: iconUrls.handbook },
      { label: 'Case studies', href: '#operators', icon: iconUrls.shoppingBag },
      { label: 'Work together', href: 'mailto:hello@trydogfooding.com', icon: iconUrls.typewriter, external: true },
      { label: 'Trash', href: '#footer', icon: iconUrls.trash },
    ] satisfies DesktopIconItem[],
  },
  window: {
    title: 'home.mdx',
    toolbarCta: 'Join live session',
  },
  hero: {
    eyebrow: home.hero.eyebrow,
    headline: home.hero.headline,
    subheadline: home.hero.subheadline,
    body: 'Join a free live session where we set up your coding agent, connect your tools, and bring your idea to life. You\'ll leave with working software on your machine — built by you, in your voice, against your real data.',
    primaryCta: { label: 'Join a free live session', href: '#cta' },
    secondaryCta: { label: 'Install with dogfood', href: '#install' },
    utilityLinks: [
      { label: 'Open source', href: 'https://github.com/trydogfooding/cli', external: true },
      { label: 'Watch the walkthrough', href: '#demo' },
      { label: 'Talk to Jai', href: 'mailto:hello@trydogfooding.com', external: true },
    ],
    trustNote: home.hero.trustNote,
    image: '/images/hero-classroom.webp',
  },
  install: {
    eyebrow: 'Install in one prompt',
    heading: 'Set up the starter kit without turning this into an infra project.',
    body: home.howItWorks.steps[0].description,
    command: 'curl -fsSL get.trydogfooding.com | bash',
    secondaryCommand: 'npm install -g @trydogfooding/cli',
    note: 'Dogfood works entirely locally. All workflows and history remain in your workspace folder.',
  },
  howItWorks: {
    heading: home.howItWorks.heading,
    subhead: home.howItWorks.subhead,
    steps: home.howItWorks.steps,
  },
  manifesto: {
    heading: home.whyDogfoodingBanner.heading.replace('we call it dogfooding', 'operators should build their own software'),
    paragraphs: [
      { heading: 'Who builds software today', body: 'Software today is built by developers, for users. The developer is rarely the person closest to the problem. This gap is why software so often misses — it\'s assembled from assumptions instead of lived experience.' },
      { heading: 'Who should build software', body: 'The best software comes from people who use what they build. This is what "dogfooding" means — if the team doesn\'t use their own product, why should anyone else? Operators have never been able to dogfood their own workflows. They describe, they request, they wait.' },
      { heading: 'What changed', body: 'AI doesn\'t replace developers. It collapses the distance between thinking and making. An operator who knows exactly what their workflow should do can now build software that does it. Not a developer\'s interpretation. The actual thing.' },
      { heading: 'What TryDogfooding is', body: 'A starter kit for operators who want to build their own software. An open-source CLI, templates for the workflows you already do, a four-week cohort, and a community of operators doing the same thing.' },
    ],
    ctaLabel: home.whyDogfoodingBanner.ctaLabel,
    ctaHref: '#why',
  },
  workshop: {
    eyebrow: 'Free live session',
    heading: 'Start with a free 60-minute workshop',
    subhead: 'Live session. You\'ll leave with one working workflow against your real data. Nothing to install beforehand.',
    agenda: [
      { time: '0–10 min', activity: 'What dogfooding means and why operators can build software now' },
      { time: '10–25 min', activity: 'Live install: run the script and connect one tool via MCP' },
      { time: '25–45 min', activity: 'Run `dogfood run cx-triage` against your real data — start to finish, live' },
      { time: '45–60 min', activity: 'Q&A, next steps, and how the cohort works if you want to go deeper' },
    ],
    faq: [
      { q: 'Do I need to know how to code?', a: 'No. If you can follow step-by-step instructions and describe what you want in plain English, you can do this.' },
      { q: 'What does it cost to run workflows after?', a: 'The CLI is free and open source. Claude Code has its own pricing. Most operators spend $10-50/month on API costs.' },
      { q: 'Will this work with my specific tools?', a: 'We support GTM, CX, Marketing, and Back-office stacks. If we don\'t yet, tell us — we add integrations monthly.' },
      { q: 'Is there a recording?', a: 'Yes. Everyone who signs up gets the recording, even if you can\'t attend live.' },
    ],
  },
  featureTabs: [
    {
      id: 'workflows',
      label: 'Run your own workflows',
      title: 'Build the software for the work you already do',
      bodyLeft:
        'Start with one repetitive workflow, keep the language in your own terms, and ship against the stack you already use.',
      bodyRight:
        'Dogfood does not ask you to become a developer. It gives you the minimum scaffolding required to make useful software that you will actually run.',
      leftLinks: ['Triage tickets', 'Draft outreach', 'Review campaign variants', 'Reconcile month-end'],
      rightLinks: ['Customer Experience', 'GTM', 'Marketing', 'Back office'],
      promptPlaceholder: 'What workflow should I automate first?',
      chips: ['Learn', 'Build', 'Ship'],
    },
    {
      id: 'stack',
      label: 'Connect your stack',
      title: 'Bring the tools and data you already trust',
      bodyLeft:
        'The CLI sets up Claude Code, installs the integration layer, and gives each workflow a stable local workspace.',
      bodyRight:
        'You keep the systems you already use. Dogfood is the operator-friendly layer that connects them, not a replacement platform pretending to own your stack.',
      leftLinks: ['HubSpot', 'Zendesk', 'Meta Ads', 'Google Ads'],
      rightLinks: ['Notion', 'Slack', 'NetSuite', 'Ramp'],
      promptPlaceholder: 'Which tools do you use day-to-day?',
      chips: ['Connect', 'Verify', 'Run'],
    },
    {
      id: 'data',
      label: 'Use real data',
      title: 'Run against your actual workflow, not a demo dataset',
      bodyLeft:
        'Operators already know the scenario, edge cases, and tone. The missing part is turning that knowledge into something the machine can run.',
      bodyRight:
        'Dogfood creates a local workspace, keeps workflow history on disk, and gives you a repeatable place to refine prompts, outputs, and guardrails.',
      leftLinks: ['Workspace README', 'CLAUDE.md context', 'Workflow templates', 'Run history'],
      rightLinks: ['Your voice', 'Your rules', 'Your data', 'Your machine'],
      promptPlaceholder: 'Run this against the real account data',
      chips: ['Context', 'Outputs', 'History'],
    },
    {
      id: 'scale',
      label: 'Scale with your team',
      title: 'Start alone, then scale only when the workflow earns it',
      bodyLeft:
        'The free live session gets you to one working workflow. The cohort gets you to three. Membership helps you keep shipping after the first burst of momentum.',
      bodyRight:
        'Scheduling, version control, and team-sharing stay legible because the workspace is plain files in a git repo. The same starter kit supports every stage.',
      leftLinks: ['Free live session', 'The cohort', 'Membership', 'Team deployments'],
      rightLinks: ['Cron', 'GitHub Actions', 'Git', 'Documented SOPs'],
      promptPlaceholder: 'How do we turn this into a team habit?',
      chips: ['Workshops', 'Cohorts', 'Membership'],
    },
  ] satisfies FeatureTab[],
  operators: {
    heading: home.caseStudyTeaser.heading,
    body: home.caseStudyTeaser.subhead,
    placeholder: 'Case studies populate as our first cohort ships. Want to be a case study? Join a live session.',
    cards: operatorCards,
  },
  stack: {
    eyebrow: 'Starter kit',
    heading: 'One starter kit for operators, legible to technical teammates',
    body:
      'Dogfood is an open source CLI that sets up Claude Code, connects your stack, scaffolds a local workspace, and wraps runs with the boring reliability work that people forget to build for themselves.',
    bullets: [
      'A local workspace you own, version, and keep.',
      'Workflow templates shaped around operator roles.',
      'Integrations for GTM, CX, marketing, and back office stacks.',
      'Append-only run history plus docs-first context files.',
      'Opt-in telemetry only. Off by default.',
    ],
    image: '/images/stack-library.webp',
    footnote: 'README: trydogfooding starter kit.md',
  },
  pricing: {
    heading: 'Workshop-first pricing',
    body:
      'The CLI is free forever. Education and community are where we charge. Start with a free live session, then keep going only if the practice fits how you work.',
    rows: [
      {
        index: '1',
        label: 'Free live session',
        freeTier: 'One live 60 minute session',
        pricing: 'Free',
      },
      {
        index: '2',
        label: 'The Dogfooding Cohort',
        freeTier: 'Four weeks, capped size',
        pricing: 'Paid',
      },
      {
        index: '3',
        label: 'Dogfood membership',
        freeTier: 'Community, templates, office hours',
        pricing: 'Paid',
      },
      {
        index: '4',
        label: 'Team deployment',
        freeTier: 'For teams that need rollout help',
        pricing: 'Custom',
      },
    ],
    image: '/images/principal-office.webp',
  },
  builder: {
    heading: 'Claude Code, made usable for operators',
    body: 'TryDogfooding\'s creator shipped backend systems at HashiCorp (including the Nomad UI), taught 300+ students a year at Parsons School of Design, and has spent years teaching operators how to build. TryDogfooding is the tool that came out of that teaching — the thing that actually makes \'build your own software\' real for non-developers.',
    note:
      'TryDogfooding is the layer that turns live session teaching, templates, and operator context into a repeatable build practice.',
    chips: ['Teach the workflow', 'Run it locally', 'Keep shipping'],
    image: '/images/builder-teacher.webp',
    promptPreview: 'What can I automate this week?',
  },
  meetJai: {
    eyebrow: 'The teacher',
    headline: 'Meet Professor Jai',
    purpose: '"I love bringing crazy ideas to life using product engineering."',
    origin: {
      then: {
        label: 'Then',
        body: 'Product engineer and instructional designer at HashiCorp. Shipped the Nomad UI. Taught 300+ students a year at Parsons School of Design. Built curriculum that turned non-technical operators into builders.',
      },
      now: {
        label: 'Now',
        body: 'Less about product engineering, more about agent orchestration. The role shifted because the tools shifted — what used to require a team of engineers now requires one person who understands the workflow and can direct an agent.',
      },
      why: {
        label: 'Why dogfooding',
        body: 'Heavy believer in dogfooding. Building Dogfood using Dogfood. Every feature, every workflow template, every piece of documentation gets tested on real work before it reaches anyone else. The distance between what we teach and what we do is zero.',
      },
    },
    goal: 'Building the software you wished existed (without an engineer).',
    goalNote: 'We market via live events — we set up coding agents and bring ideas to life using our CLI tool plus Claude Code. Then we create UGC case studies from what people build.',
    image: '/images/jai.webp',
    ctaLabel: 'Join a live session with Jai',
    ctaHref: '#cta',
  },
  why: {
    heading: 'Why we call it dogfooding',
    body: home.whyDogfoodingBanner.body,
    points: [
      'The people closest to the work should be able to build for themselves.',
      'The CLI runs on your machine. We do not host your workflows.',
      'Everything we teach gets used on our own flagship product in public.',
      'Support stays specific because it is grounded in real operator scenarios.',
    ],
  },
  reading: {
    heading: 'Bedtime reading',
    body: 'Still here? These are the docs and surfaces that explain what this project is, what it is not, and how the practice works.',
    links: [
      { label: 'Manifesto', href: '#why' },
      { label: 'Starter kit overview', href: '#product-os' },
      { label: 'Workshop-first pricing', href: '#pricing' },
      { label: 'Open source repo', href: 'https://github.com/trydogfooding/cli', external: true },
      { label: 'Contact the builder', href: 'mailto:hello@trydogfooding.com', external: true },
    ],
  },
  emailSignup: {
    heading: 'Get notified about live sessions',
    body: 'We run free 60-minute live events where we set up coding agents and bring ideas to life. Low-volume email, easy unsubscribe.',
    placeholder: 'your@email.com',
    submitLabel: 'Join the list',
    successMessage: 'You\'re on the list. We\'ll email when the next live session is scheduled.',
  },
  cta: {
    heading: 'Start with a free 60-minute live session',
    body: 'Live session. We\'ll set up Claude Code together, connect your tools, and bring one idea to life. You\'ll leave with working software on your machine.',
    image: '/images/cta-graduation.webp',
    options: [
      'Pick your operator track.',
      'Bring one real workflow.',
      'Leave with something running.',
    ],
    priceLabel: 'Starts at:',
    priceValue: 'Free',
    priceDetail: 'Live session first, then cohort and membership when you are ready.',
    primaryCta: { label: 'Join the next live session', href: 'mailto:hello@trydogfooding.com' },
    secondaryCta: { label: 'See the starter kit', href: '#product-os' },
    footnote: '*TryDogfooding runs on your machine. We do not host your workflows.',
  },
  footer: {
    columns: [
      {
        heading: 'Product',
        links: [
          { label: 'Starter kit', href: '#product-os' },
          { label: 'Operators', href: '#operators' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'Reading', href: '#reading' },
        ],
      },
      {
        heading: 'Learn',
        links: [
          { label: 'Why dogfooding', href: '#why' },
          { label: 'Feature walkthrough', href: '#demo' },
          { label: 'Live sessions', href: '#cta' },
          { label: 'GitHub', href: 'https://github.com/trydogfooding/cli', external: true },
        ],
      },
      {
        heading: 'Company',
        links: [
          { label: 'Meet Jai', href: '#meet-jai' },
          { label: 'Contact', href: 'mailto:hello@trydogfooding.com', external: true },
          { label: 'Open source', href: 'https://github.com/trydogfooding/cli', external: true },
        ],
      },
    ],
    legal: ['Privacy', 'Terms', 'Data handling'],
    copyright: marketing.global.footer.copyright,
  },
  art: {
    garden: '/images/garden-campus.webp',
    texture: 'https://res.cloudinary.com/dmukukwp6/image/upload/texture_tan_9608fcca70.png',
  },
} as const
