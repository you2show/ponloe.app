import { MapsIcon, MosqueLocationIcon, Navigation04Icon, FileDownloadIcon, ImageDownload02Icon, Location01Icon, Calendar01Icon, VolumeHighIcon, VolumeOffIcon, PrinterIcon, Compass01Icon, Search01Icon, ArrowDown01Icon, Settings01Icon, Cancel01Icon, SunriseIcon, Moon01Icon, Image01Icon, Delete01Icon as Trash01Icon, Maximize01Icon as Expand01Icon, Menu01Icon, Sun01Icon as CloudSun01Icon, Gps01Icon, Download01Icon, ArrowLeft01Icon, ArrowRight01Icon, ReloadIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import React, { useState, useEffect, useRef } from 'react';

import { 
  LOCATION_DATA, APP_CONFIG, DEFAULT_TIME_OFFSETS, 
  KHMER_MONTHS, CALCULATION_METHODS, JURISTIC_METHODS, AZAN_OPTIONS 
} from './data';
import { FullScreenView } from './FullScreenView';
import { QiblaFinderView } from '../qibla/QiblaFinderView';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface PrayerData {
  date: {
    gregorian: { date: string; day: string; month: { en: string; number: number }; year: string };
    hijri: { date: string; day: string; month: { en: string; ar: string }; year: string; weekday: { ar: string } };
  };
  timings: Record<string, string>;
}

export const PrayerTimesView: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [province, setProvince] = useState<string>('phnom-penh');
  const [districtIndex, setDistrictIndex] = useState<string>('0');
  const [customLocation, setCustomLocation] = useState<{lat: number, lon: number, name: string} | null>(null);
  const [month, setMonth] = useState<string>(String(new Date().getMonth() + 1));
  
  // Settings
  const [calculationMethod, setCalculationMethod] = useState<number>(3); // Default Muslim World League
  const [juristicMethod, setJuristicMethod] = useState<number>(0); // Default Standard
  const [hijriAdjustment, setHijriAdjustment] = useState<number>(0); // Default 0
  const [timeOffsets, setTimeOffsets] = useState(DEFAULT_TIME_OFFSETS);
  const [showSettings, setShowSettings] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduleData, setScheduleData] = useState<PrayerData[]>([]);
  const [todayData, setTodayData] = useState<PrayerData | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; countdown: string; key: string }>({ name: '', time: '', countdown: '', key: '' });
  
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [selectedAzan, setSelectedAzan] = useState<string>('');
  const [showQibla, setShowQibla] = useState(false);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'calc' | 'azan' | 'download' | null>(null);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mosqueName, setMosqueName] = useState<string>('');
  const azanAudioRef = useRef<HTMLAudioElement | null>(null);

  const [showDownloadPreview, setShowDownloadPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown]);

  useEffect(() => {
    const savedAudio = localStorage.getItem('audioEnabled');
    if (savedAudio === 'true') setIsAudioEnabled(true);
    
    const savedAzan = localStorage.getItem('prayerAzanUrl') || AZAN_OPTIONS[0].url;
    setSelectedAzan(savedAzan);
    azanAudioRef.current = new Audio(savedAzan);

    const audio = azanAudioRef.current;
    const handlePlay = () => setIsPlayingTest(true);
    const handlePause = () => setIsPlayingTest(false);
    const handleEnded = () => setIsPlayingTest(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    const savedOffsets = localStorage.getItem('prayerTimeOffsets');
    if (savedOffsets) {
      try {
        setTimeOffsets({ ...DEFAULT_TIME_OFFSETS, ...JSON.parse(savedOffsets) });
      } catch (e) {}
    }

    const savedHijriAdj = localStorage.getItem('prayerHijriAdjustment');
    if (savedHijriAdj) {
      setHijriAdjustment(parseInt(savedHijriAdj));
    }

    const savedBg = localStorage.getItem('prayerBgImage');
    if (savedBg) setBgImage(savedBg);

    const savedMosqueName = localStorage.getItem('prayerMosqueName');
    if (savedMosqueName) setMosqueName(savedMosqueName);

    const savedLoc = localStorage.getItem('prayerLocation');
    if (savedLoc) {
      try {
        const parsed = JSON.parse(savedLoc);
        if (parsed.type === 'auto') {
          setCustomLocation({ lat: parsed.lat, lon: parsed.lon, name: parsed.name });
        } else if (parsed.type === 'manual') {
          setProvince(parsed.province || 'phnom-penh');
          setDistrictIndex(parsed.districtIndex || '0');
        }
      } catch (e) {}
    }

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    if (azanAudioRef.current && selectedAzan) {
      azanAudioRef.current.src = selectedAzan;
    }
  }, [selectedAzan]);

  useEffect(() => {
    fetchPrayerTimes();
  }, [calculationMethod, juristicMethod, hijriAdjustment, province, districtIndex, customLocation, timeOffsets, month]); // Re-fetch when settings, location, or month change

  const fetchPrayerTimes = async (lat?: number, lon?: number, retryCount = 0) => {
    setLoading(true);
    setError(null);
    
    let latitude = lat || customLocation?.lat;
    let longitude = lon || customLocation?.lon;

    if (!latitude || !longitude) {
      const pData = LOCATION_DATA[province];
      const dData = pData?.districts[parseInt(districtIndex)];
      if (dData) {
        latitude = dData.lat;
        longitude = dData.lon;
      }
    }

    if (!latitude || !longitude) {
      setLoading(false);
      return;
    }

    const year = new Date().getFullYear();
    const apiUrl = `/api/pt/cal?year=${year}&month=${month}&latitude=${latitude}&longitude=${longitude}&method=${calculationMethod}&school=${juristicMethod}&adjustment=${hijriAdjustment}`;

    try {
      const res = await fetch(apiUrl);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.message || 'Network response error');
      }

      const data = await res.json();
      if (data.code === 200 && data.data) {
        const adjustedData = data.data.map((day: any) => ({
          ...day,
          timings: {
            Imsak: adjustTime(day.timings.Imsak, timeOffsets.Imsak),
            Fajr: adjustTime(day.timings.Fajr, timeOffsets.Fajr),
            Sunrise: adjustTime(day.timings.Sunrise, timeOffsets.Sunrise),
            Dhuhr: adjustTime(day.timings.Dhuhr, timeOffsets.Dhuhr),
            Asr: adjustTime(day.timings.Asr, timeOffsets.Asr),
            Maghrib: adjustTime(day.timings.Maghrib, timeOffsets.Maghrib),
            Isha: adjustTime(day.timings.Isha, timeOffsets.Isha),
          }
        }));

        setScheduleData(adjustedData);
        
        const today = new Date();
        const foundToday = adjustedData.find((d: PrayerData) => 
          parseInt(d.date.gregorian.day) === today.getDate() &&
          d.date.gregorian.month.number === (today.getMonth() + 1)
        );
        setTodayData(foundToday || null);
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const adjustTime = (time: string, minutes: number) => {
    if (!time) return "00:00";
    const cleanTime = time.split(' ')[0]; 
    const parts = cleanTime.split(':');
    if (parts.length < 2) return "00:00";
    const h = parseInt(parts[0]);
    const m = parseInt(parts[1]);
    if (isNaN(h) || isNaN(m)) return "00:00";
    const date = new Date();
    date.setHours(h, m + minutes);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!todayData || scheduleData.length === 0) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const prayers = [
        { key: 'Fajr', name: 'ស៊ូបុហ' },
        { key: 'Dhuhr', name: 'ហ្ស៊ូហ៊ួរ' },
        { key: 'Asr', name: 'អាសើរ' },
        { key: 'Maghrib', name: 'ម៉ាហ្រ្កឹប' },
        { key: 'Isha', name: 'អ៊ីស្ហាក' }
      ];

      let upcoming = null;
      
      for (const p of prayers) {
        const [h, m] = todayData.timings[p.key].split(':').map(Number);
        const pDate = new Date();
        pDate.setHours(h, m, 0);
        
        if (pDate > now) {
          upcoming = { ...p, time: pDate };
          break;
        }
      }

      if (!upcoming) {
        // If no prayers left today, calculate countdown to tomorrow's Fajr
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const tmrData = scheduleData.find(d => 
           parseInt(d.date.gregorian.day) === tomorrow.getDate() &&
           d.date.gregorian.month.number === (tomorrow.getMonth() + 1)
        );

        if (tmrData) {
            const [h, m] = tmrData.timings.Fajr.split(':').map(Number);
            const fajrDate = new Date();
            fajrDate.setDate(fajrDate.getDate() + 1);
            fajrDate.setHours(h, m, 0, 0);
            
            const diff = fajrDate.getTime() - now.getTime();
            if (diff > 0) {
               const hours = Math.floor(diff / (1000 * 60 * 60));
               const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
               const secs = Math.floor((diff % (1000 * 60)) / 1000);
               
               setNextPrayer({ 
                 name: 'ស៊ូបុហ', 
                 time: tmrData.timings.Fajr, 
                 countdown: `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`, 
                 key: 'Fajr' 
               });
            } else {
               setNextPrayer({ name: 'ស៊ូបុហ', time: '--:--', countdown: 'កំពុងគណនា...', key: 'Fajr' });
            }
        } else {
            setNextPrayer({ name: 'ស៊ូបុហ', time: '--:--', countdown: 'រង់ចាំ...', key: 'Fajr' });
        }
      } else {
        const diff = upcoming.time.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        
        setNextPrayer({
          name: upcoming.name,
          time: todayData.timings[upcoming.key],
          countdown: `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
          key: upcoming.key
        });

        if (isAudioEnabled && diff < 1000 && diff > 0 && azanAudioRef.current) {
            azanAudioRef.current.play().catch(e => console.error("Audio play failed", e));
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [todayData, scheduleData, isAudioEnabled]);

  const handleGeneratePreview = async () => {
    if (!exportRef.current) return;
    setIsGeneratingPreview(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 4,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 794
      });
      
      const imgData = canvas.toDataURL('image/png');
      setPreviewImage(imgData);
      setShowDownloadPreview(true);
    } catch (error) {
      console.error('Error generating preview:', error);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handlePrevMonth = () => {
    setMonth(prev => {
      const m = parseInt(prev);
      return m > 1 ? String(m - 1) : "12";
    });
  };

  const handleNextMonth = () => {
    setMonth(prev => {
      const m = parseInt(prev);
      return m < 12 ? String(m + 1) : "1";
    });
  };

  const handleResetMonth = () => {
    const currentMonth = (new Date().getMonth() + 1).toString();
    setMonth(currentMonth);
  };

  const handleDownloadJPG = () => {
    if (!previewImage) return;
    const link = document.createElement('a');
    link.href = previewImage;
    link.download = `prayer-schedule-${province}-${month}.png`;
    link.click();
  };

  const handleDownloadPDF = () => {
    if (!previewImage) return;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(previewImage);
    const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
    const imgX = (pdfWidth - imgProps.width * ratio) / 2;
    const imgY = 0;
    pdf.addImage(previewImage, 'PNG', imgX, imgY, imgProps.width * ratio, imgProps.height * ratio, undefined, 'FAST');
    pdf.save(`prayer-schedule-${province}-${month}.pdf`);
  };

  const toggleAudio = () => {
    const newState = !isAudioEnabled;
    setIsAudioEnabled(newState);
    localStorage.setItem('audioEnabled', String(newState));
    
    if (newState && azanAudioRef.current) {
      // Unlock audio on mobile by playing and immediately pausing
      azanAudioRef.current.play().then(() => {
          azanAudioRef.current?.pause();
          if (azanAudioRef.current) azanAudioRef.current.currentTime = 0;
      }).catch(e => console.error("Audio unlock failed", e));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1080;
            const MAX_HEIGHT = 1920;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            try {
                localStorage.setItem('prayerBgImage', dataUrl);
                setBgImage(dataUrl);
            } catch (err) {
                showToast('រូបភាពធំពេក សូមជ្រើសរើសរូបភាពផ្សេង។', 'error');
            }
        };
        img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    localStorage.removeItem('prayerBgImage');
    setBgImage(null);
  };

  const handleGeoLocation = () => {
    if (navigator.geolocation) {
       setLoading(true);
       navigator.geolocation.getCurrentPosition(
         async (pos) => {
           const lat = pos.coords.latitude;
           const lon = pos.coords.longitude;
           let locName = 'ទីតាំងបច្ចុប្បន្ន';
           
           const fetchLocationName = async (retryCount = 0): Promise<void> => {
             try {
               const baseUrl = '';
               const res = await fetch(`${baseUrl}/api/nominatim/reverse?lat=${lat}&lon=${lon}&zoom=14&accept-language=km`);
               
               const contentType = res.headers.get('content-type');
               if (!contentType || !contentType.includes('application/json')) {
                 const text = await res.text();
                 if ((text.includes('Starting Server...') || text.includes('<html') || text.includes('502 Bad Gateway') || text.includes('503 Service Temporarily Unavailable') || text.includes('Rate exceeded.')) && retryCount < 5) {
                   await new Promise(resolve => setTimeout(resolve, 2000));
                   return fetchLocationName(retryCount + 1);
                 }
                 console.error('Non-JSON response:', text.substring(0, 200));
                 if (text.includes('Rate exceeded.')) {
                   throw new Error('ប្រព័ន្ធកំពុងរវល់ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។');
                 }
                 throw new Error(`Server returned an invalid response. Content-Type: ${contentType}`);
               }

               if (!res.ok) throw new Error('Network response error');

               const data = await res.json();
               if (data && data.address) {
                 locName = data.address.village || data.address.town || data.address.city || data.address.county || data.address.state || locName;
               }
             } catch (e) {
               console.error("Reverse geocoding failed", e);
             }
           };
           
           await fetchLocationName();
           
           const newLoc = { lat, lon, name: locName };
           setCustomLocation(newLoc);
           localStorage.setItem('prayerLocation', JSON.stringify({ type: 'auto', ...newLoc }));
           fetchPrayerTimes(lat, lon);
         },
         (err) => { showToast("Geolocation failed", "error"); setLoading(false); }
       );
    }
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setProvince(val);
    setDistrictIndex('0');
    setCustomLocation(null);
    localStorage.setItem('prayerLocation', JSON.stringify({ type: 'manual', province: val, districtIndex: '0' }));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setDistrictIndex(val);
    setCustomLocation(null);
    localStorage.setItem('prayerLocation', JSON.stringify({ type: 'manual', province, districtIndex: val }));
  };

  // Determine current prayer for highlighting
  const getCurrentPrayerKey = () => {
      if (!todayData) return null;
      const now = new Date();
      const timeToDate = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        const d = new Date();
        d.setHours(h, m, 0);
        return d;
      };

      const prayers = ['Imsak', 'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      for (let i = 0; i < prayers.length - 1; i++) {
          const curr = timeToDate(todayData.timings[prayers[i]]);
          const next = timeToDate(todayData.timings[prayers[i+1]]);
          if (now >= curr && now < next) return prayers[i];
      }
      return 'Isha'; // Default fallback late night
  };

  const currentPrayerKey = getCurrentPrayerKey();
  
  // Detect if countdown is text (contains Khmer) or numbers
  const isKhmerText = /[ឝ-ៜ]/.test(nextPrayer.countdown);

  const formatTime12 = (time24?: string) => {
    if (!time24) return { time: '--:--', period: '' };
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return { time: `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')}`, period };
  };

  if (isFullscreen) {
    return (
      <div className="relative">
        <FullScreenView 
          setIsFullscreen={setIsFullscreen}
          currentTime={currentTime}
          province={province}
          districtIndex={districtIndex}
          customLocation={customLocation}
          todayData={todayData}
          nextPrayer={nextPrayer}
          timeOffsets={timeOffsets}
          formatTime12={formatTime12}
          mosqueName={mosqueName}
          bgImage={bgImage}
          t={t}
          onOpenSettings={() => setShowSettings(true)}
        />
        {showSettings && renderSettingsModal()}
      </div>
    );
  }

  function renderSettingsModal() {
    return (
         <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto no-scrollbar flex flex-col">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <h3 className="text-xl font-bold text-gray-900">ការកំណត់</h3>
                    <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="space-y-4 flex-1">
                    {/* Calculation Method */}
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-sm font-bold text-gray-900 mb-3">វិធីសាស្ត្រគណនា</label>
                        <div className="relative" onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === 'calc' ? null : 'calc'); }}>
                            <div className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl text-sm cursor-pointer hover:border-indigo-300 transition-colors shadow-sm">
                                <span className="text-gray-700 font-medium truncate">
                                    {CALCULATION_METHODS.find(m => m.id === calculationMethod)?.name}
                                </span>
                                <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={1.5} className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === 'calc' ? 'rotate-180' : ''}`} />
                            </div>
                            {openDropdown === 'calc' && (
                                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1">
                                    {CALCULATION_METHODS.map(m => (
                                        <button
                                            key={m.id}
                                            onClick={(e) => { e.stopPropagation(); setCalculationMethod(m.id); setOpenDropdown(null); }}
                                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${calculationMethod === m.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            {m.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">ស្តង់ដារសម្រាប់កម្ពុជា/អាស៊ី គឺ Muslim World League ឬ Singapore។</p>
                    </div>

                    {/* Asr Juristic Method */}
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-sm font-bold text-gray-900 mb-3">ជម្រើសអាសើរ</label>
                        <div className="flex p-1 bg-gray-100 rounded-xl">
                            {JURISTIC_METHODS.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setJuristicMethod(m.id)}
                                    className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${juristicMethod === m.id ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                                >
                                    {m.name.split(' (')[0]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Local Hijri Adjustments */}
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-sm font-bold text-gray-900 mb-1">កែសម្រួលថ្ងៃខែហ៊ីជីរ៉ះ (Hijri)</label>
                        <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">កែសម្រួលថ្ងៃខែអារ៉ាប់នៅលើឧបករណ៍របស់អ្នក។ វាមិនប៉ះពាល់ដល់ម៉ោងសឡាតទេ។</p>
                        <div className="flex p-1 bg-gray-100 rounded-xl">
                            {[-2, -1, 0, 1, 2].map(val => (
                                <button
                                    key={val}
                                    onClick={() => {
                                        setHijriAdjustment(val);
                                        localStorage.setItem('prayerHijriAdjustment', String(val));
                                    }}
                                    className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${hijriAdjustment === val ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                                >
                                    {val > 0 ? `+${val}` : val}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Azan Audio */}
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-sm font-bold text-gray-900 mb-3">សំឡេងអាហ្សាន</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1" onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === 'azan' ? null : 'azan'); }}>
                                <div className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl text-sm cursor-pointer hover:border-indigo-300 transition-colors shadow-sm">
                                    <span className="text-gray-700 font-medium truncate">
                                        {AZAN_OPTIONS.find(a => a.url === selectedAzan)?.name || 'ជ្រើសរើសសំឡេង'}
                                    </span>
                                    <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={1.5} className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === 'azan' ? 'rotate-180' : ''}`} />
                                </div>
                                {openDropdown === 'azan' && (
                                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1">
                                        {AZAN_OPTIONS.map(a => (
                                            <button
                                                key={a.id}
                                                onClick={(e) => { 
                                                    e.stopPropagation();
                                                    setSelectedAzan(a.url); 
                                                    localStorage.setItem('prayerAzanUrl', a.url);
                                                    setOpenDropdown(null); 
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedAzan === a.url ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                {a.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => {
                                    if (azanAudioRef.current) {
                                        if (isPlayingTest) {
                                            azanAudioRef.current.pause();
                                            azanAudioRef.current.currentTime = 0;
                                        } else {
                                            azanAudioRef.current.currentTime = 0;
                                            azanAudioRef.current.play().catch(e => console.error(e));
                                        }
                                    }
                                }}
                                className={`w-12 h-12 shrink-0 bg-white border rounded-xl transition-all flex items-center justify-center shadow-sm ${isPlayingTest ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-gray-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700'}`}
                                title={isPlayingTest ? "បញ្ឈប់" : "សាកល្បងស្តាប់"}
                            >
                                {isPlayingTest ? (
                                    <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
                                ) : (
                                    <HugeiconsIcon icon={VolumeHighIcon} strokeWidth={1.5} className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Background Image */}
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-sm font-bold text-gray-900 mb-3">ផ្ទៃខាងក្រោយ</label>
                        <div className="flex items-center gap-3">
                            <label className={`flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl text-sm cursor-pointer hover:border-indigo-300 transition-colors shadow-sm text-indigo-600 font-medium relative overflow-hidden ${bgImage ? 'h-20' : 'p-3 hover:bg-indigo-50'}`}>
                                {bgImage ? (
                                    <>
                                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}></div>
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <span className="text-white text-xs font-bold px-3 py-1.5 bg-black/50 rounded-full backdrop-blur-sm flex items-center gap-1">
                                                <HugeiconsIcon icon={Image01Icon} strokeWidth={2} className="w-3 h-3" /> ប្តូររូបភាព
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <HugeiconsIcon icon={Image01Icon} strokeWidth={1.5} className="w-5 h-5" />
                                        <span>ជ្រើសរើសរូបភាព</span>
                                    </>
                                )}
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                            {bgImage && (
                                <button 
                                    onClick={removeImage}
                                    className="w-12 h-20 shrink-0 bg-white border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-all flex items-center justify-center shadow-sm"
                                    title="លុបរូបភាព"
                                >
                                    <HugeiconsIcon icon={Trash01Icon} strokeWidth={1.5} className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mosque Name */}
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-sm font-bold text-gray-900 mb-3">ឈ្មោះម៉ាស្ជិត</label>
                        <input 
                            type="text" 
                            value={mosqueName}
                            onChange={(e) => {
                                setMosqueName(e.target.value);
                                localStorage.setItem('prayerMosqueName', e.target.value);
                            }}
                            placeholder="បញ្ចូលឈ្មោះម៉ាស្ជិត..."
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-medium"
                        />
                    </div>

                    {/* Time Offsets */}
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-sm font-bold text-gray-900 mb-3">កំណត់ម៉ោងបន្ថែម/បន្ថយ (នាទី)</label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { key: 'Imsak', label: 'អ៊ីមសាក់' },
                                { key: 'Fajr', label: 'ស៊ូបុហ' },
                                { key: 'Sunrise', label: 'ថ្ងៃរះ' },
                                { key: 'Dhuhr', label: 'ហ្ស៊ូហ៊ួរ' },
                                { key: 'Asr', label: 'អាសើរ' },
                                { key: 'Maghrib', label: 'ម៉ាហ្រ្កឹប' },
                                { key: 'Isha', label: 'អ៊ីស្ហាក' }
                            ].map((prayer) => (
                                <div key={prayer.key} className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                                    <span className="text-xs font-medium text-gray-700 pl-1">{prayer.label}</span>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => {
                                                const newOffsets = { ...timeOffsets, [prayer.key]: (timeOffsets as any)[prayer.key] - 1 };
                                                setTimeOffsets(newOffsets);
                                                localStorage.setItem('prayerTimeOffsets', JSON.stringify(newOffsets));
                                            }}
                                            className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-colors"
                                        >-</button>
                                        <span className="w-6 text-center text-xs font-bold text-indigo-700">
                                            {(timeOffsets as any)[prayer.key] > 0 ? `+${(timeOffsets as any)[prayer.key]}` : (timeOffsets as any)[prayer.key]}
                                        </span>
                                        <button 
                                            onClick={() => {
                                                const newOffsets = { ...timeOffsets, [prayer.key]: (timeOffsets as any)[prayer.key] + 1 };
                                                setTimeOffsets(newOffsets);
                                                localStorage.setItem('prayerTimeOffsets', JSON.stringify(newOffsets));
                                            }}
                                            className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-colors"
                                        >+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => { 
                        setShowSettings(false); 
                        if (azanAudioRef.current && !azanAudioRef.current.paused) {
                            azanAudioRef.current.pause();
                            azanAudioRef.current.currentTime = 0;
                        }
                        fetchPrayerTimes(); 
                    }}
                    className="w-full mt-8 shrink-0 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                >
                    រក្សាទុក
                </button>
            </div>
         </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-in fade-in duration-300">
      
      {/* Hero Section */}
      <div 
        className={`relative ${bgImage ? 'bg-cover bg-center' : 'bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800'} text-white overflow-hidden shadow-lg`}
        style={bgImage ? { backgroundImage: `url(${bgImage})` } : {}}
      >
        {bgImage ? (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-0"></div>
        ) : (
            <div className="absolute inset-0 bg-[url('https://lonelylandscape.wordpress.com/wp-content/uploads/2015/04/500px-alserkal-mosque_front.jpg')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        )}
        
        {/* Top Actions */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button 
                onClick={() => setIsFullscreen(true)}
                className="w-10 h-10 flex items-center justify-center bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors"
                title="Full Screen"
            >
                <HugeiconsIcon icon={Expand01Icon} strokeWidth={1.5} className="w-5 h-5" />
            </button>
            <button 
                onClick={() => setShowSettings(true)}
                className="w-10 h-10 flex items-center justify-center bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors"
                title="ការកំណត់"
            >
                <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.5} className="w-5 h-5" />
            </button>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-8 md:py-16 flex flex-col items-center text-center z-10">
           <h1 className="text-2xl md:text-5xl font-bold mb-3 font-khmer tracking-tight">កាលវិភាគសឡាត</h1>
           
           <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-indigo-100 mb-6 md:mb-8 text-sm md:text-base">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                <HugeiconsIcon icon={Location01Icon} strokeWidth={1.5} className="w-4 h-4" /> 
                <span className="truncate max-w-[200px]">{LOCATION_DATA[province]?.districts?.[parseInt(districtIndex)]?.name || 'ទីតាំងបច្ចុប្បន្ន'}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                <HugeiconsIcon icon={Calendar01Icon} strokeWidth={1.5} className="w-4 h-4" /> 
                {todayData ? todayData.date.gregorian.date : '...'}
              </span>
           </div>

           <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl transform transition-all hover:scale-105 duration-300">
              <div className="flex justify-between items-end mb-2">
                <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">Next Prayer</p>
                <div className="animate-pulse bg-green-500 h-2 w-2 rounded-full"></div>
              </div>
              <div className={`text-4xl md:text-7xl font-bold text-yellow-300 mb-2 ${isKhmerText ? 'font-khmer tracking-normal py-2' : 'font-mono tabular-nums tracking-tighter'}`}>
                 {nextPrayer.countdown || "--:--:--"}
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-1">
                 <p className="text-lg md:text-2xl font-bold text-white">{nextPrayer.name}</p>
                 <p className="text-lg md:text-2xl font-mono text-indigo-100">{nextPrayer.time}</p>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10 space-y-6">
        
        {/* Important Times Cards (Sunrise/Imsak) - Mobile Friendly */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
             <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-orange-100">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><HugeiconsIcon icon={Moon01Icon} strokeWidth={1.5} className="w-5 h-5" /></div>
                   <div>
                      <p className="text-xs text-gray-500 font-medium">អ៊ីមសាក់</p>
                      <p className="font-bold text-gray-900">{todayData ? todayData.timings.Imsak : '--:--'}</p>
                   </div>
                </div>
             </div>
             <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-yellow-100">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600"><HugeiconsIcon icon={SunriseIcon} strokeWidth={1.5} className="w-5 h-5" /></div>
                   <div>
                      <p className="text-xs text-gray-500 font-medium">ថ្ងៃរះ</p>
                      <p className="font-bold text-gray-900">{todayData ? todayData.timings.Sunrise : '--:--'}</p>
                   </div>
                </div>
             </div>
        </div>

        {/* Main Prayer Grid */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
           {[
             { k: 'Fajr', l: 'ស៊ូបុហ' }, 
             { k: 'Dhuhr', l: 'ហ្ស៊ូហ៊ួរ' }, 
             { k: 'Asr', l: 'អាសើរ' }, 
             { k: 'Maghrib', l: 'ម៉ាហ្រ្កឹប' }, 
             { k: 'Isha', l: 'អ៊ីស្ហាក' }
           ].map((item) => {
             const isNext = nextPrayer.key === item.k;
             const isCurrent = currentPrayerKey === item.k;
             return (
             <div key={item.k} className={`relative overflow-hidden bg-white rounded-xl sm:rounded-2xl shadow-sm py-2.5 px-1 sm:p-4 border text-center transition-all duration-300 ${isNext ? 'border-yellow-400 ring-2 sm:ring-4 ring-yellow-400/20' : isCurrent ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 hover:border-indigo-200'}`}>
                {isNext && <div className="absolute top-0 right-0 bg-yellow-400 text-[8px] sm:text-[10px] font-bold px-1 sm:px-2 py-0.5 rounded-bl text-yellow-900">NEXT</div>}
                {isCurrent && <div className="absolute top-0 left-0 bg-indigo-500 text-[8px] sm:text-[10px] font-bold px-1 sm:px-2 py-0.5 rounded-br text-white">NOW</div>}
                <h3 className={`text-[10px] sm:text-sm font-medium mb-0.5 sm:mb-1 truncate ${isCurrent ? 'text-indigo-700' : 'text-gray-500'}`}>{item.l}</h3>
                <p className={`text-sm sm:text-2xl font-bold tracking-tight ${isNext ? 'text-gray-900' : isCurrent ? 'text-indigo-900' : 'text-gray-900'}`}>{todayData ? todayData.timings[item.k] : '--:--'}</p>
             </div>
           )})}
        </div>

        {/* Controls Bar - Responsive Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-5">
           
           {customLocation && (
             <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
               <div className="flex items-center gap-2 text-indigo-800 text-sm">
                 <HugeiconsIcon icon={Location01Icon} strokeWidth={1.5} className="w-4 h-4" />
                 <span>ទីតាំងស្វ័យប្រវត្តិ៖ <strong>{customLocation.name}</strong></span>
               </div>
               <button 
                 onClick={() => { setCustomLocation(null); localStorage.setItem('prayerLocation', JSON.stringify({ type: 'manual', province, districtIndex })); }}
                 className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-white px-2 py-1 rounded border border-indigo-200"
               >
                 ប្ដូរទីតាំង
               </button>
             </div>
           )}

           <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 md:mb-0 ${customLocation ? 'opacity-50 pointer-events-none' : ''}`}>
              {/* Province */}
              <div className="relative group">
                 <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block pl-1">ខេត្ត/ក្រុង</label>
                 <select 
                    value={province} 
                    onChange={handleProvinceChange}
                    className="w-full appearance-none pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-medium cursor-pointer transition-shadow"
                 >
                    {Object.entries(LOCATION_DATA).sort((a,b) => a[1].name_km.localeCompare(b[1].name_km)).map(([key, val]) => (
                       <option key={key} value={key}>{val.name_km}</option>
                    ))}
                 </select>
                 <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={1.5} className="absolute right-3 bottom-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              {/* District */}
              <div className="relative group">
                 <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block pl-1">ស្រុក/ខណ្ឌ</label>
                 <select 
                   value={districtIndex} 
                   onChange={handleDistrictChange}
                   className="w-full appearance-none pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-medium cursor-pointer transition-shadow"
                 >
                    {LOCATION_DATA[province]?.districts?.map((d, idx) => (
                       <option key={idx} value={idx}>{d.name}</option>
                    ))}
                 </select>
                 <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={1.5} className="absolute right-3 bottom-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              {/* Month */}
              <div className="relative group">
                 <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block pl-1">ខែ</label>
                 <select 
                   value={month} 
                   onChange={(e) => {
                     setMonth(e.target.value);
                     // fetchPrayerTimes is called in useEffect when month changes
                   }}
                   className="w-full appearance-none pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-medium cursor-pointer transition-shadow"
                 >
                    {KHMER_MONTHS.map((m, i) => (
                       <option key={i} value={i + 1}>{m}</option>
                    ))}
                 </select>
                 <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={1.5} className="absolute right-3 bottom-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
              
              {/* Action Buttons Group */}
              <div className="flex gap-2 items-end">
                 <button 
                   onClick={handleGeoLocation}
                   className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                 >
                   <HugeiconsIcon icon={Gps01Icon} strokeWidth={1.5} className="w-4 h-4" /> ទីតាំងរបស់ខ្ញុំ
                 </button>
              </div>
           </div>

           {/* Quick Actions Footer */}
           <div className="flex flex-col md:flex-row gap-4 justify-between border-t border-gray-100 pt-4 mt-4 relative">
               {/* Month Navigation */}
               <div className="flex gap-2 justify-center md:justify-start">
                   <button onClick={handlePrevMonth} className="p-2 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-lg transition-colors" title="ខែមុន">
                       <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-5 h-5" />
                   </button>
                   <button onClick={handleResetMonth} className="p-2 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-lg transition-colors" title="ខែបច្ចុប្បន្ន">
                       <HugeiconsIcon icon={ReloadIcon} strokeWidth={1.5} className="w-5 h-5" />
                   </button>
                   <button onClick={handleNextMonth} className="p-2 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-lg transition-colors" title="ខែបន្ទាប់">
                       <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="w-5 h-5" />
                   </button>
               </div>

               {/* Existing Actions */}
               <div className="flex gap-2 justify-between md:justify-end">
                   <button onClick={() => setShowQibla(true)} className="flex-1 md:flex-none py-2 px-4 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors">
                      <HugeiconsIcon icon={Navigation04Icon} strokeWidth={1.5} className="w-4 h-4" /> <span className="hidden md:inline">ទិស</span>
                   </button>
                   <button onClick={toggleAudio} className={`flex-1 md:flex-none py-2 px-4 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors ${isAudioEnabled ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                      {isAudioEnabled ? <><HugeiconsIcon icon={VolumeHighIcon} strokeWidth={1.5} className="w-4 h-4" /> <span className="hidden md:inline">បើកសំឡេង</span></> : <><HugeiconsIcon icon={VolumeOffIcon} strokeWidth={1.5} className="w-4 h-4" /> <span className="hidden md:inline">បិទសំឡេង</span></>}
                   </button>
                   <div className="relative flex-1 md:flex-none flex">
                     <button onClick={handleGeneratePreview} disabled={isGeneratingPreview} className="w-full flex-1 md:flex-none py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors">
                        {isGeneratingPreview ? (
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <HugeiconsIcon icon={Download01Icon} strokeWidth={1.5} className="w-4 h-4" />
                        )}
                        <span className="hidden md:inline">{isGeneratingPreview ? 'កំពុងរៀបចំ...' : 'ទាញយក'}</span>
                     </button>
                   </div>
               </div>
           </div>
        </div>

        {/* Schedule Table - Scrollable Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
           <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-sm text-left whitespace-nowrap">
                 <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                    <tr>
                       <th className="px-6 py-4 font-semibold sticky left-0 bg-gray-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">កាលបរិច្ឆេទ</th>
                       <th className="px-4 py-4 font-semibold text-center text-orange-600">អ៊ីមសាក់</th>
                       <th className="px-4 py-4 font-semibold text-center">ស៊ូបុហ</th>
                       <th className="px-4 py-4 font-semibold text-center">ហ្ស៊ូហ៊ួរ</th>
                       <th className="px-4 py-4 font-semibold text-center">អាសើរ</th>
                       <th className="px-4 py-4 font-semibold text-center">ម៉ាហ្រ្កឹប</th>
                       <th className="px-4 py-4 font-semibold text-center">អ៊ីស្ហាក</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {loading ? (
                       <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">កំពុងទាញយកទិន្នន័យ...</td></tr>
                    ) : scheduleData.map((day, i) => {
                       const isToday = parseInt(day.date.gregorian.day) === new Date().getDate() && day.date.gregorian.month.number === (new Date().getMonth() + 1);
                       const khmerMonth = KHMER_MONTHS[day.date.gregorian.month.number - 1];
                       return (
                          <tr key={i} className={`hover:bg-gray-50 transition-colors ${isToday ? 'bg-indigo-50/60' : ''}`}>
                             <td className={`px-6 py-4 font-medium text-gray-900 sticky left-0 z-10 ${isToday ? 'bg-indigo-50/90' : 'bg-white'}`}>
                                <div className="flex flex-col">
                                  <span>{day.date.gregorian.day} {khmerMonth}</span>
                                  <span className="text-[10px] text-gray-400 font-normal">{day.date.hijri.day} {day.date.hijri.month.en}</span>
                                </div>
                             </td>
                             <td className="px-4 py-4 text-center text-orange-600 font-medium bg-orange-50/30">{day.timings.Imsak}</td>
                             <td className="px-4 py-4 text-center text-gray-600">{day.timings.Fajr}</td>
                             <td className="px-4 py-4 text-center text-gray-600">{day.timings.Dhuhr}</td>
                             <td className="px-4 py-4 text-center text-gray-600">{day.timings.Asr}</td>
                             <td className="px-4 py-4 text-center text-gray-600">{day.timings.Maghrib}</td>
                             <td className="px-4 py-4 text-center text-gray-600">{day.timings.Isha}</td>
                          </tr>
                       );
                    })}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
      
      {/* Settings Modal */}
      {showSettings && (
         <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto no-scrollbar flex flex-col">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <h3 className="text-xl font-bold text-gray-900">ការកំណត់</h3>
                    <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="space-y-4 flex-1">
                    {/* Calculation Method */}
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-sm font-bold text-gray-900 mb-3">វិធីសាស្ត្រគណនា</label>
                        <div className="relative" onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === 'calc' ? null : 'calc'); }}>
                            <div className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl text-sm cursor-pointer hover:border-indigo-300 transition-colors shadow-sm">
                                <span className="text-gray-700 font-medium truncate">
                                    {CALCULATION_METHODS.find(m => m.id === calculationMethod)?.name}
                                </span>
                                <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={1.5} className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === 'calc' ? 'rotate-180' : ''}`} />
                            </div>
                            {openDropdown === 'calc' && (
                                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1">
                                    {CALCULATION_METHODS.map(m => (
                                        <button
                                            key={m.id}
                                            onClick={(e) => { e.stopPropagation(); setCalculationMethod(m.id); setOpenDropdown(null); }}
                                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${calculationMethod === m.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            {m.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">ស្តង់ដារសម្រាប់កម្ពុជា/អាស៊ី គឺ Muslim World League ឬ Singapore។</p>
                    </div>

                    {/* Asr Juristic Method */}
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-sm font-bold text-gray-900 mb-3">ជម្រើសអាសើរ</label>
                        <div className="flex p-1 bg-gray-100 rounded-xl">
                            {JURISTIC_METHODS.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setJuristicMethod(m.id)}
                                    className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${juristicMethod === m.id ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                                >
                                    {m.name.split(' (')[0]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Local Hijri Adjustments */}
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-sm font-bold text-gray-900 mb-1">កែសម្រួលថ្ងៃខែហ៊ីជីរ៉ះ (Hijri)</label>
                        <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">កែសម្រួលថ្ងៃខែអារ៉ាប់នៅលើឧបករណ៍របស់អ្នក។ វាមិនប៉ះពាល់ដល់ម៉ោងសឡាតទេ។</p>
                        <div className="flex p-1 bg-gray-100 rounded-xl">
                            {[-2, -1, 0, 1, 2].map(val => (
                                <button
                                    key={val}
                                    onClick={() => {
                                        setHijriAdjustment(val);
                                        localStorage.setItem('prayerHijriAdjustment', String(val));
                                    }}
                                    className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${hijriAdjustment === val ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                                >
                                    {val > 0 ? `+${val}` : val}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Azan Audio */}
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-sm font-bold text-gray-900 mb-3">សំឡេងអាហ្សាន</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1" onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === 'azan' ? null : 'azan'); }}>
                                <div className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl text-sm cursor-pointer hover:border-indigo-300 transition-colors shadow-sm">
                                    <span className="text-gray-700 font-medium truncate">
                                        {AZAN_OPTIONS.find(a => a.url === selectedAzan)?.name || 'ជ្រើសរើសសំឡេង'}
                                    </span>
                                    <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={1.5} className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === 'azan' ? 'rotate-180' : ''}`} />
                                </div>
                                {openDropdown === 'azan' && (
                                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1">
                                        {AZAN_OPTIONS.map(a => (
                                            <button
                                                key={a.id}
                                                onClick={(e) => { 
                                                    e.stopPropagation();
                                                    setSelectedAzan(a.url); 
                                                    localStorage.setItem('prayerAzanUrl', a.url);
                                                    setOpenDropdown(null); 
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedAzan === a.url ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                {a.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => {
                                    if (azanAudioRef.current) {
                                        if (isPlayingTest) {
                                            azanAudioRef.current.pause();
                                            azanAudioRef.current.currentTime = 0;
                                        } else {
                                            azanAudioRef.current.currentTime = 0;
                                            azanAudioRef.current.play().catch(e => console.error(e));
                                        }
                                    }
                                }}
                                className={`w-12 h-12 shrink-0 bg-white border rounded-xl transition-all flex items-center justify-center shadow-sm ${isPlayingTest ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-gray-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700'}`}
                                title={isPlayingTest ? "បញ្ឈប់" : "សាកល្បងស្តាប់"}
                            >
                                {isPlayingTest ? (
                                    <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
                                ) : (
                                    <HugeiconsIcon icon={VolumeHighIcon} strokeWidth={1.5} className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Background Image */}
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-sm font-bold text-gray-900 mb-3">ផ្ទៃខាងក្រោយ</label>
                        <div className="flex items-center gap-3">
                            <label className={`flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl text-sm cursor-pointer hover:border-indigo-300 transition-colors shadow-sm text-indigo-600 font-medium relative overflow-hidden ${bgImage ? 'h-20' : 'p-3 hover:bg-indigo-50'}`}>
                                {bgImage ? (
                                    <>
                                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}></div>
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <span className="text-white text-xs font-bold px-3 py-1.5 bg-black/50 rounded-full backdrop-blur-sm flex items-center gap-1">
                                                <HugeiconsIcon icon={Image01Icon} strokeWidth={2} className="w-3 h-3" /> ប្តូររូបភាព
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <HugeiconsIcon icon={Image01Icon} strokeWidth={1.5} className="w-5 h-5" />
                                        <span>ជ្រើសរើសរូបភាព</span>
                                    </>
                                )}
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                            {bgImage && (
                                <button 
                                    onClick={removeImage}
                                    className="w-12 h-20 shrink-0 bg-white border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-all flex items-center justify-center shadow-sm"
                                    title="លុបរូបភាព"
                                >
                                    <HugeiconsIcon icon={Trash01Icon} strokeWidth={1.5} className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mosque Name */}
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-sm font-bold text-gray-900 mb-3">ឈ្មោះម៉ាស្ជិត</label>
                        <input 
                            type="text" 
                            value={mosqueName}
                            onChange={(e) => {
                                setMosqueName(e.target.value);
                                localStorage.setItem('prayerMosqueName', e.target.value);
                            }}
                            placeholder="បញ្ចូលឈ្មោះម៉ាស្ជិត..."
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-medium"
                        />
                    </div>

                    {/* Time Offsets */}
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-sm font-bold text-gray-900 mb-3">កំណត់ម៉ោងបន្ថែម/បន្ថយ (នាទី)</label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { key: 'Imsak', label: 'អ៊ីមសាក់' },
                                { key: 'Fajr', label: 'ស៊ូបុហ' },
                                { key: 'Sunrise', label: 'ថ្ងៃរះ' },
                                { key: 'Dhuhr', label: 'ហ្ស៊ូហ៊ួរ' },
                                { key: 'Asr', label: 'អាសើរ' },
                                { key: 'Maghrib', label: 'ម៉ាហ្រ្កឹប' },
                                { key: 'Isha', label: 'អ៊ីស្ហាក' }
                            ].map((prayer) => (
                                <div key={prayer.key} className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                                    <span className="text-xs font-medium text-gray-700 pl-1">{prayer.label}</span>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => {
                                                const newOffsets = { ...timeOffsets, [prayer.key]: (timeOffsets as any)[prayer.key] - 1 };
                                                setTimeOffsets(newOffsets);
                                                localStorage.setItem('prayerTimeOffsets', JSON.stringify(newOffsets));
                                            }}
                                            className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-colors"
                                        >-</button>
                                        <span className="w-6 text-center text-xs font-bold text-indigo-700">
                                            {(timeOffsets as any)[prayer.key] > 0 ? `+${(timeOffsets as any)[prayer.key]}` : (timeOffsets as any)[prayer.key]}
                                        </span>
                                        <button 
                                            onClick={() => {
                                                const newOffsets = { ...timeOffsets, [prayer.key]: (timeOffsets as any)[prayer.key] + 1 };
                                                setTimeOffsets(newOffsets);
                                                localStorage.setItem('prayerTimeOffsets', JSON.stringify(newOffsets));
                                            }}
                                            className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-colors"
                                        >+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => { 
                        setShowSettings(false); 
                        if (azanAudioRef.current && !azanAudioRef.current.paused) {
                            azanAudioRef.current.pause();
                            azanAudioRef.current.currentTime = 0;
                        }
                        fetchPrayerTimes(); 
                    }}
                    className="w-full mt-8 shrink-0 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                >
                    រក្សាទុក
                </button>
            </div>
         </div>
      )}
      
      {/* Qibla Full Screen Overlay */}
      {showQibla && (
        <div className="fixed inset-0 md:left-20 z-[100] bg-white overflow-hidden flex flex-col">
            <QiblaFinderView onClose={() => setShowQibla(false)} />
        </div>
      )}

      {/* Download Preview Modal */}
      {showDownloadPreview && previewImage && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowDownloadPreview(false)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0">
              <h3 className="text-lg font-bold text-gray-900">ទាញយកតារាងម៉ោងសឡាត</h3>
              <button onClick={() => setShowDownloadPreview(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 bg-gray-50 flex justify-center items-start">
              <img referrerPolicy="no-referrer" src={previewImage} alt="Schedule Preview" className="max-w-full h-auto shadow-md rounded-lg border border-gray-200" />
            </div>
            <div className="p-4 border-t border-gray-100 shrink-0 flex gap-3 justify-end bg-white">
              <button onClick={handleDownloadJPG} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-colors flex items-center gap-2">
                <HugeiconsIcon icon={ImageDownload02Icon} strokeWidth={1.5} className="w-5 h-5" />
                JPG
              </button>
              <button onClick={handleDownloadPDF} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200">
                <HugeiconsIcon icon={FileDownloadIcon} strokeWidth={1.5} className="w-5 h-5" />
                PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden A4 Export Container */}
      <div className="overflow-hidden h-0 w-0 absolute pointer-events-none">
        <div ref={exportRef} className="w-[794px] min-h-[1123px] bg-white p-8 flex flex-col font-khmer">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 font-khmer">{mosqueName || 'តារាងម៉ោងសឡាត'}</h2>
            <p className="text-gray-600 font-khmer mt-2 text-lg">
              {LOCATION_DATA[province]?.name_km} 
              {LOCATION_DATA[province]?.districts[parseInt(districtIndex)]?.name ? ` - ${LOCATION_DATA[province]?.districts[parseInt(districtIndex)]?.name}` : ''}
              {' '}(ខែ {KHMER_MONTHS[parseInt(month)-1]})
            </p>
          </div>
          
          {/* Table */}
          <table className="w-full text-[13px] text-left border-collapse">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-3 pt-[2px] pb-[18px] font-semibold align-middle border border-gray-200 leading-none">កាលបរិច្ឆេទ</th>
                <th className="px-2 pt-[2px] pb-[18px] font-semibold text-center align-middle text-orange-600 border border-gray-200 leading-none">អ៊ីមសាក់</th>
                <th className="px-2 pt-[2px] pb-[18px] font-semibold text-center align-middle border border-gray-200 leading-none">ស៊ូបុហ</th>
                <th className="px-2 pt-[2px] pb-[18px] font-semibold text-center align-middle border border-gray-200 leading-none">ហ្ស៊ូហ៊ួរ</th>
                <th className="px-2 pt-[2px] pb-[18px] font-semibold text-center align-middle border border-gray-200 leading-none">អាសើរ</th>
                <th className="px-2 pt-[2px] pb-[18px] font-semibold text-center align-middle border border-gray-200 leading-none">ម៉ាហ្រ្កឹប</th>
                <th className="px-2 pt-[2px] pb-[18px] font-semibold text-center align-middle border border-gray-200 leading-none">អ៊ីស្ហាក</th>
              </tr>
            </thead>
            <tbody>
              {scheduleData.map((day, i) => {
                const khmerMonth = KHMER_MONTHS[day.date.gregorian.month.number - 1];
                return (
                  <tr key={i} className="border border-gray-200">
                    <td className="px-3 pt-0 pb-[16px] font-medium text-gray-900 border border-gray-200 align-middle leading-none">
                      <div className="flex flex-col leading-tight">
                        <span className="mb-0.5">{day.date.gregorian.day} {khmerMonth} {day.date.gregorian.year}</span>
                        <span className="text-[10px] text-gray-500 font-normal">{day.date.hijri.day} {day.date.hijri.month.en} {day.date.hijri.year}</span>
                      </div>
                    </td>
                    <td className="px-2 pt-0 pb-[16px] text-center align-middle text-orange-600 font-medium border border-gray-200 bg-orange-50/30 leading-none">{day.timings.Imsak}</td>
                    <td className="px-2 pt-0 pb-[16px] text-center align-middle text-gray-700 border border-gray-200 leading-none">{day.timings.Fajr}</td>
                    <td className="px-2 pt-0 pb-[16px] text-center align-middle text-gray-700 border border-gray-200 leading-none">{day.timings.Dhuhr}</td>
                    <td className="px-2 pt-0 pb-[16px] text-center align-middle text-gray-700 border border-gray-200 leading-none">{day.timings.Asr}</td>
                    <td className="px-2 pt-0 pb-[16px] text-center align-middle text-gray-700 border border-gray-200 leading-none">{day.timings.Maghrib}</td>
                    <td className="px-2 pt-0 pb-[16px] text-center align-middle text-gray-700 border border-gray-200 leading-none">{day.timings.Isha}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          <div className="mt-auto pt-6 text-center text-xs text-gray-400 font-khmer">
            បង្កើតដោយកម្មវិធី Ponloe - ពន្លឺ
          </div>
        </div>
      </div>
    </div>
  );
};
