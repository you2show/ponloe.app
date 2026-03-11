import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { HugeiconsIcon } from '@hugeicons/react';
import { Image01Icon, UserCircleIcon, Calendar01Icon, Location01Icon, Search01Icon } from '@hugeicons/core-free-icons';
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { Post } from '../shared';
import { PostFooter } from '../feed/post-card/PostFooter';

interface GalleryImage {
  id: string;
  imageUrl: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: string;
  location?: string;
  rawDate: string;
  post: Post;
}

export const GalleryView: React.FC = () => {
  const { theme } = useTheme();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [locations, setLocations] = useState<string[]>([]);

  const imagesRef = useRef<GalleryImage[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [portalContainer, setPortalContainer] = useState<{ element: HTMLElement, post: Post } | null>(null);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    fetchImages();
    
    // Initialize Fancybox
    Fancybox.bind("[data-fancybox='gallery']", {
      // Custom options
      Html: {
        sanitize: false,
      },
      Toolbar: {
        display: {
          left: ["download", "infobar"],
          middle: [
            "zoomIn",
            "zoomOut",
            "toggle1to1",
            "rotateCCW",
            "rotateCW",
            "flipX",
            "flipY",
          ],
          right: ["slideshow", "thumbs", "close"],
        },
      },
      on: {
        done: (fancybox: any, slide: any) => {
          const triggerEl = slide.triggerEl;
          if (!triggerEl) return;
          const imageId = triggerEl.getAttribute('data-image-id');
          const galleryImage = imagesRef.current.find(img => img.id === imageId);
          if (!galleryImage) return;

          // Find the container we injected in data-caption
          // Use polling to ensure the caption HTML is fully rendered in the DOM
          if (intervalRef.current) clearInterval(intervalRef.current);
          let attempts = 0;
          intervalRef.current = setInterval(() => {
            const container = document.querySelector(`.post-footer-container-${imageId}`) as HTMLElement;
            if (container) {
              setPortalContainer({ element: container, post: galleryImage.post });
              if (intervalRef.current) clearInterval(intervalRef.current);
            }
            attempts++;
            if (attempts > 20) { // Stop after 2 seconds
              if (intervalRef.current) clearInterval(intervalRef.current);
            }
          }, 100);
        },
        "Carousel.change": () => {
          // Clear portal when changing slides to avoid showing wrong post footer
          if (intervalRef.current) clearInterval(intervalRef.current);
          setPortalContainer(null);
        },
        closing: () => {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setPortalContainer(null);
        }
      }
    } as any);

    return () => {
      Fancybox.destroy();
    };
  }, []);

  useEffect(() => {
    // Apply filters
    let result = images;
    
    if (selectedDate) {
      result = result.filter(img => img.rawDate.startsWith(selectedDate));
    }
    
    if (selectedLocation) {
      result = result.filter(img => img.location === selectedLocation);
    }
    
    setFilteredImages(result);
  }, [selectedDate, selectedLocation, images]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      if (supabase) {
        // Fetch posts that have media_urls
        const { data, error } = await supabase
          .from('posts')
          .select(`
            id,
            media_urls,
            created_at,
            extra_data,
            profiles:user_id (
              id,
              full_name,
              avatar_url
            )
          `)
          .not('media_urls', 'is', null)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;

        if (data) {
          const galleryItems: GalleryImage[] = [];
          const uniqueLocations = new Set<string>();
          
          data.forEach((post: any) => {
            const location = post.extra_data?.location || '';
            if (location) uniqueLocations.add(location);

            const formattedPost: Post = {
              id: post.id,
              user: {
                id: post.profiles?.id,
                name: post.profiles?.full_name || 'អ្នកប្រើប្រាស់',
                avatar: post.profiles?.avatar_url || 'https://ui-avatars.com/api/?name=User&background=random',
              },
              content: post.content || '',
              timestamp: new Date(post.created_at).toLocaleDateString(),
              likes: 0,
              commentsCount: 0,
              shares: 0,
              isLiked: false,
              type: post.extra_data?.originalType || post.type || 'image',
              images: post.media_urls || [],
              ...post.extra_data
            };

            if (post.media_urls && Array.isArray(post.media_urls) && post.media_urls.length > 0) {
              post.media_urls.forEach((url: string | { url: string }, index: number) => {
                const imageUrl = typeof url === 'string' ? url : url.url;
                if (imageUrl) {
                  galleryItems.push({
                    id: `${post.id}-${index}`,
                    imageUrl,
                    user: formattedPost.user,
                    timestamp: formattedPost.timestamp,
                    rawDate: post.created_at.split('T')[0],
                    location: location,
                    post: formattedPost,
                  });
                }
              });
            }
          });
          
          setImages(galleryItems);
          setFilteredImages(galleryItems);
          setLocations(Array.from(uniqueLocations).filter(Boolean));
        }
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (id: string) => {
    // Remove the image from both images and filteredImages arrays
    setImages(prev => prev.filter(img => img.id !== id));
    setFilteredImages(prev => prev.filter(img => img.id !== id));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-20 ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`sticky top-0 z-30 px-4 py-3 flex flex-col gap-3 shadow-sm ${
        theme === 'dark' ? 'bg-slate-900/95 backdrop-blur border-b border-slate-800' : 'bg-white/95 backdrop-blur border-b border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
            <HugeiconsIcon icon={Image01Icon} strokeWidth={1.5} className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold font-khmer">វិចិត្រសាលរូបភាព (Gallery)</h1>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
            theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <HugeiconsIcon icon={Calendar01Icon} strokeWidth={1.5} className="w-4 h-4 text-gray-500" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`bg-transparent border-none outline-none text-sm font-khmer ${
                theme === 'dark' ? 'text-white color-scheme-dark' : 'text-gray-900'
              }`}
            />
            {selectedDate && (
              <button onClick={() => setSelectedDate('')} className="text-xs text-red-500 ml-2">លុប</button>
            )}
          </div>

          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
            theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <HugeiconsIcon icon={Location01Icon} strokeWidth={1.5} className="w-4 h-4 text-gray-500" />
            <select 
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className={`bg-transparent border-none outline-none text-sm font-khmer max-w-[150px] ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              <option value="" className={theme === 'dark' ? 'bg-slate-800' : 'bg-white'}>គ្រប់ទីតាំង</option>
              {locations.map(loc => (
                <option key={loc} value={loc} className={theme === 'dark' ? 'bg-slate-800' : 'bg-white'}>{loc}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-7xl mx-auto">
        {filteredImages.length === 0 ? (
          <div className="text-center py-20">
            <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-bold font-khmer text-gray-500">មិនមានរូបភាពទេ</h3>
            <p className="text-sm text-gray-400 mt-2">សូមសាកល្បងប្តូរថ្ងៃ ឬទីតាំងផ្សេង</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {filteredImages.map((item) => (
              <div key={item.id} className="break-inside-avoid group relative rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <a 
                  href={item.imageUrl} 
                  data-fancybox="gallery" 
                  data-image-id={item.id}
                  data-caption={`
                    <div class="flex flex-col w-full max-w-5xl mx-auto px-2">
                      <div class="flex items-center justify-between w-full mb-4">
                        <div class="flex items-center gap-3">
                          <img src="${item.user.avatar}" class="w-10 h-10 rounded-full object-cover border-2 border-white/20 shadow-sm" />
                          <div class="text-left">
                            <p class="text-sm font-bold text-white m-0 font-khmer">${item.user.name}</p>
                            <p class="text-xs text-gray-300 m-0 mt-0.5">${item.timestamp}${item.location ? ` • ${item.location}` : ''}</p>
                          </div>
                        </div>
                        <a href="${item.imageUrl}" download target="_blank" class="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-khmer transition-all backdrop-blur-md">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                          ទាញយក
                        </a>
                      </div>
                      <div class="post-footer-container-${item.id} w-full bg-white dark:bg-slate-900 rounded-xl overflow-hidden"></div>
                    </div>
                  `}
                  className="block w-full h-full cursor-zoom-in"
                >
                  <img 
                    src={item.imageUrl} 
                    alt="Post media" 
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={() => handleImageError(item.id)}
                  />
                  
                  {/* Gradient overlay that appears on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <img 
                        src={item.user.avatar} 
                        alt={item.user.name} 
                        className="w-8 h-8 rounded-full object-cover border border-white/20"
                        referrerPolicy="no-referrer"
                      />
                      <p className="text-sm font-bold text-white truncate font-khmer">{item.user.name}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-gray-300 truncate">{item.timestamp}</p>
                      {item.location && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-300">
                          <HugeiconsIcon icon={Location01Icon} strokeWidth={1.5} className="w-3 h-3" />
                          <span className="truncate max-w-[100px]">{item.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Render the PostFooter inside Fancybox using React Portal */}
      {portalContainer && createPortal(
        <div className="w-full pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          <PostFooter post={portalContainer.post} />
        </div>,
        portalContainer.element
      )}
    </div>
  );
};
