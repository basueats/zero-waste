import { surplusRecipes } from './recipes500Data';
import { surplusByproducts } from './byproducts500Data';

export interface StudyControlParameter {
  parameter: string;
  targetRange: string;
  measurementTool: string;
  correctiveAction: string;
}

export interface StudyTheoryModule {
  heading: string;
  content: string;
  formulaTitle?: string;
  formulaEquation?: string;
  safetyNote?: string;
}

export interface ChapterFormulationCase {
  title: string;
  mainByproduct: string;
  scientificMechanism: string;
  yieldAmount: string;
  keySteps: string[];
  chefTip: string;
  image: string;
}

export interface ChapterStudyMaterial {
  issueCoverage: string;
  executiveOverview: string;
  learningObjectives: string[];
  theoryModules: StudyTheoryModule[];
  controlMatrix: StudyControlParameter[];
  sopChecklist: string[];
  featuredFormulations: ChapterFormulationCase[];
}

export interface BuiltSlideSpec {
  id: string;
  slideNumber: number;
  title: string;
  subtitle?: string;
  conceptTag: string;
  bullets: string[];
  visualImage: string;
  visualCaption: string;
  keyMetricOrFormula?: {
    label: string;
    value: string;
    subtext: string;
  };
}

export interface BuiltNarrationLine {
  timestamp: string;
  seconds: number;
  speaker: string;
  text: string;
  slideIndex: number;
}

export interface BuiltResourceItem {
  id: string;
  title: string;
  filename: string;
  size: string;
}

export interface BuiltLectureBundle {
  durationSeconds: number;
  slides: BuiltSlideSpec[];
  resources: BuiltResourceItem[];
  transcript: BuiltNarrationLine[];
  studyMaterial: ChapterStudyMaterial;
}

export interface ChapterSeedConfig {
  id: string;
  sectionNumber: number;
  chapterNumber: number; // 1..24
  title: string;
  issueRange: string;
  targetSeconds: number;
  focusKeywords: string[];
  heroImages: [string, string, string, string, string];
  executiveOverview: string;
  learningObjectives: string[];
  coreSlides: Array<{
    title: string;
    conceptTag: string;
    bullets: string[];
    visualCaption: string;
    metricLabel: string;
    metricValue: string;
    metricSubtext: string;
  }>;
  theoryModules: StudyTheoryModule[];
  controlMatrix: StudyControlParameter[];
  sopChecklist: string[];
  coreNarrationBlocks: Array<{
    slideIndex: number;
    paragraphs: string[];
  }>;
}

