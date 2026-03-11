import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Add01Icon, DragDropHorizontalIcon, ViewIcon, PlayIcon, PauseIcon } from '@hugeicons/core-free-icons';

import React, { useRef, useState } from 'react';

import { ImageLayoutType } from './ImageLayoutSelector';

interface ImageGridProps {
  images: string[];
  layout: ImageLayoutType;
  onRemove: (index: number) => void;
  onReorder: (newImages: string[]) => void;
  onPreview: (index: number) => void;
  onAddMore: () => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({ 
  images, layout, onRemove, onReorder, onPreview, onAddMore 
}) => {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [playingVideo, setPlayingVideo] = useState<number | null>(null);

  // --- Drag and Drop Logic ---
  const handleDragStart = (e: React.DragEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
    setIsDragging(true);
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
    
    if (dragItem.current !== null && dragItem.current !== position) {
        const _images = [...images];
        const draggedItemContent = _images[dragItem.current];
        _images.splice(dragItem.current, 1);
        _images.splice(position, 0, draggedItemContent);
        
        dragItem.current = position;
        onReorder(_images);
    }
  };

  const handleDragEnd = () => {
    dragItem.current = null;
    dragOverItem.current = null;
    setIsDragging(false);
  };

  const handleVideoPlayToggle = (e: React.MouseEvent, idx: number, videoElement: HTMLVideoElement | null) => {
    e.stopPropagation();
    if (!videoElement) return;

    if (playingVideo === idx) {
        videoElement.pause();
        setPlayingVideo(null);
    } else {
        // Pause any currently playing video
        if (playingVideo !== null) {
            const prevVideo = document.getElementById(`preview-video-${playingVideo}`) as HTMLVideoElement;
            if (prevVideo) prevVideo.pause();
        }
        videoElement.play();
        setPlayingVideo(idx);
    }
  };

  // --- Layout Styles Configuration ---
  const getContainerClass = () => {
    switch (layout) {
      case 'carousel':
        return 'flex gap-2 overflow-x-auto snap-x pb-2 no-scrollbar w-full';
      case 'list':
        return 'flex flex-col gap-2 w-full';
      case 'featured':
        // Using grid-flow-dense to pack items tighter if possible
        return 'grid grid-cols-2 gap-2 w-full';
      case 'grid':
      default:
        // Standard grid
        return `grid gap-2 w-full ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`;
    }
  };

  const getItemClass = (idx: number) => {
    const base = `relative group rounded-xl overflow-hidden bg-gray-100 border border-gray-200 transition-all duration-200 ${isDragging && dragItem.current === idx ? 'opacity-50 scale-95 ring-2 ring-emerald-500' : 'opacity-100'}`;
    
    if (layout === 'carousel') {
      return `${base} min-w-[200px] w-[200px] h-[250px] snap-center shrink-0`;
    }
    
    if (layout === 'list') {
      return `${base} w-full aspect-[21/9]`;
    }

    if (layout === 'featured') {
      // First item spans full width if it's featured mode
      if (idx === 0) return `${base} col-span-2 aspect-video`;
      return `${base} aspect-square`;
    }

    // Default Grid
    return `${base} ${images.length === 1 ? 'aspect-video' : 'aspect-square'}`;
  };

  return (
    <div className="mt-2 mb-4 w-full select-none">
        
        <div className={getContainerClass()}>
            {images.map((img, idx) => (
                <div 
                    key={idx} // Using Index as key because string URLs might duplicate during drag preview if not careful
                    className={getItemClass(idx)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragEnter={(e) => handleDragEnter(e, idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => onPreview(idx)}
                >
                    {(img.match(/\.(mp4|webm|ogg|mov)$/i) || img.startsWith('blob:') || img.includes('/api/video/')) ? (
                        <>
                            <video 
                                id={`preview-video-${idx}`}
                                src={img} 
                                className="w-full h-full object-cover"
                                playsInline
                                loop
                                preload="metadata"
                                onEnded={() => setPlayingVideo(null)}
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <button 
                                    onClick={(e) => handleVideoPlayToggle(e, idx, document.getElementById(`preview-video-${idx}`) as HTMLVideoElement)}
                                    className={`w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-opacity pointer-events-auto ${playingVideo === idx ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}
                                >
                                    <HugeiconsIcon icon={playingVideo === idx ? PauseIcon : PlayIcon} strokeWidth={1.5} className="w-6 h-6 fill-white" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <img referrerPolicy="no-referrer" src={img || undefined} 
                            alt={`Selected ${idx}`} 
                            className="w-full h-full object-cover pointer-events-none"
                        />
                    )}
                    
                    {/* Controls Overlay */}
                    <div className={`absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex flex-col justify-between p-2 pointer-events-none ${playingVideo === idx ? 'opacity-0' : 'opacity-100'}`}>
                        <div className="flex justify-between items-start pointer-events-auto">
                            {/* Drag Handle */}
                            <div 
                                className="p-1.5 bg-black/40 text-white rounded cursor-move backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <HugeiconsIcon icon={DragDropHorizontalIcon} strokeWidth={1.5} className="w-4 h-4" />
                            </div>
                            
                            {/* Remove Button */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); onRemove(idx); }} 
                                className="p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-md transition-colors shadow-sm"
                            >
                                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Preview Indicator */}
                        <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/40 p-2 rounded-full backdrop-blur-sm text-white">
                                <HugeiconsIcon icon={ViewIcon} strokeWidth={1.5} className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Index Badge */}
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm pointer-events-none">
                        {idx + 1}
                    </div>
                </div>
            ))}
            
            {/* Add More Button (Inside Carousel if carousel, or outside if grid) */}
            {layout === 'carousel' && (
                 <button 
                    onClick={onAddMore}
                    className="min-w-[100px] h-[250px] rounded-xl border-2 border-dashed border-gray-200 text-gray-400 font-bold hover:bg-gray-50 hover:border-emerald-200 hover:text-emerald-600 transition-all flex flex-col items-center justify-center gap-2 snap-center shrink-0"
                >
                    <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} className="w-6 h-6" />
                    <span className="text-xs">បន្ថែម</span>
                </button>
            )}
        </div>

        {/* Add More Button (Bottom for non-carousel) */}
        {layout !== 'carousel' && (
            <button 
                onClick={onAddMore}
                className="w-full py-3 mt-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-bold hover:bg-gray-50 hover:border-emerald-200 hover:text-emerald-600 transition-all flex items-center justify-center gap-2"
            >
                <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} className="w-5 h-5" />
                បន្ថែមរូបភាពទៀត
            </button>
        )}
    </div>
  );
};
