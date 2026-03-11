import React, { useState, useEffect, useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlayIcon, PauseIcon, Download01Icon, Cancel01Icon, MoreHorizontalIcon, VolumeHighIcon, VolumeOffIcon, NextIcon, PreviousIcon, ArrowRight01Icon, ArrowLeft01Icon, RepeatIcon, UserIcon } from '@hugeicons/core-free-icons';
import { Surah } from './types';
import { getQdcChapterAudioData, RECITERS } from './api';
import { useToast } from '@/contexts/ToastContext';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useQuery } from '@tanstack/react-query';

export interface GlobalAudioPlayerProps {
  surahs: Surah[];
  playingSurahId: number | null;
  setPlayingSurahId: (id: number | null) => void;
  playingReciter: any | null;
  setPlayingReciter: (reciter: any | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  isSidebarCollapsed: boolean;
}

export const GlobalAudioPlayer: React.FC<GlobalAudioPlayerProps> = ({
  surahs,
  playingSurahId,
  setPlayingSurahId,
  playingReciter,
  setPlayingReciter,
  isPlaying,
  setIsPlaying,
  isSidebarCollapsed
}) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const { setExternalAudioPlaying, isPlaying: isGlobalPlaying, togglePlay: toggleGlobalPlay } = useAudioPlayer();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
// ...
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<'main' | 'speed' | 'reciter'>('main');
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const playingSurah = surahs.find(s => s.id === playingSurahId);

  const { data: audioData, isSuccess, isError } = useQuery({
    queryKey: ['chapterAudio', playingReciter?.id, playingSurahId],
    queryFn: () => getQdcChapterAudioData(playingReciter!.id, playingSurahId!),
    enabled: !!playingSurahId && !!playingReciter,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (isSuccess && audioData && audioData.audio_url) {
      setAudioUrl(audioData.audio_url);
    } else if (isSuccess && (!audioData || !audioData.audio_url)) {
      showToast('មិនមានសំឡេងសម្រាប់ជំពូកនេះទេ', 'error');
      setPlayingSurahId(null);
      setIsPlaying(false);
    }
  }, [isSuccess, audioData, showToast, setPlayingSurahId, setIsPlaying]);

