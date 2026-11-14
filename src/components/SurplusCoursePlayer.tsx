import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
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
  RotateCw,
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
  Mic,
  MoreVertical,
  Maximize2,
  Minimize2,
  Subtitles,
  Settings,
  X,
  Lock,
  Search,
  Star,
  FolderOpen,
  Calendar,
  UserCheck,
  Edit3,
  Trash2,
  CheckSquare,
  Square,
  FlaskConical
} from 'lucide-react';
import { 
  UDEMY_ZERO_WASTE_SECTIONS, 
  UdemyCourseSection, 
  CourseLectureItem, 
  SectionQuiz,
  PresentationSlide,
  COURSE_TOTAL_VIDEO_SECONDS,
  COURSE_TOTAL_CHAPTERS,
  COURSE_TOTAL_QUIZZES,
  COURSE_TOTAL_QUESTIONS,
  ExamUnlockStatus,
  SUPRITAMONE_EXAM_PROGRESS_KEY,
  computeExamUnlockStatus,
  formatClockDuration,
  formatCompactDuration,
  loadStoredExamProgress
} from '../data/udemyCourseStructure';
import { audioNarrator, tokenizeTextIntoWords } from '../utils/audioNarrator';
import { SupritamoneLogo } from './SupritamoneLogo';
import iso9001Logo from '../assets/images/iso_9001_certified.png';

interface SurplusCoursePlayerProps {
  courseId: string;
  initialSectionIndex?: number;
  learnerName?: string;
  onBackToCourses: () => void;
  onGoHome?: () => void;
  onOpenCertify: () => void;
  onExamStatusChange?: (status: ExamUnlockStatus) => void;
}

interface UserNote {
  id: string;
  timestampSeconds: number;
  timestampFormatted: string;
  lectureId: string;
  lectureTitle: string;
  content: string;
  createdAt: string;
}

