import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Ramadhan01Icon, CheckmarkCircle01Icon } from '@hugeicons/core-free-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface RamadanMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RamadanMissionModal: React.FC<RamadanMissionModalProps> = ({ isOpen, onClose }) => {
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (isOpen) {
      if (user) {
        loadProgressFromSupabase();
      } else {
        const savedProgress = localStorage.getItem('quran_ramadan_mission');
        if (savedProgress) {
          setCompletedDays(JSON.parse(savedProgress));
        }
      }
    }
  }, [isOpen, user]);

  const loadProgressFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('quran_ramadan_missions')
        .select('completed_days')
        .eq('user_id', user!.id)
        .eq('year', currentYear)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading ramadan mission:', error);
        return;
      }
      
      if (data && data.completed_days) {
        setCompletedDays(data.completed_days);
      }
    } catch (err) {
      console.error('Failed to load ramadan mission:', err);
    }
  };

  const toggleDay = async (day: number) => {
    let newCompletedDays;
    if (completedDays.includes(day)) {
      newCompletedDays = completedDays.filter(d => d !== day);
    } else {
      newCompletedDays = [...completedDays, day];
    }
    setCompletedDays(newCompletedDays);
    
    if (user) {
      try {
        const { error } = await supabase
          .from('quran_ramadan_missions')
          .upsert({
            user_id: user.id,
            year: currentYear,
            completed_days: newCompletedDays,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,year' });
          
        if (error) console.error('Error saving ramadan mission:', error);
      } catch (err) {
        console.error('Failed to save ramadan mission:', err);
      }
    } else {
      localStorage.setItem('quran_ramadan_mission', JSON.stringify(newCompletedDays));
    }
  };

  if (!isOpen) return null;

  const totalDays = 30;
  const progressPercentage = Math.round((completedDays.length / totalDays) * 100);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className={`${isDark ? 'bg-slate-900' : 'bg-white'} w-full max-w-2xl rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <HugeiconsIcon icon={Ramadhan01Icon} strokeWidth={1.5} className="w-5 h-5" />
            </div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'} font-khmer`}>បេសកកម្មខែរ៉ាម៉ាដន</h3>
          </div>
          <button onClick={onClose} className={`p-2 ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-400 hover:bg-gray-100'} rounded-full transition-colors`}>
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 shrink-0">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'} font-khmer mb-1`}>វឌ្ឍនភាពរបស់អ្នក</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{completedDays.length}</span>
                <span className={`${isDark ? 'text-slate-500' : 'text-gray-400'} font-medium`}>/ 30 ថ្ងៃ</span>
              </div>
            </div>
            <span className="text-sm font-bold text-amber-600">{progressPercentage}% បញ្ចប់</span>
          </div>
          <div className={`h-4 ${isDark ? 'bg-slate-700' : 'bg-gray-100'} rounded-full overflow-hidden mt-2 relative`}>
            <div 
              className="absolute top-0 left-0 h-full bg-amber-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} font-khmer mt-4 leading-relaxed`}>
            ចូលរួមអានគម្ពីរគូរអានឱ្យចប់ក្នុងខែរ៉ាម៉ាដន ដោយអានមួយជូស (Juz) ជារៀងរាល់ថ្ងៃ។ សូមអល់ឡោះប្រទានពរជ័យដល់ការខិតខំប្រឹងប្រែងរបស់អ្នក។
          </p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
              const isCompleted = completedDays.includes(day);
              return (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`relative p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 group ${
                    isCompleted
                      ? isDark ? 'bg-amber-900/40 border-amber-700 shadow-sm' : 'bg-amber-50 border-amber-200 shadow-sm'
                      : isDark ? 'bg-slate-800 border-slate-700 hover:border-amber-600 hover:bg-amber-900/20' : 'bg-white border-gray-100 hover:border-amber-200 hover:bg-amber-50/50'
                  }`}
                >
                  {isCompleted && (
                    <div className="absolute top-2 right-2 text-amber-500">
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="w-4 h-4" />
                    </div>
                  )}
                  <span className={`text-2xl font-bold ${isCompleted ? (isDark ? 'text-amber-400' : 'text-amber-700') : (isDark ? 'text-slate-300 group-hover:text-amber-400' : 'text-gray-700 group-hover:text-amber-600')}`}>
                    {day}
                  </span>
                  <span className={`text-[10px] uppercase tracking-wider font-medium ${isCompleted ? (isDark ? 'text-amber-500/70' : 'text-amber-600/70') : (isDark ? 'text-slate-500' : 'text-gray-400')}`}>
                    Juz {day}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        
        {progressPercentage === 100 && (
          <div className={`mt-6 ${isDark ? 'bg-amber-900/30 border-amber-800 text-amber-300' : 'bg-amber-50 border-amber-100 text-amber-800'} border rounded-2xl p-4 flex items-center gap-3 shrink-0`}>
            <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="w-6 h-6 text-amber-500 shrink-0" />
            <p className="text-sm font-khmer font-medium">ម៉ាសាអល់ឡោះ! អ្នកបានបញ្ចប់បេសកកម្មអានគម្ពីរគូរអានក្នុងខែរ៉ាម៉ាដនហើយ។ សូមអល់ឡោះទទួលយកការប្រតិបត្តិរបស់អ្នក។</p>
          </div>
        )}
      </div>
    </div>
  );
};
