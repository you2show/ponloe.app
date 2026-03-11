import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Image01Icon, Video01Icon, Loading02Icon } from '@hugeicons/core-free-icons';
import { useQuery } from '@tanstack/react-query';

interface BackgroundPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (bg: { id: string; type: 'image' | 'video'; url: string }) => void;
}

export const BackgroundPickerModal: React.FC<BackgroundPickerModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');

  const fetchImages = async () => {
    const apiKey = (import.meta as any).env.VITE_UNSPLASH_ACCESS_KEY;
    if (apiKey) {
      const res = await fetch(`https://api.unsplash.com/search/photos?query=minimal&orientation=landscape&per_page=30&client_id=${apiKey}`);
      if (!res.ok) throw new Error('Network response error');
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON success response:', text.substring(0, 200));
        throw new Error(`Server returned an invalid response. Content-Type: ${contentType}`);
      }
      const data = await res.json();
      return data.results.map((img: any) => ({
        id: img.id,
        type: 'image',
        url: img.urls.regular,
        thumb: img.urls.small
      }));
    } else {
      // Fallback images
      return [
        { id: 'bg1', type: 'image', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', thumb: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80' },
        { id: 'bg2', type: 'image', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80', thumb: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=200&q=80' },
        { id: 'bg3', type: 'image', url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80', thumb: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=200&q=80' },
        { id: 'bg4', type: 'image', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80', thumb: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=200&q=80' },
        { id: 'bg5', type: 'image', url: 'https://images.unsplash.com/photo-1506744626753-dba37c259d1b?auto=format&fit=crop&w=800&q=80', thumb: 'https://images.unsplash.com/photo-1506744626753-dba37c259d1b?auto=format&fit=crop&w=200&q=80' },
        { id: 'bg6', type: 'image', url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=800&q=80', thumb: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=200&q=80' },
        { id: 'bg7', type: 'image', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', thumb: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=200&q=80' },
        { id: 'bg8', type: 'image', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80', thumb: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=200&q=80' },
      ];
    }
  };

  const fetchVideos = async () => {
    // Unsplash doesn't have a public video API, so we use a fallback list of nature videos
    // In a real app, you might use Pexels or Pixabay API here.
    return [
      { id: 'vid1', type: 'video', url: 'https://cdn.pixabay.com/video/2020/05/25/40139-425345914_tiny.mp4', thumb: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=200&q=80' },
      { id: 'vid2', type: 'video', url: 'https://cdn.pixabay.com/video/2019/04/17/22810-330689363_tiny.mp4', thumb: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=200&q=80' },
      { id: 'vid3', type: 'video', url: 'https://cdn.pixabay.com/video/2020/02/24/32832-393717144_tiny.mp4', thumb: 'https://images.unsplash.com/photo-1506744626753-dba37c259d1b?auto=format&fit=crop&w=200&q=80' },
    ];
  };

  const { data: images = [], isLoading: loadingImages } = useQuery({
    queryKey: ['backgroundImages'],
    queryFn: fetchImages,
    enabled: isOpen && activeTab === 'image',
    staleTime: Infinity,
  });

  const { data: videos = [], isLoading: loadingVideos } = useQuery({
    queryKey: ['backgroundVideos'],
    queryFn: fetchVideos,
    enabled: isOpen && activeTab === 'video',
    staleTime: Infinity,
  });

  const loading = activeTab === 'image' ? loadingImages : loadingVideos;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200 font-khmer">
      <div className="bg-[#1e293b] w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col overflow-hidden relative h-[80vh]">
        
        <div className="flex justify-between items-center p-4 border-b border-white/10 shrink-0">
          <h3 className="text-white font-bold text-lg">ជ្រើសរើសផ្ទៃខាងក្រោយ</h3>
          <button onClick={onClose} className="p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors">
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
          </button>
        </div>

        <div className="flex p-4 justify-center items-center border-b border-white/10 shrink-0">
           <div className="flex bg-black/20 rounded-full p-1 w-full max-w-xs">
             <button 
               onClick={() => setActiveTab('image')}
               className={`flex-1 py-2 flex justify-center items-center gap-2 rounded-full transition-colors text-sm font-bold ${activeTab === 'image' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-200'}`}
             >
               <HugeiconsIcon icon={Image01Icon} strokeWidth={1.5} className="w-4 h-4" /> Image
             </button>
             <button 
               onClick={() => setActiveTab('video')}
               className={`flex-1 py-2 flex justify-center items-center gap-2 rounded-full transition-colors text-sm font-bold ${activeTab === 'video' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-200'}`}
             >
               <HugeiconsIcon icon={Video01Icon} strokeWidth={1.5} className="w-4 h-4" /> Video
             </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-full text-emerald-500">
              <HugeiconsIcon icon={Loading02Icon} strokeWidth={1.5} className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(activeTab === 'image' ? images : videos).map((media) => (
                <button
                  key={media.id}
                  onClick={() => {
                    onSelect({ id: media.id, type: media.type, url: media.url });
                    onClose();
                  }}
                  className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-emerald-500 transition-all group relative"
                >
                  <img referrerPolicy="no-referrer" src={media.thumb || media.url || undefined} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  {media.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white">
                        <HugeiconsIcon icon={Video01Icon} strokeWidth={1.5} className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
