import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  ArrowLeft01Icon, 
  MoreVerticalIcon, 
  TelephoneIcon, 
  VideoReplayIcon, 
  SparklesIcon,
  ViewOffIcon,
  Share01Icon
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface ChatHeaderProps {
  selectedChat: any;
  setSelectedChatId: (id: string | null) => void;
  isTyping: boolean;
  isAnonymous: boolean;
  setIsAnonymous: (val: boolean) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedChat,
  setSelectedChatId,
  isTyping,
  isAnonymous,
  setIsAnonymous
}) => {
  const { theme } = useTheme();

  if (!selectedChat) return null;

  return (
    <div className={`p-3 border-b flex items-center justify-between z-10 shadow-sm ${
      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setSelectedChatId(null)}
          className="lg:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="w-5 h-5" />
        </button>
        <div className="relative">
           <img src={selectedChat.avatar} alt={selectedChat.name} className="w-10 h-10 rounded-full object-cover" />
           {selectedChat.isAi && (
              <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 rounded-full p-0.5 border border-white">
                <HugeiconsIcon icon={SparklesIcon} className="w-2.5 h-2.5 text-white" />
              </div>
           )}
        </div>
        <div>
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1">
            {selectedChat.name}
            {selectedChat.isAi && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">Assistant</span>}
          </h3>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {isTyping ? 'Typing...' : 'Online'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 text-gray-500 dark:text-slate-400">
        {selectedChat.type === 'ustaz' && !selectedChat.isAi && (
          <>
            <button 
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`p-2 rounded-full transition-colors flex items-center gap-1 text-xs font-medium ${
                isAnonymous 
                  ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' 
                  : 'hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
              title="សួរដោយលាក់ឈ្មោះ (Ask Anonymously)"
            >
              <HugeiconsIcon icon={ViewOffIcon} className="w-4 h-4" />
              <span className="hidden lg:inline">លាក់ឈ្មោះ</span>
            </button>
            <button 
              className="p-2 rounded-full hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 text-xs font-medium"
              title="Publish to Feed (For Ustaz)"
            >
              <HugeiconsIcon icon={Share01Icon} className="w-4 h-4" />
            </button>
          </>
        )}
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
          <HugeiconsIcon icon={TelephoneIcon} className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
          <HugeiconsIcon icon={MoreVerticalIcon} className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
