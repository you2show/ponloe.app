import React, { useState } from 'react';
import { Share01Icon, LinkIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';

interface ShareModalProps {
  postId: string;
  postContent: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  postId,
  postContent,
  isOpen,
  onClose
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [shareType, setShareType] = useState<'repost' | 'quote'>('repost');

  const handleShare = async () => {
    if (!user) {
      showToast('សូមចូលគណនី', 'error');
      return;
    }

    setLoading(true);
    try {
      const postData: any = {
        user_id: user.id,
        original_post_id: postId,
        is_repost: shareType === 'repost',
        status: 'published'
      };

      // If quote, add comment as content
      if (shareType === 'quote' && comment.trim()) {
        postData.content = comment;
      }

      const { error } = await supabase
        .from('posts')
        .insert(postData);

      if (error) throw error;

      showToast('ចែករំលែកបានជោគជ័យ!', 'success');
      onClose();
      setComment('');
    } catch (error) {
      console.error('Share error:', error);
      showToast('ការចែករំលែកបានមិនជោគជ័យ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url);
    showToast('បានចម្លងតំណភ្ជាប់!', 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-md rounded-2xl overflow-hidden ${
        theme === 'dark' ? 'bg-slate-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <h3 className={`font-semibold text-lg ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            ចែករំលែក
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
            }`}
          >
            <HugeiconsIcon
              icon={Share01Icon}
              className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}
            />
          </button>
        </div>

        {/* Original Post Preview */}
        <div className={`p-4 m-4 rounded-xl ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'
        }`}>
          <p className={`text-sm line-clamp-3 ${
            theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
          }`}>
            {postContent}
          </p>
        </div>

        {/* Share Type Selection */}
        <div className="px-4 pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setShareType('repost')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                shareType === 'repost'
                  ? 'bg-emerald-600 text-white'
                  : theme === 'dark'
                    ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ប្រកាសឡើងវិញ
            </button>
            <button
              onClick={() => setShareType('quote')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                shareType === 'quote'
                  ? 'bg-emerald-600 text-white'
                  : theme === 'dark'
                    ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              បញ្ចេញមតិ
            </button>
          </div>
        </div>

        {/* Quote Comment Input */}
        {shareType === 'quote' && (
          <div className="p-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="បញ្ចេញមតិរបស់អ្នក..."
              className={`w-full p-3 rounded-xl resize-none outline-none ${
                theme === 'dark'
                  ? 'bg-slate-800 text-white placeholder-slate-400'
                  : 'bg-gray-100 text-gray-900 placeholder-gray-400'
              }`}
              rows={3}
            />
          </div>
        )}

        {/* Quick Share Options */}
        <div className={`p-4 border-t ${
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <button
            onClick={copyLink}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
              theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
            }`}
          >
            <HugeiconsIcon
              icon={LinkIcon}
              className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}
            />
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              ចម្លងតំណភ្ជាប់
            </span>
          </button>
        </div>

        {/* Submit Button */}
        <div className="p-4">
          <button
            onClick={handleShare}
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {loading ? '...' : shareType === 'repost' ? 'ប្រកាសឡើងវិញ' : 'បញ្ចេញមតិ'}
          </button>
        </div>
      </div>
    </div>
  );
};
