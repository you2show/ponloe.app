import { RotateClockwiseIcon, SlidersHorizontalIcon, ColorsIcon, TextAlignCenterIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { ReloadIcon, FlipHorizontalIcon, Tick01Icon, Cancel01Icon, TextIcon, HappyIcon, Image01Icon, EraserIcon, MoveIcon, Delete02Icon, PenTool01Icon, AlignLeftIcon, AlignRightIcon, CleanIcon } from '@hugeicons/core-free-icons';

import React, { useState, useRef, useEffect } from 'react';


interface ImageEditorProps {
  imageSrc: string;
  onSave: (newImageSrc: string) => void;
  onCancel: () => void;
}

type EditorTool = 'none' | 'filter' | 'adjust' | 'draw' | 'text' | 'sticker' | 'photo';
type TextAlign = 'left' | 'center' | 'right';
type TextEffect = 'none' | 'shadow' | 'outline' | 'background' | 'neon';

interface OverlayItem {
  id: string;
  type: 'text' | 'emoji' | 'image';
  content: string;
  x: number;
  y: number;
  color?: string;
  fontSize?: number;
  scale?: number;
  // Text specific
  fontFamily?: string;
  textAlign?: TextAlign;
  effect?: TextEffect;
  effectColor?: string;
}

const FILTERS = [
    { id: 'none', label: 'Original', filter: 'none' },
    { id: 'vivid', label: 'Vivid', filter: 'saturate(1.5) contrast(1.1)' },
    { id: 'bw', label: 'B&W', filter: 'grayscale(100%)' },
    { id: 'sepia', label: 'Sepia', filter: 'sepia(100%)' },
    { id: 'warm', label: 'Warm', filter: 'sepia(30%) saturate(140%)' },
    { id: 'cool', label: 'Cool', filter: 'hue-rotate(30deg) contrast(110%)' },
    { id: 'dramatic', label: 'Drama', filter: 'contrast(150%) brightness(90%)' },
    { id: 'vintage', label: 'Vintage', filter: 'sepia(50%) contrast(120%) brightness(90%)' },
];

const COLORS = ['#ffffff', '#000000', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#84cc16'];

const EMOJI_CATEGORIES = [
    { title: 'Faces', icons: ['😊', '😂', '😍', '🥰', '😎', '🤔', '😭', '😡', '🤯', '🥳', '😇', '🤠', '🤡', '🤑', '😋', '🤪'] },
    { title: 'Gestures', icons: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '👏', '🙌', '👐', '🤲', '🙏', '💪', '👈', '👉'] },
    { title: 'Symbols', icons: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '❣️', '💕', '💞', '💓', '💯', '💢', '💥', '💫', '💦', '💨'] },
    { title: 'Objects', icons: ['🔥', '✨', '⭐', '🌟', '🌙', '☀️', '🌈', '⚡', '🎈', '🎉', '🎁', '🎂', '🎵', '🎶', '📷', '💡'] },
];

const FONTS = [
    { id: 'Google Sans', label: 'Khmer Sans' },
    { id: 'Khmer OS Muol Light', label: 'Khmer Muol' },
    { id: 'Inter', label: 'English Sans' },
    { id: 'Times New Roman', label: 'Serif' },
    { id: 'Cursive', label: 'Handwriting' },
    { id: 'Amiri', label: 'Arabic' },
];