export const SurplusCoursePlayer: React.FC<SurplusCoursePlayerProps> = ({
  courseId,
  initialSectionIndex = 0,
  onBackToCourses,
  onGoHome,
  onOpenCertify,
  onExamStatusChange,
}) => {
  // Navigation & Selection state
  const [activeSectionIdx, setActiveSectionIdx] = useState<number>(initialSectionIndex);
  const [activeLectureIdx, setActiveLectureIdx] = useState<number>(0);
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'study' | 'qa' | 'notes' | 'announcements' | 'reviews' | 'search' | 'tools'>('overview');
  const [sidebarTab, setSidebarTab] = useState<'content' | 'ai'>('content');
  const [checkedSops, setCheckedSops] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem('supritamone_sop_checklist_v1');
      if (saved) return new Set(JSON.parse(saved));
    } catch {
      // Ignore storage error
    }
    return new Set();
  });

  const toggleSopCheck = (sopKey: string) => {
    audioNarrator.playSound('click');
    setCheckedSops(prev => {
      const next = new Set(prev);
      if (next.has(sopKey)) {
        next.delete(sopKey);
      } else {
        next.add(sopKey);
        audioNarrator.playSound('correct');
      }
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('supritamone_sop_checklist_v1', JSON.stringify(Array.from(next)));
        } catch {
          // Ignore storage error
        }
      }
      return next;
    });
  };

  // Completed items & exam scores tracking (persisted in localStorage)
  const [completedLectures, setCompletedLectures] = useState<Set<string>>(() => {
    const stored = loadStoredExamProgress();
    return new Set(stored.completedLectures);
  });
  const [passedQuizzes, setPassedQuizzes] = useState<Set<string>>(() => {
    const stored = loadStoredExamProgress();
    return new Set(stored.passedQuizzes);
  });
  const [quizScores, setQuizScores] = useState<Record<string, number>>(() => {
    const stored = loadStoredExamProgress();
    return stored.quizScores;
  });

  const examStatus = useMemo(
    () => computeExamUnlockStatus(passedQuizzes, quizScores),
    [passedQuizzes, quizScores]
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          SUPRITAMONE_EXAM_PROGRESS_KEY,
          JSON.stringify({
            completedLectures: Array.from(completedLectures),
            passedQuizzes: Array.from(passedQuizzes),
            quizScores,
          })
        );
      } catch {
        // Ignore storage errors
      }
    }
    onExamStatusChange?.(examStatus);
  }, [completedLectures, passedQuizzes, quizScores, examStatus, onExamStatusChange]);

  // Video playback state (100% audio-driven live sync)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState<number>(0);
  const [sentenceElapsed, setSentenceElapsed] = useState<number>(0);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(-1);
  const [durationsVersion, setDurationsVersion] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    try {
      const saved = JSON.parse(localStorage.getItem('supritamone_player_prefs_v1') || '{}');
      return typeof saved.playbackSpeed === 'number' ? saved.playbackSpeed : 1;
    } catch {
      return 1;
    }
  });
  const [volume, setVolume] = useState<number>(() => {
    if (typeof window === 'undefined') return 0.9;
    try {
      const saved = JSON.parse(localStorage.getItem('supritamone_player_prefs_v1') || '{}');
      return typeof saved.volume === 'number' ? saved.volume : 0.9;
    } catch {
      return 0.9;
    }
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showCaptions, setShowCaptions] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const saved = JSON.parse(localStorage.getItem('supritamone_player_prefs_v1') || '{}');
      return typeof saved.showCaptions === 'boolean' ? saved.showCaptions : true;
    } catch {
      return true;
    }
  });
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);
  const [autoplayNext, setAutoplayNext] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const saved = JSON.parse(localStorage.getItem('supritamone_player_prefs_v1') || '{}');
      return typeof saved.autoplayNext === 'boolean' ? saved.autoplayNext : true;
    } catch {
      return true;
    }
  });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showProgressMenu, setShowProgressMenu] = useState<boolean>(false);

  // Sync audio rate, volume & caption settings across tabs/reloads automatically
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        'supritamone_player_prefs_v1',
        JSON.stringify({ playbackSpeed, volume, showCaptions, autoplayNext })
      );
    } catch {
      // Ignore storage errors
    }
  }, [playbackSpeed, volume, showCaptions, autoplayNext]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorageSync = (e: StorageEvent) => {
      if (e.key === 'supritamone_player_prefs_v1' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (typeof parsed.playbackSpeed === 'number') {
            setPlaybackSpeed(parsed.playbackSpeed);
            audioNarrator.setRate(parsed.playbackSpeed);
          }
          if (typeof parsed.volume === 'number') {
            setVolume(parsed.volume);
            audioNarrator.setVolume(parsed.volume);
          }
          if (typeof parsed.showCaptions === 'boolean') setShowCaptions(parsed.showCaptions);
          if (typeof parsed.autoplayNext === 'boolean') setAutoplayNext(parsed.autoplayNext);
        } catch {
          // Ignore malformed JSON
        }
      }
    };
    window.addEventListener('storage', onStorageSync);
    return () => window.removeEventListener('storage', onStorageSync);
  }, []);
  const [openResourceMenuId, setOpenResourceMenuId] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    UDEMY_ZERO_WASTE_SECTIONS.forEach((sec, idx) => {
      initial[sec.id] = idx === (initialSectionIndex || 0);
    });
    return initial;
  });

  // Schedule learning time card state
  const [showScheduleCard, setShowScheduleCard] = useState<boolean>(true);
  const [isConfiguringSchedule, setIsConfiguringSchedule] = useState<boolean>(false);
  const [studyGoalMinutes, setStudyGoalMinutes] = useState<number>(20);
  const [studyFrequency, setStudyFrequency] = useState<'Daily' | 'Weekdays' | 'Weekends'>('Daily');
  const [scheduleSavedToast, setScheduleSavedToast] = useState<boolean>(false);

  // Course search & Q&A state
  const [courseSearchQuery, setCourseSearchQuery] = useState<string>('');
  const [qaSearchQuery, setQaSearchQuery] = useState<string>('');
  const [isComposingQa, setIsComposingQa] = useState<boolean>(false);
  const [newQaQuestion, setNewQaQuestion] = useState<string>('');
  const [qaItems, setQaItems] = useState<Array<{ id: string; question: string; author: string; answer: string }>>([
    {
      id: 'qa-1',
      question: 'How long can wild lacto-fermented vegetable trimmings be safely held in walk-in cold rooms?',
      author: 'Dr. Chef Supritam Basu',
      answer: 'Once the pH drops below 4.6 and bubbling stabilizes, sealed crocks at 2°C–4°C hold prime crunch and acidity for 6 to 9 months.',
    },
    {
      id: 'qa-2',
      question: 'What tare-weight precision scale do you recommend for prep stations?',
      author: 'Dr. Chef Supritam Basu',
      answer: 'Use a waterproof stainless NSF digital scale accurate to 1g (0.05 oz) up to 15 kg, paired with color-coded GN 1/3 trim inserts.',
    },
  ]);

  // AI Assistant sidebar state
  const [aiQuestion, setAiQuestion] = useState<string>('');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);

  const videoContainerRef = useRef<HTMLDivElement | null>(null);

  // Quiz execution state
  const [currentQuizQuestionIdx, setCurrentQuizQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizResultScore, setQuizResultScore] = useState<number | null>(null);

  // Notes state (matches Image 6)
  const [notesList, setNotesList] = useState<UserNote[]>([
    {
      id: 'note-1',
      timestampSeconds: 22,
      timestampFormatted: '0:22',
      lectureId: 'sec1-lec1',
      lectureTitle: '1. Workplace Waste Auditing: Tare-Weight Checklist (10 Tools)',
      content: 'Remember the Five P\'s: Purpose, Product, Participants, Problems, and Process. Critical for annual brigade audit.',
      createdAt: 'Today, 2:15 PM'
    }
  ]);
  const [newNoteContent, setNewNoteContent] = useState<string>('');
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);

  // Share & Notification toast
  const [showShareToast, setShowShareToast] = useState<boolean>(false);

  // Current active data pointers
  const currentSection = UDEMY_ZERO_WASTE_SECTIONS[activeSectionIdx] || UDEMY_ZERO_WASTE_SECTIONS[0];
  const currentLecture = currentSection.lectures[activeLectureIdx] || currentSection.lectures[0];
  const currentQuiz = currentSection.quiz;
  const currentSlide = currentLecture.slides[currentSlideIdx] || currentLecture.slides[0];
  const currentTranscript = currentLecture.transcript || [];
  const currentCaption = currentTranscript[activeSentenceIdx] || currentTranscript[0];

  // Subscribe to actual decoded WAV durations so scrubber & timeline match real audio length
  useEffect(() => {
    return audioNarrator.onDurationsUpdated(() => {
      setDurationsVersion(v => v + 1);
    });
  }, []);

  // Exact WAV timings when lecture audio is loaded, otherwise estimated 1.0x durations
  const lectureTimingsData = useMemo(() => {
    const texts = currentTranscript.map(t => t.text);
    return audioNarrator.getLectureTimings(texts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTranscript, durationsVersion]);

  const sentenceDurations = useMemo(() => {
    if (lectureTimingsData && lectureTimingsData.sentenceTimings.length === currentTranscript.length) {
      return lectureTimingsData.sentenceTimings.map(t => Math.max(0.3, t.end - t.start));
    }
    const raw = currentTranscript.map(line => audioNarrator.estimateDuration(line.text, 1.0));
    const rawSum = raw.reduce((a, b) => a + b, 0);
    if (rawSum > 0 && currentLecture.durationSeconds > 0) {
      const ratio = currentLecture.durationSeconds / rawSum;
      return raw.map(d => d * ratio);
    }
    return raw;
  }, [currentTranscript, lectureTimingsData, currentLecture.durationSeconds]);

  const sentenceStartTimes = useMemo(() => {
    if (lectureTimingsData && lectureTimingsData.sentenceTimings.length === currentTranscript.length) {
      return lectureTimingsData.sentenceTimings.map(t => t.start);
    }
    const starts: number[] = [];
    let acc = 0;
    for (const d of sentenceDurations) {
      starts.push(acc);
      acc += d;
    }
    return starts;
  }, [sentenceDurations, lectureTimingsData, currentTranscript.length]);

  const totalDurationSeconds = useMemo(() => {
    if (lectureTimingsData && lectureTimingsData.duration > 0) {
      return lectureTimingsData.duration;
    }
    const sum = sentenceDurations.reduce((a, b) => a + b, 0);
    return Math.max(1, sum);
  }, [sentenceDurations, lectureTimingsData]);

  // Memoized lecture duration map synced cleanly across sidebar, overview bar, and player
  const lectureSecondsById = useMemo(() => {
    const map: Record<string, number> = {};
    for (const sec of UDEMY_ZERO_WASTE_SECTIONS) {
      for (const lec of sec.lectures) {
        if (lec.id === currentLecture.id && lectureTimingsData && lectureTimingsData.duration > 0) {
          map[lec.id] = Math.round(lectureTimingsData.duration);
        } else {
          map[lec.id] = lec.durationSeconds;
        }
      }
    }
    return map;
  }, [currentLecture.id, lectureTimingsData, durationsVersion]);

  const getExactLectureSeconds = useCallback((lecture: CourseLectureItem) => {
    return lectureSecondsById[lecture.id] ?? lecture.durationSeconds;
  }, [lectureSecondsById]);

  const courseTotalVideoSeconds = useMemo(() => {
    return UDEMY_ZERO_WASTE_SECTIONS.reduce(
      (sum, sec) => sum + sec.lectures.reduce((s, l) => s + getExactLectureSeconds(l), 0),
      0
    ) || COURSE_TOTAL_VIDEO_SECONDS;
  }, [getExactLectureSeconds]);

  const courseTotalVideoLabel = formatCompactDuration(courseTotalVideoSeconds);

  const currentTimeSeconds = Math.min(
    totalDurationSeconds,
    (sentenceStartTimes[activeSentenceIdx] || 0) + sentenceElapsed
  );

  // Refs for fresh state inside async audio callbacks (prevents stale closures on long chapters)
  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;
  const isMutedRef = useRef<boolean>(isMuted);
  isMutedRef.current = isMuted;
  const playbackSpeedRef = useRef<number>(playbackSpeed);
  playbackSpeedRef.current = playbackSpeed;
  const volumeRef = useRef<number>(volume);
  volumeRef.current = volume;
  const currentLectureRef = useRef<CourseLectureItem>(currentLecture);
  currentLectureRef.current = currentLecture;

  // Pre-synthesize & cache Chunk 0 of the active lecture on idle load
  useEffect(() => {
    if (!isQuizMode && currentTranscript.length > 0) {
      audioNarrator.prefetchLecture(currentTranscript.map(t => t.text));
    }
  }, [currentLecture.id, isQuizMode, currentTranscript]);

  // Clean stop on unmount
  useEffect(() => {
    return () => {
      audioNarrator.stop();
    };
  }, []);

  // Toggle Section in accordion
  const toggleSectionAccordion = (secId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [secId]: !prev[secId]
    }));
  };

  // Format seconds H:MM:SS or M:SS
  const formatSeconds = (secs: number) => formatClockDuration(secs);

  // Fullscreen state sync (handles both native Fullscreen API & CSS fallback inside iframes)
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      } else {
        setIsFullscreen(true);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen && !document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isFullscreen]);

  const handleToggleFullscreen = async () => {
    audioNarrator.playSound('click');
    const el = videoContainerRef.current;
    if (!isFullscreen) {
      try {
        if (el && el.requestFullscreen) {
          await el.requestFullscreen();
          setIsFullscreen(true);
          return;
        }
      } catch {
        // Iframe may disallow native fullscreen; fall back to theater fullscreen
      }
      setIsFullscreen(true);
    } else {
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } catch {
        // Ignore
      }
      setIsFullscreen(false);
    }
  };

  // Resolve exact slide index for a given sentence
  const resolveSlideForSentence = useCallback((lecture: CourseLectureItem, transcriptIdx: number) => {
    const lines = lecture.transcript || [];
    const line = lines[transcriptIdx];
    if (line && typeof line.slideIndex === 'number') {
      return Math.min(lecture.slides.length - 1, Math.max(0, line.slideIndex));
    }
    return Math.min(
      lecture.slides.length - 1,
      Math.floor((transcriptIdx / Math.max(1, lines.length)) * lecture.slides.length)
    );
  }, []);

  const autoplayNextRef = useRef<boolean>(autoplayNext);
  autoplayNextRef.current = autoplayNext;
  const activeSectionIdxRef = useRef<number>(activeSectionIdx);
  activeSectionIdxRef.current = activeSectionIdx;
  const activeLectureIdxRef = useRef<number>(activeLectureIdx);
  activeLectureIdxRef.current = activeLectureIdx;

  const sentenceStartTimesRef = useRef<number[]>(sentenceStartTimes);
  sentenceStartTimesRef.current = sentenceStartTimes;

  // Start continuous unified lecture voice + live word & slide sync from any sentence/timestamp
  const playSentence = useCallback((index: number, explicitStartSeconds?: number) => {
    const lecture = currentLectureRef.current;
    const lines = lecture.transcript || [];

    if (index >= lines.length) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      audioNarrator.stop();
      audioNarrator.playSound('correct');
      setCompletedLectures(old => new Set([...old, lecture.id]));

      // Autoplay next lecture within the same section if enabled
      if (autoplayNextRef.current) {
        const sec = UDEMY_ZERO_WASTE_SECTIONS[activeSectionIdxRef.current];
        const nextLecIdx = activeLectureIdxRef.current + 1;
        if (sec && nextLecIdx < sec.lectures.length) {
          const nextLecture = sec.lectures[nextLecIdx];
          setTimeout(() => {
            currentLectureRef.current = nextLecture;
            setActiveLectureIdx(nextLecIdx);
            setCurrentSlideIdx(0);
            setActiveSentenceIdx(0);
            setSentenceElapsed(0);
            setActiveWordIndex(-1);
            setIsPlaying(true);
            isPlayingRef.current = true;
            playSentence(0, 0);
          }, 500);
        }
      }
      return;
    }

    setActiveSentenceIdx(index);
    setSentenceElapsed(0);
    setActiveWordIndex(-1);
    setCurrentSlideIdx(resolveSlideForSentence(lecture, index));

    if (isMutedRef.current) {
      audioNarrator.stop();
      return;
    }

    const startOffset =
      explicitStartSeconds !== undefined
        ? Math.max(0, explicitStartSeconds)
        : (sentenceStartTimesRef.current[index] || 0);

    audioNarrator.speakLecture({
      sentences: lines.map(l => l.text),
      startTimeOffset: startOffset,
      rate: playbackSpeedRef.current,
      volume: volumeRef.current,
      onProgress: (p) => {
        if (!isPlayingRef.current || currentLectureRef.current.id !== lecture.id) return;
        setActiveSentenceIdx(p.sentenceIndex);
        setSentenceElapsed(p.sentenceElapsed);
        setActiveWordIndex(p.wordIndex);
        setCurrentSlideIdx(resolveSlideForSentence(lecture, p.sentenceIndex));
      },
      onEnd: () => {
        if (currentLectureRef.current.id !== lecture.id) return;
        setActiveWordIndex(-1);
        setIsPlaying(false);
        isPlayingRef.current = false;
        audioNarrator.playSound('correct');
        setCompletedLectures(old => new Set([...old, lecture.id]));

        if (autoplayNextRef.current) {
          const sec = UDEMY_ZERO_WASTE_SECTIONS[activeSectionIdxRef.current];
          const nextLecIdx = activeLectureIdxRef.current + 1;
          if (sec && nextLecIdx < sec.lectures.length) {
            const nextLecture = sec.lectures[nextLecIdx];
            setTimeout(() => {
              currentLectureRef.current = nextLecture;
              setActiveLectureIdx(nextLecIdx);
              setCurrentSlideIdx(0);
              setActiveSentenceIdx(0);
              setSentenceElapsed(0);
              setActiveWordIndex(-1);
              setIsPlaying(true);
              isPlayingRef.current = true;
              playSentence(0, 0);
            }, 500);
          }
        }
      },
    });
  }, [resolveSlideForSentence]);

  // Play / Pause handler (supports exact pause/resume without restarting sentence)
  const handleTogglePlay = () => {
    audioNarrator.unlockOnUserGesture();

    if (!isPlaying) {
      setIsPlaying(true);
      isPlayingRef.current = true;
      if (!isMuted && audioNarrator.getIsSpeaking() && audioNarrator.getIsPaused()) {
        audioNarrator.resume();
      } else {
        playSentence(activeSentenceIdx, currentTimeSeconds);
      }
    } else {
      setIsPlaying(false);
      isPlayingRef.current = false;
      if (audioNarrator.getIsSpeaking()) {
        audioNarrator.pause();
      } else {
        audioNarrator.stop();
      }
    }
  };

  // Muted silent visual progress loop (runs only when isPlaying && isMuted)
  useEffect(() => {
    if (!isPlaying || !isMuted || isQuizMode) return;
    const interval = setInterval(() => {
      setSentenceElapsed(prev => {
        const next = prev + 0.08 * playbackSpeedRef.current;
        const dur = sentenceDurations[activeSentenceIdx] || 5;
        const words = (currentTranscript[activeSentenceIdx]?.text || '').split(/\s+/).filter(Boolean);
        const fraction = Math.min(1, next / Math.max(0.5, dur));
        setActiveWordIndex(Math.min(Math.max(0, words.length - 1), Math.floor(fraction * words.length)));

        if (next >= dur) {
          if (activeSentenceIdx + 1 < currentTranscript.length) {
            const nextIdx = activeSentenceIdx + 1;
            setActiveSentenceIdx(nextIdx);
            setActiveWordIndex(-1);
            setCurrentSlideIdx(resolveSlideForSentence(currentLectureRef.current, nextIdx));
          } else {
            setIsPlaying(false);
            isPlayingRef.current = false;
            setCompletedLectures(old => new Set([...old, currentLectureRef.current.id]));
          }
          return 0;
        }
        return next;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [isPlaying, isMuted, isQuizMode, activeSentenceIdx, sentenceDurations, currentTranscript, resolveSlideForSentence]);

  // Unified seek helper (keeps timeline, slide, captions, and audio locked together)
  const seekToTime = useCallback((targetSeconds: number, forcePlay?: boolean) => {
    audioNarrator.unlockOnUserGesture();
    const clamped = Math.max(0, Math.min(totalDurationSeconds, targetSeconds));
    let targetSentenceIdx = 0;
    for (let i = sentenceStartTimes.length - 1; i >= 0; i--) {
      if (clamped >= sentenceStartTimes[i]) {
        targetSentenceIdx = i;
        break;
      }
    }

    const offsetInSentence = Math.max(0, clamped - (sentenceStartTimes[targetSentenceIdx] || 0));
    setActiveSentenceIdx(targetSentenceIdx);
    setActiveWordIndex(-1);
    setSentenceElapsed(offsetInSentence);
    setCurrentSlideIdx(resolveSlideForSentence(currentLectureRef.current, targetSentenceIdx));

    if (forcePlay || isPlayingRef.current) {
      setIsPlaying(true);
      isPlayingRef.current = true;
      // If unified lecture audio is already loaded & playing, seek instantaneously inside the WAV stream
      if (!isMutedRef.current && audioNarrator.getIsSpeaking() && audioNarrator.seekTo(clamped)) {
        if (audioNarrator.getIsPaused()) {
          audioNarrator.resume();
        }
      } else {
        playSentence(targetSentenceIdx, clamped);
      }
    } else {
      audioNarrator.stop();
    }
  }, [totalDurationSeconds, sentenceStartTimes, resolveSlideForSentence, playSentence]);

  // Handle Seeker Click
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / Math.max(1, rect.width)));
    seekToTime(fraction * totalDurationSeconds);
  };

  // Rewind 5 seconds (or previous sentence start)
  const handleRewind5s = () => {
    audioNarrator.playSound('click');
    const targetTime = Math.max(0, currentTimeSeconds - 5);
    seekToTime(targetTime);
  };

  // Forward 5 seconds (or next sentence start)
  const handleForward5s = () => {
    audioNarrator.playSound('click');
    const nextSentTime = sentenceStartTimes[activeSentenceIdx + 1];
    const targetTime = nextSentTime !== undefined
      ? Math.max(currentTimeSeconds + 5, nextSentTime)
      : Math.min(totalDurationSeconds, currentTimeSeconds + 5);
    seekToTime(targetTime);
  };

  // Toggle Lecture Checkbox
  const toggleLectureCompletion = (lecId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    audioNarrator.playSound('click');
    setCompletedLectures(prev => {
      const next = new Set(prev);
      if (next.has(lecId)) {
        next.delete(lecId);
      } else {
        next.add(lecId);
        audioNarrator.playSound('correct');
      }
      return next;
    });
  };

  // Select a lecture
  const handleSelectLecture = (secIdx: number, lecIdx: number) => {
    audioNarrator.stop();
    setIsPlaying(false);
    isPlayingRef.current = false;
    setIsQuizMode(false);
    setActiveSectionIdx(secIdx);
    setActiveLectureIdx(lecIdx);
    setCurrentSlideIdx(0);
    setActiveSentenceIdx(0);
    setSentenceElapsed(0);
    setActiveWordIndex(-1);
    setOpenResourceMenuId(null);
  };

  // Select Quiz for a section
  const handleSelectQuiz = (secIdx: number) => {
    audioNarrator.stop();
    setIsPlaying(false);
    isPlayingRef.current = false;
    setActiveSectionIdx(secIdx);
    setIsQuizMode(true);
    setCurrentQuizQuestionIdx(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizResultScore(null);
    setOpenResourceMenuId(null);
  };

  // Check if a section is unlocked
  // Rule: Section 0 is unlocked. Section N is unlocked only if Section N-1 quiz was PASSED (score >= 37%)!
  const isSectionUnlocked = (secIdx: number): boolean => {
    if (secIdx === 0) return true;
    const prevSecQuizId = UDEMY_ZERO_WASTE_SECTIONS[secIdx - 1]?.quiz.id;
    return passedQuizzes.has(prevSecQuizId);
  };

  // Handle Quiz Option Selection
  const handleSelectQuizOption = (questionIdx: number, optionIdx: number) => {
    if (quizSubmitted) return;
    audioNarrator.playSound('click');
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIdx]: optionIdx
    }));
  };

  // Submit Quiz & Evaluate
  const handleSubmitQuiz = () => {
    const questions = currentQuiz.questions;
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / questions.length) * 100);
    setQuizResultScore(scorePercent);
    setQuizSubmitted(true);
    setQuizScores(prev => ({ ...prev, [currentQuiz.id]: scorePercent }));

    // Rule: Passing marks is 37%!
    if (scorePercent >= currentQuiz.passingScorePercent) {
      audioNarrator.playSound('correct');
      setPassedQuizzes(prev => new Set([...prev, currentQuiz.id]));
    } else {
      audioNarrator.playSound('wrong');
    }
  };

  // Retake Quiz
  const handleRetakeQuiz = () => {
    audioNarrator.playSound('click');
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizResultScore(null);
    setCurrentQuizQuestionIdx(0);
  };

  // Proceed to Next Chapter after passing quiz
  const handleProceedToNextChapter = () => {
    audioNarrator.stop();
    audioNarrator.playSound('correct');
    if (activeSectionIdx < UDEMY_ZERO_WASTE_SECTIONS.length - 1) {
      const nextSecIdx = activeSectionIdx + 1;
      setActiveSectionIdx(nextSecIdx);
      setActiveLectureIdx(0);
      setIsQuizMode(false);
      setIsPlaying(false);
      isPlayingRef.current = false;
      setCurrentSlideIdx(0);
      setActiveSentenceIdx(0);
      setSentenceElapsed(0);
      setActiveWordIndex(-1);
      setOpenSections(prev => ({
        ...prev,
        [UDEMY_ZERO_WASTE_SECTIONS[nextSecIdx].id]: true
      }));
    } else if (examStatus.isUnlocked) {
      // Completed all sections with overall exam >= 37%! Open certificate
      onOpenCertify();
    }
  };

  // Add Note handler (matches Image 6)
  const handleSaveNote = () => {
    if (!newNoteContent.trim()) return;
    audioNarrator.playSound('click');
    const newNote: UserNote = {
      id: `note-${Date.now()}`,
      timestampSeconds: Math.round(currentTimeSeconds),
      timestampFormatted: formatSeconds(currentTimeSeconds),
      lectureId: currentLecture.id,
      lectureTitle: currentLecture.title,
      content: newNoteContent.trim(),
      createdAt: 'Just now'
    };
    setNotesList(prev => [newNote, ...prev]);
    setNewNoteContent('');
    setIsAddingNote(false);
  };

  // Jump to note timestamp
  const handleJumpToNote = (timestampSecs: number) => {
    audioNarrator.playSound('click');
    seekToTime(timestampSecs, true);
  };

  // Download comprehensive chapter manual & SOP worksheet
  const handleDownloadResource = (filename: string, title: string, lectureOverride?: CourseLectureItem) => {
    audioNarrator.playSound('click');
    const targetLecture = lectureOverride || currentLecture;
    const sm = targetLecture.studyMaterial;
    const sectionsText = sm
      ? [
          `EXECUTIVE OVERVIEW (${sm.issueCoverage})\n${sm.executiveOverview}`,
          `\nLEARNING OBJECTIVES\n${sm.learningObjectives.map((o, i) => `${i + 1}. ${o}`).join('\n')}`,
          `\nBIOCHEMICAL & OPERATIONAL THEORY MODULES\n${sm.theoryModules
            .map(
              (m, i) =>
                `\n[${i + 1}] ${m.heading}\n${m.content}${
                  m.formulaEquation ? `\nFormula (${m.formulaTitle}): ${m.formulaEquation}` : ''
                }${m.safetyNote ? `\nSafety Note: ${m.safetyNote}` : ''}`
            )
            .join('\n')}`,
          `\nCRITICAL CONTROL MATRIX\n${sm.controlMatrix
            .map(
              (c) =>
                `• ${c.parameter} | Target: ${c.targetRange} | Tool: ${c.measurementTool} | Corrective Action: ${c.correctiveAction}`
            )
            .join('\n')}`,
          `\nSTATION SOP CHECKLIST\n${sm.sopChecklist.map((s, i) => `[ ] ${i + 1}. ${s}`).join('\n')}`,
          `\nWORKED ZERO-WASTE FORMULATIONS\n${sm.featuredFormulations
            .map(
              (f, i) =>
                `\nFormulation ${i + 1}: ${f.title}\nByproduct: ${f.mainByproduct} | Yield: ${f.yieldAmount}\nMechanism: ${f.scientificMechanism}\nSteps:\n${f.keySteps.map((st, idx) => `  ${idx + 1}. ${st}`).join('\n')}\nChef Tip: ${f.chefTip}`
            )
            .join('\n')}`,
        ].join('\n\n')
      : 'Chapter workbook included with Supritamone Academy enrollment.';

    const content = `SUPRITAMONE ACADEMY · DR. CHEF SUPRITAM BASU, PhD, CEC\nThe Zero Waste Kitchen Course: Master Executive Diploma (26h 00m Curriculum)\nDocument: ${title}\nChapter: ${targetLecture.title} (${targetLecture.duration})\nQuality Standard: ISO 9001:2015 Verified Curriculum\nInstructor Support: supritam.basu@supritamone.com\n${'='.repeat(72)}\n\n${sectionsText}`;
    const safeFilename = filename.replace(/\.(pdf|xlsx)$/i, '.md');
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = safeFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate overall course progress (24 chapters + 12 quizzes = 36 items)
  const totalCourseItems = COURSE_TOTAL_CHAPTERS + COURSE_TOTAL_QUIZZES;
  const completedItemsCount = completedLectures.size + passedQuizzes.size;
  const progressPercentage = Math.round((completedItemsCount / totalCourseItems) * 100);

  // Helper to render slide highlighted bullet text
  const renderHighlightedBullet = (bullet: string) => {
    // Replaces [hl]...[/hl] with Udemy yellow highlighted badge
    const parts = bullet.split(/(\[hl\].*?\[\/hl\])/g);
    return (
      <span>
        {parts.map((part, i) => {
          if (part.startsWith('[hl]') && part.endsWith('[/hl]')) {
            const clean = part.replace('[hl]', '').replace('[/hl]', '');
            return (
              <span key={i} className="bg-[#ffea79] text-slate-950 font-bold px-1.5 py-0.5 rounded shadow-2xs mx-0.5">
                {clean}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#1c1d1f] text-white flex flex-col font-sans selection:bg-[#a435f0] selection:text-white">
      {/* 1. TOP NAVBAR: EXACT UDEMY BAR (Matches Image 1) */}
      <header className="h-14 bg-[#1c1d1f] border-b border-[#2d2f31] px-2.5 sm:px-4 flex items-center justify-between gap-2 z-30 shrink-0 safe-pt">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Zero Waste by Supritamone Official Logo (Navigates to Home Page) */}
          <button
            onClick={() => (onGoHome ? onGoHome() : onBackToCourses())}
            className="flex items-center gap-2 group hover:opacity-95 transition-opacity cursor-pointer shrink-0"
            title="Go to Zero Waste Academy Home"
          >
            <div className="bg-white rounded-lg px-2 sm:px-2.5 py-1 shadow-xs flex items-center">
              <SupritamoneLogo size="sm" />
            </div>
          </button>

          <span className="text-[#6a6f73] hidden sm:inline shrink-0">|</span>

          {/* Course Title */}
          <h1 className="text-xs sm:text-sm font-medium text-white truncate min-w-0">
            The Zero Waste Kitchen Course: Master Executive Diploma &amp; Food Waste Science
          </h1>
        </div>

        {/* Right Nav Utilities */}
        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          {/* Your Progress Dropdown Button */}
          <div className="relative group">
            <button
              onClick={() => setShowProgressMenu(prev => !prev)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-md hover:bg-[#2d2f31] text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4 text-[#e59819]" />
              <span className="hidden md:inline">Your progress</span>
              <span className="text-[#c0c4fc] font-mono text-[11px]">{progressPercentage}%</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8a8b8c]" />
            </button>

            {/* Progress Dropdown Card */}
            <div className={`absolute right-0 top-full mt-1 w-64 max-w-[calc(100vw-1.5rem)] p-4 bg-[#1c1d1f] border border-[#3e4143] rounded-lg shadow-2xl transition-all z-50 ${
              showProgressMenu ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'
            }`}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-white">Course Completion</span>
                <span className="font-mono text-[#a435f0] font-bold">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-[#3e4143] h-2 rounded-full overflow-hidden mb-3">
                <div 
                  className="bg-[#a435f0] h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-[11px] text-[#8a8b8c] leading-relaxed mb-3">
                {completedItemsCount} of {totalCourseItems} items completed · Overall Exam: <strong className="text-white">{examStatus.overallScorePercent}%</strong> ({examStatus.passedCount}/{examStatus.totalQuizzes} passed, ≥ 37% required).
              </p>
              <button
                onClick={() => {
                  setShowProgressMenu(false);
                  onOpenCertify();
                }}
                className={`w-full py-2 text-xs font-bold rounded transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                  examStatus.isUnlocked
                    ? 'bg-[#a435f0] hover:bg-[#8710d8] text-white'
                    : 'bg-[#2d2f31] hover:bg-[#3e4143] text-slate-300 border border-[#3e4143]'
                }`}
              >
                {examStatus.isUnlocked ? (
                  <>
                    <Award className="w-3.5 h-3.5" />
                    <span>View Accredited Certificate</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Certificate Locked (Pass Exam ≥ 37%)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Share Button */}
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                setShowShareToast(true);
                setTimeout(() => setShowShareToast(false), 2500);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#6a6f73] hover:bg-[#2d2f31] text-xs font-semibold text-white transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* More options menu */}
          <button
            onClick={onBackToCourses}
            className="p-1.5 rounded-md hover:bg-[#2d2f31] text-slate-300 hover:text-white"
            title="Exit player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Share Toast Notification */}
      {showShareToast && (
        <div className="fixed top-16 right-6 z-50 bg-[#2d2f31] border border-[#a435f0] text-white text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Course link copied to clipboard!</span>
        </div>
      )}

      {/* 2. MAIN PLAYER & SIDEBAR LAYOUT (Two-column Udemy view) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* LEFT COLUMN: Video / Quiz Player + Tabs Below */}
        <div className={`flex-1 flex flex-col overflow-y-auto bg-white text-slate-900 transition-all duration-300 ${isSidebarOpen ? 'lg:mr-0' : ''}`}>
          {/* VIDEO / QUIZ DISPLAY SCREEN */}
          <div
            ref={videoContainerRef}
            className={
              isFullscreen
                ? 'fixed inset-0 z-50 bg-[#0e0e10] w-screen h-screen flex items-center justify-center select-none'
                : 'bg-[#0e0e10] w-full flex items-center justify-center relative select-none'
            }
          >
            {isQuizMode ? (
              /* --- QUIZ PLAYER SCREEN (10 Questions, 37% Passing Mark) --- */
              <div className="w-full max-w-4xl min-h-[460px] sm:min-h-[520px] p-4 sm:p-8 flex flex-col justify-between text-white bg-[#1c1d1f]">
                {/* Quiz Header */}
                <div className="border-b border-[#3e4143] pb-4 mb-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#c0c4fc] bg-[#2d2f31] px-2.5 py-0.5 rounded border border-[#3e4143]">
                      Section {currentSection.sectionNumber} Assessment · Passing Standard: 37%
                    </span>
                    <span className="text-xs text-[#8a8b8c] font-mono">
                      Question {currentQuizQuestionIdx + 1} of {currentQuiz.questions.length}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    {currentQuiz.title}
                  </h2>

                  {/* Progress Line */}
                  <div className="w-full bg-[#3e4143] h-1.5 rounded-full overflow-hidden mt-3">
                    <div 
                      className="bg-[#a435f0] h-full transition-all duration-200"
                      style={{ width: `${((currentQuizQuestionIdx + 1) / currentQuiz.questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Quiz Question Body or Result Screen */}
                {!quizSubmitted ? (
                  <div className="space-y-6 flex-1">
                    {/* Active Question */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                        {currentQuiz.questions[currentQuizQuestionIdx].question}
                      </h3>
                      <p className="text-xs text-[#8a8b8c] mt-1">Select the single best answer below.</p>
                    </div>

                    {/* Options (Radio style matching Udemy practice test) */}
                    <div className="space-y-3">
                      {currentQuiz.questions[currentQuizQuestionIdx].options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[currentQuizQuestionIdx] === optIdx;
                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectQuizOption(currentQuizQuestionIdx, optIdx)}
                            className={`p-3.5 sm:p-4 rounded-xl border text-sm sm:text-base cursor-pointer transition-all flex items-start gap-3 ${
                              isSelected
                                ? 'border-[#a435f0] bg-[#2d2f31] text-white shadow-md'
                                : 'border-[#3e4143] bg-[#242629] text-slate-300 hover:border-[#6a6f73] hover:bg-[#2d2f31]'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-[#a435f0] bg-[#a435f0]' : 'border-[#6a6f73]'
                            }`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <span className="leading-relaxed">{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* QUIZ RESULT SCREEN (Pass >= 37% or Fail < 37%) */
                  <div className="flex-1 flex flex-col justify-center items-center text-center p-4 sm:p-8 animate-in zoom-in-95 duration-200">
                    {quizResultScore !== null && quizResultScore >= currentQuiz.passingScorePercent ? (
                      /* PASSED CARD */
                      <div className="max-w-xl space-y-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 mx-auto flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 block">
                          Pass Standard Met (≥ 37%)
                        </span>
                        <h3 className="text-2xl font-black text-white">
                          Congratulations! You Passed Section {currentSection.sectionNumber}
                        </h3>
                        <p className="text-3xl font-mono font-black text-emerald-400">
                          {quizResultScore}% Score
                        </p>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          You have demonstrated validated culinary competency in accordance with Level 7 Curriculum guidelines. Section {activeSectionIdx + 2 <= UDEMY_ZERO_WASTE_SECTIONS.length ? activeSectionIdx + 2 : 'Diploma'} is now unlocked!
                        </p>

                        {/* Official Quality Badge */}
                        <div className="p-4 rounded-xl bg-[#2d2f31] border border-[#3e4143] flex items-center justify-center gap-4 my-4">
                          <img 
                            src={iso9001Logo} 
                            alt="ISO 9001:2015 Certified"
                            className="h-10 object-contain bg-white rounded p-1"
                          />
                        </div>

                        {/* Next Chapter CTA Button */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                          <button
                            onClick={handleProceedToNextChapter}
                            disabled={activeSectionIdx === UDEMY_ZERO_WASTE_SECTIONS.length - 1 && !examStatus.isUnlocked}
                            className="w-full sm:w-auto px-8 py-3.5 bg-[#a435f0] hover:bg-[#8710d8] disabled:opacity-50 text-white font-bold text-sm rounded-lg shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            {activeSectionIdx < UDEMY_ZERO_WASTE_SECTIONS.length - 1 ? (
                              <>
                                <span>Proceed to Next Chapter</span>
                                <ChevronRight className="w-4 h-4" />
                              </>
                            ) : examStatus.isUnlocked ? (
                              <>
                                <Award className="w-4 h-4" />
                                <span>Claim Official Certificate ({examStatus.overallScorePercent}% Overall)</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-4 h-4" />
                                <span>Pass All {COURSE_TOTAL_QUIZZES} Exams (≥ 37% Overall) to Unlock Certificate</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleRetakeQuiz}
                            className="w-full sm:w-auto px-5 py-3.5 bg-[#2d2f31] hover:bg-[#3e4143] text-slate-300 text-xs font-semibold rounded-lg border border-[#3e4143] transition-colors cursor-pointer"
                          >
                            Review & Retake
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* FAILED CARD (< 37%) */
                      <div className="max-w-xl space-y-4">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 border-2 border-red-500 mx-auto flex items-center justify-center">
                          <AlertCircle className="w-8 h-8" />
                        </div>
                        <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-400 block">
                          Passing Standard Not Met (&lt; 37%)
                        </span>
                        <h3 className="text-2xl font-black text-white">
                          Assessment Standard Not Achieved
                        </h3>
                        <p className="text-3xl font-mono font-black text-red-400">
                          {quizResultScore}% Score (Passing mark: 37%)
                        </p>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          A minimum score of 37% is mandatory to move to the next chapter. The following section remains locked until you successfully reattempt the assessment.
                        </p>

                        <div className="pt-3">
                          <button
                            onClick={handleRetakeQuiz}
                            className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm rounded-lg shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Retake Exam Option (Try Again)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quiz Navigation Footer */}
                {!quizSubmitted && (
                  <div className="border-t border-[#3e4143] pt-4 mt-6 flex items-center justify-between">
                    <button
                      onClick={() => setCurrentQuizQuestionIdx(prev => Math.max(0, prev - 1))}
                      disabled={currentQuizQuestionIdx === 0}
                      className="px-4 py-2 rounded text-xs font-bold text-white bg-[#2d2f31] hover:bg-[#3e4143] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      Previous Question
                    </button>

                    {currentQuizQuestionIdx < currentQuiz.questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuizQuestionIdx(prev => prev + 1)}
                        className="px-6 py-2 rounded text-xs font-bold text-white bg-[#a435f0] hover:bg-[#8710d8] transition-colors"
                      >
                        Next Question
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(selectedAnswers).length < currentQuiz.questions.length}
                        className="px-6 py-2 rounded text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 transition-colors shadow-md"
                      >
                        Submit 10-Question Quiz
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* --- VIDEO LECTURE PLAYER WITH REAL SLIDE PRESENTATION VISUALS --- */
              <div className="relative min-h-[420px] sm:min-h-0 sm:aspect-video w-full flex items-center justify-center overflow-hidden group">
                {/* 1. REAL SLIDE CANVAS */}
                <div className="absolute inset-0 bg-[#f7f9fa] text-slate-900 p-4 sm:p-8 lg:p-10 flex flex-col justify-between overflow-y-auto sm:overflow-hidden pb-20 sm:pb-14">
                  {/* Slide Header: Course program & Title (padded right to never touch top-right PiP card) */}
                  <div className="flex items-start justify-between border-b-2 border-slate-200 pb-2 sm:pb-3 pr-28 sm:pr-48">
                    <div>
                      <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-[#5624d0] block">
                        {currentSlide.conceptTag}
                      </span>
                      <h2 className="text-base sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-0.5 leading-snug">
                        {currentSlide.title}
                      </h2>
                    </div>
                  </div>

                  {/* Slide Body: Bullets on Left + High-Res Image/Formula on Right */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 my-4 items-center">
                    {/* Left Col: Bullets (Hearts 💛 and Highlighted boxes) */}
                    <div className="md:col-span-7 space-y-3 sm:space-y-4">
                      {currentSlide.bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm md:text-base leading-snug sm:leading-relaxed text-slate-800">
                          <span className="text-amber-500 text-sm sm:text-base shrink-0 select-none">💛</span>
                          <div className="flex-1">
                            {renderHighlightedBullet(bullet)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right Col: High Quality Visual / Diagram / Metric Card */}
                    <div className="hidden md:flex md:col-span-5 flex-col items-center justify-center pt-4">
                      {currentSlide.visualImage && (
                        <div className="w-full max-w-sm rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-white p-2">
                          <img 
                            src={currentSlide.visualImage} 
                            alt={currentSlide.title} 
                            className="w-full h-36 object-cover rounded-lg"
                          />
                          {currentSlide.visualCaption && (
                            <p className="text-[11px] text-slate-500 italic text-center mt-1.5">
                              {currentSlide.visualCaption}
                            </p>
                          )}
                        </div>
                      )}

                      {currentSlide.keyMetricOrFormula && (
                        <div className="mt-2.5 w-full max-w-sm bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-300 rounded-xl p-2.5 text-left">
                          <span className="text-[10px] uppercase font-bold text-amber-900 block tracking-wider">
                            {currentSlide.keyMetricOrFormula.label}
                          </span>
                          <span className="text-base font-black text-slate-900 block font-mono">
                            {currentSlide.keyMetricOrFormula.value}
                          </span>
                          <span className="text-[10px] text-slate-600 block">
                            {currentSlide.keyMetricOrFormula.subtext}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Slide Footer */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200 pt-2 font-mono">
                    <div className="flex items-center gap-2">
                      <SupritamoneLogo size="sm" showSubtitle={false} />
                      <span>· Dr. Chef Supritam Basu, PhD, CEC</span>
                    </div>
                    <span>Slide {currentSlideIdx + 1} of {currentLecture.slides.length}</span>
                  </div>
                </div>

                {/* 2. INSTRUCTOR PICTURE-IN-PICTURE (Centered rounded portrait of Dr. Supritam Basu cleanly above Host label) */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-28 sm:w-44 min-h-[68px] sm:aspect-video bg-gradient-to-br from-[#0b193d] via-slate-900 to-black rounded-lg border-2 border-white/25 shadow-2xl overflow-hidden flex flex-col items-center justify-between pt-1.5 sm:pt-2 pb-1 sm:pb-1.5 px-1 sm:px-1.5 pointer-events-none">
                  {/* Portrait Picture replacing old SB circle */}
                  <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-emerald-400/80 shadow-lg shrink-0 bg-[#0b193d]">
                    <img
                      src="/assets/aistudio/Untitled_design_0fea8cc4.png"
                      alt="Dr. Chef Supritam Basu"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  {/* Camera overlay bar cleanly below portrait */}
                  <div className="w-full bg-black/80 backdrop-blur-xs px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] flex items-center justify-between text-white">
                    <span className="truncate font-semibold">Dr. Chef Basu</span>
                    {isPlaying && !isMuted ? (
                      <div className="flex items-center gap-0.5 ml-1">
                        <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-1.5 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                      </div>
                    ) : (
                      <span className="text-[8px] text-slate-400">Host</span>
                    )}
                  </div>
                </div>

                {/* 3. CENTER BIG PLAY BUTTON (Matching Image 1) */}
                {!isPlaying && (
                  <button
                    onClick={handleTogglePlay}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all z-20 cursor-pointer border border-white/20"
                    aria-label="Play video"
                  >
                    <Play className="w-9 h-9 fill-white ml-1 text-white" />
                  </button>
                )}

                {/* 4. LIVE-SYNCED SUBTITLES / CLOSED CAPTIONS BANNER (Word-by-word karaoke highlight) */}
                {showCaptions && currentCaption && (
                  <div className="absolute bottom-12 sm:bottom-14 left-2 right-2 sm:left-4 sm:right-4 z-20 flex justify-center pointer-events-none">
                    <div className="bg-black/85 text-white text-[11px] sm:text-sm font-medium px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg max-w-2xl text-center shadow-2xl backdrop-blur-xs border border-white/10 leading-relaxed">
                      {tokenizeTextIntoWords(currentCaption.text).map((tok, wIdx) => {
                        const isActiveWord = isPlaying && wIdx === activeWordIndex;
                        const isSpoken = isPlaying && activeWordIndex >= 0 && wIdx < activeWordIndex;
                        return (
                          <span
                            key={wIdx}
                            className={`transition-colors duration-75 ${
                              isActiveWord
                                ? 'text-[#ffea79] font-bold underline decoration-[#a435f0] decoration-2 underline-offset-4'
                                : isSpoken
                                  ? 'text-white'
                                  : 'text-slate-200'
                            }`}
                          >
                            {tok.word}{wIdx < tokenizeTextIntoWords(currentCaption.text).length - 1 ? ' ' : ''}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5. PURPLE TOGGLE BUTTON FOR SIDEBAR ON RIGHT EDGE (Matches Image 1 & 5 `<` / `>`) */}
                <button
                  onClick={() => setIsSidebarOpen(prev => !prev)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-6 h-12 bg-[#a435f0] hover:bg-[#8710d8] text-white flex items-center justify-center rounded-l-md shadow-lg transition-transform cursor-pointer"
                  title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                  {isSidebarOpen ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                </button>

                {/* 6. BOTTOM CUSTOM VIDEO CONTROLS BAR (Exact Udemy layout from Image 1) */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/90 to-transparent p-2 pt-6 z-20 flex flex-col gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
                  {/* Purple scrubber bar */}
                  <div
                    onClick={handleSeek}
                    className="w-full bg-white/20 hover:bg-white/30 h-1 hover:h-1.5 rounded-full overflow-hidden cursor-pointer transition-all relative"
                  >
                    <div 
                      className="bg-[#a435f0] h-full rounded-full transition-all duration-100"
                      style={{ width: `${(currentTimeSeconds / totalDurationSeconds) * 100}%` }}
                    />
                  </div>

                  {/* Buttons Row */}
                  <div className="flex items-center justify-between text-white text-xs px-0.5 sm:px-1">
                    {/* Left: Play/Pause, Rewind 5s, Speed, Forward 5s, Time */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={handleTogglePlay}
                        className="hover:text-[#a435f0] transition-colors cursor-pointer"
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                      </button>

                      {/* Rewind 5s */}
                      <button
                        onClick={handleRewind5s}
                        className="hover:text-slate-200 transition-colors cursor-pointer"
                        title="Rewind 5 seconds"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      {/* Playback Speed selector */}
                      <div className="relative">
                        <button
                          onClick={() => setShowSpeedMenu(prev => !prev)}
                          className="font-bold text-[11px] px-1.5 py-0.5 rounded hover:bg-white/10 cursor-pointer"
                        >
                          {playbackSpeed}x
                        </button>
                        {showSpeedMenu && (
                          <div className="absolute bottom-full left-0 mb-2 bg-[#1c1d1f] border border-[#3e4143] rounded-lg shadow-xl py-1 z-50 text-xs w-20">
                            {[0.75, 1, 1.25, 1.5, 2].map(speed => (
                              <button
                                key={speed}
                                onClick={() => {
                                  setPlaybackSpeed(speed);
                                  playbackSpeedRef.current = speed;
                                  audioNarrator.setRate(speed);
                                  setShowSpeedMenu(false);
                                }}
                                className={`w-full px-3 py-1 text-left hover:bg-[#2d2f31] ${playbackSpeed === speed ? 'text-[#a435f0] font-bold' : 'text-white'}`}
                              >
                                {speed}x
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Forward 5s */}
                      <button
                        onClick={handleForward5s}
                        className="hover:text-slate-200 transition-colors cursor-pointer"
                        title="Forward 5 seconds"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>

                      {/* Time display */}
                      <span className="font-mono text-[11px] text-slate-300">
                        {formatSeconds(currentTimeSeconds)} / {formatSeconds(totalDurationSeconds)}
                      </span>
                    </div>

                    {/* Right: Volume, CC, Settings, Fullscreen */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      {/* Audio mute */}
                      <button
                        onClick={() => {
                          audioNarrator.unlockOnUserGesture();
                          const nextMuted = !isMuted;
                          setIsMuted(nextMuted);
                          isMutedRef.current = nextMuted;
                          if (nextMuted) {
                            audioNarrator.stop();
                          } else {
                            audioNarrator.playSound('click');
                            if (isPlayingRef.current) {
                              playSentence(activeSentenceIdx, currentTimeSeconds);
                            }
                          }
                        }}
                        className="hover:text-white text-slate-300 transition-colors cursor-pointer"
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                      </button>

                      {/* Closed Captions CC */}
                      <button
                        onClick={() => setShowCaptions(prev => !prev)}
                        className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                          showCaptions ? 'text-white border-b-2 border-[#a435f0]' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Toggle subtitles (CC)"
                      >
                        CC
                      </button>

                      {/* Settings Popover */}
                      <div className="relative">
                        <button
                          onClick={() => {
                            setShowSettingsMenu(prev => !prev);
                            setShowSpeedMenu(false);
                          }}
                          className={`hover:text-white transition-colors cursor-pointer p-1 rounded ${
                            showSettingsMenu ? 'text-[#a435f0]' : 'text-slate-300'
                          }`}
                          title="Settings"
                          aria-label="Player Settings"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>

                        {showSettingsMenu && (
                          <div className="absolute bottom-full right-0 mb-2 w-60 sm:w-64 max-w-[calc(100vw-2rem)] bg-[#1c1d1f] border border-[#3e4143] rounded-xl shadow-2xl p-3 z-50 text-xs text-white space-y-3">
                            <div className="flex items-center justify-between border-b border-[#2d2f31] pb-2">
                              <span className="font-bold text-white">Player Settings</span>
                              <button
                                onClick={() => setShowSettingsMenu(false)}
                                className="text-slate-400 hover:text-white cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Volume Slider */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] text-slate-300">
                                <span>Voice Volume</span>
                                <span className="font-mono">{isMuted ? '0%' : `${Math.round(volume * 100)}%`}</span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={isMuted ? 0 : Math.round(volume * 100)}
                                onChange={(e) => {
                                  audioNarrator.unlockOnUserGesture();
                                  const nextVol = parseInt(e.target.value, 10) / 100;
                                  setVolume(nextVol);
                                  volumeRef.current = nextVol;
                                  audioNarrator.setVolume(nextVol);
                                  if (nextVol > 0 && isMuted) {
                                    setIsMuted(false);
                                    isMutedRef.current = false;
                                    if (isPlayingRef.current) {
                                      playSentence(activeSentenceIdx, currentTimeSeconds);
                                    }
                                  } else if (nextVol === 0 && !isMuted) {
                                    setIsMuted(true);
                                    isMutedRef.current = true;
                                  }
                                }}
                                className="w-full accent-[#a435f0] cursor-pointer"
                              />
                            </div>

                            {/* Playback Speed */}
                            <div className="space-y-1">
                              <span className="text-[11px] text-slate-300 block">Playback Speed</span>
                              <div className="grid grid-cols-5 gap-1">
                                {[0.75, 1, 1.25, 1.5, 2].map(spd => (
                                  <button
                                    key={spd}
                                    onClick={() => {
                                      setPlaybackSpeed(spd);
                                      playbackSpeedRef.current = spd;
                                      audioNarrator.setRate(spd);
                                    }}
                                    className={`py-1 rounded text-[10px] font-bold cursor-pointer ${
                                      playbackSpeed === spd
                                        ? 'bg-[#a435f0] text-white'
                                        : 'bg-[#2d2f31] text-slate-300 hover:bg-[#3e4143]'
                                    }`}
                                  >
                                    {spd}x
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Autoplay Toggle */}
                            <label className="flex items-center justify-between cursor-pointer pt-1">
                              <span className="text-[11px] text-slate-300">Autoplay next lecture</span>
                              <input
                                type="checkbox"
                                checked={autoplayNext}
                                onChange={(e) => setAutoplayNext(e.target.checked)}
                                className="accent-[#a435f0] w-3.5 h-3.5 cursor-pointer"
                              />
                            </label>

                            {/* Subtitles Toggle */}
                            <label className="flex items-center justify-between cursor-pointer">
                              <span className="text-[11px] text-slate-300">Show Closed Captions (CC)</span>
                              <input
                                type="checkbox"
                                checked={showCaptions}
                                onChange={(e) => setShowCaptions(e.target.checked)}
                                className="accent-[#a435f0] w-3.5 h-3.5 cursor-pointer"
                              />
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Fullscreen */}
                      <button
                        onClick={handleToggleFullscreen}
                        className="hover:text-white text-slate-300 transition-colors cursor-pointer p-1 rounded"
                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                      >
                        {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-[#a435f0]" /> : <Maximize2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* BELOW VIDEO TABS BAR (Matching Image 1, 6, 7) */}
          <div className="border-b border-slate-200 bg-white px-3 sm:px-6 flex items-center gap-4 sm:gap-6 overflow-x-auto shrink-0 select-none">
            {/* Search Icon */}
            <button
              onClick={() => setActiveTab('search')}
              className={`py-3.5 transition-colors cursor-pointer ${
                activeTab === 'search' ? 'text-[#a435f0] border-b-2 border-[#a435f0]' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Search course content"
              aria-label="Search course content"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Tab Links */}
            {([
              { id: 'overview', label: 'Overview' },
              { id: 'study', label: 'Study Guide & SOPs' },
              { id: 'qa', label: 'Q&A' },
              { id: 'notes', label: 'Notes' },
              { id: 'announcements', label: 'Announcements' },
              { id: 'reviews', label: 'Reviews' },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition-colors relative cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-slate-900 border-b-2 border-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <button
              onClick={() => setActiveTab('tools')}
              className={`py-3.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'tools'
                  ? 'text-slate-900 border-b-2 border-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Learning tools
            </button>
          </div>

          {/* TAB CONTENT PANELS */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-8 flex-1 bg-white text-slate-900">
            {/* TAB 1: OVERVIEW (Matching Image 7 & 8) */}
            {activeTab === 'overview' && (
              <div className="space-y-8 max-w-4xl">
                {/* Course Headline */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                    Lead any kitchen to zero waste: master chef training, scrap recovery formulas, fermentation kinetics, circular menu engineering
                  </h2>

                  {/* Rating & Video Timing row (Image 2: second part removed, exact total video timing shown) */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-3">
                    <div className="flex items-center gap-1 font-bold text-amber-700">
                      <span>4.8</span>
                      <div className="flex text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <span className="text-slate-500 font-normal underline">(1,420 ratings)</span>
                    </div>
                    <span>·</span>
                    <span className="font-semibold text-slate-800">{courseTotalVideoLabel} Total</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 font-mono">
                    <span>Last updated November 2026</span>
                    <span>·</span>
                    <span>English</span>
                    <span>·</span>
                    <span>English [Auto]</span>
                  </div>
                </div>

                {/* Schedule learning time banner card (Exact Image 7) */}
                {showScheduleCard && (
                  <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start gap-4 shadow-2xs">
                    <div className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-700 shrink-0">
                      <Clock className="w-5 h-5 text-slate-800" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <h4 className="text-sm font-bold text-slate-900">Schedule learning time</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Learning a little each day adds up. Research shows that students who make learning a habit are more likely to reach their goals. Set time aside to learn and get reminders using your learning scheduler.
                      </p>

                      {scheduleSavedToast && (
                        <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>Study goal saved: {studyGoalMinutes} mins ({studyFrequency})</span>
                        </div>
                      )}

                      {isConfiguringSchedule ? (
                        <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-3 mt-2">
                          <div className="flex flex-wrap items-center gap-3 text-xs">
                            <label className="font-semibold text-slate-700">
                              Frequency:
                              <select
                                value={studyFrequency}
                                onChange={(e) => setStudyFrequency(e.target.value as 'Daily' | 'Weekdays' | 'Weekends')}
                                className="ml-2 px-2 py-1 border border-slate-300 rounded text-slate-900"
                              >
                                <option value="Daily">Daily</option>
                                <option value="Weekdays">Weekdays</option>
                                <option value="Weekends">Weekends</option>
                              </select>
                            </label>
                            <label className="font-semibold text-slate-700">
                              Duration:
                              <select
                                value={studyGoalMinutes}
                                onChange={(e) => setStudyGoalMinutes(Number(e.target.value))}
                                className="ml-2 px-2 py-1 border border-slate-300 rounded text-slate-900"
                              >
                                <option value={10}>10 min</option>
                                <option value={20}>20 min</option>
                                <option value={30}>30 min</option>
                                <option value={45}>45 min</option>
                              </select>
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setIsConfiguringSchedule(false);
                                setScheduleSavedToast(true);
                                audioNarrator.playSound('correct');
                              }}
                              className="px-3.5 py-1.5 bg-[#a435f0] hover:bg-[#8710d8] text-white text-xs font-bold rounded cursor-pointer"
                            >
                              Save schedule
                            </button>
                            <button
                              onClick={() => setIsConfiguringSchedule(false)}
                              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            onClick={() => setIsConfiguringSchedule(true)}
                            className="px-3.5 py-1.5 bg-[#a435f0] hover:bg-[#8710d8] text-white text-xs font-bold rounded transition-colors cursor-pointer"
                          >
                            Get started
                          </button>
                          <button
                            onClick={() => setShowScheduleCard(false)}
                            className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* By the numbers grid (Exact Image 7) */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">By the numbers</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block">Skill level:</span>
                      <span className="font-bold text-slate-900">All Levels</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Passing Score:</span>
                      <span className="font-bold text-slate-900">37% Overall</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Languages:</span>
                      <span className="font-bold text-slate-900">English</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Captions:</span>
                      <span className="font-bold text-slate-900">Yes</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Practice tests:</span>
                      <span className="font-bold text-slate-900">{COURSE_TOTAL_QUIZZES} Comprehensive</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Questions:</span>
                      <span className="font-bold text-slate-900">{COURSE_TOTAL_QUESTIONS} (10 per Quiz)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Lectures:</span>
                      <span className="font-bold text-slate-900">{COURSE_TOTAL_CHAPTERS} Chapters</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Video:</span>
                      <span className="font-bold text-slate-900">{courseTotalVideoLabel} total</span>
                    </div>
                  </div>
                </div>

                {/* Certificates section (Locked until overall total exam >= 37% passed) */}
                <div className="border-t border-slate-200 pt-6">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold text-slate-900">Certificates</h3>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      examStatus.isUnlocked
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {examStatus.isUnlocked
                        ? `Unlocked · Overall Exam: ${examStatus.overallScorePercent}%`
                        : `Locked · Exam ${examStatus.passedCount}/${examStatus.totalQuizzes} Passed (${examStatus.overallScorePercent}% / 37% pass mark)`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Get Supritamone Academy certificate only after passing the entire course total examination with ≥ 37% overall marks ({examStatus.passedCount}/{examStatus.totalQuizzes} section exams completed).
                  </p>
                  <button
                    onClick={onOpenCertify}
                    className={`px-4 py-2 text-xs font-bold rounded transition-colors cursor-pointer inline-flex items-center gap-2 ${
                      examStatus.isUnlocked
                        ? 'border border-[#a435f0] text-[#a435f0] hover:bg-[#a435f0]/5'
                        : 'border border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {examStatus.isUnlocked ? <Award className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-amber-600" />}
                    <span>{examStatus.isUnlocked ? 'Supritamone Academy Certificate' : 'Certificate Locked (Complete Overall Exam ≥ 37%)'}</span>
                  </button>
                </div>

                {/* Description */}
                <div className="border-t border-slate-200 pt-6 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">Description</h3>
                  <p className="text-xs text-slate-500 italic">This course contains the use of artificial intelligence and professional culinary science.</p>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    297 tools for kitchen waste reduction and culinary sustainability in one mastercourse: 233 ready-to-use Standard Operating Procedures (SOPs), knife yield formulas, wild fermentation protocols, and tare-weighted station variance logs.
                  </p>
                </div>

                {/* Instructor Profile (Exact Image 8) */}
                <div className="border-t border-slate-200 pt-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Instructor</h3>
                  <div className="flex items-start gap-4">
                    <img
                      src="/assets/aistudio/Untitled_design_0fea8cc4.png"
                      alt="Dr. Chef Supritam Basu, PhD, CEC"
                      className="w-16 h-16 rounded-full object-cover object-top border-2 border-[#a435f0] shadow-md shrink-0 bg-[#0b193d]"
                    />
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-[#a435f0] hover:underline cursor-pointer">
                        Dr. Chef Supritam Basu, PhD, CEC
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        Executive Chef, Food Sustainability Author & Dean
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          4.8 Instructor Rating
                        </span>
                        <span>·</span>
                        <span>1 Course</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    Dr. Chef Supritam Basu is an international culinary educator, author of the 252-issue series "The Zero Waste Kitchen", and Dean of Sustainable Gastronomy at Supritamone Academy, ISO 9001:2015 Quality Management certified.
                  </p>
                </div>
              </div>
            )}

            {/* EXTENSIVE CHAPTER STUDY GUIDE, THEORY, CONTROL MATRIX, CHECKLIST & LAB FORMULATIONS */}
            {activeTab === 'study' && currentLecture.studyMaterial && (
              <div className="space-y-8 max-w-5xl">
                {/* Chapter Study Header */}
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                      <span className="bg-[#a435f0] text-white px-2.5 py-0.5 rounded font-bold uppercase">
                        Chapter {currentLecture.globalChapterNumber} Study Manual
                      </span>
                      <span className="bg-white/10 text-indigo-200 px-2.5 py-0.5 rounded border border-white/15">
                        {currentLecture.studyMaterial.issueCoverage}
                      </span>
                      <span className="text-slate-300">
                        {formatSeconds(getExactLectureSeconds(currentLecture))} Lecture Runtime
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-extrabold leading-snug">
                      {currentLecture.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                      {currentLecture.studyMaterial.executiveOverview}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      handleDownloadResource(
                        `Ch${currentLecture.globalChapterNumber}_Complete_Study_Manual.md`,
                        `Chapter ${currentLecture.globalChapterNumber} Extensive Study Guide & SOPs`,
                        currentLecture
                      )
                    }
                    className="shrink-0 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-colors cursor-pointer self-start md:self-center"
                  >
                    <Download className="w-4 h-4 text-[#a435f0]" />
                    <span>Download Chapter Study Manual</span>
                  </button>
                </div>

                {/* Learning Objectives */}
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#a435f0]" />
                    <span>Chapter Learning Objectives</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {currentLecture.studyMaterial.learningObjectives.map((obj, oIdx) => (
                      <div key={oIdx} className="flex items-start gap-2.5 p-3 rounded-lg bg-white border border-slate-200/80 text-xs sm:text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deep Biochemical & Operational Theory Modules */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-indigo-600" />
                    <span>Biochemical & Operational Science Modules</span>
                  </h3>
                  <div className="space-y-4">
                    {currentLecture.studyMaterial.theoryModules.map((mod, mIdx) => (
                      <div key={mIdx} className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900">
                          {mod.heading}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {mod.content}
                        </p>
                        {mod.formulaEquation && (
                          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                              {mod.formulaTitle || 'Quantitative Kitchen Formula'}
                            </span>
                            <code className="text-xs sm:text-sm font-mono font-bold text-slate-900 block">
                              {mod.formulaEquation}
                            </code>
                          </div>
                        )}
                        {mod.safetyNote && (
                          <div className="p-3 rounded-lg bg-red-50/80 border border-red-200 flex items-start gap-2 text-xs text-red-900">
                            <ShieldCheck className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <span>
                              <strong>HACCP / Safety Guardrail:</strong> {mod.safetyNote}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Critical Control Matrix Table */}
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Critical Control & Calibration Matrix</span>
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3">Control Parameter</th>
                          <th className="p-3">Target Range</th>
                          <th className="p-3">Measurement Tool</th>
                          <th className="p-3">Corrective Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {currentLecture.studyMaterial.controlMatrix.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-900">{row.parameter}</td>
                            <td className="p-3 font-mono font-bold text-[#a435f0] whitespace-nowrap">{row.targetRange}</td>
                            <td className="p-3 text-slate-700">{row.measurementTool}</td>
                            <td className="p-3 text-slate-600 leading-relaxed">{row.correctiveAction}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Interactive Station SOP Checklist */}
                <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-950 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                      <span>Station Implementation SOP Checklist</span>
                    </h3>
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      {currentLecture.studyMaterial.sopChecklist.filter((_, idx) => checkedSops.has(`${currentLecture.id}-sop-${idx}`)).length} / {currentLecture.studyMaterial.sopChecklist.length} Verified
                    </span>
                  </div>
                  <div className="space-y-2">
                    {currentLecture.studyMaterial.sopChecklist.map((step, sIdx) => {
                      const key = `${currentLecture.id}-sop-${sIdx}`;
                      const checked = checkedSops.has(key);
                      return (
                        <button
                          key={key}
                          onClick={() => toggleSopCheck(key)}
                          className={`w-full text-left p-3 rounded-lg border flex items-start gap-3 transition-colors cursor-pointer ${
                            checked
                              ? 'bg-emerald-100/70 border-emerald-300 text-emerald-950'
                              : 'bg-white border-slate-200 hover:border-emerald-300 text-slate-800'
                          }`}
                        >
                          {checked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          )}
                          <span className={`text-xs sm:text-sm leading-relaxed ${checked ? 'line-through opacity-75' : ''}`}>
                            {step}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Worked Zero-Waste Formulations Grid */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span>Worked Byproduct Lab Formulations ({currentLecture.studyMaterial.featuredFormulations.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentLecture.studyMaterial.featuredFormulations.map((form, fIdx) => (
                      <div key={fIdx} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs flex flex-col">
                        <div className="relative h-40 bg-slate-900">
                          <img
                            src={form.image}
                            alt={form.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/ingredients/lemon.jpg'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <span className="text-[10px] font-mono uppercase tracking-wider bg-[#a435f0] px-2 py-0.5 rounded font-bold">
                              Yield: {form.yieldAmount}
                            </span>
                            <h4 className="font-bold text-sm mt-1 leading-snug">{form.title}</h4>
                          </div>
                        </div>
                        <div className="p-4 space-y-2.5 text-xs flex-1">
                          <p className="text-slate-600">
                            <strong className="text-slate-900">Byproduct Stream:</strong> {form.mainByproduct}
                          </p>
                          <p className="text-indigo-950 bg-indigo-50/70 p-2 rounded border border-indigo-100">
                            <strong>Science:</strong> {form.scientificMechanism}
                          </p>
                          <div className="space-y-1">
                            <span className="font-bold text-slate-800 block">Production Method:</span>
                            <ol className="list-decimal list-inside space-y-1 text-slate-600">
                              {form.keySteps.slice(0, 4).map((st, stIdx) => (
                                <li key={stIdx} className="leading-relaxed">{st}</li>
                              ))}
                            </ol>
                          </div>
                          <p className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded border border-amber-200">
                            <strong>Chef Tip:</strong> {form.chefTip}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: NOTES (Exact Image 6) */}
            {activeTab === 'notes' && (
              <div className="space-y-6 max-w-3xl">
                {/* Note creation box (Image 6) */}
                <div className="flex items-start gap-3">
                  {/* Timestamp pill */}
                  <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2.5 py-1 rounded-full shrink-0 mt-1">
                    {formatSeconds(currentTimeSeconds)}
                  </span>

                  {/* WYSIWYG note card */}
                  <div className="flex-1 border-2 border-slate-300 focus-within:border-[#a435f0] rounded-xl p-3 bg-white shadow-2xs space-y-3">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setNewNoteContent(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + '**Key Point** ')}
                          className="font-bold px-2 py-0.5 rounded hover:bg-slate-100 cursor-pointer"
                          title="Bold text"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewNoteContent(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + '*note* ')}
                          className="italic px-2 py-0.5 rounded hover:bg-slate-100 cursor-pointer"
                          title="Italic text"
                        >
                          I
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewNoteContent(prev => prev + (prev && !prev.endsWith('\n') ? '\n1. ' : '1. '))}
                          className="px-2 py-0.5 rounded hover:bg-slate-100 cursor-pointer"
                          title="Numbered item"
                        >
                          1.
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewNoteContent(prev => prev + (prev && !prev.endsWith('\n') ? '\n• ' : '• '))}
                          className="px-2 py-0.5 rounded hover:bg-slate-100 cursor-pointer"
                          title="Bullet point"
                        >
                          •
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewNoteContent(prev => prev + ' `Ratio: ` ')}
                          className="font-mono px-2 py-0.5 rounded hover:bg-slate-100 cursor-pointer"
                          title="Formula snippet"
                        >
                          &lt;&gt;
                        </button>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {1000 - newNoteContent.length}
                      </span>
                    </div>

                    {/* Text area */}
                    <textarea
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value.slice(0, 1000))}
                      placeholder={`Add a note at ${formatSeconds(currentTimeSeconds)}...`}
                      rows={3}
                      className="w-full text-xs sm:text-sm text-slate-900 focus:outline-none resize-none leading-relaxed"
                    />

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setNewNoteContent('')}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNote}
                        disabled={!newNoteContent.trim()}
                        className="px-4 py-1.5 bg-[#a435f0] hover:bg-[#8710d8] disabled:opacity-40 text-white text-xs font-bold rounded transition-colors cursor-pointer"
                      >
                        Save note
                      </button>
                    </div>
                  </div>
                </div>

                {/* Saved notes list */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Saved Lecture Notes ({notesList.length})
                  </h4>

                  {notesList.map(note => (
                    <div key={note.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleJumpToNote(note.timestampSeconds)}
                          className="flex items-center gap-1.5 bg-slate-900 hover:bg-[#a435f0] text-white text-xs font-mono font-bold px-2.5 py-0.5 rounded-full transition-colors cursor-pointer"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>{note.timestampFormatted}</span>
                        </button>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-slate-400 font-mono">{note.createdAt}</span>
                          <button
                            onClick={() => setNotesList(prev => prev.filter(n => n.id !== note.id))}
                            className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                        {note.content}
                      </p>
                      <span className="text-[10px] text-slate-500 italic block">
                        Lecture: {note.lectureTitle}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Q&A */}
            {activeTab === 'qa' && (
              <div className="space-y-6 max-w-3xl">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input 
                      type="text" 
                      value={qaSearchQuery}
                      onChange={(e) => setQaSearchQuery(e.target.value)}
                      placeholder="Search all course questions..."
                      className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                    />
                  </div>
                  <button
                    onClick={() => setIsComposingQa(prev => !prev)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    {isComposingQa ? 'Close Form' : 'Ask a new question'}
                  </button>
                </div>

                {isComposingQa && (
                  <div className="p-4 rounded-xl border border-[#a435f0]/40 bg-purple-50/30 space-y-3">
                    <textarea
                      rows={3}
                      value={newQaQuestion}
                      onChange={(e) => setNewQaQuestion(e.target.value)}
                      placeholder="Ask a question about this lecture, yield formula, or waste audit..."
                      className="w-full p-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#a435f0]"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setIsComposingQa(false);
                          setNewQaQuestion('');
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={!newQaQuestion.trim()}
                        onClick={() => {
                          const qText = newQaQuestion.trim();
                          if (!qText) return;
                          setQaItems(prev => [
                            {
                              id: `qa-${Date.now()}`,
                              question: qText,
                              author: 'Dr. Chef Supritam Basu',
                              answer: `Thank you for your question on "${currentLecture.title}". Apply station-level tare weights and documented SOP controls before scaling prep batches. For private consultation, contact supritam.basu@supritamone.com.`,
                            },
                            ...prev,
                          ]);
                          setNewQaQuestion('');
                          setIsComposingQa(false);
                          audioNarrator.playSound('correct');
                        }}
                        className="px-4 py-1.5 bg-[#a435f0] hover:bg-[#8710d8] disabled:opacity-40 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Publish Question
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {qaItems
                    .filter(item =>
                      !qaSearchQuery.trim() ||
                      item.question.toLowerCase().includes(qaSearchQuery.toLowerCase()) ||
                      item.answer.toLowerCase().includes(qaSearchQuery.toLowerCase())
                    )
                    .map(item => (
                      <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                        <h5 className="font-bold text-xs sm:text-sm text-slate-900">
                          {item.question}
                        </h5>
                        <p className="text-xs text-slate-600">
                          Answered by <strong className="text-[#a435f0]">{item.author}</strong>: {item.answer}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* TAB 4: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-4 max-w-3xl text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="text-center">
                    <span className="text-3xl font-black text-amber-900 block">4.8</span>
                    <div className="flex text-amber-500">
                      <Star className="w-3 h-3 fill-current" />
                      <Star className="w-3 h-3 fill-current" />
                      <Star className="w-3 h-3 fill-current" />
                      <Star className="w-3 h-3 fill-current" />
                      <Star className="w-3 h-3 fill-current" />
                    </div>
                  </div>
                  <p className="text-xs text-amber-950">
                    Course rating based on 1,420 culinary students, commis chefs, and restaurant operators.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 5: ANNOUNCEMENTS */}
            {activeTab === 'announcements' && (
              <div className="space-y-4 max-w-3xl text-xs sm:text-sm text-slate-700">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">November 2026 Update</span>
                  <h5 className="font-bold text-slate-900 text-sm">Full 26-Hour Zero Waste Kitchen Curriculum (24 Extensive Chapters · 252 Issues)</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    All 12 sections ({COURSE_TOTAL_CHAPTERS} extensive chapters, {courseTotalVideoLabel} total video, and {COURSE_TOTAL_QUESTIONS} examination questions) have been expanded with full biochemical theory manuals, station control matrices, and ISO 9001:2015 quality standards.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 6: COURSE SEARCH */}
            {activeTab === 'search' && (
              <div className="space-y-4 max-w-3xl">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={courseSearchQuery}
                    onChange={(e) => setCourseSearchQuery(e.target.value)}
                    placeholder={`Search across all ${COURSE_TOTAL_CHAPTERS} chapters, study guides, and transcripts...`}
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                  />
                </div>
                <div className="space-y-2">
                  {UDEMY_ZERO_WASTE_SECTIONS.map((sec, sIdx) => {
                    const secUnlocked = isSectionUnlocked(sIdx);
                    return sec.lectures.map((lec, lIdx) => {
                      const q = courseSearchQuery.trim().toLowerCase();
                      const matchText = (
                        lec.title +
                        ' ' +
                        lec.slides.map(sl => sl.title + ' ' + sl.bullets.join(' ')).join(' ') +
                        ' ' +
                        lec.transcript.map(t => t.text).join(' ')
                      ).toLowerCase();
                      if (q && !matchText.includes(q)) return null;
                      return (
                        <button
                          key={lec.id}
                          disabled={!secUnlocked}
                          onClick={() => {
                            if (secUnlocked) {
                              handleSelectLecture(sIdx, lIdx);
                              setActiveTab('overview');
                            }
                          }}
                          className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-[#a435f0] hover:bg-purple-50/30 disabled:opacity-45 flex items-center justify-between gap-3 transition-colors cursor-pointer"
                        >
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[#a435f0] block">
                              Section {sec.sectionNumber}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-900">{lec.title}</span>
                          </div>
                          <span className="text-xs font-mono text-slate-500 shrink-0">
                            {secUnlocked ? 'Jump to Lecture →' : 'Locked'}
                          </span>
                        </button>
                      );
                    });
                  })}
                </div>
              </div>
            )}

            {/* TAB 7: LEARNING TOOLS */}
            {activeTab === 'tools' && (
              <div className="space-y-4 max-w-3xl text-xs sm:text-sm">
                <h3 className="text-base font-bold text-slate-900">Learning Tools & Kitchen Utilities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">Official Zero Waste Certificate</h4>
                      {!examStatus.isUnlocked && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                          Locked ({examStatus.overallScorePercent}% / 37%)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
                      {examStatus.isUnlocked
                        ? 'Overall exam passed! Download your high-resolution completion certificate.'
                        : `Pass all ${COURSE_TOTAL_QUIZZES} section exams (${examStatus.passedCount}/${examStatus.totalQuizzes} completed) with ≥ 37% overall total marks to unlock.`}
                    </p>
                    <button
                      onClick={onOpenCertify}
                      className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer inline-flex items-center gap-1.5 ${
                        examStatus.isUnlocked
                          ? 'bg-[#a435f0] hover:bg-[#8710d8] text-white'
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      }`}
                    >
                      {examStatus.isUnlocked ? <Award className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-amber-600" />}
                      <span>{examStatus.isUnlocked ? 'Open Certificate' : 'Locked — View Exam Progress'}</span>
                    </button>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm">Instructor Direct Support</h4>
                    <p className="text-xs text-slate-600">Need culinary audit advice or certification verification assistance?</p>
                    <a
                      href="mailto:supritam.basu@supritamone.com"
                      className="inline-block px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg"
                    >
                      Email supritam.basu@supritamone.com
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: COLLAPSIBLE "COURSE CONTENT" SIDEBAR (Exact Udemy layout from Images 2, 3, 4) */}
        {isSidebarOpen && (
          <aside className="w-full lg:w-96 bg-[#1c1d1f] border-t lg:border-t-0 lg:border-l border-[#2d2f31] flex flex-col z-20 shrink-0 max-h-[70vh] lg:max-h-none lg:h-full overflow-y-auto">
            {/* Sidebar Top Header with Tabs & Close X (Image 2) */}
            <div className="p-3.5 border-b border-[#2d2f31] flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-4 text-xs font-bold">
                <button
                  onClick={() => setSidebarTab('content')}
                  className={`pb-1 border-b-2 transition-colors cursor-pointer ${
                    sidebarTab === 'content'
                      ? 'border-[#a435f0] text-white'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Course content
                </button>
                <button
                  onClick={() => setSidebarTab('ai')}
                  className={`pb-1 border-b-2 flex items-center gap-1 transition-colors cursor-pointer ${
                    sidebarTab === 'ai'
                      ? 'border-[#a435f0] text-white'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#a435f0]" />
                  <span>AI Assistant</span>
                </button>
              </div>

              {/* Close Sidebar X */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
                title="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TAB CONTENT: COURSE CONTENT ACCORDION */}
            {sidebarTab === 'content' ? (
              <div className="divide-y divide-[#2d2f31] flex-1 overflow-y-auto">
                {UDEMY_ZERO_WASTE_SECTIONS.map((section, secIdx) => {
                  const isOpen = openSections[section.id] !== false;
                  const isUnlocked = isSectionUnlocked(secIdx);
                  const quizPassed = passedQuizzes.has(section.quiz.id);

                  // Count completed lectures in this section
                  const sectionCompletedLectures = section.lectures.filter(l => completedLectures.has(l.id)).length;
                  const sectionCompletedTotal = sectionCompletedLectures + (quizPassed ? 1 : 0);
                  const sectionTotalItems = section.lectures.length + 1; // 2 lectures + 1 quiz

                  return (
                    <div key={section.id} className="text-white">
                      {/* Section Accordion Header (Matches Image 2 & 3) */}
                      <div
                        onClick={() => toggleSectionAccordion(section.id)}
                        className="p-3.5 bg-[#2d2f31] hover:bg-[#34373a] transition-colors cursor-pointer flex items-start justify-between gap-2"
                      >
                        <div className="space-y-0.5 flex-1 pr-2">
                          <h3 className="text-xs sm:text-sm font-bold text-white leading-snug">
                            {section.title}
                          </h3>
                          <div className="flex items-center gap-2 text-[11px] text-[#8a8b8c]">
                            <span>{sectionCompletedTotal} / {sectionTotalItems}</span>
                            <span>|</span>
                            <span>
                              {formatCompactDuration(
                                section.lectures.reduce((sum, l) => sum + getExactLectureSeconds(l), 0)
                              )}
                            </span>
                            {!isUnlocked && (
                              <span className="flex items-center gap-1 text-amber-400 font-mono text-[10px]">
                                <Lock className="w-3 h-3" /> Locked
                              </span>
                            )}
                          </div>
                        </div>

                        <button className="text-slate-400 mt-0.5">
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Section Items (Lectures & Quiz) */}
                      {isOpen && (
                        <div className="bg-[#1c1d1f] divide-y divide-[#2d2f31]/50">
                          {/* LECTURES (2 per section) */}
                          {section.lectures.map((lecture, lecIdx) => {
                            const isCurrent = !isQuizMode && activeSectionIdx === secIdx && activeLectureIdx === lecIdx;
                            const isDone = completedLectures.has(lecture.id);

                            return (
                              <div
                                key={lecture.id}
                                onClick={() => {
                                  if (isUnlocked) {
                                    handleSelectLecture(secIdx, lecIdx);
                                  }
                                }}
                                className={`p-3 transition-colors cursor-pointer flex items-start gap-3 relative ${
                                  isCurrent
                                    ? 'bg-[#2b2d30] border-l-4 border-[#a435f0]'
                                    : 'hover:bg-[#25272a]'
                                } ${!isUnlocked ? 'opacity-40 pointer-events-none' : ''}`}
                              >
                                {/* Checkbox (Image 2) */}
                                <button
                                  onClick={(e) => toggleLectureCompletion(lecture.id, e)}
                                  className="mt-0.5 text-slate-400 hover:text-white shrink-0"
                                  title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                                >
                                  {isDone ? (
                                    <div className="w-4 h-4 rounded bg-[#a435f0] text-white flex items-center justify-center">
                                      <Check className="w-3 h-3 stroke-3" />
                                    </div>
                                  ) : (
                                    <div className="w-4 h-4 rounded border-2 border-slate-500 hover:border-white" />
                                  )}
                                </button>

                                {/* Lecture Title & Metadata */}
                                <div className="flex-1 space-y-1">
                                  <h4 className={`text-xs leading-snug ${isCurrent ? 'font-bold text-white' : 'text-slate-200'}`}>
                                    {lecture.title}
                                  </h4>

                                  <div className="flex items-center justify-between text-[11px] text-[#8a8b8c]">
                                    <span className="flex items-center gap-1 font-mono">
                                      <Play className="w-3 h-3 fill-current text-slate-400" />
                                      {formatClockDuration(getExactLectureSeconds(lecture))}
                                    </span>

                                    {/* Resources Pill Button (Exact Image 3 & 4) */}
                                    {lecture.resources.length > 0 && (
                                      <div className="relative">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenResourceMenuId(openResourceMenuId === lecture.id ? null : lecture.id);
                                          }}
                                          className="flex items-center gap-1 px-2 py-0.5 rounded border border-[#a435f0] text-[#c0c4fc] hover:bg-[#a435f0]/20 text-[10px] font-semibold transition-colors cursor-pointer"
                                        >
                                          <FolderOpen className="w-3 h-3 text-[#a435f0]" />
                                          <span>Resources</span>
                                          <ChevronDown className="w-2.5 h-2.5" />
                                        </button>

                                        {/* Dropdown Menu (Matches Image 3 & 4) */}
                                        {openResourceMenuId === lecture.id && (
                                          <div 
                                            onClick={(e) => e.stopPropagation()}
                                            className="absolute right-0 top-full mt-1 w-64 bg-white text-slate-900 border border-slate-200 rounded-lg shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95"
                                          >
                                            {lecture.resources.map(res => (
                                              <button
                                                key={res.id}
                                                onClick={() => {
                                                  if (res.isExternal && res.url) {
                                                    window.open(res.url, '_blank');
                                                  } else {
                                                    handleDownloadResource(res.filename || `${res.title.replace(/\s+/g, '_')}.md`, res.title, lecture);
                                                  }
                                                  setOpenResourceMenuId(null);
                                                }}
                                                className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded text-xs flex items-center justify-between text-slate-800 transition-colors"
                                              >
                                                <div className="flex items-center gap-2 truncate">
                                                  <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                  <span className="truncate">{res.title}</span>
                                                </div>
                                                {res.isExternal ? (
                                                  <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                                                ) : (
                                                  <Download className="w-3 h-3 text-slate-400 shrink-0" />
                                                )}
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {/* SECTION QUIZ (After every 2 chapters, 10 questions, 37% passing mark) */}
                          <div
                            onClick={() => {
                              if (isUnlocked) {
                                handleSelectQuiz(secIdx);
                              }
                            }}
                            className={`p-3 transition-colors cursor-pointer flex items-start gap-3 relative ${
                              isQuizMode && activeSectionIdx === secIdx
                                ? 'bg-[#2b2d30] border-l-4 border-[#a435f0]'
                                : 'hover:bg-[#25272a]'
                            } ${!isUnlocked ? 'opacity-40 pointer-events-none' : ''}`}
                          >
                            {/* Quiz Status Checkbox */}
                            <div className="mt-0.5 shrink-0">
                              {quizPassed ? (
                                <div className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center">
                                  <Check className="w-3 h-3 stroke-3" />
                                </div>
                              ) : !isUnlocked ? (
                                <Lock className="w-4 h-4 text-slate-500" />
                              ) : (
                                <div className="w-4 h-4 rounded border-2 border-[#a435f0]" />
                              )}
                            </div>

                            {/* Quiz Title & Passing Threshold */}
                            <div className="flex-1 space-y-1">
                              <h4 className={`text-xs leading-snug ${isQuizMode && activeSectionIdx === secIdx ? 'font-bold text-white' : 'text-slate-200'}`}>
                                {section.quiz.title}
                              </h4>

                              <div className="flex items-center justify-between text-[11px] text-[#8a8b8c]">
                                <span className="text-amber-400 font-mono text-[10px] font-semibold">
                                  10 Questions · 37% Pass Mark
                                </span>

                                {quizPassed ? (
                                  <span className="text-emerald-400 font-bold text-[10px]">
                                    Passed ({quizScores[section.quiz.id] || 90}%)
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[10px]">
                                    Required to advance
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* AI ASSISTANT SIDEBAR TAB */
              <div className="p-4 space-y-4 flex-1 flex flex-col justify-between text-xs text-slate-300">
                <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                  <div className="p-3 rounded-lg bg-[#2d2f31] border border-[#3e4143] space-y-1">
                    <span className="text-[#a435f0] font-bold block">Chef AI Assistant</span>
                    <p className="text-[11px] leading-relaxed">
                      Ask questions regarding <strong className="text-white">{currentLecture.title}</strong>, station tare logs, or fermentation ratios.
                    </p>
                  </div>

                  {aiMessages.map((msg, mIdx) => (
                    <div
                      key={mIdx}
                      className={`p-3 rounded-lg text-[11px] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#a435f0]/20 border border-[#a435f0]/40 text-white ml-4'
                          : 'bg-[#25272a] border border-[#3e4143] text-slate-200 mr-2'
                      }`}
                    >
                      <span className="font-bold block mb-0.5 text-[10px] uppercase tracking-wider text-slate-400">
                        {msg.role === 'user' ? 'You' : 'Chef AI'}
                      </span>
                      {msg.text}
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const q = aiQuestion.trim();
                    if (!q || isAiThinking) return;
                    setAiMessages(prev => [...prev, { role: 'user', text: q }]);
                    setAiQuestion('');
                    setIsAiThinking(true);
                    try {
                      const res = await fetch('/api/ai/ask', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          question: q,
                          lectureTitle: currentLecture.title,
                          context: currentSlide.bullets.join(' '),
                        }),
                      });
                      const data = await res.json();
                      setAiMessages(prev => [
                        ...prev,
                        { role: 'assistant', text: data.answer || 'Apply the tare-weight protocol on the active slide.' },
                      ]);
                    } catch {
                      setAiMessages(prev => [
                        ...prev,
                        { role: 'assistant', text: `In "${currentLecture.title}", measure prep trims by weight before repurposing. Contact supritam.basu@supritamone.com for brigade support.` },
                      ]);
                    } finally {
                      setIsAiThinking(false);
                    }
                  }}
                  className="space-y-2 pt-2 border-t border-[#2d2f31]"
                >
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder="Ask about this lecture..."
                    className="w-full p-2.5 rounded bg-[#25272a] border border-[#3e4143] text-white text-xs focus:outline-none focus:border-[#a435f0]"
                  />
                  <button
                    type="submit"
                    disabled={!aiQuestion.trim() || isAiThinking}
                    className="w-full py-2 bg-[#a435f0] hover:bg-[#8710d8] disabled:opacity-40 text-white font-bold rounded text-xs transition-colors cursor-pointer"
                  >
                    {isAiThinking ? 'Thinking...' : 'Submit Question'}
                  </button>
                </form>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};
