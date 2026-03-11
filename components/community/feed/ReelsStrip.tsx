import { HugeiconsIcon } from '@hugeicons/react';
import { Film01Icon, PlayIcon, Cancel01Icon, ThumbsUpIcon, Comment01Icon, Share01Icon, ViewIcon } from '@hugeicons/core-free-icons';

import React, { useState, useEffect, useRef } from 'react';

import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';

interface Reel {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  likes: number | string;
  views: number | string;
  user: {
    name: string;
    avatar: string;
  };
}

export const ReelsStrip: React.FC = () => {
  const { theme } = useTheme();
  const [reels, setReels] = useState<Reel[]>([]);
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    setLoading(true);
    
    if (!supabase) {
      setReels([]);
      setLoading(false);
      return;
    }

    try {
      // Try to fetch reels from posts with type 'video' or from a reels table
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          media_urls,
          likes_count,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('type', 'video')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      if (data && data.length > 0) {
        setReels(data.map((r: any) => ({
          id: r.id,
          videoUrl: r.media_urls?.[0] || '',
          thumbnailUrl: r.media_urls?.[0] || '',
          caption: r.content,
          likes: r.likes_count || 0,
          views: 0,
          user: {
            name: r.profiles?.full_name || 'Unknown',
            avatar: r.profiles?.avatar_url || '',
          },
        })));
      } else {
        setReels([]);
      }
    } catch (error) {
      console.error('Error fetching reels:', error);
      setReels([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCount = (count: number | string) => {
    if (typeof count === 'string') return count;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (!loading && reels.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-4 mb-4`}>
        <div className="flex items-center gap-2 mb-3">
          <HugeiconsIcon icon={Film01Icon} strokeWidth={1.5} className="w-5 h-5 text-pink-600 fill-current" />
          <h3 className={`font-bold font-khmer ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>វីដេអូខ្លីៗ (Reels)</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`flex-shrink-0 w-36 h-64 rounded-xl animate-pulse ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
            ))
          ) : (
            reels.map(reel => (
              <div 
                key={reel.id} 
                className="flex-shrink-0 w-36 h-64 bg-gray-900 rounded-xl overflow-hidden relative cursor-pointer group"
                onClick={() => setSelectedReel(reel)}
              >
                <img 
                  src={reel.thumbnailUrl || reel.videoUrl || undefined} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                  alt="Reel" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-1">
                      <HugeiconsIcon icon={ThumbsUpIcon} strokeWidth={1.5} className="w-3 h-3" />
                      <span className="text-[10px] font-bold">{formatCount(reel.likes)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HugeiconsIcon icon={ViewIcon} strokeWidth={1.5} className="w-3 h-3" />
                      <span className="text-[10px] font-bold">{formatCount(reel.views)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full overflow-hidden bg-gray-200">
                      <img src={reel.user.avatar || undefined} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-[10px] truncate">{reel.user.name}</span>
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} className="w-8 h-8 text-white fill-white/20" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reel Viewer Modal */}
      {selectedReel && (
        <div className="fixed inset-0 z-[150] bg-black flex items-center justify-center animate-in fade-in duration-200">
          {/* Close Button */}
          <button 
            onClick={() => setSelectedReel(null)}
            className="absolute top-4 right-4 z-30 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-colors"
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-6 h-6" />
          </button>

          {/* Video/Image Content */}
          <div className="relative w-full h-full max-w-md mx-auto flex items-center justify-center">
            {selectedReel.videoUrl.match(/\.(mp4|webm|ogg)$/i) ? (
              <video
                ref={videoRef}
                src={selectedReel.videoUrl}
                className="w-full h-full object-contain"
                autoPlay
                loop
                playsInline
                controls
              />
            ) : (
              <img 
                src={selectedReel.videoUrl || undefined}
                alt="Reel"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            )}

            {/* Overlay Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src={selectedReel.user.avatar || `https://ui-avatars.com/api/?name=${selectedReel.user.name}&background=random`}
                  alt={selectedReel.user.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="text-white font-bold text-sm">{selectedReel.user.name}</p>
                  <p className="text-white/60 text-xs">{formatCount(selectedReel.views)} views</p>
                </div>
              </div>

              {/* Caption */}
              {selectedReel.caption && (
                <p className="text-white text-sm font-khmer mb-4 line-clamp-3">{selectedReel.caption}</p>
              )}
            </div>

            {/* Side Action Buttons */}
            <div className="absolute right-4 bottom-32 flex flex-col gap-4">
              <button className="flex flex-col items-center gap-1">
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors">
                  <HugeiconsIcon icon={ThumbsUpIcon} strokeWidth={1.5} className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-[10px] font-bold">{formatCount(selectedReel.likes)}</span>
              </button>
              <button className="flex flex-col items-center gap-1">
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors">
                  <HugeiconsIcon icon={Comment01Icon} strokeWidth={1.5} className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-[10px] font-bold">0</span>
              </button>
              <button className="flex flex-col items-center gap-1">
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors">
                  <HugeiconsIcon icon={Share01Icon} strokeWidth={1.5} className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-[10px] font-bold">Share</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
