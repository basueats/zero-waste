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
  passingScorePercent: number;
  questions: QuizQuestion[];
}

export const SECTION_QUIZZES: Record<number, SectionQuiz> = {
  1: {
    id: 'quiz-1',
    quizNumber: 1,
    title: 'Quiz 1: Waste Auditing, Mass-Balance & Methane Kinetics (10 Questions)',
    passingScorePercent: 37,
    questions: [
      {
        id: 'q1-1',
        question: '1. What is the primary operational objective of a 7-day tare-weighted kitchen waste audit?',
        options: [
          'To quantify exact net weight, origin station, and AP cost leakage across prep, spoilage, and plate returns',
          'To replace digital thermometers on the hot line',
          'To eliminate fresh produce from banquet menus',
          'To estimate bin volume visually without using a scale'
        ],
        correctIndex: 0,
        explanation: 'Tare-weighted tracking converts raw organic discards into exact financial yield metrics.'
      },
      {
        id: 'q1-2',
        question: '2. Why does landfilled organic waste produce potent methane gas (CH4) rather than clean carbon dioxide?',
        options: [
          'Solar ultraviolet light accelerates fat caramelization',
          'Compaction creates an oxygen-deprived anaerobic environment favoring methanogenic archaea',
          'Plastic bin liners react exothermically with water',
          'Sub-zero frost freezes aerobic yeast'
        ],
        correctIndex: 1,
        explanation: 'Anaerobic landfill decomposition generates methane, which has 28x the 100-year warming potential of CO2.'
      },
      {
        id: 'q1-3',
        question: '3. What is the certified international target for landfill organic waste diversion in commercial kitchens?',
        options: ['35% diversion', '55% diversion', '85% or higher diversion', '15% diversion'],
        correctIndex: 2,
        explanation: 'Zero Waste Kitchen certification requires >= 85% diversion across station streams.'
      },
      {
        id: 'q1-4',
        question: '4. In the Five P audit framework, what does "Product" strictly define?',
        options: [
          'The retail logo on compost bags',
          'The exact quantified tare-weight data table verified by the executive chef at shift close',
          'Imported truffle inventory',
          'The brand of digital tabletop scale'
        ],
        correctIndex: 1,
        explanation: 'Product defines the concrete data deliverable captured from the shift weighing audit.'
      },
      {
        id: 'q1-5',
        question: '5. Which waste stream covers food prepared and plated for guests that returns uneaten?',
        options: ['Spoilage waste', 'Pre-consumer trim waste', 'Post-consumer plate waste', 'Dry goods packaging'],
        correctIndex: 2,
        explanation: 'Plate waste measures guest-returned food and guides portion recalibration.'
      },
      {
        id: 'q1-6',
        question: '6. In the equation Mass_raw = Yield_edible + Trim_recoverable + Loss_evap, why must the empty caddy weight be zeroed?',
        options: [
          'Because tare subtraction isolates net biomass weight from wet container plastic or steel mass',
          'To make the digital screen brighter',
          'Because scales cannot read kilograms without tare',
          'To multiply food costs artificially'
        ],
        correctIndex: 0,
        explanation: 'Failing to zero out heavy Gastronorm pans or Lexan tubs distorts true yield percentages.'
      },
      {
        id: 'q1-7',
        question: '7. According to the EPA & FAO Food Recovery Hierarchy, what is the highest priority intervention before composting?',
        options: [
          'Landfill hauling',
          'Incineration',
          'Source reduction and culinary human-grade repurposing of trimmings',
          'Sewer disposal'
        ],
        correctIndex: 2,
        explanation: 'Keeping edible calories inside the human culinary food chain delivers the maximum economic and carbon benefit.'
      },
      {
        id: 'q1-8',
        question: '8. Why should wet vegetable peels never be mixed into oily or animal-protein trim bins during initial station separation?',
        options: [
          'Cross-contamination ruins downstream vegan broths, crisp dehydration powders, and sugar macerations',
          'Vegetable peels dissolve stainless steel',
          'Dairy proteins ferment slower in metal',
          'Moisture increases knife sharpening intervals'
        ],
        correctIndex: 0,
        explanation: 'Clean segregation preserves food-safe secondary sinks for plant extracts, bakery glazes, and ferments.'
      },
      {
        id: 'q1-9',
        question: '9. If a 10 kg case purchased at $4.00/kg yields 3.5 kg of usable recovered stalks saved from trash, what direct ingredient value was recaptured?',
        options: ['$1.40', '$3.50', '$14.00', '$40.00'],
        correctIndex: 2,
        explanation: '3.5 kg × $4.00/kg = $14.00 of AP capital retained per case.'
      },
      {
        id: 'q1-10',
        question: '10. When auditing cold-room spoilage, which inventory system prevents older prepped items from expiring behind fresh deliveries?',
        options: [
          'LIFO (Last-In, First-Out)',
          'FIFO (First-In, First-Out) with color-coded day-dot shelf labels',
          'Unlabeled batch stacking',
          'Ambient floor storage'
        ],
        correctIndex: 1,
        explanation: 'FIFO rotation paired with bold prep date and use-by labels virtually eliminates silent walk-in spoilage.'
      }
    ]
  },
  2: {
    id: 'quiz-2',
    quizNumber: 2,
    title: 'Quiz 2: Root-to-Stem Cellular Butchery & PME Enzymes (10 Questions)',
    passingScorePercent: 37,
    questions: [
      {
        id: 'q2-1',
        question: '1. Roughly what percentage of a purchased head of broccoli or cauliflower is discarded when cooks slice off only the florets?',
        options: ['5% to 8%', '10% to 12%', '35% to 45%', '78% to 85%'],
        correctIndex: 2,
        explanation: 'Brassica stalks, cores, ribs, and outer leaves typically weigh 35–45% of total AP weight.'
      },
      {
        id: 'q2-2',
        question: '2. Between which exact temperatures is Pectin Methyl Esterase (PME) activated to firm up vegetable trimmings prior to high heat?',
        options: ['0°C – 10°C', '25°C – 32°C', '55°C – 65°C', '100°C – 120°C'],
        correctIndex: 2,
        explanation: 'Holding plant cells at 55°C–65°C lets PME de-esterify pectin so native calcium cross-links cell walls.'
      },
      {
        id: 'q2-3',
        question: '3. Which kitchen tool most cleanly strips bitter fibrous outer bark from broccoli stalks without wasting the sweet inner parenchyma core?',
        options: ['Serrated bread knife', 'Heavy bone cleaver', 'Sharp ergonomic Y-peeler', 'Pastry offset spatula'],
        correctIndex: 2,
        explanation: 'A sharp Y-peeler shaves only the lignified 2mm cortex, exposing sweet kohlrabi-like core tissue.'
      },
      {
        id: 'q2-4',
        question: '4. How should tough cilantro, parsley, and dill stems be processed so every fragrant drop is reclaimed?',
        options: [
          'Boiled for 6 hours until grey',
          'Minced finely or high-shear blended with cold neutral oil for bright aromatic pistou and compound butters',
          'Discarded in grease traps',
          'Charred completely to ash immediately'
        ],
        correctIndex: 1,
        explanation: 'Soft herb stems hold concentrated terpenes and essential oils that infuse vibrantly when sheared cold.'
      },
      {
        id: 'q2-5',
        question: '5. How do stiff-bristled vegetable brushes outperform abrasive peeling on organic carrots and parsnips?',
        options: [
          'Scrubbing retains 15–18% more edible weight plus aromatic periderm phytonutrients',
          'Brushing doubles peeling labor time',
          'Brushing removes core sugars',
          'Peeling preserves more fiber than brushing'
        ],
        correctIndex: 0,
        explanation: 'Scrubbing removes soil while keeping the nutritious epidermal skin intact.'
      },
      {
        id: 'q2-6',
        question: '6. Which part of a trimmed watermelon yields crisp, translucent savory pickles and spiced gastriques?',
        options: [
          'Waxed outer green cuticle only',
          'White fibrous mesocarp rind after shaving off the thin dark green exocarp',
          'Dry cardboard boxes',
          'Fermented seeds only'
        ],
        correctIndex: 1,
        explanation: 'Shaved white watermelon mesocarp behaves like crisp Asian winter melon in hot-brine pickles.'
      },
      {
        id: 'q2-7',
        question: '7. Why must green brassica leaves (cauliflower, radish, beet greens) be shocked in an ice bath immediately after a 20-second blanch?',
        options: [
          'To freeze them solid for frying',
          'To arrest chlorophyllase enzyme degradation and lock vibrant emerald pigment',
          'To wash away sodium',
          'To dissolve cellulose into sugar'
        ],
        correctIndex: 1,
        explanation: 'Rapid thermal quenching stops magnesium loss from the chlorophyll porphyrin ring.'
      },
      {
        id: 'q2-8',
        question: '8. Why do dry papery brown onion skins and dark green leek tops serve best in stocks or dehydration rather than raw salads?',
        options: [
          'Their high quercetin flavonoids and insoluble lignocellulose deliver deep color and savory pyrazines upon extraction',
          'They contain toxic solanine',
          'They melt into gelatin at 20°C',
          'They lack aroma'
        ],
        correctIndex: 0,
        explanation: 'Outer allium sheaths infuse rich amber color and roasted umami aromatics during thermal extraction or milling.'
      },
      {
        id: 'q2-9',
        question: '9. After soaking raw scrubbed potato skins in cold water, what valuable culinary thickener settles at the bottom when decanted?',
        options: ['Casein curd', 'Pure high-amylopectin potato starch', 'Collagen peptides', 'Sodium alginate'],
        correctIndex: 1,
        explanation: 'Decanted starchy wash water leaves pristine potato starch suitable for glossy crisp batters and velvet sauces.'
      },
      {
        id: 'q2-10',
        question: '10. When holding allium/root trim bins on a prep table across a 3-hour morning shift, how do chefs avoid enzymatic greying?',
        options: [
          'Submerge clean peeled cores in 0.5% ascorbic/citric acidulator cold water or wrap tightly chilled below 4°C',
          'Leave exposed under heat lamps',
          'Coat in raw poultry drippings',
          'Sprinkle with baking soda'
        ],
        correctIndex: 0,
        explanation: 'Mild acidulation lowers polyphenol oxidase (PPO) enzymatic browning dramatically.'
      }
    ]
  },
  3: {
    id: 'quiz-3',
    quizNumber: 3,
    title: 'Quiz 3: Nose-to-Tail Butchery, Collagen Hydrolysis & Stocks (10 Questions)',
    passingScorePercent: 37,
    questions: [
      {
        id: 'q3-1',
        question: '1. Within which temperature range does triple-helix animal collagen denature and unwind into soluble culinary gelatin?',
        options: ['15°C – 25°C', '60°C – 70°C (with sustained sub-boiling extraction 85°C–92°C)', '180°C – 200°C', 'Sub-zero freezing'],
        correctIndex: 1,
        explanation: 'Collagen shrinks and unwinds above 60°C, steadily hydrolyzing into mouth-coating gelatin in gentle simmers.'
      },
      {
        id: 'q3-2',
        question: '2. Why does violently boiling a bone stock at 100°C+ result in a cloudy, greasy, flat-tasting broth?',
        options: [
          'Turbulent rolling bubbles emulsify rendered fat droplets into suspension and shatter volatile top-note aromatics',
          'High heat destroys water molecules',
          'Bones dissolve into calcium stones above 98°C',
          'Gelatin freezes under convection'
        ],
        correctIndex: 0,
        explanation: 'A calm bare-simmer (85°C–92°C) allows lipids to float cleanly for skimming while extracting pristine clarity.'
      },
      {
        id: 'q3-3',
        question: '3. What is the maximum strict simmering window for delicate white fish collars, frames, and trimmings?',
        options: ['5 hours', '22 to 25 minutes maximum', '12 hours overnight', '2 seconds'],
        correctIndex: 1,
        explanation: 'Over-simmering teleost fish bones beyond 30 minutes extracts chalky minerals and bitter fishy peptides.'
      },
      {
        id: 'q3-4',
        question: '4. When clarifying cloudy scrap stock into crystal-clear consommé, what naturally traps suspended micro-particulates in the raft?',
        options: [
          'Whipped egg-white albumin and finely minced trimmings coagulating slowly as temperature rises',
          'Adding cold butter cubes',
          'High-speed immersion blending',
          'Adding cornstarch slurry'
        ],
        correctIndex: 0,
        explanation: 'Gradual thermal coagulation of egg whites pulls buoyant impurities upward into a tight porous filter raft.'
      },
      {
        id: 'q3-5',
        question: '5. How do executive pastry and roast stations turn roasted shrimp and lobster carapaces into golden bisque oils?',
        options: [
          'Steeping dehydrated/crushed shells gently at 65°C–75°C in neutral oil or butter to release fat-soluble astaxanthin',
          'Blending raw wet shells with ice water',
          'Boiling shells in vinegar for 4 hours',
          'Freezing without straining'
        ],
        correctIndex: 0,
        explanation: 'Carotenoid astaxanthin bound in crustacean chitin is lipophilic, infusing brilliantly into warm oil.'
      },
      {
        id: 'q3-6',
        question: '6. Roasting pork or beef bones lightly brushed with tomato paste at 175°C–190°C activates which flavor-building reaction?',
        options: ['Saponification', 'Maillard reaction between amino acids and reducing sugars', 'Acid curdling', 'Photosynthesis'],
        correctIndex: 1,
        explanation: 'High-heat browning generates melanoidins and savory pyrazines that deepen jus color and complexity.'
      },
      {
        id: 'q3-7',
        question: '7. Why is cold aerated degreasing superior to ladle skimming alone after chilling a 40L bone stock batch?',
        options: [
          'Below 4°C, saturated tallow and chicken schmaltz solidify into a liftable solid fat cap ready for roasting & frying',
          'Chilling boils away excess salt',
          'Gelatin sinks to the floor',
          'It eliminates the need to strain solids'
        ],
        correctIndex: 0,
        explanation: 'Cold separation harvests pure clarified fat (zero-waste tallow/schmaltz) while leaving zero lipid sheen on the stock.'
      },
      {
        id: 'q3-8',
        question: '8. What culinary treasure lies in poultry wingtips, necks, and carcass trimmings compared to lean breast trim?',
        options: [
          'Significantly higher ratios of articular cartilage and dermal collagen for glossy demi-glace body',
          'Lower water weight only',
          'Zero nitrogen content',
          'Faster spoilage without chillers'
        ],
        correctIndex: 0,
        explanation: 'Joint cartilage delivers abundant natural gelatin without requiring synthetic hydrocolloid thickeners.'
      },
      {
        id: 'q3-9',
        question: '9. After straining spent aromatics and bones from stock, what third value extraction ensures nothing goes unharvested?',
        options: [
          'Remouillage ("re-wetting"): simmering the spent rack in fresh cold water for a light base stock or braising liquid',
          'Deep frying the wet bones immediately',
          'Mixing bones into raw pastry dough',
          'Pouring down drain pipes'
        ],
        correctIndex: 0,
        explanation: 'Classical French remouillage captures remaining gelatin and aromatics to fortify next-day stock batches.'
      },
      {
        id: 'q3-10',
        question: '10. How fast must hot stock cooling from 60°C be chilled through the bacterial danger zone according to commercial HACCP protocols?',
        options: [
          'Cool to <= 20°C within 2 hours and <= 5°C within an additional 4 hours using ice paddles or blast chillers',
          'Leave untouched on the warm range overnight',
          'Freeze in deep plastic drums sealed tight while still 90°C',
          'Chill over 48 hours at 18°C'
        ],
        correctIndex: 0,
        explanation: 'Rapid chill-wand/blast-chilling prevents germination of spore-forming Clostridium perfringens.'
      }
    ]
  },
  4: {
    id: 'quiz-4',
    quizNumber: 4,
    title: 'Quiz 4: Commercial Yield Analytics & Blade Mechanics (10 Questions)',
    passingScorePercent: 37,
    questions: [
      {
        id: 'q4-1',
        question: '1. Using the standard True Food Cost formula, if As-Purchased price is $6.00/kg and Edible Portion (EP) yield rises from 60% to 80%, how does True Cost change?',
        options: [
          'Drops from $10.00/kg to $7.50/kg net edible cost',
          'Rises from $6.00 to $12.00/kg',
          'Remains unchanged at $6.00/kg',
          'Doubles labor overtime'
        ],
        correctIndex: 0,
        explanation: 'True Food Cost = AP Price / Yield %. $6 / 0.60 = $10.00 vs $6 / 0.80 = $7.50 (a 25% savings!).'
      },
      {
        id: 'q4-2',
        question: '2. Why do sharp thin-bevel blades (12°–15°) reduce post-cut cellular spoilage in cut herbs and vegetables compared to dull blades?',
        options: [
          'Clean shearing slices cleanly between cell walls rather than crushing cells and releasing oxidative polyphenol oxidase',
          'Sharp blades freeze moisture on contact',
          'Dull blades evaporate Vitamin C instantly',
          'Angle has zero effect on cell turgor'
        ],
        correctIndex: 0,
        explanation: 'Cleanly sliced produce resists blackening, weeping, and microbial colonization twice as long in walk-ins.'
      },
      {
        id: 'q4-3',
        question: '3. In the 3-Tier Station Separation model, what distinguishes Green bin trim from White and Blue bins?',
        options: [
          'White = collagen/bones for stock, Green = pure single-ingredient ferments, Blue = clean peels/skins for dehydration powders',
          'Green = toxic chemicals',
          'All three go directly to landfill',
          'Blue = wet dish pit scraps'
        ],
        correctIndex: 0,
        explanation: 'Dedicated clean separation takes <= 15 seconds per prep kilogram and keeps secondary value streams pure.'
      },
      {
        id: 'q4-4',
        question: '4. During pastry and garde-manger batch mixing, what percentage of sauce, puree, or batter commonly clings to bowl walls unless recovered with silicone spatulas?',
        options: ['0.1%', '6% to 9% of batch weight', '45%', '0.5g total'],
        correctIndex: 1,
        explanation: 'Non-Newtonian pseudoplastic purees adhere thickly; systematic spatula scraping recovers ~85g per kilogram.'
      },
      {
        id: 'q4-5',
        question: '5. When auditing morning mise-en-place yield tests, how should a chef calculate Vegetable Butcher Yield Variance?',
        options: [
          'Actual Edible Yield % minus Standard Recipe Benchmark Yield % multiplied by AP case cost',
          'Total bin lid width divided by oven temperature',
          'Number of plates washed per hour',
          'Customer headcount minus tips'
        ],
        correctIndex: 0,
        explanation: 'Variance pinpoints whether over-trimming stems from poor knife skills, dull equipment, or produce sizing.'
      },
      {
        id: 'q4-6',
        question: '6. How does storing woody herbs (thyme, rosemary) wrapped lightly in damp breathable cloth inside perforated trays affect spoilage waste?',
        options: [
          'Maintains stomata humidity without waterlogged slime, extending shelf life from 3 days to 10+ days',
          'Triggers mold within 4 hours',
          'Boils volatile oils away',
          'Discolors steel pans'
        ],
        correctIndex: 0,
        explanation: 'Balanced transpiration humidity prevents wilting and anaerobic black rot inside airtight bags.'
      },
      {
        id: 'q4-7',
        question: '7. Why do zero-waste prep sheets replace casual volume units ("3 handfuls") with digital gram measurements?',
        options: [
          'Consistent ratio scaling allows secondary byproduct recipes (2.5% brines, 1:1 oleos) to stay food-safe and repeatable',
          'Volume is illegal in gastronomy',
          'Grams convert automatically to oven Celsius',
          'Chefs cannot see measuring cups'
        ],
        correctIndex: 0,
        explanation: 'Exact gram precision ensures critical saline/sugar ratios never under-acidify or spoil.'
      },
      {
        id: 'q4-8',
        question: '8. When trimmings from bell peppers, tomatoes, and celery end up mixed in prep water, why must cooks spin-dry before vacuum sealing?',
        options: [
          'Free surface water dilutes brine concentrations and breeds slimy lactic spoilage pockets during storage',
          'Spinning generates heat to cook peppers',
          'Dry surfaces absorb zero flavor',
          'Salt cannot dissolve without spinning'
        ],
        correctIndex: 0,
        explanation: 'Controlling residual surface water ensures shelf-stable weight ratios for fermentation and dehydration.'
      },
      {
        id: 'q4-9',
        question: '9. What does KPI "Trim-to-Revenue Ratio" track for an executive chef auditing weekly P&L performance?',
        options: [
          'Dollars generated from upcycled specials, house sodas, stocks, and house ferments versus raw AP vegetable purchases',
          'Number of trash pickups per month',
          'Water utility rates',
          'Staff commute mileage'
        ],
        correctIndex: 0,
        explanation: 'Turning trimmed waste into billable beverage pairings and tasting-menu accents turns waste into direct gross margin.'
      },
      {
        id: 'q4-10',
        question: '10. Mid-Term Audit Rule: Before approving any seasonal new dish onto the line, what question must the chef sign off on first?',
        options: [
          'Where is the designated zero-waste sink for every peel, bone, core, and leftover prep stream generated by this dish?',
          'Can we buy pre-cut plastic-bagged trimmings instead?',
          'How big are the restaurant garbage dumpsters?',
          'Should cooks hide peelings during inspection?'
        ],
        correctIndex: 0,
        explanation: 'Pre-menu byproduct mapping catches waste before the first purchase order is ever placed.'
      }
    ]
  },
  5: {
    id: 'quiz-5',
    quizNumber: 5,
    title: 'Quiz 5: Wild Lacto-Fermentation & Saline Chemistry (10 Questions)',
    passingScorePercent: 37,
    questions: [
      {
        id: 'q5-1',
        question: '1. Standard lacto-fermentation brine uses what weight percentage of non-iodized sea salt relative to TOTAL mass (Scraps + Water)?',
        options: ['0.2%', '2.0% to 3.0% by total weight', '18% saturation', '0% plain water'],
        correctIndex: 1,
        explanation: '2.5% total mass salinity suppresses spoilage microbes while selectively favoring Leuconostoc and Lactobacillus.'
      },
      {
        id: 'q5-2',
        question: '2. Why is strictly using total weight (Fruit/Veg Scraps + Water) × 0.025 safer than salting "water only"?',
        options: [
          'Vegetable tissue is 85–95% water; salting only liquid drastically dilutes final equilibrium salinity into danger zones',
          'Fruit absorbs zero sodium ions',
          'Scale batteries save energy',
          'Dry salt floats in brine'
        ],
        correctIndex: 0,
        explanation: 'Osmotic equilibration distributes salt across both liquid and intracellular vegetable moisture.'
      },
      {
        id: 'q5-3',
        question: '3. Below which pH food-safety threshold must wild lactic ferments rapidly drop to prevent Clostridium botulinum spore toxin formation?',
        options: ['pH < 8.5', 'pH < 4.6 (target HACCP operational target <= 4.2)', 'pH 7.0 neutral', 'pH 11.0 alkaline'],
        correctIndex: 1,
        explanation: 'Acidification below pH 4.6 strictly blocks pathogenic C. botulinum growth under anaerobic conditions.'
      },
      {
        id: 'q5-4',
        question: '4. Why must iodine-fortified table salt and chlorinated tap water be avoided in wild lacto-fermentation?',
        options: [
          'Residual iodine and free chlorine actively inhibit beneficial lactic acid bacteria colonies',
          'Iodine turns red cabbage neon orange permanently',
          'Chlorine dissolves glass crocks',
          'Table salt adds excessive sucrose'
        ],
        correctIndex: 0,
        explanation: 'Pure sea salt and filtered/dechlorinated water allow wild epiphytic bacteria to establish dominance rapidly.'
      },
      {
        id: 'q5-5',
        question: '5. How do weighted glass fermentation weights or submerged vacuum bags protect fermenting citrus/veg scraps from kahm yeast and mold?',
        options: [
          'Keeping 100% of solid scraps submerged beneath liquid excludes dissolved oxygen required by aerobic surface molds',
          'Adding sugar coats yeast in glaze',
          'Glass reflects fluorescent rays',
          'Boiling weights sterilizes ambient room air'
        ],
        correctIndex: 0,
        explanation: 'Lactic acid bacteria thrive anaerobically under brine, whereas unwanted fuzzy molds require air exposure.'
      },
      {
        id: 'q5-6',
        question: '6. Once spicy jalapeño stems, celery trim, or carrot peels reach bright acidity (pH 3.8), what can chefs build with the leftover strained fermented brine?',
        options: [
          'Complex umami finishing vinegars, brining marinades for roasted chicken, and enzymatic hot-sauce dilutants',
          'Only floor cleaner',
          'Oil-frying batter',
          'Sweet meringue stabilizer'
        ],
        correctIndex: 0,
        explanation: 'Alive lacto-brines add salinity, balanced lactic tartness, and deep glutamates to marinades and dressings.'
      },
      {
        id: 'q5-7',
        question: '7. What optimal ambient room temperature yields clean crispy lactic vegetable ferments without sluggish yeast spoilage?',
        options: ['18°C – 22°C (cool kitchen cellar/larder)', '48°C oven proofing box', '-5°C freezer', '90°C steam table'],
        correctIndex: 0,
        explanation: 'Moderate temperature balances balanced hetero- and homofermentative LAB waves while maintaining cell crunch.'
      },
      {
        id: 'q5-8',
        question: '8. When lacto-fermenting fruit peels (melon rind, apple cores, plum trim) in vacuum bags, why do the pouches inflate during days 2–5?',
        options: [
          'Heterofermentative microbes release benign carbon dioxide (CO2) gas alongside lactic acid',
          'Plastic shrinks under darkness',
          'Botulinum oxygen inflation',
          'Evaporation of stainless steel'
        ],
        correctIndex: 0,
        explanation: 'Gas production confirms active microbial respiration; burp swollen pouches cleanly and reseal or store chilled.'
      },
      {
        id: 'q5-9',
        question: '9. After lacto-fermenting 1kg of cherry tomato skins or mushroom stems, what high-value seasoning remains after gently dehydrating the drained fermented pulp?',
        options: [
          'Fermented lactic umami salt dust bursting with tang and complex savory depth',
          'Neutral flavorless chalk',
          'Toxic rancid oil',
          'Raw sucrose crystals'
        ],
        correctIndex: 0,
        explanation: 'Lacto-fermented dehydrated powders bring layered acidity and glutamate richness to grilled meats and roasted vegetables.'
      },
      {
        id: 'q5-10',
        question: '10. If a crock smells sharply like acetone/nail-polish or shows green/black fuzzy sporulating mold beneath the brine surface, what is the strict HACCP rule?',
        options: [
          'Discard the entire batch immediately and sanitize the crock with boiling water and food-grade sanitizer',
          'Skim top 1mm with spoon and serve raw to VIP tables',
          'Mask with sugar syrup',
          'Freeze to neutralize mycotoxins'
        ],
        correctIndex: 0,
        explanation: 'Penetrating molds can harbor heat-stable mycotoxins; safety always overrides salvage when pH fails.'
      }
    ]
  },
  6: {
    id: 'quiz-6',
    quizNumber: 6,
    title: 'Quiz 6: Koji Inoculation, Misos & Amino Garums (10 Questions)',
    passingScorePercent: 37,
    questions: [
      {
        id: 'q6-1',
        question: '1. Which beneficial filamentous mold fungus is cultivated on steamed rice or barley waste to power enzymatic proteolysis in miso and garums?',
        options: ['Aspergillus oryzae (Koji)', 'Saccharomyces boulardii', 'Penicillium roqueforti', 'Staphylococcus aureus'],
        correctIndex: 0,
        explanation: 'Aspergillus oryzae secretes powerful amylases and proteases that cleave complex starch into sugars and proteins into free umami glutamates.'
      },
      {
        id: 'q6-2',
        question: '2. How does Aspergillus oryzae turn bland stale sourdough bread heels or leftover cooked grains into rich caramelizable miso?',
        options: [
          'Alpha-amylase breaks starch chains into sweet maltose/glucose while proteases liberate savory amino acids from legumes or trims',
          'It freezes wheat gluten',
          'It converts water into citric acid directly',
          'It adds butterfat crystals'
        ],
        correctIndex: 0,
        explanation: 'Enzymatic saccharification and proteolysis unlock intense umami sweetness without requiring soy beans alone.'
      },
      {
        id: 'q6-3',
        question: '3. When executing a warm rapid amino garum (60°C–62°C incubation) using mushroom scraps or fish trimmings, why do chefs use 12%–18% salt by weight?',
        options: [
          'High incubation heat halts lactic bacteria, so elevated osmotic salt prevents thermophilic pathogen growth while exogenous koji proteases continue working',
          'Because koji dies below 10% salt',
          'Salt lowers boiling point to 40°C',
          'To crystallize bone calcium'
        ],
        correctIndex: 0,
        explanation: 'Enzymes remain catalytic at 60°C even at high salinity, enabling crystal-clear rapid amino liquid sauces in 4–8 weeks.'
      },
      {
        id: 'q6-4',
        question: '4. What two enzymes secreted during barley or rice koji growth transform zero-waste protein trimmings?',
        options: [
          'Amylase (starch to sugar) and Protease (protein to free glutamates & peptides)',
          'Lactase and Lipase only',
          'Catalase and Peroxidase',
          'Chlorophyllase only'
        ],
        correctIndex: 0,
        explanation: 'Dual amylase-protease activity gives koji pastes both natural browning sweetness and profound savory intensity.'
      },
      {
        id: 'q6-5',
        question: '5. During traditional 48-hour koji sporulation incubation on leftover grains, what optimal chamber temperature and humidity produce fluffy white mycelium?',
        options: [
          '30°C – 32°C core grain temperature and 75%–80% relative humidity',
          '5°C dry refrigerator',
          '85°C steam cabinet',
          '0% vacuum desert'
        ],
        correctIndex: 0,
        explanation: 'Above 40°C mycelium cooks/dies; precise airflow and mixing at hour 24 dissipate exothermic metabolic heat.'
      },
      {
        id: 'q6-6',
        question: '6. What valuable dark liquid rises naturally to the surface of weighted miso crocks over months of aging (made from pea pods, squash seeds, or coffee bread)?',
        options: ['Tamari (natural aged amino extract)', 'Raw vegetable wash water', 'Liquid nitrogen', 'Whey curd'],
        correctIndex: 0,
        explanation: 'Aged miso tamari is a concentrated amber seasoning liquid ideal for finishing glazes and broths.'
      },
      {
        id: 'q6-7',
        question: '7. Why is toasted spent coffee grounds or roasted nut pomace blended successfully into dark roasted barley-koji miso bases?',
        options: [
          'Rich pyrazines and lipids harmonize with protease-driven melanoidins to produce dark chocolate-soy flavor complexity',
          'Coffee sterilizes stainless bowls',
          'Nut shells melt into sugar',
          'Caffeine acts as pure lactic acid'
        ],
        correctIndex: 0,
        explanation: 'Creative circular fermentations pair roasted dry trims with koji enzymes for plant-based demi-glace bases.'
      },
      {
        id: 'q6-8',
        question: '8. Why must chefs ensure garum chambers stay strictly above 60°C during heat-accelerated enzymatic autolysis (e.g., 60°C thermal box)?',
        options: [
          '60°C lies safely above bacterial danger zone proliferation limits while remaining below protease thermal denaturation threshold (~65°C)',
          'To boil out all amino water rapidly',
          'Plastic lids tighten above 60°C',
          'Enzymes triple every 2°C above boiling'
        ],
        correctIndex: 0,
        explanation: 'Holding cleanly between 60°C and 62°C gives microbiological safety while maximizing enzymatic proteolysis.'
      },
      {
        id: 'q6-9',
        question: '9. Using koji curing on tough surplus pork/duck legs or roasted root vegetables ("shio-koji brine") reduces roasting time and browns faster because:',
        options: [
          'Simple reducing sugars cleaved by amylase accelerate surface Maillard browning while tenderizing muscle fibers',
          'Alcohol evaporates water immediately',
          'Salt pulls out 100% of moisture in 5 minutes',
          'Collagen solidifies harder'
        ],
        correctIndex: 0,
        explanation: 'Shio-koji marinades act as a gentle natural tenderizer and caramelization booster for cheaper cuts and woody roots.'
      },
      {
        id: 'q6-10',
        question: '10. What color shift indicates unwanted over-incubation spore formation (green/yellow-green dust) on rice koji if neglected past 48 hours?',
        options: [
          'Green/mustard sporulation indicates the mold has shifted to seed production — culinary enzyme output plateaus and imparts bitter dusty notes',
          'Bright snow white',
          'Clear ice crystal',
          'Purple anthocyanin bloom'
        ],
        correctIndex: 0,
        explanation: 'Harvest koji at peak dense snow-white mycelial matting around hour 42–46 just before green sporulation.'
      }
    ]
  },
  7: {
    id: 'quiz-7',
    quizNumber: 7,
    title: 'Quiz 7: Thermal Preservation, Aw < 0.60 & Oleo Saccharums (10 Questions)',
    passingScorePercent: 37,
    questions: [
      {
        id: 'q7-1',
        question: '1. Below what critical Water Activity (Aw) threshold are pathogenic bacteria, molds, and yeasts completely unable to multiply on dried vegetable powders?',
        options: ['Aw < 0.99', 'Aw < 0.85', 'Aw < 0.60', 'Aw = 1.00'],
        correctIndex: 2,
        explanation: 'Reducing Aw below 0.60 locks hygroscopic trim powders into shelf-stable pantry longevity.'
      },
      {
        id: 'q7-2',
        question: '2. What standard culinary ratio defines a cold osmotic Citrus Oleo Saccharum syrup?',
        options: [
          '1.0 Part Clean Citrus Flavedo Peel : 1.0 Part Sucrose (rested 12 hours ambient)',
          '10 parts peel boiled with 100 parts water',
          'Equal parts lemon seeds and olive oil baked at 240°C',
          '5% vinegar sprayed on pith'
        ],
        correctIndex: 0,
        explanation: 'Hygroscopic sugar draws out volatile limonene oils cleanly at 18°C–22°C with zero thermal bitterness.'
      },
      {
        id: 'q7-3',
        question: '3. Why should leafy parsley tops, dill fronds, and green leek trims be dehydrated gently at 50°C–58°C rather than 180°C?',
        options: [
          'Gentle low airflow removes moisture without scorching delicate volatile monoterpenes or turning green pigments muddy brown',
          'Higher oven heat adds excess moisture',
          'Chlorophyll turns crystalline at 50°C',
          'Salt burns at 100°C'
        ],
        correctIndex: 0,
        explanation: 'Low thermal dehydration preserves vibrant emerald color and fresh garden aromatics inside house finishing salts.'
      },
      {
        id: 'q7-4',
        question: '4. What is the signature flavor technique behind French-style "torched vegetable ash" made from roasted leek skins, onion crusts, and corn husks?',
        options: [
          'Controlled slow carbonization at 175°C–200°C until bone-brittle, then grinding with flaky sea salt for mineral smoky contrast',
          'Dousing wet scraps in kerosene',
          'Freezing husks overnight',
          'Simmering skins in cream'
        ],
        correctIndex: 0,
        explanation: 'Fully desiccated roasted vegetable carbon creates dramatic monochrome plating contrasts with deep smoky umami.'
      },
      {
        id: 'q7-5',
        question: '5. Why must freshly milled hot spice/vegetable-peel powders cool to room temperature before sealing inside airtight glass jars?',
        options: [
          'Residual warmth creates internal water condensation on cold glass walls, raising local Aw and triggering mold clumping',
          'Hot jars lose volume',
          'Cold metal dissolves powder',
          'Oxygen expands inside sealed glass'
        ],
        correctIndex: 0,
        explanation: 'Allow blended trims to equilibrate dry-cool before jarring alongside a food-grade desiccant sachet if humid.'
      },
      {
        id: 'q7-6',
        question: '6. How are pomace solids left over from fresh restaurant apple, ginger, and beet cold-press juicing reclaimed in the pastry kitchen?',
        options: [
          'Pressed thinly onto parchment mats, dehydrated below Aw 0.60, and milled into intense natural cake flours, macarons, or fruit leathers',
          'Mixed raw into soup stocks only',
          'Dumped into mop sinks',
          'Deep fried without binder'
        ],
        correctIndex: 0,
        explanation: 'Juicer pomace retains 90% of fruit fiber and bright concentrated fruit essence when dried crisply.'
      },
      {
        id: 'q7-7',
        question: '7. After squeezing lemons and limes at the bar, why do chefs scrape away soggy inner white pith before drying pure zest or building citrates?',
        options: [
          'To maximize aromatic flavedo concentration unless bitterness of naringin/limonin pith is deliberately balanced with sugar',
          'Pith catches fire at 40°C',
          'Flavedo has zero flavor',
          'Pith dissolves sugar'
        ],
        correctIndex: 0,
        explanation: 'Understanding flavedo vs albedo chemistry avoids harsh astringency in house tonics and cordials.'
      },
      {
        id: 'q7-8',
        question: '8. Why does slow roasting peeled root vegetable trims with a whisper of neutral oil before dehydrating create richer broths?',
        options: [
          'Maillard caramelization creates roasted complex flavor polymers absent from raw air-drying',
          'Oil doubles moisture retention',
          'Dehydrators require oil grease to spin',
          'Proteins vanish at room temperature'
        ],
        correctIndex: 0,
        explanation: 'Pre-roasting builds "instant fond cubes" ready to steep into 10-minute luxury broths during peak dinner service.'
      },
      {
        id: 'q7-9',
        question: '9. What does "hygroscopic" mean regarding finely milled mushroom or tomato-skin finishing dust in a humid hot line?',
        options: [
          'It readily absorbs ambient airborne steam and rapidly cakes unless stored sealed with rice grains or sealed lids away from boiling kettles',
          'It repels liquid oil cleanly',
          'It dissolves stainless containers',
          'It lowers pan heat immediately'
        ],
        correctIndex: 0,
        explanation: 'Dense dry powders act like sponges over open boiling pots; portion into shaker vials during plating only.'
      },
      {
        id: 'q7-10',
        question: '10. Which botanical waste from espresso bars replaces chocolate cocoa in gluten-free zero-waste sable biscuits and savory rubs?',
        options: [
          'Gently kiln-dried spent dark-roast espresso coffee grounds paired with cinnamon and raw brown sugar',
          'Wet filter paper rolls',
          'Dishwasher brine',
          'Unroasted green plastic lids'
        ],
        correctIndex: 0,
        explanation: 'Dried spent coffee grounds offer toasted cacao-like notes and crisp sandy texture in sweet/savory rubs.'
      }
    ]
  },
  8: {
    id: 'quiz-8',
    quizNumber: 8,
    title: 'Quiz 8: Starch Retrogradation & Bakery Revitalization (10 Questions)',
    passingScorePercent: 37,
    questions: [
      {
        id: 'q8-1',
        question: '1. Why does day-old artisanal sourdough bread go hard even inside a sealed breadbox without losing net water?',
        options: [
          'Starch retrogradation: amylose and amylopectin recrystallize and expel interstitial bound water into crumbs',
          'Yeast consumes the crust completely',
          'Gluten freezes above 15°C',
          'Butter turns into calcium carbonate'
        ],
        correctIndex: 0,
        explanation: 'Staling is crystallization (retrogradation), not simple drying; thermal moisture or enzymatics reverse or weaponize it.'
      },
      {
        id: 'q8-2',
        question: '2. In Dr. Chef Basu’s famous Croissant Emulsion Sauce, what two components allow day-old viennoiserie to thicken warm milk into velvet sheen?',
        options: [
          'Retrograded gelatinized wheat starch plus laminated 82%-fat cultured butter sheared at high speed',
          'Synthetic gum additives',
          'Raw whole eggs boiled rapidly',
          'Cream of tartar crystal'
        ],
        correctIndex: 0,
        explanation: 'Laminated croissants naturally possess an ideal fat-to-starch emulsifier matrix when pulsed with infused dairy at 75°C.'
      },
      {
        id: 'q8-3',
        question: '3. How is traditional Eastern European "Bread Kvas" crafted solely from dark-toasted rye bread heels?',
        options: [
          'Infusing deeply charred rye crusts in boiling water, cooling, fermenting gently with wild rye starter/yeast and botanicals into a crisp effervescent probiotic tonic',
          'Deep-frying rye bread in olive oil',
          'Compressing crust with wax',
          'Freezing bread for 14 days'
        ],
        correctIndex: 0,
        explanation: 'Toasted rye yields dark malted caramel notes that ferment cleanly in 48 hours into sparkling house beverages.'
      },
      {
        id: 'q8-4',
        question: '4. What is the precise ratio for Dr. Chef Basu’s velvety Croissant Sauce formulation?',
        options: [
          '320g hot aromatic-infused milk : 80g deeply toasted sliced stale croissants',
          '10g water : 900g dry crackers',
          'Equal weights ice cubes and flour',
          '500ml vinegar : 5g croissant'
        ],
        correctIndex: 0,
        explanation: 'The 4:1 hot infused dairy-to-toasted pastry ratio delivers silky napé consistency without lumpiness.'
      },
      {
        id: 'q8-5',
        question: '5. How do modern pasta and larder stations turn stale sourdough crumbs into a crunchy protein-saving alternative to Parmesan garnish?',
        options: [
          'Toasting coarse crumbs slowly in herb oil and garlic confit trimmings into golden crispy Italian Pangrattato',
          'Soaking crumbs in cold tap water overnight',
          'Microwaving wet crumbs for 15 minutes',
          'Blending raw flour with raw egg yolks'
        ],
        correctIndex: 0,
        explanation: 'Scented toasted pangrattato adds crispy savory texture to pastas, salads, and roasted vegetables at a fraction of cheese cost.'
      },
      {
        id: 'q8-6',
        question: '6. In commercial bakeries, why does slicing and freezing excess sourdough on Day 1 eliminate mold waste vs storing loaves at 4°C refrigeration?',
        options: [
          'Refrigeration at 4°C hits the fastest temperature kinetic peak for starch retrogradation; -18°C freezes crystal rearrangement immediately',
          'Freezers steam crust moisture back in',
          'Bread molds faster in -18°C freezers',
          '4°C softens sourdough naturally'
        ],
        correctIndex: 0,
        explanation: 'Never store fresh artisanal loaves in walk-in chillers! Keep ambient short-term or freeze swiftly for oven revival.'
      },
      {
        id: 'q8-7',
        question: '7. How can chefs reclaim leftover cooked risotto, jasmine rice, or porridge rather than tossing tray leftovers?',
        options: [
          'Spread thinly onto parchment, dehydrate crisp at 65°C, and flash-puff in 200°C oil into crisp aerated rice chicharróns',
          'Leave in warm bain-marie for 3 days',
          'Dilute raw with cold cream and serve unheated',
          'Freeze wet lumps inside fryer baskets'
        ],
        correctIndex: 0,
        explanation: 'Fully gelatinized cooked rice dried brittle expands explosively into light shatter-crisp bar snacks upon high-heat frying.'
      },
      {
        id: 'q8-8',
        question: '8. Why is day-old firm brioche trim actually preferred over ultra-fresh soft brioche for commercial bread pudding and Pain Perdu?',
        options: [
          'Slightly dried aerated crumb absorbs up to 2.5x its weight in vanilla-scrap custard cleanly without collapsing into mush',
          'Stale brioche contains extra yeast protein',
          'Fresh brioche melts butter away immediately',
          'Stale crust does not brown'
        ],
        correctIndex: 0,
        explanation: 'Open capillary pores act like clean sponges for cream infusions, yielding tender custardy interiors and blistered edges.'
      },
      {
        id: 'q8-9',
        question: '9. What zero-waste Italian classic transforms dry stale ciabatta cubes, overripe cracked tomato juices, and herb stems into a chilled fine-dining soup?',
        options: ['Classic Tuscan Panzanella / Salmorejo emulsion', 'French Onion Consommé', 'Hollandaise sabayon', 'Sabayon meringue'],
        correctIndex: 0,
        explanation: 'Bread-thickened tomato emulsions emulsify with cold-pressed olive oil into silky chilled velvety soups.'
      },
      {
        id: 'q8-10',
        question: '10. If restaurant pastry trimmings are slightly toasted dark before bread-pudding assembly, what new chemical compounds enhance sensory aroma?',
        options: [
          'Sweet toasted pyrazines and caramelization products boost depth cleanly without raising sugar weight',
          'Lactic acid bacteria vanish',
          'Cold water freezes gluten strands',
          'Starch breaks down into cellulose bark'
        ],
        correctIndex: 0,
        explanation: 'Light drying at 160°C before soaking develops subtle biscuit toastiness throughout repurposed pastry desserts.'
      }
    ]
  },
  9: {
    id: 'quiz-9',
    quizNumber: 9,
    title: 'Quiz 9: Scrap Vinegars & Enzyme Clarifications (10 Questions)',
    passingScorePercent: 37,
    questions: [
      {
        id: 'q9-1',
        question: '1. Crafting gourmet single-origin restaurant vinegar from surplus apple cores or stone-fruit trim requires which exact TWO biological fermentation stages?',
        options: [
          'Stage 1: Anaerobic Saccharomyces yeast converts sugars -> ethanol. Stage 2: Aerobic Acetobacter aceti oxidizes ethanol + O2 -> acetic acid',
          'Stage 1: Boiling salt water. Stage 2: Freezing oil',
          'Stage 1: Aspergillus mold -> alcohol directly in vacuum',
          'Single-step butter churning'
        ],
        correctIndex: 0,
        explanation: 'Vinegar demands alcoholic fermentation first, followed by oxygenated Acetobacter oxidation (C2H5OH + O2 -> CH3COOH + H2O).'
      },
      {
        id: 'q9-2',
        question: '2. What is the chemical role of an Aquarium Air Stone bubbling gently inside a modern commercial scrap-vinegar reactor?',
        options: [
          'Acetobacter are obligate aerobes; steady dissolved oxygen cuts natural vinegar acidification time from 90 days down to 10–14 days',
          'It removes all acid taste completely',
          'It freezes mother-of-vinegar cellulose pellicle',
          'It prevents yeast from touching sugar in Stage 1'
        ],
        correctIndex: 0,
        explanation: 'Controlled aeration accelerates acetic oxidation smoothly without sacrificing crisp orchard aromatics.'
      },
      {
        id: 'q9-3',
        question: '3. When transforming bruised berries or cloudy apple scrap juice into crystal-clear jelly or consommé without eggs, how does freeze-thaw agar clarification ("cryo-syneresis") work?',
        options: [
          'Hydrate 0.5% agar in warm juice, freeze solid, then thaw in cheesecloth — expanding ice fractures agar gel networks, holding pulp cloudy solids back while clear pure juice drips cleanly',
          'Deep-fry solid ice blocks in peanut oil',
          'Boil with raw milk fat',
          'Blend rapidly at high shear after adding flour'
        ],
        correctIndex: 0,
        explanation: 'Cryo-syneresis achieves Michelin-grade optical clarity while retaining 100% volatile fresh aroma.'
      },
      {
        id: 'q9-4',
        question: '4. What target alcohol ABV range should Stage 1 scrap fruit wines reach before inoculating with unpasteurized Mother of Vinegar?',
        options: ['0.2% ABV', '6% to 9% ABV (ideal sweet spot avoiding Acetobacter alcohol shock)', '45% ABV distilled spirit', '90% ABV'],
        correctIndex: 1,
        explanation: 'Concentrations above ~10–12% ABV stall Acetobacter membranes, while 6–8% yields bright crisp ~5%–6% culinary acidity.'
      },
      {
        id: 'q9-5',
        question: '5. Using exogenous Pectinase enzyme (e.g., Pectinex) on crushed cloudy citrus membranes or overripe stone fruits accomplishes what?',
        options: [
          'Rapidly cleaves viscous soluble pectin polymers, settling pulp cleanly in hours and extracting crystal-clear citrus segments & high-yield clear juices',
          'Freezes fruit solids into rubber',
          'Turns sugar into pure salt',
          'Thickens juice into solid meringue'
        ],
        correctIndex: 0,
        explanation: 'Enzymatic pectin cleavage raises usable clear juice extraction from squeezed fruit trims by up to 25%.'
      },
      {
        id: 'q9-6',
        question: '6. What valuable live starter develops naturally on the meniscus of unpasteurized fruit scrap vinegar?',
        options: ['Cellulose biofilm known as the "Mother of Vinegar"', 'Green penicillin mold', 'Casein milk fat', 'Lard tallow crust'],
        correctIndex: 0,
        explanation: 'Keeping a clean portion of active mother inoculum allows perpetual continuous kitchen vinegar harvests.'
      },
      {
        id: 'q9-7',
        question: '7. Why can chefs pour leftover oxidized half-empty banquet red or white wines straight into seasoned vinegar barrels alongside water dilution?',
        options: [
          'Leftover event wine (~12% ABV) diluted 1:1 with clean filtered water immediately sits at ~6% ABV — primed directly for Stage 2 Acetobacter conversion',
          'Wine boils vinegar back to alcohol',
          'Oxidized wine contains zero calories',
          'Alcohol evaporates bacteria cold'
        ],
        correctIndex: 0,
        explanation: 'Open bar wine remnants never need to touch drains; dilute slightly to 6% ABV, add 20% live starter, and aerate cleanly.'
      },
      {
        id: 'q9-8',
        question: '8. Why must Stage 1 anaerobic wine yeast vessels be fitted with a simple S-bend water airlock instead of an open wide-mouth jar?',
        options: [
          'Permits CO2 exhaust escape while blocking airborne Acetobacter and fruit flies during alcoholic sweetness conversion',
          'Traps oxygen inside permanently',
          'Prevents alcohol formation completely',
          'Raises temperature to 85°C'
        ],
        correctIndex: 0,
        explanation: 'Protecting Stage 1 from premature vinegar flies guarantees clean high-ABV conversion before Stage 2 oxygenation begins.'
      },
      {
        id: 'q9-9',
        question: '9. What is a "quick shrub / drinking vinegar" technique for rescuing soft bruised seasonal berries before mold begins?',
        options: [
          '1 part bruised fruit : 1 part cane sugar macerated cold, strained, then blended with 1 part raw house scrap vinegar',
          'Boiling fruit whole in bleach water',
          'Blending fruit with raw flour',
          'Sun drying fruit outdoors for 30 days uncovered'
        ],
        correctIndex: 0,
        explanation: 'Cold sugar extraction paired with probiotic vinegar stabilizes bruised berries instantly for zero-proof bar menus.'
      },
      {
        id: 'q9-10',
        question: '10. At roughly what minimum acidity percentage (% acetic acid) is aged culinary scrap vinegar commercially shelf-stable at room temperature?',
        options: ['0.1%', '4.0% to 5.0% titratable acidity (pH ~2.4–3.2)', '0.5%', '100% pure glacial crystal'],
        correctIndex: 1,
        explanation: 'Standard ~5% acetic acid preserves kitchen pickles cleanly when balanced alongside heat or proper brine formulations.'
      }
    ]
  },
  10: {
    id: 'quiz-10',
    quizNumber: 10,
    title: 'Quiz 10: Dairy Byproduct Reclamation & Whey Chemistry (10 Questions)',
    passingScorePercent: 37,
    questions: [
      {
        id: 'q10-1',
        question: '1. What exact isoelectric pH triggers dissolved milk casein proteins to destabilize and precipitate into fresh curd / homemade paneer or ricotta?',
        options: ['pH 9.5', 'pH 7.0', 'pH 4.6 at ~82°C–85°C', 'pH 1.0'],
        correctIndex: 2,
        explanation: 'Acidifying warm milk to pH 4.6 neutralizes negative surface charges on casein micelles so clean soft curds aggregate.'
      },
      {
        id: 'q10-2',
        question: '2. When cheesemaking, yogurt straining, or souring milk leaves clear yellow-green liquid whey behind, what flavor miracle happens when sweet or acid whey is gently simmered down by 85%?',
        options: [
          'Concentrated lacto-caramel glaze ("Whey Caramel / Mysost"): browning lactose sugars and toasted whey proteins create rich butterscotch-umami glazes for roasted roots and pastry tarts',
          'It turns bitter and toxic',
          'It evaporates leaving zero residue',
          'It curdles into raw butter solids only'
        ],
        correctIndex: 0,
        explanation: 'Whey contains lactose sugars, minerals, and lactalbumin that caramelize brilliantly upon slow reduction.'
      },
      {
        id: 'q10-3',
        question: '3. How can hard parmesan, grana padano, or aged pecorino cheese rinds never be thrown in bin bags again?',
        options: [
          'Steep rinds gently inside broths, risottos, minestrone soups, or cream infusions — or microwave-puff diced rinds into airy crisp cheese "pork rinds"',
          'Boil rinds for deep grease',
          'Use only to weight bread fermentation bins',
          'Wash with dish soap'
        ],
        correctIndex: 0,
        explanation: 'Aged cheese rinds hold dense crystalline free glutamates and tyrosines that lend extraordinary depth to sauces and soups.'
      },
      {
        id: 'q10-4',
        question: '4. What happens to milk fat and hydration when leftover acid whey from house strained labneh replaces plain tap water in sourdough focaccia or pizza dough?',
        options: [
          'Natural lactic acidity softens gluten extensibility slightly while lactose promotes blistering Maillard crust browning and tangy tender crumb',
          'Dough stops rising permanently',
          'Bread turns bright blue',
          'Yeast explodes oven doors'
        ],
        correctIndex: 0,
        explanation: 'Whey baker hydration captures valuable riboflavin and amino proteins instead of dumping acidic dairy effluent into plumbing.'
      },
      {
        id: 'q10-5',
        question: '5. When butter or cream approaches sell-by closeout on the larder station, how does churning & fermenting cream with live buttermilk extend culinary life?',
        options: [
          'Inoculating excess cream with 5% active live yogurt/buttermilk culture creates cultured cream that churns into complex salted cultured butter plus bright probiotic buttermilk for biscuits and fried chicken marinades',
          'Freezing open cream pitchers raw',
          'Boiling heavy cream until dark black',
          'Mixing cream with raw onion juice'
        ],
        correctIndex: 0,
        explanation: 'Acidification protects lipid emulsions while capturing two gourmet assets: high-value cultured butter and baking buttermilk.'
      },
      {
        id: 'q10-6',
        question: '6. In traditional whey ricotta production, what prevents scorching fragile sweet lactalbumin proteins while heating remaining sweet whey up to ~90°C?',
        options: [
          'Steady gentle low-flame stirring plus adding a splash of warm milk (~10%) and citric acid/vinegar when temp crosses 85°C so delicate snowy curds float upward',
          'Vigorous boiling at max BTU setting',
          'Adding cold olive oil at 20°C',
          'Pressure cooking 3 hours'
        ],
        correctIndex: 0,
        explanation: 'Albumin heat-coagulates sharply near 90°C; gentle ladle skimming traps feathery sweet ricotta ready for ravioli and tarts.'
      },
      {
        id: 'q10-7',
        question: '7. Why does clarifying excess unsalted butter trimmings into golden "browned ghee / beurre noisette" allow months of ambient pantry shelf stability?',
        options: [
          'Evaporating the 16–18% water content strips away microbial hydration while gently toasting milk solids builds nutty hazelnut aromatics',
          'Removing fat increases water content',
          'Milk protein stays raw inside cold oil',
          'Salt crystallizes milk whey'
        ],
        correctIndex: 0,
        explanation: 'Water activity drops cleanly to near-zero when moisture bubbles finish boiling off clarified butter.'
      },
      {
        id: 'q10-8',
        question: '8. What botanical dairy-free byproduct resembles pressed ricotta/tofuyo when soy okara pulp (from house soy-milk making) is pressed and seasoned?',
        options: ['Fiber-rich plant protein curd cakes and oven-toasted nutty "okara crumble" crumbs', 'Refined sucrose crystals', 'Olive oil wax', 'Clear stock jelly'],
        correctIndex: 0,
        explanation: 'Plant milk pulps (almond, oat, soy okara) transform seamlessly into savory crackers, vegetable burgers, and toasted granolas.'
      },
      {
        id: 'q10-9',
        question: '9. Why should strained acid whey never be poured straight down un-neutralized grease traps in large commercial hotels?',
        options: [
          'High biological oxygen demand (BOD) plus acidity corrodes pipes and triggers municipal wastewater surcharge fines when poured raw in bulk',
          'Whey freezes metal drains solid',
          'Whey turns clean water pink',
          'It breaks grease grease trap stainless lids instantly'
        ],
        correctIndex: 0,
        explanation: 'Turning whey into bread hydration, lacto-caramel sauces, and fermented sodas eliminates wastewater effluent fees cleanly.'
      },
      {
        id: 'q10-10',
        question: '10. How are leftover chilled coffee creamers or vanilla gelato melts rescued during banquet breakdown cleanly under HACCP safety rules?',
        options: [
          'Only unopened/unserved temperature-controlled dairy (< 4°C) is repurposed immediately into cooked custard glazes, caramel sauces, or baked bread puddings heated above 75°C',
          'Pour back from guest pitch tables directly into next-day cold pitchers',
          'Leave unchilled overnight on banquet tables',
          'Serve raw warm'
        ],
        correctIndex: 0,
        explanation: 'Strict cold-chain hygiene plus full thermal re-pasteurization above 75°C converts surplus unopened dairy into pastry desserts safely.'
      }
    ]
  },
  11: {
    id: 'quiz-11',
    quizNumber: 11,
    title: 'Quiz 11: Circular Menu Engineering & Banquet Thermodynamics (10 Questions)',
    passingScorePercent: 37,
    questions: [
      {
        id: 'q11-1',
        question: '1. When does Dr. Chef Supritam Basu teach that kitchen food waste is TRULY created?',
        options: [
          'In the chef’s office during menu writing — long before a single vegetable touches the cutting board',
          'Only when dishwashers drop trays',
          'On the farm truck only',
          'During guest dining'
        ],
        correctIndex: 0,
        explanation: 'Circular Input/Output menu design links primary trimmings directly into downstream larder, bar, and pastry dishes.'
      },
      {
        id: 'q11-2',
        question: '2. In a Circular Menu Matrix, if your main grill course plates roasted cauliflower steaks, what pre-engineered secondary dish immediately consumes the trimmed leaves and tough stems?',
        options: [
          'Spiced Cauliflower Leaf & Stem Chutney with flatbread + silky roasted stem soup appetizer',
          'Throwing stems into cardboard recycling',
          'Ordering bagged frozen peas instead',
          'Leaving cores piled in freezer corners'
        ],
        correctIndex: 0,
        explanation: 'Zero-waste design treats every stem, rib, and leaf as an intentional menu line item with built-in gross profit.'
      },
      {
        id: 'q11-3',
        question: '3. What is the key thermodynamic and visual benefit of switching large hotel buffet wells from deep 1/1 GN (100mm) pans to shallow 1/2 or 1/3 GN (40mm) inserts?',
        options: [
          'Pans look brimming and fresh to guests while cutting stagnant over-held batch volume by ~60%',
          'Allows servers to leave hot proteins out for 8 hours',
          'Decreases stove gas flow',
          'Slows down linen laundering'
        ],
        correctIndex: 0,
        explanation: 'Smaller shallow trays allow frequent fresh kitchen replenishment so the final guest sees the same fresh quality without gigantic end-of-service write-offs.'
      },
      {
        id: 'q11-4',
        question: '4. What is the "T-45 Staggered Production Rule" for commercial resort buffets?',
        options: [
          'In the final 45 minutes of service, halt mass oven batch cooking and transition to crisp à la minute live cook stations',
          'Turn off all chillers 45 minutes before opening',
          'Double portion scoops during last 45 minutes',
          'Close doors 45 minutes early without notice'
        ],
        correctIndex: 0,
        explanation: 'Switching from batch holding to made-to-order action stations near service close slices unserved chafing dish write-offs dramatically.'
      },
      {
        id: 'q11-5',
        question: '5. Using the Circular Utilization Index: if 12 kg of fish & veg trim is produced on Friday and 10.2 kg becomes house fumet, pickles, and dust, what is the index?',
        options: ['12%', '50%', '85% Circular Index', '100%'],
        correctIndex: 2,
        explanation: '(10.2 kg / 12 kg) × 100 = 85%, hitting the certified professional zero-waste benchmark.'
      },
      {
        id: 'q11-6',
        question: '6. How does lowering dinner buffet plate diameter slightly (e.g., from 32 cm oversized platters to crisp 26 cm plates) affect consumer plate waste?',
        options: [
          'Reduces subconscious over-piling by 20–30% while guests happily return for fresh warm second helpings',
          'Forces guests to take double portions initially',
          'Has zero behavioral impact',
          'Increases dishwasher detergent waste by 40%'
        ],
        correctIndex: 0,
        explanation: 'Simple visual dishware sizing nudges guests away from eye-bigger-than-stomach plate discards.'
      },
      {
        id: 'q11-7',
        question: '7. Under strict European & international hotel HACCP guidelines, which untouched surplus food stream MAY legally be chilled & repurposed versus discarded?',
        options: [
          'Back-of-house speed-rack trays never placed onto self-serve guest lines (rapidly blast-chilled < 5°C within 90 min); guest-exposed chafers must follow local cold-holding rules',
          'Half-eaten customer steak plates',
          'Soup cooled uncovered at room temperature for 6 hours',
          'Raw shellfish drippings left warm'
        ],
        correctIndex: 0,
        explanation: 'Never cross-contaminate guest-exposed surfaces; only controlled backup kitchen trays kept outside danger zones may be blast-chilled and safely transformed.'
      },
      {
        id: 'q11-8',
        question: '8. Why should event caterers audit "Buffet Waste Index" (Unserved Hold Weight / Total Cooked Weight × 100) weekly across recurring corporate events?',
        options: [
          'Data calibrates exact per-guest gram consumption (protein vs starch vs salad) so next month’s batch forecast lands razor-close without overproduction',
          'To fire prep cooks every Monday',
          'To avoid counting guest RSVPs',
          'To hide extra costs inside beverage budgets'
        ],
        correctIndex: 0,
        explanation: 'Historical banquet tracking replaces "better make 20% extra just in case" guesswork with exact culinary forecasting.'
      },
      {
        id: 'q11-9',
        question: '9. How do airline, cruise, and luxury hotel breakfast operations convert leftover untouched morning croissants and fruit trim by lunch service?',
        options: [
          'Baked croissant caramel emulsions for pastry, pressed melon rinds into chilled bar shrubs, and toasted crouton croutons for lunch salads',
          'Throwing everything at 10:31 AM sharp',
          'Serving soggy heated croissants cold at dinner',
          'Blending fruit rinds into deep-fryer oil'
        ],
        correctIndex: 0,
        explanation: 'Pre-planned AM-to-PM circular handoffs create signature zero-waste specials with almost zero extra AP purchasing cost.'
      },
      {
        id: 'q11-10',
        question: '10. What dual advantage does partnering verified leftover wholesome kitchen surplus with community food rescue platforms deliver?',
        options: [
          'Community nourishment plus verified tax/ESG weight diversion metrics while lowering municipal landfill tipping fees',
          'Increases garbage collection charges',
          'Eliminates the need for daily walk-in thermometers',
          'Replaces cooking temperature logs'
        ],
        correctIndex: 0,
        explanation: 'After internal culinary repurposing, structured safe cold-chain donation honors both humanitarian ethics and commercial sustainability.'
      }
    ]
  },
  12: {
    id: 'quiz-12',
    quizNumber: 12,
    title: 'Quiz 12: Executive HACCP Compliance & Diploma Capstone (10 Questions)',
    passingScorePercent: 37,
    questions: [
      {
        id: 'q12-1',
        question: '1. Before placing any house-made lacto-fermented hot sauce, scrap vinegar, or amino garum onto a commercial restaurant menu, what HACCP documentation must be logged?',
        options: [
          'Validated pH meter reading (<= 4.2 for ferments), batch initiation date, saline %, thermal hold curve, and chef sign-off',
          'Only a handwritten sticky note saying "looks good"',
          'Staff verbal guess only',
          'Restaurant Instagram likes'
        ],
        correctIndex: 0,
        explanation: 'Inspectors require calibrated objective logs (pH, Aw, or temperature records) demonstrating biological safety barriers.'
      },
      {
        id: 'q12-2',
        question: '2. In high-volume executive kitchen leadership, how do successful chefs shift brigade mindset from "trash sorting annoyance" to "culinary pride"?',
        options: [
          'Teach the underlying enzymatic science, share saved weekly dollar KPIs, credit station cooks for creative byproduct specials, and make clean separation frictionless',
          'Shout loudly during rush service without training',
          'Lock compost bins outside in rain',
          'Ban digital scales from prep stations'
        ],
        correctIndex: 0,
        explanation: 'Cooks honor ingredients they understand deeply; celebrating reclaimed trimmings builds pride and craft mastery.'
      },
      {
        id: 'q12-3',
        question: '3. Under ISO 9001:2015 continuous improvement ("Plan-Do-Check-Act") applied to sustainable kitchens, what constitutes the "Check" phase?',
        options: [
          'Reviewing weekly tare-weight variance dashboards against food cost P&L targets and bacterial HACCP logs',
          'Writing menus once per decade',
          'Guessing bin weights',
          'Turning off dehydrators'
        ],
        correctIndex: 0,
        explanation: 'Audited measurement closes the PDCA loop so waste reductions lock permanently into kitchen profitability.'
      },
      {
        id: 'q12-4',
        question: '4. What is the single non-negotiable food safety boundary in Zero Waste Culinary Arts?',
        options: [
          'Zero-waste reclamation ONLY transforms clean, wholesomely stored, uncontaminated pre-consumer trim and controlled temperature-safe back-of-house surplus — never hazardous or spoiled food',
          'Spoiled fuzzy meat is fine if cooked hot',
          'Cross-contaminate raw poultry bins with salad leaves',
          'Ignore cold-chain rules to save electricity'
        ],
        correctIndex: 0,
        explanation: 'Zero waste and pristine HACCP sanitation are inseparable partners; compromised food is strictly discarded safely.'
      },
      {
        id: 'q12-5',
        question: '5. How do calibrated pH strips compare to digital spear-tip pH meters when certifying commercial restaurant ferments?',
        options: [
          'Two-point buffer calibrated digital meters provide exact +-0.02 pH audit accuracy required when juices stain paper strips dark red or brown',
          'Strips measure oven heat better',
          'Visual color guesses are more accurate',
          'pH meters cannot test liquid brines'
        ],
        correctIndex: 0,
        explanation: 'Anthocyanin-rich ferments (beets, hibiscus, soy tamari) stain colorimetric test strips unreadable; spear-tip digital probes eliminate guesswork.'
      },
      {
        id: 'q12-6',
        question: '6. When preparing allergen-conscious zero-waste stock pots using vegetable peel caddies, what cross-contact precaution is mandatory?',
        options: [
          'Keep peanut/nut shells, crustacean shells, dairy rinds, and gluten bakery crusts strictly isolated in color-labeled containers never mixed into plant/all-allergen-free stocks',
          'Toss shrimp shells and stale bread right into vegan vegetable consommé',
          'Assume boiling destroys peanut/gluten proteins',
          'Avoid allergen labels on house ferments'
        ],
        correctIndex: 0,
        explanation: 'Thermal cooking does NOT neutralize allergenic proteins like shellfish tropomyosin or wheat gliadin; station isolation keeps guests safe.'
      },
      {
        id: 'q12-7',
        question: '7. Across all 252 issues of "The Zero Waste Kitchen" curriculum, approximately how much net food cost reduction do disciplined commercial kitchens report within 90 days?',
        options: ['0.1% – 0.2%', '4% to 9% total food-cost percentage drop alongside 60%–85% bin weight cut', 'Cost always doubles', 'Zero financial change'],
        correctIndex: 1,
        explanation: 'Eliminating over-trimming, cold-room spoilage, and monetizing secondary trims transforms kitchen P&L rapidly.'
      },
      {
        id: 'q12-8',
        question: '8. Why must every dehydrated seasoning vial, fermented oil, and scrap cordial bottle carry a clean "Prepared Date / Batch Code / Best-By Date" label?',
        options: [
          'Traceability protects service quality, FIFO rotation, and instant regulatory verification during health inspections',
          'Tape holds glass corks from melting',
          'To hide ingredients from staff',
          'Labels add flavor moisture'
        ],
        correctIndex: 0,
        explanation: 'Clean clear station labeling guarantees every house-crafted sustainable ingredient commands executive confidence.'
      },
      {
        id: 'q12-9',
        question: '9. Which official elements certify a graduate’s completed Supritamone Academy Master Diploma certificate?',
        options: [
          'Graduate full legal name, completion date, quantified 26-hour curriculum mastery, passed overall exam score, and official Academy seal',
          'Blank unsigned postcard',
          'Unverified social media post',
          'Handwritten receipt'
        ],
        correctIndex: 0,
        explanation: 'Official diplomas reflect verified mastery across all 24 masterclass chapters and 12 comprehensive examinations.'
      },
      {
        id: 'q12-10',
        question: '10. What overall passing mark across the comprehensive course examinations unlocks your official Supritamone Academy Diploma Certificate?',
        options: ['15%', '37% or higher overall score across all course quizzes', '95%', '100% only'],
        correctIndex: 1,
        explanation: 'Passing all 12 section assessments with an overall average score of 37% or higher unlocks your official completion certificate.'
      }
    ]
  }
};
