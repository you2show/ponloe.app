import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, ArrowLeft01Icon, BookOpen01Icon, Calendar01Icon, Cancel01Icon, CharityIcon, ChartBarLineIcon, GiftIcon, Globe02Icon, HappyIcon, HelpCircleIcon, Image01Icon, Location01Icon, MoreHorizontalIcon, QuoteDownIcon, Store01Icon, Tag01Icon, TextIcon, UserIcon, Video01Icon, VideoReplayIcon } from '@hugeicons/core-free-icons';

import React, { useState, useRef, useEffect } from 'react';

import { MOCK_USER } from './shared';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (content: string) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onPost }) => {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false); // Track if user is typing
  const [showDrawer, setShowDrawer] = useState(false); // Track "More" drawer
  const [postType, setPostType] = useState('text');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      // Small delay to allow animation
      setTimeout(() => {
        // On mobile we might not want auto-focus immediately to show the full list first
        // But user can click to focus
      }, 300);
    }
  }, [isOpen]);

  const handlePost = () => {
    if (content.trim()) {
      onPost(content);
      setContent('');
      setIsFocused(false);
      setShowDrawer(false);
      onClose();
    }
  };

  const allActions = [
    { id: 'image', label: 'រូបភាព/វីដេអូ', icon: Image01Icon, color: 'text-green-500' },
    { id: 'tag', label: 'Tag មិត្តភក្តិ', icon: Tag01Icon, color: 'text-blue-500' },
    { id: 'feeling', label: 'អារម្មណ៍/សកម្មភាព', icon: HappyIcon, color: 'text-yellow-500' },
    { id: 'checkin', label: 'Check in', icon: Location01Icon, color: 'text-red-500' },
    { id: 'live', label: 'វីដេអូផ្សាយផ្ទាល់', icon: VideoReplayIcon, color: 'text-red-600' },
    { id: 'bg', label: 'ពណ៌ផ្ទៃខាងក្រោយ', icon: TextIcon, color: 'text-teal-500' }, // New
    { id: 'camera', label: 'កាមេរ៉ា', icon: UserIcon, color: 'text-blue-400' },
    { id: 'event', label: 'ព្រឹត្តិការណ៍', icon: Calendar01Icon, color: 'text-orange-500' },
  ];

  // Helper to render the list of actions (Vertical List)
  const renderActionList = () => (
    <div className="px-4 pb-4">
      {allActions.map((action) => (
        <button 
          key={action.id}
          className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 rounded-xl transition-colors text-left"
        >
          <HugeiconsIcon icon={action.icon} strokeWidth={1.5} className={`w-6 h-6 ${action.color}`} />
          <span className="text-gray-700 font-medium text-sm">{action.label}</span>
        </button>
      ))}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Main Container */}
      <div className={`
        bg-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden relative transition-all duration-300
        ${showDrawer ? 'bg-gray-900' : 'bg-white'} 
      `}>
        
        {/* Header */}
        <div className={`px-4 py-3 border-b flex justify-between items-center z-20 ${showDrawer ? 'bg-white border-gray-100' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <button 
                onClick={onClose}
                className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-6 h-6" />
            </button>
            <h3 className="font-bold text-lg text-gray-900">បង្កើតការបង្ហោះ</h3>
          </div>
          
          <div className="flex gap-2">
             <button 
                onClick={onClose}
                className="hidden md:block p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200"
            >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
            </button>
            <button 
                onClick={handlePost}
                disabled={!content.trim()}
                className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-lg disabled:opacity-50 text-sm"
            >
                បង្ហោះ
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div 
            className="flex-1 overflow-y-auto custom-scrollbar relative bg-white"
            onClick={() => {
                // Determine if we should focus
                if (!showDrawer) {
                    textareaRef.current?.focus();
                }
            }}
        >
            {/* User Profile */}
            <div className="px-4 pt-4 flex gap-3 mb-2">
                <img referrerPolicy="no-referrer" src={MOCK_USER.avatar} alt="Me" className="w-10 h-10 rounded-full object-cover" />
                <div>
                    <h4 className="font-bold text-sm text-gray-900">{MOCK_USER.name}</h4>
                    <button className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-xs font-bold text-gray-600 w-fit mt-0.5">
                        <HugeiconsIcon icon={Globe02Icon} strokeWidth={1.5} className="w-3 h-3" />
                        <span>Public</span>
                        <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={1.5} className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Input Area */}
            <textarea 
                ref={textareaRef}
                value={content}
                onFocus={() => {
                    setIsFocused(true);
                    setShowDrawer(false);
                }}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`តើអ្នកកំពុងគិតអ្វី ${MOCK_USER.name.split(' ')[0]}?`}
                className={`w-full px-4 py-2 text-lg md:text-xl placeholder-gray-400 outline-none resize-none font-khmer leading-relaxed bg-transparent
                    ${isFocused ? 'min-h-[200px]' : 'h-32'} 
                `}
            />

            {/* State 1: Default List (Show when NOT focused) */}
            {!isFocused && !content && (
                <div className="animate-in slide-in-from-bottom-4 duration-300">
                    <div className="px-4 py-2 border-t border-gray-100 mt-2">
                        {renderActionList()}
                    </div>
                </div>
            )}
        </div>

        {/* State 2 & 3: Horizontal Toolbar (Show when Focused) */}
        {isFocused && (
            <div className="p-3 border-t border-gray-100 bg-white z-20 animate-in slide-in-from-bottom-full duration-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar">
                        <button className="p-2 text-green-500 hover:bg-gray-100 rounded-full"><HugeiconsIcon icon={Image01Icon} strokeWidth={1.5} className="w-6 h-6" /></button>
                        <button className="p-2 text-blue-500 hover:bg-gray-100 rounded-full"><HugeiconsIcon icon={Tag01Icon} strokeWidth={1.5} className="w-6 h-6" /></button>
                        <button className="p-2 text-yellow-500 hover:bg-gray-100 rounded-full"><HugeiconsIcon icon={HappyIcon} strokeWidth={1.5} className="w-6 h-6" /></button>
                        <button className="p-2 text-red-500 hover:bg-gray-100 rounded-full"><HugeiconsIcon icon={Location01Icon} strokeWidth={1.5} className="w-6 h-6" /></button>
                        <div className="w-px h-6 bg-gray-200 mx-1"></div>
                        <button 
                            onClick={() => {
                                setShowDrawer(true);
                                textareaRef.current?.blur(); // Blur to hide keyboard on mobile
                            }}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                        >
                            <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.5} className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* State 3: Drawer (Slide Up Overlay) */}
        {showDrawer && (
            <div 
                className="absolute inset-x-0 bottom-0 z-30 bg-white rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom duration-300 flex flex-col h-[70%]"
            >
                {/* Drawer Handle */}
                <div className="w-full flex justify-center pt-3 pb-1" onClick={() => setShowDrawer(false)}>
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                </div>

                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <span className="font-bold text-gray-900">បន្ថែមទៅការបង្ហោះ</span>
                    <button onClick={() => setShowDrawer(false)} className="bg-gray-100 p-1 rounded-full"><HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5 text-gray-500"/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    <div className="grid grid-cols-2 gap-2">
                        {allActions.map((action) => (
                            <button 
                                key={action.id}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 text-left transition-colors"
                            >
                                <HugeiconsIcon icon={action.icon} strokeWidth={1.5} className={`w-6 h-6 ${action.color}`} />
                                <span className="text-sm font-bold text-gray-700">{action.label}</span>
                            </button>
                        ))}
                        {/* Extra Items for Drawer */}
                        <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left"><HugeiconsIcon icon={ChartBarLineIcon} strokeWidth={1.5} className="w-6 h-6 text-teal-600" /> <span className="text-sm font-bold text-gray-700">ស្ទង់មតិ</span></button>
                        <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left"><HugeiconsIcon icon={Store01Icon} strokeWidth={1.5} className="w-6 h-6 text-indigo-600" /> <span className="text-sm font-bold text-gray-700">លក់ទំនិញ</span></button>
                        <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left"><HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className="w-6 h-6 text-emerald-600" /> <span className="text-sm font-bold text-gray-700">ចែករំលែកគម្ពីរ</span></button>
                        <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left"><HugeiconsIcon icon={CharityIcon} strokeWidth={1.5} className="w-6 h-6 text-amber-600" /> <span className="text-sm font-bold text-gray-700">សុំឌូអា</span></button>
                    </div>
                </div>
            </div>
        )}

        {/* Overlay when drawer is open to simulate the "Text area turns black/dim" effect requested */}
        {showDrawer && (
            <div 
                className="absolute inset-0 bg-black/60 z-20 transition-opacity"
                onClick={() => setShowDrawer(false)}
            ></div>
        )}

      </div>
    </div>
  );
};