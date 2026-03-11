import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon, Calendar01Icon, Loading02Icon, InformationCircleIcon, Moon01Icon, CircleIcon, StarIcon, Cancel01Icon, Location01Icon, SunriseIcon, Copy01Icon, Tick01Icon } from '@hugeicons/core-free-icons';

import React, { useState, useEffect } from 'react';


import { useQuery } from '@tanstack/react-query';

// --- Interfaces ---

interface HijriDate {
  date: string;
  format: string;
  day: string;
  weekday: { en: string; ar: string };
  month: { number: number; en: string; ar: string };
  year: string;
  designation: { abbreviated: string; expanded: string };
  holidays: string[];
}

interface GregorianDate {
  date: string;
  day: string;
  weekday: { en: string };
  month: { number: number; en: string };
  year: string;
}

interface CalendarDay {
  gregorian: GregorianDate;
  hijri: HijriDate;
  meta?: {
      moonPhase: string;
  }
}

interface EventData {
    date: string;
    name: string;
    type: 'holiday' | 'special';
}

// --- Constants ---

const KHMER_MONTHS = [
  "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
  "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"
];

const KHMER_DAYS = ["អាទិត្យ", "ចន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];

const ISLAMIC_MONTHS_KH: Record<string, string> = {
  "Muḥarram": "មូហារ៉ាម",
  "Ṣafar": "សហ្វារ",
  "Rabīʿ al-awwal": "រ៉ប៊ីអ៊ុលអាវវ៉ាល់",
  "Rabīʿ al-thānī": "រ៉ប៊ីអ៊ុលសានី",
  "Jumādá al-ūlá": "ជូម៉ាដាល់អ៊ូឡា",
  "Jumādá al-ākhirah": "ជូម៉ាដាល់អាឃីរ៉ោះ",
  "Rajab": "រ៉ាជាប់",
  "Shaʿbān": "ស្ហាក់បាន",
  "Ramaḍān": "រ៉ម៉ាឌន",
  "Shawwāl": "ស្ហាវវ៉ាល់",
  "Dhū al-Qaʿdah": "ហ្ស៊ុលកក់ឌះ",
  "Dhū al-Ḥijjah": "ហ្ស៊ុលហិជ្ជះ"
};

// --- Helpers ---

const toKhmerNum = (num: string | number) => {
  return num.toString().replace(/\d/g, d => "០១២៣៤៥៦៧៨៩"[parseInt(d)]);
};

const getMoonPhaseIcon = (hijriDay: number) => {
    // Basic approximation of moon phase based on Hijri day
    if (hijriDay === 1 || hijriDay === 29 || hijriDay === 30) return <HugeiconsIcon icon={CircleIcon} strokeWidth={1.5} className="w-3 h-3 text-slate-300 fill-slate-300 opacity-20" />; // New Moon
    if (hijriDay >= 2 && hijriDay <= 6) return <HugeiconsIcon icon={Moon01Icon} strokeWidth={1.5} className="w-3 h-3 text-yellow-200 fill-yellow-200 -rotate-45" />; // Waxing Crescent
    if (hijriDay >= 7 && hijriDay <= 10) return <HugeiconsIcon icon={Moon01Icon} strokeWidth={1.5} className="w-3 h-3 text-yellow-300 fill-yellow-300" />; // First Quarter
    if (hijriDay >= 11 && hijriDay <= 12) return <HugeiconsIcon icon={Moon01Icon} strokeWidth={1.5} className="w-3 h-3 text-yellow-400 fill-yellow-400 rotate-45" />; // Waxing Gibbous
    if (hijriDay >= 13 && hijriDay <= 15) return <HugeiconsIcon icon={CircleIcon} strokeWidth={1.5} className="w-3 h-3 text-yellow-100 fill-yellow-100 drop-shadow-[0_0_3px_rgba(253,224,71,0.8)]" />; // Full Moon
    if (hijriDay >= 16 && hijriDay <= 20) return <HugeiconsIcon icon={Moon01Icon} strokeWidth={1.5} className="w-3 h-3 text-yellow-400 fill-yellow-400 rotate-[135deg]" />; // Waning Gibbous
    if (hijriDay >= 21 && hijriDay <= 25) return <HugeiconsIcon icon={Moon01Icon} strokeWidth={1.5} className="w-3 h-3 text-yellow-300 fill-yellow-300 rotate-180" />; // Last Quarter
    return <HugeiconsIcon icon={Moon01Icon} strokeWidth={1.5} className="w-3 h-3 text-yellow-200 fill-yellow-200 rotate-[225deg]" />; // Waning Crescent
};

// --- Components ---

export const MuslimCalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal State
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const { data: calendarData = [], isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['calendar', month, year],
    queryFn: async () => {
      const baseUrl = '';
      const response = await fetch(`${baseUrl}/api/pt/gToH?month=${month}&year=${year}&method=3`);
      
      if (!response.ok) {
        const text = await response.text();
        if (text.includes('Rate exceeded.')) {
          throw new Error('ប្រព័ន្ធកំពុងរវល់ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។');
        }
        throw new Error('Network response error');
      }

      const result = await response.json();
      if (result.code === 200 && result.data) {
        return result.data;
      } else {
        throw new Error('បរាជ័យក្នុងការទាញយកទិន្នន័យពី API');
      }
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 3,
  });

  const error = queryError ? (queryError as Error).message : null;

  const events = React.useMemo(() => {
    const extractedEvents: EventData[] = [];
    calendarData.forEach((day: CalendarDay) => {
      if (day.hijri.holidays.length > 0) {
        day.hijri.holidays.forEach(holiday => {
          extractedEvents.push({
            date: `${toKhmerNum(day.gregorian.day)} ${KHMER_MONTHS[day.gregorian.month.number - 1]}`,
            name: holiday,
            type: 'holiday'
          });
        });
      }
    });
    return extractedEvents;
  }, [calendarData]);

  const todayHijriString = React.useMemo(() => {
    const today = new Date();
    const day = calendarData.find((d: CalendarDay) => 
      parseInt(d.gregorian.day) === today.getDate() && 
      d.gregorian.month.number === (today.getMonth() + 1) && 
      parseInt(d.gregorian.year) === today.getFullYear()
    );

    if (day) {
      const khmerHijriMonth = ISLAMIC_MONTHS_KH[day.hijri.month.en] || day.hijri.month.en;
      const khmerHijriDay = toKhmerNum(day.hijri.day);
      const khmerHijriYear = toKhmerNum(day.hijri.year);
      return `${khmerHijriDay} ${khmerHijriMonth} ${khmerHijriYear}`;
    }
    return 'កំពុងផ្ទុក...';
  }, [calendarData]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getFirstDayOffset = () => {
    if (calendarData.length === 0) return 0;
    const firstDay = calendarData[0].gregorian.weekday.en; 
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days.indexOf(firstDay);
  };

  const isToday = (day: CalendarDay) => {
    const today = new Date();
    return (
      parseInt(day.gregorian.day) === today.getDate() &&
      day.gregorian.month.number === today.getMonth() + 1 &&
      parseInt(day.gregorian.year) === today.getFullYear()
    );
  };

  const handleCopyDate = (day: CalendarDay) => {
    const hijriMonth = ISLAMIC_MONTHS_KH[day.hijri.month.en] || day.hijri.month.en;
    const khmerDate = `ថ្ងៃ${KHMER_DAYS[getDayIndex(day.gregorian.weekday.en)]} ទី${toKhmerNum(day.gregorian.day)} ខែ${KHMER_MONTHS[day.gregorian.month.number - 1]} ឆ្នាំ${toKhmerNum(day.gregorian.year)}`;
    const hijriDate = `ត្រូវនឹងថ្ងៃ ${toKhmerNum(day.hijri.day)} ខែ${hijriMonth} ឆ្នាំ${toKhmerNum(day.hijri.year)}`;
    const englishDate = `${day.gregorian.weekday.en}, ${day.gregorian.day} ${day.gregorian.month.en} ${day.gregorian.year}`;
    
    const textToCopy = `${khmerDate}\n${hijriDate}\n(ត្រូវនឹង ${englishDate})`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const getDayIndex = (enDay: string) => {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return days.indexOf(enDay);
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 animate-in fade-in duration-300 font-khmer">
      
      {/* Enhanced Header Design */}
      <div className="bg-[#0f3d35] text-white rounded-b-[3rem] shadow-2xl relative overflow-hidden">
         {/* Decorative Background Pattern */}
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
         <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500 rounded-full blur-[120px] opacity-20"></div>
         <div className="absolute top-40 -left-20 w-60 h-60 bg-teal-400 rounded-full blur-[100px] opacity-10"></div>

         <div className="relative max-w-5xl mx-auto px-6 pt-8 pb-12">
            
            {/* Top Bar: Title */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
                        <HugeiconsIcon icon={Calendar01Icon} strokeWidth={1.5} className="w-6 h-6 text-emerald-300" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold font-khmer-title leading-none">ប្រតិទិនឥស្លាម</h1>
                        <span className="text-xs text-emerald-200/70 font-mono tracking-wider">HIJRI CALENDAR</span>
                    </div>
                </div>
            </div>

            {/* Main Content: Today's Hijri Date */}
            <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                
                {/* Centerpiece: Today's Date */}
                <div className="w-full md:w-auto flex-1">
                    <div className="inline-block mb-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                            ថ្ងៃនេះ / TODAY
                        </span>
                    </div>
                    
                    <h2 className="text-4xl md:text-6xl font-bold font-khmer-title leading-tight mb-2 text-transparent bg-clip-text bg-gradient-to-br from-white via-emerald-50 to-emerald-200 drop-shadow-sm">
                       {todayHijriString}
                    </h2>
                    
                    <p className="text-emerald-100/70 font-khmer text-sm md:text-base flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                       ត្រូវនឹងថ្ងៃទី {toKhmerNum(new Date().getDate())} ខែ{KHMER_MONTHS[new Date().getMonth()]} ឆ្នាំ{toKhmerNum(new Date().getFullYear())}
                    </p>
                </div>

                {/* Navigation Controls (Moved to be inline on desktop) */}
                <div className="w-full md:w-auto">
                    <div className="bg-black/20 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-lg flex items-center justify-between md:justify-center gap-4 min-w-[280px]">
                        <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-white/10 rounded-xl transition-all active:scale-95 text-emerald-100">
                            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-6 h-6" />
                        </button>
                        <div className="text-center">
                            <span className="block font-bold text-lg leading-tight text-white">
                                {KHMER_MONTHS[currentDate.getMonth()]}
                            </span>
                            <span className="text-xs text-emerald-300/80 font-mono tracking-widest font-bold">
                                {toKhmerNum(currentDate.getFullYear())}
                            </span>
                        </div>
                        <button onClick={() => changeMonth(1)} className="p-3 hover:bg-white/10 rounded-xl transition-all active:scale-95 text-emerald-100">
                            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
         </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10 space-y-6">
         
         {/* Calendar Card */}
         <div className="bg-white rounded-3xl shadow-lg shadow-emerald-900/5 border border-gray-100 overflow-hidden">
            {/* Days Header */}
            <div className="grid grid-cols-7 bg-slate-50/80 border-b border-gray-100 backdrop-blur-sm sticky top-0 z-10">
                {KHMER_DAYS.map((day, idx) => (
                    <div key={idx} className={`py-4 text-center text-xs md:text-sm font-bold ${idx === 5 ? 'text-emerald-600' : 'text-slate-500'}`}>
                        <span className="hidden md:inline">{day}</span>
                        <span className="md:hidden">{day.substring(0, 1)}</span>
                    </div>
                ))}
            </div>

            {/* Days Body */}
            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center text-gray-400 gap-3">
                    <HugeiconsIcon icon={Loading02Icon} strokeWidth={1.5} className="w-10 h-10 animate-spin text-emerald-600" />
                    <span className="font-khmer text-sm animate-pulse">កំពុងរៀបចំទិន្នន័យ...</span>
                </div>
            ) : error ? (
                <div className="h-64 flex flex-col items-center justify-center text-red-500 gap-3 p-4 text-center">
                    <div className="bg-red-50 p-3 rounded-full"><HugeiconsIcon icon={InformationCircleIcon} strokeWidth={1.5} className="w-6 h-6" /></div>
                    <span>{error}</span>
                    <button onClick={() => refetch()} className="text-sm underline">ព្យាយាមម្តងទៀត</button>
                </div>
            ) : (
                <div className="grid grid-cols-7 auto-rows-[minmax(90px,1fr)] md:auto-rows-[minmax(110px,1fr)] bg-slate-50 gap-px border-b border-gray-100">
                    {/* Padding for start of month */}
                    {Array.from({ length: getFirstDayOffset() }).map((_, idx) => (
                        <div key={`empty-${idx}`} className="bg-white"></div>
                    ))}

                    {/* Actual Days */}
                    {calendarData.map((day, idx) => {
                        const isCurrentDay = isToday(day);
                        const hasHoliday = day.hijri.holidays.length > 0;
                        const isFriday = day.gregorian.weekday.en === "Friday";
                        const hijriDayNum = parseInt(day.hijri.day);

                        return (
                            <div 
                                key={idx} 
                                onClick={() => setSelectedDay(day)}
                                className={`relative bg-white p-2 flex flex-col justify-between transition-all hover:bg-emerald-50/30 cursor-pointer group
                                    ${isCurrentDay ? 'bg-emerald-50/80 !border-emerald-500 z-10 ring-1 ring-emerald-500 ring-inset' : ''}
                                `}
                            >
                                {/* Gregorian Date (Top Left) */}
                                <div className="flex justify-between items-start">
                                    <span className={`font-bold text-lg leading-none ${isCurrentDay ? 'text-emerald-700' : isFriday ? 'text-emerald-600' : 'text-slate-700'}`}>
                                        {toKhmerNum(day.gregorian.day)}
                                    </span>
                                    {/* Moon Phase Indicator (Approx) */}
                                    <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                                        {getMoonPhaseIcon(hijriDayNum)}
                                    </div>
                                </div>

                                {/* Event Dot */}
                                {hasHoliday && (
                                    <div className="flex justify-center my-1">
                                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></div>
                                    </div>
                                )}

                                {/* Hijri Date (Bottom Right) */}
                                <div className="text-right mt-1">
                                    <span className={`block font-arabic text-lg md:text-xl leading-none ${isCurrentDay ? 'text-emerald-800' : 'text-slate-500'}`}>
                                        {day.hijri.day}
                                    </span>
                                    <span className="block text-[9px] md:text-[10px] text-slate-400 font-medium truncate">
                                        {ISLAMIC_MONTHS_KH[day.hijri.month.en] || day.hijri.month.en}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
         </div>

         {/* Events List Widget */}
         {events.length > 0 && (
             <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                 <h3 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2">
                    <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                        <HugeiconsIcon icon={StarIcon} strokeWidth={1.5} className="w-5 h-5 fill-current" />
                    </div>
                    បុណ្យសំខាន់ៗក្នុងខែនេះ
                 </h3>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                     {events.map((event, idx) => (
                         <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-amber-50/50 border border-slate-100 hover:border-amber-100 rounded-2xl transition-all group">
                             <div className="flex flex-col items-center justify-center w-12 h-12 bg-white border border-slate-200 rounded-xl shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                 <span className="text-lg font-bold text-slate-800 leading-none">{event.date.split(' ')[0]}</span>
                             </div>
                             <div>
                                 <span className="text-[10px] font-bold text-amber-600 bg-amber-100/50 px-2 py-0.5 rounded mb-1 inline-block">
                                    HOLIDAY
                                 </span>
                                 <h4 className="font-bold text-gray-800 text-sm leading-tight group-hover:text-amber-700 transition-colors">
                                    {event.name}
                                 </h4>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
         )}

         <div className="flex justify-center pt-4">
             <button 
                onClick={goToToday}
                className="bg-white text-emerald-800 px-6 py-3 rounded-full text-sm font-bold shadow-lg shadow-emerald-900/5 hover:shadow-xl hover:bg-emerald-50 transition-all flex items-center gap-2 active:scale-95 border border-emerald-100"
             >
                <HugeiconsIcon icon={Calendar01Icon} strokeWidth={1.5} className="w-4 h-4" /> ត្រឡប់ទៅថ្ងៃនេះ
             </button>
         </div>

      </div>

      {/* Day Detail Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedDay(null)}>
            <div 
                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header with Islamic Pattern */}
                <div className="relative bg-[#0f3d35] h-36 flex flex-col items-center justify-center pt-4">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
                    <button 
                        onClick={() => setSelectedDay(null)}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm"
                    >
                        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
                    </button>
                    <div className="text-center text-white relative z-10">
                        <span className="text-emerald-200 text-xs font-bold uppercase tracking-wider mb-1 block">
                            {selectedDay.gregorian.month.en} {selectedDay.gregorian.year}
                        </span>
                        <h2 className="text-5xl font-bold font-khmer leading-none">
                            {toKhmerNum(selectedDay.gregorian.day)}
                        </h2>
                        <p className="text-emerald-100/80 text-sm mt-2 font-khmer">
                            ថ្ងៃ{KHMER_DAYS[getDayIndex(selectedDay.gregorian.weekday.en)]}
                        </p>
                    </div>
                </div>

                <div className="p-6 -mt-6 relative z-20 bg-white rounded-t-3xl">
                    {/* Hijri Date Display */}
                    <div className="text-center mb-8 pt-2">
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-3 border border-emerald-100">
                            កាលបរិច្ឆេទអុិស្លាម
                        </span>
                        <div className="flex items-end justify-center gap-2 text-slate-800">
                            <span className="text-3xl font-bold font-arabic leading-none">{selectedDay.hijri.day}</span>
                            <div className="text-left leading-tight">
                                <span className="block text-lg font-bold font-khmer text-emerald-800">
                                    {ISLAMIC_MONTHS_KH[selectedDay.hijri.month.en] || selectedDay.hijri.month.en}
                                </span>
                                <span className="block text-sm text-slate-400 font-khmer">
                                    ឆ្នាំ {toKhmerNum(selectedDay.hijri.year)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Holidays Section */}
                    {selectedDay.hijri.holidays.length > 0 && (
                        <div className="mb-6 bg-amber-50 rounded-xl p-4 border border-amber-100">
                            <h4 className="text-amber-700 font-bold text-sm mb-2 flex items-center gap-2">
                                <HugeiconsIcon icon={StarIcon} strokeWidth={1.5} className="w-4 h-4 fill-current" /> ពិធីបុណ្យថ្ងៃនេះ
                            </h4>
                            <ul className="space-y-1">
                                {selectedDay.hijri.holidays.map((h, i) => (
                                    <li key={i} className="text-slate-700 text-sm font-medium pl-6 relative before:content-['•'] before:absolute before:left-2 before:text-amber-400">
                                        {h}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                            <div className="bg-orange-100 p-2 rounded-lg text-orange-500"><HugeiconsIcon icon={SunriseIcon} strokeWidth={1.5} className="w-4 h-4" /></div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Sunrise</p>
                                <p className="text-sm font-bold text-slate-700">06:05 AM</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-500"><HugeiconsIcon icon={Moon01Icon} strokeWidth={1.5} className="w-4 h-4" /></div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Maghrib</p>
                                <p className="text-sm font-bold text-slate-700">06:15 PM</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Copy Button */}
                    <button 
                        onClick={() => handleCopyDate(selectedDay)}
                        className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                            isCopied 
                            ? 'bg-emerald-600 text-white shadow-emerald-200' 
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        {isCopied ? <HugeiconsIcon icon={Tick01Icon} strokeWidth={1.5} className="w-4 h-4" /> : <HugeiconsIcon icon={Copy01Icon} strokeWidth={1.5} className="w-4 h-4" />}
                        {isCopied ? 'បានចម្លងរួចរាល់' : 'ចម្លងកាលបរិច្ឆេទ'}
                    </button>

                </div>
            </div>
        </div>
      )}

    </div>
  );
};
