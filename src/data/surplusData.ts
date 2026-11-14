import heroSustainableKitchenImg from '../assets/images/hero_sustainable_kitchen_1793976158274.jpg';
import rootToStemPrepImg from '../assets/images/root_to_stem_prep_1793976158854.jpg';
import artisanBreadRicottaImg from '../assets/images/artisan_bread_ricotta_1793976160643.jpg';
import fermentationCrockImg from '../assets/images/fermentation_crock_station_1793976159601.jpg';
import boneBrothPotImg from '../assets/images/bone_broth_pot_1793976160130.jpg';

export {
  heroSustainableKitchenImg,
  rootToStemPrepImg,
  artisanBreadRicottaImg,
  fermentationCrockImg,
  boneBrothPotImg
};

export interface SurplusCourse {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  duration: string;
  lessonCount: number;
  progressPercent: number;
  coverImage: string;
  isMasterCourse?: boolean;
  instructor: string;
  instructorCredentials: string;
  newsletterRange?: string;
  lessons?: {
    id: string;
    title: string;
    duration: string;
    isCompleted?: boolean;
    newsletterRef?: string;
    description?: string;
    scientificConcept?: string;
    culinaryFormula?: string;
  }[];
}

export interface ByproductItem {
  id: string;
  name: string;
  category: 'Fruit' | 'Vegetables' | 'Bakery' | 'Beverage & Dairy' | 'Proteins';
  image: string;
  headline: string;
  weightWasteStatistic: string;
  potentialByproducts: string[];
  easyTip: string;
  culinaryApplications: string[];
  scientificMechanism: string;
  linkedRecipes: string[];
  pdfDownloadName: string;
  pdfFileSize: string;
}

export interface ZeroWasteRecipe {
  id: string;
  title: string;
  category: string;
  prepTime: string;
  cookTime: string;
  yieldAmount: string;
  mainByproduct: string;
  image: string;
  ingredients: { amount: string; item: string }[];
  method: string[];
  chefTips: string;
  scientificNote: string;
  likes: number;
  commentsCount: number;
  pdfAttachment: {
    filename: string;
    size: string;
  };
}

export interface CommunityQuestion {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  datePosted: string;
  question: string;
  category: string;
  likes: number;
  answeredByDrBasu: boolean;
  reply?: {
    author: string;
    role: string;
    avatar: string;
    text: string;
    date: string;
  };
}

export interface MonthlyRecording {
  id: string;
  title: string;
  date: string;
  duration: string;
  posterImage: string;
  description: string;
  instructor: string;
  featuredQuestions: string[];
  keyTakeaways: string[];
}

export interface QuickWinGuide {
  id: string;
  title: string;
  iconName: string;
  summary: string;
  estimatedSaving: string;
  keySteps: { step: number; title: string; detail: string }[];
  checklists: string[];
  chefRule: string;
}

