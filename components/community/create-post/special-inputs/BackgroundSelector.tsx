import React, { useState, useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Album01Icon, ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { SpecialInputProps } from './types';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';

export const BackgroundSelector: React.FC<SpecialInputProps & { onSelect: (cls: string) => void }> = ({ onCancel, onSelect }) => {
    const { theme } = useTheme();
    const [showImages, setShowImages] = useState(false);
    
    // Drag to scroll state
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const gradients = [
        { id: 'none', class: '', label: 'Default' },
        
        // Solid Colors (10)
        { id: 's1', class: 'bg-slate-500 text-white', label: 'Slate' },
        { id: 's2', class: 'bg-red-500 text-white', label: 'Red' },
        { id: 's3', class: 'bg-orange-500 text-white', label: 'Orange' },
        { id: 's4', class: 'bg-amber-500 text-white', label: 'Amber' },
        { id: 's5', class: 'bg-green-500 text-white', label: 'Green' },
        { id: 's6', class: 'bg-emerald-500 text-white', label: 'Emerald' },
        { id: 's7', class: 'bg-teal-500 text-white', label: 'Teal' },
        { id: 's8', class: 'bg-blue-500 text-white', label: 'Blue' },
        { id: 's9', class: 'bg-indigo-500 text-white', label: 'Indigo' },
        { id: 's10', class: 'bg-violet-500 text-white', label: 'Violet' },

        // Gradients (10)
        { id: 'g1', class: 'linear-gradient(to right, #ec4899, #f43f5e)', label: 'Pink Rose' },
        { id: 'g2', class: 'linear-gradient(to right, #60a5fa, #6366f1)', label: 'Blue Indigo' },
        { id: 'g3', class: 'linear-gradient(to right, #34d399, #06b6d4)', label: 'Emerald Cyan' },
        { id: 'g4', class: 'linear-gradient(to right, #fbbf24, #f97316)', label: 'Amber Orange' },
        { id: 'g5', class: 'linear-gradient(to right, #d946ef, #9333ea)', label: 'Fuchsia Purple' },
        { id: 'g6', class: 'linear-gradient(to right, #ef4444, #eab308)', label: 'Red Yellow' },
        { id: 'g7', class: 'linear-gradient(to right, #a3e635, #16a34a)', label: 'Lime Green' },
        { id: 'g8', class: 'linear-gradient(to right, #22d3ee, #2563eb)', label: 'Cyan Blue' },
        { id: 'g9', class: 'linear-gradient(to right, #8b5cf6, #d946ef)', label: 'Violet Fuchsia' },
        { id: 'g10', class: 'linear-gradient(to bottom right, #1e293b, #18181b)', label: 'Dark' },
    ];

    const fetchImages = async () => {
        const apiKey = 'AwOvKa3Ou1MQFZBktiiO1MSKo8uONjWlgI9OUXwFzFY';
        
        // Unsplash max count is 30 per request.
        const [res1, res2] = await Promise.all([
            fetch(`https://api.unsplash.com/photos/random/?client_id=${apiKey}&count=5&query=masjid al haram,masjid nabawi,makkah,madina`),
            fetch(`https://api.unsplash.com/photos/random/?client_id=${apiKey}&count=30&query=nature,landscape,mountains,forest`)
        ]);

        const data1 = await res1.json();
        const data2 = await res2.json();
        
        let allImages: string[] = [];
        
        if (Array.isArray(data1)) {
            allImages = [...allImages, ...data1.map((img: any) => img.urls.regular)];
        }
        if (Array.isArray(data2)) {
            allImages = [...allImages, ...data2.map((img: any) => img.urls.regular)];
        }
        
        // Shuffle the array to mix mosques and nature
        return allImages.sort(() => 0.5 - Math.random());
    };

    const { data: images = [], isLoading: loading } = useQuery({
        queryKey: ['backgroundSelectorImages'],
        queryFn: fetchImages,
        enabled: showImages,
        staleTime: Infinity,
    });

    const handleShowImages = () => {
        setShowImages(true);
    };

    // Drag handlers
    const onMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
        setScrollLeft(scrollRef.current?.scrollLeft || 0);
    };

    const onMouseLeave = () => {
        setIsDragging(false);
    };

    const onMouseUp = () => {
        setIsDragging(false);
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
        const walk = (x - startX) * 2; // Scroll speed multiplier
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollLeft - walk;
        }
    };

    return (
        <div 
            ref={scrollRef}
            className={`flex gap-2 overflow-x-auto p-2 mb-2 no-scrollbar border-t items-center cursor-grab active:cursor-grabbing select-none ${theme === 'dark' ? 'border-slate-800' : 'border-gray-100'}`}
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
        >
            <button onClick={onCancel} className={`p-2 rounded-full shrink-0 transition-colors ${theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`} title="Clear">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-4 h-4"/>
            </button>
            
            {!showImages ? (
                <>
                    <button 
                        onClick={handleShowImages}
                        className={`w-8 h-8 rounded-full shrink-0 border flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-gray-100 border-gray-200 hover:bg-gray-200'}`}
                        title="Unsplash Images"
                    >
                        {loading ? (
                            <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${theme === 'dark' ? 'border-slate-500' : 'border-gray-400'}`} />
                        ) : (
                            <HugeiconsIcon icon={Album01Icon} strokeWidth={1.5} className={`w-4 h-4 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`} />
                        )}
                    </button>
                    <div className={`w-px h-6 shrink-0 mx-1 ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'}`} />
                    {gradients.map(g => (
                        <button
                            key={g.id}
                            onClick={() => onSelect(g.class)}
                            className={`w-8 h-8 rounded-full shrink-0 shadow-sm border-2 ring-1 ${theme === 'dark' ? 'border-slate-900 ring-slate-700' : 'border-white ring-gray-200'} ${!g.class.startsWith('linear-gradient') ? (g.class || (theme === 'dark' ? 'bg-slate-800' : 'bg-white')) : ''}`}
                            style={g.class.startsWith('linear-gradient') ? { backgroundImage: g.class } : {}}
                            title={g.label}
                        />
                    ))}
                </>
            ) : (
                <>
                    <button 
                        onClick={() => setShowImages(false)}
                        className={`w-8 h-8 rounded-full shrink-0 border flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-gray-100 border-gray-200 hover:bg-gray-200'}`}
                        title="Back to Colors"
                    >
                        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className={`w-4 h-4 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`} />
                    </button>
                    {images.map((url, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                if (!isDragging) onSelect(url);
                            }}
                            className={`w-8 h-8 rounded-full shrink-0 shadow-sm border-2 ring-1 overflow-hidden relative ${theme === 'dark' ? 'border-slate-900 ring-slate-700' : 'border-white ring-gray-200'}`}
                        >
                            <img src={url} alt="bg" className="w-full h-full object-cover pointer-events-none" />
                        </button>
                    ))}
                </>
            )}
        </div>
    );
};
