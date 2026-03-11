import { HugeiconsIcon } from '@hugeicons/react';
import { PlayIcon, PauseIcon, Bookmark01Icon, Edit02Icon, Share01Icon, Copy01Icon, Tick01Icon, BookOpen01Icon, CleanIcon, Loading02Icon, StopCircleIcon, MoreHorizontalIcon, Video01Icon } from '@hugeicons/core-free-icons';

import React, { useMemo } from 'react';

import { Ayah, Surah, QuranSettings } from './types';
import { useTheme } from '@/contexts/ThemeContext';

interface AyahCardProps {
  ayah: Ayah;
  surah: Surah;
  settings: QuranSettings;
  isActive: boolean;
  isPlaying: boolean;
  isBookmarked: boolean;
  hasNote: boolean;
  currentTime: number; // Global audio current time
  isTtsLoading: boolean;
  isTtsPlaying: boolean;
  
  // NEW PROPS for Tafsir Highlighting
  tafsirCurrentTime?: number;
  tafsirDuration?: number;

  onPlayRecitation: () => void;
  onToggleBookmark: () => void;
  onPlayTafsir: () => void;
  onOpenNote: () => void;
  onOpenShare: () => void;
  onCopy: () => void;
  onOpenTafsir: () => void;
  isCopied: boolean;
  onOpenMediaGenerator: () => void;
}

