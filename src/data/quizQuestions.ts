export interface InteractiveQuizQuestion {
  id: string;
  courseId: string;
  lessonId?: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  category: string;
}

export const surplusQuizQuestions: InteractiveQuizQuestion[] = [
  {
    id: 'quiz-screenshot-1',
    courseId: 'how-to-create-zero-waste-mindset',
    lessonId: 'zwm-1',
    question: 'The best time to incorporate food waste prevention into the kitchen operation is when we:',
    options: [
      'Prep and chop the fruit & veg.',
      'Hire new chefs.',
      'Plan the new menu.',
      'Place the order for fresh produce.'
    ],
    correctAnswerIndex: 2,
    explanation: 'Food waste is created in the chef\'s office! By designing the menu with circular input/output recipe pairings (e.g., using cauliflower leaves for chutney when steaks are served with roasted florets), waste is eliminated at the architectural stage before raw goods enter the kitchen.',
    category: 'Mindset & Menu Engineering'
  },
  {
    id: 'quiz-2',
    courseId: 'how-to-reduce-prep-waste',
    lessonId: 'pw-1',
    question: 'Which of the following practices preserves the highest nutritional, antioxidant, and weight yield when handling clean root vegetables like carrots or parsnips?',
    options: [
      'Deep peeling with a blunt chef knife',
      'Thoroughly scrubbing with a stiff vegetable brush under running cold water',
      'Boiling and peeling the soft skin afterward',
      'Standard peeling with a dull serrated peeler'
    ],
    correctAnswerIndex: 1,
    explanation: 'Stiff bristle scrubbing preserves up to 18% of root vegetable mass that would otherwise be discarded in peelings, retaining the concentrated outer layer of aromatic compounds and dietary minerals.',
    category: 'Prep Waste & Cellular Yield'
  },
  {
    id: 'quiz-3',
    courseId: 'how-to-reduce-buffet-waste',
    lessonId: 'bw-2',
    question: 'What is the primary thermodynamic, psychological, and operational benefit of replacing full-size (1/1 GN) buffet hotel pans with 1/2 or 1/3 GN shallow inserts?',
    options: [
      'It reduces dishwashing water consumption by 90%',
      'It creates the optical impression of a generous, brimming display while minimizing food hold volumes and drying out',
      'It allows line cooks to reheat food multiple times across shifts',
      'It slows down guest foot traffic in the dining room'
    ],
    correctAnswerIndex: 1,
    explanation: 'Shallow 1/2 and 1/3 GN inserts look abundant and visually appealing to diners, yet hold 60% less food at any given moment, preventing massive batches from drying out or spoiling.',
    category: 'Buffet Thermodynamics & Scale'
  },
  {
    id: 'quiz-4',
    courseId: 'food-waste-prevention-chefs',
    lessonId: 'm1',
    question: 'Why does discarded organic culinary food waste generate dangerous methane (CH4) gas in municipal landfills?',
    options: [
      'Scraps are constantly irradiated by solar UV rays',
      'Landfill compaction creates an anaerobic (oxygen-depleted) environment where methanogenic bacteria thrive',
      'Chemical reactions occur between raw food and plastic trash bags',
      'Soil freezing temperatures force decomposition to halt'
    ],
    correctAnswerIndex: 1,
    explanation: 'Compacted landfill layers eliminate oxygen. In anaerobic conditions, methanogenic microbes break down food scraps, producing methane gas with 28 times the global warming potential of carbon dioxide.',
    category: 'Foundations & Science'
  },
  {
    id: 'quiz-5',
    courseId: 'how-to-create-zero-waste-recipes',
    lessonId: 'zwr-6',
    question: 'In Dr. Chef Supritam Basu\'s famous Croissant Sauce, what allows day-old baked croissants to create a velvety, luxurious emulsion with hot milk?',
    options: [
      'Chemical stabilizers and xanthan gum additives',
      'The high ratio of laminated butter combined with gelatinized wheat starches acting as a natural emulsifier',
      'Adding raw egg yolks and double heavy cream',
      'Acid coagulation from lemon juice'
    ],
    correctAnswerIndex: 1,
    explanation: 'Laminated viennoiserie pastry contains deeply caramelized, retrograded starches and rich 82% butterfat. When steeped in hot dairy and sheared in a high-speed blender, it forms a silky stable colloidal emulsion without requiring thickeners or eggs.',
    category: 'Culinary Formulations & Starch Chemistry'
  }
];
