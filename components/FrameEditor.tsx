import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, ArrowLeft01Icon, ArrowRight01Icon, Bookmark01Icon, Calendar01Icon, ChampionIcon, Delete02Icon, Download01Icon, FavouriteIcon, FilterIcon, Flag01Icon, Image01Icon, Layers01Icon, Megaphone01Icon, MoreVerticalIcon, MoveIcon, ReloadIcon, RotateClockwiseIcon, Search01Icon, SecurityCheckIcon, Share01Icon, SlidersHorizontalIcon, Sun01Icon, TextIcon, Tick01Icon, Upload01Icon, UserGroupIcon, ZoomInAreaIcon } from '@hugeicons/core-free-icons';


import React, { useState, useRef, useEffect, useMemo } from 'react';


// --- Types & Interfaces ---

interface Frame {
  id: string | number;
  name: string;
  src: string;
  category: 'official' | 'custom';
  creator?: string;
  supporters?: string;
}

interface Creator {
  id: number;
  name: string;
  handle: string;
  avatar: string;
  supporters: string;
  campaignsCount: number;
  joinedDate: string;
  isPremium?: boolean;
}

// --- Mock Data ---

const MOCK_CREATORS: Creator[] = [
  { 
    id: 1, 
    name: "Sokvorn Chea", 
    handle: "@cheasokvorn995ink",
    supporters: "386", 
    campaignsCount: 1,
    joinedDate: "13 Sep 2023",
    isPremium: true,
    avatar: "https://picsum.photos/seed/c1/200" 
  },
  { 
    id: 2, 
    name: "Bank Syariah", 
    handle: "@banksyariah",
    supporters: "179K", 
    campaignsCount: 12,
    joinedDate: "20 Aug 2022",
    isPremium: true,
    avatar: "https://picsum.photos/seed/c2/200" 
  },
  { 
    id: 3, 
    name: "INC Kerala", 
    handle: "@inckerala",
    supporters: "40K", 
    campaignsCount: 5,
    joinedDate: "10 Jan 2023",
    avatar: "https://picsum.photos/seed/c3/200" 
  },
  { 
    id: 4, 
    name: "Humas KIP", 
    handle: "@humaskip",
    supporters: "4.9K", 
    campaignsCount: 3,
    joinedDate: "05 Dec 2023",
    avatar: "https://picsum.photos/seed/c4/200" 
  },
];

