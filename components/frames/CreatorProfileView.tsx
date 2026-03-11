import { SecurityCheckIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, UserGroupIcon, Calendar01Icon, Megaphone01Icon, MoreVerticalIcon, FilterIcon, Share01Icon, Flag01Icon, Bookmark01Icon, Search01Icon, Layers01Icon } from '@hugeicons/core-free-icons';

import React, { useState, useRef, useEffect } from 'react';

import { Frame, Creator, INITIAL_FRAMES } from './shared';

interface CreatorProfileViewProps {
  creator: Creator;
  onBack: () => void;
  onSelectFrame: (frame: Frame) => void;
}

export const CreatorProfileView: React.FC<CreatorProfileViewProps> = ({ creator, onBack, onSelectFrame }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const creatorFrames = INITIAL_FRAMES.filter(f => f.creator === creator.name);

  return (
    <div className="min-h-screen bg-white text-gray-900 -m-4 md:-m-8 animate-in slide-in-from-right duration-300">
      
      {/* Banner */}
      <div className="h-48 w-full bg-[#111111] relative overflow-hidden">
         <div className="absolute inset-0 bg-[linear-gradient(45deg,#1a1a1a_25%,transparent_25%,transparent_75%,#1a1a1a_75%,#1a1a1a),linear-gradient(45deg,#1a1a1a_25%,transparent_25%,transparent_75%,#1a1a1a_75%,#1a1a1a)] bg-[length:40px_40px] opacity-[0.05]"></div>
         <button 
           onClick={onBack}
           className="absolute top-4 left-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-sm transition-colors z-20"
         >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-5 h-5" />
         </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative">
          
          {/* Avatar & Info */}
          <div className="flex-1 flex flex-col items-start -mt-16 relative z-10">
             <div className="w-32 h-32 rounded-full p-1 bg-white shadow-sm">
                <img referrerPolicy="no-referrer" src={creator.avatar} alt={creator.name} className="w-full h-full rounded-full object-cover border-4 border-white bg-gray-200" />
             </div>
             
             <div className="mt-3">
                <div className="flex items-center gap-2">
                   <h1 className="text-3xl font-bold text-gray-900">{creator.name}</h1>
                   <div className="relative" ref={menuRef}>
                     <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                     >
                        <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={1.5} className="w-5 h-5" />
                     </button>
                     {isMenuOpen && (
                        <div className="absolute left-full md:left-auto md:top-full ml-2 md:ml-0 md:mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-left">
                            <div className="py-1">
                                <button className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                                    <HugeiconsIcon icon={Share01Icon} strokeWidth={1.5} className="w-4 h-4 text-gray-500" /> Share
                                </button>
                                <button className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                                    <HugeiconsIcon icon={Flag01Icon} strokeWidth={1.5} className="w-4 h-4 text-gray-500" /> Report
                                </button>
                            </div>
                        </div>
                     )}
                   </div>
                </div>

                <p className="text-gray-500 text-sm mt-1 font-medium">{creator.handle}</p>
                
                {creator.isPremium && (
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-[#0f3d35] text-[#14b8a6] px-3 py-1.5 rounded-full text-xs font-semibold border border-[#115e59] shadow-sm">
                    <HugeiconsIcon icon={SecurityCheckIcon} strokeWidth={1.5} className="w-3.5 h-3.5 fill-[#14b8a6] text-[#0f3d35]" /> Premium Creator
                  </div>
                )}
             </div>
          </div>

          {/* Stats Card */}
          <div className="mt-6 md:-mt-8 bg-[#111111] rounded-2xl p-6 border border-white/5 w-full md:w-80 shadow-2xl relative z-10 text-white">
             <div className="space-y-5">
                <div className="flex items-center justify-between group">
                   <div className="flex items-center gap-3 text-gray-400 group-hover:text-gray-300 transition-colors">
                      <HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.5} className="w-4 h-4" /> <span className="text-sm font-medium">Supporters</span>
                   </div>
                   <span className="font-bold text-white text-lg">{creator.supporters}</span>
                </div>
                <div className="w-full h-px bg-white/10" />
                <div className="flex items-center justify-between group">
                   <div className="flex items-center gap-3 text-gray-400 group-hover:text-gray-300 transition-colors">
                      <HugeiconsIcon icon={Megaphone01Icon} strokeWidth={1.5} className="w-4 h-4" /> <span className="text-sm font-medium">Campaigns</span>
                   </div>
                   <span className="font-bold text-white text-lg">{creator.campaignsCount}</span>
                </div>
                <div className="w-full h-px bg-white/10" />
                <div className="flex items-center justify-between group">
                   <div className="flex items-center gap-3 text-gray-400 group-hover:text-gray-300 transition-colors">
                      <HugeiconsIcon icon={Calendar01Icon} strokeWidth={1.5} className="w-4 h-4" /> <span className="text-sm font-medium">Joined Since</span>
                   </div>
                   <span className="font-bold text-white text-sm">{creator.joinedDate}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-12 flex flex-col md:flex-row justify-between items-center border-b border-gray-200 gap-6">
            <div className="flex gap-8 w-full md:w-auto overflow-x-auto no-scrollbar">
               <button className="text-gray-900 font-bold pb-4 border-b-2 border-gray-900 whitespace-nowrap flex items-center gap-2">
                  <HugeiconsIcon icon={Megaphone01Icon} strokeWidth={1.5} className="w-5 h-5" /> Campaign
               </button>
               <button className="text-gray-500 font-medium pb-4 border-b-2 border-transparent hover:text-gray-900 whitespace-nowrap flex items-center gap-2 transition-colors">
                  <HugeiconsIcon icon={Bookmark01Icon} strokeWidth={1.5} className="w-5 h-5" /> Collections
               </button>
               <button className="text-gray-500 font-medium pb-4 border-b-2 border-transparent hover:text-gray-900 whitespace-nowrap flex items-center gap-2 transition-colors">
                  <HugeiconsIcon icon={Layers01Icon} strokeWidth={1.5} className="w-5 h-5" /> Posts
               </button>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto mb-3 md:mb-0 relative">
               <div className="relative flex-1 md:w-64 group">
                 <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                 <input type="text" placeholder="Search Campaigns" className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm transition-all shadow-sm" />
               </div>
               <div className="relative" ref={filterRef}>
                   <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="w-12 h-12 flex items-center justify-center text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-full transition-all shadow-sm active:scale-95 bg-white">
                      <HugeiconsIcon icon={FilterIcon} strokeWidth={1.5} className="w-5 h-5" />
                   </button>
                   {isFilterOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-1">
                        <button className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg flex items-center justify-between group">Recent</button>
                        <button className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg flex items-center justify-between group">Most Supported</button>
                    </div>
                   )}
               </div>
            </div>
        </div>

        {/* Content Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {creatorFrames.map((frame) => (
             <div key={frame.id} onClick={() => onSelectFrame(frame)} className="bg-white rounded-2xl overflow-hidden cursor-pointer border border-gray-100 hover:shadow-xl transition-all group">
                <div className="aspect-square bg-white p-4 flex items-center justify-center relative border-b border-gray-50">
                   <img referrerPolicy="no-referrer" src={frame.src} alt={frame.name} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="p-4">
                   <h3 className="text-gray-900 font-bold truncate group-hover:text-indigo-600 transition-colors">{frame.name}</h3>
                   <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <div className="w-5 h-5 rounded-full overflow-hidden border border-gray-100">
                         <img referrerPolicy="no-referrer" src={creator.avatar} alt="avatar" className="w-full h-full object-cover" />
                      </div>
                      <span className="truncate">{creator.name}</span>
                   </div>
                   <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                      <HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.5} className="w-3 h-3" /> {frame.supporters} Supporters
                   </div>
                </div>
             </div>
           ))}
           {creatorFrames.length === 0 && (
             <div className="col-span-full py-20 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="w-8 h-8" />
                </div>
                <h3 className="text-gray-900 font-medium">No campaigns found</h3>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
