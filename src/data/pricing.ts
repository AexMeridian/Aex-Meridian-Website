// Single source of truth for every price shown on the site. Import from
// here anywhere a price, tier name, or scope line appears — never
// hardcode a number in a page/component. This is what keeps Home, What We
// Do, and Pricing from drifting out of sync with each other again.

export interface WebsitePlan {
  setup: string;
  monthly: string;
  tagline: string;
  scope: string[];
  careFeatures: string[];
}

export const websitePlan: WebsitePlan = {
  setup: '$500–750',
  monthly: '$35/mo',
  tagline: 'One plan, sized to fit your business — no tiers to compare, no upsell path to guess at.',
  scope: [
    'A site sized to your business — most run 4–7 pages',
    'Mobile-responsive on every screen size',
    'Contact form that delivers to your inbox',
    'Basic on-page SEO',
    'Photo gallery and custom sections where they earn their place',
  ],
  careFeatures: [
    'Hosting, domain, DNS, and SSL handled',
    'Uptime monitoring and weekly backups',
    'Small routine edits included every month',
  ],
};

export const overflowRate = 'Larger edit requests are billed at $60/hour.';

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

export interface SocialRetainer {
  price: string;
  included: string[];
}

export const socialRetainer: SocialRetainer = {
  price: '$100–200/mo',
  included: [
    'Branded posts and graphics on a regular schedule',
    'Caption writing and scheduling handled for you',
    'Platform count and post volume scoped to fit the retainer',
  ],
};

// Quick "starting at" figures for teaser copy on Home/What We Do — always
// derived from the plan above, never restated as separate literals.
export const startingWebsiteSetup = websitePlan.setup;
export const startingWebsiteMonthly = websitePlan.monthly;
export const startingVideoPrice = videoTiers[0].price;
export const startingSocialPrice = socialRetainer.price;
