import { HugeiconsIcon } from '@hugeicons/react';
import { CleanIcon, BookOpen01Icon, HelpCircleIcon, Image01Icon, UserIcon, ArrowRight01Icon, PlayCircleIcon, HeadphonesIcon, LibraryIcon, UserGroupIcon, Location01Icon, Notification01Icon, Settings01Icon, Moon01Icon, Calendar01Icon, Compass01Icon, Wallet01Icon, ArrowUpRight01Icon, FavouriteIcon, MoreHorizontalIcon, QuoteDownIcon, Sun01Icon, Share01Icon, Calculator01Icon, ClipboardIcon, Baby01Icon, Cancel01Icon, SecurityCheckIcon, ScrollIcon, DragDropIcon, Restaurant01Icon, Quran01Icon, DuaIcon, PlayListIcon, TasbihIcon, CompassIcon, SalahIcon, Gps01Icon, DirectionRight02Icon, Ramadhan01Icon, WuduIcon, AlignSelectionIcon, HajiIcon, SujoodIcon, StatusIcon, Ramadhan02Icon, Image03Icon, AllahIcon } from '@hugeicons/core-free-icons';
import React, { useState, useEffect } from 'react';
import { ViewMode } from '@/types';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useWeather } from '@/hooks/useWeather';
import { LOCATION_DATA } from '../prayer/data';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '../auth/AuthModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { MosqueSilhouette } from './MosqueSilhouette';
import { LocationSelectionModal } from './LocationSelectionModal';

import { NotificationBell } from '../community/NotificationPanel';

interface WidgetProps {
  setView: (view: ViewMode) => void;
}

export const Header: React.FC<WidgetProps> = ({ setView }) => {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const isTelegramUser = user?.email?.startsWith('tg') && user?.email?.endsWith('@ponloe.com');
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const displayName = profile?.full_name || user?.user_metadata?.full_name;
  const displayEmailOrName = displayName || (isTelegramUser ? 'គណនី Telegram' : user?.email?.split('@')[0]);

  return (
    <>
    <div className="flex justify-between items-center mb-6 pt-2">
       <div className="flex items-center gap-3">
          <div 
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] cursor-pointer hover:scale-105 transition-transform"
            onClick={() => user ? setView(ViewMode.PROFILE) : setShowAuthModal(true)}
          >
             <div className="w-full h-full rounded-full border-2 overflow-hidden flex items-center justify-center text-emerald-600 border-white bg-gray-100 dark:border-slate-800 dark:bg-slate-800">
                {avatarUrl ? (
                  <img referrerPolicy="no-referrer" src={avatarUrl} alt="User" className="w-full h-full object-cover" />
                ) : displayName ? (
                  <img referrerPolicy="no-referrer" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0d9488&color=fff`} alt="User" className="w-full h-full object-cover" />
                ) : user && !isTelegramUser ? (
                  <img referrerPolicy="no-referrer" src={`https://ui-avatars.com/api/?name=${user.email}&background=0d9488&color=fff`} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <HugeiconsIcon icon={UserIcon} strokeWidth={1.5} className="w-6 h-6" />
                )}
             </div>
          </div>
          <div onClick={() => !user && setShowAuthModal(true)} className={!user ? "cursor-pointer" : ""}>
             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t('home.greeting')}</p>
             <h2 className="text-base font-bold font-khmer text-gray-800 dark:text-white">
               {user ? displayEmailOrName : t('home.loginPrompt')}
             </h2>
          </div>
       </div>
       <div className="flex gap-2">
          <NotificationBell />
       </div>
    </div>
    <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

const Cloud = ({ className, opacity = 1, style }: { className?: string, opacity?: number, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 100 40" className={className} style={{ opacity, ...style }} xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M 20 30 a 10 10 0 0 1 0 -20 a 15 15 0 0 1 25 -5 a 15 15 0 0 1 25 5 a 10 10 0 0 1 0 20 z" />
  </svg>
);

const Tree = ({ className, fill, trunkFill = "#4a3f35" }: { className?: string, fill?: string, trunkFill?: string }) => (
  <svg viewBox="0 0 100 120" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Trunk */}
    <path d="M45,120 L45,60 L55,60 L55,120 Z" fill={trunkFill} />
    <path d="M50,80 L35,50 L40,48 L50,75 Z" fill={trunkFill} />
    <path d="M50,70 L65,45 L60,43 L50,65 Z" fill={trunkFill} />
    
    {/* Leaves */}
    <circle cx="50" cy="35" r="35" fill={fill} opacity="0.95" />
    <circle cx="30" cy="55" r="25" fill={fill} opacity="0.9" />
    <circle cx="70" cy="55" r="25" fill={fill} opacity="0.9" />
    <circle cx="50" cy="20" r="20" fill="#ffffff" opacity="0.1" /> {/* Highlight */}
    <circle cx="50" cy="50" r="20" fill="#000000" opacity="0.1" /> {/* Shadow */}
  </svg>
);