const INITIAL_FRAMES: Frame[] = [
  {
    id: 1,
    name: "Sakha thmey6&7",
    category: 'official',
    creator: "Sokvorn Chea",
    supporters: "386",
    src: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -410 1248 1665"><path d="m1248,4q-42-7-66.5-15t-43.5-19.5-38.5-29-52.5-43.5q-68-56-127.5-86t-116.5-49q-39-13-64.5-29t-44.5-37-34.5-47-34.5-59q-19,33-34.5,59t-34.5,47-44.5,37-64.5,29q-57,19-116.5,49t-127.5,86q-33,26-52.5,43.5t-38.5,29-44,19.5-68,15q29,34,59.5,57.5t65.5,30.5q-48,71-73,154.5t-25,174.5q0,93,25,176t73,154q-35,8-65.5,31t-59.5,57q43,8,68,16t44,19.5,38.5,29,52.5,44.5q68,53,127.5,84t116.5,51q39,12,64.5,28t44.5,36.5,34.5,47,34.5,60.5q19-34,34.5-60.5t34.5-47,44.5-36.5,64.5-28q57-20,117-51t127-84q33-27,52.5-44.5t38.5-29,43.5-19.5,66.5-16q-28-34-58-57t-65-31q48-71,73-154t25-176q0-91-25-174.5t-73-154.5q35-7,65-30.5t58-57.5zm-76,811q-23,8-42.5,19t-37.5,24-35,27.5-35,29.5q-65,54-121,82t-110,47q-32,11-56.5,23.5t-43.5,28.5-35,35.5-31,43.5q-15-24-31-43.5t-35-35.5-43.5-28.5-56.5-23.5q-54-19-110-47t-121-82q-18-15-35-29.5t-35-27.5-37.5-24-42.5-19q22-16,43.5-21.5t42.5-3,42,12,42,22.5q9-11,21.5-24t27.5-13q8,0,22.5,13.5t35,29.5,47.5,29.5,59,13.5,54-2,40-8,34.5-17.5,35.5-29.5q19,18,35.5,29.5t34.5,17.5,40.5,8,53.5,2q32,0,59-13.5t47.5-29.5,35-29.5,22.5-13.5q15,0,27.5,13t21.5,24q21-13,42-22.5t42.5-12,43,3,42.5,21.5zm22-394q0,93-26,176t-76,152q-20,0-38.5,5.5t-43.5,19.5q-11-11-26.5-19t-30.5-8q-18,0-35.5,14t-37,30.5-41.5,30-50,13.5q-34,0-55-3t-37.5-11-32-23-39.5-39q-24,24-39.5,39t-31.5,23-37,11-56,3q-28,0-50-13.5t-41-30-36.5-30.5-36.5-14q-15,0-30.5,8t-26.5,19q-26-14-44-19.5t-38-5.5q-49-69-75.5-152t-26.5-176q0-91,26.5-173.5t75.5-153.5q20,2,38-4t44-19q11,9,26.5,18t30.5,9q19,0,36.5-13.5t36.5-30,41-30.5,50-14q35,0,56,3t37,11,31.5,23,39.5,39q24-24,39.5-39t32-23,37.5-11,55-3q28,0,50,14t41.5,30.5,37,30,35.5,13.5q15,0,30.5-9t26.5-18q25,13,43.5,19t38.5,4q50,71,76,153.5t26,173.5zm-22-393q-43,32-85.5,24.5t-84.5-32.5q-9,11-21.5,24t-27.5,13q-8,0-22.5-13.5t-35-30-47.5-30.5-59-14q-31,0-53.5,2.5t-40.5,9-34.5,18-35.5,29.5q-19-18-35.5-29.5t-34.5-18-40-9-54-2.5-59,14-47.5,30.5-35,30-22.5,13.5q-15,0-27.5-13t-21.5-24q-42,25-84,32.5t-86-24.5q23-7,42.5-18t37.5-24.5,35-28,35-29.5q65-53,121-81.5t110-45.5q32-12,56.5-25t43.5-28.5,35-34.5,31-43q15,24,31,43t35,34.5,43.5,28.5,56.5,25q54,17,110,45.5t121,81.5q18,15,35,29.5t35,28,37.5,24.5,42.5,18zm-215,856q7-7,5.5-15t-7-13-14-5.5-15.5,7.5q-20,24-56.5,44t-88.5,31q-9,3-12.5,10t-2,14.5,8,12,16.5,2.5q56-12,98-34.5t68-53.5zm-264,86q0-28-20-47.5t-48-19.5-48,19.5-20,47.5q0,29,20,49.5t48,20.5,48-20.5,20-49.5zm-224-37q-52-11-88.5-31t-56.5-44q-7-8-15-7.5t-14,5.5-7.5,13,5.5,15q26,31,68,53.5t98,34.5q10,2,16.5-2.5t8-12-2-14.5-12.5-10zm488-972q-53-63-166-90-10-2-16.5,3t-8,12.5,2,15,12.5,9.5q52,11,88.5,30t56.5,44q7,8,15.5,8t14-4.5,7-12.5-5.5-15zm-264-88q0-28-20-48t-48-20-48,20-20,48q0,29,20,48t48,19,48-19,20-48zm-224,38q9-2,12.5-9.5t2-15-8-12.5-16.5-3q-113,27-166,90-7,7-5.5,15t7.5,12.5,14,4.5,15-8q20-25,56.5-44t88.5-30z"/></svg>')}`
  },
  {
    id: 2,
    name: "HAMAKA FESTIVAL 2026",
    category: 'official',
    creator: "John Dado",
    supporters: "753",
    src: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient></defs><rect width="1080" height="1080" fill="none" stroke="url(#g)" stroke-width="100"/><path d="M0 0 L300 0 L0 300 Z" fill="#3b82f6"/><path d="M1080 1080 L780 1080 L1080 780 Z" fill="#06b6d4"/><text x="540" y="150" fill="#3b82f6" font-family="sans-serif" font-size="70" text-anchor="middle" font-weight="bold">FESTIVAL 2026</text></svg>')}`
  },
  {
    id: 3,
    name: "Teachers' Day",
    category: 'official',
    creator: "MoEYS Cambodia",
    supporters: "5.9K",
    src: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080"><circle cx="540" cy="540" r="500" fill="none" stroke="#ec4899" stroke-width="80"/><text x="540" y="1000" fill="#ec4899" font-family="sans-serif" font-size="60" text-anchor="middle" font-weight="bold">OCTOBER 5</text></svg>')}`
  },
  {
    id: 4,
    name: "National Pride",
    category: 'official',
    creator: "Getz Pharma",
    supporters: "150K",
    src: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080"><rect width="1080" height="1080" fill="none" stroke="#ef4444" stroke-width="50"/><rect x="50" y="50" width="980" height="980" fill="none" stroke="#3b82f6" stroke-width="50"/><text x="540" y="540" fill="#1d4ed8" font-family="sans-serif" font-size="100" text-anchor="middle" opacity="0.2" font-weight="bold">CAMBODIA</text></svg>')}`
  }
];

