import React from 'react';
import { initialCourseData } from './data/zeroWasteCourseData';
import { CourseOverview } from './types/course';
import { SurplusHeader } from './components/SurplusHeader';
import { SurplusSidebar } from './components/SurplusSidebar';
import { SurplusCoursesView } from './components/SurplusCoursesView';
import { SurplusCoursePlayer } from './components/SurplusCoursePlayer';
import { SurplusLibraryView } from './components/SurplusLibraryView';
import { SurplusCommunityView } from './components/SurplusCommunityView';
import { SurplusQuickWinsView } from './components/SurplusQuickWinsView';
import { SurplusNewslettersView } from './components/SurplusNewslettersView';
import { SurplusHomeView } from './components/SurplusHomeView';
import { SurplusMobilePreview } from './components/SurplusMobilePreview';
import { SurplusCertificateModal } from './components/SurplusCertificateModal';
import { ExportModal } from './components/ExportModal';
import { SurplusCulinaryCoursesView } from './components/SurplusCulinaryCoursesView';
import { SurplusWasteCalculator } from './components/SurplusWasteCalculator';
import { Compass, BookOpen, GraduationCap, Calculator, ChefHat, Mail, User, X, CheckCircle2, Lock, Award } from 'lucide-react';
import {
  ExamUnlockStatus,
  computeExamUnlockStatus,
  loadStoredExamProgress
} from './data/udemyCourseStructure';

const LEARNER_STORAGE_KEY = 'supritamone_learner_account';

