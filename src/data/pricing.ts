// Single source of truth for every price shown on the site. Import from
// here anywhere a price, tier name, or scope line appears — never
// hardcode a number in a page/component. This is what keeps Home, What We
// Do, and Pricing from drifting out of sync with each other again.
//
// Numbers below match the agent-first repositioning plan ("Business Plan
// with agents 1.docx") exactly. Setup is still a flat $500 across every
// product; the monthly is a range per agent now, scoped to each client's
// actual volume, not a single flat number. Don't round or approximate
// these; they're load-bearing.

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
  monthlyFrom: string;
  tagline: string;
  description: string;
  bestFor: string;
}

// Agent-first repositioning: pricing is a range per agent (scoped to the
// client's actual call/lead volume), not one flat number like the website.
// Order matches the business plan's own listed order — flagship first.
export const agentTiers: AgentTier[] = [
  {
    id: 'voice-receptionist',
    name: 'AI Voice Receptionist',
    setup: '$500',
    monthly: '$300–$450/mo',
    monthlyFrom: '$300',
    tagline: 'The flagship — missed-call text-back included',
    description:
      'Answers calls 24/7 (or after-hours/overflow only), handles FAQs from your own content, books straight into your calendar, and texts back any missed or abandoned call within seconds. Delivers a call summary and transcript after every conversation.',
    bestFor: 'Any business where a missed call is a lost job — trades, clinics, salons, restaurants, real estate.',
  },
  {
    id: 'website-chat',
    name: 'Website Chat Agent',
    setup: '$500',
    monthly: '$150–$250/mo',
    monthlyFrom: '$150',
    tagline: 'Lead qualification, right on your site',
    description:
      'Lives on your website, answers from your own content, qualifies visitors on need and timeline, captures contact info, and routes hot leads to you by text or email.',
    bestFor: 'Any business whose site already drives traffic — professional services, wellness, retail, real estate.',
  },
  {
    id: 'speed-to-lead',
    name: 'Speed-to-Lead Agent',
    setup: '$500',
    monthly: '$200–$350/mo',
    monthlyFrom: '$200',
    tagline: 'Responds in minutes, not hours',
    description:
      'The moment a form, ad, or chat lead comes in, it instantly texts or emails them back, asks a couple of qualifying questions, offers a booking link, and follows up on a short cadence until they reply.',
    bestFor: 'Any business that buys leads or runs ads — home services, real estate, med-spa, fitness, legal.',
  },
];

// No bundle-discount numbers exist in the current business plan — don't
// invent them. This stays a plain, non-numeric note until real bundle
// pricing is set.
export const bundleNote = 'Most clients pair a website with one agent — ask what makes sense for your business.';

// Quick "starting at" figures for teaser copy on Home/What We Do — always
// derived from the plan above, never restated as separate literals. The
// flagship agent is no longer the cheapest, so this is the lowest floor
// across all three tiers (currently the Website Chat Agent), not tier[0].
export const startingWebsiteSetup = websitePlan.setup;
export const startingWebsiteMonthly = websitePlan.monthly;
export const startingVideoPrice = videoTiers[0].price;
export const startingAgentSetup = agentTiers[0].setup;
export const startingAgentPrice = `${agentTiers.reduce((min, t) => (Number(t.monthlyFrom.replace(/\D/g, '')) < Number(min.replace(/\D/g, '')) ? t.monthlyFrom : min), agentTiers[0].monthlyFrom)}/mo`;
