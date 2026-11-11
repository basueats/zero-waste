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
  Square
} from 'lucide-react';
import { 
  UDEMY_ZERO_WASTE_SECTIONS, 
  UdemyCourseSection, 
  CourseLectureItem, 
  SectionQuiz,
  PresentationSlide 
} from '../data/udemyCourseStructure';
import { audioNarrator } from '../utils/audioNarrator';
import { SupritamoneLogo } from './SupritamoneLogo';

interface SurplusCoursePlayerProps {
  courseId: string;
  initialSectionIndex?: number;
  onBackToCourses: () => void;
  onOpenCertify: () => void;
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
  onOpenCertify,
}) => {
  // Navigation & Selection state
  const [activeSectionIdx, setActiveSectionIdx] = useState<number>(initialSectionIndex);
  const [activeLectureIdx, setActiveLectureIdx] = useState<number>(0);
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'qa' | 'announcements' | 'reviews'>('overview');
  const [sidebarTab, setSidebarTab] = useState<'content' | 'ai'>('content');

  // Completed items tracking (persists in state)
  const [completedLectures, setCompletedLectures] = useState<Set<string>>(() => new Set(['sec1-lec1']));
  const [passedQuizzes, setPassedQuizzes] = useState<Set<string>>(() => new Set());
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});

  // Video playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState<number>(0);
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState<number>(13);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showCaptions, setShowCaptions] = useState<boolean>(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [openResourceMenuId, setOpenResourceMenuId] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'section-1': true,
    'section-2': false,
    'section-3': false,
    'section-4': false,
    'section-5': false,
    'section-6': false,
  });

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

  const totalDurationSeconds = currentLecture.durationSeconds || 150;

  // Toggle Section in accordion
  const toggleSectionAccordion = (secId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [secId]: !prev[secId]
    }));
  };

  // Format seconds MM:SS
  const formatSeconds = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  // Play / Pause handler
  const handleTogglePlay = () => {
    audioNarrator.getAudioContext();
    audioNarrator.playSound('click');

    if (!isPlaying) {
      setIsPlaying(true);
      // Play speech line
      if (currentCaption) {
        audioNarrator.speak({
          text: currentCaption.text,
          rate: playbackSpeed,
          volume: isMuted ? 0 : volume,
          onEnd: () => {
            // Advance sentence if still playing
            setActiveSentenceIdx(prev => {
              const next = (prev + 1) % currentTranscript.length;
              // Advance slide proportionally
              const nextSlide = Math.floor((next / currentTranscript.length) * currentLecture.slides.length);
              setCurrentSlideIdx(nextSlide);
              return next;
            });
          }
        });
      }
    } else {
      setIsPlaying(false);
      audioNarrator.stop();
    }
  };

  // Timer tick for video simulation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTimeSeconds(prev => {
        const next = prev + 1;
        if (next >= totalDurationSeconds) {
          setIsPlaying(false);
          audioNarrator.playSound('correct');
          // Mark lecture complete
          setCompletedLectures(old => new Set([...old, currentLecture.id]));
          return totalDurationSeconds;
        }

        // Calculate active slide based on percentage
        const progress = next / totalDurationSeconds;
        const slideIndex = Math.min(
          currentLecture.slides.length - 1,
          Math.floor(progress * currentLecture.slides.length)
        );
        setCurrentSlideIdx(slideIndex);

        // Calculate caption index
        if (currentTranscript.length > 0) {
          const capIdx = Math.min(
            currentTranscript.length - 1,
            Math.floor(progress * currentTranscript.length)
          );
          setActiveSentenceIdx(capIdx);
        }

        return next;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, totalDurationSeconds, currentLecture, currentTranscript]);

  // Handle Seeker Click
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSeconds = Math.floor(fraction * totalDurationSeconds);
    setCurrentTimeSeconds(targetSeconds);

    const slideIndex = Math.min(
      currentLecture.slides.length - 1,
      Math.floor(fraction * currentLecture.slides.length)
    );
    setCurrentSlideIdx(slideIndex);

    if (currentTranscript.length > 0) {
      const capIdx = Math.min(
        currentTranscript.length - 1,
        Math.floor(fraction * currentTranscript.length)
      );
      setActiveSentenceIdx(capIdx);
    }
  };

  // Rewind 5 seconds
  const handleRewind5s = () => {
    audioNarrator.playSound('click');
    setCurrentTimeSeconds(prev => Math.max(0, prev - 5));
  };

  // Forward 5 seconds
  const handleForward5s = () => {
    audioNarrator.playSound('click');
    setCurrentTimeSeconds(prev => Math.min(totalDurationSeconds, prev + 5));
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
    setIsQuizMode(false);
    setActiveSectionIdx(secIdx);
    setActiveLectureIdx(lecIdx);
    setCurrentSlideIdx(0);
    setActiveSentenceIdx(0);
    setCurrentTimeSeconds(0);
    setOpenResourceMenuId(null);
  };

  // Select Quiz for a section
  const handleSelectQuiz = (secIdx: number) => {
    audioNarrator.stop();
    setIsPlaying(false);
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
    audioNarrator.playSound('correct');
    if (activeSectionIdx < UDEMY_ZERO_WASTE_SECTIONS.length - 1) {
      const nextSecIdx = activeSectionIdx + 1;
      setActiveSectionIdx(nextSecIdx);
      setActiveLectureIdx(0);
      setIsQuizMode(false);
      setCurrentSlideIdx(0);
      setActiveSentenceIdx(0);
      setCurrentTimeSeconds(0);
      setOpenSections(prev => ({
        ...prev,
        [UDEMY_ZERO_WASTE_SECTIONS[nextSecIdx].id]: true
      }));
    } else {
      // Completed all sections! Open certificate
      onOpenCertify();
    }
  };

  // Add Note handler (matches Image 6)
  const handleSaveNote = () => {
    if (!newNoteContent.trim()) return;
    audioNarrator.playSound('click');
    const newNote: UserNote = {
      id: `note-${Date.now()}`,
      timestampSeconds: currentTimeSeconds,
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
    setCurrentTimeSeconds(timestampSecs);
    setIsPlaying(true);
  };

  // Download PDF attachment simulation
  const handleDownloadResource = (filename: string, title: string) => {
    audioNarrator.playSound('click');
    const content = `SUPRITAMONE ACADEMY · DR. CHEF SUPRITAM BASU, PhD, CEC\nZero Waste Kitchen Curriculum Protocol\nDocument: ${title}\nFilename: ${filename}\nAccreditation: The CPD Group Approved Provider #791463 & ISO 9001:2015\n\nDownloaded successfully from Supritamone Academy LMS.`;
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate overall course progress (12 lectures + 6 quizzes = 18 items)
  const totalCourseItems = 12 + 6;
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
      <header className="h-14 bg-[#1c1d1f] border-b border-[#2d2f31] px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <button
            onClick={onBackToCourses}
            className="flex items-center gap-2 group text-white hover:text-slate-200 transition-colors"
            title="Back to Courses"
          >
            <div className="w-8 h-8 rounded-lg bg-[#a435f0] flex items-center justify-center font-black text-white text-sm shadow-md">
              SA
            </div>
            <span className="font-extrabold tracking-tight text-sm hidden sm:inline-block">
              Supritamone
            </span>
          </button>

          <span className="text-[#6a6f73] hidden sm:inline">|</span>

          {/* Course Title */}
          <h1 className="text-xs sm:text-sm font-medium text-white truncate max-w-xs sm:max-w-md md:max-w-xl">
            The Zero Waste Kitchen Course: Master Executive Diploma & Food Waste Science
          </h1>
        </div>

        {/* Right Nav Utilities */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Your Progress Dropdown Button */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-[#2d2f31] text-xs font-semibold text-white transition-colors cursor-pointer">
              <Award className="w-4 h-4 text-[#e59819]" />
              <span className="hidden md:inline">Your progress</span>
              <span className="text-[#c0c4fc] font-mono text-[11px]">{progressPercentage}%</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8a8b8c]" />
            </button>

            {/* Progress Hover Card */}
            <div className="absolute right-0 top-full mt-1 w-64 p-4 bg-[#1c1d1f] border border-[#3e4143] rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
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
                {completedItemsCount} of {totalCourseItems} items completed. Complete all 6 sections and pass each 10-question quiz (≥ 37%) to unlock your certified diploma.
              </p>
              <button
                onClick={onOpenCertify}
                className="w-full py-2 bg-[#a435f0] hover:bg-[#8710d8] text-white text-xs font-bold rounded transition-colors text-center cursor-pointer"
              >
                View Accredited Certificate
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
          <div className="bg-[#0e0e10] w-full flex items-center justify-center relative select-none">
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

                        {/* Official Accreditation Badges */}
                        <div className="p-4 rounded-xl bg-[#2d2f31] border border-[#3e4143] flex items-center justify-around gap-4 my-4">
                          <img 
                            src="/assets/images/cpd_approved_provider_791463.png" 
                            alt="The CPD Group Provider #791463"
                            className="h-10 object-contain bg-white rounded p-1"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/aistudio/791463_9802fbb0.png'; }}
                          />
                          <img 
                            src="/assets/images/iso_9001_certified.png" 
                            alt="ISO 9001:2015 Certified"
                            className="h-9 object-contain bg-white rounded p-1"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/aistudio/images_7ff73340.png'; }}
                          />
                        </div>

                        {/* Next Chapter CTA Button */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                          <button
                            onClick={handleProceedToNextChapter}
                            className="w-full sm:w-auto px-8 py-3.5 bg-[#a435f0] hover:bg-[#8710d8] text-white font-bold text-sm rounded-lg shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            <span>Proceed to Next Chapter</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleRetakeQuiz}
                            className="w-full sm:w-auto px-5 py-3.5 bg-[#2d2f31] hover:bg-[#3e4143] text-slate-300 text-xs font-semibold rounded-lg border border-[#3e4143] transition-colors"
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
              /* --- VIDEO LECTURE PLAYER WITH REAL SLIDE PRESENTATION VISUALS (Exact Image 1, 5, 9) --- */
              <div className="relative aspect-video w-full flex items-center justify-center overflow-hidden group">
                {/* 1. REAL SLIDE CANVAS (The Visual presentation deck requested by user) */}
                <div className="absolute inset-0 bg-[#f7f9fa] text-slate-900 p-6 sm:p-10 flex flex-col justify-between overflow-hidden">
                  {/* Slide Header: Course program & Title */}
                  <div className="flex items-start justify-between border-b-2 border-slate-200 pb-3">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#5624d0] block">
                        {currentSlide.conceptTag}
                      </span>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                        {currentSlide.title}
                      </h2>
                    </div>

                    {/* Academy Mini Brand Badge */}
                    <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                      <div className="w-4 h-4 rounded bg-[#a435f0] text-white text-[9px] font-black flex items-center justify-center">SA</div>
                      <span className="text-xs font-bold text-slate-800">Supritamone Academy</span>
                    </div>
                  </div>

                  {/* Slide Body: Bullets on Left + High-Res Image/Formula on Right */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 my-4 items-center">
                    {/* Left Col: Bullets (Hearts 💛 and Highlighted boxes exactly like image 5 & 9) */}
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
                    <div className="hidden md:flex md:col-span-5 flex-col items-center justify-center">
                      {currentSlide.visualImage && (
                        <div className="w-full max-w-sm rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-white p-2">
                          <img 
                            src={currentSlide.visualImage} 
                            alt={currentSlide.title} 
                            className="w-full h-40 object-cover rounded-lg"
                          />
                          {currentSlide.visualCaption && (
                            <p className="text-[11px] text-slate-500 italic text-center mt-2">
                              {currentSlide.visualCaption}
                            </p>
                          )}
                        </div>
                      )}

                      {currentSlide.keyMetricOrFormula && (
                        <div className="mt-3 w-full max-w-sm bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-300 rounded-xl p-3 text-left">
                          <span className="text-[10px] uppercase font-bold text-amber-900 block tracking-wider">
                            {currentSlide.keyMetricOrFormula.label}
                          </span>
                          <span className="text-lg font-black text-slate-900 block font-mono">
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
                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200 pt-2 font-mono">
                    <span>Dr. Chef Supritam Basu, PhD, CEC · Facilitation & Sustainable Gastronomy</span>
                    <span>Slide {currentSlideIdx + 1} of {currentLecture.slides.length}</span>
                  </div>
                </div>

                {/* 2. INSTRUCTOR PICTURE-IN-PICTURE (Top Right as in Image 5 & 9) */}
                <div className="absolute top-4 right-4 z-20 w-36 sm:w-44 aspect-video bg-[#1c1d1f] rounded-lg border-2 border-white/20 shadow-2xl overflow-hidden flex flex-col justify-end p-2 pointer-events-none">
                  {/* Subtle video background representation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-[#a435f0] text-white font-bold flex items-center justify-center shadow-md">
                      SB
                    </div>
                  </div>

                  {/* Camera overlay bar */}
                  <div className="relative z-10 bg-black/80 backdrop-blur-xs px-2 py-1 rounded text-[10px] flex items-center justify-between text-white">
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

                {/* 4. SUBTITLES / CLOSED CAPTIONS BANNER (Matching Image 5 & 9) */}
                {showCaptions && currentCaption && (
                  <div className="absolute bottom-14 left-4 right-4 z-20 flex justify-center pointer-events-none">
                    <div className="bg-black/85 text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-lg max-w-xl text-center shadow-2xl backdrop-blur-xs border border-white/10 leading-relaxed">
                      {currentCaption.text}
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
                  <div className="flex items-center justify-between text-white text-xs px-1">
                    {/* Left: Play/Pause, Rewind 5s, Speed, Forward 5s, Time */}
                    <div className="flex items-center gap-3">
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

                      {/* Time display: 0:13 / 27:41 */}
                      <span className="font-mono text-[11px] text-slate-300">
                        {formatSeconds(currentTimeSeconds)} / {formatSeconds(totalDurationSeconds)}
                      </span>
                    </div>

                    {/* Right: Volume, CC, Settings, Fullscreen */}
                    <div className="flex items-center gap-3">
                      {/* Audio mute */}
                      <button
                        onClick={() => {
                          setIsMuted(prev => !prev);
                          if (isMuted) audioNarrator.playSound('click');
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

                      {/* Settings */}
                      <button className="hover:text-white text-slate-300 transition-colors" title="Settings">
                        <Settings className="w-3.5 h-3.5" />
                      </button>

                      {/* Fullscreen */}
                      <button className="hover:text-white text-slate-300 transition-colors" title="Fullscreen">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* BELOW VIDEO TABS BAR (Matching Image 1, 6, 7) */}
          <div className="border-b border-slate-200 bg-white px-6 flex items-center gap-6 overflow-x-auto shrink-0 select-none">
            {/* Search Icon */}
            <button className="text-slate-500 hover:text-slate-900 py-3.5">
              <Search className="w-4 h-4" />
            </button>

            {/* Tab Links */}
            {(['overview', 'qa', 'notes', 'announcements', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3.5 text-xs sm:text-sm font-bold tracking-tight capitalize transition-colors relative cursor-pointer ${
                  activeTab === tab
                    ? 'text-slate-900 border-b-2 border-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'qa' ? 'Q&A' : tab}
              </button>
            ))}

            <button className="py-3.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 cursor-pointer">
              Learning tools
            </button>
          </div>

          {/* TAB CONTENT PANELS */}
          <div className="p-6 sm:p-8 space-y-8 flex-1 bg-white text-slate-900">
            {/* TAB 1: OVERVIEW (Matching Image 7 & 8) */}
            {activeTab === 'overview' && (
              <div className="space-y-8 max-w-4xl">
                {/* Course Headline */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                    Lead any kitchen to zero waste: master chef training, scrap recovery formulas, fermentation kinetics, circular menu engineering
                  </h2>

                  {/* Rating & Stats row (Image 7) */}
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
                    <span className="font-semibold text-slate-800">12,850 Students</span>
                    <span>·</span>
                    <span>19.5 hours Total</span>
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
                <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start gap-4 shadow-2xs">
                  <div className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-700 shrink-0">
                    <Clock className="w-5 h-5 text-slate-800" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="text-sm font-bold text-slate-900">Schedule learning time</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Learning a little each day adds up. Research shows that students who make learning a habit are more likely to reach their goals. Set time aside to learn and get reminders using your learning scheduler.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <button className="px-3.5 py-1.5 bg-[#a435f0] hover:bg-[#8710d8] text-white text-xs font-bold rounded transition-colors cursor-pointer">
                        Get started
                      </button>
                      <button className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer">
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>

                {/* By the numbers grid (Exact Image 7) */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">By the numbers</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block">Skill level:</span>
                      <span className="font-bold text-slate-900">All Levels</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Students:</span>
                      <span className="font-bold text-slate-900">12,850</span>
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
                      <span className="font-bold text-slate-900">6 Comprehensive</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Questions:</span>
                      <span className="font-bold text-slate-900">60 (10 per Quiz)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Lectures:</span>
                      <span className="font-bold text-slate-900">12 Chapters</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Video:</span>
                      <span className="font-bold text-slate-900">19.5 total hours</span>
                    </div>
                  </div>
                </div>

                {/* Certificates section (Exact Image 7) */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-2">Certificates</h3>
                  <p className="text-xs text-slate-600 mb-3">
                    Get Supritamone Academy certificate by completing entire course and passing all section assessments with ≥ 37%.
                  </p>
                  <button
                    onClick={onOpenCertify}
                    className="px-4 py-2 border border-[#a435f0] text-[#a435f0] hover:bg-[#a435f0]/5 text-xs font-bold rounded transition-colors cursor-pointer"
                  >
                    Supritamone Academy Certificate
                  </button>
                </div>

                {/* Features (Image 7) */}
                <div className="border-t border-slate-200 pt-6 flex items-center gap-2 text-xs text-slate-700">
                  <span className="font-bold">Features:</span>
                  <span>Available on <strong className="text-slate-900">iOS</strong> and <strong className="text-slate-900">Android</strong></span>
                </div>

                {/* Description (Image 7) */}
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
                    <div className="w-16 h-16 rounded-full bg-[#a435f0] text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                      SB
                    </div>
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
                        <span>12,850 Students</span>
                        <span>·</span>
                        <span>1 Course</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    Dr. Chef Supritam Basu is an international culinary educator, author of the 252-issue series "The Zero Waste Kitchen", and Dean of Sustainable Gastronomy at Supritamone Academy. Officially accredited under The CPD Group Approved Provider #791463 and ISO 9001:2015 Quality Management standards.
                  </p>
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
                      <div className="flex items-center gap-3">
                        <span className="font-semibold cursor-pointer hover:text-slate-900">Styles v</span>
                        <span className="font-bold cursor-pointer hover:text-slate-900">B</span>
                        <span className="italic cursor-pointer hover:text-slate-900">I</span>
                        <span className="cursor-pointer hover:text-slate-900">1.</span>
                        <span className="cursor-pointer hover:text-slate-900">•</span>
                        <span className="font-mono cursor-pointer hover:text-slate-900">&lt;&gt;</span>
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
                        <span className="text-[11px] text-slate-400 font-mono">{note.createdAt}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
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
                      placeholder="Search all course questions..."
                      className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#a435f0]"
                    />
                  </div>
                  <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0">
                    Ask a new question
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900">
                      How long can wild lacto-fermented vegetable trimmings be safely held in walk-in cold rooms?
                    </h5>
                    <p className="text-xs text-slate-600">
                      Answered by <strong className="text-[#a435f0]">Dr. Chef Supritam Basu</strong>: Once the pH drops below 4.6 and bubbling stabilizes, sealed crocks at 2°C–4°C hold prime crunch and acidity for 6 to 9 months.
                    </p>
                  </div>
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
                  <h5 className="font-bold text-slate-900 text-sm">Full 252 Newsletter Synthesis & Verified CPD Group Accreditation</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    All 12 modules have been synchronized with the latest commercial kitchen inspection rubric and verified under CPD Group Provider #791463.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: COLLAPSIBLE "COURSE CONTENT" SIDEBAR (Exact Udemy layout from Images 2, 3, 4) */}
        {isSidebarOpen && (
          <aside className="w-full lg:w-96 bg-[#1c1d1f] border-l border-[#2d2f31] flex flex-col z-20 shrink-0 h-full overflow-y-auto">
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
                            <span>{section.durationLabel}</span>
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
                                      {lecture.duration}
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
                                                    handleDownloadResource(res.filename || `${res.title.replace(/\s+/g, '_')}.pdf`, res.title);
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
              <div className="p-4 space-y-4 flex-1 text-xs text-slate-300">
                <div className="p-3 rounded-lg bg-[#2d2f31] border border-[#3e4143] space-y-1">
                  <span className="text-[#a435f0] font-bold block">Chef AI Assistant</span>
                  <p className="text-[11px] leading-relaxed">
                    Ask questions regarding Dr. Chef Basu's 252-issue curriculum, station tare logs, or fermentation ratios.
                  </p>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Ask about this lecture..."
                    className="w-full p-2.5 rounded bg-[#25272a] border border-[#3e4143] text-white text-xs focus:outline-none focus:border-[#a435f0]"
                  />
                  <button className="w-full py-2 bg-[#a435f0] hover:bg-[#8710d8] text-white font-bold rounded text-xs transition-colors cursor-pointer">
                    Submit Question
                  </button>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};
