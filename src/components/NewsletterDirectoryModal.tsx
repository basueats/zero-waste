import React from 'react';
import { X, Search, BookOpen, ArrowRight, Wand2, ChefHat, ExternalLink } from 'lucide-react';
import { all252Newsletters, getCatalogSummary } from '../data/newslettersCatalog';

interface NewsletterDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (moduleNumber: number) => void;
  onGenerateFromNewsletter: (issueNumber: number, title: string) => void;
}

export const NewsletterDirectoryModal: React.FC<NewsletterDirectoryModalProps> = ({
  isOpen,
  onClose,
  onSelectModule,
  onGenerateFromNewsletter,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');
  const summary = React.useMemo(() => getCatalogSummary(), []);

  if (!isOpen) return null;

  const categories = ['All', ...summary.categories.map((c) => c.name)];

  const filtered = all252Newsletters.filter((item) => {
    const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.primaryScrap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `#${item.issueNumber}`.includes(searchQuery);
    return matchCat && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
              <ChefHat className="w-4 h-4" />
              <span>The Zero Waste Kitchen · 252 Newsletter Directory</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Original Newsletter Archive & Course Mapping
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore all 252 issues from{' '}
              <a
                href="https://www.linkedin.com/newsletters/the-zero-waste-kitchen-7293401149716459520/"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline font-medium inline-flex items-center gap-0.5"
              >
                LinkedIn: The Zero Waste Kitchen
                <ExternalLink className="w-3 h-3" />
              </a>{' '}
              mapped directly into this accredited diploma.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200 bg-white space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, scrap type (e.g. broccoli stems, citrus rinds, aquafaba, whey)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Newsletter Results List */}
        <div className="p-6 overflow-y-auto flex-1 divide-y divide-slate-100 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No newsletter issues found matching &quot;{searchQuery}&quot;. Try another search term.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.issueNumber}
                className="pt-3 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                    <span className="text-amber-700 font-mono">Issue #{item.issueNumber}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-600">{item.category}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                      Scrap: {item.primaryScrap}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-0.5">
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                    {item.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Jump into Course Module */}
                  <button
                    onClick={() => {
                      onSelectModule(item.moduleMapped);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                    title={`Go to Module ${item.moduleMapped}`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Module {item.moduleMapped}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  {/* AI Deep Dive */}
                  <button
                    onClick={() => {
                      onGenerateFromNewsletter(item.issueNumber, item.title);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/60 rounded-md transition-colors"
                    title="Generate AI deep-dive lesson from this newsletter"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-purple-600" />
                    <span className="hidden sm:inline">AI Deep Dive</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div>
            Showing {filtered.length} of {all252Newsletters.length} cataloged issues (all 252 available in export kit).
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 font-semibold rounded-md text-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
