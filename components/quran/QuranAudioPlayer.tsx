import { HugeiconsIcon } from '@hugeicons/react';
import { PlayIcon, PauseIcon, PreviousIcon, NextIcon } from '@hugeicons/core-free-icons';

import React from 'react';

import { Surah } from './types';

interface QuranAudioPlayerProps {
  surah: Surah;
  reciter: { id: number; name: string; image: string };
  isPlaying: boolean;
  currentAyahNumber: number | null;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onOpenReciterModal: () => void;
}

export const QuranAudioPlayer: React.FC<QuranAudioPlayerProps> = ({
  surah, reciter, isPlaying, currentAyahNumber, onTogglePlay, onNext, onPrev, onOpenReciterModal
}) => {
  if (currentAyahNumber === null) return null;

  return (
    <div className="bg-white border-t border-gray-200 p-2 md:p-3 sticky bottom-0 z-40 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom duration-300">
      <div className="max-w-3xl mx-auto flex items-center gap-2 md:gap-3">
        <button onClick={onOpenReciterModal} className="flex items-center gap-2 flex-1 min-w-0 text-left group transition-all">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border border-gray-100 group-hover:border-emerald-500 transition-colors relative shrink-0">
            <img referrerPolicy="no-referrer" src={reciter.image || undefined} alt={reciter.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-bold text-gray-900 truncate font-khmer leading-tight">{surah.name_khmer}</p>
            <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-gray-500 mt-0.5">
              <span className="truncate max-w-[100px] sm:max-w-[200px]">{reciter.name}</span>
              {currentAyahNumber !== null && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className="font-medium text-emerald-600">Ayah {currentAyahNumber}</span>
                </>
              )}
            </div>
          </div>
        </button>
        
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 justify-end">
          <button onClick={onPrev} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-gray-100 rounded-full transition-all">
            <HugeiconsIcon icon={PreviousIcon} strokeWidth={1.5} className="w-4 h-4 md:w-5 md:h-5 fill-current" />
          </button>
          <button onClick={onTogglePlay} className="w-8 h-8 md:w-10 md:h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md shadow-emerald-200 hover:bg-emerald-700 hover:scale-105 transition-all active:scale-95">
            {isPlaying ? <HugeiconsIcon icon={PauseIcon} strokeWidth={1.5} className="w-4 h-4 md:w-5 md:h-5 fill-current" /> : <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} className="w-4 h-4 md:w-5 md:h-5 ml-0.5 fill-current" />}
          </button>
          <button onClick={onNext} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-gray-100 rounded-full transition-all">
            <HugeiconsIcon icon={NextIcon} strokeWidth={1.5} className="w-4 h-4 md:w-5 md:h-5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};
