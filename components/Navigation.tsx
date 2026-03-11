import { HugeiconsIcon } from '@hugeicons/react';
import { Book01Icon, Calendar01Icon, Compass01Icon, DashboardSquare03Icon, HeadphonesIcon, Image01Icon, LibraryIcon, UserGroupIcon, SalahTimeIcon, Quran01Icon, RamadhanMonthIcon } from '@hugeicons/core-free-icons';


import React from 'react';
import { ViewMode } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { AnimatedLogo } from './AnimatedLogo';


interface NavigationProps {
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const { t } = useLanguage();
  const [isHidden, setIsHidden] = React.useState(false);

  React.useEffect(() => {
    const handleToggle = (e: any) => {
      setIsHidden(e.detail);
    };
    window.addEventListener('hide-mobile-nav', handleToggle);
    return () => window.removeEventListener('hide-mobile-nav', handleToggle);
  }, []);

  // Desktop Sidebar Items (Full List)
  const desktopNavItems = [
    { mode: ViewMode.HOME, icon: DashboardSquare03Icon, label: t('nav.home') },
    { mode: ViewMode.COMMUNITY, icon: UserGroupIcon, label: t('nav.community') },
    { mode: ViewMode.QURAN, icon: Quran01Icon, label: t('nav.quran') },
    { mode: ViewMode.LIBRARY, icon: LibraryIcon, label: t('nav.library') },
    { mode: ViewMode.PRAYER, icon: SalahTimeIcon, label: t('nav.prayer') },
    { mode: ViewMode.CALENDAR, icon: RamadhanMonthIcon, label: t('nav.calendar') },
  ];

  // Mobile Bottom Nav Items (Strictly 5 for layout)
  const mobileNavItems = [
    { mode: ViewMode.HOME, icon: DashboardSquare03Icon, label: t('nav.home') },
    { mode: ViewMode.COMMUNITY, icon: UserGroupIcon, label: t('nav.community') },
    { mode: ViewMode.QURAN, icon: Quran01Icon, label: t('nav.quran'), isCenter: true }, // Center item
    { mode: ViewMode.PRAYER, icon: SalahTimeIcon, label: t('nav.prayer') },
    { mode: ViewMode.LIBRARY, icon: LibraryIcon, label: t('nav.library') },
  ];

  return (
    <>
      {/* Desktop/Tablet Sidebar (Slim Rail) */}
      <aside className="hidden md:flex flex-col w-20 h-screen fixed left-0 top-0 bg-white border-r border-gray-200 z-40 items-center py-6 dark:bg-slate-900 dark:border-slate-800">
        
        {/* Logo Icon */}
        <div className="mb-8 w-12 h-12 shrink-0 cursor-default select-none flex items-center justify-center">
          <AnimatedLogo className="w-10 h-10 drop-shadow-sm" loopInterval={7000} />
        </div>
        
        <nav className="flex-1 w-full px-2 space-y-2 flex flex-col items-center">
          {desktopNavItems.map((item) => (
            <div key={item.mode} className="w-full flex justify-center">
              <button
                onClick={() => setView(item.mode)}
                className={`w-full flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
                  currentView === item.mode 
                    ? 'bg-emerald-50 text-emerald-600 shadow-sm dark:bg-emerald-900/30 dark:text-emerald-400' 
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <HugeiconsIcon icon={item.icon} strokeWidth={1.5} className="w-6 h-6" />
                <span className="text-[10px] font-bold text-center leading-tight font-khmer">{item.label}</span>
              </button>
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-transform duration-300 dark:bg-slate-900 dark:border-slate-800 dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)] ${isHidden ? 'translate-y-full' : 'translate-y-0'}`}>
        <div className="flex justify-between items-end px-4 py-2">
          {mobileNavItems.map((item) => {
            if (item.isCenter) {
               return (
                 <div key={item.mode} className="relative -top-5">
                    <button
                      onClick={() => setView(item.mode)}
                      className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 transition-transform active:scale-95 dark:shadow-emerald-900/20 ${
                        currentView === item.mode 
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-50 dark:ring-slate-900' 
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      <HugeiconsIcon icon={item.icon} strokeWidth={1.5} className="w-7 h-7" />
                    </button>
                 </div>
               )
            }
            
            return (
              <button
                key={item.mode}
                onClick={() => setView(item.mode)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl min-w-[55px] transition-colors ${
                  currentView === item.mode 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <HugeiconsIcon icon={item.icon} strokeWidth={1.5} className={`w-6 h-6 ${currentView === item.mode ? 'fill-emerald-100 dark:fill-emerald-900/50' : ''}`} />
                <span className="text-[10px] font-bold text-center leading-tight whitespace-nowrap font-khmer">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  );
};
