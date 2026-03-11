import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Attachment01Icon, 
  Mic01Icon, 
  SentIcon,
  SparklesIcon,
  BookOpen01Icon,
  PrayerRugIcon,
  Moon02Icon
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface ChatInputProps {
  messageInput: string;
  setMessageInput: (val: string) => void;
  handleSendMessage: () => void;
  showQuickActions: boolean;
  setShowQuickActions: (val: boolean) => void;
  handleQuickAction: (action: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  messageInput,
  setMessageInput,
  handleSendMessage,
  showQuickActions,
  setShowQuickActions,
  handleQuickAction
}) => {
  const { theme } = useTheme();

  return (
    <div className={`p-3 z-20 ${
      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
    }`}>
      {/* Quick Actions Popup */}
      {showQuickActions && (
         <div className={`absolute bottom-20 left-4 p-2 rounded-xl shadow-lg border mb-2 animate-in slide-in-from-bottom-5 fade-in duration-200 ${
            theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
         }`}>
            <div className="grid grid-cols-2 gap-2 w-64">
               <button onClick={() => handleQuickAction('dua')} className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                     <HugeiconsIcon icon={PrayerRugIcon} className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">Dua Request</span>
               </button>
               <button onClick={() => handleQuickAction('quran')} className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                     <HugeiconsIcon icon={BookOpen01Icon} className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">Quran Verse</span>
               </button>
               <button onClick={() => handleQuickAction('hadith')} className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                     <HugeiconsIcon icon={Moon02Icon} className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">Hadith</span>
               </button>
               <button className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                     <HugeiconsIcon icon={SparklesIcon} className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">Ask AI</span>
               </button>
            </div>
         </div>
      )}

      <div className={`flex items-end gap-2 rounded-3xl px-2 py-2 shadow-sm border ${
        theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <button 
          onClick={() => setShowQuickActions(!showQuickActions)}
          className={`p-2 rounded-full transition-colors shrink-0 mb-0.5 ${
             showQuickActions 
             ? 'bg-emerald-100 text-emerald-600 rotate-45' 
             : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
          <HugeiconsIcon icon={Attachment01Icon} className="w-5 h-5 transition-transform duration-200" />
        </button>
        <textarea 
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="វាយបញ្ចូលសារ..."
          className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 min-h-[40px] py-2.5 text-sm font-khmer text-gray-900 dark:text-white"
          rows={1}
        />
        {messageInput.trim() ? (
          <button 
            onClick={handleSendMessage}
            className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors shrink-0 mb-0.5 shadow-md hover:shadow-lg transform active:scale-95 duration-200"
          >
            <HugeiconsIcon icon={SentIcon} className="w-5 h-5" />
          </button>
        ) : (
          <button className="p-2 text-gray-500 hover:text-emerald-600 transition-colors shrink-0 mb-0.5">
            <HugeiconsIcon icon={Mic01Icon} className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
