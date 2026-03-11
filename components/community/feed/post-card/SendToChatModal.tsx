import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Search01Icon, SentIcon, CheckmarkCircle01Icon } from '@hugeicons/core-free-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useChat } from '@/contexts/ChatContext';
import { Post } from '../../shared';

interface SendToChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
}

export const SendToChatModal: React.FC<SendToChatModalProps> = ({ isOpen, onClose, post }) => {
  const { theme } = useTheme();
  const { chats, sendMessage } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  // Filter out AI and Market chats, only show general and ustaz
  const availableFriends = chats.filter(chat => !chat.isAi && !chat.isMarket);

  const filteredFriends = availableFriends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFriend = (id: string) => {
    setSelectedFriends(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const handleSend = () => {
    if (selectedFriends.length === 0) return;
    setIsSending(true);
    
    // Send message to each selected friend
    selectedFriends.forEach(friendId => {
      // Handle image extraction
      let previewImage = post.image;
      if (!previewImage && post.images && post.images.length > 0) {
        const firstImg = post.images[0];
        previewImage = typeof firstImg === 'string' ? firstImg : firstImg.url;
      }

      sendMessage(
        friendId, 
        `Check out this post!`, 
        true, 
        post.id,
        post
      );
    });

    // Simulate API call delay for UX
    setTimeout(() => {
      setIsSending(false);
      setShowSuccess(true);
      
      // Close modal after showing success
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        setSelectedFriends([]);
        setSearchQuery('');
      }, 2000);
      
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!isSending && !showSuccess ? onClose : undefined} />
      
      <div 
        className="relative w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-300 bg-white dark:bg-slate-900 dark:border dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {showSuccess ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-khmer mb-2 text-gray-900 dark:text-white">
              បានផ្ញើដោយជោគជ័យ!
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              សាររបស់អ្នកត្រូវបានផ្ញើទៅកាន់មិត្តភក្តិរួចរាល់។
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between border-gray-100 dark:border-slate-800">
              <h3 className="font-bold text-lg font-khmer text-gray-900 dark:text-white">ផ្ញើទៅកាន់ (Send to)</h3>
              <button onClick={onClose} disabled={isSending} className="p-2 rounded-full transition-colors hover:bg-gray-100 text-gray-500 dark:hover:bg-slate-800 dark:text-slate-400">
                <HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 pb-2">
              <div className="relative rounded-full flex items-center px-3 py-2 bg-gray-100 dark:bg-slate-800">
                <HugeiconsIcon icon={Search01Icon} className="w-4 h-4 text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="ស្វែងរកមិត្តភក្តិ..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-sm font-khmer text-gray-900 placeholder-gray-500 dark:text-white dark:placeholder-slate-500"
                />
              </div>
            </div>

            {/* Friends List */}
            <div className="flex-1 overflow-y-auto p-2">
              {filteredFriends.map(friend => (
                <div 
                  key={friend.id}
                  onClick={() => toggleFriend(friend.id)}
                  className="flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full object-cover" />
                  <span className="flex-1 font-medium text-sm text-gray-900 dark:text-white">{friend.name}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    selectedFriends.includes(friend.id) 
                      ? 'bg-emerald-500 border-emerald-500' 
                      : 'border-gray-300 dark:border-slate-600'
                  }`}>
                    {selectedFriends.includes(friend.id) && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </div>
              ))}
              {filteredFriends.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm font-khmer">
                  រកមិនឃើញមិត្តភក្តិទេ
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-800">
              <button 
                onClick={handleSend}
                disabled={selectedFriends.length === 0 || isSending}
                className={`w-full py-3 rounded-xl font-bold font-khmer flex items-center justify-center gap-2 transition-all ${
                  selectedFriends.length > 0 && !isSending
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500'
                }`}
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <HugeiconsIcon icon={SentIcon} className="w-5 h-5" />
                    ផ្ញើ {selectedFriends.length > 0 ? `(${selectedFriends.length})` : ''}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
