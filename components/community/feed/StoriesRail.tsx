import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Cancel01Icon, ArrowLeft01Icon, ArrowRight01Icon, ViewIcon } from '@hugeicons/core-free-icons';

import React, { useState, useEffect, useRef, useCallback } from 'react';

import { MOCK_USER } from '../shared';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface Story {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  image: string;
  caption?: string;
  created_at: string;
}

interface StoryGroup {
  userId: string;
  userName: string;
  userAvatar: string;
  stories: Story[];
  hasUnviewed: boolean;
}

export const StoriesRail: React.FC = () => {
  const { user, profile } = useAuth();
  const { theme } = useTheme();
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const STORY_DURATION = 5000; // 5 seconds per story

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    if (!supabase) {
      setStoryGroups([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          media_url,
          caption,
          created_at,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const groups: StoryGroup[] = [];
        data.forEach((s: any) => {
          const userId = s.profiles?.id;
          const existing = groups.find(g => g.userId === userId);
          const story: Story = {
            id: s.id,
            user: {
              id: userId,
              name: s.profiles?.full_name || 'Unknown',
              avatar: s.profiles?.avatar_url || '',
            },
            image: s.media_url,
            caption: s.caption,
            created_at: s.created_at,
          };

          if (existing) {
            existing.stories.push(story);
          } else {
            groups.push({
              userId,
              userName: s.profiles?.full_name || 'Unknown',
              userAvatar: s.profiles?.avatar_url || '',
              stories: [story],
              hasUnviewed: true,
            });
          }
        });
        setStoryGroups(groups);
      } else {
        setStoryGroups([]);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      setStoryGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const openStory = (groupIndex: number) => {
    setActiveGroupIndex(groupIndex);
    setActiveStoryIndex(0);
    setProgress(0);
    startProgress();
  };

  const closeStory = () => {
    setActiveGroupIndex(null);
    setActiveStoryIndex(0);
    setProgress(0);
    if (progressInterval.current) clearInterval(progressInterval.current);
  };

  const startProgress = useCallback(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    setProgress(0);
    const step = 100 / (STORY_DURATION / 50);
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + step;
      });
    }, 50);
  }, []);

  const nextStory = () => {
    if (activeGroupIndex === null) return;
    const group = storyGroups[activeGroupIndex];
    if (activeStoryIndex < group.stories.length - 1) {
      setActiveStoryIndex(prev => prev + 1);
      setProgress(0);
    } else if (activeGroupIndex < storyGroups.length - 1) {
      setActiveGroupIndex(prev => (prev ?? 0) + 1);
      setActiveStoryIndex(0);
      setProgress(0);
    } else {
      closeStory();
    }
  };

  const prevStory = () => {
    if (activeGroupIndex === null) return;
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(prev => prev - 1);
      setProgress(0);
    } else if (activeGroupIndex > 0) {
      const prevGroup = storyGroups[activeGroupIndex - 1];
      setActiveGroupIndex(prev => (prev ?? 1) - 1);
      setActiveStoryIndex(prevGroup.stories.length - 1);
      setProgress(0);
    }
  };

  useEffect(() => {
    if (activeGroupIndex !== null) {
      startProgress();
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [activeGroupIndex, activeStoryIndex]);

  const avatarUrl = profile?.avatar_url || MOCK_USER.avatar;

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-4 mb-4 relative overflow-hidden">
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {/* Create Story Button */}
          <div className="flex-shrink-0 w-28 h-48 relative rounded-xl overflow-hidden cursor-pointer group shadow-sm">
            <img 
              src={avatarUrl || undefined} 
              className="w-full h-full object-cover filter brightness-75 group-hover:scale-105 transition-transform duration-500" 
              alt="Me" 
              referrerPolicy="no-referrer" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 dark:from-slate-900/90 to-transparent"></div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-center w-full">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white mx-auto mb-2 shadow-md">
                <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} className="w-5 h-5" />
              </div>
              <span className="text-white text-xs font-bold font-khmer">បង្កើតរឿង</span>
            </div>
          </div>

          {/* Story Items */}
          {loading ? (
            // Skeleton loading
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-28 h-48 rounded-xl bg-gray-200 dark:bg-slate-800 animate-pulse"></div>
            ))
          ) : (
            storyGroups.map((group, groupIdx) => (
              <div 
                key={group.userId} 
                className="flex-shrink-0 w-28 h-48 relative rounded-xl overflow-hidden cursor-pointer group shadow-sm"
                onClick={() => openStory(groupIdx)}
              >
                <img 
                  src={group.stories[0].image || undefined} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  alt={group.userName} 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 dark:from-slate-900/90 to-transparent"></div>
                <div className={`absolute top-3 left-3 w-9 h-9 rounded-full border-2 ${group.hasUnviewed ? 'border-blue-500' : 'border-gray-300'} p-0.5 z-10 bg-white/20 backdrop-blur-sm`}>
                  <img 
                    src={group.userAvatar || undefined} 
                    className="w-full h-full rounded-full object-cover" 
                    alt="avatar" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
                <div className="absolute bottom-3 left-3 text-white">
                  <p className="text-xs font-bold truncate w-20">{group.userName}</p>
                </div>
                {group.stories.length > 1 && (
                  <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {group.stories.length}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {activeGroupIndex !== null && storyGroups[activeGroupIndex] && (
        <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center animate-in fade-in duration-200">
          {/* Progress Bars */}
          <div className="absolute top-0 left-0 right-0 z-30 px-2 pt-2 flex gap-1">
            {storyGroups[activeGroupIndex].stories.map((_, idx) => (
              <div key={idx} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-75"
                  style={{ 
                    width: idx < activeStoryIndex ? '100%' : idx === activeStoryIndex ? `${progress}%` : '0%' 
                  }}
                ></div>
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-4 left-0 right-0 z-30 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={storyGroups[activeGroupIndex].userAvatar || undefined}
                alt=""
                className="w-8 h-8 rounded-full object-cover border border-white/50"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="text-white text-sm font-bold">{storyGroups[activeGroupIndex].userName}</p>
                <p className="text-white/60 text-[10px]">
                  {new Date(storyGroups[activeGroupIndex].stories[activeStoryIndex].created_at).toLocaleString('km-KH')}
                </p>
              </div>
            </div>
            <button 
              onClick={closeStory}
              className="p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-sm"
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
            </button>
          </div>

          {/* Story Image */}
          <img 
            src={storyGroups[activeGroupIndex].stories[activeStoryIndex].image || undefined}
            alt="Story"
            className="max-w-full max-h-full object-contain"
            referrerPolicy="no-referrer"
          />

          {/* Caption */}
          {storyGroups[activeGroupIndex].stories[activeStoryIndex].caption && (
            <div className="absolute bottom-16 left-0 right-0 px-6 text-center z-20">
              <p className="text-white text-sm font-khmer bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2 inline-block">
                {storyGroups[activeGroupIndex].stories[activeStoryIndex].caption}
              </p>
            </div>
          )}

          {/* Views Count */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 text-white/60 text-xs">
            <HugeiconsIcon icon={ViewIcon} strokeWidth={1.5} className="w-4 h-4" />
            <span>0</span>
          </div>

          {/* Navigation Areas */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer"
            onClick={prevStory}
          ></div>
          <div 
            className="absolute right-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer"
            onClick={nextStory}
          ></div>

          {/* Desktop Navigation Buttons */}
          <button 
            onClick={prevStory}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all z-30 backdrop-blur-sm"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-6 h-6" />
          </button>
          <button 
            onClick={nextStory}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all z-30 backdrop-blur-sm"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="w-6 h-6" />
          </button>
        </div>
      )}
    </>
  );
};
