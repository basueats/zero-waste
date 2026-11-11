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
import { Compass, BookOpen, GraduationCap, Calculator, ChefHat, Sparkles } from 'lucide-react';

export default function App() {
  const [course] = React.useState<CourseOverview>(initialCourseData);
  const [viewMode, setViewMode] = React.useState<'desktop' | 'mobile'>('desktop');
  const [activeNavTab, setActiveNavTab] = React.useState<string>('courses');
  const [activeSection, setActiveSection] = React.useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [completedLessonsCount, setCompletedLessonsCount] = React.useState<number>(2);

  // Mobile Auto-Calibration & Drawer state
  const [isMobileScreen, setIsMobileScreen] = React.useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 1024 : false;
  });
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState<boolean>(false);

  // Modals
  const [showCertifyModal, setShowCertifyModal] = React.useState<boolean>(false);
  const [showExportModal, setShowExportModal] = React.useState<boolean>(false);

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
    } else if (sectionId === 'ask-dr-basu' || sectionId === 'monthly-recordings') {
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
            onBackToCourses={() => setSelectedCourseId(null)}
            onOpenCertify={() => setShowCertifyModal(true)}
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
            onOpenCertify={() => setShowCertifyModal(true)}
            onOpenExporter={() => setShowExportModal(true)}
            activeNavTab={activeNavTab}
            onSelectNavTab={handleSelectNavTab}
            isMobileDrawerOpen={isMobileDrawerOpen}
            onToggleMobileDrawer={() => setIsMobileDrawerOpen(prev => !prev)}
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
                  onOpenCertify={() => {
                    setShowCertifyModal(true);
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
                onOpenCertify={() => setShowCertifyModal(true)}
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
                  onOpenCertify={() => setShowCertifyModal(true)}
                  onOpenExporter={() => setShowExportModal(true)}
                />
              </div>

              {/* Main Content Area - Auto-calibrates spacing on mobile vs desktop */}
              <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto pb-24 lg:pb-8 w-full max-w-full">
                {activeNavTab === 'home' ? (
                  <SurplusHomeView
                    onOpenCourse={handleOpenCourse}
                    onOpenLibrary={() => handleSelectNavTab('library')}
                    onOpenCertify={() => setShowCertifyModal(true)}
                    onOpenSection={handleSelectSection}
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
                ) : activeSection === 'ask-dr-basu' || activeSection === 'monthly-recordings' || activeNavTab === 'events' ? (
                  <SurplusCommunityView
                    initialSubTab={activeSection === 'monthly-recordings' ? 'recordings' : 'ask'}
                  />
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

      {/* MODAL 1: Official Supritamone Academy Executive Diploma Certificate Generator */}
      <SurplusCertificateModal
        isOpen={showCertifyModal}
        onClose={() => setShowCertifyModal(false)}
        defaultLearnerName="Chef Alex Vance"
        courseTitle="Executive Diploma in Sustainable Gastronomy & Zero-Waste Culinary Science (Level 7)"
      />

      {/* MODAL 2: Alison, SCORM & LMS Publishing Kit Downloader */}
      <ExportModal
        course={course}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
}
