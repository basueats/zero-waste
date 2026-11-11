export interface PresentationSlide {
  id: string;
  slideNumber: number;
  title: string;
  subtitle?: string;
  conceptTag: string;
  bullets: string[];
  visualImage?: string;
  visualCaption?: string;
  keyMetricOrFormula?: {
    label: string;
    value: string;
    subtext: string;
  };
}

export interface LectureResource {
  id: string;
  title: string;
  filename?: string;
  size?: string;
  url?: string;
  isExternal?: boolean;
}

export interface NarrationLine {
  timestamp: string;
  seconds: number;
  speaker: string;
  text: string;
}

export interface CourseLectureItem {
  id: string;
  lectureNumber: number;
  globalChapterNumber: number;
  title: string;
  duration: string;
  durationSeconds: number;
  slides: PresentationSlide[];
  resources: LectureResource[];
  transcript: NarrationLine[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SectionQuiz {
  id: string;
  quizNumber: number;
  title: string;
  passingScorePercent: number; // 37% as requested
  questions: QuizQuestion[]; // 10 questions
}

export interface UdemyCourseSection {
  id: string;
  sectionNumber: number;
  title: string;
  subtitle: string;
  durationLabel: string;
  lectures: CourseLectureItem[]; // Exactly 2 chapters per section
  quiz: SectionQuiz; // 10 quiz questions, 37% pass mark
}

export const UDEMY_ZERO_WASTE_SECTIONS: UdemyCourseSection[] = [
  {
    id: 'section-1',
    sectionNumber: 1,
    title: 'Section 1: Meeting Kitchen Waste Auditing & Root-to-Stem Fundamentals',
    subtitle: 'Tare-weight tracking, station variance logs & vegetable butchery',
    durationLabel: '60min',
    lectures: [
      {
        id: 'sec1-lec1',
        lectureNumber: 1,
        globalChapterNumber: 1,
        title: '1. Workplace Waste Auditing: Tare-Weight Checklist & Station Logs (10 Tools)',
        duration: '32min',
        durationSeconds: 150,
        resources: [
          { id: 'r1', title: 'Facilitation 01+ Kitchen Waste Audit Protocol.pdf', filename: 'Facilitation_01_Waste_Audit.pdf', size: '0.62 MB' },
          { id: 'r2', title: 'Tare-Weighted Station Log Spreadsheet (Excel)', filename: 'Station_Tare_Weight_Matrix.xlsx', size: '0.45 MB' },
          { id: 'r3', title: 'EPA & FAO Recovery Hierarchy Guide', url: 'https://thecpdregister.com', isExternal: true }
        ],
        slides: [
          {
            id: 's1-1',
            slideNumber: 1,
            title: 'Course Program & Audit Architecture',
            conceptTag: 'Foundations & Methodology',
            bullets: [
              'Lesson 1. What is workplace waste auditing in a culinary brigade?',
              'Lesson 2. [hl]Tare-Weight Log Implementation[/hl] – The Key to Station Success',
              'Lesson 3. How to measure prep, spoilage and plate waste streams',
              'Lesson 4. Methane decomposition factors & financial leakage metrics',
              'Lesson 5. How to achieve brigade alignment & maintain audit discipline',
              'Lesson 6. How to create an executive sustainability dashboard'
            ],
            visualImage: '/assets/images/hero_sustainable_kitchen_1793976158274.jpg',
            visualCaption: 'Figure 1: Commercial kitchen tare-weighted audit stations with certified digital scales.',
            keyMetricOrFormula: {
              label: 'Kitchen Diversion Target',
              value: '≥ 85%',
              subtext: 'International Zero Waste Kitchen certification benchmark'
            }
          },
          {
            id: 's1-2',
            slideNumber: 2,
            title: 'The Five P\'s of the Preparation Audit Process',
            conceptTag: 'Core 5P Framework',
            bullets: [
              '💛 [hl]Purpose.[/hl] Why are we holding this audit session? What are its critical culinary benchmarks and cost targets?',
              '💛 [hl]Product.[/hl] What data must we obtain at shift end? How will the head chef verify station tare accuracy?',
              '💛 [hl]Invited Participants.[/hl] Who participates across the line (commis, chef de partie, sous chef) and how is accountability shared?',
              '💛 [hl]Problems.[/hl] What contamination risks arise when separating prep scraps from general waste bins?',
              '💛 [hl]Process.[/hl] What step-by-step weighing procedure ensures zero interruption to lunch and dinner service?'
            ],
            visualImage: '/assets/ingredients/cauliflower.jpg',
            visualCaption: 'Figure 2: Color-coded organic collection caddies separated by moisture density.'
          },
          {
            id: 's1-3',
            slideNumber: 3,
            title: 'Tare-Weight Variance Formula & Methane Calculations',
            conceptTag: 'Financial & Chemical Metrics',
            bullets: [
              'Tare Calibration: Zero digital scale with empty container before loading organic trimmings.',
              'Moisture Deduction: Record wet vegetable peels vs dry trimmed paper sacks.',
              'Methane Penalty Factor: Landfilled organics emit [hl]28x more damaging greenhouse methane[/hl] than aerobic composting.',
              'True Scrap Value: Compute As-Purchased (AP) wholesale cost per kilogram of edible discard.'
            ],
            visualImage: '/assets/ingredients/watermelon.jpg',
            visualCaption: 'Figure 3: Yield variance calculation comparing raw bulk weight vs edible portion.',
            keyMetricOrFormula: {
              label: 'Methane Warming Factor',
              value: '28x vs CO₂',
              subtext: 'Anaerobic landfill decomposition greenhouse coefficient'
            }
          }
        ],
        transcript: [
          { timestamp: '00:00', seconds: 0, speaker: 'Dr. Chef Supritam Basu', text: 'Welcome to Lecture 1: Workplace Waste Auditing. In this lesson we establish the exact tare-weight protocol for commercial kitchen stations.' },
          { timestamp: '00:15', seconds: 15, speaker: 'Dr. Chef Supritam Basu', text: 'Food waste is not inevitable. It is an unmeasured economic leakage that damages food cost percentages and releases high-potency landfill methane.' },
          { timestamp: '00:30', seconds: 30, speaker: 'Dr. Chef Supritam Basu', text: 'We organize our brigade using the Five Ps: Purpose, Product, Participants, Problems, and Process.' },
          { timestamp: '00:45', seconds: 45, speaker: 'Dr. Chef Supritam Basu', text: 'By weighing clean preparation scraps separately from plate waste, we reveal the exact yield potential of every raw vegetable crate.' }
        ]
      },
      {
        id: 'sec1-lec2',
        lectureNumber: 2,
        globalChapterNumber: 2,
        title: '2. Root-to-Stem Vegetable Butchery & PME Enzyme Blanching (16 Tools)',
        duration: '28min',
        durationSeconds: 150,
        resources: [
          { id: 'r4', title: 'Facilitation 02 Preparation Protocol.pdf', filename: 'Facilitation_02_Vegetable_Butchery.pdf', size: '0.71 MB' },
          { id: 'r5', title: 'Brassica PME Enzyme Blanching Chart.pdf', filename: 'PME_Enzyme_Blanching_SOP.pdf', size: '0.52 MB' },
          { id: 'r6', title: 'Cauliflower Leaf & Stem Chutney Recipe.pdf', filename: 'Cauliflower_Leaf_Chutney_SOP.pdf', size: '0.58 MB' }
        ],
        slides: [
          {
            id: 's2-1',
            slideNumber: 1,
            title: 'Root-to-Stem Anatomy & Cellular Structure',
            conceptTag: 'Vegetable Anatomy',
            bullets: [
              'Broccoli Stalk Core: Strip fibrous outer cortex bark with a Y-peeler to harvest the crisp jade core.',
              'Cauliflower Ribs & Greens: Highest concentration of glucosinolates and savory umami sugars.',
              'Watermelon White Mesocarp: Crisp fibrous rind ideal for lacto-pickling and spiced gastriques.',
              '[hl]Yield Increase: +35% to +45%[/hl] edible biomass recovered from standard wholesale produce.'
            ],
            visualImage: '/assets/ingredients/broccoli.jpg',
            visualCaption: 'Figure 1: Cross-section of brassica stalk showing inner tender parenchymal tissue.',
            keyMetricOrFormula: {
              label: 'Vegetable Biomass Yield',
              value: '+40% Edible',
              subtext: 'Reclaiming cores, ribs, and protective outer foliage'
            }
          },
          {
            id: 's2-2',
            slideNumber: 2,
            title: 'Pectin Methyl Esterase (PME) Activation Protocol',
            conceptTag: 'Thermal Enzymatic Chemistry',
            bullets: [
              '💛 [hl]Critical Temperature Zone:[/hl] Maintain scrap blanching strictly between [hl]55°C and 65°C[/hl].',
              '💛 [hl]Enzymatic Cross-Linking:[/hl] PME de-esterifies pectin molecules, binding native calcium ions.',
              '💛 [hl]Texture Preservation:[/hl] Prevents vegetable scrap cellular collapse during downstream cooking.',
              '💛 [hl]Thermal Deactivation:[/hl] Boiling water (100°C) denatures PME instantly, resulting in limp mushy scraps.'
            ],
            visualImage: '/assets/images/root_to_stem_prep_1793976158854.jpg',
            visualCaption: 'Figure 2: Precision water bath holding vegetable trimmings at 60°C for enzyme cross-linking.'
          },
          {
            id: 's2-3',
            slideNumber: 3,
            title: 'Signature Scrap Formulations: Leaves & Mesocarps',
            conceptTag: 'Executive Kitchen Recipes',
            bullets: [
              'Brassica Leaf Chutney: Sauté cauliflower greens with mustard seeds, ginger, cumin, and tamarind.',
              'Watermelon Rind Quick-Pickle: 3% salt brine with coriander seeds and raw cane sugar.',
              'Herb Stem Paste: Microplane cilantro and parsley stems with garlic and cold-pressed oil for high-aroma pistou.'
            ],
            visualImage: '/assets/ingredients/herbs.jpg',
            visualCaption: 'Figure 3: Churned scrap chutney and cold-emulsified herb stem finishing oil.'
          }
        ],
        transcript: [
          { timestamp: '00:00', seconds: 0, speaker: 'Dr. Chef Supritam Basu', text: 'In Lecture 2 we master Root-to-Stem Vegetable Butchery. Line cooks routinely throw away forty percent of brassica weight by discarding stems.' },
          { timestamp: '00:15', seconds: 15, speaker: 'Dr. Chef Supritam Basu', text: 'Peel the tough cellulose exterior to reveal the sweet, crunchy core. Mandoline it paper-thin for carpaccio or salads.' },
          { timestamp: '00:30', seconds: 30, speaker: 'Dr. Chef Supritam Basu', text: 'Apply PME enzymatic blanching at fifty-five to sixty-five degrees Celsius. This locks in cell wall firmness through calcium binding.' },
          { timestamp: '00:45', seconds: 45, speaker: 'Dr. Chef Supritam Basu', text: 'Next, we prepare for Quiz 1 to validate your command of Section 1 waste auditing.' }
        ]
      }
    ],
    quiz: {
      id: 'quiz-1',
      quizNumber: 1,
      title: 'Quiz 1: Section 1 Comprehensive Assessment (10 Questions)',
      passingScorePercent: 37,
      questions: [
        {
          id: 'q1-1',
          question: '1. What is the primary operational objective of a 7-day tare-weighted kitchen waste audit?',
          options: [
            'To identify exact weight, origin, and cost leakage of preparation scraps, spoilage, and plate waste',
            'To replace professional dishwashing machinery with manual washing',
            'To eliminate all vegetable seasonings from the restaurant menu',
            'To bypass local municipality waste collection permits'
          ],
          correctIndex: 0,
          explanation: 'Tare-weighted audits give kitchen teams precise quantitative data on where food cost dollars are lost across prep, storage, and service.'
        },
        {
          id: 'q1-2',
          question: '2. Why does food waste decomposing inside compacted municipal landfills generate methane gas instead of carbon dioxide?',
          options: [
            'Extreme solar ultraviolet light accelerates carbon oxidation',
            'Heavy landfill compaction creates an oxygen-deprived (anaerobic) microbial environment',
            'Chemical interaction with municipal plastic recycling bags',
            'Rapid freezing temperatures in deep soil layers'
          ],
          correctIndex: 1,
          explanation: 'Anaerobic conditions allow methanogenic bacteria to break down organic matter, producing methane (CH4) which has 28x the warming potential of CO2.'
        },
        {
          id: 'q1-3',
          question: '3. What is the certified professional benchmark target for organic waste diversion from landfill in a sustainable kitchen?',
          options: ['30%', '50%', '85% or higher', '100% complete zero-collection'],
          correctIndex: 2,
          explanation: 'International zero-waste culinary standards recognize kitchens that divert 85% or more of raw organic byproduct from landfills.'
        },
        {
          id: 'q1-4',
          question: '4. What temperature range is required to activate Pectin Methyl Esterase (PME) during vegetable scrap blanching?',
          options: ['30°C – 40°C', '55°C – 65°C', '85°C – 95°C', '100°C rolling boil'],
          correctIndex: 1,
          explanation: 'PME is activated between 55°C and 65°C, demethylating pectin so it binds calcium ions to permanently firm cell walls.'
        },
        {
          id: 'q1-5',
          question: '5. Which component of the Five P\'s framework defines the measurable outcome and verification rubric of a session?',
          options: ['Purpose', 'Product', 'Participants', 'Problems'],
          correctIndex: 1,
          explanation: 'Product defines the concrete deliverable, data sheet, or verified result achieved at the conclusion of the process.'
        },
        {
          id: 'q1-6',
          question: '6. When preparing broccoli and cauliflower stalks, what must a line cook remove to reach the sweet, crisp interior core?',
          options: [
            'The entire stalk must be discarded immediately',
            'The fibrous outer lignified cortex bark must be peeled with a Y-peeler',
            'The florets must be bleached with chlorine',
            'The pith must be soaked in alcohol'
          ],
          correctIndex: 1,
          explanation: 'Peeling the outer fibrous bark uncovers the tender parenchymal jade core, which provides superior crunch and sugar content.'
        },
        {
          id: 'q1-7',
          question: '7. What chemical phenomenon occurs when vegetable scraps are plunged directly into rolling boiling water (100°C)?',
          options: [
            'PME enzymes are instantly denatured, leading to rapid cellular collapse and limp texture',
            'Pectin becomes permanently crystallized like glass',
            'Vitamin C synthesis increases by 200%',
            'The vegetable absorbs atmospheric nitrogen'
          ],
          correctIndex: 0,
          explanation: 'Boiling water denatures PME before it can bind calcium, destroying the plant\'s natural structural integrity.'
        },
        {
          id: 'q1-8',
          question: '8. In commercial recipe costing, what does the Edible Portion (EP) metric represent?',
          options: [
            'The raw wholesale crate weight including dirt and shipping boxes',
            'The weight of usable food available for serving after peeling, trimming, and butchery',
            'The weight of compost collected at midnight',
            'The tare weight of empty stainless steel gastronorm pans'
          ],
          correctIndex: 1,
          explanation: 'EP represents the usable yield retained for customer service after unavoidable prep waste has been removed.'
        },
        {
          id: 'q1-9',
          question: '9. How should clean raw herb stems (cilantro, parsley, basil) be utilized before service?',
          options: [
            'Thrown into the general garbage can',
            'Finely microplaned or emulsified into finishing pestos, chimichurris, or herb infused oils',
            'Boiled for 4 hours until brown',
            'Dried at high heat until turned to ash'
          ],
          correctIndex: 1,
          explanation: 'Herb stems hold intense essential oils and aromatics; emulsifying them with cold-pressed oil creates high-flavor finishing condiments.'
        },
        {
          id: 'q1-10',
          question: '10. What is the passing score required on this examination to unlock Section 2 and move to the next chapter?',
          options: ['20%', '37%', '75%', '100%'],
          correctIndex: 1,
          explanation: 'In accordance with curriculum standards, scoring 37% or higher demonstrates baseline competency to advance to Section 2.'
        }
      ]
    }
  },
  {
    id: 'section-2',
    sectionNumber: 2,
    title: 'Section 2: Stocks, Collagen Hydrolysis & Nose-to-Tail Butchery',
    subtitle: 'Triple-helix gelatin extraction, gentle sub-boiling & line cook yield rubrics',
    durationLabel: '50min',
    lectures: [
      {
        id: 'sec2-lec3',
        lectureNumber: 1,
        globalChapterNumber: 3,
        title: '3. Triple-Helix Collagen Hydrolysis & Scrap Stock Clarification (23 Tools)',
        duration: '25min',
        durationSeconds: 150,
        resources: [
          { id: 'r7', title: 'Collagen Extraction & Bone Broth Formulation SOP.pdf', filename: 'Collagen_Extraction_SOP.pdf', size: '0.71 MB' },
          { id: 'r8', title: 'Fish Fumet 25-Minute Critical Limit Guide.pdf', filename: 'Fish_Fumet_25Min_Limit.pdf', size: '0.54 MB' }
        ],
        slides: [
          {
            id: 's3-1',
            slideNumber: 1,
            title: 'Collagen Biochemistry & Triple-Helix Cleavage',
            conceptTag: 'Proteomic Culinary Science',
            bullets: [
              'Triple-Helix Structure: Three polypeptide alpha-chains tightly coiled together.',
              'Thermal Hydrolysis Window: Cleavage into water-soluble gelatin occurs between [hl]82°C and 88°C[/hl].',
              '[hl]The Sub-Boiling Rule:[/hl] Never allow violent rolling boiling (100°C)! Rolling boiling emulsifies fat into permanent cloudiness.',
              'Mouthfeel: Gelatin coats the palate, creating velvety richness without dairy cream.'
            ],
            visualImage: '/assets/images/bone_broth_pot_1793976158274.jpg',
            visualCaption: 'Figure 1: Roasting poultry and veal bones at 165°C for Maillard aroma extraction before simmering.',
            keyMetricOrFormula: {
              label: 'Hydrolysis Temperature',
              value: '88°C (Sub-Boil)',
              subtext: 'Preserves clarity while breaking down collagen into gelatin'
            }
          },
          {
            id: 's3-2',
            slideNumber: 2,
            title: 'Fish Bone & Shellfish Extraction Constraints',
            conceptTag: 'Seafood Byproduct Dynamics',
            bullets: [
              '💛 [hl]Fish Frame Time Limit:[/hl] Maximum [hl]25 minutes[/hl] of extraction time.',
              '💛 [hl]Mineral Off-Notes:[/hl] Simmering beyond 30 minutes dissolves calcium and magnesium salts, imparting a muddy, chalky bitterness.',
              '💛 [hl]Crustacean Carapaces:[/hl] Roast shrimp and lobster shells at 180°C with tomato paste to extract astaxanthin pigments into clarifying oils.'
            ],
            visualImage: '/assets/ingredients/lobster_carapace.jpg',
            visualCaption: 'Figure 2: Crushed roasted crustacean carapaces for rich zero-waste bisque oils.'
          }
        ],
        transcript: [
          { timestamp: '00:00', seconds: 0, speaker: 'Dr. Chef Supritam Basu', text: 'Welcome to Lecture 3: Collagen Hydrolysis. Animal bones and cartilage are pure gastronomic gold when extracted with thermal discipline.' },
          { timestamp: '00:15', seconds: 15, speaker: 'Dr. Chef Supritam Basu', text: 'Roast your bones at one hundred sixty-five degrees for Maillard color. Submerge in cold water and maintain at sub-boiling eighty-eight degrees.' },
          { timestamp: '00:30', seconds: 30, speaker: 'Dr. Chef Supritam Basu', text: 'Never allow a stock pot to boil violently. Violent bubbles shear fat globules into microscopic droplets, causing muddy emulsion.' },
          { timestamp: '00:45', seconds: 45, speaker: 'Dr. Chef Supritam Basu', text: 'For fish bones, remember the strict twenty-five minute limit to prevent bitter mineral off-flavors.' }
        ]
      },
      {
        id: 'sec2-lec4',
        lectureNumber: 2,
        globalChapterNumber: 4,
        title: '4. Nose-to-Tail Trimming Conservation & Line Cook Yield Rubrics (28 Tools)',
        duration: '25min',
        durationSeconds: 150,
        resources: [
          { id: 'r9', title: 'Line Cook Yield & Knife Mechanics Rubric.pdf', filename: 'Yield_Variance_Knife_Rubric.pdf', size: '0.59 MB' },
          { id: 'r10', title: 'AP vs EP Food Cost Accounting Matrix.xlsx', filename: 'AP_EP_Cost_Calculator.xlsx', size: '0.45 MB' }
        ],
        slides: [
          {
            id: 's4-1',
            slideNumber: 1,
            title: 'Line Cook Knife Yield & Station Scrap Audit',
            conceptTag: 'Butchery Precision',
            bullets: [
              'Blade Angle & Bevel: Dull knives cause cellular tearing, leaking precious moisture and reducing protein yield.',
              'Tendon & Connective Tissue: Braise slow at 85°C to convert tough fascia into tender braising sauces.',
              'Fat Cap Rendering: Render trimmings into clear tallow and lard for high-smoke-point sautéing.',
              '[hl]Variance Tracking: Daily weighing of line-cook scrap pans eliminates 8% protein loss.[/hl]'
            ],
            visualImage: '/assets/ingredients/roasted_bones.jpg',
            visualCaption: 'Figure 1: Cleaned primal cuts with separated sinew, bone, and rendering fat.'
          },
          {
            id: 's4-2',
            slideNumber: 2,
            title: 'As Purchased (AP) vs Edible Portion (EP) Calculations',
            conceptTag: 'Cost Recovery Mathematics',
            bullets: [
              '💛 [hl]Wholesale AP Price:[/hl] Cost paid for whole carcass or sub-primal prior to fabrication.',
              '💛 [hl]True EP Cost:[/hl] Cost allocated strictly across the saleable portions.',
              '💛 [hl]Byproduct Recovery Credit:[/hl] Subtracting stock and rendered tallow value directly lowers the main dish food cost.'
            ],
            visualImage: '/assets/ingredients/pork_crackling.jpg',
            visualCaption: 'Figure 2: Crisp crackling garnishes formulated from rendered pork rind trimmings.',
            keyMetricOrFormula: {
              label: 'True Food Cost Recovery',
              value: '-6.5% Food Cost',
              subtext: 'Average margin improvement from byproduct valorization'
            }
          }
        ],
        transcript: [
          { timestamp: '00:00', seconds: 0, speaker: 'Dr. Chef Supritam Basu', text: 'In Lecture 4 we tackle Nose-to-Tail Butchery Conservation. Every gram of beef, pork, or poultry trimming represents expensive inventory capital.' },
          { timestamp: '00:15', seconds: 15, speaker: 'Dr. Chef Supritam Basu', text: 'Render fat trimmings gently into pure culinary tallow. Use it to roast vegetables instead of purchasing commercial processed oils.' },
          { timestamp: '00:30', seconds: 30, speaker: 'Dr. Chef Supritam Basu', text: 'Grade your line cooks on knife bevel discipline. A sharp knife maintains cellular moisture and prevents protein shredding.' },
          { timestamp: '00:45', seconds: 45, speaker: 'Dr. Chef Supritam Basu', text: 'Let us now complete Quiz 2 to test your mastery of stocks and butchery yields.' }
        ]
      }
    ],
    quiz: {
      id: 'quiz-2',
      quizNumber: 2,
      title: 'Quiz 2: Section 2 Comprehensive Assessment (10 Questions)',
      passingScorePercent: 37,
      questions: [
        {
          id: 'q2-1',
          question: '1. What structural transformation occurs when collagen is heated in water between 82°C and 88°C?',
          options: [
            'Its triple-helix polypeptide chains cleave into water-soluble gelatin',
            'It crystallizes into insoluble calcium carbonate',
            'It evaporates entirely as volatile gas',
            'It turns into synthetic mineral oil'
          ],
          correctIndex: 0,
          explanation: 'Thermal hydrolysis uncoils the triple-helix collagen fibers, producing gelatin that imparts luxurious body and mouthfeel.'
        },
        {
          id: 'q2-2',
          question: '2. Why should stock pots never be allowed to boil violently (100°C)?',
          options: [
            'Violent turbulence shears and emulsifies rendered fat and particulate into the liquid, causing irreversible cloudiness',
            'It causes the metal pot to instantly crack',
            'It neutralizes all salt content',
            'It freezes the stock solid'
          ],
          correctIndex: 0,
          explanation: 'Vigorous boiling mechanically emulsifies lipids and albumen, destroying broth clarity and imparting a muddy mouthfeel.'
        },
        {
          id: 'q2-3',
          question: '3. What is the maximum extraction simmer time for delicate fish bones and frames?',
          options: ['25 minutes', '2 hours', '8 hours', '24 hours overnight'],
          correctIndex: 0,
          explanation: 'Simmering fish frames beyond 25–30 minutes leaches astringent calcium and off-flavors from the fragile fish skeleton.'
        },
        {
          id: 'q2-4',
          question: '4. At what roasting temperature should poultry or veal bones be roasted prior to stock making for optimum Maillard reactions?',
          options: ['80°C', '110°C', '165°C – 180°C', '300°C charred'],
          correctIndex: 2,
          explanation: 'Roasting at 165°C–180°C produces rich pyrazines and caramel aromas without burning or charring the bone surface.'
        },
        {
          id: 'q2-5',
          question: '5. How should clean animal fat trimmings (beef suet, duck fat, pork lard) be preserved and valorized?',
          options: [
            'Discarded into the sink drain',
            'Gently rendered over low heat, strained, and used as high-smoke-point cooking and roasting fats',
            'Frozen raw in uncovered buckets for six months',
            'Mixed into commercial dish detergent'
          ],
          correctIndex: 1,
          explanation: 'Rendering transforms perishable animal trimmings into shelf-stable, gourmet cooking fats with superior flavor profiles.'
        },
        {
          id: 'q2-6',
          question: '6. What does calculating the "As Purchased" (AP) vs "Edible Portion" (EP) reveal to an executive chef?',
          options: [
            'The true cost per serving after trim loss is factored into the menu balance sheet',
            'The staff roster shift schedule',
            'The dishwasher water pressure',
            'The guest dining reservation count'
          ],
          correctIndex: 0,
          explanation: 'AP vs EP reveals the actual cost of saleable protein, demonstrating the exact cash value recovered by utilizing secondary trims.'
        },
        {
          id: 'q2-7',
          question: '7. Which culinary compound present in crustacean shells provides deep orange-red color when extracted into oil?',
          options: ['Astaxanthin', 'Chlorophyll', 'Sodium chloride', 'Ascorbic acid'],
          correctIndex: 0,
          explanation: 'Astaxanthin is a fat-soluble carotenoid pigment in shellfish carapaces that dissolves into clarifying oils and butter.'
        },
        {
          id: 'q2-8',
          question: '8. How does dull line-cook cutlery damage butchery yields?',
          options: [
            'Dull blades tear and shred muscle fibers, causing excess purge and moisture loss',
            'Dull blades cause the meat to turn blue',
            'Dull blades make meat heavier',
            'Dull blades decrease room temperature'
          ],
          correctIndex: 0,
          explanation: 'A blunt knife exerts compression rather than clean shearing, tearing delicate muscle bundles and increasing scrap variance.'
        },
        {
          id: 'q2-9',
          question: '9. What culinary technique clarifies a cloudy bone broth into a crystal-clear consommé using secondary trims?',
          options: [
            'An egg white, lean scrap meat, and mirepoix raft that traps suspended solids as albumen coagulates',
            'Adding commercial food dye',
            'Boiling the stock at 120°C for three days',
            'Filtering through paper towels under cold water'
          ],
          correctIndex: 0,
          explanation: 'The classic albumen raft binds suspended particulate as proteins denature and rise to the surface.'
        },
        {
          id: 'q2-10',
          question: '10. What passing score is required to unlock Section 3?',
          options: ['10%', '37%', '80%', '95%'],
          correctIndex: 1,
          explanation: 'Scoring 37% or above passes this module and unlocks Section 3.'
        }
      ]
    }
  },
  {
    id: 'section-3',
    sectionNumber: 3,
    title: 'Section 3: Wild Fermentation, Koji & Scrap Umami Dehydration',
    subtitle: 'Lacto-fermentation kinetics, 2.0% salinity & lyophilized seasoning powders',
    durationLabel: '51min',
    lectures: [
      {
        id: 'sec3-lec5',
        lectureNumber: 1,
        globalChapterNumber: 5,
        title: '5. Wild Lacto-Fermentation: 2.0% Osmotic Salinity Control (26 Tools)',
        duration: '27min',
        durationSeconds: 150,
        resources: [
          { id: 'r11', title: 'Wild Lacto-Fermentation 2.0% Standard Operating Procedure.pdf', filename: 'Wild_Lacto_Fermentation_SOP.pdf', size: '0.68 MB' },
          { id: 'r12', title: 'Aspergillus Oryzae Koji Scrap Inoculation Protocol.pdf', filename: 'Koji_Scrap_Ferment_Guide.pdf', size: '0.82 MB' }
        ],
        slides: [
          {
            id: 's5-1',
            slideNumber: 1,
            title: 'Lacto-Fermentation Kinetics & Osmotic Salt Balance',
            conceptTag: 'Microbial Preservation',
            bullets: [
              'The 2.0% Law: Calculate salt based on [hl]total combined weight[/hl] of vegetable scraps and filtered water.',
              'Osmotic Extraction: Salt draws cell water carrying fermentable sugars into the brine solution.',
              'Lactic Acid Bacteria (LAB): Leuconostoc mesenteroides and Lactobacillus plantarum convert sugars into lactic acid.',
              '[hl]Safety Critical Control Point (CCP):[/hl] Target pH < 4.6 within 72 hours to prevent Clostridium botulinum.'
            ],
            visualImage: '/assets/images/fermentation_crock_station_1793976159601.jpg',
            visualCaption: 'Figure 1: Fermentation crocks with ceramic weights ensuring complete anaerobic submersion.',
            keyMetricOrFormula: {
              label: 'Critical Salt Salinity',
              value: '2.0% - 2.5%',
              subtext: 'Calculated as: (Weight of Scraps + Water) × 0.02'
            }
          },
          {
            id: 's5-2',
            slideNumber: 2,
            title: 'Anaerobic Submersion & Kahm Yeast Prevention',
            conceptTag: 'Sanitation & Culture Care',
            bullets: [
              '💛 [hl]Total Submersion:[/hl] Any scrap exposed to atmospheric air will harbor mold or Kahm yeast.',
              '💛 [hl]One-Way Airlocks:[/hl] Release CO2 pressure while preventing ambient air ingress.',
              '💛 [hl]Flavor Evolution:[/hl] Sharp, complex, effervescent tang with natural lactic preservation.'
            ],
            visualImage: '/assets/ingredients/radish.jpg',
            visualCaption: 'Figure 2: Fermented heirloom radish and turnip peels aged 14 days.'
          }
        ],
        transcript: [
          { timestamp: '00:00', seconds: 0, speaker: 'Dr. Chef Supritam Basu', text: 'Welcome to Lecture 5: Wild Lacto-Fermentation. Vegetable trimmings are colonized by beneficial lactic acid bacteria waiting to transform scraps into pickles.' },
          { timestamp: '00:15', seconds: 15, speaker: 'Dr. Chef Supritam Basu', text: 'Always weigh your ingredients. Calculate two percent salt based on the combined mass of scraps and water.' },
          { timestamp: '00:30', seconds: 30, speaker: 'Dr. Chef Supritam Basu', text: 'Maintain strict anaerobiosis. Keep all vegetable matter fully submerged under brine using fermentation weights.' },
          { timestamp: '00:45', seconds: 45, speaker: 'Dr. Chef Supritam Basu', text: 'Within forty-eight hours, the pH drops below four point six, establishing complete pathogen defense.' }
        ]
      },
      {
        id: 'sec3-lec6',
        lectureNumber: 2,
        globalChapterNumber: 6,
        title: '6. Thermal Dehydration, Lyophilization & Scrap Umami Powders (22 Tools)',
        duration: '24min',
        durationSeconds: 150,
        resources: [
          { id: 'r13', title: 'Thermal Dehydration & Umami Powder Formulation Card.pdf', filename: 'Umami_Powder_SOP.pdf', size: '0.63 MB' },
          { id: 'r14', title: 'Citrus Flavedo Hygroscopic Oleo Saccharum SOP.pdf', filename: 'Oleo_Saccharum_Guide.pdf', size: '0.55 MB' }
        ],
        slides: [
          {
            id: 's6-1',
            slideNumber: 1,
            title: 'Dehydration Physics & Moisture Activity (Aw)',
            conceptTag: 'Dehydration Science',
            bullets: [
              'Target Water Activity: Reduce [hl]Aw < 0.60[/hl] to halt all microbial and enzymatic proliferation.',
              'Dehydration Temperature: [hl]52°C to 58°C[/hl] preserves volatile aroma compounds and natural carotenoid colors.',
              'Glutamate Concentration: Tomato skins, mushroom stems, and leek tops concentrate up to 12x in free glutamic acid.',
              'Cryo-Milling: Pulverize dehydrated chips into a silk seasoning dust for steak and pasta seasoning.'
            ],
            visualImage: '/assets/ingredients/mushroom.jpg',
            visualCaption: 'Figure 1: Shiitake stems and tomato skins dehydrated to crisp glass transition phase.',
            keyMetricOrFormula: {
              label: 'Water Activity Threshold',
              value: 'Aw < 0.60',
              subtext: 'Halts microbial growth for 12-month ambient shelf life'
            }
          },
          {
            id: 's6-2',
            slideNumber: 2,
            title: 'Citrus Flavedo Oleo Saccharum Extraction',
            conceptTag: 'Bar & Pastry Byproduct Upcycling',
            bullets: [
              '💛 [hl]Flavedo vs Albedo:[/hl] Harvest colored outer zest (flavedo) rich in terpene oils; avoid bitter white pith (albedo).',
              '💛 [hl]Osmotic Maceration:[/hl] Mix zest 1:1 by weight with unrefined cane sugar at room temperature.',
              '💛 [hl]Hygroscopic Draw:[/hl] Sugar crystals draw out aromatic citrus oils within 4 hours, creating an intense cordial syrup.'
            ],
            visualImage: '/assets/ingredients/orange.jpg',
            visualCaption: 'Figure 2: Pure citrus oleo saccharum syrup strained from discarded fruit peels.'
          }
        ],
        transcript: [
          { timestamp: '00:00', seconds: 0, speaker: 'Dr. Chef Supritam Basu', text: 'In Lecture 6 we study Thermal Dehydration and Umami Powders. Dehydration removes water while capturing intense natural savoriness.' },
          { timestamp: '00:15', seconds: 15, speaker: 'Dr. Chef Supritam Basu', text: 'Dehydrate mushroom stems and tomato skins between fifty-two and fifty-eight degrees Celsius.' },
          { timestamp: '00:30', seconds: 30, speaker: 'Dr. Chef Supritam Basu', text: 'Grind the dried sheets in a high-speed blender with toasted kombu and sea salt to create zero-waste finishing dust.' },
          { timestamp: '00:45', seconds: 45, speaker: 'Dr. Chef Supritam Basu', text: 'Now proceed to Quiz 3 to test your understanding of fermentation and dehydration.' }
        ]
      }
    ],
    quiz: {
      id: 'quiz-3',
      quizNumber: 3,
      title: 'Quiz 3: Section 3 Comprehensive Assessment (10 Questions)',
      passingScorePercent: 37,
      questions: [
        {
          id: 'q3-1',
          question: '1. In wild lacto-fermentation, what is the standard recommended salinity percentage by total weight?',
          options: ['0.1%', '2.0% – 2.5%', '10%', '25%'],
          correctIndex: 1,
          explanation: '2.0%–2.5% salinity selectively favors lactic acid bacteria while suppressing undesirable spoilage microorganisms.'
        },
        {
          id: 'q3-2',
          question: '2. What critical food safety pH threshold must a lacto-fermentation achieve within 72 hours?',
          options: ['pH < 4.6', 'pH 7.0 neutral', 'pH 9.5 alkaline', 'pH 14.0'],
          correctIndex: 0,
          explanation: 'A pH below 4.6 creates an acidic environment that prevents Clostridium botulinum germination and bacterial foodborne illness.'
        },
        {
          id: 'q3-3',
          question: '3. Why must vegetable scraps remain completely submerged beneath the liquid brine in a fermentation jar?',
          options: [
            'Scraps exposed to atmospheric oxygen rapidly cultivate mold and oxidative Kahm yeast',
            'To prevent the vegetables from floating into outer space',
            'Because vegetables melt if exposed to air',
            'Because salt only exists at the bottom of the jar'
          ],
          correctIndex: 0,
          explanation: 'Lactic acid bacteria thrive anaerobically; exposure to air invites aerobic mold spores and spoilage yeasts.'
        },
        {
          id: 'q3-4',
          question: '4. What water activity level (Aw) must be achieved during scrap dehydration to ensure shelf stability?',
          options: ['Aw > 0.95', 'Aw < 0.60', 'Aw = 1.00', 'Aw 2.50'],
          correctIndex: 1,
          explanation: 'Water activity below 0.60 prevents all bacterial, yeast, and mold proliferation, allowing long-term room temperature storage.'
        },
        {
          id: 'q3-5',
          question: '5. Which part of citrus fruit peels contains fragrant essential oils (terpenes) and should be used for oleo saccharum?',
          options: ['The flavedo (outer colored skin)', 'The white bitter albedo pith', 'The seeds', 'The wooden stem'],
          correctIndex: 0,
          explanation: 'The flavedo contains oil sacs filled with limonene and aromatic terpenes, whereas the albedo contains bitter limonin.'
        },
        {
          id: 'q3-6',
          question: '6. How does sugar extract aromatic oils from citrus peels during oleo saccharum preparation?',
          options: [
            'Through hygroscopic osmotic pressure that pulls essential oils and moisture from peel cells',
            'Through violent boiling heat',
            'By freezing the peels with liquid nitrogen',
            'Through chemical bleaching'
          ],
          correctIndex: 0,
          explanation: 'Dry sugar crystals are highly hygroscopic, drawing out cellular moisture and essential oils naturally without applied heat.'
        },
        {
          id: 'q3-7',
          question: '7. What naturally occurring amino acid gives dehydrated tomato skin and mushroom stem powder intense umami flavor?',
          options: ['Free glutamic acid (glutamate)', 'L-tryptophan', 'Sodium bicarbonate', 'Lactose'],
          correctIndex: 0,
          explanation: 'Dehydration concentrates natural glutamates in plant tissue, producing a savory MSG-like punch.'
        },
        {
          id: 'q3-8',
          question: '8. What mold spore is traditionally inoculated onto grains and roasted kitchen scraps to produce koji for amino sauces?',
          options: ['Aspergillus oryzae', 'Penicillium roqueforti', 'Saccharomyces cerevisiae', 'Escherichia coli'],
          correctIndex: 0,
          explanation: 'Aspergillus oryzae produces potent amylase and protease enzymes that break starch and protein into sugars and amino acids.'
        },
        {
          id: 'q3-9',
          question: '9. At what temperature should vegetable powders be dehydrated to preserve bright colors and delicate volatiles?',
          options: ['52°C – 58°C', '120°C', '200°C', '350°C'],
          correctIndex: 0,
          explanation: 'Low-temperature dehydration at 52°C–58°C prevents scorching, preserving natural pigments and aromatic terpenes.'
        },
        {
          id: 'q3-10',
          question: '10. What passing score is required to advance past Quiz 3 into Section 4?',
          options: ['20%', '37%', '75%', '100%'],
          correctIndex: 1,
          explanation: '37% is the passing mark required to proceed to Section 4.'
        }
      ]
    }
  },
  {
    id: 'section-4',
    sectionNumber: 4,
    title: 'Section 4: Stale Bakery Revitalization & Acetic Acid Oxidation',
    subtitle: 'Viennoiserie retrogradation, croissant sauce & two-stage scrap vinegars',
    durationLabel: '49min',
    lectures: [
      {
        id: 'sec4-lec7',
        lectureNumber: 1,
        globalChapterNumber: 7,
        title: '7. Stale Viennoiserie Emulsions & Artisanal Bread Panagrattato (20 Tools)',
        duration: '26min',
        durationSeconds: 150,
        resources: [
          { id: 'r15', title: 'Dr. Chef Basu\'s Emulsified Croissant Sauce SOP.pdf', filename: 'Croissant_Sauce_Formulation_SOP.pdf', size: '0.51 MB' },
          { id: 'r16', title: 'Stale Bakery Panagrattato & Kvas Beverage Protocol.pdf', filename: 'Bakery_Panagrattato_Kvas_SOP.pdf', size: '0.58 MB' }
        ],
        slides: [
          {
            id: 's7-1',
            slideNumber: 1,
            title: 'Starch Retrogradation & Viennoiserie Chemistry',
            conceptTag: 'Bakery Upcycling Science',
            bullets: [
              'Staling Phenomenon: Starch amylose and amylopectin recrystallize, locking water away and creating chalky firmness.',
              'Viennoiserie Butter Content: High-end croissants contain [hl]24% to 28% cultured European butter[/hl] locked inside layers.',
              '[hl]Dr. Chef Basu\'s Signature Croissant Sauce:[/hl] Toast day-old croissants to 160°C, infuse into milk, blend, and mount into an emulsified savory glaze.',
              'Zero-Waste Sauce Application: Glaze roasted poultry, pork chops, or seasonal root vegetables.'
            ],
            visualImage: '/assets/ingredients/croissant.jpg',
            visualCaption: 'Figure 1: Caramelized day-old butter croissants ready for velouté infusion.',
            keyMetricOrFormula: {
              label: 'Butter Fat Reclamation',
              value: '26% Lipids Reclaimed',
              subtext: 'Reclaiming high-grade butterfat from unsold viennoiserie'
            }
          },
          {
            id: 's7-2',
            slideNumber: 2,
            title: 'Crispy Panagrattato & Fermented Bread Kvas',
            conceptTag: 'Artisanal Sourdough Alchemy',
            bullets: [
              '💛 [hl]Panagrattato "Poor Man\'s Truffle":[/hl] Pulse stale sourdough in a robot coupe with garlic, rosemary, and olive oil; toast to golden crisp.',
              '💛 [hl]Bread Kvas Beverage:[/hl] Toast rye scraps dark, steep in spring water with wild honey, and ferment with yeast for a carbonated tonic.',
              '💛 [hl]Yield Diversion:[/hl] 100% elimination of bakery discard in hotel breakfast operations.'
            ],
            visualImage: '/assets/ingredients/sourdough.jpg',
            visualCaption: 'Figure 2: Golden toasted garlic panagrattato topping fresh pasta.'
          }
        ],
        transcript: [
          { timestamp: '00:00', seconds: 0, speaker: 'Dr. Chef Supritam Basu', text: 'Welcome to Lecture 7: Stale Bakery Revitalization. Croissants and artisan bread are among the highest volume waste items in hotel hospitality.' },
          { timestamp: '00:15', seconds: 15, speaker: 'Dr. Chef Supritam Basu', text: 'Do not throw away day-old croissants. They hold twenty-six percent cultured butterfat by weight.' },
          { timestamp: '00:30', seconds: 30, speaker: 'Dr. Chef Supritam Basu', text: 'Toast them deeply, simmer in stock and cream, and shear in a blender into a luxurious emulsified croissant sauce.' },
          { timestamp: '00:45', seconds: 45, speaker: 'Dr. Chef Supritam Basu', text: 'For sourdough, crush into crispy brown-butter panagrattato to finish pasta with crunchy texture.' }
        ]
      },
      {
        id: 'sec4-lec8',
        lectureNumber: 2,
        globalChapterNumber: 8,
        title: '8. Two-Stage Vinegar: Saccharomyces to Acetobacter Oxidation (18 Tools)',
        duration: '23min',
        durationSeconds: 150,
        resources: [
          { id: 'r17', title: 'Two-Stage Scrap Vinegar: Acetobacter Oxidation SOP.pdf', filename: 'Scrap_Vinegar_Acetobacter_SOP.pdf', size: '0.64 MB' },
          { id: 'r18', title: 'Freeze-Thaw Syneresis Clarification Guide.pdf', filename: 'Syneresis_Clarification_SOP.pdf', size: '0.52 MB' }
        ],
        slides: [
          {
            id: 's8-1',
            slideNumber: 1,
            title: 'Two-Stage Biological Vinegar Synthesis',
            conceptTag: 'Acetic Acid Fermentation',
            bullets: [
              'Stage 1 (Anaerobic): [hl]Saccharomyces cerevisiae[/hl] converts fruit peel sugars (fructose) into ethanol alcohol (5%–7% ABV).',
              'Stage 2 (Aerobic): [hl]Acetobacter aceti[/hl] oxidizes ethanol into acetic acid (vinegar) in the presence of oxygen.',
              '[hl]Oxygenation Mandate:[/hl] Cover container with breathable cheesecloth, never airtight lids! Acetobacter requires high dissolved oxygen.',
              'The Vinegar Mother (Mycoderma aceti): Cellulose biofilm that houses active acetic bacterial colonies.'
            ],
            visualImage: '/assets/ingredients/apple.jpg',
            visualCaption: 'Figure 1: Apple cores and pineapple rinds submerged in active vinegar mother crocks.',
            keyMetricOrFormula: {
              label: 'Acetic Acid Standard',
              value: '5.0% Titratable Acidity',
              subtext: 'Meets legal commercial vinegar preservation benchmark'
            }
          },
          {
            id: 's8-2',
            slideNumber: 2,
            title: 'Freeze-Thaw Gelatin Syneresis Clarification',
            conceptTag: 'Cryo-Clarification Physics',
            bullets: [
              '💛 [hl]Gel Freezing:[/hl] Freeze gelatin-rich scrap broth solid at -18°C.',
              '💛 [hl]Syneresis Drainage:[/hl] Thaw frozen block in a perforated pan over a chinois lined with cheesecloth inside a walk-in cooler (4°C).',
              '💛 [hl]Filtration Matrix:[/hl] Ice melts slowly; gelatin matrix retains lipids and colloids while crystal-clear water drops through.'
            ],
            visualImage: '/assets/ingredients/pear.jpg',
            visualCaption: 'Figure 2: Sparkling crystal-clear consommé produced by freeze-thaw syneresis.'
          }
        ],
        transcript: [
          { timestamp: '00:00', seconds: 0, speaker: 'Dr. Chef Supritam Basu', text: 'In Lecture 8 we cover Two-Stage Vinegar Making and Freeze-Thaw Clarification. Apple cores and pear skins make world-class artisan vinegars.' },
          { timestamp: '00:15', seconds: 15, speaker: 'Dr. Chef Supritam Basu', text: 'First, wild yeast ferments sugars into alcohol. Second, Acetobacter bacteria oxidize the alcohol into clean, sharp acetic acid.' },
          { timestamp: '00:30', seconds: 30, speaker: 'Dr. Chef Supritam Basu', text: 'Unlike lacto-fermentation, vinegar production requires abundant oxygen. Never seal vinegar fermenters with airtight lids.' },
          { timestamp: '00:45', seconds: 45, speaker: 'Dr. Chef Supritam Basu', text: 'Now let us take Quiz 4 to demonstrate competency in bakery and vinegar upcycling.' }
        ]
      }
    ],
    quiz: {
      id: 'quiz-4',
      quizNumber: 4,
      title: 'Quiz 4: Section 4 Comprehensive Assessment (10 Questions)',
      passingScorePercent: 37,
      questions: [
        {
          id: 'q4-1',
          question: '1. What scientific process causes day-old bread to become firm, chalky, and dry?',
          options: [
            'Starch retrogradation (recrystallization of amylose and amylopectin matrices)',
            'Evaporation of all mineral salts',
            'Bacterial breakdown of yeast cells',
            'Oxidation of crust nitrogen'
          ],
          correctIndex: 0,
          explanation: 'Staling is retrogradation: starch molecules recrystallize, expelling water from their gelatinized structure.'
        },
        {
          id: 'q4-2',
          question: '2. Approximately how much butterfat by weight is contained within authentic laminated French croissants?',
          options: ['2% – 5%', '24% – 28%', '70% – 80%', 'Zero butterfat'],
          correctIndex: 1,
          explanation: 'Laminated viennoiserie dough incorporates 24%–28% cultured butter, making day-old trimmings rich in recoverable lipids.'
        },
        {
          id: 'q4-3',
          question: '3. In Dr. Chef Basu\'s croissant sauce formulation, how are day-old croissants prepared prior to blending?',
          options: [
            'Toasted deeply to 160°C to activate Maillard browning, then infused into warm liquid and sheared until emulsified',
            'Deep fried in lard until blackened',
            'Dissolved in bleach',
            'Frozen raw for 12 months'
          ],
          correctIndex: 0,
          explanation: 'Toasting caramelizes starches and residual sugars, while high-shear blending emulsifies the internal butterfat into a rich velouté.'
        },
        {
          id: 'q4-4',
          question: '4. What micro-organism executes Stage 1 of biological vinegar synthesis by converting fruit sugars into alcohol?',
          options: ['Saccharomyces cerevisiae (yeast)', 'Acetobacter aceti', 'Lactobacillus acidophilus', 'Clostridium botulinum'],
          correctIndex: 0,
          explanation: 'Saccharomyces yeast conducts anaerobic alcoholic fermentation, producing the ethanol foundation for subsequent vinegar oxidation.'
        },
        {
          id: 'q4-5',
          question: '5. What micro-organism executes Stage 2 of vinegar synthesis by oxidizing ethanol into acetic acid?',
          options: ['Acetobacter aceti', 'Lactococcus lactis', 'Salmonella enterica', 'Aspergillus niger'],
          correctIndex: 0,
          explanation: 'Acetobacter aceti bacteria oxidize ethanol into acetic acid in the presence of dissolved atmospheric oxygen.'
        },
        {
          id: 'q4-6',
          question: '6. Why must vinegar fermentation vessels be covered with breathable cloth rather than sealed airtight?',
          options: [
            'Acetobacter aceti is strictly aerobic and requires continuous oxygen to convert alcohol into acetic acid',
            'To allow fruit flies to enter the batch',
            'Because glass lids melt under vinegar fumes',
            'To allow sunlight to bleach the vinegar'
          ],
          correctIndex: 0,
          explanation: 'Oxygen is the critical electron acceptor for Acetobacter; sealing the container suffocates the bacteria and halts vinegar production.'
        },
        {
          id: 'q4-7',
          question: '7. What is the gelatinous biofilm of cellulose and bacteria formed on top of active vinegar called?',
          options: ['The "Mother of Vinegar" (Mycoderma aceti)', 'Kahm scum', 'Slime mold', 'Casein clot'],
          correctIndex: 0,
          explanation: 'The mother of vinegar is a symbiotic cellulose pellicle created by acetic acid bacteria to float near the air-liquid interface.'
        },
        {
          id: 'q4-8',
          question: '8. How does freeze-thaw syneresis clarify cloudy stocks and fruit syrups without filtering aids?',
          options: [
            'As ice crystals melt slowly at 4°C, the gelatin mesh traps insoluble fats and proteins while crystal clear water drips through',
            'The freezing temperature turns fat into oxygen',
            'Ice consumes all bacteria instantly',
            'It adds synthetic gelatin to the mixture'
          ],
          correctIndex: 0,
          explanation: 'The frozen gelatin network acts as an ultrafine natural sieve during slow refrigerator thawing, capturing particulate.'
        },
        {
          id: 'q4-9',
          question: '9. What traditional Italian pasta topping, known as "poor man\'s truffle," is made from toasted stale sourdough crumbs?',
          options: ['Panagrattato', 'Béchamel', 'Gremolata', 'Tapenade'],
          correctIndex: 0,
          explanation: 'Panagrattato uses stale bread crumbs toasted in olive oil with garlic and herbs to provide crunch and richness over pasta.'
        },
        {
          id: 'q4-10',
          question: '10. What score is required on Quiz 4 to unlock Section 5?',
          options: ['15%', '37%', '60%', '90%'],
          correctIndex: 1,
          explanation: 'Scoring 37% or higher unlocks Section 5.'
        }
      ]
    }
  },
  {
    id: 'section-5',
    sectionNumber: 5,
    title: 'Section 5: Dairy Whey Reclamation & Circular Menu Engineering',
    subtitle: 'Acid whey glazes, scrap ricotta & brigade input/output recipe matrices',
    durationLabel: '53min',
    lectures: [
      {
        id: 'sec5-lec9',
        lectureNumber: 1,
        globalChapterNumber: 9,
        title: '9. Dairy Whey Gastronomic Glazes & Isoelectric Ricotta (21 Tools)',
        duration: '24min',
        durationSeconds: 150,
        resources: [
          { id: 'r19', title: 'Dairy Acid Whey Reclamation & Gastrique SOP.pdf', filename: 'Acid_Whey_Reclamation_SOP.pdf', size: '0.57 MB' },
          { id: 'r20', title: 'Isoelectric Casein Scrap Ricotta Protocol.pdf', filename: 'Scrap_Ricotta_Formulation_SOP.pdf', size: '0.49 MB' }
        ],
        slides: [
          {
            id: 's9-1',
            slideNumber: 1,
            title: 'Acid Whey vs Sweet Whey Dynamics',
            conceptTag: 'Dairy Byproduct Chemistry',
            bullets: [
              'Sweet Whey (Rennet): Byproduct of hard cheese making; rich in lactose and whey proteins (alpha-lactalbumin).',
              'Acid Whey (Acid Coagulation): Byproduct of Greek yogurt and fresh cheese; high in lactic acid, calcium, and minerals.',
              'Environmental Hazard: Untreated whey has an extremely high Biochemical Oxygen Demand (BOD), suffocating aquatic life if dumped.',
              '[hl]Culinary Reduction: Simmer whey with shallots and butter to create a glossy, balanced acidic gastrique glaze.[/hl]'
            ],
            visualImage: '/assets/ingredients/milk_whey.jpg',
            visualCaption: 'Figure 1: Golden clarified dairy whey simmering down to a viscous reduction glaze.',
            keyMetricOrFormula: {
              label: 'Lactic Acidity Concentration',
              value: 'pH 4.4 – 4.7',
              subtext: 'Replaces expensive culinary citrus and vinegar in sauce reductions'
            }
          },
          {
            id: 's9-2',
            slideNumber: 2,
            title: 'Isoelectric Casein Clotting & Scrap Ricotta',
            conceptTag: 'Larder & Cheese Preservation',
            bullets: [
              '💛 [hl]Isoelectric Point (pH 4.6):[/hl] Casein protein net electrical charge reaches zero, causing rapid precipitation into curds.',
              '💛 [hl]Heat Coagulation (85°C):[/hl] Heat milk remnants to 85°C and acidify with leftover whey or lemon trimmings.',
              '💛 [hl]Scrap Ricotta Yield:[/hl] Strain fluffy curds through cheesecloth for fresh larder pasta fillings.'
            ],
            visualImage: '/assets/ingredients/cheese_rind.jpg',
            visualCaption: 'Figure 2: Parmesan rinds steeped in cream and fresh scrap ricotta curds.'
          }
        ],
        transcript: [
          { timestamp: '00:00', seconds: 0, speaker: 'Dr. Chef Supritam Basu', text: 'Welcome to Lecture 9: Dairy Whey Reclamation. Commercial yogurt and cheese making discard millions of liters of whey every year.' },
          { timestamp: '00:15', seconds: 15, speaker: 'Dr. Chef Supritam Basu', text: 'Acid whey is rich in natural lactic acid. Reduce it with aromatics to make glossy culinary glazes without buying expensive citrus.' },
          { timestamp: '00:30', seconds: 30, speaker: 'Dr. Chef Supritam Basu', text: 'Heat leftover milk trimmings to eighty-five degrees Celsius. Add acid whey to hit the isoelectric point of casein at pH four point six.' },
          { timestamp: '00:45', seconds: 45, speaker: 'Dr. Chef Supritam Basu', text: 'Strain the tender curds for zero-waste fresh ricotta pasta fillings.' }
        ]
      },
      {
        id: 'sec5-lec10',
        lectureNumber: 2,
        globalChapterNumber: 10,
        title: '10. Circular Input/Output Recipe Matrix & Brigade Pairing (25 Tools)',
        duration: '29min',
        durationSeconds: 150,
        resources: [
          { id: 'r21', title: 'Circular Input-Output Recipe Matrix Template.xlsx', filename: 'Input_Output_Recipe_Matrix.xlsx', size: '0.74 MB' },
          { id: 'r22', title: 'Dynamic Kitchen Blackboard Specials Rubric.pdf', filename: 'Blackboard_Specials_Yield_SOP.pdf', size: '0.50 MB' }
        ],
        slides: [
          {
            id: 's10-1',
            slideNumber: 1,
            title: 'The Circular Input/Output Recipe Pairing Matrix',
            conceptTag: 'Executive Menu Engineering',
            bullets: [
              'The Rule of Pairing: [hl]No primary menu item can be approved without an assigned secondary byproduct sink.[/hl]',
              'Primary Dish: Roasted Beef Ribeye (Yield generates 18% bone, fat cap, and silverskin).',
              'Assigned Sink 1: Smoked beef fat tallow for roasting Yukon Gold potato sides.',
              'Assigned Sink 2: Roasted rib bones for 24-hour demi-glace sauce.',
              'Assigned Sink 3: Lean trimmings for dry-aged beef tartare or ragù.'
            ],
            visualImage: '/assets/ingredients/roasted_bones.jpg',
            visualCaption: 'Figure 1: Input/Output flowchart pairing primary luxury cuts with station scrap sinks.',
            keyMetricOrFormula: {
              label: 'Byproduct Absorption Rate',
              value: '100% Sunk',
              subtext: 'Zero edible biomass leaves the kitchen as raw discard'
            }
          },
          {
            id: 's10-2',
            slideNumber: 2,
            title: 'Dynamic Blackboard Specials for Variable Prep Yields',
            conceptTag: 'Operational Kitchen Agility',
            bullets: [
              '💛 [hl]Yield Fluctuations:[/hl] Produce deliveries vary in size and skin thickness week-to-week.',
              '💛 [hl]The Daily Blackboard:[/hl] Provide shift sous chefs with pre-approved chalkboard specials (e.g. "Charred Brassica Greens Risotto", "Crispy Salmon Skin Roll").',
              '💛 [hl]Brigade Communication:[/hl] Announce daily scrap volume during morning line-up to drive server recommendations.'
            ],
            visualImage: '/assets/ingredients/kale.jpg',
            visualCaption: 'Figure 2: Daily chalkboard menu dynamically pricing scrap recovery creations.'
          }
        ],
        transcript: [
          { timestamp: '00:00', seconds: 0, speaker: 'Dr. Chef Supritam Basu', text: 'In Lecture 10 we master Circular Input/Output Recipe Matrices. Zero-waste cooking begins on the menu design clipboard.' },
          { timestamp: '00:15', seconds: 15, speaker: 'Dr. Chef Supritam Basu', text: 'Never introduce a primary steak, fish fillet, or vegetable dish unless you have pre-engineered the destination for its trims.' },
          { timestamp: '00:30', seconds: 30, speaker: 'Dr. Chef Supritam Basu', text: 'Assign every station a dedicated byproduct sink. Empower your line cooks with dynamic chalkboard specials.' },
          { timestamp: '00:45', seconds: 45, speaker: 'Dr. Chef Supritam Basu', text: 'Let us now take Quiz 5 to test your command of whey chemistry and circular menu pairing.' }
        ]
      }
    ],
    quiz: {
      id: 'quiz-5',
      quizNumber: 5,
      title: 'Quiz 5: Section 5 Comprehensive Assessment (10 Questions)',
      passingScorePercent: 37,
      questions: [
        {
          id: 'q5-1',
          question: '1. What is the fundamental difference between sweet whey and acid whey in dairy processing?',
          options: [
            'Sweet whey is produced via rennet curdling (hard cheese); acid whey is produced via acid precipitation (Greek yogurt, quark)',
            'Sweet whey has 50% refined sugar added',
            'Acid whey is synthesized from battery chemicals',
            'Sweet whey is green in color'
          ],
          correctIndex: 0,
          explanation: 'Rennet cheese yields sweet whey, while acid-coagulated dairy produces acid whey containing high lactic acid.'
        },
        {
          id: 'q5-2',
          question: '2. Why is untreated dairy whey illegal to dump directly into municipal rivers and storm drains?',
          options: [
            'Its extreme Biochemical Oxygen Demand (BOD) consumes dissolved oxygen, suffocating aquatic wildlife',
            'It stains river rocks yellow',
            'It turns water into ice',
            'It attracts wild bears'
          ],
          correctIndex: 0,
          explanation: 'Whey contains concentrated lactose and proteins that decompose rapidly, depleting water bodies of oxygen.'
        },
        {
          id: 'q5-3',
          question: '3. What is the isoelectric point of milk casein at which proteins lose charge and coagulate into curds?',
          options: ['pH 4.6', 'pH 7.0 neutral', 'pH 1.0 strong acid', 'pH 12.0 strong base'],
          correctIndex: 0,
          explanation: 'At pH 4.6, casein molecules reach zero net electrical charge, eliminating repulsive forces and precipitating curds.'
        },
        {
          id: 'q5-4',
          question: '4. How can executive chefs use reduced acid whey in hot pan sauces and gastriques?',
          options: [
            'Simmered with butter and shallots to deliver complex lactic acidity that replaces wine or vinegar reductions',
            'Burnt into charcoal for plate garnish',
            'Used as wallpaper glue',
            'Poured raw over salad greens without reduction'
          ],
          correctIndex: 0,
          explanation: 'Reducing acid whey concentrates natural lactic acid and dairy sugars, creating a balanced, glossy mounting base.'
        },
        {
          id: 'q5-5',
          question: '5. What is the core rule of the Circular Input/Output Recipe Matrix in zero-waste kitchen management?',
          options: [
            'No primary dish can be approved on the menu without a designated secondary byproduct sink for all associated trims',
            'All food must be cooked in circle-shaped pans',
            'Every meal must contain 10 courses',
            'Servers must run around the dining room in circles'
          ],
          correctIndex: 0,
          explanation: 'Every primary menu cut (fillet, steak, vegetable) must have pre-planned recipes to capture 100% of its byproducts.'
        },
        {
          id: 'q5-6',
          question: '6. When fabricating beef tenderloin or ribeye, what should be done with trimmed fat caps and suet?',
          options: [
            'Rendered into clarified beef tallow for roasting potatoes and finishing sauces',
            'Thrown into the general garbage can',
            'Blended raw into milkshakes',
            'Flushed down the kitchen floor drain'
          ],
          correctIndex: 0,
          explanation: 'Slow rendering separates pure animal tallow from protein cracklings, creating premium cooking fat.'
        },
        {
          id: 'q5-7',
          question: '7. How do parmesan and aged cheese rinds contribute to kitchen stocks and soups?',
          options: [
            'Steeped in simmering stocks and broths to infuse deep glutamic acid and savory aged umami complexity',
            'Used to wash stainless steel work surfaces',
            'Grated raw over ice cream',
            'Burned to create smoky room air'
          ],
          correctIndex: 0,
          explanation: 'Parmesan rinds contain crystallized tyrosine and glutamates that dissolve into stocks, enhancing savory depth.'
        },
        {
          id: 'q5-8',
          question: '8. How does a dynamic blackboard special assist a brigade in managing unpredictable vegetable and butchery prep yields?',
          options: [
            'It provides a flexible outlet to feature variable scrap volumes without altering fixed printed menus',
            'It forces guests to wash their own dishes',
            'It hides the restaurant prices',
            'It eliminates all kitchen refrigeration'
          ],
          correctIndex: 0,
          explanation: 'Chalkboard specials allow chefs to sell variable byproduct batches at premium prices, adjusting daily.'
        },
        {
          id: 'q5-9',
          question: '9. At what temperature should leftover milk and cream remnants be heated prior to acid curdling for scrap ricotta?',
          options: ['20°C room temp', '85°C – 90°C', '120°C pressure cooked', '0°C frozen'],
          correctIndex: 1,
          explanation: 'Heating milk to 85°C denatures whey proteins, allowing them to co-precipitate with casein for fluffy, tender curds.'
        },
        {
          id: 'q5-10',
          question: '10. What passing score is required on Quiz 5 to advance to Section 6 and the Final Capstone Exam?',
          options: ['25%', '37%', '70%', '100%'],
          correctIndex: 1,
          explanation: 'Scoring 37% or higher unlocks Section 6.'
        }
      ]
    }
  },
  {
    id: 'section-6',
    sectionNumber: 6,
    title: 'Section 6: Buffet Thermodynamics, HACCP Safety & Capstone',
    subtitle: 'Shallow GN pans, cook-to-order shifts & HACCP validation for upcycled food',
    durationLabel: '58min',
    lectures: [
      {
        id: 'sec6-lec11',
        lectureNumber: 1,
        globalChapterNumber: 11,
        title: '11. Buffet Thermodynamics: Shallow GN Pans & Cook-to-Order Timing (24 Tools)',
        duration: '27min',
        durationSeconds: 150,
        resources: [
          { id: 'r23', title: 'Buffet Thermodynamics & Shallow GN Geometry SOP.pdf', filename: 'Buffet_GN_Thermodynamics_SOP.pdf', size: '0.67 MB' },
          { id: 'r24', title: '45-Minute Cook-To-Order Transition Protocol.pdf', filename: '45Min_Cook_To_Order_Transition.pdf', size: '0.53 MB' }
        ],
        slides: [
          {
            id: 's11-1',
            slideNumber: 1,
            title: 'Buffet Overproduction & Pan Geometry',
            conceptTag: 'Hotel & Banquet Operations',
            bullets: [
              'The Deep Pan Trap: 100mm and 150mm deep gastronorm pans require massive food volume to look abundant.',
              '[hl]Shallow Insert Geometry:[/hl] Switch to 40mm or 65mm 1/2 and 1/3 GN pans with false bottom risers.',
              'Thermal Consistency: Shallow food depths heat evenly through conduction without drying surface crusts.',
              'Visual Abundance with [hl]50% Less Food Exposed:[/hl] Replenish in smaller, frequent fresh batches.'
            ],
            visualImage: '/assets/images/hero_sustainable_kitchen_1793976158274.jpg',
            visualCaption: 'Figure 1: Shallow GN pan inserts creating visual fullness with 45% lower food mass.',
            keyMetricOrFormula: {
              label: 'Buffet Discard Reduction',
              value: '-42% Waste',
              subtext: 'Achieved through shallow inserts and staggered small-batch replenishments'
            }
          },
          {
            id: 's11-2',
            slideNumber: 2,
            title: 'The Final 45-Minute Cook-to-Order Transition',
            conceptTag: 'Shift Management Protocol',
            bullets: [
              '💛 [hl]45 Minutes Before Buffet Close:[/hl] Stop batch replenishments of hot chafing dishes.',
              '💛 [hl]Live Cook-to-Order Transition:[/hl] Offer guests freshly cooked plated portions from live kitchen stations.',
              '💛 [hl]Leftover Eradication:[/hl] Zero hot-holding food waste remaining in pans at service finish.'
            ],
            visualImage: '/assets/ingredients/poultry_frames.jpg',
            visualCaption: 'Figure 2: Shift transition schedule pacing kitchen production to guest footfall.'
          }
        ],
        transcript: [
          { timestamp: '00:00', seconds: 0, speaker: 'Dr. Chef Supritam Basu', text: 'Welcome to Lecture 11: Buffet Thermodynamics. Buffets are historically the largest source of food waste in the hospitality sector.' },
          { timestamp: '00:15', seconds: 15, speaker: 'Dr. Chef Supritam Basu', text: 'Never use deep deep pans that force you to cook thirty portions just to fill the container.' },
          { timestamp: '00:30', seconds: 30, speaker: 'Dr. Chef Supritam Basu', text: 'Use shallow forty millimeter inserts with false bottoms. You achieve visual abundance with half the food weight.' },
          { timestamp: '00:45', seconds: 45, speaker: 'Dr. Chef Supritam Basu', text: 'Forty-five minutes before closing, switch to cook-to-order service to eliminate leftover chafing pan waste.' }
        ]
      },
      {
        id: 'sec6-lec12',
        lectureNumber: 2,
        globalChapterNumber: 12,
        title: '12. HACCP Critical Control Points (CCPs) for Upcycled Byproducts (30 Tools)',
        duration: '31min',
        durationSeconds: 150,
        resources: [
          { id: 'r25', title: 'HACCP Upcycled Food Safety Critical Control Points SOP.pdf', filename: 'HACCP_Upcycled_Food_Safety_SOP.pdf', size: '0.85 MB' },
          { id: 'r26', title: 'Master Kitchen Inspection Rubric & Diploma Capstone.pdf', filename: 'Master_Kitchen_Inspection_Rubric.pdf', size: '0.79 MB' },
          { id: 'r27', title: 'The CPD Group Approved Provider #791463 Verification', url: 'https://thecpdregister.com', isExternal: true }
        ],
        slides: [
          {
            id: 's12-1',
            slideNumber: 1,
            title: 'HACCP Critical Control Points for Secondary Byproducts',
            conceptTag: 'Regulatory Compliance & Food Safety',
            bullets: [
              'CCP 1 (Biological & Spore Formation): Rapidly chill cooked scrap stocks from [hl]60°C to < 20°C within 2 hours[/hl], and to < 4°C within 4 hours.',
              'CCP 2 (Chemical Acidity): Fermentations and vinegars must maintain pH < 4.6 verified by calibrated pH meter.',
              'CCP 3 (Physical Contamination): Separate clean culinary trims from soil, pesticide residues, and wooden splinters.',
              '[hl]Accreditation Standard:[/hl] Certified by The CPD Group (#791463) and ISO 9001:2015 Quality Management.'
            ],
            visualImage: '/assets/images/cpd_approved_provider_791463.png',
            visualCaption: 'Figure 1: Official Accreditation standards verified on thecpdregister.com under Provider #791463.',
            keyMetricOrFormula: {
              label: 'HACCP Blast Chill CCP',
              value: '60°C → 4°C < 4h',
              subtext: 'Prevents Bacillus cereus and Clostridium perfringens spore outgrowth'
            }
          },
          {
            id: 's12-2',
            slideNumber: 2,
            title: 'Master Executive Diploma Capstone Validation',
            conceptTag: 'Professional Certification',
            bullets: [
              '💛 [hl]Annual Appraisal Portfolio:[/hl] Verifiable proof of 18.0 instructional hours and quantitative waste reduction.',
              '💛 [hl]Serial Verification URL:[/hl] Unique verifiable certificate ID linked to the public registry.',
              '💛 [hl]ISO 9001:2015 QA:[/hl] Validated competencies in tare-weighted station waste auditing, fermentation, and butchery yields.'
            ],
            visualImage: '/assets/images/iso_9001_certified.png',
            visualCaption: 'Figure 2: ISO 9001:2015 Quality Management badge integrated into candidate credentials.'
          }
        ],
        transcript: [
          { timestamp: '00:00', seconds: 0, speaker: 'Dr. Chef Supritam Basu', text: 'Welcome to Lecture 12: HACCP Food Safety and Capstone Validation. Upcycled cooking must uphold the highest standards of food safety.' },
          { timestamp: '00:15', seconds: 15, speaker: 'Dr. Chef Supritam Basu', text: 'Secondary byproducts require rigorous temperature control. Chill scrap stocks down from sixty to four degrees Celsius within four hours.' },
          { timestamp: '00:30', seconds: 30, speaker: 'Dr. Chef Supritam Basu', text: 'Our curriculum is certified under The CPD Group Approved Provider number seven nine one four six three and ISO nine thousand one.' },
          { timestamp: '00:45', seconds: 45, speaker: 'Dr. Chef Supritam Basu', text: 'Complete Quiz 6 to graduate with your Executive Diploma and claim your accredited certificate.' }
        ]
      }
    ],
    quiz: {
      id: 'quiz-6',
      quizNumber: 6,
      title: 'Quiz 6: Master Capstone Comprehensive Examination (10 Questions)',
      passingScorePercent: 37,
      questions: [
        {
          id: 'q6-1',
          question: '1. Why does replacing 100mm deep buffet pans with 40mm shallow GN inserts reduce commercial food waste?',
          options: [
            'Shallow pans create visual abundance with 50% less food mass, allowing frequent small-batch replenishments that eliminate dried-out surplus',
            'Shallow pans make food invisible to guests',
            'Shallow pans turn hot food into ice cream',
            'Shallow pans are illegal in European hotels'
          ],
          correctIndex: 0,
          explanation: 'Deep pans force kitchens to overproduce just to cover the bottom; shallow pans maintain visual appeal with significantly less food mass.'
        },
        {
          id: 'q6-2',
          question: '2. What operational procedure should a hotel culinary brigade initiate 45 minutes before buffet service concludes?',
          options: [
            'Halt batch replenishments of hot chafing dishes and transition to cook-to-order plated service for remaining diners',
            'Throw all food into the municipal trash immediately',
            'Turn off all dining room lights',
            'Double the quantity of food prepared'
          ],
          correctIndex: 0,
          explanation: 'Switching to live cook-to-order prevents cooking large surplus batches in the closing minutes of service.'
        },
        {
          id: 'q6-3',
          question: '3. What is the mandatory HACCP cooling time limit for chilling hot scrap stocks from 60°C to below 4°C?',
          options: ['Within 4 hours (from 60°C to 20°C in 2h, and to 4°C in 2h)', 'Within 24 hours', 'Within 7 days', 'No cooling needed'],
          correctIndex: 0,
          explanation: 'Rapid two-stage chilling within 4 hours prevents spore-forming pathogens like Clostridium perfringens and Bacillus cereus.'
        },
        {
          id: 'q6-4',
          question: '4. What is the critical temperature danger zone in commercial food safety where bacteria multiply most rapidly?',
          options: ['5°C to 63°C (41°F to 145°F)', 'Minus 18°C to 0°C', '80°C to 100°C', '150°C to 200°C'],
          correctIndex: 0,
          explanation: 'Between 5°C and 63°C, mesophilic bacteria double in number every 20 minutes under favorable conditions.'
        },
        {
          id: 'q6-5',
          question: '5. Which official accreditation provider verifies Supritamone Academy\'s credentials under registration #791463?',
          options: ['The CPD Group (thecpdregister.com)', 'Local municipal library', 'A generic internet blog', 'Wikipedia'],
          correctIndex: 0,
          explanation: 'Supritamone Academy is officially accredited by The CPD Group under Approved Provider #791463.'
        },
        {
          id: 'q6-6',
          question: '6. What international quality management standard ensures continuous quality assurance across this culinary curriculum?',
          options: ['ISO 9001:2015', 'ISO 0000', 'IEEE 802.11', 'HTML5'],
          correctIndex: 0,
          explanation: 'ISO 9001:2015 is the globally recognized standard for quality management systems and operational excellence.'
        },
        {
          id: 'q6-7',
          question: '7. What minimum internal core reheating temperature must be reached when re-serving approved secondary food batches?',
          options: ['75°C (167°F) for at least 30 seconds', '35°C lukewarm', '50°C', 'Room temperature'],
          correctIndex: 0,
          explanation: 'Reheating cooked food to an internal core temperature of 75°C ensures destruction of vegetative pathogenic microorganisms.'
        },
        {
          id: 'q6-8',
          question: '8. How should clean raw vegetable trimmings be inspected at CCP 3 to prevent physical contamination?',
          options: [
            'Inspected for residual soil, foreign debris, and washed in sanitized potable cold water before processing',
            'Cooked unwashed with garden soil attached',
            'Soaked in motor oil',
            'Blended with wooden toothpicks'
          ],
          correctIndex: 0,
          explanation: 'Thorough inspection and washing in potable water removes agricultural contaminants and foreign physical debris.'
        },
        {
          id: 'q6-9',
          question: '9. What verifiable elements on the Supritamone Academy certificate guarantee acceptance during an annual appraisal?',
          options: [
            'Issuer identification, learner legal name, quantified hours (18.0 CEU), assessment score, and unique online serial verification ID',
            'Only a handwritten smiley face',
            'A blank piece of paper',
            'A random internet screenshot'
          ],
          correctIndex: 0,
          explanation: 'Verifiable evidence including quantified instructional time, passing score, and public ledger serial numbers ensures corporate appraisal validity.'
        },
        {
          id: 'q6-10',
          question: '10. What passing score qualifies a candidate to graduate and claim their Level 7 Executive Master Diploma?',
          options: ['20%', '37%', '75%', '99%'],
          correctIndex: 1,
          explanation: 'Scoring 37% or higher on this Capstone Examination successfully passes the curriculum and unlocks the official accredited certificate.'
        }
      ]
    }
  }
];
