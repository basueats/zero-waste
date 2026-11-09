import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Play, 
  Pause, 
  FileText, 
  HelpCircle, 
  MessageSquare, 
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  RotateCcw,
  FastForward,
  BookOpen,
  Newspaper,
  Layers,
  GraduationCap,
  ExternalLink,
  Info,
  Clock,
  ShieldCheck,
  Send,
  Mic
} from 'lucide-react';
import { initialCourseData } from '../data/zeroWasteCourseData';
import { all252Newsletters } from '../data/newslettersCatalog';
import { surplusCourses } from '../data/surplusData';
import { CourseModule, Lesson, VideoQuizCheckpoint } from '../types/course';
import { audioNarrator, AVAILABLE_VOICES, TTSVoiceName, tokenizeTextIntoWords } from '../utils/audioNarrator';

interface SurplusCoursePlayerProps {
  courseId: string;
  initialModuleNumber?: number;
  onBackToCourses: () => void;
  onOpenCertify: () => void;
}

// Module-specific technical Standard Operating Procedures (SOPs)
const MODULE_SOPS: Record<number, { title: string; filename: string; size: string; type: string }[]> = {
  1: [
    { title: '7-Day Tare-Weighted Station Waste Audit Log & Methane Factor Calculator', filename: 'SOP-M01-7Day-Tare-Weight-Waste-Audit.pdf', size: '0.62 MB', type: 'Station Audit Protocol' },
    { title: 'EPA/FAO Food Recovery Hierarchy Brigade Execution Guide', filename: 'SOP-M01-Food-Recovery-Hierarchy-SOP.pdf', size: '0.48 MB', type: 'Author, Chef SOP' }
  ],
  2: [
    { title: 'Cauliflower Leaf & Stem Spiced Chutney Technical Formulation', filename: 'Cauliflower leaf chutney.pdf', size: '0.58 MB', type: 'Recipe Formulation Card' },
    { title: 'Watermelon White Mesocarp Rind Chutney & Glazes', filename: 'Watermelon rind chutney.pdf', size: '0.77 MB', type: 'Recipe Formulation Card' },
    { title: 'Brassica PME Enzyme Activation & Low-Temp Blanching Protocol (55°C–65°C)', filename: 'SOP-M02-Brassica-PME-Enzymatic-Blanching.pdf', size: '0.65 MB', type: 'Culinary Science SOP' }
  ],
  3: [
    { title: 'Triple-Helix Collagen Hydrolysis & Sub-Boiling Scrap Stock Protocol (88°C)', filename: 'SOP-M03-Collagen-Extraction-Bone-Broth.pdf', size: '0.71 MB', type: 'Culinary Science SOP' },
    { title: 'Seafood Frame Delicate Fumet 25-Minute Extraction & Albumen Clarification', filename: 'SOP-M03-Scrap-Stock-Clarification-Consomme.pdf', size: '0.54 MB', type: 'Standard Operating Procedure' }
  ],
  4: [
    { title: 'Line-Cook Knife Yield & Station Scrap Variance Audit Rubric', filename: 'SOP-M04-Commercial-Yield-Variance-Audit.pdf', size: '0.59 MB', type: 'Kitchen Management Audit' },
    { title: 'Edible Portion (EP) vs As Purchased (AP) Food Cost Matrix', filename: 'SOP-M04-EP-AP-True-Cost-Formula.pdf', size: '0.45 MB', type: 'Yield Spreadsheet Template' }
  ],
  5: [
    { title: 'Wild Lacto-Fermentation 2.0% Salinity Standard Protocol & pH Tracking Log', filename: 'SOP-M05-Wild-Lacto-Fermentation-2Percent-Salinity.pdf', size: '0.68 MB', type: 'Food Safety & CCP Protocol' },
    { title: 'Aspergillus oryzae (Koji) Inoculation for Kitchen Scrap Garums', filename: 'SOP-M05-Scrap-Kimchi-Koji-Inoculation.pdf', size: '0.82 MB', type: 'Advanced Microbial Upcycling' }
  ],
  6: [
    { title: 'Thermal Dehydration, Lyophilization & Scrap Umami Powder Formulation', filename: 'SOP-M06-Thermal-Dehydration-Umami-Powders.pdf', size: '0.63 MB', type: 'Recipe Formulation Card' },
    { title: 'Citrus Flavedo Hygroscopic Oleo Saccharum Extraction (1:1 Ratio)', filename: 'SOP-M06-Citrus-Flavedo-Oleo-Saccharum.pdf', size: '0.55 MB', type: 'Bar & Pastry Protocol' }
  ],
  7: [
    { title: 'Dr. Chef Basu’s Emulsified Day-Old Croissant Sauce (Viennoiserie Revival)', filename: 'Croissant Sauce Formulation SOP.pdf', size: '0.51 MB', type: 'Signature Formulation SOP' },
    { title: 'Stale Artisan Sourdough Kvas Beverage & Crispy Brown-Butter Panagrattato', filename: 'SOP-M07-Stale-Bakery-Panagrattato-Kvas.pdf', size: '0.58 MB', type: 'Bakery Upcycling Protocol' }
  ],
  8: [
    { title: 'Two-Stage Scrap Vinegar: Saccharomyces to Acetobacter Aceti Oxidation', filename: 'SOP-M08-Scrap-Vinegar-Acetobacter-Oxidation.pdf', size: '0.64 MB', type: 'Culinary Science SOP' },
    { title: 'Freeze-Thaw Gelatin Syneresis for Crystal-Clear Vegetable Consommés', filename: 'SOP-M08-Freeze-Thaw-Consomme-Clarification.pdf', size: '0.52 MB', type: 'Consommé Master Protocol' }
  ],
  9: [
    { title: 'Dairy Whey Reclamation: Sweet & Acid Whey Viscous Gastronomic Glazes', filename: 'SOP-M09-Acid-Whey-Reclamation-Glazes.pdf', size: '0.57 MB', type: 'Dairy Upcycling SOP' },
    { title: 'Isoelectric Casein Acid Clotting & Scrap Ricotta Formulation (pH 4.6)', filename: 'SOP-M09-Scrap-Ricotta-Acid-Clotting.pdf', size: '0.49 MB', type: 'Cheese & Larder SOP' }
  ],
  10: [
    { title: 'The Circular Input/Output Recipe Matrix: Pairing Primary Cuts with Byproduct Sinks', filename: 'SOP-M10-Input-Output-Recipe-Matrix.pdf', size: '0.74 MB', type: 'Author, Chef Menu System' },
    { title: 'Dynamic Kitchen Blackboard Specials for Variable Prep Yields', filename: 'SOP-M10-Dynamic-Blackboard-Yield-Sinks.pdf', size: '0.50 MB', type: 'Operational Guidelines' }
  ],
  11: [
    { title: 'Buffet Thermodynamics: Shallow 1/2 and 1/3 GN Pan Geometry & Visual Abundance', filename: 'SOP-M11-Buffet-Shallow-GN-Insert-Thermodynamics.pdf', size: '0.67 MB', type: 'Hotel & Banquet System' },
    { title: 'The Final 45-Minute Cook-to-Order Staggered Kitchen Transition Plan', filename: 'SOP-M11-45Min-Cook-To-Order-Transition.pdf', size: '0.53 MB', type: 'Shift Leader SOP' }
  ],
  12: [
    { title: 'HACCP Critical Control Points (CCPs) for Commercial Upcycled Kitchen Byproducts', filename: 'SOP-M12-HACCP-Upcycled-Food-Safety-Verification.pdf', size: '0.85 MB', type: 'Accreditation Master SOP' },
    { title: 'Author, Chef Master Kitchen Food Waste Audit & Certification Inspection Rubric', filename: 'SOP-M12-Author-Chef-Kitchen-Audit-Master-Sheet.pdf', size: '0.79 MB', type: 'CPD Diploma Final Capstone' }
  ]
};

