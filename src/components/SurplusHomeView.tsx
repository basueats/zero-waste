import React, { useState, Suspense, lazy } from 'react';
import type { ExamUnlockStatus } from '../data/examStatusUtils';
import { SupritamoneLogo } from './SupritamoneLogo';
import type { LegalPolicyType } from './LegalPolicyModal';

const LegalPolicyModal = lazy(() =>
  import('./LegalPolicyModal').then((m) => ({ default: m.LegalPolicyModal }))
);
const AboutDrBasuModal = lazy(() =>
  import('./AboutDrBasuModal').then((m) => ({ default: m.AboutDrBasuModal }))
);
import iso9001Logo from '../assets/images/iso_9001_certified.png';
import cpdProviderLogo from '../assets/images/cpd_approved_provider_791463.png';
import msmeOfficialLogo from '../assets/images/msme_official_logo.jpeg';
import {
  Star,
  Plus,
  Minus,
  Trash2,
  Users,
  AlertTriangle,
  HeartHandshake,
  Sparkles,
  Check,
  Mail,
  X,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';

export type HomePlanId = 'trial' | 'individual' | 'team' | 'training';

interface SurplusHomeViewProps {
  onOpenCourse: (courseId: string) => void;
  onOpenLibrary: () => void;
  onOpenCertify: () => void;
  onOpenSection: (sectionId: string) => void;
  onSelectNavTab: (tab: string) => void;
  onOpenAdminPortal?: () => void;
  onSelectPlan?: (planId: HomePlanId) => void;
  isGuestPreview?: boolean;
  isCertificateUnlocked?: boolean;
  examStatus?: ExamUnlockStatus;
}

type JourneyTab = 'problem' | 'whatWeCanDo' | 'howToFixIt' | 'solutions' | 'howAppSolves';
type DemoItemKey = 'bread' | 'stalks' | 'citrus' | 'buffet';
type PhoneTab = 'courses' | 'library' | 'inventory';

const JOURNEY_DATA = {
  problem: {
    badge: 'THE PROBLEM IN COMMERCIAL KITCHENS',
    title: 'Why Millions in Edible Food End Up in Kitchen Bins',
    subtitle:
      'Commercial kitchens discard up to 40% of purchased ingredients. It is not an inevitable cost of hospitality—it is an unchecked operational leakage.',
    stats: [
      {
        value: '30-40%',
        label: 'Average food purchased that is wasted',
        detail: 'In hotel, resort, and restaurant operations worldwide.',
      },
      {
        value: '6% - 9%',
        label: 'Direct hit to gross profit margins',
        detail: 'Food costs thrown straight into trash bags every single shift.',
      },
      {
        value: '1.3B Tons',
        label: 'Global edible food wasted annually',
        detail: 'Generating 8-10% of all greenhouse gas emissions globally.',
      },
    ],
    painPoints: [
      {
        icon: 'Trash2',
        title: 'Invisible Prep Scraps',
        desc: 'Stems, peelings, crusts, and husks are discarded automatically during prep because cooks lack the formulas to upcycle them into menu assets.',
      },
      {
        icon: 'Users',
        title: 'Buffet & Banquet Overproduction',
        desc: 'Fear of running out leads to large holding pans that degrade under heat lamps and get tossed due to lack of cold-chain triage.',
      },
      {
        icon: 'AlertTriangle',
        title: 'No Live Inventory Expiration Alerting',
        desc: 'Walk-in chillers lack real-time visibility. By the time chefs realize a batch is near expiration, it is already too late to rescue.',
      },
      {
        icon: 'HeartHandshake',
        title: 'Disconnected from Community Shelters',
        desc: 'Kitchens want to donate wholesome zero waste unserved meals, but without instant digital dispatch, safe transport and logistics are too slow.',
      },
    ],
  },
  whatWeCanDo: {
    badge: 'WHAT WE CAN DO',
    title: 'Shifting the Mindset: From Waste Guilt to Culinary Technique',
    subtitle:
      "We don't preach sustainability with slogans. We give chefs the culinary mastery and digital tools to transform every trimming into margin.",
    pillars: [
      {
        title: 'Rewire Kitchen Psychology',
        desc: 'Teach culinary brigades that throwing edible trimmings into a bin is the equivalent of throwing cash into a paper shredder.',
      },
      {
        title: 'Root-to-Leaf Gastronomy',
        desc: 'Equip chefs with formulas: turn allium skins into golden dashi, stale sourdough into rich miso, and citrus rinds into high-margin cordials.',
      },
      {
        title: 'Dynamic Buffer Planning',
        desc: 'Implement batch cooking cadences and vessel scaling that keep buffet displays looking abundant with half the overproduction.',
      },
      {
        title: 'Automated Food Rescue',
        desc: 'Bridge kitchen loading docks with verified local food banks to dispatch zero waste meals safely before spoilage.',
      },
    ],
  },
  howToFixIt: {
    badge: 'HOW TO FIX IT',
    title: 'The 4-Step Operational Framework',
    subtitle: 'A proven, repeatable system implemented across 120+ international hotel and restaurant brigades.',
    steps: [
      {
        step: '01',
        title: 'Measure & Audit the Bins',
        desc: 'Execute a 48-hour station audit. Weigh prep trimmings, spoilage, and buffet returns to pinpoint the exact dollar leakage.',
      },
      {
        step: '02',
        title: 'Build Circular Recipe Loops',
        desc: 'Link every high-volume menu prep item to a companion upcycling recipe that replaces an expensive purchased pantry item.',
      },
      {
        step: '03',
        title: 'Deploy Live Station Tracking',
        desc: 'Use the Zero waste by Supritamone dashboard to track batch weights, shelf-life countdowns, and receive instant recipe matches.',
      },
      {
        step: '04',
        title: 'One-Click Community Dispatch',
        desc: 'When zero waste meals exceed kitchen storage, tap one button to dispatch temperature-verified donation alerts to local shelters.',
      },
    ],
  },
  solutions: {
    badge: 'THE SOLUTIONS',
    title: 'Everything a Chef Needs to Run a Zero-Waste Operation',
    subtitle: 'Practical, pocket-sized, and built directly for fast-paced commercial kitchens.',
    items: [
      {
        title: 'The Searchable Byproduct Catalogue',
        desc: 'Over 60 common kitchen byproducts with step-by-step culinary solutions. Look up any trimming and stop throwing money in the bin.',
      },
      {
        title: 'Brigade Video Mini-Courses',
        desc: 'Structured studio video lessons on prep waste, buffet waste, and circular menu engineering. Ready in your pocket before service.',
      },
      {
        title: 'Live Inventory Tracking & Expiration Alerts',
        desc: 'Real-time visibility across Prep, Larder, Hot Line, Pastry, and Banquet. Freshness meters alert cooks before items degrade.',
      },
      {
        title: 'Community Food Rescue Dispatch',
        desc: 'Instantly alert local food banks and shelters with required holding temperatures (Chilled <4°C, Ambient, Frozen) and pickup windows.',
      },
    ],
  },
};

const DEMO_SCENARIOS: Record<
  DemoItemKey,
  {
    name: string;
    station: string;
    quantity: string;
    problemReason: string;
    appAction: string;
    upcycleOutcome: string;
    communityAlternative: string;
    marginBoost: string;
  }
> = {
  bread: {
    name: 'Day-Old Sourdough & Baguettes',
    station: 'Pastry / Bakery Counter',
    quantity: '18.5 kg daily waste',
    problemReason: 'Staling crusts binned every morning before opening.',
    appAction: 'Matched with "Stale Sourdough Miso & Toasted Caramel"',
    upcycleOutcome: 'Converted into savoury umami glaze for grilled vegetables.',
    communityAlternative: 'Or 1-click broadcast 45 portions to St. Jude Community Dining Room.',
    marginBoost: '+$14.50 / kg saved',
  },
  stalks: {
    name: 'Broccoli & Cauliflower Woody Stems',
    station: 'Prep Station',
    quantity: '14.0 kg per prep shift',
    problemReason: 'Flaking and trimming florets while throwing sweet core stems into compost.',
    appAction: 'Matched with "Broccoli Stalk Carpaccio with Preserved Lemon"',
    upcycleOutcome: 'Shaved thin into signature $14 raw appetizer with 100% stalk yield.',
    communityAlternative: 'Crated and sent to local youth soup kitchen for wholesome vegetable stews.',
    marginBoost: '+$9.80 / kg saved',
  },
  citrus: {
    name: 'Spent Lemon, Orange & Lime Husks',
    station: 'Bar & Juice Station',
    quantity: '12.0 kg juiced rinds weekly',
    problemReason: 'Juice extracted; aromatic essential oil peels discarded immediately.',
    appAction: 'Matched with "Citrus Peel Oleo Saccharum & Cordial"',
    upcycleOutcome: 'Cold sugar maceration extracts $60/L cocktail cordial for bar service.',
    communityAlternative: 'Dehydrated and turned into natural citrus seasoning salts.',
    marginBoost: '+$18.00 / kg saved',
  },
  buffet: {
    name: 'Unserved Roasted Vegetables & Grain Trays',
    station: 'Banquet & Hot Line',
    quantity: '26 portions overproduction',
    problemReason: 'Left in holding pans; staff discard due to food safety uncertainty.',
    appAction: 'Triggered Community Food Rescue Dispatch Alert',
    upcycleOutcome: 'Blast-chilled under Good Samaritan protocol (<4°C in 90 mins).',
    communityAlternative: 'Picked up within 45 mins by Harbor City Food Rescue Coalition.',
    marginBoost: '100% Tax & CSR Deduction',
  },
};

const FAQ_ITEMS = [
  {
    question: 'What exactly is the ZERO WASTE app?',
    answer:
      'The ZERO WASTE app by Supritamone is an all-in-one digital learning platform and kitchen management tool designed specifically for chefs, kitchen teams, and F&B managers. It provides an ingredient byproduct catalogue, zero-waste recipes, structured mini-courses, and practical templates to eliminate commercial kitchen food waste.',
  },
  {
    question: 'What is inside ZERO WASTE?',
    answer:
      'Inside the Academy you get 12 structured diploma sections (24 video chapters totaling 26 hours of study), a searchable 500-item byproduct and recipe library, live commercial waste calculators, printable kitchen SOP posters, and community mentor discussions.',
  },
  {
    question: 'Who is ZERO WASTE for?',
    answer:
      'ZERO WASTE is engineered for hospitality professionals of all levels: Head Chefs, Sous Chefs, Chef de Parties, F&B Directors, hotel culinary brigades, resort operations, catering managers, culinary educators, and independent restaurateurs looking to protect profit margins.',
  },
  {
    question: 'Why should I join ZERO WASTE?',
    answer:
      'Food waste is the single largest controllable variable cost in commercial hospitality, accounting for 6% to 9% of total food spend. Joining gives your culinary brigade the practical systems to eliminate up to 50% of prep trimmings and buffet waste—directly boosting your bottom line and staff morale.',
  },
  {
    question: 'Is ZERO WASTE useful for every commercial kitchen?',
    answer:
      'Yes. From Michelin-starred fine dining and boutique farm-to-table bistros to high-volume 5-star hotel buffets and catering operations, the root-to-leaf techniques, storage SOPs, and inventory alert tools are universally applicable.',
  },
  {
    question: 'Is a team plan available on ZERO WASTE?',
    answer:
      'Yes! Our Team Plan is designed for kitchen brigades with 5 or more chefs at $79 per chef/year, featuring multi-user access, brigade progress tracking, engagement analytics, and shared kitchen recipe binders.',
  },
  {
    question: 'How can chefs use the ZERO WASTE app?',
    answer:
      'Chefs can use it directly on the line via smartphone, tablet, or kitchen monitor: search byproducts in seconds (e.g. what to do with 10kg of leek greens or cauliflower leaves), watch structured studio video lessons before prep, log station stock, and audit daily waste weights.',
  },
  {
    question: 'Why is the ZERO WASTE app not free?',
    answer:
      'We offer a 3-Day Free Trial with 100% full brigade access so every kitchen can test the systems before committing. The platform contains years of proprietary culinary research, commercial audits, and recipes tested across luxury hotel groups. Annual subscriptions cost less than a single bin of discarded kitchen trimmings.',
  },
  {
    question: 'Will the ZERO WASTE app help me to reduce food waste?',
    answer:
      'Yes, verified client kitchens audited by our culinary specialists report an average 34% to 50% reduction in avoidable prep and buffet waste within the first two months of consistent use.',
  },
  {
    question: 'Is the ZERO WASTE app useful for catering operations?',
    answer:
      'Absolutely. High-volume catering frequently encounters unpredictable guest turnouts and overproduction. The app provides exact batch planning guides, secondary transformation recipes, and cold-chain donation dispatch protocols.',
  },
  {
    question: 'Can we use the ZERO WASTE app as a training platform for our chefs?',
    answer:
      'Yes. Leading hotel chains and culinary schools use our structured 26-hour Academy modules and certification exam to onboard junior cooks, upskill prep stations, and certify culinary teams in zero-waste operational excellence.',
  },
];

const HOME_PRICING_PLANS: Array<{
  id: HomePlanId;
  title: string;
  badge?: string;
  description: string;
  price: string;
  cadence: string;
  features: string[];
  buttonText: string;
  highlighted?: boolean;
  isTrial?: boolean;
}> = [
  {
    id: 'trial',
    title: '3-Day Free Trial',
    badge: 'START RISK FREE',
    description: 'Instant 72-hour full unrestricted brigade access without credit card.',
    price: '$0',
    cadence: 'free for 3 days',
    features: [
      'Full access to all 60+ zero-waste recipes',
      'Catalogue of byproducts & upcycling tips',
      'Interactive kitchen inventory dashboard',
      'Live community food rescue dispatch',
      'Unlimited access across mobile & tablet',
      'No upfront payment or card required',
    ],
    buttonText: 'START 3-DAY FREE TRIAL',
    isTrial: true,
  },
  {
    id: 'individual',
    title: 'Individual',
    description: 'Annual subscription. No per-module fees. Full access on every plan.',
    price: '$99',
    cadence: 'per person/year',
    features: [
      'A library of zero-waste recipes',
      'Catalogue of byproducts and tips',
      'Training courses for chefs',
      'Best practices & SOP downloads',
      'Exclusive live masterclass Q&A calls with master mentors',
      'Members only newsletter',
      'Printable kitchen posters & prep guides',
      'Unlimited access to all resources',
      'Access to all future content',
      'Mobile app access',
    ],
    buttonText: 'JOIN NOW',
  },
  {
    id: 'team',
    title: 'Team',
    badge: 'MOST POPULAR',
    description: 'Minimum 5 chefs included. Perfect for restaurant and hotel brigades.',
    price: '$79',
    cadence: 'per chef/year',
    features: [
      'Everything in Individual plan, plus:',
      'Team progress tracking & analytics',
      'Engagement reports for Head Chefs',
      'Minimum 5 chefs included',
      'Dedicated brigade onboarding kit',
      'Shared kitchen recipe binder',
      'Priority live Q&A sessions',
    ],
    buttonText: 'GET STARTED',
    highlighted: true,
  },
  {
    id: 'training',
    title: 'Training',
    badge: 'EXECUTIVE ADVISORY',
    description: 'Comprehensive operational transformation and executive culinary advisory.',
    price: '$1499',
    cadence: 'per 5 chefs/year',
    features: [
      'Everything in the Team plan, plus:',
      '3x tailored private online sessions',
      'Private dedicated brigade advisory channel',
      'Food waste data review & bin audit analysis',
      'Customized menu circularity roadmap',
      'Certified Zero Waste Brigade credential',
    ],
    buttonText: 'ENQUIRE NOW',
  },
];

export const SurplusHomeView: React.FC<SurplusHomeViewProps> = ({
  onOpenCourse,
  onOpenLibrary,
  onOpenSection,
  onSelectNavTab,
  onOpenAdminPortal,
  onSelectPlan,
  isGuestPreview = false,
}) => {
  const masterCourseId = 'food-waste-prevention-chefs';
  const [journeyTab, setJourneyTab] = useState<JourneyTab>('problem');
  const [demoItem, setDemoItem] = useState<DemoItemKey>('bread');
  const [phoneTab, setPhoneTab] = useState<PhoneTab>('courses');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.location.hash === '#about-dr-basu';
  });
  const [activeLegalPolicy, setActiveLegalPolicy] = useState<LegalPolicyType | null>(() => {
    if (typeof window === 'undefined') return null;
    const p = window.location.pathname.toLowerCase();
    if (p.includes('terms-conditions')) return 'terms';
    if (p.includes('cookie-policy')) return 'cookie';
    if (p.includes('privacy-policy')) return 'privacy';
    return null;
  });

  const activeScenario = DEMO_SCENARIOS[demoItem];

  const scrollToElement = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-white text-neutral-900 overflow-x-clip">
      {/* SECTION 1: HERO (Copied cleanly from zerowaste.supritamone.com / image_6b454908.png) */}
      <section className="pt-10 pb-16 sm:pt-12 sm:pb-20 lg:pt-20 lg:pb-28 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-heading tracking-tighter text-black uppercase leading-none">
                ZERO WASTE
              </h1>

              <h2 className="text-xl sm:text-3xl lg:text-4xl font-normal text-neutral-900 tracking-tight">
                The <span className="font-bold">food waste</span> learning platform for chefs.
              </h2>

              <div className="space-y-2 text-sm sm:text-base text-neutral-600 leading-relaxed max-w-xl">
                <p>
                  Learn how to plan low-waste menus and how to eliminate food waste from your kitchen.
                </p>
                <p>
                  A catalogue of best practices, recipes, tips, tools and courses for food waste prevention.
                </p>
                <p className="font-medium text-neutral-900">
                  All in one space for chefs. In your pocket. Ready when you need it.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
                <button
                  onClick={() => {
                    if (isGuestPreview) {
                      scrollToElement('pricing');
                    } else {
                      onOpenCourse(masterCourseId);
                    }
                  }}
                  className="px-8 py-4 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 text-center cursor-pointer"
                >
                  JOIN NOW
                </button>
                <button
                  onClick={() => scrollToElement('problem-solution')}
                  className="px-8 py-4 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 text-center cursor-pointer"
                >
                  LEARN MORE
                </button>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-500">
                <span className="flex items-center text-emerald-700 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                  Live Kitchen Inventory &amp; Alert Suite Included
                </span>
                <span>•</span>
                <button
                  onClick={() => onOpenSection('waste-calculator')}
                  className="underline hover:text-black font-medium cursor-pointer"
                >
                  Launch Live Dashboard →
                </button>
              </div>
            </div>

            {/* Right Mobile App Showcase Card (Matching image_6b454908.png) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="relative mx-auto rounded-[2.5rem] bg-neutral-950 p-3 shadow-2xl border-4 border-neutral-800 max-w-[310px]">
                  <div className="rounded-[2rem] bg-white overflow-hidden p-4 space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                      <span className="font-bold text-black text-xs tracking-tight font-heading">
                        ZERO WASTE
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">12:58</span>
                    </div>

                    <div className="flex space-x-3 text-[10px] border-b border-neutral-100 pb-2 font-medium">
                      <button
                        onClick={() => setPhoneTab('courses')}
                        className={`pb-0.5 cursor-pointer transition-colors ${
                          phoneTab === 'courses'
                            ? 'text-black border-b border-black font-bold'
                            : 'text-neutral-400 hover:text-black'
                        }`}
                      >
                        Courses
                      </button>
                      <button
                        onClick={() => setPhoneTab('library')}
                        className={`pb-0.5 cursor-pointer transition-colors ${
                          phoneTab === 'library'
                            ? 'text-black border-b border-black font-bold'
                            : 'text-neutral-400 hover:text-black'
                        }`}
                      >
                        Library
                      </button>
                      <button
                        onClick={() => setPhoneTab('inventory')}
                        className={`pb-0.5 cursor-pointer transition-colors ${
                          phoneTab === 'inventory'
                            ? 'text-black border-b border-black font-bold'
                            : 'text-neutral-400 hover:text-black'
                        }`}
                      >
                        Inventory
                      </button>
                    </div>

                    {phoneTab === 'courses' && (
                      <div className="space-y-2.5 animate-fadeIn">
                        <div
                          onClick={() => onOpenCourse(masterCourseId)}
                          className="bg-neutral-900 hover:bg-black text-white rounded-xl p-3.5 space-y-1 cursor-pointer transition-colors"
                        >
                          <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold block">
                            COURSE 01
                          </span>
                          <h4 className="font-bold text-xs leading-tight">
                            HOW TO REDUCE 50% OF YOUR PREP WASTE
                          </h4>
                          <p className="text-[10px] text-neutral-300">
                            Root, stem and trim optimization for line cooks.
                          </p>
                        </div>

                        <div
                          onClick={() => onOpenCourse(masterCourseId)}
                          className="bg-neutral-100 hover:bg-neutral-200/70 border border-neutral-200 rounded-xl p-3.5 space-y-1 cursor-pointer transition-colors"
                        >
                          <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold block">
                            COURSE 02
                          </span>
                          <h4 className="font-bold text-xs text-neutral-900 leading-tight">
                            HOW TO REDUCE BUFFET WASTE
                          </h4>
                          <p className="text-[10px] text-neutral-500">
                            Display vessel sizing and rapid blast chilling SOPs.
                          </p>
                        </div>

                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-[10px] font-bold text-emerald-900">
                              Live Community Rescue
                            </p>
                            <p className="text-[9px] text-emerald-700">
                              18.5kg Bakery zero waste alert ready
                            </p>
                          </div>
                          <button
                            onClick={() => onOpenSection('waste-calculator')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9px] font-bold cursor-pointer transition-colors"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    )}

                    {phoneTab === 'library' && (
                      <div className="space-y-2 animate-fadeIn">
                        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 space-y-1">
                          <span className="text-[9px] font-bold uppercase text-neutral-500">BYPRODUCT SOP</span>
                          <h4 className="font-bold text-xs text-neutral-900">Broccoli Stalk Carpaccio</h4>
                          <p className="text-[10px] text-neutral-500">+100% stalk yield · Shaved fine &amp; cured</p>
                        </div>
                        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 space-y-1">
                          <span className="text-[9px] font-bold uppercase text-neutral-500">BROTH BASE</span>
                          <h4 className="font-bold text-xs text-neutral-900">Charred Onion Skin Dashi</h4>
                          <p className="text-[10px] text-neutral-500">Zero-cost umami stock in 40 mins</p>
                        </div>
                        <button
                          onClick={onOpenLibrary}
                          className="w-full py-2 rounded-xl bg-black text-white font-bold text-[10px] uppercase tracking-wider cursor-pointer hover:bg-neutral-800"
                        >
                          Open 500+ Recipe Library →
                        </button>
                      </div>
                    )}

                    {phoneTab === 'inventory' && (
                      <div className="space-y-2 animate-fadeIn">
                        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-neutral-900">Sourdough Boule</p>
                            <p className="text-[10px] text-neutral-500">Bakery · 18.5 kg</p>
                          </div>
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Upcycle
                          </span>
                        </div>
                        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-neutral-900">Herb &amp; Leek Trim</p>
                            <p className="text-[10px] text-neutral-500">Cold Larder · 9.2 kg</p>
                          </div>
                          <span className="text-[9px] font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                            Oil SOP
                          </span>
                        </div>
                        <button
                          onClick={() => onOpenSection('waste-calculator')}
                          className="w-full py-2 rounded-xl bg-black text-white font-bold text-[10px] uppercase tracking-wider cursor-pointer hover:bg-neutral-800"
                        >
                          Open Waste Calculator →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: 5-STAR EXECUTIVE QUOTE (image_bc45964d.png) */}
      <section className="py-12 border-b border-neutral-100 bg-[#fbfcfc]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center space-x-1 text-amber-400">
            {[0, 1, 2, 3, 4].map((idx) => (
              <Star key={idx} className="w-5 h-5 fill-amber-400" />
            ))}
          </div>
          <blockquote className="text-base sm:text-lg text-neutral-800 font-medium leading-relaxed italic max-w-2xl mx-auto">
            &ldquo;An amazing platform for chefs. Loved going through all the content and finding new
            ideas. It&apos;s clear that the app is built for chefs, as it&apos;s very intuitive and a
            pleasure to use.&rdquo;
          </blockquote>
          <p className="text-xs text-neutral-500 font-medium">
            — Executive Culinary Director, Luxury Hospitality Resort &amp; Spa
          </p>
        </div>
      </section>

      {/* SECTION 3: 4 CORE CARDS (image_bc45964d.png) */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-neutral-900 tracking-tight">
              Food waste prevention for chefs. All in one place.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => onSelectNavTab('courses')}
              className="text-left bg-[#f7f8f9] border border-neutral-200/80 rounded-2xl p-6 space-y-2 hover:border-black transition-all cursor-pointer"
            >
              <h3 className="text-lg font-bold font-heading text-neutral-900">Courses</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Learn the skills behind food waste prevention in short videos, one topic at a time.
              </p>
            </button>

            <button
              onClick={onOpenLibrary}
              className="text-left bg-[#f7f8f9] border border-neutral-200/80 rounded-2xl p-6 space-y-2 hover:border-black transition-all cursor-pointer"
            >
              <h3 className="text-lg font-bold font-heading text-neutral-900">Recipes</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Learn the secret behind zero-waste cooking with easy-to-replicate recipes in any
                operation.
              </p>
            </button>

            <button
              onClick={() => onOpenSection('waste-calculator')}
              className="text-left bg-[#f7f8f9] border border-neutral-200/80 rounded-2xl p-6 space-y-2 hover:border-black transition-all cursor-pointer"
            >
              <h3 className="text-lg font-bold font-heading text-neutral-900">Resources</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Sample zero-waste menus, cost calculators and kitchen posters. Used in kitchens around
                the world.
              </p>
            </button>

            <button
              onClick={() => onOpenSection('ask-dr-basu')}
              className="text-left bg-[#f7f8f9] border border-neutral-200/80 rounded-2xl p-6 space-y-2 hover:border-black transition-all cursor-pointer"
            >
              <h3 className="text-lg font-bold font-heading text-neutral-900">Live sessions</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Live masterclass Q&amp;A calls with culinary mentors. Bring your kitchen&apos;s specific
                challenges and get direct answers.
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 4: THE CIRCULAR KITCHEN JOURNEY (image_9eddfcf0.png) */}
      <section className="py-16 sm:py-24 bg-white border-t border-neutral-100" id="problem-solution">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              STRATEGIC BREAKDOWN
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-neutral-900 tracking-tight">
              The Circular Kitchen Journey
            </h2>
            <p className="text-base text-neutral-600 leading-relaxed">
              Understand the root cause of kitchen waste, what we can do to shift it, how to
              systematically fix it, and how Zero waste by Supritamone delivers the complete
              operational solution.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <div className="bg-neutral-100 p-1.5 rounded-2xl flex flex-wrap justify-center gap-1 border border-neutral-200/80 shadow-inner max-w-full">
              <button
                onClick={() => setJourneyTab('problem')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  journeyTab === 'problem'
                    ? 'bg-black text-white shadow-md'
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-200/50'
                }`}
              >
                1. What is the Problem?
              </button>
              <button
                onClick={() => setJourneyTab('whatWeCanDo')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  journeyTab === 'whatWeCanDo'
                    ? 'bg-black text-white shadow-md'
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-200/50'
                }`}
              >
                2. What We Can Do
              </button>
              <button
                onClick={() => setJourneyTab('howToFixIt')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  journeyTab === 'howToFixIt'
                    ? 'bg-black text-white shadow-md'
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-200/50'
                }`}
              >
                3. How to Fix It
              </button>
              <button
                onClick={() => setJourneyTab('solutions')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  journeyTab === 'solutions'
                    ? 'bg-black text-white shadow-md'
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-200/50'
                }`}
              >
                4. The Solutions
              </button>
              <button
                onClick={() => setJourneyTab('howAppSolves')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  journeyTab === 'howAppSolves'
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>5. How This App Solves It</span>
              </button>
            </div>
          </div>

          {/* TAB 1: WHAT IS THE PROBLEM */}
          {journeyTab === 'problem' && (
            <div className="bg-[#fafbfc] border border-neutral-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-12 space-y-8 sm:space-y-10 animate-fadeIn">
              <div className="max-w-3xl space-y-2">
                <span className="text-xs font-bold text-red-700 tracking-wider uppercase font-mono">
                  {JOURNEY_DATA.problem.badge}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold font-heading text-neutral-900">
                  {JOURNEY_DATA.problem.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {JOURNEY_DATA.problem.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {JOURNEY_DATA.problem.stats.map((stat) => (
                  <div
                    key={stat.value}
                    className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-2"
                  >
                    <p className="text-3xl sm:text-4xl font-black font-heading text-neutral-900">
                      {stat.value}
                    </p>
                    <p className="text-xs font-bold text-neutral-800">{stat.label}</p>
                    <p className="text-xs text-neutral-500 leading-relaxed">{stat.detail}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 font-mono">
                  CORE BREAKDOWN IN THE BRIGADE WORKFLOW
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {JOURNEY_DATA.problem.painPoints.map((pt) => (
                    <div
                      key={pt.title}
                      className="bg-white border border-neutral-200 rounded-2xl p-5 flex items-start gap-4"
                    >
                      <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        {pt.icon === 'Trash2' && <Trash2 className="w-4 h-4" />}
                        {pt.icon === 'Users' && <Users className="w-4 h-4" />}
                        {pt.icon === 'AlertTriangle' && <AlertTriangle className="w-4 h-4" />}
                        {pt.icon === 'HeartHandshake' && <HeartHandshake className="w-4 h-4" />}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-neutral-900">{pt.title}</h4>
                        <p className="text-xs text-neutral-600 leading-relaxed">{pt.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WHAT WE CAN DO */}
          {journeyTab === 'whatWeCanDo' && (
            <div className="bg-[#fafbfc] border border-neutral-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-12 space-y-8 sm:space-y-10 animate-fadeIn">
              <div className="max-w-3xl space-y-2">
                <span className="text-xs font-bold text-neutral-700 tracking-wider uppercase font-mono">
                  {JOURNEY_DATA.whatWeCanDo.badge}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold font-heading text-neutral-900">
                  {JOURNEY_DATA.whatWeCanDo.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {JOURNEY_DATA.whatWeCanDo.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {JOURNEY_DATA.whatWeCanDo.pillars.map((pillar, idx) => (
                  <div
                    key={pillar.title}
                    className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-2"
                  >
                    <span className="text-[11px] font-bold font-mono text-neutral-400">
                      0{idx + 1}
                    </span>
                    <h4 className="text-base font-bold text-neutral-900">{pillar.title}</h4>
                    <p className="text-xs text-neutral-600 leading-relaxed">{pillar.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: HOW TO FIX IT */}
          {journeyTab === 'howToFixIt' && (
            <div className="bg-[#fafbfc] border border-neutral-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-12 space-y-8 sm:space-y-10 animate-fadeIn">
              <div className="max-w-3xl space-y-2">
                <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase font-mono">
                  {JOURNEY_DATA.howToFixIt.badge}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold font-heading text-neutral-900">
                  {JOURNEY_DATA.howToFixIt.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {JOURNEY_DATA.howToFixIt.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {JOURNEY_DATA.howToFixIt.steps.map((s) => (
                  <div
                    key={s.step}
                    className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-3 relative overflow-hidden"
                  >
                    <span className="text-4xl font-extrabold font-heading text-neutral-100 absolute top-4 right-4 pointer-events-none">
                      {s.step}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 font-mono">Step {s.step}</span>
                    <h4 className="text-base font-bold text-neutral-900">{s.title}</h4>
                    <p className="text-xs text-neutral-600 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: THE SOLUTIONS */}
          {journeyTab === 'solutions' && (
            <div className="bg-[#fafbfc] border border-neutral-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-12 space-y-8 sm:space-y-10 animate-fadeIn">
              <div className="max-w-3xl space-y-2">
                <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase font-mono">
                  {JOURNEY_DATA.solutions.badge}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold font-heading text-neutral-900">
                  {JOURNEY_DATA.solutions.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {JOURNEY_DATA.solutions.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {JOURNEY_DATA.solutions.items.map((item) => (
                  <div
                    key={item.title}
                    className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs flex items-start space-x-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                      <Check className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-base font-bold text-neutral-900">{item.title}</h4>
                      <p className="text-xs text-neutral-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: HOW THIS APP SOLVES IT */}
          {journeyTab === 'howAppSolves' && (
            <div className="bg-[#fafbfc] border border-neutral-300 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-12 space-y-6 sm:space-y-8 animate-fadeIn shadow-sm">
              <div className="max-w-3xl space-y-2">
                <span className="text-xs font-bold text-emerald-800 tracking-wider uppercase font-mono bg-emerald-100/70 px-2.5 py-0.5 rounded">
                  LIVE INTERACTIVE APPLICATION DEMO
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold font-heading text-neutral-900">
                  How Zero waste by Supritamone Solves Kitchen Waste in Seconds
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Select a common commercial scrap or zero waste byproduct item below to experience how
                  the application detects it, matches it with verified recipes, and protects your
                  margins.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {[
                  { id: 'bread' as const, label: 'Stale Sourdough & Bakery' },
                  { id: 'stalks' as const, label: 'Broccoli & Brassica Stems' },
                  { id: 'citrus' as const, label: 'Citrus Peels & Bar Residuals' },
                  { id: 'buffet' as const, label: 'Unserved Banquet Mains' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setDemoItem(opt.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      demoItem === opt.id
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-white text-neutral-700 border border-neutral-300 hover:border-black'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
                  <div>
                    <span className="text-xs font-mono font-bold text-neutral-500 uppercase">
                      Station: {activeScenario.station}
                    </span>
                    <h4 className="text-xl font-bold font-heading text-neutral-900 mt-0.5">
                      {activeScenario.name}
                    </h4>
                    <p className="text-xs text-red-700 font-medium mt-1">
                      Typical Loss: {activeScenario.problemReason}
                    </p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl px-4 py-2 text-right shrink-0">
                    <span className="text-[10px] text-emerald-800 font-bold uppercase block">
                      Recovered Margin
                    </span>
                    <span className="text-lg font-bold font-mono text-emerald-700">
                      {activeScenario.marginBoost}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-neutral-900 font-bold">
                      <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px]">
                        1
                      </span>
                      <span>Inventory Tracking</span>
                    </div>
                    <p className="text-neutral-600 leading-relaxed">
                      Cook logs batch ({activeScenario.quantity}). Freshness countdown warns before
                      staling occurs.
                    </p>
                  </div>

                  <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-900 font-bold">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                        2
                      </span>
                      <span>Algorithm Recipe Match</span>
                    </div>
                    <p className="text-emerald-800 font-medium">{activeScenario.appAction}</p>
                    <p className="text-[11px] text-neutral-600 leading-relaxed">
                      {activeScenario.upcycleOutcome}
                    </p>
                  </div>

                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-neutral-900 font-bold">
                      <span className="w-5 h-5 rounded-full bg-neutral-700 text-white flex items-center justify-center text-[10px]">
                        3
                      </span>
                      <span>Community Dispatch</span>
                    </div>
                    <p className="text-neutral-600 leading-relaxed">
                      {activeScenario.communityAlternative}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <button
                    onClick={onOpenLibrary}
                    className="px-4 py-2 rounded-lg border border-neutral-300 hover:border-black text-xs font-semibold text-neutral-800 cursor-pointer transition-colors"
                  >
                    View Matching Recipes →
                  </button>
                  <button
                    onClick={() => onOpenSection('waste-calculator')}
                    className="px-4 py-2 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    Open Live Waste Calculator →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 5: WHAT WILL YOU LEARN INSIDE ZERO WASTE? (image_7cd6bd7b.png) */}
      <section className="py-16 sm:py-24 bg-white border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-neutral-900 tracking-tight">
              What will you learn inside ZERO WASTE?
            </h2>
          </div>

          <div className="space-y-16">
            {/* Row 1: How to get started */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 space-y-3">
                <h3 className="text-2xl font-bold font-heading text-neutral-900">
                  How to get started
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Learn the easiest ways to reduce food waste and understand the simplest systems for
                  food waste prevention.
                </p>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Change the way you think about food waste and turn zero-waste into your standard
                  approach.
                </p>
              </div>
              <div className="lg:col-span-6 bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div
                    onClick={() => onOpenSection('start-here')}
                    className="p-4 bg-neutral-50 hover:bg-neutral-100/80 rounded-xl cursor-pointer transition-colors"
                  >
                    <span className="font-bold text-black block mb-1">48-Hour Bin Audit</span>
                    <span className="text-neutral-500">
                      Weigh and categorize prep trimmings on your line.
                    </span>
                  </div>
                  <div
                    onClick={() => onOpenSection('prep-waste')}
                    className="p-4 bg-neutral-50 hover:bg-neutral-100/80 rounded-xl cursor-pointer transition-colors"
                  >
                    <span className="font-bold text-black block mb-1">Brigade Muscle Memory</span>
                    <span className="text-neutral-500">
                      Train junior cooks on root-to-leaf prep habits.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: How to create zero-waste recipes */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 order-2 lg:order-1 bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs">
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100">
                    <span className="font-bold text-neutral-900">Broccoli Stalk Carpaccio</span>
                    <span className="text-emerald-700 font-bold">+100% yield</span>
                  </div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100">
                    <span className="font-bold text-neutral-900">Charred Onion Skin Dashi</span>
                    <span className="text-emerald-700 font-bold">Zero-cost umami broth</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900">Stale Sourdough Miso</span>
                    <span className="text-emerald-700 font-bold">Fermented pastry caramel</span>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-6 order-1 lg:order-2 space-y-3">
                <h3 className="text-2xl font-bold font-heading text-neutral-900">
                  How to create zero-waste recipes
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Running out of ideas? Find recipes and upcycling tips for every byproduct in the
                  recipe library.
                </p>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Learn simple tricks to create zero-waste recipes and find out the secret behind
                  effortless zero-waste cooking. Easy-to-replicate recipes for every operation.
                </p>
                <div className="pt-1">
                  <button
                    onClick={onOpenLibrary}
                    className="text-xs font-bold text-black underline hover:text-neutral-600 cursor-pointer"
                  >
                    Browse all 60+ recipes →
                  </button>
                </div>
              </div>
            </div>

            {/* Row 3: How to engineer a circular menu */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 space-y-3">
                <h3 className="text-2xl font-bold font-heading text-neutral-900">
                  How to engineer a circular menu
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Learn the systems behind creating a circular menu and understand how to prevent
                  food waste during menu development.
                </p>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Get inspired by a sample zero-waste menu and dive-deep into circular menu
                  engineering.
                </p>
              </div>
              <div className="lg:col-span-6 bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs">
                <div
                  onClick={() => onOpenCourse(masterCourseId)}
                  className="bg-neutral-950 hover:bg-black text-white rounded-xl p-5 space-y-1.5 cursor-pointer transition-colors"
                >
                  <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400 font-mono block">
                    CROSS-STATION MATRIX
                  </span>
                  <h4 className="font-bold text-sm text-white">
                    Prep Trimmings from Station A become finishing sauces for Station B.
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Never design an entrée without designing a home for its byproduct.
                  </p>
                </div>
              </div>
            </div>

            {/* Row 4: Make the most of every ingredient */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 order-2 lg:order-1 bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
                  <button
                    onClick={onOpenLibrary}
                    className="p-3 bg-neutral-50 border border-neutral-200/80 hover:border-black rounded-xl transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-neutral-900 block">Pineapple</span>
                    <span className="text-[11px] text-neutral-500">Tepache &amp; syrups</span>
                  </button>
                  <button
                    onClick={onOpenLibrary}
                    className="p-3 bg-neutral-50 border border-neutral-200/80 hover:border-black rounded-xl transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-neutral-900 block">Cauliflower</span>
                    <span className="text-[11px] text-neutral-500">Pickled core crisps</span>
                  </button>
                  <button
                    onClick={onOpenLibrary}
                    className="p-3 bg-neutral-50 border border-neutral-200/80 hover:border-black rounded-xl transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-neutral-900 block">Herb Stems</span>
                    <span className="text-[11px] text-neutral-500">Chlorophyll oil</span>
                  </button>
                </div>
              </div>
              <div className="lg:col-span-6 order-1 lg:order-2 space-y-3">
                <h3 className="text-2xl font-bold font-heading text-neutral-900">
                  Make the most of every ingredient
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Not sure how to use a certain byproduct?
                </p>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Find quick solutions in the searchable catalogue of byproducts and stop putting
                  your money in the bin. Easy solutions applicable to every operation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: 3 TESTIMONIAL CARDS (image_c3f102d4.png) */}
      <section className="py-16 sm:py-24 bg-white border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-neutral-200 rounded-2xl p-6 space-y-3 bg-white">
              <div className="flex space-x-1 text-amber-400">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <Star key={idx} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed italic">
                &ldquo;A practical and user-friendly resource that promotes best practices, creativity,
                cost efficiency, and better utilisation of trimmings and food waste.&rdquo;
              </p>
              <p className="text-[11px] font-semibold text-neutral-500 pt-2 border-t border-neutral-100">
                — Executive Chef, 5-star resort
              </p>
            </div>

            <div className="border border-neutral-200 rounded-2xl p-6 space-y-3 bg-white">
              <div className="flex space-x-1 text-amber-400">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <Star key={idx} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed italic">
                &ldquo;A valuable tool that encourages creativity, cost efficiency, and better
                utilisation of food products while reducing waste.&rdquo;
              </p>
              <p className="text-[11px] font-semibold text-neutral-500 pt-2 border-t border-neutral-100">
                — Corporate Chef, hotel group
              </p>
            </div>

            <div className="border border-neutral-200 rounded-2xl p-6 space-y-3 bg-white">
              <div className="flex space-x-1 text-amber-400">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <Star key={idx} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed italic">
                &ldquo;Very user-friendly, easy to use, and the videos are brief and informative.
                Recipes and posters are now being used in our kitchen&rdquo;
              </p>
              <p className="text-[11px] font-semibold text-neutral-500 pt-2 border-t border-neutral-100">
                — Executive Chef, 5-star hotel
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6.5: PRICING & 3-DAY FREE TRIAL (Exact zerowaste.supritamone.com section) */}
      <section className="py-16 sm:py-24 bg-[#fafbfc] border-t border-neutral-100" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              3-DAY FREE TRIAL METHOD AVAILABLE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-neutral-900 tracking-tight">
              One membership. Flexible options.
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              Transparent pricing in USD ($). Test with a 3-Day Free Trial or choose an annual
              kitchen brigade subscription.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">
            {HOME_PRICING_PLANS.map((plan) => {
              const isPopular = Boolean(plan.highlighted);
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-6 flex flex-col justify-between transition-all ${
                    isPopular
                      ? 'bg-neutral-950 text-white border-2 border-black shadow-2xl'
                      : 'bg-white text-neutral-900 border border-neutral-200 hover:border-black'
                  }`}
                >
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 min-h-[24px]">
                        <h3 className={`text-lg font-extrabold font-heading ${isPopular ? 'text-white' : 'text-neutral-900'}`}>
                          {plan.title}
                        </h3>
                        {plan.badge && (
                          <span
                            className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                              plan.isTrial
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : isPopular
                                  ? 'bg-emerald-500 text-black'
                                  : 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                            }`}
                          >
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs leading-relaxed ${isPopular ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        {plan.description}
                      </p>
                    </div>

                    <div className={`pb-4 border-b ${isPopular ? 'border-neutral-800' : 'border-neutral-100'}`}>
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-4xl font-black font-heading tracking-tight ${isPopular ? 'text-white' : 'text-black'}`}>
                          {plan.price}
                        </span>
                        <span className={`text-xs font-bold uppercase ${isPopular ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          USD
                        </span>
                      </div>
                      <span className={`text-xs block mt-0.5 ${isPopular ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        {plan.cadence}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <p className={`text-xs font-bold ${isPopular ? 'text-neutral-200' : 'text-neutral-800'}`}>
                        What&apos;s included:
                      </p>
                      <ul className="space-y-2">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs leading-snug">
                            <Check
                              className={`w-4 h-4 shrink-0 mt-0.5 ${
                                isPopular ? 'text-emerald-400' : 'text-emerald-600'
                              }`}
                            />
                            <span className={isPopular ? 'text-neutral-300' : 'text-neutral-600'}>
                              {feat}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => {
                        if (onSelectPlan) {
                          onSelectPlan(plan.id);
                        } else {
                          onOpenCourse(masterCourseId);
                        }
                      }}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                        isPopular
                          ? 'bg-white hover:bg-neutral-200 text-black'
                          : 'bg-black hover:bg-neutral-800 text-white'
                      }`}
                    >
                      {plan.buttonText}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 7: ABOUT DR. SUPRITAM BASU */}
      <section className="py-16 sm:py-20 bg-[#fafbfc] border-t border-neutral-200" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                Founder &amp; Executive Culinary Mentor
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-neutral-900 tracking-tight">
                About Dr. Chef Supritam Basu
              </h2>
              <div className="space-y-3 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                <p>
                  With <strong>14+ years of five-star hospitality mastery</strong> across{' '}
                  <strong>Taj Hotels, JW Marriott Marquis Dubai, The St. Regis Doha, Anantara Salalah,</strong>{' '}
                  and <strong>Sheraton Grand Hotel, Dubai</strong>, Dr. Chef Supritam Basu has led culinary
                  brigades of 35+ chefs across India, UAE, Qatar, Oman, Singapore, South Africa, and South Korea.
                </p>
                <p>
                  An international medalist, published author (<em>Does the Mind Shape Reality?</em> &amp;{' '}
                  <em>Forgotten Flavours of Bengal</em>), and NISM-certified capital market professional, Dr. Basu
                  founded <strong>Zero Waste Academy</strong> on three pillars:{' '}
                  <em>Innovation with Integrity, Mentorship with Meaning,</em> and{' '}
                  <em>Preservation with Passion</em>.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setShowAboutModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <span>Read Full Biography — About Dr. Supritam Basu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 flex justify-center">
              <div
                onClick={() => setShowAboutModal(true)}
                className="relative rounded-2xl overflow-hidden border border-neutral-200 shadow-lg max-w-md w-full bg-white cursor-pointer group"
                title="Click to read Dr. Chef Supritam Basu's full story"
              >
                <img
                  src="/assets/aistudio/Untitled_design_0fea8cc4.png"
                  alt="Dr. Chef Supritam Basu — Founder, Zero Waste Academy"
                  className="w-full h-96 object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
                />
                <div className="absolute bottom-3 left-3 bg-black/85 backdrop-blur-xs text-white px-3.5 py-1.5 rounded-lg text-xs font-mono">
                  Dr. Chef Supritam Basu • Zero Waste Academy
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: FREQUENTLY ASKED QUESTIONS (image_677d7364.png) */}
      <section className="py-16 sm:py-24 bg-[#fafbfc] border-t border-neutral-200/60" id="faq">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-neutral-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-5 space-y-4">
                <h2 className="text-3xl sm:text-4xl font-bold font-heading text-neutral-900 tracking-tight leading-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-sm text-neutral-500 leading-relaxed max-w-sm">
                  Still have questions? Take a look at the FAQ or reach out anytime.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setContactSubmitted(false);
                      setShowContactModal(true);
                    }}
                    className="px-8 py-3.5 rounded-lg bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    CONTACT ME
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 divide-y divide-neutral-200 border-t border-neutral-200">
                {FAQ_ITEMS.map((item, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={item.question} className="py-4 transition-colors">
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between text-left py-1 group focus:outline-none cursor-pointer"
                        aria-expanded={isOpen}
                      >
                        <span
                          className={`text-sm sm:text-base pr-4 transition-colors ${
                            isOpen
                              ? 'text-black font-bold'
                              : 'text-neutral-800 font-semibold group-hover:text-black'
                          }`}
                        >
                          {item.question}
                        </span>
                        <span className="shrink-0 text-neutral-500 group-hover:text-black">
                          {isOpen ? (
                            <Minus className="w-4 h-4 stroke-[2.5]" />
                          ) : (
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          )}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="pt-3 pb-2 text-xs sm:text-sm text-neutral-600 leading-relaxed animate-fadeIn">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: MINIMAL DARK BOTTOM CTA BANNER */}
      <section className="py-14 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold font-heading">
              Take the first step towards food waste prevention. Get in touch today.
            </h3>
            <p className="text-xs text-neutral-400">
              Zero waste by Supritamone • Custom brigade training and kitchen audits worldwide.
            </p>
          </div>
          <button
            onClick={() => {
              setContactSubmitted(false);
              setShowContactModal(true);
            }}
            className="px-8 py-3.5 rounded-lg bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-100 whitespace-nowrap active:scale-95 cursor-pointer"
          >
            Get in touch
          </button>
        </div>
      </section>

      {/* SECTION 10: ACCREDITED FOOTER (image_cfcead17.png) */}
      <footer className="bg-white border-t border-neutral-200 pt-10 pb-8 text-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-6 border-b border-neutral-100 items-start">
            <div className="md:col-span-5 space-y-3">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center space-x-3 text-left cursor-pointer focus:outline-none"
                title="Back to top · Zero waste by Supritamone"
              >
                <SupritamoneLogo size="md" />
                <span className="border-l border-neutral-300 pl-3 text-xs font-semibold text-neutral-800">
                  Zero waste by Supritamone
                </span>
              </button>
              <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
                Zero waste by Supritamone • The culinary learning platform, byproduct catalogue, and live
                inventory &amp; community alert suite for chefs.
              </p>
            </div>

            <div className="md:col-span-4 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-neutral-600">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-left hover:text-black cursor-pointer"
              >
                ZERO WASTE App
              </button>
              <button
                onClick={() => scrollToElement('problem-solution')}
                className="text-left hover:text-black cursor-pointer"
              >
                Problem &amp; Solution
              </button>
              <button
                onClick={() => onOpenSection('waste-calculator')}
                className="text-left hover:text-black cursor-pointer"
              >
                Live Dashboard
              </button>
              <button
                onClick={onOpenLibrary}
                className="text-left hover:text-black cursor-pointer"
              >
                Recipes
              </button>
              <button
                onClick={() => scrollToElement('faq')}
                className="text-left hover:text-black cursor-pointer"
              >
                FAQ
              </button>
              <button
                onClick={() => setShowAboutModal(true)}
                className="text-left hover:text-black font-semibold cursor-pointer"
              >
                About Dr. Supritam Basu
              </button>
              <button
                onClick={() => {
                  setContactSubmitted(false);
                  setShowContactModal(true);
                }}
                className="text-left hover:text-black font-semibold cursor-pointer"
              >
                Contact
              </button>
              {onOpenAdminPortal && (
                <button
                  onClick={onOpenAdminPortal}
                  className="text-left hover:text-black font-semibold text-neutral-700 cursor-pointer"
                >
                  Admin Portal
                </button>
              )}
            </div>

            <div className="md:col-span-3 flex flex-col md:items-end gap-2">
              <div className="flex flex-wrap md:justify-end gap-x-4 gap-y-1 text-[11px] text-neutral-600 font-medium">
                <button
                  onClick={() => setActiveLegalPolicy('terms')}
                  className="hover:text-black hover:underline cursor-pointer"
                >
                  Terms &amp; Conditions
                </button>
                <button
                  onClick={() => setActiveLegalPolicy('cookie')}
                  className="hover:text-black hover:underline cursor-pointer"
                >
                  Cookie Policy
                </button>
                <button
                  onClick={() => setActiveLegalPolicy('privacy')}
                  className="hover:text-black hover:underline cursor-pointer"
                >
                  Privacy Policy
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 md:text-right">
                <span className="font-semibold text-neutral-800">Dr. Supritam Basu</span> ·{' '}
                <a
                  href="mailto:supritam.basu@supritamone.com"
                  className="hover:text-black underline"
                >
                  supritam.basu@supritamone.com
                </a>
              </p>
            </div>
          </div>

          {/* Accredited Quality & Professional Standards Badges (image_cfcead17.png) */}
          <div className="py-4 border-b border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-[11px] font-bold text-neutral-900 uppercase tracking-wider">
                ACCREDITED QUALITY &amp; PROFESSIONAL STANDARDS
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                ISO 9001:2015 Quality Management Certified • CPD Certified Commercial Culinary Training •
                MSME Registered Enterprise
              </p>
            </div>

            <div className="flex items-center flex-wrap sm:flex-nowrap justify-center md:justify-end gap-3 shrink-0">
              <div className="bg-white px-3 py-2 rounded-xl border border-neutral-200 shadow-2xs hover:border-neutral-300 transition-all flex items-center justify-center shrink-0">
                <img
                  src={iso9001Logo}
                  alt="ISO 9001:2015 Certified"
                  loading="lazy"
                  decoding="async"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </div>
              <a
                href="https://thecpdregister.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white px-3 py-2 rounded-xl border border-neutral-200 shadow-2xs hover:border-neutral-400 transition-all flex items-center justify-center shrink-0"
                title="Verify CPD Approved Provider #791463 on thecpdregister.com"
              >
                <img
                  src={cpdProviderLogo}
                  alt="The CPD Group Approved Provider #791463"
                  loading="lazy"
                  decoding="async"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </a>
              <div
                className="bg-white px-3 py-2 rounded-xl border border-neutral-200 shadow-2xs hover:border-neutral-300 transition-all flex items-center justify-center shrink-0"
                title="MSME - Micro, Small & Medium Enterprises Registered"
              >
                <img
                  src={msmeOfficialLogo}
                  alt="MSME - Micro, Small & Medium Enterprises"
                  loading="lazy"
                  decoding="async"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-400">
            <span>
              © {new Date().getFullYear()} Zero Waste Academy by Dr. Supritam Basu (Supritamone). All rights reserved.
            </span>
            <span className="font-mono">
              Contact:{' '}
              <a href="mailto:supritam.basu@supritamone.com" className="text-neutral-600 hover:text-black underline">
                supritam.basu@supritamone.com
              </a>
            </span>
          </div>
        </div>
      </footer>

      {/* Contact / Inquiry Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 bg-black text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm">Contact Supritamone Academy</h3>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                aria-label="Close contact dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Direct Executive Email
                </p>
                <a
                  href="mailto:supritam.basu@supritamone.com"
                  className="text-sm font-bold text-black underline break-all"
                >
                  supritam.basu@supritamone.com
                </a>
              </div>

              {contactSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1.5">
                  <p className="font-bold">Inquiry Logged</p>
                  <p className="text-emerald-800">
                    Thank you! Dr. Chef Supritam Basu&apos;s team will respond via{' '}
                    <strong>supritam.basu@supritamone.com</strong>.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setContactSubmitted(true);
                  }}
                  className="space-y-3"
                >
                  <input
                    type="text"
                    required
                    placeholder="Chef / Hospitality Operation Name"
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-black"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Your Work Email"
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-black"
                  />
                  <textarea
                    rows={3}
                    required
                    placeholder="How can we help your culinary brigade reduce food waste?"
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-black"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Send Inquiry</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              <button
                onClick={() => {
                  setShowContactModal(false);
                  onOpenSection('ask-dr-basu');
                }}
                className="w-full py-2 rounded-xl border border-neutral-200 hover:border-black text-neutral-700 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask Dr. Chef Basu in Community</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Terms & Conditions, Cookie Policy, and Privacy Policy Modal */}
      {activeLegalPolicy && (
        <Suspense fallback={null}>
          <LegalPolicyModal
            activePolicy={activeLegalPolicy}
            onSelectPolicy={(policy) => setActiveLegalPolicy(policy)}
            onClose={() => {
              setActiveLegalPolicy(null);
              if (
                typeof window !== 'undefined' &&
                /\/(terms-conditions|cookie-policy|privacy-policy)/i.test(window.location.pathname)
              ) {
                window.history.replaceState({}, '', '/');
              }
            }}
          />
        </Suspense>
      )}
      {/* About Dr. Supritam Basu Popup Modal */}
      {showAboutModal && (
        <Suspense fallback={null}>
          <AboutDrBasuModal
            isOpen={showAboutModal}
            onClose={() => setShowAboutModal(false)}
          />
        </Suspense>
      )}
    </div>
  );
};
