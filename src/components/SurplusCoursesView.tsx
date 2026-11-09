import React, { useState } from 'react';
import { 
  surplusCourses, 
  SurplusCourse 
} from '../data/surplusData';
import { 
  Play, 
  Clock, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  GraduationCap,
  Layers,
  FlaskConical,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

interface SurplusCoursesViewProps {
  onOpenCourse: (courseId: string) => void;
  onOpenQuizModal?: () => void;
  searchQuery: string;
}

export const SurplusCoursesView: React.FC<SurplusCoursesViewProps> = ({
  onOpenCourse,
  searchQuery,
}) => {
  const [courseFilter, setCourseFilter] = useState<'all' | 'my'>('all');
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>('food-waste-prevention-chefs');

  const filteredCourses = surplusCourses.filter((course) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      course.title.toLowerCase().includes(q) ||
      course.subtitle.toLowerCase().includes(q) ||
      course.badge.toLowerCase().includes(q) ||
      course.lessons?.some((l) => l.title.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q))
    );
  });

  const featuredCourse = surplusCourses.find((c) => c.isMasterCourse) || surplusCourses[0];

  const toggleExpand = (courseId: string) => {
    setExpandedCourseId(expandedCourseId === courseId ? null : courseId);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded">
              Official Author, Chef Curriculum
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              CPD Certified Level 7
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Zero Waste Kitchen Courses & Modules
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete food waste prevention curriculum synthesized from 252 issues of "The Zero Waste Kitchen" by Dr. Chef Supritam Basu, PhD, CEC.
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setCourseFilter('all')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              courseFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Courses ({surplusCourses.length})
          </button>
          <button
            onClick={() => setCourseFilter('my')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              courseFilter === 'my'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Courses (2)
          </button>
        </div>
      </div>

      {/* Culinary Courses Sister Platform Callout */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              Looking for Classical Technique & Culinary Science?
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Explore our sister platform <strong>Foundations of Food</strong> for knife skills, stocks, mother sauces, and butchery.
            </p>
          </div>
        </div>
        <a
          href="https://foundations-of-food.ai.studio/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shrink-0 shadow-xs"
        >
          <span>Open Culinary Courses</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Featured Master Course Hero Card */}
      {featuredCourse && (!searchQuery || featuredCourse.title.toLowerCase().includes(searchQuery.toLowerCase())) && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Media Banner */}
            <div className="lg:col-span-5 relative min-h-[240px] lg:min-h-[300px] bg-slate-900">
              <img
                src={featuredCourse.coverImage}
                alt={featuredCourse.title}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
              
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="bg-blue-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-md tracking-wide uppercase shadow-xs">
                  {featuredCourse.badge}
                </span>
                <span className="bg-slate-900/80 text-white text-[11px] font-medium px-2.5 py-1 rounded-md backdrop-blur-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {featuredCourse.duration}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-xs text-blue-200 font-bold">{featuredCourse.instructor}, {featuredCourse.instructorCredentials}</p>
                <p className="text-sm font-semibold text-white drop-shadow-xs">12 In-Depth Modules · Complete 252 Publication Series</p>
              </div>
            </div>

            {/* Course Content Details */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>The Flagship Masterclass Diploma</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {featuredCourse.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  {featuredCourse.subtitle}
                </p>

                {/* Progress bar */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs mb-1.5 font-medium text-slate-600">
                    <span>Diploma Progress</span>
                    <span className="font-bold text-blue-600">{featuredCourse.progressPercent}% Completed</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${featuredCourse.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => toggleExpand(featuredCourse.id)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{expandedCourseId === featuredCourse.id ? 'Hide Modules' : 'Preview 12 Modules'}</span>
                  {expandedCourseId === featuredCourse.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => onOpenCourse(featuredCourse.id)}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Open Full Course Player</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded 12 Modules preview within Master course */}
          {expandedCourseId === featuredCourse.id && (
            <div className="border-t border-slate-200 bg-slate-50/70 p-6 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  The 12 Master Curriculum Modules (Issues #1–#252)
                </h4>
                <span className="text-xs font-mono text-slate-500">18 Hours Total Content</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {featuredCourse.lessons?.map((mod, mIdx) => (
                  <div
                    key={mod.id}
                    onClick={() => onOpenCourse(featuredCourse.id)}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-2xs transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        Module {mIdx + 1 < 10 ? `0${mIdx + 1}` : mIdx + 1}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{mod.duration}</span>
                    </div>

                    <h5 className="font-bold text-slate-900 text-xs leading-snug line-clamp-1">
                      {mod.title.replace(/^Module \d+:\s*/, '')}
                    </h5>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {mod.description}
                    </p>

                    {mod.scientificConcept && (
                      <div className="text-[10px] text-slate-600 pt-1 flex items-center gap-1 text-slate-700">
                        <FlaskConical className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span className="truncate font-mono">{mod.scientificConcept}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Complete Course Catalog Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Author, Chef Culinary Course Tracks
            </h3>
            <p className="text-xs text-slate-500">
              Specialized deep-dive courses with complete modules, practical SOPs, and culinary formulas.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredCourses.length} courses
          </span>
        </div>

        <div className="space-y-6">
          {filteredCourses.map((course) => {
            const isExpanded = expandedCourseId === course.id;

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
              >
                {/* Main Course Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  {/* Thumbnail / Cover */}
                  <div className="lg:col-span-4 relative min-h-[180px] lg:min-h-full bg-slate-900">
                    <img
                      src={course.coverImage}
                      alt={course.title}
                      className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    
                    <div className="absolute top-3 left-3">
                      <span className="bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs tracking-wider uppercase">
                        {course.badge}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="flex items-center gap-1 font-mono text-[11px] bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                        <Clock className="w-3 h-3" />
                        {course.duration}
                      </span>
                      <span className="text-[11px] font-bold bg-blue-600/90 px-2 py-0.5 rounded">
                        {course.newsletterRange}
                      </span>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="lg:col-span-8 p-6 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                          {course.lessonCount} Modules Included
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          Lead: {course.instructor}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-lg leading-snug hover:text-blue-600 transition-colors">
                        {course.title}
                      </h4>

                      <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                        {course.subtitle}
                      </p>
                    </div>

                    {/* Progress Bar & Actions */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleExpand(course.id)}
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                          <span>{isExpanded ? 'Hide Modules' : `Explore ${course.lessonCount} Modules`}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenCourse(course.id)}
                          className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                        >
                          View Curriculum
                        </button>
                        <button
                          onClick={() => onOpenCourse(course.id)}
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs hover:shadow transition-all"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Start Course</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Modules List with Proper Descriptions */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50/80 p-5 space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Course Modules & Technical Formulations
                      </span>
                      <span className="text-xs text-blue-600 font-semibold">
                        Synthesized from {course.newsletterRange}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {course.lessons?.map((mod, lIdx) => (
                        <div
                          key={mod.id}
                          onClick={() => onOpenCourse(course.id)}
                          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-2xs transition-all cursor-pointer space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              Module {lIdx + 1}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">{mod.duration}</span>
                          </div>

                          <h5 className="font-bold text-slate-900 text-xs leading-snug">
                            {mod.title}
                          </h5>

                          {mod.description && (
                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                              {mod.description}
                            </p>
                          )}

                          {mod.culinaryFormula && (
                            <div className="bg-blue-50/60 p-2 rounded-lg border border-blue-100 text-[10px] font-mono text-blue-900 truncate">
                              <strong>Formula: </strong>{mod.culinaryFormula}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
