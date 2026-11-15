export interface LectureResumeBookmark {
  sectionIdx: number;
  lectureIdx: number;
  lectureId: string;
  lectureTitle: string;
  sectionTitle: string;
  sentenceIdx: number;
  elapsedInSentence: number;
  currentTimeSeconds: number;
  totalDurationSeconds: number;
  updatedAt: number;
}

export interface InteractiveVideoBookmark {
  sentenceIdx: number;
  elapsedInSentence: number;
  currentTimeSeconds: number;
  updatedAt: number;
}

export interface CourseResumeSession {
  courseId: string;
  wasOpenInPlayer: boolean;
  isQuizMode: boolean;
  activeSectionIdx: number;
  activeLectureIdx: number;
  activeLectureId: string;
  autoResumeEnabled: boolean;
  lectures: Record<string, LectureResumeBookmark>;
  interactiveVideos: Record<string, InteractiveVideoBookmark>;
  updatedAt: number;
}

const STORAGE_PREFIX = 'supritamone_course_resume_v1::';
const LAST_USER_KEY = 'supritamone_course_resume_last_user_v1';

function normalizeEmailKey(email?: string | null): string {
  const clean = (email || '').trim().toLowerCase();
  if (clean) return clean;
  if (typeof window !== 'undefined') {
    try {
      const remembered = localStorage.getItem(LAST_USER_KEY);
      if (remembered) return remembered.trim().toLowerCase();
    } catch {
      // Ignore
    }
  }
  return 'default_member';
}

function defaultSession(): CourseResumeSession {
  return {
    courseId: 'food-waste-prevention-chefs',
    wasOpenInPlayer: false,
    isQuizMode: false,
    activeSectionIdx: 0,
    activeLectureIdx: 0,
    activeLectureId: '',
    autoResumeEnabled: true,
    lectures: {},
    interactiveVideos: {},
    updatedAt: 0,
  };
}

export function loadCourseResumeSession(userEmail?: string | null): CourseResumeSession {
  if (typeof window === 'undefined') return defaultSession();
  const key = normalizeEmailKey(userEmail);
  try {
    const raw =
      localStorage.getItem(`${STORAGE_PREFIX}${key}`) ||
      localStorage.getItem(`${STORAGE_PREFIX}default_member`);
    if (!raw) return defaultSession();
    const parsed = JSON.parse(raw) as Partial<CourseResumeSession>;
    return {
      ...defaultSession(),
      ...parsed,
      lectures: parsed.lectures && typeof parsed.lectures === 'object' ? parsed.lectures : {},
      interactiveVideos:
        parsed.interactiveVideos && typeof parsed.interactiveVideos === 'object'
          ? parsed.interactiveVideos
          : {},
      autoResumeEnabled:
        typeof parsed.autoResumeEnabled === 'boolean' ? parsed.autoResumeEnabled : true,
    };
  } catch {
    return defaultSession();
  }
}

export function saveCourseResumeSession(
  userEmail: string | null | undefined,
  updater: (prev: CourseResumeSession) => CourseResumeSession
): CourseResumeSession {
  const prev = loadCourseResumeSession(userEmail);
  const next = updater(prev);
  if (typeof window !== 'undefined') {
    const key = normalizeEmailKey(userEmail);
    try {
      if (userEmail && userEmail.trim()) {
        localStorage.setItem(LAST_USER_KEY, key);
      }
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  }
  return next;
}

export function saveLectureProgress(
  userEmail: string | null | undefined,
  bookmark: LectureResumeBookmark & {
    courseId?: string;
    isQuizMode?: boolean;
    wasOpenInPlayer?: boolean;
  }
): void {
  saveCourseResumeSession(userEmail, (prev) => ({
    ...prev,
    courseId: bookmark.courseId || prev.courseId || 'food-waste-prevention-chefs',
    wasOpenInPlayer:
      typeof bookmark.wasOpenInPlayer === 'boolean' ? bookmark.wasOpenInPlayer : prev.wasOpenInPlayer,
    isQuizMode: typeof bookmark.isQuizMode === 'boolean' ? bookmark.isQuizMode : prev.isQuizMode,
    activeSectionIdx: bookmark.sectionIdx,
    activeLectureIdx: bookmark.lectureIdx,
    activeLectureId: bookmark.lectureId,
    updatedAt: bookmark.updatedAt || Date.now(),
    lectures: {
      ...prev.lectures,
      [bookmark.lectureId]: {
        sectionIdx: bookmark.sectionIdx,
        lectureIdx: bookmark.lectureIdx,
        lectureId: bookmark.lectureId,
        lectureTitle: bookmark.lectureTitle,
        sectionTitle: bookmark.sectionTitle,
        sentenceIdx: bookmark.sentenceIdx,
        elapsedInSentence: bookmark.elapsedInSentence,
        currentTimeSeconds: bookmark.currentTimeSeconds,
        totalDurationSeconds: bookmark.totalDurationSeconds,
        updatedAt: bookmark.updatedAt || Date.now(),
      },
    },
  }));
}

export function markPlayerOpenState(
  userEmail: string | null | undefined,
  courseId: string,
  wasOpenInPlayer: boolean
): void {
  saveCourseResumeSession(userEmail, (prev) => ({
    ...prev,
    courseId: courseId || prev.courseId,
    wasOpenInPlayer,
    updatedAt: Date.now(),
  }));
}

export function setAutoResumePreference(
  userEmail: string | null | undefined,
  enabled: boolean
): void {
  saveCourseResumeSession(userEmail, (prev) => ({
    ...prev,
    autoResumeEnabled: enabled,
    updatedAt: Date.now(),
  }));
}

export function getActiveResumeBookmark(userEmail?: string | null): {
  session: CourseResumeSession;
  bookmark: LectureResumeBookmark | null;
} {
  const session = loadCourseResumeSession(userEmail);
  const direct = session.activeLectureId ? session.lectures[session.activeLectureId] : undefined;
  if (direct && direct.currentTimeSeconds > 0) {
    return { session, bookmark: direct };
  }
  const all = Object.values(session.lectures).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  return { session, bookmark: all[0] || null };
}

export function saveInteractiveVideoProgress(
  videoId: string,
  data: InteractiveVideoBookmark,
  userEmail?: string | null
): void {
  if (!videoId) return;
  saveCourseResumeSession(userEmail, (prev) => ({
    ...prev,
    interactiveVideos: {
      ...prev.interactiveVideos,
      [videoId]: data,
    },
  }));
}

export function loadInteractiveVideoProgress(
  videoId: string,
  userEmail?: string | null
): InteractiveVideoBookmark | null {
  if (!videoId) return null;
  const session = loadCourseResumeSession(userEmail);
  return session.interactiveVideos[videoId] || null;
}
