import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, ClipboardIcon, CloudIcon, Coffee01Icon, FloppyDiskIcon, MinusSignIcon, Moon01Icon, ReloadIcon, StarIcon, Sun01Icon, SunriseIcon, SunsetIcon, Tick01Icon } from '@hugeicons/core-free-icons';


import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';


interface QadaData {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  witir: number;
  fasting: number;
}

const DEFAULT_DATA: QadaData = {
  fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witir: 0, fasting: 0
};

export const QadaView: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<QadaData>(DEFAULT_DATA);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const { user } = useAuth();

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [user]);

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('ponloe_qada_data', JSON.stringify(data));
  }, [data]);

  const loadData = async () => {
    // First load from localStorage
    const saved = localStorage.getItem('ponloe_qada_data');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing local qada data:', e);
      }
    }

    // Then try to load from Supabase if logged in
    if (user && supabase) {
      try {
        const { data: cloudData, error } = await supabase
          .from('user_settings')
          .select('value, updated_at')
          .eq('user_id', user.id)
          .eq('key', 'qada_data')
          .single();

        if (!error && cloudData) {
          const cloudQada = cloudData.value as QadaData;
          // Use cloud data if it exists
          setData(cloudQada);
          localStorage.setItem('ponloe_qada_data', JSON.stringify(cloudQada));
          setLastSynced(new Date(cloudData.updated_at).toLocaleString('km-KH'));
        }
      } catch (error) {
        // Table might not exist, use local data
        console.log('Cloud sync not available, using local data');
      }
    }
  };

  const syncToCloud = useCallback(async () => {
    if (!user || !supabase) {
      showToast('សូមចូលគណនីដើម្បីរក្សាទុកទៅ Cloud', 'info');
      return;
    }

    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          key: 'qada_data',
          value: data,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,key'
        });

      if (error) throw error;

      setLastSynced(new Date().toLocaleString('km-KH'));
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 2000);
    } catch (error) {
      console.error('Error syncing to cloud:', error);
      // Try alternative: save to profiles extra_data
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            extra_data: { qada: data }
          })
          .eq('id', user.id);
        
        if (profileError) throw profileError;
        
        setLastSynced(new Date().toLocaleString('km-KH'));
        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 2000);
      } catch (e) {
        showToast('មានបញ្ហាក្នុងការរក្សាទុក សូមព្យាយាមម្ដងទៀត', 'error');
      }
    } finally {
      setIsSyncing(false);
    }
  }, [user, data]);

  const updateCount = (key: keyof QadaData, delta: number) => {
    setData(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta)
    }));
  };

  const manualSet = (key: keyof QadaData, value: string) => {
      const num = parseInt(value);
      if (!isNaN(num) && num >= 0) {
          setData(prev => ({ ...prev, [key]: num }));
      }
  };

  const items = [
    { key: 'fajr', label: 'ស៊ូបុហ', icon: SunriseIcon, color: 'text-orange-500', bg: 'bg-orange-50' },
    { key: 'dhuhr', label: 'ហ្ស៊ូហ៊ួរ', icon: Sun01Icon, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { key: 'asr', label: 'អាសើរ', icon: CloudIcon, color: 'text-blue-500', bg: 'bg-blue-50' },
    { key: 'maghrib', label: 'ម៉ាហ្គ្រិប', icon: SunsetIcon, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { key: 'isha', label: 'អ៊ីស្សា', icon: Moon01Icon, color: 'text-slate-600', bg: 'bg-slate-100' },
    { key: 'witir', label: 'វីទិរ', icon: StarIcon, color: 'text-purple-500', bg: 'bg-purple-50' },
    { key: 'fasting', label: 'បួស (ថ្ងៃ)', icon: Coffee01Icon, color: 'text-emerald-600', bg: 'bg-emerald-50', isFasting: true },
  ];

  const totalPrayers = data.fajr + data.dhuhr + data.asr + data.maghrib + data.isha + data.witir;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-in fade-in duration-300 font-khmer">
      
      {/* Save Toast */}
      {showSaveToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
          <HugeiconsIcon icon={Tick01Icon} strokeWidth={1.5} className="w-5 h-5" />
          <span className="text-sm font-bold">រក្សាទុកទៅ Cloud ជោគជ័យ!</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#1e293b] text-white pt-10 pb-24 px-6 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2 justify-center">
               <HugeiconsIcon icon={ClipboardIcon} strokeWidth={1.5} className="w-8 h-8 text-emerald-400" />
               <h1 className="text-2xl font-bold">កំណត់ត្រាការសង (Qada)</h1>
            </div>
            <p className="text-slate-300 text-sm text-center max-w-md mx-auto">
               កត់ត្រាចំនួនសឡាត និងការបួសដែលអ្នកបានខកខាន ដើម្បីងាយស្រួលក្នុងការសងវិញ។
            </p>
            
            {/* Cloud Sync Button */}
            <div className="flex justify-center mt-4">
              <button 
                onClick={syncToCloud}
                disabled={isSyncing}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-50"
              >
                <HugeiconsIcon icon={CloudIcon} strokeWidth={1.5} className={`w-4 h-4 ${isSyncing ? 'animate-pulse' : ''}`} />
                <span>{isSyncing ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកទៅ Cloud'}</span>
              </button>
            </div>
            {lastSynced && (
              <p className="text-slate-400 text-[10px] text-center mt-2">
                រក្សាទុកចុងក្រោយ: {lastSynced}
              </p>
            )}
         </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-16 relative z-20 space-y-6">
         
         {/* Summary Card */}
         <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex justify-around text-center divide-x divide-gray-100">
            <div className="px-4">
                <span className="block text-3xl font-bold text-slate-800">{totalPrayers}</span>
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">សឡាតសរុប</span>
            </div>
            <div className="px-4">
                <span className="block text-3xl font-bold text-emerald-600">{data.fasting}</span>
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">ថ្ងៃបួស</span>
            </div>
         </div>

         {/* Trackers Grid */}
         <div className="grid grid-cols-1 gap-4">
            {items.map((item) => (
                <div key={item.key} className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between transition-all ${item.isFasting ? 'ring-2 ring-emerald-500/20' : ''}`}>
                    
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center shrink-0`}>
                            <HugeiconsIcon icon={item.icon} strokeWidth={1.5} className={`w-6 h-6 ${item.color}`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">{item.label}</h3>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                <span className={data[item.key as keyof QadaData] > 0 ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
                                    {data[item.key as keyof QadaData] > 0 ? 'នៅខ្វះ' : 'គ្រប់ចំនួន'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => updateCount(item.key as keyof QadaData, -1)}
                            className="w-10 h-10 rounded-full border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all active:scale-95"
                        >
                            <HugeiconsIcon icon={MinusSignIcon} strokeWidth={1.5} className="w-5 h-5" />
                        </button>
                        
                        <input 
                            type="number" 
                            value={data[item.key as keyof QadaData]}
                            onChange={(e) => manualSet(item.key as keyof QadaData, e.target.value)}
                            className="w-16 text-center text-xl font-bold text-gray-800 focus:outline-none focus:text-emerald-600 bg-transparent"
                        />

                        <button 
                            onClick={() => updateCount(item.key as keyof QadaData, 1)}
                            className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-lg hover:bg-slate-700 transition-all active:scale-95"
                        >
                            <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} className="w-5 h-5" />
                        </button>
                    </div>

                </div>
            ))}
         </div>

         {/* Footer Action */}
         <div className="text-center pb-8 pt-4 space-y-3">
             <button 
                onClick={() => {
                    if(confirm("តើអ្នកចង់កំណត់ចំនួនទាំងអស់ទៅជា ០ វិញមែនទេ?")) {
                        setData(DEFAULT_DATA);
                    }
                }}
                className="text-sm text-gray-400 hover:text-red-500 flex items-center justify-center gap-2 mx-auto transition-colors"
             >
                <HugeiconsIcon icon={ReloadIcon} strokeWidth={1.5} className="w-4 h-4" /> កំណត់ឡើងវិញ (Reset)
             </button>
             <p className="text-[10px] text-gray-300">
               ទិន្នន័យត្រូវបានរក្សាទុកដោយស្វ័យប្រវត្តិនៅក្នុងឧបករណ៍របស់អ្នក
             </p>
         </div>

      </div>
    </div>
  );
};
