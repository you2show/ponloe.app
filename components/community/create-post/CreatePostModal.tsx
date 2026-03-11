import { Alert02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Globe02Icon, ArrowDown01Icon, Image01Icon, UserIcon, HappyIcon, Location01Icon, MoreHorizontalIcon, ArrowLeft01Icon, Video01Icon, Tag01Icon, Mic01Icon, CropIcon, Delete02Icon, InformationCircleIcon } from '@hugeicons/core-free-icons';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

import { MOCK_USER } from '../shared';
import { 
    MarketInput, PollInput, QuranInput, DuaInput, BookInput,
    TagInput, FeelingInput, LocationInput, BackgroundSelector, CameraView, EventInput
} from './special-inputs';
import { VoiceInput } from './voice/VoiceInput';
import { ImageGrid } from './image/ImageGrid';
import { ImageLayoutSelector, ImageLayoutType } from './image/ImageLayoutSelector';
import { ActionMenu } from './ActionMenu';
import { ImageEditor } from './image/ImageEditor';
import { RichTextEditor } from './RichTextEditor';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';

export type PostType = 'text' | 'market' | 'poll' | 'dua' | 'quran' | 'image' | 'video' | 'audio' | 'book' | 'tag' | 'feeling' | 'checkin' | 'live' | 'bg' | 'camera' | 'event' | 'article';

interface MediaItem {
  url: string;
  caption: string;
  file?: File; // Add file property
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (content: string, type: PostType, images?: any[], layout?: ImageLayoutType, extraData?: any) => void;
  initialType?: PostType; 
}

