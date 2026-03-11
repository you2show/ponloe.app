import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, PlayIcon, PauseIcon, NextIcon, PreviousIcon, Settings01Icon, Share01Icon, BookOpen01Icon, MoreVerticalIcon, Copy01Icon, Tick01Icon, Bookmark01Icon, Edit02Icon, FloppyDiskIcon, Cancel01Icon, Delete02Icon, Facebook01Icon, SentIcon, Link01Icon, MoreHorizontalIcon, UserIcon, Search01Icon, CleanIcon, Loading02Icon, StopCircleIcon, Maximize01Icon, ListViewIcon, Menu01Icon, ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Surah, Ayah, QuranSettings, DEFAULT_SETTINGS, Juz } from '../types';
import { fetchVerses, RECITERS, fetchSurahs, fetchJuzs } from '../api';
import { SettingsDrawer } from '../SettingsDrawer';
import { TafsirModal } from '../TafsirModal';
import { generateSpeech } from '@/services/geminiService';
import { ImmerseView } from '../ImmerseView';
import { AyahCard } from '../AyahCard';
import { ViewModeToggle } from '../ViewModeToggle';
import { ReciterModal } from './ReciterModal';
import { ShareModal } from './ShareModal';
import { NoteModal } from './NoteModal';
import { MediaGeneratorModal } from '../media-generator/MediaGeneratorModal';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';

interface ReadingViewProps {
  surah: Surah;
  onBack: () => void;
  isSidebarVisible?: boolean; // Prop to know if we are in split view
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onSelectSurah?: (surah: Surah) => void;
  showAyahJump?: boolean;
  setShowAyahJump?: (show: boolean) => void;
  isImmerseMode?: boolean;
  setIsImmerseMode?: (mode: boolean) => void;
  viewMode?: 'verse-by-verse' | 'reading';
  setViewMode?: (mode: 'verse-by-verse' | 'reading') => void;
  readingMode?: 'arabic' | 'translation';
  setReadingMode?: (mode: 'arabic' | 'translation') => void;
  playingSurahId?: number | null;
  setPlayingSurahId?: (id: number | null) => void;
  playingReciter?: any | null;
  setPlayingReciter?: (reciter: any | null) => void;
  globalIsPlaying?: boolean;
  setGlobalIsPlaying?: (playing: boolean) => void;
  singleAyahMode?: number | null;
  setSingleAyahMode?: (ayah: number | null) => void;
}

