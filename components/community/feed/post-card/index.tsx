import { HugeiconsIcon } from '@hugeicons/react';
import { CharityIcon, PlayIcon, Tick01Icon, Calendar01Icon, Location01Icon, BookOpen01Icon, QuoteDownIcon, Comment01Icon, Share01Icon, ThumbsUpIcon, File01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

import React, { useState, useEffect } from 'react';

import { Post, PollOption } from '../../shared';
import { PostHeader } from './PostHeader';
import { PostFooter } from './PostFooter';
import { PostMedia } from './PostMedia';
import { BookReader } from '@/components/library/BookReader';
import { Book } from '@/components/library/data';

import { WaveformPlayer } from '../../shared/WaveformPlayer';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { mediaService } from '@/src/services/mediaService';

export const PostCard: React.FC<{ 
  post: Post; 
  onDelete?: (postId: string) => void; 
  onEdit?: (post: Post) => void;
  onReadingStateChange?: (isReading: boolean) => void;
}> = ({ post, onDelete, onEdit, onReadingStateChange }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [isReadingBook, setIsReadingBook] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    onReadingStateChange?.(isReadingBook);
  }, [isReadingBook, onReadingStateChange]);

  // Proactively cache media for offline use
  useEffect(() => {
    const cacheMedia = async () => {
        // Cache images
        if (post.images && post.images.length > 0) {
            post.images.forEach(img => {
                const url = typeof img === 'string' ? img : img.url;
                mediaService.cacheMedia(url);
            });
        }
        if (post.image) {
            mediaService.cacheMedia(post.image);
        }

        // Cache audio
        const audioTracks = post.audioData?.tracks || post.extra_data?.audioData?.tracks;
        if (audioTracks && audioTracks.length > 0) {
            audioTracks.forEach((track: any) => {
                mediaService.cacheMedia(track.url);
            });
        }
    };
    
    // Small delay to prioritize main content rendering
    const timer = setTimeout(cacheMedia, 2000);
    return () => clearTimeout(timer);
  }, [post.id, post.images, post.image, post.audioData, post.extra_data]);
  
  // Poll State
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [pollOptions, setPollOptions] = useState<PollOption[]>(post.pollOptions || []);
  const [totalVotes, setTotalVotes] = useState<number>(post.totalVotes || 0);

  // Initialize vote state from props
  useEffect(() => {
    if (post.type === 'poll' && post.pollOptions && user) {
        const userVote = post.pollOptions.find(opt => opt.voterIds?.includes(user.id));
        if (userVote) {
            setVotedOptionId(userVote.id);
        }
        setPollOptions(post.pollOptions);
        setTotalVotes(post.totalVotes || 0);
    }
  }, [post.pollOptions, post.totalVotes, post.type, user]);

  const formatTime = (seconds: number | string) => {
      if (typeof seconds === 'string') return seconds;
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ... (rest of the component)

  // 8. DEFAULT POST (Text / Image / Poll / Book / Fundraiser / Market)
  const content = post.content || '';
  const isLongText = content.length > 250;
  
  // Handle Background
  const postBackground = (post as any).background;
  const hasBackground = !!postBackground;
  
  const backgroundStyle = hasBackground && (postBackground.startsWith('http') || postBackground.startsWith('linear-gradient')) 
      ? { 
          backgroundImage: postBackground.startsWith('http') ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${postBackground})` : postBackground, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          color: 'white'
      } 
      : {};

  const backgroundClass = hasBackground && !postBackground.startsWith('http') && !postBackground.startsWith('linear-gradient')
      ? postBackground
      : '';

  const handleVote = async (optionId: string) => {
      if (votedOptionId || !user) return; // Prevent multiple votes or unauth votes
      
      // Optimistic Update
      setVotedOptionId(optionId);
      const newOptions = pollOptions.map(opt => {
          if (opt.id === optionId) {
              return { 
                  ...opt, 
                  votes: opt.votes + 1,
                  voterIds: [...(opt.voterIds || []), user.id]
              };
          }
          return opt;
      });
      setPollOptions(newOptions);
      setTotalVotes(prev => prev + 1);

      try {
          // Fetch latest post data to ensure we don't overwrite other updates
          const { data: currentPost, error: fetchError } = await supabase
              .from('posts')
              .select('extra_data')
              .eq('id', post.id)
              .single();

          if (fetchError || !currentPost) throw fetchError;

          const currentExtraData = currentPost.extra_data || {};
          const currentPollOptions: PollOption[] = currentExtraData.pollOptions || [];
          
          // Check if user already voted in DB (race condition check)
          const alreadyVoted = currentPollOptions.some(opt => opt.voterIds?.includes(user.id));
          if (alreadyVoted) return;

          const updatedOptions = currentPollOptions.map(opt => {
              if (opt.id === optionId) {
                  return {
                      ...opt,
                      votes: opt.votes + 1,
                      voterIds: [...(opt.voterIds || []), user.id]
                  };
              }
              return opt;
          });

          const updatedTotalVotes = (currentExtraData.totalVotes || 0) + 1;

          const { error: updateError } = await supabase
              .from('posts')
              .update({
                  extra_data: {
                      ...currentExtraData,
                      pollOptions: updatedOptions,
                      totalVotes: updatedTotalVotes
                  }
              })
              .eq('id', post.id);

          if (updateError) throw updateError;

      } catch (error) {
          console.error('Error saving vote:', error);
          // Revert optimistic update on error
          setVotedOptionId(null);
          setPollOptions(post.pollOptions || []);
          setTotalVotes(post.totalVotes || 0);
      }
  };

  // Construct Book object for BookReader
  const getBookObject = (): Book | null => {
    if (post.type !== 'book' || (!post.bookData && !post.extra_data?.bookData)) return null;
    
    const bookData = post.bookData || post.extra_data?.bookData;
    
    // Construct HTML content from textContent pages if available
    let htmlContent = '';
    if (bookData.textContent && Array.isArray(bookData.textContent)) {
        htmlContent = bookData.textContent.map((page: any) => `<h3>${page.title}</h3><p>${page.content}</p>`).join('');
    }

    return {
        id: post.id,
        title: bookData.title || 'No Title',
        author: bookData.author || 'Unknown Author',
        description: post.content || '',
        category: bookData.category ? bookData.category.toLowerCase() : 'general',
        coverUrl: bookData.coverPreview || 'https://via.placeholder.com/150',
        type: bookData.inputType === 'text' ? 'TEXT' : 'PDF',
        content: htmlContent,
        pdfUrl: bookData.pdfLink || bookData.pdfFile,
        uploader: {
            id: post.user.id,
            name: post.user.name,
            avatar: post.user.avatar,
            role: post.user.role || 'user',
            isVerified: post.user.isVerified || false
        },
        pages: bookData.pages,
        fileSize: 'Unknown',
        rating: 0,
        ratingCount: 0,
        publishedDate: bookData.publishedDate,
        views: 0,
        likes: post.likes || 0,
        comments: [] 
    };
  };

  const bookObject = getBookObject();

  return (
    <div className={`rounded-xl shadow-sm border mb-4 overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
      <PostHeader post={post} onDelete={onDelete} onEdit={onEdit} />
      
      <div className={`px-4 pb-3 ${hasBackground ? 'min-h-[200px] flex flex-col justify-center items-center text-center p-6' : ''}`} style={backgroundStyle}>
        <div className={`
            text-sm md:text-base leading-relaxed font-khmer whitespace-pre-wrap 
            ${!isExpanded && isLongText ? 'line-clamp-3' : ''} 
            ${hasBackground ? 'text-white font-bold text-lg md:text-xl drop-shadow-md' : (theme === 'dark' ? 'text-slate-200' : 'text-gray-800')}
            ${backgroundClass}
        `}>
            {content}
        </div>
        {isLongText && (
            <button 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                className={`${hasBackground ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-emerald-600'} text-xs font-bold mt-1`}
            >
                {isExpanded ? 'បង្ហាញតិច' : 'អានបន្ថែម...'}
            </button>
        )}
        
        {/* Poll Rendering */}
        {post.type === 'poll' && pollOptions.length > 0 && (
           <div className="mt-3 space-y-2 w-full text-left">
              {pollOptions.map(opt => {
                 const isSelected = votedOptionId === opt.id;
                 const percent = totalVotes ? Math.round((opt.votes / totalVotes) * 100) : 0;
                 
                 return (
                    <div 
                        key={opt.id} 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleVote(opt.id);
                        }}
                        className={`relative h-10 rounded-lg overflow-hidden cursor-pointer transition-all border ${
                            theme === 'dark' 
                                ? (isSelected ? 'bg-slate-700 border-emerald-500 ring-1 ring-emerald-500' : 'bg-slate-800 border-slate-700 hover:bg-slate-700') 
                                : (isSelected ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-gray-100 border-transparent hover:bg-gray-200')
                        }`}
                    >
                       <div 
                            className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                                theme === 'dark' 
                                    ? (isSelected ? 'bg-emerald-900/40' : 'bg-blue-900/30') 
                                    : (isSelected ? 'bg-emerald-200/50' : 'bg-blue-100')
                            }`} 
                            style={{ width: `${percent}%` }}
                       ></div>
                       <div className="absolute inset-0 flex items-center justify-between px-4 text-sm">
                          <span className={`font-medium z-10 font-khmer ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'} ${isSelected ? 'font-bold' : ''}`}>
                            {opt.text} {isSelected && <span className="text-emerald-500 ml-2">✓</span>}
                          </span>
                          <span className={`font-bold z-10 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>{percent}%</span>
                       </div>
                    </div>
                 )
              })}
              <p className={`text-xs mt-1 text-right ${hasBackground ? 'text-white/80' : 'text-gray-500'}`}>
                  {totalVotes} votes • {votedOptionId ? 'Voted' : 'Final results'}
              </p>
           </div>
        )}

        {/* Book Rendering */}
        {post.type === 'book' && (post.bookData || post.extra_data?.bookData) && (
            <div className={`mt-3 p-4 rounded-2xl border flex gap-4 transition-all duration-300 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800' : 'bg-white border-gray-100 shadow-sm hover:shadow-md'}`}>
                {/* Book Cover */}
                <div className={`w-24 h-36 shrink-0 rounded-xl overflow-hidden shadow-sm border relative group ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100/50'}`}>
                    {(post.bookData?.coverPreview || post.extra_data?.bookData?.coverPreview) ? (
                        <img 
                            src={post.bookData?.coverPreview || post.extra_data?.bookData?.coverPreview} 
                            alt="Book Cover" 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center ${theme === 'dark' ? 'text-slate-600' : 'text-gray-300'}`}>
                            <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className="w-8 h-8" />
                        </div>
                    )}
                </div>
                
                {/* Book Details */}
                <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className={`font-bold text-lg mb-1.5 line-clamp-2 leading-snug ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>
                            {post.bookData?.title || post.extra_data?.bookData?.title}
                        </h3>
                        {(post.bookData?.category || post.extra_data?.bookData?.category) && (
                            <span className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium whitespace-nowrap ${theme === 'dark' ? 'bg-slate-700/50 border-slate-600 text-slate-300' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                                {post.bookData?.category || post.extra_data?.bookData?.category}
                            </span>
                        )}
                    </div>
                    
                    <p className={`text-sm mb-3 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                        ដោយ: <span className={theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}>{post.bookData?.author || post.extra_data?.bookData?.author || 'មិនស្គាល់'}</span>
                    </p>

                    <div className={`flex flex-wrap gap-3 text-xs mb-4 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
                        {(post.bookData?.pages || post.extra_data?.bookData?.pages) && (
                            <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100/50">
                                <HugeiconsIcon icon={File01Icon} strokeWidth={1.5} className="w-3.5 h-3.5" />
                                {post.bookData?.pages || post.extra_data?.bookData?.pages} ទំព័រ
                            </span>
                        )}
                        {(post.bookData?.publishedDate || post.extra_data?.bookData?.publishedDate) && (
                            <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100/50">
                                <HugeiconsIcon icon={Calendar01Icon} strokeWidth={1.5} className="w-3.5 h-3.5" />
                                {post.bookData?.publishedDate || post.extra_data?.bookData?.publishedDate}
                            </span>
                        )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                        <button 
                            onClick={() => setIsReadingBook(true)}
                            className="flex items-center gap-2 text-sm font-bold text-white w-fit px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                        >
                            <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className="w-4 h-4" />
                            អានសៀវភៅ
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Book Reader Modal */}
        {isReadingBook && bookObject && (
            <BookReader 
                book={bookObject}
                onBack={() => setIsReadingBook(false)}
            />
        )}

        {/* Dua Rendering */}
        {post.type === 'dua' && (post.duaData || post.extra_data?.duaData) && (
           <div className={`mt-3 p-6 rounded-xl border text-center relative overflow-hidden ${theme === 'dark' ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-100'}`}>
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 ${theme === 'dark' ? 'opacity-20' : 'opacity-50'}`}></div>
              <HugeiconsIcon icon={CharityIcon} strokeWidth={1.5} className="w-8 h-8 text-amber-500 mx-auto mb-3 opacity-80" />
              <h3 className={`font-arabic text-2xl md:text-3xl leading-loose mb-4 font-medium ${theme === 'dark' ? 'text-amber-400' : 'text-amber-900'}`} dir="rtl">
                  {post.duaData?.arabic || post.extra_data?.duaData?.arabic}
              </h3>
              <p className={`font-khmer text-base md:text-lg italic leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                  "{post.duaData?.khmer || post.extra_data?.duaData?.khmer}"
              </p>
           </div>
        )}
      </div>
      
      {/* Media Rendering */}
      {post.images && post.images.length > 0 ? (
          <PostMedia 
            images={post.images} 
            layout={post.imageLayout || 'grid'} 
            post={post}
          />
      ) : post.image ? (
        <PostMedia 
            images={[post.image]} 
            layout="grid" 
            post={post}
        />
      ) : null}

      <PostFooter post={post} />
    </div>
  );
};

