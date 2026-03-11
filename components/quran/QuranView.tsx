import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, ArrowLeft01Icon, ArrowRight01Icon, ArrowUp01Icon, BookOpen01Icon, Bookmark01Icon, Brain01Icon, CleanIcon, CloudDownloadIcon, Edit02Icon, FilterHorizontalIcon, ListViewIcon, Maximize01Icon, Menu01Icon, Mic02Icon, Search01Icon, Settings01Icon } from '@hugeicons/core-free-icons';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery } from '@tanstack/react-query';

import React, { useState, useEffect } from 'react';
import { QuranSidebar } from './QuranSidebar';
import { QuranDashboard } from './QuranDashboard';
import { ReadingView } from './reading-view';
import { Surah } from './types';
import { fetchSurahs, RECITERS } from './api';

import { SettingsDrawer } from './SettingsDrawer';
import { ViewModeToggle } from './ViewModeToggle';
import { QuranSettings, DEFAULT_SETTINGS } from './types';
import { GlobalAudioPlayer } from './GlobalAudioPlayer';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';

export const QuranView: React.FC = () => {
  const { showToast } = useToast();
  const { theme } = useTheme();
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [activeTab, setActiveTab] = useState<'surahs' | 'bookmarks' | 'notes' | 'hifz' | 'offline' | 'reciters'>('surahs');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<QuranSettings>(DEFAULT_SETTINGS);
  const [showAyahJump, setShowAyahJump] = useState(false);
  const [isImmerseMode, setIsImmerseMode] = useState(false);
  const [viewMode, setViewMode] = useState<'verse-by-verse' | 'reading'>('verse-by-verse');
  const [readingMode, setReadingMode] = useState<'arabic' | 'translation'>('arabic');
  const [singleAyahMode, setSingleAyahMode] = useState<number | null>(null);

  // Global Audio Player State
  const [playingSurahId, setPlayingSurahId] = useState<number | null>(null);
  const [playingReciter, setPlayingReciter] = useState<any | null>(RECITERS[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: surahs = [] } = useQuery({
    queryKey: ['surahs'],
    queryFn: () => fetchSurahs(),
    staleTime: Infinity, // Surahs rarely change
  });

  useEffect(() => {
    const handleNavigate = (e: any) => {
      const { surahId, ayahId } = e.detail || {};
      if (surahId && surahs.length > 0) {
        const surah = surahs.find(s => s.id === surahId);
        if (surah) {
          setSelectedSurah(surah);
          setIsSidebarCollapsed(true);
          if (ayahId) {
            setSingleAyahMode(parseInt(ayahId));
          } else {
            setSingleAyahMode(null);
          }
        }
      }
    };

    window.addEventListener('navigate-to-quran', handleNavigate);
    return () => window.removeEventListener('navigate-to-quran', handleNavigate);
  }, [surahs]);

  useEffect(() => {
      const savedSettings = localStorage.getItem('ponloe_quran_settings');
      if (savedSettings) {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      }
  }, []);

  const handleSettingsChange = (newSettings: QuranSettings) => {
      setSettings(newSettings);
      localStorage.setItem('ponloe_quran_settings', JSON.stringify(newSettings));
  };

  // Handle Resize to switch layout modes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleBack = () => {
    setSelectedSurah(null);
  };

  useEffect(() => {
    const event = new CustomEvent('hide-mobile-nav', { detail: !!selectedSurah });
    window.dispatchEvent(event);
    return () => {
      window.dispatchEvent(new CustomEvent('hide-mobile-nav', { detail: false }));
    };
  }, [selectedSurah]);

  const handleImmerseClick = () => {
    const savedLastRead = localStorage.getItem('ponloe_quran_last_read_surah');
    if (savedLastRead) {
      setSelectedSurah(JSON.parse(savedLastRead));
    } else {
      showToast('សូមជ្រើសរើសជំពូកណាមួយដើម្បីអានជាមុនសិន។', 'info');
    }
  };

  const mobileTabs = [
    { id: 'surahs', label: 'ស៊ូរ៉ះ', icon: BookOpen01Icon },
    { id: 'reciters', label: 'អ្នកសូត្រ', icon: Mic02Icon },
    { id: 'hifz', label: 'ទន្ទេញ', icon: Brain01Icon },
    { id: 'bookmarks', label: 'ចំណាំ', icon: Bookmark01Icon },
  ];

  return (
    <div className={`h-full flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'}`}>
      
      {/* Mobile-Only Header (Hidden on Desktop split-view) */}
      <div className={`lg:hidden border-b px-4 py-2 sticky top-0 z-30 ${selectedSurah ? 'hidden' : 'flex items-center'} ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
         <button 
           onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
           className={`p-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-full transition-colors border border-gray-100 shadow-sm mr-2`}
         >
           <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.5} className="w-5 h-5" />
         </button>
         
         <div className="flex-1 relative">
            <div className="relative w-full flex items-center gap-2 bg-white py-1.5 px-2 rounded-full shadow-sm border border-gray-100">
               <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className={`w-5 h-5 ml-1 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`} />
               <input 
                 type="text" 
                 placeholder="ស្វែងរកជំពូក..." 
                 className={`flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium font-khmer outline-none h-full py-1.5 min-w-0 ${theme === 'dark' ? 'text-white placeholder-slate-500' : 'text-gray-800 placeholder-gray-400'}`}
                 value={globalSearchQuery}
                 onChange={(e) => setGlobalSearchQuery(e.target.value)}
                 onFocus={() => setIsSearchFocused(true)}
                 onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
               />
               <button 
                 className={`p-1 flex items-center transition-colors rounded-full ${theme === 'dark' ? 'text-slate-500 hover:text-emerald-400 hover:bg-slate-800' : 'text-gray-400 hover:text-emerald-600 hover:bg-gray-50'}`}
                 onClick={() => setShowAdvancedSearch(true)}
               >
                 <HugeiconsIcon icon={FilterHorizontalIcon} strokeWidth={1.5} className="h-4 w-4" />
               </button>
               <button 
                 onClick={() => setIsSettingsOpen(true)}
                 className={`p-1 rounded-full transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-50'}`}
               >
                  <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.5} className="w-4 h-4" />
               </button>
            </div>
            {/* Popular Surahs Dropdown */}
            {isSearchFocused && !globalSearchQuery && (
              <div className={`absolute top-full mt-2 left-0 right-0 border rounded-2xl p-4 z-50 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
                  <div className={`text-xs font-medium mb-3 font-khmer select-none ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`}>ពេញនិយម៖</div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 36, name: 'Yasin' },
                      { id: 18, name: 'Al-Kahf' },
                      { id: 67, name: 'Al-Mulk' },
                      { id: 56, name: 'Al-Waqi\'ah' }
                    ].map(ps => (
                      <button
                        key={ps.id}
                        onClick={() => {
                            setGlobalSearchQuery(ps.id.toString());
                        }}
                        className={`px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 select-none ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-emerald-900/30 hover:text-emerald-400 hover:border-emerald-900/50' : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'}`}
                      >
                        <HugeiconsIcon icon={CleanIcon} strokeWidth={1.5} className="w-3.5 h-3.5 text-amber-500" />
                        {ps.name}
                      </button>
                    ))}
                  </div>
              </div>
            )}
         </div>
      </div>

      {/* Desktop Global Header */}
      {!isMobile && (
        <div className={`border-b px-4 py-2 flex items-center justify-between sticky top-0 z-30 shrink-0 h-[64px] ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
           <div className={`flex items-center gap-2 shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'w-auto pr-4' : 'w-64'}`}>
              <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className={`p-2 rounded-full transition-colors shrink-0 ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'}`} title={isSidebarCollapsed ? "បង្ហាញម៉ឺនុយ" : "លាក់ម៉ឺនុយ"}>
                  <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.5} className="w-5 h-5" />
              </button>
              {!selectedSurah ? (
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                     <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className="w-4 h-4" />
                  </div>
                  <h1 className={`text-lg font-bold font-khmer whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>គម្ពីរគូរអាន</h1>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                   <button 
                      onClick={() => setShowAyahJump(!showAyahJump)} 
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors group ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}`}
                   >
                       <div className="text-left">
                           <h2 className={`font-bold font-khmer text-base leading-none transition-colors ${theme === 'dark' ? 'text-white group-hover:text-emerald-400' : 'text-gray-900 group-hover:text-emerald-700'}`}>
                               {selectedSurah.id}. {selectedSurah.name_khmer}
                           </h2>
                           <p className={`text-[10px] font-medium mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>{selectedSurah.name_simple}</p>
                       </div>
                       <div className={`transition-colors ml-1 ${theme === 'dark' ? 'text-slate-500 group-hover:text-emerald-400' : 'text-gray-400 group-hover:text-emerald-600'}`}>
                           {showAyahJump ? <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={1.5} className="w-4 h-4" /> : <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={1.5} className="w-4 h-4" />}
                       </div>
                   </button>
                </div>
              )}
           </div>
           
           <div className="flex-1 max-w-2xl mx-4 flex items-center justify-center">
              {/* Global Search Box */}
              {!selectedSurah ? (
                <div className="w-full relative">
                  <div className="relative w-full flex items-center gap-2 bg-white py-1.5 px-2 rounded-full shadow-sm border border-gray-100">
                     <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className={`w-5 h-5 ml-1 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`} />
                     <input 
                       type="text" 
                       placeholder="ស្វែងរកជំពូក (ឧ. Al-Baqarah, លេខ ២)..." 
                       className={`flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium font-khmer outline-none h-full py-1.5 min-w-0 ${theme === 'dark' ? 'text-white placeholder-slate-500' : 'text-gray-800 placeholder-gray-400'}`}
                       value={globalSearchQuery}
                       onChange={(e) => setGlobalSearchQuery(e.target.value)}
                       onFocus={() => setIsSearchFocused(true)}
                       onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                     />
                     <button 
                       className={`p-1 flex items-center transition-colors rounded-full ${theme === 'dark' ? 'text-slate-500 hover:text-emerald-400 hover:bg-slate-800' : 'text-gray-400 hover:text-emerald-600 hover:bg-gray-50'}`}
                       onClick={() => setShowAdvancedSearch(true)}
                       title="ការស្វែងរកកម្រិតខ្ពស់"
                     >
                       <HugeiconsIcon icon={FilterHorizontalIcon} strokeWidth={1.5} className="h-4 w-4" />
                     </button>
                     <button 
                       onClick={() => setIsSettingsOpen(true)}
                       className={`p-1 rounded-full transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-50'}`}
                       title="ការកំណត់"
                     >
                        <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.5} className="w-4 h-4" />
                     </button>
                  </div>
                  {/* Popular Surahs Dropdown */}
                  {isSearchFocused && !globalSearchQuery && (
                    <div className={`absolute top-full mt-2 left-0 right-0 border rounded-2xl p-4 z-50 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
                        <div className={`text-xs font-medium mb-3 font-khmer select-none ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`}>ពេញនិយម៖</div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: 36, name: 'Yasin' },
                            { id: 18, name: 'Al-Kahf' },
                            { id: 67, name: 'Al-Mulk' },
                            { id: 56, name: 'Al-Waqi\'ah' }
                          ].map(ps => (
                            <button
                              key={ps.id}
                              onClick={() => {
                                  setGlobalSearchQuery(ps.id.toString());
                              }}
                              className={`px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 select-none ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-emerald-900/30 hover:text-emerald-400 hover:border-emerald-900/50' : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'}`}
                            >
                              <HugeiconsIcon icon={CleanIcon} strokeWidth={1.5} className="w-3.5 h-3.5 text-amber-500" />
                              {ps.name}
                            </button>
                          ))}
                        </div>
                    </div>
                  )}
                </div>
              ) : (
                <ViewModeToggle
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  readingMode={readingMode}
                  setReadingMode={setReadingMode}
                />
              )}
           </div>

           <div className="flex items-center gap-2 shrink-0">
              {selectedSurah && (
                 <>
                   <button onClick={() => setIsImmerseMode(true)} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-600'}`} title="Immerse Mode">
                       <HugeiconsIcon icon={Maximize01Icon} strokeWidth={1.5} className="w-5 h-5" />
                   </button>
                   <button 
                     onClick={() => setIsSettingsOpen(true)}
                     className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-100'}`}
                   >
                      <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.5} className="w-6 h-6" />
                   </button>
                 </>
              )}
           </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT PANE: Sidebar Menu (Desktop Only) */}
        <div className={`
            flex-col border-r h-full overflow-visible transition-all duration-300 relative
            ${!isMobile ? 'flex' : 'hidden'}
            ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}
        `}>
            <QuranSidebar 
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setSelectedSurah(null);
              }}
              onImmerseClick={handleImmerseClick}
              isCollapsed={isSidebarCollapsed}
            />
            
            {/* Toggle Button on Border */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 border rounded-full flex items-center justify-center shadow-sm z-50 transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-900/50' : 'bg-white border-gray-200 text-gray-400 hover:text-emerald-600 hover:border-emerald-200'}`}
              title={isSidebarCollapsed ? "បង្ហាញម៉ឺនុយ" : "លាក់ម៉ឺនុយ"}
            >
              {isSidebarCollapsed ? <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="w-4 h-4" /> : <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-4 h-4" />}
            </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobile && !isSidebarCollapsed && (
            <div className="fixed inset-0 z-[100] md:z-30 lg:hidden">
              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.2 }}
                 className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
                 onClick={() => setIsSidebarCollapsed(true)} 
              />
              <motion.div 
                 initial={{ x: '-100%' }}
                 animate={{ x: 0 }}
                 exit={{ x: '-100%' }}
                 transition={{ type: "spring", damping: 25, stiffness: 200 }}
                 className={`absolute left-0 md:left-20 top-0 bottom-0 w-64 shadow-2xl flex flex-col pt-6 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}
              >
                <div className="px-6 mb-6 flex items-center justify-between">
                   <h2 className="text-xl font-bold font-khmer-title text-gray-900 flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                         <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className="w-5 h-5" />
                      </div>
                      គម្ពីរគូរអាន
                   </h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <QuranSidebar 
                    activeTab={activeTab}
                    onTabChange={(tab) => {
                      setActiveTab(tab);
                      setSelectedSurah(null);
                      setIsSidebarCollapsed(true);
                    }}
                    onImmerseClick={() => {
                      handleImmerseClick();
                      setIsSidebarCollapsed(true);
                    }}
                    isCollapsed={false}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* RIGHT PANE: Dashboard or Reading View */}
        <div className={`flex-1 h-full overflow-hidden relative flex flex-col ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'}`}>
            {selectedSurah ? (
                <ReadingView 
                surah={selectedSurah} 
                onBack={handleBack} 
                isSidebarVisible={!isMobile}
                onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                isSidebarCollapsed={isSidebarCollapsed}
                onSelectSurah={(surah) => {
                  setSelectedSurah(surah);
                  setIsSidebarCollapsed(true);
                  setShowAyahJump(false);
                  setSingleAyahMode(null);
                }}
                showAyahJump={showAyahJump}
                setShowAyahJump={setShowAyahJump}
                isImmerseMode={isImmerseMode}
                setIsImmerseMode={setIsImmerseMode}
                viewMode={viewMode}
                setViewMode={setViewMode}
                readingMode={readingMode}
                setReadingMode={setReadingMode}
                playingSurahId={playingSurahId}
                setPlayingSurahId={setPlayingSurahId}
                playingReciter={playingReciter}
                setPlayingReciter={setPlayingReciter}
                globalIsPlaying={isPlaying}
                setGlobalIsPlaying={setIsPlaying}
                singleAyahMode={singleAyahMode}
                setSingleAyahMode={setSingleAyahMode}
              />
            ) : (
              <QuranDashboard 
                activeTab={activeTab}
                onSelectSurah={(surah) => {
                  setSelectedSurah(surah);
                  setIsSidebarCollapsed(true);
                }}
                isSidebarVisible={!isMobile}
                isSidebarCollapsed={isSidebarCollapsed}
                onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                globalSearchQuery={globalSearchQuery}
                setGlobalSearchQuery={setGlobalSearchQuery}
                showAdvancedSearch={showAdvancedSearch}
                setShowAdvancedSearch={setShowAdvancedSearch}
                playingSurahId={playingSurahId}
                setPlayingSurahId={setPlayingSurahId}
                playingReciter={playingReciter}
                setPlayingReciter={setPlayingReciter}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
              />
            )}
        </div>

      </div>

      <GlobalAudioPlayer 
        surahs={surahs}
        playingSurahId={playingSurahId}
        setPlayingSurahId={setPlayingSurahId}
        playingReciter={playingReciter}
        setPlayingReciter={setPlayingReciter}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      <SettingsDrawer 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
};
