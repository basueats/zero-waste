import React from 'react';
import { 
  Compass, 
  ChefHat, 
  Layers, 
  Utensils, 
  Clock, 
  HelpCircle, 
  LifeBuoy, 
  MessageSquare, 
  BookOpen, 
  Award,
  Newspaper,
  GraduationCap,
  ExternalLink,
  Calculator,
  X
} from 'lucide-react';
import { SupritamoneLogo } from './SupritamoneLogo';
import { ExamUnlockStatus } from '../data/udemyCourseStructure';
import { Lock } from 'lucide-react';

interface SurplusSidebarProps {
  currentSection: string;
  onSelectSection: (sectionId: string) => void;
  activeNavTab: string;
  onSelectNavTab: (tab: string) => void;
  completedLessonsCount: number;
  isCertificateUnlocked?: boolean;
  examStatus?: ExamUnlockStatus;
  onOpenCertify: () => void;
  onCloseDrawer?: () => void;
}

export const SurplusSidebar: React.FC<SurplusSidebarProps> = ({
  currentSection,
  onSelectSection,
  activeNavTab,
  onSelectNavTab,
  completedLessonsCount,
  isCertificateUnlocked = false,
  examStatus,
  onOpenCertify,
  onCloseDrawer,
}) => {
  const handleNavClick = (tab: string) => {
    onSelectNavTab(tab);
    if (onCloseDrawer) onCloseDrawer();
  };

  const handleSectionClick = (sectionId: string) => {
    onSelectSection(sectionId);
    if (onCloseDrawer) onCloseDrawer();
  };

  return (
    <aside className="w-full lg:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Mobile Drawer Header with Close Button */}
      {onCloseDrawer && (
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <button
            onClick={() => handleNavClick('home')}
            className="cursor-pointer focus:outline-none"
            title="Go to Home Page"
          >
            <SupritamoneLogo size="sm" />
          </button>
          <button 
            onClick={onCloseDrawer}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="p-4 flex-1 space-y-6 overflow-y-auto">
        {/* Top Primary Navigation Links */}
        <div className="space-y-1">
          <button
            onClick={() => handleNavClick('home')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeNavTab === 'home'
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            onClick={() => handleNavClick('courses')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeNavTab === 'courses'
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4" />
              <span>Zero Waste Kitchen Course</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeNavTab === 'courses' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              6
            </span>
          </button>

          <div
            onClick={() => handleNavClick('culinary-courses')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer group ${
              activeNavTab === 'culinary-courses'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <GraduationCap className={`w-4 h-4 ${activeNavTab === 'culinary-courses' ? 'text-white' : 'text-emerald-600'}`} />
              <span>Culinary Courses</span>
            </div>
            <a
              href="https://foundations-of-food.ai.studio/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Open Foundations of Food in new tab"
              className={`p-0.5 transition-colors ${
                activeNavTab === 'culinary-courses' ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-emerald-600'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <button
            onClick={() => handleNavClick('calculator')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeNavTab === 'calculator' || currentSection === 'waste-calculator'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calculator className="w-4 h-4 text-emerald-500" />
              <span>Waste Calculator</span>
            </div>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
              activeNavTab === 'calculator' || currentSection === 'waste-calculator'
                ? 'bg-blue-700 text-white'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              LIVE ROI
            </span>
          </button>

          <button
            onClick={() => handleNavClick('library')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeNavTab === 'library'
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ChefHat className="w-4 h-4" />
              <span>Library & Byproducts</span>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              activeNavTab === 'library' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              500+
            </span>
          </button>
        </div>

        {/* START HERE Section */}
        <div>
          <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Start Here
          </h3>
          <div className="space-y-0.5">
            <button
              onClick={() => handleSectionClick('start-here')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                currentSection === 'start-here'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="text-red-500 font-bold">📌</span>
              <span>Start here - read first</span>
            </button>
          </div>
        </div>

        {/* QUICK WINS / HOW TO REDUCE FOOD WASTE */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Quick Wins (How to Reduce)
            </h3>
          </div>

          <div className="space-y-1">
            {/* Real-Time Calculator Button highlighted right under Quick Wins header */}
            <button
              onClick={() => handleSectionClick('waste-calculator')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left mb-1.5 ${
                currentSection === 'waste-calculator' || activeNavTab === 'calculator'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80 border border-emerald-200/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 shrink-0" />
                <span>Real-Time Waste Calculator</span>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                currentSection === 'waste-calculator' || activeNavTab === 'calculator'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-200/80 text-emerald-900'
              }`}>
                Live Tool
              </span>
            </button>

            <button
              onClick={() => handleSectionClick('prep-waste')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                currentSection === 'prep-waste'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ChefHat className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Prep waste</span>
            </button>

            <button
              onClick={() => handleSectionClick('buffet-waste')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                currentSection === 'buffet-waste'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Buffet waste</span>
            </button>

            <button
              onClick={() => handleSectionClick('plate-waste')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                currentSection === 'plate-waste'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Utensils className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Plate waste</span>
            </button>

            <button
              onClick={() => handleSectionClick('spoilage-waste')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                currentSection === 'spoilage-waste'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4 text-purple-500 shrink-0" />
              <span>Spoilage waste</span>
            </button>
          </div>
        </div>

        {/* COMMUNITY & SUPPORT */}
        <div>
          <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Community & Support
          </h3>
          <div className="space-y-0.5">
            <button
              onClick={() => handleSectionClick('ask-dr-basu')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                currentSection === 'ask-dr-basu'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
              <div className="flex-1 flex items-center justify-between">
                <span>Ask Dr. Chef Basu</span>
                <span className="w-2 h-2 rounded-full bg-blue-600" />
              </div>
            </button>

            <button
              onClick={() => handleSectionClick('helpdesk')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                currentSection === 'helpdesk'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LifeBuoy className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Helpdesk</span>
            </button>

            <button
              onClick={() => handleSectionClick('discussion')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                currentSection === 'discussion'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Discussion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Card: Diploma Status */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-800">Overall Exam Progress</span>
            <span className="font-semibold text-blue-600">
              {examStatus ? `${examStatus.overallScorePercent}%` : `${Math.min(100, Math.max(0, completedLessonsCount * 8))}%`}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-2">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${examStatus ? Math.min(100, Math.round((examStatus.passedCount / examStatus.totalQuizzes) * 100)) : 0}%` }}
            />
          </div>
          <button
            onClick={onOpenCertify}
            className={`w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-colors shadow-2xs cursor-pointer ${
              isCertificateUnlocked
                ? 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            {isCertificateUnlocked ? <Award className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-amber-600" />}
            <span>{isCertificateUnlocked ? 'Official Diploma Certificate' : 'Certificate Locked (≥ 37%)'}</span>
          </button>
        </div>


      </div>
    </aside>
  );
};
