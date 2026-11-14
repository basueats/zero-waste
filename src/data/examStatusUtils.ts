export const COURSE_TOTAL_VIDEO_LABEL = '26h 00m';
export const OVERALL_EXAM_PASSING_PERCENT = 37;
export const SUPRITAMONE_EXAM_PROGRESS_KEY = 'supritamone_exam_progress_v1';

const SECTION_QUIZ_IDS = [
  'quiz-1',
  'quiz-2',
  'quiz-3',
  'quiz-4',
  'quiz-5',
  'quiz-6',
  'quiz-7',
  'quiz-8',
  'quiz-9',
  'quiz-10',
  'quiz-11',
  'quiz-12',
] as const;

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
  const totalQuizzes = SECTION_QUIZ_IDS.length;

  let passedCount = 0;
  let attemptedCount = 0;
  let sumScores = 0;

  for (const qId of SECTION_QUIZ_IDS) {
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