// Default transcripts for modules - measured, calm 10-second intervals for relaxed, unhurried pacing
const DEFAULT_MODULE_NARRATIONS: Record<number, { speaker: string; text: string; seconds: number; timestamp: string }[]> = {
  1: [
    { speaker: 'Dr. Chef Supritam Basu', text: 'Welcome to Module 1 of the Zero Waste Kitchen Diploma. Today we analyze the hidden economic and environmental cost of food waste.', seconds: 0, timestamp: '00:00' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'Globally, over 33% of harvested food is discarded. Landfilled organics decompose anaerobically, emitting methane 28x more damaging than CO2.', seconds: 10, timestamp: '00:10' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'To eradicate this, we establish a 7-day tare-weighted audit separating Preparation Waste from Spoilage and Plate Waste.', seconds: 20, timestamp: '00:20' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'By weighing each bucket at shift end, we convert grams into exact currency leakage, giving our kitchen brigade clear cost recovery targets.', seconds: 30, timestamp: '00:30' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'In our next demonstration, we will compute your kitchen divergence rate and build your station audit tracking sheet.', seconds: 40, timestamp: '00:40' }
  ],
  2: [
    { speaker: 'Dr. Chef Supritam Basu', text: 'Notice this thick stalk of broccoli. Most line cooks trim off the florets and discard the stalk, throwing away 40% of the purchased weight.', seconds: 0, timestamp: '00:00' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'Strip the fibrous outer bark with a sharp Y-peeler to expose the translucent jade core, packed with natural sugars and crisp texture.', seconds: 10, timestamp: '00:10' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'We mandoline the core into paper-thin ribbons and activate Pectin Methyl Esterase at 55°C–65°C to preserve crispness permanently.', seconds: 20, timestamp: '00:20' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'Simultaneously, we transform bitter cauliflower leaves and watermelon white rind into rich spiced chutneys and glazed side dishes.', seconds: 30, timestamp: '00:30' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'Remember: root-to-stem cooking is not about sacrifice; it is about harvesting the highest flavor concentrations of the plant.', seconds: 40, timestamp: '00:40' }
  ],
  3: [
    { speaker: 'Dr. Chef Supritam Basu', text: 'Animal carcasses and trimming collagen are pure culinary liquid gold when extracted correctly.', seconds: 0, timestamp: '00:00' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'Roast frames at 165°C for Maillard aroma development, then submerge in cold water and maintain at sub-boiling 88°C.', seconds: 10, timestamp: '00:10' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'Never allow violent boiling! Boiling emulsifies fats into cloudiness. Gentle sub-boiling yields crystal-clear gelatin matrices.', seconds: 20, timestamp: '00:20' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'For fish bones, 25 minutes is the strict critical limit. Beyond 30 minutes, calcium and minerals leech bitter, astringent off-notes.', seconds: 30, timestamp: '00:30' }
  ],
  4: [
    { speaker: 'Dr. Chef Supritam Basu', text: 'Food waste is engineered in the chef’s office long before any knife strikes a cutting board.', seconds: 0, timestamp: '00:00' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'We conduct knife yield testing across line cooks to measure blade angle efficiency and eliminate station trim variance.', seconds: 10, timestamp: '00:10' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'True food cost equals purchase price divided by edible portion yield. Every 5% gain in trim recovery adds thousands to gross operating margin.', seconds: 20, timestamp: '00:20' }
  ],
  5: [
    { speaker: 'Dr. Chef Supritam Basu', text: 'Wild lacto-fermentation is culinary science’s most resilient preservation technology for vegetable scraps.', seconds: 0, timestamp: '00:00' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'Always apply the 2.0% Golden Rule: multiply total weight of scraps plus water by 0.02 to calculate the required sea salt mass.', seconds: 10, timestamp: '00:10' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'This creates an osmotic environment where beneficial Lactobacillus flourish while pathogenic Clostridium botulinum is permanently inhibited.', seconds: 20, timestamp: '00:20' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'Within 72 hours at ambient room temperature, the pH plunges below 4.2, yielding deeply savory, probiotic restaurant condiments.', seconds: 30, timestamp: '00:30' }
  ],
  6: [
    { speaker: 'Dr. Chef Supritam Basu', text: 'Thermal dehydration reduces scrap water activity below 0.60, stopping bacterial growth completely.', seconds: 0, timestamp: '00:00' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'We slow-dehydrate onion skins, leek greens, and mushroom stems, then grind with sea salt into vibrant savory finishing dusts.', seconds: 10, timestamp: '00:10' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'For citrus peels, cold sugar maceration creates Oleo Saccharum: sucrose draws out aromatic essential oils without heat degradation.', seconds: 20, timestamp: '00:20' }
  ],
  7: [
    { speaker: 'Dr. Chef Supritam Basu', text: 'A stale croissant or dry baguette is not kitchen refuse; it is a gastronomic canvas.', seconds: 0, timestamp: '00:00' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'When starches retrograde during staling, they absorb hot liquids readily. We steep deeply roasted croissants in warm milk.', seconds: 10, timestamp: '00:10' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'High-shear blending disperses the 82% butterfat through the starch matrix into our signature velvety Croissant Sauce.', seconds: 20, timestamp: '00:20' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'For savory sourdough crusts, we pulse and fry in brown butter with garlic for Italian panagrattato, the poor man’s parmesan.', seconds: 30, timestamp: '00:30' }
  ],
  8: [
    { speaker: 'Dr. Chef Supritam Basu', text: 'Fruit trimmings, peels, and apple cores contain natural sugars and wild yeasts ready for acetic acid fermentation.', seconds: 0, timestamp: '00:00' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'First, wild yeasts convert sugars to ethanol. Next, Acetobacter aceti bacteria oxidize the alcohol into pure culinary scrap vinegar.', seconds: 10, timestamp: '00:10' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'We also use freeze-thaw gelatin syneresis: freezing stock and thawing it through cheesecloth leaves all impurities trapped in the ice mesh.', seconds: 20, timestamp: '00:20' }
  ],
  9: [
    { speaker: 'Dr. Chef Supritam Basu', text: 'Dairy waste often occurs as liquid sweet and acid whey during cheese making or strained yogurt prep.', seconds: 0, timestamp: '00:00' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'Never dump whey down the drain! Its high protein and lactic acid make it an exquisite glaze reduction for braised proteins and glazed carrots.', seconds: 10, timestamp: '00:10' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'We can also gently heat milk that is on the edge of souring to 85°C and induce casein coagulation with citrus acid for fresh kitchen ricotta.', seconds: 20, timestamp: '00:20' }
  ],
  10: [
    { speaker: 'Dr. Chef Supritam Basu', text: 'In circular menu engineering, every dish on the menu has a designated byproduct sink before service starts.', seconds: 0, timestamp: '00:00' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'When the grill station trims prime beef tenderloin, the scraps automatically feed the larder tartare and the bones feed the saucier demi-glace.', seconds: 10, timestamp: '00:10' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'Our dynamic blackboard daily specials absorb variable vegetable prep yields without forcing menu alterations.', seconds: 20, timestamp: '00:20' }
  ],
  11: [
    { speaker: 'Dr. Chef Supritam Basu', text: 'Hotel and banquet buffet lines are notorious for food loss. We solve this through shallow pan thermodynamics.', seconds: 0, timestamp: '00:00' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'Replace deep 1/1 GN pans with shallow 1/2 and 1/3 GN inserts: the food looks overflowing and abundant, but holding volume is reduced by 60%.', seconds: 10, timestamp: '00:10' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'For example, if the end of buffet service is in 45 minutes, we switch immediately to live cook-to-order stations, eliminating overproduction entirely.', seconds: 20, timestamp: '00:20' }
  ],
  12: [
    { speaker: 'Dr. Chef Supritam Basu', text: 'Congratulations on reaching the final author, chef capstone of our Zero Waste Kitchen Diploma.', seconds: 0, timestamp: '00:00' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'Every zero-waste initiative must pass rigorous HACCP food safety standards and microbiological validation.', seconds: 10, timestamp: '00:10' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'True kitchen leadership means creating a culture where line cooks take immense culinary pride in extracting maximum value from every ingredient.', seconds: 20, timestamp: '00:20' },
    { speaker: 'Dr. Chef Supritam Basu', text: 'Complete the comprehensive final assessment below to earn your accredited CPD Level 7 Diploma certificate.', seconds: 30, timestamp: '00:30' }
  ]
};

