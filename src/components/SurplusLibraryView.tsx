import React, { useState, useMemo } from 'react';
import { 
  surplusByproducts, 
  surplusRecipes, 
  ByproductItem, 
  ZeroWasteRecipe 
} from '../data/surplusData';
import { 
  Search, 
  ArrowLeft, 
  Download, 
  Heart, 
  MessageSquare, 
  Share2, 
  Sparkles, 
  Check, 
  ChefHat, 
  FileText,
  Clock,
  Flame,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  Scale,
  GraduationCap,
  ExternalLink
} from 'lucide-react';

interface SurplusLibraryViewProps {
  searchQuery: string;
}

const ITEMS_PER_PAGE = 24;

export const SurplusLibraryView: React.FC<SurplusLibraryViewProps> = ({ searchQuery: globalSearchQuery }) => {
  const [activeTab, setActiveTab] = useState<'byproducts' | 'recipes'>('byproducts');
  const [selectedByproduct, setSelectedByproduct] = useState<ByproductItem | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<ZeroWasteRecipe | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [localSearch, setLocalSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [likedRecipes, setLikedRecipes] = useState<Set<string>>(new Set(['recipe-1-pineapple', 'recipe-2-orange']));

  const activeQuery = (localSearch || globalSearchQuery || '').trim().toLowerCase();

  const toggleLike = (recipeId: string) => {
    setLikedRecipes((prev) => {
      const next = new Set(prev);
      if (next.has(recipeId)) next.delete(recipeId);
      else next.add(recipeId);
      return next;
    });
  };

  const handleDownloadPdf = (title: string, content: string) => {
    const text = `SUPRITAMONE ACADEMY - DR. CHEF SUPRITAM BASU, PhD, CEC
Dean of Sustainable Gastronomy & Executive Culinary Science
International Certified Diploma Curriculum (Level 7)
Synthesized from 252 Issues of "The Zero Waste Kitchen"

DOCUMENT: ${title.toUpperCase()}
AUTHOR: Dr. Chef Supritam Basu, PhD, CEC
ACCREDITED CULINARY FORMULATION & MASS-BALANCE SPECIFICATION

================================================================================
TECHNICAL SPECIFICATION & OPERATIONAL INSTRUCTIONS:
================================================================================
${content}

================================================================================
BRIGADE FOOD SAFETY & CCP REQUIREMENTS:
- Strict tare-weight logging in station scrap bin.
- Maintain hot holding >= 63°C or rapid chilling <= 3°C within 90 minutes.
- Ambient fermentations must reach verified pH < 4.2 within 72 hours.

Supritamone Academy © ${new Date().getFullYear()} · Dr. Chef Supritam Basu · Level 7 Certified`;

    const blob = new Blob([text], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Switch tab and reset filters
  const handleTabSwitch = (tab: 'byproducts' | 'recipes') => {
    setActiveTab(tab);
    setCategoryFilter('All');
    setCurrentPage(1);
    setSelectedByproduct(null);
    setSelectedRecipe(null);
  };

  // Filtered Byproducts (500 items)
  const filteredByproducts = useMemo(() => {
    return surplusByproducts.filter((item) => {
      const matchesSearch = !activeQuery || 
        item.name.toLowerCase().includes(activeQuery) ||
        item.easyTip.toLowerCase().includes(activeQuery) ||
        item.headline.toLowerCase().includes(activeQuery) ||
        item.potentialByproducts.some(p => p.toLowerCase().includes(activeQuery));
      const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [activeQuery, categoryFilter]);

  // Filtered Recipes (500 items)
  const filteredRecipes = useMemo(() => {
    return surplusRecipes.filter((item) => {
      const matchesSearch = !activeQuery || 
        item.title.toLowerCase().includes(activeQuery) ||
        item.mainByproduct.toLowerCase().includes(activeQuery) ||
        item.chefTips.toLowerCase().includes(activeQuery) ||
        item.ingredients.some(ing => ing.item.toLowerCase().includes(activeQuery));
      const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [activeQuery, categoryFilter]);

  // Pagination calculations
  const totalItems = activeTab === 'byproducts' ? filteredByproducts.length : filteredRecipes.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentByproducts = filteredByproducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const currentRecipes = filteredRecipes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Distinct category lists
  const byproductCategories = ['All', 'Fruit', 'Vegetables', 'Bakery', 'Beverage & Dairy', 'Proteins'];
  const recipeCategories = useMemo(() => ['All', ...Array.from(new Set(surplusRecipes.map(r => r.category))).sort()], []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Detail View for Byproduct */}
      {selectedByproduct ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs animate-in fade-in duration-200">
          {/* Header Bar */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setSelectedByproduct(null)}
              className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Byproducts Catalogue ({surplusByproducts.length})</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadPdf(selectedByproduct.name, `${selectedByproduct.headline}\n\nEASY CHEF TIP:\n${selectedByproduct.easyTip}\n\nSCIENTIFIC MECHANISM:\n${selectedByproduct.scientificMechanism}\n\nCULINARY APPLICATIONS:\n${selectedByproduct.culinaryApplications.join('\n')}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download SOP PDF</span>
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                {selectedByproduct.category} Byproduct Guide
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {selectedByproduct.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium max-w-xl mx-auto">
                {selectedByproduct.headline}
              </p>
            </div>

            {/* Photo & Mass Balance Stat */}
            <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="w-40 h-40 shrink-0 rounded-xl overflow-hidden shadow-md border border-slate-200 bg-white">
                <img
                  src={selectedByproduct.image}
                  alt={selectedByproduct.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/ingredients/lemon.jpg';
                  }}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-rose-700 text-xs font-bold bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                  <Scale className="w-4 h-4 shrink-0" />
                  <span>Mass Balance Trim Loss: {selectedByproduct.weightWasteStatistic}</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Recoverable Station Byproducts:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedByproduct.potentialByproducts.map((p, idx) => (
                      <span key={idx} className="text-xs bg-white text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 font-medium">
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actionable Tip */}
            <div className="p-5 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-blue-950 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Dr. Chef Supritam Basu's Quick Actionable Tip</span>
              </p>
              <p className="leading-relaxed text-blue-800 text-sm">{selectedByproduct.easyTip}</p>
            </div>

            {/* Scientific Mechanism */}
            <div className="p-5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 uppercase tracking-wide">
                <span>🔬 Biochemical Transformation Mechanism</span>
              </p>
              <p className="leading-relaxed text-amber-900">{selectedByproduct.scientificMechanism}</p>
            </div>

            {/* 4 Professional Culinary Applications */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Commercial Brigade Applications & SOPs
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedByproduct.culinaryApplications.map((app, idx) => (
                  <div key={idx} className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed shadow-2xs">
                    {app}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-center">
              <button
                onClick={() => setSelectedByproduct(null)}
                className="px-6 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Back to Byproducts Catalogue
              </button>
            </div>
          </div>
        </div>
      ) : selectedRecipe ? (
        /* Detail View for Recipe */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs animate-in fade-in duration-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setSelectedRecipe(null)}
              className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Zero-Waste Recipes ({surplusRecipes.length})</span>
            </button>
            <button
              onClick={() => handleDownloadPdf(selectedRecipe.title, `RECIPE: ${selectedRecipe.title}\nCATEGORY: ${selectedRecipe.category}\nPREP: ${selectedRecipe.prepTime} | COOK: ${selectedRecipe.cookTime} | YIELD: ${selectedRecipe.yieldAmount}\n\nINGREDIENTS:\n${selectedRecipe.ingredients.map(i => `- ${i.amount} ${i.item}`).join('\n')}\n\nMETHOD:\n${selectedRecipe.method.join('\n')}\n\nCHEF TIP:\n${selectedRecipe.chefTips}\n\nSCIENCE:\n${selectedRecipe.scientificNote}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Recipe SOP</span>
            </button>
          </div>

          <div className="p-6 sm:p-8 max-w-3xl mx-auto space-y-8">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                {selectedRecipe.category}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                {selectedRecipe.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Prep: {selectedRecipe.prepTime}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-slate-400" />
                  <span>Cook: {selectedRecipe.cookTime}</span>
                </span>
                <span>•</span>
                <span>Yield: <strong className="text-slate-800">{selectedRecipe.yieldAmount}</strong></span>
              </div>
            </div>

            {/* Image */}
            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-sm bg-slate-900">
              <img
                src={selectedRecipe.image}
                alt={selectedRecipe.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/assets/ingredients/lemon.jpg';
                }}
              />
            </div>

            {/* Ingredients Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-blue-600" />
                <span>Culinary Ingredients & Formulas</span>
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {selectedRecipe.ingredients.map((ing, idx) => (
                  <div key={idx} className="p-3 text-xs flex justify-between items-center hover:bg-slate-50">
                    <span className="font-semibold text-slate-800">{ing.item}</span>
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{ing.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Method Steps */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Step-by-Step Brigade Method
              </h3>
              <ol className="space-y-2.5">
                {selectedRecipe.method.map((step, idx) => (
                  <li key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{step.replace(/^\d+\.\s*/, '')}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Chef Tip & Science */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-1.5">
              <p className="font-bold">Dr. Chef Supritam Basu's Executive Chef Pro Tip:</p>
              <p>{selectedRecipe.chefTips}</p>
              {selectedRecipe.scientificNote && (
                <p className="text-[11px] text-amber-800 font-mono pt-1.5 border-t border-amber-200">
                  🔬 Science: {selectedRecipe.scientificNote}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-center">
              <button
                onClick={() => setSelectedRecipe(null)}
                className="px-6 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Back to Recipe Library
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Main Dual Tab View: 500 Byproducts | 500 Recipes */
        <div className="space-y-6">
          {/* Header & Main Sub-Tab Switcher matching user screenshot */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Library
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                A searchable catalogue of ingredients, byproducts, upcycling protocols, and zero-waste chef recipes.
              </p>
            </div>

            {/* Tabs matching exact user screenshot + Culinary Courses tab */}
            <div className="flex items-center flex-wrap gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto shrink-0 shadow-2xs">
              <button
                onClick={() => handleTabSwitch('byproducts')}
                className={`px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  activeTab === 'byproducts'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                How To Use Byproducts ({surplusByproducts.length})
              </button>
              <button
                onClick={() => handleTabSwitch('recipes')}
                className={`px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  activeTab === 'recipes'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Zero-Waste Recipes ({surplusRecipes.length})
              </button>
              <a
                href="https://foundations-of-food.ai.studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 text-xs font-bold rounded-md text-emerald-700 hover:bg-emerald-50 transition-all flex items-center gap-1.5 border border-transparent hover:border-emerald-200 cursor-pointer"
                title="Open Foundations of Food - Culinary Courses in new window"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Culinary Courses</span>
                <ExternalLink className="w-3 h-3 text-emerald-600" />
              </a>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
              {(activeTab === 'byproducts' ? byproductCategories : recipeCategories).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategoryFilter(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quick Instant Search */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={activeTab === 'byproducts' ? "Search 500 byproducts..." : "Search 500 recipes..."}
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Result Counts & Page Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
            <span>
              Showing <strong className="text-slate-900">{startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}</strong> of <strong className="text-slate-900">{totalItems}</strong> {activeTab === 'byproducts' ? 'byproduct guides' : 'zero-waste recipes'}
              {categoryFilter !== 'All' && <span> in <strong>{categoryFilter}</strong></span>}
            </span>
            <span>Page {currentPage} of {totalPages}</span>
          </div>

          {/* VIEW A: BYPRODUCTS CATALOGUE GRID (500 ITEMS) */}
          {activeTab === 'byproducts' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {currentByproducts.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedByproduct(item)}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-square bg-slate-50 overflow-hidden p-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = '/assets/ingredients/lemon.jpg';
                          }}
                        />
                        <span className="absolute top-4 left-4 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                          {item.category}
                        </span>
                      </div>
                      <div className="p-4 space-y-1.5">
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {item.easyTip}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <div className="text-[11px] font-semibold text-blue-600 group-hover:underline flex items-center justify-between">
                        <span>View Byproduct Guide</span>
                        <span>→</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW B: RECIPES CATALOGUE GRID (500 ITEMS) */}
          {activeTab === 'recipes' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentRecipes.map((recipe) => {
                  const isLiked = likedRecipes.has(recipe.id);

                  return (
                    <div
                      key={recipe.id}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Recipe Image */}
                        <div 
                          onClick={() => setSelectedRecipe(recipe)}
                          className="relative aspect-video bg-slate-900 cursor-pointer overflow-hidden"
                        >
                          <img
                            src={recipe.image}
                            alt={recipe.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = '/assets/ingredients/lemon.jpg';
                            }}
                          />
                          <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs uppercase">
                            {recipe.category}
                          </span>
                        </div>

                        {/* Content Header & Ingredients preview */}
                        <div className="p-5 space-y-3">
                          <div 
                            onClick={() => setSelectedRecipe(recipe)}
                            className="cursor-pointer"
                          >
                            <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors line-clamp-1">
                              {recipe.title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 font-medium">
                              Byproduct: <span className="text-slate-800">{recipe.mainByproduct}</span>
                            </p>
                          </div>

                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1">
                            <p className="font-bold text-[11px] uppercase tracking-wider text-slate-500">
                              Core Formula:
                            </p>
                            {recipe.ingredients.slice(0, 2).map((ing, i) => (
                              <p key={i} className="line-clamp-1 text-slate-700">
                                • {ing.amount} {ing.item}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer with Likes, Comments & Action */}
                      <div className="px-5 pb-5 pt-0">
                        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleLike(recipe.id)}
                              className={`flex items-center gap-1 transition-colors cursor-pointer ${
                                isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                              <span>{recipe.likes + (isLiked ? 1 : 0)}</span>
                            </button>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{recipe.commentsCount}</span>
                            </span>
                          </div>

                          <button
                            onClick={() => setSelectedRecipe(recipe)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                          >
                            View recipe →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {/* Page Number Chips */}
              <div className="flex items-center gap-1 text-xs">
                {Array.from({ length: Math.min(7, totalPages) }).map((_, idx) => {
                  let pageNum = idx + 1;
                  if (totalPages > 7) {
                    if (currentPage <= 4) {
                      pageNum = idx + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + idx;
                    } else {
                      pageNum = currentPage - 3 + idx;
                    }
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-8 h-8 rounded-lg font-bold transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
