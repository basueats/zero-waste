import {
  buildExtensiveChapter,
  ChapterStudyMaterial,
} from './extensiveCurriculumBuilder';
import { SECTION_SEEDS_PART_1 } from './curriculumSeedsPart1';
import { SECTION_SEEDS_PART_2 } from './curriculumSeedsPart2';
import {
  SECTION_QUIZZES,
  QuizQuestion,
  SectionQuiz,
} from './sectionQuizBank';

export type { QuizQuestion, SectionQuiz, ChapterStudyMaterial };

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
  slideIndex?: number;
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
  studyMaterial: ChapterStudyMaterial;
}

export interface UdemyCourseSection {
  id: string;
  sectionNumber: number;
  title: string;
  subtitle: string;
  durationLabel: string;
  lectures: CourseLectureItem[]; // Strictly 2 chapters per section
  quiz: SectionQuiz; // 10 quiz questions, 37% pass mark
}

export function formatClockDuration(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const rem = safe % 60;
  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${rem < 10 ? '0' : ''}${rem}`;
  }
  return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
}

export function formatCompactDuration(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const rem = safe % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins < 10 ? '0' : ''}${mins}m`;
  }
  if (mins === 0) return `${rem}s`;
  if (rem === 0) return `${mins}m`;
  return `${mins}m ${rem < 10 ? '0' : ''}${rem}s`;
}

const ALL_SECTION_SEEDS = [...SECTION_SEEDS_PART_1, ...SECTION_SEEDS_PART_2].sort(
  (a, b) => a.sectionNumber - b.sectionNumber
);

export const UDEMY_ZERO_WASTE_SECTIONS: UdemyCourseSection[] = ALL_SECTION_SEEDS.map(
  (secSeed) => {
    const builtLectures: CourseLectureItem[] = secSeed.chapters.map(
      (chapSeed, lecIdx) => {
        const bundle = buildExtensiveChapter(chapSeed);
        return {
          id: chapSeed.id,
          lectureNumber: lecIdx + 1,
          globalChapterNumber: chapSeed.chapterNumber,
          title: chapSeed.title,
          duration: formatClockDuration(bundle.durationSeconds),
          durationSeconds: bundle.durationSeconds,
          slides: bundle.slides,
          resources: bundle.resources,
          transcript: bundle.transcript,
          studyMaterial: bundle.studyMaterial,
        };
      }
    );

    const sectionSeconds = builtLectures.reduce(
      (sum, lec) => sum + lec.durationSeconds,
      0
    );

    const fallbackQuiz: SectionQuiz = {
      id: `quiz-${secSeed.sectionNumber}`,
      quizNumber: secSeed.sectionNumber,
      title: `Quiz ${secSeed.sectionNumber}: Section ${secSeed.sectionNumber} Comprehensive Assessment (10 Questions)`,
      passingScorePercent: 37,
      questions: [],
    };

    return {
      id: secSeed.id,
      sectionNumber: secSeed.sectionNumber,
      title: secSeed.title,
      subtitle: secSeed.subtitle,
      durationLabel: formatCompactDuration(sectionSeconds),
      lectures: builtLectures,
      quiz: SECTION_QUIZZES[secSeed.sectionNumber] || fallbackQuiz,
    };
  }
);

export const COURSE_TOTAL_CHAPTERS = UDEMY_ZERO_WASTE_SECTIONS.reduce(
  (sum, sec) => sum + sec.lectures.length,
  0
);

export const COURSE_TOTAL_QUIZZES = UDEMY_ZERO_WASTE_SECTIONS.length;

export const COURSE_TOTAL_QUESTIONS = UDEMY_ZERO_WASTE_SECTIONS.reduce(
  (sum, sec) => sum + sec.quiz.questions.length,
  0
);

export const COURSE_TOTAL_VIDEO_SECONDS = UDEMY_ZERO_WASTE_SECTIONS.reduce(
  (sum, sec) => sum + sec.lectures.reduce((s, lec) => s + lec.durationSeconds, 0),
  0
);

export const COURSE_TOTAL_VIDEO_LABEL = formatCompactDuration(COURSE_TOTAL_VIDEO_SECONDS);

export const OVERALL_EXAM_PASSING_PERCENT = 37;
export const SUPRITAMONE_EXAM_PROGRESS_KEY = 'supritamone_exam_progress_v1';

export interface StoredExamProgress {
  completedLectures: string[];
  passedQuizzes: string[];
  quizScores: Record<string, number>;
}

export interface ExamUnlockStatus {
  passedCount: number;
  totalQuizzes: number;
  attemptedCount: number;
  overallScorePercent: number;
  passingPercent: number;
  isUnlocked: boolean;
}

export function computeExamUnlockStatus(
  passedQuizzes: Set<string> | string[],
  quizScores: Record<string, number>
): ExamUnlockStatus {
  const passedSet = passedQuizzes instanceof Set ? passedQuizzes : new Set(passedQuizzes);
  const totalQuizzes = UDEMY_ZERO_WASTE_SECTIONS.length;

  let passedCount = 0;
  let attemptedCount = 0;
  let sumScores = 0;

  for (const sec of UDEMY_ZERO_WASTE_SECTIONS) {
    const qId = sec.quiz.id;
    const score = quizScores[qId];
    if (typeof score === 'number') {
      attemptedCount++;
      sumScores += score;
    }
    if (passedSet.has(qId) && (typeof score !== 'number' || score >= OVERALL_EXAM_PASSING_PERCENT)) {
      passedCount++;
    }
  }

  const overallScorePercent = Math.round(sumScores / Math.max(1, totalQuizzes));
  const isUnlocked =
    passedCount === totalQuizzes && overallScorePercent >= OVERALL_EXAM_PASSING_PERCENT;

  return {
    passedCount,
    totalQuizzes,
    attemptedCount,
    overallScorePercent,
    passingPercent: OVERALL_EXAM_PASSING_PERCENT,
    isUnlocked,
  };
}

export function loadStoredExamProgress(): StoredExamProgress {
  const fallback: StoredExamProgress = {
    completedLectures: [],
    passedQuizzes: [],
    quizScores: {},
  };
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(SUPRITAMONE_EXAM_PROGRESS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      completedLectures: Array.isArray(parsed?.completedLectures) ? parsed.completedLectures : [],
      passedQuizzes: Array.isArray(parsed?.passedQuizzes) ? parsed.passedQuizzes : [],
      quizScores: parsed?.quizScores && typeof parsed.quizScores === 'object' ? parsed.quizScores : {},
    };
  } catch {
    return fallback;
  }
}
