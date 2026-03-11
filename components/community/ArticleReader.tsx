import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { useTheme } from '@/contexts/ThemeContext';

export interface ArticleReaderProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: { title: string; content: string }[];
}

export const ArticleReader = ({ isOpen, onClose, title, content }: ArticleReaderProps) => {
    const { theme } = useTheme();
    const [currentPage, setCurrentPage] = useState(0);

    if (!isOpen) return null;
    if (!content || content.length === 0) return null;

    const handleNext = () => {
        if (currentPage < content.length - 1) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className={`w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'}`}>
                {/* Header */}
                <div className={`p-4 border-b flex justify-between items-center ${theme === 'dark' ? 'border-slate-800' : 'border-gray-100'}`}>
                    <div>
                        <h2 className="font-bold text-lg line-clamp-1">{title}</h2>
                        <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                            ទំព័រ {currentPage + 1} នៃ {content.length}
                        </p>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors`}>
                        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {content[currentPage].title && (
                        <h3 className="text-xl font-bold mb-4 text-center">{content[currentPage].title}</h3>
                    )}
                    <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed font-khmer text-lg">
                        {content[currentPage].content}
                    </div>
                </div>

                {/* Footer / Navigation */}
                <div className={`p-4 border-t flex justify-between items-center ${theme === 'dark' ? 'border-slate-800' : 'border-gray-100'}`}>
                    <button 
                        onClick={handlePrev} 
                        disabled={currentPage === 0}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            currentPage === 0 
                                ? 'opacity-50 cursor-not-allowed text-gray-400' 
                                : 'hover:bg-gray-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-5 h-5" />
                    </button>

                    <div className="flex gap-1 flex-wrap justify-center max-w-[200px]">
                        {content.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`w-2 h-2 rounded-full transition-colors ${
                                    idx === currentPage 
                                        ? 'bg-emerald-500' 
                                        : (theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200')
                                }`}
                            />
                        ))}
                    </div>

                    <button 
                        onClick={handleNext} 
                        disabled={currentPage === content.length - 1}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            currentPage === content.length - 1 
                                ? 'opacity-50 cursor-not-allowed text-gray-400' 
                                : 'hover:bg-gray-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        <span>បន្ទាប់</span>
                        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
