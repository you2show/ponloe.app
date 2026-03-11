import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, PlayIcon, PauseIcon, Search01Icon, Download01Icon, Link01Icon } from '@hugeicons/core-free-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Surah } from './types';

interface ReciterDetailProps {
  reciter: any;
  surahs: Surah[];
  onBack: () => void;
  onChangeReciter: (reciter: any) => void;
  isSidebarCollapsed?: boolean;
  playingSurahId: number | null;
  setPlayingSurahId: (id: number | null) => void;
  playingReciter: any | null;
  setPlayingReciter: (reciter: any | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export const ReciterDetail: React.FC<ReciterDetailProps> = ({ 
  reciter, 
  surahs, 
  onBack, 
  onChangeReciter, 
  isSidebarCollapsed = false,
  playingSurahId,
  setPlayingSurahId,
  playingReciter,
  setPlayingReciter,
  isPlaying,
  setIsPlaying
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSurahs = surahs.filter(s => 
    s.name_simple.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.name_khmer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toString() === searchQuery
  );

  const handlePlayPause = (surahId: number) => {
    if (playingSurahId === surahId && playingReciter?.id === reciter.id) {
      setIsPlaying(!isPlaying);
    } else {
      setPlayingReciter(reciter);
      setPlayingSurahId(surahId);
      setIsPlaying(true);
    }
  };

  return (
    <div className={`flex-1 h-full overflow-y-auto relative custom-scrollbar ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-emerald-900/40' : 'bg-[#2ca4a8]'} text-white pt-8 pb-12 px-4 md:px-8 relative`}>
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-6 h-6" />
        </button>
        
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6 mt-4">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white/20 shrink-0 shadow-xl">
            <img referrerPolicy="no-referrer" src={reciter.image || undefined} 
              alt={reciter.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(reciter.name)}&background=0D8ABC&color=fff&size=256`;
              }}
            />
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{reciter.name}</h1>
            <p className="text-white/80 text-sm md:text-base mb-6 line-clamp-3 leading-relaxed">
              {reciter.bio || `${reciter.name} is a renowned Quran reciter known for his beautiful and moving recitation of the Holy Quran.`}
            </p>
            <button 
              onClick={() => handlePlayPause(1)} // Play Al-Fatihah by default
              className={`px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 mx-auto md:mx-0 transition-colors ${theme === 'dark' ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-black text-white hover:bg-gray-900'}`}
            >
              <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} className="w-5 h-5 fill-current" /> Play Radio
            </button>
          </div>
        </div>
      </div>

      {/* Surah List */}
      <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`} />
          </div>
          <input 
            type="text" 
            placeholder="Search Chapter" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#2ca4a8] transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-200 placeholder-slate-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSurahs.map(surah => (
            <div key={surah.id} className={`rounded-xl p-4 flex items-center gap-4 border transition-shadow group ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-lg' : 'bg-white border-gray-100 hover:shadow-md'}`}>
              <button 
                onClick={() => handlePlayPause(surah.id)}
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  playingSurahId === surah.id && playingReciter?.id === reciter.id
                    ? (theme === 'dark' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-[#e6f6f6] text-[#2ca4a8]')
                    : (theme === 'dark' ? 'bg-slate-800 text-slate-400 group-hover:bg-emerald-900/30 group-hover:text-emerald-400' : 'bg-gray-50 text-gray-600 group-hover:bg-[#e6f6f6] group-hover:text-[#2ca4a8]')
                }`}
              >
                {playingSurahId === surah.id && playingReciter?.id === reciter.id && isPlaying ? (
                  <HugeiconsIcon icon={PauseIcon} strokeWidth={1.5} className="w-5 h-5 fill-current" />
                ) : (
                  <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>
              
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm md:text-base ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>{surah.id}.</span>
                  <h3 className={`font-bold text-sm md:text-base truncate font-khmer ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>
                    {surah.name_khmer || surah.name_simple}
                  </h3>
                </div>
                <p className={`text-lg font-arabic mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>{surah.name_arabic}</p>
              </div>
              
              <div className="flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}>
                  <HugeiconsIcon icon={Link01Icon} strokeWidth={1.5} className="w-4 h-4" />
                </button>
                <button className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}>
                  <HugeiconsIcon icon={Download01Icon} strokeWidth={1.5} className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
