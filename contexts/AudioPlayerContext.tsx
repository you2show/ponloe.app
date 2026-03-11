import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

export interface Track {
  id: string;
  url: string;
  title: string;
  artist?: string;
  speakerName?: string; // Add speakerName to match data.ts
  cover?: string;
  duration?: number;
  category?: string;
  date?: string;
  speakerId?: string;
}

interface AudioPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  playlist: Track[];
  currentTrackIndex: number;
  playTrack: (track: Track) => void;
  playPlaylist: (tracks: Track[], startIndex?: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlay: () => void;
  closePlayer: () => void;
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
  hasNext: boolean;
  hasPrevious: boolean;
  isExternalAudioPlaying: boolean;
  setExternalAudioPlaying: (playing: boolean) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExternalAudioPlaying, setExternalAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPlayedUrlRef = useRef<string | null>(null);

  // Initialize audio ref
  if (!audioRef.current && typeof Audio !== 'undefined') {
    audioRef.current = new Audio();
  }

  const playTrack = useCallback((track: Track) => {
    setExternalAudioPlaying(false);
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      const existingIndex = playlist.findIndex(t => t.id === track.id);
      if (existingIndex !== -1) {
        setCurrentTrackIndex(existingIndex);
        setCurrentTrack(track);
        setIsPlaying(true);
      } else {
        setPlaylist([track]);
        setCurrentTrackIndex(0);
        setCurrentTrack(track);
        setIsPlaying(true);
      }
    }
  }, [currentTrack, playlist]);

  const playPlaylist = useCallback((tracks: Track[], startIndex = 0) => {
    setExternalAudioPlaying(false);
    setPlaylist(tracks);
    setCurrentTrackIndex(startIndex);
    setCurrentTrack(tracks[startIndex]);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    if (currentTrack) {
      if (!isPlaying) {
        setExternalAudioPlaying(false);
      }
      setIsPlaying(prev => !prev);
    }
  }, [currentTrack, isPlaying]);

  const closePlayer = useCallback(() => {
    setCurrentTrack(null);
    setPlaylist([]);
    setCurrentTrackIndex(-1);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        lastPlayedUrlRef.current = null;
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // Use refs to access latest state in event handlers without re-binding
  const playlistRef = useRef(playlist);
  const currentTrackIndexRef = useRef(currentTrackIndex);
  
  useEffect(() => {
      playlistRef.current = playlist;
      currentTrackIndexRef.current = currentTrackIndex;
  }, [playlist, currentTrackIndex]);

  const playNext = useCallback(() => {
    const currentList = playlistRef.current;
    const currentIndex = currentTrackIndexRef.current;
    
    if (currentIndex < currentList.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentTrackIndex(nextIndex);
      setCurrentTrack(currentList[nextIndex]);
      setIsPlaying(true);
    } else {
        // Loop or stop? For now stop or loop to start? 
        // Let's loop if it's a playlist, or just stop.
        // If we want to loop:
        // const nextIndex = 0;
        // setCurrentTrackIndex(nextIndex);
        // setCurrentTrack(currentList[nextIndex]);
        // setIsPlaying(true);
        setIsPlaying(false);
    }
  }, []);

  const playPrevious = useCallback(() => {
    const currentList = playlistRef.current;
    const currentIndex = currentTrackIndexRef.current;

    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentTrackIndex(prevIndex);
      setCurrentTrack(currentList[prevIndex]);
      setIsPlaying(true);
    }
  }, []);

  const hasNext = currentTrackIndex < playlist.length - 1;
  const hasPrevious = currentTrackIndex > 0;

  useEffect(() => {
    if (isExternalAudioPlaying && isPlaying) {
      setIsPlaying(false);
    }
  }, [isExternalAudioPlaying, isPlaying]);

  // Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      playNext();
    };
    const handleError = (e: Event) => {
        console.error("Audio playback error:", e);
        showToast('មិនអាចលេងសំឡេងបានទេ (Playback error)', 'error');
        setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [playNext]); 

  // Handle Source Change and Play/Pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Only update src if it changed to avoid reloading
    if (currentTrack && lastPlayedUrlRef.current !== currentTrack.url) {
        console.log("Setting audio source:", currentTrack.url);
        audio.src = currentTrack.url;
        audio.load();
        lastPlayedUrlRef.current = currentTrack.url;
    }

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          if (e.name !== 'AbortError') {
            console.error("Playback failed", e.message);
            showToast('ការលេងសំឡេងបានបរាជ័យ', 'error');
            setIsPlaying(false);
          }
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  return (
    <AudioPlayerContext.Provider value={{
      currentTrack,
      isPlaying,
      playlist,
      currentTrackIndex,
      playTrack,
      playPlaylist,
      playNext,
      playPrevious,
      togglePlay,
      closePlayer,
      currentTime,
      duration,
      seek,
      hasNext,
      hasPrevious,
      isExternalAudioPlaying,
      setExternalAudioPlaying
    }}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};
