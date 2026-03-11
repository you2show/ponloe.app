import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CharityIcon, Loading02Icon, CleanIcon, RefreshIcon } from '@hugeicons/core-free-icons';
import { generateDua } from '@/services/geminiService';
import { useToast } from '@/contexts/ToastContext';
import { SpecialInputProps } from './types';
import { useTheme } from '@/contexts/ThemeContext';

export const DuaInput: React.FC<SpecialInputProps & { onSave?: (data: any) => void }> = ({ onCancel, onSave }) => {
  const { showToast } = useToast();
  const { theme } = useTheme();
  const [topic, setTopic] = useState('');
  const [generatedDua, setGeneratedDua] = useState<{ arabic: string, khmer: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      if (onSave && generatedDua) {
          onSave({ content: generatedDua.khmer, ...generatedDua });
      }
  }, [generatedDua, onSave]);

  const handleGenerate = async () => {
      if (!topic.trim()) return;
      setLoading(true);
      const result = await generateDua(topic);
      if (result) {
          setGeneratedDua(result);
      } else {
          showToast('បរាជ័យក្នុងការបង្កើតឌូអា។ សូមព្យាយាមម្តងទៀត។', 'error');
          if (onSave) onSave(null);
      }
      setLoading(false);
  };

  return (
    <div className={`p-4 rounded-xl border mb-4 animate-in fade-in zoom-in-95 space-y-4 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-amber-50 border-amber-100'}`}>
        <div className="flex justify-between items-center">
            <h4 className={`font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-800'}`}>
              <HugeiconsIcon icon={CharityIcon} strokeWidth={1.5} className="w-5 h-5 text-amber-600" /> សុំឌូអា (Dua Request)
            </h4>
            <button onClick={onCancel} className={`text-xs hover:text-red-500 ${theme === 'dark' ? 'text-slate-400' : 'text-amber-600'}`}>លុបចោល</button>
        </div>

        {!generatedDua ? (
            <div className="space-y-3">
                <p className={`text-xs font-khmer ${theme === 'dark' ? 'text-amber-200/80' : 'text-amber-700/80'}`}>
                    ប្រាប់ AI អំពីបំណងប្រាថ្នារបស់អ្នក (ឧទាហរណ៍: "សុំឱ្យប្រឡងជាប់", "សុំឱ្យឪពុកឆាប់ជា")។
                </p>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="សរសេរបំណងរបស់អ្នកនៅទីនេះ..."
                        className={`flex-1 p-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-amber-500 text-sm font-khmer ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-amber-200 text-gray-900'}`}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                    <button 
                        onClick={handleGenerate}
                        disabled={loading || !topic.trim()}
                        className="p-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[44px]"
                    >
                        {loading ? <HugeiconsIcon icon={Loading02Icon} strokeWidth={1.5} className="w-5 h-5 animate-spin" /> : <HugeiconsIcon icon={CleanIcon} strokeWidth={1.5} className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        ) : (
            <div className={`p-4 rounded-xl border shadow-sm space-y-3 relative ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-amber-100'}`}>
                <button 
                    onClick={() => { setGeneratedDua(null); setTopic(''); if (onSave) onSave(null); }}
                    className={`absolute top-2 right-2 p-1 hover:text-red-500 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}
                >
                    <HugeiconsIcon icon={RefreshIcon} strokeWidth={1.5} className="w-4 h-4" />
                </button>
                <p className={`font-arabic text-xl text-center leading-loose ${theme === 'dark' ? 'text-amber-400' : 'text-amber-900'}`} dir="rtl">
                    {generatedDua.arabic}
                </p>
                <p className={`text-sm font-khmer text-center leading-relaxed italic ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                    "{generatedDua.khmer}"
                </p>
            </div>
        )}
    </div>
  );
};
