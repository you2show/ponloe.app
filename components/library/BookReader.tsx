import { Comment01Icon, HashtagIcon, Minimize01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, Share01Icon, ThumbsUpIcon, PlayIcon, PauseIcon, TextIcon, File01Icon, CheckmarkCircle02Icon, SentIcon, HeadphonesIcon, Clock01Icon, ViewIcon, Download01Icon, Bookmark01Icon, StarIcon, Calendar01Icon, Loading02Icon, ArrowRight01Icon, Maximize01Icon, CleanIcon } from '@hugeicons/core-free-icons';

import React, { useState, useRef, useMemo, useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Book, Comment, Uploader } from './data';
import { generateSpeech } from '@/services/geminiService';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { libraryService } from '@/src/services/libraryService';
import { mediaService } from '@/src/services/mediaService';

import { CommentSection } from '@/components/community/feed/post-card/CommentSection';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// Helper to decode base64 to Uint8Array
const decodeBase64 = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Helper to create a WAV header for raw PCM data
const createWavHeader = (pcmDataLen: number, sampleRate: number = 24000) => {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcmDataLen, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, pcmDataLen, true);
  
  return header;
};

interface BookReaderProps {
  book: Book;
  onBack: () => void;
  onViewProfile?: (uploader: Uploader) => void;
  className?: string;
}

