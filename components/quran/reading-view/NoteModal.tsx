import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Edit02Icon, Delete02Icon, FloppyDiskIcon } from '@hugeicons/core-free-icons';
import React from 'react';

import { useTheme } from '@/contexts/ThemeContext';
import { Ayah } from '../types';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  ayah: Ayah | null;
  noteContent: string;
  setNoteContent: (content: string) => void;
  onSave: () => void;
  onDelete: () => void;
  hasExistingNote: boolean;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  ayah,
  noteContent,
  setNoteContent,
  onSave,
  onDelete,
  hasExistingNote,
}) => {
  const { theme } = useTheme();
  if (!isOpen || !ayah) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 scale-100 animate-in zoom-in-95 duration-200 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-bold font-khmer flex items-center gap-2 ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>
            <HugeiconsIcon icon={Edit02Icon} strokeWidth={1.5} className="w-5 h-5 text-blue-600" />
            កំណត់ហេតុ (Ayah {ayah.verse_key.split(':')[1]})
          </h3>
          <button onClick={onClose} className={`transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'}`}>
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
          </button>
        </div>
        <textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="សរសេរកំណត់ហេតុ ឬការយល់ឃើញរបស់អ្នកនៅទីនេះ..."
          className={`w-full h-40 p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none font-khmer text-sm leading-relaxed mb-4 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
        />
        <div className="flex gap-3">
          {hasExistingNote && (
            <button 
              onClick={onDelete}
              className={`p-3 rounded-xl transition-colors ${theme === 'dark' ? 'text-red-400 bg-red-900/20 hover:bg-red-900/40' : 'text-red-500 bg-red-50 hover:bg-red-100'}`}
              title="Delete Note"
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.5} className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={onSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 font-khmer"
          >
            <HugeiconsIcon icon={FloppyDiskIcon} strokeWidth={1.5} className="w-4 h-4" /> រក្សាទុក
          </button>
        </div>
      </div>
    </div>
  );
};
