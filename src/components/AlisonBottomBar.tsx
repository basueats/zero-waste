import React from 'react';
import { 
  Info, 
  MessageSquare, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft 
} from 'lucide-react';

interface AlisonBottomBarProps {
  moduleNumber: number;
  moduleProgressPercent: number;
  totalCourseProgressPercent: number;
  xpPoints: number;
  onNext: () => void;
  onPrev: () => void;
  canPrev: boolean;
  canNext: boolean;
  nextLabel?: string;
}

export const AlisonBottomBar: React.FC<AlisonBottomBarProps> = ({
  moduleNumber,
  moduleProgressPercent,
  totalCourseProgressPercent,
  xpPoints,
  onNext,
  onPrev,
  canPrev,
  canNext,
  nextLabel = 'Next',
}) => {
  return (
    <footer className="h-16 bg-[#0c2438] text-white flex items-center justify-between px-2 sm:px-4 fixed bottom-0 left-0 right-0 z-40 shadow-lg select-none border-t border-slate-800">
      {/* Left Block: Module Progress Indicator (matches screenshot) */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0 pr-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
          <span>Module {moduleNumber} Progress</span>
          <span className="font-bold text-white font-mono">{moduleProgressPercent}%</span>
          <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-white hidden sm:inline" />
        </div>

        {/* Message / Notes button */}
        <button
          className="p-1.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1 text-xs"
          title="Community Discussion & Learner Notes"
          onClick={() => {
            alert('Community Notes: You are connected to the Alison culinary sustainability peer cohort.');
          }}
        >
          <MessageSquare className="w-4 h-4 text-sky-400" />
          <span className="text-[10px] font-bold">+</span>
        </button>
      </div>

      {/* Center Block: Social Proof Progress Bar (matches screenshot) */}
      <div className="flex-1 max-w-2xl mx-2 sm:mx-6 hidden md:flex items-center gap-3">
        <div className="flex-1 relative bg-slate-800 h-7 rounded-full overflow-hidden border border-slate-700/80 flex items-center px-4">
          {/* Fill Bar */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-sky-500 to-teal-400 transition-all duration-500 opacity-90"
            style={{ width: `${Math.max(8, totalCourseProgressPercent)}%` }}
          />

          {/* Social Proof Text */}
          <span className="relative z-10 text-[11px] font-medium text-white truncate drop-shadow-xs">
            You&apos;re learning with 62,840 others · Diploma in Zero Waste Kitchen
          </span>
        </div>

        {/* XP Badge */}
        <div className="flex items-center gap-1 bg-[#facc15] text-[#713f12] px-2.5 py-1 rounded-full text-xs font-extrabold shadow-xs shrink-0 select-none">
          <Sparkles className="w-3 h-3 text-[#713f12]" />
          <span>XP {xpPoints}</span>
          <Info className="w-3 h-3 opacity-70" />
        </div>
      </div>

      {/* Right Block: Navigation Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onPrev}
          disabled={!canPrev}
          className={`flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
            canPrev
              ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white cursor-pointer'
              : 'bg-slate-900/40 text-slate-600 cursor-not-allowed'
          }`}
          title="Go back to previous topic"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Back</span>
        </button>

        {/* Signature Alison Next Button */}
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 sm:px-8 py-2.5 bg-[#009b52] hover:bg-[#008647] text-white font-extrabold text-sm rounded-md shadow-md transition-all active:scale-98 cursor-pointer"
        >
          <span>{nextLabel}</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </footer>
  );
};
