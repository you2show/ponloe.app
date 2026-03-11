import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { BookOpen01Icon, Loading02Icon, RefreshIcon, ViewIcon, ViewOffIcon, Tick01Icon } from '@hugeicons/core-free-icons';
import { KHMER_SURAH_NAMES, fetchAyahDetails } from '../../../quran/api';
import { useToast } from '@/contexts/ToastContext';
import { SearchableSurahSelect } from './SearchableSurahSelect';
import { SpecialInputProps } from './types';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';

export const QuranInput: React.FC<SpecialInputProps & { onSave?: (data: any) => void, onInsert?: (data: any) => void }> = ({ onCancel, onSave, onInsert }) => {
  const { showToast } = useToast();
  const { theme } = useTheme();
  const [surahId, setSurahId] = useState<number>(1);
  const [ayahNum, setAyahNum] = useState<string>('');
  const [editedTranslation, setEditedTranslation] = useState('');
  const [showTranslation, setShowTranslation] = useState(true);
  const [shouldFetch, setShouldFetch] = useState(false);

  const { data: fetchedData, isLoading: loading, error, isSuccess } = useQuery({
    queryKey: ['ayahDetails', surahId, ayahNum],
    queryFn: () => fetchAyahDetails(surahId, parseInt(ayahNum)),
    enabled: shouldFetch && !!ayahNum,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (isSuccess && fetchedData) {
      setEditedTranslation(fetchedData.translation);
      setShouldFetch(false);
    } else if (isSuccess && !fetchedData) {
      showToast('រកមិនឃើញអាយ៉ាត់នេះទេ។', 'error');
      if (onSave) onSave(null);
      setShouldFetch(false);
    }
  }, [isSuccess, fetchedData, showToast, onSave]);

  useEffect(() => {
    if (error) {
      showToast('មានបញ្ហាក្នុងការទាញយកទិន្នន័យ។', 'error');
      setShouldFetch(false);
    }
  }, [error, showToast]);

  // Auto-propagate data to parent when state changes
  useEffect(() => {
      if (onSave && fetchedData) {
          onSave({
              surahName: KHMER_SURAH_NAMES[surahId],
              ayahNumber: parseInt(ayahNum),
              arabicText: fetchedData.arabic,
              translation: showTranslation ? editedTranslation : ''
          });
      }
  }, [fetchedData, editedTranslation, showTranslation, onSave, surahId, ayahNum]);

  const handleFetch = () => {
      if (!ayahNum) return;
      setShouldFetch(true);
  };

  return (
    <div className={`p-4 rounded-xl border mb-4 animate-in fade-in zoom-in-95 space-y-4 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-emerald-50 border-emerald-100'}`}>
        <div className="flex justify-between items-center">
          <h4 className={`font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-700'}`}>
            <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className="w-5 h-5 text-emerald-600"/> ជ្រើសរើសអាយ៉ាត់គម្ពីរ
          </h4>
          <button onClick={onCancel} className={`text-xs hover:text-red-500 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>លុបចោល</button>
        </div>
        
        {/* Controls */}
        <div className="grid grid-cols-5 gap-3 items-end">
            <div className="col-span-3">
              <SearchableSurahSelect 
                selectedId={surahId} 
                onSelect={(id) => {
                    setSurahId(id);
                    setShouldFetch(false);
                    if (onSave) onSave(null);
                }} 
              />
            </div>
            <div>
              <label className={`text-[10px] font-bold mb-1 block uppercase ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>អាយ៉ាត់ (Ayah)</label>
              <input 
                type="number" 
                value={ayahNum}
                onChange={(e) => {
                    setAyahNum(e.target.value);
                    setShouldFetch(false);
                    if (onSave) onSave(null);
                }}
                placeholder="1" 
                className={`w-full p-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-emerald-200 text-gray-900'}`} 
              />
            </div>
            <button 
                onClick={handleFetch}
                disabled={loading || !ayahNum}
                className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center disabled:opacity-50"
            >
                {loading ? <HugeiconsIcon icon={Loading02Icon} strokeWidth={1.5} className="w-5 h-5 animate-spin" /> : <HugeiconsIcon icon={RefreshIcon} strokeWidth={1.5} className="w-5 h-5" />}
            </button>
        </div>

        {/* Result Area */}
        {fetchedData && (
            <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm animate-in slide-in-from-top-2">
                <p className="font-uthman-hafs-v17 text-2xl text-emerald-900 mb-4 text-center leading-loose" dir="rtl">
                    {fetchedData.arabic}
                </p>
                
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">ការបកប្រែ (Translation)</label>
                    <button 
                        onClick={() => setShowTranslation(!showTranslation)}
                        className="text-emerald-600 hover:bg-emerald-50 p-1 rounded transition-colors"
                        title={showTranslation ? "Hide Translation" : "Show Translation"}
                    >
                        {showTranslation ? <HugeiconsIcon icon={ViewIcon} strokeWidth={1.5} className="w-4 h-4"/> : <HugeiconsIcon icon={ViewOffIcon} strokeWidth={1.5} className="w-4 h-4"/>}
                    </button>
                </div>

                {showTranslation && (
                    <textarea 
                        value={editedTranslation}
                        onChange={(e) => setEditedTranslation(e.target.value)}
                        className="w-full p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm font-khmer text-gray-700 leading-relaxed outline-none focus:border-emerald-300 resize-none h-24"
                    />
                )}

                {onInsert && (
                    <button 
                        onClick={() => onInsert({
                            surahName: KHMER_SURAH_NAMES[surahId],
                            ayahNumber: parseInt(ayahNum),
                            arabicText: fetchedData.arabic,
                            translation: showTranslation ? editedTranslation : ''
                        })}
                        className="w-full mt-4 p-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <HugeiconsIcon icon={Tick01Icon} strokeWidth={1.5} className="w-5 h-5" />
                        បញ្ចូលអាយ៉ាត់ (Insert Ayah)
                    </button>
                )}
            </div>
        )}
    </div>
  );
};
