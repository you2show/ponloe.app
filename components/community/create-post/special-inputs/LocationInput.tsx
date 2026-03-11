import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Location01Icon, Add01Icon } from '@hugeicons/core-free-icons';
import { SpecialInputProps } from './types';
import { useTheme } from '@/contexts/ThemeContext';

export const LocationInput: React.FC<SpecialInputProps> = ({ onCancel, onSave }) => {
    const { theme } = useTheme();
    const [search, setSearch] = useState('');
    
    // Cambodia provinces in Khmer
    const locations = [
        'រាជធានីភ្នំពេញ', 'ខេត្តសៀមរាប', 'ខេត្តបាត់ដំបង', 'ខេត្តកំពត', 
        'ខេត្តព្រះសីហនុ', 'ខេត្តកំពង់ចាម', 'ខេត្តកែប', 'ខេត្តកោះកុង', 
        'ខេត្តកំពង់ឆ្នាំង', 'ខេត្តកំពង់ធំ', 'ខេត្តកំពង់ស្ពឺ', 'ខេត្តកណ្ដាល', 
        'ខេត្តក្រចេះ', 'ខេត្តតាកែវ', 'ខេត្តបន្ទាយមានជ័យ', 'ខេត្តប៉ៃលិន', 
        'ខេត្តពោធិ៍សាត់', 'ខេត្តព្រៃវែង', 'ខេត្តព្រះវិហារ', 'ខេត្តមណ្ឌលគិរី', 
        'ខេត្តរតនគិរី', 'ខេត្តស្ទឹងត្រែង', 'ខេត្តស្វាយរៀង', 'ខេត្តឧត្តរមានជ័យ', 
        'ខេត្តត្បូងឃ្មុំ'
    ];
    
    const filtered = locations.filter(l => l.toLowerCase().includes(search.toLowerCase()));
    
    // Check if the search term exactly matches any existing location
    const isExactMatch = locations.some(l => l.toLowerCase() === search.toLowerCase());
    const showCustomOption = search.trim().length > 0 && !isExactMatch;

    return (
        <div className={`p-4 rounded-xl border mb-4 animate-in fade-in zoom-in-95 ${theme === 'dark' ? 'bg-red-900/20 border-red-800/50' : 'bg-red-50 border-red-100'}`}>
            <div className="flex justify-between items-center mb-3">
                <h4 className={`font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-red-100' : 'text-red-800'}`}>
                    <HugeiconsIcon icon={Location01Icon} strokeWidth={1.5} className={`w-5 h-5 ${theme === 'dark' ? 'text-red-400' : ''}`}/> ទីតាំង
                </h4>
                <button onClick={onCancel} className={`text-xs hover:text-red-700 ${theme === 'dark' ? 'text-red-400/70 hover:text-red-400' : 'text-red-500'}`}>បិទ</button>
            </div>
            <input 
                type="text" 
                placeholder="ស្វែងរកទីកន្លែង ឬបញ្ចូលទីតាំងថ្មី..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`w-full p-2 rounded-lg border text-sm mb-2 outline-none font-khmer ${theme === 'dark' ? 'bg-slate-800 border-red-800/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500/50' : 'bg-white border-red-200 focus:ring-2 focus:ring-red-400'}`}
            />
            <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                {showCustomOption && (
                    <button 
                        onClick={() => { if(onSave) onSave(search.trim()); }}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors mb-2 ${theme === 'dark' ? 'bg-red-900/40 hover:bg-red-900/60' : 'bg-red-100 hover:bg-red-200'}`}
                    >
                        <div className={`p-1 rounded-full ${theme === 'dark' ? 'bg-slate-800 text-red-400' : 'bg-white text-red-600'}`}><HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} className="w-3 h-3" /></div>
                        <span className={`text-sm font-bold font-khmer ${theme === 'dark' ? 'text-red-200' : 'text-red-800'}`}>បន្ថែមទីតាំង: "{search.trim()}"</span>
                    </button>
                )}
                
                {filtered.map(l => (
                    <button 
                        key={l} 
                        onClick={() => { if(onSave) onSave(l); }}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-white'}`}
                    >
                        <div className={`p-1 rounded-full ${theme === 'dark' ? 'bg-red-900/40 text-red-400' : 'bg-red-100 text-red-600'}`}><HugeiconsIcon icon={Location01Icon} strokeWidth={1.5} className="w-3 h-3" /></div>
                        <span className={`text-sm font-khmer ${theme === 'dark' ? 'text-slate-200' : 'text-gray-700'}`}>{l}</span>
                    </button>
                ))}
                
                {filtered.length === 0 && !showCustomOption && (
                    <div className={`text-center text-xs py-2 font-khmer ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>មិនមានទិន្នន័យទេ</div>
                )}
            </div>
        </div>
    );
};
