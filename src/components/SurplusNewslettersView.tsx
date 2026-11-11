import React, { useState } from 'react';
import { all252Newsletters } from '../data/newslettersCatalog';
import { initialCourseData } from '../data/zeroWasteCourseData';
import { 
  Search, 
  ExternalLink, 
  BookOpen, 
  Sparkles, 
  ArrowRight,
  GraduationCap,
  Play,
  FileText,
  Award,
  Layers,
  ChevronRight,
  Clock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface SurplusNewslettersViewProps {
  onOpenCourse: (courseId: string) => void;
  searchQuery: string;
}

export const SurplusNewslettersView: React.FC<SurplusNewslettersViewProps> = ({
  onOpenCourse,
  searchQuery,
}) => {
  const [viewMode, setViewMode] = useState<'modules' | 'issues'>('modules');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [internalSearch, setInternalSearch] = useState<string>('');

  const activeSearch = searchQuery || internalSearch;

  const categories = [
    'All',
    'Root-to-Stem',
    'Protein & Broths',
    'Fermentation & Pickling',
    'Bakery & Grains',
    'Commercial & Systems',
  ];

  const filteredNewsletters = all252Newsletters.filter((item) => {
    const matchesSearch = !activeSearch || 
      item.title.toLowerCase().includes(activeSearch.toLowerCase()) ||
      item.summary.toLowerCase().includes(activeSearch.toLowerCase()) ||
      item.primaryScrap.toLowerCase().includes(activeSearch.toLowerCase()) ||
      `#${item.issueNumber}`.includes(activeSearch);
    
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const modules = initialCourseData.modules;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                Accredited Course Curriculum
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Level 7 · Certified Diploma
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              The Zero Waste Kitchen — 252 Course Modules & Curriculum
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Dr. Chef Supritam Basu's 252-issue publication series synthesized into a comprehensive 12-Module commercial kitchen diploma. Learn biochemical mass-balance audits, root-to-stem knife mechanics, wild fermentation, and circular menu engineering.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={() => onOpenCourse('food-waste-prevention-chefs')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Course Player</span>
            </button>

            <a
              href="https://www.linkedin.com/newsletters/the-zero-waste-kitchen-7293401149716459520/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
            >
              <span>Original Publication</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>
        </div>

        {/* View Switcher: By 12 Modules vs By 252 Issues */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('modules')}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'modules'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>12 Course Modules</span>
            </button>
            <button
              onClick={() => setViewMode('issues')}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'issues'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All 252 Newsletter Issues</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search module topic, scrap focus (e.g. broccoli stems)..."
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* VIEW 1: THE 12 ACCREDITED COURSE MODULES */}
      {viewMode === 'modules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              The 12 Comprehensive Course Modules
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              18 Total Hours · 252 Newsletters Covered
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {modules.map((mod) => {
              const mappedIssues = all252Newsletters.filter((n) => n.moduleMapped === mod.moduleNumber);

              return (
                <div
                  key={mod.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          Module {mod.moduleNumber < 10 ? `0${mod.moduleNumber}` : mod.moduleNumber}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
                          {mod.newsletterRange}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-400">
                        {mod.estimatedHours} hrs
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors leading-snug">
                      {mod.title}
                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {mod.subtitle}
                    </p>

                    {/* Learning Outcomes Summary */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                      <span className="font-bold text-[11px] text-slate-800 uppercase tracking-wide block">
                        Core Competencies:
                      </span>
                      <p className="line-clamp-2 italic">
                        "{mod.learningOutcomes?.[0] || 'Mastering biochemical byproduct valorization.'}"
                      </p>
                    </div>

                    {/* Mapped newsletter issues badges */}
                    {mappedIssues.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] font-bold text-slate-400">Includes:</span>
                        {mappedIssues.slice(0, 3).map((issue) => (
                          <span
                            key={issue.issueNumber}
                            className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono"
                          >
                            #{issue.issueNumber} {issue.primaryScrap}
                          </span>
                        ))}
                        {mappedIssues.length > 3 && (
                          <span className="text-[10px] text-slate-400">+{mappedIssues.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Module Footer & Launch Button */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">
                      {mod.lessons.length} Lessons · {mod.assessment?.questions?.length || 3} Quiz Qs
                    </span>

                    <button
                      onClick={() => onOpenCourse('food-waste-prevention-chefs')}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 rounded-lg transition-all"
                    >
                      <span>Study Module in Player</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: ALL 252 INDIVIDUAL NEWSLETTER ISSUES */}
      {viewMode === 'issues' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${
                    categoryFilter === cat
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredNewsletters.length} of 252 issues
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNewsletters.map((item) => (
              <div
                key={item.issueNumber}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Issue #{item.issueNumber}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>

                  <div className="pt-2 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800">Scrap Focus: </span>
                    <span>{item.primaryScrap}</span>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Mapped to Module {item.moduleMapped}
                  </span>
                  <button
                    onClick={() => onOpenCourse('food-waste-prevention-chefs')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Open in Course</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
