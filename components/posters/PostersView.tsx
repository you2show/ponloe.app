import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, Download01Icon, Share01Icon, FavouriteIcon, Cancel01Icon, Maximize01Icon, FilterIcon, Image01Icon } from '@hugeicons/core-free-icons';

import React, { useState } from 'react';

import { MOCK_POSTERS, POSTER_CATEGORIES, Poster } from './data';

export const PostersView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPoster, setSelectedPoster] = useState<Poster | null>(null);
  const [likedPosters, setLikedPosters] = useState<Set<string>>(new Set());

  const filteredPosters = MOCK_POSTERS.filter(poster => {
    const matchesCategory = activeCategory === 'all' || poster.category === activeCategory;
    const matchesSearch = poster.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newLiked = new Set(likedPosters);
    if (newLiked.has(id)) newLiked.delete(id);
    else newLiked.add(id);
    setLikedPosters(newLiked);
  };

  const handleDownload = (e: React.MouseEvent, poster: Poster) => {
      e.stopPropagation();
      const link = document.createElement('a');
      link.href = poster.imageUrl;
      link.download = `ponloe-poster-${poster.id}.jpg`;
      link.target = "_blank";
      link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-in fade-in duration-300 font-khmer">
      
      {/* Header & Filters */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
           <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
              <div className="flex items-center gap-2 mr-auto">
                 <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                    <HugeiconsIcon icon={Image01Icon} strokeWidth={1.5} className="w-6 h-6" />
                 </div>
                 <h1 className="text-xl font-bold text-gray-900 font-khmer-title">ប័ណ្ណរូបភាព (Posters)</h1>
              </div>
              
              <div className="w-full md:w-auto relative group">
                 <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-600" />
                 <input 
                    type="text" 
                    placeholder="ស្វែងរក..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-gray-100 border-transparent focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 rounded-full text-sm outline-none transition-all"
                 />
              </div>
           </div>

           {/* Category Chips */}
           <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {POSTER_CATEGORIES.map(cat => (
                 <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                       activeCategory === cat.id 
                          ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                 >
                    {cat.label}
                 </button>
              ))}
           </div>
        </div>
      </div>

      {/* Masonry Grid Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6">
         {/* Optimized Masonry Columns: 2 on mobile, 3 on tablet, 4 on desktop, 5 on large screens */}
         <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
            {filteredPosters.map((poster) => (
               <div 
                  key={poster.id}
                  className="break-inside-avoid relative group rounded-2xl overflow-hidden cursor-zoom-in bg-gray-200 mb-4 border border-gray-100"
                  onClick={() => setSelectedPoster(poster)}
               >
                  <img referrerPolicy="no-referrer" src={poster.imageUrl} 
                     alt={poster.title} 
                     className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                     loading="lazy"
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                     <div className="flex justify-between items-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="text-white">
                           <h3 className="font-bold text-sm line-clamp-1">{poster.title}</h3>
                           <p className="text-[10px] opacity-80">{poster.author}</p>
                        </div>
                        <div className="flex gap-2">
                           <button 
                              onClick={(e) => handleDownload(e, poster)}
                              className="p-2 bg-white/20 hover:bg-white rounded-full text-white hover:text-gray-900 backdrop-blur-md transition-colors"
                           >
                              <HugeiconsIcon icon={Download01Icon} strokeWidth={1.5} className="w-4 h-4" />
                           </button>
                           <button 
                              onClick={(e) => toggleLike(e, poster.id)}
                              className={`p-2 bg-white/20 hover:bg-white rounded-full backdrop-blur-md transition-colors ${likedPosters.has(poster.id) ? 'bg-white text-red-500' : 'text-white hover:text-red-500'}`}
                           >
                              <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} className={`w-4 h-4 ${likedPosters.has(poster.id) ? 'fill-current' : ''}`} />
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>

         {filteredPosters.length === 0 && (
             <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                 <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <HugeiconsIcon icon={Image01Icon} strokeWidth={1.5} className="w-8 h-8 opacity-20" />
                 </div>
                 <p>មិនមានរូបភាពសម្រាប់ប្រភេទនេះទេ</p>
             </div>
         )}
      </div>

      {/* Full Screen Modal */}
      {selectedPoster && (
         <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
            <button 
               onClick={() => setSelectedPoster(null)}
               className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-20"
            >
               <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-6 h-6" />
            </button>

            <div className="relative max-w-6xl w-full h-full flex flex-col md:flex-row items-center justify-center bg-black/50 md:rounded-3xl overflow-hidden">
               
               {/* Image Container - Responsive Height */}
               <div className="relative flex-1 w-full h-1/2 md:h-full flex items-center justify-center bg-black/20">
                  <img referrerPolicy="no-referrer" src={selectedPoster.imageUrl} 
                     alt={selectedPoster.title} 
                     className="max-w-full max-h-full object-contain shadow-2xl"
                  />
               </div>

               {/* Info Panel - Responsive Width/Height */}
               <div className="w-full md:w-96 bg-white/10 backdrop-blur-md border-t md:border-t-0 md:border-l border-white/10 h-1/2 md:h-full p-6 text-white shrink-0 flex flex-col overflow-y-auto">
                  
                  <div className="flex-1">
                      <h2 className="text-2xl font-bold font-khmer mb-2 leading-tight">{selectedPoster.title}</h2>
                      <div className="flex items-center gap-2 mb-6">
                         <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                            {selectedPoster.author.charAt(0)}
                         </div>
                         <span className="text-sm opacity-80 font-medium">{selectedPoster.author}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs opacity-70 mb-8 border-t border-b border-white/10 py-4">
                         <div>
                            <span className="block mb-1 text-white/50">កាលបរិច្ឆេទ</span>
                            <span className="font-bold">{selectedPoster.date}</span>
                         </div>
                         <div>
                            <span className="block mb-1 text-white/50">ប្រភេទ</span>
                            <span className="font-bold uppercase tracking-wider">{selectedPoster.category}</span>
                         </div>
                         <div>
                            <span className="block mb-1 text-white/50">ទាញយក</span>
                            <span className="font-bold">{selectedPoster.downloads}</span>
                         </div>
                         <div>
                            <span className="block mb-1 text-white/50">វិមាត្រ</span>
                            <span className="font-bold uppercase">{selectedPoster.dimensions}</span>
                         </div>
                      </div>
                  </div>

                  <div className="space-y-3 mt-auto">
                     <button 
                        onClick={(e) => handleDownload(e, selectedPoster)}
                        className="w-full py-4 bg-white text-gray-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors shadow-lg"
                     >
                        <HugeiconsIcon icon={Download01Icon} strokeWidth={1.5} className="w-5 h-5" /> ទាញយក (Original)
                     </button>
                     <div className="flex gap-3">
                        <button 
                           onClick={(e) => toggleLike(e, selectedPoster.id)}
                           className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors border ${likedPosters.has(selectedPoster.id) ? 'bg-red-500 border-red-500 text-white' : 'border-white/20 hover:bg-white/10'}`}
                        >
                           <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} className={`w-5 h-5 ${likedPosters.has(selectedPoster.id) ? 'fill-current' : ''}`} /> {selectedPoster.likes + (likedPosters.has(selectedPoster.id) ? 1 : 0)}
                        </button>
                        <button className="flex-1 py-3 border border-white/20 hover:bg-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors">
                           <HugeiconsIcon icon={Share01Icon} strokeWidth={1.5} className="w-5 h-5" /> Share
                        </button>
                     </div>
                  </div>

               </div>

            </div>
         </div>
      )}

    </div>
  );
};
