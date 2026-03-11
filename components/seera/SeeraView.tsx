import React, { useState } from 'react';
import { ChevronLeft, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../contexts/ThemeContext';
import { seeraData } from './data';
import { ViewMode } from '../../types';

interface SeeraViewProps {
  setView: (view: ViewMode) => void;
}

export const SeeraView: React.FC<SeeraViewProps> = ({ setView }) => {
  const { theme } = useTheme();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className={`min-h-screen pb-24 ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-30 px-4 py-3 flex items-center gap-3 shadow-sm ${
        theme === 'dark' ? 'bg-slate-900 border-b border-slate-800' : 'bg-white border-b border-gray-200'
      }`}>
        <button 
          onClick={() => setView(ViewMode.BASIC_KNOWLEDGE)}
          className={`p-2 rounded-full transition-colors ${
            theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className={`text-xl font-bold font-khmer ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          ផ្នែកជីវប្រវត្តិរបស់ព្យាការីមូហាំម៉ាត់
        </h1>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {/* Intro Card */}
        <div className={`p-6 rounded-2xl border ${
          theme === 'dark' 
            ? 'bg-slate-900/20 border-slate-800/50 text-slate-100' 
            : 'bg-slate-50 border-slate-100 text-slate-900'
        }`}>
          <div className="flex items-center gap-4 mb-3">
            <div className={`p-3 rounded-xl ${
              theme === 'dark' ? 'bg-slate-800/50 text-slate-300' : 'bg-slate-100 text-slate-600'
            }`}>
              <BookOpen size={24} />
            </div>
            <h2 className="text-lg font-bold font-khmer">សេចក្តីផ្តើម</h2>
          </div>
          <p className={`font-khmer leading-relaxed ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
            ផ្នែកនេះនឹងបង្ហាញអំពីជីវប្រវត្តិសង្ខេបរបស់ព្យាការីមូហាំម៉ាត់ (សន្តិភាពមានលើគាត់) ចាប់តាំងពីការប្រសូតរហូតដល់ការទទួលមរណភាព។
          </p>
        </div>

        {/* Questions List */}
        <div className="space-y-3">
          {seeraData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-xl border overflow-hidden transition-colors ${
                theme === 'dark' 
                  ? 'bg-slate-900 border-slate-800' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <button
                onClick={() => toggleExpand(index)}
                className={`w-full p-4 flex items-start gap-3 text-left transition-colors ${
                  expandedId === index
                    ? theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'
                    : 'hover:bg-gray-50 dark:hover:bg-slate-800/30'
                }`}
              >
                <div className={`mt-1 p-1.5 rounded-full flex-shrink-0 ${
                  expandedId === index
                    ? theme === 'dark' ? 'bg-slate-900/30 text-slate-400' : 'bg-slate-100 text-slate-600'
                    : theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'
                }`}>
                  {expandedId === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                <span className={`font-khmer font-medium text-lg leading-relaxed ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                }`}>
                  {item.question}
                </span>
              </button>

              <AnimatePresence>
                {expandedId === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`p-5 border-t font-khmer text-lg leading-loose ${
                      theme === 'dark' 
                        ? 'border-slate-800 bg-slate-900/50 text-slate-300' 
                        : 'border-gray-100 bg-gray-50/50 text-gray-700'
                    }`}>
                      <div className="whitespace-pre-line">{item.answer}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
