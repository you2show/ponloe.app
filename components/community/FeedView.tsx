import { Add01Icon, Comment01Icon, FavouriteIcon, Film01Icon, Home01Icon, MusicNote01Icon, Notification01Icon, PlayCircleIcon, Search01Icon, Share01Icon, ShoppingBag01Icon, Store01Icon, Tick01Icon, Location01Icon, ThumbsUpIcon, ViewIcon, Cancel01Icon, UserMultiple02Icon, ArrowLeft01Icon, Image01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import imageCompression from 'browser-image-compression';
import { MOCK_USER, Post } from './shared';
import { LeftSidebar, RightSidebar, StoriesRail, CreatePostBox, ReelsStrip, MarketSuggestion, PostCard } from './feed';
import { PostType } from './create-post/CreatePostModal';
import { ImageLayoutType } from './create-post/image/ImageLayoutSelector';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { NotificationBell } from './NotificationPanel';
import { ProfileView } from '../profile/ProfileView';
import { ChatView } from './chat/ChatView';
import { FollowButton } from './feed/FollowButton';
import { WatchView } from '../watch/WatchView';
import { ListenView } from '../listen/ListenView';
import { Player } from '../listen/Player';
import { GalleryView } from './gallery/GalleryView';

const MobileHeader: React.FC<{ setActiveTab: (t: any) => void }> = ({ setActiveTab }) => {
  const { theme } = useTheme();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <div className="h-full px-4 py-3 flex items-center justify-between bg-white dark:bg-slate-900">
      {isSearchExpanded ? (
        <div className="flex items-center w-full gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
           <button onClick={() => setIsSearchExpanded(false)} className="p-2 -ml-2 text-gray-500">
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-6 h-6" />
           </button>
           <div className="flex-1 flex items-center rounded-full px-3 py-2 bg-gray-100 dark:bg-slate-800">
              <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="w-5 h-5 text-gray-400 shrink-0" />
              <input 
                type="text" 
                placeholder="ស្វែងរក..." 
                autoFocus
                className="w-full bg-transparent border-none outline-none text-sm ml-2 placeholder-gray-500 text-gray-900 dark:text-white dark:placeholder-slate-400"
              />
           </div>
        </div>
      ) : (
        <>
          {/* Tablet Search Box (hidden on mobile, visible on md) */}
          <div className="hidden md:flex flex-1 max-w-md mr-4 items-center rounded-full px-3 py-2 bg-gray-100 dark:bg-slate-800">
              <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="w-5 h-5 text-gray-400 shrink-0" />
              <input 
                type="text" 
                placeholder="ស្វែងរក..." 
                className="w-full bg-transparent border-none outline-none text-sm ml-2 placeholder-gray-500 text-gray-900 dark:text-white dark:placeholder-slate-400"
              />
          </div>

          {/* Mobile Search Icon (Left side, replacing logo) */}
          <button 
            onClick={() => setIsSearchExpanded(true)}
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700">
             <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <button className="w-9 h-9 rounded-full flex items-center justify-center transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700">
               <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} className="w-5 h-5" />
            </button>
            <button 
              onClick={() => {
                setActiveTab('chat');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            >
               <HugeiconsIcon icon={Comment01Icon} strokeWidth={1.5} className="w-5 h-5" />
            </button>
            <NotificationBell />
          </div>
        </>
      )}
    </div>
  );
};

import { GlobalProgressBar } from './feed/GlobalProgressBar';

const MobileTabBar: React.FC<{ activeTab: string, setActiveTab: (t: any) => void }> = ({ activeTab, setActiveTab }) => {
  const { theme } = useTheme();
  const { profile } = useAuth();
  
  const tabs = [
    { id: 'feed', icon: Home01Icon, label: 'Feed' },
    { id: 'watch', icon: Film01Icon, label: 'ទស្សនា' },
    { id: 'listen', icon: MusicNote01Icon, label: 'ស្ដាប់' },
    { id: 'ustaz', icon: UserMultiple02Icon, label: 'Ustaz' },
    { id: 'market', icon: Store01Icon, label: 'Market' },
  ];

  return (
    <div className="h-full border-b shadow-sm transition-all duration-300 bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-800">
       <div className="h-full flex items-center justify-start sm:justify-center gap-2 px-3 py-2 overflow-x-auto no-scrollbar snap-x">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`
                  flex items-center justify-center transition-all duration-200 group snap-center
                  px-4 py-2 rounded-full gap-2 h-10 flex-shrink-0
                  ${isActive 
                    ? 'bg-emerald-100 text-emerald-700 shadow-inner dark:bg-emerald-500/20 dark:text-emerald-400'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-500 dark:hover:bg-slate-800'
                  }
                `}
                title={tab.label}
              >
                 <HugeiconsIcon icon={tab.icon} strokeWidth={1.5} className={`w-5 h-5 ${isActive ? 'fill-emerald-700/20 stroke-emerald-700 dark:fill-emerald-400/20 dark:stroke-emerald-400' : 'stroke-current'}`} />
                 <span className={`text-sm font-bold capitalize ${isActive ? 'block' : 'hidden md:block'}`}>{tab.label}</span>
              </button>
            );
          })}
          
          {/* Profile Tab */}
          <button 
            onClick={() => {
              setActiveTab('profile');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`
              flex items-center justify-center transition-all duration-200 group snap-center
              px-4 py-2 rounded-full gap-2 h-10 flex-shrink-0
              ${activeTab === 'profile'
                ? 'bg-emerald-100 text-emerald-700 shadow-inner dark:bg-emerald-500/20 dark:text-emerald-400'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-500 dark:hover:bg-slate-800'
              }
            `}
            title="Profile"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'ព'}
              </div>
            )}
            <span className={`text-sm font-bold capitalize ${activeTab === 'profile' ? 'block' : 'hidden md:block'}`}>Profile</span>
          </button>
       </div>
    </div>
  );
};