  useEffect(() => {
    if (isError) {
      showToast('មានបញ្ហាក្នុងការទាញយកសំឡេង', 'error');
      setPlayingSurahId(null);
      setIsPlaying(false);
    }
  }, [isError, showToast, setPlayingSurahId, setIsPlaying]);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            if (e.name !== 'AbortError') {
              console.error("Playback error", e);
              showToast('មិនអាចលេងសំឡេងបានទេ (Playback error)', 'error');
              setIsPlaying(false);
            }
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [audioUrl, isPlaying]);

  useEffect(() => {
    setExternalAudioPlaying(isPlaying);
    if (isPlaying && isGlobalPlaying) {
      toggleGlobalPlay();
    }
    return () => {
      setExternalAudioPlaying(false);
    };
  }, [isPlaying, isGlobalPlaying, setExternalAudioPlaying, toggleGlobalPlay]);

  useEffect(() => {
    if (isGlobalPlaying && isPlaying) {
      setIsPlaying(false);
    }
  }, [isGlobalPlaying, isPlaying, setIsPlaying]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
        setActiveSubMenu('main');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleEnded = () => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            if (e.name !== 'AbortError') {
              console.error("Playback error", e);
              showToast('មិនអាចលេងសំឡេងបានទេ (Playback error)', 'error');
              setIsPlaying(false);
            }
          });
        }
      }
    } else if (repeatMode === 'all') {
      handleNext();
    } else {
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (playingSurahId && playingSurahId < 114) {
      setPlayingSurahId(playingSurahId + 1);
      setIsPlaying(true);
    } else if (repeatMode === 'all') {
      setPlayingSurahId(1);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (playingSurahId && playingSurahId > 1) {
      setPlayingSurahId(playingSurahId - 1);
      setIsPlaying(true);
    } else if (repeatMode === 'all') {
      setPlayingSurahId(114);
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleDownload = async () => {
    if (!audioUrl || !playingSurah || !playingReciter) return;
    try {
      const proxyUrl = `/api/proxy-audio?url=${encodeURIComponent(audioUrl)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Network response was not ok');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${playingSurah.name_simple} - ${playingReciter.name}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setShowMoreMenu(false);
    } catch (error) {
      console.error("Download failed", error);
      window.open(audioUrl, '_blank');
    }
  };

  const handleRepeatToggle = () => {
    const modes: ('none' | 'one' | 'all')[] = ['none', 'one', 'all'];
    const nextMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    setActiveSubMenu('main');
  };

  const handleReciterChange = async (newReciter: any) => {
    setPlayingReciter(newReciter);
    setActiveSubMenu('main');
    setShowMoreMenu(false);
  };

  const handleVolumeToggle = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (!playingSurahId || !playingReciter) return null;

  return (
    <>
      <div className={`fixed bottom-0 left-0 right-0 ${isSidebarCollapsed ? 'md:left-20' : 'md:left-[21rem]'} border-t shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50 animate-in slide-in-from-bottom-full duration-300 transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
        {/* Progress Bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 group ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`}>
          <div 
            className="h-full bg-[#2ca4a8] relative"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          >
            <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}></div>
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
        
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-32 md:w-48 shrink-0">
            <div className={`w-10 h-10 rounded-full overflow-hidden shrink-0 border hidden sm:flex items-center justify-center font-bold text-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
              {playingReciter.image ? (
                <img referrerPolicy="no-referrer" src={playingReciter.image || undefined} alt={playingReciter.name} className="w-full h-full object-cover" />
              ) : (
                <span>{playingReciter.name.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <h4 className={`font-bold text-sm truncate font-khmer ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>{playingSurah?.name_khmer || playingSurah?.name_simple}</h4>
              <p className={`text-xs truncate ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>{playingReciter.name}</p>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center gap-2 md:gap-4 relative">
            
            {/* More Menu */}
            <div className="relative flex items-center justify-center" ref={moreMenuRef}>
              <button 
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.5} className="w-5 h-5" />
              </button>
              
              {showMoreMenu && (
                <div className={`absolute bottom-full left-0 sm:left-1/2 sm:-translate-x-1/2 mb-2 w-64 rounded-2xl shadow-xl border py-2 animate-in fade-in slide-in-from-bottom-2 duration-200 z-50 overflow-hidden flex flex-col max-h-[60vh] ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
                  {activeSubMenu === 'main' && (
                    <>
                      <button onClick={handleDownload} className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-sm ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-50 text-gray-700'}`}>
                        <HugeiconsIcon icon={Download01Icon} strokeWidth={1.5} className="w-4 h-4" /> Download
                      </button>
                      <button onClick={handleRepeatToggle} className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-sm ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-50 text-gray-700'}`}>
                        <div className="relative">
                          <HugeiconsIcon icon={RepeatIcon} strokeWidth={1.5} className={`w-4 h-4 ${repeatMode !== 'none' ? 'text-emerald-600' : ''}`} />
                          {repeatMode === 'one' && (
                            <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[8px] font-bold w-3 h-3 rounded-full flex items-center justify-center">1</span>
                          )}
                        </div>
                        Repeat: {repeatMode === 'none' ? 'Off' : repeatMode === 'one' ? 'One' : 'All'}
                      </button>
                      <div className={`h-px my-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`}></div>
                      <button onClick={() => setActiveSubMenu('speed')} className={`w-full px-4 py-3 flex items-center justify-between transition-colors text-sm ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-50 text-gray-700'}`}>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs w-4">{playbackRate}x</span> Speed
                        </div>
                        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className={`w-4 h-4 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`} />
                      </button>
                      <button onClick={() => setActiveSubMenu('reciter')} className={`w-full px-4 py-3 flex items-center justify-between transition-colors text-sm ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-50 text-gray-700'}`}>
                        <div className="flex items-center gap-3">
                          <HugeiconsIcon icon={UserIcon} strokeWidth={1.5} className="w-4 h-4" /> Reciter
                        </div>
                        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className={`w-4 h-4 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`} />
                      </button>
                    </>
                  )}
                  
                  {activeSubMenu === 'speed' && (
                    <>
                      <button onClick={() => setActiveSubMenu('main')} className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-sm font-bold border-b shrink-0 ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-300 border-slate-800' : 'hover:bg-gray-50 text-gray-700 border-gray-100'}`}>
                        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-4 h-4" /> Back
                      </button>
                      <div className="overflow-y-auto custom-scrollbar">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                          <button key={speed} onClick={() => handleSpeedChange(speed)} className={`w-full px-4 py-3 flex items-center justify-between transition-colors text-sm ${playbackRate === speed ? (theme === 'dark' ? 'text-emerald-400 font-bold bg-emerald-900/30' : 'text-emerald-600 font-bold bg-emerald-50/50') : (theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-gray-700 hover:bg-gray-50')}`}>
                            {speed}x
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {activeSubMenu === 'reciter' && (
                    <>
                      <button onClick={() => setActiveSubMenu('main')} className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-sm font-bold border-b shrink-0 ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-300 border-slate-800' : 'hover:bg-gray-50 text-gray-700 border-gray-100'}`}>
                        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-4 h-4" /> Select Reciter
                      </button>
                      <div className="overflow-y-auto custom-scrollbar">
                        {RECITERS.map(r => (
                          <button key={r.id} onClick={() => handleReciterChange(r)} className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-sm text-left ${playingReciter.id === r.id ? (theme === 'dark' ? 'text-emerald-400 font-bold bg-emerald-900/30' : 'text-emerald-600 font-bold bg-emerald-50/50') : (theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-gray-700 hover:bg-gray-50')}`}>
                            <img referrerPolicy="no-referrer" src={r.image || undefined} alt={r.name} className="w-6 h-6 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=0D8ABC&color=fff&size=256`; }} />
                            <span className="truncate">{r.name}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <button onClick={handleVolumeToggle} className={`p-1.5 rounded-full transition-colors hidden sm:block ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'}`}>
              <HugeiconsIcon icon={isMuted ? VolumeOffIcon : VolumeHighIcon} strokeWidth={1.5} className="w-5 h-5" />
            </button>

            <button onClick={handlePrev} className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'}`}>
              <HugeiconsIcon icon={PreviousIcon} strokeWidth={1.5} className="w-5 h-5" />
            </button>
            
            <button 
              onClick={handlePlayPause}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-md shrink-0 ${theme === 'dark' ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-black text-white hover:bg-gray-800'}`}
            >
              {isPlaying ? (
                <HugeiconsIcon icon={PauseIcon} strokeWidth={1.5} className="w-5 h-5 fill-current" />
              ) : (
                <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
            
            <button onClick={handleNext} className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'}`}>
              <HugeiconsIcon icon={NextIcon} strokeWidth={1.5} className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-4 shrink-0 w-32 md:w-48 justify-end">
            <div className={`text-xs font-mono text-right ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            <button 
              onClick={() => {
                setPlayingSurahId(null);
                setIsPlaying(false);
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.removeAttribute('src');
                  audioRef.current.load();
                }
              }}
              className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'text-slate-500 hover:text-red-400 hover:bg-red-900/20' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <audio 
        ref={audioRef} 
        src={audioUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={handleEnded}
        className="hidden"
      />
    </>
  );
};
