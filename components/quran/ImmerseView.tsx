import { LanguageCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, PreviousIcon, NextIcon, PlayIcon, PauseIcon, TextIcon, BookOpen01Icon, Settings01Icon, ArrowDown01Icon } from '@hugeicons/core-free-icons';

import React, { useState, useEffect, useRef } from 'react';

import { Ayah, Surah, QuranSettings } from './types';

interface ImmerseViewProps {
  surah: Surah;
  verses: Ayah[];
  currentIndex: number;
  isPlaying: boolean;
  onClose: () => void;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  settings: QuranSettings;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export const ImmerseView: React.FC<ImmerseViewProps> = ({
  surah, verses, currentIndex, isPlaying, onClose,
  onPlayPause, onNext, onPrev, settings, audioRef
}) => {
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTafsir, setShowTafsir] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const currentAyah = verses[currentIndex] || verses[0];

  // Sync Audio Progress
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, [audioRef, currentIndex]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio && duration) {
      const newTime = (parseFloat(e.target.value) / 100) * duration;
      audio.currentTime = newTime;
      setProgress(parseFloat(e.target.value));
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="fixed inset-0 md:left-20 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom duration-500">
      
      {/* Background Ambience (Optional Gradient) */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-100 opacity-50 z-0 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-6 mt-safe">
        <button onClick={onClose} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100/50 rounded-full transition-colors">
          <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={1.5} className="w-8 h-8" />
        </button>
        <div className="text-center">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">កំពុងចាក់</span>
          <h2 className="font-bold text-gray-900 font-khmer text-sm">{surah.name_khmer}</h2>
        </div>
        <button className="p-2 -mr-2 text-gray-400 hover:text-gray-600">
          <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.5} className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-8 overflow-y-auto no-scrollbar">
        
        {/* Ayah Display Container */}
        <div className="w-full max-w-2xl mx-auto text-center space-y-8 my-auto">
          
          {/* Arabic Text */}
          <div 
            className={`font-uthman-hafs-v17 text-gray-900 leading-[2.5] tracking-wide transition-all duration-500`}
            style={{ fontSize: '42px' }}
            dir="rtl"
          >
            {currentAyah.text_arabic}
          </div>

          {/* Translation Area */}
          {showTranslation && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <p className="text-gray-600 font-khmer text-lg leading-relaxed">
                {currentAyah.translations?.[0]?.text}
              </p>
            </div>
          )}

          {/* Tafsir Area (Scrollable if long) */}
          {showTafsir && currentAyah.tafsir && (
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-gray-100/50 shadow-sm text-left max-h-60 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-3 text-emerald-700 font-bold text-xs uppercase tracking-wider sticky top-0 bg-white/0">
                <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className="w-4 h-4" /> ការអធិប្បាយ
              </div>
              <p className="text-gray-700 font-khmer text-base leading-loose">
                {currentAyah.tafsir.text}
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Controls Footer */}
      <div className="relative z-10 bg-white/80 backdrop-blur-lg border-t border-gray-100 pb-8 pt-6 px-6 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-xl mx-auto w-full">
          
          {/* Toggles Row */}
          <div className="flex justify-between items-center mb-8 px-4">
             <button 
               onClick={() => setShowTranslation(!showTranslation)}
               className={`flex flex-col items-center gap-1 transition-colors ${showTranslation ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
             >
               <HugeiconsIcon icon={LanguageCircleIcon} strokeWidth={1.5} className="w-6 h-6" />
               <span className="text-[10px] font-bold">បកប្រែ</span>
             </button>

             <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-gray-900">Ayah {currentAyah.verse_number}</span>
                <span className="text-[10px] text-gray-400">នៃ {surah.verses_count}</span>
             </div>

             <button 
               onClick={() => setShowTafsir(!showTafsir)}
               className={`flex flex-col items-center gap-1 transition-colors ${showTafsir ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
             >
               <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className="w-6 h-6" />
               <span className="text-[10px] font-bold">Tafsir</span>
             </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6 space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={progress || 0}
              onChange={handleSeek}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 hover:accent-emerald-500 transition-all"
            />
            <div className="flex justify-between text-xs font-medium text-gray-400 font-mono px-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-between px-2">
            <button onClick={onPrev} className="p-4 text-gray-800 hover:text-emerald-600 transition-colors active:scale-90 transform">
              <HugeiconsIcon icon={PreviousIcon} strokeWidth={1.5} className="w-8 h-8 fill-current" />
            </button>

            <button
              onClick={onPlayPause}
              className="w-20 h-20 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-200 hover:scale-105 hover:bg-emerald-500 transition-all active:scale-95"
            >
              {isPlaying ? (
                <HugeiconsIcon icon={PauseIcon} strokeWidth={1.5} className="w-8 h-8 fill-current" />
              ) : (
                <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} className="w-8 h-8 ml-1 fill-current" />
              )}
            </button>

            <button onClick={onNext} className="p-4 text-gray-800 hover:text-emerald-600 transition-colors active:scale-90 transform">
              <HugeiconsIcon icon={NextIcon} strokeWidth={1.5} className="w-8 h-8 fill-current" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
