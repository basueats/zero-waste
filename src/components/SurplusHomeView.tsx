import React from 'react';
import { 
  surplusCourses, 
  surplusByproducts, 
  surplusRecipes 
} from '../data/surplusData';
import { 
  Play, 
  ArrowRight, 
  BookOpen, 
  ChefHat, 
  Award, 
  Clock, 
  Calendar, 
  Sparkles,
  CheckCircle2,
  FileText,
  Video,
  Calculator
} from 'lucide-react';

interface SurplusHomeViewProps {
  onOpenCourse: (courseId: string) => void;
  onOpenLibrary: () => void;
  onOpenCertify: () => void;
  onOpenSection: (sectionId: string) => void;
}

export const SurplusHomeView: React.FC<SurplusHomeViewProps> = ({
  onOpenCourse,
  onOpenLibrary,
  onOpenCertify,
  onOpenSection,
}) => {
  const masterCourse = surplusCourses[0];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded">
              Advanced Food Waste Science
            </span>
            <span className="text-xs text-slate-300">· Dr. Chef Supritam Basu, PhD, CEC</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Think Differently About Food Waste in Your Kitchen
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Welcome to Supritamone Academy. Access commercial kitchen waste prevention courses, accredited CPD certification, a searchable byproduct catalogue, live mass-balance calculators, and proven zero-waste recipes.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenCourse(masterCourse.id)}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Resume Chef Diploma (14%)</span>
            </button>
            <button
              onClick={() => onOpenSection('waste-calculator')}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 rounded-lg border border-emerald-500/40 transition-colors cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Waste Calculator</span>
            </button>
            <button
              onClick={() => onOpenSection('prep-waste')}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-xs transition-colors cursor-pointer"
            >
              Explore Quick Wins
            </button>
            <button
              onClick={onOpenCertify}
              className="px-4 py-2.5 text-xs font-semibold text-blue-200 bg-blue-900/40 hover:bg-blue-850/60 rounded-lg border border-blue-400/30 transition-colors cursor-pointer"
            >
              CPD Certificate Status
            </button>
          </div>
        </div>

        {/* Decorative corner badge */}
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metric Tiles Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => onOpenCourse(masterCourse.id)}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-blue-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Curriculum</span>
          </div>
          <p className="text-xl font-extrabold text-slate-900">Zero Waste Kitchen</p>
          <p className="text-xs text-slate-500 mt-0.5">6 Accredited Modules</p>
        </div>

        <div 
          onClick={onOpenLibrary}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-blue-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <ChefHat className="w-5 h-5 text-emerald-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Catalogue</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{surplusByproducts.length} Items</p>
          <p className="text-xs text-slate-500 mt-0.5">Byproducts & Upcycling Tips</p>
        </div>

        <div 
          onClick={onOpenLibrary}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-blue-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Formulations</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{surplusRecipes.length} Recipes</p>
          <p className="text-xs text-slate-500 mt-0.5">Zero-Waste Tested SOPs</p>
        </div>

        <div 
          onClick={onOpenCertify}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-blue-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Accreditation</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">18.0 CPD</p>
          <p className="text-xs text-slate-500 mt-0.5">Verified Culinary Credits</p>
        </div>
      </div>

      {/* Featured Grid: In-Progress Course & Spotlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: In-Progress Master Course */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
                Continue Learning
              </span>
              <span className="text-xs text-slate-400 font-medium">12 Lessons · 3 Hours</span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {masterCourse.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {masterCourse.subtitle}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Progress: Module 2 (Root-to-Stem Systems)</span>
                <span className="text-blue-600">14% Completed</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-[14%]" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={onOpenCertify}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              View Certificate Preview
            </button>
            <button
              onClick={() => onOpenCourse(masterCourse.id)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <span>Resume Lesson</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right 1 Col: Upcoming Live Event Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-600">
              <Calendar className="w-4 h-4" />
              <span>Next Live Monthly Call</span>
            </div>

            <h3 className="font-bold text-slate-900 text-base leading-tight">
              Live Masterclass with Dr. Chef Supritam Basu
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              April 2026 session: Bring your questions on spring vegetable trimming audits and banquet bread repurposing.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100">
              <p className="text-slate-700 font-medium">🗓️ Thursday, April 9 · 15:00 CET</p>
              <p className="text-slate-500 text-[11px]">Duration: 60 minutes via Zoom live link</p>
            </div>
          </div>

          <button
            onClick={() => onOpenSection('monthly-recordings')}
            className="w-full py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Watch Past Recordings</span>
          </button>
        </div>
      </div>

      {/* Featured Byproduct & Recipe Spotlight Row */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            Highlighted Zero-Waste Formulations
          </h3>
          <button
            onClick={onOpenLibrary}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Browse all library items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {surplusRecipes.slice(0, 3).map((r) => (
            <div
              key={r.id}
              onClick={onOpenLibrary}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={r.image}
                    alt={r.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/ingredients/lemon.jpg';
                    }}
                  />
                  <span className="absolute top-2.5 left-2.5 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                    {r.category}
                  </span>
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    {r.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {r.chefTips}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 text-[11px] font-bold text-blue-600 flex items-center justify-between">
                <span>View recipe SOP</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
