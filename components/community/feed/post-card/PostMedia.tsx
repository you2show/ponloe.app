import { ZoomInAreaIcon, ZoomOutAreaIcon, PlayIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, ArrowLeft01Icon, ArrowRight01Icon, ThumbsUpIcon, Comment01Icon, Share01Icon } from '@hugeicons/core-free-icons';

import React, { useState, useRef, useEffect, TouchEvent, MouseEvent } from 'react';

import { Post, MediaItem } from '../../shared';
import { PostFooter } from './PostFooter';
import { PostHeader } from './PostHeader';

interface PostMediaProps {
    images: string[] | MediaItem[];
    layout?: string;
    post: Post;
}

export const PostMedia: React.FC<PostMediaProps> = ({ images, layout = 'grid', post }) => {
    const normalizedImages: MediaItem[] = images.map(img => 
        typeof img === 'string' ? { url: img, caption: '' } : img
    );

    // States
    const [isDetailOpen, setIsDetailOpen] = useState(false); // Stage 2
    const [previewIndex, setPreviewIndex] = useState<number | null>(null); // Stage 3
    const [isZoomed, setIsZoomed] = useState(false);
    const [showControls, setShowControls] = useState(true);
    
    // Refs for Gestures
    const touchStart = useRef<number | null>(null);
    const touchEnd = useRef<number | null>(null);
    const detailTouchStart = useRef<{x: number, y: number} | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    
    // Feed Carousel State
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [hasMoved, setHasMoved] = useState(false);

    if (normalizedImages.length === 0) return null;

    useEffect(() => {
        setIsZoomed(false);
        if (previewIndex !== null) setShowControls(true);
    }, [previewIndex]);

    // --- Detail View Gestures ---
    const onDetailTouchStart = (e: TouchEvent) => {
        detailTouchStart.current = {
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY
        };
    };

    const onDetailTouchEnd = (e: TouchEvent) => {
        if (!detailTouchStart.current) return;
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = endX - detailTouchStart.current.x;
        const diffY = endY - detailTouchStart.current.y;

        if (diffX > 100 && Math.abs(diffY) < 50) setIsDetailOpen(false); 
        if (diffY > 100 && Math.abs(diffX) < 50) setIsDetailOpen(false); 
        
        detailTouchStart.current = null;
    };

    // --- Lightbox Gestures ---
    const onTouchStart = (e: TouchEvent) => {
        touchEnd.current = null; 
        touchStart.current = e.targetTouches[0].clientX;
    };

    const onTouchMove = (e: TouchEvent) => {
        touchEnd.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = () => {
        if (isZoomed) return;
        if (!touchStart.current || !touchEnd.current) return;
        const distance = touchStart.current - touchEnd.current;
        if (distance > 50) handleNext();
        if (distance < -50) handlePrev();
    };

    const handleNext = () => {
        if (previewIndex === null) return;
        if (previewIndex < normalizedImages.length - 1) setPreviewIndex(previewIndex + 1);
    };

    const handlePrev = () => {
        if (previewIndex === null) return;
        if (previewIndex > 0) setPreviewIndex(previewIndex - 1);
        else setPreviewIndex(null);
    };

    const toggleZoom = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setIsZoomed(!isZoomed);
        if (!isZoomed) setShowControls(false);
    };

    // --- Carousel Mouse Handlers ---
    const handleMouseDown = (e: MouseEvent) => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        setHasMoved(false);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
        if (Math.abs(walk) > 5) setHasMoved(true);
    };

    // Helper to check if a URL is a video
    const isVideo = (url: string) => {
        if (!url) return false;
        const r2Url = import.meta.env.VITE_R2_PUBLIC_URL;
        return url.match(/\.(mp4|webm|ogg|mov)$/i) || url.startsWith('blob:') || url.includes('/api/video/') || (r2Url && url.startsWith(r2Url));
    };

    // --- Renders ---
    const renderGridImage = (img: MediaItem, idx: number, className: string) => (
        <div 
            key={idx} 
            className={`relative overflow-hidden bg-gray-100 dark:bg-slate-800 cursor-pointer group ${className}`}
            onClick={() => {
                if (!hasMoved) setIsDetailOpen(true);
            }}
        >
            {isVideo(img.url) ? (
                <>
                    <video 
                        src={img.url} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none" 
                        muted 
                        playsInline
                        preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                            <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} className="w-6 h-6 text-white fill-white" />
                        </div>
                    </div>
                </>
            ) : (
                <img 
                    src={img.url || undefined} 
                    alt={`Post img ${idx}`} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none" 
                    referrerPolicy="no-referrer"
                />
            )}
        </div>
    );

    let content;
    if (layout === 'carousel') {
        content = (
            <div 
                ref={scrollContainerRef}
                className={`flex gap-3 overflow-x-auto pb-4 no-scrollbar px-4 ${isDragging ? 'cursor-grabbing' : 'cursor-grab snap-x snap-mandatory'}`}
                onMouseDown={handleMouseDown}
                onMouseLeave={() => setIsDragging(false)}
                onMouseUp={() => setIsDragging(false)}
                onMouseMove={handleMouseMove}
            >
                {normalizedImages.map((img, idx) => renderGridImage(img, idx, 'w-[85%] md:w-[280px] h-[350px] rounded-xl snap-center shrink-0 border border-gray-200 dark:border-slate-700 select-none shadow-sm'))}
            </div>
        );
    } else if (layout === 'list') {
        content = (
            <div className="flex flex-col gap-1 w-full">
                {normalizedImages.map((img, idx) => renderGridImage(img, idx, 'w-full aspect-[16/9]'))}
            </div>
        );
    } else if (layout === 'featured') {
        content = (
            <div className="grid grid-cols-2 gap-1 w-full aspect-square md:aspect-video">
                {normalizedImages.map((img, idx) => {
                    const isFirst = idx === 0;
                    return renderGridImage(img, idx, `${isFirst ? 'col-span-2 row-span-2' : ''} h-full w-full`);
                })}
            </div>
        );
    } else {
        const gridClass = normalizedImages.length === 1 ? 'grid-cols-1 aspect-video' : normalizedImages.length === 2 ? 'grid-cols-2 aspect-video' : normalizedImages.length === 3 ? 'grid-cols-2 aspect-square' : 'grid-cols-2 aspect-square';
        content = (
            <div className={`grid ${gridClass} gap-1 w-full`}>
                {normalizedImages.slice(0, 4).map((img, idx) => {
                    const isLast = idx === 3 && normalizedImages.length > 4;
                    if (isLast) {
                        return (
                            <div 
                                key={idx} 
                                className="relative overflow-hidden bg-gray-100 dark:bg-slate-800 cursor-pointer group h-full w-full"
                                onClick={() => setIsDetailOpen(true)}
                            >
                                <img src={img.url || undefined} alt={`Post img ${idx}`} className="w-full h-full object-cover opacity-50" referrerPolicy="no-referrer" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-bold text-xl">
                                    +{normalizedImages.length - 4}
                                </div>
                            </div>
                        )
                    }
                    if (normalizedImages.length === 3 && idx === 0) {
                         return renderGridImage(img, idx, 'row-span-2 h-full w-full');
                    }
                    return renderGridImage(img, idx, 'h-full w-full');
                })}
            </div>
        );
    }

    return (
        <>
            <div className={`mt-2 overflow-hidden ${layout === 'list' ? '' : ''}`}>
                {content}
            </div>

            {/* STAGE 2: Post Detail View (White BG, Vertical Scroll) */}
            {isDetailOpen && (
                <div 
                    className="fixed inset-0 md:left-20 z-[100] bg-white dark:bg-slate-900 flex flex-col animate-in fade-in duration-200"
                    onTouchStart={onDetailTouchStart}
                    onTouchEnd={onDetailTouchEnd}
                >
                    <div className="border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20">
                        <div className="flex items-center gap-3 p-3">
                            <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-700 dark:text-slate-300">
                                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-6 h-6" />
                            </button>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 dark:text-white">{post.user.name}</h3>
                                <p className="text-xs text-gray-500 dark:text-slate-400">{post.timestamp}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-slate-950">
                        <div className="bg-white dark:bg-slate-900 mb-2 pb-4">
                            {post.content && (
                                <div className="p-4 text-gray-800 dark:text-slate-200 text-base leading-relaxed font-khmer">
                                    {post.content}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-2 pb-20">
                            {normalizedImages.map((img, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-900 shadow-sm">
                                    <div className="w-full cursor-pointer relative" onClick={() => setPreviewIndex(idx)}>
                                        {isVideo(img.url) ? (
                                            <video 
                                                src={img.url} 
                                                className="w-full h-auto object-cover" 
                                                controls 
                                                playsInline
                                                preload="metadata"
                                            />
                                        ) : (
                                            <img src={img.url || undefined} alt={`Detail ${idx}`} className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
                                        )}
                                    </div>
                                    {img.caption && (
                                        <div className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300 font-khmer">
                                            {img.caption}
                                        </div>
                                    )}
                                    <div className="border-t border-gray-100 dark:border-slate-800 mt-1">
                                        <PostFooter post={post} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* STAGE 3: Lightbox / Black View (Zoomable) */}
            {previewIndex !== null && (
                <div className="fixed inset-0 z-[150] bg-black flex flex-col animate-in fade-in duration-200">
                    <div className={`absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-30 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <button 
                            onClick={() => setPreviewIndex(null)}
                            className="p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-sm"
                        >
                            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-3">
                            <span className="text-white/90 font-medium text-xs bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                {previewIndex + 1} / {normalizedImages.length}
                            </span>
                            <button 
                                onClick={toggleZoom}
                                className="p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-sm"
                            >
                                {isZoomed ? <HugeiconsIcon icon={ZoomOutAreaIcon} strokeWidth={1.5} className="w-6 h-6" /> : <HugeiconsIcon icon={ZoomInAreaIcon} strokeWidth={1.5} className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                    
                    <div 
                        className="flex-1 flex items-center justify-center p-0 relative overflow-hidden"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                        onClick={(e) => { e.stopPropagation(); setShowControls(!showControls); }}
                        onDoubleClick={toggleZoom}
                    >
                        {!isZoomed && (
                            <>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                    className={`hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all z-20 backdrop-blur-sm ${!showControls ? 'opacity-0' : 'opacity-100'}`}
                                >
                                    <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-8 h-8" />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                    className={`hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all z-20 backdrop-blur-sm ${previewIndex === normalizedImages.length - 1 ? 'opacity-30 cursor-default' : (!showControls ? 'opacity-0' : 'opacity-100')}`}
                                    disabled={previewIndex === normalizedImages.length - 1}
                                >
                                    <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="w-8 h-8" />
                                </button>
                            </>
                        )}

                        <div 
                            className={`w-full h-full flex items-center justify-center transition-transform duration-300 ease-out ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                            style={{ transform: isZoomed ? 'scale(2)' : 'scale(1)' }}
                        >
                            {isVideo(normalizedImages[previewIndex].url) ? (
                                <video 
                                    src={normalizedImages[previewIndex].url} 
                                    className="max-w-full max-h-full object-contain"
                                    controls
                                    autoPlay
                                    playsInline
                                    preload="metadata"
                                />
                            ) : (
                                <img 
                                    src={normalizedImages[previewIndex].url || undefined} 
                                    alt="Preview" 
                                    className="max-w-full max-h-full object-contain"
                                    referrerPolicy="no-referrer"
                                />
                            )}
                        </div>
                    </div>

                    {normalizedImages[previewIndex].caption && (
                        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pb-8 text-white z-20 transition-transform duration-300 ${showControls ? 'translate-y-0' : 'translate-y-full'}`}>
                            <p className="text-sm md:text-base font-khmer text-center leading-relaxed">
                                {normalizedImages[previewIndex].caption}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};
