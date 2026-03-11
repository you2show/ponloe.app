import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { ViewMode } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { tafseerData } from './data';

interface TafseerViewProps {
  setView: (view: ViewMode) => void;
}

export const TafseerView: React.FC<TafseerViewProps> = ({ setView }) => {
  const { theme } = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-30 px-4 py-4 flex items-center gap-4 border-b backdrop-blur-md ${
        theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'
      }`}>
        <button 
          onClick={() => setView(ViewMode.BASIC_KNOWLEDGE)}
          className={`p-2 rounded-full transition-colors ${
            theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold font-khmer-title">ផ្នែកតាហ្វសៀរ(បកស្រាយគម្ពីរគួរអាន)</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto p-4 md:p-6 pb-24">
        <div className="space-y-4">
          {tafseerData.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'bg-slate-900 border-slate-800' 
                    : 'bg-white border-slate-200'
                } ${isOpen ? 'ring-2 ring-purple-500/50' : ''}`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className={`w-full text-left p-4 md:p-5 flex items-start justify-between gap-4 transition-colors ${
                    theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <h3 className={`font-bold font-khmer-title leading-relaxed ${
                    theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
                  }`}>
                    {item.question}
                  </h3>
                  <div className={`p-1 rounded-full shrink-0 ${
                    theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className={`p-4 md:p-5 pt-0 border-t ${
                        theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
                      }`}>
                        <div 
                          className={`prose prose-sm md:prose-base max-w-none font-khmer leading-loose ${
                            theme === 'dark' ? 'prose-invert text-slate-300' : 'text-slate-600'
                          }`}
                          dangerouslySetInnerHTML={{ __html: item.answer }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
