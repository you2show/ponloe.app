import { HugeiconsIcon } from '@hugeicons/react';
import { SentIcon, FavouriteIcon, Delete01Icon, MoreHorizontalIcon } from '@hugeicons/core-free-icons';

import React, { useState, useEffect, useRef } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string;
    role: string;
    is_verified: boolean;
  } | null;
}

interface CommentSectionProps {
  postId: string;
  commentsCount: number;
  onCommentsCountChange?: (newCount: number) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, commentsCount, onCommentsCountChange }) => {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [localCount, setLocalCount] = useState(commentsCount);
  const [likedComments, setLikedComments] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('liked_comments');
      if (saved) return new Set(JSON.parse(saved));
    }
    return new Set();
  });
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
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
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        setComments(data as Comment[]);
        setLocalCount(data.length);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim() || !user || !supabase) return;
    
    setSubmitting(true);
    try {
      let finalContent = newComment.trim();
      if (replyingTo) {
        const replyName = replyingTo.profiles?.full_name || 'អ្នកប្រើប្រាស់';
        finalContent = `@[${replyName}](${replyingTo.id}) ${finalContent}`;
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: finalContent
        })
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
        .single();

      if (error) throw error;
      if (data) {
        setComments(prev => [...prev, data as Comment]);
        setNewComment('');
        setReplyingTo(null);
        const newCount = localCount + 1;
        setLocalCount(newCount);
        onCommentsCountChange?.(newCount);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = (commentId: string) => {
    if (!user) return;
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      localStorage.setItem('liked_comments', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const handleReply = (comment: Comment) => {
    if (!user) return;
    setReplyingTo(comment);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  };

  const handleDelete = async (commentId: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      setComments(prev => prev.filter(c => c.id !== commentId));
      const newCount = Math.max(0, localCount - 1);
      setLocalCount(newCount);
      onCommentsCountChange?.(newCount);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const formatTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'អម្បាញ់មិញ';
    if (diffMins < 60) return `${diffMins} នាទីមុន`;
    if (diffHours < 24) return `${diffHours} ម៉ោងមុន`;
    if (diffDays < 7) return `${diffDays} ថ្ងៃមុន`;
    return date.toLocaleDateString('km-KH');
  };

  const renderCommentContent = (content: string) => {
    const mentionRegex = /^@\[(.*?)\]\((.*?)\)\s*/;
    const match = content.match(mentionRegex);
    if (match) {
      const name = match[1];
      const rest = content.substring(match[0].length);
      return (
        <>
          <span className="text-blue-600 font-medium">@{name}</span>
          {' '}{rest}
        </>
      );
    }

    if (content.startsWith('@')) {
      let bestName = '';
      for (const c of comments) {
        const name = c.profiles?.full_name;
        if (name && (content.startsWith(`@${name} `) || content === `@${name}`)) {
          if (name.length > bestName.length) {
            bestName = name;
          }
        }
      }
      
      if (bestName) {
        const mention = `@${bestName}`;
        const rest = content.substring(mention.length);
        return (
          <>
            <span className="text-blue-600 font-medium">{mention}</span>
            {rest}
          </>
        );
      }

      const spaceIndex = content.indexOf(' ');
      if (spaceIndex !== -1) {
        const mention = content.substring(0, spaceIndex);
        const rest = content.substring(spaceIndex);
        return (
          <>
            <span className="text-blue-600 font-medium">{mention}</span>
            {rest}
          </>
        );
      }
    }
    return content;
  };

  const displayedComments = showAll ? comments : comments.slice(-3);
  const hasMore = comments.length > 3 && !showAll;

  interface ThreadNode {
    comment: Comment;
    replies: ThreadNode[];
  }

  const threads: ThreadNode[] = [];
  
  displayedComments.forEach(comment => {
    let attached = false;
    
    const mentionRegex = /^@\[(.*?)\]\((.*?)\)\s*/;
    const match = comment.content.match(mentionRegex);

    if (match) {
      const parentId = match[2];
      
      for (let i = threads.length - 1; i >= 0; i--) {
        const root = threads[i];
        if (root.comment.id === parentId) {
          root.replies.push({ comment, replies: [] });
          attached = true;
          break;
        }
        
        for (let j = root.replies.length - 1; j >= 0; j--) {
          const l1 = root.replies[j];
          if (l1.comment.id === parentId) {
            l1.replies.push({ comment, replies: [] });
            attached = true;
            break;
          }
          
          for (let k = l1.replies.length - 1; k >= 0; k--) {
             const l2 = l1.replies[k];
             if (l2.comment.id === parentId) {
               // Cap at level 3 visually: add to l1.replies
               l1.replies.push({ comment, replies: [] });
               attached = true;
               break;
             }
          }
          if (attached) break;
        }
        if (attached) break;
      }
      
      if (!attached && threads.length > 0) {
        threads[threads.length - 1].replies.push({ comment, replies: [] });
        attached = true;
      }
    } else if (comment.content.startsWith('@')) {
      // Fallback for old comments
      let bestMatch: { targetList: ThreadNode[], nameLength: number } | null = null;

      for (let i = threads.length - 1; i >= 0; i--) {
        const root = threads[i];
        
        const rootName = root.comment.profiles?.full_name || 'អ្នកប្រើប្រាស់';
        if (comment.content.startsWith(`@${rootName} `) || comment.content === `@${rootName}`) {
          if (!bestMatch || rootName.length >= bestMatch.nameLength) {
            bestMatch = { targetList: root.replies, nameLength: rootName.length };
          }
        }
        
        for (let j = root.replies.length - 1; j >= 0; j--) {
          const l1 = root.replies[j];
          const l1Name = l1.comment.profiles?.full_name || 'អ្នកប្រើប្រាស់';
          if (comment.content.startsWith(`@${l1Name} `) || comment.content === `@${l1Name}`) {
            if (!bestMatch || l1Name.length >= bestMatch.nameLength) {
              bestMatch = { targetList: l1.replies, nameLength: l1Name.length };
            }
          }
          
          for (let k = l1.replies.length - 1; k >= 0; k--) {
             const l2 = l1.replies[k];
             const l2Name = l2.comment.profiles?.full_name || 'អ្នកប្រើប្រាស់';
             if (comment.content.startsWith(`@${l2Name} `) || comment.content === `@${l2Name}`) {
               if (!bestMatch || l2Name.length >= bestMatch.nameLength) {
                 // Cap at level 3 visually: add to l1.replies
                 bestMatch = { targetList: l1.replies, nameLength: l2Name.length };
               }
             }
          }
        }
      }

      if (bestMatch) {
        bestMatch.targetList.push({ comment, replies: [] });
        attached = true;
      }
      
      if (!attached && threads.length > 0) {
        threads[threads.length - 1].replies.push({ comment, replies: [] });
        attached = true;
      }
    }
    
    if (!attached) {
      threads.push({ comment, replies: [] });
    }
  });

  const renderInput = (isInline: boolean, targetCommentId?: string) => {
    if (isInline && replyingTo?.id !== targetCommentId) return null;
    if (!isInline && replyingTo) return null;

    return (
      <div className={`flex items-center gap-2 ${isInline ? 'mt-2 mb-2' : 'px-4 py-2'}`}>
        <img 
          src={profile?.avatar_url || 'https://ui-avatars.com/api/?name=Guest&background=059669&color=fff'}
          alt="Me"
          className={`${isInline ? 'w-6 h-6' : 'w-8 h-8'} rounded-full object-cover shrink-0`}
          referrerPolicy="no-referrer"
        />
        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-slate-800 rounded-2xl px-3 py-1.5">
          {isInline && replyingTo && (
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 mb-1 pb-1 border-b border-gray-200 dark:border-slate-700">
              <span>កំពុងឆ្លើយតបទៅកាន់ <span className="font-bold">{replyingTo.profiles?.full_name || 'អ្នកប្រើប្រាស់'}</span></span>
              <button onClick={() => setReplyingTo(null)} className="hover:text-gray-700 dark:hover:text-slate-300">
                ✕
              </button>
            </div>
          )}
          <div className="flex items-center w-full">
            <input
              ref={isInline ? inputRef : (!replyingTo ? inputRef : undefined)}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={user ? (replyingTo ? 'សរសេរការឆ្លើយតប...' : 'សរសេរមតិ...') : 'សូមចូលគណនីដើម្បីសរសេរមតិ'}
              disabled={!user || submitting}
              className="flex-1 bg-transparent outline-none text-sm font-khmer text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 disabled:opacity-50"
            />
            {newComment.trim() && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 disabled:opacity-50 transition-colors ml-1"
              >
                <HugeiconsIcon icon={SentIcon} strokeWidth={1.5} className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderThreadNode = (node: ThreadNode, level: number, isLast: boolean) => {
    const isRoot = level === 0;
    const avatarSize = isRoot ? 'w-8 h-8' : 'w-6 h-6';
    const lineLeft = isRoot ? 'left-4' : 'left-3';
    
    return (
      <div key={node.comment.id} className="relative flex flex-col">
        <div className={`relative flex gap-2 pb-1 group ${!isRoot ? 'mt-1' : ''}`}>
          <div className={`flex flex-col items-center shrink-0 ${isRoot ? 'w-8' : 'w-6'}`}>
            {/* Curve for non-root */}
            {!isRoot && (
              <div className="absolute -left-4 top-0 w-6 h-3.5 border-l border-b border-gray-300 dark:border-slate-700 rounded-bl-xl" />
            )}
            
            <img 
              src={node.comment.profiles?.avatar_url || `https://ui-avatars.com/api/?name=User&background=random`}
              alt={node.comment.profiles?.full_name || 'User'}
              className={`${avatarSize} rounded-full object-cover shrink-0 mt-0.5 z-10`}
              referrerPolicy="no-referrer"
            />
            
            {/* Vertical line to children */}
            {node.replies.length > 0 && (
              <div className={`absolute ${isRoot ? 'top-8' : 'top-6'} -bottom-1 ${lineLeft} w-px bg-gray-300 dark:bg-slate-700`} />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="bg-gray-100 dark:bg-slate-800 rounded-2xl px-3 py-2 inline-block max-w-full">
              <span className="font-bold text-xs text-gray-900 dark:text-white block font-khmer">
                {node.comment.profiles?.full_name || 'អ្នកប្រើប្រាស់'}
              </span>
              <p className="text-sm text-gray-800 dark:text-slate-300 font-khmer whitespace-pre-wrap break-words">
                {renderCommentContent(node.comment.content)}
              </p>
            </div>
            <div className="flex items-center gap-3 mt-0.5 px-1">
              <span className="text-[10px] text-gray-400 dark:text-slate-500">{formatTime(node.comment.created_at)}</span>
              <button 
                onClick={() => handleLike(node.comment.id)}
                className={`text-[10px] font-bold transition-colors ${
                  likedComments.has(node.comment.id) 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                ចូលចិត្ត {likedComments.has(node.comment.id) && '1'}
              </button>
              <button 
                onClick={() => handleReply(node.comment)}
                className="text-[10px] text-gray-500 font-bold hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                ឆ្លើយតប
              </button>
              {user && node.comment.user_id === user.id && (
                <button 
                  onClick={() => handleDelete(node.comment.id)}
                  className="text-[10px] text-red-400 font-bold hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  លុប
                </button>
              )}
            </div>
            
            {/* Inline Input */}
            {renderInput(true, node.comment.id)}
          </div>
        </div>
        
        {/* Replies */}
        {node.replies.length > 0 && (
          <div className={`relative flex flex-col ${isRoot ? 'pl-4 ml-4' : 'pl-4 ml-3'}`}>
            {/* Continuous vertical line for the whole thread */}
            <div className="absolute top-0 bottom-4 left-0 w-px bg-gray-300 dark:bg-slate-700" />
            
            {node.replies.map((reply, index) => 
              renderThreadNode(reply, level + 1, index === node.replies.length - 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border-t border-gray-100 dark:border-slate-800">
      {/* Comments List */}
      {loading ? (
        <div className="px-4 py-3 text-center text-gray-400 dark:text-slate-500 text-xs">កំពុងផ្ទុកមតិ...</div>
      ) : comments.length > 0 ? (
        <div className="px-4 pt-2 pb-1">
          {hasMore && (
            <button 
              onClick={() => setShowAll(true)}
              className="text-gray-500 dark:text-slate-400 text-xs font-bold hover:text-emerald-600 dark:hover:text-emerald-400 mb-2 transition-colors"
            >
              មើលមតិទាំង {comments.length} &rarr;
            </button>
          )}
          <div className="space-y-3">
            {threads.map(thread => renderThreadNode(thread, 0, false))}
          </div>
        </div>
      ) : null}

      {/* Comment Input */}
      {renderInput(false)}
    </div>
  );
};
