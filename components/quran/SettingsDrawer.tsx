import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, TextIcon, VolumeHighIcon, Globe02Icon, Tick01Icon, ReloadIcon, ComputerIcon, CleanIcon, UserIcon, DashboardSpeed01Icon } from '@hugeicons/core-free-icons';
import { motion, AnimatePresence } from 'motion/react';

import React, { useState } from 'react';

import { QuranSettings, ArabicScriptType, DEFAULT_SETTINGS } from './types';
import { RECITERS } from './api';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: QuranSettings;
  onSettingsChange: (newSettings: QuranSettings) => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ 
  isOpen, onClose, settings, onSettingsChange 
}) => {
  const [activeTab, setActiveTab] = useState<'display' | 'audio' | 'font'>('display');

  const updateSetting = <K extends keyof QuranSettings>(key: K, value: QuranSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleFontChange = (script: ArabicScriptType, fontClass: string) => {
    onSettingsChange({ ...settings, arabicScript: script, fontClass: fontClass });
  };

  const handleReset = () => {
      if (window.confirm('តើអ្នកចង់កំណត់ការកំណត់ទាំងអស់ទៅជាដើមវិញទេ?')) {
          onSettingsChange(DEFAULT_SETTINGS);
      }
  };

  const fontOptions: { label: string; script: ArabicScriptType; fontClass: string }[] = [
      { label: 'Uthmani', script: 'uthmani', fontClass: 'font-me-quran-volt' },
      { label: 'IndoPak', script: 'indopak', fontClass: 'font-pdms' },
      { label: 'Tajweed', script: 'uthmani_tajweed', fontClass: 'font-v4-tajweed' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-sm bg-white h-full shadow-2xl overflow-y-auto flex flex-col"
          >
            
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-20">
          <div className="flex bg-gray-100 p-1 rounded-xl w-full mr-4">
            <button 
              onClick={() => setActiveTab('display')}
              className={`flex-1 py-1.5 text-xs font-bold font-khmer rounded-lg transition-all ${activeTab === 'display' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ការបង្ហាញ
            </button>
            <button 
              onClick={() => setActiveTab('font')}
              className={`flex-1 py-1.5 text-xs font-bold font-khmer rounded-lg transition-all ${activeTab === 'font' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              អក្សរ
            </button>
            <button 
              onClick={() => setActiveTab('audio')}
              className={`flex-1 py-1.5 text-xs font-bold font-khmer rounded-lg transition-all ${activeTab === 'audio' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              សំឡេង
            </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors rounded-full shrink-0">
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-8 overflow-y-auto pb-24">
          
          {activeTab === 'display' && (
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-gray-50/80 rounded-2xl p-2 border border-gray-100 space-y-1">
                  <label className="flex items-center justify-between p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer group">
                      <div className="flex flex-col">
                          <span className="text-gray-900 font-bold font-khmer text-sm group-hover:text-emerald-700 transition-colors">បង្ហាញការបកប្រែ</span>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.showTranslation} onChange={(e) => updateSetting('showTranslation', e.target.checked)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </div>
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer group">
                      <div className="flex flex-col">
                          <span className="text-gray-900 font-bold font-khmer text-sm group-hover:text-emerald-700 transition-colors">បង្ហាញការអធិប្បាយ (Tafsir)</span>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.showTafsirInline} onChange={(e) => updateSetting('showTafsirInline', e.target.checked)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </div>
                  </label>

                  {/* Word Highlight Toggle */}
                  <label className="flex items-center justify-between p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer group">
                      <div className="flex flex-col">
                          <span className="text-gray-900 font-bold font-khmer text-sm group-hover:text-emerald-700 transition-colors">បង្ហាញពណ៌លើពាក្យតាមសំឡេង</span>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.wordHighlighting} onChange={(e) => updateSetting('wordHighlighting', e.target.checked)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </div>
                  </label>

                  {/* Word by Word Translation Toggle */}
                  <label className="flex items-center justify-between p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer group">
                      <div className="flex flex-col">
                          <span className="text-gray-900 font-bold font-khmer text-sm group-hover:text-emerald-700 transition-colors">បង្ហាញការបកប្រែពាក្យនីមួយៗ</span>
                          <span className="text-xs text-gray-500 mt-0.5">Word-by-Word Translation</span>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.showWordByWord} onChange={(e) => updateSetting('showWordByWord', e.target.checked)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </div>
                  </label>

                  {/* Tajweed Toggle */}
                  <label className="flex items-center justify-between p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer group">
                      <div className="flex flex-col">
                          <span className="text-gray-900 font-bold font-khmer text-sm group-hover:text-emerald-700 transition-colors">ពណ៌ចំណាំច្បាប់អាន</span>
                          <span className="text-xs text-gray-500 mt-0.5">Tajweed Color Coding</span>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.showTajweed} onChange={(e) => updateSetting('showTajweed', e.target.checked)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </div>
                  </label>
              </div>
            </section>
          )}

          {activeTab === 'audio' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
              {/* Reciter Section */}
              <section>
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest mb-4">
                    <HugeiconsIcon icon={VolumeHighIcon} strokeWidth={1.5} className="w-4 h-4" /> អ្នកសូត្រ (Reciter)
                </div>
                
                <div className="bg-gray-50/80 rounded-2xl p-2 border border-gray-100 space-y-1">
                    <label className="flex items-center justify-between p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer group">
                        <div className="flex flex-col">
                            <span className="text-gray-900 font-bold font-khmer text-sm group-hover:text-emerald-700 transition-colors">ចាក់អាយ៉ាត់បន្ទាប់ដោយស្វ័យប្រវត្តិ</span>
                        </div>
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={settings.autoPlayNext} onChange={(e) => updateSetting('autoPlayNext', e.target.checked)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </div>
                    </label>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2">
                    {RECITERS.map(r => (
                        <button 
                            key={r.id}
                            onClick={() => updateSetting('reciterId', r.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${settings.reciterId === r.id ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-200' : 'bg-white border-gray-100 hover:border-emerald-200'}`}
                        >
                            <img referrerPolicy="no-referrer" src={r.image || undefined} className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" alt={r.name} />
                            <div className="flex-1 text-left">
                                <p className={`text-sm font-bold ${settings.reciterId === r.id ? 'text-emerald-800' : 'text-gray-700'}`}>{r.name}</p>
                            </div>
                            {settings.reciterId === r.id && <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"><HugeiconsIcon icon={Tick01Icon} strokeWidth={1.5} className="w-3 h-3 text-white" /></div>}
                        </button>
                    ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 text-violet-600 font-bold text-xs uppercase tracking-widest mb-4">
                    <HugeiconsIcon icon={CleanIcon} strokeWidth={1.5} className="w-4 h-4" /> សំឡេង AI (Tafsir Reader)
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => updateSetting('ttsVoice', 'Fenrir')} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${settings.ttsVoice === 'Fenrir' ? 'bg-violet-50 border-violet-500' : 'bg-white border-transparent'}`}>
                        <HugeiconsIcon icon={UserIcon} strokeWidth={1.5} className="w-6 h-6 mb-1 text-gray-700" /> <span className="text-xs font-bold text-gray-900">ប្រុស</span>
                      </button>
                      <button onClick={() => updateSetting('ttsVoice', 'Kore')} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${settings.ttsVoice === 'Kore' ? 'bg-pink-50 border-pink-500' : 'bg-white border-transparent'}`}>
                        <HugeiconsIcon icon={UserIcon} strokeWidth={1.5} className="w-6 h-6 mb-1 text-gray-700" /> <span className="text-xs font-bold text-gray-900">ស្រី</span>
                      </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'font' && (
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Font Size Sliders */}
              <div className="space-y-6 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  {/* Arabic Font Size */}
                  <div>
                      <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-bold text-gray-700 font-khmer">ទំហំអក្សរអារ៉ាប់</label>
                          <span className="text-xs font-mono bg-emerald-100 text-emerald-700 px-2 py-1 rounded">{settings.arabicFontSize}px</span>
                      </div>
                      <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">A</span>
                          <input 
                              type="range" 
                              min="20" 
                              max="60" 
                              step="2"
                              value={settings.arabicFontSize} 
                              onChange={(e) => updateSetting('arabicFontSize', parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                          />
                          <span className="text-lg font-bold text-gray-600">A</span>
                      </div>
                  </div>

                  {/* Translation Font Size */}
                  <div>
                      <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-bold text-gray-700 font-khmer">ទំហំអក្សរបកប្រែ</label>
                          <span className="text-xs font-mono bg-emerald-100 text-emerald-700 px-2 py-1 rounded">{settings.translationFontSize}px</span>
                      </div>
                      <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">A</span>
                          <input 
                              type="range" 
                              min="14" 
                              max="30" 
                              step="1"
                              value={settings.translationFontSize} 
                              onChange={(e) => updateSetting('translationFontSize', parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                          />
                          <span className="text-lg font-bold text-gray-600">A</span>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 gap-2 mb-4">
                  {fontOptions.map((s, idx) => (
                      <button key={idx} onClick={() => handleFontChange(s.script, s.fontClass)} className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${settings.fontClass === s.fontClass ? 'border-emerald-500 bg-emerald-50' : 'bg-gray-50 border-transparent'}`}>
                          <span className="font-medium text-sm text-gray-900">{s.label}</span>
                          <span className={`${s.fontClass} text-2xl`} style={{ color: settings.fontClass === s.fontClass ? '#064e3b' : '#000000' }}>الله</span>
                      </button>
                  ))}
              </div>
            </section>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 sticky bottom-0 z-20 backdrop-blur-sm">
            <button onClick={handleReset} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-500 hover:text-red-500 transition-all text-sm font-bold font-khmer">
                <HugeiconsIcon icon={ReloadIcon} strokeWidth={1.5} className="w-4 h-4" /> កំណត់ដើមវិញ (Reset)
            </button>
        </div>
      </motion.div>
    </div>
      )}
    </AnimatePresence>
  );
};
