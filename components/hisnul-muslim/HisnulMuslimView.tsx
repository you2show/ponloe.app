import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon, ArrowLeft01Icon, ArrowRight01Icon, BookOpen01Icon, Cancel01Icon, Copy01Icon, FavouriteIcon, Home01Icon, Layers01Icon, PauseIcon, PlayIcon, Search01Icon, Share01Icon, Tick01Icon, VolumeHighIcon } from '@hugeicons/core-free-icons';


import React, { useState, useRef, useEffect } from 'react';

import { HISNUL_CATEGORIES, HISNUL_CHAPTERS, Category, Chapter, Dua, toKhmerNum } from './data';

export const HisnulMuslimView: React.FC = () => {
  // View State: 'CATEGORIES' -> 'CHAPTERS' -> 'READING' | 'FAVORITES'
  const [viewState, setViewState] = useState<'CATEGORIES' | 'CHAPTERS' | 'READING' | 'FAVORITES'>('CATEGORIES');
  
  // Navigation State
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedDua, setSelectedDua] = useState<Dua | null>(null);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioErrorId, setAudioErrorId] = useState<string | null>(null);
  
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(null); // Feedback for share button
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile sidebar in reading mode
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio Object
  useEffect(() => {
    audioRef.current = new Audio();
    
    const handleEnded = () => setPlayingId(null);
    const handleError = (e: Event) => {
        console.error("Audio playback error:", e);
        setPlayingId((current) => {
            if (current) setAudioErrorId(current);
            return null;
        });
        // Clear error message after 3 seconds
        setTimeout(() => setAudioErrorId(null), 3000);
    };

    audioRef.current.addEventListener('ended', handleEnded);
    audioRef.current.addEventListener('error', handleError);

    return () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.removeEventListener('ended', handleEnded);
            audioRef.current.removeEventListener('error', handleError);
        }
    };
  }, []);

  // Load Favorites and Handle Deep Linking
  useEffect(() => {
    // 1. Load Favorites
    const saved = localStorage.getItem('hisnul_favorites');
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)));
    }

    // 2. Handle Deep Linking (e.g., ponloe.org/hisn:225)
    const path = window.location.pathname;
    const match = path.match(/\/hisn:(\d+)/);
    
    if (match) {
        const duaNum = parseInt(match[1]);
        // Find which chapter contains this Dua
        const foundChapter = HISNUL_CHAPTERS.find(ch => 
            ch.duas.some(d => d.number === duaNum)
        );

        if (foundChapter) {
            // Set dummy category so "Back" button works reasonably (goes to Chapters grid)
            const dummyCat = HISNUL_CATEGORIES.find(c => c.id === 'all') || { 
                id: 'all', titleKhmer: 'ទាំងអស់', titleEnglish: 'All Chapters', 
                icon: Layers01Icon, color: 'bg-slate-100 text-slate-600' 
            };
            setSelectedCategory(dummyCat as Category);
            setSelectedChapter(foundChapter);
            setViewState('READING');
        }
    }
  }, []);

  const toggleFavorite = (id: string) => {
    const newFavs = new Set(favorites);
    if (newFavs.has(id)) {
      newFavs.delete(id);
    } else {
      newFavs.add(id);
    }
    setFavorites(newFavs);
    localStorage.setItem('hisnul_favorites', JSON.stringify(Array.from(newFavs)));
  };

  // Robust Copy Function (Handles Permission Issues)
  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      // Try modern API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      throw new Error("Clipboard API unavailable");
    } catch (err) {
      // Fallback method using textarea
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch (fallbackErr) {
        console.error("Copy failed", fallbackErr);
        return false;
      }
    }
  };

  const handleCopy = async (text: string, id: string) => {
    if (await copyToClipboard(text)) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleShare = async (dua: Dua) => {
    const shareText = `${dua.arabic}\n\n${dua.translation}\n\n(Hisnul Muslim - Dua #${dua.number})`;
    
    // Generate Clean URL: ponloe.org/hisn:123
    const origin = window.location.origin; // e.g., https://ponloe.org
    const cleanUrl = `${origin}/hisn:${dua.number}`;

    const shareData = {
      title: `Hisnul Muslim - Dua #${dua.number}`,
      text: shareText,
      url: cleanUrl
    };

    if (navigator.share) {
      try { 
        await navigator.share(shareData); 
      } catch (err) { 
        console.error("Share failed:", err);
        // Fallback to copy if share fails
        if (await copyToClipboard(`${shareText}\n${cleanUrl}`)) {
          setSharedId(dua.id);
          setTimeout(() => setSharedId(null), 2000);
        }
      }
    } else {
      // Desktop fallback: Copy text + URL
      if (await copyToClipboard(`${shareText}\nLink: ${cleanUrl}`)) {
        setSharedId(dua.id);
        setTimeout(() => setSharedId(null), 2000);
      }
    }
  };

  const toggleAudio = (id: string, src?: string) => {
    if (!src || !audioRef.current) return;

    // Reset error state
    setAudioErrorId(null);

    if (playingId === id) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      // Pause any current audio
      audioRef.current.pause();
      
      // Set new source and play
      audioRef.current.src = src;
      // load() is important to reset the media element state
      audioRef.current.load();
      
      setPlayingId(id);
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Playback prevented or failed:", error);
          setPlayingId(null);
          setAudioErrorId(id);
          setTimeout(() => setAudioErrorId(null), 3000);
        });
      }
    }
  };

  // --- Helpers ---
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    // Always go to CHAPTERS view first for better navigation UX
    setViewState('CHAPTERS');
    setSearchQuery('');
  };

  const handleChapterSelect = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setViewState('READING');
    setIsSidebarOpen(false);
  };

  const goBack = () => {
    if (audioRef.current) {
        audioRef.current.pause();
        setPlayingId(null);
    }

    if (viewState === 'READING') {
      setViewState('CHAPTERS');
      setSelectedChapter(null);
    } else if (viewState === 'CHAPTERS') {
      setViewState('CATEGORIES');
      setSelectedCategory(null);
    } else if (viewState === 'FAVORITES') {
      setViewState('CATEGORIES');
    }
  };

  // Filter Chapters based on selected Category and Search (Main Grid)
  const filteredChapters = HISNUL_CHAPTERS.filter(ch => {
    const matchesSearch = 
      ch.titleKhmer.includes(searchQuery) || 
      ch.titleEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.number.toString() === searchQuery;
    
    const matchesCategory = selectedCategory 
      ? ch.categoryIds.includes(selectedCategory.id) || selectedCategory.id === 'all'
      : true;

    return matchesSearch && matchesCategory;
  });

  // Get ALL favorited Duas
  const getFavoriteDuas = () => {
    const favs: { dua: Dua; chapter: Chapter }[] = [];
    HISNUL_CHAPTERS.forEach(ch => {
      ch.duas.forEach(d => {
        if (favorites.has(d.id)) {
          favs.push({ dua: d, chapter: ch });
        }
      });
    });
    return favs;
  };

  // --- SUB-COMPONENT: CATEGORY GRID (HOME) ---
  const CategoryGrid = () => (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
         <div className="relative flex-1 shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="ស្វែងរក..."
            />
         </div>
         <button 
            onClick={() => setViewState('FAVORITES')}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-700 px-6 py-4 rounded-2xl shadow-sm transition-all group"
         >
            <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} className="w-5 h-5 text-gray-400 group-hover:text-red-500 group-hover:fill-red-500 transition-colors" />
            <span className="font-bold font-khmer">ឌូអាដែលបានរក្សាទុក</span>
         </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {HISNUL_CATEGORIES.map((cat) => (
          <div 
            key={cat.id}
            onClick={() => handleCategorySelect(cat)}
            className={`
              relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg border border-transparent hover:border-emerald-100 group
              ${cat.color} bg-opacity-20
            `}
          >
             <div className="absolute -right-4 -bottom-4 opacity-10 transform rotate-12 scale-150 group-hover:scale-125 transition-transform duration-500">
                <HugeiconsIcon icon={cat.icon} size={100} />
             </div>

             <div className="relative z-10 flex items-start justify-between">
                <div>
                   <h3 className="font-bold font-khmer text-lg md:text-xl mb-1 text-gray-800">{cat.titleKhmer}</h3>
                   <p className="text-sm font-medium opacity-70">{cat.titleEnglish}</p>
                   
                   <span className="inline-block mt-4 text-xs font-bold bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full text-gray-600">
                      {cat.id === 'all' ? HISNUL_CHAPTERS.length : HISNUL_CHAPTERS.filter(c => c.categoryIds.includes(cat.id)).length} Chapters
                   </span>
                </div>
                <div className={`p-3 rounded-xl bg-white shadow-sm ${cat.color.replace('bg-', 'text-').replace('text-', 'text-opacity-100 ')}`}>
                   <HugeiconsIcon icon={cat.icon} size={24} />
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  // --- SUB-COMPONENT: CHAPTER LIST (FILTERED) ---
  const ChapterList = () => (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6 sticky top-0 bg-gray-50 z-20 py-2">
         <button onClick={goBack} className="p-2.5 bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition-colors shadow-sm active:scale-95">
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-5 h-5 text-gray-700" />
         </button>
         <div>
            <h2 className="text-xl font-bold font-khmer text-gray-900">{selectedCategory?.titleKhmer || 'បញ្ជីជំពូក'}</h2>
            <p className="text-sm text-gray-500">{selectedCategory?.titleEnglish || 'All Chapters'}</p>
         </div>
      </div>

      <div className="relative mb-6">
          <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder={`ស្វែងរកក្នុងផ្នែក "${selectedCategory?.titleKhmer || 'ទាំងអស់'}"...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredChapters.map((chapter) => (
          <div 
            key={chapter.id} 
            onClick={() => handleChapterSelect(chapter)}
            className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group flex items-center gap-5"
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700 font-bold font-khmer text-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0 shadow-inner">
              {toKhmerNum(chapter.number)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-900 font-khmer text-base group-hover:text-emerald-700 leading-snug">
                {chapter.titleKhmer}
              </h3>
              <p className="text-xs text-gray-500 mt-1 truncate">{chapter.titleEnglish}</p>
            </div>
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );

  // --- SUB-COMPONENT: READING VIEW ---
  const ReadingView = () => {
    if (!selectedChapter) return null;
    
    // Local state for sidebar search
    const [sidebarSearch, setSidebarSearch] = useState('');

    const sourceChapters = selectedCategory?.id === 'all'
        ? HISNUL_CHAPTERS
        : HISNUL_CHAPTERS.filter(c => c.categoryIds.includes(selectedCategory!.id));

    const sidebarChapters = sourceChapters.filter(ch => 
        ch.titleKhmer.includes(sidebarSearch) || 
        ch.number.toString().includes(sidebarSearch) ||
        ch.titleEnglish.toLowerCase().includes(sidebarSearch.toLowerCase())
    );

    return (
      <div className="flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] bg-white overflow-hidden">
        
        {/* Inline CSS for Custom Scrollbar */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #cbd5e1; /* slate-300 */
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: #94a3b8; /* slate-400 */
          }
        `}</style>

        {/* Navigation Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-20 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <button 
              onClick={goBack}
              className="p-2.5 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors active:scale-95 flex items-center gap-1"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded font-bold font-khmer shrink-0">
                  {toKhmerNum(selectedChapter.number)}
                </span>
                <h2 className="font-bold text-gray-900 font-khmer truncate text-sm md:text-lg">
                  {selectedChapter.titleKhmer}
                </h2>
              </div>
            </div>
          </div>
          
          <button 
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
          
          {/* LEFT SIDEBAR */}
          <div className={`
            absolute inset-y-0 left-0 z-10 w-80 bg-gray-50 border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col
            ${isSidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full md:shadow-none'}
          `}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 md:hidden bg-white shrink-0">
                 <span className="font-bold text-gray-700 text-sm">បញ្ជីជំពូក ({sourceChapters.length})</span>
                 <button onClick={() => setIsSidebarOpen(false)}><HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5 text-gray-400"/></button>
              </div>

              {/* Sidebar Search */}
              <div className="p-3 border-b border-gray-200 bg-white shrink-0">
                 <div className="relative">
                    <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                       type="text"
                       placeholder="ស្វែងរកជំពូក..."
                       value={sidebarSearch}
                       onChange={(e) => setSidebarSearch(e.target.value)}
                       className="w-full pl-9 pr-3 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 rounded-lg text-sm outline-none transition-all"
                    />
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                 {sidebarChapters.map((chapter) => (
                    <button
                       key={chapter.id}
                       onClick={() => { setSelectedChapter(chapter); setIsSidebarOpen(false); }}
                       className={`w-full text-left p-3 rounded-xl text-sm transition-all border ${
                          selectedChapter.id === chapter.id 
                          ? 'bg-white border-emerald-200 shadow-sm ring-1 ring-emerald-500/20' 
                          : 'bg-transparent border-transparent hover:bg-white hover:border-gray-200 hover:shadow-sm text-gray-600'
                       }`}
                    >
                       <div className="flex gap-3 items-center">
                          <span className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold shrink-0 ${selectedChapter.id === chapter.id ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>
                             {toKhmerNum(chapter.number)}
                          </span>
                          <span className={`font-khmer line-clamp-2 ${selectedChapter.id === chapter.id ? 'text-emerald-900 font-bold' : ''}`}>
                             {chapter.titleKhmer}
                          </span>
                       </div>
                    </button>
                 ))}
                 {sidebarChapters.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-xs">
                       រកមិនឃើញជំពូកនេះទេ
                    </div>
                 )}
              </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 relative w-full custom-scrollbar">
            <div className="max-w-3xl mx-auto p-4 md:p-8 pb-24">
                <div className="space-y-6">
                   <div className="mb-6 text-center md:hidden">
                      <h2 className="text-xl font-bold text-gray-900 font-khmer mb-1">{selectedChapter.titleKhmer}</h2>
                      <p className="text-xs text-gray-500">{selectedChapter.titleEnglish}</p>
                   </div>
                   
                   {selectedChapter.duas.map((dua) => (
                      <div key={dua.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                         <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <span className="inline-flex items-center gap-2 bg-white border border-gray-200 px-3 py-1 rounded-full text-xs font-bold text-gray-500 shadow-sm">
                               Dua #{dua.number}
                            </span>
                            <div className="flex gap-1">
                               <button onClick={() => toggleFavorite(dua.id)} className={`p-2 rounded-full hover:bg-gray-100 ${favorites.has(dua.id) ? 'text-red-500' : 'text-gray-400'}`}>
                                  <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} className={`w-5 h-5 ${favorites.has(dua.id) ? 'fill-current' : ''}`} />
                               </button>
                               <button onClick={() => handleCopy(`${dua.arabic}\n\n${dua.translation}`, dua.id)} className="p-2 rounded-full hover:bg-gray-100 text-gray-400">
                                  {copiedId === dua.id ? <HugeiconsIcon icon={Tick01Icon} strokeWidth={1.5} className="w-5 h-5 text-green-600" /> : <HugeiconsIcon icon={Copy01Icon} strokeWidth={1.5} className="w-5 h-5" />}
                               </button>
                               <button onClick={() => handleShare(dua)} className="p-2 rounded-full hover:bg-gray-100 text-gray-400">
                                  {sharedId === dua.id ? <HugeiconsIcon icon={Tick01Icon} strokeWidth={1.5} className="w-5 h-5 text-green-600" /> : <HugeiconsIcon icon={Share01Icon} strokeWidth={1.5} className="w-5 h-5" />}
                               </button>
                            </div>
                         </div>
                         <div className="p-6 md:p-8">
                            {/* Adjusted Font Size here: text-xl md:text-2xl */}
                            <p className="font-arabic text-xl md:text-2xl text-right leading-[2.4] text-gray-800 mb-6" dir="rtl">{dua.arabic}</p>
                            <div className="relative pl-6 py-1 border-l-4 border-emerald-100">
                               <p className="text-gray-700 font-khmer text-base leading-loose">{dua.translation}</p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                               <span className="text-xs text-gray-400 italic bg-gray-50 px-2 py-1 rounded">Ref: {dua.reference}</span>
                               {dua.audioSrc && (
                                  <div className="flex flex-col items-end gap-1">
                                    <button 
                                       onClick={() => toggleAudio(dua.id, dua.audioSrc)}
                                       className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${
                                          audioErrorId === dua.id 
                                            ? 'bg-red-50 text-red-600 border border-red-200'
                                            : playingId === dua.id 
                                              ? 'bg-emerald-100 text-emerald-700' 
                                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                       }`}
                                    >
                                       {audioErrorId === dua.id ? (
                                          <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={1.5} className="w-4 h-4" />
                                       ) : playingId === dua.id ? (
                                          <HugeiconsIcon icon={PauseIcon} strokeWidth={1.5} className="w-4 h-4 fill-current" />
                                       ) : (
                                          <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} className="w-4 h-4 ml-0.5 fill-current" />
                                       )}
                                       <span>
                                          {audioErrorId === dua.id ? 'សំឡេងមានបញ្ហា' : playingId === dua.id ? 'កំពុងស្តាប់...' : 'ស្តាប់'}
                                       </span>
                                    </button>
                                  </div>
                               )}
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Overlay for Sidebar */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/20 z-0 md:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}
      </div>
    );
  };

  // --- SUB-COMPONENT: FAVORITES VIEW ---
  const FavoritesView = () => {
    const favoriteDuas = getFavoriteDuas();
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
         <div className="flex items-center gap-4 mb-8 sticky top-0 bg-gray-50 z-20 py-2">
            <button onClick={goBack} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition-colors">
                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-xl font-bold font-khmer text-gray-900 flex items-center gap-2">
               <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} className="w-5 h-5 fill-red-500 text-red-500" /> ឌូអាដែលបានរក្សាទុក
            </h2>
         </div>
         {favoriteDuas.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
               <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} className="w-12 h-12 mx-auto mb-2 text-gray-300" />
               <p>មិនទាន់មានឌូអាដែលបានរក្សាទុកនៅឡើយទេ។</p>
            </div>
         ) : (
            <div className="space-y-6">
               {favoriteDuas.map(({ dua, chapter }) => (
                  <div key={dua.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                             Chapter {toKhmerNum(chapter.number)}
                          </span>
                          <button onClick={() => toggleFavorite(dua.id)} className="text-red-500">
                             <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} className="w-5 h-5 fill-current" />
                          </button>
                      </div>
                      <div className="p-6">
                          <p className="font-arabic text-xl md:text-2xl text-right mb-4">{dua.arabic}</p>
                          <p className="text-gray-700 font-khmer">{dua.translation}</p>
                          <div className="flex justify-end mt-4">
                             <button onClick={() => handleShare(dua)} className="text-gray-400 hover:text-blue-600">
                                {sharedId === dua.id ? <HugeiconsIcon icon={Tick01Icon} strokeWidth={1.5} className="w-5 h-5 text-green-600" /> : <HugeiconsIcon icon={Share01Icon} strokeWidth={1.5} className="w-5 h-5" />}
                             </button>
                          </div>
                      </div>
                  </div>
               ))}
            </div>
         )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 animate-in fade-in duration-300">
      {viewState === 'CATEGORIES' && (
        <>
          <div className="bg-emerald-900 text-white pt-10 pb-16 px-6 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
             <div className="relative max-w-4xl mx-auto text-center">
                <h1 className="text-3xl md:text-5xl font-bold mb-3 font-khmer-title">Hisnul Muslim</h1>
                <p className="text-emerald-100 text-sm md:text-lg opacity-90 font-khmer">
                   បន្ទាយការពារមូស្លីម (បណ្តុំឌូអាប្រចាំថ្ងៃ)
                </p>
             </div>
          </div>
          <div className="-mt-10 relative z-10">
             <CategoryGrid />
          </div>
        </>
      )}

      {viewState === 'CHAPTERS' && <ChapterList />}
      {viewState === 'READING' && <ReadingView />}
      {viewState === 'FAVORITES' && <FavoritesView />}
    </div>
  );
};
