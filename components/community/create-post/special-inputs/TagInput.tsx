import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserGroupIcon, Tick01Icon } from '@hugeicons/core-free-icons';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { SpecialInputProps } from './types';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';

export const TagInput: React.FC<SpecialInputProps & { tagged?: string[] }> = ({ onCancel, onSave, tagged = [] }) => {
    const { theme } = useTheme();
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<string[]>(tagged);

    const fetchFriends = async () => {
        if (!user || !supabase) return [];
        
        const { data, error } = await supabase
            .from('follows')
            .select(`
                following_id,
                profiles!follows_following_id_fkey (
                    id,
                    full_name,
                    avatar_url
                )
            `)
            .eq('follower_id', user.id);

        if (error) throw error;

        if (data) {
            return data
                .map((item: any) => ({
                    id: item.profiles.id,
                    name: item.profiles.full_name || 'អ្នកប្រើប្រាស់',
                    avatar: item.profiles.avatar_url || `https://ui-avatars.com/api/?name=${item.profiles.full_name || 'User'}&background=random`
                }))
                // Filter out duplicates just in case
                .filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
        }
        return [];
    };

    const { data: friends = [], isLoading: loading } = useQuery({
        queryKey: ['friends', user?.id],
        queryFn: fetchFriends,
        enabled: !!user && !!supabase,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const filtered = friends.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

    const toggleFriend = (name: string) => {
        const newSelected = selected.includes(name) 
            ? selected.filter(s => s !== name)
            : [...selected, name];
        setSelected(newSelected);
        if(onSave) onSave(newSelected);
    };

    return (
        <div className={`p-4 rounded-xl border mb-4 animate-in fade-in zoom-in-95 flex flex-col h-64 ${theme === 'dark' ? 'bg-blue-900/20 border-blue-800/50' : 'bg-blue-50 border-blue-100'}`}>
            <div className="flex justify-between items-center mb-3">
                <h4 className={`font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-blue-100' : 'text-blue-800'}`}>
                    <HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.5} className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : ''}`}/> Tag មិត្តភក្តិ
                </h4>
                <button onClick={onCancel} className={`text-xs hover:text-red-500 ${theme === 'dark' ? 'text-blue-400/70 hover:text-red-400' : 'text-blue-500'}`}>រួចរាល់</button>
            </div>
            <input 
                type="text" 
                placeholder="ស្វែងរក..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`w-full p-2 rounded-lg border text-sm mb-2 outline-none ${theme === 'dark' ? 'bg-slate-800 border-blue-800/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50' : 'bg-white border-blue-200 focus:ring-2 focus:ring-blue-400'}`}
            />
            <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                {loading ? (
                    <div className={`text-center text-xs py-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`}>កំពុងផ្ទុក...</div>
                ) : filtered.length > 0 ? (
                    filtered.map(f => (
                        <div key={f.id} onClick={() => toggleFriend(f.name)} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-white'}`}>
                            <div className="flex items-center gap-2">
                                <img src={f.avatar} alt={f.name} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-gray-700'}`}>{f.name}</span>
                            </div>
                            {selected.includes(f.name) && <HugeiconsIcon icon={Tick01Icon} strokeWidth={1.5} className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />}
                        </div>
                    ))
                ) : (
                    <div className={`text-center text-xs py-4 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>មិនមានទិន្នន័យទេ</div>
                )}
            </div>
        </div>
    );
};