type Tab = 'frames' | 'transform' | 'adjust' | 'text';

// --- Sub-Component: Discovery View (The Dashboard) ---

const DiscoveryView: React.FC<{ 
  onSelectFrame: (frame: Frame) => void;
  onSelectCreator: (creator: Creator) => void;
}> = ({ onSelectFrame, onSelectCreator }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFrames = INITIAL_FRAMES.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCreatorByName = (name: string) => {
    return MOCK_CREATORS.find(c => c.name === name);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Search Header */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm transition-all"
          placeholder="Search campaigns, frames, or creators..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Trending Section */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Trending</h2>
            <p className="text-gray-500 mt-1">Most Supported Campaigns in the Last 24 Hours</p>
          </div>
          <button className="text-indigo-600 font-medium text-sm hover:text-indigo-700 flex items-center gap-1">
            Explore More <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredFrames.map((frame) => (
            <div 
              key={frame.id} 
              className="group bg-gray-900 rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 relative aspect-[4/5] cursor-pointer"
              onClick={() => onSelectFrame(frame)}
            >
              {/* Dark Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
              
              {/* Frame Preview */}
              <div className="absolute inset-0 bg-white p-4 flex items-center justify-center">
                 <img referrerPolicy="no-referrer" src={frame.src} alt={frame.name} className="w-full h-full object-contain" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 z-20 text-white">
                <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-indigo-300 transition-colors">
                  {frame.name}
                </h3>
                <div 
                  className="flex items-center gap-2 mb-2 hover:bg-white/10 p-1 -ml-1 rounded transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    const creator = getCreatorByName(frame.creator || '');
                    if (creator) onSelectCreator(creator);
                  }}
                >
                   <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center text-[10px] overflow-hidden">
                      {/* Try to find real avatar if available */}
                      <img referrerPolicy="no-referrer" src={getCreatorByName(frame.creator || '')?.avatar || "https://picsum.photos/seed/u/50"} 
                        alt="creator" 
                        className="w-full h-full object-cover" 
                      />
                   </div>
                   <span className="text-sm text-gray-300 truncate hover:text-white hover:underline">{frame.creator}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.5} className="w-3 h-3" />
                  <span>{frame.supporters} Supporters</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Creators Section */}
      <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Top Creators</h2>
          <div className="flex bg-gray-100 rounded-lg p-1">
             <button className="px-3 py-1 bg-white rounded-md text-xs font-semibold shadow-sm text-gray-900">7 days</button>
             <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-900">30 days</button>
             <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-900">All</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_CREATORS.map((creator, index) => (
            <div 
              key={creator.id} 
              onClick={() => onSelectCreator(creator)}
              className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group"
            >
               <span className="text-2xl font-bold text-gray-300 font-mono w-8">#{index + 1}</span>
               <img referrerPolicy="no-referrer" src={creator.avatar} alt={creator.name} className="w-12 h-12 rounded-full object-cover border border-gray-200 group-hover:ring-2 group-hover:ring-indigo-500 transition-all" />
               <div className="min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{creator.name}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                     <HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.5} className="w-3 h-3" /> {creator.supporters} Supporters
                  </p>
               </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// --- Sub-Component: Creator Profile View ---

