import React from 'react';
import { 
  Search, 
  Bell, 
  Smartphone, 
  Monitor, 
  Sliders,
  CheckCircle2,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { SupritamoneLogo } from './SupritamoneLogo';

interface SurplusHeaderProps {
  viewMode: 'desktop' | 'mobile';
  onToggleViewMode: (mode: 'desktop' | 'mobile') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCertify: () => void;
  onOpenExporter: () => void;
  activeNavTab: string;
  onSelectNavTab: (tab: string) => void;
  isMobileDrawerOpen?: boolean;
  onToggleMobileDrawer?: () => void;
}

export const SurplusHeader: React.FC<SurplusHeaderProps> = ({
  viewMode,
  onToggleViewMode,
  searchQuery,
  onSearchChange,
  onOpenCertify,
  onOpenExporter,
  activeNavTab,
  onSelectNavTab,
  isMobileDrawerOpen,
  onToggleMobileDrawer,
}) => {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showAdminMenu, setShowAdminMenu] = React.useState(false);

  const navTabs = [
    { id: 'home', label: 'Home' },
    { id: 'courses', label: 'Zero Waste Kitchen Course' },
    { id: 'culinary-courses', label: 'Culinary Courses', isExternal: true, href: 'https://foundations-of-food.ai.studio/' },
    { id: 'calculator', label: 'Waste Calculator' },
    { id: 'library', label: 'Library' },
    { id: 'events', label: 'Community' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          {/* Left: Mobile Drawer Button + Brand Logo */}
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            {/* Mobile Hamburger Drawer Button */}
            {onToggleMobileDrawer && (
              <button
                onClick={onToggleMobileDrawer}
                className="lg:hidden p-2 -ml-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label={isMobileDrawerOpen ? 'Close Menu' : 'Open Navigation Menu'}
              >
                <Sliders className="w-5 h-5 text-slate-700 rotate-90" />
              </button>
            )}

            {/* Brand Logo - Supritamone Academy */}
            <button 
              onClick={() => onSelectNavTab('home')}
              className="text-left group focus:outline-none cursor-pointer"
              title="Supritamone Academy - Home"
            >
              <SupritamoneLogo size="md" />
            </button>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1">
              {navTabs.map((tab) => {
                const isActive = activeNavTab === tab.id;
                if (tab.isExternal) {
                  return (
                    <div key={tab.id} className="flex items-center">
                      <button
                        onClick={() => onSelectNavTab(tab.id)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{tab.label}</span>
                      </button>
                      <a
                        href={tab.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-emerald-600 p-1 mr-1"
                        title="Open Foundations of Food in new window"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  );
                }
                return (
                  <button
                    key={tab.id}
                    onClick={() => onSelectNavTab(tab.id)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search courses, byproducts, zero-waste recipes..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* View Mode Toggle: Desktop / Mobile App View */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => onToggleViewMode('desktop')}
                title="Desktop Web Portal view"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  viewMode === 'desktop'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Desktop</span>
              </button>
              <button
                onClick={() => onToggleViewMode('mobile')}
                title="Simulated iPhone Mobile App view"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  viewMode === 'mobile'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Mobile App</span>
              </button>
            </div>



            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  9+
                </span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notifications</span>
                    <span className="text-[11px] text-blue-600 font-medium cursor-pointer">Mark all read</span>
                  </div>
                  <div className="space-y-3 pt-3 text-xs">
                    <div className="flex items-start gap-2.5 p-2 bg-blue-50/60 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800">New Q&A Answer from Dr. Chef Supritam Basu</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">Dr. Chef Basu replied to your question on tomato trimming consommé.</p>
                        <span className="text-[10px] text-slate-400">2 hours ago</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2 hover:bg-slate-50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-slate-300 mt-1 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800">New Recipe: Croissant Sauce v2.4</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">Updated with savory herb infusion ratios for poached fish.</p>
                        <span className="text-[10px] text-slate-400">Yesterday</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2 hover:bg-slate-50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-slate-300 mt-1 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800">Monthly Call Recording: March 2026</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">Now available in the Recordings section (58 mins).</p>
                        <span className="text-[10px] text-slate-400">3 days ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar */}
            <div className="relative">
              <button
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center ring-2 ring-slate-200 hover:ring-blue-500 transition-all"
              >
                SB
              </button>

              {showAdminMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900">Dr. Chef Supritam Basu</p>
                    <p className="text-slate-500 text-[11px]">PhD · Author, Chef</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Supritamone Academy Fellow
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onSelectNavTab('courses');
                      setShowAdminMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700"
                  >
                    My Courses
                  </button>
                  <button
                    onClick={() => {
                      onOpenCertify();
                      setShowAdminMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700"
                  >
                    CPD Diploma Verification
                  </button>
                  <button
                    onClick={() => {
                      onOpenExporter();
                      setShowAdminMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700"
                  >
                    Alison / LMS Package Downloader
                  </button>
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <a
                      href="https://www.surplusfoodstudio.com"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between px-3 py-2 text-slate-500 hover:text-slate-800"
                    >
                      <span>Surplus Food Studio</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar (under header on small screens) */}
        <div className="lg:hidden flex items-center gap-2 py-2 overflow-x-auto border-t border-slate-100 scrollbar-none">
          {navTabs.map((tab) => {
            const isActive = activeNavTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectNavTab(tab.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
