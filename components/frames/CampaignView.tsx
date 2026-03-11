import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, UserGroupIcon, Camera01Icon, Share01Icon, MoreHorizontalIcon, Maximize01Icon, Cancel01Icon, Link01Icon, Mail01Icon, Facebook01Icon } from '@hugeicons/core-free-icons';

import React, { useMemo, useState } from 'react';

import { Frame, Creator, MOCK_CREATORS } from './shared';

interface CampaignViewProps {
  frame: Frame;
  onBack: () => void;
  onUseFrame: (frame: Frame) => void;
  onSelectCreator: (creator: Creator) => void;
}

export const CampaignView: React.FC<CampaignViewProps> = ({ frame, onBack, onUseFrame, onSelectCreator }) => {
  const creator = useMemo(() => MOCK_CREATORS.find(c => c.name === frame.creator), [frame.creator]);
  
  // State for Gallery Modal & Share Modal
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Generate a mock slug for the URL
  const campaignSlug = `twb.nz/${frame.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

  // Expanded mock images for the grid view
  const galleryImages = [
    "https://picsum.photos/seed/g1/400",
    "https://picsum.photos/seed/g2/400",
    "https://picsum.photos/seed/g3/400",
    "https://picsum.photos/seed/g4/400",
    "https://picsum.photos/seed/g5/400",
    "https://picsum.photos/seed/g6/400",
    "https://picsum.photos/seed/g7/400",
    "https://picsum.photos/seed/g8/400",
    "https://picsum.photos/seed/g9/400",
    "https://picsum.photos/seed/g10/400",
    "https://picsum.photos/seed/g11/400",
    "https://picsum.photos/seed/g12/400",
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col -m-4 md:-m-8 animate-in slide-in-from-right duration-300 relative">
        
        {/* Header / Nav */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-4 py-3 border-b border-gray-200 flex items-center justify-between">
           <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-6 h-6 text-gray-700" />
           </button>
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
              >
                 <HugeiconsIcon icon={Share01Icon} strokeWidth={1.5} className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700">
                 <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.5} className="w-5 h-5" />
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6 md:p-8">
             <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                
                {/* Left Column: Frame Preview */}
                <div className="w-full lg:w-1/2">
                   <div className="relative aspect-square bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl shadow-sm border border-gray-100 p-8 flex items-center justify-center overflow-hidden">
                      <div className="relative w-full h-full shadow-xl rounded-full overflow-hidden bg-white">
                          {/* Mock user photo behind frame */}
                          <img referrerPolicy="no-referrer" src="https://picsum.photos/800/800" className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Preview" />
                          {/* The Frame */}
                          <img referrerPolicy="no-referrer" src={frame.src} className="absolute inset-0 w-full h-full object-contain z-10" alt={frame.name} />
                      </div>
                   </div>
                </div>

                {/* Right Column: Details */}
                <div className="w-full lg:w-1/2 space-y-8">
                   
                   {/* Title & Creator */}
                   <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
                         {frame.name}
                      </h1>
                      
                      {creator && (
                         <div 
                           className="flex items-center gap-3 cursor-pointer group"
                           onClick={() => onSelectCreator(creator)}
                         >
                            <img referrerPolicy="no-referrer" src={creator.avatar} alt={creator.name} className="w-10 h-10 rounded-full border border-gray-200" />
                            <div>
                               <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{creator.name}</h3>
                               <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.5} className="w-3 h-3" /> {frame.supporters} supporters
                               </p>
                            </div>
                         </div>
                      )}
                   </div>

                   {/* Gallery */}
                   <div>
                      <div className="flex items-center justify-between mb-3">
                         <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.5} className="w-4 h-4" /> Gallery
                         </h3>
                         <button 
                            onClick={() => setIsGalleryOpen(true)}
                            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Gallery"
                         >
                            <HugeiconsIcon icon={Maximize01Icon} strokeWidth={1.5} className="w-4 h-4" />
                         </button>
                      </div>
                      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                         {galleryImages.slice(0, 5).map((img, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => setIsGalleryOpen(true)}
                              className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100 cursor-pointer hover:ring-indigo-200 transition-all"
                            >
                               <div className="relative w-full h-full">
                                  <img referrerPolicy="no-referrer" src={img} className="w-full h-full object-cover" alt="Gallery" />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                     <img referrerPolicy="no-referrer" src={frame.src} className="w-full h-full object-contain p-0.5" alt="Frame Overlay" />
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* About */}
                   <div>
                      <h3 className="font-semibold text-gray-900 mb-2">About This Campaign</h3>
                      <p className="text-gray-600 leading-relaxed text-sm">
                         Join us in celebrating this special event! Show your support by adding this frame to your profile picture. 
                         Created on {new Date().getFullYear()} to bring our community together.
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                         Created on {creator?.joinedDate}
                      </p>
                   </div>

                </div>
             </div>
          </div>
        </div>

        {/* Sticky Bottom Action */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 md:p-6 z-40">
           <div className="max-w-6xl mx-auto flex justify-center">
              <button 
                 onClick={() => onUseFrame(frame)}
                 className="w-full md:w-auto md:min-w-[300px] bg-[#14b8a6] hover:bg-[#0d9488] text-white font-bold text-lg py-4 px-8 rounded-full shadow-lg shadow-teal-200 flex items-center justify-center gap-3 transition-transform active:scale-95"
              >
                 <HugeiconsIcon icon={Camera01Icon} strokeWidth={1.5} className="w-6 h-6" />
                 Choose Your Photo
              </button>
           </div>
        </div>

      </div>

      {/* Fullscreen Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 md:left-20 z-[100] bg-white flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shadow-sm shrink-0">
                <div className="flex items-center gap-4 overflow-hidden">
                    <button 
                        onClick={() => setIsGalleryOpen(false)}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                    >
                        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-6 h-6" />
                    </button>
                    <h2 className="text-lg font-bold text-gray-900 truncate">
                        {frame.name}
                    </h2>
                </div>
                
                <button 
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
                >
                    <HugeiconsIcon icon={Link01Icon} strokeWidth={1.5} className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{campaignSlug}</span>
                </button>
            </div>

            {/* Modal Content - Grid */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {galleryImages.map((img, idx) => (
                        <div key={idx} className="aspect-square bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm relative group cursor-pointer hover:shadow-md transition-shadow">
                             <img referrerPolicy="no-referrer" src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                             <div className="absolute inset-0 flex items-center justify-center">
                                 {/* Overlay the frame on top to simulate the result */}
                                 <img referrerPolicy="no-referrer" src={frame.src} className="w-full h-full object-contain pointer-events-none" />
                             </div>
                             
                             {/* Badge */}
                             <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold text-gray-500 shadow-sm flex items-center gap-1">
                                Made with <span className="text-indigo-600">Ponloe.org</span>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Share Modal Popup */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 relative shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-6 h-6" />
            </button>

            {/* Preview Image */}
            <div className="w-48 h-48 rounded-2xl overflow-hidden mb-6 relative shadow-md bg-gray-100">
               {/* Using a mock user image for preview + frame */}
               <img referrerPolicy="no-referrer" src="https://picsum.photos/seed/share/400" className="w-full h-full object-cover" alt="User" />
               <img referrerPolicy="no-referrer" src={frame.src} className="absolute inset-0 w-full h-full object-contain" alt="Frame" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-6">Share to your social media</h3>

            {/* Social Icons */}
            <div className="flex gap-4 mb-8">
              <button className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity transform hover:scale-105">
                 <HugeiconsIcon icon={Facebook01Icon} strokeWidth={1.5} className="w-6 h-6 fill-current" />
              </button>
              <button className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity transform hover:scale-105">
                 <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
              </button>
              <button className="w-12 h-12 border border-gray-200 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all transform hover:scale-105">
                 <HugeiconsIcon icon={Mail01Icon} strokeWidth={1.5} className="w-6 h-6" />
              </button>
            </div>

            {/* Separator */}
            <div className="relative w-full mb-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-sm text-gray-500 font-medium">or copy link</span>
              </div>
            </div>

            {/* Copy Link Input */}
            <div className="w-full relative flex items-center group">
              <input 
                type="text" 
                readOnly
                value={campaignSlug}
                className="w-full pl-4 pr-20 py-3 border border-gray-200 rounded-xl text-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-gray-50/50"
              />
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors shadow-sm"
                onClick={() => {
                  navigator.clipboard.writeText(campaignSlug);
                  // Optional: Show copied feedback
                }}
              >
                Copy
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
