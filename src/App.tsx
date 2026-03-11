import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ViewMode } from '@/types';
import { Navigation } from '@/components/Navigation';
import { Header, SmartPrayerCard, DailyInspiration, ServiceGrid, DiscoverSection } from '@/components/home/HomeWidgets';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext';
import { Player } from '@/components/listen/Player';

import { AnimatedLogo } from '@/components/AnimatedLogo';

// Lazy load all views to improve initial load time
const FrameEditor = lazy(() => import('@/components/frames').then(m => ({ default: m.FrameEditor })));
const PrayerTimesView = lazy(() => import('@/components/prayer').then(m => ({ default: m.PrayerTimesView })));
const AllahNamesView = lazy(() => import('@/components/allah-names').then(m => ({ default: m.AllahNamesView })));
const HalalFinderView = lazy(() => import('@/components/halal').then(m => ({ default: m.HalalFinderView })));
const Hadith40View = lazy(() => import('@/components/hadith').then(m => ({ default: m.Hadith40View })));
const BasicHadithView = lazy(() => import('@/components/hadith').then(m => ({ default: m.BasicHadithView })));
const HisnulMuslimView = lazy(() => import('@/components/hisnul-muslim').then(m => ({ default: m.HisnulMuslimView })));
const MuslimCalendarView = lazy(() => import('@/components/calendar').then(m => ({ default: m.MuslimCalendarView })));
const QiblaFinderView = lazy(() => import('@/components/qibla').then(m => ({ default: m.QiblaFinderView })));
const QuranView = lazy(() => import('@/components/quran').then(m => ({ default: m.QuranView })));
const FAQView = lazy(() => import('@/components/faq').then(m => ({ default: m.FAQView })));
const StartHereView = lazy(() => import('@/components/start-here').then(m => ({ default: m.StartHereView })));
const WatchView = lazy(() => import('@/components/watch').then(m => ({ default: m.WatchView })));
const ListenView = lazy(() => import('@/components/listen').then(m => ({ default: m.ListenView })));
const LibraryView = lazy(() => import('@/components/library').then(m => ({ default: m.LibraryView })));
const PostersView = lazy(() => import('@/components/posters').then(m => ({ default: m.PostersView })));
const FeedView = lazy(() => import('@/components/community/FeedView').then(m => ({ default: m.FeedView })));
const ZakatView = lazy(() => import('@/components/zakat').then(m => ({ default: m.ZakatView })));
const TasbihView = lazy(() => import('@/components/tasbih').then(m => ({ default: m.TasbihView })));
const QadaView = lazy(() => import('@/components/qada').then(m => ({ default: m.QadaView })));
const MuslimNamesView = lazy(() => import('@/components/names').then(m => ({ default: m.MuslimNamesView })));
const WuduView = lazy(() => import('@/components/wudu/WuduView').then(m => ({ default: m.WuduView })));
const BasicKnowledgeView = lazy(() => import('@/components/basic-knowledge/BasicKnowledgeView').then(m => ({ default: m.BasicKnowledgeView })));
const FiqhView = lazy(() => import('@/components/fiqh/FiqhView').then(m => ({ default: m.FiqhView })));
const AqeedaView = lazy(() => import('@/components/aqeeda/AqeedaView').then(m => ({ default: m.AqeedaView })));
const TafseerView = lazy(() => import('@/components/tafseer/TafseerView').then(m => ({ default: m.TafseerView })));
const AdabView = lazy(() => import('@/components/adab').then(m => ({ default: m.AdabView })));
const MoralityView = lazy(() => import('@/components/morality').then(m => ({ default: m.MoralityView })));
const AdeiahView = lazy(() => import('@/components/adeiah').then(m => ({ default: m.AdeiahView })));
const MiscView = lazy(() => import('@/components/misc').then(m => ({ default: m.MiscView })));
const SeeraView = lazy(() => import('@/components/seera').then(m => ({ default: m.SeeraView })));
const UmrahView = lazy(() => import('@/components/umrah').then(m => ({ default: m.UmrahView })));
const FastingGuideView = lazy(() => import('@/components/fasting').then(m => ({ default: m.FastingGuideView })));
const SalatGuideView = lazy(() => import('@/components/salat-guide').then(m => ({ default: m.SalatGuideView })));
const GalleryView = lazy(() => import('@/components/community/gallery/GalleryView').then(m => ({ default: m.GalleryView })));
const ProfileView = lazy(() => import('@/components/profile/ProfileView').then(m => ({ default: m.ProfileView })));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full min-h-[50vh]">
    <AnimatedLogo size={100} className="drop-shadow-lg" />
  </div>
);

