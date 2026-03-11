import React, { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlayIcon, PauseIcon } from '@hugeicons/core-free-icons';
import { useToast } from '@/contexts/ToastContext';
import { useAudioPlayer, Track } from '@/contexts/AudioPlayerContext';

interface WaveformPlayerProps {
  url: string;
  title?: string;
  artist?: string;
  cover?: string;
  waveform?: number[];
  colorClass?: string;
  activeColorClass?: string;
  buttonColorClass?: string;
  buttonIconColorClass?: string;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  playlist?: Track[];
  trackIndex?: number;
}

export const WaveformPlayer: React.FC<WaveformPlayerProps> = ({
  url,
  title,
  artist,
  cover,
  waveform = [],
  colorClass = 'bg-rose-200',
  activeColorClass = 'bg-rose-400',
  buttonColorClass = 'bg-rose-500 hover:bg-rose-600',
  buttonIconColorClass = 'text-white',
  isPlaying: externalIsPlaying,
  onPlayPause,
  playlist,
  trackIndex,
}) => {
  const { showToast } = useToast();
  const { 
    currentTrack, 
    isPlaying: globalIsPlaying, 
    playTrack, 
    playPlaylist, 
    togglePlay: globalTogglePlay,
    currentTime: globalCurrentTime,
    duration: globalDuration,
    seek: globalSeek
  } = useAudioPlayer();
  const [internalIsPlaying, setInternalIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLDivElement>(null);

  const isCurrentTrack = currentTrack?.url === url;
  const isPlaying = externalIsPlaying !== undefined 
    ? externalIsPlaying 
    : (isCurrentTrack ? globalIsPlaying : internalIsPlaying);

  // Generate random waveform if none provided
  const displayWaveform = waveform.length > 0 
    ? waveform 
    : Array.from({ length: 30 }, () => Math.random() * 0.8 + 0.2);

  // Sync with global player
  useEffect(() => {
    if (isCurrentTrack) {
      setCurrentTime(globalCurrentTime);
      setDuration(globalDuration);
      if (globalDuration > 0) {
        setProgress((globalCurrentTime / globalDuration) * 100);
      }
    }
  }, [isCurrentTrack, globalCurrentTime, globalDuration]);

  useEffect(() => {
    if (audioRef.current && !isCurrentTrack) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            if (e.name === 'AbortError') {
              // Ignore AbortError which happens when pause() is called while play() is pending
              return;
            }
            console.error("Audio play error", e.message);
            if (e.name === 'NotSupportedError') {
              showToast('កម្មវិធីរុករករបស់អ្នកមិនគាំទ្រទម្រង់សំឡេងនេះទេ (ឧទាហរណ៍៖ Safari មិនគាំទ្រឯកសារ .ogg)។ សូមសាកល្បងប្រើ Chrome ឬ Firefox។', 'error');
            } else {
              showToast('មិនអាចផ្ទុកឯកសារសំឡេងបានទេ', 'error');
            }
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, url, isCurrentTrack]);

  const togglePlay = () => {
    if (onPlayPause) {
      onPlayPause();
    } else {
      if (isCurrentTrack) {
        globalTogglePlay();
      } else {
        if (playlist && playlist.length > 0 && trackIndex !== undefined) {
          playPlaylist(playlist, trackIndex);
        } else {
          // If playing locally or switching to global
          // For now, let's switch to global player context
          playTrack({
            id: url, // Using URL as ID for simplicity
            url,
            title: title || 'Unknown Title',
            artist: artist || 'Unknown Artist',
            cover,
          });
        }
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isCurrentTrack) {
      const current = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      setCurrentTime(current);
      if (dur > 0) {
        setDuration(dur);
        setProgress((current / dur) * 100);
      }
    }
  };

  const handleEnded = () => {
    setProgress(0);
    setCurrentTime(0);
    if (!onPlayPause && !isCurrentTrack) {
      setInternalIsPlaying(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (waveformRef.current) {
      const rect = waveformRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percent = clickX / rect.width;
      
      if (isCurrentTrack) {
        if (globalDuration > 0) {
          globalSeek(percent * globalDuration);
        }
      } else if (audioRef.current && audioRef.current.duration) {
        audioRef.current.currentTime = percent * audioRef.current.duration;
        setProgress(percent * 100);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full flex items-center gap-3">
      {/* Play Button with Cover Integration */}
      <button 
        onClick={togglePlay}
        className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all shrink-0 overflow-hidden group ${!cover ? buttonColorClass : 'bg-gray-200 dark:bg-slate-700'}`}
      >
        {cover ? (
          <>
            <img 
              src={cover} 
              alt={title || "Audio cover"} 
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className={`absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center`}>
              {isPlaying ? (
                <HugeiconsIcon icon={PauseIcon} strokeWidth={2} className="w-5 h-5 text-white fill-current" />
              ) : (
                <HugeiconsIcon icon={PlayIcon} strokeWidth={2} className="w-5 h-5 text-white fill-current ml-0.5" />
              )}
            </div>
          </>
        ) : (
          isPlaying ? (
            <HugeiconsIcon icon={PauseIcon} strokeWidth={1.5} className={`w-5 h-5 fill-current ${buttonIconColorClass}`} />
          ) : (
            <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} className={`w-5 h-5 fill-current ml-0.5 ${buttonIconColorClass}`} />
          )
        )}
      </button>

      <div className="flex-1 min-w-0">
        {/* Title and Artist */}
        {(title || artist) && (
          <div className="mb-2 px-1">
            {title && <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{title}</h4>}
            {artist && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{artist}</p>}
          </div>
        )}

        <div className="flex items-center gap-3 w-full">
          {/* Local Audio Element (only used if not current global track) */}
          {!isCurrentTrack && (
            <audio 
              ref={audioRef} 
              src={url || undefined} 
              crossOrigin="anonymous"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              onLoadedMetadata={(e) => {
                const target = e.target as HTMLAudioElement;
                setDuration(target.duration);
              }}
              onError={() => {
                // Silent failure for metadata loading to prevent console noise
                // Error toast is handled in play() catch block
              }}
              className="hidden"
            />
          )}

          <div className="flex-1 flex flex-col justify-center h-8">
            <div 
              ref={waveformRef}
              className="flex items-center gap-0.5 h-5 cursor-pointer w-full"
              onClick={handleSeek}
            >
              {displayWaveform.map((height, i) => {
                const barPercent = (i / displayWaveform.length) * 100;
                const isActive = barPercent <= progress;
                
                return (
                  <div 
                    key={i} 
                    className={`flex-1 rounded-full transition-colors duration-100 ${isActive ? activeColorClass : colorClass}`} 
                    style={{ 
                      height: `${Math.max(20, height * 100)}%`,
                    }}
                  ></div>
                );
              })}
            </div>
          </div>

          {/* Duration */}
          <div className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 w-8 text-right shrink-0">
            {formatTime(duration || 0)}
          </div>
        </div>
      </div>
    </div>
  );
};
