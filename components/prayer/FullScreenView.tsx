import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon, Sun01Icon as CloudSun01Icon, Moon01Icon, ArrowLeft01Icon, Settings01Icon, Link01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { LOCATION_DATA } from './data';

interface FullScreenViewProps {
  setIsFullscreen: (val: boolean) => void;
  currentTime: Date;
  province: string;
  districtIndex: string;
  customLocation: any;
  todayData: any;
  nextPrayer: any;
  timeOffsets: any;
  formatTime12: (time24?: string) => { time: string; period: string };
  mosqueName: string;
  bgImage?: string | null;
  t: (key: string) => string;
  onOpenSettings: () => void;
}

export const FullScreenView: React.FC<FullScreenViewProps> = ({
  setIsFullscreen,
  currentTime,
  province,
  districtIndex,
  customLocation,
  todayData,
  nextPrayer,
  timeOffsets,
  formatTime12,
  mosqueName,
  bgImage,
  t,
  onOpenSettings
}) => {
  const [showMenu, setShowMenu] = useState(false);
  
  const currentH12 = currentTime.getHours() % 12 || 12;
  const currentM = String(currentTime.getMinutes()).padStart(2, '0');
  const currentS = String(currentTime.getSeconds()).padStart(2, '0');
  const currentPeriod = currentTime.getHours() >= 12 ? 'PM' : 'AM';
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const currentDateStr = currentTime.toLocaleDateString('en-US', dateOptions);

  return (
    <div 
      className="fixed inset-0 md:left-20 z-50 text-white flex flex-col overflow-hidden font-khmer bg-cover bg-center" 
      style={{ 
          backgroundColor: bgImage ? 'transparent' : '#0a0a0a',
          backgroundImage: bgImage ? `url(${bgImage})` : 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)'
      }}
    >
      {/* Drawer Menu */}
      {showMenu && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMenu(false)}></div>
          <div className="relative w-64 md:w-80 bg-[#111111] h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300 border-r border-white/10">
            <div className="p-6 flex items-center justify-between border-b border-white/10">
              <h3 className="text-xl font-bold text-white">{t('common.menu')}</h3>
              <button onClick={() => setShowMenu(false)} className="text-gray-400 hover:text-white transition-colors">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col p-4 gap-2">
              <button 
                onClick={() => setIsFullscreen(false)}
                className="flex items-center gap-3 w-full p-4 text-left text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="w-5 h-5" />
                <span className="font-medium">{t('common.back')}</span>
              </button>
              <button 
                onClick={() => {
                  setShowMenu(false);
                  onOpenSettings();
                }}
                className="flex items-center gap-3 w-full p-4 text-left text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} className="w-5 h-5" />
                <span className="font-medium">{t('common.settings')}</span>
              </button>
              <button 
                onClick={() => {}}
                className="flex items-center gap-3 w-full p-4 text-left text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                <HugeiconsIcon icon={Link01Icon} strokeWidth={2} className="w-5 h-5" />
                <span className="font-medium">{t('common.getLink')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dark overlay for better readability if bgImage is present */}
      {bgImage && <div className="absolute inset-0 bg-black/50 z-[-1]"></div>}
      {/* Top Bar */}
      <div className="flex justify-between items-start p-3 md:px-6 shrink-0">
        <div className="flex items-center gap-2 md:gap-4 mt-1">
          <button onClick={() => setShowMenu(true)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
            <span className="text-sm md:text-base font-medium tracking-wider font-sans hidden sm:inline">Online</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center text-center mt-1">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-400 tracking-wider drop-shadow-md">
            {mosqueName || 'ឈ្មោះម៉ាស្ជិត'}
          </h2>
        </div>

        <div className="flex items-center gap-2 md:gap-3 text-base sm:text-lg md:text-xl font-medium font-sans mt-1">
          <HugeiconsIcon icon={CloudSun01Icon} strokeWidth={1.5} className="w-5 h-5 md:w-7 md:h-7" />
          <span>28°C</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-4 md:px-8 w-full">
        <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-[85rem] gap-6 md:gap-6">
          {/* Shuruk */}
          <div className="text-center flex-1 order-2 md:order-1">
            <p className="text-sm md:text-base lg:text-lg mb-1 text-gray-300 tracking-wide font-khmer">{t('prayer.sunrise')}</p>
            <div className="flex items-baseline justify-center gap-1 md:gap-2 font-sans">
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">{formatTime12(todayData?.timings.Sunrise).time}</p>
              <span className="text-sm md:text-base font-bold text-gray-400">{formatTime12(todayData?.timings.Sunrise).period}</span>
            </div>
          </div>

          {/* Center Clock */}
          <div className="flex flex-col items-center flex-[2] order-1 md:order-2 w-full md:w-auto z-10">
            <div className="w-full max-w-2xl shadow-2xl rounded-2xl md:rounded-[2rem] overflow-hidden flex flex-col font-sans ring-1 ring-white/10">
              {/* Top Purple Box */}
              <div className="bg-gradient-to-b from-[#3b2382] to-[#2d1b63] px-4 pt-2 pb-4 md:px-8 md:pt-4 md:pb-6 text-center flex flex-col items-center relative">
                <div className="flex items-start justify-center gap-1 md:gap-2 mb-1 md:mb-2 relative z-10">
                   <span className="text-6xl sm:text-7xl md:text-[6rem] lg:text-[8rem] font-bold tracking-tighter leading-none text-white drop-shadow-lg">{String(currentH12).padStart(2, '0')}:{currentM}</span>
                   <div className="flex flex-col items-start text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/60 font-medium leading-none mt-1 md:mt-2 lg:mt-3 drop-shadow-md">
                     <span>:{currentS}</span>
                     <span className="mt-1 md:mt-2">{currentPeriod}</span>
                   </div>
                </div>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 tracking-wide drop-shadow-md relative z-10 font-medium">{currentDateStr}</p>
              </div>
              
              {/* Bottom Dark Box for Next Prayer */}
              <div className="bg-[#161616] w-full py-2 md:py-3 border-t border-black/80">
                <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold flex items-center justify-center gap-2 md:gap-3 text-white drop-shadow-md font-khmer">
                  <HugeiconsIcon icon={Moon01Icon} strokeWidth={2.5} className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <span>{t(`prayer.${nextPrayer.key.toLowerCase()}`)} {nextPrayer.countdown}</span>
                  <HugeiconsIcon icon={Moon01Icon} strokeWidth={2.5} className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Jumua */}
          <div className="text-center flex-1 order-3">
            <p className="text-sm md:text-base lg:text-lg mb-1 text-gray-300 tracking-wide font-khmer">{t('prayer.jumua')}</p>
            <div className="flex items-baseline justify-center gap-1 md:gap-2 font-sans">
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">{formatTime12(todayData?.timings.Dhuhr).time}</p>
              <span className="text-sm md:text-base font-bold text-gray-400">{formatTime12(todayData?.timings.Dhuhr).period}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Prayers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-4 p-3 md:p-6 max-w-[90rem] mx-auto w-full shrink-0">
        {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((k) => {
          const isNext = nextPrayer.key === k;
          const timeObj = formatTime12(todayData?.timings[k]);
          const offset = (timeOffsets as any)[k] || 0;
          return (
            <div key={k} className={`flex flex-col items-center justify-center py-2 px-2 md:py-4 md:px-4 rounded-xl md:rounded-2xl transition-all border ${isNext ? 'bg-gradient-to-b from-[#3b2382] to-[#2d1b63] border-[#4b3392] shadow-[0_0_30px_rgba(45,27,99,0.5)] scale-105' : 'bg-[#111111]/80 border-white/5 hover:bg-[#1a1a1a]'}`}>
              <p className={`text-sm sm:text-base md:text-lg lg:text-xl mb-1 md:mb-1.5 tracking-wide font-khmer ${isNext ? 'text-white' : 'text-gray-400'}`}>{t(`prayer.${k.toLowerCase()}`)}</p>
              <div className="flex items-baseline justify-center gap-1 md:gap-2 mb-1.5 font-sans">
                <p className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight ${isNext ? 'text-white' : 'text-gray-100'}`}>{timeObj.time}</p>
                <span className={`text-xs md:text-sm font-bold ${isNext ? 'text-white/80' : 'text-gray-500'}`}>{timeObj.period}</span>
              </div>
              <div className={`text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full ${isNext ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400'}`}>
                {offset > 0 ? `+${offset} min` : offset < 0 ? `${offset} min` : 'On time'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