// -------------------------------------------------------------
// ADVANCED LEVEL COURSES SYNTHESIZED FROM 252 NEWSLETTERS
// Author: Dr. Chef Supritam Basu, PhD, CEC
// -------------------------------------------------------------
export const surplusCourses: SurplusCourse[] = [
  {
    id: 'food-waste-prevention-chefs',
    title: 'The Zero Waste Kitchen: Master Chef Diploma (Issues #1–#252)',
    subtitle: 'The comprehensive 12-Section (24-Chapter) master curriculum synthesized from all 252 issues of "The Zero Waste Kitchen" publication series by Dr. Chef Supritam Basu, PhD, CEC. Covers biochemical waste auditing, cellular root-to-stem butchery, collagen scrap extraction, wild scrap fermentation, and circular menu engineering.',
    badge: 'Executive Master Diploma',
    duration: '26h 00m · 24 Chapters',
    lessonCount: 24,
    progressPercent: 14,
    coverImage: heroSustainableKitchenImg,
    isMasterCourse: true,
    instructor: 'Dr. Chef Supritam Basu',
    instructorCredentials: 'PhD in Culinary Science & Food Sustainability, CEC',
    newsletterRange: 'Issues #1 – #252',
    lessons: [
      {
        id: 'm1',
        title: 'Module 1: Biochemical Waste Auditing, Landfill Methane Methanogenesis & Mass-Balance Analysis',
        duration: '2h 10m',
        newsletterRef: 'Issues #1 – #20',
        description: 'Quantifying avoidable vs unavoidable kitchen waste streams, anaerobic microbial decomposition kinetics in municipal landfills, and implementing a 7-day tare-weighted station separation audit.',
        scientificConcept: 'Anaerobic methanogenesis by Archaea produces CH4 with 28x the GWP of CO2.',
        culinaryFormula: 'Mass Balance: W_raw = W_yield + W_trim + W_evap'
      },
      {
        id: 'm2',
        title: 'Module 2: Advanced Vegetable Butchery & Cellular Root-to-Stem Architecture',
        duration: '2h 10m',
        newsletterRef: 'Issues #21 – #42',
        description: 'Pectin demethoxylation, cellulose tenderization in brassica stems, chlorophyll pigment stabilization via rapid blanch-shock cycles, and allium sheath extraction.',
        scientificConcept: 'Thermal enzyme deactivation at 85°C halts chlorophyllase degradation.',
        culinaryFormula: 'Pectin Methyl Esterase (PME) Activation: 55°C–65°C for 25 min'
      },
      {
        id: 'm3',
        title: 'Module 3: Precision Nose-to-Tail Butchery, Collagen Hydrolysis & Scrap Stock Science',
        duration: '2h 10m',
        newsletterRef: 'Issues #43 – #64',
        description: 'Hydrolyzing type I & III collagen from carcass trimmings, roasting maillard kinetics at 165°C, gelatin concentration, and clarified scrap consommés.',
        scientificConcept: 'Triple-helix collagen denaturation into soluble gelatin occurs between 60°C and 70°C.',
        culinaryFormula: 'Consommé Ratio: 1000g Scrap Stock : 250g Trim Albumen Mass'
      },
      {
        id: 'm4',
        title: 'Module 4: Commercial Yield Analytics, Station Logistics & Mid-Term Auditing Exam',
        duration: '2h 10m',
        newsletterRef: 'Issues #65 – #85',
        description: 'Standardized operational procedures for line-cook scrap separation, knife yield tests, food-cost variance tracking, and practical station inspection rubrics.',
        scientificConcept: 'Yield variance coefficient across knife angles and dull blade bevels.',
        culinaryFormula: 'True Food Cost = Purchase Price / (Edible Portion Yield %)'
      },
      {
        id: 'm5',
        title: 'Module 5: Microbial Upcycling: Wild Lacto-Fermentation, Koji Inoculation & Garums',
        duration: '2h 10m',
        newsletterRef: 'Issues #86 – #110',
        description: 'Employing homofermentative lactic acid bacteria (Leuconostoc, Lactobacillus) in 2.5% saline scrap brines, fungal Aspergillus oryzae proteolysis, and enzymatic scrap amino sauces.',
        scientificConcept: 'Rapid acidification to pH < 4.2 inhibits Clostridium botulinum and pathogenic spoilage.',
        culinaryFormula: 'Saline Formulation: Total Mass (Scraps + H2O) × 0.025 = g NaCl'
      },
      {
        id: 'm6',
        title: 'Module 6: Thermal Preservation: Dehydration, Lyophilization, Maillard Powders & Oleo Saccharums',
        duration: '2h 10m',
        newsletterRef: 'Issues #111 – #132',
        description: 'Water activity (Aw) reduction below 0.60, non-enzymatic browning of vegetable skins, osmotic pressure sugar extraction of citrus essential oils, and savory finishing ashes.',
        scientificConcept: 'Osmotic extraction ruptures oil glands in citrus flavedo without thermal degradation.',
        culinaryFormula: 'Oleo Saccharum: 1.0 Part Citrus Flavedo : 1.0 Part Sucrose (12h ambient)'
      },
      {
        id: 'm7',
        title: 'Module 7: Starch Retrogradation & Ancient Bakery Revitalization: Kvas, Emulsion Sauces & Pangrattato',
        duration: '2h 10m',
        newsletterRef: 'Issues #133 – #155',
        description: 'Amylose and amylopectin recrystallization chemistry in stale bread, thermal gelatinization, high-shear mechanical emulsification of croissant butter, and wild kvas beverage fermentation.',
        scientificConcept: 'Laminated croissant butter (82% fat) + retrograded starches form stable velvet emulsions.',
        culinaryFormula: 'Croissant Sauce: 320g Infused Dairy : 80g Deeply Toasted Viennoiserie'
      },
      {
        id: 'm8',
        title: 'Module 8: Biochemical Acid & Enzyme Formulation: Scrap Vinegars & Clarified Consommés',
        duration: '2h 10m',
        newsletterRef: 'Issues #156 – #178',
        description: 'Acetobacter aceti ethanol oxidation kinetics, mother-of-vinegar cultivation from fruit cores, freeze-thaw syneresis clarification, and pectinase enzyme digestive washes.',
        scientificConcept: 'Two-stage fermentation: Saccharomyces yeast anaerobic ethanol conversion followed by aerobic acetic acid bacteria.',
        culinaryFormula: 'Acid Conversion: C2H5OH + O2 -> CH3COOH + H2O'
      },
      {
        id: 'm9',
        title: 'Module 9: Dairy Byproduct Reclamation: Whey Proteins, Cultured Buttermilks & Acid Clots',
        duration: '2h 10m',
        newsletterRef: 'Issues #179 – #200',
        description: 'Casein micelle coagulation kinetics, utilizing liquid sweet and acid whey in culinary glazes, lacto-fermented butter washes, and scrap ricotta from curdling trim.',
        scientificConcept: 'Isoelectric precipitation of casein proteins at pH 4.6.',
        culinaryFormula: 'Whey Glaze Reduction: 1000ml Acid Whey reduced 85% to viscous glaze'
      },
      {
        id: 'm10',
        title: 'Module 10: Circular Menu Engineering: Dynamic Sinks, Mass-Balance Forecasting & Kitchen Ergonomics',
        duration: '2h 10m',
        newsletterRef: 'Issues #201 – #222',
        description: 'Developing the Input/Output Recipe Matrix where primary dish byproducts immediately serve as input ingredients for larder, pastry, and bar stations.',
        scientificConcept: 'Zero-waste circular ergonomics minimizes cross-station waste hauling.',
        culinaryFormula: 'Circular Index = (Byproduct Mass Reincorporated / Total Raw Byproduct Mass) × 100'
      },
      {
        id: 'm11',
        title: 'Module 11: Enterprise Food Waste Mitigation at Scale: Banquets, Hotels & Cruise Systems',
        duration: '2h 10m',
        newsletterRef: 'Issues #223 – #242',
        description: 'Buffet display geometry, shallow GN insert thermodynamics, live-cooking station replenishment rhythms, blast-chilling HACCP compliance, and commercial waste diversion ROI.',
        scientificConcept: 'Surface-area-to-volume ratio in shallow GN pans preserves heat while cutting batch exposure.',
        culinaryFormula: 'Buffet Waste Index = (Unserved Hold Weight / Total Cooked Batch Weight) × 100'
      },
      {
        id: 'm12',
        title: 'Module 12: Executive Capstone, HACCP Compliance for Upcycled Byproducts & Final Examination',
        duration: '2h 10m',
        newsletterRef: 'Issues #243 – #252',
        description: 'Comprehensive regulatory validation for commercial upcycled foods, critical control point (CCP) hazard analysis, kitchen culture leadership, and the final examination.',
        scientificConcept: 'HACCP critical limit verification for ambient and cold fermented kitchen scraps.',
        culinaryFormula: 'Certification Requirement: >= 37% overall exam score to unlock certificate'
      }
    ]
  },
  {
    id: 'how-to-reduce-prep-waste',
    title: 'Course 1: Commercial Prep Yield Optimization & Cellular Root-to-Stem Butchery',
    subtitle: 'Learn how to eliminate 50% of station prep waste through blade bevel mechanics, cellular tissue yield testing, and 3-tier trim station separation. Synthesized from Issues #15 to #45 of "The Zero Waste Kitchen".',
    badge: 'Master Culinary Skills · Level 6',
    duration: '2.5 hours · 7 Modules',
    lessonCount: 7,
    progressPercent: 25,
    coverImage: rootToStemPrepImg,
    instructor: 'Dr. Chef Supritam Basu',
    instructorCredentials: 'PhD in Culinary Science & Food Sustainability, CEC',
    newsletterRange: 'Issues #15 – #45',
    lessons: [
      {
        id: 'pw-1',
        title: 'Module 1: Knife Mechanics, Single-Bevel Blades & Cutting Angle Precision',
        duration: '18 min',
        newsletterRef: 'Issues #15 – #18',
        description: 'How blade sharpness and ergonomic single-bevel Japanese knife geometry recover up to 18% more usable edible tissue compared to dull European chef knives.',
        scientificConcept: 'Cellular crush vs shear stress across vegetable plant parenchyma cells.',
        culinaryFormula: 'Blade Yield Variance: V_knife = (Weight Edible Slice / Total Weight Trimmed) × 100'
      },
      {
        id: 'pw-2',
        title: 'Module 2: The 3-Tier Station Separation Setup: Stocks, Powders & Ferments',
        duration: '20 min',
        newsletterRef: 'Issues #19 – #22',
        description: 'Configuring color-coded tare-weighted station containers: White for stock bones, Green for pure vegetable ferments, Blue for dehydration finishing dusts.',
        scientificConcept: 'Cross-contamination microbial prevention and enzymatic oxidation separation.',
        culinaryFormula: 'Station Efficiency: T_separation <= 15 seconds per prep kilogram'
      },
      {
        id: 'pw-3',
        title: 'Module 3: Cellular Vegetable Yield: The 18% Gain of Stiff Bristle Scrubbing',
        duration: '22 min',
        newsletterRef: 'Issues #23 – #27',
        description: 'Eliminating the need to peel organic root vegetables (carrots, parsnips, sunchokes) by using stiff nylon bristle scrubbing in cold aerated water baths.',
        scientificConcept: 'Epidermal periderm layers contain highest concentrations of polyphenols and carotenoids.',
        culinaryFormula: 'Peel Retention Gain: 180g edible biomass saved per 1kg case of roots'
      },
      {
        id: 'pw-4',
        title: 'Module 4: Citrus Flavedo & Core Extraction: The Cold Osmotic Oleo Protocol',
        duration: '18 min',
        newsletterRef: 'Issues #28 – #33',
        description: 'Extracting cold-pressed aromatic limonene essential oils from squeezed bar and kitchen citrus peels using 1:1 hygroscopic sucrose maceration.',
        scientificConcept: 'Osmotic hydrostatic pressure ruptures oil glands in flavedo without thermal oxidation.',
        culinaryFormula: 'Oleo Ratio: 500g Citrus Peels + 500g Caster Sugar (12h ambient rest)'
      },
      {
        id: 'pw-5',
        title: 'Module 5: Animal Protein & Fish Scrap Sinks: Bone & Trimming Valorization',
        duration: '24 min',
        newsletterRef: 'Issues #34 – #38',
        description: 'Managing meat scrap bins and establishing the 25-minute critical limit for white fish frame extractions to prevent bitter mineral off-flavors.',
        scientificConcept: 'Calcium phosphate dissolution kinetics from teleost fish vertebrae.',
        culinaryFormula: 'Fish Fumet Window: 22 to 25 minutes extraction at 85°C maximum'
      },
      {
        id: 'pw-6',
        title: 'Module 6: Sauce, Puree & Batter Recovery: The Silicone Spatula Protocol',
        duration: '16 min',
        newsletterRef: 'Issues #39 – #41',
        description: 'Measuring viscous wall-drag retention in industrial mixer bowls and recovery protocols that save 8% of total prepared batter and emulsion batches.',
        scientificConcept: 'Non-Newtonian pseudoplastic fluid shear thinning and boundary layer cling.',
        culinaryFormula: 'Fluid Recovery: 85g emulsion recovered per 1000g prep bowl'
      },
      {
        id: 'pw-7',
        title: 'Module 7: Standardized Prep Sheets & Daily Kitchen Tare-Weight Logging',
        duration: '20 min',
        newsletterRef: 'Issues #42 – #45',
        description: 'Building station logging sheets that convert morning prep weights into financial food-cost variance indicators for kitchen management.',
        scientificConcept: 'Daily standard deviation tracking across line cook shifts.',
        culinaryFormula: 'Food Cost Variance = ((Actual Trim - Benchmark Trim) × AP Unit Price) / Total Covers'
      }
    ]
  },
  {
    id: 'how-to-reduce-buffet-waste',
    title: 'Course 2: Buffet & Banquet Waste Optimization: Engineering Visual Abundance at Scale',
    subtitle: 'Learn how to reduce hotel, resort, and banquet leftover waste by 60% while enhancing presentation through pan thermodynamics and staggered cook stations. Synthesized from Issues #60 to #85 of "The Zero Waste Kitchen".',
    badge: 'Operations & Scale · Level 6',
    duration: '2.0 hours · 5 Modules',
    lessonCount: 5,
    progressPercent: 0,
    coverImage: artisanBreadRicottaImg,
    instructor: 'Dr. Chef Supritam Basu',
    instructorCredentials: 'PhD in Culinary Science & Food Sustainability, CEC',
    newsletterRange: 'Issues #60 – #85',
    lessons: [
      {
        id: 'bw-1',
        title: 'Module 1: The Psychology of Display Abundance: Optical Fullness with Shallow Inserts',
        duration: '22 min',
        newsletterRef: 'Issues #60 – #64',
        description: 'How guest perception of lavish abundance is governed by surface horizontal surface area rather than vertical pan depth.',
        scientificConcept: 'Gestalt visual perception of volume fullness in dining psychology.',
        culinaryFormula: 'Optical Abundance: 40mm pan depth delivers 100% visual satisfaction with 40% batch volume'
      },
      {
        id: 'bw-2',
        title: 'Module 2: Pan Thermodynamics: Replacing 1/1 GN Pans with 1/2 and 1/3 GN Shallow Inserts',
        duration: '25 min',
        newsletterRef: 'Issues #65 – #69',
        description: 'Surface-area-to-volume thermal calculations that prevent dried-out edges and over-holding in stainless steel bain-maries.',
        scientificConcept: 'Conductive and convective heat loss gradients across shallow stainless steel gastronorm vessels.',
        culinaryFormula: 'Hold Pan Optimization: 1/1 GN (100mm) -> Two 1/2 GN (40mm) inserts'
      },
      {
        id: 'bw-3',
        title: 'Module 3: The Final 45 Minutes: Staggered Production and Live Cook Stations',
        duration: '24 min',
        newsletterRef: 'Issues #70 – #74',
        description: 'Operational protocols for cutting hot-holding batch production 45 minutes before buffet service close and switching to cook-to-order.',
        scientificConcept: 'Queuing theory and Poisson arrival distribution for late banquet guests.',
        culinaryFormula: 'T-45 Rule: Cook-to-order portioning when guest arrivals fall below 15% of peak'
      },
      {
        id: 'bw-4',
        title: 'Module 4: HACCP Safety, Hot Holding Limits & Blast Chilling for Safe Repurposing',
        duration: '26 min',
        newsletterRef: 'Issues #75 – #79',
        description: 'Regulatory compliance for safe down-stream chilling: taking proteins from 60°C to below 5°C in under 90 minutes using blast chillers.',
        scientificConcept: 'Microbial lag phase inhibition in pathogenic Bacillus cereus and Clostridium perfringens.',
        culinaryFormula: 'HACCP Rule: Chilling curve dT/dt >= 0.65°C/min'
      },
      {
        id: 'bw-5',
        title: 'Module 5: Viennoiserie & Protein Transformation: Breakfast to Lunch Service',
        duration: '23 min',
        newsletterRef: 'Issues #80 – #85',
        description: 'Converting morning breakfast croissants into velvety lunchtime Croissant Sauces and roasted meats into rich banquet pot pies.',
        scientificConcept: 'Starch gelatinization and retrograde butterfat re-emulsification.',
        culinaryFormula: 'Viennoiserie Conversion: 100g Stale Croissants yields 450ml Gourmet Sauce'
      }
    ]
  },
  {
    id: 'how-to-create-zero-waste-mindset',
    title: 'Course 3: Zero-Waste Kitchen Culture & Behavioral Team Leadership',
    subtitle: 'Master the cognitive and cultural shift required to lead a zero-waste brigade: waste is not refuse, it is an unharvested culinary asset. Synthesized from Issues #1 to #30 of "The Zero Waste Kitchen".',
    badge: 'Leadership & Culture · Level 7',
    duration: '2.5 hours · 7 Modules',
    lessonCount: 7,
    progressPercent: 0,
    coverImage: fermentationCrockImg,
    instructor: 'Dr. Chef Supritam Basu',
    instructorCredentials: 'PhD in Culinary Science & Food Sustainability, CEC',
    newsletterRange: 'Issues #1 – #30',
    lessons: [
      {
        id: 'zwm-1',
        title: 'Module 1: Food Waste Is Created in the Chef\'s Office: Pre-Service Recipe Design',
        duration: '22 min',
        newsletterRef: 'Issues #1 – #4',
        description: 'Why waste is a symptom of poor menu architecture, and how authors and chefs must engineer byproduct sinks before writing purchase orders.',
        scientificConcept: 'Upstream supply chain systems theory applied to commercial kitchen brigades.',
        culinaryFormula: 'Design Law: No raw ingredient is approved without a designated secondary byproduct sink'
      },
      {
        id: 'zwm-2',
        title: 'Module 2: Shifting from Damage Control to Architectural Design',
        duration: '20 min',
        newsletterRef: 'Issues #5 – #8',
        description: 'Replacing end-of-shift trash bag regret with morning prep engineering where off-cuts are treated with the exact same respect as center-of-plate cuts.',
        scientificConcept: 'Cognitive behavioral framing of culinary materials as raw biomass rather than garbage.',
        culinaryFormula: 'Value Parity: Trim Biomass Value = Center-of-Plate Biomass Value'
      },
      {
        id: 'zwm-3',
        title: 'Module 3: Redefining Edible Biomass: Are By-products Really By-products?',
        duration: '24 min',
        newsletterRef: 'Issues #9 – #13',
        description: 'Examining historical culinary traditions (French charcuterie, Italian cucina povera, Japanese dashi and tsukemono) that never created waste.',
        scientificConcept: 'Historical agronomy and ancestral culinary resource conservation.',
        culinaryFormula: 'Biomass Quotient: Edible Fraction = 100% of non-toxic biological mass'
      },
      {
        id: 'zwm-4',
        title: 'Module 4: The Economic Blindspot of Waste Bins: Hidden Food Cost Leakage',
        duration: '22 min',
        newsletterRef: 'Issues #14 – #17',
        description: 'Why traditional restaurant accounting hides waste in gross Cost of Goods Sold (COGS), obscuring thousands in avoidable revenue leakage.',
        scientificConcept: 'Tare-weight financial attribution modeling.',
        culinaryFormula: 'Leakage Rate = (Daily Waste Weight × AP Procurement Price) × 365 Days'
      },
      {
        id: 'zwm-5',
        title: 'Module 5: Challenging Supplier Cosmetic Specs & Accepting Agricultural Diversity',
        duration: '20 min',
        newsletterRef: 'Issues #18 – #21',
        description: 'Negotiating with purveyors to purchase grade-B and cosmetically irregular seasonal produce at 30% discounts for soups, sauces, and ferments.',
        scientificConcept: 'Agricultural supply elasticity and cosmetic grade economics.',
        culinaryFormula: 'Procurement Savings = (Unit Price Standard - Unit Price Grade B) / Unit Price Standard'
      },
      {
        id: 'zwm-6',
        title: 'Module 6: The Circular Kitchen Philosophy: Biomass Conservation in Gastronomy',
        duration: '24 min',
        newsletterRef: 'Issues #22 – #26',
        description: 'How world-renowned sustainable kitchens achieve 3-star Michelin recognition while maintaining certified zero-waste operational ratings.',
        scientificConcept: 'Thermodynamics of closed-loop kitchen energy and nutrient cycles.',
        culinaryFormula: 'Entropy Metric: S_kitchen -> 0 (Zero external nutrient leakage)'
      },
      {
        id: 'zwm-7',
        title: 'Module 7: Leading Your Kitchen Team Without Blame, Shame or Micromanagement',
        duration: '25 min',
        newsletterRef: 'Issues #27 – #30',
        description: 'Incentivizing line cooks through monthly innovation competitions, scrap creation bounties, and positive culinary brigade recognition.',
        scientificConcept: 'Organizational psychology and peer reinforcement in high-stress kitchens.',
        culinaryFormula: 'Brigade Engagement = (Scrap Innovations Implemented / Total Shift Suggestions) × 100'
      }
    ]
  },
  {
    id: 'how-to-create-zero-waste-recipes',
    title: 'Course 4: Advanced Byproduct Formulation & Chemical Flavor Extraction',
    subtitle: 'Master the biochemistry, osmotic extraction, and thermal transformation of tough peels, seeds, stems, and stalks into luxury condiments and pantry lines. Synthesized from Issues #90 to #140 of "The Zero Waste Kitchen".',
    badge: 'Culinary Science · Level 7',
    duration: '2.5 hours · 6 Modules',
    lessonCount: 6,
    progressPercent: 0,
    coverImage: boneBrothPotImg,
    instructor: 'Dr. Chef Supritam Basu',
    instructorCredentials: 'PhD in Culinary Science & Food Sustainability, CEC',
    newsletterRange: 'Issues #90 – #140',
    lessons: [
      {
        id: 'zwr-1',
        title: 'Module 1: Non-Thermal Flavor Extraction: Osmotic Oleo Saccharums & Macerations',
        duration: '24 min',
        newsletterRef: 'Issues #90 – #98',
        description: 'Harnessing sucrose hygroscopicity to draw out delicate terpenes, flavedo oils, and fruit esters without heat degradation.',
        scientificConcept: 'Osmotic vapor pressure differential and lipid-soluble aromatic recovery.',
        culinaryFormula: 'Oleo Extraction: 1.0 Part Citrus Flavedo : 1.0 Part Sucrose (12h ambient)'
      },
      {
        id: 'zwr-2',
        title: 'Module 2: Thermal Dehydration, Roasting & Fine Culinary Umami Powders',
        duration: '26 min',
        newsletterRef: 'Issues #99 – #107',
        description: 'Dehydrating onion skins, mushroom stems, and leek greens below Aw 0.60, then pulverized into fine finishing dusts.',
        scientificConcept: 'Maillard browning kinetics at 110°C without charring delicate cellular structures.',
        culinaryFormula: 'Umami Dust: 80% Dried Scrap Powder + 20% Flaky Smoked Sea Salt'
      },
      {
        id: 'zwr-3',
        title: 'Module 3: Scrap Fermentation: Wild Lacto-Brines, Kimchis & Fruit Vinegars',
        duration: '28 min',
        newsletterRef: 'Issues #108 – #116',
        description: 'Submerging tough brassica stems and fruit rinds in 2.0% saline brines to cultivate Leuconostoc and Lactobacillus.',
        scientificConcept: 'Acidification kinetics: lowering pH below 4.2 in 72 hours to ensure HACCP compliance.',
        culinaryFormula: 'Lacto Saline Rule: (Weight of Scraps + Weight of Water) × 0.020 = g Salt'
      },
      {
        id: 'zwr-4',
        title: 'Module 4: Silky Emulsions: Transforming Vegetable Stems into Velvet Veloutés',
        duration: '22 min',
        newsletterRef: 'Issues #117 – #124',
        description: 'High-shear mechanical emulsification of tough fibrous broccoli and kale stems with extra virgin olive oil into creamy soups without flour roux.',
        scientificConcept: 'Hydrocolloid pectin and cellulose suspension under high-shear Vitamix blade speeds.',
        culinaryFormula: 'Velouté Ratio: 400g Blanched Stems : 120ml Cold-Pressed Oil : 300ml Scrap Broth'
      },
      {
        id: 'zwr-5',
        title: 'Module 5: Candying, Mostardas & Chutneys from Bitter Citrus and Melon Rinds',
        duration: '25 min',
        newsletterRef: 'Issues #125 – #132',
        description: 'Softening dense protopectin in watermelon white mesocarp and grapefruit rinds using slow acetic acid simmering and sugar saturation.',
        scientificConcept: 'Sucrose-pectin gel matrix formation and enzymatic bitterness debittering.',
        culinaryFormula: 'Translucent Glass Rind: 100g Blanched Rind : 300g 65° Brix Simple Syrup'
      },
      {
        id: 'zwr-6',
        title: 'Module 6: Stale Bakery Science: Sauces, Savory Pangrattato & Fermented Kvas',
        duration: '25 min',
        newsletterRef: 'Issues #133 – #140',
        description: 'Revitalizing rock-hard artisan bread through toasted emulsion sauces, crisp brown-butter pangrattato, and traditional Slavic wild kvas.',
        scientificConcept: 'Starch retrogradation: amylose recrystallization during staling absorbs dairy fats readily.',
        culinaryFormula: 'Kvas Formula: 500g Toasted Sourdough : 4L Water : 150g Cane Sugar : Wild Starter'
      }
    ]
  },
  {
    id: 'how-to-create-circular-menu',
    title: 'Course 5: Circular Menu Engineering: The Input/Output Matrix',
    subtitle: 'The mathematical and operational framework for engineering restaurant menus where every single byproduct is an input ingredient for another station. Synthesized from Issues #200 to #235 of "The Zero Waste Kitchen".',
    badge: 'Menu Engineering · Level 7',
    duration: '2.5 hours · 5 Modules',
    lessonCount: 5,
    progressPercent: 0,
    coverImage: heroSustainableKitchenImg,
    instructor: 'Dr. Chef Supritam Basu',
    instructorCredentials: 'PhD in Culinary Science & Food Sustainability, CEC',
    newsletterRange: 'Issues #200 – #235',
    lessons: [
      {
        id: 'cm-1',
        title: 'Module 1: The Input/Output Matrix: Pairing Core Dishes with Adjacent Byproduct Sinks',
        duration: '28 min',
        newsletterRef: 'Issues #200 – #206',
        description: 'Designing menu tables where every primary protein and produce item is paired with a specific secondary dish sink across larder, saucier, and pastry.',
        scientificConcept: 'Input-Output economic matrix modeling applied to à la carte kitchen stations.',
        culinaryFormula: 'Circular Matrix: Dish A Byproduct = Dish B Input (e.g. Ribeye Trim -> Larder Bolognese)'
      },
      {
        id: 'cm-2',
        title: 'Module 2: Dynamic Blackboard Specials for Variable Kitchen Prep Yields',
        duration: '25 min',
        newsletterRef: 'Issues #207 – #213',
        description: 'How to use blackboard daily market features to absorb seasonal fluctuations in prep trim yields without altering printed menu costs.',
        scientificConcept: 'Elastic capacity absorption in variable hospitality production.',
        culinaryFormula: 'Blackboard Yield Absorption = Total Surplus Prep Biomass / Portion Weight'
      },
      {
        id: 'cm-3',
        title: 'Module 3: Cross-Station Ingredient Pathways: Kitchen to Bar & Pastry Interfacing',
        duration: '26 min',
        newsletterRef: 'Issues #214 – #220',
        description: 'Establishing standard daily ingredient transfers between hot line, cold larder, pastry shop, and mixology bar for citrus peels, herb stems, and whey.',
        scientificConcept: 'Inter-departmental transfer pricing and zero-waste logistics.',
        culinaryFormula: 'Transfer Credit: Kitchen credits Bar $0.00 for raw citrus; Bar sells signature $18 cocktail'
      },
      {
        id: 'cm-4',
        title: 'Module 4: Pricing & True Yield Costing: Accounting for 100% Usable Biomass',
        duration: '26 min',
        newsletterRef: 'Issues #221 – #227',
        description: 'Eliminating the traditional 30% waste factor markup from dish costing, allowing chefs to price competitively while capturing higher net profits.',
        scientificConcept: 'Marginal cost accounting across co-products in food manufacturing.',
        culinaryFormula: 'True Food Cost % = (Total Raw Invoice Cost / (Dish 1 Revenue + Dish 2 Byproduct Revenue)) × 100'
      },
      {
        id: 'cm-5',
        title: 'Module 5: Case Study: The 100% Circular Michelin-Standard Tasting Menu',
        duration: '30 min',
        newsletterRef: 'Issues #228 – #235',
        description: 'Detailed analysis of a 10-course tasting menu where zero organic matter enters the refuse bin, with full recipes, plate diagrams, and brigade workflows.',
        scientificConcept: 'Comprehensive closed-loop culinary systems audit.',
        culinaryFormula: 'Total Kitchen Waste Divergence Rate = 99.4% (Landfill waste = 0kg)'
      }
    ]
  }
];

