import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, ArrowRight01Icon, UserGroupIcon } from '@hugeicons/core-free-icons';

import React, { useState } from 'react';

import { Frame, Creator, MOCK_CREATORS, INITIAL_FRAMES } from './shared';

interface DiscoveryViewProps {
  onSelectFrame: (frame: Frame) => void;
  onSelectCreator: (creator: Creator) => void;
}

export const DiscoveryView: React.FC<DiscoveryViewProps> = ({ onSelectFrame, onSelectCreator }) => {
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
