/**
 * Content model for the portfolio — the single source of truth for every
 * repeated list. Text is byte-faithful to the original design export.
 */

/* ---------- Hero: blueprint annotations (drawn into the revealed sheet) ----
   The scan reveals the SAME hero as a schematic, so the tech content reads
   as callouts pinned to the portrait — not a separate panel. (ax, ay) is the
   attach point in fractions of the portrait cut-out box; (dx, dy) offsets the
   label from that point in px (the compositor clamps labels into the hero
   and draws the leader line + target ring). */
export interface HeroAnnotation {
  ax: number
  ay: number
  dx: number
  dy: number
  label: string
  sub?: string
}

/* Anchors are fractions of the WAIST-UP cut-out box (512×758): head ≈ 0.05,
   shoulders ≈ 0.36, chest ≈ 0.5, forearms ≈ 0.62–0.66, pocket/hands ≈ 0.84.
   Keep the deepest ay ≤ 0.84 — the shell scan's cut sweeps to 0.95·h and the
   contour lift can delay an anchor by up to HINT_WRAP px. */
export const HERO_ANNOTATIONS: HeroAnnotation[] = [
  { ax: 0.5, ay: 0.05, dx: -236, dy: -34, label: 'ai · voice agents', sub: 'vapi · telephony' },
  { ax: 0.82, ay: 0.4, dx: 88, dy: -22, label: 'full-stack', sub: 'react · next.js · node' },
  { ax: 0.2, ay: 0.36, dx: -228, dy: -14, label: 'frontend', sub: 'react · next.js · js' },
  { ax: 0.24, ay: 0.66, dx: -272, dy: 14, label: 'automation', sub: 'n8n · make · zapier · ghl' },
  { ax: 0.8, ay: 0.62, dx: 92, dy: 24, label: 'backend', sub: 'node.js · github' },
  { ax: 0.55, ay: 0.84, dx: 128, dy: 34, label: 'data · scraping', sub: 'puppeteer pipelines' },
]

/* ---------- About: stats ---------- */
export interface Stat {
  value: string
  label: string
}

export const STATS: Stat[] = [
  { value: '3+', label: 'Years building' },
  { value: '12+', label: 'Projects shipped' },
  { value: 'Full', label: 'Stack range' },
  { value: 'AI', label: '+ Automation' },
]

/* ---------- Stack: 4 columns of chips ---------- */
export interface Chip {
  label: string
  slug?: string // simpleicons slug
  letter?: string // fallback letter chip (Make.com, Vapi)
}

export interface StackColumn {
  title: string
  chips: Chip[]
  note?: string // dashed note card at the end of a column
}

export const STACK_COLUMNS: StackColumn[] = [
  {
    title: 'Frontend',
    chips: [
      { label: 'React.js', slug: 'react' },
      { label: 'Next.js', slug: 'nextdotjs' },
      { label: 'JavaScript', slug: 'javascript' },
      { label: 'Bootstrap', slug: 'bootstrap' },
    ],
  },
  {
    title: 'Backend',
    chips: [
      { label: 'Node.js', slug: 'nodedotjs' },
      { label: 'GitHub', slug: 'github' },
    ],
  },
  {
    title: 'Automation & AI',
    chips: [
      { label: 'n8n', slug: 'n8n' },
      { label: 'Make.com', letter: 'M' },
      { label: 'Zapier', slug: 'zapier' },
      { label: 'Vapi', letter: 'V' },
      { label: 'GoHighLevel', letter: 'G' },
    ],
  },
  {
    title: 'Data & Tooling',
    chips: [{ label: 'Puppeteer', slug: 'puppeteer' }],
    note: 'Web scraping, monitoring & data pipelines at scale.',
  },
]

/* ---------- Work: case files ----------
   Each case gets a bespoke media stage in src/components/Work/ (video
   showcase, dual-video toggle, self-drawing wireframe, terminal stream);
   this is the shared copy that surrounds those stages. */
export interface WorkCase {
  num: string
  slug: string
  title: string
  tagline: string // serif italic line under the title
  desc: string
  feats: string[] // three proof points, mono-ticked
  tags: string[]
  href?: string
}