function deriveNameFromEmail(email: string): string {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (cleanEmail === 'basueats@gmail.com') {
    return 'Supritam Basu';
  }
  const local = cleanEmail.split('@')[0] || '';
  const words = local
    .replace(/[._-]+/g, ' ')
    .replace(/\d+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return 'Culinary Professional';
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

interface LearnerAccount {
  email: string;
  chosenName: string;
}

export default function App() {
  const [course] = React.useState<CourseOverview>(initialCourseData);
  const [viewMode, setViewMode] = React.useState<'desktop' | 'mobile'>('desktop');
  const [activeNavTab, setActiveNavTab] = React.useState<string>('courses');
  const [activeSection, setActiveSection] = React.useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [completedLessonsCount] = React.useState<number>(2);

  // Signed-in learner profile (defaults to user's email/name, persisted in localStorage)
  const [learnerAccount, setLearnerAccount] = React.useState<LearnerAccount>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LEARNER_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.email || parsed.chosenName)) {
            return {
              email: parsed.email || 'basueats@gmail.com',
              chosenName: parsed.chosenName || '',
            };
          }
        }
      } catch {
        // Ignore storage errors
      }
    }
    return {
      email: 'basueats@gmail.com',
      chosenName: 'Supritam Basu',
    };
  });

  const resolvedCertificateName = React.useMemo(() => {
    const trimmed = learnerAccount.chosenName.trim();
    if (trimmed) return trimmed;
    return deriveNameFromEmail(learnerAccount.email);
  }, [learnerAccount]);

  const todayFormatted = React.useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  }, []);

  // Account Sign-In Modal draft state
  const [showAccountModal, setShowAccountModal] = React.useState<boolean>(false);
  const [draftEmail, setDraftEmail] = React.useState<string>(learnerAccount.email);
  const [draftName, setDraftName] = React.useState<string>(learnerAccount.chosenName);

  // Mobile Auto-Calibration & Drawer state
  const [isMobileScreen, setIsMobileScreen] = React.useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 1024 : false;
  });
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState<boolean>(false);

  // Modals
  const [showCertifyModal, setShowCertifyModal] = React.useState<boolean>(false);
  const [showCertLockedModal, setShowCertLockedModal] = React.useState<boolean>(false);
  const [showExportModal, setShowExportModal] = React.useState<boolean>(false);

  // Global Overall Exam Status (Certificate unlocks ONLY when all 12 section exams passed with >= 37% overall score)
  const [examStatus, setExamStatus] = React.useState<ExamUnlockStatus>(() => {
    const stored = loadStoredExamProgress();
    return computeExamUnlockStatus(stored.passedQuizzes, stored.quizScores);
  });

  const handleOpenCertificate = React.useCallback(() => {
    if (examStatus.isUnlocked) {
      setShowCertLockedModal(false);
      setShowCertifyModal(true);
    } else {
      setShowCertLockedModal(true);
    }
  }, [examStatus.isUnlocked]);

  // Auto-calibrate on viewport resize / device orientation change
  React.useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      setIsMobileScreen(isMobile);
      if (!isMobile) {
        setIsMobileDrawerOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectNavTab = (tab: string) => {
    setActiveNavTab(tab);
    setActiveSection('');
    setIsMobileDrawerOpen(false);
    if (tab === 'the-zero-waste-kitchen-course') {
      setSelectedCourseId('food-waste-prevention-chefs');
    } else {
      setSelectedCourseId(null);
    }
  };

  const handleSelectSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setSelectedCourseId(null);
    setIsMobileDrawerOpen(false);
    if (sectionId === 'waste-calculator') {
      setActiveNavTab('calculator');
    } else if (sectionId === 'ask-dr-basu') {
      setActiveNavTab('community');
    } else {
      setActiveNavTab('quick-wins');
    }
  };

  const handleOpenCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setActiveNavTab('courses');
    setActiveSection('');
    setIsMobileDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col selection:bg-blue-600 selection:text-white">
      {/* If a course player is open, render the full-screen Udemy player interface */}
      {selectedCourseId ? (
        <main className="flex-1 w-full">
          <SurplusCoursePlayer
            courseId={selectedCourseId}
            learnerName={resolvedCertificateName}
            onBackToCourses={() => setSelectedCourseId(null)}
            onOpenCertify={handleOpenCertificate}
            onExamStatusChange={setExamStatus}
          />
        </main>
      ) : (
        <>
          {/* Top Navigation Bar */}
          <SurplusHeader
            viewMode={viewMode}
            onToggleViewMode={setViewMode}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenCertify={handleOpenCertificate}
            onOpenExporter={() => setShowExportModal(true)}
            activeNavTab={activeNavTab}
            onSelectNavTab={handleSelectNavTab}
            isMobileDrawerOpen={isMobileDrawerOpen}
            onToggleMobileDrawer={() => setIsMobileDrawerOpen(prev => !prev)}
            learnerName={resolvedCertificateName}
            learnerEmail={learnerAccount.email}
            isCertificateUnlocked={examStatus.isUnlocked}
            onOpenAccountModal={() => {
              setDraftEmail(learnerAccount.email);
              setDraftName(learnerAccount.chosenName);
              setShowAccountModal(true);
            }}
          />

          {/* Mobile Drawer Overlay for Small / Mobile Viewports */}
          {isMobileDrawerOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
                onClick={() => setIsMobileDrawerOpen(false)}
              />
              {/* Slide-over panel */}
              <div className="relative z-10 w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-200">
                <SurplusSidebar
                  currentSection={activeSection}
                  onSelectSection={handleSelectSection}
                  activeNavTab={activeNavTab}
                  onSelectNavTab={handleSelectNavTab}
                  completedLessonsCount={completedLessonsCount}
                  isCertificateUnlocked={examStatus.isUnlocked}
                  examStatus={examStatus}
                  onOpenCertify={() => {
                    handleOpenCertificate();
                    setIsMobileDrawerOpen(false);
                  }}
                  onOpenExporter={() => {
                    setShowExportModal(true);
                    setIsMobileDrawerOpen(false);
                  }}
                  onCloseDrawer={() => setIsMobileDrawerOpen(false)}
                />
              </div>
            </div>
          )}

          {/* VIEW MODE 1: MOBILE APP SIMULATOR (Explicit simulated iPhone) */}
          {viewMode === 'mobile' ? (
            <main className="flex-1 flex items-center justify-center bg-slate-100/80 py-4">
              <SurplusMobilePreview
                onOpenDesktop={() => setViewMode('desktop')}
                onOpenCertify={handleOpenCertificate}
                onOpenExporter={() => setShowExportModal(true)}
              />
            </main>
          ) : (
            /* VIEW MODE 2: AUTO-CALIBRATED RESPONSIVE PORTAL (Desktop full grid, tablet, or responsive mobile) */
            <div className="flex-1 flex max-w-7xl w-full mx-auto">
              {/* Desktop Left Sidebar (hidden on mobile, drawer used instead) */}
              <div className="hidden lg:block shrink-0">
                <SurplusSidebar
                  currentSection={activeSection}
                  onSelectSection={handleSelectSection}
                  activeNavTab={activeNavTab}
                  onSelectNavTab={handleSelectNavTab}
                  completedLessonsCount={completedLessonsCount}
                  isCertificateUnlocked={examStatus.isUnlocked}
                  examStatus={examStatus}
                  onOpenCertify={handleOpenCertificate}
                  onOpenExporter={() => setShowExportModal(true)}
                />
              </div>

              {/* Main Content Area - Auto-calibrates spacing on mobile vs desktop */}
              <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto pb-24 lg:pb-8 w-full max-w-full">
                {activeNavTab === 'home' ? (
                  <SurplusHomeView
                    onOpenCourse={handleOpenCourse}
                    onOpenLibrary={() => handleSelectNavTab('library')}
                    onOpenCertify={handleOpenCertificate}
                    onOpenSection={handleSelectSection}
                    isCertificateUnlocked={examStatus.isUnlocked}
                    examStatus={examStatus}
                  />
                ) : activeNavTab === 'culinary-courses' ? (
                  <SurplusCulinaryCoursesView
                    onBackToZeroWaste={() => handleSelectNavTab('courses')}
                  />
                ) : activeNavTab === 'calculator' || activeSection === 'waste-calculator' ? (
                  <SurplusWasteCalculator
                    onOpenLibrary={() => handleSelectNavTab('library')}
                    onOpenCourse={handleOpenCourse}
                  />
                ) : activeNavTab === 'courses' ? (
                  <SurplusCoursesView
                    onOpenCourse={handleOpenCourse}
                    searchQuery={searchQuery}
                  />
                ) : activeNavTab === 'library' ? (
                  <SurplusLibraryView searchQuery={searchQuery} />
                ) : activeNavTab === 'newsletter' || activeNavTab === 'the-zero-waste-kitchen-course' ? (
                  <SurplusNewslettersView
                    onOpenCourse={handleOpenCourse}
                    searchQuery={searchQuery}
                  />
                ) : activeSection === 'ask-dr-basu' || activeNavTab === 'events' ? (
                  <SurplusCommunityView initialSubTab="ask" />
                ) : (
                  <SurplusQuickWinsView
                    sectionId={activeSection || 'start-here'}
                    onOpenCourse={handleOpenCourse}
                    onOpenCalculator={() => {
                      setActiveNavTab('calculator');
                      setActiveSection('waste-calculator');
                    }}
                  />
                )}
              </main>
            </div>
          )}

          {/* MOBILE BOTTOM NAVIGATION BAR: Auto-calibrated for phone viewports */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
            <button
              onClick={() => handleSelectNavTab('home')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
                activeNavTab === 'home' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Compass className="w-4 h-4 mb-0.5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => handleSelectNavTab('courses')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
                activeNavTab === 'courses' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 mb-0.5" />
              <span>Zero Waste</span>
            </button>

            <button
              onClick={() => handleSelectNavTab('culinary-courses')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
                activeNavTab === 'culinary-courses' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 mb-0.5" />
              <span>Culinary</span>
            </button>

            <button
              onClick={() => handleSelectNavTab('calculator')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-bold transition-colors relative ${
                activeNavTab === 'calculator' || activeSection === 'waste-calculator'
                  ? 'text-emerald-700 bg-emerald-50 rounded-lg'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Calculator className="w-4 h-4 mb-0.5 text-emerald-600" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <span>Calculator</span>
            </button>

            <button
              onClick={() => handleSelectNavTab('library')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
                activeNavTab === 'library' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ChefHat className="w-4 h-4 mb-0.5" />
              <span>Library</span>
            </button>
          </nav>
        </>
      )}

      {/* MODAL 1: Official Supritamone Academy Zero Waste Certificate Generator (Only Name & Date change) */}
      <SurplusCertificateModal
        isOpen={showCertifyModal}
        onClose={() => setShowCertifyModal(false)}
        defaultLearnerName={resolvedCertificateName}
        completionDateDefault={todayFormatted}
      />

      {/* MODAL 2: Alison, SCORM & LMS Publishing Kit Downloader */}
      <ExportModal
        course={course}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      {/* MODAL 3: Learner Login / Account Identity Modal (Sets Certificate Name from Email or Login Choice) */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <User className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm">Learner Sign-In & Certificate Name</h3>
                  <p className="text-[11px] text-slate-400">Your certificate uses your chosen name or email ID</p>
                </div>
              </div>
              <button
                onClick={() => setShowAccountModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const updated: LearnerAccount = {
                  email: draftEmail.trim() || 'basueats@gmail.com',
                  chosenName: draftName.trim(),
                };
                setLearnerAccount(updated);
                if (typeof window !== 'undefined') {
                  localStorage.setItem(LEARNER_STORAGE_KEY, JSON.stringify(updated));
                }
                setShowAccountModal(false);
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div className="space-y-1.5">
                <label htmlFor="learner-email-input" className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Login Email ID</span>
                </label>
                <input
                  id="learner-email-input"
                  type="email"
                  required
                  value={draftEmail}
                  onChange={(e) => setDraftEmail(e.target.value)}
                  placeholder="chef@restaurant.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="learner-name-input" className="font-bold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>Chosen Full Name (Optional — defaults to Email ID)</span>
                </label>
                <input
                  id="learner-name-input"
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder={`Leave blank to use "${deriveNameFromEmail(draftEmail)}"`}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="text-[11px] text-amber-900 block font-semibold">Name Printed on Certificate:</span>
                  <span className="text-sm font-bold text-slate-900">
                    {draftName.trim() || deriveNameFromEmail(draftEmail)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
                >
                  Save & Apply to Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Certificate Locked Notice Modal (Requires Overall Total Exam >= 37% Pass) */}
      {showCertLockedModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm">Certificate Locked</h3>
                  <p className="text-[11px] text-slate-400">Pass overall total exam (≥ 37%) to unlock</p>
                </div>
              </div>
              <button
                onClick={() => setShowCertLockedModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span>Overall Total Exam Score</span>
                  <span className="font-mono">{examStatus.overallScorePercent}% / 37% Required</span>
                </div>
                <div className="w-full bg-amber-200/70 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, examStatus.overallScorePercent)}%` }}
                  />
                </div>
                <p className="text-[11px] text-amber-800">
                  Section Exams Passed: <strong>{examStatus.passedCount} of {examStatus.totalQuizzes}</strong> (10 questions per quiz, ≥ 37% passing mark).
                </p>
              </div>

              <p className="leading-relaxed text-slate-600">
                Your official <strong>Supritamone Academy Zero Waste Certificate</strong> unlocks automatically once all {examStatus.totalQuizzes} section exams are completed with an overall total score of <strong>37% or higher</strong>.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowCertLockedModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowCertLockedModal(false);
                    setSelectedCourseId('food-waste-prevention-chefs');
                  }}
                  className="px-5 py-2 rounded-lg bg-[#a435f0] hover:bg-[#8710d8] text-white font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Open Course Exams</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
