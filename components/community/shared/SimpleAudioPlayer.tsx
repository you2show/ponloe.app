import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlayIcon, PauseIcon, Loading02Icon } from '@hugeicons/core-free-icons';
import { useAudioPlayer, Track } from '@/contexts/AudioPlayerContext';
import { mediaService } from '@/src/services/mediaService';

interface SimpleAudioPlayerProps {
  url: string;
  title: string;
  artist: string;
  cover?: string;
  duration?: number; // Optional duration if available
  id?: string; // Optional ID, defaults to URL
  playlist?: Track[];
  index?: number;
}

export const SimpleAudioPlayer: React.FC<SimpleAudioPlayerProps> = ({
  url,
  title,
  artist,
  cover,
  duration,
  id,
  playlist,
  index
}) => {
  const { currentTrack, isPlaying, togglePlay, playTrack, playPlaylist } = useAudioPlayer();
  const [displayUrl, setDisplayUrl] = useState(url);
  const [isCheckingCache, setIsCheckingCache] = useState(false);
  
  const trackId = id || url;
  const isCurrentTrack = currentTrack?.id === trackId;
  const isActive = isCurrentTrack && isPlaying;

  useEffect(() => {
    const checkCache = async () => {
        if (!url) return;
        setIsCheckingCache(true);
        try {
            const cached = await mediaService.getMedia(url);
            if (cached) {
                const blobUrl = URL.createObjectURL(cached.blob);
                setDisplayUrl(blobUrl);
            } else {
                // If not cached, ensure we use the original URL
                setDisplayUrl(url);
            }
        } catch (e) {
            console.error("Cache check failed:", e);
            setDisplayUrl(url);
        } finally {
            setIsCheckingCache(false);
        }
    };
    checkCache();
    
    // Note: We don't revoke the blob URL here because it might be used by the global player
    // even after this component unmounts. Browser will clean up on page refresh.
  }, [url]);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentTrack) {
      togglePlay();
    } else {
      const trackToPlay = {
        id: trackId,
        url: displayUrl, // Use cached URL if available
        title,
        artist,
        cover,
        duration
      };

      if (playlist && typeof index === 'number') {
        // Update playlist with cached URLs if needed
        const updatedPlaylist = [...playlist];
        updatedPlaylist[index] = trackToPlay;
        playPlaylist(updatedPlaylist, index);
      } else {
        playTrack(trackToPlay);
      }
    }
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer group" onClick={handlePlay}>
      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-200 dark:bg-slate-600">
        {cover ? (
          <img src={cover} alt={title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            {isCheckingCache ? (
                <HugeiconsIcon icon={Loading02Icon} strokeWidth={2} className="w-5 h-5 animate-spin" />
            ) : (
                <HugeiconsIcon icon={PlayIcon} strokeWidth={2} className="w-5 h-5" />
            )}
          </div>
        )}
        <div className={`absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors ${isActive ? 'bg-black/40' : ''}`}>
           {isActive ? (
             <HugeiconsIcon icon={PauseIcon} strokeWidth={2} className="w-5 h-5 text-white fill-current" />
           ) : isCheckingCache ? (
             <HugeiconsIcon icon={Loading02Icon} strokeWidth={2} className="w-5 h-5 text-white animate-spin" />
           ) : (
             <HugeiconsIcon icon={PlayIcon} strokeWidth={2} className="w-5 h-5 text-white fill-current ml-0.5" />
           )}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-bold truncate ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>{title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{artist}</p>
      </div>
      
      {duration && (
        <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
          {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
        </span>
      )}
    </div>
  );
};
