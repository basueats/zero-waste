import React from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  ClipboardList, 
  HelpCircle,
  Award,
  BookOpen
} from 'lucide-react';
import { CourseModule } from '../types/course';

interface AlisonSummaryViewProps {
  module: CourseModule;
  onStartAssessment: () => void;
  onPrev: () => void;
}

export const AlisonSummaryView: React.FC<AlisonSummaryViewProps> = ({
  module,
  onStartAssessment,
  onPrev,
}) => {
  const summary = module.summary || {
    title: `Module ${module.moduleNumber} Summary & Key Takeaways`,
    keyTakeaways: module.lessons.flatMap((l) => l.keyTakeaways).slice(0, 5),
    operationalChecklist: [
      'Implement root-to-stem and zero-waste prep station standards.',
      'Maintain tare-weighted scrap containers before disposal.',
      'Audit expiration dates daily using strict FIFO rotation.',
      'Check HACCP cooling and fermentation pH thresholds (pH ≤ 4.6).',
    ],
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 md:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 mb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Module {module.moduleNumber} · Alison Topic Summary
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            {summary.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review of core concepts, case study observations, and operational rules before taking the graded assessment.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-900 rounded-md text-xs font-semibold border border-blue-200/60">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Alison Standard Text Summary</span>
        </div>
      </div>

      {/* Key Takeaways Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs mb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Core Conceptual Takeaways</span>
        </div>

        <ul className="space-y-3">
          {summary.keyTakeaways.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-slate-700 text-sm leading-relaxed">
              <span className="w-2 h-2 rounded-full bg-emerald-600 mt-2 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Operational Kitchen Checklist */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-6 shadow-xs mb-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-950 mb-4">
          <ClipboardList className="w-4 h-4 text-emerald-700" />
          <span>Operational Implementation Checklist</span>
        </div>

        <div className="space-y-2.5">
          {summary.operationalChecklist.map((task, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 bg-white/80 rounded-lg border border-emerald-200/60 text-xs font-medium text-emerald-950"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{task}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pre-Assessment Readiness Card */}
      <div className="p-6 bg-slate-900 text-white rounded-xl shadow-md mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <HelpCircle className="w-4 h-4" />
            <span>Ready for the Module Assessment?</span>
          </div>
          <p className="text-xs text-slate-300 max-w-md">
            Test your comprehension of the reading topics and case studies. Scoring 80% or higher certifies your mastery of Module {module.moduleNumber}.
          </p>
        </div>

        <button
          onClick={onStartAssessment}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-lg shadow-md transition-all active:scale-98 cursor-pointer shrink-0"
        >
          <span>Start Module Assessment</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Topic 2</span>
        </button>

        <button
          onClick={onStartAssessment}
          className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg transition-colors"
        >
          <span>Proceed to Quiz</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
