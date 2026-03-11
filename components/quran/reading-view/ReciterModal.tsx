import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Tick01Icon } from '@hugeicons/core-free-icons';
import React from 'react';

import { RECITERS } from '../api';

interface ReciterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentReciterId: number;
  onReciterChange: (id: number) => void;
}

export const ReciterModal: React.FC<ReciterModalProps> = ({
  isOpen,
  onClose,
  currentReciterId,
  onReciterChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 font-khmer">ជ្រើសរើសអ្នកសូត្រ</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full">
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto -mx-2 px-2 space-y-3 pb-4">
          {RECITERS.map((r) => (
            <button
              key={r.id}
              onClick={() => onReciterChange(r.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-2xl border transition-all ${
                currentReciterId === r.id 
                ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' 
                : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`w-14 h-14 rounded-full overflow-hidden border-2 ${currentReciterId === r.id ? 'border-emerald-500' : 'border-transparent'}`}>
                <img referrerPolicy="no-referrer" src={r.image || undefined} alt={r.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 text-left">
                <p className={`font-semibold ${currentReciterId === r.id ? 'text-emerald-900' : 'text-gray-900'}`}>{r.name}</p>
                {currentReciterId === r.id && <span className="text-xs text-emerald-600 font-medium">កំពុងប្រើប្រាស់</span>}
              </div>
              {currentReciterId === r.id && (
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm">
                  <HugeiconsIcon icon={Tick01Icon} strokeWidth={1.5} className="w-3.5 h-3.5" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