const decodeBase64 = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const ReadingView: React.FC<ReadingViewProps> = ({ 
  surah, 
  onBack, 
  isSidebarVisible = false, 
  onToggleSidebar, 
  isSidebarCollapsed, 
  onSelectSurah,
  showAyahJump: propsShowAyahJump,
  setShowAyahJump: propsSetShowAyahJump,
  isImmerseMode: propsIsImmerseMode,
  setIsImmerseMode: propsSetIsImmerseMode,
  viewMode: propsViewMode,
  setViewMode: propsSetViewMode,
  readingMode: propsReadingMode,
  setReadingMode: propsSetReadingMode,
  playingSurahId,
  setPlayingSurahId,
  playingReciter,
  setPlayingReciter,
  globalIsPlaying,
  setGlobalIsPlaying,
  singleAyahMode,
  setSingleAyahMode
}) => {
  const [settings, setSettings] = useState<QuranSettings>(DEFAULT_SETTINGS);
  
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  // Local state fallbacks for mobile where QuranView might not pass them
  const [localShowAyahJump, setLocalShowAyahJump] = useState(false);
  const [localIsImmerseMode, setLocalIsImmerseMode] = useState(false);
  
  const showAyahJump = propsShowAyahJump !== undefined ? propsShowAyahJump : localShowAyahJump;
  const setShowAyahJump = propsSetShowAyahJump || setLocalShowAyahJump;
  
  const isImmerseMode = propsIsImmerseMode !== undefined ? propsIsImmerseMode : localIsImmerseMode;
  const setIsImmerseMode = propsSetIsImmerseMode || setLocalIsImmerseMode;
  
  // UI States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTafsirAyah, setSelectedTafsirAyah] = useState<Ayah | null>(null);
  const [copiedAyahId, setCopiedAyahId] = useState<number | null>(null);
  const [reciterModalOpen, setReciterModalOpen] = useState(false);
  
  // Search State
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Feature States
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>({});
  
  // Note Editing State
  const [editingNoteAyah, setEditingNoteAyah] = useState<Ayah | null>(null);
  const [noteContent, setNoteContent] = useState('');

  // Share Modal State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharingAyah, setSharingAyah] = useState<Ayah | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Media Generator State
  const [mediaGeneratorAyah, setMediaGeneratorAyah] = useState<Ayah | null>(null);

  // Audio States (Quran Recitation)
  // Removed local audio states to use Global Player
  // const [isPlaying, setIsPlaying] = useState(false);
  // const [currentAyahIndex, setCurrentAyahIndex] = useState<number | null>(null);
  // const [currentTime, setCurrentTime] = useState(0); // Track progress
  // const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio States (AI Tafsir TTS)
  const [ttsLoadingKey, setTtsLoadingKey] = useState<string | null>(null);
  const [ttsPlayingKey, setTtsPlayingKey] = useState<string | null>(null);
  const [tafsirCurrentTime, setTafsirCurrentTime] = useState(0);
  const [tafsirDuration, setTafsirDuration] = useState(0);
  
  // View Modes
  const [localViewMode, setLocalViewMode] = useState<'verse-by-verse' | 'reading'>('verse-by-verse');
  const [localReadingMode, setLocalReadingMode] = useState<'arabic' | 'translation'>('arabic');

  const viewMode = propsViewMode !== undefined ? propsViewMode : localViewMode;
  const setViewMode = propsSetViewMode || setLocalViewMode;

  const readingMode = propsReadingMode !== undefined ? propsReadingMode : localReadingMode;
  const setReadingMode = propsSetReadingMode || setLocalReadingMode;
  
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const ttsContextRef = useRef<AudioContext | null>(null);
  const ttsSourceRef = useRef<AudioBufferSourceNode | null>(null);
  // We need a way to track TTS time since Web Audio API doesn't give a simple 'currentTime' for a buffer source like HTMLAudioElement
  const ttsStartTimeRef = useRef<number>(0);
  const ttsRafRef = useRef<number | null>(null);

  const currentReciter = RECITERS.find(r => r.id === settings.reciterId) || RECITERS[0];

  // Removed useEffect for syncing local and global playback
  // useEffect(() => {
  //   if (globalIsPlaying && isPlaying) {
  //     if (audioRef.current) {
  //       audioRef.current.pause();
  //     }
  //     setIsPlaying(false);
  //   }
  // }, [globalIsPlaying, isPlaying]);

  useEffect(() => {
      const savedSettings = localStorage.getItem('ponloe_quran_settings');
      if (savedSettings) {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      }
      
      if (user) {
        loadUserDataFromSupabase();
      } else {
        const savedBookmarks = localStorage.getItem('ponloe_quran_bookmarks');
        if (savedBookmarks) {
            setBookmarks(new Set(JSON.parse(savedBookmarks)));
        }
        const savedNotes = localStorage.getItem('ponloe_quran_notes');
        if (savedNotes) {
            setNotes(JSON.parse(savedNotes));
        }
      }
  }, [user]);

  const loadUserDataFromSupabase = async () => {
    try {
      // Load Bookmarks
      const { data: bookmarksData, error: bookmarksError } = await supabase
        .from('quran_bookmarks')
        .select('surah_id, ayah_id')
        .eq('user_id', user!.id);
        
      if (!bookmarksError && bookmarksData) {
        const newBookmarks = new Set<string>();
        bookmarksData.forEach(b => newBookmarks.add(`${b.surah_id}:${b.ayah_id}`));
        setBookmarks(newBookmarks);
      }

      // Load Notes
      const { data: notesData, error: notesError } = await supabase
        .from('quran_notes')
        .select('surah_id, ayah_id, note_text')
        .eq('user_id', user!.id);
        
      if (!notesError && notesData) {
        const newNotes: Record<string, string> = {};
        notesData.forEach(n => {
          newNotes[`${n.surah_id}:${n.ayah_id}`] = n.note_text;
        });
        setNotes(newNotes);
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  };

  useEffect(() => {
    return () => {
        stopTafsirAudio();
    };
  }, []);

  // Listen for scroll-to-ayah event
  useEffect(() => {
    const handleScrollToAyah = (e: any) => {
      const { ayahId } = e.detail;
      if (ayahId) {
        const element = document.getElementById(`ayah-${ayahId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Optional: highlight the element briefly
          element.classList.add('ring-2', 'ring-emerald-500', 'shadow-lg');
          setTimeout(() => element.classList.remove('ring-2', 'ring-emerald-500', 'shadow-lg'), 2000);
        }
      }
    };

    window.addEventListener('scroll-to-ayah', handleScrollToAyah);
    return () => window.removeEventListener('scroll-to-ayah', handleScrollToAyah);
  }, []);

  const handleSettingsChange = (newSettings: QuranSettings) => {
      setSettings(newSettings);
      localStorage.setItem('ponloe_quran_settings', JSON.stringify(newSettings));
  };

  const handleReciterChange = (id: number) => {
      handleSettingsChange({ ...settings, reciterId: id });
      setReciterModalOpen(false);
  };

  const handleReadFullSurah = () => {
    setSingleAyahMode?.(null);
    setTimeout(() => {
      const container = document.querySelector('.overflow-y-auto.custom-scrollbar');
      if (container) container.scrollTop = 0;
    }, 100);
  };

  const handleContinueReading = () => {
    setSingleAyahMode?.(null);
    setTimeout(() => {
      const element = document.getElementById(`ayah-${singleAyahMode}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-2', 'ring-emerald-500', 'shadow-lg');
        setTimeout(() => element.classList.remove('ring-2', 'ring-emerald-500', 'shadow-lg'), 2000);
      }
    }, 100);
  };

  const { data: versesData = [], isLoading: loading } = useQuery({
    queryKey: ['verses', surah.id, settings.reciterId, settings.arabicScript],
    queryFn: () => fetchVerses(surah.id, settings.reciterId, settings.arabicScript),
    staleTime: Infinity,
  });

  const filteredVerses = React.useMemo(() => {
    if (!searchQuery.trim()) return versesData;
    const query = searchQuery.toLowerCase();
    return versesData.filter(v => {
      const verseNum = v.verse_key.split(':')[1];
      const translation = v.translations?.[0]?.text?.toLowerCase() || '';
      const arabic = v.text_arabic?.toLowerCase() || '';
      return translation.includes(query) || arabic.includes(query) || verseNum === query;
    });
  }, [searchQuery, versesData]);

  const actualDisplayVerses = React.useMemo(() => {
    if (singleAyahMode) {
      return filteredVerses.filter(v => parseInt(v.verse_key.split(':')[1]) === singleAyahMode);
    }
    return filteredVerses;
  }, [filteredVerses, singleAyahMode]);

  const toggleBookmark = async (verseKey: string) => {
      const newBookmarks = new Set(bookmarks);
      const isBookmarking = !newBookmarks.has(verseKey);
      
      if (isBookmarking) {
          newBookmarks.add(verseKey);
      } else {
          newBookmarks.delete(verseKey);
      }
      setBookmarks(newBookmarks);
      
      if (user) {
        const [surahId, ayahId] = verseKey.split(':').map(Number);
        try {
          if (isBookmarking) {
            await supabase.from('quran_bookmarks').insert({
              user_id: user.id,
              surah_id: surahId,
              ayah_id: ayahId
            });
          } else {
            await supabase.from('quran_bookmarks')
              .delete()
              .eq('user_id', user.id)
              .eq('surah_id', surahId)
              .eq('ayah_id', ayahId);
          }
        } catch (err) {
          console.error('Failed to toggle bookmark:', err);
        }
      } else {
        localStorage.setItem('ponloe_quran_bookmarks', JSON.stringify(Array.from(newBookmarks)));
      }
  };

  // --- TTS Logic ---
  const updateTafsirProgress = () => {
      if (ttsContextRef.current && ttsStartTimeRef.current) {
          const elapsed = ttsContextRef.current.currentTime - ttsStartTimeRef.current;
          // Apply speed factor
          setTafsirCurrentTime(elapsed * settings.ttsSpeed); 
          
          if (elapsed * settings.ttsSpeed < tafsirDuration) {
              ttsRafRef.current = requestAnimationFrame(updateTafsirProgress);
          } else {
              setTafsirCurrentTime(tafsirDuration);
          }
      }
  };

  const stopTafsirAudio = () => {
      if (ttsSourceRef.current) {
          try {
              ttsSourceRef.current.stop();
          } catch(e) { }
          ttsSourceRef.current = null;
      }
      if (ttsRafRef.current) {
          cancelAnimationFrame(ttsRafRef.current);
          ttsRafRef.current = null;
      }
      setTtsPlayingKey(null);
      setTtsLoadingKey(null);
      setTafsirCurrentTime(0);
      setTafsirDuration(0);
  };

  const handlePlayTafsir = async (verse: Ayah) => {
      if (ttsPlayingKey === verse.verse_key) {
          stopTafsirAudio();
          return;
      }

      if (globalIsPlaying) {
        setGlobalIsPlaying?.(false);
      }

      stopTafsirAudio(); 
      // if (audioRef.current) { 
      //     audioRef.current.pause();
      //     setIsPlaying(false);
      // }

      const tafsirText = verse.tafsir?.text;
      if (!tafsirText) {
          showToast("មិនមានទិន្នន័យ Tafsir សម្រាប់អានទេ", "error");
          return;
      }

      setTtsLoadingKey(verse.verse_key);

      try {
          const base64Audio = await generateSpeech(tafsirText, settings.ttsVoice);
          
          if (!base64Audio) throw new Error("Failed to generate audio");

          if (!ttsContextRef.current) {
              ttsContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
          }
          const ctx = ttsContextRef.current;
          if (ctx.state === 'suspended') await ctx.resume();

          const audioData = decodeBase64(base64Audio);
          const dataInt16 = new Int16Array(audioData.buffer);
          const float32Data = new Float32Array(dataInt16.length);
          for (let i = 0; i < dataInt16.length; i++) {
              float32Data[i] = dataInt16[i] / 32768.0;
          }

          const buffer = ctx.createBuffer(1, float32Data.length, 24000);
          buffer.copyToChannel(float32Data, 0);

          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.playbackRate.value = settings.ttsSpeed;
          source.connect(ctx.destination);
          
          // Set duration for highlighting
          const duration = buffer.duration / settings.ttsSpeed;
          setTafsirDuration(duration);
          ttsStartTimeRef.current = ctx.currentTime;

          source.onended = () => {
              setTtsPlayingKey(null);
              if (ttsRafRef.current) cancelAnimationFrame(ttsRafRef.current);
          };

          ttsSourceRef.current = source;
          source.start();
          setTtsPlayingKey(verse.verse_key);
          
          // Start Progress Tracking
          updateTafsirProgress();

      } catch (error) {
          console.error("AI Speech Error:", error);
          showToast("បរាជ័យក្នុងការអាន Tafsir។", "error");
      } finally {
          setTtsLoadingKey(null);
      }
  };

  const openNoteModal = (ayah: Ayah) => {
      setEditingNoteAyah(ayah);
      setNoteContent(notes[ayah.verse_key] || '');
  };

  const saveNote = async () => {
      if (!editingNoteAyah) return;
      const verseKey = editingNoteAyah.verse_key;
      const newNotes = { ...notes };
      const isDeleting = !noteContent.trim();
      
      if (isDeleting) {
          delete newNotes[verseKey];
      } else {
          newNotes[verseKey] = noteContent;
      }
      setNotes(newNotes);
      
      if (user) {
        const [surahId, ayahId] = verseKey.split(':').map(Number);
        try {
          if (isDeleting) {
            await supabase.from('quran_notes')
              .delete()
              .eq('user_id', user.id)
              .eq('surah_id', surahId)
              .eq('ayah_id', ayahId);
          } else {
            // Check if note exists first to decide insert vs update
            const { data } = await supabase.from('quran_notes')
              .select('id')
              .eq('user_id', user.id)
              .eq('surah_id', surahId)
              .eq('ayah_id', ayahId)
              .single();
              
            if (data) {
              await supabase.from('quran_notes')
                .update({ note_text: noteContent, updated_at: new Date().toISOString() })
                .eq('id', data.id);
            } else {
              await supabase.from('quran_notes').insert({
                user_id: user.id,
                surah_id: surahId,
                ayah_id: ayahId,
                note_text: noteContent
              });
            }
          }
        } catch (err) {
          console.error('Failed to save note:', err);
        }
      } else {
        localStorage.setItem('ponloe_quran_notes', JSON.stringify(newNotes));
      }
      
      setEditingNoteAyah(null);
      setNoteContent('');
  };

  const openShareModal = (ayah: Ayah) => {
      setSharingAyah(ayah);
      setShareModalOpen(true);
      setLinkCopied(false);
  };

  const handleShareAction = async (platform: 'facebook' | 'telegram' | 'copy' | 'more') => {
      if (!sharingAyah) return;
      const verseId = sharingAyah.verse_key.split(':')[1];
      const url = `https://quran.com/${surah.id}/${verseId}`;
      const text = `${sharingAyah.text_arabic}\n\n${sharingAyah.translations?.[0]?.text}\n(${surah.name_simple} ${sharingAyah.verse_key})`;

      switch (platform) {
          case 'facebook': window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank'); break;
          case 'telegram': window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank'); break;
          case 'copy':
              navigator.clipboard.writeText(`${text}\n\nRead more at: ${url}`);
              setLinkCopied(true);
              setTimeout(() => setLinkCopied(false), 2000);
              break;
          case 'more':
              if (navigator.share) {
                  try { await navigator.share({ title: `Surah ${surah.name_simple} ${sharingAyah.verse_key}`, text: text, url: url }); } catch (err) { }
              } else { handleShareAction('copy'); }
              break;
      }
  };

  // --- Audio Recitation Logic (Now using Global Player) ---
  const handleGlobalPlay = () => {
      stopTafsirAudio();
      
      if (playingSurahId === surah.id && globalIsPlaying) {
        setGlobalIsPlaying?.(false);
      } else {
        setPlayingSurahId?.(surah.id);
        setGlobalIsPlaying?.(true);
      }
  };

  const playAyah = (index: number) => {
      // Legacy support or if we want to start global player
      handleGlobalPlay();
  };

  const togglePlayPause = () => {
      handleGlobalPlay();
  };

  const handleNext = () => {
      // Global player handles next
  };

  const handlePrev = () => {
      // Global player handles prev
  };

  const handleCopy = (ayah: Ayah) => {
      const text = `${ayah.text_arabic}\n\n${ayah.translations?.[0]?.text}\n(${surah.name_simple} ${ayah.verse_key})`;
      navigator.clipboard.writeText(text).then(() => {
          setCopiedAyahId(ayah.id);
          setTimeout(() => setCopiedAyahId(null), 2000);
      });
  };

  // Quick Ayah Jump State
  const [navTab, setNavTab] = useState<'surah' | 'juz' | 'page'>('surah');
  const [selectedNavSurah, setSelectedNavSurah] = useState<Surah | null>(null);
  const [verseSearchQuery, setVerseSearchQuery] = useState('');

  const { data: allSurahs = [] } = useQuery({
    queryKey: ['surahs'],
    queryFn: () => fetchSurahs(),
    enabled: showAyahJump,
    staleTime: Infinity,
  });

  const { data: allJuzs = [] } = useQuery({
    queryKey: ['juzs'],
    queryFn: () => fetchJuzs(),
    enabled: showAyahJump,
    staleTime: Infinity,
  });

  useEffect(() => {
     if (showAyahJump) {
         setSelectedNavSurah(surah);
     }
  }, [showAyahJump, surah]);

  if (isImmerseMode) {
      return (
          <ImmerseView 
              surah={surah}
              verses={versesData}
              currentIndex={0} // Disabled highlighting
              isPlaying={globalIsPlaying && playingSurahId === surah.id}
              onClose={() => setIsImmerseMode(false)}
              onPlayPause={togglePlayPause}
              onNext={handleNext}
              onPrev={handlePrev}
              settings={settings}
              audioRef={{ current: null }}
          />
      );
  }

  const scrollToAyah = (index: number) => {
      setShowAyahJump(false);
      const ayah = versesData[index];
      if (ayah) {
          const element = document.getElementById(`ayah-${ayah.id}`);
          if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Highlight briefly
              element.classList.add('ring-2', 'ring-emerald-500', 'shadow-lg');
              setTimeout(() => {
                  element.classList.remove('ring-2', 'ring-emerald-500', 'shadow-lg');
              }, 2000);
          }
      }
  };

  return (
    <div className={`flex flex-col h-full relative overflow-hidden ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'}`}>
      {/* Top Bar (Mobile Only) */}
      {!isSidebarVisible && (
        <div className={`backdrop-blur-md border-b px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm shrink-0 ${theme === 'dark' ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-gray-100'}`}>
           <div className="flex items-center gap-1 sm:gap-4 flex-1 min-w-0">
               <button onClick={onBack} className={`p-2 -ml-2 rounded-full transition-colors shrink-0 ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'}`}>
                   <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-5 h-5 sm:w-6 sm:h-6" />
               </button>
               
               <div className="flex items-center gap-1 sm:gap-3 truncate">
                   <button 
                      onClick={() => setShowAyahJump(!showAyahJump)} 
                      className={`flex items-center gap-1 sm:gap-2 px-1 sm:px-2 py-1.5 rounded-xl transition-colors -ml-2 group truncate ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}`}
                   >
                       <div className="text-left truncate">
                           <h2 className={`font-bold font-khmer text-base sm:text-lg leading-none transition-colors truncate ${theme === 'dark' ? 'text-white group-hover:text-emerald-400' : 'text-gray-900 group-hover:text-emerald-700'}`}>
                               {surah.id}. {surah.name_khmer}
                           </h2>
                           <p className={`hidden sm:block text-xs font-medium mt-1 truncate ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>{surah.name_simple}</p>
                       </div>
                       <div className={`transition-colors ml-1 shrink-0 ${theme === 'dark' ? 'text-slate-500 group-hover:text-emerald-400' : 'text-gray-400 group-hover:text-emerald-600'}`}>
                           {showAyahJump ? <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={1.5} className="w-4 h-4 sm:w-5 sm:h-5" /> : <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={1.5} className="w-4 h-4 sm:w-5 sm:h-5" />}
                       </div>
                   </button>
               </div>
           </div>

           <div className="flex items-center gap-0.5 sm:gap-1 pl-1 sm:pl-2 shrink-0">
               <ViewModeToggle
                 viewMode={viewMode}
                 setViewMode={setViewMode}
                 readingMode={readingMode}
                 setReadingMode={setReadingMode}
               />
               <button onClick={() => setIsImmerseMode(true)} className={`p-1.5 sm:p-2 rounded-full transition-colors shrink-0 ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-600'}`} title="Immerse Mode">
                   <HugeiconsIcon icon={Maximize01Icon} strokeWidth={1.5} className="w-4 h-4 sm:w-5 sm:h-5" />
               </button>
               <button onClick={() => setIsSettingsOpen(true)} className={`p-1.5 sm:p-2 rounded-full transition-colors shrink-0 ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-600'}`}>
                   <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.5} className="w-4 h-4 sm:w-5 sm:h-5" />
               </button>
           </div>
        </div>
      )}

      {/* Navigation Modal */}
      {/* Backdrop for mobile or to close when clicking outside */}
      {showAyahJump && (
          <div 
              className="absolute inset-0 z-[45] bg-black/20 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none animate-in fade-in duration-300" 
              onClick={() => setShowAyahJump(false)}
          ></div>
      )}
      
      <div className={`absolute top-0 left-0 bottom-0 z-[50] w-full sm:w-[400px] md:w-[450px] shadow-2xl border-r flex flex-col transition-transform duration-300 ease-in-out ${showAyahJump ? 'translate-x-0' : '-translate-x-full'} ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
          <div className={`flex justify-between items-center p-4 border-b shrink-0 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
              {/* Tabs */}
              <div className={`flex p-1 rounded-xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`}>
                  {[
                      { id: 'surah', label: 'Surah' },
                      { id: 'juz', label: 'Juz' },
                      { id: 'page', label: 'Page' }
                  ].map(tab => (
                      <button
                          key={tab.id}
                          onClick={() => {
                              setNavTab(tab.id as any);
                              setSearchQuery('');
                          }}
                          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              navTab === tab.id 
                              ? (theme === 'dark' ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm')
                              : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700')
                          }`}
                      >
                          {tab.label}
                      </button>
                  ))}
              </div>
              <button onClick={() => setShowAyahJump(false)} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-400 hover:bg-gray-100'}`}>
                  <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
              </button>
          </div>
          
          {/* Search Bar */}
          <div className={`p-4 border-b shrink-0 flex gap-2 ${theme === 'dark' ? 'border-slate-800' : 'border-gray-100'}`}>
              <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className={`h-4 w-4 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                      type="text"
                      className={`block w-full pl-9 pr-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-khmer ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                      placeholder={navTab === 'surah' ? 'Search Surah...' : navTab === 'juz' ? 'Search Juz...' : 'Search Page...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
              </div>
              {navTab === 'surah' && (
                  <div className="relative w-24">
                      <input
                          type="text"
                          className={`block w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                          placeholder="Verse"
                          value={verseSearchQuery}
                          onChange={(e) => setVerseSearchQuery(e.target.value)}
                      />
                  </div>
              )}
          </div>

          <div className="flex-1 overflow-hidden flex">
              {navTab === 'surah' && (
                  <>
                      {/* Surah List */}
                      <div className={`flex-1 overflow-y-auto custom-scrollbar border-r p-2 space-y-1 ${theme === 'dark' ? 'border-slate-800' : 'border-gray-100'}`}>
                          {allSurahs.length === 0 ? (
                              <div className={`text-center py-8 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}><HugeiconsIcon icon={Loading02Icon} strokeWidth={1.5} className="w-6 h-6 animate-spin mx-auto" /></div>
                          ) : (
                              allSurahs
                                .filter(s => 
                                    !searchQuery || 
                                    s.name_simple.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    s.name_khmer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    s.id.toString() === searchQuery
                                )
                                .map(s => (
                                  <button
                                      key={s.id}
                                      onClick={() => setSelectedNavSurah(s)}
                                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                                          selectedNavSurah?.id === s.id 
                                          ? (theme === 'dark' ? 'bg-slate-800 font-semibold text-white' : 'bg-gray-100 font-semibold text-gray-900') 
                                          : (theme === 'dark' ? 'hover:bg-slate-800/50 text-slate-300' : 'hover:bg-gray-50 text-gray-900')
                                      }`}
                                  >
                                      <div className={`w-6 text-center text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>{s.id}</div>
                                      <div className="flex-1">{s.name_simple}</div>
                                  </button>
                              ))
                          )}
                      </div>
                      {/* Verse List */}
                      <div className={`w-24 overflow-y-auto custom-scrollbar p-2 space-y-1 ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-gray-50/50'}`}>
                          {selectedNavSurah && Array.from({ length: selectedNavSurah.verses_count }, (_, i) => i + 1)
                              .filter(v => !verseSearchQuery || v.toString().includes(verseSearchQuery))
                              .map(v => (
                              <button
                                  key={v}
                                  onClick={() => {
                                      if (selectedNavSurah.id !== surah.id) {
                                          if (onSelectSurah) onSelectSurah(selectedNavSurah);
                                      } else {
                                          scrollToAyah(v - 1);
                                      }
                                      setShowAyahJump(false);
                                  }}
                                  className={`w-full py-2 text-center rounded-lg text-sm transition-colors ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-200 text-gray-700'}`}
                              >
                                  {v}
                              </button>
                          ))}
                      </div>
                  </>
              )}

              {navTab === 'juz' && (
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 grid grid-cols-3 gap-2 content-start">
                      {allJuzs.length === 0 ? (
                          <div className={`col-span-3 text-center py-8 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}><HugeiconsIcon icon={Loading02Icon} strokeWidth={1.5} className="w-6 h-6 animate-spin mx-auto" /></div>
                      ) : (
                          allJuzs
                            .filter(j => !searchQuery || j.juz_number.toString().includes(searchQuery))
                            .map(j => (
                              <button
                                  key={j.id}
                                  onClick={() => {
                                      if (!j.verse_mapping) return;
                                      const firstSurahId = Object.keys(j.verse_mapping)[0];
                                      const s = allSurahs.find(sur => sur.id === parseInt(firstSurahId));
                                      if (s && onSelectSurah) {
                                          onSelectSurah(s);
                                          setShowAyahJump(false);
                                      }
                                  }}
                                  className={`aspect-video flex flex-col items-center justify-center rounded-xl font-medium text-sm transition-all relative overflow-hidden group ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-gray-50 hover:bg-gray-200 text-gray-700'}`}
                              >
                                  <span className="text-lg font-bold z-10">{j.juz_number}</span>
                                  <span className={`text-[10px] uppercase tracking-wider z-10 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>Juz</span>
                                  
                                  {/* Decorative Juz Name using quran-common font */}
                                  <div className="absolute -bottom-2 -right-1 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                    <span 
                                      className={`text-5xl ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-900'}`} 
                                      style={{ fontFamily: "'common/quran-common'" }}
                                    >
                                      {`j${String(j.juz_number).padStart(3, '0')}`}
                                    </span>
                                  </div>
                              </button>
                          ))
                      )}
                  </div>
              )}

              {navTab === 'page' && (
                  <div className={`flex-1 flex items-center justify-center flex-col ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
                      <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-sm">Page navigation coming soon</p>
                  </div>
              )}
          </div>
      </div>

      <SettingsDrawer 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />

      <TafsirModal 
        ayah={selectedTafsirAyah} 
        surah={surah} 
        onClose={() => setSelectedTafsirAyah(null)} 
      />

      {/* Content */}
      <div 
        className={`flex-1 overflow-y-auto scroll-smooth custom-scrollbar ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'}`}
        onScroll={(e) => {
          const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
          if (scrollHeight > clientHeight) {
            const progress = Math.min(100, Math.max(0, Math.round((scrollTop / (scrollHeight - clientHeight)) * 100)));
            if (progress > 0) {
              const savedProgress = JSON.parse(localStorage.getItem('ponloe_quran_reading_progress') || '{}');
              savedProgress[surah.id] = progress;
              localStorage.setItem('ponloe_quran_reading_progress', JSON.stringify(savedProgress));
            }
          } else {
            // If content is smaller than container, it's 100% read
            const savedProgress = JSON.parse(localStorage.getItem('ponloe_quran_reading_progress') || '{}');
            savedProgress[surah.id] = 100;
            localStorage.setItem('ponloe_quran_reading_progress', JSON.stringify(savedProgress));
          }
        }}
      >
          {loading ? (
              <div className={`flex flex-col items-center justify-center h-full gap-4 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
                  <div className={`animate-spin rounded-full h-10 w-10 border-4 border-t-emerald-600 ${theme === 'dark' ? 'border-slate-800' : 'border-gray-200'}`}></div>
                  <span className="font-khmer text-sm">កំពុងរៀបចំ...</span>
              </div>
          ) : (
              <div className="max-w-4xl mx-auto p-4 md:p-8 pb-32 space-y-6">
                  
                  {/* Clean Surah Header */}
                  {!searchQuery && !singleAyahMode && (
                      <div className="relative bg-emerald-800 text-white overflow-hidden rounded-2xl shadow-sm mb-6">
                          {/* Islamic Pattern SVG Background */}
                          <div className="absolute inset-0 opacity-5" style={{ 
                              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                              backgroundSize: '20px 20px'
                          }}></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/50 to-transparent"></div>
                          
                          <div className="relative z-10 flex items-center justify-between p-3 md:p-4">
                              <div className="flex flex-col">
                                  <h1 className="text-xl md:text-2xl font-bold font-khmer drop-shadow-sm mb-1">{surah.name_khmer}</h1>
                                  <div className="flex items-center gap-3 text-xs text-emerald-100/90 mb-2">
                                      <span className="font-khmer">{surah.revelation_place === 'makkah' ? 'ទីក្រុងម៉ាក្កះ' : 'ទីក្រុងម៉ាឌីណះ'}</span>
                                      <div className="w-1 h-1 rounded-full bg-emerald-400/60"></div>
                                      <span className="font-khmer">{surah.verses_count} អាយ៉ាត់</span>
                                  </div>
                                  <button 
                                    onClick={() => {
                                      if (playingSurahId === surah.id && globalIsPlaying) {
                                        setGlobalIsPlaying?.(false);
                                      } else {
                                        setPlayingSurahId?.(surah.id);
                                        setGlobalIsPlaying?.(true);
                                      }
                                    }}
                                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium transition-colors w-fit"
                                  >
                                    {playingSurahId === surah.id && globalIsPlaying ? (
                                      <HugeiconsIcon icon={PauseIcon} strokeWidth={1.5} className="w-3.5 h-3.5 fill-current" />
                                    ) : (
                                      <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} className="w-3.5 h-3.5 fill-current ml-0.5" />
                                    )}
                                    <span className="font-khmer">{playingSurahId === surah.id && globalIsPlaying ? 'ផ្អាក' : 'ស្តាប់'}</span>
                                  </button>
                              </div>
                              <div className="flex flex-col items-end text-emerald-100/90 opacity-80 pr-4">
                                <span className={`icon-surah${surah.id} text-4xl md:text-5xl`}></span>
                                <span className="text-emerald-200/80 text-[10px] md:text-xs font-medium mt-1">{surah.name_simple}</span>
                              </div>
                          </div>
                          
                          {/* Top Right Surah Number Badge with Smooth Waves */}
                          <div className="absolute top-0 right-0 bg-emerald-900/40 backdrop-blur-sm text-emerald-100/80 font-bold text-xs min-w-[32px] h-[28px] flex items-center justify-center rounded-bl-xl z-10">
                            {/* Left curve */}
                            <div className="absolute top-0 -left-2 w-2 h-2 bg-transparent rounded-tr-lg shadow-[4px_-4px_0_4px_rgba(6,78,59,0.4)] backdrop-blur-sm"></div>
                            {/* Bottom curve */}
                            <div className="absolute -bottom-2 right-0 w-2 h-2 bg-transparent rounded-tr-lg shadow-[4px_-4px_0_4px_rgba(6,78,59,0.4)] backdrop-blur-sm"></div>
                            {surah.id}
                          </div>
                      </div>
                  )}

                  {surah.bismillah_pre && !searchQuery && !singleAyahMode && (
                      <div className="text-center mb-10 pt-4 opacity-80">
                          <p className={`font-bismillah text-4xl md:text-5xl ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>
                              ﷽
                          </p>
                      </div>
                  )}

                  {viewMode === 'verse-by-verse' ? (
                      <div className="space-y-6">
                        {actualDisplayVerses.map((verse, index) => {
                            const originalIndex = versesData.findIndex(v => v.id === verse.id);
                            return (
                              <AyahCard
                                  key={verse.id}
                                  ayah={verse}
                                  surah={surah}
                                  settings={settings}
                                  isActive={false} // Disabled highlighting for now as we use Global Player
                                  isPlaying={globalIsPlaying && playingSurahId === surah.id}
                                  isBookmarked={bookmarks.has(verse.verse_key)}
                                  hasNote={!!notes[verse.verse_key]}
                                  currentTime={0} // Disabled highlighting
                                  isTtsLoading={ttsLoadingKey === verse.verse_key}
                                  isTtsPlaying={ttsPlayingKey === verse.verse_key}
                                  tafsirCurrentTime={tafsirCurrentTime}
                                  tafsirDuration={tafsirDuration}
                                  onPlayRecitation={() => handleGlobalPlay()}
                                  onToggleBookmark={() => toggleBookmark(verse.verse_key)}
                                  onPlayTafsir={() => handlePlayTafsir(verse)}
                                  onOpenNote={() => openNoteModal(verse)}
                                  onOpenShare={() => openShareModal(verse)}
                                  onCopy={() => handleCopy(verse)}
                                  onOpenTafsir={() => setSelectedTafsirAyah(verse)}
                                  isCopied={copiedAyahId === verse.id}
                                  onOpenMediaGenerator={() => setMediaGeneratorAyah(verse)}
                              />
                            );
                        })}
                        
                        {singleAyahMode && (
                          <div className="flex flex-col sm:flex-row gap-3 mt-8">
                            <button 
                              onClick={handleReadFullSurah}
                              className={`flex-1 py-3 border rounded-xl font-khmer font-medium transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                            >
                              {t('quran.readFullSurah')}
                            </button>
                            <button 
                              onClick={handleContinueReading}
                              className={`flex-1 py-3 rounded-xl font-khmer font-medium transition-colors ${theme === 'dark' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                            >
                              {t('quran.continueReading')}
                            </button>
                          </div>
                        )}
                      </div>
                  ) : (
                      <div className={`rounded-3xl p-8 md:p-12 shadow-sm border leading-relaxed ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
                          {readingMode === 'arabic' ? (
                              <div className="text-right" dir="rtl">
                                  {actualDisplayVerses.map((verse, index) => (
                                      <span key={verse.id} className={`inline ${settings.fontClass} leading-[2.5] ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`} style={{ fontSize: `${settings.arabicFontSize}px` }}>
                                          <span dangerouslySetInnerHTML={{ __html: verse.text_arabic }} />
                                          <span className={`inline-flex items-center justify-center w-10 h-10 mx-2 text-sm rounded-full font-sans ${theme === 'dark' ? 'text-emerald-400 bg-emerald-900/30' : 'text-emerald-600 bg-emerald-50'}`}>
                                              {verse.verse_key.split(':')[1]}
                                          </span>
                                      </span>
                                  ))}
                              </div>
                          ) : (
                              <div className={`text-left font-khmer text-lg md:text-xl leading-loose ${theme === 'dark' ? 'text-slate-300' : 'text-gray-800'}`}>
                                  {actualDisplayVerses.map((verse, index) => (
                                      <span key={verse.id} className="inline" style={{ fontSize: `${settings.translationFontSize}px` }}>
                                          <span className={`font-bold mr-2 text-sm ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                              [{verse.verse_key.split(':')[1]}]
                                          </span>
                                          {verse.translations?.[0]?.text?.replace(/<[^>]*>?/gm, '')}
                                          {' '}
                                      </span>
                                  ))}
                              </div>
                          )}
                          
                          {singleAyahMode && (
                            <div className={`flex flex-col sm:flex-row gap-3 mt-8 pt-8 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-gray-100'}`}>
                              <button 
                                onClick={handleReadFullSurah}
                                className={`flex-1 py-3 border rounded-xl font-khmer font-medium transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                              >
                                {t('quran.readFullSurah')}
                              </button>
                              <button 
                                onClick={handleContinueReading}
                                className={`flex-1 py-3 rounded-xl font-khmer font-medium transition-colors ${theme === 'dark' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                              >
                                {t('quran.continueReading')}
                              </button>
                            </div>
                          )}
                      </div>
                  )}
              </div>
          )}
      </div>

      {/* Sticky Audio Player within this container */}
      {/* Removed old mini player to use GlobalAudioPlayer instead */}

      {/* Modals */}
      <ReciterModal
        isOpen={reciterModalOpen}
        onClose={() => setReciterModalOpen(false)}
        currentReciterId={settings.reciterId}
        onReciterChange={handleReciterChange}
      />

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        ayah={sharingAyah}
        linkCopied={linkCopied}
        onShareAction={handleShareAction}
      />

      <NoteModal
        isOpen={!!editingNoteAyah}
        onClose={() => setEditingNoteAyah(null)}
        ayah={editingNoteAyah}
        noteContent={noteContent}
        setNoteContent={setNoteContent}
        onSave={saveNote}
        onDelete={() => { setNoteContent(''); saveNote(); }}
        hasExistingNote={!!(editingNoteAyah && notes[editingNoteAyah.verse_key])}
      />

      {mediaGeneratorAyah && (
        <MediaGeneratorModal
          isOpen={!!mediaGeneratorAyah}
          onClose={() => setMediaGeneratorAyah(null)}
          ayah={mediaGeneratorAyah}
          surah={surah}
        />
      )}
    </div>
  );
};