export const AyahCard: React.FC<AyahCardProps> = React.memo(({
  ayah, surah, settings, isActive, isPlaying, isBookmarked, hasNote,
  currentTime, isTtsLoading, isTtsPlaying, 
  tafsirCurrentTime = 0, tafsirDuration = 0,
  onPlayRecitation, onToggleBookmark, onPlayTafsir, onOpenNote,
  onOpenShare, onCopy, onOpenTafsir, isCopied, onOpenMediaGenerator
}) => {
  const { theme } = useTheme();
  
  // Highlight Word Logic for Quran Recitation
  const activeWordIndex = useMemo(() => {
    if (!isActive || !isPlaying || !settings.wordHighlighting || !ayah.audio?.segments) return -1;
    
    // segments format: [word_index, start_ms, end_ms]
    // Note: API returns ms, HTML5 audio uses seconds
    const timeMs = currentTime * 1000;
    const segment = ayah.audio.segments.find(seg => timeMs >= seg[1] && timeMs <= seg[2]);
    return segment ? segment[0] : -1;
  }, [isActive, isPlaying, currentTime, ayah.audio, settings.wordHighlighting]);

  // NEW: Highlight Word Logic for Tafsir (Estimation based)
  const tafsirWords = useMemo(() => {
    if (!ayah.tafsir?.text) return [];
    
    try {
        // Use Intl.Segmenter for accurate Khmer word splitting if available
        // @ts-ignore
        const segmenter = new Intl.Segmenter('km', { granularity: 'word' });
        // @ts-ignore
        return [...segmenter.segment(ayah.tafsir.text)].map(s => s.segment);
    } catch (e) {
        // Fallback: Split by space (might be less accurate for Khmer but works as backup)
        return ayah.tafsir.text.split(' ');
    }
  }, [ayah.tafsir?.text]);

  const activeTafsirWordIndex = useMemo(() => {
      if (!isTtsPlaying || !settings.wordHighlighting || tafsirDuration === 0) return -1;
      
      // Calculate progress percentage
      const progress = tafsirCurrentTime / tafsirDuration;
      // Estimate current word index based on total words
      const estimatedIndex = Math.floor(progress * tafsirWords.length);
      
      return Math.min(estimatedIndex, tafsirWords.length - 1);
  }, [isTtsPlaying, tafsirCurrentTime, tafsirDuration, tafsirWords.length, settings.wordHighlighting]);

  const displayWords = useMemo(() => {
     if (!ayah.words || ayah.words.length === 0) return [];
     return ayah.words;
  }, [ayah.words]);

  return (
    <div 
      id={`ayah-${ayah.verse_key.split(':')[1]}`}
      className={`rounded-2xl border transition-all duration-300 overflow-hidden group ${isActive ? 'border-emerald-500 shadow-lg ring-1 ring-emerald-500' : (theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-sm hover:shadow-md hover:shadow-emerald-900/10' : 'bg-white border-gray-100 shadow-sm hover:shadow-md')}`}
    >
      {/* Top Action Bar */}
      <div className={`px-4 py-3 flex justify-between items-center border-b ${isActive ? (theme === 'dark' ? 'bg-emerald-900/20 border-emerald-900/50' : 'bg-emerald-50/50 border-emerald-100') : (theme === 'dark' ? 'bg-slate-800/50 border-slate-800' : 'bg-gray-50/50 border-gray-100')}`}>
        <div className="flex items-center gap-3">
          {/* Removed the circle border verse number as requested */}
          <button onClick={onPlayRecitation} className={`p-1.5 rounded-full transition-all ${isActive && isPlaying ? (theme === 'dark' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-600') : (theme === 'dark' ? 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800' : 'text-gray-500 hover:text-emerald-600 hover:bg-white')}`}>
            {isActive && isPlaying ? <HugeiconsIcon icon={PauseIcon} strokeWidth={1.5} className="w-4 h-4 fill-current" /> : <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} className="w-4 h-4 fill-current" />}
          </button>
          <button onClick={onPlayTafsir} disabled={isTtsLoading} className={`p-1.5 rounded-full transition-all flex items-center gap-1.5 ${isTtsPlaying ? (theme === 'dark' ? 'bg-violet-900/30 text-violet-400 ring-1 ring-violet-900/50' : 'bg-violet-100 text-violet-600 ring-1 ring-violet-200') : (theme === 'dark' ? 'text-slate-400 hover:text-violet-400 hover:bg-violet-900/20' : 'text-gray-500 hover:text-violet-600 hover:bg-violet-50')}`}>
            {isTtsLoading ? <HugeiconsIcon icon={Loading02Icon} strokeWidth={1.5} className="w-4 h-4 animate-spin" /> : isTtsPlaying ? <HugeiconsIcon icon={StopCircleIcon} strokeWidth={1.5} className="w-4 h-4 fill-current" /> : <HugeiconsIcon icon={CleanIcon} strokeWidth={1.5} className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onToggleBookmark} className={`p-1.5 rounded-md transition-colors ${isBookmarked ? (theme === 'dark' ? 'text-amber-400 hover:bg-amber-900/20' : 'text-amber-500 hover:bg-amber-50') : (theme === 'dark' ? 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800' : 'text-gray-400 hover:text-emerald-600 hover:bg-white')}`}>
            <HugeiconsIcon icon={Bookmark01Icon} strokeWidth={1.5} className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button onClick={onOpenNote} className={`p-1.5 rounded-md transition-colors ${hasNote ? (theme === 'dark' ? 'text-blue-400 hover:bg-blue-900/20' : 'text-blue-500 hover:bg-blue-50') : (theme === 'dark' ? 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800' : 'text-gray-400 hover:text-emerald-600 hover:bg-white')}`}>
            <HugeiconsIcon icon={Edit02Icon} strokeWidth={1.5} className={`w-4 h-4 ${hasNote ? 'fill-blue-100' : ''}`} />
          </button>
          <button onClick={onCopy} className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800' : 'text-gray-400 hover:text-emerald-600 hover:bg-white'}`}>
            {isCopied ? <HugeiconsIcon icon={Tick01Icon} strokeWidth={1.5} className="w-4 h-4 text-green-600" /> : <HugeiconsIcon icon={Copy01Icon} strokeWidth={1.5} className="w-4 h-4" />}
          </button>
          <button onClick={onOpenShare} className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800' : 'text-gray-400 hover:text-emerald-600 hover:bg-white'}`}>
            <HugeiconsIcon icon={Share01Icon} strokeWidth={1.5} className="w-4 h-4" />
          </button>
          <button onClick={onOpenMediaGenerator} className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800' : 'text-gray-400 hover:text-emerald-600 hover:bg-white'}`} title="Generate Video/Image">
            <HugeiconsIcon icon={Video01Icon} strokeWidth={1.5} className="w-4 h-4" />
          </button>
          <button onClick={onOpenTafsir} className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800' : 'text-gray-400 hover:text-emerald-600 hover:bg-white'}`}>
            <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-5 md:p-8">
        <div className="flex flex-col gap-6">
            
            {/* Content */}
            <div className="w-full">
                {/* Arabic Text */}
                <div 
                  className={`${settings.fontClass} text-right leading-[2.8] tracking-normal flex flex-row flex-wrap justify-start items-start`}
                  style={{ direction: 'rtl' }}
                >
                  {displayWords.length > 0 ? (
                    displayWords.map((word, wIdx) => {
                       // Word Index from API is 1-based usually
                       const isHighlighted = activeWordIndex === (wIdx + 1);
                       // Try to get specific script text, fallback to uthmani, then basic text
                       const scriptKey = `text_${settings.arabicScript}`;
                       // @ts-ignore - dynamic key access
                       const scriptText = word[scriptKey] || word.text_uthmani || word.text;
                       
                       return (
                         <div key={wIdx} className="inline-flex flex-col items-center justify-start mx-1.5 mb-2 group/word" dir="rtl">
                           <span 
                            className={`transition-colors duration-200 ${isHighlighted ? (theme === 'dark' ? 'bg-emerald-900/50 text-emerald-400 rounded px-1' : 'bg-emerald-100 text-emerald-900 rounded px-1') : (theme === 'dark' ? 'hover:text-emerald-400' : 'hover:text-emerald-700')}`}
                            style={{ fontSize: `${settings.arabicFontSize}px`, color: isHighlighted ? undefined : (theme === 'dark' ? '#f8fafc' : '#000000') }}
                            dangerouslySetInnerHTML={{ __html: scriptText }}
                           />
                           {settings.showWordByWord && word.translation?.text && (
                               <span className={`text-[11px] font-sans mt-1 text-center leading-tight max-w-[80px] break-words ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`} dir="ltr">
                                   {word.translation.text}
                               </span>
                           )}
                         </div>
                       );
                    })
                  ) : (
                    <span style={{ fontSize: `${settings.arabicFontSize}px`, color: theme === 'dark' ? '#f8fafc' : '#000000' }} dangerouslySetInnerHTML={{ __html: ayah.text_arabic }} />
                  )}
                </div>

                {/* Translation */}
                {settings.showTranslation && (
                  <div 
                    className={`font-khmer leading-loose text-left mt-6 pt-4 border-t ${theme === 'dark' ? 'text-slate-400 border-slate-800' : 'text-gray-600 border-gray-50'}`}
                    style={{ fontSize: `${settings.translationFontSize}px` }}
                  >
                    {ayah.translations?.[0]?.text}
                  </div>
                )}

                {/* Inline Tafsir with Highlight */}
                {settings.showTafsirInline && ayah.tafsir && (
                  <div className={`mt-6 p-5 rounded-xl border text-sm font-khmer leading-loose animate-in fade-in slide-in-from-top-2 duration-300 ${isTtsPlaying ? (theme === 'dark' ? 'bg-violet-900/20 border-violet-900/50 text-slate-300' : 'bg-violet-50 border-violet-200 text-gray-700') : (theme === 'dark' ? 'bg-slate-800/50 border-slate-800 text-slate-300' : 'bg-gray-50 border-gray-100 text-gray-700')}`}>
                    <div className={`flex items-center gap-2 mb-3 font-bold text-xs uppercase tracking-wider ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>
                      <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className="w-3 h-3" /> ការអធិប្បាយ
                    </div>
                    
                    {/* Render Tafsir Words with Highlight */}
                    <div>
                       {tafsirWords.map((word, idx) => (
                           <span 
                            key={idx}
                            className={`transition-colors duration-200 ${idx === activeTafsirWordIndex ? (theme === 'dark' ? 'bg-violet-900/50 text-violet-300' : 'bg-violet-200 text-violet-900') : ''}`}
                           >
                               {word}
                           </span>
                       ))}
                    </div>
                  </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
});
