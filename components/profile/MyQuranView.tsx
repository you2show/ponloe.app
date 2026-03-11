import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Bookmark01Icon, Edit02Icon, Clock01Icon, ArrowRight01Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { fetchSurahs } from '../quran/api';
import { Surah } from '../quran/types';
import { useQuery } from '@tanstack/react-query';

export const MyQuranView: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'saved' | 'recent' | 'notes'>('saved');
  
  const { data: surahs = [], isLoading: isLoadingSurahs } = useQuery({
    queryKey: ['surahs'],
    queryFn: () => fetchSurahs(),
    staleTime: Infinity,
  });
  
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const loading = isLoadingSurahs || loadingData;

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        if (user) {
          // Load Bookmarks
          const { data: bookmarksData } = await supabase
            .from('quran_bookmarks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (bookmarksData) setBookmarks(bookmarksData);

          // Load Notes
          const { data: notesData } = await supabase
            .from('quran_notes')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });
          if (notesData) setNotes(notesData);

          // Load Recent (Reading Goals or just local storage for now)
          const savedLastRead = localStorage.getItem('ponloe_quran_last_read_surah');
          if (savedLastRead) {
            setRecent([JSON.parse(savedLastRead)]);
          }
        } else {
          // Load from Local Storage
          const savedBookmarks = localStorage.getItem('ponloe_quran_bookmarks');
          if (savedBookmarks) {
            const parsed = JSON.parse(savedBookmarks);
            const formatted = parsed.map((b: string) => {
              const [surah_id, ayah_id] = b.split(':');
              return { surah_id: parseInt(surah_id), ayah_id: parseInt(ayah_id) };
            });
            setBookmarks(formatted);
          }

          const savedNotes = localStorage.getItem('ponloe_quran_notes');
          if (savedNotes) {
            const parsed = JSON.parse(savedNotes);
            const formatted = Object.keys(parsed).map(key => {
              const [surah_id, ayah_id] = key.split(':');
              return { surah_id: parseInt(surah_id), ayah_id: parseInt(ayah_id), note_text: parsed[key] };
            });
            setNotes(formatted);
          }

          const savedLastRead = localStorage.getItem('ponloe_quran_last_read_surah');
          if (savedLastRead) {
            setRecent([JSON.parse(savedLastRead)]);
          }
        }
      } catch (err) {
        console.error('Error loading quran data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [user]);

  const getSurahName = (id: number) => {
    const surah = surahs.find(s => s.id === id);
    return surah ? surah.name_simple : `Surah ${id}`;
  };

  const handleNavigate = (surahId: number, ayahId?: number) => {
    // Navigate to Quran view (this would depend on your routing setup)
    // For now, we'll just dispatch a custom event that the main App can listen to
    window.dispatchEvent(new CustomEvent('navigate-to-quran', { 
      detail: { surahId, ayahId } 
    }));
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all font-khmer whitespace-nowrap ${
            activeTab === 'saved' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {t('profile.saved')}
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all font-khmer whitespace-nowrap ${
            activeTab === 'recent' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {t('profile.recent')}
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all font-khmer whitespace-nowrap ${
            activeTab === 'notes' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {t('profile.notes')}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">កំពុងទាញយកទិន្នន័យ...</div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'saved' && (
            bookmarks.length === 0 ? (
              <div className="text-center py-10 text-gray-400 font-khmer bg-white rounded-2xl border border-gray-100">{t('profile.noSaved')}</div>
            ) : (
              bookmarks.map((b, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleNavigate(b.surah_id, b.ayah_id)}
                  className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center justify-between group hover:border-emerald-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <HugeiconsIcon icon={Bookmark01Icon} strokeWidth={1.5} className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{getSurahName(b.surah_id)}</h4>
                      <p className="text-sm text-gray-500">{t('quran.ayah')} {b.ayah_id}</p>
                    </div>
                  </div>
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="w-5 h-5 text-gray-300 group-hover:text-emerald-500" />
                </div>
              ))
            )
          )}

          {activeTab === 'recent' && (
            recent.length === 0 ? (
              <div className="text-center py-10 text-gray-400 font-khmer bg-white rounded-2xl border border-gray-100">{t('profile.noRecent')}</div>
            ) : (
              recent.map((r, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleNavigate(r.id)}
                  className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center justify-between group hover:border-emerald-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <HugeiconsIcon icon={Clock01Icon} strokeWidth={1.5} className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{r.name_simple}</h4>
                      <p className="text-sm text-gray-500 font-khmer">{r.name_khmer}</p>
                    </div>
                  </div>
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="w-5 h-5 text-gray-300 group-hover:text-emerald-500" />
                </div>
              ))
            )
          )}

          {activeTab === 'notes' && (
            notes.length === 0 ? (
              <div className="text-center py-10 text-gray-400 font-khmer bg-white rounded-2xl border border-gray-100">{t('profile.noNotes')}</div>
            ) : (
              notes.map((n, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-emerald-200 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                        {getSurahName(n.surah_id)} {n.surah_id}:{n.ayah_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <HugeiconsIcon icon={Edit02Icon} strokeWidth={1.5} className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.5} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 font-khmer leading-relaxed whitespace-pre-wrap">{n.note_text}</p>
                </div>
              ))
            )
          )}
        </div>
      )}
    </div>
  );
};
