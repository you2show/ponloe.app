import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { FavouriteIcon, Loading02Icon } from '@hugeicons/core-free-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostCard } from '../community/feed/PostCard';
import { Post } from '../community/shared';

export const SavedPostsView: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavedPosts();
    }
  }, [user]);

  const fetchSavedPosts = async () => {
    if (!user || !supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_posts')
        .select(`
          post_id,
          posts (
            *,
            profiles:user_id (
              id,
              full_name,
              avatar_url,
              role,
              is_verified
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedPosts: Post[] = data.map((item: any) => {
          const postData = item.posts;
          return {
            id: postData.id,
            user: {
              id: postData.profiles?.id,
              name: postData.profiles?.full_name || 'អ្នកប្រើប្រាស់',
              avatar: postData.profiles?.avatar_url || 'https://ui-avatars.com/api/?name=User&background=random',
              role: postData.profiles?.role,
              isVerified: postData.profiles?.is_verified
            },
            content: postData.content || '',
            timestamp: new Date(postData.created_at).toLocaleDateString(),
            likes: 0, // In a real app, you'd fetch these counts
            commentsCount: 0,
            shares: 0,
            isLiked: false,
            type: postData.type,
            images: postData.media_urls || [],
            ...postData.extra_data
          };
        });
        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error('Error fetching saved posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <HugeiconsIcon icon={Loading02Icon} className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-sm font-khmer opacity-60">កំពុងទាញយកទិន្នន័យ...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={`text-center py-20 font-khmer rounded-3xl border border-dashed ${
        theme === 'dark' ? 'bg-slate-900/50 border-slate-800 text-slate-500' : 'bg-white border-gray-200 text-gray-400'
      }`}>
        <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p>មិនទាន់មានការបង្ហោះដែលបានរក្សាទុកទេ</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};
