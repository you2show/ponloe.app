import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Gps01Icon } from '@hugeicons/core-free-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { LOCATION_DATA } from '../prayer/data';

export const LocationSelectionModal = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  locConfig 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSelect: (config: any) => void; 
  locConfig: any; 
}) => {
  const { theme } = useTheme();
  const [isScanning, setIsScanning] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState(locConfig.province || 'phnom-penh');

  if (!isOpen) return null;

  const handleScan = () => {
    setIsScanning(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=km`);
            const data = await res.json();
            const name = data.address?.city || data.address?.state || data.address?.country || 'ទីតាំងបច្ចុប្បន្ន';
            
            const newConfig = { type: 'auto', lat: latitude, lon: longitude, name };
            localStorage.setItem('prayerLocation', JSON.stringify(newConfig));
            onSelect(newConfig);
            onClose();
          } catch (e) {
            const newConfig = { type: 'auto', lat: latitude, lon: longitude, name: 'ទីតាំងបច្ចុប្បន្ន' };
            localStorage.setItem('prayerLocation', JSON.stringify(newConfig));
            onSelect(newConfig);
            onClose();
          }
          setIsScanning(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsScanning(false);
          alert("មិនអាចស្វែងរកទីតាំងបានទេ។ សូមពិនិត្យមើលការអនុញ្ញាតទីតាំង (Location Permission)។");
        }
      );
    } else {
      setIsScanning(false);
      alert("កម្មវិធីរុករករបស់អ្នកមិនគាំទ្រការស្វែងរកទីតាំងទេ។");
    }
  };

  const handleManualSelect = (province: string, districtIndex: number) => {
    const newConfig = { type: 'manual', province, districtIndex, communeIndex: 0 };
    localStorage.setItem('prayerLocation', JSON.stringify(newConfig));
    onSelect(newConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className={`w-full max-w-md rounded-3xl overflow-hidden shadow-2xl ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-gray-800'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold font-khmer text-lg">ជ្រើសរើសទីតាំង</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <button 
            onClick={handleScan}
            disabled={isScanning}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors disabled:opacity-70"
          >
            <HugeiconsIcon icon={Gps01Icon} className={`w-5 h-5 ${isScanning ? 'animate-pulse' : ''}`} />
            <span className="font-khmer">{isScanning ? 'កំពុងស្វែងរក...' : 'ស្វែងរកទីតាំងបច្ចុប្បន្ន'}</span>
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200 dark:border-slate-800"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-khmer">ឬជ្រើសរើសដោយផ្ទាល់</span>
            <div className="flex-grow border-t border-gray-200 dark:border-slate-800"></div>
          </div>

          <div className="space-y-3">
            <select 
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className={`w-full p-3 rounded-xl border font-khmer appearance-none ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
            >
              {Object.entries(LOCATION_DATA).map(([key, data]) => (
                <option key={key} value={key}>{data.name_km}</option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2">
              {LOCATION_DATA[selectedProvince]?.districts?.map((district: any, index: number) => (
                <button
                  key={index}
                  onClick={() => handleManualSelect(selectedProvince, index)}
                  className={`p-3 rounded-xl text-left font-khmer text-sm transition-colors ${
                    locConfig.type === 'manual' && locConfig.province === selectedProvince && locConfig.districtIndex === index
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {district.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
