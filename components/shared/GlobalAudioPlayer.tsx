import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  PlayIcon, 
  PauseIcon, 
  PreviousIcon, 
  NextIcon, 
  Cancel01Icon,
  VolumeHighIcon
} from '@hugeicons/core-free-icons';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { useTheme } from '@/contexts/ThemeContext';

export const GlobalAudioPlayer: React.FC = () => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    closePlayer, 
    currentTime, 
    duration, 
    seek,
    playNext,
    playPrevious,
    hasNext,
    hasPrevious,
    isExternalAudioPlaying
  } = useAudioPlayer();
  const { theme } = useTheme();

  if (!currentTrack || isExternalAudioPlaying) return null;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    seek(time);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 md:left-20 border-t shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50 animate-in slide-in-from-bottom-full duration-300 transition-all ${
      theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'
    }`}>
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 dark:bg-slate-800 group">
        <div 
          className="h-full bg-emerald-500 relative"
          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-600 rounded-full shadow translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        <input 
          type="range" 
          min="0" 
          max={duration || 100} 
          value={currentTime} 
          onChange={handleSeek}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 w-32 md:w-48 shrink-0">
          <div className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 border hidden sm:flex items-center justify-center font-bold text-sm ${
            theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-gray-50 border-gray-100 text-gray-500'
          }`}>
            {currentTrack.cover ? (
              <img 
                referrerPolicy="no-referrer" 
                src={currentTrack.cover} 
                alt={currentTrack.title} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <HugeiconsIcon icon={VolumeHighIcon} strokeWidth={2} className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className={`font-bold text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {currentTrack.title}
            </h4>
            <p className={`text-xs truncate ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
              {currentTrack.artist || 'Unknown Artist'}
            </p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex-1 flex items-center justify-center gap-2 md:gap-4">
          <button 
            onClick={playPrevious}
            disabled={!hasPrevious}
            className={`p-1.5 rounded-full transition-colors ${
              hasPrevious 
                ? (theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100')
                : (theme === 'dark' ? 'text-slate-700 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed')
            }`}
          >
            <HugeiconsIcon icon={PreviousIcon} strokeWidth={1.5} className="w-5 h-5" />
          </button>
          
          <button 
            onClick={togglePlay}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-md shrink-0 ${
              theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isPlaying ? (
              <HugeiconsIcon icon={PauseIcon} strokeWidth={1.5} className="w-5 h-5 fill-current" />
            ) : (
              <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
          
          <button 
            onClick={playNext}
            disabled={!hasNext}
            className={`p-1.5 rounded-full transition-colors ${
              hasNext 
                ? (theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100')
                : (theme === 'dark' ? 'text-slate-700 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed')
            }`}
          >
            <HugeiconsIcon icon={NextIcon} strokeWidth={1.5} className="w-5 h-5" />
          </button>
        </div>
        
        {/* Right Actions */}
        <div className="flex items-center gap-4 shrink-0 w-32 md:w-48 justify-end">
          <div className={`text-xs font-mono text-right ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          <button 
            onClick={closePlayer}
            className={`p-1.5 rounded-full transition-colors ${
              theme === 'dark' ? 'text-slate-400 hover:text-red-400 hover:bg-red-900/20' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
            }`}
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
