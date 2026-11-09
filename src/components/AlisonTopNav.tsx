import { Award, Clock, Sparkles, Download, BookOpen, Wand2, Flame } from 'lucide-react';

interface AlisonTopNavProps {
  courseTitle: string;
  studyMinutes: number;
  xpPoints: number;
  onOpenCertify: () => void;
  onOpenExport: () => void;
  onOpenNewsletters: () => void;
  onOpenAiGenerator: () => void;
  onOpenQuizArena: () => void;
  onOpenCreatorStudio: () => void;
}

export const AlisonTopNav: React.FC<AlisonTopNavProps> = ({
  courseTitle,
  studyMinutes,
  xpPoints,
  onOpenCertify,
  onOpenExport,
  onOpenNewsletters,
  onOpenAiGenerator,
  onOpenQuizArena,
  onOpenCreatorStudio,
}) => {
  const formatTimer = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const m = mins % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${m}m`;
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      {/* Zone 1: Brand & Course Title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Alison Signature Multi-color A Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-xs select-none">
            A
          </div>
          <span className="font-bold text-slate-900 hidden sm:inline-block tracking-tight text-sm">
            Alison
          </span>
        </div>

        <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block shrink-0" />

        {/* Course Badge & Title */}
        <div className="flex items-center gap-2 truncate">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md shrink-0 border border-emerald-200/60">
            <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="hidden md:inline">Diploma</span>
          </div>
          <h1 className="text-sm font-semibold text-slate-800 truncate" title={courseTitle}>
            {courseTitle}
          </h1>
        </div>
      </div>

      {/* Zone 2: Tools & Alison Top Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Alison Creator Guide (Text-Based Content Preparation) */}
        <button
          onClick={onOpenCreatorStudio}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-md transition-colors"
          title="How to Prepare Text-Based Content for Alison (Creator Studio)"
        >
          <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="hidden sm:inline">Creator Guide</span>
        </button>

        {/* Interactive Quiz Arena Button */}
        <button
          onClick={onOpenQuizArena}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 rounded-md transition-colors"
          title="Interactive Video Quizzes & Rapid Practice Arena"
        >
          <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-600 shrink-0" />
          <span className="hidden sm:inline">Quiz Arena</span>
        </button>

        {/* Newsletter Catalog Browser Button */}
        <button
          onClick={onOpenNewsletters}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-md transition-colors"
          title="Browse all 252 issues of The Zero Waste Kitchen"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="hidden lg:inline">252 Newsletters</span>
        </button>

        {/* AI Course Expander / Ingestion */}
        <button
          onClick={onOpenAiGenerator}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/60 rounded-md transition-colors"
          title="Generate or expand module from any newsletter using AI"
        >
          <Wand2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <span className="hidden md:inline">AI Module Builder</span>
        </button>

        {/* Download & Export Package Hub */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors"
          title="Download course as SCORM 1.2, Alison Publishing Kit, or Resell Package"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span>Export / Sell Course</span>
        </button>

        {/* Study Timer Badge */}
        <div
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-md"
          title="Study time logged in this session"
        >
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span className="tabular-nums font-mono text-slate-700">{formatTimer(studyMinutes)}</span>
        </div>

        {/* XP Counter */}
        <div
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 rounded-md"
          title="Gamified Alison XP Points"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="tabular-nums font-mono">{xpPoints} XP</span>
        </div>

        {/* Certify Now Button (Alison Signature CTA) */}
        <button
          onClick={onOpenCertify}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-emerald-700 hover:text-white bg-white hover:bg-emerald-600 border border-emerald-600 rounded-md transition-all shadow-xs"
        >
          <Award className="w-4 h-4" />
          <span>Certify Now</span>
        </button>
      </div>
    </header>
  );
};
