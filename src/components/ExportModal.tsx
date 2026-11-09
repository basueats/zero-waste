import React from 'react';
import { 
  X, 
  Download, 
  Check, 
  Package, 
  FileText, 
  Globe, 
  DollarSign, 
  Layers, 
  Printer, 
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { CourseOverview } from '../types/course';
import { 
  exportScormPackage, 
  exportAlisonPublishingKit, 
  exportUdemyTeachableKit, 
  exportPrintableCourseHandbook, 
  exportCourseMarkdown, 
  exportCommercialResellPack 
} from '../utils/exportFormats';

interface ExportModalProps {
  course: CourseOverview;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ course, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = React.useState<'scorm' | 'alison' | 'resell' | 'handbook' | 'udemy'>('alison');
  const [downloading, setDownloading] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async (type: string, fn: () => Promise<void> | void) => {
    try {
      setDownloading(type);
      await fn();
    } catch (err) {
      console.error('Export failed', err);
      alert('Export failed. Please check browser permissions for file downloads.');
    } finally {
      setTimeout(() => setDownloading(null), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700">
              <Package className="w-4 h-4" />
              <span>Multi-Platform Export & Course Distribution Studio</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Download Course & Publish Everywhere
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Publish to Alison, upload to any LMS (SCORM 1.2), or sell directly on Gumroad, Etsy, & Shopify.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 flex items-center gap-2 overflow-x-auto bg-white shrink-0">
          <button
            onClick={() => setActiveTab('alison')}
            className={`py-3.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'alison'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Alison Publishing Kit</span>
          </button>

          <button
            onClick={() => setActiveTab('scorm')}
            className={`py-3.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'scorm'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>SCORM 1.2 / LMS Zip</span>
          </button>

          <button
            onClick={() => setActiveTab('resell')}
            className={`py-3.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'resell'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Sell Course (Gumroad/Etsy/Shopify)</span>
          </button>

          <button
            onClick={() => setActiveTab('handbook')}
            className={`py-3.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'handbook'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Printable Handbook & E-Book</span>
          </button>

          <button
            onClick={() => setActiveTab('udemy')}
            className={`py-3.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'udemy'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Udemy & Teachable</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-700">
          {/* TAB 1: Alison Publishing Kit */}
          {activeTab === 'alison' && (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">
                    Alison Course Publisher Ingestion Package
                  </h3>
                  <p className="text-xs text-emerald-800 mt-1">
                    Everything required to submit and publish this course on{' '}
                    <a
                      href="https://alison.com/publish"
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-bold"
                    >
                      alison.com/publish
                    </a>
                    . Formatted specifically to Alison’s learning outcome standards, module architecture, and assessment formats.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-xs font-bold text-slate-900 mb-2">Package Contents:</div>
                  <ul className="text-xs space-y-2 text-slate-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span><strong>alison-curriculum-package.json</strong> (Modules, Outcomes, Topics)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span><strong>alison-learning-outcomes.csv</strong> (Bloom’s Taxonomy verbs)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span><strong>alison-quiz-bank.csv</strong> (Graded Q&A with rationales)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span><strong>alison-text-based-modules.md</strong> (Topic 1: Concept, Topic 2: Case Study, Summary, Quiz)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span><strong>alison-course-submission-guide.md</strong> (Step-by-step walkthrough)</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 mb-1">Monetization on Alison:</div>
                    <p className="text-xs text-slate-600">
                      Alison pays publishers through ad revenue sharing and digital/parchment diploma certificate sales. Courses in the Sustainability & Food Safety categories enjoy high completion rates.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <span>Target Category:</span>
                    <strong className="text-slate-800">Hospitality & Food Safety</strong>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
                <a
                  href="https://alison.com/topic/learn/66252/learning-outcomes"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                >
                  <span>View Alison Learning Outcomes reference</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => handleExport('alison', () => exportAlisonPublishingKit(course))}
                  disabled={downloading === 'alison'}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {downloading === 'alison' ? 'Generating Zip...' : 'Download Alison Publishing Kit (.zip)'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SCORM 1.2 / LMS Package */}
          {activeTab === 'scorm' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-950">
                    Standard SCORM 1.2 / HTML5 LMS Package
                  </h3>
                  <p className="text-xs text-blue-800 mt-1">
                    Uploadable directly to Moodle, Canvas LMS, Blackboard, TalentLMS, Teachable, or any SCORM-compliant corporate portal.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="font-bold text-slate-800">What’s included in this SCORM archive:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <strong className="text-slate-900 block mb-1">imsmanifest.xml</strong>
                    Standard manifest structure registering all 12 modules, learning outcomes, and assessment SCOs.
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <strong className="text-slate-900 block mb-1">scorm-api.js & course-data.js</strong>
                    Built-in LMS tracking API connecting to LMSInitialize, LMSSetValue, and LMSCommit to record grades.
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <strong className="text-slate-900 block mb-1">index.html (Offline Player)</strong>
                    Self-contained responsive course viewer that works in offline environments or browser frames.
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <strong className="text-slate-900 block mb-1">README-LMS-IMPORT.txt</strong>
                    Step-by-step instructions for drag-and-drop import into Canvas, Moodle, and TalentLMS.
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-slate-200">
                <button
                  onClick={() => handleExport('scorm', () => exportScormPackage(course))}
                  disabled={downloading === 'scorm'}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {downloading === 'scorm' ? 'Packaging SCORM Zip...' : 'Download SCORM 1.2 Package (.zip)'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Sell Course (Gumroad / Etsy / Shopify / Stan Store) */}
          {activeTab === 'resell' && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-950">
                    Commercial Resale & Monetization Package (MRR / PLR)
                  </h3>
                  <p className="text-xs text-amber-800 mt-1">
                    Ready-to-launch commercial assets to sell this master course as your own digital product on Gumroad, Etsy, Shopify, or Stan Store.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tier 1: Personal</div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">$47 USD</div>
                  <p className="text-xs text-slate-600 mt-2">
                    Sell to home cooks, culinary students, and eco-conscious shoppers. Includes handbook + certificate.
                  </p>
                </div>

                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl shadow-2xs">
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Tier 2: Pro Chef</div>
                  <div className="text-2xl font-extrabold text-emerald-950 mt-1">$97 USD</div>
                  <p className="text-xs text-emerald-800 mt-2">
                    Sell to restaurant chefs and catering companies. Includes SCORM LMS files and kitchen audit spreadsheets.
                  </p>
                </div>

                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl shadow-2xs">
                  <div className="text-xs font-bold text-purple-800 uppercase tracking-wider">Tier 3: MRR License</div>
                  <div className="text-2xl font-extrabold text-purple-950 mt-1">$197 USD</div>
                  <p className="text-xs text-purple-800 mt-2">
                    Resell the master course package with Private Label Rights. Customers keep 100% of their profits.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2 text-slate-600">
                <div className="font-bold text-slate-900">Assets Included in this Commercial Pack:</div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span><strong>sales-page-copy.md</strong> (Full high-converting sales page copy with hooks, syllabus, FAQs)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span><strong>master-resell-rights-license.txt</strong> (Commercial authorization certificate)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span><strong>email-marketing-sequence.md</strong> (5 pre-written email launch sequence templates)</span>
                </div>
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-slate-200">
                <button
                  onClick={() => handleExport('resell', () => exportCommercialResellPack(course))}
                  disabled={downloading === 'resell'}
                  className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {downloading === 'resell' ? 'Creating Resale Pack...' : 'Download Commercial Resale Pack (.zip)'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Printable Handbook & Markdown */}
          {activeTab === 'handbook' && (
            <div className="space-y-6">
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-purple-950">
                    Complete Course Handbook & E-Book (Printable HTML / PDF & Markdown)
                  </h3>
                  <p className="text-xs text-purple-800 mt-1">
                    Download the entire 12-module course as a beautifully styled single-page document. Open in any browser and choose &quot;Print / Save as PDF&quot; for a bound 150+ page handbook!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Printable HTML Course Manual</h4>
                    <p className="text-xs text-slate-600">
                      Pre-formatted with clean book typography, page breaks, recipe formula callouts, and quiz answers.
                    </p>
                  </div>
                  <button
                    onClick={() => handleExport('print', () => exportPrintableCourseHandbook(course))}
                    className="mt-4 flex items-center justify-center gap-2 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Download Printable HTML (Save as PDF)</span>
                  </button>
                </div>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Master Markdown (.md) File</h4>
                    <p className="text-xs text-slate-600">
                      Pure clean Markdown for Notion, Obsidian, GitHub documentation, or converting to ePub / Kindle format.
                    </p>
                  </div>
                  <button
                    onClick={() => handleExport('md', () => exportCourseMarkdown(course))}
                    className="mt-4 flex items-center justify-center gap-2 py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Download Markdown File (.md)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Udemy & Teachable Bulk */}
          {activeTab === 'udemy' && (
            <div className="space-y-6">
              <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-rose-950">
                    Udemy & Teachable Bulk Curriculum Importer
                  </h3>
                  <p className="text-xs text-rose-800 mt-1">
                    Structured CSV and hierarchy text ready to bulk import sections, lectures, and quizzes into Udemy Instructor or Teachable School.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2 text-slate-600">
                <div className="font-bold text-slate-900">Included files:</div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span><strong>udemy-curriculum-import.csv</strong> (Sections, lectures, and article text)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span><strong>teachable-curriculum-outline.txt</strong> (Section outline for copy-pasting)</span>
                </div>
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-slate-200">
                <button
                  onClick={() => handleExport('udemy', () => exportUdemyTeachableKit(course))}
                  disabled={downloading === 'udemy'}
                  className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {downloading === 'udemy' ? 'Generating Kit...' : 'Download Udemy & Teachable Pack (.zip)'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>All exports are 100% royalty-free with full commercial and educational rights.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