export const BookReader: React.FC<BookReaderProps> = ({ book, onBack, onViewProfile, className }) => {
  const { showToast } = useToast();
  const { profile, user } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'content' | 'comments'>('content');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [fontSize, setFontSize] = useState(20); // Default larger for reading
  const [isSaved, setIsSaved] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [localBlobUrl, setLocalBlobUrl] = useState<string | null>(null);
  const [offlineContent, setOfflineContent] = useState<string | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [numPages, setNumPages] = useState<number>();
  const [pdfScale, setPdfScale] = useState(1.0);
  
  // Load saved/downloaded state from localStorage or Supabase
  useEffect(() => {
      const loadState = async () => {
          // Check local IndexedDB first
          const isLocal = await libraryService.isBookDownloaded(book.id);
          if (isLocal) {
              setIsDownloaded(true);
              const dbBook = await libraryService.getBook(book.id);
              if (dbBook && dbBook.file_blob) {
                  if (book.type === 'PDF') {
                      const url = URL.createObjectURL(dbBook.file_blob);
                      setLocalBlobUrl(url);
                  } else {
                      const text = await dbBook.file_blob.text();
                      setOfflineContent(text);
                  }
              }
          }

          if (user) {
              try {
                  // Check saved status
                  const { data: savedData } = await supabase
                      .from('saved_posts')
                      .select('id')
                      .eq('post_id', book.id)
                      .eq('user_id', user.id)
                      .maybeSingle();
                  
                  if (savedData) setIsSaved(true);

                  // Check downloaded status from cloud (syncing IDs)
                  if (!isLocal) {
                      const { data: downloadedData } = await supabase
                          .from('user_settings')
                          .select('value')
                          .eq('user_id', user.id)
                          .eq('key', 'downloaded_books')
                          .maybeSingle();
                      
                      if (downloadedData && downloadedData.value && Array.isArray(downloadedData.value.ids)) {
                          if (downloadedData.value.ids.includes(book.id)) {
                              setIsDownloaded(true);
                          }
                      }
                  }
              } catch (error) {
                  console.error("Error loading book state:", error);
              }
          } else {
              const saved = JSON.parse(localStorage.getItem('library_saved') || '[]');
              if (saved.includes(book.id)) setIsSaved(true);
          }
      };
      
      loadState();

      return () => {
          if (localBlobUrl) URL.revokeObjectURL(localBlobUrl);
      };
  }, [book.id, user]);

  const handleDownload = async () => {
      if (isDownloaded) {
          if(confirm("តើអ្នកចង់លុបសៀវភៅនេះចេញពីការទាញយកឬ?")) {
              setIsDownloaded(false);
              await libraryService.deleteBook(book.id);
              if (localBlobUrl) {
                  URL.revokeObjectURL(localBlobUrl);
                  setLocalBlobUrl(null);
              }

              if (user) {
                  try {
                      const { data: existing } = await supabase
                          .from('user_settings')
                          .select('id, value')
                          .eq('user_id', user.id)
                          .eq('key', 'downloaded_books')
                          .maybeSingle();
                      
                      if (existing && existing.value && Array.isArray(existing.value.ids)) {
                          const newIds = existing.value.ids.filter((id: string) => id !== book.id);
                          await supabase.from('user_settings').update({
                              value: { ids: newIds },
                              updated_at: new Date().toISOString()
                          }).eq('id', existing.id);
                      }
                  } catch (error) {
                      console.error("Error removing download:", error);
                  }
              }
          }
          return;
      }

      setIsDownloading(true);
      setDownloadProgress(0);
      
      try {
          const downloadUrl = book.pdfUrl || '';
          
          if (book.type === 'PDF') {
              if (!downloadUrl) throw new Error('No download URL');
              await libraryService.downloadAndSaveBook(
                  book.id,
                  book.title,
                  book.author,
                  book.coverUrl,
                  downloadUrl,
                  (progress) => setDownloadProgress(progress)
              );
              
              const dbBook = await libraryService.getBook(book.id);
              if (dbBook && dbBook.file_blob) {
                  const url = URL.createObjectURL(dbBook.file_blob);
                  setLocalBlobUrl(url);
              }
          } else {
              // TEXT book
              const blob = new Blob([book.content || ''], { type: 'text/html' });
              await libraryService.saveBook({
                  id: book.id,
                  title: book.title,
                  author: book.author,
                  cover_url: book.coverUrl,
                  file_blob: blob,
                  file_type: 'text/html',
                  downloaded_at: Date.now(),
                  size: blob.size
              });
          }

          setIsDownloading(false);
          setIsDownloaded(true);
          
          // Persist download ID in cloud
          if (user) {
              try {
                  const { data: existing } = await supabase
                      .from('user_settings')
                      .select('id, value')
                      .eq('user_id', user.id)
                      .eq('key', 'downloaded_books')
                      .maybeSingle();

                  if (existing) {
                      const currentIds = Array.isArray(existing.value?.ids) ? existing.value.ids : [];
                      if (!currentIds.includes(book.id)) {
                          await supabase.from('user_settings').update({
                              value: { ids: [...currentIds, book.id] },
                              updated_at: new Date().toISOString()
                          }).eq('id', existing.id);
                      }
                  } else {
                      await supabase.from('user_settings').insert({
                          user_id: user.id,
                          key: 'downloaded_books',
                          value: { ids: [book.id] }
                      });
                  }
                  showToast('បានទាញយក និងរក្សាទុកក្នុងគណនីរបស់អ្នក', 'success');
              } catch (error) {
                  console.error("Error saving downloaded book:", error);
              }
          } else {
              showToast('បានទាញយកទុកក្នុង Browser របស់អ្នក។ សូមចូលគណនីដើម្បីរក្សាទុកជាអចិន្ត្រៃយ៍។', 'info');
          }
      } catch (error) {
          console.error("Download failed:", error);
          showToast('ការទាញយកបានបរាជ័យ', 'error');
          setIsDownloading(false);
      }
  };

  const handleToggleSave = async () => {
      const newState = !isSaved;
      setIsSaved(newState);
      
      if (user) {
          try {
              if (newState) {
                  await supabase.from('saved_posts').insert({ post_id: book.id, user_id: user.id });
                  showToast("បានរក្សាទុកក្នុងគណនីរបស់អ្នក", "success");
              } else {
                  await supabase.from('saved_posts').delete().eq('post_id', book.id).eq('user_id', user.id);
              }
          } catch (error) {
              console.error("Error saving book:", error);
              showToast("មានបញ្ហាក្នុងការរក្សាទុក", "error");
              setIsSaved(!newState); // Revert on error
          }
      } else {
          // Persist save locally
          const saved = JSON.parse(localStorage.getItem('library_saved') || '[]');
          if (newState) {
              if (!saved.includes(book.id)) {
                  saved.push(book.id);
              }
              showToast("បានរក្សាទុកក្នុង Browser របស់អ្នក។ សូមចូលគណនីដើម្បីរក្សាទុកជាអចិន្ត្រៃយ៍។", "info");
          } else {
              const index = saved.indexOf(book.id);
              if (index > -1) {
                  saved.splice(index, 1);
              }
          }
          localStorage.setItem('library_saved', JSON.stringify(saved));
      }
  };
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isHeaderStuck, setIsHeaderStuck] = useState(false);
  const controlsRef = useRef<HTMLDivElement>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Mock Pagination Logic ---
  const pages = useMemo(() => {
      const contentToUse = offlineContent || book.content;
      if (book.type !== 'TEXT' || !contentToUse) return [];
      // Split content by <h3> to simulate chapters/pages
      const rawParts = contentToUse.split(/(?=<h3>)/); 
      if (rawParts.length <= 1) return [contentToUse];
      return rawParts;
  }, [book.content, book.type, offlineContent]);

  const totalPages = book.type === 'PDF' ? (numPages || 1) : pages.length;
  const currentContent = pages[currentPage - 1] || "";

  // Reset page when book changes
  useEffect(() => {
      setCurrentPage(1);
  }, [book.id]);

  // Scroll to top when page changes
  useEffect(() => {
      if (contentRef.current) {
          contentRef.current.scrollTop = 0;
      }
  }, [currentPage]);

  // Stop audio when changing pages or closing
  useEffect(() => {
      return () => {
          if (audioRef.current) {
              audioRef.current.pause();
              if (audioRef.current.src.startsWith('blob:')) {
                  URL.revokeObjectURL(audioRef.current.src);
              }
          }
      };
  }, []);

  const goToNextPage = () => {
      if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }
      if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };

  const goToPrevPage = () => {
      if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }
      if (currentPage > 1) setCurrentPage(p => p - 1);
  };

  // --- AI Audio Logic ---
  const handlePlayAudio = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    // If audio is paused but exists for this page, resume it
    if (audioRef.current && audioRef.current.src && !isLoadingAudio) {
        audioRef.current.play();
        setIsPlaying(true);
        return;
    }

    // Generate New Audio for Current Page
    if (book.type === 'TEXT' && book.content) {
      setIsLoadingAudio(true);
      try {
        // Check if we have cached audio for this specific page content
        const audioCacheKey = `audio_${book.id}_p${currentPage}`;
        const cachedMedia = await mediaService.getMedia(audioCacheKey);
        
        let audioSrc: string;
        
        if (cachedMedia) {
            audioSrc = URL.createObjectURL(cachedMedia.blob);
        } else {
            // Clean up previous blob URL if exists
            if (audioRef.current && audioRef.current.src.startsWith('blob:')) {
                URL.revokeObjectURL(audioRef.current.src);
            }

            // Strip HTML tags for TTS - Read current page only
            const textToRead = currentContent.replace(/<[^>]*>?/gm, '');
            // Limit characters to avoid API limits in demo
            const base64Audio = await generateSpeech(textToRead.substring(0, 1000), 'Kore'); 
            
            if (!base64Audio) {
                showToast('មិនអាចបង្កើតសំឡេងបានទេ។ សូមព្យាយាមម្តងទៀត។', 'error');
                setIsLoadingAudio(false);
                return;
            }

            const audioData = decodeBase64(base64Audio);
            const wavHeader = createWavHeader(audioData.length, 24000);
            const wavBlob = new Blob([wavHeader, audioData], { type: 'audio/wav' });
            
            // Cache the generated audio
            await mediaService.saveMedia(audioCacheKey, wavBlob);
            
            audioSrc = URL.createObjectURL(wavBlob);
        }
        
        try {
            const audio = new Audio();
            
            audio.onended = () => setIsPlaying(false);
            audio.onerror = (e) => {
                console.error("Audio playback error:", e, audio.error);
                showToast('មិនអាចលេងសំឡេងបានទេ (Audio format error)', 'error');
                setIsPlaying(false);
            };

            audio.src = audioSrc;
            audioRef.current = audio;
            
            await audio.play();
            setIsPlaying(true);
          } catch (playError) {
            console.error("Error setting up audio:", playError);
            showToast('មានបញ្ហាក្នុងការរៀបចំសំឡេង', 'error');
            setIsPlaying(false);
          }
      } catch (error) {
        console.error(error);
        showToast('មានបញ្ហាក្នុងការបង្កើតសំឡេង។', 'error');
      } finally {
        setIsLoadingAudio(false);
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current && controlsRef.current) {
        const scrollTop = contentRef.current.scrollTop;
        const controlsOffsetTop = controlsRef.current.offsetTop;
        setIsHeaderStuck(scrollTop >= controlsOffsetTop - 5);
      } else if (contentRef.current && activeTab !== 'content') {
        // If not in content tab, we might want to reset or handle differently
        // For now, if we scroll down in comments, maybe don't show stuck header
        setIsHeaderStuck(contentRef.current.scrollTop > 200);
      }
    };

    const scrollArea = contentRef.current;
    if (scrollArea) {
      scrollArea.addEventListener('scroll', handleScroll);
    }
    return () => scrollArea?.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  return (
    <div className={isFullScreen ? `fixed inset-0 lg:left-20 z-[9999] bg-white flex flex-col animate-in slide-in-from-bottom duration-300 overflow-hidden` : (className || `fixed inset-0 md:left-20 z-[1000] bg-white flex flex-col animate-in slide-in-from-bottom duration-300 overflow-hidden`)}>
      
      {/* Header */}
      <div className={`px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white/95 backdrop-blur shrink-0 z-20 transition-all ${isFullScreen || isHeaderStuck ? 'shadow-sm' : ''}`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1 p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors group">
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-6 h-6 text-gray-700 group-hover:text-emerald-600 transition-colors" />
          </button>
          
          <div className="flex items-center">
            <div 
              className={`flex items-center gap-3 ${onViewProfile ? 'cursor-pointer hover:opacity-70 transition-opacity' : ''}`}
              onClick={() => onViewProfile && onViewProfile(book.uploader)}
            >
               {!isFullScreen && (
                   <img referrerPolicy="no-referrer" src={book.uploader.avatar} alt={book.uploader.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
               )}
               <div>
                  {isFullScreen ? (
                      <h3 className="font-bold text-gray-900 leading-none line-clamp-1">{book.title}</h3>
                  ) : (
                      <>
                          <h3 className="font-bold text-sm text-gray-900 leading-none flex items-center gap-1">
                              {book.uploader.name}
                              {book.uploader.isVerified && <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="w-3 h-3 text-blue-500 fill-blue-50" />}
                          </h3>
                          <span className="text-[10px] text-gray-500">បង្ហោះ៖ {book.publishedDate}</span>
                      </>
                  )}
               </div>
            </div>

            {/* Stuck Header Info - PC Only */}
            {!isFullScreen && isHeaderStuck && activeTab === 'content' && (
                <div className="hidden lg:flex items-center animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="h-6 w-[1px] bg-gray-200 mx-4"></div>
                    <div className="flex flex-col">
                        <h3 className="font-bold text-gray-900 text-sm font-khmer flex items-center gap-2">
                            <HugeiconsIcon icon={File01Icon} strokeWidth={1.5} className="w-4 h-4 text-emerald-600" />
                            ខ្លឹមសារ / អត្ថបទ
                        </h3>
                        {totalPages > 1 && (
                            <span className="text-[10px] text-gray-500 font-bold">ទំព័រទី {currentPage} / {totalPages}</span>
                        )}
                    </div>
                </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
           {/* Stuck Font Controls - PC Only */}
           {!isFullScreen && isHeaderStuck && activeTab === 'content' && book.type === 'TEXT' && (
               <div className="hidden lg:flex items-center gap-3 mr-2 animate-in fade-in slide-in-from-right-2 duration-300">
                   <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                        <button onClick={() => setFontSize(Math.max(16, fontSize-2))} className="p-1 hover:bg-white rounded shadow-sm transition-all"><HugeiconsIcon icon={TextIcon} strokeWidth={1.5} className="w-3 h-3"/></button>
                        <span className="text-[10px] w-5 text-center font-medium">{fontSize}</span>
                        <button onClick={() => setFontSize(Math.min(36, fontSize+2))} className="p-1 hover:bg-white rounded shadow-sm transition-all"><HugeiconsIcon icon={TextIcon} strokeWidth={1.5} className="w-4 h-4"/></button>
                    </div>
                    <div className="h-6 w-[1px] bg-gray-200 ml-1"></div>
               </div>
           )}

           {/* Full Screen Toggle */}
           <button 
             onClick={() => setIsFullScreen(!isFullScreen)}
             className={`p-2 rounded-full transition-colors ${isFullScreen ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-gray-100 text-gray-600'}`}
             title={isFullScreen ? "ចេញពីពេញអេក្រង់" : "ពេញអេក្រង់"}
           >
              {isFullScreen ? <HugeiconsIcon icon={Minimize01Icon} strokeWidth={1.5} className="w-5 h-5" /> : <HugeiconsIcon icon={Maximize01Icon} strokeWidth={1.5} className="w-5 h-5" />}
           </button>
           
           {!isFullScreen && (
               <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                  <HugeiconsIcon icon={Share01Icon} strokeWidth={1.5} className="w-5 h-5" />
               </button>
           )}
        </div>
      </div>

      {/* Main Content Scroll Area */}
      <div ref={contentRef} className="flex-1 overflow-y-auto bg-gray-50 relative scroll-smooth">
         
         {/* Cover Banner & Details (Hidden in Full Screen) */}
         {!isFullScreen && (
             <div className="bg-white pb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                 <div className="h-56 md:h-64 w-full relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent z-10"></div>
                    <img referrerPolicy="no-referrer" src={book.coverUrl} className="w-full h-full object-cover" alt="cover" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 z-20 text-white flex gap-4 md:gap-6 items-end">
                       {/* Big Cover - VISIBLE ON ALL SCREENS NOW */}
                       <img referrerPolicy="no-referrer" src={book.coverUrl} className="w-24 h-36 md:w-32 md:h-48 object-cover rounded-lg shadow-2xl border-2 border-white/20 shrink-0" alt="cover small" />
                       
                       <div className="flex-1 min-w-0 pb-2">
                          <div className="flex items-center gap-2 mb-3">
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${book.type === 'PDF' ? 'bg-red-500' : 'bg-blue-500'} text-white`}>
                                  {book.type}
                              </span>
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                                  {book.category}
                              </span>
                          </div>
                          <h1 className="text-2xl md:text-3xl font-bold font-khmer leading-tight mb-2 line-clamp-2 drop-shadow-md">{book.title}</h1>
                          <p className="text-white/90 text-sm md:text-base mb-3 truncate drop-shadow-sm">ដោយ៖ {book.author}</p>
                          
                          {/* Rating Stars */}
                          <div 
                              className="flex items-center gap-1.5 text-amber-400 text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity bg-black/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10"
                              onClick={() => {
                                  setActiveTab('comments');
                                  setTimeout(() => {
                                      contentRef.current?.scrollTo({ top: contentRef.current.scrollHeight, behavior: 'smooth' });
                                  }, 100);
                              }}
                          >
                              <span className="text-white text-xs mr-1">{book.rating}</span>
                              {[1, 2, 3, 4, 5].map(star => (
                                  <HugeiconsIcon icon={StarIcon} strokeWidth={1.5} key={star} className={`w-3.5 h-3.5 ${star <= Math.round(book.rating) ? 'fill-current' : 'text-gray-400'}`} />
                              ))}
                              <span className="text-white/60 text-[10px] ml-1 font-normal hover:underline">({book.ratingCount} មតិ)</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Metadata Grid */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 md:px-6 pt-6 mb-6">
                     <div className="flex flex-col gap-1 p-3 bg-white rounded-xl shadow-sm border border-gray-100 items-center text-center">
                         <span className="text-xs text-gray-500 flex items-center gap-1"><HugeiconsIcon icon={File01Icon} strokeWidth={1.5} className="w-3.5 h-3.5"/> ទំហំ</span>
                         <span className="font-bold text-gray-900 text-sm">{book.fileSize}</span>
                     </div>
                     <div className="flex flex-col gap-1 p-3 bg-white rounded-xl shadow-sm border border-gray-100 items-center text-center">
                         <span className="text-xs text-gray-500 flex items-center gap-1"><HugeiconsIcon icon={HashtagIcon} strokeWidth={1.5} className="w-3.5 h-3.5"/> ចំនួនទំព័រ</span>
                         <span className="font-bold text-gray-900 text-sm">{book.pages} </span>
                     </div>
                     <div className="flex flex-col gap-1 p-3 bg-white rounded-xl shadow-sm border border-gray-100 items-center text-center">
                         <span className="text-xs text-gray-500 flex items-center gap-1"><HugeiconsIcon icon={Calendar01Icon} strokeWidth={1.5} className="w-3.5 h-3.5"/> ចេញផ្សាយ</span>
                         <span className="font-bold text-gray-900 text-sm">{book.publishedDate}</span>
                     </div>
                     <div className="flex flex-col gap-1 p-3 bg-white rounded-xl shadow-sm border border-gray-100 items-center text-center">
                         <span className="text-xs text-gray-500 flex items-center gap-1"><HugeiconsIcon icon={ViewIcon} strokeWidth={1.5} className="w-3.5 h-3.5"/> ចូលមើល</span>
                         <span className="font-bold text-gray-900 text-sm">{book.views} ដង</span>
                     </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="flex gap-3 px-4 md:px-6">
                     <button 
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className={`flex-1 ${isDownloaded ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-200'} py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 relative overflow-hidden`}
                     >
                        {isDownloading && (
                            <div 
                               className="absolute inset-0 bg-emerald-700/20 transition-all duration-300"
                               style={{ width: `${downloadProgress}%` }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                           {isDownloading ? <HugeiconsIcon icon={Loading02Icon} strokeWidth={1.5} className="w-5 h-5 animate-spin"/> : isDownloaded ? <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="w-5 h-5"/> : <HugeiconsIcon icon={Download01Icon} strokeWidth={1.5} className="w-5 h-5"/>}
                           {isDownloading ? `កំពុងទាញយក ${downloadProgress}%` : isDownloaded ? 'បានទាញយក' : 'ទាញយក'}
                        </span>
                     </button>
                      <button 
                         onClick={handleToggleSave}
                         className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm border transition-all active:scale-95 ${isSaved ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'}`}
                      >
                         <HugeiconsIcon icon={Bookmark01Icon} strokeWidth={1.5} className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                         {isSaved ? 'បានរក្សាទុក' : 'រក្សាទុក'}
                      </button>
                  </div>
              </div>
          )}

          {/* Content Container - Adapts to Full Screen */}
          <div className={`mx-auto ${isFullScreen ? 'max-w-4xl min-h-screen bg-white' : 'max-w-3xl pb-32'} transition-all duration-300`}>
             
             {/* TAB CONTENT */}
            {activeTab === 'content' && (
                <div className={`${isFullScreen ? 'p-6 md:p-12' : 'p-6 md:p-8 bg-white mt-2 rounded-t-3xl shadow-sm border-t border-gray-100 min-h-[500px]'}`}>
                    
                    {/* Reader Controls */}
                    <div ref={controlsRef} className="flex justify-between items-center mb-8 sticky top-0 bg-white/95 backdrop-blur py-4 z-10 border-b border-gray-100">
                       <h3 className={`font-bold text-gray-900 text-lg font-khmer flex items-center gap-2 transition-opacity duration-200 ${isHeaderStuck ? 'lg:opacity-0' : 'opacity-100'}`}>
                           <HugeiconsIcon icon={File01Icon} strokeWidth={1.5} className="w-5 h-5 text-emerald-600" />
                           {isFullScreen ? `ទំព័រទី ${currentPage}` : 'ខ្លឹមសារ / អត្ថបទ'}
                       </h3>
                       {book.type === 'TEXT' && (
                        <div className={`flex items-center gap-3 transition-opacity duration-200 ${isHeaderStuck ? 'lg:opacity-0' : 'opacity-100'}`}>
                            {/* Font Size */}
                            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                <button onClick={() => setFontSize(Math.max(16, fontSize-2))} className="p-1.5 hover:bg-white rounded shadow-sm transition-all"><HugeiconsIcon icon={TextIcon} strokeWidth={1.5} className="w-3 h-3"/></button>
                                <span className="text-xs w-6 text-center font-medium">{fontSize}</span>
                                <button onClick={() => setFontSize(Math.min(36, fontSize+2))} className="p-1.5 hover:bg-white rounded shadow-sm transition-all"><HugeiconsIcon icon={TextIcon} strokeWidth={1.5} className="w-4 h-4"/></button>
                            </div>
                        </div>
                       )}
                       {book.type === 'PDF' && (
                        <div className={`flex items-center gap-3 transition-opacity duration-200 ${isHeaderStuck ? 'lg:opacity-0' : 'opacity-100'}`}>
                            {/* Zoom Controls */}
                            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                <button onClick={() => setPdfScale(Math.max(0.5, pdfScale - 0.2))} className="p-1.5 hover:bg-white rounded shadow-sm transition-all font-bold text-gray-600">-</button>
                                <span className="text-xs w-10 text-center font-medium">{Math.round(pdfScale * 100)}%</span>
                                <button onClick={() => setPdfScale(Math.min(3.0, pdfScale + 0.2))} className="p-1.5 hover:bg-white rounded shadow-sm transition-all font-bold text-gray-600">+</button>
                            </div>
                        </div>
                       )}
                    </div>

                    {book.type === 'TEXT' ? (
                        <>
                            <div 
                                className="font-khmer text-gray-800 leading-loose space-y-6 animate-in fade-in duration-500 text-justify" 
                                style={{ fontSize: `${fontSize}px`, lineHeight: '2' }}
                                dangerouslySetInnerHTML={{ __html: currentContent || '' }}
                            />
                            
                            {/* AI Audio Button - Integrated at bottom of content */}
                            <div className="mt-12 flex flex-col items-center gap-6 pb-24">
                                <button 
                                    onClick={handlePlayAudio}
                                    disabled={isLoadingAudio}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm shadow-lg transition-all active:scale-95 w-full sm:w-auto justify-center ${
                                        isLoadingAudio 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                            : isPlaying 
                                                ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
                                                : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-emerald-200'
                                    }`}
                                >
                                    {isLoadingAudio ? (
                                        <HugeiconsIcon icon={Loading02Icon} strokeWidth={1.5} className="w-4 h-4 animate-spin" />
                                    ) : isPlaying ? (
                                        <HugeiconsIcon icon={PauseIcon} strokeWidth={1.5} className="w-4 h-4 fill-current" />
                                    ) : (
                                        <HugeiconsIcon icon={CleanIcon} strokeWidth={1.5} className="w-4 h-4 fill-current" />
                                    )}
                                    <span className="font-khmer">
                                        {isLoadingAudio ? 'កំពុងបង្កើត...' : isPlaying ? 'ផ្អាកការអាន' : 'AI អានឲ្យស្តាប់'}
                                    </span>
                                </button>

                                {currentPage === totalPages && (
                                    <button 
                                        onClick={onBack}
                                        className="flex items-center gap-2 px-8 py-3 rounded-xl border-2 border-emerald-600 text-emerald-600 font-bold hover:bg-emerald-50 transition-all active:scale-95"
                                    >
                                        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-5 h-5" />
                                        បញ្ចប់ការអាន និងត្រឡប់ក្រោយ
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-gray-200 min-h-[60vh] overflow-hidden relative">
                            {book.pdfUrl || localBlobUrl ? (
                                (book.pdfUrl?.includes('drive.google.com') && !localBlobUrl) ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-gray-600">
                                        <HugeiconsIcon icon={File01Icon} strokeWidth={1.5} className="w-12 h-12 mb-4 text-blue-500" />
                                        <p className="font-khmer mb-2 font-bold">ឯកសារនេះផ្ទុកនៅលើ Google Drive</p>
                                        <p className="font-khmer text-sm text-gray-500 mb-6 text-center max-w-xs">សូមចុចប៊ូតុងខាងក្រោមដើម្បីបើកអានឯកសារនេះ</p>
                                        <button 
                                            onClick={() => setShowPdfViewer(true)}
                                            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2"
                                        >
                                            <HugeiconsIcon icon={ViewIcon} strokeWidth={1.5} className="w-5 h-5" />
                                            បើកអានឯកសារ
                                        </button>
                                    </div>
                                ) : (
                                    <Document
                                        file={localBlobUrl || book.pdfUrl}
                                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                        loading={
                                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                                <HugeiconsIcon icon={Loading02Icon} strokeWidth={1.5} className="w-10 h-10 animate-spin mb-4" />
                                                <p className="font-khmer">កំពុងផ្ទុកឯកសារ...</p>
                                            </div>
                                        }
                                        error={
                                            <div className="flex flex-col items-center justify-center py-20 text-red-400">
                                                <HugeiconsIcon icon={File01Icon} strokeWidth={1.5} className="w-10 h-10 mb-4" />
                                                <p className="font-khmer">មិនអាចផ្ទុកឯកសារបានទេ</p>
                                                <button 
                                                    onClick={() => setShowPdfViewer(true)}
                                                    className="mt-4 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition-colors shadow-sm text-sm"
                                                >
                                                    សាកល្បងបើកក្នុងកម្មវិធីផ្សេង
                                                </button>
                                            </div>
                                        }
                                        className="flex flex-col items-center"
                                    >
                                        <Page 
                                            pageNumber={currentPage} 
                                            scale={pdfScale}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                            className="max-w-full shadow-md bg-white"
                                        />
                                    </Document>
                                )
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                    <HugeiconsIcon icon={File01Icon} strokeWidth={1.5} className="w-10 h-10 mb-4" />
                                    <p className="font-khmer">មិនមានឯកសារ PDF ទេ</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

             {activeTab === 'comments' && (
                 <div className="p-6 bg-white mt-2 rounded-t-3xl shadow-sm border-t border-gray-100">
                     <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                         <HugeiconsIcon icon={Comment01Icon} strokeWidth={1.5} className="w-5 h-5" /> មតិយោបល់
                     </h3>
                     
                     {book.id.length > 10 ? (
                         <CommentSection postId={book.id} commentsCount={0} />
                     ) : (
                         <div className="text-center text-gray-500 py-8">
                             មុខងារមតិយោបល់មិនដំណើរការសម្រាប់សៀវភៅគំរូនេះទេ។
                         </div>
                     )}
                 </div>
             )}

          </div>
       </div>

      {/* Floating Bottom Bar (Tabs & Pagination) */}
      <div className={`absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-30 pb-safe ${isFullScreen ? 'bg-white/90 backdrop-blur-md' : ''}`}>
          
          {/* Fixed Pagination Bar - Only in Content Tab */}
          {activeTab === 'content' && totalPages > 1 && (
              <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
                  <button 
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-xs font-khmer transition-colors ${currentPage === 1 ? 'text-gray-300 bg-transparent cursor-not-allowed' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'}`}
                  >
                      <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-3.5 h-3.5" />
                  </button>
                  
                  <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-gray-500">
                          ទំព័រ {currentPage} / {totalPages}
                      </span>
                      <div className="w-24 h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                          <div 
                              className="h-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${(currentPage / totalPages) * 100}%` }}
                          />
                      </div>
                  </div>

                  <button 
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-xs font-khmer transition-colors ${currentPage === totalPages ? 'text-gray-300 bg-transparent cursor-not-allowed' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'}`}
                  >
                      បន្ទាប់ <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="w-3.5 h-3.5" />
                  </button>
              </div>
          )}

          {/* Mobile Bottom Nav Style Tabs */}
          {!isFullScreen && (
              <div className="flex md:hidden w-full h-16">
                  <button 
                    onClick={() => setActiveTab('content')}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'content' ? 'text-emerald-600' : 'text-gray-400'}`}
                  >
                     <HugeiconsIcon icon={File01Icon} strokeWidth={1.5} className={`w-6 h-6 ${activeTab === 'content' ? 'fill-emerald-50' : ''}`} />
                     <span className="text-[10px] font-bold font-khmer">អត្ថបទ</span>
                  </button>
                  <button 
                    onClick={() => {
                        setActiveTab('comments');
                        setTimeout(() => {
                            contentRef.current?.scrollTo({ top: contentRef.current.scrollHeight, behavior: 'smooth' });
                        }, 100);
                    }}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'comments' ? 'text-emerald-600' : 'text-gray-400'}`}
                  >
                     <div className="relative">
                        <HugeiconsIcon icon={Comment01Icon} strokeWidth={1.5} className={`w-6 h-6 ${activeTab === 'comments' ? 'fill-emerald-50' : ''}`} />
                        {book.ratingCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1 rounded-full min-w-[14px] h-[14px] flex items-center justify-center border border-white">
                                {book.ratingCount > 99 ? '99+' : book.ratingCount}
                            </span>
                        )}
                     </div>
                     <span className="text-[10px] font-bold font-khmer">មតិយោបល់</span>
                  </button>
              </div>
          )}

          {/* Desktop Pill Style Tabs */}
          {!isFullScreen && (
              <div className="hidden md:flex px-6 py-3 items-center justify-between">
                  <div className="flex bg-gray-100 p-1 rounded-xl flex-1 max-w-xs">
                      <button 
                        onClick={() => setActiveTab('content')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'content' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500'}`}
                      >
                         អត្ថបទ
                      </button>
                      <button 
                        onClick={() => {
                            setActiveTab('comments');
                            setTimeout(() => {
                                contentRef.current?.scrollTo({ top: contentRef.current.scrollHeight, behavior: 'smooth' });
                            }, 100);
                        }}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'comments' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500'}`}
                      >
                         មតិយោបល់
                      </button>
                  </div>
              </div>
          )}
      </div>

      {/* PDF Viewer Popup */}
      {showPdfViewer && book.pdfUrl && (
          <div className="fixed inset-0 z-[9999] bg-black flex flex-col animate-in fade-in duration-300">
              <div className="flex items-center justify-between p-4 bg-gray-900 text-white shrink-0">
                  <div className="flex items-center gap-3">
                      <button onClick={() => setShowPdfViewer(false)} className="flex items-center gap-1 p-2 hover:bg-gray-800 rounded-full transition-colors group">
                          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-6 h-6 group-hover:text-emerald-400 transition-colors" />
                      </button>
                      <h3 className="font-bold line-clamp-1">{book.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                      <a href={book.pdfUrl} target="_blank" rel="noreferrer" className="p-2 hover:bg-gray-800 rounded-full transition-colors" title="បើកក្នុង Tab ថ្មី">
                          <HugeiconsIcon icon={Share01Icon} strokeWidth={1.5} className="w-5 h-5" />
                      </a>
                  </div>
              </div>
              <div className="flex-1 w-full h-full bg-gray-800">
                  <iframe 
                      src={book.pdfUrl.includes('drive.google.com') ? book.pdfUrl.replace(/\/view.*$/, '/preview') : book.pdfUrl} 
                      className="w-full h-full border-0"
                      title={book.title}
                      allow="autoplay"
                  />
              </div>
          </div>
      )}

    </div>
  );
};
