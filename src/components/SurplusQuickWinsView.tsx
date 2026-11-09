import React from 'react';
import { quickWinGuides, QuickWinGuide } from '../data/surplusData';
import { 
  Check, 
  ChefHat, 
  Layers, 
  Utensils, 
  Clock, 
  Download, 
  Sparkles, 
  DollarSign, 
  HelpCircle,
  Trophy,
  ArrowRight,
  Calculator
} from 'lucide-react';

interface SurplusQuickWinsViewProps {
  sectionId: string;
  onOpenCourse: (courseId: string) => void;
  onOpenCalculator?: () => void;
}

export const SurplusQuickWinsView: React.FC<SurplusQuickWinsViewProps> = ({
  sectionId,
  onOpenCourse,
  onOpenCalculator,
}) => {
  const guide: QuickWinGuide = quickWinGuides[sectionId] || quickWinGuides['prep-waste'];

  // START HERE SECTION (Based on the user's FAQ text about Supritamone Academy)
  if (sectionId === 'start-here') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
              Welcome to Supritamone Academy
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Start Here — Read First
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Written by Dr. Chef Supritam Basu, PhD, CEC · Founder & Dean, Supritamone Academy
            </p>
          </div>

          <div className="prose prose-slate text-xs sm:text-sm leading-relaxed text-slate-700 space-y-4">
            <p className="text-sm font-semibold text-slate-900">
              Welcome to Supritamone Academy, the food waste learning platform created for commercial chefs and culinary leaders.
            </p>
            <p>
              Think of Supritamone Academy as a master food waste prevention learning platform in your pocket, available any time you need it.
            </p>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">
                What is inside Supritamone Academy?
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <li className="flex items-center gap-2">✓ Real-time mass-balance and food waste profit loss calculator</li>
                <li className="flex items-center gap-2">✓ A searchable catalogue of 500+ byproducts with upcycling tips</li>
                <li className="flex items-center gap-2">✓ A library of 500+ zero-waste recipes (Coffee syrup, Croissant sauce)</li>
                <li className="flex items-center gap-2">✓ CPD Certified Food Waste Prevention courses for chefs</li>
                <li className="flex items-center gap-2">✓ Downloadable resources, SOP worksheets and kitchen posters</li>
                <li className="flex items-center gap-2">✓ Quick Wins guides for Prep, Buffet, Plate, and Spoilage waste</li>
                <li className="flex items-center gap-2">✓ Deep-dive into circular menu engineering</li>
                <li className="flex items-center gap-2">✓ Live monthly Q&A sessions for direct support</li>
                <li className="flex items-center gap-2">✓ 252 LinkedIn newsletters searchable directory</li>
              </ul>
            </div>

            <h3 className="font-bold text-slate-900 text-sm pt-2">
              How to Get the Most Out of Supritamone Academy:
            </h3>
            <ol className="space-y-2 list-decimal list-inside pl-1 text-xs">
              <li><strong>Step 1:</strong> Start with the Quick Wins on the left sidebar to immediately plug the easiest waste leaks in your kitchen.</li>
              <li><strong>Step 2:</strong> Enroll in the <em>Advanced Diploma in Sustainable Culinary Arts</em> to earn your accredited CPD Diploma.</li>
              <li><strong>Step 3:</strong> Search the Byproduct Catalogue when handling prep trimmings like pineapple cores, broccoli stems, and day-old croissants.</li>
              <li><strong>Step 4:</strong> Post questions on the <em>Ask Dr. Chef Supritam Basu</em> channel whenever you need custom advice for your restaurant or hotel menu.</li>
            </ol>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Ready to begin?</span>
            <button
              onClick={() => onOpenCourse('food-waste-prevention-chefs')}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>Explore the Master Diploma</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // OTHER COMMUNITY CHANNELS
  if (sectionId === 'helpdesk') {
    return (
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Supritamone Academy Helpdesk & Support</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Need help with your team membership, enterprise onboarding, CPD certificate verification, or app access?
        </p>
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-2">
          <p className="font-bold">Contact Supritamone Academy Support:</p>
          <p>Email: <strong>support@supritamone.academy</strong></p>
          <p>Live Q&A Support: Every 2nd Thursday of the month at 15:00 CET via Zoom.</p>
        </div>
      </div>
    );
  }

  if (sectionId === 'your-wins') {
    return (
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Your Kitchen Wins & Triumphs</h2>
          <p className="text-xs text-slate-500">Celebrate reduction milestones achieved by chefs across the Supritamone Academy community.</p>
        </div>
        <div className="space-y-3">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
            <p className="font-bold text-emerald-900">🏆 The Grand Hotel Zurich · Buffet Waste Down 42%</p>
            <p className="text-emerald-800">Switched all morning egg stations to 1/3 GN shallow pans and saved over $3,400 on food cost in March alone!</p>
          </div>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
            <p className="font-bold text-emerald-900">🏆 Bistro Flora (Copenhagen) · 100% Cauliflower Utilization</p>
            <p className="text-emerald-800">Using Dr. Chef Supritam Basu's Cauliflower Leaf Chutney recipe to eliminate 25kg of weekly leaf disposal.</p>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD QUICK WIN GUIDE
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
              Quick Win Protocol
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {guide.title}
            </h1>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 inline-block">
              {guide.estimatedSaving}
            </span>
          </div>
        </div>

        {/* Chef Rule callout */}
        <div className="p-4 bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-medium italic">
          "{guide.chefRule}" — Dr. Chef Supritam Basu
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {guide.summary}
        </p>

        {/* Live Waste Calculator Callout Card */}
        {onOpenCalculator && (
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-900">Calculate Exact Losses for Your Kitchen</p>
                <p className="text-[11px] text-slate-500">Run the real-time mass-balance simulator with your covers and menu prices.</p>
              </div>
            </div>
            <button
              onClick={onOpenCalculator}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shrink-0 shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Open Waste Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Action Steps */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">
          Standard Operating Procedures (SOP):
        </h3>

        <div className="space-y-4">
          {guide.keySteps.map((s) => (
            <div key={s.step} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                {s.step}
              </span>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">{s.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">
          Kitchen Shift Verification Checklist:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {guide.checklists.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