const Bird = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.94 8.77c-1.84-.6-3.8-.2-5.45.97-1.4 1-2.9 1-4.3 0-1.65-1.17-3.6-1.57-5.45-.97-1.3.43-2.3 1.6-3.1 2.86.8-1.2 2.1-2 3.5-2 1.8 0 3.5.8 4.8 2.1 1.3-1.3 3-2.1 4.8-2.1 1.4 0 2.7.8 3.5 2-.8-1.26-1.8-2.43-3.1-2.86z"/>
  </svg>
);

export const SmartPrayerCard: React.FC<WidgetProps> = ({ setView }) => {
    const { t } = useLanguage();
    
    // Read location from localStorage
    const [locConfig, setLocConfig] = useState<any>({ province: 'phnom-penh', districtIndex: 0, communeIndex: 0, customLat: undefined, customLon: undefined, name: undefined });
    const [showLocationModal, setShowLocationModal] = useState(false);
    
    useEffect(() => {
      const savedLoc = localStorage.getItem('prayerLocation');
      if (savedLoc) {
        try {
          const parsed = JSON.parse(savedLoc);
          if (parsed.type === 'auto') {
            setLocConfig({ customLat: parsed.lat, customLon: parsed.lon, name: parsed.name });
          } else if (parsed.type === 'manual') {
            setLocConfig({ province: parsed.province || 'phnom-penh', districtIndex: parseInt(parsed.districtIndex || '0'), communeIndex: parseInt(parsed.communeIndex || '0') });
          }
        } catch (e) {}
      }
    }, []);

    const lat = locConfig.customLat || LOCATION_DATA[locConfig.province]?.districts?.[locConfig.districtIndex]?.lat;
    const lon = locConfig.customLon || LOCATION_DATA[locConfig.province]?.districts?.[locConfig.districtIndex]?.lon;

    const { todayData, nextPrayer, loading: prayerLoading } = usePrayerTimes(locConfig.province, locConfig.districtIndex, locConfig.communeIndex, locConfig.customLat, locConfig.customLon);
    const { weather, loading: weatherLoading } = useWeather(lat, lon);
    const loading = prayerLoading || weatherLoading;

    const [progress, setProgress] = useState(0);
    const [isDay, setIsDay] = useState(true);
    const [timeString, setTimeString] = useState('');

    const locationName = locConfig.customLat 
        ? (locConfig.name || 'ទីតាំងបច្ចុប្បន្ន') 
        : (LOCATION_DATA[locConfig.province]?.districts?.[locConfig.districtIndex]?.name || 'ភ្នំពេញ');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTimeString(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
            
            if (!todayData?.timings) return;

            const parseTime = (t: string) => {
                const [h, m] = t.split(':').map(Number);
                return h * 60 + m;
            };

            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const sunrise = parseTime(todayData.timings.Sunrise || "06:00");
            const maghrib = parseTime(todayData.timings.Maghrib || "18:00");

            let p = 0;
            let day = true;

            if (currentMinutes >= sunrise && currentMinutes < maghrib) {
                // Day Time
                day = true;
                const totalDay = maghrib - sunrise;
                const elapsed = currentMinutes - sunrise;
                p = (elapsed / totalDay) * 100;
            } else {
                // Night Time
                day = false;
                const totalNight = (24 * 60 - maghrib) + sunrise;
                let elapsed = 0;
                if (currentMinutes >= maghrib) {
                    elapsed = currentMinutes - maghrib;
                } else {
                    elapsed = (24 * 60 - maghrib) + currentMinutes;
                }
                p = (elapsed / totalNight) * 100;
            }

            setProgress(Math.min(Math.max(p, 0), 100));
            setIsDay(day);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [todayData]);

    const hijriDate = todayData ? `${todayData.date.hijri.day} ${todayData.date.hijri.month.ar}` : '...';

    const getThemeColors = () => {
        if (loading) return { skyCenter: '#1e293b', skyMiddle: '#0f172a', skyEdge: '#020617', backHill: '#1e293b', frontHill: '#0f172a', tree: '#020617', cloud: '#ffffff', cloudOpacity: 0.1 };
        
        if (isDay) {
            if (progress < 20) {
                // Dawn (Sunrise)
                return { 
                    skyCenter: '#fef08a', // yellow-200
                    skyMiddle: '#fb923c', // orange-400
                    skyEdge: '#9d174d', // pink-800
                    backHill: '#d946ef', // Fuchsia
                    frontHill: '#9333ea', // Purple
                    tree: '#7e22ce',
                    cloud: '#ffe4e6',
                    cloudOpacity: 0.6
                };
            } else if (progress < 80) {
                // Day
                return { 
                    skyCenter: '#ffffff', // white
                    skyMiddle: '#7dd3fc', // sky-300
                    skyEdge: '#0284c7', // sky-600
                    backHill: '#34d399', // Emerald 400
                    frontHill: '#10b981', // Emerald 500
                    tree: '#059669',
                    cloud: '#ffffff',
                    cloudOpacity: 0.8
                };
            } else {
                // Dusk (Sunset)
                return { 
                    skyCenter: '#fde047', // yellow-300
                    skyMiddle: '#f43f5e', // rose-500
                    skyEdge: '#4c1d95', // violet-900
                    backHill: '#e11d48', // Rose 600
                    frontHill: '#be123c', // Rose 700
                    tree: '#881337',
                    cloud: '#fecdd3',
                    cloudOpacity: 0.5
                };
            }
        } else {
            // Night
            return { 
                skyCenter: '#3730a3', // indigo-800
                skyMiddle: '#1e1b4b', // indigo-950
                skyEdge: '#020617', // slate-950
                backHill: '#312e81', // Indigo 900
                frontHill: '#1e1b4b', // Indigo 950
                tree: '#0f172a',
                cloud: '#818cf8',
                cloudOpacity: 0.15
            };
        }
    };

    const themeColors = getThemeColors();
    const sunX = 10 + progress * 0.8;
    const sunY = 100 - (Math.sin((progress / 100) * Math.PI) * 55 + 13.5);

    return (
      <>
      <div 
        onClick={() => setView(ViewMode.PRAYER)}
        className="relative mb-6 md:mb-8 group cursor-pointer overflow-hidden rounded-3xl md:rounded-[2.5rem] shadow-xl transition-all duration-1000 hover:shadow-2xl hover:scale-[1.01] md:aspect-[2.5/1] aspect-auto min-h-[180px] md:min-h-[280px]"
      >
         <style>{`
            @keyframes flyAcross {
                0% { left: -20%; transform: translateY(0) scale(0.8); opacity: 0; }
                10% { opacity: 1; }
                25% { transform: translateY(-15px) scale(0.9); }
                50% { transform: translateY(5px) scale(1); }
                75% { transform: translateY(-10px) scale(0.9); }
                90% { opacity: 1; }
                100% { left: 120%; transform: translateY(0) scale(0.8); opacity: 0; }
            }
            @keyframes flap {
                0%, 100% { transform: scaleY(1); }
                50% { transform: scaleY(0.4); }
            }
         `}</style>
         {/* Sky Background */}
         <div 
            className="absolute inset-0 transition-colors duration-1000" 
            style={{
                background: `radial-gradient(circle at ${sunX}% ${sunY}%, ${themeColors.skyCenter} 0%, ${themeColors.skyMiddle} 50%, ${themeColors.skyEdge} 100%)`
            }}
         />
         
         {/* Clouds */}
         <div className="absolute inset-0 pointer-events-none overflow-hidden">
             {/* Base Clouds (Always present but opacity changes) */}
             <Cloud className="absolute top-[10%] left-[10%] w-24 h-10 transition-all duration-1000 animate-[float_20s_infinite_linear]" style={{ color: themeColors.cloud }} opacity={themeColors.cloudOpacity * (weather?.weathercode && weather.weathercode > 0 ? 0.8 : 1)} />
             <Cloud className="absolute top-[25%] right-[20%] w-32 h-12 transition-all duration-1000 animate-[float_25s_infinite_linear_reverse]" style={{ color: themeColors.cloud }} opacity={themeColors.cloudOpacity * (weather?.weathercode && weather.weathercode > 0 ? 0.6 : 0.8)} />
             <Cloud className="absolute top-[15%] left-[60%] w-20 h-8 transition-all duration-1000 animate-[float_18s_infinite_linear]" style={{ color: themeColors.cloud }} opacity={themeColors.cloudOpacity * (weather?.weathercode && weather.weathercode > 0 ? 0.4 : 0.6)} />
             
             {/* Extra Clouds for Cloudy/Rainy Weather */}
             {weather?.weathercode && weather.weathercode >= 3 && (
                 <>
                     <Cloud className="absolute top-[35%] left-[30%] w-40 h-16 transition-all duration-1000 animate-[float_30s_infinite_linear]" style={{ color: themeColors.cloud }} opacity={themeColors.cloudOpacity * 0.9} />
                     <Cloud className="absolute top-[5%] right-[5%] w-28 h-12 transition-all duration-1000 animate-[float_22s_infinite_linear_reverse]" style={{ color: themeColors.cloud }} opacity={themeColors.cloudOpacity * 0.7} />
                     <Cloud className="absolute top-[40%] right-[40%] w-36 h-14 transition-all duration-1000 animate-[float_28s_infinite_linear]" style={{ color: themeColors.cloud }} opacity={themeColors.cloudOpacity * 0.8} />
                 </>
             )}

             {/* Heavy Clouds for Rain/Storm */}
             {weather?.weathercode && weather.weathercode >= 51 && (
                 <>
                     <Cloud className="absolute top-[20%] left-[-10%] w-48 h-20 transition-all duration-1000 animate-[float_35s_infinite_linear]" style={{ color: themeColors.cloud }} opacity={themeColors.cloudOpacity} />
                     <Cloud className="absolute top-[10%] right-[-5%] w-56 h-24 transition-all duration-1000 animate-[float_40s_infinite_linear_reverse]" style={{ color: themeColors.cloud }} opacity={themeColors.cloudOpacity} />
                 </>
             )}
         </div>

         {/* Rain Effect */}
         {weather?.weathercode && weather.weathercode >= 51 && (
             <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                 <style>{`
                     @keyframes rainDrop {
                         0% { transform: translateY(-10px) rotate(15deg); opacity: 0; }
                         10% { opacity: 0.6; }
                         90% { opacity: 0.6; }
                         100% { transform: translateY(300px) rotate(15deg); opacity: 0; }
                     }
                 `}</style>
                 {[...Array(30)].map((_, i) => (
                     <div 
                         key={`rain-${i}`}
                         className="absolute bg-white/40 w-[1.5px] h-4 rounded-full"
                         style={{
                             left: `${Math.random() * 100}%`,
                             top: `${Math.random() * -20}%`,
                             animation: `rainDrop ${0.5 + Math.random() * 0.5}s linear infinite`,
                             animationDelay: `${Math.random() * 2}s`
                         }}
                     />
                 ))}
             </div>
         )}

         {/* Birds (Only during day/dusk/dawn) */}
         {isDay && (
             <div className="absolute top-[15%] left-0 w-full h-[20%] pointer-events-none z-10 overflow-hidden opacity-60">
                 <div className="absolute flex gap-2 text-slate-800/60" style={{ animation: 'flyAcross 30s linear infinite 2s' }}>
                     <Bird className="w-4 h-4 mt-4" style={{ animation: 'flap 1s ease-in-out infinite' }} />
                     <Bird className="w-3 h-3 mt-0" style={{ animation: 'flap 1.2s ease-in-out infinite 0.2s' }} />
                     <Bird className="w-5 h-5 mt-6" style={{ animation: 'flap 0.8s ease-in-out infinite 0.4s' }} />
                 </div>
             </div>
         )}

         {/* Stars for night */}
         {!isDay && (
             <div className="absolute inset-0 opacity-80">
                 {[...Array(40)].map((_, i) => (
                     <div 
                        key={i}
                        className="absolute bg-white rounded-full animate-pulse"
                        style={{
                            top: `${Math.random() * 60}%`,
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 2 + 1}px`,
                            height: `${Math.random() * 2 + 1}px`,
                            animationDuration: `${Math.random() * 3 + 2}s`,
                            opacity: Math.random()
                        }}
                     />
                 ))}
             </div>
         )}

         {/* Sun/Moon */}
         <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
             <div 
                className="absolute"
                style={{ 
                    left: `${10 + progress * 0.8}%`,
                    bottom: `${Math.sin((progress / 100) * Math.PI) * 55 + 13.5}%`,
                    transform: 'translate(-50%, 50%)',
                    transition: 'left 1s linear, bottom 1s linear',
                    height: '25%',
                    aspectRatio: '1/1'
                }}
             >
                    {isDay ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                            {/* Core */}
                            <div className="absolute inset-0 rounded-full bg-white shadow-[0_0_40px_10px_#fff]" />
                            {/* Inner Glow */}
                            <div className="absolute inset-[-20%] rounded-full bg-yellow-200/60 blur-md" />
                            {/* Outer Glow */}
                            <div className="absolute inset-[-60%] rounded-full bg-yellow-400/40 blur-2xl" />
                            {/* Rays */}
                            <div className="absolute inset-[-100%] rounded-full bg-orange-500/20 blur-3xl animate-pulse" />
                        </div>
                    ) : (
                        <div className="relative w-full h-full flex items-center justify-center">
                            {/* Core Moon with 3D Sphere Effect */}
                            <div className="absolute inset-0 rounded-full bg-[#e2e8f0] overflow-hidden"
                                 style={{
                                     boxShadow: 'inset -6px -6px 12px rgba(0,0,0,0.4), inset 4px 4px 12px rgba(255,255,255,0.9), 0 0 15px 2px rgba(226, 232, 240, 0.5)'
                                 }}>
                                {/* Surface Texture (Noise) */}
                                <div className="absolute inset-0 opacity-[0.15] mix-blend-multiply" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
                                {/* Procedural Craters */}
                                <div className="absolute top-[20%] left-[25%] w-[30%] h-[30%] rounded-full bg-black/10 blur-[1px]" style={{ boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3)' }} />
                                <div className="absolute top-[50%] left-[60%] w-[25%] h-[25%] rounded-full bg-black/10 blur-[1px]" style={{ boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3)' }} />
                                <div className="absolute top-[65%] left-[20%] w-[20%] h-[20%] rounded-full bg-black/10 blur-[1px]" style={{ boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3)' }} />
                                <div className="absolute top-[30%] left-[70%] w-[15%] h-[15%] rounded-full bg-black/10 blur-[1px]" style={{ boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3)' }} />
                            </div>
                            {/* Inner Glow */}
                            <div className="absolute inset-[-10%] rounded-full bg-slate-100/30 blur-md" />
                            {/* Outer Glows */}
                            <div className="absolute inset-[-40%] rounded-full bg-indigo-200/20 blur-2xl" />
                            <div className="absolute inset-[-80%] rounded-full bg-blue-400/10 blur-3xl animate-pulse" />
                        </div>
                    )}
             </div>
         </div>

         {/* Mountains / Hills */}
         <div className="absolute inset-x-0 bottom-0 h-[65%] pointer-events-none z-10">
             {/* Back Hill */}
             <svg className="absolute bottom-0 w-full h-[80%] transition-colors duration-1000" preserveAspectRatio="none" viewBox="0 0 1440 320" style={{ color: themeColors.backHill }}>
                 <path fill="currentColor" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,122.7C672,96,768,96,864,117.3C960,139,1056,181,1152,192C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
             </svg>

             {/* Trees on Back Hill */}
             <Tree className="absolute bottom-[35%] left-[15%] w-4 h-6 md:w-6 md:h-8 transition-colors duration-1000 z-0 opacity-80" fill={themeColors.tree} />
             <Tree className="absolute bottom-[45%] left-[35%] w-3 h-4 md:w-5 md:h-6 transition-colors duration-1000 z-0 opacity-60" fill={themeColors.tree} />

             {/* Mosque (Moved down and placed behind front hill) */}
             <div className="absolute bottom-[-5%] right-[5%] h-[55%] md:h-[65%] w-1/2 flex justify-end items-end z-0">
                 <img 
                     src="https://svgsilh.com/png-1024/2069853.png" 
                     alt="Mosque" 
                     className="max-h-full max-w-full object-contain object-bottom transition-all duration-1000"
                     style={{
                         filter: isDay 
                            ? 'brightness(0) drop-shadow(-5px 5px 10px rgba(0,0,0,0.3)) drop-shadow(0px -10px 20px rgba(250,204,21,0.15))' 
                            : 'brightness(0) drop-shadow(-5px 5px 10px rgba(0,0,0,0.6)) drop-shadow(0px -10px 20px rgba(226,232,240,0.1))',
                         opacity: isDay ? 0.85 : 0.95
                     }}
                 />
             </div>

             {/* Front Hill (Now overlaps mosque) */}
             <svg className="absolute bottom-0 w-full h-[50%] transition-colors duration-1000 z-10" preserveAspectRatio="none" viewBox="0 0 1440 320" style={{ color: themeColors.frontHill }}>
                 <path fill="currentColor" d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,229.3C840,256,960,288,1080,282.7C1200,277,1320,235,1380,213.3L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
             </svg>

             {/* Trees on Front Hill */}
             <Tree className="absolute bottom-[10%] left-[8%] w-6 h-8 md:w-10 md:h-14 transition-colors duration-1000 z-20" fill={themeColors.tree} />
             <Tree className="absolute bottom-[5%] left-[28%] w-5 h-7 md:w-8 md:h-12 transition-colors duration-1000 z-20" fill={themeColors.tree} />
         </div>

         {/* Dark Overlay for Text Readability */}
         <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-10 pointer-events-none" />

         {/* Content */}
         <div className="relative p-5 md:p-8 text-white flex flex-col justify-between h-full z-20">
            <div className="flex justify-between items-start mb-4 md:mb-6">
                <div className="flex flex-col gap-1">
                   <div 
                     className="flex items-center gap-1.5 bg-black/40 w-fit px-2.5 py-1 md:px-3 md:py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-sm cursor-pointer hover:bg-black/60 transition-colors pointer-events-auto"
                     onClick={(e) => {
                       e.preventDefault();
                       e.stopPropagation();
                       setShowLocationModal(true);
                     }}
                   >
                      <HugeiconsIcon icon={Location01Icon} strokeWidth={1.5} className="w-3 h-3 md:w-3.5 md:h-3.5 text-emerald-300" />
                      <span className="text-[10px] md:text-[11px] font-bold tracking-wide uppercase">{locationName}</span>
                   </div>
                   <div className="flex items-center gap-2 mt-1.5 md:mt-2">
                        <span className="text-2xl md:text-4xl font-bold tracking-tight drop-shadow-md">{timeString}</span>
                   </div>
                </div>
                <div className="bg-white/10 p-2 md:p-2.5 rounded-full backdrop-blur-md border border-white/10 group-hover:bg-white/20 transition-colors shadow-sm">
                   <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
            </div>

            <div className="flex justify-between items-end mt-auto">
               <div>
                  <p className="text-emerald-100 text-[10px] md:text-sm font-medium opacity-90 mb-0.5 md:mb-1 drop-shadow-md">សឡាតបន្ទាប់</p>
                  <div className="flex items-baseline gap-2 md:gap-3">
                      <h1 className="text-3xl md:text-6xl font-bold font-khmer mb-0 md:mb-1 drop-shadow-lg">
                        {loading ? '...' : nextPrayer.name || '...'}
                      </h1>
                      <p className="hidden md:block text-lg md:text-xl font-mono font-medium opacity-80 tracking-tight drop-shadow-md">
                        {loading ? '--:--' : nextPrayer.time || '--:--'}
                      </p>
                  </div>
               </div>
               
               <div className="text-right flex flex-col items-end">
                  <p className="md:hidden text-base font-mono font-medium opacity-90 tracking-tight drop-shadow-md mb-0.5">
                    {loading ? '--:--' : nextPrayer.time || '--:--'}
                  </p>
                  <p className="text-2xl md:text-4xl font-mono font-bold tabular-nums text-white drop-shadow-lg">
                    {loading ? '--:--:--' : nextPrayer.countdown || '--:--:--'}
                  </p>
               </div>
            </div>
         </div>
      </div>
      
      <LocationSelectionModal 
        isOpen={showLocationModal} 
        onClose={() => setShowLocationModal(false)} 
        onSelect={(config) => setLocConfig(config)} 
        locConfig={locConfig} 
      />
      </>
    );
  };

export const DailyInspiration: React.FC<WidgetProps> = ({ setView }) => {
    const { t } = useLanguage();
    return (
    <div className="mb-8 cursor-pointer" onClick={() => setView(ViewMode.HADITH)}>
       <div className="flex items-center gap-2 mb-3 px-1 justify-between">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={QuoteDownIcon} strokeWidth={1.5} className="w-4 h-4 text-orange-500 fill-current" />
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('inspiration.title')}</h3>
          </div>
          <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="w-4 h-4 text-gray-400" />
       </div>
       <div className="rounded-2xl p-5 md:p-6 border relative overflow-hidden group hover:shadow-md transition-all bg-gradient-to-r from-orange-50 to-amber-50 border-orange-100 dark:bg-slate-900 dark:bg-none dark:border-slate-800">
          <div className="relative z-10">
             <p className="font-khmer leading-loose text-sm md:text-base mb-3 text-gray-800 dark:text-slate-200">
                {t('inspiration.quote')}
             </p>
             <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-1 rounded shadow-sm bg-white text-orange-600 dark:bg-slate-800 dark:text-orange-400">{t('inspiration.source')}</span>
                <button className="transition-colors p-1.5 rounded-full text-gray-400 hover:text-orange-600 bg-white/50 hover:bg-white dark:text-slate-500 dark:hover:text-orange-400 dark:bg-slate-800">
                   <HugeiconsIcon icon={Share01Icon} strokeWidth={1.5} className="w-4 h-4" />
                </button>
             </div>
          </div>
          <HugeiconsIcon icon={QuoteDownIcon} strokeWidth={1.5} className="absolute -top-2 -left-2 w-16 h-16 opacity-20 transform rotate-180 text-orange-200 dark:text-slate-700" />
       </div>
    </div>
  );
};

export const ServiceGrid: React.FC<WidgetProps> = ({ setView }) => {
    const { t } = useLanguage();
    const [showAll, setShowAll] = useState(false);
    
    const services = [
      { id: 'quran', icon: Quran01Icon, label: t('services.quran'), color: 'text-emerald-600', bg: 'bg-emerald-50', darkBg: 'bg-emerald-500/10', mode: ViewMode.QURAN },
      { id: 'dua', icon: DuaIcon, label: t('services.dua'), color: 'text-blue-600', bg: 'bg-blue-50', darkBg: 'bg-blue-500/10', mode: ViewMode.HISNUL_MUSLIM },
      { id: 'hadith', icon: ScrollIcon, label: t('services.hadith'), color: 'text-teal-600', bg: 'bg-teal-50', darkBg: 'bg-teal-500/10', mode: ViewMode.HADITH },
      { id: 'faq', icon: HelpCircleIcon, label: t('services.faq'), color: 'text-indigo-600', bg: 'bg-indigo-50', darkBg: 'bg-indigo-500/10', mode: ViewMode.FAQ },
      { id: 'listen', icon: HeadphonesIcon, label: t('services.listen'), color: 'text-rose-600', bg: 'bg-rose-50', darkBg: 'bg-rose-500/10', mode: ViewMode.LISTEN },
      { id: 'watch', icon: PlayListIcon, label: t('services.watch'), color: 'text-orange-600', bg: 'bg-orange-50', darkBg: 'bg-orange-500/10', mode: ViewMode.WATCH },
      { id: 'zakat', icon: Calculator01Icon, label: t('services.zakat'), color: 'text-green-600', bg: 'bg-green-50', darkBg: 'bg-green-500/10', mode: ViewMode.ZAKAT },
      { id: 'tasbih', icon: TasbihIcon, label: t('services.tasbih'), color: 'text-violet-600', bg: 'bg-violet-50', darkBg: 'bg-violet-500/10', mode: ViewMode.TASBIH },
      { id: 'halal', icon: Restaurant01Icon, label: t('services.halal'), color: 'text-amber-600', bg: 'bg-amber-50', darkBg: 'bg-amber-500/10', mode: ViewMode.HALAL },
      { id: 'qibla', icon: CompassIcon, label: t('services.qibla'), color: 'text-cyan-600', bg: 'bg-cyan-50', darkBg: 'bg-cyan-500/10', mode: ViewMode.QIBLA },
      { id: 'names', icon: Baby01Icon, label: t('services.names'), color: 'text-pink-600', bg: 'bg-pink-50', darkBg: 'bg-pink-500/10', mode: ViewMode.NAMES },
      { id: 'allah_names', icon: AllahIcon, label: 'ព្រះនាម', color: 'text-emerald-600', bg: 'bg-emerald-50', darkBg: 'bg-emerald-500/10', mode: ViewMode.ALLAH_NAMES },
      { id: 'qada', icon: SalahIcon, label: t('services.qada'), color: 'text-slate-600', bg: 'bg-slate-100', darkBg: 'bg-slate-500/10', mode: ViewMode.QADA },
      { id: 'frames', icon: StatusIcon, label: t('services.frames'), color: 'text-purple-600', bg: 'bg-purple-50', darkBg: 'bg-purple-500/10', mode: ViewMode.FRAMES },
      { id: 'start_here', icon: DirectionRight02Icon, label: t('services.start_here'), color: 'text-sky-600', bg: 'bg-sky-50', darkBg: 'bg-sky-500/10', mode: ViewMode.START_HERE },
      { id: 'gallery', icon: Image03Icon, label: 'រូបភាព', color: 'text-fuchsia-600', bg: 'bg-fuchsia-50', darkBg: 'bg-fuchsia-500/10', mode: ViewMode.GALLERY },
      { id: 'wudu', icon: WuduIcon, label: t('services.wudu'), color: 'text-blue-500', bg: 'bg-blue-50', darkBg: 'bg-blue-500/10', mode: ViewMode.WUDU },
      { id: 'basic_knowledge', icon: Ramadhan01Icon, label: t('services.basic_knowledge'), color: 'text-indigo-500', bg: 'bg-indigo-50', darkBg: 'bg-indigo-500/10', mode: ViewMode.BASIC_KNOWLEDGE },
      { id: 'umrah', icon: HajiIcon, label: 'អុំរ៉ោះ', color: 'text-emerald-500', bg: 'bg-emerald-50', darkBg: 'bg-emerald-500/10', mode: ViewMode.UMRAH },
      { id: 'fasting_guide', icon: Ramadhan02Icon, label: 'ច្បាប់នៃការបួស', color: 'text-rose-500', bg: 'bg-rose-50', darkBg: 'bg-rose-500/10', mode: ViewMode.FASTING_GUIDE },
      { id: 'salat_guide', icon: SujoodIcon, label: 'អំពីសឡាត', color: 'text-blue-600', bg: 'bg-blue-50', darkBg: 'bg-blue-500/10', mode: ViewMode.SALAT_GUIDE },
    ];

    const displayedServices = services.slice(0, 7);

    return (
      <div className="mb-8">
         <h3 className="text-lg font-bold mb-4 font-khmer px-1 text-gray-900 dark:text-white">{t('services.title')}</h3>
         <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-y-6 gap-x-4 md:gap-x-6">
            {displayedServices.map((item) => (
               <button 
                  key={item.id} 
                  onClick={() => setView(item.mode)}
                  className="flex flex-col items-center gap-2 group"
               >
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-200 border ${item.bg} border-gray-50/50 dark:${item.darkBg} dark:border-slate-800`}>
                     <HugeiconsIcon icon={item.icon} strokeWidth={1.5} className={`w-6 h-6 md:w-7 md:h-7 ${item.color}`} />
                  </div>
                  <span className="text-[11px] md:text-xs font-bold font-khmer whitespace-nowrap text-gray-700 dark:text-slate-400">{item.label}</span>
               </button>
            ))}
            
            <button 
               onClick={() => setShowAll(true)}
               className="flex flex-col items-center gap-2 group md:hidden"
            >
               <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-200 border bg-gray-100 border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                  <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.5} className="w-6 h-6 text-gray-600" />
               </div>
               <span className="text-[11px] font-bold font-khmer whitespace-nowrap text-gray-700 dark:text-slate-400">{t('services.more')}</span>
            </button>
            
            {services.slice(7).map((item) => (
               <button 
                  key={item.id} 
                  onClick={() => setView(item.mode)}
                  className="hidden md:flex flex-col items-center gap-2 group"
               >
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-200 border ${item.bg} border-gray-50/50 dark:${item.darkBg} dark:border-slate-800`}>
                     <HugeiconsIcon icon={item.icon} strokeWidth={1.5} className={`w-6 h-6 md:w-7 md:h-7 ${item.color}`} />
                  </div>
                  <span className="text-[11px] md:text-xs font-bold font-khmer whitespace-nowrap text-gray-700 dark:text-slate-400">{item.label}</span>
               </button>
            ))}
         </div>

         {showAll && (
            <div className="fixed inset-0 z-[100] md:hidden flex flex-col animate-in slide-in-from-bottom-full duration-300 bg-white dark:bg-slate-950">
               <div className="px-4 py-4 border-b flex items-center justify-between sticky top-0 z-10 bg-white border-gray-100 dark:bg-slate-950 dark:border-slate-800">
                  <h2 className="text-xl font-bold font-khmer text-gray-900 dark:text-white">{t('services.allFeatures')}</h2>
                  <button 
                     onClick={() => setShowAll(false)}
                     className="p-2 rounded-full transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                  >
                     <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
                  </button>
               </div>
               <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-4 gap-y-8 gap-x-4">
                     {services.map((item) => (
                        <button 
                           key={`popup-${item.id}`} 
                           onClick={() => {
                              setView(item.mode);
                              setShowAll(false);
                           }}
                           className="flex flex-col items-center gap-2 group"
                        >
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm active:scale-95 transition-all duration-200 border ${item.bg} border-gray-50/50 dark:${item.darkBg} dark:border-slate-800`}>
                              <HugeiconsIcon icon={item.icon} strokeWidth={1.5} className={`w-6 h-6 ${item.color}`} />
                           </div>
                           <span className="text-[11px] font-bold font-khmer whitespace-nowrap text-gray-700 dark:text-slate-400">{item.label}</span>
                        </button>
                     ))}
                  </div>
               </div>
            </div>
         )}
      </div>
    );
  };

