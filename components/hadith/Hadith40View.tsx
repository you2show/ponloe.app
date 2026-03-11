import { Comment01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlayIcon, PauseIcon, Share01Icon, Copy01Icon, Tick01Icon, Loading02Icon, Cancel01Icon, Search01Icon, GridViewIcon, ListViewIcon, BookOpen01Icon, QuoteDownIcon, ArrowDown01Icon, ArrowUp01Icon, SentIcon, ThumbsUpIcon, MoreVerticalIcon } from '@hugeicons/core-free-icons';
import { useToast } from '@/contexts/ToastContext';

import React, { useEffect, useState, useRef } from 'react';


import { useQuery } from '@tanstack/react-query';

declare global {
  interface Window {
    Papa: any;
  }
}

interface Hadith {
  hadithNumber: string;
  title: string;
  arabicText: string;
  khmerTranslation: string;
  audioSrc: string;
}

const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRxgc2REbmqO8JPwec36DwQE3pa8Lg30c-5wV8Ue-pVnlFOr87lNscV3f45Y_atfVbHIpNZT2OLp1Wy/pub?output=csv';

// --- Mock Comment Component ---
const CommentSectionDemo: React.FC<{ hadithId: string }> = ({ hadithId }) => {
  const [comments, setComments] = useState([
    { id: 1, user: 'មូស្លីម កម្ពុជា', text: 'អាល់ហាំឌុលីឡះ ហាទីសនេះមានអត្ថន័យល្អណាស់។', time: '2 ម៉ោងមុន', likes: 12 },
    { id: 2, user: 'អ្នកសិក្សា', text: 'សូមអល់ឡោះប្រទានរង្វាន់ដល់អ្នកបង្កើត។', time: '5 ម៉ោងមុន', likes: 8 },
  ]);
  const [newComment, setNewComment] = useState('');

  const handlePost = () => {
    if (!newComment.trim()) return;
    setComments([
      ...comments, 
      { 
        id: Date.now(), 
        user: 'អ្នក (You)', 
        text: newComment, 
        time: 'ថ្មីៗ', 
        likes: 0 
      }
    ]);
    setNewComment('');
  };

  return (
    <div className="bg-gray-50 p-4 rounded-xl space-y-6">
       <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
             Y
          </div>
          <div className="flex-1 relative">
             <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="សរសេរមតិយោបល់របស់អ្នក..." 
                className="w-full p-3 pr-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none h-20 bg-white"
             />
             <button 
                onClick={handlePost}
                disabled={!newComment.trim()}
                className="absolute bottom-2 right-2 p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
             >
                <HugeiconsIcon icon={SentIcon} strokeWidth={1.5} className="w-3 h-3" />
             </button>
          </div>
       </div>

       <div className="space-y-4">
          {comments.map((comment) => (
             <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs shrink-0">
                   {comment.user.charAt(0)}
                </div>
                <div className="flex-1 space-y-1">
                   <div className="bg-white p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl border border-gray-100 shadow-sm inline-block min-w-[200px]">
                      <div className="flex justify-between items-start mb-1">
                         <span className="text-sm font-bold text-gray-900">{comment.user}</span>
                         <span className="text-[10px] text-gray-400">{comment.time}</span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                   </div>
                   <div className="flex items-center gap-4 pl-2">
                      <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-600 font-medium">
                         <HugeiconsIcon icon={ThumbsUpIcon} strokeWidth={1.5} className="w-3 h-3" /> {comment.likes}
                      </button>
                      <button className="text-xs text-gray-500 hover:text-gray-900 font-medium">
                         ឆ្លើយតប
                      </button>
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

export const Hadith40View: React.FC = () => {
  const { showToast } = useToast();
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Interaction State
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Track expanded cards for List View
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Fetch Data with React Query
  const { data: hadiths = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['hadith40'],
    queryFn: async () => {
      return new Promise<Hadith[]>((resolve, reject) => {
        if (!window.Papa) {
          reject(new Error('PapaParse library not found'));
          return;
        }
        window.Papa.parse(GOOGLE_SHEET_URL, {
          download: true,
          header: true,
          skipEmptyLines: true,
          complete: (results: any) => {
            if (results.data && results.data.length > 0) {
              resolve(results.data);
            } else {
              reject(new Error('No data found'));
            }
          },
          error: (err: any) => {
            reject(err);
          }
        });
      });
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const error = queryError ? (queryError as Error).message : null;

  // Filter Data
  const filteredHadiths = hadiths.filter(h => 
    h.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.hadithNumber?.toString().includes(searchQuery) ||
    h.khmerTranslation?.includes(searchQuery)
  );

  // 2. Audio Control
  const toggleAudio = (id: string, src: string) => {
    if (!src) return;

    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(src);
      audioRef.current = audio;
      
      audio.onended = () => setPlayingId(null);
      audio.onpause = () => {
        if (playingId === id) setPlayingId(null); 
      };
      
      setPlayingId(id);
      audio.play().catch(e => {
        console.error("Audio play error", e);
        if (e.name === 'NotSupportedError') {
          showToast('កម្មវិធីរុករករបស់អ្នកមិនគាំទ្រទម្រង់សំឡេងនេះទេ (ឧទាហរណ៍៖ Safari មិនគាំទ្រឯកសារ .ogg)។ សូមសាកល្បងប្រើ Chrome ឬ Firefox។', 'error');
        }
        setPlayingId(null);
      });
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  // 3. Copy Handler
  const handleCopy = (hadith: Hadith) => {
    const text = `Hadith ទី ${hadith.hadithNumber}៖ ${hadith.title}\n\n${hadith.arabicText}\n\n${hadith.khmerTranslation}\n\nដកស្រង់ពី ponloe.org`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(hadith.hadithNumber);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // 4. Share Handler
  const handleShare = async (hadith: Hadith) => {
    const shareData = {
      title: `Hadith ទី ${hadith.hadithNumber}៖ ${hadith.title}`,
      text: `${hadith.khmerTranslation}\n\n(ដកស្រង់ពី ponloe.org)`,
      url: window.location.href
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.error(err); }
    } else {
      handleCopy(hadith);
      showToast('បានចម្លងទៅ Clipboard!', 'success');
    }
  };

  // 5. Toggle Comments (Custom Demo)
  const toggleComments = (hadithId: string) => {
    if (activeCommentId === hadithId) {
       setActiveCommentId(null);
    } else {
       setActiveCommentId(hadithId);
    }
  };

  // 6. Toggle Expand/Collapse for List View
  const toggleExpand = (hadithNumber: string) => {
    const newSet = new Set(expandedCards);
    if (newSet.has(hadithNumber)) {
      newSet.delete(hadithNumber);
    } else {
      newSet.add(hadithNumber);
    }
    setExpandedCards(newSet);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 animate-in fade-in duration-300">
      
      {/* Modern Header Section */}
      <div className="bg-emerald-900 text-white relative overflow-hidden rounded-b-[2rem] shadow-xl">
         {/* Pattern Overlay */}
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
         <div className="absolute inset-0 bg-gradient-to-t from-emerald-900 via-transparent to-transparent"></div>
         
         <div className="relative max-w-5xl mx-auto px-6 py-12 md:py-16 text-center">
            <span className="inline-block px-3 py-1 bg-emerald-800 rounded-full text-xs font-medium text-emerald-200 mb-3 border border-emerald-700">
               Arba'een An-Nawawi
            </span>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight drop-shadow-sm">
               ហាទីស ៤០ របស់អ៊ីម៉ាំណាវ៉ាវី
            </h1>
            <p className="text-emerald-100 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed opacity-90">
               បណ្តុំនៃហាទីសដ៏ពិសិដ្ឋដែលជាមូលដ្ឋានគ្រឹះនៃសាសនាឥស្លាម ដកស្រង់ចេញពីការបង្រៀនរបស់ព្យាការីមូហាំម៉ាត់ (ស.អ)
            </p>
         </div>
      </div>

      {/* Control Bar */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
         <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
               <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
               <input 
                  type="text" 
                  placeholder="ស្វែងរកតាមលេខ ឬចំណងជើង..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all text-gray-900"
               />
            </div>

            {/* View Toggles & Stats */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
               <span className="text-sm font-medium text-gray-500 hidden sm:block">
                  បង្ហាញ {filteredHadiths.length} ហាទីស
               </span>
               <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button 
                     onClick={() => setViewMode('grid')}
                     className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                     <HugeiconsIcon icon={GridViewIcon} strokeWidth={1.5} className="w-5 h-5" />
                  </button>
                  <button 
                     onClick={() => setViewMode('list')}
                     className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                     <HugeiconsIcon icon={ListViewIcon} strokeWidth={1.5} className="w-5 h-5" />
                  </button>
               </div>
            </div>
         </div>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <HugeiconsIcon icon={Loading02Icon} strokeWidth={1.5} className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">កំពុងទាញយកទិន្នន័យ...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
             <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-8 h-8 text-red-500" />
             </div>
             <p className="text-gray-900 font-medium">{error}</p>
          </div>
        ) : filteredHadiths.length === 0 ? (
          <div className="text-center py-20">
             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="w-8 h-8 text-gray-400" />
             </div>
             <p className="text-gray-500">រកមិនឃើញហាទីសដែលអ្នកស្វែងរកទេ។</p>
          </div>
        ) : (
          /* Masonry Layout Implementation using CSS Columns */
          <div className={viewMode === 'grid' ? "columns-1 md:columns-2 gap-6 space-y-6" : "space-y-6"}>
            {filteredHadiths.map((hadith) => {
              const isExpanded = expandedCards.has(hadith.hadithNumber);
              const isListMode = viewMode === 'list';

              return (
              <div 
                key={hadith.hadithNumber} 
                /* break-inside-avoid prevents cards from being split across columns */
                className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col group break-inside-avoid mb-6 ${activeCommentId === hadith.hadithNumber ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
              >
                 {/* Card Header */}
                 <div className="px-6 py-5 border-b border-gray-50 flex items-start gap-4 bg-white relative">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                       {hadith.hadithNumber}
                    </div>
                    <div className="flex-1 pt-1">
                       <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-emerald-700 transition-colors">
                          {hadith.title || "គ្មានចំណងជើង"}
                       </h3>
                       <span className="text-xs text-gray-400 font-medium mt-1 inline-block">
                          Hadith No. {hadith.hadithNumber}
                       </span>
                    </div>
                 </div>

                 {/* Content Body */}
                 <div className="p-6 flex-1 bg-white">
                    {/* Arabic Text */}
                    {hadith.arabicText && (
                      <div className={`mb-6 text-right transition-all duration-500 ${isListMode && !isExpanded ? 'line-clamp-3' : ''}`}>
                        <p className="font-arabic text-lg md:text-xl leading-[2.2] text-gray-800" dir="rtl">
                          {hadith.arabicText}
                        </p>
                      </div>
                    )}

                    {/* Translation */}
                    <div className="relative bg-slate-50 p-5 rounded-2xl border border-slate-100">
                       <HugeiconsIcon icon={QuoteDownIcon} strokeWidth={1.5} className="w-8 h-8 text-emerald-100 absolute -top-3 -left-2 fill-current" />
                       <p className={`text-gray-700 leading-relaxed relative z-10 text-sm md:text-base transition-all duration-500 ${isListMode && !isExpanded ? 'line-clamp-4' : ''}`}>
                         {hadith.khmerTranslation || "មិនមានការបកប្រែ"}
                       </p>
                    </div>

                    {/* Expand/Collapse Button for List View */}
                    {isListMode && (
                        <div className="mt-4 flex justify-center">
                            <button 
                                onClick={() => toggleExpand(hadith.hadithNumber)}
                                className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors py-2 px-4 hover:bg-emerald-50 rounded-full"
                            >
                                {isExpanded ? (
                                    <>បង្ហាញតិច <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={1.5} className="w-4 h-4" /></>
                                ) : (
                                    <>អានបន្ត <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={1.5} className="w-4 h-4" /></>
                                )}
                            </button>
                        </div>
                    )}
                 </div>

                 {/* Action Footer */}
                 <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex flex-wrap gap-2 justify-between items-center">
                    <div className="flex gap-2">
                        {hadith.audioSrc && (
                          <button 
                            onClick={() => toggleAudio(hadith.hadithNumber, hadith.audioSrc)}
                            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all shadow-sm ${playingId === hadith.hadithNumber ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-white text-emerald-600 hover:bg-emerald-600 hover:text-white border border-gray-200'}`}
                            title={playingId === hadith.hadithNumber ? "Stop" : "Play"}
                          >
                             {playingId === hadith.hadithNumber ? <HugeiconsIcon icon={PauseIcon} strokeWidth={1.5} className="w-5 h-5 fill-current" /> : <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} className="w-5 h-5 fill-current ml-0.5" />}
                          </button>
                        )}
                        
                        <button 
                          onClick={() => handleCopy(hadith)}
                          className={`flex items-center justify-center w-10 h-10 rounded-full transition-all shadow-sm ${copiedId === hadith.hadithNumber ? 'bg-green-100 text-green-700' : 'bg-white text-gray-600 hover:bg-gray-800 hover:text-white border border-gray-200'}`}
                          title="Copy"
                        >
                           {copiedId === hadith.hadithNumber ? <HugeiconsIcon icon={Tick01Icon} strokeWidth={1.5} className="w-5 h-5" /> : <HugeiconsIcon icon={Copy01Icon} strokeWidth={1.5} className="w-5 h-5" />}
                        </button>

                        <button 
                          onClick={() => handleShare(hadith)}
                          className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-gray-600 hover:bg-blue-600 hover:text-white border border-gray-200 transition-all shadow-sm"
                          title="Share"
                        >
                           <HugeiconsIcon icon={Share01Icon} strokeWidth={1.5} className="w-5 h-5" />
                        </button>
                    </div>

                    <button 
                       onClick={() => toggleComments(hadith.hadithNumber)}
                       className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCommentId === hadith.hadithNumber ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                    >
                       <HugeiconsIcon icon={Comment01Icon} strokeWidth={1.5} className="w-4 h-4" />
                       <span className="hidden sm:inline">{activeCommentId === hadith.hadithNumber ? 'បិទមតិ' : 'បញ្ចេញមតិ'}</span>
                    </button>
                 </div>

                 {/* Custom Comment Section */}
                 {activeCommentId === hadith.hadithNumber && (
                    <div className="border-t border-gray-100 p-4 bg-white animate-in slide-in-from-top-2 duration-200">
                        <CommentSectionDemo hadithId={hadith.hadithNumber} />
                    </div>
                 )}
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
};
