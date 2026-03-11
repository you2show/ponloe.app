import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Facebook01Icon, TelegramIcon, YoutubeIcon, TiktokIcon, InstagramIcon, CopyIcon, Share01Icon } from '@hugeicons/core-free-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';

interface ShareMenuProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
}

export const ShareMenu: React.FC<ShareMenuProps> = ({ isOpen, onClose, url, title }) => {
  const { theme } = useTheme();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const shareOptions = [
    { name: 'Facebook', icon: Facebook01Icon, color: 'bg-blue-600', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: 'Telegram', icon: TelegramIcon, color: 'bg-blue-400', url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title || '')}` },
    { name: 'WhatsApp', icon: Share01Icon, color: 'bg-green-500', url: `https://api.whatsapp.com/send?text=${encodeURIComponent((title ? title + ' ' : '') + url)}` },
    { name: 'Messenger', icon: Facebook01Icon, color: 'bg-blue-500', url: `fb-messenger://share/?link=${encodeURIComponent(url)}` },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      showToast('បានចម្លងតំណរួចហើយ!', 'success');
      onClose();
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 bg-white text-gray-900 dark:bg-slate-900 dark:text-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-khmer">ចែករំលែកទៅកាន់</h3>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400">
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {shareOptions.map((option, i) => (
            <a 
              key={i} 
              href={option.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`w-12 h-12 ${option.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <HugeiconsIcon icon={option.icon} strokeWidth={1.5} className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold opacity-70">{option.name}</span>
            </a>
          ))}
        </div>

        <div className="p-4 rounded-2xl flex items-center gap-3 border bg-gray-50 border-gray-100 dark:bg-slate-800/50 dark:border-slate-700">
          <div className="flex-1 truncate text-xs opacity-60 font-mono">{url}</div>
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shrink-0"
          >
            <HugeiconsIcon icon={CopyIcon} strokeWidth={1.5} className="w-4 h-4" />
            ចម្លង
          </button>
        </div>
      </div>
    </div>
  );
};
