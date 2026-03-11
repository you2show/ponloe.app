import { HugeiconsIcon } from '@hugeicons/react';
import { AnalyticsUpIcon, MoreHorizontalIcon, Search01Icon, UserGroupIcon, Tick01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

import React, { useState, useEffect, useRef } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Post } from '../shared';

interface SearchResult {
  id: string;
  content: string;
  type: string;
  user: {
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  timestamp: string;
}

interface SuggestedUser {
  id: string;
  full_name: string;
  avatar_url: string;
  role: string;
  is_verified: boolean;
  bio: string | null;
}

interface TrendingTopic {
  tag: string;
  count: number;
}

export const RightSidebar: React.FC<{ onPostClick?: (post: Post) => void }> = ({ onPostClick }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  // Default trending topics (fallback)
  const defaultTopics: TrendingTopic[] = [
    { tag: '#Ramadan2025', count: 12500 },
    { tag: '#HalalFood', count: 8700 },
    { tag: '#QuranRecitation', count: 6300 },
    { tag: '#IslamicFinance', count: 4200 },
    { tag: '#DailyDua', count: 3800 },
  ];

  useEffect(() => {
    fetchTrendingTopics();
    fetchSuggestedUsers();
    if (user) fetchFollowing();
  }, [user]);

  const fetchTrendingTopics = async () => {
    if (!supabase) {
      setTrendingTopics(defaultTopics);
      return;
    }
    try {
      // Try to get trending from recent posts
      const { data, error } = await supabase
        .from('posts')
        .select('content')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error || !data || data.length === 0) {
        setTrendingTopics(defaultTopics);
        return;
      }

      // Extract hashtags from posts
      const tagCounts: Record<string, number> = {};
      data.forEach(post => {
        const tags = (post.content || '').match(/#[\w\u1780-\u17FF]+/g);
        if (tags) {
          tags.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });

      const sorted = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([tag, count]) => ({ tag, count: count * 100 }));

      setTrendingTopics(sorted.length > 0 ? sorted : defaultTopics);
    } catch (error) {
      setTrendingTopics(defaultTopics);
    }
  };

  const fetchSuggestedUsers = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role, is_verified, bio')
        .in('role', ['admin', 'scholar', 'premium'])
        .limit(5);

      if (error) throw error;
      if (data) {
        setSuggestedUsers(data.filter(u => u.id !== user?.id) as SuggestedUser[]);
      }
    } catch (error) {
      console.error('Error fetching suggested users:', error);
    }
  };

  const fetchFollowing = async () => {
    if (!supabase || !user) return;
    try {
      const { data } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);
      
      if (data) {
        setFollowingIds(new Set(data.map(f => f.following_id)));
      }
    } catch (error) {
      // Table might not exist yet
    }
  };

  const handleFollow = async (userId: string) => {
    if (!user || !supabase) {
      showToast('សូមចូលគណនីដើម្បីតាមដាន', 'error');
      return;
    }

    try {
      const isFollowing = followingIds.has(userId);
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);
        
        setFollowingIds(prev => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      } else {
        await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: userId });
        
        setFollowingIds(prev => new Set(prev).add(userId));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="w-80 hidden xl:block sticky top-[53px] h-[calc(100vh-53px)] overflow-y-auto space-y-4 p-2 shrink-0 no-scrollbar">
      
      {/* Trending Topics */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-4">
        <h3 className="font-bold text-gray-900 dark:text-white font-khmer mb-4 flex items-center gap-2">
          <HugeiconsIcon icon={AnalyticsUpIcon} strokeWidth={1.5} className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> 
          ប្រធានបទពេញនិយម
        </h3>
        <div className="space-y-3">
          {trendingTopics.map((topic, i) => (
            <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors">
              <div>
                <p className="font-bold text-sm text-gray-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{topic.tag}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{formatCount(topic.count)} posts</p>
              </div>
              <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.5} className="w-4 h-4 text-gray-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Users */}
      {suggestedUsers.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-4">
          <h3 className="font-bold text-gray-900 dark:text-white font-khmer mb-4 flex items-center gap-2">
            <HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.5} className="w-5 h-5 text-blue-600 dark:text-blue-400" /> 
            អ្នកប្រើប្រាស់ដែលគួរតាមដាន
          </h3>
          <div className="space-y-3">
            {suggestedUsers.map(sugUser => {
              const isFollowing = followingIds.has(sugUser.id);
              return (
                <div key={sugUser.id} className="flex items-center gap-3">
                  <img 
                    src={sugUser.avatar_url || `https://ui-avatars.com/api/?name=${sugUser.full_name}&background=random`}
                    alt={sugUser.full_name}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-gray-900 dark:text-slate-200 truncate">{sugUser.full_name}</span>
                      {sugUser.is_verified && (
                        <div className="bg-blue-500 p-0.5 rounded-full shrink-0">
                          <HugeiconsIcon icon={Tick01Icon} strokeWidth={1.5} className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 capitalize">{sugUser.role}</p>
                  </div>
                  <button 
                    onClick={() => handleFollow(sugUser.id)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                      isFollowing 
                        ? 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600'
                    }`}
                  >
                    {isFollowing ? 'តាមដានហើយ' : 'តាមដាន'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-gray-400 dark:text-slate-500 px-2 space-y-1">
        <p>© 2025 Ponloe App</p>
        <div className="flex gap-2">
          <a href="#" className="hover:text-gray-600 dark:hover:text-slate-400">Privacy</a>
          <span>•</span>
          <a href="#" className="hover:text-gray-600 dark:hover:text-slate-400">Terms</a>
          <span>•</span>
          <a href="#" className="hover:text-gray-600 dark:hover:text-slate-400">About</a>
        </div>
      </div>
    </div>
  );
};
