import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ChartBarLineIcon, Delete02Icon, Add01Icon } from '@hugeicons/core-free-icons';
import { SpecialInputProps } from './types';
import { useTheme } from '@/contexts/ThemeContext';

export const PollInput: React.FC<SpecialInputProps & { onSave?: (data: any) => void, caption?: string, onCaptionChange?: (text: string) => void }> = ({ onCancel, onSave, caption, onCaptionChange }) => {
  const { theme } = useTheme();
  const [options, setOptions] = useState<string[]>(['', '']);

  useEffect(() => {
    // Filter out empty options for the save payload, but keep them in UI
    const validOptions = options.filter(opt => opt.trim() !== '');
    if (onSave) {
        onSave({
            options: validOptions.map((text, index) => ({
                id: `opt-${index}-${Date.now()}`,
                text,
                votes: 0,
                voterIds: []
            })),
            totalVotes: 0
        });
    }
  }, [options, onSave]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 5) {
        setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
    }
  };

  return (
    <div className={`space-y-3 p-4 rounded-xl border mb-4 animate-in fade-in zoom-in-95 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-blue-50/30 border-blue-100'}`}>
        <div className="flex justify-between items-center mb-1">
          <h4 className={`font-bold flex items-center gap-2 font-khmer ${theme === 'dark' ? 'text-slate-200' : 'text-gray-700'}`}>
            <HugeiconsIcon icon={ChartBarLineIcon} strokeWidth={1.5} className="w-5 h-5 text-blue-500"/> បង្កើតការស្ទង់មតិ
          </h4>
          <button onClick={onCancel} className={`text-xs hover:text-red-500 font-khmer ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>លុបចោល</button>
        </div>
        
        {/* Caption Input */}
        <textarea
            value={caption || ''}
            onChange={(e) => onCaptionChange?.(e.target.value)}
            placeholder="សរសេរសំណួររបស់អ្នកនៅទីនេះ..."
            className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 text-base font-khmer resize-none h-24 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-blue-200 text-gray-900'}`}
            autoFocus
        />

        <div className="space-y-3">
          {options.map((opt, idx) => (
            <div key={idx} className="flex gap-2">
                <input 
                    type="text" 
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`ជម្រើសទី ${idx + 1}`} 
                    className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 text-sm font-khmer ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-blue-200 text-gray-900'}`} 
                />
                {options.length > 2 && (
                    <button onClick={() => removeOption(idx)} className={`p-3 rounded-xl transition-colors ${theme === 'dark' ? 'text-red-400 hover:bg-red-900/30' : 'text-red-400 hover:bg-red-50'}`}>
                        <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.5} className="w-5 h-5" />
                    </button>
                )}
            </div>
          ))}
        </div>
        {options.length < 5 && (
            <button 
                onClick={addOption}
                className={`w-full py-2 border-2 border-dashed rounded-xl text-xs font-bold transition-colors mt-2 flex items-center justify-center gap-2 font-khmer ${theme === 'dark' ? 'border-blue-800 text-blue-400 hover:bg-blue-900/30' : 'border-blue-300 text-blue-600 hover:bg-blue-50'}`}
            >
                <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} className="w-4 h-4" /> បន្ថែមជម្រើស
            </button>
        )}
    </div>
  );
};
