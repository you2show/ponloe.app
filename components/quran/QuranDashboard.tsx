import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, Clock01Icon, BookOpen01Icon, ArrowRight01Icon, Target01Icon, CleanIcon, LayoutGridIcon, ListViewIcon, ArrowUpDownIcon, Brain01Icon, CloudDownloadIcon, FilterHorizontalIcon, Cancel01Icon, Mic02Icon, Menu01Icon, PlayIcon, PauseIcon, Ramadhan01Icon } from '@hugeicons/core-free-icons';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { fetchSurahs, fetchJuzs, RECITERS } from './api';
import { Surah, Juz } from './types';
import { ReciterDetail } from './ReciterDetail';
import { ReadingGoalModal } from './ReadingGoalModal';
import { RamadanMissionModal } from './RamadanMissionModal';
import { useTheme } from '@/contexts/ThemeContext';

interface QuranDashboardProps {
  activeTab: 'surahs' | 'juzs' | 'bookmarks' | 'notes' | 'hifz' | 'offline' | 'reciters';
  onSelectSurah: (surah: Surah) => void;
  isSidebarVisible?: boolean;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  globalSearchQuery?: string;
  setGlobalSearchQuery?: (query: string) => void;
  showAdvancedSearch?: boolean;
  setShowAdvancedSearch?: (show: boolean) => void;
  playingSurahId: number | null;
  setPlayingSurahId: (id: number | null) => void;
  playingReciter: any | null;
  setPlayingReciter: (reciter: any | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export const QuranDashboard: React.FC<QuranDashboardProps> = ({ 
  activeTab, 
  onSelectSurah, 
  isSidebarVisible, 
  isSidebarCollapsed, 
  onToggleSidebar,
  globalSearchQuery = '',
  setGlobalSearchQuery,
  showAdvancedSearch: externalShowAdvancedSearch,
  setShowAdvancedSearch: externalSetShowAdvancedSearch,
  playingSurahId,
  setPlayingSurahId,
  playingReciter,
  setPlayingReciter,
  isPlaying,
  setIsPlaying
}) => {
  const { theme } = useTheme();
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const searchQuery = isSidebarVisible ? globalSearchQuery : localSearchQuery;
  const handleSearchChange = (val: string) => {
    if (isSidebarVisible && setGlobalSearchQuery) {
      setGlobalSearchQuery(val);
    } else {
      setLocalSearchQuery(val);
    }
  };
  
  const { data: surahs = [], isLoading: isLoadingSurahs } = useQuery({
    queryKey: ['surahs'],
    queryFn: () => fetchSurahs(),
    staleTime: Infinity,
  });

  const { data: juzs = [], isLoading: isLoadingJuzs } = useQuery({
    queryKey: ['juzs'],
    queryFn: () => fetchJuzs(),
    staleTime: Infinity,
  });

  const loading = isLoadingSurahs || isLoadingJuzs;

  const [lastRead, setLastRead] = useState<Surah | null>(null);
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [currentView, setCurrentView] = useState<'surah' | 'juz' | 'revelation' | 'search'>('surah');
  const [internalShowAdvancedSearch, setInternalShowAdvancedSearch] = useState(false);
  const showAdvancedSearch = externalShowAdvancedSearch !== undefined ? externalShowAdvancedSearch : internalShowAdvancedSearch;
  const setShowAdvancedSearch = externalSetShowAdvancedSearch || setInternalShowAdvancedSearch;
  const [showReadingGoal, setShowReadingGoal] = useState(false);
  const [showRamadanMission, setShowRamadanMission] = useState(false);
  const [advSearchQuery, setAdvSearchQuery] = useState('');
  const [advSearchSurah, setAdvSearchSurah] = useState('all');
  const [advSearchType, setAdvSearchType] = useState('all');
  const [shouldSearch, setShouldSearch] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState<any | null>(null);

  const fetchSearchResults = async (query: string) => {
    const response = await fetch(`/api/quran/search?q=${encodeURIComponent(query)}&size=20&page=1&language=km`);
    if (!response.ok) throw new Error('Search failed');
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON success response:', text.substring(0, 200));
      throw new Error(`Server returned an invalid response. Content-Type: ${contentType}`);
    }

    const data = await response.json();
    return data.search.results || [];
  };

  const { data: searchData, isLoading: isSearching, isSuccess, isError } = useQuery({
    queryKey: ['quranSearch', advSearchQuery],
    queryFn: () => fetchSearchResults(advSearchQuery),
    enabled: shouldSearch && !!advSearchQuery.trim(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const searchResults = React.useMemo(() => {
    if (!searchData) return [];
    let results = searchData;
    if (advSearchSurah !== 'all') {
      results = results.filter((r: any) => r.verse_key.startsWith(`${advSearchSurah}:`));
    }
    return results;
  }, [searchData, advSearchSurah]);

  useEffect(() => {
    if (isSuccess && searchData) {
      setCurrentView('search');
      setShowAdvancedSearch(false);
      setShouldSearch(false);
    }
  }, [isSuccess, searchData]);

  useEffect(() => {
    if (isError) {
      console.error('Search error');
      setShouldSearch(false);
    }
  }, [isError]);

  const handleAdvancedSearch = () => {
    if (!advSearchQuery.trim()) return;
    setShouldSearch(true);
  };

  // Drag to scroll for popular surahs
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    if (activeTab === 'juzs') setCurrentView('juz');
    if (activeTab === 'surahs' && currentView === 'juz') setCurrentView('surah');
    if (activeTab !== 'reciters') setSelectedReciter(null);
  }, [activeTab]);

  useEffect(() => {
    const savedLastRead = localStorage.getItem('ponloe_quran_last_read_surah');
    if (savedLastRead) {
      const parsed = JSON.parse(savedLastRead);
      setLastRead(parsed);
      
      const savedProgress = localStorage.getItem('ponloe_quran_reading_progress');
      if (savedProgress) {
        const progressObj = JSON.parse(savedProgress);
        setReadingProgress(progressObj[parsed.id] || 0);
      }
    }
  }, []);

  const handleSurahClick = (surah: Surah) => {
    localStorage.setItem('ponloe_quran_last_read_surah', JSON.stringify(surah));
    onSelectSurah(surah);
  };

  const handlePlayPause = (e: React.MouseEvent, surahId: number) => {
    e.stopPropagation();
    const reciterToUse = playingReciter || RECITERS[0];
    
    if (playingSurahId === surahId && isPlaying) {
      setIsPlaying(false);
    } else {
      setPlayingReciter(reciterToUse);
      setPlayingSurahId(surahId);
      setIsPlaying(true);
    }
  };

  const handleJuzClick = (juz: Juz) => {
    if (!juz.verse_mapping) return;
    const firstSurahId = Object.keys(juz.verse_mapping)[0];
    const surah = surahs.find(s => s.id === parseInt(firstSurahId));
    if (surah) {
      handleSurahClick(surah);
    }
  };

  const popularSurahs = [
    { id: 36, name: 'Yasin', name_khmer: 'យ៉ាស៊ីន' },
    { id: 18, name: 'Al-Kahf', name_khmer: 'អាល់កាហ្វ' },
    { id: 67, name: 'Al-Mulk', name_khmer: 'អាល់មុលក៍' },
    { id: 56, name: 'Al-Waqi\'ah', name_khmer: 'អាល់វ៉ាគីអាស់' },
  ];

  let displaySurahs = [...surahs];
  if (searchQuery) {
    displaySurahs = displaySurahs.filter(s => 
      s.name_simple.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.name_khmer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toString() === searchQuery
    );
  } else if (currentView === 'revelation') {
    displaySurahs.sort((a, b) => a.revelation_order - b.revelation_order);
  } else {
    displaySurahs.sort((a, b) => a.id - b.id);
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-emerald-600"></div>
      </div>
    );
  }

  if (activeTab === 'reciters') {
    if (selectedReciter) {
      return (
        <ReciterDetail 
          reciter={selectedReciter} 
          surahs={surahs} 
          onBack={() => setSelectedReciter(null)} 
          onChangeReciter={setSelectedReciter}
          isSidebarCollapsed={isSidebarCollapsed}
          playingSurahId={playingSurahId}
          setPlayingSurahId={setPlayingSurahId}
          playingReciter={playingReciter}
          setPlayingReciter={setPlayingReciter}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
        />
      );
    }

    return (
      <div className={`flex-1 h-full overflow-y-auto p-4 md:p-8 custom-scrollbar relative ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'}`}>
         {isSidebarVisible && isSidebarCollapsed && onToggleSidebar && (
             <button onClick={onToggleSidebar} className={`absolute left-4 top-4 md:left-8 md:top-8 z-10 p-3 border rounded-2xl shadow-sm transition-all hover:shadow-md ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-emerald-900/30' : 'bg-white border-gray-100 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'}`}>
                 <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.5} className="w-6 h-6" />
             </button>
         )}
         <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="text-center mb-10">
                <h2 className={`text-3xl font-bold font-khmer mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>អ្នកសូត្រគម្ពីរគូរអាន</h2>
                <p className={`font-khmer ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>ជ្រើសរើសអ្នកសូត្រដែលអ្នកពេញចិត្ត</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {RECITERS.map((reciter) => (
                    <div 
                      key={reciter.id} 
                      onClick={() => setSelectedReciter(reciter)}
                      className={`rounded-2xl overflow-hidden shadow-sm border hover:shadow-md transition-all group cursor-pointer ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}
                    >
                        <div className="aspect-square overflow-hidden relative">
                            <img referrerPolicy="no-referrer" src={reciter.image || undefined} 
                              alt={reciter.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(reciter.name)}&background=0D8ABC&color=fff&size=256`;
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                                <button className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                    <HugeiconsIcon icon={Mic02Icon} strokeWidth={1.5} className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 text-center">
                            <h3 className={`font-bold text-sm md:text-base line-clamp-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{reciter.name}</h3>
                            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>Murattal</p>
                        </div>
                    </div>
                ))}
            </div>
         </div>
      </div>
    );
  }

  if (activeTab === 'hifz') {
    return (
      <div className={`flex-1 h-full overflow-y-auto p-4 md:p-8 custom-scrollbar relative ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'}`}>
         {isSidebarVisible && isSidebarCollapsed && onToggleSidebar && (
             <button onClick={onToggleSidebar} className={`absolute left-4 top-4 md:left-8 md:top-8 z-10 p-3 border rounded-2xl shadow-sm transition-all hover:shadow-md ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-emerald-900/30' : 'bg-white border-gray-100 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'}`}>
                 <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.5} className="w-6 h-6" />
             </button>
         )}
         <div className="flex flex-col items-center justify-center py-20 max-w-md mx-auto text-center">
           <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
             <HugeiconsIcon icon={Brain01Icon} strokeWidth={1.5} className="w-10 h-10" />
           </div>
           <h2 className={`text-2xl font-bold font-khmer mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>មុខងារជំនួយការទន្ទេញ (Hifz Tool)</h2>
           <p className={`font-khmer mb-8 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
             មុខងារនេះនឹងជួយអ្នកក្នុងការទន្ទេញគម្ពីរគូរអាន ដោយមានការលាក់ពាក្យ ការធ្វើតេស្តការចងចាំ និងការតាមដានវឌ្ឍនភាពរបស់អ្នក។
           </p>
           <button className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-khmer font-medium hover:bg-emerald-700 transition-colors">
             នឹងមកដល់ឆាប់ៗនេះ
           </button>
         </div>
      </div>
    );
  }

  if (activeTab === 'offline') {
    return (
      <div className={`flex-1 h-full overflow-y-auto p-4 md:p-8 custom-scrollbar relative ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'}`}>
         {isSidebarVisible && isSidebarCollapsed && onToggleSidebar && (
             <button onClick={onToggleSidebar} className={`absolute left-4 top-4 md:left-8 md:top-8 z-10 p-3 border rounded-2xl shadow-sm transition-all hover:shadow-md ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-emerald-900/30' : 'bg-white border-gray-100 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'}`}>
                 <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.5} className="w-6 h-6" />
             </button>
         )}
         <div className="flex flex-col items-center justify-center py-20 max-w-md mx-auto text-center">
           <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
             <HugeiconsIcon icon={CloudDownloadIcon} strokeWidth={1.5} className="w-10 h-10" />
           </div>
           <h2 className={`text-2xl font-bold font-khmer mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>អានដោយគ្មានអ៊ីនធឺណិត</h2>
           <p className={`font-khmer mb-8 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
             ទាញយកជំពូក និងសំឡេងសូត្រទុកក្នុងទូរស័ព្ទរបស់អ្នក ដើម្បីអាចអាន និងស្តាប់នៅពេលដែលគ្មានការតភ្ជាប់អ៊ីនធឺណិត។
           </p>
           <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-khmer font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto">
             <HugeiconsIcon icon={CloudDownloadIcon} strokeWidth={1.5} className="w-5 h-5" /> ទាញយកទិន្នន័យទាំងអស់ (1.2 GB)
           </button>
           <p className={`text-xs mt-4 font-khmer ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>មុខងារនេះកំពុងស្ថិតក្នុងការអភិវឌ្ឍ</p>
         </div>
      </div>
    );
  }

  if (activeTab === 'bookmarks' || activeTab === 'notes') {
    return (
      <div className={`flex-1 h-full overflow-y-auto p-4 md:p-8 custom-scrollbar relative ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'}`}>
         {isSidebarVisible && isSidebarCollapsed && onToggleSidebar && (
             <button onClick={onToggleSidebar} className={`absolute left-4 top-4 md:left-8 md:top-8 z-10 p-3 border rounded-2xl shadow-sm transition-all hover:shadow-md ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-emerald-900/30' : 'bg-white border-gray-100 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'}`}>
                 <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.5} className="w-6 h-6" />
             </button>
         )}
         <div className={`flex flex-col items-center justify-center py-20 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`}>
           <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className={`w-16 h-16 mb-4 ${theme === 'dark' ? 'text-slate-700' : 'text-gray-300'}`} />
           <p className="font-khmer text-lg">មុខងារនេះនឹងមកដល់ឆាប់ៗនេះ</p>
         </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 h-full overflow-y-auto p-4 md:p-8 custom-scrollbar ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto space-y-6 pb-20">
        
        {/* Top Bar with Search (Mobile Only) */}
        {/* Removed search box from here as it's now in the header */}
          
        {/* Popular Surahs (Mobile Only) */}
        {!isSidebarVisible && !searchQuery && (
          <div className="max-w-2xl mx-auto">
            <div 
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className={`flex items-center gap-2 overflow-x-auto pb-2 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
              <span className={`text-xs font-medium shrink-0 mr-1 font-khmer select-none ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`}>ពេញនិយម៖</span>
              {popularSurahs.map(ps => (
                <button
                  key={ps.id}
                  onClick={() => {
                    if (hasDragged) return;
                    const s = surahs.find(sur => sur.id === ps.id);
                    if (s) handleSurahClick(s);
                  }}
                  className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 select-none ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-emerald-900/30 hover:text-emerald-400 hover:border-emerald-900/50' : 'bg-white border-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'}`}
                >
                  <HugeiconsIcon icon={CleanIcon} strokeWidth={1.5} className="w-3 h-3 text-amber-500" />
                  {ps.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hero Section: Continue Reading & Cards */}
        {!searchQuery && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Continue Reading Card */}
            {lastRead ? (
              <div 
                className="lg:col-span-2 bg-emerald-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg cursor-pointer group transition-transform hover:scale-[1.01]" 
                onClick={() => handleSurahClick(lastRead)}
              >
                <div className="absolute inset-0 opacity-10" style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`, 
                  backgroundSize: '30px 30px' 
                }}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-transparent"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 h-full">
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-emerald-200 mb-3 font-medium text-sm">
                      <HugeiconsIcon icon={Clock01Icon} strokeWidth={1.5} className="w-4 h-4" />
                      <span className="font-khmer">បន្តការអាន</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold font-khmer mb-2 group-hover:text-emerald-100 transition-colors">{lastRead.name_khmer}</h2>
                    <p className="text-emerald-100/80 text-lg">{lastRead.name_simple} • {lastRead.verses_count} Ayahs</p>
                  </div>
                  <div className="hidden md:flex items-center justify-center w-14 h-14 rounded-full bg-white/10 backdrop-blur-md group-hover:bg-white/20 transition-all relative">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-white/20"
                        strokeWidth="2.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-emerald-400 transition-all duration-500 ease-out"
                        strokeDasharray={`${readingProgress}, 100`}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="text-sm font-bold text-white z-10">{readingProgress}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-2 bg-emerald-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg flex flex-col justify-center">
                 <div className="absolute inset-0 opacity-10" style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`, 
                  backgroundSize: '30px 30px' 
                }}></div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold font-khmer mb-2">សូមស្វាគមន៍មកកាន់គម្ពីរគូរអាន</h2>
                  <p className="text-emerald-100/80 font-khmer">ជ្រើសរើសជំពូកណាមួយដើម្បីចាប់ផ្តើមអាន</p>
                </div>
              </div>
            )}

            {/* Additional Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div 
                onClick={() => setShowReadingGoal(true)}
                className={`rounded-3xl p-5 border transition-all cursor-pointer flex items-center gap-4 shadow-sm flex-1 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-emerald-900/50' : 'bg-white border-gray-100 hover:border-emerald-200'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                  <HugeiconsIcon icon={Target01Icon} strokeWidth={1.5} className="w-6 h-6" />
                </div>
                <div>
                  <h4 className={`font-bold font-khmer text-sm mb-0.5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>គោលដៅអានគម្ពីរ</h4>
                  <p className={`text-xs font-khmer ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>តាមដានការអានប្រចាំថ្ងៃ</p>
                </div>
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className={`w-4 h-4 ml-auto ${theme === 'dark' ? 'text-slate-600' : 'text-gray-400'}`} />
              </div>
              <div 
                onClick={() => setShowRamadanMission(true)}
                className={`rounded-3xl p-5 border transition-all cursor-pointer flex items-center gap-4 shadow-sm flex-1 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-amber-900/50' : 'bg-white border-gray-100 hover:border-amber-200'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${theme === 'dark' ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                  <HugeiconsIcon icon={Ramadhan01Icon} strokeWidth={1.5} className="w-6 h-6" />
                </div>
                <div>
                  <h4 className={`font-bold font-khmer text-sm mb-0.5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>បេសកកម្មខែរ៉ាម៉ាដន</h4>
                  <p className={`text-xs font-khmer ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>ចូលរួមអានឱ្យចប់ក្នុងខែនេះ</p>
                </div>
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className={`w-4 h-4 ml-auto ${theme === 'dark' ? 'text-slate-600' : 'text-gray-400'}`} />
              </div>
            </div>
          </div>
        )}

        {/* List Section */}
        <div className="pt-2">
          {/* Tabs */}
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-bold font-khmer hidden sm:block ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>បញ្ជី</h3>
            <div className={`flex p-1 rounded-xl w-full sm:w-auto ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-100'}`}>
              <button 
                onClick={() => setCurrentView('surah')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${currentView === 'surah' ? (theme === 'dark' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'bg-white text-emerald-700 shadow-sm') : (theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-gray-500 hover:text-gray-700')}`}
              >
                <HugeiconsIcon icon={ListViewIcon} strokeWidth={1.5} className="w-4 h-4" /> Surah
              </button>
              <button 
                onClick={() => setCurrentView('juz')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${currentView === 'juz' ? (theme === 'dark' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'bg-white text-emerald-700 shadow-sm') : (theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-gray-500 hover:text-gray-700')}`}
              >
                <HugeiconsIcon icon={LayoutGridIcon} strokeWidth={1.5} className="w-4 h-4" /> Juz
              </button>
              <button 
                onClick={() => setCurrentView('revelation')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${currentView === 'revelation' ? (theme === 'dark' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'bg-white text-emerald-700 shadow-sm') : (theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-gray-500 hover:text-gray-700')}`}
              >
                <HugeiconsIcon icon={ArrowUpDownIcon} strokeWidth={1.5} className="w-4 h-4" /> Revelation
              </button>
            </div>
          </div>

          {/* Grid Content */}
          {(currentView === 'surah' || currentView === 'revelation') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displaySurahs.map(surah => (
                <div 
                  key={surah.id}
                  onClick={() => handleSurahClick(surah)}
                  className={`rounded-2xl p-5 border hover:shadow-md transition-all cursor-pointer group flex items-center gap-4 relative overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-emerald-900/50' : 'bg-white border-gray-100 hover:border-emerald-200'}`}
                >
                  <button
                    onClick={(e) => handlePlayPause(e, surah.id)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                      playingSurahId === surah.id && isPlaying
                        ? (theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600')
                        : (theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:bg-emerald-900/30 hover:text-emerald-400' : 'bg-gray-50 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600')
                    }`}
                  >
                    {playingSurahId === surah.id && isPlaying ? (
                      <HugeiconsIcon icon={PauseIcon} strokeWidth={1.5} className="w-4 h-4 fill-current" />
                    ) : (
                      <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0 pr-6">
                    <h4 className={`font-bold font-khmer truncate transition-colors ${theme === 'dark' ? 'text-white group-hover:text-emerald-400' : 'text-gray-900 group-hover:text-emerald-700'}`}>{surah.name_khmer}</h4>
                    <p className={`text-xs truncate mt-0.5 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>{surah.name_simple} • {surah.verses_count} Verses</p>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <span className={`icon-surah${surah.id} text-4xl transition-colors ${theme === 'dark' ? 'text-slate-700 group-hover:text-emerald-500' : 'text-gray-300 group-hover:text-emerald-500'}`}></span>
                  </div>

                  {/* Top Right Surah Number Badge with Smooth Waves */}
                  <div className={`absolute top-0 right-0 font-bold text-[10px] min-w-[28px] h-[24px] flex items-center justify-center rounded-bl-xl transition-colors z-10 ${theme === 'dark' ? 'bg-slate-800 group-hover:bg-emerald-900/30 text-slate-400 group-hover:text-emerald-400' : 'bg-gray-50 group-hover:bg-emerald-50 text-gray-400 group-hover:text-emerald-600'}`}>
                    {/* Left curve */}
                    <div className={`absolute top-0 -left-2 w-2 h-2 bg-transparent rounded-tr-lg shadow-[4px_-4px_0_4px] transition-shadow ${theme === 'dark' ? 'shadow-slate-800 group-hover:shadow-emerald-900/30' : 'shadow-gray-50 group-hover:shadow-emerald-50'}`}></div>
                    {/* Bottom curve */}
                    <div className={`absolute -bottom-2 right-0 w-2 h-2 bg-transparent rounded-tr-lg shadow-[4px_-4px_0_4px] transition-shadow ${theme === 'dark' ? 'shadow-slate-800 group-hover:shadow-emerald-900/30' : 'shadow-gray-50 group-hover:shadow-emerald-50'}`}></div>
                    {surah.id}
                  </div>
                </div>
              ))}
              {displaySurahs.length === 0 && (
                <div className={`col-span-full text-center py-10 font-khmer ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
                  មិនមានលទ្ធផលស្វែងរកទេ
                </div>
              )}
            </div>
          )}

          {currentView === 'juz' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {juzs.map(juz => (
                <div 
                  key={juz.id}
                  onClick={() => handleJuzClick(juz)}
                  className={`rounded-2xl p-6 border hover:shadow-md transition-all cursor-pointer group flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-emerald-900/50' : 'bg-white border-gray-100 hover:border-emerald-200'}`}
                >
                  <span className={`text-3xl font-bold transition-colors ${theme === 'dark' ? 'text-slate-200 group-hover:text-emerald-400' : 'text-gray-800 group-hover:text-emerald-600'}`}>{juz.juz_number}</span>
                  <span className={`text-xs font-medium uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>Juz</span>
                  
                  {/* Decorative Juz Name using quran-common font */}
                  <div className="absolute -bottom-4 -right-2 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <span 
                      className={`text-7xl ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-900'}`} 
                      style={{ fontFamily: "'common/quran-common'" }}
                    >
                      {`j${String(juz.juz_number).padStart(3, '0')}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentView === 'search' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold font-khmer ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>លទ្ធផលស្វែងរក: "{advSearchQuery}"</h3>
                <span className={`text-sm font-khmer ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>{searchResults.length} លទ្ធផល</span>
              </div>
              
              {searchResults.length === 0 ? (
                <div className={`text-center py-10 font-khmer rounded-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-gray-100 text-gray-400'}`}>
                  មិនមានលទ្ធផលស្វែងរកទេ
                </div>
              ) : (
                <div className="grid gap-4">
                  {searchResults.map((result, idx) => {
                    const [surahId, ayahId] = result.verse_key.split(':');
                    const surah = surahs.find(s => s.id === parseInt(surahId));
                    return (
                      <div 
                        key={idx}
                        onClick={() => surah && onSelectSurah(surah)}
                        className={`rounded-2xl p-6 border transition-all cursor-pointer group ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-emerald-900/50 hover:shadow-emerald-900/10' : 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-md'}`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
                              {surah?.name_simple} {result.verse_key}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <p className={`text-right text-2xl font-uthman leading-loose ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`} dir="rtl">
                            {result.text}
                          </p>
                          {result.translations && result.translations.length > 0 && (
                            <p 
                              className={`font-khmer text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}
                              dangerouslySetInnerHTML={{ __html: result.translations[0].text }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Advanced Search Modal */}
      {showAdvancedSearch && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowAdvancedSearch(false)}>
            <div className={`w-full max-w-lg rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-300 ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-xl font-bold font-khmer ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>ការស្វែងរកកម្រិតខ្ពស់</h3>
                    <button onClick={() => setShowAdvancedSearch(false)} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-400 hover:bg-gray-100'}`}>
                        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className={`block text-sm font-medium font-khmer mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>ស្វែងរកពាក្យ</label>
                        <input 
                          type="text" 
                          className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-khmer ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`} 
                          placeholder="បញ្ចូលពាក្យ..." 
                          value={advSearchQuery}
                          onChange={(e) => setAdvSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAdvancedSearch()}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium font-khmer mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>ក្នុងជំពូក</label>
                            <select 
                              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-khmer ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                              value={advSearchSurah}
                              onChange={(e) => setAdvSearchSurah(e.target.value)}
                            >
                                <option value="all">ទាំងអស់</option>
                                {surahs.map(s => <option key={s.id} value={s.id}>{s.id}. {s.name_khmer}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={`block text-sm font-medium font-khmer mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>ប្រភេទ</label>
                            <select 
                              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-khmer ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                              value={advSearchType}
                              onChange={(e) => setAdvSearchType(e.target.value)}
                            >
                                <option value="all">ទាំងអស់</option>
                                <option value="arabic">អត្ថបទអារ៉ាប់</option>
                                <option value="translation">សេចក្តីប្រែសម្រួល</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={() => setShowAdvancedSearch(false)} className={`px-5 py-2.5 font-medium rounded-xl transition-colors font-khmer ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'}`}>
                        បោះបង់
                    </button>
                    <button 
                      onClick={handleAdvancedSearch}
                      disabled={isSearching || !advSearchQuery.trim()}
                      className="px-5 py-2.5 bg-emerald-600 text-white font-medium hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-2 font-khmer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSearching ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="w-4 h-4" />
                        )}
                        ស្វែងរក
                    </button>
                </div>
            </div>
        </div>
      )}

      <ReadingGoalModal 
        isOpen={showReadingGoal} 
        onClose={() => setShowReadingGoal(false)} 
      />
      
      <RamadanMissionModal 
        isOpen={showRamadanMission} 
        onClose={() => setShowRamadanMission(false)} 
      />
    </div>
  );
};
