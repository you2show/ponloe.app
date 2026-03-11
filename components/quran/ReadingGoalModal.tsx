import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Target01Icon, CheckmarkCircle01Icon, Edit02Icon } from '@hugeicons/core-free-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface ReadingGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReadingGoalModal: React.FC<ReadingGoalModalProps> = ({ isOpen, onClose }) => {
  const [goalType, setGoalType] = useState<'ayahs' | 'pages' | 'time'>('ayahs');
  const [goalAmount, setGoalAmount] = useState<number>(50);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen) {
      if (user) {
        loadGoalFromSupabase();
      } else {
        const savedGoal = localStorage.getItem('quran_reading_goal');
        if (savedGoal) {
          const parsed = JSON.parse(savedGoal);
          setGoalType(parsed.type || 'ayahs');
          setGoalAmount(parsed.amount || 50);
        }
        
        // Load today's progress
        const savedProgress = localStorage.getItem(`quran_progress_${today}`);
        if (savedProgress) {
          setCurrentProgress(parseInt(savedProgress, 10));
        } else {
          setCurrentProgress(0);
        }
      }
    }
  }, [isOpen, user]);

  const loadGoalFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('quran_reading_goals')
        .select('*')
        .eq('user_id', user!.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading reading goal:', error);
        return;
      }
      
      if (data) {
        setGoalType(data.goal_type);
        setGoalAmount(data.goal_amount);
        
        // Reset progress if it's a new day
        if (data.last_updated_date !== today) {
          setCurrentProgress(0);
          // Update the date in DB asynchronously
          supabase.from('quran_reading_goals')
            .update({ current_progress: 0, last_updated_date: today })
            .eq('user_id', user!.id)
            .then();
        } else {
          setCurrentProgress(data.current_progress);
        }
      }
    } catch (err) {
      console.error('Failed to load reading goal:', err);
    }
  };

  const handleSaveGoal = async () => {
    if (user) {
      try {
        const { error } = await supabase
          .from('quran_reading_goals')
          .upsert({
            user_id: user.id,
            goal_type: goalType,
            goal_amount: goalAmount,
            current_progress: currentProgress,
            last_updated_date: today,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
          
        if (error) console.error('Error saving reading goal:', error);
      } catch (err) {
        console.error('Failed to save reading goal:', err);
      }
    } else {
      localStorage.setItem('quran_reading_goal', JSON.stringify({
        type: goalType,
        amount: goalAmount
      }));
    }
    setIsEditing(false);
  };

  const handleUpdateProgress = async (amount: number) => {
    const newProgress = Math.min(Math.max(0, currentProgress + amount), goalAmount);
    setCurrentProgress(newProgress);
    
    if (user) {
      try {
        const { error } = await supabase
          .from('quran_reading_goals')
          .upsert({
            user_id: user.id,
            goal_type: goalType,
            goal_amount: goalAmount,
            current_progress: newProgress,
            last_updated_date: today,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
          
        if (error) console.error('Error updating progress:', error);
      } catch (err) {
        console.error('Failed to update progress:', err);
      }
    } else {
      localStorage.setItem(`quran_progress_${today}`, newProgress.toString());
    }
  };

  if (!isOpen) return null;

  const progressPercentage = Math.min(100, Math.round((currentProgress / goalAmount) * 100));

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className={`${isDark ? 'bg-slate-900' : 'bg-white'} w-full max-w-md rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-300`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <HugeiconsIcon icon={Target01Icon} strokeWidth={1.5} className="w-5 h-5" />
            </div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'} font-khmer`}>គោលដៅអានគម្ពីរ</h3>
          </div>
          <button onClick={onClose} className={`p-2 ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-400 hover:bg-gray-100'} rounded-full transition-colors`}>
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
          </button>
        </div>

        {isEditing ? (
          <div className={`space-y-4 mb-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'} p-4 rounded-2xl border`}>
            <h4 className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-900'} font-khmer mb-3`}>កំណត់គោលដៅប្រចាំថ្ងៃរបស់អ្នក</h4>
            
            <div>
              <label className={`block text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} font-khmer mb-2`}>ប្រភេទគោលដៅ</label>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setGoalType('ayahs')}
                  className={`py-2 rounded-xl text-sm font-khmer transition-colors ${goalType === 'ayahs' ? 'bg-emerald-600 text-white' : isDark ? 'bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  អាយ៉ាត់
                </button>
                <button 
                  onClick={() => setGoalType('pages')}
                  className={`py-2 rounded-xl text-sm font-khmer transition-colors ${goalType === 'pages' ? 'bg-emerald-600 text-white' : isDark ? 'bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  ទំព័រ
                </button>
                <button 
                  onClick={() => setGoalType('time')}
                  className={`py-2 rounded-xl text-sm font-khmer transition-colors ${goalType === 'time' ? 'bg-emerald-600 text-white' : isDark ? 'bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  នាទី
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} font-khmer mb-2`}>ចំនួន</label>
              <input 
                type="number" 
                value={goalAmount}
                onChange={(e) => setGoalAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className={`w-full p-3 ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400' : 'bg-white border-gray-200 text-gray-900'} border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-khmer`}
              />
            </div>

            <button 
              onClick={handleSaveGoal}
              className="w-full py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors font-khmer mt-2"
            >
              រក្សាទុកគោលដៅ
            </button>
          </div>
        ) : (
          <div className="mb-8">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'} font-khmer mb-1`}>វឌ្ឍនភាពថ្ងៃនេះ</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{currentProgress}</span>
                  <span className={`${isDark ? 'text-slate-500' : 'text-gray-400'} font-medium`}>/ {goalAmount} {goalType === 'ayahs' ? 'អាយ៉ាត់' : goalType === 'pages' ? 'ទំព័រ' : 'នាទី'}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className={`p-2 ${isDark ? 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-900/30' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'} rounded-full transition-colors`}
                title="កែប្រែគោលដៅ"
              >
                <HugeiconsIcon icon={Edit02Icon} strokeWidth={1.5} className="w-5 h-5" />
              </button>
            </div>
            
            <div className={`h-4 ${isDark ? 'bg-slate-700' : 'bg-gray-100'} rounded-full overflow-hidden mt-4 relative`}>
              <div 
                className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-right text-xs text-emerald-600 font-medium mt-2">{progressPercentage}% បញ្ចប់</p>
          </div>
        )}

        {!isEditing && (
          <div className="space-y-3">
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'} font-khmer text-center mb-4`}>កត់ត្រាការអានរបស់អ្នកថ្ងៃនេះ</p>
            <div className="grid grid-cols-4 gap-2">
              <button onClick={() => handleUpdateProgress(1)} className={`py-2 ${isDark ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'} rounded-xl font-medium transition-colors`}>+1</button>
              <button onClick={() => handleUpdateProgress(5)} className={`py-2 ${isDark ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'} rounded-xl font-medium transition-colors`}>+5</button>
              <button onClick={() => handleUpdateProgress(10)} className={`py-2 ${isDark ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'} rounded-xl font-medium transition-colors`}>+10</button>
              <button onClick={() => handleUpdateProgress(50)} className={`py-2 ${isDark ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'} rounded-xl font-medium transition-colors`}>+50</button>
            </div>
            
            {progressPercentage >= 100 && (
              <div className={`mt-6 ${isDark ? 'bg-emerald-900/30 border-emerald-800 text-emerald-300' : 'bg-emerald-50 border-emerald-100 text-emerald-800'} border rounded-2xl p-4 flex items-center gap-3`}>
                <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="w-6 h-6 text-emerald-500 shrink-0" />
                <p className="text-sm font-khmer font-medium">អបអរសាទរ! អ្នកបានសម្រេចគោលដៅអានរបស់អ្នកសម្រាប់ថ្ងៃនេះហើយ។</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
