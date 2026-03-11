import { HugeiconsIcon } from '@hugeicons/react';
import { Brain01Icon, Cancel01Icon, RefreshIcon } from '@hugeicons/core-free-icons';
import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { chatWithUstaz } from '@/services/geminiService';

interface TafsirPanelProps {
  surahId: number;
  ayahId: number;
  surahName: string;
  verseText: string;
  verseTranslation?: string;
  onClose?: () => void;
}

/**
 * AI-Powered Tafsir Panel
 * Uses Ustaz AI (Gemini) to explain Quran verses in Khmer
 */
export const TafsirPanel: React.FC<TafsirPanelProps> = ({
  surahId,
  ayahId,
  surahName,
  verseText,
  verseTranslation,
  onClose,
}) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [asked, setAsked] = useState(false);

  const parsedExplanation = React.useMemo(() => {
    if (!explanation) return null;
    
    // Split by "1.", "2.", "3."
    const parts = explanation.split(/\d\.\s*/);
    
    if (parts.length < 4) return null; // Fallback if parsing fails
    
    return {
      tafsir: parts[1]?.trim(),
      lessons: parts[2]?.trim(),
      application: parts[3]?.trim(),
    };
  }, [explanation]);

  const handleGetExplanation = async () => {
    setLoading(true);
    setAsked(true);
    try {
      const prompt = `Please explain this Quran verse in Khmer language:
Surah: ${surahName} (${surahId}), Ayah: ${ayahId}
Arabic: ${verseText}
${verseTranslation ? `Translation: ${verseTranslation}` : ''}

Please provide:
1. Brief explanation (Tafsir) in Khmer
2. Key lessons from this verse
3. How to apply it in daily life`;

      const result = await chatWithUstaz(prompt, []);
      if (result) {
        setExplanation(result);
      } else {
        showToast('មិនអាចទទួលបានការពន្យល់បានទេ។ សូមព្យាយាមម្ដងទៀត។', 'error');
      }
    } catch (error) {
      showToast('មានបញ្ហាក្នុងការភ្ជាប់ AI។ សូមព្យាយាមម្ដងទៀត។', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-2xl border overflow-hidden ${
      theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-emerald-50 border-emerald-100'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${
        theme === 'dark' ? 'border-slate-700 bg-slate-900/50' : 'border-emerald-100 bg-white/60'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
            <HugeiconsIcon icon={Brain01Icon} strokeWidth={1.5} className={`w-4 h-4 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />
          </div>
          <span className={`text-sm font-bold font-khmer ${theme === 'dark' ? 'text-slate-200' : 'text-emerald-800'}`}>
            ការពន្យល់ AI (Ustaz AI)
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className={`p-1 rounded-full transition-colors ${
            theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-400 hover:bg-white'
          }`}>
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {!asked ? (
          <div className="text-center py-4">
            <p className={`text-sm font-khmer mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-emerald-700'}`}>
              ចុចដើម្បីទទួលបានការពន្យល់អំពីអាយ៉ាត់នេះពី Ustaz AI
            </p>
            <button
              onClick={handleGetExplanation}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-khmer rounded-xl transition-colors flex items-center gap-2 mx-auto"
            >
              <HugeiconsIcon icon={Brain01Icon} strokeWidth={1.5} className="w-4 h-4" />
              ស្នើការពន្យល់
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-3 animate-pulse p-2">
            <div className={`h-4 rounded ${theme === 'dark' ? 'bg-slate-700' : 'bg-emerald-200'} w-3/4`} />
            <div className={`h-4 rounded ${theme === 'dark' ? 'bg-slate-700' : 'bg-emerald-200'} w-full`} />
            <div className={`h-4 rounded ${theme === 'dark' ? 'bg-slate-700' : 'bg-emerald-200'} w-5/6`} />
            <div className={`h-4 rounded ${theme === 'dark' ? 'bg-slate-700' : 'bg-emerald-200'} w-1/2`} />
          </div>
        ) : explanation ? (
          <div className="transition-opacity duration-500 ease-in-out">
            {parsedExplanation ? (
              <div className="space-y-4">
                <div className={`text-sm font-khmer leading-loose whitespace-pre-wrap ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                  {parsedExplanation.tafsir}
                </div>
                
                {parsedExplanation.lessons && (
                  <div>
                    <h4 className={`font-bold text-sm mb-1 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-800'}`}>មេរៀនសំខាន់ៗ៖</h4>
                    <div className={`text-sm font-khmer leading-loose whitespace-pre-wrap ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                      {parsedExplanation.lessons}
                    </div>
                  </div>
                )}

                {parsedExplanation.application && (
                  <div className="p-3 rounded-xl bg-emerald-100/50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <h4 className={`font-bold text-sm mb-1 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-800'}`}>របៀបអនុវត្តក្នុងជីវិតប្រចាំថ្ងៃ៖</h4>
                    <div className={`text-sm font-khmer leading-loose whitespace-pre-wrap ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                      {parsedExplanation.application}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                className={`text-sm font-khmer leading-loose whitespace-pre-wrap ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                }`}
                dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, '<br/>') }}
              />
            )}
            <button
              onClick={handleGetExplanation}
              className={`mt-3 flex items-center gap-1.5 text-xs transition-colors ${
                theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-emerald-600'
              }`}
            >
              <HugeiconsIcon icon={RefreshIcon} strokeWidth={1.5} className="w-3.5 h-3.5" />
              ស្នើឡើងវិញ
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TafsirPanel;
