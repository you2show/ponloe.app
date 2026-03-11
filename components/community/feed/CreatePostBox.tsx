import { HugeiconsIcon } from '@hugeicons/react';
import { CharityIcon, Image01Icon, ChartBarLineIcon } from '@hugeicons/core-free-icons';

import React, { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { MOCK_USER } from '../shared';
import { CreatePostModal, PostType } from '../create-post/CreatePostModal';
import { ImageLayoutType } from '../create-post/image/ImageLayoutSelector';

export const CreatePostBox: React.FC<{ onPost: (content: string, type: PostType, images?: any[], layout?: ImageLayoutType, extraData?: any) => void }> = ({ onPost }) => {
  const { user, profile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialType, setInitialType] = useState<PostType>('text');

  // Determine allowed post types based on role
  const isGeneralUser = profile?.role === 'general';

  const openModal = (type: PostType = 'text') => {
      setInitialType(type);
      setIsModalOpen(true);
  };

  const handlePostSubmit = (content: string, type: PostType, images?: any[], layout?: ImageLayoutType, extraData?: any) => {
      onPost(content, type, images, layout, extraData);
  };

  const avatarUrl = profile?.avatar_url || MOCK_USER.avatar;
  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : MOCK_USER.name.split(' ')[0];

  return (
    <>
      {/* 1. Collapsed View (The Card Trigger) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-4 mb-4">
        <div className="flex gap-3 mb-4">
          <img src={avatarUrl || undefined} alt="Me" className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
          <div 
            className="flex-1 rounded-full px-4 py-2.5 cursor-pointer transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700" 
            onClick={() => openModal('text')}
          >
             <span className="text-gray-500 dark:text-slate-400 font-khmer text-sm truncate block">តើអ្នកកំពុងគិតអ្វី {firstName}?</span>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-slate-800">
           <button onClick={() => openModal('dua')} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-slate-800">
              <HugeiconsIcon icon={CharityIcon} strokeWidth={1.5} className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-bold font-khmer text-gray-600 dark:text-slate-300">សុំឌូអា</span>
           </button>
           {!isGeneralUser && (
             <button onClick={() => openModal('image')} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-slate-800">
                <HugeiconsIcon icon={Image01Icon} strokeWidth={1.5} className="w-5 h-5 text-green-500" />
                <span className="text-sm font-bold font-khmer text-gray-600 dark:text-slate-300">រូបភាព</span>
             </button>
           )}
           <button onClick={() => openModal('poll')} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-slate-800">
              <HugeiconsIcon icon={ChartBarLineIcon} strokeWidth={1.5} className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-bold font-khmer text-gray-600 dark:text-slate-300">ស្ទង់មតិ</span>
           </button>
        </div>
      </div>

      {/* 2. New Modal */}
      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPost={handlePostSubmit}
        initialType={initialType}
      />
    </>
  );
};