export const SurplusCoursePlayer: React.FC<SurplusCoursePlayerProps> = ({
  courseId,
  initialModuleNumber = 1,
  onBackToCourses,
  onOpenCertify,
}) => {
  const [activeCourseId, setActiveCourseId] = useState<string>(courseId);

  useEffect(() => {
    setActiveCourseId(courseId);
    setSelectedModuleIndex(0);
    setSelectedLessonIndex(0);
  }, [courseId]);

  const activeCourse = surplusCourses.find((c) => c.id === activeCourseId) || surplusCourses[0];
  const isMasterCourse = activeCourse.isMasterCourse || activeCourse.id === 'food-waste-prevention-chefs';

  const allModules: CourseModule[] = isMasterCourse
    ? initialCourseData.modules
    : (activeCourse.lessons || []).map((les, idx) => ({
        id: `mod-${les.id}`,
        moduleNumber: idx + 1,
        title: les.title,
        subtitle: les.description || 'Specialized commercial culinary protocol',
        estimatedHours: 0.5,
        newsletterRange: les.newsletterRef || activeCourse.newsletterRange || 'Zero Waste Series',
        learningOutcomes: [
          `Master ${les.title.toLowerCase()} in high-volume kitchen environments.`,
          `Formulate standard mass balance: ${les.culinaryFormula || 'Standard yield ratio'}.`,
          `Enforce HACCP food safety standards and station tare-weight logging.`
        ],
        lessons: [
          {
            id: les.id,
            title: les.title,
            readTimeMinutes: parseInt(les.duration) || 18,
            heroImage: activeCourse.coverImage,
            sections: [
              {
                heading: '1. Author, Chef Culinary Protocol & Operational Rationale',
                content: les.description || 'Eliminating avoidable kitchen waste through standardized knife mechanics, temperature monitoring, and tare-weighted scrap diversion.'
              },
              {
                heading: '2. Biochemical Mechanism & Cellular Science',
                content: les.scientificConcept || 'Enzymatic deactivation and cell wall stabilization preventing microbial degradation and nutrient loss.'
              },
              {
                heading: '3. Standard Operating Procedure & Recipe Formulation',
                content: 'Wash, inspect, and weigh all station trimmings into designated tare-weighted Cambros. Execute standardized extraction or formulation protocol.',
                formulaBox: {
                  title: 'Culinary Formulation / Mass-Balance Ratio',
                  ratioOrStep: les.culinaryFormula || 'Mass Balance: W_raw = W_yield + W_trim',
                  safetyNote: 'Maintain strict hot-holding (>= 63°C) or rapid cold-chilling (<= 3°C) compliance.'
                }
              }
            ],
            scrapWasteMetrics: {
              wasteDivertedPercentage: '85%',
              householdAnnualSavingsUSD: '$480',
              co2ReductionKg: '28 kg'
            },
            keyTakeaways: [
              'Separating trimmings at source recovers up to 85% of usable edible matter.',
              'Adhering to exact mass-balance ratios guarantees dish consistency.',
              'Standardize station prep sheets to track weekly variance.'
            ],
            video: {
              title: `Masterclass: ${les.title}`,
              durationSeconds: 42,
              posterImage: activeCourse.coverImage,
              instructor: activeCourse.instructor,
              instructorRole: activeCourse.instructorCredentials,
              videoType: 'masterclass',
              checkpoints: [
                {
                  id: `ck-${les.id}-1`,
                  timestampSeconds: 20,
                  question: `In ${les.title}, what is the critical standard for maximum recovery?`,
                  options: [
                    'Strict tare-weight station separation and exact temperature control',
                    'Discarding all vegetable peels and animal trimmings uninspected',
                    'Boiling vigorously for 6 hours until water evaporates',
                    'Mixing all prep streams into a single unweighed bin'
                  ],
                  correctIndex: 0,
                  explanation: 'Accredited zero-waste culinary science relies on strict station separation and temperature control.',
                  points: 25
                }
              ],
              transcript: [
                {
                  timestamp: '00:00',
                  seconds: 0,
                  speaker: activeCourse.instructor,
                  text: `Welcome to this module on ${les.title}. Today we examine precision yield optimization and station mechanics.`
                },
                {
                  timestamp: '00:10',
                  seconds: 10,
                  speaker: activeCourse.instructor,
                  text: les.description || 'In commercial kitchens, over 30% of prep trim is unnecessarily discarded.'
                },
                {
                  timestamp: '00:20',
                  seconds: 20,
                  speaker: activeCourse.instructor,
                  text: `Our culinary formula here is: ${les.culinaryFormula || 'Mass Balance: W_raw = W_yield + W_trim'}.`
                },
                {
                  timestamp: '00:30',
                  seconds: 30,
                  speaker: activeCourse.instructor,
                  text: 'By standardizing knife technique and tare-weighted separation, your kitchen captures immediate food cost gains.'
                }
              ]
            }
          }
        ],
        assessment: {
          id: `assess-${les.id}`,
          title: `Assessment: ${les.title}`,
          passingGrade: 80,
          questions: [
            {
              id: `q-${les.id}-1`,
              question: `What is the key scientific mechanism utilized in ${les.title}?`,
              options: [
                les.scientificConcept || 'Enzymatic deactivation and precise osmotic or salt control',
                'Accelerated thermal scorching at 250°C',
                'Uncontrolled wild bacterial spoilage without salt',
                'Single-use discard without weighing'
              ],
              correctIndex: 0,
              explanation: `${les.scientificConcept || 'Accredited culinary science relies on exact biochemical control.'}`
            },
            {
              id: `q-${les.id}-2`,
              question: `What is the designated culinary formula or benchmark ratio for this module?`,
              options: [
                les.culinaryFormula || 'Mass balance: 85% diversion target',
                'Zero salt and zero temperature monitoring',
                '100% waste to municipal landfill',
                'Arbitrary seasoning without tare scales'
              ],
              correctIndex: 0,
              explanation: `The standardized ratio is: ${les.culinaryFormula || 'Standard mass balance'}.`
            }
          ]
        }
      }));

  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number>(Math.max(0, initialModuleNumber - 1));
  const [activeTab, setActiveTab] = useState<'curriculum' | 'overview' | 'quiz' | 'newsletters' | 'feed'>('curriculum');
  const [completedModules, setCompletedModules] = useState<Set<number>>(new Set([1]));

  // Active module & lesson
  const currentModule: CourseModule = allModules[selectedModuleIndex] || allModules[0];
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number>(0);
  const currentLesson: Lesson = currentModule.lessons[selectedLessonIndex] || currentModule.lessons[0];


  // Discussion state
  const [discussionPosts, setDiscussionPosts] = useState([
    {
      id: 'p1',
      author: 'Author, Chef Dave K. (London)',
      role: 'Head Chef · The Greenhouse',
      date: 'Yesterday',
      text: 'We implemented the Cauliflower Leaf Chutney alongside our dry-aged beef last weekend and completely eliminated 15kg of cauliflower green trim from our vegetable station. Guests loved the story and we saved £65 on sides!'
    },
    {
      id: 'p2',
      author: 'Chef Elena Vance',
      role: 'Culinary Sustainability Director',
      date: '2 days ago',
      text: 'Remember when making the 2% brine for vegetable stalks: always tare your scale with the jar and water included. 2.0% across total biomass is the non-negotiable safety threshold for wild Lactobacillus cultivation.'
    }
  ]);
  const [newPostText, setNewPostText] = useState<string>('');

  // Audio / Speech narration items
  const transcriptItems = useMemo(() => {
    return currentLesson.video?.transcript?.length 
      ? currentLesson.video.transcript 
      : DEFAULT_MODULE_NARRATIONS[currentModule.moduleNumber] || DEFAULT_MODULE_NARRATIONS[1];
  }, [currentLesson, currentModule.moduleNumber]);

  // Video Player synchronized simulation states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(0);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(-1);
  const [sentenceProgress, setSentenceProgress] = useState<number>(0);
  const [sentenceElapsed, setSentenceElapsed] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [showTranscriptDrawer, setShowTranscriptDrawer] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAudioTesting, setIsAudioTesting] = useState<boolean>(false);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<TTSVoiceName>(audioNarrator.getVoice());

  const [activeCheckpoint, setActiveCheckpoint] = useState<VideoQuizCheckpoint | null>(null);
  const [checkpointAnswered, setCheckpointAnswered] = useState<boolean>(false);
  const [checkpointSelectedOpt, setCheckpointSelectedOpt] = useState<number | null>(null);
  const [checkpointPointsEarned, setCheckpointPointsEarned] = useState<number>(0);

  // Module Assessment Quiz state
  const [quizQuestionIndex, setQuizQuestionIndex] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, { selected: number; isSubmitted: boolean; isCorrect: boolean }>>({});
  const [quizScore, setQuizScore] = useState<number>(0);

  // Checkpoints for active lesson
  const checkpoints: VideoQuizCheckpoint[] = currentLesson.video?.checkpoints || [
    {
      id: `ck-${currentModule.moduleNumber}-1`,
      timestampSeconds: 20,
      question: `Critical Kitchen Science: In Module ${currentModule.moduleNumber}, what is the foundational mechanism for byproduct stabilization?`,
      options: [
        'Enzymatic deactivation and precise osmotic or salt control',
        'Boiling uncovered on maximum heat until dry',
        'Storing in open uncovered bins under ambient humidity',
        'Discarding after single use'
      ],
      correctIndex: 0,
      explanation: 'Accredited zero-waste culinary science relies on precise enzymatic denaturation and water activity/osmotic balancing.',
      points: 25
    }
  ];

  // Dynamic sentence durations & start times calculated from actual word count & speech speed
  const sentenceDurations = useMemo(() => {
    return transcriptItems.map((item) => audioNarrator.estimateDuration(item.text, playbackSpeed));
  }, [transcriptItems, playbackSpeed]);

  const sentenceStartTimes = useMemo(() => {
    const starts: number[] = [0];
    for (let i = 0; i < sentenceDurations.length - 1; i++) {
      starts.push(starts[i] + sentenceDurations[i]);
    }
    return starts;
  }, [sentenceDurations]);

  const totalDurationSeconds = useMemo(() => {
    return sentenceDurations.reduce((acc, d) => acc + d, 0);
  }, [sentenceDurations]);

  const currentTime = Math.min(
    totalDurationSeconds,
    (sentenceStartTimes[activeSentenceIndex] || 0) + sentenceElapsed
  );

  const currentSubtitle = transcriptItems[activeSentenceIndex] || transcriptItems[0];

  // Ref tracking current sentence to ensure zero desync
  const activeSentenceRef = useRef<number>(activeSentenceIndex);
  activeSentenceRef.current = activeSentenceIndex;
  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;

  // Prefetch human voice audio for the active module's lecture lines in the background
  useEffect(() => {
    if (transcriptItems.length > 0) {
      audioNarrator.prefetch(transcriptItems.map((n) => n.text));
    }
  }, [transcriptItems, selectedVoice]);

  // Synchronized playback of a specific sentence
  const playSentence = useCallback((index: number) => {
    if (index >= transcriptItems.length) {
      setIsPlaying(false);
      audioNarrator.stop();
      audioNarrator.playSound('correct');
      setCompletedModules((old) => new Set([...old, currentModule.moduleNumber]));
      return;
    }

    setActiveSentenceIndex(index);
    setActiveWordIndex(-1);
    setSentenceProgress(0);
    setSentenceElapsed(0);

    const sentence = transcriptItems[index];
    if (!sentence) return;

    if (isMuted) {
      // If muted, muted timer handles progress
      return;
    }

    setIsAudioLoading(true);
    audioNarrator.speak({
      text: sentence.text,
      rate: playbackSpeed,
      volume: volume,
      onStart: () => {
        setIsAudioLoading(false);
      },
      onProgress: (p) => {
        setActiveWordIndex(p.wordIndex);
        setSentenceProgress(p.progressFraction);
        setSentenceElapsed(p.currentTime);
      },
      onEnd: () => {
        setIsAudioLoading(false);
        setActiveWordIndex(-1);
        setSentenceProgress(1);

        // Check if an unanswered checkpoint should trigger between sentences
        const currentElapsedTotal = (sentenceStartTimes[index] || 0) + (sentenceDurations[index] || 0);
        const trigger = checkpoints.find((ck) => Math.abs(ck.timestampSeconds - currentElapsedTotal) < 7 && !checkpointAnswered);

        if (trigger && trigger.id !== activeCheckpoint?.id) {
          setIsPlaying(false);
          audioNarrator.playSound('checkpoint');
          setActiveCheckpoint(trigger);
          setCheckpointSelectedOpt(null);
          return;
        }

        // Seamlessly advance to next sentence without skipping any text or voice
        if (isPlayingRef.current) {
          playSentence(index + 1);
        }
      },
      onError: () => {
        setIsAudioLoading(false);
        if (isPlayingRef.current && index + 1 < transcriptItems.length) {
          playSentence(index + 1);
        }
      }
    });
  }, [transcriptItems, isMuted, playbackSpeed, volume, sentenceStartTimes, sentenceDurations, checkpoints, checkpointAnswered, activeCheckpoint, currentModule.moduleNumber]);

  // Toggle Video Playback with natural voice narration
  const handleTogglePlay = () => {
    audioNarrator.getAudioContext();

    if (!isPlaying) {
      setIsPlaying(true);
      playSentence(activeSentenceIndex);
    } else {
      setIsPlaying(false);
      audioNarrator.stop();
    }
  };

  // Muted fallback timer for progression when user mutes audio
  useEffect(() => {
    if (!isPlaying || !isMuted) return;
    const interval = setInterval(() => {
      setSentenceElapsed((prev) => {
        const next = prev + 0.1;
        const dur = sentenceDurations[activeSentenceIndex] || 6;
        const fraction = Math.min(1, next / dur);
        setSentenceProgress(fraction);

        const words = (transcriptItems[activeSentenceIndex]?.text || '').split(/\s+/).filter(Boolean);
        const wIdx = Math.min(words.length - 1, Math.floor(fraction * words.length));
        setActiveWordIndex(wIdx);

        if (next >= dur) {
          if (activeSentenceIndex + 1 < transcriptItems.length) {
            playSentence(activeSentenceIndex + 1);
          } else {
            setIsPlaying(false);
            audioNarrator.playSound('correct');
            setCompletedModules((old) => new Set([...old, currentModule.moduleNumber]));
          }
          return 0;
        }
        return next;
      });
    }, 100 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, isMuted, activeSentenceIndex, sentenceDurations, transcriptItems, playbackSpeed, playSentence, currentModule.moduleNumber]);

  // Reset video state when module or lesson changes
  useEffect(() => {
    setIsPlaying(false);
    audioNarrator.stop();
    setActiveSentenceIndex(0);
    setActiveWordIndex(-1);
    setSentenceProgress(0);
    setSentenceElapsed(0);
    setActiveCheckpoint(null);
    setCheckpointAnswered(false);
    setQuizQuestionIndex(0);
    setQuizAnswers({});
  }, [selectedModuleIndex, selectedLessonIndex]);

  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  // Toggle Module Completion
  const toggleModuleComplete = (modNum: number) => {
    audioNarrator.playSound('click');
    setCompletedModules((prev) => {
      const next = new Set(prev);
      if (next.has(modNum)) {
        next.delete(modNum);
      } else {
        next.add(modNum);
        audioNarrator.playSound('correct');
      }
      return next;
    });
  };

  const isCurrentModuleCompleted = completedModules.has(currentModule.moduleNumber);

  // Handle Seeker Click
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    audioNarrator.playSound('click');
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = percentage * totalDurationSeconds;

    // Find sentence matching targetTime
    let targetSentenceIdx = 0;
    for (let i = sentenceStartTimes.length - 1; i >= 0; i--) {
      if (targetTime >= sentenceStartTimes[i]) {
        targetSentenceIdx = i;
        break;
      }
    }

    setActiveSentenceIndex(targetSentenceIdx);
    setActiveWordIndex(-1);
    setSentenceElapsed(0);
    setSentenceProgress(0);

    if (isPlaying) {
      playSentence(targetSentenceIdx);
    }
  };

  // Rewind
  const handleRewind = () => {
    audioNarrator.playSound('click');
    if (sentenceElapsed > 2) {
      playSentence(activeSentenceIndex);
    } else {
      const prevIdx = Math.max(0, activeSentenceIndex - 1);
      playSentence(prevIdx);
    }
  };

  // Fast forward
  const handleFastForward = () => {
    audioNarrator.playSound('click');
    const nextIdx = Math.min(transcriptItems.length - 1, activeSentenceIndex + 1);
    playSentence(nextIdx);
  };

  // Test sound function
  const handleTestAudio = () => {
    audioNarrator.getAudioContext();
    setIsAudioTesting(true);
    audioNarrator.speak({
      text: "Hello and welcome. Dr. Chef Supritam Basu speaking. Today we are exploring practical, zero-waste culinary science for commercial kitchens.",
      rate: 1.0,
      volume: isMuted ? 0.9 : volume,
      onEnd: () => setIsAudioTesting(false),
      onError: () => setIsAudioTesting(false),
    });
    if (isMuted) setIsMuted(false);
    setTimeout(() => setIsAudioTesting(false), 8000);
  };

  // Checkpoint Quiz submission
  const handleSubmitCheckpoint = () => {
    if (checkpointSelectedOpt === null || !activeCheckpoint) return;
    setCheckpointAnswered(true);
    const isCorrect = checkpointSelectedOpt === activeCheckpoint.correctIndex;
    audioNarrator.playSound(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setCheckpointPointsEarned((p) => p + activeCheckpoint.points);
    }
  };

  const handleResumeAfterCheckpoint = () => {
    setActiveCheckpoint(null);
    setCheckpointAnswered(false);
    setCheckpointSelectedOpt(null);
    setIsPlaying(true);
    playSentence(activeSentenceIndex + 1);
  };

  // Module Quiz Logic
  const assessmentQuestions = currentModule.assessment?.questions || [
    {
      id: `q-fallback-1`,
      question: `What is the primary culinary objective of Module ${currentModule.moduleNumber} (${currentModule.title})?`,
      options: [
        'To capture high-value edible biomass and eliminate avoidable landfill discard',
        'To increase prep garbage haul weights',
        'To eliminate flavor from secondary ingredients',
        'To bypass kitchen HACCP safety requirements'
      ],
      correctIndex: 0,
      explanation: 'Zero-waste culinary science extracts maximum nutritional, gastronomic and financial yield from all harvested biomass.'
    }
  ];

  const currentQuizItem = assessmentQuestions[quizQuestionIndex] || assessmentQuestions[0];
  const currentQuizAnswer = quizAnswers[quizQuestionIndex];

  const handleSelectQuizOption = (optIdx: number) => {
    if (currentQuizAnswer?.isSubmitted) return;
    setQuizAnswers((prev) => ({
      ...prev,
      [quizQuestionIndex]: {
        selected: optIdx,
        isSubmitted: false,
        isCorrect: optIdx === currentQuizItem.correctIndex
      }
    }));
  };

  const handleSubmitQuizAnswer = () => {
    if (!currentQuizAnswer || currentQuizAnswer.selected === undefined) return;
    const isCorrect = currentQuizAnswer.selected === currentQuizItem.correctIndex;
    audioNarrator.playSound(isCorrect ? 'correct' : 'wrong');
    setQuizAnswers((prev) => ({
      ...prev,
      [quizQuestionIndex]: {
        ...prev[quizQuestionIndex],
        isSubmitted: true,
        isCorrect
      }
    }));
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    audioNarrator.playSound('click');
    if (quizQuestionIndex < assessmentQuestions.length - 1) {
      setQuizQuestionIndex((prev) => prev + 1);
    } else {
      // Completed all questions in module
      audioNarrator.playSound('correct');
      setCompletedModules((old) => new Set([...old, currentModule.moduleNumber]));
    }
  };

  // Download real customized PDF SOP
  const handleDownloadPdf = (filename: string, title: string) => {
    const sopsText = `================================================================================
SUPRITAMONE ACADEMY · DR. CHEF SUPRITAM BASU, PhD, CEC
Dean of Sustainable Gastronomy & Author, Chef Culinary Science
International CPD Certified Diploma Curriculum (Level 7)
Synthesized from 252 Issues of "The Zero Waste Kitchen"
================================================================================

DOCUMENT: ${title.toUpperCase()}
FILE: ${filename}
MODULE ${currentModule.moduleNumber}: ${currentModule.title.toUpperCase()}
NEWSLETTER ISSUES: ${currentModule.newsletterRange}
INSTRUCTOR: Dr. Chef Supritam Basu, PhD, CEC

--------------------------------------------------------------------------------
1. AUTHOR, CHEF CULINARY OVERVIEW & MASS-BALANCE RATIONALE
--------------------------------------------------------------------------------
Commercial kitchen waste represents lost operational capital, wasted water, and
unharvested gastronomic flavor. In commercial brigades, 35% to 50% of raw produce
and carcass weight is needlessly discarded as trim.

Standard Target: Divert >= 85% of clean station trimmings into secondary pantry
lines, glazes, broths, ferments, and shelf-stable umami finishing powders.

--------------------------------------------------------------------------------
2. TECHNICAL SPECIFICATIONS & PHYSICAL/CHEMICAL MECHANISMS
--------------------------------------------------------------------------------
- Moisture Control & Water Activity (Aw): Dehydration target Aw < 0.60.
- Enzyme Kinetics: Pectin Methyl Esterase (PME) low-temp activation at 55°C–65°C.
- Acidification Standard: Rapid microbial fermentation to pH < 4.2 within 72 hours.
- Osmotic Extraction: 1:1 Sucrose to Flavedo for cold Oleo Saccharum.
- Collagen Denaturation: Thermal conversion of triple-helix collagen at 60°C–88°C.

--------------------------------------------------------------------------------
3. STEP-BY-STEP BRIGADE OPERATIONAL PROCEDURE (SOP)
--------------------------------------------------------------------------------
Step 1: Sanitize station and place tare-weighted Cambros for organic discards.
Step 2: Inspect raw trimmings for field soil or contamination; wash thoroughly.
Step 3: Measure raw input weight (W_raw) and record in kitchen yield log.
Step 4: Execute technical extraction: blanching, fermentation, roasting or emulsion.
Step 5: Package in sterilized airtight containers with date, batch, and pH log.
Step 6: Hold at designated Critical Control Point (CCP) temperatures.

--------------------------------------------------------------------------------
4. CRITICAL CONTROL POINTS (HACCP COMPLIANCE)
--------------------------------------------------------------------------------
- CCP 1 (Temperature): Hot holding >= 63°C; Cold storage <= 3°C.
- CCP 2 (Acid Barrier): Fermented brines must maintain pH <= 4.2.
- CCP 3 (Sanitation): All fermentation weights and vessels sanitized with Star San.

Supritamone Academy © ${new Date().getFullYear()} · Dr. Chef Supritam Basu, PhD, CEC
Accredited by CPD Standards Authority · London, UK · All Rights Reserved
================================================================================`;

    const blob = new Blob([sopsText], { type: 'application/pdf;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filter 252 newsletters corresponding to active module
  const moduleNewsletters = all252Newsletters.filter((n) => n.moduleMapped === currentModule.moduleNumber);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Header Bar (matches image_57f3f687.png exactly) */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          onClick={onBackToCourses}
          className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
          <span>Course details</span>
        </button>

        <div className="flex items-center gap-2.5">
          {/* Course Selector Dropdown */}
          <select
            value={activeCourseId}
            onChange={(e) => {
              setActiveCourseId(e.target.value);
              setSelectedModuleIndex(0);
              setSelectedLessonIndex(0);
            }}
            className="hidden md:inline-block text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-1.5 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-xs truncate"
          >
            {surplusCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          {/* Module Selector Pill */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold text-slate-800">Module {currentModule.moduleNumber} of {allModules.length}</span>
          </div>

          {/* Mark as complete toggle button (matching screenshot) */}
          <button
            onClick={() => toggleModuleComplete(currentModule.moduleNumber)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              isCurrentModuleCompleted
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Check className={`w-3.5 h-3.5 ${isCurrentModuleCompleted ? 'text-emerald-600 stroke-3' : 'text-slate-400'}`} />
            <span>{isCurrentModuleCompleted ? 'Completed' : 'Mark as complete'}</span>
          </button>

          {/* Prev / Next Module Navigation (< 1/12 >) */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => {
                setSelectedModuleIndex(Math.max(0, selectedModuleIndex - 1));
                setSelectedLessonIndex(0);
              }}
              disabled={selectedModuleIndex === 0}
              className="p-1.5 hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:pointer-events-none"
              title="Previous module"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono font-bold px-2.5 text-slate-600">
              {selectedModuleIndex + 1}/{allModules.length}
            </span>
            <button
              onClick={() => {
                setSelectedModuleIndex(Math.min(allModules.length - 1, selectedModuleIndex + 1));
                setSelectedLessonIndex(0);
              }}
              disabled={selectedModuleIndex === allModules.length - 1}
              className="p-1.5 hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:pointer-events-none"
              title="Next module"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Share Button */}
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            title="Share Course"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Video Lecture Player */}
      <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative select-none">
        <div className="relative aspect-video w-full flex items-center justify-center bg-slate-900 group overflow-hidden">
          {/* Dynamic Background Image with subtle cinematic zoom */}
          <img
            src={currentLesson.heroImage || currentLesson.video?.posterImage || '/src/assets/images/hero_sustainable_kitchen_1793976158274.jpg'}
            alt={currentLesson.title}
            className={`w-full h-full object-cover opacity-85 transition-transform duration-1000 ${isPlaying ? 'scale-105' : 'scale-100'}`}
          />

          {/* Dark gradient scrims */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-slate-950/60" />

          {/* Top Left: Video Tag & CPD Level */}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              HD Masterclass Lecture
            </span>
            <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-1 rounded-md border border-white/10">
              Module {currentModule.moduleNumber}: {currentModule.newsletterRange}
            </span>
          </div>

          {/* Top Right: Picture-in-picture Chef Instructor overlay (Exact Dr. Chef Supritam Basu badge from screenshot) */}
          <div className="absolute top-4 right-4 w-36 sm:w-44 aspect-video bg-black/90 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden shadow-2xl flex items-center justify-center p-2 z-20">
            <div className="text-center w-full">
              <div className="relative w-8 h-8 mx-auto mb-1">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                  SB
                </div>
                {isPlaying && !isMuted && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-black rounded-full animate-ping" />
                )}
              </div>
              <p className="text-[11px] text-white font-bold tracking-tight leading-tight">Dr. Chef Supritam Basu</p>
              <span className="text-[9px] text-emerald-400 uppercase font-bold tracking-wider block mt-0.5">
                PhD · Author, Chef
              </span>
              <span className="inline-block text-[8px] text-sky-300 font-mono bg-sky-950/70 border border-sky-500/30 px-1 py-0.2 rounded mt-0.5">
                🎙️ Natural Human Voice
              </span>
              {/* Audio status indicator */}
              {isPlaying && !isMuted ? (
                <div className="flex items-center justify-center gap-0.5 mt-1">
                  <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1.5 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                  <span className="text-[8px] text-emerald-300 font-mono font-bold uppercase ml-1">Speaking</span>
                </div>
              ) : isMuted ? (
                <button
                  onClick={() => {
                    setIsMuted(false);
                    audioNarrator.playSound('play');
                  }}
                  className="mt-1 text-[8px] text-amber-300 bg-amber-950/70 hover:bg-amber-900 border border-amber-500/40 px-1.5 py-0.5 rounded transition-all inline-block"
                >
                  Unmute Voice
                </button>
              ) : null}
            </div>
          </div>

          {/* Interactive Checkpoint Quiz Overlay (when timestamp is hit) */}
          {activeCheckpoint && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 p-6 flex flex-col justify-center max-w-lg mx-auto text-white animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  In-Video Knowledge Checkpoint (+{activeCheckpoint.points} pts)
                </span>
                <span className="text-xs font-mono text-slate-400">Timestamp: {formatTime(activeCheckpoint.timestampSeconds)}</span>
              </div>

              <h4 className="text-sm sm:text-base font-bold text-white mb-4 leading-snug">
                {activeCheckpoint.question}
              </h4>

              <div className="space-y-2 mb-4">
                {activeCheckpoint.options.map((opt, optIdx) => {
                  const isSelected = checkpointSelectedOpt === optIdx;
                  let optStyle = 'border-white/20 bg-white/5 hover:bg-white/10 text-slate-200';
                  if (checkpointAnswered) {
                    if (optIdx === activeCheckpoint.correctIndex) {
                      optStyle = 'border-emerald-500 bg-emerald-950/60 text-emerald-200 font-semibold';
                    } else if (isSelected) {
                      optStyle = 'border-red-500 bg-red-950/60 text-red-200';
                    }
                  } else if (isSelected) {
                    optStyle = 'border-blue-500 bg-blue-900/40 text-blue-100 font-medium';
                  }

                  return (
                    <div
                      key={optIdx}
                      onClick={() => !checkpointAnswered && setCheckpointSelectedOpt(optIdx)}
                      className={`p-3 rounded-lg border text-xs sm:text-sm cursor-pointer transition-all flex items-center gap-2.5 ${optStyle}`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-blue-400 bg-blue-500 text-white' : 'border-white/30'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="flex-1">{opt}</span>
                    </div>
                  );
                })}
              </div>

              {checkpointAnswered && (
                <div className="p-3 rounded-lg bg-emerald-900/40 border border-emerald-500/40 text-xs text-emerald-200 mb-4">
                  <p className="font-bold mb-0.5">Scientific Rationale:</p>
                  <p>{activeCheckpoint.explanation}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                {!checkpointAnswered ? (
                  <button
                    onClick={handleSubmitCheckpoint}
                    disabled={checkpointSelectedOpt === null}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-lg shadow-md transition-all"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleResumeAfterCheckpoint}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md transition-all flex items-center gap-1.5"
                  >
                    <span>Resume Lecture</span>
                    <Play className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Center Play / Pause Floating Overlay Button */}
          {!activeCheckpoint && (
            <button
              onClick={handleTogglePlay}
              className="w-16 h-16 rounded-full bg-white/95 hover:bg-white text-slate-950 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-10 group-hover:opacity-100 opacity-90 cursor-pointer"
              aria-label={isPlaying ? 'Pause Lecture' : 'Play Lecture'}
            >
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </button>
          )}

          {/* Dynamic Subtitle / Teleprompter Banner with Real-Time Word Karaoke Sync */}
          {showSubtitles && currentSubtitle && (
            <div className="absolute bottom-16 left-4 right-4 text-center z-20 pointer-events-none">
              <div className="inline-block bg-black/90 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-xl backdrop-blur-md border border-white/10 shadow-2xl max-w-2xl leading-relaxed text-left sm:text-center">
                {tokenizeTextIntoWords(currentSubtitle.text).map((tok) => {
                  const isSpoken = activeWordIndex >= tok.index;
                  const isCurrent = activeWordIndex === tok.index;

                  return (
                    <span
                      key={tok.index}
                      className={`transition-all duration-75 ${
                        isCurrent
                          ? 'text-amber-300 font-extrabold bg-amber-400/20 px-1 py-0.5 rounded shadow-xs scale-105 inline-block'
                          : isSpoken
                          ? 'text-white font-medium'
                          : 'text-slate-400/80'
                      }`}
                    >
                      {tok.word}{' '}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Video Controls Bar */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/85 to-transparent p-3 pt-6 z-20 flex flex-col gap-2.5">
            {/* Scrubber Progress Bar */}
            <div
              onClick={handleSeek}
              className="w-full bg-white/20 hover:bg-white/30 h-1.5 hover:h-2 rounded-full overflow-hidden cursor-pointer transition-all relative"
            >
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-150"
                style={{ width: `${(currentTime / Math.max(1, totalDurationSeconds)) * 100}%` }}
              />
              {/* Checkpoint Markers on Progress Bar */}
              {checkpoints.map((ck) => (
                <div
                  key={ck.id}
                  className="absolute top-0 bottom-0 w-1 bg-amber-400 rounded-full"
                  style={{ left: `${(ck.timestampSeconds / Math.max(1, totalDurationSeconds)) * 100}%` }}
                  title={`Checkpoint at ${formatTime(ck.timestampSeconds)}`}
                />
              ))}
            </div>

            {/* Bottom Controls Row */}
            <div className="flex flex-wrap items-center justify-between text-white text-xs gap-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTogglePlay}
                  className="hover:text-blue-400 p-1 transition-colors cursor-pointer"
                  title={isPlaying ? 'Pause' : 'Play & Speak'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 text-blue-400" /> : <Play className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleRewind}
                  className="hover:text-blue-400 p-1 text-[11px] font-mono flex items-center gap-0.5 cursor-pointer"
                  title="Rewind to start of sentence or previous sentence"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Rewind</span>
                </button>

                <button
                  onClick={handleFastForward}
                  className="hover:text-blue-400 p-1 text-[11px] font-mono flex items-center gap-0.5 cursor-pointer"
                  title="Fast forward to next sentence"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>Next</span>
                </button>

                <span className="font-mono text-[11px] text-slate-300 ml-1">
                  {formatTime(currentTime)} / {formatTime(totalDurationSeconds)}
                </span>
                
                {isAudioLoading && (
                  <span className="text-[10px] text-amber-300 font-mono flex items-center gap-1 animate-pulse ml-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Buffering...
                  </span>
                )}
              </div>

              {/* Center / Right: Audio Narration & Sound Controls */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Test Audio & Speech Output Button */}
                <button
                  onClick={handleTestAudio}
                  disabled={isAudioTesting}
                  className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isAudioTesting
                      ? 'bg-amber-500 text-black animate-pulse'
                      : 'bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-xs'
                  }`}
                  title="Test voice narration and audio output"
                >
                  <Mic className="w-3 h-3" />
                  <span>{isAudioTesting ? 'Voice Playing...' : 'Test Voice'}</span>
                </button>

                {/* Human Voice Model Selector */}
                <div className="flex items-center gap-1 bg-white/10 rounded px-1.5 py-0.5 border border-white/15">
                  <span className="text-[10px] text-slate-300 hidden md:inline">Voice:</span>
                  <select
                    value={selectedVoice}
                    onChange={(e) => {
                      const v = e.target.value as TTSVoiceName;
                      setSelectedVoice(v);
                      audioNarrator.setVoice(v);
                      audioNarrator.stop();
                      audioNarrator.playSound('click');
                      if (isPlaying) {
                        playSentence(activeSentenceIndex);
                      }
                    }}
                    className="bg-transparent text-white text-[10px] font-semibold focus:outline-none cursor-pointer"
                    title="Select natural human voice model for Dr. Chef Supritam Basu"
                  >
                    {AVAILABLE_VOICES.map((v) => (
                      <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subtitles Toggle */}
                <button
                  onClick={() => {
                    audioNarrator.playSound('click');
                    setShowSubtitles(!showSubtitles);
                  }}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    showSubtitles ? 'bg-blue-600 border-blue-500 text-white' : 'border-white/30 text-slate-400'
                  }`}
                  title="Toggle Subtitles"
                >
                  CC
                </button>

                {/* Synced Transcript Drawer Toggle */}
                <button
                  onClick={() => {
                    audioNarrator.playSound('click');
                    setShowTranscriptDrawer((prev) => !prev);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                    showTranscriptDrawer
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'border-white/30 text-slate-300 hover:text-white'
                  }`}
                  title="Toggle synced interactive transcript"
                >
                  <FileText className="w-3 h-3" />
                  <span>Transcript</span>
                </button>

                {/* Speed Selector */}
                <div className="flex items-center bg-white/10 rounded px-1.5 py-0.5 text-[10px] font-mono">
                  {[1, 1.25, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => {
                        audioNarrator.playSound('click');
                        setPlaybackSpeed(spd);
                        if (isPlaying) {
                          playSentence(activeSentenceIndex);
                        }
                      }}
                      className={`px-1 rounded cursor-pointer ${playbackSpeed === spd ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                {/* Volume & Mute Controls */}
                <div className="flex items-center gap-1.5 bg-white/10 rounded px-2 py-0.5">
                  <button
                    onClick={() => {
                      const nextMuted = !isMuted;
                      setIsMuted(nextMuted);
                      if (nextMuted) {
                        audioNarrator.stop();
                      } else {
                        audioNarrator.playSound('play');
                        if (isPlaying) {
                          playSentence(activeSentenceIndex);
                        }
                      }
                    }}
                    className="text-slate-300 hover:text-white p-0.5 cursor-pointer"
                    title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setVolume(val);
                      if (val > 0 && isMuted) {
                        setIsMuted(false);
                      }
                    }}
                    className="w-12 sm:w-16 h-1 accent-emerald-400 bg-white/30 rounded cursor-pointer"
                    title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                  />
                  <span className="text-[9px] font-mono text-slate-300 w-6 text-right">
                    {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Synced Interactive Transcript Drawer */}
      {showTranscriptDrawer && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white space-y-2 max-h-56 overflow-y-auto mb-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5 text-blue-400">
              <FileText className="w-3.5 h-3.5" />
              Synced Masterclass Transcript · Dr. Chef Supritam Basu
            </span>
            <span className="text-[10px] text-slate-400 font-normal lowercase">Click any sentence to listen & sync</span>
          </div>
          <div className="space-y-1.5">
            {transcriptItems.map((item, idx) => {
              const isCurrent = activeSentenceIndex === idx;
              const startTimeStr = formatTime(sentenceStartTimes[idx] || 0);

              return (
                <div
                  key={idx}
                  onClick={() => {
                    audioNarrator.playSound('click');
                    playSentence(idx);
                    if (!isPlaying) setIsPlaying(true);
                  }}
                  className={`p-2.5 rounded-lg cursor-pointer flex items-start gap-3 transition-all ${
                    isCurrent
                      ? 'bg-blue-950/90 border border-blue-500 text-white shadow-xs'
                      : 'hover:bg-slate-800/60 text-slate-400'
                  }`}
                >
                  <span className="font-mono text-[10px] text-blue-400 font-semibold mt-0.5 shrink-0">
                    {startTimeStr}
                  </span>
                  <div className="flex-1 text-xs leading-relaxed">
                    <span className="text-[10px] font-bold text-slate-400 mr-2 uppercase tracking-wide">
                      {item.speaker || 'Dr. Chef Supritam Basu'}:
                    </span>
                    <span className={isCurrent ? 'text-white font-medium' : ''}>
                      {item.text}
                    </span>
                  </div>
                  {isCurrent && isPlaying && !isMuted && (
                    <span className="text-[10px] text-emerald-400 font-mono font-bold shrink-0 flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full animate-pulse">
                      🎙️ Speaking
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Course Sub-Navigation Tabs: Curriculum | Overview & SOP | Interactive Quiz | 252 Newsletters | Discussion */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="flex items-center border-b border-slate-200 px-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'curriculum'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curriculum ({allModules.length} Modules)</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Overview & SOP</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Interactive Quiz ({assessmentQuestions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('newsletters')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'newsletters'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>252 Newsletter Deep-Dive ({moduleNewsletters.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'feed'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Discussion Feed</span>
          </button>
        </div>

        {/* TAB 1: CURRICULUM (All Modules covering course curriculum) */}
        {activeTab === 'curriculum' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {activeCourse.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {allModules.length} Modules · {activeCourse.duration} · {activeCourse.badge}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-700 bg-blue-100/70 px-2.5 py-1 rounded-md">
                  {completedModules.size} of {allModules.length} Completed
                </span>
                <button
                  onClick={onOpenCertify}
                  className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors flex items-center gap-1"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Diploma</span>
                </button>
              </div>
            </div>

            {/* List of 12 Modules */}
            <div className="space-y-3">
              {allModules.map((mod, idx) => {
                const isSelectedMod = selectedModuleIndex === idx;
                const isModDone = completedModules.has(mod.moduleNumber);

                return (
                  <div
                    key={mod.id}
                    className={`rounded-xl border transition-all overflow-hidden ${
                      isSelectedMod
                        ? 'border-blue-500 ring-2 ring-blue-500/10 bg-white shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      onClick={() => {
                        setSelectedModuleIndex(idx);
                        setSelectedLessonIndex(0);
                      }}
                      className={`p-4 flex items-center justify-between cursor-pointer ${
                        isSelectedMod ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleModuleComplete(mod.moduleNumber);
                          }}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                            isModDone
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                              : 'border-slate-300 hover:border-slate-400 bg-white'
                          }`}
                          title={isModDone ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          {isModDone && <Check className="w-4 h-4 stroke-3" />}
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-blue-600">
                              Module {mod.moduleNumber < 10 ? `0${mod.moduleNumber}` : mod.moduleNumber}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {mod.newsletterRange}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                            {mod.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <span className="text-xs font-mono text-slate-500 hidden sm:inline">
                          {mod.estimatedHours} hrs · {mod.lessons.length} Lessons
                        </span>
                        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isSelectedMod ? 'rotate-90 text-blue-600' : ''}`} />
                      </div>
                    </div>

                    {/* Sub-lessons when module is active */}
                    {isSelectedMod && (
                      <div className="border-t border-slate-100 divide-y divide-slate-100 bg-slate-50/40 p-2">
                        {mod.lessons.map((lesson, lIdx) => {
                          const isSelectedLesson = selectedLessonIndex === lIdx;
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => setSelectedLessonIndex(lIdx)}
                              className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors text-xs ${
                                isSelectedLesson
                                  ? 'bg-white font-bold text-blue-900 shadow-2xs border border-blue-200'
                                  : 'text-slate-700 hover:bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                                  {lIdx + 1}
                                </span>
                                <span>{lesson.title}</span>
                              </div>
                              <span className="font-mono text-[11px] text-slate-400">
                                {lesson.readTimeMinutes} min read
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: OVERVIEW & SOP (Real Lesson Content, Biochemistry & Downloadable PDF Cards) */}
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            {/* Header info */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-1 rounded">
                  {currentModule.newsletterRange} · Lesson {selectedLessonIndex + 1} of {currentModule.lessons.length}
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  Lead Instructor: <strong className="text-slate-900">Dr. Chef Supritam Basu, PhD, CEC</strong>
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {currentLesson.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Synthesized from Dr. Chef Supritam Basu’s 252 Zero Waste Kitchen publication series.
                </p>
              </div>

              {/* Scrap Metrics */}
              {currentLesson.scrapWasteMetrics && (
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Waste Diverted</span>
                    <span className="text-base font-extrabold text-emerald-600">{currentLesson.scrapWasteMetrics.wasteDivertedPercentage}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Est. Kitchen Savings</span>
                    <span className="text-base font-extrabold text-blue-600">{currentLesson.scrapWasteMetrics.householdAnnualSavingsUSD}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">CO2 Diverted</span>
                    <span className="text-base font-extrabold text-indigo-600">{currentLesson.scrapWasteMetrics.co2ReductionKg}</span>
                  </div>
                </div>
              )}
            </div>

            {/* In-depth Lesson Content Sections */}
            <div className="space-y-4">
              {currentLesson.sections?.map((sec, sIdx) => (
                <div key={sIdx} className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span>{sec.heading}</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-3.5">
                    {sec.content}
                  </p>

                  {/* Culinary Formula / Mass-Balance Ratio Box */}
                  {sec.formulaBox && (
                    <div className="ml-3.5 mt-2 bg-blue-50/80 border border-blue-200 rounded-xl p-4 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 text-blue-900 font-bold uppercase text-[11px] tracking-wide">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>{sec.formulaBox.title}</span>
                      </div>
                      <p className="font-mono text-blue-950 font-medium bg-white/70 p-2 rounded-md border border-blue-100">
                        {sec.formulaBox.ratioOrStep}
                      </p>
                      {sec.formulaBox.safetyNote && (
                        <p className="text-[11px] text-amber-800 flex items-center gap-1 pt-1">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                          <span>HACCP Safety: {sec.formulaBox.safetyNote}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Key Takeaways */}
            {currentLesson.keyTakeaways?.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Chef Brigade Core Takeaways</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {currentLesson.keyTakeaways.map((takeaway, tIdx) => (
                    <li key={tIdx} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Module-Specific Standard Operating Procedures & Formulation PDFs */}
            <div>
              <div className="flex items-center justify-between mb-3 pt-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Module {currentModule.moduleNumber} Standard Operating Procedures & Formulations
                  </h4>
                  <p className="text-xs text-slate-500">
                    Official culinary protocols authored by Dr. Chef Supritam Basu. Downloadable for your kitchen brigade.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {(MODULE_SOPS[currentModule.moduleNumber] || MODULE_SOPS[2]).map((sop, sopIdx) => (
                  <div
                    key={sopIdx}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs sm:text-sm">
                          {sop.filename}
                        </p>
                        <p className="text-[11px] text-slate-500">{sop.size} · {sop.type}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadPdf(sop.filename, sop.title)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg shadow-2xs transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INTERACTIVE QUIZ (Actual Module Assessment Questions) */}
        {activeTab === 'quiz' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 block">
                  Module {currentModule.moduleNumber} Accredited Assessment
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  {currentModule.title}
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                Question {quizQuestionIndex + 1} of {assessmentQuestions.length}
              </span>
            </div>

            {/* Question Card */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {currentQuizItem.question} <span className="text-red-500">*</span>
              </h4>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQuizItem.options.map((option, optIdx) => {
                  const isSelected = currentQuizAnswer?.selected === optIdx;
                  let optionStyles = 'border-slate-200 bg-white hover:border-slate-300 text-slate-800';

                  if (currentQuizAnswer?.isSubmitted) {
                    if (optIdx === currentQuizItem.correctIndex) {
                      optionStyles = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                    } else if (isSelected) {
                      optionStyles = 'border-red-500 bg-red-50 text-red-900';
                    }
                  } else if (isSelected) {
                    optionStyles = 'border-blue-600 bg-blue-50/50 text-blue-900 font-medium';
                  }

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectQuizOption(optIdx)}
                      className={`flex items-center gap-3 p-3.5 rounded-lg border text-xs sm:text-sm cursor-pointer transition-all ${optionStyles}`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-600 text-white' 
                          : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="flex-1">{option}</span>
                    </div>
                  );
                })}
              </div>

              {/* Feedback Explanation */}
              {currentQuizAnswer?.isSubmitted && (
                <div className={`p-4 rounded-lg text-xs leading-relaxed ${
                  currentQuizAnswer.isCorrect
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  <p className="font-bold mb-1">
                    {currentQuizAnswer.isCorrect ? '✓ Correct!' : 'Scientific Explanation:'}
                  </p>
                  <p>{currentQuizItem.explanation}</p>
                </div>
              )}
            </div>

            {/* Quiz Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-medium">
                Pass Threshold: 80% (CPD Diploma Standard)
              </span>

              <div className="flex items-center gap-3">
                {!currentQuizAnswer?.isSubmitted ? (
                  <button
                    onClick={handleSubmitQuizAnswer}
                    disabled={currentQuizAnswer?.selected === undefined}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none rounded-lg shadow-xs transition-colors"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuizQuestion}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>{quizQuestionIndex < assessmentQuestions.length - 1 ? 'Next Question' : 'Complete Module'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: 252 NEWSLETTER DEEP-DIVE (Synthesized Issues for This Module) */}
        {activeTab === 'newsletters' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                  Original Publication Synthesized
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  Module {currentModule.moduleNumber} Newsletters ({currentModule.newsletterRange})
                </h3>
              </div>

              <a
                href="https://www.linkedin.com/newsletters/the-zero-waste-kitchen-7293401149716459520/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                <span>Read on LinkedIn</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {moduleNewsletters.map((nl) => (
                <div
                  key={nl.issueNumber}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Issue #{nl.issueNumber}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {nl.category}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm leading-snug">
                    {nl.title}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {nl.summary}
                  </p>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Scrap: <strong className="text-slate-800">{nl.primaryScrap}</strong></span>
                    <span className="text-blue-600 font-semibold">Synthesized in Module {nl.moduleMapped}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: DISCUSSION FEED & CHEF Q&A */}
        {activeTab === 'feed' && (
          <div className="p-6 space-y-6">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Chef Brigade Discussion & Q&A</h4>
              <p className="text-xs text-slate-500">
                Share trial observations with fellow authors, chefs or ask Dr. Chef Supritam Basu.
              </p>
            </div>

            {/* Post new question */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="text-xs font-bold text-slate-800 block">
                Ask Dr. Chef Supritam Basu about Module {currentModule.moduleNumber}
              </label>
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Ask about specific scrap formulations, brine salinity, or knife yield variance..."
                rows={2}
                className="w-full p-2.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    if (!newPostText.trim()) return;
                    setDiscussionPosts([
                      {
                        id: `p-${Date.now()}`,
                        author: 'Author, Chef (You)',
                        role: 'Surplus Academy Learner',
                        date: 'Just now',
                        text: newPostText
                      },
                      ...discussionPosts
                    ]);
                    setNewPostText('');
                  }}
                  disabled={!newPostText.trim()}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post to Forum</span>
                </button>
              </div>
            </div>

            {/* Existing discussion items */}
            <div className="space-y-3">
              {discussionPosts.map((post) => (
                <div key={post.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{post.author}</span>
                    <span className="text-[11px] text-slate-400">{post.date}</span>
                  </div>
                  <span className="text-[10px] text-blue-600 font-semibold block">{post.role}</span>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">{post.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
