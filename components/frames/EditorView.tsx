import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, ArrowLeft01Icon, Download01Icon, Layers01Icon, MoreHorizontalIcon, MoveIcon, ReloadIcon, Share01Icon, SlidersHorizontalIcon, Sun01Icon, TextIcon, Upload01Icon, ZoomInAreaIcon } from '@hugeicons/core-free-icons';


import React, { useState, useRef, useEffect } from 'react';

import { Frame, INITIAL_FRAMES } from './shared';

type Tab = 'frames' | 'transform' | 'adjust' | 'text';

interface EditorViewProps {
  initialFrame: Frame;
  onBack: () => void;
}

export const EditorView: React.FC<EditorViewProps> = ({ initialFrame, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>('frames');
  
  const [frames, setFrames] = useState<Frame[]>(INITIAL_FRAMES);
  
  const [frameUrl, setFrameUrl] = useState<string>(initialFrame.src);
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState<{x: number, y: number}>({ x: 0, y: 0 });

  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  
  const [customText, setCustomText] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [textY, setTextY] = useState<number>(800);
  const [textSize, setTextSize] = useState<number>(60);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{x: number, y: number}>({ x: 0, y: 0 });
  
  const [frameImg, setFrameImg] = useState<HTMLImageElement | null>(null);
  const [userImg, setUserImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = frameUrl;
    img.crossOrigin = "anonymous";
    img.onload = () => setFrameImg(img);
  }, [frameUrl]);

  useEffect(() => {
    if (userImageUrl) {
      const img = new Image();
      img.src = userImageUrl;
      img.onload = () => {
        setUserImg(img);
        setPosition({ x: 0, y: 0 });
        setScale(1);
        setRotation(0);
        setBrightness(100);
        setContrast(100);
      };
    }
  }, [userImageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 1080; 
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    if (userImg) {
      ctx.save();
      ctx.translate(size / 2 + position.x, size / 2 + position.y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.drawImage(userImg, -userImg.width / 2, -userImg.height / 2);
      ctx.restore();
    } else {
        ctx.fillStyle = "#f3f4f6";
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = "#9ca3af";
        ctx.font = "bold 60px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Upload Photo", size/2, size/2);
    }

    if (frameImg) {
      ctx.drawImage(frameImg, 0, 0, size, size);
    }

    if (customText) {
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 10;
      ctx.fillStyle = textColor;
      ctx.font = `bold ${textSize}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(customText, size/2, textY);
      ctx.restore();
    }

  }, [frameImg, userImg, scale, rotation, position, brightness, contrast, customText, textColor, textY, textSize]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setUserImageUrl(ev.target.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const newFrame: Frame = {
            id: Date.now(),
            name: file.name.split('.')[0],
            category: 'custom',
            src: ev.target.result as string,
            creator: "You",
            supporters: "0"
          };
          setFrames(prev => [newFrame, ...prev]);
          setFrameUrl(newFrame.src);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `ponloe-frame-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if(!userImg) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !userImg) return;
    const multiplier = 3; 
    const dx = (e.clientX - dragStart.x) * multiplier;
    const dy = (e.clientY - dragStart.y) * multiplier;
    setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-64px)] -m-4 md:-m-8 animate-in slide-in-from-right-4 duration-300 bg-gray-50">
      
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-4 py-3 border-b border-gray-200 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-3">
             <button 
                onClick={onBack} 
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
             >
                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-5 h-5" />
             </button>
             <h3 className="font-semibold text-gray-900 hidden sm:block truncate max-w-[200px]">{initialFrame.name}</h3>
         </div>
         <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700">
               <HugeiconsIcon icon={Share01Icon} strokeWidth={1.5} className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700">
               <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.5} className="w-5 h-5" />
            </button>
         </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 md:p-6 overflow-hidden">
        {/* Left: Canvas Area */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
          <div className="flex-1 bg-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
              <div className="relative w-full max-w-[500px] aspect-square shadow-2xl rounded-lg overflow-hidden bg-white">
                  <canvas
                      ref={canvasRef}
                      className={`w-full h-full touch-none ${userImg ? 'cursor-move' : 'cursor-pointer'}`}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={() => setIsDragging(false)}
                      onPointerLeave={() => setIsDragging(false)}
                      onClick={() => !userImg && document.getElementById('photo-upload')?.click()}
                  />
              </div>
              
              {userImg && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-gray-200 flex items-center gap-3 w-64 z-10">
                      <HugeiconsIcon icon={ZoomInAreaIcon} strokeWidth={1.5} className="w-4 h-4 text-gray-500" />
                      <input 
                          type="range" min="0.1" max="3" step="0.05" 
                          value={scale} onChange={(e) => setScale(parseFloat(e.target.value))}
                          className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                  </div>
              )}
          </div>
        </div>

        {/* Right: Controls Area */}
        <div className="w-full lg:w-[400px] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden shrink-0 h-full max-h-full">
          <div className="p-4 border-b border-gray-100 flex gap-3 shrink-0">
              <label className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl cursor-pointer transition-colors">
                  <HugeiconsIcon icon={Upload01Icon} strokeWidth={1.5} className="w-4 h-4" /> <span>Upload</span>
                  <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              <button onClick={handleDownload} disabled={!userImageUrl} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors">
                  <HugeiconsIcon icon={Download01Icon} strokeWidth={1.5} className="w-4 h-4" /> <span>Save</span>
              </button>
          </div>

          <div className="flex border-b border-gray-100 shrink-0">
              {[{ id: 'frames', icon: Layers01Icon, label: 'Frames' }, { id: 'transform', icon: MoveIcon, label: 'Edit' }, { id: 'adjust', icon: SlidersHorizontalIcon, label: 'Adjust' }, { id: 'text', icon: TextIcon, label: 'Text' }].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)} className={`flex-1 py-4 flex flex-col items-center gap-1 text-[10px] font-semibold uppercase tracking-wide transition-colors ${activeTab === tab.id ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-400 hover:text-gray-600'}`}>
                      <HugeiconsIcon icon={tab.icon} strokeWidth={1.5} className="w-5 h-5" /> {tab.label}
                  </button>
              ))}
          </div>

          <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50">
              {activeTab === 'frames' && (
                  <div className="space-y-6">
                      <div className="flex gap-2 items-center">
                         <h3 className="text-xs font-semibold text-gray-500 uppercase flex-1">Selected Frame</h3>
                          <label className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer shadow-sm transition-colors">
                              <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} className="w-4 h-4" />
                              <input type="file" accept="image/png,image/svg+xml" onChange={handleFrameUpload} className="hidden" />
                          </label>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                          {frames.map((frame) => (
                              <button key={frame.id} onClick={() => setFrameUrl(frame.src)} className={`relative aspect-square rounded-xl border-2 overflow-hidden transition-all group bg-white ${frameUrl === frame.src ? 'border-indigo-600 ring-2 ring-indigo-100 shadow-md' : 'border-gray-200 hover:border-indigo-300'}`}>
                                  <img referrerPolicy="no-referrer" src={frame.src} alt={frame.name} className="w-full h-full object-cover" />
                              </button>
                          ))}
                      </div>
                  </div>
              )}
              {activeTab === 'transform' && (
                  <div className="space-y-6">
                      {!userImageUrl && <p className="text-center text-gray-400 text-sm mt-10">Please upload a photo first.</p>}
                      {userImageUrl && (
                          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                              <div className="flex justify-between mb-2">
                                  <label className="text-xs font-semibold text-gray-500 uppercase">Rotation</label>
                                  <span className="text-xs text-indigo-600 font-mono">{Math.round(rotation)}°</span>
                              </div>
                              <input type="range" min="-180" max="180" value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                          </div>
                      )}
                  </div>
              )}
              {activeTab === 'adjust' && userImageUrl && (
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
                      <input type="range" min="0" max="200" value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="w-full" />
                      <input type="range" min="0" max="200" value={contrast} onChange={(e) => setContrast(parseInt(e.target.value))} className="w-full" />
                      <button onClick={() => { setBrightness(100); setContrast(100); }} className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-red-500 py-2"><HugeiconsIcon icon={ReloadIcon} strokeWidth={1.5} className="w-3 h-3" /> Reset</button>
                  </div>
              )}
              {activeTab === 'text' && (
                  <div className="space-y-4">
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
                          <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Caption Text</label>
                              <input 
                                  type="text"
                                  value={customText}
                                  onChange={(e) => setCustomText(e.target.value)}
                                  placeholder="Enter name or #hashtag"
                                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                              />
                          </div>

                          <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Text Color</label>
                              <div className="flex gap-2 flex-wrap">
                                  {['#ffffff', '#000000', '#dc2626', '#2563eb', '#16a34a', '#d97706'].map(color => (
                                      <button
                                          key={color}
                                          onClick={() => setTextColor(color)}
                                          className={`w-8 h-8 rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110 ${textColor === color ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                                          style={{ backgroundColor: color }}
                                      />
                                  ))}
                              </div>
                          </div>

                          <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Vertical Position</label>
                              <input 
                                  type="range" 
                                  min="100" 
                                  max="1000" 
                                  value={textY} 
                                  onChange={(e) => setTextY(parseInt(e.target.value))}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                              />
                          </div>

                          <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Text Size</label>
                              <input 
                                  type="range" 
                                  min="20" 
                                  max="150" 
                                  value={textSize} 
                                  onChange={(e) => setTextSize(parseInt(e.target.value))}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                              />
                          </div>
                      </div>
                  </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
