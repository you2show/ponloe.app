import { HugeiconsIcon } from '@hugeicons/react';
import { Compass01Icon, Navigation01Icon, Location01Icon, AlertCircleIcon, ReloadIcon, CheckmarkCircle02Icon, ArrowLeft01Icon, DrawingCompassIcon, Sun01Icon } from '@hugeicons/core-free-icons';

import React, { useState, useEffect, useCallback } from 'react';


// Kaaba Coordinates
const KAABA_LAT = 21.422487;
const KAABA_LNG = 39.826206;

export const QiblaFinderView: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [heading, setHeading] = useState<number>(0);
  const [qiblaBearing, setQiblaBearing] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isAligned, setIsAligned] = useState(false);
  const [sunAzimuth, setSunAzimuth] = useState<number | null>(null);

  // --- Calculations ---

  const calculateQibla = (lat: number, lng: number) => {
    const phiK = (KAABA_LAT * Math.PI) / 180.0;
    const lambdaK = (KAABA_LNG * Math.PI) / 180.0;
    const phi = (lat * Math.PI) / 180.0;
    const lambda = (lng * Math.PI) / 180.0;

    const y = Math.sin(lambdaK - lambda);
    const x =
      Math.cos(phi) * Math.tan(phiK) -
      Math.sin(phi) * Math.cos(lambdaK - lambda);
    
    let qibla = Math.atan2(y, x);
    qibla = (qibla * 180.0) / Math.PI;
    
    // Normalize to 0-360
    setQiblaBearing((qibla + 360) % 360);
  };

  const calculateSunAzimuth = (lat: number, lng: number) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    const declination = 23.45 * Math.sin((284 + dayOfYear) * 360 / 365 * Math.PI / 180);
    
    const timezoneOffset = now.getTimezoneOffset() / 60;
    const utcTime = now.getHours() + now.getMinutes() / 60 + timezoneOffset;
    
    let solarTime = (utcTime + lng / 15) % 24;
    if (solarTime < 0) solarTime += 24;
    
    const hourAngle = (solarTime - 12) * 15;
    
    const latRad = lat * Math.PI / 180;
    const decRad = declination * Math.PI / 180;
    const haRad = hourAngle * Math.PI / 180;
    
    const sinAlt = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);
    const altitude = Math.asin(sinAlt);
    
    let cosAz = (Math.sin(decRad) - Math.sin(latRad) * sinAlt) / (Math.cos(latRad) * Math.cos(altitude));
    cosAz = Math.max(-1, Math.min(1, cosAz));
    
    let azimuth = Math.acos(cosAz) * 180 / Math.PI;
    if (hourAngle > 0) {
        azimuth = 360 - azimuth;
    }
    
    setSunAzimuth(azimuth);
  };

  // --- Handlers ---

  const startCompass = async () => {
    // 1. Get Location First
    if (!navigator.geolocation) {
      setError('ឧបករណ៍របស់អ្នកមិនគាំទ្រ Geolocation ទេ។');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        calculateQibla(latitude, longitude);
        calculateSunAzimuth(latitude, longitude);
        
        // 2. Request Compass Permission (Specific for iOS 13+)
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
          (DeviceOrientationEvent as any).requestPermission()
            .then((response: string) => {
              if (response === 'granted') {
                setPermissionGranted(true);
                window.addEventListener('deviceorientation', handleOrientation);
              } else {
                setError('អ្នកមិនបានអនុញ្ញាតឱ្យប្រើត្រីវិស័យទេ។');
              }
            })
            .catch(console.error);
        } else {
          // Android and standard browsers
          setPermissionGranted(true);
          window.addEventListener('deviceorientationabsolute', handleOrientation, true); // Android Chrome
          window.addEventListener('deviceorientation', handleOrientation, true); // Standard
        }
      },
      (err) => {
        setError('បរាជ័យក្នុងការកំណត់ទីតាំងរបស់អ្នក។ សូមបើក GPS។');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleOrientation = useCallback((event: any) => {
    let compass = event.webkitCompassHeading || Math.abs(event.alpha - 360);
    
    // Handle Android weirdness if needed, but standard alpha usually works
    if (!event.webkitCompassHeading && event.alpha) {
        compass = 360 - event.alpha;
    }

    setHeading(compass);
  }, []);

  // Haptic feedback when aligned
  useEffect(() => {
    // Calculate shortest distance between heading and qiblaBearing
    let diff = Math.abs(heading - qiblaBearing);
    if (diff > 180) {
        diff = 360 - diff;
    }

    if (location && diff < 5) { // Within 5 degrees tolerance
        if (!isAligned) {
            setIsAligned(true);
            if (navigator.vibrate) navigator.vibrate(200);
        }
    } else {
        setIsAligned(false);
    }
  }, [heading, qiblaBearing, location, isAligned]);

  // Cleanup
  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
    };
  }, [handleOrientation]);

  // Rotation Calculation
  // We rotate the compass disk opposite to heading so North stays "North" on screen
  // The Qibla needle is fixed relative to the compass disk at the specific bearing
  const compassStyle = {
    transform: `rotate(${-heading}deg)`,
    transition: 'transform 0.1s ease-out'
  };

  const kaabaDirectionStyle = {
    transform: `rotate(${qiblaBearing}deg)`,
  };

  // Generate tick marks for the compass
  const renderTicks = () => {
    const ticks = [];
    for (let i = 0; i < 360; i += 2) {
      const isMajor = i % 30 === 0;
      const isMedium = i % 10 === 0;
      ticks.push(
        <div
          key={i}
          className="absolute inset-0 flex flex-col items-center"
          style={{ transform: `rotate(${i}deg)` }}
        >
          <div className={`bg-slate-400 ${isMajor ? 'w-[2px] h-3 mt-1 opacity-80' : isMedium ? 'w-[1.5px] h-2 mt-1 opacity-60' : 'w-[1px] h-1.5 mt-1 opacity-40'}`}></div>
        </div>
      );
    }
    return ticks;
  };

  // Generate Cardinal Directions with Degrees
  const renderCardinals = () => {
    const points = [
        { label: 'ជ', deg: 0, color: 'text-red-600' },
        { label: 'ជ.ក', deg: 45, color: 'text-slate-400' },
        { label: 'ក', deg: 90, color: 'text-slate-700' },
        { label: 'ត.ក', deg: 135, color: 'text-slate-400' },
        { label: 'ត', deg: 180, color: 'text-slate-700' },
        { label: 'ត.ល', deg: 225, color: 'text-slate-400' },
        { label: 'ល', deg: 270, color: 'text-slate-700' },
        { label: 'ជ.ល', deg: 315, color: 'text-slate-400' },
    ];

    return points.map(p => (
        <div key={p.deg} className="absolute inset-0 flex flex-col items-center" style={{ transform: `rotate(${p.deg}deg)` }}>
            <div className="mt-5 flex flex-col items-center">
                <span className={`text-lg font-bold leading-none ${p.color}`}>{p.label}</span>
                <span className={`text-[9px] font-medium mt-0.5 ${p.color === 'text-slate-400' ? 'text-slate-400' : 'text-slate-500'}`}>{p.deg}°</span>
            </div>
        </div>
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10 animate-in fade-in duration-300 relative overflow-hidden flex flex-col items-center font-khmer w-full">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(239,68,68,0.05)_0%,_transparent_100%)] pointer-events-none"></div>

      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
          {onClose && (
              <button onClick={onClose} className="w-12 h-12 bg-white/80 backdrop-blur-md border border-slate-200 rounded-full shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all">
                  <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="w-6 h-6" />
              </button>
          )}
          <div className="flex-1 flex justify-center">
              <div className="bg-white/80 backdrop-blur-md px-6 py-2.5 rounded-full shadow-sm border border-slate-200 flex items-center gap-2">
                  <HugeiconsIcon icon={Compass01Icon} strokeWidth={2} className="w-5 h-5 text-red-500" />
                  <span className="font-bold text-slate-800 tracking-wide">Qibla Finder</span>
              </div>
          </div>
          {onClose && <div className="w-12 h-12"></div>} {/* Spacer for centering */}
      </div>

      <div className="relative z-20 flex flex-col items-center w-full px-4 pt-28 flex-1">
          
          {/* Status Indicator */}
          <div className={`mb-8 px-6 py-3 rounded-full border flex items-center gap-3 backdrop-blur-md transition-all duration-500 shadow-sm ${!permissionGranted ? 'bg-white border-slate-200 text-slate-600' : isAligned ? 'bg-red-50 border-red-200 text-red-600 scale-105 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-white border-slate-200 text-slate-600'}`}>
              {!permissionGranted ? (
                  <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="w-5 h-5" />
              ) : isAligned ? (
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="w-6 h-6" />
              ) : (
                  <HugeiconsIcon icon={ReloadIcon} strokeWidth={2} className="w-5 h-5 animate-spin-slow" />
              )}
              <span className="text-sm font-bold tracking-wide">
                  {!permissionGranted ? 'ត្រូវការសិទ្ធិប្រើប្រាស់' : isAligned ? 'ចំទិសដៅហើយ!' : 'សូមបង្វិលទូរស័ព្ទរបស់អ្នក'}
              </span>
          </div>

          {/* Huge 3D Compass Container */}
          <div className="relative w-[90vw] max-w-[400px] aspect-square flex items-center justify-center mt-4">
              
              {/* 1. Main Compass Dial (Rotates with phone) */}
              <div 
                  className="absolute inset-0 rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08),_inset_0_0_20px_rgba(0,0,0,0.03)] border-[4px] border-slate-100 flex items-center justify-center overflow-hidden transition-transform duration-300 ease-out"
                  style={compassStyle}
              >
                  {/* Tick Marks */}
                  {renderTicks()}

                  {/* Cardinal Directions (Khmer + Degrees) */}
                  {renderCardinals()}
                  
                  {/* Inner Decorative Circle */}
                  <div className="absolute inset-20 rounded-full border border-slate-100"></div>

                  {/* 2. KAABA POINTER (Attached to dial, rotated to correct bearing) */}
                  <div 
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1/2 pointer-events-none z-10 flex flex-col items-center origin-bottom pb-[55px]"
                      style={kaabaDirectionStyle}
                  >
                      {/* Red Box with Kaaba and Degree */}
                      <div className={`mt-5 bg-red-500 rounded-xl px-2 py-1.5 flex items-center gap-1.5 shadow-[0_5px_15px_rgba(239,68,68,0.4)] transition-all duration-500 relative ${isAligned ? 'scale-110 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 'scale-100'}`}>
                          {/* Top Arrow */}
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-red-500"></div>
                          
                          <div className="text-2xl drop-shadow-md">🕋</div>
                          <div className="text-white font-bold text-[11px] tracking-wider" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                              {qiblaBearing.toFixed(1)}°
                          </div>
                      </div>
                      {/* Line to center */}
                      <div className="w-[2px] flex-1 bg-red-500 mt-1 opacity-80"></div>
                  </div>

                  {/* 3. SUN POINTER (Attached to dial) */}
                  {sunAzimuth !== null && (
                      <div 
                          className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1/2 pointer-events-none z-10 flex flex-col items-center origin-bottom"
                          style={{ transform: `rotate(${sunAzimuth}deg)` }}
                      >
                          <div className="mt-8 bg-amber-100 p-1.5 rounded-full border border-amber-200 shadow-sm">
                              <HugeiconsIcon icon={Sun01Icon} strokeWidth={2} className="w-5 h-5 text-amber-500" />
                          </div>
                      </div>
                  )}

              </div>
              
              {/* Fixed Center Arrow (Red) */}
              <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                  <div className="relative flex flex-col items-center justify-center">
                      {/* Arrow pointing up from center */}
                      <div className={`absolute bottom-1/2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[55px] transition-colors duration-500 ${isAligned ? 'border-b-red-600 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'border-b-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]'}`}></div>
                      
                      {/* Center Circle */}
                      <div className="relative w-9 h-9 bg-white rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.15)] border-[3px] border-slate-200 flex items-center justify-center z-30">
                          <div className="w-3 h-3 bg-red-500 rounded-full shadow-inner"></div>
                      </div>
                  </div>
              </div>

          </div>

          {/* Floating Info Text OR Permission Button */}
          {!permissionGranted ? (
              <div className="mt-12 flex flex-col items-center w-full max-w-sm gap-4">
                  {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 w-full text-left">
                          <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={1.5} className="w-5 h-5 shrink-0" />
                          {error}
                      </div>
                  )}
                  <button 
                      onClick={startCompass}
                      className="w-full bg-red-500 text-white hover:bg-red-600 font-bold py-4 rounded-2xl shadow-[0_5px_20px_rgba(239,68,68,0.3)] transition-all active:scale-95 text-lg flex items-center justify-center gap-2"
                  >
                      <HugeiconsIcon icon={Navigation01Icon} strokeWidth={2} className="w-6 h-6" />
                      ចាប់ផ្តើមស្វែងរក
                  </button>
                  <p className="text-slate-500 text-xs text-center mt-2 px-4 leading-relaxed">
                      ដើម្បីទទួលបានទិសដៅត្រឹមត្រូវ យើងត្រូវការសិទ្ធិប្រើប្រាស់ទីតាំង (GPS) និងត្រីវិស័យ (Compass) នៃទូរស័ព្ទរបស់អ្នក។
                  </p>
              </div>
          ) : (
              <div className="mt-14 flex flex-col items-center gap-1">
                  <div className="text-[72px] font-black text-slate-800 tabular-nums tracking-tighter drop-shadow-sm leading-none">
                      {qiblaBearing.toFixed(0)}°
                  </div>
                  <p className="text-red-500 text-[12px] font-bold uppercase tracking-[0.2em] mt-2">Qibla Direction</p>
                  
                  <div className="mt-8 flex items-center gap-2 text-slate-600 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm border border-slate-200">
                      <HugeiconsIcon icon={Location01Icon} strokeWidth={2} className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium tracking-wide">{location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Getting Location...'}</span>
                  </div>
              </div>
          )}

          <div className="mt-auto pt-8 text-slate-400 text-[11px] max-w-xs text-center leading-relaxed">
              ដាក់ទូរស័ព្ទរបស់អ្នកឲ្យរាបស្មើ ហើយនៅឆ្ងាយពីដែក ឬម៉ាញេទិក ដើម្បីទទួលបានភាពត្រឹមត្រូវ។
          </div>
      </div>
    </div>
  );
};
