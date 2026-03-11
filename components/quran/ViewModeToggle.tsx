import { HugeiconsIcon } from '@hugeicons/react';
import { ListViewIcon, BookOpen01Icon } from '@hugeicons/core-free-icons';
import React from 'react';

import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'motion/react';

interface ViewModeToggleProps {
  viewMode: 'verse-by-verse' | 'reading';
  setViewMode: (mode: 'verse-by-verse' | 'reading') => void;
  readingMode: 'arabic' | 'translation';
  setReadingMode: (mode: 'arabic' | 'translation') => void;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  setViewMode,
  readingMode,
  setReadingMode
}) => {
  const { theme } = useTheme();
  return (
    <div className="flex items-center gap-1">
      <div className={`border rounded-full p-1 flex items-center shadow-sm relative ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-100 border-gray-200'}`}>
        <button
            onClick={() => setViewMode('verse-by-verse')}
            className={`relative z-10 flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-300 ${
                viewMode === 'verse-by-verse' 
                ? 'text-white' 
                : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-900')
            }`}
            title="Verse by Verse"
        >
            {viewMode === 'verse-by-verse' && (
              <motion.div
                layoutId="viewModePill"
                className={`absolute inset-0 rounded-full shadow-md ${theme === 'dark' ? 'bg-emerald-600' : 'bg-gray-900'}`}
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <HugeiconsIcon icon={ListViewIcon} strokeWidth={1.5} className="w-4 h-4 relative z-10" />
            <span className="hidden lg:inline relative z-10">Verse by Verse</span>
        </button>
        
        {viewMode === 'verse-by-verse' && (
            <button
                onClick={() => setViewMode('reading')}
                className={`relative z-10 flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-300 ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-900'}`}
                title="Reading"
            >
                <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className="w-4 h-4 relative z-10" />
                <span className="hidden lg:inline relative z-10">Reading</span>
            </button>
        )}
      </div>

      {/* Reading Mode Sub-toggle - Only show when in reading mode */}
      <div className={`overflow-hidden transition-all duration-300 ease-out flex items-center ${viewMode === 'reading' ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'}`}>
        <div className={`flex items-center border rounded-full p-1 shrink-0 shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-100 border-gray-200'}`}>
            <button
                onClick={() => setReadingMode('arabic')}
                className={`relative z-10 flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-300 ${
                    readingMode === 'arabic' 
                    ? 'text-white' 
                    : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-900')
                }`}
                title="Arabic"
            >
                {readingMode === 'arabic' && (
                  <motion.div
                    layoutId="readingModeSubPill"
                    className={`absolute inset-0 rounded-full shadow-md ${theme === 'dark' ? 'bg-emerald-600' : 'bg-gray-900'}`}
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="font-amiri-quran text-lg leading-none relative z-10">ع</span>
                <span className="hidden lg:inline relative z-10">Arabic</span>
            </button>
            <button
                onClick={() => setReadingMode('translation')}
                className={`relative z-10 flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-300 ${
                    readingMode === 'translation' 
                    ? 'text-white' 
                    : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-900')
                }`}
                title="Translation"
            >
                {readingMode === 'translation' && (
                  <motion.div
                    layoutId="readingModeSubPill"
                    className={`absolute inset-0 rounded-full shadow-md ${theme === 'dark' ? 'bg-emerald-600' : 'bg-gray-900'}`}
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="font-khmer relative z-10">A</span>
                <span className="hidden lg:inline relative z-10">Translation</span>
            </button>
        </div>
      </div>
    </div>
  );
};