export const WORK_CASES: WorkCase[] = [
  {
    num: '01',
    slug: 'subdesk',
    title: 'Subdesk',
    tagline: 'Every client. One desk. Everything, handled.',
    desc: 'A command center for agencies running dozens of clients on GoHighLevel: the whole roster in one pane of glass, with an AI copilot that briefs every morning, drafts the work, and never acts without sign-off.',
    feats: [
      'Human-in-the-loop copilot: briefs, drafts, approval queue',
      'Crash-safe visual automation engine (Flows)',
      'White-label theming over the entire GHL interface',
    ],
    tags: ['SaaS', 'AI Copilot', 'React', 'Node', 'Supabase'],
    href: 'https://subdesk.cc/',
  },
  {
    num: '02',
    slug: 'callyniq',
    title: 'Callyniq',
    tagline: 'The receptionist that never sleeps.',
    desc: 'An AI receptionist that answers every call, qualifies leads in real time and books customers straight into the calendar, live in five minutes, around the clock.',
    feats: [
      'Natural voice conversations on Vapi + telephony',
      'Live lead qualification and routing',
      'Bookings land directly on the calendar',
    ],
    tags: ['AI Voice', 'Vapi', 'Telephony'],
    href: 'https://callyniq.onrender.com/',
  },
  {
    num: '03',
    slug: 'codeswave',
    title: 'CodesWave',
    tagline: 'Clean systems for real-world teams.',
    desc: 'Software agency site: clean, reliable systems that help real-world teams move faster with fewer mistakes.',
    feats: [
      'Production sites and dashboards, end to end',
      'Design systems that survive real content',
      'Shipped fast, maintained calmly',
    ],
    tags: ['Agency', 'Web'],
    href: 'https://www.codeswave.com/',
  },
  {
    num: '04',
    slug: 'puppeteer',
    title: 'Puppeteer Scrapers',
    tagline: 'Data at industrial scale.',
    desc: 'A suite of large-scale Puppeteer scrapers powering data extraction, monitoring and automation pipelines: resilient, scheduled, observable.',
    feats: [
      'Rotating fleets that survive layout drift',
      'Monitoring + retries, pipelines that self-heal',
      'Clean CSV/DB delivery on schedule',
    ],
    tags: ['Automation', 'Data', 'Puppeteer'],
  },
]

/* ---------- Ops: automation jobs ----------
   Each job gets a bespoke animated stage in src/components/Ops/ (scan pass,
   scrape demo video, sync diagram, extension choreography); this is the
   shared caption copy under those stages. */
export interface OpsJob {
  num: string
  slug: string
  kind: 'Scrape' | 'Integration' | 'Extension'
  title: string
  desc: string
  tags: string[]
}

export const OPS: OpsJob[] = [
  {
    num: '01',
    slug: 'fmls',
    kind: 'Scrape',
    title: 'FMLS listing scraper',
    desc: "Georgia's MLS portal, scraped on schedule: listings, prices and status changes lifted into a clean feed the moment they publish.",
    tags: ['Puppeteer', 'MLS data', 'Scheduled runs'],
  },
  {
    num: '02',
    slug: 'seniorlife',
    kind: 'Scrape',
    title: 'SeniorLife portal scraper',
    desc: 'Signs into an insurance agent portal, walks every policy record and exports the book to clean CSV: shown here running against seeded demo data.',
    tags: ['Puppeteer', 'Auth flows', 'CSV export'],
  },
  {
    num: '03',
    slug: 'mindbody-ghl',
    kind: 'Integration',
    title: 'Mindbody → GoHighLevel sync',
    desc: 'Bookings, clients and classes flow from Mindbody into GoHighLevel on a schedule: no exports, no copy-paste, no missed records.',
    tags: ['REST APIs', 'Webhooks', 'Field mapping'],
  },
  {
    num: '04',
    slug: 'fb-ghl-extension',
    kind: 'Extension',
    title: 'Group approvals → CRM, one click',
    desc: "A Chrome extension that adds a Send to GHL button beside Approve on Facebook Group member requests, capturing each member's answers into the CRM at the moment of approval.",
    tags: ['Chrome extension', 'DOM injection', 'GHL API'],
  },
  {
    num: '05',
    slug: 'tilda-n8n-ghl',
    kind: 'Integration',
    title: 'Tilda forms → GHL, routed in n8n',
    desc: 'One webhook, eight source forms. n8n works out which form the lead came from, a switch fans out per source, code shapes each payload and HTTP posts it to GoHighLevel, where a second switch files the lead into the right pipeline.',
    tags: ['n8n', 'Tilda webhooks', 'GHL pipelines'],
  },
  {
    num: '06',
    slug: 'arive-ghl-intake',
    kind: 'Integration',
    title: 'ARIVE loans → GHL, deduped on arrival',
    desc: 'A new loan in ARIVE fires a Zap: an AI step squares up the payload and a webhook hands it to GoHighLevel, where the workflow looks the contact up before it creates one. New leads get GPT-mapped fields, existing ones get matched, and every opportunity lands tagged with its lead source: ten branches, zero duplicates.',
    tags: ['Zapier + AI', 'Contact dedupe', 'Source attribution'],
  },
  {
    num: '07',
    slug: 'arive-stage-sync',
    kind: 'Integration',
    title: 'Loan stages, mirrored into the CRM',
    desc: 'The LOS owns the truth about where a loan stands. Every ARIVE status change rides a Zap through eight path filters into the matching GoHighLevel workflow: seven per-stage nurtures that re-enroll the contact the moment the loan moves, so the pipeline never drifts from the source.',
    tags: ['Zapier paths', 'Stage routing', 'GHL workflows'],
  },
]

