import { MapsIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon, CircleIcon, ArrowRight01Icon, BookOpen01Icon, StarIcon, ChampionIcon, CleanIcon } from '@hugeicons/core-free-icons';

import React, { useState, useEffect } from 'react';

import { LESSONS, Lesson } from './data';
import { LessonReader } from './LessonReader';

export const StartHereView: React.FC = () => {
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem('ponloe_start_progress');
    if (saved) {
      setCompletedLessons(new Set(JSON.parse(saved)));
    }
  }, []);

  const markComplete = (id: string) => {
    const newSet = new Set(completedLessons);
    newSet.add(id);
    setCompletedLessons(newSet);
    localStorage.setItem('ponloe_start_progress', JSON.stringify(Array.from(newSet)));
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setActiveLesson(lesson);
  };

  const navigateLesson = (direction: 'next' | 'prev') => {
    if (!activeLesson) return;
    const currentIndex = LESSONS.findIndex(l => l.id === activeLesson.id);
    if (direction === 'next' && currentIndex < LESSONS.length - 1) {
      setActiveLesson(LESSONS[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      setActiveLesson(LESSONS[currentIndex - 1]);
    }
  };

  const activeIndex = activeLesson ? LESSONS.findIndex(l => l.id === activeLesson.id) : -1;
  const progressPercentage = Math.round((completedLessons.size / LESSONS.length) * 100);

  // Circular Progress Calculation (Fixed ViewBox)
  // Using 100x100 coordinate system
  const radius = 40; 
  const center = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  // Dynamic Message
  const getMotivationalMessage = () => {
    if (progressPercentage === 0) return "ចាប់ផ្តើមដំណើររបស់អ្នក";
    if (progressPercentage < 50) return "ការចាប់ផ្តើមដ៏ល្អ!";
    if (progressPercentage < 100) return "បន្តដំណើរទៅមុខទៀត...";
    return "អបអរសាទរ! អ្នកបានបញ្ចប់ហើយ";
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-in fade-in duration-300">
      
      {/* Hero Section */}
      <div className="bg-[#0f3d35] text-white relative overflow-hidden rounded-b-[3rem] shadow-xl pb-16">
         {/* Pattern Overlay */}
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -mr-16 -mt-16"></div>
         <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -ml-10 -mb-10"></div>

         <div className="relative max-w-4xl mx-auto px-6 pt-12 pb-12 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl mb-6 shadow-inner ring-1 ring-white/20">
               <HugeiconsIcon icon={MapsIcon} strokeWidth={1.5} className="w-8 h-8 text-emerald-300" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-khmer mb-4 leading-tight">
               សូមស្វាគមន៍មកកាន់ដំណើរថ្មី
            </h1>
            <p className="text-emerald-100 text-lg md:text-xl font-khmer opacity-90 max-w-xl mx-auto leading-relaxed mb-8">
               ប្រសិនបើអ្នកទើបចាប់ផ្តើមស្វែងយល់ពីឥស្លាម, នេះគឺជាផែនទីដែលនឹងនាំផ្លូវអ្នកមួយជំហានម្តងៗ។
            </p>

            {/* Redesigned Progress Card (Fixed SVG) */}
            <div className="bg-[#1a4d44] border border-[#2d665b] rounded-2xl p-6 max-w-md mx-auto flex items-center gap-6 shadow-lg transform transition-transform hover:scale-[1.02] relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <HugeiconsIcon icon={CleanIcon} strokeWidth={1.5} className="w-12 h-12 text-white" />
                </div>

                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                   {/* Added viewBox="0 0 100 100" to ensure scaling without cutting off */}
                   <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle 
                        cx={center} cy={center} r={radius} 
                        stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" 
                        className="text-[#2d665b]" 
                      />
                      <circle 
                        cx={center} cy={center} r={radius} 
                        stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" 
                        className="text-[#34d399] transition-all duration-1000 ease-out" 
                        strokeDasharray={circumference} 
                        strokeDashoffset={strokeDashoffset} 
                        strokeLinecap="round"
                      />
                   </svg>
                   <span className="absolute text-lg font-bold text-white">{progressPercentage}%</span>
                </div>
                <div className="text-left relative z-10">
                   <p className="text-[#34d399] text-xs font-bold uppercase tracking-wider mb-1 font-khmer">វឌ្ឍនភាពរបស់អ្នក</p>
                   <h3 className="font-bold text-white text-2xl font-khmer leading-none mb-1">
                      {completedLessons.size} <span className="text-emerald-200/60 text-lg">ក្នុងចំណោម</span> {LESSONS.length} <span className="text-emerald-200/60 text-lg">មេរៀន</span>
                   </h3>
                   <p className="text-emerald-200/80 text-xs font-khmer italic">{getMotivationalMessage()}</p>
                </div>
            </div>
         </div>
      </div>

      {/* Timeline / Steps */}
      <div className="max-w-3xl mx-auto px-4 -mt-8 relative z-10 space-y-4">
         {LESSONS.map((lesson, index) => {
            const isDone = completedLessons.has(lesson.id);
            
            return (
               <div 
                 key={lesson.id}
                 onClick={() => handleLessonSelect(lesson)}
                 className={`
                    group relative bg-white rounded-2xl p-5 shadow-sm border transition-all cursor-pointer flex items-center gap-5 overflow-hidden
                    ${isDone ? 'border-emerald-500/50 bg-emerald-50/30' : 'border-gray-200 hover:border-emerald-300 hover:shadow-md'}
                 `}
               >
                  {/* Connector Line (Virtual) */}
                  {index !== LESSONS.length - 1 && (
                     <div className="absolute left-[2.65rem] top-20 bottom-[-20px] w-0.5 bg-gray-100 -z-10 group-hover:bg-emerald-100 transition-colors"></div>
                  )}

                  {/* Number Bubble */}
                  <div className={`
                     w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 transition-colors shadow-sm
                     ${isDone ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-700'}
                  `}>
                     {isDone ? <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="w-7 h-7" /> : lesson.number}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 py-2">
                     <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                           ជំហានទី {index + 1}
                        </span>
                        {isDone && <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1"><HugeiconsIcon icon={ChampionIcon} strokeWidth={1.5} className="w-3 h-3"/> បានបញ្ចប់</span>}
                     </div>
                     <h3 className={`font-bold font-khmer text-lg leading-tight mb-1 ${isDone ? 'text-emerald-900' : 'text-gray-900'}`}>
                        {lesson.title}
                     </h3>
                     <p className="text-gray-500 text-sm font-khmer truncate">
                        {lesson.description}
                     </p>
                  </div>

                  {/* Action Icon */}
                  <div className={`
                     w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1
                     ${isDone ? 'text-emerald-500 bg-emerald-50' : 'text-gray-300 bg-gray-50 group-hover:text-emerald-500'}
                  `}>
                     <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="w-5 h-5" />
                  </div>
               </div>
            );
         })}
      </div>

      {/* Encouragement Card */}
      <div className="max-w-3xl mx-auto px-4 mt-8">
         <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 text-white text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <HugeiconsIcon icon={StarIcon} strokeWidth={1.5} className="w-12 h-12 text-yellow-300 mx-auto mb-4 fill-current animate-pulse" />
            <h3 className="font-bold text-xl font-khmer mb-2">តើអ្នកមានសំណួរបន្ថែមមែនទេ?</h3>
            <p className="opacity-90 font-khmer text-sm mb-6 max-w-md mx-auto leading-relaxed">
               ការសិក្សាគឺជាដំណើរមួយដ៏វែងឆ្ងាយ។ ក្រុមការងារ "ពន្លឺ" រីករាយក្នុងការពិភាក្សា និងឆ្លើយតបនឹងសំណួររបស់អ្នកជាលក្ខណៈឯកជន។
            </p>
            <button className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold text-sm shadow-md hover:bg-indigo-50 transition-colors transform active:scale-95">
               ទំនាក់ទំនងមកយើង
            </button>
         </div>
      </div>

      {/* Reader Modal */}
      {activeLesson && (
         <LessonReader 
            lesson={activeLesson}
            onClose={() => setActiveLesson(null)}
            onNext={() => navigateLesson('next')}
            onPrev={() => navigateLesson('prev')}
            hasNext={activeIndex < LESSONS.length - 1}
            hasPrev={activeIndex > 0}
            isCompleted={completedLessons.has(activeLesson.id)}
            onComplete={() => markComplete(activeLesson.id)}
         />
      )}

    </div>
  );
};