const AUTO_ARTICLE_THRESHOLD = 3000; // Increased to 3000 characters

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onPost, initialType = 'text' }) => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const { theme } = useTheme();
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [postType, setPostType] = useState<PostType>('text');
  
  // Determine allowed post types based on role
  const isGeneralUser = profile?.role === 'general';
  const isAdmin = profile?.role === 'admin';
  
  // Extra State for special features
  const [postBackground, setPostBackground] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [feeling, setFeeling] = useState<any>(null);
  const [tagged, setTagged] = useState<string[]>([]);
  const [quranData, setQuranData] = useState<any>(null); // State to hold Quran Data from input
  const [audioData, setAudioData] = useState<any>(null); // State to hold Audio Data from input
  const [duaData, setDuaData] = useState<any>(null); // State to hold Dua Data from input
  const [eventData, setEventData] = useState<any>(null); // State to hold Event Data from input
  const [pollData, setPollData] = useState<any>(null); // State to hold Poll Data from input
  const [bookData, setBookData] = useState<any>(null); // State to hold Book Data from input
  
  // Image Upload State (Updated to store objects)
  const [selectedImages, setSelectedImages] = useState<MediaItem[]>([]);
  const [imageLayout, setImageLayout] = useState<ImageLayoutType>('grid');
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [isEditingImage, setIsEditingImage] = useState(false);
  
  // Dirty State Tracking
  const [showDiscardAlert, setShowDiscardAlert] = useState(false);
  const [showAdminOnlyAlert, setShowAdminOnlyAlert] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync internal state with props when modal opens
  useEffect(() => {
    if (isOpen) {
      resetState(); 
      
      if (initialType === 'image') {
         setPostType('text'); 
         setTimeout(() => fileInputRef.current?.click(), 300);
      } else {
         setPostType(initialType);
      }
      
      if (initialType === 'text') {
        setTimeout(() => {
            if (window.innerWidth > 768) textareaRef.current?.focus();
        }, 300);
      }
    }
  }, [isOpen, initialType]);

  // Handle Text Change with Auto-Switch Logic
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      setContent(newText);

      // Check if text is too long, switch to Article mode automatically
      if (newText.length > AUTO_ARTICLE_THRESHOLD && postType === 'text') {
          // Convert newlines to HTML line breaks to preserve formatting in Rich Editor
          const htmlContent = newText.replace(/\n/g, '<br>');
          setContent(htmlContent);
          setPostType('article');
      }
  };

  const isPostButtonDisabled = () => {
      if (postType === 'text') {
          return !content.trim() && selectedImages.length === 0 && !feeling && !location;
      }
      if (postType === 'audio') return !audioData;
      if (postType === 'quran') return !quranData;
      if (postType === 'dua') return !duaData;
      if (postType === 'poll') return false; // Poll has its own validation inside component usually, or we assume it's valid if open
      if (postType === 'event') return !eventData || !eventData.name;
      return false;
  };

  // Helper to sanitize object for JSON
  const sanitizeForJson = (obj: any, seen = new WeakSet()): any => {
      if (obj === null || typeof obj !== 'object') {
          return obj;
      }
      
      if (seen.has(obj)) return null;
      seen.add(obj);

      // Check for DOM nodes and React internals
      const toString = Object.prototype.toString.call(obj);
      if (
          obj instanceof Element || 
          obj instanceof Node || 
          toString.includes('HTML') || 
          toString.includes('Element') || 
          toString.includes('Fiber')
      ) {
          return null;
      }

      if (Array.isArray(obj)) {
          return obj.map(item => sanitizeForJson(item, seen)).filter(item => item !== null);
      }

      const result: any = {};
      for (const key in obj) {
          // Skip React internals and known dangerous keys
          if (
              key.startsWith('__react') || 
              key.startsWith('_react') ||
              key === 'stateNode' ||
              key === 'file' || 
              key === 'audio' || 
              key === 'source' || 
              key === 'audioInstance' ||
              key === 'tempAudio' ||
              key === 'ref'
          ) {
              continue;
          }

          if (Object.prototype.hasOwnProperty.call(obj, key)) {
              const value = obj[key];
              const sanitizedValue = sanitizeForJson(value, seen);
              if (sanitizedValue !== null) {
                  result[key] = sanitizedValue;
              }
          }
      }
      return result;
  };

  const handlePost = () => {
    let isValid = false;
    let finalType = postType;
    let finalContent = content;

    if (postType === 'text') {
        // Allow if text, images, feeling or location is present
        isValid = content.trim().length > 0 || selectedImages.length > 0 || !!feeling || !!location;
        
        // Auto-detect if it's a video post
        if (selectedImages.length > 0) {
            const hasVideo = selectedImages.some(img => 
                img.file?.type.startsWith('video/') || 
                img.url.match(/\.(mp4|webm|ogg|mov)$/i)
            );
            finalType = hasVideo ? 'video' : 'image';
        }
    } else if (postType === 'quran') {
        isValid = !!quranData;
    } else if (postType === 'dua') {
        isValid = !!duaData;
    } else if (postType === 'poll') {
        isValid = !!pollData && pollData.options.length >= 2;
    } else if (postType === 'audio') {
        isValid = !!audioData;
        if (!finalContent.trim()) finalContent = "បានចែករំលែកសំឡេង";
    } else if (postType === 'book') {
        isValid = !!bookData && !!bookData.title;
    } else if (postType === 'event') {
        isValid = !!eventData && !!eventData.name;
    } else {
        // For other types like Market, Poll, etc., assume valid if they are active (they handle their own internal validation or are always valid to submit as is)
        isValid = true;
    }

    if (isValid) {
      // Sanitize audioData again just to be safe
      let sanitizedAudioData = audioData;
      if (audioData && audioData.tracks) {
          sanitizedAudioData = {
              ...audioData,
              tracks: audioData.tracks.map((t: any) => ({
                  id: t.id,
                  fileId: t.fileId,
                  url: t.url,
                  duration: t.duration,
                  title: t.title,
                  cover: t.cover,
                  waveform: t.waveform
              }))
          };
      }

      const extraData = {
          background: postBackground,
          location,
          feeling,
          taggedUsers: tagged,
          quranData: quranData, // Add Quran Data to payload
          duaData: duaData, // Add Dua Data to payload
          ...(pollData ? { pollOptions: pollData.options, totalVotes: pollData.totalVotes } : {}), // Spread Poll Data
          audioData: sanitizedAudioData, // Add Audio Data to payload
          eventData: eventData, // Add Event Data to payload
          bookData: bookData // Add Book Data to payload
      };
      
      // Simple JSON sanitization using parse/stringify
      // This removes undefined, functions, and symbols, which is what we want for DB storage
      let safeExtraData: any = {};
      try {
        safeExtraData = JSON.parse(JSON.stringify(extraData));
        
        // Restore File objects that might be lost during JSON sanitization
        if (bookData?.pdfFile) {
            if (!safeExtraData.bookData) safeExtraData.bookData = {};
            safeExtraData.bookData.pdfFile = bookData.pdfFile;
        }
        if (bookData?.cover) {
            if (!safeExtraData.bookData) safeExtraData.bookData = {};
            safeExtraData.bookData.cover = bookData.cover;
        }
      } catch (e) {
        console.error("Failed to sanitize extraData", e);
        // Fallback to empty object or try to save partial data?
        // For now, let's assume it works as these are simple states
      }

      // Sanitize selectedImages as well, just in case
      const safeSelectedImages = selectedImages.map(img => ({
          url: img.url,
          caption: img.caption,
          file: img.file // Keep file as is, but ensure no other props
      }));

      // Pass images (objects) and layout if present
      onPost(
          finalContent, 
          finalType, 
          selectedImages.length > 0 ? safeSelectedImages : undefined, 
          selectedImages.length > 0 ? imageLayout : undefined,
          safeExtraData
      );
      resetState();
      onClose();
    }
  };

  const resetState = () => {
      setContent('');
      setPostType('text');
      setPostBackground('');
      setLocation('');
      setFeeling(null);
      setTagged([]);
      setQuranData(null);
      setDuaData(null);
      setPollData(null);
      setAudioData(null);
      setEventData(null);
      setBookData(null);
      setSelectedImages([]);
      setImageLayout('grid');
      setPreviewIndex(null);
      setIsEditingImage(false);
      setIsFocused(false);
      setShowDrawer(false);
      setShowDiscardAlert(false);
  }

  const hasUnsavedChanges = () => {
      return (
          content.trim().length > 0 || 
          selectedImages.length > 0 || 
          !!feeling || 
          !!location || 
          tagged.length > 0 || 
          postBackground !== '' ||
          !!quranData ||
          !!duaData ||
          !!audioData ||
          !!eventData ||
          !!bookData
      );
  };

  const handleCloseAttempt = () => {
      if (hasUnsavedChanges()) {
          setShowDiscardAlert(true);
      } else {
          onClose();
      }
  };

  const confirmDiscard = () => {
      resetState();
      onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      // Convert to MediaItems with empty caption
      const newImages = Array.from(event.target.files).map((file: File) => ({
          url: URL.createObjectURL(file),
          caption: '',
          file: file
      }));
      setSelectedImages(prev => [...prev, ...newImages]);
      setPostType('text'); 
      setShowDrawer(false);
    }
  };

  const handleActionSelect = (id: string) => {
      if (id === 'audio' && !isAdmin) {
          setShowAdminOnlyAlert(true);
          return;
      }

      if (id === 'checkin' || id === 'event') {
          showToast('មុខងារនេះកំពុងអភិវឌ្ឈន៍ និងមកដល់ឆាប់ៗ', 'info');
          setShowDrawer(false);
          return;
      }

      if (id === 'image') {
          fileInputRef.current?.click();
          return;
      }

      // Handle all post types including 'article'
      if (['market', 'poll', 'dua', 'quran', 'audio', 'book', 'camera', 'event', 'article'].includes(id)) {
          setPostType(id as PostType);
      } else if (id === 'bg') {
          setPostType('bg'); 
      } else if (id === 'live') {
          setPostType('live');
      } else {
          setPostType(id as PostType);
      }
      setShowDrawer(false);
  };

  const handleSaveEditedImage = (newSrc: string) => {
      if (previewIndex !== null) {
          const updated = [...selectedImages];
          
          // Convert base64 to File
          const arr = newSrc.split(',');
          const mimeMatch = arr[0].match(/:(.*?);/);
          const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while(n--){
              u8arr[n] = bstr.charCodeAt(n);
          }
          const file = new File([u8arr], `edited_${Date.now()}.jpg`, { type: mime });

          updated[previewIndex] = { ...updated[previewIndex], url: newSrc, file: file };
          setSelectedImages(updated);
          setIsEditingImage(false);
      }
  };

  const handleDeleteFromPreview = () => {
      if (previewIndex !== null) {
          const updated = selectedImages.filter((_, i) => i !== previewIndex);
          setSelectedImages(updated);
          setPreviewIndex(null);
          setIsEditingImage(false);
      }
  };

  const handleCaptionChange = (index: number, text: string) => {
      const updated = [...selectedImages];
      updated[index] = { ...updated[index], caption: text };
      setSelectedImages(updated);
  };

  const getTitle = () => {
      switch(postType) {
          case 'market': return 'លក់ទំនិញ';
          case 'poll': return 'បង្កើតការស្ទង់មតិ';
          case 'dua': return 'សុំឌូអា';
          case 'quran': return 'ចែករំលែកគម្ពីរ';
          case 'audio': return 'សំឡេង (Voice)';
          case 'book': return 'ណែនាំសៀវភៅ';
          case 'camera': return 'កាមេរ៉ា';
          case 'event': return 'បង្កើតព្រឹត្តិការណ៍';
          case 'live': return 'ផ្សាយផ្ទាល់';
          case 'article': return 'សរសេរអត្ថបទ';
          default: return 'បង្កើតការបង្ហោះ';
      }
  };

  // Render the specific form based on postType
  const renderContentArea = () => {
      switch(postType) {
          case 'market': return <MarketInput onCancel={() => setPostType('text')} />;
          case 'poll': return <PollInput onCancel={() => setPostType('text')} onSave={setPollData} caption={content} onCaptionChange={setContent} />;
          case 'quran': return <QuranInput onCancel={() => setPostType('text')} onSave={setQuranData} />;
          case 'dua': return <DuaInput onCancel={() => setPostType('text')} onSave={setDuaData} />;
          case 'audio': return <VoiceInput onCancel={() => setPostType('text')} onSave={setAudioData} />;
          case 'book': return <BookInput onCancel={() => setPostType('text')} onSave={setBookData} />;
          case 'camera': return <CameraView onCancel={() => setPostType('text')} />;
          case 'event': return <EventInput onCancel={() => setPostType('text')} onSave={setEventData} initialData={eventData} />;
          case 'tag': return <TagInput tagged={tagged} onSave={(t) => { setTagged(t); setPostType('text'); }} onCancel={() => setPostType('text')} />;
          case 'feeling': return <FeelingInput onSave={(f) => { setFeeling(f); setPostType('text'); }} onCancel={() => setPostType('text')} />;
          case 'checkin': return <LocationInput onSave={(l) => { setLocation(l); setPostType('text'); }} onCancel={() => setPostType('text')} />;
          case 'live': 
                return (
                    <div className="bg-red-50 p-8 rounded-xl text-center border border-red-100 flex flex-col items-center">
                        <HugeiconsIcon icon={Video01Icon} strokeWidth={1.5} className="w-12 h-12 text-red-500 mb-2 animate-pulse" />
                        <h3 className="font-bold text-red-700">ត្រៀមផ្សាយផ្ទាល់...</h3>
                        <button onClick={() => setPostType('text')} className="mt-4 text-sm underline text-red-500">បោះបង់</button>
                    </div>
                );
          default: return (
            <div className="flex flex-col w-full pb-4">
                <textarea 
                    ref={textareaRef}
                    value={content}
                    onFocus={() => {
                        setIsFocused(true);
                        setShowDrawer(false);
                    }}
                    onChange={handleTextChange}
                    placeholder={`តើអ្នកកំពុងគិតអ្វី ${profile?.full_name ? profile.full_name.split(' ')[0] : MOCK_USER.name.split(' ')[0]}?`}
                    style={postBackground && (postBackground.startsWith('http') || postBackground.startsWith('linear-gradient')) ? { 
                        backgroundImage: postBackground.startsWith('http') ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${postBackground})` : postBackground, 
                        backgroundSize: 'cover', 
                        backgroundPosition: 'center' 
                    } : {}}
                    className={`w-full py-4 text-lg md:text-2xl placeholder-gray-400 outline-none resize-none font-khmer leading-relaxed transition-all rounded-xl p-4
                        ${postBackground ? `min-h-[200px] text-center font-bold text-white ${(!postBackground.startsWith('http') && !postBackground.startsWith('linear-gradient')) ? postBackground : ''}` : `min-h-[120px] bg-transparent ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                    `}
                />
                
                {/* --- Layout Selector (Only show if images > 1) --- */}
                {selectedImages.length > 1 && !postBackground && (
                    <div className="px-4 mb-3 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Layout</span>
                            <ImageLayoutSelector 
                                currentLayout={imageLayout} 
                                onChange={setImageLayout} 
                            />
                        </div>
                    </div>
                )}

                {/* --- IMAGE GRID COMPONENT --- */}
                {selectedImages.length > 0 && !postBackground && (
                    <ImageGrid 
                        images={selectedImages.map(i => i.url)} // Pass only URLs for preview
                        layout={imageLayout}
                        onRemove={(index) => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                        onReorder={(newImageUrls) => {
                            // Reorder the objects based on URL sequence (simple approach)
                            const newOrder: MediaItem[] = [];
                            newImageUrls.forEach(url => {
                                const item = selectedImages.find(si => si.url === url);
                                if (item) newOrder.push(item);
                            });
                            setSelectedImages(newOrder);
                        }}
                        onPreview={(idx) => setPreviewIndex(idx)}
                        onAddMore={() => fileInputRef.current?.click()}
                    />
                )}
                
                {/* Meta Info Tags */}
                {(location || feeling || tagged.length > 0) && (
                    <div className="flex flex-wrap gap-2 mt-4 px-2">
                        {feeling && (
                            <span className="inline-flex items-center gap-1 text-sm bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg border border-yellow-200">
                                <span className="text-lg">{feeling.icon}</span> កំពុងមានអារម្មណ៍ {feeling.label}
                                <button onClick={() => setFeeling(null)}><HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-3 h-3 ml-1 hover:bg-yellow-200 rounded-full"/></button>
                            </span>
                        )}
                        {location && (
                            <span className="inline-flex items-center gap-1 text-sm bg-red-50 text-red-700 px-2 py-1 rounded-lg border border-red-200">
                                <HugeiconsIcon icon={Location01Icon} strokeWidth={1.5} className="w-3 h-3" /> នៅ {location}
                                <button onClick={() => setLocation('')}><HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-3 h-3 ml-1 hover:bg-red-200 rounded-full"/></button>
                            </span>
                        )}
                        {tagged.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-lg border border-blue-200">
                                <HugeiconsIcon icon={UserIcon} strokeWidth={1.5} className="w-3 h-3" /> ជាមួយ {tagged.join(', ')}
                                <button onClick={() => setTagged([])}><HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-3 h-3 ml-1 hover:bg-blue-200 rounded-full"/></button>
                            </span>
                        )}
                    </div>
                )}
            </div>
          );
      }
  };

  if (!isOpen) return null;

  // Render RichTextEditor full screen if active
  if (postType === 'article') {
      return createPortal(
          <div className={`fixed inset-0 z-[100] flex flex-col animate-in fade-in duration-200 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
              <div className={`px-4 py-2 flex items-center justify-center gap-2 text-xs font-bold border-b ${theme === 'dark' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                  <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={1.5} className="w-4 h-4" />
                  <span>ប្តូរមកទម្រង់អត្ថបទ ដោយសារសំណេរវែង</span>
              </div>
              <RichTextEditor 
                  initialContent={content}
                  onCancel={() => {
                      // Optional: Strip HTML tags if going back to text, or warn user
                      setPostType('text');
                  }}
                  onSave={(html) => {
                      // Save HTML content as 'article' post
                      onPost(html, 'article', undefined, undefined, {
                          background: postBackground,
                          location,
                          feeling,
                          taggedUsers: tagged
                      });
                      resetState();
                      onClose();
                  }}
              />
          </div>,
          document.body
      );
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*,video/*" 
        className="hidden" 
        multiple
        aria-hidden="true"
      />

      {/* Main Card Container */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-post-title"
        className={`
        w-full h-full md:h-auto md:max-h-[85vh] md:w-[650px] md:rounded-xl shadow-2xl flex flex-col overflow-hidden relative transition-all duration-300
        ${theme === 'dark' ? 'bg-slate-900 text-white border border-slate-800' : 'bg-white text-gray-900'}
      `}>
        
        {/* 1. Header */}
        <div className={`px-4 py-3 border-b flex justify-between items-center relative z-20 shrink-0 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleCloseAttempt} 
              aria-label="Back"
              className={`md:hidden p-2 -ml-2 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-6 h-6" />
            </button>
            <h3 id="create-post-title" className={`font-bold text-lg text-center md:text-left flex-1 font-khmer ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {isGeneralUser ? 'សួរសំណួរ (Ask Question)' : getTitle()}
            </h3>
          </div>
          
          <div className="flex gap-2">
             <button 
               onClick={handleCloseAttempt} 
               aria-label="Close modal"
               className={`hidden md:block p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
             >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
            </button>
            <button 
                onClick={handlePost}
                disabled={isPostButtonDisabled()}
                className="px-6 py-1.5 bg-emerald-600 text-white font-bold rounded-lg disabled:opacity-50 text-sm shadow-sm hover:bg-emerald-700 transition-colors font-khmer"
            >
                {isGeneralUser ? 'សួរ (Ask)' : 'បង្ហោះ'}
            </button>
          </div>
        </div>

        {/* 2. Scrollable Content */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar relative flex flex-col p-4 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
            
            {/* User Profile */}
            <div className="flex gap-3 mb-2 shrink-0">
                <img referrerPolicy="no-referrer" src={profile?.avatar_url || MOCK_USER.avatar || undefined} alt="Me" className={`w-12 h-12 rounded-full object-cover border ${theme === 'dark' ? 'border-slate-800' : 'border-gray-100'}`} />
                <div>
                    <h4 className={`font-bold text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{profile?.full_name || MOCK_USER.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                        <button className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold w-fit transition-colors ${theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            <HugeiconsIcon icon={Globe02Icon} strokeWidth={1.5} className="w-3 h-3" />
                            <span>សាធារណៈ</span>
                            <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={1.5} className="w-3 h-3" />
                        </button>
                        {isGeneralUser && (
                            <span className={`text-xs font-medium px-2 py-1 rounded font-khmer ${theme === 'dark' ? 'text-emerald-400 bg-emerald-900/30' : 'text-emerald-600 bg-emerald-50'}`}>
                                សំណួរ (Q&A)
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Dynamic Input Area */}
            <div className="w-full">
                {renderContentArea()}
            </div>

            {/* Background Selector */}
            {(postType === 'text' || postType === 'bg') && selectedImages.length === 0 && (
                <div className="mt-2 shrink-0">
                    {postType === 'bg' && (
                        <BackgroundSelector 
                            onCancel={() => { setPostBackground(''); setPostType('text'); }} 
                            onSelect={(bg) => setPostBackground(bg)} 
                        />
                    )}
                </div>
            )}
        </div>

        {/* 3. Footer / Action Bar */}
        <div className={`p-3 border-t z-20 shrink-0 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
            {postType === 'text' && (
                <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold hidden sm:block ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>បន្ថែមទៅការបង្ហោះ</span>
                    <div className="flex items-center gap-1 md:gap-2 flex-1 sm:flex-none justify-between sm:justify-end">
                        {!isGeneralUser && (
                            <>
                                <button aria-label="Add image" className={`p-2 text-green-500 rounded-full ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}`} onClick={() => handleActionSelect('image')}><HugeiconsIcon icon={Image01Icon} strokeWidth={1.5} className="w-6 h-6" /></button>
                                <button aria-label="Add audio" className={`p-2 text-rose-500 rounded-full ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}`} onClick={() => handleActionSelect('audio')}><HugeiconsIcon icon={Mic01Icon} strokeWidth={1.5} className="w-6 h-6" /></button>
                                <button aria-label="Tag friends" className={`p-2 text-blue-500 rounded-full ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}`} onClick={() => handleActionSelect('tag')}><HugeiconsIcon icon={Tag01Icon} strokeWidth={1.5} className="w-6 h-6" /></button>
                                <button aria-label="Add feeling" className={`p-2 text-yellow-500 rounded-full ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}`} onClick={() => handleActionSelect('feeling')}><HugeiconsIcon icon={HappyIcon} strokeWidth={1.5} className="w-6 h-6" /></button>
                                <button aria-label="Check in" className={`p-2 text-red-500 rounded-full ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}`} onClick={() => handleActionSelect('checkin')}><HugeiconsIcon icon={Location01Icon} strokeWidth={1.5} className="w-6 h-6" /></button>
                                <div className={`w-px h-6 mx-1 ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
                            </>
                        )}
                        <button 
                            aria-label="More options"
                            onClick={() => setShowDrawer(true)}
                            className={`p-2 rounded-full ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.5} className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* 4. Bottom Drawer (Action Menu) */}
        <ActionMenu 
            show={showDrawer} 
            onClose={() => setShowDrawer(false)}
            onSelect={handleActionSelect}
            currentType={postType}
            isGeneralUser={isGeneralUser}
            isAdmin={isAdmin}
        />

      </div>

      {/* Preview & Edit Modal */}
      {previewIndex !== null && selectedImages[previewIndex] && (
        <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
            {isEditingImage ? (
                <ImageEditor 
                    imageSrc={selectedImages[previewIndex].url} 
                    onSave={handleSaveEditedImage} 
                    onCancel={() => setIsEditingImage(false)} 
                />
            ) : (
                <>
                    {/* Preview Header */}
                    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
                        <button onClick={() => setPreviewIndex(null)} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-6 h-6" />
                        </button>
                        <div className="flex gap-3">
                            <button 
                                onClick={handleDeleteFromPreview}
                                className="p-2 text-white hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors"
                                title="លុបរូបភាព"
                            >
                                <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.5} className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => setIsEditingImage(true)}
                                className="px-4 py-2 bg-white text-black font-bold rounded-lg text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors shadow-lg"
                            >
                                <HugeiconsIcon icon={CropIcon} strokeWidth={1.5} className="w-4 h-4" /> កែសម្រួល
                            </button>
                        </div>
                    </div>

                    {/* Main Image View */}
                    <div className="flex-1 flex flex-col items-center justify-center p-4">
                        <div className="relative max-w-full max-h-[70vh]">
                            <img referrerPolicy="no-referrer" src={selectedImages[previewIndex].url || undefined} 
                                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                                alt="Preview" 
                            />
                        </div>
                        
                        {/* Caption Input */}
                        <div className="w-full max-w-md mt-6">
                            <input 
                                type="text" 
                                value={selectedImages[previewIndex].caption}
                                onChange={(e) => handleCaptionChange(previewIndex, e.target.value)}
                                placeholder="សរសេរ Caption សម្រាប់រូបនេះ..."
                                className="w-full bg-white/10 text-white placeholder-white/50 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center backdrop-blur-sm transition-all"
                            />
                        </div>
                    </div>

                    {/* Thumbnails Strip */}
                    {selectedImages.length > 1 && (
                        <div className="p-4 flex gap-2 justify-center overflow-x-auto bg-gradient-to-t from-black/60 to-transparent pb-safe">
                            {selectedImages.map((img, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setPreviewIndex(idx)}
                                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${previewIndex === idx ? 'border-emerald-500 scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                >
                                    <img referrerPolicy="no-referrer" src={img.url || undefined} className="w-full h-full object-cover" alt="thumb" />
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
      )}

      {/* Discard Alert Dialog */}
      {showDiscardAlert && (
          <div className="absolute inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
              <div className={`rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${theme === 'dark' ? 'bg-amber-900/40' : 'bg-amber-100'}`}>
                      <HugeiconsIcon icon={Alert02Icon} strokeWidth={1.5} className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className={`text-lg font-bold text-center mb-2 font-khmer ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>បោះបង់ការសរសេរ?</h3>
                  <p className={`text-center text-sm mb-6 font-khmer ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                      អ្នកមិនទាន់បានរក្សាទុកអត្ថបទនេះទេ។ ប្រសិនបើអ្នកចាកចេញ អ្វីដែលអ្នកបានសរសេរនឹងត្រូវបាត់បង់។
                  </p>
                  <div className="flex gap-3">
                      <button 
                          onClick={() => setShowDiscardAlert(false)}
                          className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                      >
                          បន្តសរសេរ
                      </button>
                      <button 
                          onClick={confirmDiscard}
                          className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-red-900/40 hover:bg-red-900/60 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'}`}
                      >
                          <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.5} className="w-4 h-4" /> បោះបង់
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Admin Only Alert Dialog */}
      {showAdminOnlyAlert && (
          <div className="absolute inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
              <div className={`rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200 text-center ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${theme === 'dark' ? 'bg-rose-900/40' : 'bg-rose-100'}`}>
                      <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={1.5} className="w-6 h-6 text-rose-600" />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 font-khmer ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>មុខងារសម្រាប់តែ Admin</h3>
                  <p className={`text-sm mb-6 font-khmer ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                      អធ្យាស្រ័យ! បច្ចុប្បន្នមុខងារបង្ហោះសំឡេង (Voice) ត្រូវបានអនុញ្ញាតសម្រាប់តែ Admin ប៉ុណ្ណោះ។
                  </p>
                  <button 
                      onClick={() => setShowAdminOnlyAlert(false)}
                      className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors font-khmer ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                  >
                      យល់ព្រម
                  </button>
              </div>
          </div>
      )}

    </div>,
    document.body
  );
};
