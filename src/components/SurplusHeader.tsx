import React from 'react';
import {
  Search,
  Bell,
  Sliders,
  LogOut,
  X,
  ShieldCheck,
} from 'lucide-react';
import { SupritamoneLogo } from './SupritamoneLogo';

interface SurplusHeaderProps {
  activeNavTab: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCertify: () => void;
  onSelectNavTab: (tab: string) => void;
  onScrollToSection?: (sectionId: string) => void;
  isMobileDrawerOpen?: boolean;
  onToggleMobileDrawer?: () => void;
  learnerName?: string;
  learnerEmail?: string;
  planTitle?: string;
  isCertificateUnlocked?: boolean;
  onOpenAccountModal?: () => void;
  onOpenAdminPortal?: () => void;
  onSignOut?: () => void;
}

export const SurplusHeader: React.FC<SurplusHeaderProps> = ({
  activeNavTab,
  searchQuery,
  onSearchChange,
  onOpenCertify,
  onSelectNavTab,
  onScrollToSection,
  isMobileDrawerOpen,
  onToggleMobileDrawer,
  learnerName = 'Supritam Basu',
  learnerEmail = 'basueats@gmail.com',
  planTitle,
  isCertificateUnlocked = false,
  onOpenAccountModal,
  onOpenAdminPortal,
  onSignOut,
}) => {
  const initials = React.useMemo(() => {
    const parts = (learnerName || learnerEmail || 'SB').trim().split(/[\s.@_-]+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (parts[0]?.slice(0, 2) || 'SB').toUpperCase();
  }, [learnerName, learnerEmail]);

  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showAdminMenu, setShowAdminMenu] = React.useState(false);
  const [showSearchBar, setShowSearchBar] = React.useState(false);

  const handleAnchorNav = (sectionId: string) => {
    if (onScrollToSection) {
      onScrollToSection(sectionId);
    } else {
      onSelectNavTab('home');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-neutral-200 safe-pt">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-3">
          {/* Left: Mobile Drawer Button + Brand Logo + Zero waste by Supritamone divider */}
          <div className="flex items-center gap-3 shrink-0">
            {onToggleMobileDrawer && (
              <button
                onClick={onToggleMobileDrawer}
                className="lg:hidden p-2 -ml-1 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                aria-label={isMobileDrawerOpen ? 'Close Menu' : 'Open Navigation Menu'}
              >
                <Sliders className="w-5 h-5 rotate-90" />
              </button>
            )}

            <button
              onClick={() => onSelectNavTab('home')}
              className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
              title="Supritamone Academy - Home"
            >
              <SupritamoneLogo size="md" />
              <span className="hidden sm:inline-block border-l border-neutral-300 pl-3 text-xs font-semibold text-neutral-800 tracking-tight whitespace-nowrap">
                Zero waste by Supritamone
              </span>
            </button>
          </div>

          {/* Center Minimal Navigation (Matching zerowaste.supritamone.com top bar) */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs font-medium text-neutral-500">
            <button
              onClick={() => onSelectNavTab('home')}
              className={`h-16 inline-flex items-center border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeNavTab === 'home'
                  ? 'border-black text-black font-bold'
                  : 'border-transparent hover:text-black'
              }`}
            >
              ZERO WASTE App
            </button>

            <button
              onClick={() => handleAnchorNav('problem-solution')}
              className="h-16 inline-flex items-center border-b-2 border-transparent hover:text-black transition-colors cursor-pointer whitespace-nowrap text-center leading-tight"
            >
              Problem &amp; Solutions
            </button>

            <button
              onClick={() => onSelectNavTab('library')}
              className={`h-16 inline-flex items-center border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeNavTab === 'library'
                  ? 'border-black text-black font-bold'
                  : 'border-transparent hover:text-black'
              }`}
            >
              Recipes &amp; Byproducts
            </button>

            <button
              onClick={() => onSelectNavTab('courses')}
              className={`h-16 inline-flex items-center border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeNavTab === 'courses'
                  ? 'border-black text-black font-bold'
                  : 'border-transparent hover:text-black'
              }`}
            >
              Training &amp; Courses
            </button>

            <button
              onClick={() => handleAnchorNav('faq')}
              className="h-16 inline-flex items-center border-b-2 border-transparent hover:text-black transition-colors cursor-pointer whitespace-nowrap"
            >
              FAQ
            </button>

            <button
              onClick={() => handleAnchorNav('about')}
              className="h-16 inline-flex items-center border-b-2 border-transparent hover:text-black transition-colors cursor-pointer whitespace-nowrap"
            >
              About
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Compact Toggle Search */}
            <div className="relative flex items-center">
              {showSearchBar ? (
                <div className="flex items-center bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1">
                  <Search className="w-3.5 h-3.5 text-neutral-400 mr-1.5 shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search recipes, courses..."
                    value={searchQuery}
                    onChange={(e) => {
                      onSearchChange(e.target.value);
                      if (e.target.value && activeNavTab === 'home') {
                        onSelectNavTab('library');
                      }
                    }}
                    className="w-24 sm:w-44 bg-transparent text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      onSearchChange('');
                      setShowSearchBar(false);
                    }}
                    className="text-neutral-400 hover:text-black ml-1 cursor-pointer"
                    aria-label="Close search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearchBar(true)}
                  className="p-2 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                  aria-label="Search curriculum and library"
                  title="Search courses, byproducts, recipes"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications((prev) => !prev);
                  setShowAdminMenu(false);
                }}
                className="relative p-2 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-neutral-900 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  3
                </span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] bg-white rounded-xl shadow-xl border border-neutral-200 p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Updates</span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-[11px] text-neutral-500 hover:text-black font-medium cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <div className="space-y-2.5 pt-3 text-xs">
                    <div className="flex items-start gap-2.5 p-2 bg-neutral-50 rounded-lg border border-neutral-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-neutral-900">26h 00m Chef Diploma Curriculum Ready</p>
                        <p className="text-neutral-500 text-[11px] mt-0.5">All 12 sections &amp; 24 chapters active with synchronized studio audio.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2 hover:bg-neutral-50 rounded-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-neutral-900">New Recipe: Croissant Sauce v2.4</p>
                        <p className="text-neutral-500 text-[11px] mt-0.5">Updated savory herb infusion ratios for poached fish.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2 hover:bg-neutral-50 rounded-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-neutral-900">Support: supritam.basu@supritamone.com</p>
                        <p className="text-neutral-500 text-[11px] mt-0.5">Direct culinary curriculum &amp; verification assistance.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div className="relative flex items-center gap-2">
              {onOpenAccountModal && (
                <button
                  onClick={onOpenAccountModal}
                  className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:border-black text-xs font-semibold text-neutral-800 transition-colors cursor-pointer"
                  title="Update learner name or email for your certificate"
                >
                  <span className="truncate max-w-[110px]">{learnerName}</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowAdminMenu((prev) => !prev);
                  setShowNotifications(false);
                }}
                className="w-8 h-8 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center ring-2 ring-neutral-200 hover:ring-black transition-all cursor-pointer"
                title={`${learnerName} (${learnerEmail})`}
              >
                {initials}
              </button>

              {showAdminMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-1.5rem)] bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-neutral-100">
                    <p className="font-bold text-neutral-900 truncate">{learnerName}</p>
                    <p className="text-neutral-500 text-[11px] truncate">{learnerEmail}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded truncate max-w-full">
                      {planTitle || 'Verified Member Access'}
                    </span>
                  </div>
                  {onOpenAccountModal && (
                    <button
                      onClick={() => {
                        onOpenAccountModal();
                        setShowAdminMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-neutral-50 text-neutral-900 font-semibold cursor-pointer"
                    >
                      Edit Learner Name &amp; Email
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onSelectNavTab('courses');
                      setShowAdminMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-neutral-50 text-neutral-700 cursor-pointer"
                  >
                    Zero Waste Kitchen Course (26h)
                  </button>
                  <button
                    onClick={() => {
                      onSelectNavTab('calculator');
                      setShowAdminMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-neutral-50 text-neutral-700 cursor-pointer"
                  >
                    Live Waste Calculator
                  </button>
                  <button
                    onClick={() => {
                      onOpenCertify();
                      setShowAdminMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-neutral-50 text-neutral-700 cursor-pointer flex items-center justify-between"
                  >
                    <span>Official Certificate</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isCertificateUnlocked ? 'bg-emerald-50 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {isCertificateUnlocked ? 'Unlocked' : 'Locked'}
                    </span>
                  </button>
                  <div className="border-t border-neutral-100 mt-1 pt-1">
                    {onOpenAdminPortal && (
                      <button
                        onClick={() => {
                          setShowAdminMenu(false);
                          onOpenAdminPortal();
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-emerald-50 text-emerald-800 font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Admin Portal</span>
                      </button>
                    )}
                    {onSignOut && (
                      <button
                        onClick={() => {
                          setShowAdminMenu(false);
                          onSignOut();
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-neutral-100 text-neutral-900 font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out / Lock Portal</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
