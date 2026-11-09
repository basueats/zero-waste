import React from 'react';
import { 
  GraduationCap, 
  ExternalLink, 
  BookOpen, 
  ChefHat, 
  Flame, 
  UtensilsCrossed, 
  Layers, 
  Award, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Maximize2
} from 'lucide-react';

interface SurplusCulinaryCoursesViewProps {
  onBackToZeroWaste?: () => void;
}

export const SurplusCulinaryCoursesView: React.FC<SurplusCulinaryCoursesViewProps> = ({
  onBackToZeroWaste,
}) => {
  const portalUrl = 'https://foundations-of-food.ai.studio/';

  const culinaryModules = [
    {
      title: 'Professional Knife Skills & Classical Precision Cuts',
      desc: 'Master julienne, brunoise, chiffonade, tourne, and batonnet cuts with ergonomic stance and knife sharpening maintenance.',
      duration: '4 Modules · 18 Video Lessons',
      level: 'Fundamental to Advanced'
    },
    {
      title: 'Stocks, Consommés & Classical Mother Sauces',
      desc: 'The complete canon of Espagnole, Velouté, Béchamel, Hollandaise, and Tomate, plus clarification and reduction sauces.',
      duration: '5 Modules · 22 Video Lessons',
      level: 'Core Professional'
    },
    {
      title: 'Heat Transfer Thermodynamics: Convection, Conduction & Radiation',
      desc: 'Deep molecular physics of the Maillard reaction, caramelization, protein coagulation, and starch gelatinization.',
      duration: '6 Modules · 24 Video Lessons',
      level: 'Science & Kitchen Physics'
    },
    {
      title: 'Whole-Animal & Commercial Seafood Fabrication',
      desc: 'Breakdown of primals, sub-primals, poultry trussing, round/flat fish filleting, and maximum yield carcass harvesting.',
      duration: '6 Modules · 20 Video Lessons',
      level: 'Butchery Specialization'
    },
    {
      title: 'Flavor Architecture: Salt, Fat, Acid & Umami Dynamic Balance',
      desc: 'Formulation theory for palate balance, salivary stimulation, volatile aroma preservation, and sensory pairing.',
      duration: '4 Modules · 16 Video Lessons',
      level: 'Culinary Sensory Analysis'
    },
    {
      title: 'Kitchen Brigade Station Management & Modern Service',
      desc: 'Classical Escoffier brigade hierarchy adapted for contemporary high-volume kitchens and kitchen speed protocols.',
      duration: '3 Modules · 12 Video Lessons',
      level: 'Operations & Leadership'
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>FOUNDATIONS OF FOOD · SISTER PLATFORM</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Culinary Courses & Foundations of Food
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Expand your culinary repertoire beyond waste prevention with Dr. Chef Supritam Basu's comprehensive classical and contemporary culinary training portal.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <span>Launch Foundations of Food</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            {onBackToZeroWaste && (
              <button
                onClick={onBackToZeroWaste}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/10 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Zero Waste Kitchen Course</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Direct Link Card & Portal Launcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900">Foundations of Food Portal</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Live URL Connected
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Direct access to interactive culinary modules, chef recipe formulation labs, and technique masterclasses.
            </p>
            <p className="text-xs font-mono text-emerald-700 mt-1.5 flex items-center gap-1.5">
              <span>URL:</span>
              <a 
                href={portalUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-emerald-900 font-semibold"
              >
                https://foundations-of-food.ai.studio/
              </a>
            </p>
          </div>
        </div>

        <a
          href={portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all group"
        >
          <span>Open Full Culinary Courses Portal</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-emerald-400" />
        </a>
      </div>

      {/* Curriculum Overview Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Curated Culinary Curriculum
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Integrated foundational and advanced brigade coursework on foundations-of-food.ai.studio
            </p>
          </div>
          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Explore all modules</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {culinaryModules.map((mod, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Module 0{idx + 1}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    {mod.duration}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors leading-snug">
                  {mod.title}
                </h4>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {mod.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  {mod.level}
                </span>
                <a
                  href={portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 font-bold hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Launch Module</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Embedded Live Preview Frame */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">Live Portal Preview:</span>
            <span className="text-slate-400 font-mono text-[11px]">https://foundations-of-food.ai.studio/</span>
          </div>
          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-md text-white font-semibold transition-colors"
          >
            <span>Open in Full Window</span>
            <Maximize2 className="w-3 h-3" />
          </a>
        </div>
        <div className="w-full h-[600px] bg-slate-100 relative">
          <iframe
            src={portalUrl}
            title="Foundations of Food Portal"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>
    </div>
  );
};
