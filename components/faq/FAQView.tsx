import { LegalHammerIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, HelpCircleIcon, ArrowDown01Icon, ArrowUp01Icon, SentIcon, Layers01Icon, GemIcon, Book01Icon, FavouriteIcon, UserIcon, HourglassIcon, BulbIcon } from '@hugeicons/core-free-icons';

import React, { useState } from 'react';

import { FAQ_DATABASE } from './data';

// Map icons from lucide-react to category names or indices
const getIcon = (iconName: string) => {
    switch (iconName) {
        case 'bi-gem': return <HugeiconsIcon icon={GemIcon} strokeWidth={1.5} className="w-5 h-5" />;
        case 'bi-building': return <HugeiconsIcon icon={Layers01Icon} strokeWidth={1.5} className="w-5 h-5" />; // Pillars
        case 'bi-gavel': return <HugeiconsIcon icon={LegalHammerIcon} strokeWidth={1.5} className="w-5 h-5" />;
        case 'bi-book-half': return <HugeiconsIcon icon={Book01Icon} strokeWidth={1.5} className="w-5 h-5" />;
        case 'bi-person-heart': return <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} className="w-5 h-5" />;
        case 'bi-person-standing-dress': return <HugeiconsIcon icon={UserIcon} strokeWidth={1.5} className="w-5 h-5" />;
        case 'bi-hourglass-split': return <HugeiconsIcon icon={HourglassIcon} strokeWidth={1.5} className="w-5 h-5" />;
        case 'bi-lightbulb': return <HugeiconsIcon icon={BulbIcon} strokeWidth={1.5} className="w-5 h-5" />;
        default: return <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={1.5} className="w-5 h-5" />;
    }
}