export const DiscoverSection: React.FC<WidgetProps> = ({ setView }) => {
     const { t } = useLanguage();
     return (
     <div className="mb-24">
        <div className="flex justify-between items-center mb-4 px-1">
           <h3 className="text-lg font-bold font-khmer text-gray-900 dark:text-white">{t('discover.title')}</h3>
           <span className="text-xs font-bold text-emerald-600 cursor-pointer hover:underline">{t('common.seeAll')}</span>
        </div>
        
        <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-visible no-scrollbar pb-4 md:pb-0 -mx-5 px-5 md:mx-0 md:px-0">
           
           <div 
              onClick={() => setView(ViewMode.LISTEN)}
              className="min-w-[240px] md:min-w-0 h-36 md:h-44 rounded-2xl overflow-hidden relative group cursor-pointer shadow-md hover:shadow-lg transition-all"
           >
              <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Listen" />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent flex flex-col justify-end p-4">
                 <div className="flex items-center gap-2 mb-1">
                    <HugeiconsIcon icon={HeadphonesIcon} strokeWidth={1.5} className="w-4 h-4 text-blue-300" />
                    <span className="text-[10px] font-bold text-blue-200 uppercase">Audio</span>
                 </div>
                 <h4 className="text-white font-khmer font-bold leading-tight">{t('discover.listen.title')}</h4>
              </div>
           </div>

           <div 
              onClick={() => setView(ViewMode.WATCH)}
              className="min-w-[240px] md:min-w-0 h-36 md:h-44 rounded-2xl overflow-hidden relative group cursor-pointer shadow-md hover:shadow-lg transition-all"
           >
              <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Watch" />
              <div className="absolute inset-0 bg-gradient-to-t from-red-900/80 to-transparent flex flex-col justify-end p-4">
                 <div className="flex items-center gap-2 mb-1">
                    <HugeiconsIcon icon={PlayCircleIcon} strokeWidth={1.5} className="w-4 h-4 text-red-300" />
                    <span className="text-[10px] font-bold text-red-200 uppercase">Video</span>
                 </div>
                 <h4 className="text-white font-khmer font-bold leading-tight">{t('discover.watch.title')}</h4>
              </div>
           </div>

           <div 
              onClick={() => setView(ViewMode.FAQ)}
              className="min-w-[240px] md:min-w-0 h-36 md:h-44 rounded-2xl overflow-hidden relative group cursor-pointer shadow-md hover:shadow-lg transition-all"
           >
              <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="FAQ" />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent flex flex-col justify-end p-4">
                 <div className="flex items-center gap-2 mb-1">
                    <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={1.5} className="w-4 h-4 text-indigo-300" />
                    <span className="text-[10px] font-bold text-indigo-200 uppercase">Q&A</span>
                 </div>
                 <h4 className="text-white font-khmer font-bold leading-tight">{t('discover.faq.title')}</h4>
              </div>
           </div>

        </div>
     </div>
  );
};
