import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Store01Icon, Add01Icon } from '@hugeicons/core-free-icons';
import { SpecialInputProps } from './types';
import { useTheme } from '@/contexts/ThemeContext';

export const MarketInput: React.FC<SpecialInputProps> = ({ onCancel }) => {
  const { theme } = useTheme();
  return (
    <div className={`space-y-4 p-4 rounded-xl border mb-4 animate-in fade-in zoom-in-95 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
      <div className="flex justify-between items-center">
        <h4 className={`font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-700'}`}>
          <HugeiconsIcon icon={Store01Icon} strokeWidth={1.5} className="w-5 h-5 text-indigo-500"/> លក់ទំនិញ
        </h4>
        <button onClick={onCancel} className={`text-xs hover:text-red-500 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>លុបចោល</button>
      </div>
      
      <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors cursor-pointer ${theme === 'dark' ? 'border-slate-600 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:border-indigo-400' : 'border-gray-300 bg-white text-gray-400 hover:bg-gray-50 hover:border-indigo-300'}`}>
          <div className={`p-2 rounded-full mb-2 ${theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
             <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} className="w-5 h-5 text-indigo-500" />
          </div>
          <span className="text-xs font-bold">បន្ថែមរូបភាពទំនិញ</span>
      </div>

      <input type="text" placeholder="ចំណងជើងទំនិញ" className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-gray-200 text-gray-900'}`} />
      
      <div className="grid grid-cols-2 gap-3">
          <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>$</span>
              <input type="number" placeholder="តម្លៃ" className={`w-full pl-7 p-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-gray-200 text-gray-900'}`} />
          </div>
          <div className="relative">
              <input type="text" placeholder="ទីតាំង (ខេត្ត/ក្រុង)" className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-gray-200 text-gray-900'}`} />
          </div>
      </div>
    </div>
  );
};
