import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, BookOpen01Icon } from '@hugeicons/core-free-icons';
import React from 'react';
import { Ayah, Surah } from './types';
import { useTheme } from '@/contexts/ThemeContext';

interface TafsirModalProps {
  ayah: Ayah | null;
  surah: Surah;
  onClose: () => void;
}

export const TafsirModal: React.FC<TafsirModalProps> = ({ ayah, surah, onClose }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  if (!ayah) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`${isDark ? 'bg-slate-900' : 'bg-white'} w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 border-b ${isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-100 bg-gray-50'} flex justify-between items-center rounded-t-2xl`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'} font-khmer`}>ការអធិប្បាយ (Tafsir)</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'} font-medium`}>
                {surah.name_khmer} - អាយ៉ាត់ {ayah.verse_key.split(':')[1]}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-200' : 'text-gray-400 hover:bg-white hover:text-gray-600'} rounded-full transition-colors`}
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Arabic Reference */}
          <div className={`p-4 ${isDark ? 'bg-emerald-900/30 border-emerald-800' : 'bg-emerald-50/50 border-emerald-100'} rounded-xl border`}>
            <p className={`font-arabic text-2xl text-right leading-[2.2] ${isDark ? 'text-emerald-300' : 'text-emerald-900'}`} dir="rtl">
              {ayah.text_arabic}
            </p>
          </div>

          {/* Tafsir Body */}
          <div>
            <h4 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-gray-900'} mb-2 uppercase tracking-wide`}>
              សេចក្តីពន្យល់
            </h4>
            <div className="prose prose-emerald max-w-none">
              <p className={`${isDark ? 'text-slate-300' : 'text-gray-700'} font-khmer leading-loose text-base md:text-lg`}>
                {ayah.tafsir?.text || "មិនទាន់មានទិន្នន័យសម្រាប់ការអធិប្បាយនេះទេ។"}
              </p>
            </div>
            {ayah.tafsir?.source && (
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'} mt-4 italic text-right`}>
                ប្រភព: {ayah.tafsir.source}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
