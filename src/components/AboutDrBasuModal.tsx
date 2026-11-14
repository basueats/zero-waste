import React, { useEffect } from 'react';
import {
  X,
  Award,
  BookOpen,
  ChefHat,
  Compass,
  Globe2,
  Mail,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface AboutDrBasuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCOLADES = [
  'Silver Medal — International Young Chef Challenge, South Korea',
  'African Culinary Cup — South Africa',
  'Burjuman Young Chef of the Year — UAE',
  'Featured Chef — Emirates Culinary Guild Magazine',
];

const HOSPITALITY_JOURNEY = [
  { label: 'Early Crucible', places: 'Polo Floatel Kolkata · Lords Hotels & Resorts' },
  { label: 'Luxury Milestones', places: 'Taj Hotels · JW Marriott Marquis Dubai · The St. Regis Doha · Anantara Salalah' },
  { label: 'Culinary Leadership', places: 'Sheraton Grand Hotel, Dubai · Brigades of 35+ Chefs' },
  { label: 'Global Footprint', places: 'India · UAE · Qatar · Oman · Singapore · South Africa · South Korea' },
];

const THREE_PILLARS = [
  {
    title: 'Innovation with Integrity',
    desc: 'Engineering menus that are seasonal, cost-efficient, zero-waste, and mindful.',
  },
  {
    title: 'Mentorship with Meaning',
    desc: 'Empowering commis to sous chefs with technical precision, clarity, and human values.',
  },
  {
    title: 'Preservation with Passion',
    desc: 'Reviving culinary traditions and infusing zero-waste science with lasting cultural respect.',
  },
];

export const AboutDrBasuModal: React.FC<AboutDrBasuModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-4 bg-black text-white flex items-center justify-between gap-3 shrink-0">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">
              Founder &amp; Dean · Zero Waste Academy
            </p>
            <h2 className="text-sm sm:text-lg font-extrabold tracking-tight mt-0.5">
              About Dr. Chef Supritam Basu
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close About Dr. Supritam Basu dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Biography Body */}
        <div className="p-4 sm:p-7 overflow-y-auto space-y-6 text-xs sm:text-[13px] text-neutral-700 leading-relaxed">
          {/* Hero Profile Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-7 items-center bg-neutral-50 border border-neutral-200 rounded-2xl p-4 sm:p-6">
            <div className="md:col-span-4 flex justify-center">
              <div className="w-44 sm:w-52 aspect-[3/4] rounded-2xl overflow-hidden border border-neutral-200 shadow-md bg-[#0a2d6b] shrink-0">
                <img
                  src="/assets/aistudio/Untitled_design_0fea8cc4.png"
                  alt="Dr. Chef Supritam Basu"
                  decoding="async"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            <div className="md:col-span-8 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded bg-black text-white">
                  14+ Years 5-Star Hospitality
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Author · Culinary Mentor
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-neutral-900 tracking-tight">
                Where Philosophy Meets Food, and Fire Meets Mindfulness
              </h3>

              <blockquote className="border-l-2 border-black pl-3 italic text-neutral-600 text-xs sm:text-sm">
                &ldquo;True change begins in the unseen corners of the mind, where questions rise louder than
                answers.&rdquo;
              </blockquote>

              <p>
                Born on May 6, 1991 in Jodhpur, Rajasthan, and shaped by the honor and discipline of an Indian Army
                household, <strong>Dr. Chef Supritam Basu</strong> rose from one modest room and trainee shifts in
                Kolkata&apos;s floating kitchens to leading high-pressure five-star culinary brigades across seven
                countries.
              </p>
            </div>
          </div>

          {/* Story Phases */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200 bg-white space-y-2.5">
              <div className="flex items-center gap-2 text-neutral-900 font-extrabold text-xs sm:text-sm">
                <ChefHat className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>From Kolkata Stations to Global Five-Star Kitchens</span>
              </div>
              <p>
                Without shortcuts or formal privilege, Supritam mastered every kitchen station from scratch—beginning
                as a Trainee Chef at Polo Floatel Kolkata and Lords Hotels &amp; Resorts before advancing through{' '}
                <strong>Taj Hotels</strong>, <strong>JW Marriott Marquis Dubai</strong>,{' '}
                <strong>The St. Regis Doha</strong>, <strong>Anantara Salalah</strong>, and serving as Sous Chef at{' '}
                <strong>Sheraton Grand Hotel, Dubai</strong>.
              </p>
              <p>
                Guided early by mentor Chef Daniel, he built a quiet, standard-setting leadership style—leading
                brigades of 35+ chefs not with a raised voice, but with consistency, calm precision, and culinary food
                cost engineering.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200 bg-white space-y-2.5">
              <div className="flex items-center gap-2 text-neutral-900 font-extrabold text-xs sm:text-sm">
                <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Author, Philosopher &amp; Capital Markets Strategist</span>
              </div>
              <p>
                Beyond the pass, Dr. Supritam Basu is the published author of two acclaimed books:{' '}
                <em>Does the Mind Shape Reality?</em> (an exploration of consciousness, reflection, and awareness) and{' '}
                <em>Forgotten Flavours of Bengal</em> (a tribute to culinary roots, memory, and heritage).
              </p>
              <p className="flex items-start gap-2 pt-1">
                <TrendingUp className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <span>
                  As an <strong>NISM-certified capital market professional</strong>, he pairs culinary instinct with
                  financial discipline—helping hotels engineer zero-waste menus that protect margins while elevating
                  every guest plate.
                </span>
              </p>
            </div>
          </div>

          {/* Hospitality & Accolades Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
              <div className="flex items-center gap-2 text-neutral-900 font-extrabold text-xs uppercase tracking-wider">
                <Globe2 className="w-4 h-4 text-neutral-700" />
                <span>International Hospitality Trajectory</span>
              </div>
              <div className="space-y-2">
                {HOSPITALITY_JOURNEY.map((step) => (
                  <div key={step.label} className="text-xs">
                    <span className="font-bold text-neutral-900">{step.label}: </span>
                    <span className="text-neutral-600">{step.places}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
              <div className="flex items-center gap-2 text-neutral-900 font-extrabold text-xs uppercase tracking-wider">
                <Award className="w-4 h-4 text-amber-600" />
                <span>International Culinary Accolades</span>
              </div>
              <ul className="space-y-1.5">
                {ACCOLADES.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-neutral-700">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Three Pillars of Zero Waste Academy */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-neutral-900 font-extrabold text-xs uppercase tracking-wider">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>The Vision Behind Zero Waste Academy</span>
            </div>
            <p>
              Synthesizing 14+ years across global luxury kitchens with 252 issues of{' '}
              <em>The Zero Waste Kitchen</em>, Dr. Supritam Basu founded Zero Waste Academy around three enduring
              pillars—transforming kitchens from high-stress service units into conscious learning ecosystems:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {THREE_PILLARS.map((pillar) => (
                <div
                  key={pillar.title}
                  className="p-3.5 rounded-xl bg-white border border-neutral-200 space-y-1"
                >
                  <p className="font-extrabold text-neutral-900 text-xs">{pillar.title}</p>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 text-white text-center space-y-1">
            <p className="italic text-xs sm:text-sm text-neutral-200">
              &ldquo;In the hands of a mindful chef, food is not just nourishment — it&apos;s a story, a meditation,
              an offering.&rdquo;
            </p>
            <p className="text-[11px] font-bold text-emerald-400 tracking-wide uppercase">
              — Dr. Supritam Basu
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 text-neutral-600">
            <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span>
              Dr. Supritam Basu ·{' '}
              <a
                href="mailto:supritam.basu@supritamone.com"
                className="font-semibold text-black underline"
              >
                supritam.basu@supritamone.com
              </a>
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold cursor-pointer self-end sm:self-auto"
          >
            Close Biography
          </button>
        </div>
      </div>
    </div>
  );
};