const DesktopHeader: React.FC<{ setActiveTab: (t: any) => void }> = ({ setActiveTab }) => {
  const { theme } = useTheme();
  return (
    <div className="hidden lg:flex border-b sticky top-0 z-30 px-4 py-2 shadow-sm justify-center bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-800">
       <div className="max-w-[1600px] w-full flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full px-3 py-2 w-64 transition-all focus-within:w-72 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-gray-100 dark:bg-slate-800">
                <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="w-4 h-4 text-gray-400 shrink-0" />
                <input 
                  type="text" 
                  placeholder="ស្វែងរក..." 
                  className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder-gray-400 text-gray-900 dark:text-white dark:placeholder-slate-500" 
                />
            </div>
         </div>
         <div className="flex gap-2 items-center">
            <button className="p-2 rounded-full transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"><HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} className="w-5 h-5" /></button>
            <button 
              onClick={() => {
                setActiveTab('chat');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-2 rounded-full transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <HugeiconsIcon icon={Comment01Icon} strokeWidth={1.5} className="w-5 h-5" />
            </button>
            <NotificationBell />
         </div>
       </div>
    </div>
  );
};

import { useToast } from '@/contexts/ToastContext';
import { UploadProgress } from './feed/UploadProgress';
import { ArrowUp01Icon } from '@hugeicons/core-free-icons';

export const FeedView: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'feed' | 'watch' | 'listen' | 'market' | 'ustaz' | 'profile' | 'chat'>('feed');
  const { user, profile } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isReadingBook, setIsReadingBook] = useState(false);

  const { data: posts = [], isLoading: loading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            role,
            is_verified
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map((post: any) => ({
          id: post.id,
          user: {
            id: post.profiles?.id,
            name: post.profiles?.full_name || 'អ្នកប្រើប្រាស់',
            avatar: post.profiles?.avatar_url || 'https://ui-avatars.com/api/?name=User&background=random',
            role: post.profiles?.role,
            isVerified: post.profiles?.is_verified
          },
          content: post.content || '',
          timestamp: new Date(post.created_at).toLocaleDateString(),
          likes: 0,
          commentsCount: 0,
          shares: 0,
          isLiked: false,
          type: post.extra_data?.originalType || (post.extra_data?.eventData ? 'event' : post.type),
          images: post.media_urls || [],
          ...post.extra_data
        }));
      }
      return [];
    },
    enabled: !!supabase,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
  
  const { data: marketItems = [], isLoading: loadingMarket } = useQuery({
    queryKey: ['marketItems'],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('market_items')
        .select(`
          id,
          title,
          price,
          location,
          media_urls,
          profiles:user_id (
            full_name,
            avatar_url,
            is_verified
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data?.map((item: any) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        location: item.location || 'Cambodia',
        image: item.media_urls?.[0] || '',
        seller: item.profiles?.full_name || 'Unknown'
      })) || [];
    },
    enabled: activeTab === 'market' && !!supabase,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const { data: ustazList = [], isLoading: loadingUstaz } = useQuery({
    queryKey: ['ustazList'],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role, is_verified')
        .in('role', ['admin', 'scholar']);

      if (error) throw error;
      return data || [];
    },
    enabled: activeTab === 'ustaz' && !!supabase,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Upload Progress State
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadType, setUploadType] = useState<string>('');

  const [showHeader, setShowHeader] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    const hideThreshold = 80; // Start hiding after 80px
    const deltaThreshold = 5; // Minimum scroll to trigger change

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = Math.max(0, window.scrollY);
          const delta = currentScrollY - lastScrollY;
          
          // 1. Always show at the very top
          if (currentScrollY < 40) {
            setShowHeader(true);
          } 
          // 2. Toggle based on scroll direction and threshold
          else if (Math.abs(delta) > deltaThreshold) {
            if (delta > 0 && currentScrollY > hideThreshold) {
              // Scrolling down - hide header
              setShowHeader(false);
            } else if (delta < 0) {
              // Scrolling up - show header
              setShowHeader(true);
            }
          }
          
          // Back to top logic
          setShowBackToTop(currentScrollY > 1000);
          
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setActiveTab(customEvent.detail);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('navigate-tab', handleNavigate);
    return () => window.removeEventListener('navigate-tab', handleNavigate);
  }, []);



  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    try {
      if (supabase) {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
      }
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error) {
      console.error('Error deleting post:', error);
      showToast('មានបញ្ហាក្នុងការលុប post', 'error');
    }
  };

  const handleNewPost = async (content: string, type: PostType, images?: any[], layout?: ImageLayoutType, extraData?: any) => {
    if (!user) {
      showToast('សូមចូលគណនីដើម្បីបង្ហោះ', 'error');
      return;
    }

    // Map frontend types to DB enum types. 
    // The DB likely only supports basic types ('text', 'image', 'video'). 
    // We store the specific frontend type (like 'audio', 'market', 'poll') in extra_data.originalType.
    const dbSupportedTypes = ['text', 'image', 'video']; 
    const dbType = dbSupportedTypes.includes(type) ? type : 'text';
    
    let mediaUrls: string[] = [];
    
    // Clone extraData to avoid mutating the original object
    let safeExtraData = extraData ? JSON.parse(JSON.stringify(extraData)) : {};

    // Handle Event Cover Image Upload if present
    if (safeExtraData?.eventData?.coverImage && safeExtraData.eventData.coverImage.startsWith('data:image')) {
        try {
            const base64Data = safeExtraData.eventData.coverImage;
            const fetchRes = await fetch(base64Data);
            const blob = await fetchRes.blob();
            let file = new File([blob], "event_cover.jpg", { type: "image/jpeg" });

            try {
              const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true
              };
              file = await imageCompression(file, options);
            } catch (error) {
              console.error('Error compressing event cover:', error);
            }

            const formData = new FormData();
            formData.append('image', file);
            
            const uploadRes = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData,
            });

            if (uploadRes.ok) {
                const uploadData = await uploadRes.json();
                if (uploadData.success) {
                    const publicUrl = uploadData.type === 'r2' ? uploadData.url : `/api/image/${uploadData.fileId}`;
                    // Update the extraData with the new URL
                    safeExtraData.eventData.coverImage = publicUrl;
                } else {
                    console.error("Upload failed:", uploadData.error);
                    safeExtraData.eventData.coverImage = null; // Clear to prevent DB error
                }
            } else {
                console.error("Upload failed with status:", uploadRes.status);
                safeExtraData.eventData.coverImage = null; // Clear to prevent DB error
            }
        } catch (e) {
            console.error("Failed to upload event cover image", e);
            safeExtraData.eventData.coverImage = null; // Clear to prevent DB error
        }
    }

    // Handle Book Cover Upload if present
    if (extraData?.bookData?.cover && extraData.bookData.cover instanceof File) {
        try {
            let coverFile = extraData.bookData.cover;
            setUploading(true);
            setUploadType('រូបភាពសៀវភៅ');
            
            try {
              const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1024,
                useWebWorker: true
              };
              coverFile = await imageCompression(coverFile, options);
            } catch (error) {
              console.error('Error compressing book cover:', error);
            }
            
            const formData = new FormData();
            formData.append('image', coverFile);
            formData.append('topicType', 'book');
            
            const uploadRes = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData,
            });

            if (uploadRes.ok) {
                const uploadData = await uploadRes.json();
                if (uploadData.success) {
                    const publicUrl = uploadData.type === 'r2' ? uploadData.url : `/api/image/${uploadData.fileId}`;
                    safeExtraData.bookData.coverPreview = publicUrl;
                    safeExtraData.bookData.cover = null; // Clear to prevent DB error
                } else {
                    console.error("Book Cover Upload failed:", uploadData.error);
                    safeExtraData.bookData.cover = null;
                }
            } else {
                console.error("Book Cover Upload failed with status:", uploadRes.status);
                safeExtraData.bookData.cover = null;
            }
        } catch (e) {
            console.error("Failed to upload book cover", e);
            safeExtraData.bookData.cover = null;
        } finally {
             setUploading(false);
        }
    }

    // Handle Book PDF Upload if present
    if (extraData?.bookData?.pdfFile && extraData.bookData.pdfFile instanceof File) {
        try {
            const pdfFile = extraData.bookData.pdfFile;
            setUploading(true);
            setUploadType('ឯកសារ PDF');
            
            const formData = new FormData();
            formData.append('document', pdfFile);
            
            const uploadRes = await fetch('/api/upload-document', {
                method: 'POST',
                body: formData,
            });

            if (uploadRes.ok) {
                const uploadData = await uploadRes.json();
                if (uploadData.success) {
                    const publicUrl = `/api/document/${uploadData.fileId}`;
                    // Update extraData with the new URL
                    safeExtraData.bookData.pdfFile = publicUrl;
                    // Also set pdfLink if not present
                    if (!safeExtraData.bookData.pdfLink) {
                         safeExtraData.bookData.pdfLink = publicUrl;
                    }
                } else {
                    console.error("PDF Upload failed:", uploadData.error);
                    safeExtraData.bookData.pdfFile = null; 
                }
            } else {
                console.error("PDF Upload failed with status:", uploadRes.status);
                safeExtraData.bookData.pdfFile = null;
            }
        } catch (e) {
            console.error("Failed to upload PDF", e);
            safeExtraData.bookData.pdfFile = null;
        } finally {
             setUploading(false);
        }
    }

    try {
      if (images && images.length > 0) {
        setUploading(true);
        setUploadProgress(0);
        
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          if (typeof img === 'string') {
            mediaUrls.push(img);
          } else if (img.file) {
            const isVideo = img.file.type.startsWith('video/');
            setUploadType(isVideo ? 'វីដេអូ' : 'រូបភាព');
            
            let fileToUpload = img.file;
            if (!isVideo && img.file.type.startsWith('image/')) {
              try {
                const options = {
                  maxSizeMB: 1,
                  maxWidthOrHeight: 1920,
                  useWebWorker: true
                };
                fileToUpload = await imageCompression(img.file, options);
              } catch (error) {
                console.error('Error compressing image:', error);
              }
            }
            
            const formData = new FormData();
            formData.append(isVideo ? 'video' : 'image', fileToUpload);
            
            // Add type for video to distinguish reels vs normal videos if needed
            if (isVideo) {
                formData.append('type', type === 'video' ? 'video' : 'reel');
            } else if (type === 'market' || type === 'book') {
                formData.append('topicType', type);
            }

            // Simulate progress for better UX since fetch doesn't support upload progress natively
            const progressInterval = setInterval(() => {
              setUploadProgress(prev => {
                if (prev >= 90) return prev;
                return prev + 10;
              });
            }, 500);

            const uploadRes = await fetch(isVideo ? '/api/upload-video' : '/api/upload-image', {
              method: 'POST',
              body: formData,
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            const contentType = uploadRes.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              const text = await uploadRes.text();
              console.error("Non-JSON response:", text.substring(0, 200));
              if (uploadRes.status === 413) {
                throw new Error('ឯកសារធំពេក សូមជ្រើសរើសទំហំតូចជាងនេះ។');
              }
              if (text.includes('Rate exceeded.')) {
                throw new Error('ប្រព័ន្ធកំពុងរវល់ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។');
              }
              throw new Error(`Server returned an invalid response (${uploadRes.status}). Please try again.`);
            }

            if (!uploadRes.ok) {
              const text = await uploadRes.text();
              let errorMessage = 'Upload failed';
              try {
                const uploadData = JSON.parse(text);
                errorMessage = uploadData.error || errorMessage;
              } catch (e) {
                console.error("Failed to parse error response:", text);
              }
              throw new Error(errorMessage);
            }

            const uploadData = await uploadRes.json();

            if (!uploadData.success) throw new Error(uploadData.error || 'Upload failed');

            const publicUrl = uploadData.type === 'r2' ? uploadData.url : `/api/${isVideo ? 'video' : 'image'}/${uploadData.fileId}`;
            mediaUrls.push(publicUrl);
          } else if (img.url) {
            mediaUrls.push(img.url);
          }
          
          // Overall progress across multiple files
          setUploadProgress(Math.round(((i + 1) / images.length) * 100));
        }
      }

      const newPostData = {
        user_id: user.id,
        type: dbType,
        content,
        media_urls: mediaUrls,
        extra_data: {
          originalType: type,
          imageLayout: layout,
          ...safeExtraData
        }
      };

      const { data, error } = await supabase
        .from('posts')
        .insert(newPostData)
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            role,
            is_verified
          )
        `)
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error: any) {
      console.error('Error creating post:', error);
      showToast(error.message || 'មានបញ្ហាក្នុងការបង្ហោះ សូមព្យាយាមម្ដងទៀត', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen font-khmer transition-colors duration-300 bg-[#f0f2f5] text-gray-900 dark:bg-slate-950 dark:text-white">
      
      <GlobalProgressBar progress={uploadProgress} visible={uploading} />

      {!isReadingBook && (
        <div 
          className="lg:hidden sticky z-50 transition-[top] duration-300 ease-in-out bg-white dark:bg-slate-950"
          style={{ 
            top: (showHeader || activeTab === 'chat' || activeTab === 'listen') ? 0 : -60 
          }}
        >
          {activeTab !== 'chat' && activeTab !== 'listen' && (
            <div className="h-[60px]">
              <MobileHeader setActiveTab={setActiveTab} />
            </div>
          )}
          <div className="shadow-sm h-[56px]">
            <MobileTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>
      )}

      {!isReadingBook && <DesktopHeader setActiveTab={setActiveTab} />}

      {/* Back to Top Button */}
      {showBackToTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 right-6 z-50 p-3 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-all animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} className="w-6 h-6" />
        </button>
      )}

      <div className={`max-w-[1600px] mx-auto flex justify-center gap-6 ${activeTab === 'chat' ? 'pt-0 md:pt-4' : ''}`}> 
        <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className={`w-full px-0 md:px-2 pt-4 ${activeTab === 'chat' ? 'pb-0' : 'pb-24 md:pb-8'} ${activeTab === 'profile' || activeTab === 'chat' || activeTab === 'watch' || isReadingBook ? 'max-w-4xl' : 'max-w-[600px]'}`}>
           

           {activeTab === 'feed' && (
             <div className="animate-in fade-in duration-300">
                <StoriesRail />
                <CreatePostBox onPost={handleNewPost} />
                
                {/* Removed inline UploadProgress, using GlobalProgressBar instead */}
                
                {loading && (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="rounded-xl border p-4 animate-pulse bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div className="space-y-2 flex-1">
                            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                        <div className="h-48 bg-gray-200 rounded-lg mt-4"></div>
                      </div>
                    ))}
                  </div>
                )}

                {!loading && (
                  <div className="space-y-4">
                     {posts[0] && <PostCard key={posts[0].id} post={posts[0]} onDelete={handleDeletePost} onReadingStateChange={setIsReadingBook} />}
                     {posts.length > 0 && <ReelsStrip />}
                     {posts[1] && <PostCard key={posts[1].id} post={posts[1]} onDelete={handleDeletePost} onReadingStateChange={setIsReadingBook} />}
                     {posts.length > 1 && <MarketSuggestion />}
                     {posts.slice(2).map(post => <PostCard key={post.id} post={post} onDelete={handleDeletePost} onReadingStateChange={setIsReadingBook} />)}
                  </div>
                )}
                
                <div className="text-center py-8 text-gray-500 text-sm">
                   <HugeiconsIcon icon={Tick01Icon} strokeWidth={1.5} className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                   <p>អ្នកបានអានដល់ទីបញ្ចប់ហើយ</p>
                </div>
             </div>
           )}

           {activeTab === 'watch' && (
             <div className="space-y-4 animate-in fade-in duration-300">
                <ReelsStrip />
                <WatchView isEmbedded={true} />
             </div>
           )}



           {activeTab === 'listen' && (
             <div className="animate-in fade-in duration-300">
                <ListenView />
             </div>
           )}

           {activeTab === 'ustaz' && (
             <div className="animate-in fade-in duration-300 px-2 md:px-0">
                <div className="flex items-center justify-between mb-4 p-4 rounded-xl border shadow-sm bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-800">
                   <h2 className="font-bold text-lg font-khmer flex items-center gap-2">
                     <HugeiconsIcon icon={UserMultiple02Icon} strokeWidth={1.5} className="w-6 h-6 text-emerald-600" />
                     បញ្ជីឈ្មោះ Ustaz
                   </h2>
                </div>

                {loadingUstaz ? (
                  <div className="text-center py-8 text-gray-500">កំពុងផ្ទុក...</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ustazList.map((ustaz) => (
                      <div key={ustaz.id} className="flex items-center gap-4 p-4 rounded-xl border shadow-sm transition-all bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-800">
                        <img 
                          src={ustaz.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(ustaz.full_name || 'User')}&background=random`} 
                          alt={ustaz.full_name} 
                          className="w-16 h-16 rounded-full object-cover border-2 border-emerald-100"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base truncate flex items-center gap-1">
                            {ustaz.full_name}
                            {ustaz.is_verified && <HugeiconsIcon icon={Tick01Icon} strokeWidth={2} className="w-4 h-4 text-blue-500" />}
                          </h3>
                          <p className="text-sm text-emerald-600 font-medium capitalize mb-2">{ustaz.role}</p>
                          <FollowButton targetUserId={ustaz.id} />
                        </div>
                      </div>
                    ))}
                    {ustazList.length === 0 && !loadingUstaz && (
                      <div className="col-span-full text-center py-8 text-gray-500">មិនទាន់មានទិន្នន័យនៅឡើយទេ</div>
                    )}
                  </div>
                )}
             </div>
           )}

           {activeTab === 'market' && (
             <div className="animate-in fade-in duration-300 px-2 md:px-0">
                <div className="flex items-center justify-between mb-4 p-4 rounded-xl border shadow-sm bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-800">
                   <h2 className="font-bold text-lg font-khmer flex items-center gap-2">
                     <HugeiconsIcon icon={Store01Icon} strokeWidth={1.5} className="w-6 h-6 text-emerald-600" />
                     ផ្សារហាឡាល់
                   </h2>
                   <div className="flex gap-2">
                      <button className="p-2 rounded-lg text-sm font-bold transition-colors font-khmer bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700">ប្រភេទ</button>
                      <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors font-khmer">លក់ទំនិញ</button>
                   </div>
                </div>

                <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                  {['ទាំងអស់', 'សៀវភៅ', 'សម្លៀកបំពាក់', 'អាហារ', 'គ្រឿងសម្អាង', 'ផ្សេងៗ'].map((cat, i) => (
                    <button 
                      key={i}
                      className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-colors font-khmer ${
                        i === 0 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                   {loadingMarket ? (
                     <div className="col-span-2 text-center py-8 text-gray-500">កំពុងផ្ទុក...</div>
                   ) : marketItems.length > 0 ? (
                     marketItems.map((item, idx) => (
                      <div key={idx} className="rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-all cursor-pointer group bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-800">
                         <div className="aspect-square relative overflow-hidden bg-gray-100">
                            <img src={item.image || undefined} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold shadow-sm text-emerald-700">{item.price}</div>
                            <div className="absolute top-2 left-2">
                              <button className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                                <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} className="w-4 h-4 text-gray-500" />
                              </button>
                            </div>
                         </div>
                         <div className="p-3">
                            <h4 className="font-bold text-sm line-clamp-1 mb-1 font-khmer text-gray-900 dark:text-white">{item.title}</h4>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                              <HugeiconsIcon icon={Location01Icon} strokeWidth={1.5} className="w-3 h-3" />
                              <span>{item.location}</span>
                            </div>
                            <button className="w-full py-2 text-xs font-bold rounded-lg transition-colors font-khmer bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">ទាក់ទងអ្នកលក់</button>
                         </div>
                      </div>
                     ))
                   ) : (
                     <div className="col-span-2 text-center py-8 text-gray-500">មិនទាន់មានទំនិញនៅឡើយទេ</div>
                   )}
                </div>
             </div>
           )}

           {activeTab === 'profile' && (
             <div className="animate-in fade-in duration-300 rounded-none md:rounded-2xl overflow-hidden border shadow-sm">
                <ProfileView />
             </div>
           )}

           {activeTab === 'chat' && (
             <div className="animate-in fade-in duration-300">
                <ChatView onBack={() => setActiveTab('feed')} />
             </div>
           )}

        </div>

        {activeTab !== 'profile' && activeTab !== 'chat' && activeTab !== 'watch' && !isReadingBook && <RightSidebar />}

      </div>
    </div>
  );
};