const CreatorProfileView: React.FC<{
  creator: Creator;
  onBack: () => void;
  onSelectFrame: (frame: Frame) => void;
}> = ({ creator, onBack, onSelectFrame }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
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
  
  // Filter frames for this creator
  const creatorFrames = INITIAL_FRAMES.filter(f => f.creator === creator.name);

  return (
    <div className="min-h-screen bg-white text-gray-900 -m-4 md:-m-8 animate-in slide-in-from-right duration-300">
      
      {/* Banner Area - Dark Pattern */}
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
          
          {/* Left: Avatar & Info */}
          <div className="flex-1 flex flex-col items-start -mt-16 relative z-10">
             <div className="w-32 h-32 rounded-full p-1 bg-white shadow-sm">
                <img referrerPolicy="no-referrer" src={creator.avatar} alt={creator.name} className="w-full h-full rounded-full object-cover border-4 border-white bg-gray-200" />
             </div>
             
             <div className="mt-3">
                <div className="flex items-center gap-2">
                   <h1 className="text-3xl font-bold text-gray-900">{creator.name}</h1>
                   
                   {/* Dropdown Menu */}
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
                                    <HugeiconsIcon icon={Share01Icon} strokeWidth={1.5} className="w-4 h-4 text-gray-500" />
                                    Share
                                </button>
                                <button className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                                    <HugeiconsIcon icon={Flag01Icon} strokeWidth={1.5} className="w-4 h-4 text-gray-500" />
                                    Report
                                </button>
                            </div>
                        </div>
                     )}
                   </div>
                </div>

                <p className="text-gray-500 text-sm mt-1 font-medium">{creator.handle}</p>
                
                {creator.isPremium && (
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-[#0f3d35] text-[#14b8a6] px-3 py-1.5 rounded-full text-xs font-semibold border border-[#115e59] shadow-sm">
                    <HugeiconsIcon icon={SecurityCheckIcon} strokeWidth={1.5} className="w-3.5 h-3.5 fill-[#14b8a6] text-[#0f3d35]" />
                    Premium Creator
                  </div>
                )}
             </div>
          </div>

          {/* Right: Stats Card - Dark Theme (as per screenshot) */}
          <div className="mt-6 md:-mt-8 bg-[#111111] rounded-2xl p-6 border border-white/5 w-full md:w-80 shadow-2xl relative z-10 text-white">
             <div className="space-y-5">
                <div className="flex items-center justify-between group">
                   <div className="flex items-center gap-3 text-gray-400 group-hover:text-gray-300 transition-colors">
                      <HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.5} className="w-4 h-4" />
                      <span className="text-sm font-medium">Supporters</span>
                   </div>
                   <span className="font-bold text-white text-lg">{creator.supporters}</span>
                </div>
                
                <div className="w-full h-px bg-white/10" />
                
                <div className="flex items-center justify-between group">
                   <div className="flex items-center gap-3 text-gray-400 group-hover:text-gray-300 transition-colors">
                      <HugeiconsIcon icon={Megaphone01Icon} strokeWidth={1.5} className="w-4 h-4" />
                      <span className="text-sm font-medium">Campaigns</span>
                   </div>
                   <span className="font-bold text-white text-lg">{creator.campaignsCount}</span>
                </div>

                <div className="w-full h-px bg-white/10" />

                <div className="flex items-center justify-between group">
                   <div className="flex items-center gap-3 text-gray-400 group-hover:text-gray-300 transition-colors">
                      <HugeiconsIcon icon={Calendar01Icon} strokeWidth={1.5} className="w-4 h-4" />
                      <span className="text-sm font-medium">Joined Since</span>
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
               {/* Search Input - Fully Rounded */}
               <div className="relative flex-1 md:w-64 group">
                 <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                 <input 
                    type="text" 
                    placeholder="Search Campaigns" 
                    className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm transition-all shadow-sm"
                 />
               </div>
               
               {/* Filter Button - Circular */}
               <div className="relative" ref={filterRef}>
                   <button 
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="w-12 h-12 flex items-center justify-center text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-full transition-all shadow-sm active:scale-95 bg-white"
                   >
                      <HugeiconsIcon icon={FilterIcon} strokeWidth={1.5} className="w-5 h-5" />
                   </button>
                   
                   {/* Filter Dropdown */}
                   {isFilterOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-1">
                        <button className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg flex items-center justify-between group">
                            Recent
                        </button>
                        <button className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg flex items-center justify-between group">
                            Most Supported
                        </button>
                    </div>
                   )}
               </div>
            </div>
        </div>

        {/* Content Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {creatorFrames.map((frame) => (
             <div 
               key={frame.id} 
               onClick={() => onSelectFrame(frame)}
               className="bg-white rounded-2xl overflow-hidden cursor-pointer border border-gray-100 hover:shadow-xl transition-all group"
             >
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
                <p className="text-gray-500 text-sm mt-1">Try checking back later for new updates from {creator.name}.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

// --- Sub-Component: Editor View (The actual editor) ---

const EditorView: React.FC<{ 
  initialFrame: Frame; 
  onBack: () => void; 
}> = ({ initialFrame, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>('frames');
  
  // Library State
  const [frames, setFrames] = useState<Frame[]>(INITIAL_FRAMES);
  
  // Asset State
  const [frameUrl, setFrameUrl] = useState<string>(initialFrame.src);
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  
  // Transform State
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState<{x: number, y: number}>({ x: 0, y: 0 });

  // Adjustment State
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  
  // Text State
  const [customText, setCustomText] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [textY, setTextY] = useState<number>(800);
  const [textSize, setTextSize] = useState<number>(60);

  // Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{x: number, y: number}>({ x: 0, y: 0 });
  
  // Loaded Images
  const [frameImg, setFrameImg] = useState<HTMLImageElement | null>(null);
  const [userImg, setUserImg] = useState<HTMLImageElement | null>(null);

  // Load Frame
  useEffect(() => {
    const img = new Image();
    img.src = frameUrl;
    img.crossOrigin = "anonymous";
    img.onload = () => setFrameImg(img);
  }, [frameUrl]);

  // Load User Image
  useEffect(() => {
    if (userImageUrl) {
      const img = new Image();
      img.src = userImageUrl;
      img.onload = () => {
        setUserImg(img);
        setPosition({ x: 0, y: 0 });
        setScale(1);
        setRotation(0);
        setBrightness(100);
        setContrast(100);
      };
    }
  }, [userImageUrl]);

  // Main Drawing Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 1080; 
    canvas.width = size;
    canvas.height = size;

    // 1. Clear & Background
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    // 2. Draw User Image
    if (userImg) {
      ctx.save();
      ctx.translate(size / 2 + position.x, size / 2 + position.y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.drawImage(userImg, -userImg.width / 2, -userImg.height / 2);
      ctx.restore();
    } else {
        ctx.fillStyle = "#f3f4f6";
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = "#9ca3af";
        ctx.font = "bold 60px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Upload Photo", size/2, size/2);
    }

    // 3. Draw Frame
    if (frameImg) {
      ctx.drawImage(frameImg, 0, 0, size, size);
    }

    // 4. Draw Custom Text
    if (customText) {
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 10;
      ctx.fillStyle = textColor;
      ctx.font = `bold ${textSize}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(customText, size/2, textY);
      ctx.restore();
    }

  }, [frameImg, userImg, scale, rotation, position, brightness, contrast, customText, textColor, textY, textSize]);

  // Handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setUserImageUrl(ev.target.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const newFrame: Frame = {
            id: Date.now(),
            name: file.name.split('.')[0],
            category: 'custom',
            src: ev.target.result as string,
            creator: "You",
            supporters: "0"
          };
          setFrames(prev => [newFrame, ...prev]);
          setFrameUrl(newFrame.src);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `omnitask-frame-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
  };

  // Pointer Events
  const handlePointerDown = (e: React.PointerEvent) => {
    if(!userImg) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !userImg) return;
    const multiplier = 3; 
    const dx = (e.clientX - dragStart.x) * multiplier;
    const dy = (e.clientY - dragStart.y) * multiplier;
    setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] animate-in slide-in-from-right-4 duration-300">
      
      {/* Back Button for Mobile/Tablet context */}
      <div className="mb-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium text-sm"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-4 h-4" /> Back to Discovery
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 h-full">
        {/* Left: Canvas Area */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex-1 bg-gray-100 flex items-center justify-center p-4 relative">
              <div className="relative w-full max-w-[500px] aspect-square shadow-2xl rounded-lg overflow-hidden bg-white">
                  <canvas
                      ref={canvasRef}
                      className={`w-full h-full touch-none ${userImg ? 'cursor-move' : 'cursor-pointer'}`}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={() => setIsDragging(false)}
                      onPointerLeave={() => setIsDragging(false)}
                      onClick={() => !userImg && document.getElementById('photo-upload')?.click()}
                  />
              </div>
              
              {userImg && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-gray-200 flex items-center gap-3 w-64 z-10">
                      <HugeiconsIcon icon={ZoomInAreaIcon} strokeWidth={1.5} className="w-4 h-4 text-gray-500" />
                      <input 
                          type="range" 
                          min="0.1" 
                          max="3" 
                          step="0.05" 
                          value={scale} 
                          onChange={(e) => setScale(parseFloat(e.target.value))}
                          className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                  </div>
              )}
          </div>
        </div>

        {/* Right: Controls Area */}
        <div className="w-full lg:w-[400px] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Top Actions */}
          <div className="p-4 border-b border-gray-100 flex gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl cursor-pointer transition-colors">
                  <HugeiconsIcon icon={Upload01Icon} strokeWidth={1.5} className="w-4 h-4" />
                  <span>Upload Photo</span>
                  <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              <button 
                  onClick={handleDownload}
                  disabled={!userImageUrl}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors"
              >
                  <HugeiconsIcon icon={Download01Icon} strokeWidth={1.5} className="w-4 h-4" />
                  <span>Save</span>
              </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
              {[
                  { id: 'frames', icon: Layers01Icon, label: 'Frames' },
                  { id: 'transform', icon: MoveIcon, label: 'Edit' },
                  { id: 'adjust', icon: SlidersHorizontalIcon, label: 'Adjust' },
                  { id: 'text', icon: TextIcon, label: 'Text' },
              ].map((tab) => (
                  <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as Tab)}
                      className={`flex-1 py-4 flex flex-col items-center gap-1 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
                          activeTab === tab.id 
                              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
                              : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                      <HugeiconsIcon icon={tab.icon} strokeWidth={1.5} className="w-5 h-5" />
                      {tab.label}
                  </button>
              ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50">
              
              {/* 1. Frames Tab */}
              {activeTab === 'frames' && (
                  <div className="space-y-6">
                      <div className="flex gap-2 items-center">
                         <h3 className="text-xs font-semibold text-gray-500 uppercase flex-1">Selected Frame</h3>
                          <label className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer shadow-sm transition-colors" title="Upload custom frame">
                              <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} className="w-4 h-4" />
                              <input type="file" accept="image/png,image/svg+xml" onChange={handleFrameUpload} className="hidden" />
                          </label>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                          {frames.map((frame) => (
                              <button 
                                  key={frame.id}
                                  onClick={() => setFrameUrl(frame.src)}
                                  className={`relative aspect-square rounded-xl border-2 overflow-hidden transition-all group bg-white ${
                                      frameUrl === frame.src 
                                          ? 'border-indigo-600 ring-2 ring-indigo-100 shadow-md' 
                                          : 'border-gray-200 hover:border-indigo-300'
                                  }`}
                              >
                                  <img referrerPolicy="no-referrer" src={frame.src} alt={frame.name} className="w-full h-full object-cover" />
                              </button>
                          ))}
                      </div>
                  </div>
              )}

              {/* 2. Transform Tab */}
              {activeTab === 'transform' && (
                  <div className="space-y-6">
                      {!userImageUrl && <p className="text-center text-gray-400 text-sm mt-10">Please upload a photo first.</p>}
                      
                      {userImageUrl && (
                          <>
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                  <div className="flex justify-between mb-2">
                                      <label className="text-xs font-semibold text-gray-500 uppercase">Rotation</label>
                                      <span className="text-xs text-indigo-600 font-mono">{Math.round(rotation)}°</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                      <HugeiconsIcon icon={RotateClockwiseIcon} strokeWidth={1.5} className="w-4 h-4 text-gray-400" />
                                      <input 
                                          type="range" 
                                          min="-180" 
                                          max="180" 
                                          value={rotation} 
                                          onChange={(e) => setRotation(parseInt(e.target.value))}
                                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                      />
                                  </div>
                                  <div className="flex justify-center mt-4">
                                      <button 
                                          onClick={() => setRotation(prev => prev + 90)}
                                          className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-gray-600 transition-colors"
                                      >
                                          +90° Rotate
                                      </button>
                                  </div>
                              </div>
                              
                              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-700 flex items-start gap-2">
                                  <HugeiconsIcon icon={MoveIcon} strokeWidth={1.5} className="w-4 h-4 mt-0.5 shrink-0" />
                                  <p>Tip: You can drag the image on the canvas to reposition it.</p>
                              </div>
                          </>
                      )}
                  </div>
              )}

              {/* 3. Adjust Tab */}
              {activeTab === 'adjust' && (
                  <div className="space-y-6">
                      {!userImageUrl && <p className="text-center text-gray-400 text-sm mt-10">Please upload a photo first.</p>}

                      {userImageUrl && (
                          <>
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                  <div>
                                      <div className="flex justify-between mb-2">
                                          <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                                              <HugeiconsIcon icon={Sun01Icon} strokeWidth={1.5} className="w-3 h-3" /> Brightness
                                          </label>
                                          <span className="text-xs text-indigo-600 font-mono">{brightness}%</span>
                                      </div>
                                      <input 
                                          type="range" 
                                          min="0" 
                                          max="200" 
                                          value={brightness} 
                                          onChange={(e) => setBrightness(parseInt(e.target.value))}
                                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                      />
                                  </div>

                                  <div>
                                      <div className="flex justify-between mb-2">
                                          <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                                              <HugeiconsIcon icon={Sun01Icon} strokeWidth={1.5} className="w-3 h-3" /> Contrast
                                          </label>
                                          <span className="text-xs text-indigo-600 font-mono">{contrast}%</span>
                                      </div>
                                      <input 
                                          type="range" 
                                          min="0" 
                                          max="200" 
                                          value={contrast} 
                                          onChange={(e) => setContrast(parseInt(e.target.value))}
                                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                      />
                                  </div>
                              </div>

                              <button 
                                  onClick={() => { setBrightness(100); setContrast(100); }}
                                  className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-red-500 py-2"
                              >
                                  <HugeiconsIcon icon={ReloadIcon} strokeWidth={1.5} className="w-3 h-3" /> Reset Adjustments
                              </button>
                          </>
                      )}
                  </div>
              )}

              {/* 4. Text Tab */}
              {activeTab === 'text' && (
                  <div className="space-y-4">
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
                          <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Caption Text</label>
                              <input 
                                  type="text"
                                  value={customText}
                                  onChange={(e) => setCustomText(e.target.value)}
                                  placeholder="Enter name or #hashtag"
                                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                              />
                          </div>

                          <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Text Color</label>
                              <div className="flex gap-2 flex-wrap">
                                  {['#ffffff', '#000000', '#dc2626', '#2563eb', '#16a34a', '#d97706'].map(color => (
                                      <button
                                          key={color}
                                          onClick={() => setTextColor(color)}
                                          className={`w-8 h-8 rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110 ${textColor === color ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                                          style={{ backgroundColor: color }}
                                      />
                                  ))}
                              </div>
                          </div>

                          <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Vertical Position</label>
                              <input 
                                  type="range" 
                                  min="100" 
                                  max="1000" 
                                  value={textY} 
                                  onChange={(e) => setTextY(parseInt(e.target.value))}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                              />
                          </div>

                          <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Text Size</label>
                              <input 
                                  type="range" 
                                  min="20" 
                                  max="150" 
                                  value={textSize} 
                                  onChange={(e) => setTextSize(parseInt(e.target.value))}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                              />
                          </div>
                      </div>
                  </div>
              )}

          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Container Component ---

export const FrameEditor: React.FC = () => {
  const [viewState, setViewState] = useState<'DISCOVERY' | 'EDITOR' | 'CREATOR'>('DISCOVERY');
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  const handleSelectFrame = (frame: Frame) => {
    setSelectedFrame(frame);
    setViewState('EDITOR');
  };

  const handleSelectCreator = (creator: Creator) => {
    setSelectedCreator(creator);
    setViewState('CREATOR');
  };

  const handleBackToDiscovery = () => {
    setViewState('DISCOVERY');
    setSelectedFrame(null);
    setSelectedCreator(null);
  };

  return (
    <>
      {viewState === 'DISCOVERY' && (
        <DiscoveryView 
          onSelectFrame={handleSelectFrame} 
          onSelectCreator={handleSelectCreator}
        />
      )}
      
      {viewState === 'CREATOR' && selectedCreator && (
        <CreatorProfileView 
          creator={selectedCreator}
          onBack={handleBackToDiscovery}
          onSelectFrame={handleSelectFrame}
        />
      )}

      {viewState === 'EDITOR' && selectedFrame && (
        <EditorView 
          initialFrame={selectedFrame} 
          onBack={handleBackToDiscovery} 
        />
      )}
    </>
  );
};