const AppContent: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.HOME);
  const [isMobileNavHidden, setIsMobileNavHidden] = useState(false);
  const { t } = useLanguage();
  
  // Handle Deep Linking
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/hisn')) {
      setView(ViewMode.HISNUL_MUSLIM);
    }

    const handleNavigateToQuran = () => {
      setView(ViewMode.QURAN);
    };
    window.addEventListener('navigate-to-quran', handleNavigateToQuran);

    const handleHideNav = (e: any) => {
      setIsMobileNavHidden(e.detail);
    };
    window.addEventListener('hide-mobile-nav', handleHideNav);

    return () => {
      window.removeEventListener('navigate-to-quran', handleNavigateToQuran);
      window.removeEventListener('hide-mobile-nav', handleHideNav);
    };
  }, []);

  return (
    <AuthProvider>
      <ChatProvider>
        <AudioPlayerProvider>
          <div className="min-h-screen flex flex-col md:flex-row font-khmer transition-colors duration-300 bg-[#f8fafc] text-gray-900 dark:bg-slate-950 dark:text-white">
            {/* Navigation Layer */}
            <Navigation 
              currentView={view} 
              setView={setView} 
            />

            {/* Main Content Area */}
            <main className={`flex-1 md:ml-20 ${
              view === ViewMode.QURAN || view === ViewMode.LIBRARY
                ? `${isMobileNavHidden ? 'h-screen' : 'h-[calc(100vh-80px)]'} md:h-screen overflow-hidden` 
                : 'min-h-screen pb-20 md:pb-8'
            }`}>
              
              {/* Global Header for sub-views */}
              {view !== ViewMode.HOME && 
               view !== ViewMode.PRAYER && view !== ViewMode.QURAN && view !== ViewMode.START_HERE && 
               view !== ViewMode.CALENDAR && view !== ViewMode.QIBLA && view !== ViewMode.WATCH && 
               view !== ViewMode.LISTEN && view !== ViewMode.LIBRARY && view !== ViewMode.POSTERS && 
               view !== ViewMode.COMMUNITY && view !== ViewMode.ZAKAT && view !== ViewMode.TASBIH && 
               view !== ViewMode.QADA && view !== ViewMode.NAMES && view !== ViewMode.FAQ && view !== ViewMode.HADITH && view !== ViewMode.PROFILE && view !== ViewMode.WUDU && view !== ViewMode.BASIC_KNOWLEDGE && view !== ViewMode.FIQH && view !== ViewMode.AQEEDA && view !== ViewMode.TAFSEER && view !== ViewMode.BASIC_HADITH && view !== ViewMode.ADAB && view !== ViewMode.MORALITY && view !== ViewMode.ADEIAH && view !== ViewMode.MISC && view !== ViewMode.SEERA && view !== ViewMode.UMRAH && view !== ViewMode.FASTING_GUIDE && view !== ViewMode.SALAT_GUIDE && view !== ViewMode.GALLERY && (
                <header className="sticky top-0 z-30 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between bg-white/80 border-gray-100 dark:bg-slate-900/80 dark:border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold font-khmer-title text-gray-900 dark:text-white">
                       {t('app.title')}
                    </h2>
                  </div>
                </header>
              )}

              <div className="h-full">
                
                {/* HOME / DASHBOARD VIEW - SUPER APP STYLE */}
                {view === ViewMode.HOME && (
                  <div className="p-5 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
                     <Header setView={setView} />
                     <SmartPrayerCard setView={setView} />
                     <ServiceGrid setView={setView} />
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <DailyInspiration setView={setView} />
                        <div className="hidden lg:block p-6 rounded-2xl border shadow-sm h-fit bg-white border-gray-100 dark:bg-slate-900 dark:border-slate-800">
                            <h3 className="font-bold mb-4 font-khmer text-gray-900 dark:text-white">{t('events.title')}</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg font-bold text-center w-12 shrink-0">
                                        <span className="block text-xs uppercase">Mar</span>
                                        <span className="block text-lg">12</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 dark:text-slate-200">{t('events.ramadan')}</h4>
                                        <p className="text-xs text-gray-500">{t('events.daysLeft')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                     </div>
                     <DiscoverSection setView={setView} />
                  </div>
                )}
                
                {/* Main Features */}
                <Suspense fallback={<LoadingFallback />}>
                  {view === ViewMode.START_HERE && <StartHereView />}
                  {view === ViewMode.FRAMES && <FrameEditor />}
                  {view === ViewMode.PRAYER && <PrayerTimesView />}
                  {view === ViewMode.ALLAH_NAMES && <AllahNamesView />}
                  {view === ViewMode.HALAL && <HalalFinderView />}
                  {view === ViewMode.HADITH && <Hadith40View />}
                  {view === ViewMode.HISNUL_MUSLIM && <HisnulMuslimView />}
                  {view === ViewMode.CALENDAR && <MuslimCalendarView />}
                  {view === ViewMode.QIBLA && <QiblaFinderView />}
                  {view === ViewMode.QURAN && <QuranView />}
                  {view === ViewMode.FAQ && <FAQView />}
                  {view === ViewMode.WATCH && <WatchView />}
                  {view === ViewMode.LISTEN && <ListenView />}
                  {view === ViewMode.LIBRARY && <LibraryView />}
                  {view === ViewMode.POSTERS && <PostersView />}
                  {view === ViewMode.COMMUNITY && <FeedView />}
                  {view === ViewMode.ZAKAT && <ZakatView />}
                  {view === ViewMode.TASBIH && <TasbihView />}
                  {view === ViewMode.QADA && <QadaView />}
                  {view === ViewMode.NAMES && <MuslimNamesView />}
                  {view === ViewMode.WUDU && <WuduView setView={setView} />}
                  {view === ViewMode.BASIC_KNOWLEDGE && <BasicKnowledgeView setView={setView} />}
                  {view === ViewMode.FIQH && <FiqhView setView={setView} />}
                  {view === ViewMode.AQEEDA && <AqeedaView setView={setView} />}
                  {view === ViewMode.TAFSEER && <TafseerView setView={setView} />}
                  {view === ViewMode.BASIC_HADITH && <BasicHadithView setView={setView} />}
                  {view === ViewMode.ADAB && <AdabView setView={setView} />}
                  {view === ViewMode.MORALITY && <MoralityView setView={setView} />}
                  {view === ViewMode.ADEIAH && <AdeiahView setView={setView} />}
                  {view === ViewMode.MISC && <MiscView setView={setView} />}
                  {view === ViewMode.SEERA && <SeeraView setView={setView} />}
                  {view === ViewMode.UMRAH && <UmrahView setView={setView} />}
                  {view === ViewMode.FASTING_GUIDE && <FastingGuideView setView={setView} />}
                  {view === ViewMode.SALAT_GUIDE && <SalatGuideView setView={setView} />}
                  {view === ViewMode.GALLERY && <GalleryView />}

                  {view === ViewMode.PROFILE && <ProfileView />}
                </Suspense>
              </div>
            </main>

            {/* Global Audio Player */}
            {view !== ViewMode.QURAN && <Player />}
          </div>
        </AudioPlayerProvider>
      </ChatProvider>
    </AuthProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
