import { HugeiconsIcon } from '@hugeicons/react';
import { PlayIcon, PauseIcon, PreviousIcon, NextIcon, VolumeHighIcon, Maximize01Icon, ArrowDown01Icon, RepeatIcon, ShuffleIcon, ListViewIcon, FavouriteIcon, Moon01Icon, DashboardSpeed01Icon, Download01Icon, Share01Icon, AlertCircleIcon, Cancel01Icon, VolumeOffIcon } from '@hugeicons/core-free-icons';

import React, { useRef, useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

export const Player: React.FC<{ className?: string }> = ({ className }) => {
  const { showToast } = useToast();
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    playNext, 
    playPrevious, 
    playlist, 
    playTrack,
    currentTime: contextCurrentTime,
    duration: contextDuration,
    seek,
    closePlayer
  } = useAudioPlayer();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Local state for UI controls (functionality to be implemented in context later)
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showExpandedPlaylist, setShowExpandedPlaylist] = useState(false);
  
  // We use context for time, but for smooth seeking we might want local state or just use context
  // The context updates currentTime frequently.
  
  // Calculate progress from context
  useEffect(() => {
      if (contextDuration > 0) {
          setProgress((contextCurrentTime / contextDuration) * 100);
      } else {
          setProgress(0);
      }
  }, [contextCurrentTime, contextDuration]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newProgress = parseFloat(e.target.value);
      setProgress(newProgress);
      const newTime = (newProgress / 100) * contextDuration;
      seek(newTime);
  };

  const toggleSpeed = () => {
      showToast("មុខងារប្តូរល្បឿននឹងមកដល់ឆាប់ៗនេះ", "info");
  };

  const toggleRepeat = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRepeatMode(prev => {
      if (prev === 'none') return 'all';
      if (prev === 'all') return 'one';
      return 'none';
    });
  };

  const toggleShuffle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShuffle(!isShuffle);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const togglePlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPlaylist(!showPlaylist);
  };

  const toggleExpandedPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playlist.length < 2) {
       showToast("មិនមានបញ្ជីចាក់ទេ", "info");
       return;
    }
    setShowExpandedPlaylist(!showExpandedPlaylist);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    if (val > 0 && isMuted) setIsMuted(false);
    if (val === 0) setIsMuted(true);
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentTrack) return null;

  // Minimized Floating Action Button (FAB) View
  if (isMinimized && !isExpanded) {
    const size = 64;
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-[90px] md:bottom-8 right-4 z-50 cursor-pointer group animate-in zoom-in duration-300"
      >
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Progress Circle SVG */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-md" viewBox={`0 0 ${size} ${size}`}>
            {/* Track Background */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="white" // Fill background white to hide content behind
              stroke="#e5e7eb" // gray-200
              strokeWidth={strokeWidth}
            />
            {/* Progress Indicator */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#10b981" // emerald-500
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          
          {/* Spinning Image Container */}
          <div className={`w-[52px] h-[52px] rounded-full overflow-hidden relative z-10 ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`}>
            <img referrerPolicy="no-referrer" src={currentTrack.cover} className="w-full h-full object-cover" alt="cover" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
               <HugeiconsIcon icon={Maximize01Icon} strokeWidth={2} className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Close Button on FAB */}
        <button 
            onClick={(e) => {
              e.stopPropagation();
              closePlayer();
            }}
            className="absolute -top-1 -right-1 bg-gray-900 text-white rounded-full p-1 shadow-md scale-0 group-hover:scale-100 transition-transform z-20"
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="w-3 h-3" />
        </button>
      </div>
    );
  }

  const miniPlayerClasses = "fixed bottom-[80px] md:bottom-6 left-2 right-2 md:left-24 md:right-6 md:w-auto md:translate-x-0 bg-white/90 backdrop-blur-md border border-gray-200 p-2 pr-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-3 z-40 cursor-pointer md:cursor-default animate-in slide-in-from-bottom duration-300 group";
  
  const expandedPlayerClasses = "fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom duration-300 md:static md:w-full md:h-auto md:bg-transparent md:z-auto md:animate-none";

  const activeClasses = isExpanded ? expandedPlayerClasses : (className || miniPlayerClasses);

  return (
    <>
      {/* Main Player Container */}
      <div 
        onClick={() => {
          // Only allow expansion on mobile
          if (window.innerWidth < 768 && !isExpanded) {
            setIsExpanded(true);
          }
        }}
        className={activeClasses}
      >
        
        {/* Mini Player Content */}
        {!isExpanded && (
          <>
            {/* Playlist Popover (Connected to Player) */}
            {showPlaylist && (
              <div 
                className="absolute bottom-full right-0 w-80 h-[calc(100vh-86px)] bg-white rounded-t-2xl rounded-b-none border border-gray-200 border-b-0 flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden cursor-default z-[60]"
                onClick={e => e.stopPropagation()}
              >
                 {/* Header */}
                 <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                       <HugeiconsIcon icon={ListViewIcon} strokeWidth={1.5} className="w-4 h-4 text-emerald-600" />
                       Playlist
                    </h3>
                    <span className="text-xs text-gray-400 font-mono">{playlist.length} tracks</span>
                 </div>

                 {/* Track List */}
                 <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    {playlist.length === 0 ? (
                       <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-xs">
                          <p>No tracks in queue</p>
                       </div>
                    ) : (
                       playlist.map((track, index) => {
                          const isCurrent = currentTrack.id === track.id;
                          return (
                             <div 
                                key={`${track.id}-${index}`}
                                onClick={() => playTrack(track)}
                                className={`group/track flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors ${isCurrent ? 'bg-emerald-50' : 'hover:bg-gray-50'}`}
                             >
                                {/* Image with Play Overlay */}
                                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                                   <img referrerPolicy="no-referrer" src={track.cover} className="w-full h-full object-cover" alt={track.title} />
                                   <div className={`absolute inset-0 bg-black/30 flex items-center justify-center ${isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover/track:opacity-100'} transition-opacity`}>
                                      {isCurrent && isPlaying ? (
                                         <div className="w-3 h-3 bg-white rounded-sm animate-pulse"></div>
                                      ) : (
                                         <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} className="w-5 h-5 text-white fill-current" />
                                      )}
                                   </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                   <h4 className={`text-sm font-bold truncate font-khmer ${isCurrent ? 'text-emerald-700' : 'text-gray-900'}`}>{track.title}</h4>
                                   <p className="text-xs text-gray-500 truncate">{track.speakerName}</p>
                                </div>

                                {/* Duration */}
                                <span className="text-xs text-gray-400 font-mono">
                                   {formatTime(track.duration || 0)}
                                </span>
                             </div>
                          );
                       })
                    )}
                 </div>
              </div>
            )}

            {/* Close Button (Absolute) */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                closePlayer();
              }}
              className="absolute -top-2 -right-2 bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-100 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-50"
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-4 h-4" />
            </button>

            {/* Minimize Button (Absolute Left) */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(true);
              }}
              className="absolute -top-2 -left-2 bg-white text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 border border-gray-100 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-50"
              title="Minimize"
            >
              <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={1.5} className="w-4 h-4" />
            </button>

            {/* Progress Bar Top */}
            <div className="absolute top-0 left-4 right-4 h-[2px] bg-gray-100 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>

            <div className={`w-12 h-12 rounded-xl bg-gray-100 overflow-hidden relative shrink-0 ${isPlaying ? 'animate-pulse' : ''}`}>
               <img referrerPolicy="no-referrer" src={currentTrack.cover} className="w-full h-full object-cover" alt="cover" />
               <div className="absolute inset-0 bg-black/10"></div>
            </div>
            
            <div className="flex-1 min-w-0">
               <h4 className="font-bold text-gray-900 text-sm truncate font-khmer">{currentTrack.title}</h4>
               <p className="text-xs text-gray-500 truncate">{error ? <span className="text-red-500">{error}</span> : currentTrack.speakerName}</p>
            </div>

            {/* Controls Container */}
            <div className="flex items-center gap-3 md:gap-6" onClick={e => e.stopPropagation()}>
               
               {/* Left Controls (Volume, Shuffle) - Desktop Only */}
               <div className="hidden md:flex items-center gap-3">
                   {/* Volume */}
                   <div className="flex items-center gap-2 group/volume">
                      <button onClick={toggleMute} className="text-gray-400 hover:text-gray-900">
                         {isMuted || volume === 0 ? <HugeiconsIcon icon={VolumeOffIcon} strokeWidth={1.5} className="w-5 h-5" /> : <HugeiconsIcon icon={VolumeHighIcon} strokeWidth={1.5} className="w-5 h-5" />}
                      </button>
                      <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300">
                         <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={isMuted ? 0 : volume} 
                            onChange={handleVolumeChange} 
                            className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" 
                         />
                      </div>
                   </div>

                   {/* Shuffle */}
                   <button onClick={toggleShuffle} className={`${isShuffle ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-900'}`}>
                      <HugeiconsIcon icon={ShuffleIcon} strokeWidth={1.5} className="w-5 h-5" />
                   </button>
               </div>

               {/* Center Controls (Prev, Play, Next) */}
               <div className="flex items-center gap-3">
                   <button onClick={playPrevious} className="text-gray-400 hover:text-gray-900 hidden sm:block"><HugeiconsIcon icon={PreviousIcon} strokeWidth={1.5} className="w-5 h-5 fill-current" /></button>
                   <button 
                      onClick={togglePlay}
                      className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 hover:scale-105 transition-transform"
                   >
                      {isPlaying ? <HugeiconsIcon icon={PauseIcon} strokeWidth={1.5} className="w-5 h-5 fill-current" /> : <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} className="w-5 h-5 ml-0.5 fill-current" />}
                   </button>
                   <button onClick={playNext} className="text-gray-400 hover:text-gray-900"><HugeiconsIcon icon={NextIcon} strokeWidth={1.5} className="w-5 h-5 fill-current" /></button>
               </div>

               {/* Right Controls (Repeat, Playlist) - Desktop Only */}
               <div className="hidden md:flex items-center gap-3">
                   {/* Repeat */}
                   <button onClick={toggleRepeat} className={`${repeatMode !== 'none' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-900'} relative`}>
                      <HugeiconsIcon icon={RepeatIcon} strokeWidth={1.5} className="w-5 h-5" />
                      {repeatMode === 'one' && <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-emerald-100 text-emerald-700 px-0.5 rounded">1</span>}
                   </button>

                   {/* Playlist */}
                   <button onClick={togglePlaylist} className={`${showPlaylist ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-900'}`}>
                      <HugeiconsIcon icon={ListViewIcon} strokeWidth={1.5} className="w-5 h-5" />
                   </button>
               </div>

            </div>
          </>
        )}

        {/* Expanded Player Content */}
        {isExpanded && (
          <div className="w-full h-full flex flex-col">
             
             {/* Header */}
             <div className="flex items-center justify-between p-4 mt-safe">
                <button onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full">
                   <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={1.5} className="w-6 h-6" />
                </button>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Now Playing</span>
                <button className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-full">
                   <MoreHorizontal className="w-5 h-5" />
                </button>
             </div>

             {/* Main Content */}
             {!showExpandedPlaylist && (
             <div className="flex-1 flex flex-col items-center justify-center px-6 pb-4 animate-in fade-in duration-300">
                
                {/* Cover Art */}
                <div className="w-full max-w-[280px] aspect-square bg-gray-100 rounded-2xl shadow-xl overflow-hidden mb-6 relative">
                   <img referrerPolicy="no-referrer" src={currentTrack.cover} className="w-full h-full object-cover" alt="Full Cover" />
                   {/* Decorative Glow */}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>

                {/* Title Info */}
                <div className="w-full max-w-sm flex justify-between items-end mb-4">
                   <div className="flex-1 min-w-0 pr-4">
                      <h2 className="text-xl font-bold text-gray-900 font-khmer leading-tight mb-1 truncate">{currentTrack.title}</h2>
                      <p className="text-base text-emerald-600 font-medium truncate">{currentTrack.speakerName}</p>
                   </div>
                   <button className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors shrink-0">
                      <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} className="w-6 h-6" />
                   </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="w-full max-w-sm mb-4 bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm border border-red-100">
                        <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={1.5} className="w-4 h-4" /> {error}
                    </div>
                )}

                {/* Progress Bar */}
                <div className="w-full max-w-sm mb-6 space-y-2">
                   <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={progress}
                      onChange={handleSeek}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 hover:accent-emerald-500"
                   />
                   <div className="flex justify-between text-xs font-bold text-gray-400 font-mono">
                      <span>{formatTime(contextCurrentTime)}</span>
                      <span>{formatTime(contextDuration)}</span>
                   </div>
                </div>

                {/* Controls */}
                <div className="w-full max-w-sm flex items-center justify-between mb-6">
                   <button className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"><HugeiconsIcon icon={ShuffleIcon} strokeWidth={1.5} className="w-5 h-5" /></button>
                   
                   <div className="flex items-center gap-4">
                      <button onClick={(e) => { e.stopPropagation(); playPrevious(); }} className="p-2 text-gray-800 hover:text-emerald-600 transition-colors transform hover:-translate-x-1">
                         <HugeiconsIcon icon={PreviousIcon} strokeWidth={1.5} className="w-8 h-8 fill-current" />
                      </button>
                      
                      <button 
                         onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                         className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-200 hover:scale-105 hover:bg-emerald-500 transition-all active:scale-95"
                      >
                         {isPlaying ? <HugeiconsIcon icon={PauseIcon} strokeWidth={1.5} className="w-7 h-7 fill-current" /> : <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} className="w-7 h-7 ml-1 fill-current" />}
                      </button>

                      <button onClick={(e) => { e.stopPropagation(); playNext(); }} className="p-2 text-gray-800 hover:text-emerald-600 transition-colors transform hover:translate-x-1">
                         <HugeiconsIcon icon={NextIcon} strokeWidth={1.5} className="w-8 h-8 fill-current" />
                      </button>
                   </div>

                   <button className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"><HugeiconsIcon icon={RepeatIcon} strokeWidth={1.5} className="w-5 h-5" /></button>
                </div>
             </div>
             )}

             {/* Playlist View */}
             {showExpandedPlaylist && (
                <div className="flex-1 w-full overflow-hidden flex flex-col animate-in fade-in duration-300 px-4 pb-4">
                   <div className="flex items-center justify-between mb-4 px-2">
                      <h3 className="font-bold text-lg text-gray-900 font-khmer">បញ្ជីចាក់ ({playlist.length})</h3>
                      <button onClick={() => setShowExpandedPlaylist(false)} className="text-emerald-600 text-sm font-bold">បិទ</button>
                   </div>
                   <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-200">
                      {playlist.map((track, index) => {
                          const isCurrent = currentTrack.id === track.id;
                          return (
                             <div 
                                key={`${track.id}-${index}`}
                                onClick={(e) => { e.stopPropagation(); playTrack(track); }}
                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${isCurrent ? 'bg-emerald-50 border border-emerald-100' : 'hover:bg-gray-50 border border-transparent'}`}
                             >
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-200">
                                   <img referrerPolicy="no-referrer" src={track.cover} className="w-full h-full object-cover" alt={track.title} />
                                   {isCurrent && (
                                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                         <div className="w-4 h-4 bg-white rounded-sm animate-pulse"></div>
                                      </div>
                                   )}
                                </div>
                                <div className="flex-1 min-w-0">
                                   <h4 className={`text-sm font-bold truncate font-khmer ${isCurrent ? 'text-emerald-700' : 'text-gray-900'}`}>{track.title}</h4>
                                   <p className="text-xs text-gray-500 truncate">{track.speakerName}</p>
                                </div>
                                <span className="text-xs text-gray-400 font-mono">{formatTime(track.duration || 0)}</span>
                             </div>
                          );
                       })}
                   </div>
                </div>
             )}

                {/* Extra Features (Pro Features) */}
                <div className="w-full max-w-sm flex items-center justify-between px-2 pb-6">
                   <button 
                      onClick={toggleExpandedPlaylist}
                      className={`flex flex-col items-center gap-1 transition-colors ${playlist.length < 2 ? 'text-gray-300 cursor-not-allowed' : (showExpandedPlaylist ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-900')}`}
                      disabled={playlist.length < 2}
                   >
                      <div className={`p-2 rounded-full ${showExpandedPlaylist ? 'bg-emerald-100' : 'bg-gray-50 hover:bg-emerald-50'}`}>
                         <HugeiconsIcon icon={ListViewIcon} strokeWidth={1.5} className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold">Playlist</span>
                   </button>

                   <button 
                      onClick={(e) => { e.stopPropagation(); toggleSpeed(); }}
                      className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 transition-colors"
                   >
                      <div className="p-2 rounded-full bg-gray-50 hover:bg-emerald-50 relative">
                         <HugeiconsIcon icon={DashboardSpeed01Icon} strokeWidth={1.5} className="w-5 h-5" />
                         <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[8px] px-1 rounded-full font-bold">{playbackSpeed}x</span>
                      </div>
                      <span className="text-[10px] font-bold">Speed</span>
                   </button>

                   <button 
                      onClick={(e) => { e.stopPropagation(); showToast("មុខងារទាញយកនឹងមកដល់ឆាប់ៗនេះ", "info"); }}
                      className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 transition-colors"
                   >
                      <div className="p-2 rounded-full bg-gray-50 hover:bg-emerald-50">
                         <HugeiconsIcon icon={Download01Icon} strokeWidth={1.5} className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold">Save</span>
                   </button>

                   <button 
                      className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 transition-colors"
                   >
                      <div className="p-2 rounded-full bg-gray-50 hover:bg-emerald-50">
                         <HugeiconsIcon icon={Share01Icon} strokeWidth={1.5} className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold">Share</span>
                   </button>
                </div>

             {/* Drawer Handle / Up Next Hint - Removed as requested implicitly by replacing with playlist view */}

          </div>
        )}
      </div>
    </>
  );
};

// Helper for icons
const MoreHorizontal = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
  </svg>
);
