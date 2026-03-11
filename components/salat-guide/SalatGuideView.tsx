import React, { useState } from 'react';
import { ChevronLeft, Star, AlertTriangle, Volume2, BookOpen, Sun, Users, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../contexts/ThemeContext';
import { ViewMode } from '../../types';
import { salatData } from './data';
import ReactMarkdown from 'react-markdown';

interface SalatGuideViewProps {
  setView: (view: ViewMode) => void;
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'star': return <Star size={24} />;
    case 'alert-triangle': return <AlertTriangle size={24} />;
    case 'volume-2': return <Volume2 size={24} />;
    case 'book-open': return <BookOpen size={24} />;
    case 'sun': return <Sun size={24} />;
    case 'users': return <Users size={24} />;
    default: return <BookOpen size={24} />;
  }
};

const getColorClass = (iconName: string, theme: string, type: 'text' | 'bg' | 'border') => {
  const colors: Record<string, any> = {
    'star': { text: 'text-amber-500', bg: theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-50', border: 'border-amber-200' },
    'alert-triangle': { text: 'text-rose-500', bg: theme === 'dark' ? 'bg-rose-500/20' : 'bg-rose-50', border: 'border-rose-200' },
    'volume-2': { text: 'text-blue-500', bg: theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-50', border: 'border-blue-200' },
    'book-open': { text: 'text-emerald-500', bg: theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-50', border: 'border-emerald-200' },
    'sun': { text: 'text-orange-500', bg: theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-50', border: 'border-orange-200' },
    'users': { text: 'text-purple-500', bg: theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-50', border: 'border-purple-200' },
  };
  return colors[iconName]?.[type] || '';
};

export const SalatGuideView: React.FC<SalatGuideViewProps> = ({ setView }) => {
  const { theme } = useTheme();
  const [expandedId, setExpandedId] = useState<string | null>(salatData[0].id);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className={`min-h-screen pb-24 ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-30 px-4 py-3 flex items-center gap-3 shadow-sm ${
        theme === 'dark' ? 'bg-slate-900/95 backdrop-blur border-b border-slate-800' : 'bg-white/95 backdrop-blur border-b border-gray-200'
      }`}>
        <button 
          onClick={() => setView(ViewMode.HOME)}
          className={`p-2 rounded-full transition-colors ${
            theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className={`text-xl font-bold font-khmer ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          អំពីសឡាត
        </h1>
      </div>

      {/* Intro Section */}
      <div className={`px-4 py-6 mb-4 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} shadow-sm`}>
        <div className="max-w-3xl mx-auto flex items-start gap-4">
          <div className={`p-3 rounded-2xl shrink-0 ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
            <Info size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-khmer mb-2">ការថ្វាយបង្គំ (សឡាត)</h2>
            <p className={`font-khmer leading-relaxed text-sm md:text-base ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
              សឡាតគឺជាសសរស្តម្ភទីពីរនៃសាសនាឥស្លាម។ វាជាទំនាក់ទំនងផ្ទាល់រវាងអ្នកជឿ និងអល់ឡោះ។ ការយល់ដឹងពីរបៀបសឡាត និងអត្ថន័យរបស់វា គឺជារឿងចាំបាច់បំផុតសម្រាប់អ្នកមូស្លីមគ្រប់រូប។
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {salatData.map((section) => {
          const isExpanded = expandedId === section.id;
          return (
            <div 
              key={section.id}
              className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                isExpanded 
                  ? theme === 'dark' ? 'bg-slate-900 border-slate-700 shadow-lg' : 'bg-white border-gray-300 shadow-lg'
                  : theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-gray-200'
              }`}
            >
              <button
                onClick={() => toggleExpand(section.id)}
                className={`w-full flex items-center justify-between p-5 text-left transition-colors ${
                  theme === 'dark' ? 'hover:bg-slate-800/80' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${getColorClass(section.icon, theme, 'bg')} ${getColorClass(section.icon, theme, 'text')}`}>
                    {getIcon(section.icon)}
                  </div>
                  <h2 className={`font-bold font-khmer text-lg md:text-xl ${isExpanded ? (theme === 'dark' ? 'text-white' : 'text-gray-900') : (theme === 'dark' ? 'text-slate-300' : 'text-gray-700')}`}>
                    {section.title}
                  </h2>
                </div>
                <div className={`p-2 rounded-full ${isExpanded ? (theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100') : ''}`}>
                  {isExpanded ? (
                    <ChevronUp className={theme === 'dark' ? 'text-slate-300' : 'text-gray-600'} />
                  ) : (
                    <ChevronDown className={theme === 'dark' ? 'text-slate-500' : 'text-gray-400'} />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className={`p-5 pt-2 border-t ${
                      theme === 'dark' ? 'border-slate-800' : 'border-gray-100'
                    }`}>
                      <div className={`prose font-khmer max-w-none 
                        prose-p:leading-loose prose-p:text-[15px]
                        prose-headings:font-bold prose-headings:font-khmer prose-headings:mt-8 prose-headings:mb-4
                        prose-h3:text-lg prose-h3:text-emerald-600
                        prose-strong:text-emerald-600
                        prose-ul:leading-loose prose-li:my-2
                        prose-blockquote:border-l-4 prose-blockquote:border-emerald-500 prose-blockquote:bg-emerald-50/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                        ${
                        theme === 'dark' 
                          ? 'prose-invert prose-p:text-slate-300 prose-li:text-slate-300 prose-blockquote:bg-emerald-500/10 prose-strong:text-emerald-400 prose-h3:text-emerald-400' 
                          : 'prose-p:text-gray-700 prose-li:text-gray-700'
                      }`}>
                        <ReactMarkdown>{section.content}</ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