function formatTs(totalSecs: number): string {
  const safe = Math.max(0, Math.round(totalSecs));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function estimateLineSeconds(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(3.0, words / 2.15);
}

// Track used indices across chapters so every chapter explores unique dishes & byproducts first
const usedRecipeIndices = new Set<number>();
const usedByproductIndices = new Set<number>();

function pickChapterRecipes(keywords: string[], count: number) {
  const matches: Array<{ idx: number; item: (typeof surplusRecipes)[number] }> = [];
  const lowerKws = keywords.map((k) => k.toLowerCase());

  // Pass 1: Unused keyword matches
  for (let i = 0; i < surplusRecipes.length && matches.length < count; i++) {
    if (usedRecipeIndices.has(i)) continue;
    const r = surplusRecipes[i];
    const hay = `${r.title} ${r.category} ${r.mainByproduct} ${r.scientificNote}`.toLowerCase();
    if (lowerKws.some((k) => hay.includes(k))) {
      matches.push({ idx: i, item: r });
      usedRecipeIndices.add(i);
    }
  }

  // Pass 2: Any unused recipes in library
  for (let i = 0; i < surplusRecipes.length && matches.length < count; i++) {
    if (usedRecipeIndices.has(i)) continue;
    matches.push({ idx: i, item: surplusRecipes[i] });
    usedRecipeIndices.add(i);
  }

  // Pass 3: Deterministic wrap if entire 500 library was already walked
  let cursor = (keywords.join('').length * 17) % surplusRecipes.length;
  while (matches.length < count && surplusRecipes.length > 0) {
    matches.push({ idx: cursor, item: surplusRecipes[cursor] });
    cursor = (cursor + 7) % surplusRecipes.length;
  }

  return matches.map((m) => m.item);
}

function pickChapterByproducts(keywords: string[], count: number) {
  const matches: Array<{ idx: number; item: (typeof surplusByproducts)[number] }> = [];
  const lowerKws = keywords.map((k) => k.toLowerCase());

  for (let i = 0; i < surplusByproducts.length && matches.length < count; i++) {
    if (usedByproductIndices.has(i)) continue;
    const b = surplusByproducts[i];
    const hay = `${b.name} ${b.category} ${b.headline} ${b.scientificMechanism} ${b.potentialByproducts.join(' ')}`.toLowerCase();
    if (lowerKws.some((k) => hay.includes(k))) {
      matches.push({ idx: i, item: b });
      usedByproductIndices.add(i);
    }
  }

  for (let i = 0; i < surplusByproducts.length && matches.length < count; i++) {
    if (usedByproductIndices.has(i)) continue;
    matches.push({ idx: i, item: surplusByproducts[i] });
    usedByproductIndices.add(i);
  }

  let cursor = (keywords.join('').length * 13) % surplusByproducts.length;
  while (matches.length < count && surplusByproducts.length > 0) {
    matches.push({ idx: cursor, item: surplusByproducts[cursor] });
    cursor = (cursor + 11) % surplusByproducts.length;
  }

  return matches.map((m) => m.item);
}

export function buildExtensiveChapter(config: ChapterSeedConfig): BuiltLectureBundle {
  const chapterRecipes = pickChapterRecipes(config.focusKeywords, 42);
  const chapterByproducts = pickChapterByproducts(config.focusKeywords, 42);

  // Build 10 rich visual slides per chapter (4 core theory slides + 5 kitchen formulation lab slides + 1 wrap/HACCP slide)
  const slides: BuiltSlideSpec[] = [];

  for (let i = 0; i < 4; i++) {
    const cs = config.coreSlides[i] || config.coreSlides[0];
    slides.push({
      id: `${config.id}-slide-${i + 1}`,
      slideNumber: i + 1,
      title: cs.title,
      conceptTag: cs.conceptTag,
      bullets: cs.bullets,
      visualImage: config.heroImages[i % config.heroImages.length],
      visualCaption: cs.visualCaption,
      keyMetricOrFormula: {
        label: cs.metricLabel,
        value: cs.metricValue,
        subtext: cs.metricSubtext,
      },
    });
  }

  // Slides 5..9: Dedicated Culinary Lab Case-Studies grounded in verified recipe & byproduct photography
  for (let s = 0; s < 5; s++) {
    const r1 = chapterRecipes[s * 2] || chapterRecipes[0];
    const r2 = chapterRecipes[s * 2 + 1] || chapterRecipes[1] || r1;
    const bp = chapterByproducts[s] || chapterByproducts[0];
    slides.push({
      id: `${config.id}-slide-${5 + s}`,
      slideNumber: 5 + s,
      title: `Kitchen Lab ${s + 1}: ${bp.name.split('(')[0].trim()} & ${r1.title.replace(/^Dr\.\s*Chef\s*Basu’s\s*/i, '').slice(0, 48)}`,
      conceptTag: `Practical Protocol · ${config.issueRange}`,
      bullets: [
        `💛 [hl]Primary Biomass Stream:[/hl] ${bp.name} — ${bp.weightWasteStatistic}`,
        `💛 [hl]Harvestable Fractions:[/hl] ${bp.potentialByproducts.join(', ')}.`,
        `💛 [hl]Scientific Mechanism:[/hl] ${bp.scientificMechanism}`,
        `💛 [hl]Master Formulation 1:[/hl] ${r1.title} (Yield: ${r1.yieldAmount}, Method: ${r1.cookTime}).`,
        `💛 [hl]Secondary Sink 2:[/hl] ${r2.title} — ${r2.scientificNote}`,
      ],
      visualImage: r1.image || bp.image || config.heroImages[4],
      visualCaption: `Figure ${5 + s}: Commercial transformation of ${bp.name.split('(')[0].trim()} trims into ${r1.category} output.`,
      keyMetricOrFormula: {
        label: `Lab ${s + 1} Conversion Yield`,
        value: r1.yieldAmount,
        subtext: bp.easyTip.slice(0, 78),
      },
    });
  }

  // Slide 10: Executive HACCP, Financial ROI & Exam Readiness Wrap
  const wrapControl = config.controlMatrix[0];
  slides.push({
    id: `${config.id}-slide-10`,
    slideNumber: 10,
    title: `Station HACCP Verification, Cost Control & Quiz Readiness`,
    conceptTag: `Executive Audit Summary · Ch ${config.chapterNumber}`,
    bullets: [
      `💛 [hl]Critical Parameter Lock:[/hl] ${wrapControl ? `${wrapControl.parameter} maintained at ${wrapControl.targetRange}` : 'Maintain digital pH and thermal logs per shift.'}`,
      `💛 [hl]Standard Operating Checklist:[/hl] ${config.sopChecklist[0] || 'Tare-weigh trim bins before service handoff.'}`,
      `💛 [hl]Verification Protocol:[/hl] ${config.sopChecklist[1] || 'Label batch date, AP cost allocation, and chef initials on every vessel.'}`,
      `💛 [hl]Assessment Milestone:[/hl] Complete both chapters in Section ${config.sectionNumber}, then score ≥ 37% on the 10-question Section Exam.`,
    ],
    visualImage: config.heroImages[4] || config.heroImages[0],
    visualCaption: `Figure 10: Chapter ${config.chapterNumber} end-of-shift verification and cost variance closeout.`,
    keyMetricOrFormula: {
      label: 'Chapter Passing Threshold',
      value: '≥ 37% Quiz',
      subtext: `Complete Section ${config.sectionNumber} assessment to unlock next chapters`,
    },
  });

  // Build Extensive Spoken Script matching exact targetSeconds at 2.15 words/sec
  const rawLines: Array<{ slideIndex: number; text: string }> = [];

  const pushSentence = (slideIndex: number, text: string) => {
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (cleaned.length > 0) {
      rawLines.push({ slideIndex: Math.min(9, Math.max(0, slideIndex)), text: cleaned });
    }
  };

  // 1. Opening + Core Theory Slides (Slides 0..3)
  config.coreNarrationBlocks.forEach((block) => {
    block.paragraphs.forEach((p) => {
      pushSentence(block.slideIndex, p);
    });
  });

  // 2. Deep Theory Module Reading Walk-Throughs (Distributed across Slides 0..3)
  config.theoryModules.forEach((mod, mIdx) => {
    const sIdx = Math.min(3, mIdx);
    pushSentence(
      sIdx,
      `Let us examine ${mod.heading} in quantitative detail. ${mod.content}`
    );
    if (mod.formulaTitle && mod.formulaEquation) {
      pushSentence(
        sIdx,
        `Record the governing kitchen formula for ${mod.formulaTitle}: ${mod.formulaEquation}. ${mod.safetyNote || 'Always document baseline measurements on your station clipboard before heat or fermentation begins.'}`
      );
    }
  });

  // 3. Control Matrix Parameter Audit Walkthrough (Slide 3 & Slide 9)
  config.controlMatrix.forEach((cm, cIdx) => {
    pushSentence(
      cIdx % 2 === 0 ? 3 : 9,
      `For critical control parameter ${cm.parameter}, your culinary station must maintain ${cm.targetRange}, verified using ${cm.measurementTool}. If readings drift outside specification, immediately execute corrective action: ${cm.correctiveAction}`
    );
  });

  // 4. Deep Culinary Lab Formulations & Byproduct Seminar Walkthroughs (Slides 4..8)
  // Keep adding rich unique recipe + byproduct seminar segments until spoken duration matches config.targetSeconds
  let accumulatedSecs = rawLines.reduce((sum, l) => sum + estimateLineSeconds(l.text), 0);
  const maxPairs = Math.max(chapterRecipes.length, chapterByproducts.length);

  for (let k = 0; k < maxPairs && accumulatedSecs < config.targetSeconds - 180; k++) {
    const slideIdx = 4 + (k % 5); // Cycles cleanly across Slides 5..9 (0-indexed 4..8)
    const bp = chapterByproducts[k % chapterByproducts.length];
    const rec = chapterRecipes[k % chapterRecipes.length];

    const ingList = rec.ingredients
      .slice(0, 4)
      .map((ing) => `${ing.amount} of ${ing.item}`)
      .join(', ');

    const bpIntro = `In culinary lab case study number ${k + 1}, we evaluate ${bp.name}. ${bp.weightWasteStatistic} Instead of discarding ${bp.potentialByproducts.join(', ')}, remember the core mechanism: ${bp.scientificMechanism} As an immediate brigade application, ${bp.easyTip}`;
    pushSentence(slideIdx, bpIntro);
    accumulatedSecs += estimateLineSeconds(bpIntro);
    if (accumulatedSecs >= config.targetSeconds - 160) break;

    const recIntro = `Applying this principle directly on the line, prepare ${rec.title} under category ${rec.category}. Assemble your mise-en-place with ${ingList}, targeting a full batch yield of ${rec.yieldAmount} in ${rec.prepTime} active preparation and ${rec.cookTime} processing.`;
    pushSentence(slideIdx, recIntro);
    accumulatedSecs += estimateLineSeconds(recIntro);
    if (accumulatedSecs >= config.targetSeconds - 140) break;

    for (let stIdx = 0; stIdx < rec.method.length && accumulatedSecs < config.targetSeconds - 110; stIdx++) {
      const stepText = `Production step ${rec.method[stIdx]}`;
      pushSentence(slideIdx, stepText);
      accumulatedSecs += estimateLineSeconds(stepText);
    }

    if (accumulatedSecs < config.targetSeconds - 90) {
      const chefLine = `${rec.chefTips} Biochemically verify why this holds together: ${rec.scientificNote} Record recovered trim weight into the daily station tare sheet at the close of shift.`;
      pushSentence(slideIdx, chefLine);
      accumulatedSecs += estimateLineSeconds(chefLine);
    }

    if (accumulatedSecs < config.targetSeconds - 75 && bp.culinaryApplications.length > 0) {
      const appLine = `Beyond the primary dish, deploy these four secondary sinks for ${bp.name.split('(')[0].trim()}: ${bp.culinaryApplications.join('. ')}.`;
      pushSentence(slideIdx, appLine);
      accumulatedSecs += estimateLineSeconds(appLine);
    }
  }

  // 5. SOP Checklist & Closing Synthesis (Slide 9)
  for (let sIdx = 0; sIdx < config.sopChecklist.length && accumulatedSecs < config.targetSeconds - 22; sIdx++) {
    const line = `Standard operating procedure checkpoint ${sIdx + 1} for ${config.title}: ${config.sopChecklist[sIdx]}`;
    pushSentence(9, line);
    accumulatedSecs += estimateLineSeconds(line);
  }

  // Fine-tune exact closing remarks so final sum aligns accurately to targetSeconds
  const closingBlocks = [
    `Before wrapping Chapter ${config.chapterNumber}, review every numerical benchmark inside the Study Guide tab below the video canvas, including critical temperatures, brine concentrations, and mass-balance yield equations.`,
    `Print or download the complete station manual from the resources menu so your brigade can cross-check tare weights, enzymatic holding ranges, and label timestamps during peak service.`,
    `Make sure both chapters in Section ${config.sectionNumber} are reviewed in full, then launch the ten-question Section Assessment quiz where thirty-seven percent or higher unlocks the next stage of your diploma journey.`,
  ];
  for (const cb of closingBlocks) {
    pushSentence(9, cb);
    accumulatedSecs += estimateLineSeconds(cb);
  }

  // Normalize exact cumulative timestamps so transcript end aligns seamlessly with exact durationSeconds
  const rawTotal = Math.max(1, accumulatedSecs);
  const scaleFactor = config.targetSeconds / rawTotal;
  const transcript: BuiltNarrationLine[] = [];
  let cursor = 0;

  for (let i = 0; i < rawLines.length; i++) {
    const l = rawLines[i];
    const lineDur = estimateLineSeconds(l.text) * scaleFactor;
    transcript.push({
      timestamp: formatTs(cursor),
      seconds: Math.round(cursor),
      speaker: 'Dr. Chef Supritam Basu',
      text: l.text,
      slideIndex: l.slideIndex,
    });
    cursor += lineDur;
  }

  // Resources for this chapter
  const slug = config.id.replace(/[^a-z0-9]+/gi, '_');
  const resources: BuiltResourceItem[] = [
    {
      id: `${config.id}-res-1`,
      title: `Chapter ${config.chapterNumber} Master Study Manual & Field SOPs (${config.issueRange}).pdf`,
      filename: `Ch${config.chapterNumber}_${slug}_Study_Manual.pdf`,
      size: '2.45 MB',
    },
    {
      id: `${config.id}-res-2`,
      title: `Chapter ${config.chapterNumber} Station Control Log & Formula Worksheet.xlsx`,
      filename: `Ch${config.chapterNumber}_Station_Control_Log.xlsx`,
      size: '1.18 MB',
    },
    {
      id: `${config.id}-res-3`,
      title: `Chapter ${config.chapterNumber} Worked Byproduct Formulations Pack.pdf`,
      filename: `Ch${config.chapterNumber}_ZeroWaste_Formulations.pdf`,
      size: '1.84 MB',
    },
  ];

  // Study Material object
  const studyMaterial: ChapterStudyMaterial = {
    issueCoverage: config.issueRange,
    executiveOverview: config.executiveOverview,
    learningObjectives: config.learningObjectives,
    theoryModules: config.theoryModules,
    controlMatrix: config.controlMatrix,
    sopChecklist: config.sopChecklist,
    featuredFormulations: chapterRecipes.slice(0, 6).map((r) => ({
      title: r.title,
      mainByproduct: r.mainByproduct,
      scientificMechanism: r.scientificNote,
      yieldAmount: r.yieldAmount,
      keySteps: r.method,
      chefTip: r.chefTips,
      image: r.image,
    })),
  };

  return {
    durationSeconds: config.targetSeconds,
    slides,
    resources,
    transcript,
    studyMaterial,
  };
}
