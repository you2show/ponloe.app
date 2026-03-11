import React, { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar01Icon, Image01Icon } from '@hugeicons/core-free-icons';
import { SpecialInputProps } from './types';
import { useTheme } from '@/contexts/ThemeContext';

export const EventInput: React.FC<SpecialInputProps & { onSave?: (data: any) => void, initialData?: any }> = ({ onCancel, onSave, initialData }) => {
    const { theme } = useTheme();
    const [eventName, setEventName] = useState(initialData?.name || '');
    const [eventDate, setEventDate] = useState(initialData?.date || '');
    const [eventTime, setEventTime] = useState(initialData?.time || '');
    const [eventLocation, setEventLocation] = useState(initialData?.location || '');
    const [coverImage, setCoverImage] = useState<string | null>(initialData?.coverImage || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Notify parent of initial data if present (to ensure parent state matches)
    useEffect(() => {
        if (initialData && onSave) {
            // We don't need to call onSave here if the parent passed initialData, 
            // because the parent already has it. 
            // But if we want to be sure:
            // onSave(initialData); 
        }
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImage(reader.result as string);
                notifySave(eventName, eventDate, eventTime, eventLocation, reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const notifySave = (name: string, date: string, time: string, loc: string, img: string | null) => {
        if (onSave) {
            onSave({
                name,
                date,
                time,
                location: loc,
                coverImage: img
            });
        }
    };

    return (
        <div className={`p-4 rounded-xl border mb-4 animate-in fade-in zoom-in-95 space-y-3 ${theme === 'dark' ? 'bg-orange-900/20 border-orange-800/50' : 'bg-orange-50 border-orange-100'}`}>
            <div className="flex justify-between items-center">
                <h4 className={`font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-orange-100' : 'text-orange-800'}`}>
                    <HugeiconsIcon icon={Calendar01Icon} strokeWidth={1.5} className={`w-5 h-5 ${theme === 'dark' ? 'text-orange-400' : ''}`}/> បង្កើតព្រឹត្តិការណ៍
                </h4>
                <button onClick={onCancel} className={`text-xs hover:text-red-500 ${theme === 'dark' ? 'text-orange-400/70 hover:text-red-400' : 'text-orange-600'}`}>បិទ</button>
            </div>
            
            {/* Cover Image Upload */}
            <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden relative group ${coverImage ? (theme === 'dark' ? 'border-orange-700' : 'border-orange-300') : (theme === 'dark' ? 'border-orange-800/50 bg-slate-800/50 hover:bg-orange-900/20 text-orange-500' : 'border-orange-200 bg-white hover:bg-orange-100/50 text-orange-400')}`}
            >
                {coverImage ? (
                    <>
                        <img src={coverImage} alt="Event Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-bold text-sm bg-black/50 px-3 py-1.5 rounded-full flex items-center gap-2">
                                <HugeiconsIcon icon={Image01Icon} strokeWidth={1.5} className="w-4 h-4" /> ប្តូររូបភាព
                            </span>
                        </div>
                    </>
                ) : (
                    <>
                        <HugeiconsIcon icon={Image01Icon} strokeWidth={1.5} className="w-6 h-6 mb-2" />
                        <span className="text-sm font-bold font-khmer">បន្ថែមរូបភាពព្រឹត្តិការណ៍</span>
                    </>
                )}
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
            />

            <input 
                type="text" 
                placeholder="ឈ្មោះព្រឹត្តិការណ៍" 
                value={eventName}
                onChange={(e) => {
                    setEventName(e.target.value);
                    notifySave(e.target.value, eventDate, eventTime, eventLocation, coverImage);
                }}
                className={`w-full p-2.5 rounded-lg border text-sm outline-none font-khmer ${theme === 'dark' ? 'bg-slate-800 border-orange-800/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500/50' : 'bg-white border-orange-200 focus:ring-2 focus:ring-orange-400'}`} 
            />
            <div className="flex gap-2">
                <input 
                    type="date" 
                    value={eventDate}
                    onChange={(e) => {
                        setEventDate(e.target.value);
                        notifySave(eventName, e.target.value, eventTime, eventLocation, coverImage);
                    }}
                    className={`flex-1 p-2.5 rounded-lg border text-sm outline-none ${theme === 'dark' ? 'bg-slate-800 border-orange-800/50 text-white focus:ring-2 focus:ring-orange-500/50 [color-scheme:dark]' : 'bg-white border-orange-200 focus:ring-2 focus:ring-orange-400'}`} 
                />
                <input 
                    type="time" 
                    value={eventTime}
                    onChange={(e) => {
                        setEventTime(e.target.value);
                        notifySave(eventName, eventDate, e.target.value, eventLocation, coverImage);
                    }}
                    className={`flex-1 p-2.5 rounded-lg border text-sm outline-none ${theme === 'dark' ? 'bg-slate-800 border-orange-800/50 text-white focus:ring-2 focus:ring-orange-500/50 [color-scheme:dark]' : 'bg-white border-orange-200 focus:ring-2 focus:ring-orange-400'}`} 
                />
            </div>
            <input 
                type="text" 
                placeholder="ទីតាំង (ផ្ទាល់ ឬ Online)" 
                value={eventLocation}
                onChange={(e) => {
                    setEventLocation(e.target.value);
                    notifySave(eventName, eventDate, eventTime, e.target.value, coverImage);
                }}
                className={`w-full p-2.5 rounded-lg border text-sm outline-none font-khmer ${theme === 'dark' ? 'bg-slate-800 border-orange-800/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500/50' : 'bg-white border-orange-200 focus:ring-2 focus:ring-orange-400'}`} 
            />
        </div>
    );
};
