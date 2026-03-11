import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Facebook01Icon, SentIcon, Link01Icon, MoreHorizontalIcon, Tick01Icon } from '@hugeicons/core-free-icons';
import React from 'react';

import { Ayah } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  ayah: Ayah | null;
  linkCopied: boolean;
  onShareAction: (action: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  ayah,
  linkCopied,
  onShareAction,
}) => {
  if (!isOpen || !ayah) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1f2125] w-full max-w-sm rounded-3xl p-6 relative shadow-2xl animate-in zoom-in-95 duration-200 text-white">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white transition-colors">
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
        </button>
        <div className="text-center mb-6 mt-2">
          <h3 className="text-lg font-bold font-khmer mb-1">ចែករំលែក</h3>
          <p className="text-sm text-gray-400 font-khmer">អាយ៉ាត់ទី {ayah.verse_key.split(':')[1]}</p>
        </div>
        
        <div className="bg-[#2a2d32] rounded-2xl p-4 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <p className="text-right font-amiri-quran text-xl leading-loose mb-3" dir="rtl">
            <span dangerouslySetInnerHTML={{ __html: ayah.text_arabic }} />
          </p>
          <p className="text-sm text-gray-300 font-khmer leading-relaxed mb-3">
            {ayah.translations?.[0]?.text?.replace(/<[^>]*>?/gm, '')}
          </p>
          <div className="text-gray-400 text-sm italic">
            The Prophet ﷺ said:<br/>
            <span className="text-white font-medium">'Convey from me, even if it is one verse.'</span><br/>
            (Bukhari 3461)
          </div>
        </div>
        <div className="flex justify-center gap-6 mb-4">
          <button onClick={() => onShareAction('facebook')} className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center transition-transform group-hover:scale-110">
              <HugeiconsIcon icon={Facebook01Icon} strokeWidth={1.5} className="w-6 h-6 fill-white text-white" />
            </div>
            <span className="text-xs font-medium text-gray-300">Facebook</span>
          </button>
          <button onClick={() => onShareAction('telegram')} className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-full bg-[#229ED9] flex items-center justify-center transition-transform group-hover:scale-110">
              <HugeiconsIcon icon={SentIcon} strokeWidth={1.5} className="w-5 h-5 fill-white text-white ml-0.5" />
            </div>
            <span className="text-xs font-medium text-gray-300">Telegram</span>
          </button>
          <button onClick={() => onShareAction('copy')} className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-full bg-white text-gray-900 flex items-center justify-center transition-transform group-hover:scale-110">
              {linkCopied ? <HugeiconsIcon icon={Tick01Icon} strokeWidth={1.5} className="w-6 h-6 text-green-600" /> : <HugeiconsIcon icon={Link01Icon} strokeWidth={1.5} className="w-6 h-6" />}
            </div>
            <span className="text-xs font-medium text-gray-300">{linkCopied ? 'Copied' : 'Copy link'}</span>
          </button>
          <button onClick={() => onShareAction('more')} className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center transition-transform group-hover:scale-110">
              <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.5} className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-300">More</span>
          </button>
        </div>
      </div>
    </div>
  );
};
