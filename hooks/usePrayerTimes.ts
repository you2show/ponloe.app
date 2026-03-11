import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LOCATION_DATA, DEFAULT_TIME_OFFSETS } from '@/components/prayer/data';

export interface PrayerData {
  date: {
    gregorian: { date: string; day: string; month: { en: string; number: number }; year: string };
    hijri: { date: string; day: string; month: { en: string; ar: string }; year: string; weekday: { ar: string } };
  };
  timings: Record<string, string>;
}

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

export const usePrayerTimes = (
  provinceKey: string = 'phnom-penh', 
  districtIndex: number = 0,
  communeIndex: number = 0,
  customLat?: number,
  customLon?: number,
  calculationMethod: number = 3,
  juristicMethod: number = 0
) => {
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; countdown: string; key: string }>({ name: '', time: '', countdown: '', key: '' });

  const fetchTimes = async () => {
    let latitude = customLat;
    let longitude = customLon;
    
    if (!latitude || !longitude) {
      const pData = LOCATION_DATA[provinceKey];
      const dData = pData?.districts[districtIndex];
      
      if (dData) {
        latitude = dData.lat;
        longitude = dData.lon;
      }
    }
    
    if (!latitude || !longitude) {
      return null;
    }

    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    const savedHijriAdj = localStorage.getItem('prayerHijriAdjustment');
    const hijriAdjustment = savedHijriAdj ? parseInt(savedHijriAdj) : 0;
    
    const apiUrl = `/api/pt/cal?year=${year}&month=${month}&latitude=${latitude}&longitude=${longitude}&method=${calculationMethod}&school=${juristicMethod}&adjustment=${hijriAdjustment}`;

    const savedOffsets = localStorage.getItem('prayerTimeOffsets');
    const timeOffsets = savedOffsets ? { ...DEFAULT_TIME_OFFSETS, ...JSON.parse(savedOffsets) } : DEFAULT_TIME_OFFSETS;

    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error('Network response error');
    
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      throw new Error(`Server returned an invalid response. Content-Type: ${contentType}`);
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

      const today = new Date();
      const todayStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
      
      const foundToday = adjustedData.find((d: PrayerData) => d.date.gregorian.date === todayStr);
      
      return foundToday || null;
    }
    return null;
  };

  const { data: todayData, isLoading: loading } = useQuery({
    queryKey: ['prayerTimes', provinceKey, districtIndex, customLat, customLon, calculationMethod, juristicMethod],
    queryFn: fetchTimes,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 3,
  });


  useEffect(() => {
    if (!todayData) return;
    
    const updateCountdown = () => {
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
        const timeStr = todayData.timings[p.key];
        if (!timeStr) continue;
        const [h, m] = timeStr.split(':').map(Number);
        const pDate = new Date();
        pDate.setHours(h, m, 0, 0);
        
        if (pDate > now) {
          upcoming = { ...p, time: pDate };
          break;
        }
      }

      if (!upcoming) {
        const timeStr = todayData.timings.Fajr;
        if (!timeStr) return;
        const [h, m] = timeStr.split(':').map(Number);
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
                time: todayData.timings.Fajr, 
                countdown: `-${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`, 
                key: 'Fajr' 
            });
        }
      } else {
        const diff = upcoming.time.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        
        setNextPrayer({
          name: upcoming.name,
          time: todayData.timings[upcoming.key],
          countdown: `-${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
          key: upcoming.key
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [todayData]);

  return { todayData, nextPrayer, loading };
};
