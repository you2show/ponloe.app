import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, ArrowLeft01Icon, ArrowRight01Icon, CheckmarkCircle02Icon, TextIcon, BookOpen01Icon, BulbIcon } from '@hugeicons/core-free-icons';

import React, { useState, useEffect, useRef } from 'react';

import { Lesson, LESSONS } from './data';

interface LessonReaderProps {
  lesson: Lesson;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  isCompleted: boolean;
  onComplete: () => void;
}

export const LessonReader: React.FC<LessonReaderProps> = ({
  lesson, onClose, onNext, onPrev, hasPrev, hasNext, isCompleted, onComplete
}) => {
  const [fontSize, setFontSize] = useState(18);
  const [progress, setProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Calculate current index for "Lesson X of Y" display
  const currentIndex = LESSONS.findIndex(l => l.id === lesson.id) + 1;
  const totalLessons = LESSONS.length;

  // Scroll Progress
  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const totalScroll = scrollHeight - clientHeight;
      const currentProgress = (scrollTop / totalScroll) * 100;
      setProgress(Math.min(100, Math.max(0, currentProgress)));
    }
  };

  useEffect(() => {
    const el = contentRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, [lesson]); // Reset on lesson change

  return (
    <div className="fixed inset-0 md:left-20 z-[100] bg-white flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Progress Bar */}
      <div className="h-1.5 bg-gray-100 w-full">
        <div 
          className="h-full bg-emerald-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-6 h-6" />
          </button>
          <div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
               <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className="w-3 h-3" />
               មេរៀនទី {currentIndex} នៃ {totalLessons}
            </span>
            <h2 className="text-sm md:text-base font-bold text-gray-900 truncate max-w-[200px] md:max-w-md font-khmer">
              {lesson.title}
            </h2>
          </div>
        </div>
        
        {/* Font Controls */}
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
           <button 
             onClick={() => setFontSize(Math.max(14, fontSize - 2))}
             className="p-1.5 text-gray-500 hover:text-emerald-600 rounded-md"
           >
             <HugeiconsIcon icon={TextIcon} strokeWidth={1.5} className="w-3 h-3" />
           </button>
           <span className="text-xs font-mono text-gray-400 w-6 text-center">{fontSize}</span>
           <button 
             onClick={() => setFontSize(Math.min(32, fontSize + 2))}
             className="p-1.5 text-gray-500 hover:text-emerald-600 rounded-md"
           >
             <HugeiconsIcon icon={TextIcon} strokeWidth={1.5} className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Content Area */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto bg-white"
      >
        <div className="max-w-2xl mx-auto px-6 py-10 md:py-16">
           {/* Lesson Header in Content */}
           <div className="mb-10 text-center">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold mb-4">
                 {lesson.duration} អាន
              </span>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 font-khmer leading-tight">
                 {lesson.title}
              </h1>
           </div>

           {/* Dynamic Content */}
           <div 
             className="font-khmer text-gray-700 leading-loose transition-all duration-200"
             style={{ fontSize: `${fontSize}px` }}
             dangerouslySetInnerHTML={{ __html: lesson.content }}
           />

           {/* Reflection / Takeaway Section (Meaningful Addition) */}
           <div className="mt-16 bg-amber-50 rounded-2xl p-6 border border-amber-100">
              <div className="flex items-start gap-3">
                 <div className="p-2 bg-amber-100 rounded-full text-amber-600 shrink-0">
                    <HugeiconsIcon icon={BulbIcon} strokeWidth={1.5} className="w-5 h-5" />
                 </div>
                 <div>
                    <h3 className="font-bold text-amber-800 font-khmer text-lg mb-2">ត្រិះរិះពិចារណា</h3>
                    <p className="text-amber-700/80 font-khmer text-sm leading-relaxed">
                       មុននឹងបន្តទៅមុខ សូមចំណាយពេលបន្តិចដើម្បីគិតអំពីអ្វីដែលអ្នកបានអាន។ តើចំណុចមួយណាដែលសំខាន់បំផុតសម្រាប់ជីវិតប្រចាំថ្ងៃរបស់អ្នក?
                    </p>
                 </div>
              </div>
           </div>

           {/* Completion Area */}
           <div className="mt-8 pt-8 border-t border-gray-100 text-center">
              <button
                onClick={onComplete}
                disabled={isCompleted}
                className={`
                  px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 mx-auto transition-all transform hover:scale-105 active:scale-95
                  ${isCompleted 
                    ? 'bg-emerald-100 text-emerald-700 cursor-default ring-2 ring-emerald-500 ring-offset-2' 
                    : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700'
                  }
                `}
              >
                {isCompleted ? (
                  <>
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="w-6 h-6" /> បានបញ្ចប់
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="w-6 h-6" /> ខ្ញុំបានអានចប់
                  </>
                )}
              </button>
           </div>
        </div>
      </div>

      {/* Footer Navigation - Fixed: Prev Left, Next Right */}
      <div className="px-6 py-4 border-t border-gray-100 bg-white/90 backdrop-blur-md flex justify-between items-center shrink-0 z-20">
         
         {/* Previous Button */}
         <button 
           onClick={onPrev}
           disabled={!hasPrev}
           className={`
             flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all
             ${hasPrev 
               ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' 
               : 'text-gray-300 cursor-not-allowed opacity-50'
             }
           `}
         >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-5 h-5" />
            <span className="hidden sm:inline font-khmer">មេរៀនមុន</span>
         </button>

         {/* Next Button */}
         <button 
           onClick={onNext}
           disabled={!hasNext}
           className={`
             flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm
             ${hasNext 
               ? 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-md transform hover:-translate-y-0.5' 
               : 'bg-gray-100 text-gray-400 cursor-not-allowed'
             }
           `}
         >
            <span className="hidden sm:inline font-khmer">មេរៀនបន្ទាប់</span>
            <span className="sm:hidden font-khmer">បន្ទាប់</span>
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="w-5 h-5" />
         </button>
      </div>

    </div>
  );
};
