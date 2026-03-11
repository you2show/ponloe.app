import { HugeiconsIcon } from '@hugeicons/react';
import { Tick01Icon, Globe02Icon, MoreHorizontalIcon, Delete02Icon, Edit02Icon, Bookmark01Icon, Flag01Icon, Copy01Icon, UserIcon, Cancel01Icon, Alert02Icon } from '@hugeicons/core-free-icons';

import React, { useState, useRef, useEffect } from 'react';

import { Post } from '../../shared';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

interface PostHeaderProps {
  post: Post;
  actionText?: string;
  onDelete?: (postId: string) => void;
  onEdit?: (post: Post) => void;
}

export const PostHeader: React.FC<PostHeaderProps> = ({ post, actionText, onDelete, onEdit }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = user?.id === post.user.id;

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if post is saved
  useEffect(() => {
    if (user && supabase) {
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
    } catch (error) {
      // Might be mock data
    }
  };

  const handleSave = async () => {
    if (!user || !supabase) {
      showToast('សូមចូលគណនីដើម្បីរក្សាទុក', 'error');
      return;
    }
    try {
      if (isSaved) {
        await supabase
          .from('saved_posts')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        setIsSaved(false);
      } else {
        await supabase
          .from('saved_posts')
          .insert({ post_id: post.id, user_id: user.id });
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving post:', error);
    }
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (!user || !supabase || isDeleting) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id)
        .eq('user_id', user.id);

      if (error) throw error;
      onDelete?.(post.id);
    } catch (error) {
      console.error('Error deleting post:', error);
      showToast('មានបញ្ហាក្នុងការលុប សូមព្យាយាមម្តងទៀត', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setShowMenu(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
      showToast('បានចម្លងតំណរួចហើយ!', 'success');
    } catch (error) {
      // Fallback
    }
    setShowMenu(false);
  };

  const handleReport = async () => {
    if (!user || !supabase) {
      showToast('សូមចូលគណនីដើម្បីរាយការណ៍', 'error');
      return;
    }
    
    const reason = prompt('សូមបញ្ជាក់មូលហេតុនៃការរាយការណ៍ (ឧ. ខ្លឹមសារមិនសមរម្យ, ព័ត៌មានមិនពិត):');
    if (!reason) return;

    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          post_id: post.id,
          reason: reason
        });

      if (error) throw error;
      showToast('អរគុណសម្រាប់ការរាយការណ៍។ ក្រុមការងារនឹងពិនិត្យមើល។', 'success');
    } catch (error) {
      console.error('Error reporting post:', error);
      showToast('មានបញ្ហាក្នុងការរាយការណ៍ សូមព្យាយាមម្តងទៀត', 'error');
    }
    setShowMenu(false);
  };

  const menuItems = [
    ...(isOwner ? [
      { id: 'edit', icon: Edit02Icon, label: 'កែសម្រួល', color: 'text-gray-700 dark:text-slate-300', onClick: () => { onEdit?.(post); setShowMenu(false); } },
      { id: 'delete', icon: Delete02Icon, label: 'លុបការបង្ហោះ', color: 'text-red-600', onClick: () => setShowDeleteConfirm(true) },
    ] : []),
    { id: 'save', icon: Bookmark01Icon, label: isSaved ? 'រក្សាទុកហើយ' : 'រក្សាទុក', color: isSaved ? 'text-emerald-600' : 'text-gray-700 dark:text-slate-300', onClick: handleSave },
    { id: 'copy', icon: Copy01Icon, label: 'ចម្លងតំណ', color: 'text-gray-700 dark:text-slate-300', onClick: handleCopyLink },
    ...(!isOwner ? [
      { id: 'report', icon: Flag01Icon, label: 'រាយការណ៍', color: 'text-orange-600', onClick: handleReport },
    ] : []),
  ];

  return (
    <>
      <div className="p-4 flex items-start justify-between">
        <div className="flex gap-3">
          <div className="relative">
            <img 
              src={post.user.avatar || undefined} 
              alt={post.user.name} 
              className="w-10 h-10 rounded-full object-cover border cursor-pointer hover:opacity-80 transition-opacity border-gray-100 dark:border-slate-700" 
              referrerPolicy="no-referrer"
            />
            {post.user.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full border-2 border-white dark:border-slate-900">
                <HugeiconsIcon icon={Tick01Icon} strokeWidth={1.5} className="w-2 h-2" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-sm font-khmer flex items-center gap-1 text-gray-900 dark:text-slate-200">
              {post.user.name} 
              {post.user.role && post.user.role !== 'general' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold capitalize bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  {post.user.role}
                </span>
              )}
              {actionText && <span className="font-normal text-xs text-gray-400 dark:text-slate-400">{actionText}</span>}
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-500">
              <span>{post.timestamp}</span>
              <span>•</span>
              <HugeiconsIcon icon={Globe02Icon} strokeWidth={1.5} className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* More Menu Button */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full transition-colors text-gray-400 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.5} className="w-5 h-5" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-10 w-56 rounded-xl shadow-xl border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-sm font-khmer font-bold ${item.color} hover:bg-gray-50 dark:hover:bg-slate-700`}
                >
                  <HugeiconsIcon icon={item.icon} strokeWidth={1.5} className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200 bg-white dark:bg-slate-800">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-100 dark:bg-red-900/30">
              <HugeiconsIcon icon={Alert02Icon} strokeWidth={1.5} className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-center mb-2 font-khmer text-gray-900 dark:text-slate-200">លុបការបង្ហោះ?</h3>
            <p className="text-center text-sm mb-6 font-khmer text-gray-500 dark:text-slate-400">
              ការបង្ហោះនេះនឹងត្រូវបានលុបជាអចិន្ត្រៃយ៍ ហើយមិនអាចត្រឡប់វិញបានទេ។
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors font-khmer bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300"
              >
                បោះបង់
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 font-khmer disabled:opacity-50"
              >
                <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.5} className="w-4 h-4" />
                {isDeleting ? 'កំពុងលុប...' : 'លុប'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
