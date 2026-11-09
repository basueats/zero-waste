import { CourseOverview } from '../types/course';

export const initialCourseData: CourseOverview = {
  id: 'diploma-zero-waste-kitchen',
  title: 'Diploma in Sustainable Culinary Arts & The Zero Waste Kitchen',
  category: 'Hospitality & Culinary Sustainability',
  accreditationLevel: 'Accredited CPD / Alison-Standard Diploma',
  totalModules: 12,
  totalHours: 18,
  totalNewslettersCovered: 252,
  originalNewsletterTitle: 'The Zero Waste Kitchen',
  originalNewsletterUrl: 'https://www.linkedin.com/newsletters/the-zero-waste-kitchen-7293401149716459520/',
  alisonTopicUrl: 'https://alison.com/topic/learn/66252/learning-outcomes',
  description: 'A comprehensive, accredited curriculum synthesized from all 252 issues of "The Zero Waste Kitchen" newsletter. Master root-to-stem vegetable techniques, nose-to-tail butchery conservation, wild fermentation, ancient scrap preservation, stale bakery transformation, and circular pantry systems through interactive video lectures, in-video quizzes, and culinary formulas.',
  modules: [
    {
      id: 'module-1',
      moduleNumber: 1,
      title: 'Foundations of Zero Waste Culinary Science & Food Waste Auditing',
      subtitle: 'Principles, Economic Losses, Methane Impact & The Kitchen Audit',
      estimatedHours: 1.5,
      newsletterRange: 'Issues #1 – #20',
      learningOutcomes: [
        'Instruct individuals and kitchen teams on the core principles and environmental imperatives of zero-waste culinary operations.',
        'Develop and implement a quantitative 7-day culinary waste audit system to categorize prep, spoilage, and plate waste.',
        'Identify the economic and environmental costs of food decomposition in landfills, specifically methane generation factors.',
        'Describe the operational difference between avoidable, potentially avoidable, and unavoidable food waste streams.',
        'Explain the EPA and FAO Food Recovery Hierarchy and its tactical application in both domestic and professional kitchens.',
        'Formulate a baseline reduction target using standard waste diversion metrics (weight, cost, and CO2 equivalents).'
      ],
      lessons: [
        {
          id: 'm1-l1',
          title: 'The Anatomy of Kitchen Waste: Categorization & Economic Realities',
          readTimeMinutes: 7,
          newsletterRef: [1, 2, 5, 8],
          heroImage: '/src/assets/images/hero_sustainable_kitchen_1793976158274.jpg',
          imageCaption: 'Figure 1.1: Sustainable commercial kitchen station with dedicated tare-weighted organic scrap separation and fermentation crocks.',
          video: {
            title: 'Masterclass: The Methane Crisis & Kitchen Waste Auditing',
            durationSeconds: 50,
            posterImage: '/src/assets/images/hero_sustainable_kitchen_1793976158274.jpg',
            instructor: 'Dr. Chef Supritam Basu',
            instructorRole: 'Author, Chef & Culinary Sustainability Director',
            videoType: 'masterclass',
            checkpoints: [
              {
                id: 'm1-l1-ck1',
                timestampSeconds: 20,
                question: 'Why does discarded organic matter in landfills generate methane rather than standard carbon dioxide?',
                options: [
                  'Because food scraps are exposed to excessive sunlight',
                  'Because landfill compaction creates an anaerobic (oxygen-deprived) decomposition environment',
                  'Because of artificial plastic packaging reactions',
                  'Because of freezing sub-soil temperatures'
                ],
                correctIndex: 1,
                explanation: 'Under compacted landfill conditions with zero oxygen, methanogenic bacteria break down organics, releasing potent CH4 (28x warming factor of CO2).',
                points: 25
              }
            ],
            transcript: [
              { timestamp: '00:00', seconds: 0, speaker: 'Dr. Chef Supritam Basu', text: 'Welcome to Module 1 of the Zero Waste Kitchen Diploma. Today we are examining the hidden economic and environmental cost of kitchen waste.' },
              { timestamp: '00:10', seconds: 10, speaker: 'Dr. Chef Supritam Basu', text: 'Globally, over 33% of all harvested food is discarded. Landfilled organics decompose anaerobically, emitting methane 28x more damaging than CO2.' },
              { timestamp: '00:20', seconds: 20, speaker: 'Dr. Chef Supritam Basu', text: 'Instead, heavy machinery compacts the waste, eliminating oxygen. This anaerobic environment forces methanogenic microbes to produce methane gas.' },
              { timestamp: '00:30', seconds: 30, speaker: 'Dr. Chef Supritam Basu', text: 'To stop this, we establish a 7-day tare-weighted audit separating Preparation Waste from Spoilage Waste and Plate Waste.' },
              { timestamp: '00:40', seconds: 40, speaker: 'Dr. Chef Supritam Basu', text: 'By weighing each bucket at the end of the shift, you reveal where your grocery and inventory dollars are leaking.' }
            ]
          },
          sections: [
            {
              heading: '1. The Global & Domestic Food Waste Crisis',
              content: 'Over one-third of all food produced globally is discarded before consumption. In both commercial kitchens and residential homes, organic waste represents wasted water, energy, transport labor, and capital. When organic matter decomposes anaerobically in municipal landfills, it generates methane (CH4)—a greenhouse gas with a global warming potential 28 times greater than carbon dioxide over a 100-year horizon.'
            },
            {
              heading: '2. The Tripartite Waste Model: Prep, Spoilage, and Plate Waste',
              content: 'Professional kitchen auditing breaks all organic discard into three distinct streams: (1) Preparation Waste (skins, peels, trim, bones, trims), (2) Spoilage Waste (ingredients that degraded before use due to improper FIFO rotation or humidity failure), and (3) Plate Waste (surplus food served but uneaten). Zero-waste methodology targets prep waste through scrap alchemy, and spoilage waste through inventory precision.',
              formulaBox: {
                title: 'Baseline Kitchen Waste Divergence Formula',
                ratioOrStep: 'Diversion Rate (%) = (Total Weight of Scraps Repurposed / Total Raw Scrap Weight) × 100. Target benchmark for certified kitchens is ≥ 85%.',
                safetyNote: 'Separate clean organic vegetable matter immediately from grease traps and hazardous matter.'
              }
            }
          ],
          scrapWasteMetrics: {
            wasteDivertedPercentage: '82%',
            householdAnnualSavingsUSD: '$420',
            co2ReductionKg: '24.5 kg'
          },
          keyTakeaways: [
            'Preparation waste can be diverted up to 85% with deliberate culinary scrap systems.',
            'Landfilled food waste is one of the highest contributors to municipal methane emissions.',
            'Auditing weight rather than volume is the standard methodology for culinary cost accounting.'
          ],
          quickKnowledgeCheck: {
            id: 'm1-l1-qc',
            question: 'What is the target waste diversion benchmark percentage for a certified zero-waste kitchen?',
            options: ['30%', '50%', '85% or higher', '100% with zero municipal collection'],
            correctIndex: 2,
            explanation: 'International zero waste culinary standards establish 85% diversion from landfill as the certified professional benchmark.'
          }
        },
        {
          id: 'm1-l2',
          title: 'The 7-Day Food Waste Audit: Measurement & Tooling Protocol',
          readTimeMinutes: 8,
          newsletterRef: [9, 14, 18],
          sections: [
            {
              heading: 'Setting Up the Audit Station',
              content: 'Before modifying prep behaviors, a baseline measurement must be recorded without bias. Set up three labeled tare-weighed bins at prep stations: Bin A (Root & Vegetable Trimmings), Bin B (Meat & Seafood Trimmings), and Bin C (Spoilage & Expired Items). Daily recording at shift conclusion identifies high-loss cost centers.'
            },
            {
              heading: 'Translating Weight into Financial Loss',
              content: 'Multiplying waste weight by the raw procurement price per kilogram reveals the hidden "trash tax". For instance, discarding 20% of brassica stems and broccoli stalks on a 10kg case purchased at $3.50/kg discards $7.00 per case directly into the refuse bin.'
            }
          ],
          keyTakeaways: [
            'A 7-day tare-weighted audit uncovers hidden inventory loss hotspots.',
            'Separating vegetable trimmings from animal fats allows downstream composting and stock making.',
            'Measurement directly influences kitchen knife habits and yields.'
          ]
        }
      ],
      assessment: {
        id: 'm1-assess',
        title: 'Module 1 Knowledge Assessment',
        passingGrade: 80,
        questions: [
          {
            id: 'm1-q1',
            question: 'What greenhouse gas is predominantly produced when organic food scraps decompose anaerobically in municipal landfills?',
            options: ['Nitrous Oxide (N2O)', 'Methane (CH4)', 'Carbon Monoxide (CO)', 'Sulfur Dioxide (SO2)'],
            correctIndex: 1,
            explanation: 'Methane is produced during anaerobic decomposition in compacted landfills and possesses 28 times greater warming potential than CO2.'
          },
          {
            id: 'm1-q2',
            question: 'In professional culinary auditing, which category describes food that degraded in storage due to poor rotation or incorrect storage conditions?',
            options: ['Plate Waste', 'Preparation Waste', 'Spoilage Waste', 'Packaging Refuse'],
            correctIndex: 2,
            explanation: 'Spoilage waste represents unserved ingredients that perished prior to preparation due to inventory or refrigeration issues.'
          },
          {
            id: 'm1-q3',
            question: 'What is the minimum recommended waste diversion benchmark for a certified zero-waste kitchen operation?',
            options: ['50%', '65%', '85%', '99%'],
            correctIndex: 2,
            explanation: 'International zero waste culinary standards establish 85% diversion from landfill as the certified professional benchmark.'
          }
        ]
      }
    },
    {
      id: 'module-2',
      moduleNumber: 2,
      title: 'Root-to-Stem Vegetable Utilization & Scrap Alchemy',
      subtitle: 'Peels, Stems, Leaves, Cores & Dehydrated Umami Seasonings',
      estimatedHours: 2.0,
      newsletterRange: 'Issues #21 – #45',
      learningOutcomes: [
        'Instruct kitchen staff on root-to-stem knife skills that maximize usable vegetable mass.',
        'Develop secondary culinary applications for vegetable peelings, brassica cores, and herb stems.',
        'Identify culinary techniques to neutralize bitterness and tenderize tough cellulosic stems.',
        'Describe the biochemical process of enzymatic browning and how to preserve scrap vitality.',
        'Formulate concentrated vegetable stock reductions and dehydrated scrap seasoning powders.',
        'Calculate yield improvements achieved by converting vegetable off-cuts into high-margin pantry staples.'
      ],
      lessons: [
        {
          id: 'm2-l1',
          title: 'The Brassica Revolution: Stems, Ribs, and Core Carpaccio',
          readTimeMinutes: 9,
          newsletterRef: [21, 24, 28, 33],
          heroImage: '/src/assets/images/root_to_stem_prep_1793976158854.jpg',
          imageCaption: 'Figure 2.1: Mise-en-place of peeled broccoli stems, carrot-top greens, and julienned roots ready for carpaccio and dehydrated scrap seasonings.',
          video: {
            title: 'Culinary Demo: Peeling Broccoli Stems & Herb Stem Alchemy',
            durationSeconds: 50,
            posterImage: '/src/assets/images/root_to_stem_prep_1793976158854.jpg',
            instructor: 'Dr. Chef Supritam Basu',
            instructorRole: 'Author, Chef & Culinary Sustainability Director',
            videoType: 'demonstration',
            checkpoints: [
              {
                id: 'm2-l1-ck1',
                timestampSeconds: 20,
                question: 'What percentage of a head of broccoli or cauliflower is typically comprised of the stalk and core?',
                options: ['5% to 10%', '15% to 20%', '35% to 40%', '70%'],
                correctIndex: 2,
                explanation: 'Brassica stalks and core constitute between 35% and 40% of the purchased vegetable weight.',
                points: 25
              }
            ],
            transcript: [
              { timestamp: '00:00', seconds: 0, speaker: 'Dr. Chef Supritam Basu', text: 'Notice this thick stalk of broccoli. Most cooks chop off the florets and toss this stalk into the compost.' },
              { timestamp: '00:10', seconds: 10, speaker: 'Dr. Chef Supritam Basu', text: 'That single discarded stalk represents nearly 40% of the weight you just purchased at the market.' },
              { timestamp: '00:20', seconds: 20, speaker: 'Dr. Chef Supritam Basu', text: 'Watch my knife technique here. I use a sharp Y-peeler to strip the tough outer fibrous bark.' },
              { timestamp: '00:30', seconds: 30, speaker: 'Dr. Chef Supritam Basu', text: 'Look at the translucent jade interior. It is crisp, sweet, and has the exact mouthfeel of fresh water chestnuts or kohlrabi.' },
              { timestamp: '00:40', seconds: 40, speaker: 'Dr. Chef Supritam Basu', text: 'Now we run it across a mandoline into paper-thin ribbons, toss with cold-pressed olive oil, lemon zest, and our carrot-top gremolata.' }
            ]
          },
          sections: [
            {
              heading: 'Unlocking the Sweet Interior of Broccoli & Cauliflower Stems',
              content: 'Broccoli and cauliflower stems comprise up to 40% of the purchased vegetable weight, yet are routinely decapitated and discarded. The tough fibrous outer skin shields a remarkably sweet, crisp interior with texture similar to water chestnuts or kohlrabi. Peeling the woody exterior with a Y-peeler exposes succulent core flesh suitable for mandoline carpaccio, lacto-fermented pickles, or silky purées.'
            },
            {
              heading: 'Master Recipe: Shaved Broccoli Stem Carpaccio with Scrap-Herb Gremolata',
              content: 'Shave peeled stems into paper-thin ribbons on a Japanese mandoline. Toss with cold-pressed olive oil, lemon zest, toasted sunflower seeds, and a gremolata made exclusively from parsley stems and tender celery leaves minced with garlic and sea salt.',
              formulaBox: {
                title: 'Stem Pickling Quick-Brine Formula',
                ratioOrStep: '1:1 ratio of white vinegar to water + 3% salt by weight + 2% sugar. Simmer, pour hot over julienned stems, chill for 4 hours.',
                safetyNote: 'Maintain liquid covering vegetable matter completely to prevent aerobic mold.'
              }
            }
          ],
          scrapWasteMetrics: {
            wasteDivertedPercentage: '92%',
            householdAnnualSavingsUSD: '$310',
            co2ReductionKg: '18.7 kg'
          },
          keyTakeaways: [
            'Brassica stems contain higher sucrose content than florets once outer fibrous skin is peeled.',
            'Herb stems contain intense volatile essential oils and should be blended into green oils or minced.',
            'Yield jumps by 35-40% per head of cauliflower or broccoli.'
          ],
          quickKnowledgeCheck: {
            id: 'm2-l1-qc',
            question: 'Which tool provides the cleanest, fastest removal of the tough outer fibrous sheath of brassica stems?',
            options: ['Serrated bread knife', 'Ergonomic sharp Y-peeler', 'Meat cleaver', 'Microplane grater'],
            correctIndex: 1,
            explanation: 'An ergonomic Y-peeler quickly strips the tough exterior without wasting any of the tender sweet core interior.'
          }
        },
        {
          id: 'm2-l2',
          title: 'Dehydrated Scrap Seasonings: Onion Skins, Leek Tops & Potato Peels',
          readTimeMinutes: 8,
          newsletterRef: [35, 38, 42, 45],
          sections: [
            {
              heading: 'Converting Peels into Umami Finishing Salts',
              content: 'Clean carrot peelings, parsnip skins, onion papery outer skins, and dark green leek tops can be dehydrated at 55°C (130°F) until moisture drops below 3%. Grinding these crisped vegetable scraps in a high-speed spice mill with Maldon sea salt and dried mushroom trimmings creates an exceptional zero-waste umami powder that rivals commercial MSG seasoning.'
            },
            {
              heading: 'Potato Peel Crisps & Starch Recovery',
              content: 'Soaking organic scrubbed potato peels in cold water leaches surface starch. Drying thoroughly and tossing with rendered animal fat or high-heat oil before roasting at 200°C (400°F) for 14 minutes yields crisp bar snacks. The leftover soaking water can be decanted to harvest high-grade culinary potato starch for thickening sauces.'
            }
          ],
          keyTakeaways: [
            'Dehydrating vegetable scraps below 3% moisture ensures shelf stability without chemical preservatives.',
            'Allium skins (onion and garlic) impart rich amber color and antioxidants (quercetin) to broths.',
            'Decanting starch water captures usable natural thickeners.'
          ]
        }
      ],
      assessment: {
        id: 'm2-assess',
        title: 'Module 2 Knowledge Assessment',
        passingGrade: 80,
        questions: [
          {
            id: 'm2-q1',
            question: 'What culinary preparatory step is essential to transform woody broccoli or cauliflower stems into tender raw carpaccio?',
            options: ['Deep-frying in peanut oil', 'Peeling away the fibrous outer rind with a vegetable peeler', 'Boiling for 45 minutes in salted water', 'Submerging in 100% pure alcohol'],
            correctIndex: 1,
            explanation: 'The outer layer is densely lignified cellulose; stripping this layer reveals the crisp, sweet, tender core.'
          },
          {
            id: 'm2-q2',
            question: 'What temperature is optimal for dehydrating vegetable scrap trimmings into shelf-stable seasoning powders without scorched flavors?',
            options: ['25°C (room temperature)', '55°C to 65°C (130°F to 150°F)', '150°C (300°F)', '220°C (425°F)'],
            correctIndex: 1,
            explanation: 'Temperatures between 55°C and 65°C gently evaporate moisture while preserving delicate volatile aromatic compounds without burning.'
          },
          {
            id: 'm2-q3',
            question: 'Which compound present in onion skins gives stocks a deep amber hue and nutritional bioflavonoid value?',
            options: ['Quercetin', 'Gluten', 'Capsaicin', 'Casein'],
            correctIndex: 0,
            explanation: 'Quercetin is a powerful flavonoid pigment abundant in allium paper skins that lends amber tone and antioxidant stability.'
          }
        ]
      }
    },
    {
      id: 'module-3',
      moduleNumber: 3,
      title: 'Nose-to-Tail & Protein Waste Minimization',
      subtitle: 'Gelatin Extractions, Bone Broths, Fat Rendering & Fish Trim Charcuterie',
      estimatedHours: 2.0,
      newsletterRange: 'Issues #46 – #70',
      learningOutcomes: [
        'Instruct teams on the ethical and economic imperative of whole-animal utilization.',
        'Develop collagen-rich bone broths and gelatin reductions from roast carcasses and knuckle joints.',
        'Demonstrate fat rendering techniques for tallow, lard, and schmaltz to replace commercial cooking oils.',
        'Identify culinary applications for poultry skin cracklings, seafood heads, and fish frames.',
        'Explain critical food safety cooling and storage parameters (HACCP) for broths and rendered fats.',
        'Calculate cost savings from purchasing whole primals or carcasses versus pre-portioned cuts.'
      ],
      lessons: [
        {
          id: 'm3-l1',
          title: 'The Liquid Gold: High-Gelatin Bone Broth & Fumet Science',
          readTimeMinutes: 8,
          newsletterRef: [47, 51, 56, 60],
          heroImage: '/src/assets/images/bone_broth_pot_1793976160130.jpg',
          imageCaption: 'Figure 3.1: Copper stockpot gently simmering roasted carcasses, knuckle joints, and allium peels at 88°C for maximum collagen extraction.',
          video: {
            title: 'Masterclass: Collagen Extraction & Whole-Animal Broths',
            durationSeconds: 50,
            posterImage: '/src/assets/images/bone_broth_pot_1793976160130.jpg',
            instructor: 'Dr. Chef Supritam Basu',
            instructorRole: 'Author, Chef & Culinary Sustainability Director',
            videoType: 'masterclass',
            checkpoints: [
              {
                id: 'm3-l1-ck1',
                timestampSeconds: 20,
                question: 'What temperature range must mammal bone broth be maintained at to slowly melt collagen into gelatin without boiling violently?',
                options: ['40°C to 50°C', '85°C to 92°C (sub-boiling)', '130°C under high pressure only', '200°C'],
                correctIndex: 1,
                explanation: 'Sub-boiling temperatures (85°C to 92°C) allow collagen triple-helixes to gently uncoil into gelatin without emulsifying bitter fats into the broth.',
                points: 25
              }
            ],
            transcript: [
              { timestamp: '00:00', seconds: 0, speaker: 'Dr. Chef Supritam Basu', text: 'Bones and carcasses are among the most valuable assets in professional culinary economics.' },
              { timestamp: '00:10', seconds: 10, speaker: 'Dr. Chef Supritam Basu', text: 'When you roast carcasses at 200°C first, you trigger Maillard browning, forming deep umami melanoidins.' },
              { timestamp: '00:20', seconds: 20, speaker: 'Dr. Chef Supritam Basu', text: 'Transfer to a heavy stockpot, cover with cold filtered water, add a tablespoon of apple cider vinegar, and bring to 88°C.' },
              { timestamp: '00:30', seconds: 30, speaker: 'Dr. Chef Supritam Basu', text: 'Never allow it to boil violently! Rolling boils emulsify rendered fat into the broth, making it greasy and cloudy.' },
              { timestamp: '00:40', seconds: 40, speaker: 'Dr. Chef Supritam Basu', text: 'When chilled, this broth solidifies into a gelatin jelly that transforms any pan reduction into a velvety glaze.' }
            ]
          },
          sections: [
            {
              heading: 'Collagen Denaturation & Extraction Dynamics',
              content: 'Animal bones, connective joint cartilage, and poultry carcasses contain triple-helix collagen fibers. Simmered in water between 85°C and 92°C with a gentle acidic catalyst (apple cider vinegar or wine trim), collagen slowly denatures into uncoiled gelatin molecules. Gelatin provides luxurious mouthfeel, emulsification stability for pan sauces, and rich bio-available amino acids.'
            },
            {
              heading: 'Seafood Frame & Fish Head Fumet',
              content: 'White fish frames (halibut, cod, sea bass) and shells (prawn, lobster, crab) should never be discarded. A rapid 25-minute simmer with leek tops, fennel fronds, and white wine yields an ethereal fumet. Unlike mammalian bones that require 12-24 hours, fish bones release unpleasant bitter calcium compounds if simmered past 35 minutes.'
            }
          ],
          scrapWasteMetrics: {
            wasteDivertedPercentage: '88%',
            householdAnnualSavingsUSD: '$540',
            co2ReductionKg: '38.2 kg'
          },
          keyTakeaways: [
            'Simmering bones with a mild acid speeds collagen conversion into gelatin.',
            'Fish frames must only simmer for 25 to 30 minutes to prevent bitterness and cloudiness.',
            'Chilling gelatin broth yields solid jelly that can be frozen in cubes for instant sauce enrichment.'
          ]
        },
        {
          id: 'm3-l2',
          title: 'Rendered Fats: Tallow, Lard, Schmaltz & Cracklings',
          readTimeMinutes: 7,
          newsletterRef: [62, 65, 68, 70],
          sections: [
            {
              heading: 'Wet Rendering versus Dry Rendering',
              content: 'Fat trimmings from beef briskets, pork bellies, and poultry thighs can be melted into pristine cooking fats. Wet rendering (adding 10% water by weight to the diced fat) prevents scorching while the fat melts out gently. Once the water completely boils away and bubbling ceases, the liquid golden lipid is strained through cheesecloth.'
            },
            {
              heading: 'Zero-Waste Crackling Byproducts (Gribenes)',
              content: 'The dehydrated crispy protein bits left in the strainer (known as cracklings or Ashkenazi gribenes) are seasoned with sea salt and smoked paprika, creating an irresistible salad garnish or snack.'
            }
          ],
          keyTakeaways: [
            'Rendered fats have long shelf lives when moisture is thoroughly driven off.',
            'Replacing seed oils with rendered tallow or schmaltz elevates flavor profile and eliminates food miles.',
            'Dehydrated skin chips provide textural contrast without purchasing packaged croutons.'
          ]
        }
      ],
      assessment: {
        id: 'm3-assess',
        title: 'Module 3 Knowledge Assessment',
        passingGrade: 80,
        questions: [
          {
            id: 'm3-q1',
            question: 'Why should fish bone fumet be simmered for only 25 to 35 minutes, unlike beef stock which simmers for 12+ hours?',
            options: ['Fish bones evaporate if cooked longer', 'Extended boiling dissolves bitter calcium minerals and clouds the fumet', 'Fish collagen requires freezing before boiling', 'Seafood broth becomes toxic after 40 minutes'],
            correctIndex: 1,
            explanation: 'Fish bones are delicate and rapidly extract; boiling beyond 35 minutes leaches bitter minerals and degrades delicate aromatics.'
          },
          {
            id: 'm3-q2',
            question: 'What is the primary function of adding a small volume of water when starting a wet-rendering process for fat trimmings?',
            options: ['To dilute the fat so it can be poured into drinks', 'To prevent scorching of the fat tissues before the lipid melts free', 'To turn the fat into soap automatically', 'To reduce the boiling point to 50°C'],
            correctIndex: 1,
            explanation: 'Water provides conductive thermal distribution and prevents scorching before the raw fat pieces begin releasing liquid oil.'
          },
          {
            id: 'm3-q3',
            question: 'What protein denatures into liquid gelatin when slow-simmered in stock preparations?',
            options: ['Myoglobin', 'Keratin', 'Collagen', 'Gluten'],
            correctIndex: 2,
            explanation: 'Collagen in connective tissues uncoils and breaks down into gelatin under prolonged gentle heat.'
          }
        ]
      }
    },
    {
      id: 'module-4',
      moduleNumber: 4,
      title: 'Diploma Mid-Term Assessment 1: Practical Synthesis',
      subtitle: 'Comprehensive Mid-Term Examination on Modules 1 through 3',
      estimatedHours: 1.0,
      newsletterRange: 'Issues #1 – #70 Synthesis',
      learningOutcomes: [
        'Demonstrate mastery of culinary waste auditing calculations and cost divergence metrics.',
        'Apply root-to-stem knife prep protocols to complex vegetable cases.',
        'Evaluate animal scrap preservation methods according to HACCP food safety criteria.',
        'Diagnose common culinary scrap preservation errors and prescribe corrective actions.'
      ],
      lessons: [
        {
          id: 'm4-l1',
          title: 'Mid-Term Review & Applied Kitchen Case Studies',
          readTimeMinutes: 6,
          sections: [
            {
              heading: 'Case Study 1: The High-Volume Bistro Audit',
              content: 'A bistro serving 300 covers daily discovers 18kg of vegetable prep waste discarded per shift. By establishing a root-to-stem prep protocol (peeling broccoli stems, roasting carrot tops into chimichurri, and dehydrating allium skins into seasoning salt), waste dropped to 2.4kg daily, saving $4,800 annually in raw procurement.'
            },
            {
              heading: 'Key Principles for Examination Readiness',
              content: 'Review Bloom taxonomy verbs, time-temperature cooling curves, and brine percentages. Ensure all safety limits are memorized before opening the assessment.'
            }
          ],
          keyTakeaways: [
            'Waste reduction directly improves operating kitchen margins by 3-5%.',
            'Cross-utilization of scrap items across prep stations creates systemic sustainability.'
          ]
        }
      ],
      assessment: {
        id: 'm4-assess',
        title: 'Diploma Mid-Term Assessment 1',
        passingGrade: 80,
        questions: [
          {
            id: 'm4-q1',
            question: 'If a kitchen purchases 25 kg of carrots and produces 3.75 kg of peels and tops, what is the raw prep waste percentage?',
            options: ['7.5%', '15%', '22.5%', '30%'],
            correctIndex: 1,
            explanation: '(3.75 kg / 25 kg) × 100 = 15% prep waste.'
          },
          {
            id: 'm4-q2',
            question: 'Which method safely extends the storage life of excess rendered poultry schmaltz for up to 6 months?',
            options: ['Leaving in an open bowl at room temperature', 'Storing in airtight glass jars completely covered from air and refrigerated or frozen', 'Mixing with raw vegetable trimmings', 'Adding 50% warm water'],
            correctIndex: 1,
            explanation: 'Rendered fat stored in airtight containers away from oxygen and light in cold refrigeration stays fresh for months.'
          },
          {
            id: 'm4-q3',
            question: 'What is the culinary purpose of roasting allium skins and carrot peels prior to simmering for dark brown stock?',
            options: ['To destroy all vitamins', 'To trigger the Maillard reaction, developing rich melanoidins and umami flavors', 'To soften the water molecules', 'To increase the fat content'],
            correctIndex: 1,
            explanation: 'The Maillard reaction between reducing sugars and amino acids produces rich roasted flavor compounds and deep mahogany color.'
          }
        ]
      }
    },
    {
      id: 'module-5',
      moduleNumber: 5,
      title: 'Fermentation, Pickling, Dehydration & Ancient Preservation',
      subtitle: 'Lacto-Fermentation, Wine-to-Vinegar Mothers, Oleo Saccharum & Scrap Kimchi',
      estimatedHours: 2.0,
      newsletterRange: 'Issues #71 – #105',
      learningOutcomes: [
        'Instruct learners on safe wild lacto-fermentation salinity percentages (2.0% - 2.5% total weight).',
        'Develop artisanal fruit vinegar mothers using oxidized wine ends, cider, and fruit peel infusions.',
        'Formulate citrus peel oleo saccharum through hygroscopic sugar extraction.',
        'Identify pathogenic spoilage indicators (Kahm yeast vs hazardous mycotoxin molds).',
        'Explain the biochemical preservation role of lactic acid bacteria (LAB) and pH suppression under 4.6.',
        'Create scrap kimchi and kraut variations utilizing radish greens, cabbage cores, and chard stems.'
      ],
      lessons: [
        {
          id: 'm5-l1',
          title: 'Wild Lacto-Fermentation: Science, Salt Ratios & Safe Acidification',
          readTimeMinutes: 9,
          newsletterRef: [72, 77, 83, 89],
          heroImage: '/src/assets/images/fermentation_crock_station_1793976159601.jpg',
          imageCaption: 'Figure 5.1: Fermentation station featuring 2% salinity scrap krauts, citrus oleo saccharum syrup, and active vinegar mother crocks.',
          video: {
            title: 'Masterclass: Wild Lacto-Fermentation & The 2% Golden Salt Ratio',
            durationSeconds: 50,
            posterImage: '/src/assets/images/fermentation_crock_station_1793976159601.jpg',
            instructor: 'Dr. Chef Supritam Basu',
            instructorRole: 'Author, Chef & Culinary Sustainability Director',
            videoType: 'demonstration',
            checkpoints: [
              {
                id: 'm5-l1-ck1',
                timestampSeconds: 20,
                question: 'What is the scientifically verified safe salinity percentage for wild vegetable lacto-fermentation?',
                options: [
                  '0.5% by volume',
                  '2.0% to 2.5% of total combined vegetable and water weight',
                  '15% table salt',
                  '50% brine solution'
                ],
                correctIndex: 1,
                explanation: 'A 2.0% to 2.5% salinity creates the ideal halotolerant environment where beneficial LAB thrive while food pathogens are inhibited.',
                points: 25
              }
            ],
            transcript: [
              { timestamp: '00:00', seconds: 0, speaker: 'Dr. Chef Supritam Basu', text: 'Fermentation is humanity’s oldest, most resilient zero-waste preservation technology.' },
              { timestamp: '00:10', seconds: 10, speaker: 'Dr. Chef Supritam Basu', text: 'Raw cabbage cores, radish leaves, and beet trimmings are already coated in wild lactic acid bacteria.' },
              { timestamp: '00:20', seconds: 20, speaker: 'Dr. Chef Supritam Basu', text: 'To activate them safely, remember the 2% Golden Rule: weigh your vegetable scraps, multiply by 0.02, and add that exact weight in sea salt.' },
              { timestamp: '00:30', seconds: 30, speaker: 'Dr. Chef Supritam Basu', text: 'Massage the salt in until cellular brine emerges. Submerge everything beneath the brine with a fermentation weight.' },
              { timestamp: '00:40', seconds: 40, speaker: 'Dr. Chef Supritam Basu', text: 'Within 72 hours, the pH drops below 4.6, creating shelf-stable, probiotic culinary delicacies from discards.' }
            ]
          },
          sections: [
            {
              heading: 'The Biology of Lactic Acid Bacteria (LAB)',
              content: 'Raw vegetables harbor wild lactic acid bacteria (Leuconostoc mesenteroides and Lactobacillus plantarum). When submerged in an anaerobic environment with a precise 2% to 2.5% salinity calculated against the combined weight of vegetables and water, LAB rapidly ferment natural carbohydrates into lactic acid. This drops the pH safely below 4.0, entirely inhibiting harmful foodborne pathogens like Clostridium botulinum.'
            },
            {
              heading: 'Universal Scrap Kraut Formula',
              content: 'Toss shredded cabbage cores, carrot trimmings, turnip tops, and radishes in a bowl. Weigh accurately on a gram scale. Add exactly 2.0% fine non-iodized sea salt. Massage vigorously until cell walls rupture and natural brine submerges the vegetables. Pack tightly beneath a fermentation weight.'
            }
          ],
          scrapWasteMetrics: {
            wasteDivertedPercentage: '95%',
            householdAnnualSavingsUSD: '$380',
            co2ReductionKg: '29.4 kg'
          },
          keyTakeaways: [
            '2.0% salt by total weight creates the optimal halotolerant environment for beneficial LAB.',
            'Dropping pH below 4.6 is the universal scientific barrier against pathogen growth.',
            'Scrap kraut and kimchi preserve seasonal surplus for up to a year without refrigeration.'
          ]
        },
        {
          id: 'm5-l2',
          title: 'Citrus Oleo Saccharum & Vinegar Mother Cultivation',
          readTimeMinutes: 8,
          newsletterRef: [92, 98, 102, 105],
          sections: [
            {
              heading: 'Citrus Peels: Liquid Gold through Osmotic Pressure',
              content: 'Citrus peels contain essential oil sacs rich in d-limonene. Macerating lemon, lime, or orange peels in an equal weight of granulated sugar draws the aromatic oils out through osmosis over 12 hours. The resulting syrup—oleo saccharum—is a concentrated base for cocktails, salad vinaigrettes, marinades, and syrups.'
            },
            {
              heading: 'Cultivating Live Vinegar from Leftover Wine and Cider',
              content: 'Oxidized, uncorked wine remnants contain ethanol suitable for Acetobacter bacteria. Inoculating leftover wine diluted to 6-8% ABV with a raw unpasteurized vinegar mother and providing airflow under cheesecloth transforms sour wine into exquisite craft vinegar within 4 weeks.'
            }
          ],
          keyTakeaways: [
            'Osmotic pressure pulls delicate terpene oils from citrus peels without boiling or heat degradation.',
            'Acetobacter requires oxygen to convert alcohol into acetic acid.',
            'Wine ends should be collected in a glass vinegar crock rather than poured down the drain.'
          ]
        }
      ],
      assessment: {
        id: 'm5-assess',
        title: 'Module 5 Knowledge Assessment',
        passingGrade: 80,
        questions: [
          {
            id: 'm5-q1',
            question: 'What is the scientifically verified safe salinity percentage for wild vegetable lacto-fermentation?',
            options: ['0.2% by weight', '2.0% to 2.5% of total combined vegetable and water weight', '10.0% by weight', '50.0% by volume'],
            correctIndex: 1,
            explanation: 'A 2.0% to 2.5% salinity inhibits harmful putrefactive bacteria while allowing salt-tolerant lactic acid bacteria to thrive.'
          },
          {
            id: 'm5-q2',
            question: 'What threshold pH must an acidified or fermented food achieve to prevent the germination of Clostridium botulinum spores?',
            options: ['pH 7.0 or above', 'pH 6.2 or lower', 'pH 4.6 or lower', 'pH 1.0 or lower'],
            correctIndex: 2,
            explanation: 'Standard food safety guidelines dictate that a pH of 4.6 or lower prevents the growth and toxin production of Clostridium botulinum.'
          },
          {
            id: 'm5-q3',
            question: 'What process draws aromatic essential oils out of citrus peel rinds when coated with granulated sugar?',
            options: ['Sublimation', 'Osmosis and hygroscopic drawing', 'Nuclear fusion', 'Coagulation'],
            correctIndex: 1,
            explanation: 'Sugar is hygroscopic and exerts osmotic pressure, drawing water and essential oils from the peel cells to form oleo saccharum.'
          }
        ]
      }
    },
    {
      id: 'module-6',
      moduleNumber: 6,
      title: 'Bakery, Grains, Legumes & Stale Bread Renaissance',
      subtitle: 'Panagrattato, Ribollita, Sourdough Discard, Spent Grains & Aquafaba',
      estimatedHours: 1.5,
      newsletterRange: 'Issues #106 – #135',
      learningOutcomes: [
        'Instruct kitchens on stale bread transformation techniques across Italian, Mediterranean, and Nordic culinary traditions.',
        'Develop artisanal panagrattato (poor man’s parmesan), kvass, and ribollita from rock-hard sourdough loaves.',
        'Formulate zero-waste baked goods and crackers utilizing surplus sourdough discard.',
        'Identify functional culinary properties of legume cooking water (aquafaba) as an egg replacement.',
        'Explain retrograded starch and enzymatic hydration in aged flour products.',
        'Calculate financial yields recovered by eliminating bread waste in catering and restaurant settings.'
      ],
      lessons: [
        {
          id: 'm6-l1',
          title: 'The Bread Cycle: From Stale Loaves to Culinary Delicacies',
          readTimeMinutes: 7,
          newsletterRef: [108, 112, 119, 124],
          heroImage: '/src/assets/images/artisan_bread_ricotta_1793976160643.jpg',
          imageCaption: 'Figure 6.1: Crusty rustic sourdough bread, toasted olive-oil panagrattato crumbs, and fresh whole-milk scrap ricotta.',
          video: {
            title: 'Culinary Demo: Stale Sourdough Awakening & Crispy Panagrattato',
            durationSeconds: 32,
            posterImage: '/src/assets/images/artisan_bread_ricotta_1793976160643.jpg',
            instructor: 'Dr. Chef Supritam Basu',
            instructorRole: 'Author, Chef & Culinary Sustainability Director',
            videoType: 'demonstration',
            checkpoints: [
              {
                id: 'm6-l1-ck1',
                timestampSeconds: 15,
                question: 'What biochemical phenomenon causes bread to turn hard and stale over time?',
                options: ['Loss of all moisture through crust holes', 'Starch retrogradation (recrystallization of amylose and amylopectin)', 'Bacterial rot of yeast cells', 'Lipid oxidation of sesame seeds'],
                correctIndex: 1,
                explanation: 'Bread stales primarily because starch gelatinizes during baking, then retrogrades (re-crystallizes) as it cools.',
                points: 25
              }
            ],
            transcript: [
              { timestamp: '00:00', seconds: 0, speaker: 'Dr. Chef Supritam Basu', text: 'A hard, dry loaf of artisan bread is not garbage; it is a canvas for high gastronomy.' },
              { timestamp: '00:10', seconds: 10, speaker: 'Dr. Chef Supritam Basu', text: 'In Italian cooking, stale bread gave birth to panzanella, ribollita, and panagrattato—known as poor man’s parmesan.' },
              { timestamp: '00:20', seconds: 20, speaker: 'Dr. Chef Supritam Basu', text: 'Pulse your rock-hard crusts in a food processor, heat cold-pressed olive oil in cast iron with smashed garlic, and fry until golden.' }
            ]
          },
          sections: [
            {
              heading: 'Starch Retrogradation & Water Reactivation',
              content: 'Bread stales not because it loses moisture, but because gelatinized amylose and amylopectin starches re-crystallize (retrogradation). Lightly misting stale bread with water and baking at 180°C (350°F) for 6 minutes temporarily melts retrograded crystals, reviving the crust. For permanently dry bread, grinding into varied crumb sizes unlocks bread dumplings (canederli), romesco sauce thickening, and panagrattato.'
            },
            {
              heading: 'Panagrattato: The Crispy Umami Crunch',
              content: 'Sauté coarse stale sourdough crumbs in garlic-infused olive oil with chili flakes and minced rosemary until deep gold. Season with nutritional yeast and flaky salt for an addictive pasta and roasted vegetable topping.'
            }
          ],
          scrapWasteMetrics: {
            wasteDivertedPercentage: '98%',
            householdAnnualSavingsUSD: '$260',
            co2ReductionKg: '15.3 kg'
          },
          keyTakeaways: [
            'Bread staling is a reversible starch crystallization process in early stages.',
            'Coarse breadcrumbs fried in olive oil provide crunchy texture superior to purchased commercial breadcrumbs.',
            'Stale bread acts as the traditional authentic thickener for gazpacho and romesco.'
          ]
        },
        {
          id: 'm6-l2',
          title: 'Legume Water Alchemy: Aquafaba & Spent Grain Flour',
          readTimeMinutes: 8,
          newsletterRef: [126, 129, 133, 135],
          sections: [
            {
              heading: 'Aquafaba: The Viscous Miracle of Chickpea Cooking Liquid',
              content: 'The liquid drained from cooked or canned chickpeas contains saponins, soluble proteins, and starches that mimic the albumin structure of egg whites. Whipped with a balloon whisk or stand mixer, 45ml of reduced aquafaba creates stable meringue peaks, vegan mayonnaise, and airy chocolate mousse without purchasing animal eggs.'
            },
            {
              heading: 'Brewing Spent Grains to High-Fiber Baking Flour',
              content: 'Spent barley and malt from local craft breweries can be dehydrated at 60°C and ground into high-protein, fiber-dense flour suitable for rustic sourdoughs, cookies, and pizza crusts.'
            }
          ],
          keyTakeaways: [
            'Aquafaba replicates egg white foaming and emulsification through soluble plant proteins.',
            '3 tablespoons of aquafaba equals one whole egg in baking applications.',
            'Upcycling brewery spent grain diverts bulky organic waste into nutrient-dense flour.'
          ]
        }
      ],
      assessment: {
        id: 'm6-assess',
        title: 'Module 6 Knowledge Assessment',
        passingGrade: 80,
        questions: [
          {
            id: 'm6-q1',
            question: 'What biochemical phenomenon is primarily responsible for the staling and hardening of bread over time?',
            options: ['Proteolysis', 'Starch retrogradation (recrystallization of amylose and amylopectin)', 'Lipid rancidity', 'Oxidation of vitamin C'],
            correctIndex: 1,
            explanation: 'Staling is driven by starch retrogradation, where moisture shifts and starch molecules realign into crystalline structures.'
          },
          {
            id: 'm6-q2',
            question: 'What is the standard culinary substitution ratio of reduced chickpea aquafaba for one large egg white?',
            options: ['1 teaspoon', '2 tablespoons (approx 30ml)', '1 cup (240ml)', '500ml'],
            correctIndex: 1,
            explanation: 'Two tablespoons of aquafaba approximates one egg white (three tablespoons for a whole egg) in foaming and baking.'
          },
          {
            id: 'm6-q3',
            question: 'What traditional Italian condiment made from toasted stale breadcrumbs, olive oil, and herbs is known as "poor man’s parmesan"?',
            options: ['Gremolata', 'Panagrattato', 'Béchamel', 'Aioli'],
            correctIndex: 1,
            explanation: 'Panagrattato originated in Southern Italy as a crunchy, savory alternative to expensive hard cheeses.'
          }
        ]
      }
    },
    {
      id: 'module-7',
      moduleNumber: 7,
      title: 'Dairy, Fats, Whey & Emulsion Science',
      subtitle: 'Cultured Butter, Sour Milk Ricotta, Acid Whey Brines & Broken Sauce Recovery',
      estimatedHours: 1.5,
      newsletterRange: 'Issues #136 – #165',
      learningOutcomes: [
        'Instruct culinary staff on identifying safe acidified dairy vs spoiled toxic pathogens.',
        'Develop artisan whole-milk ricotta from milk past its best-before date using gentle acid curdling.',
        'Formulate cultured butter and utilize the resulting acidic buttermilk in sourdough and marinades.',
        'Demonstrate acid whey applications in brining poultry and fermenting soda drinks.',
        'Explain emulsion mechanics to rescue broken hollandaise, mayonnaise, and vinaigrettes.',
        'Calculate yield capture from dairy trimmings and surplus cream inventory.'
      ],
      lessons: [
        {
          id: 'm7-l1',
          title: 'Turning Souring Milk into Fresh Ricotta & Whey',
          readTimeMinutes: 7,
          newsletterRef: [138, 142, 149, 155],
          sections: [
            {
              heading: 'Pasteurized vs Raw Sour Milk Safety Distinction',
              content: 'Store-bought pasteurized milk that begins to turn slightly sour due to natural lactic acid development (but has no pungent putrid odor, mold spores, or slime) is safe for high-heat cheese making. Heating the milk to 85°C-90°C (185°F-194°F) and adding 2% lemon juice, vinegar, or citric acid causes casein proteins to coagulate into pillow-soft fresh curds.'
            },
            {
              heading: 'Harvesting the Liquid Gold: Acid Whey',
              content: 'Straining curds through cheesecloth leaves pale greenish-yellow whey. Whey is packed with lactose, lactic acid, calcium, and water-soluble minerals. It serves as an acidic marinade that tenderizes poultry, a starter liquid for sourdough bread, or the liquid base for boiling polenta and risotto.'
            }
          ],
          scrapWasteMetrics: {
            wasteDivertedPercentage: '91%',
            householdAnnualSavingsUSD: '$290',
            co2ReductionKg: '22.1 kg'
          },
          keyTakeaways: [
            'Heating souring milk to 85°C pasteurizes bacteria while acid separates casein curds cleanly.',
            'Whey should never be dumped down the sink as its high BOD (biochemical oxygen demand) stresses water treatment systems.',
            'Fresh ricotta curds can be whipped with herbs and olive oil for instant dips.'
          ]
        },
        {
          id: 'm7-l2',
          title: 'Rescuing Broken Emulsions & Butter Churning',
          readTimeMinutes: 8,
          newsletterRef: [157, 160, 163, 165],
          sections: [
            {
              heading: 'The Mechanics of Emulsion Breakdown',
              content: 'When hollandaise or mayonnaise breaks, dispersed fat droplets coalesce due to temperature shock or insufficient emulsifier (lecithin). Rather than discarding the costly butter or egg yolks, whisk one tablespoon of warm water or an egg yolk in a clean bowl, then slowly stream the broken sauce back in under vigorous mechanical shear to re-form the emulsion matrix.'
            },
            {
              heading: 'Churning Over-Whipping Cream into Cultured Butter',
              content: 'Cream whipped past stiff peaks separates into butterfat clumps and buttermilk. Squeeze the butterfat under ice water to remove residual buttermilk, shape into a log with coarse sea salt, and reserve the tangy buttermilk for pancakes.'
            }
          ],
          keyTakeaways: [
            'Broken emulsions can be rescued 100% of the time through slow mechanical re-incorporation.',
            'Washing churned butter in ice water removes residual buttermilk, preventing rancidity.',
            'Surplus heavy cream can be converted into artisan butter in less than 8 minutes.'
          ]
        }
      ],
      assessment: {
        id: 'm7-assess',
        title: 'Module 7 Knowledge Assessment',
        passingGrade: 80,
        questions: [
          {
            id: 'm7-q1',
            question: 'What temperature range is required to coagulate casein proteins when making fresh scrap ricotta from milk and acid?',
            options: ['0°C to 10°C', '30°C to 40°C', '85°C to 90°C (185°F to 194°F)', '250°C (480°F)'],
            correctIndex: 2,
            explanation: 'Casein proteins readily denature and separate into firm, delicate curds between 85°C and 90°C in the presence of mild acid.'
          },
          {
            id: 'm7-q2',
            question: 'Why is dumping large volumes of dairy whey into municipal drains considered environmentally detrimental?',
            options: ['It dissolves copper piping', 'It has high Biochemical Oxygen Demand (BOD), depleting aquatic oxygen in waterways', 'It turns into solid cheese in the pipes immediately', 'It emits toxic radioactive gas'],
            correctIndex: 1,
            explanation: 'Dairy whey has high Biochemical Oxygen Demand; decomposing whey consumes vast amounts of dissolved oxygen, suffocating aquatic ecosystems.'
          },
          {
            id: 'm7-q3',
            question: 'What technique successfully rescues a broken, curdled hollandaise or béarnaise sauce?',
            options: ['Microwaving for 10 minutes on high', 'Whisking a tablespoon of warm water or fresh yolk in a clean bowl and slowly re-whisking the broken sauce in', 'Freezing overnight', 'Adding equal parts flour'],
            correctIndex: 1,
            explanation: 'Re-establishing a stable continuous aqueous phase with warm water or fresh lecithin allows the dispersed fat phase to re-emulsify smoothly.'
          }
        ]
      }
    },
    {
      id: 'module-8',
      moduleNumber: 8,
      title: 'Diploma Mid-Term Assessment 2: Advanced Conservation',
      subtitle: 'Comprehensive Mid-Term Examination on Modules 5 through 7',
      estimatedHours: 1.0,
      newsletterRange: 'Issues #71 – #165 Synthesis',
      learningOutcomes: [
        'Evaluate food preservation techniques against microbiology and pH security metrics.',
        'Synthesize bakery, grain, and dairy conservation protocols for commercial kitchen efficiency.',
        'Formulate comprehensive waste recovery recipes integrating multiple food waste streams.',
        'Demonstrate mastery over starch retrogradation and lipid emulsion restoration.'
      ],
      lessons: [
        {
          id: 'm8-l1',
          title: 'Advanced Conservation Case Studies & Cross-System Auditing',
          readTimeMinutes: 6,
          sections: [
            {
              heading: 'Cross-Utilization Systems in Practice',
              content: 'Examine how a modern bakery and bistro intertwines bread crusts, spent brewing mash, whey from house ricotta, and vegetable fermentation brines into a self-sustaining culinary loop.'
            }
          ],
          keyTakeaways: [
            'Systemic zero waste relies on cross-departmental integration between bakery, larder, and butchery.'
          ]
        }
      ],
      assessment: {
        id: 'm8-assess',
        title: 'Diploma Mid-Term Assessment 2',
        passingGrade: 80,
        questions: [
          {
            id: 'm8-q1',
            question: 'When creating citrus oleo saccharum, why should peel strips have as little bitter white pith (albedo) attached as possible?',
            options: ['The white pith absorbs all the sugar without releasing oil and adds unpalatable bitterness', 'The pith explodes under osmotic pressure', 'The pith makes the sugar illegal to sell', 'Pith contains poisonous cyanide'],
            correctIndex: 0,
            explanation: 'The flavedo (colored outer zest) holds the oil sacs, whereas the albedo contains bitter limonin and absorbs moisture without contributing aroma.'
          },
          {
            id: 'm8-q2',
            question: 'How does aquafaba form stable foam structures similar to egg white meringue?',
            options: ['Through dairy fat crystallization', 'Through soluble albumins, proteins, and saponins that trap air bubbles and reduce surface tension', 'Through chemical yeast reaction', 'Through high alcohol content'],
            correctIndex: 1,
            explanation: 'Legume cooking water is dense with soluble proteins and amphiphilic saponins that stabilize foam cell walls under mechanical agitation.'
          },
          {
            id: 'm8-q3',
            question: 'What is the safe microbiological threshold pH required in fermented vegetables to ensure safety against pathogens?',
            options: ['pH 9.5', 'pH 6.5', 'pH ≤ 4.6', 'pH 12.0'],
            correctIndex: 2,
            explanation: 'A pH at or below 4.6 creates an acidic environment hostile to Clostridium botulinum and enteric pathogens.'
          }
        ]
      }
    },
    {
      id: 'module-9',
      moduleNumber: 9,
      title: 'Energy-Smart, Water-Wise Cooking & Equipment Efficiency',
      subtitle: 'Residual Heat Cookery, Induction Precision, Greywater Cycling & Appliance Maintenance',
      estimatedHours: 1.5,
      newsletterRange: 'Issues #166 – #195',
      learningOutcomes: [
        'Instruct kitchen operators on residual heat cookery (carryover cooking) to slash thermal utility usage.',
        'Develop water capture and greywater recycling protocols for vegetable wash stations.',
        'Identify energy efficiency differences between induction, high-BTU gas, and combi-steam technology.',
        'Describe preventive maintenance protocols for refrigeration gaskets, condenser coils, and seal integrity.',
        'Formulate batch cooking and oven consolidation schedules to eliminate idle pre-heat cycles.',
        'Calculate kilowatt-hour (kWh) and gallon savings achieved through thermal kitchen optimization.'
      ],
      lessons: [
        {
          id: 'm9-l1',
          title: 'Thermal Momentum: Mastering Residual Heat & Carryover Cooking',
          readTimeMinutes: 7,
          newsletterRef: [168, 172, 179, 185],
          sections: [
            {
              heading: 'Harnessing the Heat Capacity of Cast Iron & Heavy Steel',
              content: 'Heavy cookware retains significant thermal energy. Once a boiling pot of beans, whole grains, or braises reaches peak temperature, the burner can be switched off 20-30 minutes early if covered with an insulated lid or thermal cooking cozy (wonderbag). The food finishes cooking on stored thermal mass alone, cutting energy use by 40%.'
            },
            {
              heading: 'Induction versus Gas Efficiency',
              content: 'Traditional gas burners transmit only 35-40% of their heat energy into the pan, radiating 60% directly into the kitchen atmosphere. Magnetic induction transfers 85-90% of energy straight to the ferrous pan base, reducing cooking times, cooling loads, and indoor air pollution.'
            }
          ],
          scrapWasteMetrics: {
            wasteDivertedPercentage: '75%',
            householdAnnualSavingsUSD: '$350',
            co2ReductionKg: '45.0 kg'
          },
          keyTakeaways: [
            'Heavy-gauge cookware retains thermal energy for passive simmering.',
            'Induction stoves operate at nearly double the thermal efficiency of gas burners.',
            'Consolidating oven bake times reduces repeated 20-minute empty preheats.'
          ]
        },
        {
          id: 'm9-l2',
          title: 'Water Auditing & Prep Wash Cycling',
          readTimeMinutes: 7,
          newsletterRef: [188, 191, 194],
          sections: [
            {
              heading: 'The Three-Tier Wash Basin System',
              content: 'Running tap water continuously to wash leafy greens consumes up to 15 liters per minute. Implementing a stagnant three-basin wash (Soak Basin → Agitation Basin → Final Rinse) reduces water consumption by 80%. The non-soapy clean wash water can be captured to hydrate outdoor herbs or compost piles.'
            }
          ],
          keyTakeaways: [
            'Continuous tap rinsing wastes thousands of gallons of municipal water monthly.',
            'Three-basin staging is cleaner and uses a fraction of running tap volume.'
          ]
        }
      ],
      assessment: {
        id: 'm9-assess',
        title: 'Module 9 Knowledge Assessment',
        passingGrade: 80,
        questions: [
          {
            id: 'm9-q1',
            question: 'What percentage of thermal energy from an induction cooktop is transferred directly to the cooking vessel?',
            options: ['10-15%', '35-40%', '85-90%', '100%'],
            correctIndex: 2,
            explanation: 'Induction uses electromagnetic fields to excite iron molecules directly in the pan base, achieving 85-90% energy transfer efficiency.'
          },
          {
            id: 'm9-q2',
            question: 'What is carryover cooking (residual heat cooking)?',
            options: ['Reheating leftover food in a microwave', 'The continued internal temperature rise and cooking that occurs after the heat source is removed', 'Cooking food in an open fire pit', 'Cooling food rapidly in ice baths'],
            correctIndex: 1,
            explanation: 'Carryover cooking is the process where thermal momentum continues to cook food through stored heat after removal from active burners.'
          },
          {
            id: 'm9-q3',
            question: 'How much water does an unthrottled running commercial kitchen prep tap typically consume per minute?',
            options: ['0.5 liters', '2 liters', '10 to 15 liters', '100 liters'],
            correctIndex: 2,
            explanation: 'Standard unthrottled commercial taps flow at 10 to 15 liters per minute, creating enormous water loss during continuous prep.'
          }
        ]
      }
    },
    {
      id: 'module-10',
      moduleNumber: 10,
      title: 'Circular Pantry Design, Inventory Control & Expiry Engineering',
      subtitle: 'FIFO Logistics, ‘Best Before’ vs ‘Use By’ Legality, Dehydrator Pantries & Freezer Audits',
      estimatedHours: 2.0,
      newsletterRange: 'Issues #196 – #220',
      learningOutcomes: [
        'Instruct households and culinary teams on establishing a strict First-In, First-Out (FIFO) visual pantry.',
        'Distinguish the legal, regulatory, and food safety differences between "Best Before" and "Use By" date labels.',
        'Develop an organized freezer quadrant system to prevent freezer burn and forgotten inventory.',
        'Identify optimal humidity zones in commercial and domestic refrigeration crisper drawers.',
        'Formulate an inventory "Eat-Me-First" staging container protocol.',
        'Calculate household savings achieved by eliminating premature expiry discards.'
      ],
      lessons: [
        {
          id: 'm10-l1',
          title: 'Deciphering Date Labels: "Best Before" vs "Use By" Regulatory Science',
          readTimeMinutes: 8,
          newsletterRef: [197, 202, 208, 214],
          sections: [
            {
              heading: 'The Consumer Confusion Crisis',
              content: 'Over 80% of household food waste stems from misunderstandings regarding printed date codes. "Use By" is a strict biological safety date governing highly perishable items prone to listeria or salmonella (such as fresh poultry, unpasteurized dairy, and smoked fish). "Best Before" (or "Best If Used By") is an aesthetic manufacturer quality date indicating peak flavor, color, or texture. Foods past their "Best Before" are completely safe to consume if packaging is intact and sensory checks pass.'
            },
            {
              heading: 'The Sensory Validation Protocol',
              content: 'Train your senses using the Three-Step Sensory Screen: (1) Visual (inspect for active mold hyphae, discoloration, can swelling), (2) Olfactory (sniff for sour sulfur or ammonia notes), and (3) Tactile (check for unnatural sliminess or loss of turgor pressure).'
            }
          ],
          scrapWasteMetrics: {
            wasteDivertedPercentage: '90%',
            householdAnnualSavingsUSD: '$480',
            co2ReductionKg: '31.0 kg'
          },
          keyTakeaways: [
            '“Best Before” dates indicate sensory quality, not microbiological toxicity.',
            'Canned and dry goods remain safe for years past printed "Best Before" dates if cans are free of dents and swelling.',
            'Sensory inspection is a fundamental culinary competency.'
          ]
        },
        {
          id: 'm10-l2',
          title: 'The FIFO Pantry & The "Eat-Me-First" Bin',
          readTimeMinutes: 7,
          newsletterRef: [216, 218, 220],
          sections: [
            {
              heading: 'Implementing Visual FIFO Layouts',
              content: 'In restaurants, inventory is rotated strictly First-In, First-Out. At home, placing a clear plastic container labeled "Eat-Me-First" on the central refrigerator shelf consolidates open cheeses, half-used onions, opened jars, and herbs. Chefs and family members cook from this box before opening fresh packaging.'
            }
          ],
          keyTakeaways: [
            'Visual consolidation on the eye-level shelf reduces forgotten refrigerator losses by up to 60%.',
            'Square clear containers optimize shelf volume compared to round containers.'
          ]
        }
      ],
      assessment: {
        id: 'm10-assess',
        title: 'Module 10 Knowledge Assessment',
        passingGrade: 80,
        questions: [
          {
            id: 'm10-q1',
            question: 'What is the key regulatory distinction between a "Use By" date and a "Best Before" date on food packaging?',
            options: ['There is no difference; both mean the food is poisonous after that date', '"Use By" is a food safety deadline for high-risk foods; "Best Before" reflects manufacturer peak sensory quality', '"Best Before" is enforced by law, whereas "Use By" is an advertising suggestion', '"Use By" applies only to frozen vegetables'],
            correctIndex: 1,
            explanation: '"Use By" indicates microbial safety thresholds, whereas "Best Before" denotes peak quality and freshness.'
          },
          {
            id: 'm10-q2',
            question: 'What does the kitchen inventory acronym FIFO stand for?',
            options: ['Fast In, Fast Out', 'First In, First Out', 'Food Inspection For Organics', 'Frozen Ingredients For Ovens'],
            correctIndex: 1,
            explanation: 'FIFO (First In, First Out) ensures older inventory is rotated to the front and consumed before newly purchased ingredients.'
          },
          {
            id: 'm10-q3',
            question: 'Which of the following indicates potential severe anaerobic bacterial growth in canned food?',
            options: ['A clean paper label', 'Swollen, bulging can ends or spurting liquid when punctured', 'Cold temperature when stored in a pantry', 'A faint metallic scent'],
            correctIndex: 1,
            explanation: 'Bulging or swollen cans indicate gas produced by microbial growth (such as Clostridium botulinum) and must never be tasted.'
          }
        ]
      }
    },
    {
      id: 'module-11',
      moduleNumber: 11,
      title: 'Commercial Scale, Restaurant Operations & Catering Waste Systems',
      subtitle: 'Menu Engineering, Prep-List Yields, Staff Training, Composting & Food Donation Law',
      estimatedHours: 2.0,
      newsletterRange: 'Issues #221 – #245',
      learningOutcomes: [
        'Instruct authors, chefs, and kitchen managers on circular menu engineering for cross-utilization.',
        'Develop prep-sheet par levels that dynamically align with forecasted covers to eliminate over-prepping.',
        'Implement staff onboarding protocols that incentivize kitchen waste diversion benchmarks.',
        'Identify local Good Samaritan food donation laws and liability protections for commercial kitchens.',
        'Explain on-site closed-loop composting systems (tumblers, bokashi, vermicomposting) versus municipal digestion.',
        'Calculate restaurant gross margin expansion achieved through whole-ingredient prep yields.'
      ],
      lessons: [
        {
          id: 'm11-l1',
          title: 'Circular Menu Engineering: The Art of Cross-Utilization',
          readTimeMinutes: 8,
          newsletterRef: [222, 227, 233, 239],
          sections: [
            {
              heading: 'Designing Menus that Self-Consume Waste',
              content: 'A zero-waste commercial kitchen never designs a dish in isolation. Every primary component must have a premeditated secondary outlet. If the main dining room serves pan-seared duck breast, the duck legs are confited, duck skin rendered into cooking fat for roast potatoes, duck carcasses simmered into dark jus, and duck liver incorporated into terrines. The entire purchase cost is amortized across five high-margin menu items.'
            },
            {
              heading: 'Dynamic Prep-Lists Based on Historical Pos Data',
              content: 'Over-preparation causes 45% of commercial kitchen spoilage. Tying daily prep sheets to POS sales velocity algorithms rather than static gut-feeling prep guides prevents surplus mise-en-place from spoiling overnight.'
            }
          ],
          scrapWasteMetrics: {
            wasteDivertedPercentage: '94%',
            householdAnnualSavingsUSD: '$1,200',
            co2ReductionKg: '86.4 kg'
          },
          keyTakeaways: [
            'Every primary menu item must have a premeditated downstream scrap destination.',
            'Cross-utilization eliminates dead stock and minimizes walk-in clutter.',
            'Dynamic prep sheets prevent batch over-production.'
          ]
        },
        {
          id: 'm11-l2',
          title: 'Food Donation Protocols & Closed-Loop Onsite Composting',
          readTimeMinutes: 7,
          newsletterRef: [241, 243, 245],
          sections: [
            {
              heading: 'Legal Protections for Food Donation (The Bill Emerson Act)',
              content: 'Many managers discard safe, edible prepared foods fearing civil liability. In the United States and EU equivalents, legislation like the Bill Emerson Good Samaritan Food Donation Act shields donors from civil and criminal liability when donating wholesome food in good faith to nonprofit organizations.'
            },
            {
              heading: 'Bokashi & Aerobic In-Vessel Digesters',
              content: 'In-vessel digesters and anaerobic Bokashi microbial systems allow commercial restaurants to ferment all food scraps—including meat bones, citrus, and dairy—on-site without foul odors or pest attraction, producing nutrient-rich compost in weeks.'
            }
          ],
          keyTakeaways: [
            'Good Samaritan acts protect businesses donating wholesome surplus food in good faith.',
            'Bokashi systems safely ferment meat and dairy scraps that conventional home composters avoid.',
            'Partnering with local shelters diverts edible food to communities in need.'
          ]
        }
      ],
      assessment: {
        id: 'm11-assess',
        title: 'Module 11 Knowledge Assessment',
        passingGrade: 80,
        questions: [
          {
            id: 'm11-q1',
            question: 'What federal legislation in the United States protects restaurants and grocers from civil and criminal liability when donating wholesome food in good faith?',
            options: ['The National Highway Safety Act', 'The Bill Emerson Good Samaritan Food Donation Act', 'The Sarbanes-Oxley Act', 'The Clean Air Act of 1990'],
            correctIndex: 1,
            explanation: 'The Bill Emerson Good Samaritan Food Donation Act protects donors from legal liability when donating wholesome surplus food to non-profits.'
          },
          {
            id: 'm11-q2',
            question: 'In circular restaurant menu engineering, what does "cross-utilization" mean?',
            options: ['Cooking food with ingredients from two different grocery stores', 'Designing dishes so that trim or byproducts from one dish become the primary ingredient in another', 'Hiring chefs who speak multiple languages', 'Using both gas and electric stoves simultaneously'],
            correctIndex: 1,
            explanation: 'Cross-utilization ensures byproducts (e.g. bones, stems, peels, trims) from one menu item are purposefully utilized in other dishes.'
          },
          {
            id: 'm11-q3',
            question: 'What unique capability distinguishes the Japanese Bokashi composting method from standard outdoor aerobic compost piles?',
            options: ['It uses worms that live in freezing ice', 'It utilizes anaerobic microbial fermentation to process meat, dairy, and cooked food scraps without foul odors', 'It only works in underwater environments', 'It turns plastic into organic soil'],
            correctIndex: 1,
            explanation: 'Bokashi uses effective microorganisms (EM) in an airtight container to ferment all food waste, including cooked items, dairy, and small bones.'
          }
        ]
      }
    },
    {
      id: 'module-12',
      moduleNumber: 12,
      title: 'Final Comprehensive Course Assessment & Diploma Certification',
      subtitle: 'Final Examination, Capstone Kitchen Protocol & Diploma Issuance',
      estimatedHours: 2.0,
      newsletterRange: 'Issues #1 – #252 Complete Synthesis',
      learningOutcomes: [
        'Demonstrate comprehensive mastery across all 11 domains of zero-waste culinary arts.',
        'Synthesize microbiological preservation safety, root-to-stem knife skills, and whole-protein utilization.',
        'Formulate a complete 360-degree Zero Waste Kitchen Operational Manual.',
        'Earn the Accredited Diploma in Sustainable Culinary Arts & The Zero Waste Kitchen.'
      ],
      lessons: [
        {
          id: 'm12-l1',
          title: 'The Capstone Blueprint: Your 360° Zero-Waste Kitchen Manual',
          readTimeMinutes: 7,
          newsletterRef: [246, 248, 250, 252],
          sections: [
            {
              heading: 'Consolidating the 252 Lessons into Daily Practice',
              content: 'Over the course of 252 newsletters and 11 rigorous modules, you have explored the science of food waste auditing, vegetable scrap transformation, bone broths, fermentation salinity, sourdough discard revival, dairy recovery, thermal efficiency, and circular menu design. Completing this final assessment certifies your expertise as a qualified Sustainable Culinary Specialist.'
            }
          ],
          keyTakeaways: [
            'Zero waste is not perfectionism; it is a rigorous, creative, continuous commitment to ingredient reverence.',
            'Passing this comprehensive assessment certifies your accreditation with 80%+ mastery.'
          ]
        }
      ],
      assessment: {
        id: 'm12-assess',
        title: 'Final Alison Diploma Comprehensive Assessment',
        passingGrade: 80,
        questions: [
          {
            id: 'm12-q1',
            question: 'What is the scientifically verified safe salinity percentage for wild vegetable lacto-fermentation?',
            options: ['0.5% by volume', '2.0% to 2.5% of total combined vegetable and water weight', '15% by weight', '50% table salt'],
            correctIndex: 1,
            explanation: '2.0% to 2.5% total salinity creates the precise halotolerant barrier for lactic acid bacteria while preventing pathogenic spoilage.'
          },
          {
            id: 'm12-q2',
            question: 'Which method transforms rock-hard stale bread by reversing starch retrogradation in early staling stages?',
            options: ['Boiling in oil for 2 hours', 'Lightly misting with water and baking at 180°C (350°F) for 5-7 minutes', 'Freezing in open air', 'Dusting with baking powder'],
            correctIndex: 1,
            explanation: 'Gentle moisture and heat temporarily break retrograded amylose crystalline structures, re-softening crumb and crisping crust.'
          },
          {
            id: 'm12-q3',
            question: 'What primary environmental hazard is caused when kitchen organic scraps decompose in landfills rather than being diverted or composted?',
            options: ['Ozone layer depletion in the troposphere', 'Methane (CH4) gas generation under anaerobic conditions', 'Acid rain over agricultural fields', 'Radon gas leakage'],
            correctIndex: 1,
            explanation: 'Organic waste under compacted anaerobic landfill conditions produces massive quantities of potent methane gas.'
          },
          {
            id: 'm12-q4',
            question: 'What is the standard culinary substitution ratio for aquafaba to replace one large egg white?',
            options: ['1 teaspoon', '2 tablespoons (approx 30ml)', '1 cup', '0.5 liter'],
            correctIndex: 1,
            explanation: 'Two tablespoons of chickpea cooking liquid contains sufficient soluble proteins to replicate one egg white.'
          },
          {
            id: 'm12-q5',
            question: 'Which temperature range is critical for coagulating fresh ricotta curds from souring milk with mild acid?',
            options: ['10°C to 20°C', '40°C to 50°C', '85°C to 90°C (185°F to 194°F)', '140°C'],
            correctIndex: 2,
            explanation: 'Casein proteins cleanly separate into light curds between 85°C and 90°C without scorched milk flavor.'
          }
        ]
      }
    }
  ]
};
