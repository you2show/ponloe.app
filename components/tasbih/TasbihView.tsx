import { Notification01Icon, PaintBoardIcon, ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { ReloadIcon, VolumeHighIcon, VolumeOffIcon, Settings01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const BEAD_STYLES_IMAGE = "https://raw.githubusercontent.com/icenterofficial/ponloe/main/ponloe%20(2).png";

const DHIKR_LIST = [
  { arabic: "سُبْحَانَ ٱللَّٰهِ", khmer: "ស៊ុបហាណាល់ឡោះ", meaning: "Subhan Allah" },
  { arabic: "ٱلْحَمْدُ لِلَّٰهِ", khmer: "អាល់ហាំឌុឡិលឡោះ", meaning: "Alhamdulillah" },
  { arabic: "ٱللَّٰهُ أَكْبَرُ", khmer: "អល់ឡោះហួអាក់បារ", meaning: "Allahu Akbar" },
  { arabic: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ", khmer: "ឡាអ៊ីឡាហា អ៊ីលឡាល់ឡោះ", meaning: "La ilaha illallah" },
  { arabic: "أَسْتَغْفِرُ اللَّهَ", khmer: "អេស្តាហ្វៀរូឡោះ", meaning: "Astaghfirullah" },
  { arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", khmer: "ស៊ុបហាណាល់ឡោះ វ៉ាប៊ីហាំឌីហ៊ី", meaning: "Subhanallahi wa bihamdihi" },
];

export const TasbihView: React.FC = () => {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState(0);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [selectedDhikrIndex, setSelectedDhikrIndex] = useState(-1);
  const [showDhikrPicker, setShowDhikrPicker] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Audio ref
  const audioCtx = useRef<AudioContext | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const playClickSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioCtx.current) {
        audioCtx.current = new AudioContextClass();
      }
      
      if (audioCtx.current.state === 'suspended') {
        audioCtx.current.resume();
      }

      const oscillator = audioCtx.current.createOscillator();
      const gainNode = audioCtx.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.current.destination);
      
      // Subtle wood tap sound design
      const now = audioCtx.current.currentTime;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, now);
      oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.05);
      
      gainNode.gain.setValueAtTime(0.5, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      
      oscillator.start(now);
      oscillator.stop(now + 0.05);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  }, [soundEnabled]);

  const increment = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newCount = count + 1;
    setCount(newCount);
    
    // Feedback
    if (vibrationEnabled && navigator.vibrate) navigator.vibrate(50);
    playClickSound();

    // Target Reached Feedback
    if (newCount % target === 0) {
        if (vibrationEnabled && navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
  };

  const reset = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm("តើអ្នកចង់កំណត់ឡើងវិញមែនទេ?")) {
        setCount(0);
    }
  };

  const getBeadImageStyle = (index: number) => {
    const x = (index % 4) * 100;
    const y = Math.floor(index / 4) * 100;
    return {
      width: '400%',
      height: '400%',
      left: `-${x}%`,
      top: `-${y}%`,
    };
  };

  const getPositionByT = useCallback((t: number) => {
    if (isMobile) {
      const x = t * 0.8;
      const y = t * 1.2 + Math.sin(t / 250) * 80 + 120;
      return { x, y };
    }
    const x = t;
    // Gentle curve, shifted down to avoid overlapping text
    const y = t * 0.35 + Math.sin(t / 400) * 120 + 80;
    return { x, y };
  }, [isMobile]);

  const getBeadPosition = useCallback((j: number) => {
    const spacing = isMobile ? 50 : 60; // Slightly larger gap between beads
    const gap = isMobile ? 220 : 300; // Larger gap in the middle
    
    let t = j > 0 ? -(gap / 2) - (j - 1) * spacing : (gap / 2) - j * spacing;
    return getPositionByT(t);
  }, [isMobile, getPositionByT]);

  const stringPath = useMemo(() => {
    let path = "";
    for (let t = -1500; t <= 1500; t += 20) {
      const { x, y } = getPositionByT(t);
      if (t === -1500) path += `M ${x} ${y} `;
      else path += `L ${x} ${y} `;
    }
    return path;
  }, [getPositionByT]);

  // Increase number of beads to 80 to fill the screen
  const beads = Array.from({ length: 80 }, (_, idx) => count - 40 + idx);

  const getDhikrText = () => {
    if (selectedDhikrIndex >= 0) {
      return DHIKR_LIST[selectedDhikrIndex];
    }
    const cycleCount = count % 100;
    if (cycleCount < 33) return DHIKR_LIST[0];
    if (cycleCount < 66) return DHIKR_LIST[1];
    return DHIKR_LIST[2];
  };

  const dhikr = getDhikrText();

  return (
    <div 
      className="h-[100dvh] w-full bg-white text-slate-900 flex flex-col font-khmer relative overflow-hidden cursor-pointer touch-none"
      onClick={increment}
    >
       
       {/* Hidden image to force preload and handle referrer policy */}
       <img src={BEAD_STYLES_IMAGE} referrerPolicy="no-referrer" className="hidden" alt="preload" />

       {/* Background Glow */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

       {/* Header */}
       <div className="p-4 md:p-6 flex justify-between items-center z-30" onClick={e => e.stopPropagation()}>
          <div>
             <h1 className="text-xl md:text-2xl font-bold">តេសបៀស</h1>
             <p className="text-slate-500 text-xs md:text-sm">Digital Tasbih</p>
          </div>
          <div className="flex gap-2">
             <button 
                onClick={(e) => { e.stopPropagation(); setShowStylePicker(true); }} 
                className="p-2 md:p-3 rounded-full bg-slate-100 text-slate-500 hover:text-emerald-600 hover:bg-slate-200 transition-colors"
             >
                <HugeiconsIcon icon={PaintBoardIcon} strokeWidth={1.5} className="w-5 h-5" />
             </button>
             <button onClick={(e) => { e.stopPropagation(); setSoundEnabled(!soundEnabled); }} className={`p-2 md:p-3 rounded-full transition-colors ${soundEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                {soundEnabled ? <HugeiconsIcon icon={VolumeHighIcon} strokeWidth={1.5} className="w-5 h-5" /> : <HugeiconsIcon icon={VolumeOffIcon} strokeWidth={1.5} className="w-5 h-5" />}
             </button>
             <button onClick={(e) => { e.stopPropagation(); setVibrationEnabled(!vibrationEnabled); }} className={`p-2 md:p-3 rounded-full transition-colors ${vibrationEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                <HugeiconsIcon icon={Notification01Icon} strokeWidth={1.5} className="w-5 h-5" />
             </button>
          </div>
       </div>

       {/* Main Content Area */}
       <div className="flex-1 flex flex-col items-center justify-start pt-2 md:pt-4 z-20 pointer-events-none">
          
          {/* Dhikr Text */}
          <div 
             className="mb-4 flex flex-col items-center gap-1 text-center px-4 pointer-events-auto cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-colors"
             onClick={(e) => { e.stopPropagation(); setShowDhikrPicker(true); }}
          >
             <motion.span 
                key={dhikr.arabic}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-scheherazade text-emerald-600 leading-relaxed"
             >
                {dhikr.arabic}
             </motion.span>
             <span className="text-lg md:text-xl font-bold text-slate-800">{dhikr.khmer}</span>
             <div className="flex items-center gap-1 text-slate-500">
                <span className="text-xs md:text-sm uppercase tracking-widest font-bold">{dhikr.meaning}</span>
                <HugeiconsIcon icon={ArrowDown01Icon} className="w-4 h-4" />
             </div>
          </div>

          {/* Counter */}
          <div className="text-center mb-8">
             <motion.div 
               key={count}
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="text-[80px] md:text-[120px] font-bold font-mono leading-none tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-slate-800 via-slate-700 to-slate-400 drop-shadow-sm"
             >
                {count}
             </motion.div>
             
             <div className="mt-4 md:mt-6 flex flex-col items-center gap-3 pointer-events-auto">
                <div 
                   className="inline-flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 rounded-full text-xs md:text-sm text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm" 
                   onClick={(e) => { e.stopPropagation(); setTarget(target === 33 ? 99 : target === 99 ? 100 : 33); }}
                >
                   <span className="font-medium">គោលដៅ: {target}</span>
                   <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.5} className="w-4 h-4 text-emerald-500" />
                </div>
                
                <button 
                   onClick={reset}
                   className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-red-500 text-[10px] md:text-xs font-bold transition-all uppercase tracking-widest"
                >
                   <HugeiconsIcon icon={ReloadIcon} strokeWidth={1.5} className="w-3 h-3 md:w-4 md:h-4" /> Reset
                </button>
             </div>
          </div>
       </div>

       {/* Visual Tasbih (The String and Beads) */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          {/* The String */}
          <svg className="absolute top-1/2 left-1/2 overflow-visible z-0" style={{ width: 0, height: 0 }}>
             <path d={stringPath} fill="none" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.1))" />
          </svg>
          
          {/* Target Area Indicator */}
          <div 
             className="absolute top-1/2 left-1/2"
             style={{
                transform: `translate(${getPositionByT(0).x}px, ${getPositionByT(0).y}px)`
             }}
          >
             <div className="w-12 h-12 -ml-6 -mt-6 rounded-full border-2 border-emerald-500/30 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                <div className="w-2 h-2 bg-emerald-500/60 rounded-full"></div>
             </div>
          </div>

          {/* Beads Container */}
          <div className="absolute top-1/2 left-1/2 z-10">
             <AnimatePresence>
                {beads.map((i) => {
                   const j = i - count;
                   const { x, y } = getBeadPosition(j);
                   const opacity = Math.max(0, 1 - Math.abs(x) / 1200);
                   const scale = j === 1 ? 1.15 : 1;
                   const isHighlight = j === 1;
                   
                   return (
                      <motion.div
                         key={i}
                         initial={{ x: x - 50, y: y - 50, opacity: 0 }}
                         animate={{ 
                            x, 
                            y, 
                            opacity,
                            scale,
                            filter: isHighlight ? 'brightness(1.05) drop-shadow(0 10px 20px rgba(16,185,129,0.3))' : 'brightness(0.95) drop-shadow(0 8px 12px rgba(0,0,0,0.15))'
                         }}
                         exit={{ x: x + 50, y: y + 50, opacity: 0 }}
                         transition={{ type: "spring", stiffness: 400, damping: 30 }}
                         className="absolute w-16 h-16 rounded-full overflow-hidden"
                         style={{
                            marginLeft: '-32px',
                            marginTop: '-32px',
                            zIndex: 100 - Math.abs(j)
                         }}
                      >
                         <img 
                            src={BEAD_STYLES_IMAGE} 
                            referrerPolicy="no-referrer"
                            alt="bead"
                            className="absolute max-w-none pointer-events-none"
                            style={getBeadImageStyle(selectedStyle)}
                         />
                      </motion.div>
                   );
                })}
             </AnimatePresence>
          </div>
       </div>

       {/* Dhikr Picker Modal */}
       <AnimatePresence>
          {showDhikrPicker && (
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm pointer-events-auto"
                onClick={(e) => { e.stopPropagation(); setShowDhikrPicker(false); }}
             >
                <motion.div 
                   initial={{ scale: 0.9, y: 20 }}
                   animate={{ scale: 1, y: 0 }}
                   exit={{ scale: 0.9, y: 20 }}
                   className="bg-white border border-slate-100 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
                   onClick={(e) => e.stopPropagation()}
                >
                   <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                      <h3 className="text-xl font-bold text-slate-800">ជ្រើសរើស ហ្ស៊ីគៀរ</h3>
                      <button onClick={() => setShowDhikrPicker(false)} className="p-2 hover:bg-slate-100 text-slate-500 rounded-full transition-colors">
                         <HugeiconsIcon icon={Cancel01Icon} className="w-6 h-6" />
                      </button>
                   </div>
                   <div className="p-4 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                      <button
                         onClick={() => { setSelectedDhikrIndex(-1); setShowDhikrPicker(false); }}
                         className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedDhikrIndex === -1 ? 'border-emerald-500 bg-emerald-50' : 'border-transparent hover:bg-slate-50'}`}
                      >
                         <div className="font-bold text-slate-800">ប្ដូរស្វ័យប្រវត្តិ (Auto Sequence)</div>
                         <div className="text-sm text-slate-500">33 Subhan Allah, 33 Alhamdulillah, 34 Allahu Akbar</div>
                      </button>
                      {DHIKR_LIST.map((d, i) => (
                         <button
                            key={i}
                            onClick={() => { setSelectedDhikrIndex(i); setShowDhikrPicker(false); }}
                            className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col gap-1 ${selectedDhikrIndex === i ? 'border-emerald-500 bg-emerald-50' : 'border-transparent hover:bg-slate-50'}`}
                         >
                            <div className="text-4xl font-scheherazade text-emerald-600 text-right w-full leading-relaxed">{d.arabic}</div>
                            <div className="font-bold text-slate-800">{d.khmer}</div>
                            <div className="text-sm text-slate-500 uppercase tracking-wider">{d.meaning}</div>
                         </button>
                      ))}
                   </div>
                </motion.div>
             </motion.div>
          )}
       </AnimatePresence>

       {/* Style Picker Modal */}
       <AnimatePresence>
          {showStylePicker && (
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
             >
                <motion.div 
                   initial={{ scale: 0.9, y: 20 }}
                   animate={{ scale: 1, y: 0 }}
                   exit={{ scale: 0.9, y: 20 }}
                   className="bg-white border border-slate-100 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
                >
                   <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-slate-800">ជ្រើសរើសម៉ូតគ្រាប់</h3>
                      <button onClick={() => setShowStylePicker(false)} className="p-2 hover:bg-slate-100 text-slate-500 rounded-full transition-colors">
                         <HugeiconsIcon icon={Cancel01Icon} className="w-6 h-6" />
                      </button>
                   </div>
                   <div className="p-6 grid grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {[...Array(16)].map((_, i) => (
                         <button
                            key={i}
                            onClick={() => {
                               setSelectedStyle(i);
                               setShowStylePicker(false);
                            }}
                            className={`aspect-square rounded-2xl border-2 transition-all p-1 hover:scale-105 active:scale-95 overflow-hidden relative ${selectedStyle === i ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}
                         >
                            <div className="w-full h-full rounded-xl overflow-hidden relative shadow-sm">
                               <img 
                                  src={BEAD_STYLES_IMAGE} 
                                  referrerPolicy="no-referrer"
                                  alt={`bead style ${i}`}
                                  className="absolute max-w-none pointer-events-none"
                                  style={getBeadImageStyle(i)}
                               />
                            </div>
                         </button>
                      ))}
                   </div>
                </motion.div>
             </motion.div>
          )}
       </AnimatePresence>

       {/* Tap Hint */}
       <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse pointer-events-none z-20">
          ចុចទីណាក៏បានដើម្បីរាប់
       </div>

    </div>
  );
};
