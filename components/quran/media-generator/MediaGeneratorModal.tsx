import React, { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, HeadphonesIcon, Image01Icon, TextFontIcon, PaintBoardIcon, Download01Icon, Link01Icon, PlayIcon, PauseIcon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { Ayah, Surah } from '../types';
import { toPng } from 'html-to-image';
import { BackgroundPickerModal } from './BackgroundPickerModal';
import { useToast } from '@/contexts/ToastContext';

interface MediaGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  ayah: Ayah;
  surah: Surah;
}

type Tab = 'audio' | 'background' | 'text' | 'colors';
type Orientation = 'landscape' | 'portrait';

const BACKGROUNDS = [
  { id: 'bg1', type: 'image', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
  { id: 'bg2', type: 'image', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80' },
  { id: 'bg3', type: 'image', url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80' },
  { id: 'bg4', type: 'image', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80' },
  { id: 'bg5', type: 'image', url: 'https://images.unsplash.com/photo-1506744626753-dba37c259d1b?auto=format&fit=crop&w=800&q=80' },
];

export const MediaGeneratorModal: React.FC<MediaGeneratorModalProps> = ({ isOpen, onClose, ayah, surah }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('audio');
  const [orientation, setOrientation] = useState<Orientation>('landscape');
  const [selectedBg, setSelectedBg] = useState<{ id: string; type: 'image' | 'video'; url: string }>(BACKGROUNDS[0] as any);
  const [showBgPicker, setShowBgPicker] = useState(false);
  
  // Text Settings
  const [quranFontSize, setQuranFontSize] = useState(32);
  const [transFontSize, setTransFontSize] = useState(16);
  const [quranFont, setQuranFont] = useState('Uthmani');
  
  // Color Settings
  const [textColor, setTextColor] = useState('#ffffff');
  const [bgOpacity, setBgOpacity] = useState(40);
  const [borderSize, setBorderSize] = useState(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [isOpen]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownloadImage = async () => {
    if (!previewRef.current) return;
    setIsGenerating(true);
    
    // Suppress html-to-image console errors about cssRules and fetching
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    const shouldSuppress = (args: any[]) => {
      const msg = args.map(a => (a instanceof Error ? a.message : String(a))).join(' ');
      return (
        msg.includes('Error while reading CSS rules') || 
        msg.includes('The element has no supported sources') || 
        msg.includes('Error inlining remote css file') || 
        msg.includes('Error loading remote stylesheet') ||
        msg.includes('Failed to read the \'cssRules\' property') ||
        msg.includes('Cannot access rules') ||
        msg.includes('Failed to fetch')
      );
    };

    console.error = (...args) => {
      if (shouldSuppress(args)) return;
      originalConsoleError(...args);
    };
    console.warn = (...args) => {
      if (shouldSuppress(args)) return;
      originalConsoleWarn(...args);
    };

    try {
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, quality: 0.95 });
      const link = document.createElement('a');
      link.download = `ayah-${surah.id}-${ayah.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      originalConsoleError('Failed to generate image', err);
      showToast('បរាជ័យក្នុងការទាញយករូបភាព', 'error');
    } finally {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      setIsGenerating(false);
    }
  };

  const handleDownloadVideo = () => {
    showToast('មុខងារទាញយកវីដេអូកំពុងស្ថិតក្នុងការអភិវឌ្ឍន៍។ សូមប្រើប្រាស់ការទាញយករូបភាពសិន។', 'info');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('បានចម្លងតំណភ្ជាប់', 'success');
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 md:p-4 animate-in fade-in duration-200 font-khmer">
      <div className="bg-[#1e293b] w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col overflow-hidden relative h-[95vh] md:h-[90vh]">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors">
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
        </button>

        {/* Top: Preview Area */}
        <div className="bg-black flex items-center justify-center p-4 md:p-8 relative shrink-0 h-[40%] md:h-[45%]">
           <div 
             ref={previewRef}
             className={`relative overflow-hidden shadow-2xl transition-all duration-300 flex flex-col items-center justify-center p-4 md:p-10
               ${orientation === 'landscape' ? 'w-full md:w-auto md:h-full aspect-video' : 'h-full aspect-[9/16]'}
             `}
             style={{
               backgroundImage: selectedBg.type === 'image' ? `url(${selectedBg.url})` : 'none',
               backgroundSize: 'cover',
               backgroundPosition: 'center',
               border: `${borderSize}px solid ${textColor}`
             }}
           >
              {selectedBg.type === 'video' && (
                <video 
                  ref={bgVideoRef}
                  src={selectedBg.url || undefined}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover z-0"
                  crossOrigin="anonymous"
                />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black z-0" style={{ opacity: bgOpacity / 100 }}></div>
              
              {/* Content */}
              <div className="relative z-10 text-center w-full max-w-xl mx-auto flex flex-col gap-4 md:gap-6">
                 <p 
                   className="font-arabic leading-loose" 
                   style={{ 
                     color: textColor, 
                     fontSize: orientation === 'landscape' ? `${quranFontSize}px` : `${Math.max(16, quranFontSize - 8)}px`,
                     fontFamily: quranFont === 'Uthmani' ? 'Amiri, serif' : 'sans-serif'
                   }}
                   dir="rtl"
                   dangerouslySetInnerHTML={{ __html: ayah.text_arabic }}
                 />
                 <p 
                   className="font-khmer leading-relaxed"
                   style={{ 
                     color: textColor, 
                     fontSize: orientation === 'landscape' ? `${transFontSize}px` : `${Math.max(10, transFontSize - 4)}px`,
                     opacity: 0.9
                   }}
                 >
                   {ayah.translations?.[0]?.text || 'គ្មានការបកប្រែ'}
                 </p>
                 <div className="mt-2 md:mt-4 text-xs md:text-sm font-bold opacity-75" style={{ color: textColor }}>
                   {surah.name_simple} - {surah.id}:{ayah.id}
                 </div>
              </div>
           </div>

           {/* Audio Player Controls Overlay (Not captured in image) */}
           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full text-white">
              <button onClick={togglePlay} className="hover:text-emerald-400 transition-colors">
                 {isPlaying ? <HugeiconsIcon icon={PauseIcon} strokeWidth={1.5} className="w-6 h-6 fill-current" /> : <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} className="w-6 h-6 fill-current" />}
              </button>
              <div className="w-32 md:w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 w-1/3"></div>
              </div>
              <span className="text-xs font-mono">0:00 / 0:06</span>
           </div>
           
           {ayah.audio?.url && (
             <audio 
               ref={audioRef} 
               src={`https://verses.quran.com/${ayah.audio.url}` || undefined} 
               onEnded={() => setIsPlaying(false)}
               crossOrigin="anonymous"
             />
           )}
        </div>

        {/* Bottom: Controls */}
        <div className="w-full bg-[#1e293b] flex flex-col flex-1 overflow-hidden">
          
          {/* Tabs */}
          <div className="flex p-4 justify-center items-center relative border-b border-white/10 shrink-0">
             <div className="flex bg-black/20 rounded-full p-1 w-full max-w-md">
               {[
                 { id: 'audio', icon: HeadphonesIcon },
                 { id: 'background', icon: Image01Icon },
                 { id: 'text', icon: TextFontIcon },
                 { id: 'colors', icon: PaintBoardIcon },
               ].map(tab => (
                 <button 
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as Tab)}
                   className={`flex-1 py-2 flex justify-center items-center rounded-full transition-colors ${activeTab === tab.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                 >
                   <HugeiconsIcon icon={tab.icon} strokeWidth={1.5} className="w-5 h-5" />
                 </button>
               ))}
             </div>
             <button className="absolute right-4 px-4 py-2 text-sm font-bold text-white hover:bg-white/10 rounded-xl transition-colors hidden md:block">
               Reset
             </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 text-white custom-scrollbar">
             
             {activeTab === 'audio' && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in max-w-3xl mx-auto">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Ayahs <span className="text-xs font-normal text-gray-500">Max 10 Ayahs</span></label>
                    <div className="bg-black/20 border border-white/10 rounded-xl p-3 text-sm mb-2">
                       {surah.name_simple} ({surah.id})
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-center">{ayah.id}</div>
                       <span className="text-gray-500 text-sm">to</span>
                       <div className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-center">{ayah.id}</div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Reciter</label>
                    <select className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 appearance-none">
                       <option>Mishari Rashid al-Afasy</option>
                       <option>AbdulBaset AbdulSamad</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Translations</label>
                    <div className="bg-black/20 border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-black/30 transition-colors flex justify-between items-center h-[74px]">
                       <div>
                         <div className="text-xs text-gray-500 mb-1">Selected Translations</div>
                         <div className="text-sm font-bold line-clamp-1">Khmer Translation</div>
                       </div>
                       <span className="text-gray-500">&gt;</span>
                    </div>
                  </div>
               </div>
             )}

             {activeTab === 'background' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in max-w-3xl mx-auto">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-3">Background video/image</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                       {BACKGROUNDS.map(bg => (
                         <button 
                           key={bg.id}
                           onClick={() => setSelectedBg(bg as any)}
                           className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${selectedBg.id === bg.id ? 'border-emerald-500 scale-105' : 'border-transparent hover:border-white/20'}`}
                         >
                           <img referrerPolicy="no-referrer" src={bg.url || undefined} className="w-full h-full object-cover" />
                         </button>
                       ))}
                       <button 
                         onClick={() => setShowBgPicker(true)} 
                         className="w-20 h-20 shrink-0 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                       >
                         <HugeiconsIcon icon={PlusSignIcon} strokeWidth={1.5} className="w-6 h-6" />
                       </button>
                    </div>
                  </div>
                  
                  <div className="md:border-l md:border-white/10 md:pl-8">
                    <label className="block text-sm font-bold text-gray-300 mb-3">Orientation</label>
                    <div className="flex bg-black/20 rounded-full p-1 max-w-[200px]">
                       <button 
                         onClick={() => setOrientation('landscape')}
                         className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors ${orientation === 'landscape' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                       >
                         Landscape
                       </button>
                       <button 
                         onClick={() => setOrientation('portrait')}
                         className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors ${orientation === 'portrait' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                       >
                         Portrait
                       </button>
                    </div>
                  </div>
               </div>
             )}

             {activeTab === 'text' && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in max-w-3xl mx-auto">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Quran font style</label>
                    <select 
                      value={quranFont}
                      onChange={(e) => setQuranFont(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 appearance-none"
                    >
                       <option value="Uthmani">QPC Uthmani Hafs</option>
                       <option value="IndoPak">IndoPak</option>
                    </select>
                  </div>
                  
                  <div className="md:border-l md:border-white/10 md:pl-6">
                    <label className="block text-sm font-bold text-gray-300 mb-2 text-center">Quran font size</label>
                    <div className="flex items-center justify-center gap-4 mt-4">
                       <button onClick={() => setQuranFontSize(Math.max(16, quranFontSize - 2))} className="w-8 h-8 flex items-center justify-center text-xl hover:text-emerald-400 transition-colors">-</button>
                       <span className="font-mono w-8 text-center text-lg">{quranFontSize}</span>
                       <button onClick={() => setQuranFontSize(Math.min(72, quranFontSize + 2))} className="w-8 h-8 flex items-center justify-center text-xl hover:text-emerald-400 transition-colors">+</button>
                    </div>
                  </div>
                  
                  <div className="md:border-l md:border-white/10 md:pl-6">
                    <label className="block text-sm font-bold text-gray-300 mb-2 text-center">Translation font size</label>
                    <div className="flex items-center justify-center gap-4 mt-4">
                       <button onClick={() => setTransFontSize(Math.max(10, transFontSize - 1))} className="w-8 h-8 flex items-center justify-center text-xl hover:text-emerald-400 transition-colors">-</button>
                       <span className="font-mono w-8 text-center text-lg">{transFontSize}</span>
                       <button onClick={() => setTransFontSize(Math.min(48, transFontSize + 1))} className="w-8 h-8 flex items-center justify-center text-xl hover:text-emerald-400 transition-colors">+</button>
                    </div>
                  </div>
               </div>
             )}

             {activeTab === 'colors' && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in max-w-3xl mx-auto">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-3">Text Color</label>
                    <div className="flex gap-3">
                       {['#ffffff', '#fcd34d', '#6ee7b7', '#93c5fd', '#fca5a5'].map(color => (
                         <button 
                           key={color}
                           onClick={() => setTextColor(color)}
                           className={`w-10 h-10 rounded-full border-2 transition-transform ${textColor === color ? 'border-emerald-500 scale-110' : 'border-transparent hover:scale-105'}`}
                           style={{ backgroundColor: color }}
                         />
                       ))}
                    </div>
                  </div>
                  
                  <div className="md:border-l md:border-white/10 md:pl-6">
                    <label className="block text-sm font-bold text-gray-300 mb-3 text-center">Text background opacity</label>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={bgOpacity} 
                      onChange={(e) => setBgOpacity(parseInt(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between mt-2 font-mono text-sm text-gray-400">
                      <button onClick={() => setBgOpacity(Math.max(0, bgOpacity - 10))}>-</button>
                      <span>{bgOpacity}%</span>
                      <button onClick={() => setBgOpacity(Math.min(100, bgOpacity + 10))}>+</button>
                    </div>
                  </div>

                  <div className="md:border-l md:border-white/10 md:pl-6">
                    <label className="block text-sm font-bold text-gray-300 mb-3 text-center">Border size</label>
                    <input 
                      type="range" 
                      min="0" max="20" 
                      value={borderSize} 
                      onChange={(e) => setBorderSize(parseInt(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between mt-2 font-mono text-sm text-gray-400">
                      <button onClick={() => setBorderSize(Math.max(0, borderSize - 1))}>-</button>
                      <span>{borderSize}px</span>
                      <button onClick={() => setBorderSize(Math.min(20, borderSize + 1))}>+</button>
                    </div>
                  </div>
               </div>
             )}

             {/* Bottom Actions */}
             <div className="mt-8 pt-6 border-t border-white/10 flex flex-col items-center">
                <div className="flex items-center gap-4 w-full max-w-2xl mb-4">
                  <div className="h-px bg-white/10 flex-1"></div>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Download/Share</span>
                  <div className="h-px bg-white/10 flex-1"></div>
                </div>
                <div className="flex flex-wrap justify-center gap-4 w-full max-w-2xl">
                   <button 
                     onClick={handleDownloadVideo}
                     className="bg-white text-gray-900 font-bold py-2.5 px-6 rounded-xl hover:bg-gray-100 transition-colors text-sm flex items-center justify-center gap-2 flex-1 min-w-[140px]"
                   >
                     <HugeiconsIcon icon={Download01Icon} strokeWidth={1.5} className="w-4 h-4" /> Download Video
                   </button>
                   <button 
                     onClick={handleDownloadImage}
                     disabled={isGenerating}
                     className="bg-white text-gray-900 font-bold py-2.5 px-6 rounded-xl hover:bg-gray-100 transition-colors text-sm flex items-center justify-center gap-2 flex-1 min-w-[140px] disabled:opacity-50"
                   >
                     {isGenerating ? (
                       <span className="animate-pulse">Generating...</span>
                     ) : (
                       <><HugeiconsIcon icon={Download01Icon} strokeWidth={1.5} className="w-4 h-4" /> Download Image</>
                     )}
                   </button>
                   <button 
                     onClick={handleCopyLink}
                     className="bg-transparent border border-white/20 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-white/10 transition-colors text-sm flex items-center justify-center gap-2 flex-1 min-w-[140px]"
                   >
                     <HugeiconsIcon icon={Link01Icon} strokeWidth={1.5} className="w-4 h-4" /> Copy link
                   </button>
                </div>
             </div>

          </div>

        </div>
      </div>
    </div>
    
    <BackgroundPickerModal 
      isOpen={showBgPicker}
      onClose={() => setShowBgPicker(false)}
      onSelect={(bg) => setSelectedBg(bg)}
    />
    </>
  );
};
