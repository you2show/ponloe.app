import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, FavouriteIcon, Copy01Icon, Tick01Icon, FilterIcon, Baby01Icon, UserIcon, CleanIcon } from '@hugeicons/core-free-icons';

import React, { useState, useEffect } from 'react';


interface NameEntry {
  id: string;
  arabic: string;
  latin: string;
  khmer: string;
  meaning: string;
  gender: 'male' | 'female' | 'unisex';
  common_khmer_nicknames?: string[]; // Popular shortcuts in Cambodia (e.g., Math for Muhammad)
  popular: boolean;
}

const NAME_DATABASE: NameEntry[] = [
  // Male Names
  { id: '1', arabic: 'مُحَمَّد', latin: 'Muhammad', khmer: 'មូហាំម៉ាត់', meaning: 'អ្នកដែលត្រូវបានគេសរសើរ', gender: 'male', common_khmer_nicknames: ['ម៉ាត់', 'ម៉ាន', 'ហាំម៉ាត់'], popular: true },
  { id: '2', arabic: 'عَبْدُ الله', latin: 'Abdullah', khmer: 'អាប់ឌុលឡោះ', meaning: 'បាវបម្រើរបស់អល់ឡោះ', gender: 'male', common_khmer_nicknames: ['ឡោះ', 'ស្លោះ', 'ឌុល'], popular: true },
  { id: '3', arabic: 'إِبْرَاهِيم', latin: 'Ibrahim', khmer: 'អ៊ីព្រហ៊ីម', meaning: 'បិតានៃប្រជាជាតិ (ឈ្មោះព្យាការី)', gender: 'male', common_khmer_nicknames: ['ហ៊ីម'], popular: true },
  { id: '4', arabic: 'يُوسُف', latin: 'Yusuf', khmer: 'យូសុះ', meaning: 'អល់ឡោះនឹងបន្ថែម (ឈ្មោះព្យាការី)', gender: 'male', common_khmer_nicknames: ['សុះ', 'សុប'], popular: true },
  { id: '5', arabic: 'عُمَر', latin: 'Omar', khmer: 'អ៊ូមើរ', meaning: 'អាយុវែង, ជីវិត', gender: 'male', common_khmer_nicknames: ['មើរ'], popular: true },
  { id: '6', arabic: 'عَلِيّ', latin: 'Ali', khmer: 'អាលី', meaning: 'ខ្ពង់ខ្ពស់, ឧត្តុង្គឧត្តម', gender: 'male', common_khmer_nicknames: ['លី'], popular: true },
  { id: '7', arabic: 'حَسَن', latin: 'Hassan', khmer: 'ហាស្សាន់', meaning: 'ល្អ, ស្អាត', gender: 'male', common_khmer_nicknames: ['សាន់'], popular: true },
  { id: '8', arabic: 'حُسَيْن', latin: 'Hussein', khmer: 'ហូសេន', meaning: 'ល្អ, ស្អាត (តូច)', gender: 'male', common_khmer_nicknames: ['សេន'], popular: true },
  { id: '9', arabic: 'أَحْمَد', latin: 'Ahmad', khmer: 'អាហ៍ម៉ាត់', meaning: 'អ្នកដែលត្រូវបានសរសើរច្រើនជាងគេ', gender: 'male', common_khmer_nicknames: ['ម៉ាត់'], popular: true },
  { id: '10', arabic: 'سُلَيْمَان', latin: 'Sulaiman', khmer: 'ស៊ូឡៃម៉ាន', meaning: 'សន្តិភាព (ឈ្មោះព្យាការី)', gender: 'male', common_khmer_nicknames: ['ម៉ាន'], popular: true },
  { id: '11', arabic: 'إِسْمَاعِيل', latin: 'Ismail', khmer: 'អ៊ីស្មាអែល', meaning: 'អល់ឡោះទ្រង់ឮ (ឈ្មោះព្យាការី)', gender: 'male', common_khmer_nicknames: ['អែល', 'ម៉ាអែល'], popular: true },
  
  // Female Names
  { id: '20', arabic: 'فَاطِمَة', latin: 'Fatimah', khmer: 'ហ្វាទីម៉ះ', meaning: 'អ្នកដែលផ្ដាច់ដោះកូន', gender: 'female', common_khmer_nicknames: ['ម៉ះ'], popular: true },
  { id: '21', arabic: 'مَرْيَم', latin: 'Maryam', khmer: 'ម៉ារយ៉ាំ', meaning: 'ស្ត្រីដ៏បរិសុទ្ធ (ឈ្មោះមាតាព្យាការីអ៊ីសា)', gender: 'female', common_khmer_nicknames: ['យ៉ាំ'], popular: true },
  { id: '22', arabic: 'عَائِشَة', latin: 'Aishah', khmer: 'អាយស្ហះ', meaning: 'អ្នកដែលមានជីវិតរស់នៅ', gender: 'female', common_khmer_nicknames: ['ស្ហះ'], popular: true },
  { id: '23', arabic: 'خَدِيجَة', latin: 'Khadijah', khmer: 'ខទីជះ', meaning: 'កើតមុនកំណត់ (ភរិយាទី១ព្យាការី)', gender: 'female', common_khmer_nicknames: ['ជះ'], popular: true },
  { id: '24', arabic: 'آمِنَة', latin: 'Aminah', khmer: 'អាមីណះ', meaning: 'អ្នកដែលមានសុវត្ថិភាព, ស្មោះត្រង់', gender: 'female', common_khmer_nicknames: ['ណះ'], popular: true },
  { id: '25', arabic: 'زَيْنَب', latin: 'Zainab', khmer: 'ហ្សៃណាប់', meaning: 'ដើមឈើដែលមានក្លិនក្រអូប', gender: 'female', common_khmer_nicknames: ['ណាប់'], popular: true },
  { id: '26', arabic: 'سَارَة', latin: 'Sarah', khmer: 'សារ៉ះ', meaning: 'អ្នកដែលនាំមកនូវភាពរីករាយ', gender: 'female', common_khmer_nicknames: ['រ៉ះ'], popular: true },
  { id: '27', arabic: 'نُور', latin: 'Nur', khmer: 'នូរ', meaning: 'ពន្លឺ', gender: 'unisex', common_khmer_nicknames: [], popular: true },
  { id: '28', arabic: 'هَاجَر', latin: 'Hajar', khmer: 'ហាជើរ', meaning: 'ការធ្វើដំណើរ', gender: 'female', common_khmer_nicknames: ['ជើរ'], popular: true },
  { id: '29', arabic: 'صَفِيَّة', latin: 'Safiyyah', khmer: 'សហ្វីយ៉ះ', meaning: 'មិត្តភក្តិដ៏បរិសុទ្ធ', gender: 'female', common_khmer_nicknames: ['យ៉ះ'], popular: false },
];

