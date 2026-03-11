import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

interface FollowButtonProps {
  targetUserId: string;
  className?: string;
}

export const FollowButton: React.FC<FollowButtonProps> = ({ targetUserId, className = "" }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && targetUserId) {
      checkFollowStatus();
    }
  }, [user, targetUserId]);

  const checkFollowStatus = async () => {
    if (!user || !supabase || user.id === targetUserId) return;
    try {
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .maybeSingle();
      
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      showToast('សូមចូលគណនីដើម្បី Follow', 'error');
      return;
    }
    if (user.id === targetUserId) return;
    if (!supabase || loading) return;

    setLoading(true);
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);

    try {
      if (wasFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          });
        if (error) throw error;
      }
    } catch (error) {
      setIsFollowing(wasFollowing);
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.id === targetUserId) return null;

  return (
    <button 
      onClick={handleFollow}
      disabled={loading}
      className={`text-xs px-4 py-1.5 rounded-full transition-all font-bold ${
        isFollowing 
          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
      } ${className}`}
    >
      {loading ? '...' : (isFollowing ? 'Following' : 'Follow')}
    </button>
  );
};