export const FAQView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  const filteredCategories = FAQ_DATABASE.map(category => {
    const filteredQuestions = category.questions.filter(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.k.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return {
      ...category,
      questions: filteredQuestions
    };
  }).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 md:py-6 text-center">
           <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={1.5} className="w-6 h-6" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-khmer text-gray-900">សំណួរដែលសួរញឹកញាប់</h1>
           </div>
           <p className="text-gray-500 font-khmer text-sm md:text-base max-w-lg mx-auto">
             ចម្លើយសម្រាប់ចម្ងល់ទូទៅអំពីជំនឿ និងការប្រតិបត្តិនៅក្នុងសាសនាអ៊ីស្លាម
           </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-8">
        
        {/* Intro Card: Shahada */}
        <div className="bg-gradient-to-br from-emerald-700 to-teal-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
           <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-400 opacity-10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
           
           <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-10 items-center">
              <div className="flex-1 text-center md:text-left">
                 <h2 className="text-2xl font-bold font-khmer mb-3">ជំហានដើម្បីក្លាយជាអ្នកមុស្លិម</h2>
                 <p className="text-emerald-100 text-sm leading-relaxed mb-6 font-khmer opacity-90">
                    ការសម្រេចចិត្តទទួលយកសាសនាឥស្លាម គឺជាដំណើរផ្ទាល់ខ្លួនដ៏មានអត្ថន័យ។ 
                    ជំហានដំបូងគឺការប្រកាសពាក្យសក្ខីកម្ម (ស្សាហាទ៉ះ) ដោយស្មោះអស់ពីចិត្ត។
                 </p>
                 <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 mb-4">
                    <p className="font-medium italic text-lg mb-2 text-center text-white leading-relaxed">
                       "ខ្ញុំសូមប្រកាសសក្ខីកម្មថា គ្មានព្រះជាម្ចាស់ណាផ្សេងដែលស័ក្តិសមនឹងការគោរពសក្ការៈពិតប្រាកដក្រៅពីអល់ឡោះឡើយ ហើយខ្ញុំសូមប្រកាសសក្ខីកម្មថា ព្យាការីមូហាំម៉ាត់ គឺជាអ្នកនាំសាររបស់អល់ឡោះ។"
                    </p>
                    <p className="text-xs text-center text-emerald-200 opacity-80 font-khmer mt-3">
                       (ភាសាអារ៉ាប់៖ អ៉័ស្យហាឌូ អាន់ឡា អ៊ីឡាហា អ៊ីលឡ័លឡោះ វ៉ា អ៉័ស្យហាឌូ អាន់ណា មូហាំម៉ាត់ រ៉ស៊ូលុលឡោះ)
                    </p>
                 </div>
              </div>
              <div className="w-full md:w-48 shrink-0 hidden md:block">
                 <img referrerPolicy="no-referrer" src="https://studioarabiya.com/wp-content/uploads/2023/04/b2ap3_large_quran_peace.jpg" 
                    alt="Quran" 
                    className="w-full h-auto rounded-2xl shadow-lg border-4 border-white/10 transform rotate-3 hover:rotate-0 transition-transform duration-500"
                 />
              </div>
           </div>
        </div>

        {/* Search Input */}
        <div className="relative group">
           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
           </div>
           <input 
              type="text" 
              placeholder="ស្វែងរកសំណួររបស់អ្នក (ឧ. ហ៊ីចាប, សឡាត, ហ្សាកាត់...)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900 shadow-sm font-khmer transition-all placeholder-gray-400"
           />
        </div>

        {/* FAQ List */}
        <div className="space-y-8">
           {filteredCategories.length > 0 ? (
              filteredCategories.map((category, idx) => (
                 <div key={idx} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Category Header */}
                    <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-emerald-600 shadow-sm">
                          {getIcon(category.icon)}
                       </div>
                       <h3 className="text-lg font-bold text-gray-900 font-khmer">{category.category}</h3>
                    </div>

                    <div className="divide-y divide-gray-100">
                       {category.questions.map((item, qIdx) => {
                          const itemId = `${idx}-${qIdx}`;
                          const isExpanded = expandedId === itemId;
                          
                          return (
                             <div key={qIdx} className={`transition-colors ${isExpanded ? 'bg-emerald-50/30' : 'hover:bg-gray-50'}`}>
                                <button 
                                   onClick={() => toggleExpand(itemId)}
                                   className="w-full px-6 py-5 text-left flex justify-between items-start gap-4 focus:outline-none group"
                                >
                                   <span className={`font-bold font-khmer text-base leading-relaxed transition-colors ${isExpanded ? 'text-emerald-800' : 'text-gray-700 group-hover:text-gray-900'}`}>
                                      {item.q}
                                   </span>
                                   <span className={`p-1 rounded-full shrink-0 transition-all duration-300 ${isExpanded ? 'bg-emerald-100 text-emerald-600 rotate-180' : 'text-gray-400 group-hover:bg-gray-200'}`}>
                                      <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={1.5} className="w-5 h-5" />
                                   </span>
                                </button>
                                
                                <div 
                                    className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                                >
                                   <div className="overflow-hidden">
                                      <div className="px-6 pb-6 pt-0">
                                         <div className="prose prose-emerald prose-sm max-w-none text-gray-600 font-khmer leading-loose bg-white p-4 rounded-xl border border-emerald-100/50 shadow-sm">
                                            <div dangerouslySetInnerHTML={{ __html: item.a }} />
                                         </div>
                                      </div>
                                   </div>
                                </div>
                             </div>
                          );
                       })}
                    </div>
                 </div>
              ))
           ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="w-8 h-8 text-gray-300" />
                 </div>
                 <h3 className="text-gray-900 font-bold font-khmer text-lg">រកមិនឃើញលទ្ធផល</h3>
                 <p className="text-gray-500 mt-2 font-khmer">សូមព្យាយាមប្រើពាក្យគន្លឹះផ្សេងទៀត</p>
              </div>
           )}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-slate-900 rounded-3xl p-8 text-center text-white relative overflow-hidden shadow-xl">
           <div className="relative z-10">
              <h2 className="text-2xl font-bold font-khmer mb-3">នៅតែរកចម្លើយមិនឃើញមែនទេ?</h2>
              <p className="text-slate-300 mb-8 max-w-md mx-auto font-khmer text-sm leading-relaxed">
                 យើងខ្ញុំរីករាយនឹងឆ្លើយសំណួររបស់អ្នកជាលក្ខណៈឯកជន។ សូមផ្ញើសំណួររបស់អ្នកមកកាន់យើងខ្ញុំ។
              </p>
              <button className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-xl font-bold font-khmer transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 mx-auto active:scale-95">
                 <HugeiconsIcon icon={SentIcon} strokeWidth={1.5} className="w-4 h-4" /> ផ្ញើសំណួររបស់អ្នក
              </button>
           </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-12 italic font-khmer">
           កំណត់សម្គាល់៖ ខ្លឹមសារទាំងនេះគឺសម្រាប់ជាព័ត៌មានទូទៅ និងការអប់រំជាមូលដ្ឋាន។ 
           សម្រាប់បញ្ហាសាសនាដែលស្មុគស្មាញ សូមពិគ្រោះជាមួយអ្នកប្រាជ្ញសាសនា។
        </p>

      </div>
    </div>
  );
};
