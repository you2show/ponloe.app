import { HugeiconsIcon } from '@hugeicons/react';
import { 
  MoreHorizontalIcon, 
  Tick01Icon, 
  Share01Icon, 
  Comment01Icon, 
  ThumbsUpIcon,
  Image01Icon,
  PlayCircleIcon,
  FavouriteIcon,
  Flag01Icon,
  Delete02Icon,
  PencilEdit01Icon,
  Bookmark01Icon,
  Calendar01Icon,
  Location01Icon
} from '@hugeicons/core-free-icons';

import React, { useState, useRef, useEffect } from 'react';
import { Post } from '../shared';
import { PostFooter } from './post-card/PostFooter';
import { PostMedia } from './post-card/PostMedia';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { mediaService } from '@/src/services/mediaService';

import { SimpleAudioPlayer } from '../shared/SimpleAudioPlayer';

interface PostCardProps {
  post: Post;
  onDelete?: (id: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onDelete }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = user?.id === post.user.id;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      checkIfSaved();
    }
  }, [user, post.id]);

  const checkIfSaved = async () => {
    if (!user || !supabase) return;
    try {
      const { data } = await supabase
        .from('saved_posts')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle();
      setIsSaved(!!data);
    } catch (e) {}
  };

  const handleSave = async () => {
    if (!user) {
      showToast('សូមចូលគណនីដើម្បីរក្សាទុក', 'error');
      return;
    }
    try {
      if (isSaved) {
        await supabase.from('saved_posts').delete().eq('post_id', post.id).eq('user_id', user.id);
        setIsSaved(false);
      } else {
        await supabase.from('saved_posts').insert({ post_id: post.id, user_id: user.id });
        setIsSaved(true);
        
        // Proactively cache media for offline use
        if (post.images && post.images.length > 0) {
            post.images.forEach(img => {
                const url = typeof img === 'string' ? img : img.url;
                mediaService.cacheMedia(url);
            });
        }
        
        const audioTracks = post.audioData?.tracks || post.extra_data?.audioData?.tracks;
        if (audioTracks && audioTracks.length > 0) {
            audioTracks.forEach((track: any) => {
                mediaService.cacheMedia(track.url);
            });
        }
      }
    } catch (e) {
      console.error('Error saving post:', e);
    }
    setShowMenu(false);
  };

  return (
    <div className="rounded-xl border shadow-sm mb-4 transition-colors duration-300 bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-800">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              referrerPolicy="no-referrer" 
              src={post.user.avatar} 
              alt={post.user.name} 
              className="w-10 h-10 rounded-full object-cover border border-gray-100" 
            />
            {post.user.isVerified && (
              <div className="absolute -right-1 -bottom-1 bg-blue-500 rounded-full p-0.5 border-2 border-white">
                <HugeiconsIcon icon={Tick01Icon} strokeWidth={2.5} className="w-2 h-2 text-white" />
              </div>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1">
              <h3 className="font-bold text-sm hover:underline cursor-pointer text-gray-900 dark:text-white">
                {post.user.name}
              </h3>
              {post.user.role === 'admin' && (
                <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Admin</span>
              )}
              
              {/* Feeling Display */}
              {(() => {
                  const feeling = post.feeling || post.extra_data?.feeling;
                  if (!feeling) return null;
                  return (
                    <span className="text-xs font-normal text-gray-500 dark:text-slate-400">
                       កំពុងមានអារម្មណ៍ {feeling.emoji} {feeling.name}
                    </span>
                  );
              })()}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                <span>{post.timestamp}</span>
                
                {/* Location Display */}
                {(() => {
                    const location = post.location || post.extra_data?.location;
                    if (!location) return null;
                    return (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-0.5">
                          <HugeiconsIcon icon={Location01Icon} strokeWidth={1.5} className="w-3 h-3" />
                          <span>{location}</span>
                        </div>
                      </>
                    );
                })()}
            </div>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full transition-colors hover:bg-gray-100 text-gray-500 dark:hover:bg-slate-800 dark:text-slate-400"
          >
            <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.5} className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 bg-white border-gray-100 text-gray-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
              <div className="p-2 space-y-1">
                <button 
                  onClick={handleSave}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-khmer rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  <HugeiconsIcon icon={Bookmark01Icon} strokeWidth={1.5} className={`w-5 h-5 ${isSaved ? 'text-emerald-500 fill-emerald-500' : ''}`} />
                  <span>{isSaved ? 'ដកចេញពីការរក្សាទុក' : 'រក្សាទុកការបង្ហោះ'}</span>
                </button>
                
                {isOwner && (
                  <>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-khmer rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-slate-700">
                      <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={1.5} className="w-5 h-5" />
                      <span>កែប្រែការបង្ហោះ</span>
                    </button>
                    <button 
                      onClick={() => {
                        if(window.confirm('តើអ្នកប្រាកដជាចង់លុបការបង្ហោះនេះមែនទេ?')) {
                          onDelete?.(post.id);
                        }
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-khmer rounded-xl transition-colors hover:bg-red-50 text-red-600 dark:hover:bg-red-900/30 dark:text-red-400"
                    >
                      <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.5} className="w-5 h-5" />
                      <span>លុបការបង្ហោះ</span>
                    </button>
                  </>
                )}
                
                {!isOwner && (
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-khmer rounded-xl transition-colors hover:bg-red-50 text-red-600 dark:hover:bg-red-900/30 dark:text-red-400">
                    <HugeiconsIcon icon={Flag01Icon} strokeWidth={1.5} className="w-5 h-5" />
                    <span>រាយការណ៍ការបង្ហោះ</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-[15px] leading-relaxed font-khmer whitespace-pre-wrap text-gray-800 dark:text-slate-200">
          {post.content}
        </p>
        
        {/* Event Data rendering */}
        {(() => {
          const eventData = (post as any).eventData || (post as any).extra_data?.eventData;
          
          if (!eventData) {
              if (post.type === 'event') {
                  return (
                      <div className="p-4 border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
                          មានបញ្ហាក្នុងការបង្ហាញទិន្នន័យព្រឹត្តិការណ៍ (Event data missing)
                      </div>
                  );
              }
              return null;
          }
          
          return (
            <div className="mt-4 rounded-xl overflow-hidden border border-orange-100 bg-orange-50/50 dark:border-slate-700 dark:bg-slate-800/50">
              {eventData?.coverImage && (
                <div className="w-full h-48 relative">
                  <img 
                    src={eventData.coverImage} 
                    alt="Event Cover" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h4 className="font-bold text-lg mb-2 text-orange-900 dark:text-white">
                  {eventData?.name || 'ព្រឹត្តិការណ៍'}
                </h4>
                <div className="space-y-2">
                  {(eventData?.date || eventData?.time) && (
                    <div className="flex items-center gap-2 text-sm text-orange-800 dark:text-slate-300">
                      <HugeiconsIcon icon={Calendar01Icon} strokeWidth={1.5} className="w-4 h-4" />
                      <span>
                        {eventData?.date} {eventData?.time && `ម៉ោង ${eventData.time}`}
                      </span>
                    </div>
                  )}
                  {eventData?.location && (
                    <div className="flex items-center gap-2 text-sm text-orange-800 dark:text-slate-300">
                      <HugeiconsIcon icon={Location01Icon} strokeWidth={1.5} className="w-4 h-4" />
                      <span>{eventData.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Media */}
      {(post.type === 'audio' || post.type === 'voice' || post.originalType === 'audio' || post.originalType === 'voice' || post.extra_data?.originalType === 'audio' || post.extra_data?.originalType === 'voice') ? (
          (post.audioData?.tracks && post.audioData.tracks.length > 0) ? (
            <div className="px-4 py-3 rounded-xl mx-4 mb-3 border bg-gray-50 border-gray-100 dark:bg-slate-800 dark:border-slate-700">
                {(() => {
                  const playlist = post.audioData.tracks.map(t => ({
                      id: t.id,
                      url: t.url,
                      title: t.title,
                      artist: t.artist,
                      cover: t.cover,
                      speakerName: t.artist
                  }));
                  return post.audioData.tracks.map((track, index) => (
                    <div key={track.id || index} className={index > 0 ? "mt-3 pt-3 border-t border-gray-200 dark:border-slate-700" : ""}>
                      <SimpleAudioPlayer 
                        url={track.url} 
                        title={track.title}
                        artist={track.artist}
                        cover={track.cover}
                        id={track.id}
                        playlist={playlist}
                        index={index}
                      />
                    </div>
                  ));
                })()}
            </div>
          ) : (post.extra_data?.audioData?.tracks && post.extra_data.audioData.tracks.length > 0) ? (
            <div className="px-4 py-3 rounded-xl mx-4 mb-3 border bg-gray-50 border-gray-100 dark:bg-slate-800 dark:border-slate-700">
                {(() => {
                  const playlist = post.extra_data.audioData.tracks.map((t: any) => ({
                      id: t.id,
                      url: t.url,
                      title: t.title,
                      artist: t.artist,
                      cover: t.cover,
                      speakerName: t.artist
                  }));
                  return post.extra_data.audioData.tracks.map((track: any, index: number) => (
                    <div key={track.id || index} className={index > 0 ? "mt-3 pt-3 border-t border-gray-200 dark:border-slate-700" : ""}>
                      <SimpleAudioPlayer 
                        url={track.url} 
                        title={track.title}
                        artist={track.artist}
                        cover={track.cover}
                        id={track.id}
                        playlist={playlist}
                        index={index}
                      />
                    </div>
                  ));
                })()}
            </div>
          ) : (post.images && post.images.length > 0) ? (
            <div className="px-4 py-3 rounded-xl mx-4 mb-3 border bg-gray-50 border-gray-100 dark:bg-slate-800 dark:border-slate-700">
                {(() => {
                  const playlist = post.images.map((image, index) => ({
                      id: typeof image === 'string' ? image : image.id || image.url,
                      url: typeof image === 'string' ? image : image.url,
                      title: post.audioData?.tracks?.[index]?.title || post.extra_data?.audioData?.tracks?.[index]?.title || `Audio ${index + 1}`,
                      artist: post.audioData?.tracks?.[index]?.artist || post.extra_data?.audioData?.tracks?.[index]?.artist || 'Unknown Artist',
                      cover: post.audioData?.tracks?.[index]?.cover || post.extra_data?.audioData?.tracks?.[index]?.cover,
                      speakerName: post.audioData?.tracks?.[index]?.artist || post.extra_data?.audioData?.tracks?.[index]?.artist || 'Unknown Artist'
                  }));
                  return post.images.map((image, index) => (
                    <div key={index} className={index > 0 ? "mt-3 pt-3 border-t border-gray-200 dark:border-slate-700" : ""}>
                      <SimpleAudioPlayer 
                        url={typeof image === 'string' ? image : image.url} 
                        title={post.audioData?.tracks?.[index]?.title || post.extra_data?.audioData?.tracks?.[index]?.title || `Audio ${index + 1}`}
                        artist={post.audioData?.tracks?.[index]?.artist || post.extra_data?.audioData?.tracks?.[index]?.artist || 'Unknown Artist'}
                        cover={post.audioData?.tracks?.[index]?.cover || post.extra_data?.audioData?.tracks?.[index]?.cover}
                        id={typeof image === 'string' ? image : image.id || image.url}
                        playlist={playlist}
                        index={index}
                      />
                    </div>
                  ));
                })()}
            </div>
          ) : null
      ) : (
          post.images && post.images.length > 0 && (
            <div className="mt-2 border-y border-gray-50 dark:border-slate-800">
              <PostMedia images={post.images} layout={post.imageLayout} post={post} />
            </div>
          )
      )}

      {/* Footer Actions */}
      <PostFooter post={post} />
    </div>
  );
};