/* ---------- Pipeline: the GHL × Make.com × ServiceTitan flagship ----------
   One client system traced end to end. Stage imagery lives in
   public/work/make-ghl/web/ (client identifiers blurred / Make title bars
   cropped at derivation time; originals in repo-root work-src/make-ghl). */
export interface PipeStage {
  num: string
  t: string // trace-clock chip, e.g. 't+0.4s'
  title: string
  desc: string
  img: string
  ratio: string // css aspect-ratio of the derivative
  frameLabel: string
  alt: string
}

export const PIPELINE_STAGES: PipeStage[] = [
  {
    num: '01',
    t: 't+0s',
    title: 'Branching intake',
    desc: 'Eight-step funnels qualify every lead before a human sees it: install or service, AC or furnace, estimate or not. Each path feeds its own automation.',
    img: '/work/make-ghl/web/form.jpg',
    ratio: '1600 / 1012',
    frameLabel: 'ghl funnels · intake form',
    alt: 'Multi-step HVAC intake form with branching choices',
  },
  {
    num: '02',
    t: 't+90s',
    title: 'Straight onto the calendar',
    desc: 'The last funnel step is a live calendar: three hour arrival windows, evenings included. The lead picks a slot and becomes a booked appointment, no phone tag.',
    img: '/work/make-ghl/web/calendar.jpg',
    ratio: '1352 / 1500',
    frameLabel: 'ghl funnels · booking calendar',
    alt: 'Booking calendar with three hour appointment windows',
  },
  {
    num: '03',
    t: 't+91s',
    title: 'Tag, enroll, hand off',
    desc: 'The booked appointment fires a workflow: it tags the contact, and its last step is a webhook that hands the payload to Make.com.',
    img: '/work/make-ghl/web/trigger-workflow.jpg',
    ratio: '1600 / 1498',
    frameLabel: 'ghl workflow · webhook handoff',
    alt: 'GHL workflow builder ending in a webhook step',
  },
  {
    num: '04',
    t: 't+93s',
    title: '38 modules build the job',
    desc: 'The production scenario matches the customer, assembles the payload and POSTs the job to ServiceTitan, then routes install, service and maintenance down their own branches.',
    img: '/work/make-ghl/web/scenario-ghl-st.jpg',
    ratio: '1600 / 743',
    frameLabel: 'make.com · ghl to servicetitan',
    alt: 'Make.com scenario sending GHL leads to ServiceTitan',
  },
  {
    num: '05',
    t: 't+15m',
    title: 'Status flows home',
    desc: 'A scheduled scenario polls ServiceTitan for job and invoice state, routes on sent, progress, complete and paid, and updates the GHL opportunity so the pipeline always tells the truth.',
    img: '/work/make-ghl/web/scenario-get-jobs.jpg',
    ratio: '1600 / 740',
    frameLabel: 'make.com · get jobs from servicetitan',
    alt: 'Make.com scenario syncing ServiceTitan job status back to GHL',
  },
]

