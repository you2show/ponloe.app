import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Message01Icon, Loading02Icon, Image01Icon, Video01Icon, MusicNote01Icon, TextIcon } from '@hugeicons/core-free-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostCard } from '../community/feed/PostCard';
import { Post } from '../community/shared';

type PostFilter = 'all' | 'text' | 'image' | 'video' | 'audio';

export const MyPostsView: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<PostFilter>('all');

  useEffect(() => {
    if (user) {
      fetchMyPosts();
    }
  }, [user]);

  const fetchMyPosts = async () => {
    if (!user || !supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            role,
            is_verified
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedPosts: Post[] = data.map((postData: any) => ({
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
            likes: 0,
            commentsCount: 0,
            shares: 0,
            isLiked: false,
            type: postData.extra_data?.originalType || postData.type,
            images: postData.media_urls || [],
            originalType: postData.extra_data?.originalType || postData.type,
            audioData: postData.extra_data?.audioData || postData.audioData,
            ...postData.extra_data
        }));
        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error('Error fetching my posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'text') return post.type === 'text' && (!post.originalType || post.originalType === 'text') && (!post.extra_data?.originalType || post.extra_data?.originalType === 'text');
    if (activeFilter === 'image') return post.type === 'image' || post.images?.length > 0;
    if (activeFilter === 'video') return post.type === 'video';
    if (activeFilter === 'audio') return post.type === 'audio' || post.type === 'voice' || post.originalType === 'audio' || post.originalType === 'voice' || post.extra_data?.originalType === 'audio' || post.extra_data?.originalType === 'voice';
    return true;
  });

  const filters = [
    { id: 'all', label: 'ទាំងអស់' },
    { id: 'text', label: 'អត្ថបទ', icon: TextIcon },
    { id: 'image', label: 'រូបភាព', icon: Image01Icon },
    { id: 'video', label: 'វីដេអូ', icon: Video01Icon },
    { id: 'audio', label: 'សំឡេង', icon: MusicNote01Icon },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <HugeiconsIcon icon={Loading02Icon} className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-sm font-khmer opacity-60">កំពុងទាញយកទិន្នន័យ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id as PostFilter)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all font-khmer flex items-center gap-2 ${
              activeFilter === filter.id 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' 
                : (theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')
            }`}
          >
            {filter.icon && <HugeiconsIcon icon={filter.icon} strokeWidth={1.5} className="w-4 h-4" />}
            {filter.label}
          </button>
        ))}
      </div>

      {filteredPosts.length === 0 ? (
        <div className={`text-center py-20 font-khmer rounded-3xl border border-dashed ${
          theme === 'dark' ? 'bg-slate-900/50 border-slate-800 text-slate-500' : 'bg-white border-gray-200 text-gray-400'
        }`}>
          <HugeiconsIcon icon={Message01Icon} strokeWidth={1.5} className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>មិនទាន់មានការបង្ហោះទេ</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};
