import React from 'react';
import { 
  Layers, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  FileText, 
  HelpCircle, 
  Sparkles,
  BookMarked,
  Smartphone,
  ChevronLeft,
  ClipboardList
} from 'lucide-react';
import { CourseModule } from '../types/course';

interface AlisonSidebarProps {
  modules: CourseModule[];
  currentModuleIndex: number;
  currentTopicType: 'outcomes' | 'lesson' | 'summary' | 'assessment';
  currentLessonIndex: number;
  completedItems: Set<string>;
  isOpen: boolean;
  onToggleOpen: () => void;
  onSelectModule: (index: number) => void;
  onSelectOutcomes: (moduleIndex: number) => void;
  onSelectLesson: (moduleIndex: number, lessonIndex: number) => void;
  onSelectSummary: (moduleIndex: number) => void;
  onSelectAssessment: (moduleIndex: number) => void;
  onOpenCreatorStudio: () => void;
}

export const AlisonSidebar: React.FC<AlisonSidebarProps> = ({
  modules,
  currentModuleIndex,
  currentTopicType,
  currentLessonIndex,
  completedItems,
  isOpen,
  onToggleOpen,
  onSelectModule,
  onSelectOutcomes,
  onSelectLesson,
  onSelectSummary,
  onSelectAssessment,
  onOpenCreatorStudio,
}) => {
  const [expandedModules, setExpandedModules] = React.useState<Set<number>>(
    new Set([0, currentModuleIndex])
  );
  const [showAppPromo, setShowAppPromo] = React.useState(true);

  // Keep active module expanded
  React.useEffect(() => {
    setExpandedModules((prev) => new Set([...prev, currentModuleIndex]));
  }, [currentModuleIndex]);

  const toggleExpand = (modIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(modIndex)) {
        next.delete(modIndex);
      } else {
        next.add(modIndex);
      }
      return next;
    });
  };

  if (!isOpen) {
    return (
      <aside className="w-14 bg-white border-r border-slate-200 flex flex-col items-center py-4 shrink-0 transition-all">
        <button
          onClick={onToggleOpen}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          title="Expand Course Modules Sidebar"
        >
          <Layers className="w-5 h-5 text-blue-600" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-80 md:w-88 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-64px-64px)] shrink-0 select-none overflow-hidden">
      {/* Sidebar Header */}
      <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-2xs">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-slate-900 tracking-tight">Course Modules</span>
        </div>
        <button
          onClick={onToggleOpen}
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-md transition-colors"
          title="Collapse sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Modules List (Scrollable) */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
        {modules.map((mod, modIdx) => {
          const isExpanded = expandedModules.has(modIdx);
          const isActiveModule = currentModuleIndex === modIdx;
          const isAssessmentModule = mod.title.toLowerCase().includes('assessment');

          return (
            <div
              key={mod.id}
              className={`rounded-lg transition-colors overflow-hidden ${
                isActiveModule ? 'bg-slate-50/80 ring-1 ring-slate-200' : 'hover:bg-slate-50/50'
              }`}
            >
              {/* Module Header Row */}
              <div
                onClick={() => {
                  onSelectModule(modIdx);
                  onSelectOutcomes(modIdx);
                }}
                className="p-2.5 flex items-start gap-2.5 cursor-pointer group"
              >
                {/* Status Dot / Diamond */}
                <div className="mt-0.5 shrink-0">
                  {completedItems.has(mod.id) ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isActiveModule ? (
                    <div className="w-4 h-4 rounded-full border-2 border-blue-600 bg-blue-100 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    </div>
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                  )}
                </div>

                {/* Module Number & Title */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <span>Module {mod.moduleNumber}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-400 font-normal lowercase">{mod.newsletterRange}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2 mt-0.5 group-hover:text-blue-700 transition-colors">
                    {mod.title}
                  </div>
                </div>

                {/* Dropdown Chevron */}
                <button
                  type="button"
                  onClick={(e) => toggleExpand(modIdx, e)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-sm shrink-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Sub-topics when expanded */}
              {isExpanded && (
                <div className="pl-8 pr-2 pb-2 space-y-0.5 border-t border-slate-100 pt-1.5">
                  {/* Learning Outcomes Subitem */}
                  <button
                    onClick={() => {
                      onSelectModule(modIdx);
                      onSelectOutcomes(modIdx);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 transition-colors ${
                      isActiveModule && currentTopicType === 'outcomes'
                        ? 'bg-amber-100/70 text-amber-950 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">Learning Outcomes</span>
                  </button>

                  {/* Lessons (Topic 1: Concept, Topic 2: Case Study) */}
                  {mod.lessons.map((lesson, lIdx) => {
                    const isLessonActive =
                      isActiveModule && currentTopicType === 'lesson' && currentLessonIndex === lIdx;
                    const isLessonCompleted = completedItems.has(lesson.id);
                    const topicLabel = lIdx === 0 ? 'Topic 1: Concept' : lIdx === 1 ? 'Topic 2: Case Study' : `Topic ${lIdx + 1}`;

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          onSelectModule(modIdx);
                          onSelectLesson(modIdx, lIdx);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 transition-colors ${
                          isLessonActive
                            ? 'bg-blue-600 text-white font-medium shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <FileText
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isLessonActive
                              ? 'text-white'
                              : isLessonCompleted
                              ? 'text-emerald-600'
                              : 'text-slate-400'
                          }`}
                        />
                        <div className="truncate">
                          <span className="font-semibold">{topicLabel}</span>: {lesson.title.split(':')[0]}
                        </div>
                      </button>
                    );
                  })}

                  {/* Topic Summary & Review */}
                  <button
                    onClick={() => {
                      onSelectModule(modIdx);
                      onSelectSummary(modIdx);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 transition-colors ${
                      isActiveModule && currentTopicType === 'summary'
                        ? 'bg-purple-600 text-white font-medium shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <ClipboardList
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActiveModule && currentTopicType === 'summary' ? 'text-white' : 'text-purple-600'
                      }`}
                    />
                    <span className="truncate font-medium">Topic Summary & Review</span>
                  </button>

                  {/* Assessment */}
                  {mod.assessment && (
                    <button
                      onClick={() => {
                        onSelectModule(modIdx);
                        onSelectAssessment(modIdx);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 transition-colors ${
                        isActiveModule && currentTopicType === 'assessment'
                          ? 'bg-emerald-600 text-white font-medium shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <HelpCircle
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActiveModule && currentTopicType === 'assessment'
                            ? 'text-white'
                            : 'text-amber-500'
                        }`}
                      />
                      <span className="truncate font-semibold">Quiz: {mod.assessment.title}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Creator Guide Link */}
        <div 
          onClick={onOpenCreatorStudio}
          className="pt-2 px-2 pb-1 text-xs text-emerald-800 font-semibold flex items-center gap-2 hover:bg-emerald-50 rounded-md cursor-pointer transition-colors"
        >
          <BookMarked className="w-4 h-4 text-emerald-600" />
          <span>Alison Creator Publishing Guide</span>
        </div>
      </div>

      {/* Alison App Promotional Banner (from user's screenshot) */}
      {showAppPromo && (
        <div className="p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-t border-slate-200 shrink-0 relative">
          <button
            onClick={() => setShowAppPromo(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 text-xs p-1"
            title="Dismiss"
          >
            ✕
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <div className="text-[11px] font-bold text-slate-900 leading-tight">
                Download this course
              </div>
              <div className="text-[10px] text-slate-600 leading-tight">
                Study offline with mobile-friendly LMS formats
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => {
                const el = document.getElementById('export-modal-trigger');
                if (el) el.click();
              }}
              className="w-full py-1 text-center bg-white border border-emerald-600/40 text-emerald-800 font-semibold text-[11px] rounded-md hover:bg-emerald-50 shadow-2xs"
            >
              Get SCORM / LMS Zip
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
