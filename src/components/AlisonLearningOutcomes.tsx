import React from 'react';
import { ArrowRight, Leaf, DollarSign, CloudRain, BookOpen } from 'lucide-react';
import { CourseModule } from '../types/course';

interface AlisonLearningOutcomesProps {
  module: CourseModule;
  onStartLessons: () => void;
}

export const AlisonLearningOutcomes: React.FC<AlisonLearningOutcomesProps> = ({
  module,
  onStartLessons,
}) => {
  return (
    <div className="max-w-4xl mx-auto py-6 px-4 md:px-8">
      {/* Module Kicker & Overview Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Module {module.moduleNumber} · The Zero Waste Kitchen
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">
            {module.title}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {module.subtitle} · Synthesized from {module.newsletterRange}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md shrink-0">
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>{module.lessons.length} Core Topics</span>
          <span>·</span>
          <span>{module.estimatedHours} hrs</span>
        </div>
      </div>

      {/* Signature Alison Yellow/Lime Learning Outcomes Card (Pixel-matched to user screenshot) */}
      <div className="bg-[#f7fae8] border border-[#e2ebb8] rounded-xl p-6 md:p-10 shadow-xs mb-8">
        <h3 className="text-2xl md:text-3xl font-extrabold text-[#3a451d] tracking-tight mb-4">
          Learning Outcomes
        </h3>

        <p className="text-sm md:text-base text-slate-700 font-medium mb-6">
          After completing this module, you will be able to:
        </p>

        <ul className="space-y-4">
          {module.learningOutcomes.map((outcome, idx) => {
            // Highlight the initial Bloom action verb
            const words = outcome.split(' ');
            const verb = words[0];
            const rest = words.slice(1).join(' ');

            return (
              <li key={idx} className="flex items-start gap-3.5 text-slate-800 text-sm md:text-base leading-relaxed">
                {/* Alison Square Bullet */}
                <span className="w-2 h-2 bg-[#4c5b23] rounded-xs mt-2 shrink-0 select-none" />
                <span>
                  <strong className="font-bold text-[#2e3914]">{verb}</strong> {rest}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Visual Module Showcase & Interactive Video Badge */}
      {module.lessons?.[0]?.heroImage && (
        <div className="mb-8 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 text-white relative shadow-md group">
          <img
            src={module.lessons[0].heroImage}
            alt={module.title}
            referrerPolicy="no-referrer"
            className="w-full h-48 sm:h-64 object-cover opacity-80 group-hover:scale-102 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 bg-rose-600 text-white font-bold text-[10px] rounded-md uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Interactive Video Masterclass
              </span>
              <span className="text-xs text-slate-300 font-medium">· In-Video Checkpoint Quizzes</span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white drop-shadow-sm">
              {module.lessons[0].video?.title || module.lessons[0].title}
            </h4>
            <p className="text-xs text-slate-300 mt-1 line-clamp-1">
              Presented by {module.lessons[0].video?.instructor || 'Chef Elena Vance'} · Master Culinary Sustainability
            </p>
          </div>
        </div>
      )}

      {/* Scrap Diversion Benchmark Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Average Diversion</div>
            <div className="text-base font-bold text-slate-900">85% to 95%</div>
            <div className="text-[11px] text-emerald-700">Landfill reduction</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Annual Yield Value</div>
            <div className="text-base font-bold text-slate-900">$320 – $1,200</div>
            <div className="text-[11px] text-amber-700">Per kitchen station</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Methane Abatement</div>
            <div className="text-base font-bold text-slate-900">28x Impact Factor</div>
            <div className="text-[11px] text-sky-700">CH4 avoided</div>
          </div>
        </div>
      </div>

      {/* CTA to start lessons */}
      <div className="flex items-center justify-between p-4 bg-slate-100 rounded-xl">
        <div className="text-xs text-slate-600">
          Ready to begin? Start with Topic 1 of this module.
        </div>
        <button
          onClick={onStartLessons}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-xs transition-colors"
        >
          <span>Start Module Lessons</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