// -------------------------------------------------------------
// COMMUNITY / ASK DR. CHEF SUPRITAM BASU DATA
// (Large 500+ catalogs live in byproducts500Data.ts & recipes500Data.ts for code-splitting)
// -------------------------------------------------------------
export const communityQuestions: CommunityQuestion[] = [
  {
    id: 'q-1',
    authorName: 'Chef Marcus Leung',
    authorRole: 'Sous Chef · Marina Bay Sands',
    authorAvatar: 'ML',
    datePosted: '2 days ago',
    category: 'Prep Waste',
    question: 'We prep over 40kg of heirloom tomatoes daily for banquets and end up with huge bowls of seed gel and tops. What is the most profitable way to commercialize tomato water without muddying color?',
    likes: 24,
    answeredByDrBasu: true,
    reply: {
      author: 'Dr. Chef Supritam Basu',
      role: 'Dean of Sustainable Gastronomy · Zero Waste Academy',
      avatar: 'SB',
      date: '1 day ago',
      text: 'Marcus, excellent question! Never apply heat. Pulse the tomato trimmings with exactly 1.5% sea salt for 5 seconds to rupture cell walls without pulverizing seeds, then hang overnight in a double cheesecloth lined colander inside the walk-in cooler at 3°C. You will yield 65% crystal-clear tomato consommé rich in natural glutamic acid. Sell it as clarified cold tomato water for crudos or signature craft cocktails. Dehydrate the remaining pulp at 60°C and blitz with flaky salt for Umami Tomato Finishing Dust!'
    }
  },
  {
    id: 'q-2',
    authorName: 'Sarah Jenkins',
    authorRole: 'Head Pastry Chef · The Green Room',
    authorAvatar: 'SJ',
    datePosted: '4 days ago',
    category: 'Bakery Waste',
    question: 'How do you keep the Croissant Sauce from breaking if it sits on the pass in a squeeze bottle during 2-hour service?',
    likes: 19,
    answeredByDrBasu: true,
    reply: {
      author: 'Dr. Chef Supritam Basu',
      role: 'Dean of Sustainable Gastronomy · Zero Waste Academy',
      avatar: 'SB',
      date: '3 days ago',
      text: 'Keep the temperature strictly between 55°C and 60°C in an immersion water bath. If drafts cause butterfat weeping, incorporate 10% hot whole milk (80°C) and shear with an immersion stick blender for 10 seconds. The retrograded starches from the laminated dough will instantly re-stabilize the emulsion.'
    }
  },
  {
    id: 'q-3',
    authorName: 'Chef Liam Davies',
    authorRole: 'Head Chef · Bistro Zero',
    authorAvatar: 'LD',
    datePosted: '1 week ago',
    category: 'Buffet Waste',
    question: 'What is the single highest-impact change we can implement on our breakfast buffet tomorrow morning that line cooks will actually follow?',
    likes: 35,
    answeredByDrBasu: true,
    reply: {
      author: 'Dr. Chef Supritam Basu',
      role: 'Dean of Sustainable Gastronomy · Zero Waste Academy',
      avatar: 'SB',
      date: '5 days ago',
      text: 'Replace every full-size 1/1 GN stainless steel deep hotel pan on hot holding lines with shallow 1/2 and 1/3 GN inserts. To guests, the display looks completely full and abundant, but you reduce food exposure volume by 60%, drastically preventing dried-out eggs and withered meats.'
    }
  }
];

