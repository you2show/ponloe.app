import { HugeiconsIcon } from '@hugeicons/react';
import { ThumbsUpIcon, Comment01Icon, Share01Icon, SentIcon } from '@hugeicons/core-free-icons';

import React, { useState, useEffect } from 'react';

import { Post } from '../../shared';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { CommentSection } from './CommentSection';
import { ShareMenu } from './ShareMenu';
import { SendToChatModal } from './SendToChatModal';

interface PostFooterProps {
  post: Post;
  isSticky?: boolean;
}

export const PostFooter: React.FC<PostFooterProps> = ({ post, isSticky = false }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [showComments, setShowComments] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showSendToChat, setShowSendToChat] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  // Sync state with props
  useEffect(() => {
    setLikesCount(post.likes);
    setCommentsCount(post.commentsCount);
  }, [post.likes, post.commentsCount]);

  // Check if current user has liked this post
  useEffect(() => {
    if (user && supabase) {
      checkIfLiked();
    }
  }, [user, post.id]);

  const checkIfLiked = async () => {
    if (!user || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking like status:', error);
        return;
      }
      
      setIsLiked(!!data);
    } catch (error) {
      console.error('Error in checkIfLiked:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      showToast('សូមចូលគណនីដើម្បីចូលចិត្ត', 'error');
      return;
    }
    if (!supabase || likeLoading) return;

    setLikeLoading(true);
    
    // Optimistic update
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      if (wasLiked) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: post.id,
            user_id: user.id
          });
        
        if (error) {
            // If error is duplicate key, it means it's already liked. 
            // We should keep it as liked (isLiked=true).
            if (error.code === '23505') { // Unique violation
                console.warn('Post already liked, syncing state.');
                setIsLiked(true);
                // Don't increment count again if we already did optimistically? 
                // Actually, if we thought it was unliked, we incremented. 
                // If it was actually liked in DB, we should have been in Liked state.
                // So we are correcting the state.
            } else {
                throw error;
            }
        }
      }
    } catch (error: any) {
      // Revert optimistic update on error
      console.error('Error toggling like:', error);
      setIsLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
      showToast('មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ server', 'error');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleShare = () => {
    setShowShareMenu(true);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toString();
  };

  return (
    <>
      {/* Stats Row */}
      <div className="px-4 py-1.5 flex justify-between items-center text-xs text-gray-500 dark:text-slate-400">
        <div className="flex items-center gap-1">
          {likesCount > 0 && (
            <>
              <div className="bg-blue-500 rounded-full p-0.5">
                <HugeiconsIcon icon={ThumbsUpIcon} strokeWidth={1.5} className="w-2.5 h-2.5 text-white fill-current" />
              </div>
              <span>{formatNumber(likesCount)}</span>
            </>
          )}
        </div>
        <div className="flex gap-2">
          {commentsCount > 0 && (
            <button 
              onClick={() => setShowComments(!showComments)}
              className="hover:underline"
            >
              {formatNumber(commentsCount)} មតិ
            </button>
          )}
          {post.shares > 0 && <span>{formatNumber(post.shares)} ចែករំលែក</span>}
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`px-2 py-1 flex items-center justify-between border-t border-gray-100 dark:border-slate-800 ${
        isSticky ? 'bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:bg-slate-900 dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]' : ''
      }`}>
        <button 
          onClick={handleLike}
          disabled={likeLoading}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-khmer font-bold text-sm transition-all group ${
            isLiked ? 'text-blue-600' : 'text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <HugeiconsIcon 
            icon={ThumbsUpIcon} 
            strokeWidth={1.5} 
            className={`w-5 h-5 transition-transform ${
              isLiked ? 'text-blue-500 fill-blue-500 scale-110' : 'group-hover:scale-110'
            }`} 
          /> 
          <span className="hidden sm:inline">{isLiked ? 'បានចូលចិត្ត' : 'ចូលចិត្ត'}</span>
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-khmer font-bold text-sm transition-colors group text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <HugeiconsIcon icon={Comment01Icon} strokeWidth={1.5} className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
          <span className="hidden sm:inline">មតិ</span>
        </button>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowSendToChat(true);
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-khmer font-bold text-sm transition-colors group text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <HugeiconsIcon icon={SentIcon} strokeWidth={1.5} className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
          <span className="hidden sm:inline">ផ្ញើ</span>
        </button>
        <button 
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-khmer font-bold text-sm transition-colors group text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <HugeiconsIcon icon={Share01Icon} strokeWidth={1.5} className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
          <span className="hidden sm:inline">ចែករំលែក</span>
        </button>
      </div>

      {/* Comment Section */}
      {showComments && (
        <CommentSection 
          postId={post.id} 
          commentsCount={commentsCount}
          onCommentsCountChange={setCommentsCount}
        />
      )}

      {/* Send to Chat Modal */}
      <SendToChatModal 
        isOpen={showSendToChat}
        onClose={() => setShowSendToChat(false)}
        post={post}
      />

      {/* Share Menu */}
      <ShareMenu 
        isOpen={showShareMenu}
        onClose={() => setShowShareMenu(false)}
        url={`${window.location.origin}/post/${post.id}`}
        title={post.content}
      />
    </>
  );
};