export const MuslimNamesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'male' | 'female'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('ponloe_name_favorites');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    localStorage.setItem('ponloe_name_favorites', JSON.stringify([...favorites]));
  }, [favorites]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter Logic
  const filteredNames = NAME_DATABASE.filter(name => {
    const matchesTab = activeTab === 'all' || name.gender === activeTab || name.gender === 'unisex';
    const matchesFav = !showFavoritesOnly || favorites.has(name.id);
    const matchesSearch = 
        name.khmer.includes(searchQuery) || 
        name.latin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        name.meaning.includes(searchQuery) ||
        (name.common_khmer_nicknames && name.common_khmer_nicknames.some(nick => nick.includes(searchQuery)));
    
    return matchesTab && matchesSearch && matchesFav;
  });

  const toggleFavorite = (id: string) => {
    const newSet = new Set(favorites);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setFavorites(newSet);
  };

  const handleCopy = (name: NameEntry) => {
    const text = `ឈ្មោះ៖ ${name.khmer} (${name.latin})\nសរសេរ៖ ${name.arabic}\nអត្ថន័យ៖ ${name.meaning}`;
    navigator.clipboard.writeText(text).then(() => {
        setCopiedId(name.id);
        setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-in fade-in duration-300 font-khmer">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white pb-10 pt-8 px-6 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
         <div className="absolute top-0 right-0 p-10 opacity-20">
            <HugeiconsIcon icon={Baby01Icon} strokeWidth={1.5} className="w-32 h-32" />
         </div>
         <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">ឈ្មោះមូស្លីម</h1>
            <p className="text-emerald-100 text-sm max-w-md opacity-90 leading-relaxed">
               បណ្តុំឈ្មោះដ៏ពិរោះៗសម្រាប់បុត្រធីតា ព្រមទាំងអត្ថន័យ និងរបៀបហៅពេញនិយមនៅក្នុងសហគមន៍កម្ពុជា។
            </p>
         </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6 relative z-20">
         
         {/* Search & Filter */}
         <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 mb-6">
            <div className="relative mb-2">
                <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                   type="text" 
                   placeholder="ស្វែងរកឈ្មោះ, អត្ថន័យ..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-800"
                />
            </div>
            <div className="flex bg-gray-100 p-1 rounded-xl">
               <button 
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500'}`}
               >
                  ទាំងអស់
               </button>
               <button 
                  onClick={() => setActiveTab('male')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'male' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
               >
                  ប្រុស
               </button>
               <button 
                  onClick={() => setActiveTab('female')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'female' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-500'}`}
               >
                  ស្រី
               </button>
            </div>
            <div className="flex justify-between items-center mt-2 px-1">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  showFavoritesOnly ? 'bg-red-50 text-red-600 border border-red-200' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                ចូលចិត្ត ({favorites.size})
              </button>
              <span className="text-xs text-gray-400">{filteredNames.length} ឈ្មោះ</span>
            </div>
         </div>

         {/* Names List */}
         <div className="space-y-3">
            {filteredNames.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <HugeiconsIcon icon={CleanIcon} strokeWidth={1.5} className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>រកមិនឃើញឈ្មោះនេះទេ</p>
                </div>
            ) : (
                filteredNames.map((name) => (
                    <div key={name.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-start gap-4 group">
                        
                        {/* Icon Gender */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shrink-0 ${name.gender === 'male' ? 'bg-blue-50 text-blue-600' : name.gender === 'female' ? 'bg-pink-50 text-pink-600' : 'bg-purple-50 text-purple-600'}`}>
                            {name.latin.charAt(0)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 leading-none">{name.khmer}</h3>
                                    <p className="text-xs text-gray-500 mt-1 font-medium">{name.latin}</p>
                                </div>
                                <span className="font-arabic text-xl text-emerald-800 leading-none" dir="rtl">{name.arabic}</span>
                            </div>
                            
                            <div className="mt-3 bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    <span className="font-bold text-gray-400 text-xs uppercase tracking-wide mr-1">អត្ថន័យ:</span> 
                                    {name.meaning}
                                </p>
                            </div>

                            {/* Cambodian Context: Nicknames */}
                            {name.common_khmer_nicknames && name.common_khmer_nicknames.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2 items-center">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">ហៅកាត់:</span>
                                    {name.common_khmer_nicknames.map(nick => (
                                        <span key={nick} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-medium border border-emerald-100">
                                            {nick}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                            <button 
                                onClick={() => toggleFavorite(name.id)}
                                className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${favorites.has(name.id) ? 'text-red-500' : 'text-gray-300'}`}
                            >
                                <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} className={`w-5 h-5 ${favorites.has(name.id) ? 'fill-current' : ''}`} />
                            </button>
                            <button 
                                onClick={() => handleCopy(name)}
                                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-emerald-600 transition-colors"
                            >
                                {copiedId === name.id ? <HugeiconsIcon icon={Tick01Icon} strokeWidth={1.5} className="w-5 h-5 text-green-500" /> : <HugeiconsIcon icon={Copy01Icon} strokeWidth={1.5} className="w-5 h-5" />}
                            </button>
                        </div>

                    </div>
                ))
            )}
         </div>

      </div>
    </div>
  );
};
