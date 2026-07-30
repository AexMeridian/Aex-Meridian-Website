// Single source of truth for every price shown on the site. Import from
// here anywhere a price, tier name, or scope line appears — never
// hardcode a number in a page/component. This is what keeps Home, What We
// Do, and Pricing from drifting out of sync with each other again.
//
// Numbers below match the Rev 3 business plan exactly. "Everything starts
// at $500" is the plan's own headline sales message — website and every
// agent type share the same flat setup fee, differentiated only by the
// monthly. Don't round or approximate these; they're load-bearing.

export interface WebsitePlan {
  setup: string;
  monthly: string;
  tagline: string;
  scope: string[];
  careFeatures: string[];
}

export const websitePlan: WebsitePlan = {
  setup: '$500',
  monthly: '$35/mo',
  tagline: 'One price, no exceptions — no tiers, no quotes, no negotiation.',
  scope: [
    'Up to 5 pages — Home, About, Services, Gallery, Contact',
    'Mobile-responsive, fast-loading build',
    'Contact form with email delivery',
    'Basic on-page SEO — titles, meta descriptions, alt text',
    'Google Business Profile integration',
    'Domain connection, SSL, and deployment handled',
  ],
  careFeatures: [
    'Hosting, uptime monitoring, and SSL renewal',
    'DNS and domain management',
    'Up to 20 minutes of content edits every month',
    'Monthly automated backup',
  ],
};

export const overflowRate = 'Edits beyond 20 minutes a month are billed at $75/hour, in 15-minute increments.';
export const additionalPageRate = 'Additional pages beyond the first 5 are $100 each.';

export interface VideoTier {
  name: string;
  price: string;
  deliverable: string;
}

export const videoTiers: VideoTier[] = [
  {
    name: 'Essential Walkthrough',
    price: '$150',
    deliverable: '45–60 sec vertical video, captions, licensed music, one platform cut',
  },
  {
    name: 'Signature Walkthrough',
    price: '$300',
    deliverable: '75–90 sec, voiceover narration, B-roll, two platform cuts (Reels + YouTube Short)',
  },
  {
    name: 'Premium Walkthrough',
    price: '$500+',
    deliverable: 'Multi-scene edit, scripted narration, 3+ platform cuts, optional drone footage',
  },
];

// Content has no fixed monthly number anymore — it's the flexible, quoted
// line. These are example rates for the page copy, not a retainer.
export const digitalContentRates = {
  graphics: '$50–75 per graphic',
  shortFormVideo: '$150–250 per short-form video',
  batch: '$400–800 per batch of 8–12 assets',
};

export interface AgentTier {
  id: string;
  name: string;
  setup: string;
  monthly: string;
  tagline: string;
  description: string;
  bestFor: string;
  includedMinutes?: number;
  overageRate?: string;
}

export const agentTiers: AgentTier[] = [
  {
    id: 'lead-catcher',
    name: 'Lead Catcher',
    setup: '$500',
    monthly: '$75/mo',
    tagline: 'The default attach — cheapest entry, fastest payoff',
    description:
      'A chat assistant embedded on your site, trained on your services, hours, pricing, and FAQs — plus missed-call text-back that texts a lead back within seconds of any unanswered call.',
    bestFor: 'Every business with a website. The obvious starting point.',
  },
  {
    id: 'front-desk',
    name: 'Front Desk',
    setup: '$500',
    monthly: '$249/mo',
    tagline: '300 minutes included, then $0.60/min',
    description:
      'A voice agent that answers the phone 24/7, handles FAQs, qualifies the caller, books straight into your calendar, and texts you a summary. Escalates to a human when it should.',
    bestFor: 'Any business where a missed call is a lost job — trades, clinics, salons, restaurants, property managers.',
    includedMinutes: 300,
    overageRate: '$0.60 per minute beyond 300.',
  },
  {
    id: 'back-office',
    name: 'Back Office',
    setup: '$500',
    monthly: '$149/mo',
    tagline: 'The highest-margin product in the lineup',
    description:
      'A workflow agent that handles the repetitive admin around a job: instant lead response, quote follow-up, appointment reminders, and post-job review requests.',
    bestFor: 'Businesses already getting leads but losing them to slow follow-up.',
  },
];

export interface Bundle {
  name: string;
  setup: string;
  monthly: string;
  note: string;
}

export const bundles: Bundle[] = [
  {
    name: 'Website + Lead Catcher',
    setup: '$900 — save $100',
    monthly: '$99/mo — save $11',
    note: 'The default target for every client.',
  },
  {
    name: 'Website + Front Desk',
    setup: '$900 — save $100',
    monthly: '$265/mo — save $19',
    note: 'Trades, clinics, and other high-call businesses.',
  },
  {
    name: 'Full Stack — all three agents',
    setup: '$1,400',
    monthly: '$399/mo',
    note: 'Rare, but the ceiling to aim for.',
  },
];

// Quick "starting at" figures for teaser copy on Home/What We Do — always
// derived from the plan above, never restated as separate literals.
export const startingWebsiteSetup = websitePlan.setup;
export const startingWebsiteMonthly = websitePlan.monthly;
export const startingVideoPrice = videoTiers[0].price;
export const startingAgentSetup = agentTiers[0].setup;
export const startingAgentPrice = agentTiers[0].monthly;
