import React, { useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Search01Icon, 
  UserMultiple02Icon,
  MessageMultiple01Icon,
  Store01Icon,
  SparklesIcon,
  Notification01Icon
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface ChatSidebarProps {
  activeTab: 'general' | 'ustaz' | 'requests' | 'market';
  setActiveTab: (tab: 'general' | 'ustaz' | 'requests' | 'market') => void;
  filteredChats: any[];
  selectedChatId: string | null;
  setSelectedChatId: (id: string | null) => void;
  onBack?: () => void;
  loading?: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  activeTab,
  setActiveTab,
  filteredChats,
  selectedChatId,
  setSelectedChatId,
  onBack,
  loading
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mouse drag scrolling state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const searchedChats = filteredChats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`w-full lg:w-[350px] flex flex-col border-r ${
      theme === 'dark' ? 'border-slate-800' : 'border-gray-200'
    } ${selectedChatId ? 'hidden lg:flex' : 'flex'} h-full`}>
      
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="lg:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white">
            <HugeiconsIcon icon={MessageMultiple01Icon} className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-xl font-bold font-khmer text-gray-900 dark:text-white">សារ (Chats)</h2>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className={`relative rounded-full flex items-center px-3 py-2 ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'
        }`}>
          <HugeiconsIcon icon={Search01Icon} className="w-4 h-4 text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="ស្វែងរក..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-sm font-khmer text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Tabs */}
      <div 
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`flex px-3 gap-2 mb-2 overflow-x-auto no-scrollbar ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <button 
          onClick={() => setActiveTab('general')}
          className={`px-4 py-1.5 rounded-full text-sm font-khmer whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'general' 
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium' 
              : 'text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <HugeiconsIcon icon={MessageMultiple01Icon} className="w-3.5 h-3.5" />
          សារទូទៅ
        </button>
        <button 
          onClick={() => setActiveTab('ustaz')}
          className={`px-4 py-1.5 rounded-full text-sm font-khmer whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'ustaz' 
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium' 
              : 'text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <HugeiconsIcon icon={UserMultiple02Icon} className="w-3.5 h-3.5" />
          អ៊ូស្តាត
        </button>
        <button 
          onClick={() => setActiveTab('market')}
          className={`px-4 py-1.5 rounded-full text-sm font-khmer whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'market' 
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium' 
              : 'text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <HugeiconsIcon icon={Store01Icon} className="w-3.5 h-3.5" />
          ផ្សារ
        </button>
        <button 
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-1.5 rounded-full text-sm font-khmer whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'requests' 
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium' 
              : 'text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <HugeiconsIcon icon={Notification01Icon} className="w-3.5 h-3.5" />
          សំណើ
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <>
            {searchedChats.map(chat => (
              <div 
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-transparent hover:border-gray-100 dark:hover:border-slate-800 ${
                  selectedChatId === chat.id 
                    ? (theme === 'dark' ? 'bg-slate-800' : 'bg-emerald-50') 
                    : (theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50')
                }`}
              >
                <div className="relative">
                  <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-slate-700" />
                  {chat.isAi && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white dark:border-slate-900">
                      <HugeiconsIcon icon={SparklesIcon} className="w-3 h-3" />
                    </div>
                  )}
                  {chat.unread > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] text-white font-bold">
                      {chat.unread}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="font-semibold text-sm truncate text-gray-900 dark:text-white flex items-center gap-1">
                      {chat.name}
                      {chat.isAi && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">AI</span>}
                    </h4>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">{chat.time}</span>
                  </div>
                  <p className={`text-sm truncate ${chat.unread > 0 ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400'}`}>
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            ))}
            {searchedChats.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm font-khmer">
                រកមិនឃើញសារទេ
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