// -------------------------------------------------------------
// MONTHLY LIVE CALL RECORDINGS (Presented by Dr. Chef Supritam Basu)
// -------------------------------------------------------------
export const monthlyRecordings: MonthlyRecording[] = [
  {
    id: 'rec-march-2026',
    title: 'Executive Masterclass - March 2026: Biochemical Trim Valorization',
    date: 'March 2026',
    duration: '58 mins',
    posterImage: '/src/assets/images/hero_sustainable_kitchen_1793976158274.jpg',
    instructor: 'Dr. Chef Supritam Basu',
    description: 'Live masterclass on cold gravity-drip tomato consommé, banquet bread starch retrogradation, and line-cook waste separation auditing.',
    featuredQuestions: [
      'Commercializing tomato seed pulp and trim consommé (08:24)',
      '3-Tier station setup for commercial vegetable butchery (21:15)',
      'Calculating financial ROI of tare-weighted scales for hotel GMs (38:40)'
    ],
    keyTakeaways: [
      'Cold gravity drip tomato consommé preserves 65% clear mass without heat oxidation.',
      'Separation bins must be marked with recipe destinations, never just "Waste".',
      'Tare-weighted waste audits consistently reduce total food cost by 3.2% within 60 days.'
    ]
  },
  {
    id: 'rec-february-2026',
    title: 'Executive Masterclass - February 2026: Buffet Thermodynamics & Portion Calibration',
    date: 'February 2026',
    duration: '52 mins',
    posterImage: '/src/assets/images/root_to_stem_prep_1793976158854.jpg',
    instructor: 'Dr. Chef Supritam Basu',
    description: 'Operational strategy breakdown: Overcoming buffet drying out, shallow insert physics, and HACCP blast chilling.',
    featuredQuestions: [
      'What is the easiest low-friction waste intervention in commercial hotels? (04:12)',
      'Thermodynamics of shallow GN pan inserts (18:45)',
      'Documenting lacto-fermentation pH logs for municipal health inspectors (34:10)'
    ],
    keyTakeaways: [
      '80% of kitchen waste is dictated in the chef\'s office during recipe design.',
      'Shallow inserts reduce hot holding volume by 60% while maintaining visual abundance.',
      'Maintain digital pH logs showing pH < 4.2 for all ambient vegetable scrap ferments.'
    ]
  },
  {
    id: 'rec-january-2026',
    title: 'Executive Masterclass - January 2026: Setting 2026 Zero-Waste Kitchen KPIs',
    date: 'January 2026',
    duration: '61 mins',
    posterImage: '/src/assets/images/bone_broth_pot_1793976160130.jpg',
    instructor: 'Dr. Chef Supritam Basu',
    description: 'Annual strategic planning for hotel and restaurant culinary brigades: KPI metrics, bonus structures, and scrap utilization formulas.',
    featuredQuestions: [
      'Executing your first quantitative 7-day tare-weighted waste audit (07:30)',
      'Designing staff bonus structures linked to waste reduction targets (26:00)',
      'Safety parameters for spent coffee grounds in savory culinary glazes (45:15)'
    ],
    keyTakeaways: [
      'Audit by weight, not cost, to identify operational bottlenecks.',
      'Reward kitchen apprentices with bonus points for verified upcycled dish formulas.'
    ]
  }
];