export const PIPELINE_ASIDE = {
  title: 'Self-healing auth',
  desc: 'ServiceTitan tokens expire on purpose. A two-module scenario refreshes and stores them on schedule. Nobody thinks about it, which is the point.',
  img: '/work/make-ghl/web/scenario-token.jpg',
  ratio: '1600 / 673',
  frameLabel: 'make.com · token refresh',
  alt: 'Two-module Make.com scenario refreshing the ServiceTitan API token',
}

export const PIPELINE_PLATFORMS: { label: string; live?: boolean }[] = [
  { label: 'ServiceTitan', live: true },
  { label: 'Jobber' },
  { label: 'Housecall Pro' },
  { label: 'Service Fusion' },
]

/* ---------- Pipeline: the nurture suite tabs ---------- */
export interface NurtureTab {
  key: string
  label: string // segmented control text
  folder: string // real GHL folder name
  meta: string[] // mono chips beside the folder name
  img: string
  ratio: string
  caption: string
  wide?: boolean // wide tree: pans X on phones instead of Y
}

export const NURTURE_TABS: NurtureTab[] = [
  {
    key: 'new-leads',
    label: 'New leads',
    folder: '1. New Lead Workflows',
    meta: ['6 cadences', 'TCPA branches', '76 enrolled'],
    img: '/work/make-ghl/web/tree-new-leads.jpg',
    ratio: '1047 / 1600',
    caption:
      'TCPA consent branches the cadence: SMS and email for opted-in leads, manual send tasks where consent is missing.',
  },
  {
    key: 'follow-up',
    label: 'Follow up',
    folder: '2. Follow Up Workflows',
    meta: ['6 cadences', 'stage-triggered'],
    img: '/work/make-ghl/web/tree-follow-up.jpg',
    ratio: '1261 / 1600',
    caption:
      'Opportunity stage changes re-enroll the contact; six texts and three emails pace out until an answer lands.',
  },
  {
    key: 'appointments',
    label: 'Appointments',
    folder: '3. Appointment Workflows',
    meta: ['confirmation + no-show', '24h and 1h reminders'],
    img: '/work/make-ghl/web/tree-appointments.jpg',
    ratio: '1504 / 1600',
    caption:
      'One workflow fans out by service category, finds or creates the opportunity, then times confirmation, 24 hour and 1 hour reminders to the booked slot.',
    wide: true,
  },
]

/* ---------- Experience: timeline rows ---------- */
export interface ExpRow {
  period: string
  title: string
  desc: string
}

export const EXPERIENCE: ExpRow[] = [
  {
    period: '2024 → Now',
    title: 'Full-stack & AI products',
    desc: 'Building SaaS and AI-voice products end to end: Subdesk and Callyniq, across frontend, backend and voice.',
  },
  {
    period: '2023',
    title: 'Web & client builds',
    desc: 'Production sites and dashboards for agencies and clients, including CodesWave.',
  },
  {
    period: '2022',
    title: 'Automation & scraping',
    desc: 'Designed n8n / Make / Zapier workflows and built large Puppeteer scrapers for data at scale.',
  },
  {
    period: '2021',
    title: 'Foundations',
    desc: 'Went deep on JavaScript, React and Node; shipped first freelance builds.',
  },
]

/* ---------- Services: 4 cards ---------- */
export interface Service {
  num: string
  title: string
  desc: string
  tag: string
}

export const SERVICES: Service[] = [
  {
    num: '01',
    title: 'Full-stack web development',
    desc: 'React, Next.js and Node apps built to last, from first commit to production.',
    tag: 'React · Next.js · Node',
  },
  {
    num: '02',
    title: 'Workflow automation',
    desc: 'Connect your tools and kill the busywork with reliable, observable workflows.',
    tag: 'n8n · Make · Zapier',
  },
  {
    num: '03',
    title: 'AI voice agents',
    desc: 'Receptionists and assistants that actually answer, qualify and book, around the clock.',
    tag: 'Vapi · Telephony',
  },
  {
    num: '04',
    title: 'Web scraping & data',
    desc: 'Resilient Puppeteer pipelines that gather, clean and deliver data on schedule.',
    tag: 'Puppeteer · Pipelines',
  },
]

/* ---------- Contact ---------- */
/* Web3Forms access key: public-safe by design — it maps to the inbox
   server-side, so no email address ships with the site. */
export const WEB3FORMS_ACCESS_KEY = 'd0258083-8a2d-4716-bd7c-7555da23b27a'
