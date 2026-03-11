import { HugeiconsIcon } from '@hugeicons/react';
import { PlayIcon, PauseIcon, Cancel01Icon, Share01Icon, Upload01Icon, LinkSquare01Icon, ArrowRight01Icon, Search01Icon, ReloadIcon, Playlist01Icon } from '@hugeicons/core-free-icons';

import React, { useState, useEffect, useRef } from 'react';

import { ALLAH_NAMES_DATA, AllahName } from './data';
import { useToast } from '@/contexts/ToastContext';

export const AllahNamesView: React.FC = () => {
  const { showToast } = useToast();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [details, setDetails] = useState<string | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [fetchedDataCache, setFetchedDataCache] = useState<any[] | null>(null);
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  
  // Audio State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Refs for consistent access in callbacks
  const playingIdRef = useRef<number | null>(null);
  const isAutoPlayingRef = useRef<boolean>(false);
  const filteredNamesRef = useRef<AllahName[]>([]);

  const selectedName = selectedId ? ALLAH_NAMES_DATA.find(n => n.id === selectedId) : null;

  // Filter Data based on Search
  const filteredNames = ALLAH_NAMES_DATA.filter(item => 
    item.khmerName.includes(searchTerm) || 
    item.transliteration.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.khmerMeaning.includes(searchTerm) ||
    item.id.toString() === searchTerm
  );
  
  // Keep ref in sync for event listener
  useEffect(() => {
    filteredNamesRef.current = filteredNames;
  }, [filteredNames]);

  // Sync autoPlaying state with ref
  useEffect(() => {
    isAutoPlayingRef.current = isAutoPlaying;
  }, [isAutoPlaying]);

  // Initialize audio and listeners
  useEffect(() => {
    if (!audioRef.current) {
        audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    
    const handleError = (e: Event) => {
        console.warn("Audio playback failed:", audio.error);
        setIsPlaying(null);
        playingIdRef.current = null;
        
        // If autoplaying, try to skip to next after a delay, or stop
        if (isAutoPlayingRef.current) {
             const currentList = filteredNamesRef.current;
             // Find current index
             // We can't easily know which ID failed from the event alone without tracking, 
             // but playingIdRef should have it.
             const failedId = playingIdRef.current; // This might be null already due to sync
             
             // Simple fallback: stop autoplay on error to prevent infinite loops of errors
             setIsAutoPlaying(false);
        }
    };

    const handleEnded = () => {
      const currentId = playingIdRef.current;
      const isAuto = isAutoPlayingRef.current;
      const currentList = filteredNamesRef.current;

      setIsPlaying(null);
      playingIdRef.current = null;
      
      if (isAuto && currentId) {
        const currentIndex = currentList.findIndex(n => n.id === currentId);
        
        if (currentIndex !== -1 && currentIndex < currentList.length - 1) {
            const nextItem = currentList[currentIndex + 1];
            // Small delay to ensure clean transition
            setTimeout(() => {
                if (nextItem.audioSrc) {
                    playAudio(nextItem.id, nextItem.audioSrc);
                } else {
                    setIsAutoPlaying(false);
                }
            }, 100);
        } else {
            // End of list
            setIsAutoPlaying(false);
        }
      } else if (isAuto && !currentId) {
          setIsAutoPlaying(false);
      }
    };

    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        if (audio) audio.pause();
    };
  }, []); // Run once

  const playAudio = (id: number, src: string) => {
      if (!audioRef.current) return;
      
      if (!src) {
          console.warn(`No audio source for ID ${id}`);
          setIsPlaying(null);
          playingIdRef.current = null;
          return;
      }
      
      try {
          audioRef.current.pause();
          
          setIsPlaying(id);
          playingIdRef.current = id;
          
          audioRef.current.src = src;
          audioRef.current.load();
          
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
              playPromise.catch(e => {
                  if (e.name === 'AbortError') return;
                  console.error("Playback error:", e);
                  setIsPlaying(null);
                  playingIdRef.current = null;
                  setIsAutoPlaying(false);
              });
          }
      } catch (err) {
          console.error("Audio catch:", err);
          setIsPlaying(null);
          playingIdRef.current = null;
          setIsAutoPlaying(false);
      }
  };

  const handlePlayAudio = (e: React.MouseEvent, name: AllahName) => {
    e.stopPropagation();
    if (!name.audioSrc) {
        showToast("សំឡេងមិនទាន់មាននៅឡើយទេ។", "info");
        return;
    }
    
    // Stop global autoplay if interacting manually
    if (isAutoPlaying) setIsAutoPlaying(false);

    if (audioRef.current) {
      if (isPlaying === name.id) {
        audioRef.current.pause();
        setIsPlaying(null);
        playingIdRef.current = null;
      } else {
        playAudio(name.id, name.audioSrc);
      }
    }
  };

  const toggleAutoPlay = () => {
      if (isAutoPlaying) {
          setIsAutoPlaying(false);
          if (audioRef.current) audioRef.current.pause();
          setIsPlaying(null);
          playingIdRef.current = null;
      } else {
          setIsAutoPlaying(true);
          // Start from first item available that has audio
          const firstPlayable = filteredNames.find(n => n.audioSrc);
          if (firstPlayable) {
              playAudio(firstPlayable.id, firstPlayable.audioSrc);
          } else {
              showToast("មិនមានទិន្នន័យសំឡេងនៅក្នុងបញ្ជីនេះទេ។", "error");
              setIsAutoPlaying(false);
          }
      }
  };

  const closeModal = () => {
    setSelectedId(null);
    setDetails(null);
    if (!isAutoPlaying && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(null);
        playingIdRef.current = null;
    }
  };

  // Google Sheet Data Fetching
  useEffect(() => {
    if (selectedId) {
      fetchDetailedDefinition(selectedId);
    }
  }, [selectedId]);

  const fetchDetailedDefinition = async (id: number) => {
    setLoadingDetails(true);
    setDetails(null);
    try {
        let cache = fetchedDataCache;
        if (!cache) {
            const sheetId = '172C5YquqkxPO8w8iQNtyLCOERUnspDgQIq_0DjeV_vw';
            const sheetName = 'Sheet1';
            const dataUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
            const response = await fetch(dataUrl);
            const text = await response.text();
            const jsonString = text.match(/google\.visualization\.Query\.setResponse\((.*)\)/s)?.[1];
            if (!jsonString) throw new Error("Invalid response format");
            const data = JSON.parse(jsonString);
            const headers = data.table.cols.map((col: any) => col.label.toLowerCase().replace(/\s/g, ''));
            const idIndex = headers.indexOf('id');
            const textIndex = headers.indexOf('detailtext');
            const imgIndex = headers.indexOf('detailimg');
            cache = data.table.rows.map((row: any) => ({
                id: (row.c[idIndex] && row.c[idIndex].v) ? row.c[idIndex].v : '',
                text: (row.c[textIndex] && row.c[textIndex].v) ? row.c[textIndex].v : '',
                img: (row.c[imgIndex] && row.c[imgIndex].v) ? row.c[imgIndex].v : ''
            }));
            setFetchedDataCache(cache);
        }
        const entry = cache?.find((row: any) => row.id == id);
        if (entry) {
            let htmlContent = '';
            if (entry.img) {
                const urls = entry.img.split(',');
                urls.forEach((url: string) => {
                    htmlContent += `<img referrerPolicy="no-referrer" src="${url.trim()}" class="w-full h-auto rounded-lg mb-4" />`;
                });
            }
            if (entry.text) {
                htmlContent += `<p class="leading-relaxed text-gray-700 font-khmer">${entry.text.replace(/\n/g, '<br>')}</p>`;
            }
            setDetails(htmlContent || "<p class='font-khmer text-gray-500'>មិនទាន់មាននិយមន័យលម្អិតនៅឡើយទេ។</p>");
        } else {
            setDetails("<p class='font-khmer text-gray-500'>មិនមាននិយមន័យលម្អិតសម្រាប់ព្រះនាមនេះទេ។</p>");
        }
    } catch (error) {
        console.error("Fetch error:", error);
        setDetails("<p class='font-khmer text-red-500'>មានបញ្ហាក្នុងការទាញយកទិន្នន័យ។</p>");
    } finally {
        setLoadingDetails(false);
    }
  };

  const handleShare = async () => {
    if (!selectedName) return;
    const shareData = {
        title: `ព្រះនាមទី ${selectedName.id}: ${selectedName.khmerName}`,
        text: selectedName.khmerMeaning,
        url: window.location.href
    };
    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);
            showToast('បានចម្លងទៅ Clipboard!', 'success');
        }
    } catch (err) {
        console.error(err);
    }
  };

  return (
    <div className="min-h-screen pb-20 animate-in fade-in duration-300">
      
      {/* Header Banner - Replaced Video with Image to prevent loading error */}
      <div className="relative w-full aspect-video md:aspect-[21/9] lg:h-[400px] overflow-hidden shadow-lg bg-black">
         <img referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-80" 
            src="https://images.unsplash.com/photo-1542382672-13e659b922a9?q=80&w=2000&auto=format&fit=crop"
            alt="Islamic Pattern Background"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-6 md:p-10">
            <h1 className="text-3xl md:text-5xl font-bold text-white font-khmer-title tracking-wide drop-shadow-md">
                ព្រះនាមដ៏មហាប្រពៃទាំង ៩៩ របស់អល់ឡោះ
            </h1>
         </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Intro Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between text-yellow-900 shadow-sm">
            <p className="font-khmer text-sm md:text-base leading-relaxed">
                យើងដឹងថា ការប្រែសម្រួលជាខេមរភាសាខាងក្រោម នៅមានកម្រិត និងកើតមានកំហុសឆ្គងជាច្រើន។ យើងរីករាយក្នុងការស្តាប់មតិស្ថាបនារបស់អ្នក។
            </p>
            <button className="whitespace-nowrap px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg font-medium text-sm transition-colors flex items-center gap-2">
               ចូលរួមផ្តល់មតិ <HugeiconsIcon icon={LinkSquare01Icon} strokeWidth={1.5} className="w-4 h-4"/>
            </button>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-row gap-3 sticky top-0 z-30 bg-white/95 backdrop-blur-md py-3 -mx-4 px-4 shadow-sm border-b border-gray-100 transition-all items-center">
            <div className="flex-1 relative group">
                <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                <input 
                    type="text" 
                    placeholder="ស្វែងរក..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none font-khmer text-sm text-gray-700 shadow-sm transition-all"
                />
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    >
                        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-3 h-3" />
                    </button>
                )}
            </div>
            
            <button 
                onClick={toggleAutoPlay}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold font-khmer shadow-sm transition-all active:scale-95 whitespace-nowrap text-sm ${isAutoPlaying ? 'bg-green-600 text-white shadow-green-200 shadow-lg' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
            >
                {isAutoPlaying ? <HugeiconsIcon icon={PauseIcon} strokeWidth={1.5} className="w-4 h-4 animate-pulse" /> : <HugeiconsIcon icon={Playlist01Icon} strokeWidth={1.5} className="w-4 h-4" />}
                <span className="hidden sm:inline">{isAutoPlaying ? 'កំពុងចាក់...' : 'ចាក់ទាំងអស់'}</span>
                <span className="sm:hidden">{isAutoPlaying ? 'ឈប់' : 'ចាក់'}</span>
            </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pt-2">
            {filteredNames.length > 0 ? (
                filteredNames.map((item) => (
                    <div 
                        key={item.id} 
                        onClick={() => setSelectedId(item.id)}
                        className={`bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition-all cursor-pointer relative overflow-hidden group ${isPlaying === item.id ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-100 hover:border-green-200'}`}
                    >
                        {/* ID Badge */}
                        <div className={`absolute -top-3 -left-3 w-16 h-16 rounded-br-3xl flex items-center justify-center pt-2 pl-2 font-bold font-khmer-title text-xl shadow-inner transition-colors ${isPlaying === item.id ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600 opacity-80 group-hover:opacity-100'}`}>
                            {item.id}
                        </div>

                        <div className="flex items-start justify-between gap-4 pl-10">
                            <div className="flex-1 min-w-0">
                                <h3 className={`text-xl font-bold font-khmer-title mb-1 truncate ${isPlaying === item.id ? 'text-green-700' : 'text-gray-900'}`}>{item.khmerName}</h3>
                                <p className="text-sm text-gray-500 font-khmer line-clamp-2 leading-relaxed">{item.khmerMeaning}</p>
                            </div>
                            
                            <div className="flex flex-col items-center gap-3 shrink-0">
                                <img referrerPolicy="no-referrer" src={item.imageSrc} alt={item.transliteration} className="w-16 h-16 object-contain" />
                                <button 
                                    onClick={(e) => handlePlayAudio(e, item)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${isPlaying === item.id ? 'bg-green-600 text-white scale-110' : 'bg-green-50 text-green-600 hover:bg-green-100'} ${!item.audioSrc ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title={!item.audioSrc ? 'មិនមានសំឡេង' : 'ចាក់សំឡេង'}
                                    disabled={!item.audioSrc}
                                >
                                    {isPlaying === item.id ? <HugeiconsIcon icon={PauseIcon} strokeWidth={1.5} className="w-5 h-5 fill-current" /> : <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} className="w-5 h-5 ml-0.5 fill-current" />}
                                </button>
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
                            <span className="font-medium">{item.transliteration}</span>
                            <span className="flex items-center gap-1 group-hover:text-green-600 transition-colors">
                                មើលលម្អិត <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="w-3 h-3"/>
                            </span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-span-full py-12 text-center text-gray-400">
                    <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-khmer">មិនមានព្រះនាមដែលត្រូវនឹងការស្វែងរករបស់អ្នកទេ។</p>
                    <button onClick={() => setSearchTerm('')} className="mt-2 text-green-600 hover:underline font-khmer text-sm">បង្ហាញទាំងអស់វិញ</button>
                </div>
            )}
        </div>
      </div>

      {/* Modal Details (Unchanged) */}
      {selectedId && selectedName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeModal}>
            <div 
                className="bg-white w-full max-w-lg max-h-[90vh] rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-visible"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative bg-white pt-10 pb-6 px-6 text-center border-b border-gray-100 shrink-0 rounded-t-3xl">
                    <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-6 h-6" />
                    </button>
                    
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold font-khmer-title border-4 border-white shadow-lg z-10">
                        {selectedName.id}
                    </div>

                    <img referrerPolicy="no-referrer" src={selectedName.imageSrc} alt={selectedName.transliteration} className="w-32 h-32 mx-auto mb-4 object-contain" />
                    <h2 className="text-3xl font-bold text-gray-900 font-khmer-title mb-1">{selectedName.khmerName}</h2>
                    <p className="text-gray-500">{selectedName.transliteration}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {loadingDetails ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-3 text-gray-400">
                            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                            <p className="font-khmer text-sm">កំពុងទាញយកទិន្នន័យ...</p>
                        </div>
                    ) : details ? (
                        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: details }}></div>
                    ) : null}
                </div>

                <div className="p-4 bg-white border-t border-gray-100 flex gap-3 shrink-0 rounded-b-3xl">
                    <button 
                        onClick={(e) => handlePlayAudio(e, selectedName)}
                        className={`flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-200 ${!selectedName.audioSrc ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!selectedName.audioSrc}
                    >
                        {isPlaying === selectedName.id ? <HugeiconsIcon icon={PauseIcon} strokeWidth={1.5} className="w-5 h-5" /> : <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} className="w-5 h-5" />}
                        <span className="font-khmer">{!selectedName.audioSrc ? 'មិនមានសំឡេង' : isPlaying === selectedName.id ? 'ផ្អាកសំឡេង' : 'ចាក់សំឡេង'}</span>
                    </button>
                    <button 
                        onClick={handleShare}
                        className="w-12 h-12 flex items-center justify-center border-2 border-gray-200 rounded-xl text-gray-500 hover:border-green-600 hover:text-green-600 transition-colors"
                    >
                        <HugeiconsIcon icon={Share01Icon} strokeWidth={1.5} className="w-5 h-5" />
                    </button>
                     <button 
                        className="w-12 h-12 flex items-center justify-center border-2 border-gray-200 rounded-xl text-gray-500 hover:border-blue-600 hover:text-blue-600 transition-colors"
                        title="Upload Image"
                    >
                        <HugeiconsIcon icon={Upload01Icon} strokeWidth={1.5} className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
