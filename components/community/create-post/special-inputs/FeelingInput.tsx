import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { HappyIcon } from '@hugeicons/core-free-icons';
import { SpecialInputProps } from './types';
import { useTheme } from '@/contexts/ThemeContext';

export const FeelingInput: React.FC<SpecialInputProps> = ({ onCancel, onSave }) => {
    const { theme } = useTheme();
    const feelings = [
        { icon: '🙂', label: 'សប្បាយរីករាយ' },
        { icon: '😌', label: 'មានក្ដីសុខ' },
        { icon: '😢', label: 'កើតទុក្ខ' },
        { icon: '🤲', label: 'មានជំនឿ' },
        { icon: '😴', label: 'ងងុយគេង' },
        { icon: '🤕', label: 'ឈឺ' },
    ];

    return (
        <div className={`p-4 rounded-xl border mb-4 animate-in fade-in zoom-in-95 ${theme === 'dark' ? 'bg-yellow-900/20 border-yellow-800/50' : 'bg-yellow-50 border-yellow-100'}`}>
            <div className="flex justify-between items-center mb-3">
                <h4 className={`font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-yellow-100' : 'text-yellow-800'}`}>
                    <HugeiconsIcon icon={HappyIcon} strokeWidth={1.5} className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-400' : ''}`}/> អារម្មណ៍
                </h4>
                <button onClick={onCancel} className={`text-xs hover:text-red-500 ${theme === 'dark' ? 'text-yellow-400/70 hover:text-red-400' : 'text-yellow-600'}`}>បិទ</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {feelings.map(f => (
                    <button 
                        key={f.label} 
                        onClick={() => { if(onSave) onSave(f); }}
                        className={`flex items-center gap-2 p-2 rounded-lg border border-transparent transition-colors ${theme === 'dark' ? 'bg-slate-800 hover:bg-yellow-900/40 hover:border-yellow-700/50' : 'bg-white hover:bg-yellow-100 hover:border-yellow-200'}`}
                    >
                        <span className="text-xl">{f.icon}</span>
                        <span className={`text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-gray-700'}`}>{f.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
