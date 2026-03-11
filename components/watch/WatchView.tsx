import { Playlist01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { FilterIcon, MoreVerticalIcon, Share01Icon, ThumbsUpIcon, Notification01Icon, Download01Icon, Search01Icon, Cancel01Icon, MoreHorizontalIcon, Flag01Icon, LinkSquare01Icon, AlertCircleIcon } from '@hugeicons/core-free-icons';

import React, { useState } from 'react';

import { CATEGORIES, VIDEO_DATA, Video } from './data';

export const WatchView: React.FC<{ isEmbedded?: boolean }> = ({ isEmbedded = false }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  
  // Player UI State
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const filteredVideos = VIDEO_DATA.filter(video => {
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          video.channelName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openVideo = (video: Video) => {
    setActiveVideo(video);
    setIsDescriptionExpanded(false);
    setIsSubscribed(false);
    setIsMoreMenuOpen(false);
    // Scroll to top when opening a video
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to determine the correct Embed URL
  const getVideoSrc = (video: Video) => {
    if (video.source === 'facebook' && video.url) {
        // Facebook Embed Logic - Try to force standard video plugin
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(video.url)}&show_text=0&width=560`;
    }
    if (video.source === 'drive' && video.url) {
        // Google Drive Embed Logic: replace /view with /preview
        return video.url.replace(/\/view.*/, '/preview');
    }
    // Default to YouTube with origin to prevent some cross-origin errors
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&playsinline=1&origin=${origin}`;
  };

  const getSourceLink = (video: Video) => {
      if (video.source === 'facebook' || video.source === 'drive') return video.url;
      return `https://www.youtube.com/watch?v=${video.youtubeId}`;
  }

  const getSourceLabel = (source: string) => {
      switch(source) {
          case 'facebook': return 'Facebook';
          case 'drive': return 'Google Drive';
          default: return 'YouTube';
      }
  }

  return (
    <div className={`${isEmbedded ? 'bg-transparent' : 'min-h-screen bg-white pb-24'} animate-in fade-in duration-300`}>
      
      {/* Header (Only show if not watching a video) */}
      {!activeVideo && (
        <div className={`${isEmbedded ? 'bg-transparent mb-4' : 'bg-white border-b border-gray-100 sticky top-0 z-20'}`}>
          <div className={`${isEmbedded ? '' : 'max-w-7xl mx-auto px-4 py-3'}`}>
             <div className="flex items-center gap-4 mb-3">
                <div className="flex-1 relative group">
                   <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-600" />
                   <input 
                      type="text" 
                      placeholder="ស្វែងរក..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 rounded-full text-sm outline-none transition-all font-khmer"
                   />
                </div>
                <button className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                   <HugeiconsIcon icon={FilterIcon} strokeWidth={1.5} className="w-5 h-5" />
                </button>
             </div>

             {/* Categories */}
             <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {CATEGORIES.map(cat => (
                   <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all font-khmer ${
                         selectedCategory === cat.id 
                            ? 'bg-black text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                   >
                      {cat.label}
                   </button>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`mx-auto ${activeVideo ? '' : isEmbedded ? '' : 'max-w-7xl px-4 py-6'}`}>
         
         {/* Video Grid (Hide if watching) */}
         {!activeVideo && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
               {filteredVideos.map((video) => (
                  <div 
                      key={video.id} 
                      className="group cursor-pointer flex flex-col gap-3"
                      onClick={() => openVideo(video)}
                  >
                      {/* Thumbnail Container */}
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200">
                          <img referrerPolicy="no-referrer" src={video.thumbnail || undefined} 
                              alt={video.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                              {video.duration}
                          </div>
                          {video.source === 'facebook' && (
                              <div className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <span>FACEBOOK</span>
                              </div>
                          )}
                          {video.source === 'drive' && (
                              <div className="absolute top-1.5 left-1.5 bg-green-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <span>DRIVE</span>
                              </div>
                          )}
                      </div>

                      {/* Info */}
                      <div className="flex gap-3 px-1">
                          <img referrerPolicy="no-referrer" src={video.channelAvatar || undefined} 
                              alt={video.channelName}
                              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 font-khmer text-sm line-clamp-2 leading-snug group-hover:text-black mb-1">
                                  {video.title}
                              </h4>
                              <div className="text-xs text-gray-500 flex flex-col">
                                  <span className="text-black hover:text-gray-700">{video.channelName}</span>
                                  <span>{video.views} views • {video.date}</span>
                              </div>
                          </div>
                          <button className="self-start text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                              <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={1.5} className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
               ))}
            </div>
         )}

         {/* Detailed Video Player View */}
         {activeVideo && (
            <div className="flex flex-col lg:flex-row gap-6 animate-in slide-in-from-bottom-4 duration-300 bg-white min-h-screen">
                
                {/* Left Column: Video & Main Info */}
                <div className="flex-1">
                    {/* Sticky Video Player - Removed sticky class */}
                    <div className="w-full bg-black">
                        <div className={`w-full relative ${activeVideo.source === 'facebook' ? 'aspect-[9/16] md:aspect-video' : 'aspect-video'}`}>
                            <iframe 
                                className="w-full h-full absolute inset-0"
                                src={getVideoSrc(activeVideo) || undefined}
                                title={activeVideo.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                            <button 
                                onClick={() => setActiveVideo(null)}
                                className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-colors lg:hidden z-10"
                            >
                                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Fallback / Warning Message */}
                    <div className="bg-amber-50 p-3 border-b border-amber-100 flex items-center justify-between gap-3 text-amber-800 text-xs md:text-sm">
                        <div className="flex items-center gap-2">
                            <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={1.5} className="w-4 h-4 shrink-0" />
                            <span>វីដេអូមិនដំណើរការ ឬចេញ Error?</span>
                        </div>
                        <a 
                            href={getSourceLink(activeVideo)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 font-bold underline whitespace-nowrap hover:text-amber-900"
                        >
                            មើលនៅលើ {getSourceLabel(activeVideo.source)} <HugeiconsIcon icon={LinkSquare01Icon} strokeWidth={1.5} className="w-3 h-3" />
                        </a>
                    </div>

                    <div className="p-4 md:p-6 space-y-4">
                        {/* Title */}
                        <h1 className="text-lg md:text-xl font-bold text-gray-900 font-khmer leading-snug">
                            {activeVideo.title}
                        </h1>

                        {/* Channel & Actions Bar */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            
                            {/* Channel Info */}
                            <div className="flex items-center gap-3">
                                <img referrerPolicy="no-referrer" src={activeVideo.channelAvatar || undefined} 
                                    className="w-10 h-10 rounded-full object-cover cursor-pointer"
                                    alt={activeVideo.channelName}
                                />
                                <div className="mr-2">
                                    <h3 className="font-bold text-sm text-black cursor-pointer">{activeVideo.channelName}</h3>
                                    <p className="text-xs text-gray-500">{activeVideo.subscribers} subscribers</p>
                                </div>
                                <button 
                                    onClick={() => setIsSubscribed(!isSubscribed)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                                        isSubscribed 
                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2' 
                                        : 'bg-black text-white hover:bg-gray-800'
                                    }`}
                                >
                                    {isSubscribed ? <><HugeiconsIcon icon={Notification01Icon} strokeWidth={1.5} className="w-4 h-4 fill-current"/> Subscribed</> : 'Subscribe'}
                                </button>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                                <div className="flex items-center bg-gray-100 rounded-full h-9 text-black">
                                    <button className="flex items-center gap-2 px-4 h-full hover:bg-gray-200 rounded-l-full border-r border-gray-300 transition-colors text-sm font-bold">
                                        <HugeiconsIcon icon={ThumbsUpIcon} strokeWidth={1.5} className="w-4 h-4" /> {activeVideo.likes}
                                    </button>
                                    <button className="px-4 h-full hover:bg-gray-200 rounded-r-full transition-colors text-black">
                                        <HugeiconsIcon icon={ThumbsUpIcon} strokeWidth={1.5} className="w-4 h-4 rotate-180 mt-1" />
                                    </button>
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-bold text-black transition-colors whitespace-nowrap">
                                    <HugeiconsIcon icon={Share01Icon} strokeWidth={1.5} className="w-4 h-4" /> ចែករំលែក
                                </button>
                                
                                {/* More Menu Dropdown */}
                                <div className="relative">
                                    <button 
                                        onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                                        className="flex items-center justify-center w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-bold text-black transition-colors flex-shrink-0"
                                    >
                                        <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.5} className="w-5 h-5" />
                                    </button>
                                    
                                    {isMoreMenuOpen && (
                                        <div className="absolute right-0 top-full mt-2 bg-white shadow-xl rounded-xl border border-gray-100 p-2 z-10 w-48 animate-in fade-in zoom-in-95 duration-200 font-khmer">
                                            <button className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors text-left">
                                                <HugeiconsIcon icon={Download01Icon} strokeWidth={1.5} className="w-4 h-4" /> ទាញយក
                                            </button>
                                            <button className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors text-left">
                                                <HugeiconsIcon icon={Playlist01Icon} strokeWidth={1.5} className="w-4 h-4" /> រក្សាទុក
                                            </button>
                                            <div className="h-px bg-gray-100 my-1"></div>
                                            <button className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors text-left">
                                                <HugeiconsIcon icon={Flag01Icon} strokeWidth={1.5} className="w-4 h-4" /> រាយការណ៍
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description Box */}
                        <div className={`bg-gray-100 rounded-xl p-3 text-sm cursor-pointer hover:bg-gray-200 transition-colors ${isDescriptionExpanded ? '' : ''}`} onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                            <div className="flex gap-2 font-bold text-black mb-2 text-sm">
                                <span>{activeVideo.views} views</span>
                                <span>•</span>
                                <span>{activeVideo.date}</span>
                            </div>
                            <div className="relative">
                                <p className={`text-gray-800 font-khmer leading-relaxed whitespace-pre-wrap ${isDescriptionExpanded ? '' : 'line-clamp-2'}`}>
                                    {activeVideo.description || "No description provided."}
                                    <br/><br/>
                                    #Islam #Dawah #Cambodia #Quran
                                </p>
                                <span className="font-bold text-gray-600 mt-1 block hover:underline">
                                    {isDescriptionExpanded ? 'Show less' : '...more'}
                                </span>
                            </div>
                        </div>

                        {/* Comments Section Preview */}
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-xl">{activeVideo.comments} Comments</h3>
                                <div className="flex items-center gap-2 text-sm font-bold cursor-pointer text-black font-khmer">
                                    <HugeiconsIcon icon={FilterIcon} strokeWidth={1.5} className="w-5 h-5" /> 
                                    <span className="hidden sm:inline">តម្រៀបតាម</span>
                                </div>
                            </div>
                            
                            {/* Add Comment Input */}
                            <div className="flex gap-4 mb-6">
                                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">Y</div>
                                <div className="flex-1">
                                    <input 
                                        type="text" 
                                        placeholder="បន្ថែមមតិយោបល់..." 
                                        className="w-full border-b border-gray-300 py-2 focus:border-black focus:outline-none bg-transparent text-sm transition-colors font-khmer"
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button className="px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100 font-khmer">បោះបង់</button>
                                        <button className="px-4 py-2 rounded-full text-sm font-bold bg-gray-100 text-gray-400 font-khmer">បញ្ចេញមតិ</button>
                                    </div>
                                </div>
                            </div>

                            {/* Mock Comments */}
                            <div className="space-y-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 overflow-hidden">
                                            <img referrerPolicy="no-referrer" src={`https://ui-avatars.com/api/?name=User+${i}&background=random`} alt="user" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-xs text-black">@user_commenter_{i}</span>
                                                <span className="text-xs text-gray-500 font-khmer">• 2 ថ្ងៃមុន</span>
                                            </div>
                                            <p className="text-sm text-gray-800 font-khmer">
                                                វីដេអូល្អណាស់ សូមអល់ឡោះប្រទានផលបុណ្យដល់ក្រុមការងារ។
                                            </p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <button className="flex items-center gap-1 text-xs font-bold text-gray-600 hover:bg-gray-100 p-1.5 rounded-full">
                                                    <HugeiconsIcon icon={ThumbsUpIcon} strokeWidth={1.5} className="w-3.5 h-3.5" /> {12 * i}
                                                </button>
                                                <button className="flex items-center gap-1 text-xs font-bold text-gray-600 hover:bg-gray-100 p-1.5 rounded-full">
                                                    <HugeiconsIcon icon={ThumbsUpIcon} strokeWidth={1.5} className="w-3.5 h-3.5 rotate-180 mt-1" />
                                                </button>
                                                <button className="text-xs font-bold text-gray-600 px-3 py-1.5 hover:bg-gray-100 rounded-full font-khmer">ឆ្លើយតប</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Suggested Videos */}
                <div className="lg:w-[350px] p-4 lg:p-6 lg:border-l border-gray-100 flex-shrink-0">
                    <div className="flex items-center justify-between mb-4 lg:hidden">
                        <h3 className="font-bold text-lg text-black">Next</h3>
                        <button className="px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium text-black">Autoplay</button>
                    </div>
                    <div className="space-y-3">
                        {filteredVideos.filter(v => v.id !== activeVideo.id).map(video => (
                            <div 
                                key={video.id} 
                                className="flex gap-2 cursor-pointer group"
                                onClick={() => openVideo(video)}
                            >
                                <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                    <img referrerPolicy="no-referrer" src={video.thumbnail || undefined} className="w-full h-full object-cover" />
                                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-bold px-1 rounded">
                                        {video.duration}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight font-khmer mb-1 group-hover:text-emerald-700">
                                        {video.title}
                                    </h4>
                                    <p className="text-xs text-gray-500">{video.channelName}</p>
                                    <p className="text-xs text-gray-500">{video.views} views • {video.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
         )}

      </div>
    </div>
  );
};
