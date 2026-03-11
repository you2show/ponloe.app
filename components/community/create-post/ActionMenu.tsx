import { HugeiconsIcon } from '@hugeicons/react';
import { BookOpen01Icon, Calendar01Icon, Cancel01Icon, CharityIcon, ChartBarLineIcon, File01Icon, HappyIcon, Image01Icon, LibraryIcon, Location01Icon, Mic01Icon, Store01Icon, Tag01Icon, TextIcon, UserIcon, Video01Icon, VideoReplayIcon } from '@hugeicons/core-free-icons';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ActionMenuProps {
  show: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  currentType: string;
  isGeneralUser?: boolean;
  isAdmin?: boolean;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ show, onClose, onSelect, currentType, isGeneralUser, isAdmin }) => {
  const { theme } = useTheme();
  if (!show) return null;

  const allMenuGrid = [
    { id: 'image', label: 'រូបភាព/វីដេអូ', icon: Image01Icon, color: 'text-green-500' },
    { id: 'tag', label: 'Tag មិត្តភក្តិ', icon: Tag01Icon, color: 'text-blue-500' },
    { id: 'feeling', label: 'អារម្មណ៍/សកម្មភាព', icon: HappyIcon, color: 'text-yellow-500' },
    { id: 'checkin', label: 'Check in', icon: Location01Icon, color: 'text-red-500' },
    { id: 'live', label: 'វីដេអូផ្សាយផ្ទាល់', icon: VideoReplayIcon, color: 'text-red-600' },
    { id: 'bg', label: 'ពណ៌ផ្ទៃខាងក្រោយ', icon: TextIcon, color: 'text-teal-500' },
    { id: 'camera', label: 'កាមេរ៉ា', icon: UserIcon, color: 'text-blue-400' },
    { id: 'event', label: 'ព្រឹត្តិការណ៍', icon: Calendar01Icon, color: 'text-orange-500' },
    // Custom Features
    { id: 'article', label: 'សរសេរអត្ថបទ', icon: File01Icon, color: 'text-purple-600' },
    { id: 'audio', label: 'សំឡេង', icon: Mic01Icon, color: 'text-rose-500' },
    { id: 'book', label: 'សៀវភៅ', icon: LibraryIcon, color: 'text-cyan-600' },
    { id: 'market', label: 'លក់ទំនិញ', icon: Store01Icon, color: 'text-indigo-600' },
    { id: 'poll', label: 'ស្ទង់មតិ', icon: ChartBarLineIcon, color: 'text-blue-600' },
    { id: 'quran', label: 'គម្ពីរគួរអាន', icon: BookOpen01Icon, color: 'text-emerald-600' },
    { id: 'dua', label: 'សុំឌូអា', icon: CharityIcon, color: 'text-amber-500' },
  ];

  // Filter options based on user role
  let menuGrid = isGeneralUser 
    ? allMenuGrid.filter(item => ['poll', 'quran', 'dua'].includes(item.id))
    : allMenuGrid;

  return (
    <div 
      role="menu"
      aria-label="Post actions"
      className={`absolute inset-x-0 bottom-0 z-30 rounded-t-xl md:rounded-none md:top-14 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col h-[60%] md:h-auto animate-in slide-in-from-bottom duration-300 border-t ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}
    >
        {/* Mobile Handle */}
        <div className="w-full flex justify-center pt-3 pb-1 cursor-pointer md:hidden" onClick={onClose} aria-hidden="true">
            <div className={`w-12 h-1.5 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
        </div>

        <div className={`px-4 py-3 flex justify-between items-center border-b md:hidden ${theme === 'dark' ? 'border-slate-800' : 'border-gray-100'}`}>
            <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>បន្ថែមទៅការបង្ហោះ</span>
            <button 
              onClick={onClose} 
              aria-label="Close menu"
              className={`p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}/>
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" role="none">
            <div className="grid grid-cols-2 gap-3" role="none">
                {menuGrid.map((action) => (
                    <button 
                        key={action.id}
                        role="menuitem"
                        onClick={() => onSelect(action.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors text-left focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          currentType === action.id 
                            ? theme === 'dark' ? 'bg-emerald-900/30 border-emerald-800' : 'bg-emerald-50 border-emerald-200'
                            : theme === 'dark' ? 'border-transparent hover:bg-slate-800 hover:border-slate-700' : 'border-transparent hover:bg-gray-50 hover:border-gray-100'
                        }`}
                    >
                        <HugeiconsIcon icon={action.icon} strokeWidth={1.5} className={`w-6 h-6 ${action.color}`} />
                        <span className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-gray-700'}`}>{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
};