// -------------------------------------------------------------
// QUICK WINS GUIDES (Authored by Dr. Chef Supritam Basu)
// -------------------------------------------------------------
export const quickWinGuides: Record<string, QuickWinGuide> = {
  'prep-waste': {
    id: 'prep-waste',
    title: 'Prep Waste: The 50% Reduction Framework',
    iconName: 'ChefHat',
    summary: 'Prep waste happens during peeling, trimming, and butchery. It is the single easiest waste stream for kitchen staff to control.',
    estimatedSaving: '30% – 50% Prep Waste Reduction ($1,200 – $3,500/month)',
    chefRule: 'A vegetable stem is not garbage; it is an unharvested ingredient.',
    keySteps: [
      {
        step: 1,
        title: 'Switch from "Trash Bin" to 3 Trim Separation Cambros',
        detail: 'Place 3 labeled square Cambros on every prep station: [1] Stocks & Broths (clean roots, alliums), [2] Purees & Powders (herb stems, clean peelings), [3] Ferment & Vinegars (fruit skins, cores).'
      },
      {
        step: 2,
        title: 'The Scrub Rule vs Peeling Rule',
        detail: 'Carrots, parsnips, and clean local potatoes should be thoroughly scrubbed with a stiff brush rather than peeled. Peeling sacrifices up to 18% of ingredient weight and removes the most flavorful skin layer.'
      },
      {
        step: 3,
        title: 'Daily Tare-Weight Logging',
        detail: 'Weigh the trim bins before shifting them to the walk-in prep sink. Record weights on the daily prep sheet to spot anomalies between shifts.'
      }
    ],
    checklists: [
      'Y-peelers inspected and sharpened weekly (dull peelers cut too deep)',
      'Stationary scrap buckets positioned directly beside cutting boards',
      'Prep cooks trained on root-to-stem knife cuts',
      'Daily trim weights posted on kitchen whiteboard'
    ]
  },
  'buffet-waste': {
    id: 'buffet-waste',
    title: 'Buffet Waste: Visual Abundance Without Overproduction',
    iconName: 'Layers',
    summary: 'Buffets traditionally discard 25-40% of prepared food. The culprit is not greedy guests—it is display sizing and rigid refill schedules.',
    estimatedSaving: '40% Buffet Waste Reduction ($2,000 – $6,000/month)',
    chefRule: 'Abundance is an optical illusion created by shallow pans, not deep piles of drying food.',
    keySteps: [
      {
        step: 1,
        title: 'Eliminate Full-Size (1/1 GN) Deep Pans',
        detail: 'Swap 1/1 GN pans for shallow 1/2 and 1/3 GN inserts with false bottoms. A pan with 12 portions appears completely full to guests.'
      },
      {
        step: 2,
        title: 'The 45-Minute Staggered Refill Schedule',
        detail: 'During the last 45 minutes of breakfast or banquet service, cease full pan swaps. Switch to half-batches cooked on demand at the live station.'
      },
      {
        step: 3,
        title: 'Rapid Blast Chill Repurposing Protocol',
        detail: 'Unserved hot foods kept above 65°C can be blast-chilled immediately within 90 minutes for safe transformation into lunch soups, quiches, or family meals.'
      }
    ],
    checklists: [
      'Shallow 1/2 and 1/3 GN inserts deployed across all hot lines',
      'Service staff instructed on live replenishment triggers',
      'Blast chiller logs maintained with time and temperature stamps',
      'Daily guest headcount forecast shared with kitchen at 6:00 AM'
    ]
  },
  'plate-waste': {
    id: 'plate-waste',
    title: 'Plate Waste: Menu Engineering & Portion Calibration',
    iconName: 'Utensils',
    summary: 'Plate waste is food returned by the guest unconsumed. It indicates portion mismatch, heavy starches, or unwanted decorative garnishes.',
    estimatedSaving: '15% – 25% Reduction in Center-of-Plate Protein Loss',
    chefRule: 'If every guest leaves the same garnish on the rim of the plate, the recipe is broken.',
    keySteps: [
      {
        step: 1,
        title: 'The Dishwashing Station Plate Scraping Audit',
        detail: 'Spend 2 hours at the dish pit with a clipboard during peak Friday service. Note which menu items return with over 20% food remaining.'
      },
      {
        step: 2,
        title: 'Eliminate Decorative Non-Functional Garnishes',
        detail: 'Remove inedible herbs, raw parsley sprigs, and lemon wedges that are routinely discarded without being squeezed or eaten.'
      },
      {
        step: 3,
        title: 'Choice-Based Carbohydrate Sides',
        detail: 'Offer fries, mashed potato, or bread baskets on request or as customizable portions rather than auto-loading massive 300g starch mounts.'
      }
    ],
    checklists: [
      'Dishwasher staff empowered to flag consistently unfinished dishes',
      'Starch portion sizes reduced from 250g to 180g with free second helpings',
      'Inedible or raw decorative garnishes eliminated from plating specs',
      'Waitstaff trained to offer takeout boxes proactively'
    ]
  },
  'spoilage-waste': {
    id: 'spoilage-waste',
    title: 'Spoilage Waste: Walk-In Organization & FIFO Precision',
    iconName: 'Clock',
    summary: 'Spoilage occurs when raw ingredients rot before use due to forgotten inventory, incorrect temperature zones, or excessive ordering.',
    estimatedSaving: '80% Elimination of Storage Spoilage',
    chefRule: 'First In, First Out is not a slogan—it is the law of kitchen survival.',
    keySteps: [
      {
        step: 1,
        title: 'Color-Coded FIFO Day Dots & Clear Cambros',
        detail: 'Ban all cardboard delivery boxes from the walk-in. Immediately transfer produce into clear perforated Cambros with visible day dots.'
      },
      {
        step: 2,
        title: 'Micro-Climate Walk-In Mapping',
        detail: 'Map your cold room: warmest zone (top near door: 6°C) for alliums and citrus; coldest zone (lowest rear near evaporator: 1°C) for raw fish and meat.'
      },
      {
        step: 3,
        title: 'The 48-Hour "Use-First" Red Bin',
        detail: 'Designate an eye-level red crate for ingredients nearing expiration. Prep cooks must clear this crate before opening new cases.'
      }
    ],
    checklists: [
      'Cardboard banned from all cold storage areas',
      'Walk-in cooler temperature mapped twice daily (morning & night)',
      '"Use First" shelf designated at eye level in the center rack',
      'Weekly supplier order quantities audited against actual consumption'
    ]
  }
};
