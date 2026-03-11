import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, FilterIcon, PlayIcon, Clock01Icon, MoreVerticalIcon, FavouriteIcon, Playlist01Icon, ArrowLeft01Icon, ShuffleIcon, PauseIcon, CloudUploadIcon, Add01Icon, RefreshIcon } from '@hugeicons/core-free-icons';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';

import { SPEAKERS, TRACKS, PLAYLISTS, CATEGORIES, Track, Playlist, Speaker } from './data';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

export const ListenView: React.FC = () => {
  const { showToast } = useToast();
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  
  const { profile, user } = useAuth();
  
  // Audio State from Context
  const { 
      currentTrack, 
      isPlaying, 
      playTrack, 
      playPlaylist, 
      togglePlay 
  } = useAudioPlayer();
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadMetadata, setUploadMetadata] = useState({
    title: '',
    speakerName: '',
    category: 'General'
  });
  const [uploadCover, setUploadCover] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [tracks, setTracks] = useState<Track[]>(TRACKS);
  const [playlists, setPlaylists] = useState<Playlist[]>(PLAYLISTS);
  const [speakers, setSpeakers] = useState<Speaker[]>(SPEAKERS);
  
  const [showAllSpeakers, setShowAllSpeakers] = useState(false);
  const [showAllPlaylists, setShowAllPlaylists] = useState(false);
  const [showAllTracks, setShowAllTracks] = useState(false);

  // Fetch Audio Posts from Supabase
  useEffect(() => {
    const fetchAudioPosts = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:user_id (
              full_name,
              avatar_url
            )
          `)
          .or('extra_data->>originalType.eq.audio,extra_data->>originalType.eq.voice')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const fetchedTracks: Track[] = [];
          const fetchedPlaylists: Playlist[] = [];
          const speakerMap = new Map<string, Speaker>();
          
          data.forEach(post => {
            let postTracks: Track[] = [];
            const speakerId = post.user_id;
            const speakerName = post.profiles?.full_name || 'Unknown Speaker';
            const speakerAvatar = post.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(speakerName)}&background=0d9488&color=fff`;

            // Check if it has audioData structure (from VoiceInput)
            if (post.extra_data?.audioData?.tracks) {
               const audioData = post.extra_data.audioData;
               audioData.tracks.forEach((t: any) => {
                  const track = {
                      id: t.id || post.id, // Use track ID or post ID
                      title: t.title || audioData.title || post.content || 'Untitled Audio',
                      speakerId: speakerId,
                      speakerName: audioData.speakerName || speakerName,
                      duration: t.duration || 0,
                      url: t.url,
                      cover: t.cover || speakerAvatar,
                      category: 'General', // Default category for now
                      date: post.created_at.split('T')[0]
                  };
                  fetchedTracks.push(track);
                  postTracks.push(track);
               });
               
               // If post has >= 2 tracks, make it a playlist
               if (postTracks.length >= 2) {
                   fetchedPlaylists.push({
                       id: post.id,
                       title: audioData.title || post.content || 'Playlist',
                       description: post.content || '',
                       trackCount: postTracks.length,
                       cover: postTracks[0].cover,
                       gradient: 'from-emerald-800 to-teal-900', // Default gradient
                       tracks: postTracks
                   });
               }
            } 
            // Fallback for simple audio posts (if any)
            else if (post.media_urls && post.media_urls.length > 0) {
               post.media_urls.forEach((url: string, idx: number) => {
                  const track = {
                      id: `${post.id}-${idx}`,
                      title: post.content || 'Audio Post',
                      speakerId: speakerId,
                      speakerName: speakerName,
                      duration: 0,
                      url: url,
                      cover: speakerAvatar,
                      category: 'General',
                      date: post.created_at.split('T')[0]
                  };
                  fetchedTracks.push(track);
                  postTracks.push(track);
               });
               
               if (postTracks.length >= 2) {
                   fetchedPlaylists.push({
                       id: post.id,
                       title: post.content || 'Playlist',
                       description: post.content || '',
                       trackCount: postTracks.length,
                       cover: postTracks[0].cover,
                       gradient: 'from-emerald-800 to-teal-900',
                       tracks: postTracks
                   });
               }
            }

            // Update Speaker Map
            if (postTracks.length > 0) {
                if (speakerMap.has(speakerId)) {
                    const existing = speakerMap.get(speakerId)!;
                    existing.lectureCount += postTracks.length;
                } else {
                    speakerMap.set(speakerId, {
                        id: speakerId,
                        name: speakerName,
                        avatar: speakerAvatar,
                        role: post.profiles?.role || 'Speaker',
                        lectureCount: postTracks.length
                    });
                }
            }
          });

          // Sort speakers by lectureCount descending
          const fetchedSpeakers = Array.from(speakerMap.values()).sort((a, b) => b.lectureCount - a.lectureCount);

          setTracks([...fetchedTracks, ...TRACKS]);
          setPlaylists([...fetchedPlaylists, ...PLAYLISTS]);
          setSpeakers(fetchedSpeakers.length > 0 ? fetchedSpeakers : SPEAKERS);
        }
      } catch (error) {
        console.error('Error fetching audio posts:', error);
      }
    };

    fetchAudioPosts();
  }, []);

  const canUpload = profile?.role === 'admin';

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show modal to get metadata before uploading
    setShowUploadModal(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const formData = new FormData();
          formData.append('image', file);
          
          try {
              const baseUrl = '';
              const response = await fetch(`${baseUrl}/api/upload-image`, { method: 'POST', body: formData });
              if (!response.ok) {
                  const contentType = response.headers.get('content-type');
                  if (contentType && contentType.includes('application/json')) {
                      const errorData = await response.json();
                      throw new Error(errorData.error || 'Failed to upload cover');
                  } else {
                      throw new Error(`Server returned an error (${response.status}). The file might be too large.`);
                  }
              }
              const contentType = response.headers.get('content-type');
              if (!contentType || !contentType.includes('application/json')) {
                  const text = await response.text();
                  console.error('Non-JSON success response:', text.substring(0, 200));
                  throw new Error(`Server returned an invalid response. Content-Type: ${contentType}`);
              }
              const data = await response.json();
              if (data.success) {
                  const url = `/api/image/${data.fileId}`;
                  setUploadCover(url);
              } else {
                  showToast('បរាជ័យក្នុងការបញ្ចូលរូបគម្រប', 'error');
              }
          } catch (error) {
              console.error(error);
              showToast('មានបញ្ហាក្នុងការបញ្ចូលរូបគម្រប', 'error');
          }
      }
  };

  const confirmUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    if (!uploadMetadata.title || !uploadMetadata.speakerName) {
        showToast('សូមបញ្ចូលចំណងជើង និងឈ្មោះវាគ្មិន', 'info');
        return;
    }

    setIsUploading(true);
    setShowUploadModal(false);
    
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('title', uploadMetadata.title);
    formData.append('speakerName', uploadMetadata.speakerName);
    formData.append('category', uploadMetadata.category);

    try {
      const baseUrl = '';
      const response = await fetch(`${baseUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to upload audio');
          } else {
              throw new Error(`Server returned an error (${response.status}). The file might be too large.`);
          }
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON success response:', text.substring(0, 200));
          throw new Error(`Server returned an invalid response. Content-Type: ${contentType}`);
      }
      const data = await response.json();
      
      if (data.success) {
        showToast(`ការបញ្ចូលបានជោគជ័យ!`, 'success');
        
        const newTrack: Track = {
            id: data.fileId,
            title: uploadMetadata.title,
            speakerId: user?.id || 'uploaded',
            speakerName: uploadMetadata.speakerName,
            duration: 0,
            cover: uploadCover || 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?q=80&w=400&auto=format&fit=crop',
            url: `/api/audio/${data.fileId}`,
            category: uploadMetadata.category,
            date: new Date().toISOString().split('T')[0]
        };

        if (user && supabase) {
            const audioData = {
                type: 'playlist',
                title: uploadMetadata.title,
                speakerName: uploadMetadata.speakerName,
                tracks: [{
                    id: data.fileId,
                    fileId: data.fileId,
                    url: `/api/audio/${data.fileId}`,
                    duration: 0,
                    title: uploadMetadata.title,
                    cover: uploadCover || 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?q=80&w=400&auto=format&fit=crop',
                }]
            };

            await supabase.from('posts').insert({
                user_id: user.id,
                content: uploadMetadata.title,
                type: 'text',
                extra_data: {
                    originalType: 'audio',
                    audioData: audioData
                }
            });
        }
        
        setTracks(prev => [newTrack, ...prev]);
        // Play the new track
        playTrack(newTrack);
        
        // Reset metadata
        setUploadMetadata({ title: '', speakerName: '', category: 'General' });
        setUploadCover(null);
      } else {
        showToast(`ការបញ្ចូលបរាជ័យ: ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('ការបញ្ចូលបរាជ័យ។ សូមពិនិត្យមើល console សម្រាប់ព័ត៌មានលម្អិត។', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  // Main Discovery Filter
  const filteredTracks = tracks.filter(track => {
    const matchesCategory = activeCategory === 'All' || track.category === activeCategory;
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          track.speakerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTrackSelect = (track: Track) => {
    // If it's the current track, toggle play
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      // Otherwise play the track (and set it as the playlist context if needed, 
      // but here we might want to set the whole list as playlist?)
      // For now, let's just play the track and maybe set the current filtered list as playlist
      // so next/prev works.
      playPlaylist(filteredTracks, filteredTracks.findIndex(t => t.id === track.id));
    }
  };

  const handlePlaylistSelect = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.tracks.length > 0) {
        playPlaylist(playlist.tracks, 0);
    }
  };

  return (
    <div className={`min-h-screen pb-32 animate-in fade-in duration-300 ${theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-white text-gray-900'}`}>
      
      {/* 1. PLAYLIST DETAIL VIEW */}
      {selectedPlaylist ? (
        <div className="animate-in slide-in-from-right duration-300">
            {/* Header / Nav */}
            <div className={`relative pt-4 pb-12 px-6 bg-gradient-to-b ${selectedPlaylist.gradient} text-white`}>
                <button 
                    onClick={() => setSelectedPlaylist(null)}
                    className="absolute top-4 left-4 p-2 bg-black/20 hover:bg-black/30 rounded-full backdrop-blur-sm transition-colors"
                >
                    <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-6 h-6" />
                </button>
                
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mt-8 max-w-4xl mx-auto">
                    {/* Cover Art */}
                    <div className="w-48 h-48 rounded-2xl shadow-2xl overflow-hidden shrink-0">
                        <img referrerPolicy="no-referrer" src={selectedPlaylist.cover} alt={selectedPlaylist.title} className="w-full h-full object-cover" />
                    </div>
                    
                    {/* Info */}
                    <div className="text-center md:text-left flex-1">
                        <span className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2 block">Playlist</span>
                        <h1 className="text-3xl md:text-5xl font-bold font-khmer mb-3 leading-tight">{selectedPlaylist.title}</h1>
                        <p className="text-white/80 font-khmer text-sm mb-4 leading-relaxed max-w-lg">{selectedPlaylist.description}</p>
                        
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <button 
                                onClick={() => handlePlayPlaylist(selectedPlaylist)}
                                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full font-bold shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-transform active:scale-95"
                            >
                                <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} className="w-5 h-5 fill-current" /> Play All
                            </button>
                            <button className={`p-3 rounded-full backdrop-blur-sm transition-colors ${theme === 'dark' ? 'bg-slate-800/50 hover:bg-slate-700/50 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                                <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} className="w-5 h-5" />
                            </button>
                            <button className={`p-3 rounded-full backdrop-blur-sm transition-colors ${theme === 'dark' ? 'bg-slate-800/50 hover:bg-slate-700/50 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                                <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={1.5} className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Track List */}
            <div className={`max-w-4xl mx-auto px-4 py-6 -mt-6 rounded-t-3xl min-h-[50vh] ${theme === 'dark' ? 'bg-slate-950' : 'bg-white'}`}>
                <div className="space-y-1">
                    {selectedPlaylist.tracks.map((track, idx) => (
                        <div 
                            key={track.id}
                            onClick={() => {
                                // Play this track within the context of the playlist
                                playPlaylist(selectedPlaylist.tracks, idx);
                            }}
                            className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors group ${currentTrack?.id === track.id ? (theme === 'dark' ? 'bg-emerald-900/20' : 'bg-emerald-50') : (theme === 'dark' ? 'hover:bg-slate-900' : 'hover:bg-gray-50')}`}
                        >
                            <div className={`w-8 text-center text-sm font-medium group-hover:text-emerald-600 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
                                {currentTrack?.id === track.id && isPlaying ? (
                                    <div className="flex gap-0.5 items-end justify-center h-3">
                                        <span className="w-0.5 bg-emerald-500 animate-[music-bar_0.6s_ease-in-out_infinite] h-2"></span>
                                        <span className="w-0.5 bg-emerald-500 animate-[music-bar_0.8s_ease-in-out_infinite] h-3"></span>
                                        <span className="w-0.5 bg-emerald-500 animate-[music-bar_1.0s_ease-in-out_infinite] h-1"></span>
                                    </div>
                                ) : (
                                    idx + 1
                                )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h4 className={`font-bold font-khmer text-sm truncate ${currentTrack?.id === track.id ? 'text-emerald-600' : (theme === 'dark' ? 'text-slate-200' : 'text-gray-900')}`}>
                                    {track.title}
                                </h4>
                                <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>{track.speakerName}</p>
                            </div>

                            <span className={`text-xs font-mono ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
                                {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                            </span>
                            
                            <button className="text-gray-300 hover:text-gray-600 p-2">
                                <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={1.5} className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    
                    {selectedPlaylist.tracks.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <HugeiconsIcon icon={Playlist01Icon} strokeWidth={1.5} className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>មិនមានបទចម្រៀងក្នុងបញ្ជីនេះទេ</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      ) : (
        /* 2. MAIN DISCOVERY VIEW */
        <>
            {/* Header & Search */}
            <div className="bg-white sticky top-0 z-20 px-4 pt-4 pb-2">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 relative group">
                    <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="ស្វែងរកបាឋកថា ឬវាគ្មិន..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-sm outline-none transition-all font-khmer"
                    />
                    </div>
                    <button className="p-3 bg-gray-50 rounded-2xl text-gray-600 hover:bg-gray-100 transition-colors">
                    <HugeiconsIcon icon={FilterIcon} strokeWidth={1.5} className="w-5 h-5" />
                    </button>
                    
                    {/* Upload Button */}
                    <>
                        <input 
                            type="file" 
                            accept="audio/*" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleUpload}
                        />
                        <button 
                            onClick={() => {
                                if (!canUpload) {
                                    showToast('អធ្យាស្រ័យ បច្ចុប្បន្ន មុខងារសំឡេង សម្រាប់តែ admin ទេ', 'info');
                                    return;
                                }
                                fileInputRef.current?.click();
                            }}
                            disabled={isUploading}
                            className={`p-3 rounded-2xl transition-colors flex items-center gap-2 ${isUploading ? 'bg-emerald-100 text-emerald-400' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                            title="Upload Audio to Telegram"
                        >
                            <HugeiconsIcon icon={CloudUploadIcon} strokeWidth={1.5} className={`w-5 h-5 ${isUploading ? 'animate-pulse' : ''}`} />
                        </button>
                    </>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all font-khmer ${
                            activeCategory === cat 
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                                : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        {cat}
                    </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 py-2 space-y-8">
                
                {/* Speakers / Stories */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 font-khmer">វាគ្មិនពេញនិយម</h2>
                    {speakers.length > 5 && (
                        <span 
                            onClick={() => setShowAllSpeakers(!showAllSpeakers)}
                            className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                        >
                            {showAllSpeakers ? 'បង្រួម' : 'មើលទាំងអស់'}
                        </span>
                    )}
                    </div>
                    <div className={`flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 ${showAllSpeakers ? 'flex-wrap' : ''}`}>
                    {(showAllSpeakers ? speakers : speakers.slice(0, 5)).map(speaker => (
                        <div key={speaker.id} className="flex flex-col items-center gap-2 group cursor-pointer min-w-[80px]">
                            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-emerald-400 to-teal-500 group-hover:scale-105 transition-transform">
                                <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                                <img referrerPolicy="no-referrer" src={speaker.avatar} alt={speaker.name} className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <span className="text-xs font-medium text-gray-700 text-center line-clamp-1 w-full font-khmer">{speaker.name}</span>
                        </div>
                    ))}
                    </div>
                </section>

                {/* Recommended / Featured */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 font-khmer">សម្រាប់អ្នក</h2>
                        {filteredTracks.length > 6 && (
                            <span 
                                onClick={() => setShowAllTracks(!showAllTracks)}
                                className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                            >
                                {showAllTracks ? 'បង្រួម' : 'មើលទាំងអស់'}
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(showAllTracks ? filteredTracks : filteredTracks.slice(0, 6)).map((track, idx) => (
                        <div 
                            key={track.id}
                            onClick={() => handleTrackSelect(track)}
                            className={`group relative bg-white border border-gray-100 rounded-2xl p-3 flex gap-4 hover:shadow-lg transition-all cursor-pointer ${currentTrack?.id === track.id ? 'border-emerald-200 bg-emerald-50/30' : ''}`}
                        >
                            {/* Image */}
                            <div className="w-24 h-24 rounded-xl overflow-hidden relative shrink-0">
                                <img referrerPolicy="no-referrer" src={track.cover} alt={track.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity ${currentTrack?.id === track.id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                <div className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm">
                                    {currentTrack?.id === track.id && isPlaying ? <div className="flex gap-0.5 items-end h-3"><span className="w-1 bg-emerald-600 animate-[music-bar_1s_ease-in-out_infinite] h-2"></span><span className="w-1 bg-emerald-600 animate-[music-bar_1.2s_ease-in-out_infinite] h-3"></span><span className="w-1 bg-emerald-600 animate-[music-bar_0.8s_ease-in-out_infinite] h-1"></span></div> : <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} className="w-4 h-4 text-emerald-600 ml-0.5 fill-current" />}
                                </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="flex justify-between items-start">
                                <h3 className={`font-bold text-base leading-tight font-khmer line-clamp-2 mb-1 ${currentTrack?.id === track.id ? 'text-emerald-700' : 'text-gray-900 group-hover:text-emerald-700'}`}>
                                    {track.title}
                                </h3>
                                <button className="text-gray-400 hover:text-gray-900 p-1"><HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={1.5} className="w-4 h-4" /></button>
                                </div>
                                <p className="text-xs text-gray-500 font-medium mb-3">{track.speakerName}</p>
                                
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                    {track.category}
                                </span>
                                <span className="flex items-center gap-1">
                                    <HugeiconsIcon icon={Clock01Icon} strokeWidth={1.5} className="w-3 h-3" /> {Math.floor(track.duration / 60)} min
                                </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
                </section>

                {/* Playlists / Collections */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 font-khmer">បញ្ជីចាក់ (Playlists)</h2>
                    {playlists.length > 4 && (
                        <span 
                            onClick={() => setShowAllPlaylists(!showAllPlaylists)}
                            className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                        >
                            {showAllPlaylists ? 'បង្រួម' : 'មើលទាំងអស់'}
                        </span>
                    )}
                    </div>
                    <div className={`flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 ${showAllPlaylists ? 'flex-wrap' : ''}`}>
                    {(showAllPlaylists ? playlists : playlists.slice(0, 4)).map((playlist) => (
                        <div 
                            key={playlist.id} 
                            onClick={() => handlePlaylistSelect(playlist)}
                            className="relative w-40 md:w-48 aspect-square rounded-2xl overflow-hidden cursor-pointer group shrink-0 shadow-md"
                        >
                            <img referrerPolicy="no-referrer" src={playlist.cover} alt={playlist.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className={`absolute inset-0 bg-gradient-to-t ${playlist.gradient} opacity-80 group-hover:opacity-90 transition-opacity`}></div>
                            
                            <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                                <div className="self-end">
                                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                    <HugeiconsIcon icon={Playlist01Icon} strokeWidth={1.5} className="w-4 h-4 fill-current" />
                                </div>
                                </div>
                                <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 flex items-center gap-1 mb-1">
                                    {playlist.trackCount} Tracks
                                </span>
                                <h3 className="font-bold font-khmer leading-tight text-lg shadow-sm">{playlist.title}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
                </section>

                {/* Just for vertical spacing filler */}
                <div className="h-20"></div>
            </div>
        </>
      )}

      {/* Upload Metadata Modal */}
      {showUploadModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 font-khmer">ព័ត៌មានសំឡេង</h3>
                      
                      <input 
                          type="file" 
                          ref={coverInputRef} 
                          onChange={handleCoverUpload} 
                          accept="image/*" 
                          className="hidden" 
                      />

                      <div className="flex gap-4 mb-4">
                          {/* Cover Image Upload */}
                          <div 
                              onClick={() => coverInputRef.current?.click()}
                              className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 hover:border-emerald-300 transition-colors shrink-0 overflow-hidden relative group"
                          >
                              {uploadCover ? (
                                  <>
                                      <img referrerPolicy="no-referrer" src={uploadCover} alt="Cover" className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                          <HugeiconsIcon icon={RefreshIcon} strokeWidth={1.5} className="w-6 h-6 text-white" />
                                      </div>
                                  </>
                              ) : (
                                  <>
                                      <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} className="w-6 h-6 mb-1" />
                                      <span className="text-[10px] font-bold text-center px-1">រូបភាព</span>
                                  </>
                              )}
                          </div>

                          <div className="flex-1 space-y-4">
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">ចំណងជើង</label>
                                  <input 
                                      type="text" 
                                      value={uploadMetadata.title}
                                      onChange={(e) => setUploadMetadata({...uploadMetadata, title: e.target.value})}
                                      placeholder="បញ្ចូលចំណងជើង..."
                                      className="w-full px-4 py-2.5 bg-gray-50 border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/10 rounded-xl text-sm outline-none transition-all font-khmer"
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">ឈ្មោះវាគ្មិន</label>
                                  <input 
                                      type="text" 
                                      value={uploadMetadata.speakerName}
                                      onChange={(e) => setUploadMetadata({...uploadMetadata, speakerName: e.target.value})}
                                      placeholder="ឈ្មោះវាគ្មិន..."
                                      className="w-full px-4 py-2.5 bg-gray-50 border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/10 rounded-xl text-sm outline-none transition-all font-khmer"
                                  />
                              </div>
                          </div>
                      </div>

                      <div className="space-y-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">ប្រភេទ</label>
                              <select 
                                  value={uploadMetadata.category}
                                  onChange={(e) => setUploadMetadata({...uploadMetadata, category: e.target.value})}
                                  className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/10 rounded-xl text-sm outline-none transition-all font-khmer appearance-none"
                              >
                                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                                      <option key={cat} value={cat}>{cat}</option>
                                  ))}
                              </select>
                          </div>
                      </div>
                  </div>
                  <div className="p-4 bg-gray-50 flex gap-3">
                      <button 
                          onClick={() => {
                              setShowUploadModal(false);
                              setUploadCover(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                              if (coverInputRef.current) coverInputRef.current.value = '';
                          }}
                          className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors font-khmer"
                      >
                          បោះបង់
                      </button>
                      <button 
                          onClick={confirmUpload}
                          className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-colors font-khmer"
                      >
                          យល់ព្រម
                      </button>
                  </div>
              </div>
          </div>
      )}

      <style>{`
         @keyframes music-bar {
            0%, 100% { height: 40%; }
            50% { height: 100%; }
         }
      `}</style>
    </div>
  );
};
