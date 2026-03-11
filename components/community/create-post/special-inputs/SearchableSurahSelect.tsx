import React, { useState, useEffect, useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, Search01Icon, Tick01Icon } from '@hugeicons/core-free-icons';
import { KHMER_SURAH_NAMES } from '../../../quran/api';
import { useTheme } from '@/contexts/ThemeContext';

export const SearchableSurahSelect: React.FC<{ selectedId: number, onSelect: (id: number) => void }> = ({ selectedId, onSelect }) => {
    const { theme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter logic
    const filteredSurahs = Object.entries(KHMER_SURAH_NAMES).filter(([id, name]) => {
        const searchLower = search.toLowerCase();
        return id.toString().includes(searchLower) || name.toLowerCase().includes(searchLower);
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <label className={`text-[10px] font-bold mb-1 block uppercase ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>ជំពូក (Surah)</label>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between outline-none text-sm transition-all ${theme === 'dark' ? 'bg-slate-800 border-emerald-800/50 focus:ring-2 focus:ring-emerald-500/50' : 'bg-white border-emerald-200 focus:ring-2 focus:ring-emerald-500'}`}
            >
                <span className={`truncate font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>
                    {selectedId}. {KHMER_SURAH_NAMES[selectedId]}
                </span>
                <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={1.5} className="w-4 h-4 text-emerald-500 shrink-0" />
            </button>

            {isOpen && (
                <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl border z-50 overflow-hidden animate-in fade-in zoom-in-95 ${theme === 'dark' ? 'bg-slate-800 border-emerald-800/50 shadow-lg shadow-slate-900/50' : 'bg-white border-emerald-100 shadow-xl'}`}>
                    <div className={`p-2 border-b ${theme === 'dark' ? 'border-slate-700 bg-slate-800/80' : 'border-gray-50 bg-emerald-50/30'}`}>
                        <div className="relative">
                            <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
                            <input 
                                autoFocus
                                type="text" 
                                placeholder="ស្វែងរក..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={`w-full pl-8 pr-3 py-1.5 rounded-lg border text-sm focus:outline-none ${theme === 'dark' ? 'bg-slate-900/50 border-emerald-800/50 text-white focus:border-emerald-500/50 placeholder-slate-500' : 'bg-white border-emerald-200 focus:border-emerald-500'}`}
                            />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                        {filteredSurahs.length > 0 ? (
                            filteredSurahs.map(([id, name]) => (
                                <button
                                    key={id}
                                    onClick={() => {
                                        onSelect(parseInt(id));
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-3 transition-colors ${parseInt(id) === selectedId ? (theme === 'dark' ? 'bg-slate-700 text-emerald-400 font-bold' : 'bg-emerald-50 text-emerald-700 font-bold') : (theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-emerald-50')}`}
                                >
                                    <span className={`w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0 ${theme === 'dark' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {id}
                                    </span>
                                    <span className="truncate">{name}</span>
                                    {parseInt(id) === selectedId && <HugeiconsIcon icon={Tick01Icon} strokeWidth={1.5} className={`w-4 h-4 ml-auto ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />}
                                </button>
                            ))
                        ) : (
                            <div className={`p-4 text-center text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>រកមិនឃើញជំពូកនេះទេ</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