export const ImageEditor: React.FC<ImageEditorProps> = ({ imageSrc, onSave, onCancel }) => {
  // --- Refs ---
  const containerRef = useRef<HTMLDivElement>(null);
  const baseImageRef = useRef<HTMLImageElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- State: Core ---
  const [activeTool, setActiveTool] = useState<EditorTool>('none');
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [activeFilter, setActiveFilter] = useState('none');
  
  // --- State: Drawing ---
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(5);
  
  // --- State: Overlays ---
  const [overlays, setOverlays] = useState<OverlayItem[]>([]);
  const [activeOverlayId, setActiveOverlayId] = useState<string | null>(null);
  
  // --- State: Text Editor ---
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textBgColor, setTextBgColor] = useState('transparent');
  const [textFont, setTextFont] = useState('Google Sans');
  const [textAlign, setTextAlign] = useState<TextAlign>('center');
  const [textEffect, setTextEffect] = useState<TextEffect>('none');
  const [textSize, setTextSize] = useState(24);
  const [textTab, setTextTab] = useState<'style' | 'color' | 'font'>('font');

  // --- Initialization ---
  useEffect(() => {
    if (baseImageRef.current && drawingCanvasRef.current && containerRef.current) {
       const resizeCanvas = () => {
          if (drawingCanvasRef.current && containerRef.current) {
             drawingCanvasRef.current.width = containerRef.current.clientWidth;
             drawingCanvasRef.current.height = containerRef.current.clientHeight;
          }
       };
       setTimeout(resizeCanvas, 100);
       window.addEventListener('resize', resizeCanvas);
       return () => window.removeEventListener('resize', resizeCanvas);
    }
  }, [imageSrc]);

  // --- Drawing Logic ---
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTool !== 'draw') return;
    setIsDrawing(true);
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = brushColor;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || activeTool !== 'draw') return;
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearDrawing = () => {
      const canvas = drawingCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // --- Overlay Logic ---
  const openTextEditor = () => {
      setTextInput('');
      setTextColor('#ffffff');
      setTextFont('Google Sans');
      setTextAlign('center');
      setTextEffect('none');
      setShowTextInput(true);
      setActiveTool('text');
  }

  const addText = () => {
      if (!textInput.trim()) return;
      const newText: OverlayItem = {
          id: Date.now().toString(),
          type: 'text',
          content: textInput,
          x: 50, // Percent
          y: 50, // Percent
          color: textColor,
          fontSize: textSize,
          fontFamily: textFont,
          textAlign: textAlign,
          effect: textEffect,
      };
      setOverlays([...overlays, newText]);
      setShowTextInput(false);
      setActiveTool('none');
  };

  const addEmoji = (emoji: string) => {
      const newEmoji: OverlayItem = {
          id: Date.now().toString(),
          type: 'emoji',
          content: emoji,
          x: 50,
          y: 50,
          fontSize: 60
      };
      setOverlays([...overlays, newEmoji]);
      // Keep sticker drawer open for multiple adds
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if (ev.target?.result) {
                  const newPhoto: OverlayItem = {
                      id: Date.now().toString(),
                      type: 'image',
                      content: ev.target.result as string,
                      x: 50,
                      y: 50,
                      scale: 150 // width px (approx)
                  };
                  setOverlays([...overlays, newPhoto]);
                  setActiveTool('none');
              }
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const removeOverlay = (id: string) => {
      setOverlays(overlays.filter(o => o.id !== id));
      setActiveOverlayId(null);
  };

  // --- Dragging Overlays ---
  const handleDragOverlay = (e: React.MouseEvent | React.TouchEvent, id: string) => {
      if (activeTool === 'draw') return;
      setActiveOverlayId(id);
      
      const container = containerRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      
      const moveHandler = (moveEvent: MouseEvent | TouchEvent) => {
          const clientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
          const clientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
          
          let x = ((clientX - rect.left) / rect.width) * 100;
          let y = ((clientY - rect.top) / rect.height) * 100;
          
          x = Math.max(0, Math.min(100, x));
          y = Math.max(0, Math.min(100, y));

          setOverlays(prev => prev.map(o => o.id === id ? { ...o, x, y } : o));
      };

      const upHandler = () => {
          document.removeEventListener('mousemove', moveHandler);
          document.removeEventListener('mouseup', upHandler);
          document.removeEventListener('touchmove', moveHandler);
          document.removeEventListener('touchend', upHandler);
      };

      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', upHandler);
      document.addEventListener('touchmove', moveHandler);
      document.addEventListener('touchend', upHandler);
  };

  // --- Save Logic ---
  const handleSave = async () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const baseImg = baseImageRef.current;
      
      if (!ctx || !baseImg) return;

      const width = baseImg.naturalWidth;
      const height = baseImg.naturalHeight;
      canvas.width = width;
      canvas.height = height;

      // 1. Draw Base Image
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, 1);
      ctx.filter = activeFilter !== 'none' ? FILTERS.find(f => f.id === activeFilter)?.filter || 'none' : 'none';
      
      if (rotation % 180 !== 0) {
          ctx.drawImage(baseImg, -height / 2, -width / 2, height, width);
      } else {
          ctx.drawImage(baseImg, -width / 2, -height / 2, width, height);
      }
      ctx.restore();

      // 2. Draw Drawing Layer
      if (drawingCanvasRef.current) {
          ctx.drawImage(drawingCanvasRef.current, 0, 0, width, height);
      }

      // 3. Draw Overlays
      overlays.forEach(overlay => {
          const x = (overlay.x / 100) * width;
          const y = (overlay.y / 100) * height;

          ctx.save();
          if (overlay.type === 'text' || overlay.type === 'emoji') {
              const scaleFactor = width / (containerRef.current?.clientWidth || 1);
              const fontSize = (overlay.fontSize || 24) * scaleFactor;
              
              // Ensure font is loaded/available contextually
              ctx.font = `bold ${fontSize}px ${overlay.fontFamily || 'sans-serif'}`;
              ctx.textAlign = overlay.textAlign || 'center' as CanvasTextAlign;
              ctx.textBaseline = 'middle';

              // Effects logic for Canvas
              if (overlay.effect === 'shadow') {
                  ctx.shadowColor = 'rgba(0,0,0,0.8)';
                  ctx.shadowBlur = 4;
                  ctx.shadowOffsetX = 2;
                  ctx.shadowOffsetY = 2;
              } else if (overlay.effect === 'neon') {
                  ctx.shadowColor = overlay.color || '#fff';
                  ctx.shadowBlur = 10;
              } else if (overlay.effect === 'outline') {
                  ctx.strokeStyle = 'black';
                  ctx.lineWidth = fontSize / 15;
                  ctx.strokeText(overlay.content, x, y);
              } else if (overlay.effect === 'background') {
                  const metrics = ctx.measureText(overlay.content);
                  const bgHeight = fontSize * 1.2;
                  ctx.fillStyle = 'rgba(0,0,0,0.5)';
                  ctx.fillRect(x - metrics.width/2 - 10, y - bgHeight/2, metrics.width + 20, bgHeight);
              }

              ctx.fillStyle = overlay.color || '#ffffff';
              ctx.fillText(overlay.content, x, y);
          } else if (overlay.type === 'image') {
              const img = new Image();
              img.src = overlay.content;
              const scaleFactor = width / (containerRef.current?.clientWidth || 1);
              const imgW = (overlay.scale || 100) * scaleFactor;
              const imgH = (imgW / img.width) * img.height;
              ctx.drawImage(img, x - imgW/2, y - imgH/2, imgW, imgH);
          }
          ctx.restore();
      });

      onSave(canvas.toDataURL('image/jpeg', 0.9));
  };

  return (
    <div className="flex flex-col h-full bg-black text-white overflow-hidden relative font-khmer">
        
        {/* --- Top Bar --- */}
        <div className="flex justify-between items-center px-4 py-3 bg-black z-50 shrink-0">
            <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-6 h-6" />
            </button>
            <div className="flex gap-4">
               {activeTool !== 'none' && (
                   <button onClick={() => setActiveTool('none')} className="text-sm font-bold text-gray-400 hover:text-white flex items-center gap-1">
                       <HugeiconsIcon icon={Tick01Icon} strokeWidth={1.5} className="w-4 h-4" /> Done
                   </button>
               )}
               <button 
                    onClick={handleSave} 
                    className="px-6 py-1.5 bg-white text-black font-bold rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                    រក្សាទុក
                </button>
            </div>
        </div>

        {/* --- Canvas Area --- */}
        <div className="flex-1 relative overflow-hidden bg-[#101112] flex items-center justify-center p-4">
            <div 
                ref={containerRef}
                className="relative shadow-2xl max-w-full max-h-full"
                style={{ 
                    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
                    transition: 'transform 0.2s ease-out'
                }}
            >
                <img referrerPolicy="no-referrer" ref={baseImageRef}
                    src={imageSrc || undefined} 
                    alt="Edit" 
                    className="max-w-full max-h-[70vh] object-contain block"
                    style={{ filter: activeFilter !== 'none' ? FILTERS.find(f => f.id === activeFilter)?.filter : 'none' }}
                />

                <canvas 
                    ref={drawingCanvasRef}
                    className="absolute inset-0 w-full h-full touch-none"
                    style={{ pointerEvents: activeTool === 'draw' ? 'auto' : 'none' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />

                {overlays.map(overlay => (
                    <div
                        key={overlay.id}
                        className={`absolute flex items-center justify-center cursor-move select-none transition-transform ${activeOverlayId === overlay.id ? 'ring-2 ring-white ring-dashed rounded-lg p-1' : ''}`}
                        style={{
                            left: `${overlay.x}%`,
                            top: `${overlay.y}%`,
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: activeTool === 'draw' ? 'none' : 'auto'
                        }}
                        onMouseDown={(e) => handleDragOverlay(e, overlay.id)}
                        onTouchStart={(e) => handleDragOverlay(e, overlay.id)}
                    >
                        {overlay.type === 'text' && (
                            <span 
                                style={{ 
                                    color: overlay.color, 
                                    fontSize: `${overlay.fontSize}px`, 
                                    fontFamily: overlay.fontFamily,
                                    fontWeight: 'bold',
                                    textAlign: overlay.textAlign,
                                    textShadow: overlay.effect === 'shadow' ? '2px 2px 4px rgba(0,0,0,0.8)' : overlay.effect === 'neon' ? `0 0 10px ${overlay.color}` : 'none',
                                    WebkitTextStroke: overlay.effect === 'outline' ? '1px black' : 'none',
                                    backgroundColor: overlay.effect === 'background' ? 'rgba(0,0,0,0.5)' : 'transparent',
                                    padding: overlay.effect === 'background' ? '4px 8px' : '0',
                                    borderRadius: '4px',
                                    whiteSpace: 'pre-wrap',
                                }}
                            >
                                {overlay.content}
                            </span>
                        )}
                        {overlay.type === 'emoji' && (
                            <span style={{ fontSize: `${overlay.fontSize}px` }}>{overlay.content}</span>
                        )}
                        {overlay.type === 'image' && (
                            <img referrerPolicy="no-referrer" src={overlay.content || undefined} alt="overlay" style={{ width: `${overlay.scale}px`, pointerEvents: 'none' }} />
                        )}
                        {activeOverlayId === overlay.id && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); removeOverlay(overlay.id); }}
                                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-sm transform scale-75 hover:scale-100 transition-transform"
                            >
                                <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.5} className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* --- Tools & Panels --- */}
        <div className="bg-black pb-safe pt-2 z-50 shrink-0">
            
            {/* Sub-Toolbar (Context Sensitive) */}
            <div className="min-h-16 flex items-center justify-center border-b border-gray-800 mb-2 relative">
                
                {/* Filters: Show Image Previews */}
                {activeTool === 'filter' && (
                    <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 w-full justify-start md:justify-center py-2">
                        {FILTERS.map(f => (
                            <button 
                                key={f.id} 
                                onClick={() => setActiveFilter(f.id)}
                                className={`flex flex-col items-center gap-1 shrink-0 ${activeFilter === f.id ? 'text-white scale-105' : 'text-gray-500'} transition-transform`}
                            >
                                <div className={`w-16 h-16 rounded-md overflow-hidden border-2 ${activeFilter === f.id ? 'border-white' : 'border-gray-800'}`}>
                                    <img referrerPolicy="no-referrer" src={imageSrc || undefined} 
                                        className="w-full h-full object-cover" 
                                        style={{ filter: f.filter }}
                                        alt={f.label}
                                    />
                                </div>
                                <span className="text-[10px] mt-1">{f.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Adjust/Transform */}
                {activeTool === 'adjust' && (
                    <div className="flex gap-8">
                        <button onClick={() => setRotation(r => r - 90)}><HugeiconsIcon icon={ReloadIcon} strokeWidth={1.5} className="w-6 h-6 text-white"/></button>
                        <button onClick={() => setRotation(r => r + 90)}><HugeiconsIcon icon={RotateClockwiseIcon} strokeWidth={1.5} className="w-6 h-6 text-white"/></button>
                        <button onClick={() => setFlipH(!flipH)}><HugeiconsIcon icon={FlipHorizontalIcon} strokeWidth={1.5} className={`w-6 h-6 ${flipH ? 'text-blue-500' : 'text-white'}`}/></button>
                    </div>
                )}

                {/* Draw: Clean Slider & Colors */}
                {activeTool === 'draw' && (
                    <div className="flex flex-col w-full px-4 gap-3 py-2">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-gray-400">Size</span>
                            <input 
                                type="range" min="1" max="30" 
                                value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                className="flex-1 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white"
                            />
                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-black font-bold text-xs">{brushSize}</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={clearDrawing} className="text-xs text-red-500 font-bold px-2 py-1 bg-red-500/10 rounded">CLEAR</button>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
                                {COLORS.map(c => (
                                    <button 
                                        key={c} 
                                        onClick={() => setBrushColor(c)}
                                        className={`w-6 h-6 rounded-full border-2 shrink-0 ${brushColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Toolbar */}
            <div className="flex justify-between px-6 pb-4">
                <button onClick={() => setActiveTool('filter')} className={`flex flex-col items-center gap-1 ${activeTool === 'filter' ? 'text-white' : 'text-gray-500'}`}>
                    <HugeiconsIcon icon={SlidersHorizontalIcon} strokeWidth={1.5} className="w-6 h-6" />
                    <span className="text-[10px]">Filter</span>
                </button>
                
                <button onClick={() => setActiveTool('adjust')} className={`flex flex-col items-center gap-1 ${activeTool === 'adjust' ? 'text-white' : 'text-gray-500'}`}>
                    <HugeiconsIcon icon={MoveIcon} strokeWidth={1.5} className="w-6 h-6" />
                    <span className="text-[10px]">Adjust</span>
                </button>

                <button onClick={() => setActiveTool('draw')} className={`flex flex-col items-center gap-1 ${activeTool === 'draw' ? 'text-white' : 'text-gray-500'}`}>
                    <HugeiconsIcon icon={PenTool01Icon} strokeWidth={1.5} className="w-6 h-6" />
                    <span className="text-[10px]">Draw</span>
                </button>

                <button onClick={openTextEditor} className={`flex flex-col items-center gap-1 ${activeTool === 'text' ? 'text-white' : 'text-gray-500'}`}>
                    <HugeiconsIcon icon={TextIcon} strokeWidth={1.5} className="w-6 h-6" />
                    <span className="text-[10px]">Text</span>
                </button>

                <button onClick={() => setActiveTool('sticker')} className={`flex flex-col items-center gap-1 ${activeTool === 'sticker' ? 'text-white' : 'text-gray-500'}`}>
                    <HugeiconsIcon icon={HappyIcon} strokeWidth={1.5} className="w-6 h-6" />
                    <span className="text-[10px]">Sticker</span>
                </button>

                <label className={`flex flex-col items-center gap-1 text-gray-500 cursor-pointer hover:text-white`}>
                    <HugeiconsIcon icon={Image01Icon} strokeWidth={1.5} className="w-6 h-6" />
                    <span className="text-[10px]">Photo</span>
                    <input type="file" className="hidden" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} />
                </label>
            </div>
        </div>

        {/* Sticker: Grid Overlay Trigger (Moved outside to Root for better Z-Index handling) */}
        {activeTool === 'sticker' && (
            <div className="absolute inset-x-0 bottom-0 z-[60] bg-[#101112] rounded-t-3xl border-t border-gray-800 animate-in slide-in-from-bottom duration-300 flex flex-col h-[40%]">
                <div className="flex justify-between items-center p-4 border-b border-gray-800">
                    <span className="font-bold ml-2 text-white">Stickers</span>
                    <button onClick={() => setActiveTool('none')} className="p-1 bg-gray-800 rounded-full hover:bg-gray-700 text-white"><HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5"/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {EMOJI_CATEGORIES.map(cat => (
                        <div key={cat.title} className="mb-6">
                            <h5 className="text-xs text-gray-500 mb-3 font-bold uppercase tracking-wider">{cat.title}</h5>
                            <div className="grid grid-cols-6 gap-2">
                                {cat.icons.map(e => (
                                    <button 
                                        key={e} 
                                        onClick={() => addEmoji(e)} 
                                        className="text-3xl hover:scale-125 transition-transform p-3 bg-gray-900/50 rounded-xl hover:bg-gray-800"
                                    >
                                        {e}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- Advanced Text Input Modal --- */}
        {showTextInput && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[70] flex flex-col animate-in fade-in duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-4">
                    <button onClick={() => setShowTextInput(false)} className="text-white hover:bg-white/10 px-3 py-1 rounded-full transition-colors">Cancel</button>
                    <button onClick={addText} className="text-white font-bold bg-emerald-600 px-6 py-2 rounded-full hover:bg-emerald-700 transition-colors">Done</button>
                </div>

                {/* Input Area */}
                <div className="flex-1 flex items-center justify-center p-4">
                    <textarea 
                        autoFocus
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Type something..."
                        className="bg-transparent text-center outline-none w-full resize-none overflow-hidden placeholder-white/50"
                        style={{ 
                            color: textColor,
                            fontSize: `${textSize}px`,
                            fontFamily: textFont,
                            textAlign: textAlign,
                            textShadow: textEffect === 'shadow' ? '2px 2px 4px rgba(0,0,0,0.8)' : textEffect === 'neon' ? `0 0 10px ${textColor}` : 'none',
                            WebkitTextStroke: textEffect === 'outline' ? '1px white' : 'none',
                            backgroundColor: textEffect === 'background' ? 'rgba(0,0,0,0.5)' : 'transparent',
                            borderRadius: '8px',
                            padding: '10px'
                        }}
                    />
                </div>

                {/* Text Controls Toolbar */}
                <div className="bg-[#18191b] border-t border-gray-800 pb-safe">
                    {/* Top Row: Font/Color/Style Toggles */}
                    <div className="flex justify-center gap-6 py-3 border-b border-gray-800">
                        <button onClick={() => setTextTab('font')} className={`flex flex-col items-center gap-1 ${textTab === 'font' ? 'text-white' : 'text-gray-500'}`}>
                            <HugeiconsIcon icon={TextIcon} strokeWidth={1.5} className="w-5 h-5" /> <span className="text-[10px]">Font</span>
                        </button>
                        <button onClick={() => setTextTab('color')} className={`flex flex-col items-center gap-1 ${textTab === 'color' ? 'text-white' : 'text-gray-500'}`}>
                            <HugeiconsIcon icon={ColorsIcon} strokeWidth={1.5} className="w-5 h-5" /> <span className="text-[10px]">Color</span>
                        </button>
                        <button onClick={() => setTextTab('style')} className={`flex flex-col items-center gap-1 ${textTab === 'style' ? 'text-white' : 'text-gray-500'}`}>
                            <HugeiconsIcon icon={CleanIcon} strokeWidth={1.5} className="w-5 h-5" /> <span className="text-[10px]">Style</span>
                        </button>
                    </div>

                    {/* Bottom Row: Dynamic Content based on Tab */}
                    <div className="p-4 h-36">
                        {textTab === 'font' && (
                            <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
                                {FONTS.map(font => (
                                    <button 
                                        key={font.id} 
                                        onClick={() => setTextFont(font.id)}
                                        className={`px-4 py-2 rounded-lg border whitespace-nowrap ${textFont === font.id ? 'bg-white text-black border-white' : 'border-gray-700 text-gray-300'}`}
                                        style={{ fontFamily: font.id }}
                                    >
                                        {font.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {textTab === 'color' && (
                            <div className="flex gap-4 overflow-x-auto no-scrollbar items-center py-2">
                                {COLORS.map(c => (
                                    <button 
                                        key={c} 
                                        onClick={() => setTextColor(c)}
                                        className={`w-10 h-10 rounded-full border-2 shrink-0 ${textColor === c ? 'border-white scale-125' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        )}

                        {textTab === 'style' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-gray-800 p-2 rounded-lg">
                                    <div className="flex gap-2">
                                        <button onClick={() => setTextAlign('left')} className={`p-2 rounded ${textAlign === 'left' ? 'bg-gray-600 text-white' : 'text-gray-400'}`}><HugeiconsIcon icon={AlignLeftIcon} strokeWidth={1.5} className="w-4 h-4"/></button>
                                        <button onClick={() => setTextAlign('center')} className={`p-2 rounded ${textAlign === 'center' ? 'bg-gray-600 text-white' : 'text-gray-400'}`}><HugeiconsIcon icon={TextAlignCenterIcon} strokeWidth={1.5} className="w-4 h-4"/></button>
                                        <button onClick={() => setTextAlign('right')} className={`p-2 rounded ${textAlign === 'right' ? 'bg-gray-600 text-white' : 'text-gray-400'}`}><HugeiconsIcon icon={AlignRightIcon} strokeWidth={1.5} className="w-4 h-4"/></button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setTextSize(s => Math.max(12, s-2))} className="w-8 h-8 bg-gray-700 rounded text-white hover:bg-gray-600">-</button>
                                        <span className="text-white text-sm my-auto w-8 text-center">{textSize}</span>
                                        <button onClick={() => setTextSize(s => Math.min(80, s+2))} className="w-8 h-8 bg-gray-700 rounded text-white hover:bg-gray-600">+</button>
                                    </div>
                                </div>
                                
                                <div className="flex gap-3 overflow-x-auto no-scrollbar">
                                    <button onClick={() => setTextEffect('none')} className={`px-4 py-1.5 rounded border whitespace-nowrap ${textEffect === 'none' ? 'bg-white text-black' : 'border-gray-600 text-gray-300'}`}>None</button>
                                    <button onClick={() => setTextEffect('shadow')} className={`px-4 py-1.5 rounded border whitespace-nowrap ${textEffect === 'shadow' ? 'bg-white text-black' : 'border-gray-600 text-gray-300'}`}>Shadow</button>
                                    <button onClick={() => setTextEffect('outline')} className={`px-4 py-1.5 rounded border whitespace-nowrap ${textEffect === 'outline' ? 'bg-white text-black' : 'border-gray-600 text-gray-300'}`}>Outline</button>
                                    <button onClick={() => setTextEffect('background')} className={`px-4 py-1.5 rounded border whitespace-nowrap ${textEffect === 'background' ? 'bg-white text-black' : 'border-gray-600 text-gray-300'}`}>Box</button>
                                    <button onClick={() => setTextEffect('neon')} className={`px-4 py-1.5 rounded border whitespace-nowrap ${textEffect === 'neon' ? 'bg-white text-black' : 'border-gray-600 text-gray-300'}`}>Neon</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

    </div>
  );
};
