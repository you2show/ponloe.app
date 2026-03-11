import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { HugeiconsIcon } from '@hugeicons/react';
import { Share01Icon, Book01Icon, PlayIcon, HelpCircleIcon, Video01Icon } from '@hugeicons/core-free-icons';

interface MessageListProps {
  messages: any[];
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isTyping,
  messagesEndRef
}) => {
  const { theme } = useTheme();

  const renderPostPreview = (post: any, isMe: boolean) => {
    const borderColor = isMe ? 'border-emerald-500/30' : (theme === 'dark' ? 'border-slate-700' : 'border-gray-200');
    const bgColor = isMe ? 'bg-emerald-800/30' : (theme === 'dark' ? 'bg-slate-800/50' : 'bg-white');
    
    // Extract image if available
    let previewImage = post.image;
    if (!previewImage && post.images && post.images.length > 0) {
      const firstImg = post.images[0];
      previewImage = typeof firstImg === 'string' ? firstImg : firstImg.url;
    }

    return (
      <div className={`rounded-lg overflow-hidden border ${borderColor} ${bgColor}`}>
        {/* Header with Author */}
        <div className={`p-2 flex items-center gap-2 border-b ${borderColor}`}>
          <img 
            src={post.user?.avatar || post.authorAvatar} 
            alt={post.user?.name || post.authorName} 
            className="w-5 h-5 rounded-full object-cover"
          />
          <span className="text-xs font-bold">{post.user?.name || post.authorName}</span>
        </div>

        {/* Content based on type */}
        <div className="p-3">
          {post.type === 'quran' && post.quranData ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <HugeiconsIcon icon={Book01Icon} className="w-4 h-4" />
                <span className="text-xs font-bold">{post.quranData.surahName} ({post.quranData.ayahNumber})</span>
              </div>
              <p className="text-sm text-right font-arabic leading-loose" dir="rtl">{post.quranData.arabicText}</p>
              <p className="text-xs opacity-90 line-clamp-2">{post.quranData.translation}</p>
            </div>
          ) : post.type === 'hadith' && post.hadithData ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <HugeiconsIcon icon={Book01Icon} className="w-4 h-4" />
                <span className="text-xs font-bold">{post.hadithData.source} - {post.hadithData.number}</span>
              </div>
              <p className="text-xs opacity-90 line-clamp-3">{post.hadithData.text}</p>
            </div>
          ) : post.type === 'book' && post.bookData ? (
            <div className="flex gap-3">
              <img src={post.bookData.coverUrl} alt={post.bookData.title} className="w-16 h-24 object-cover rounded shadow-sm" />
              <div className="flex-1">
                <h4 className="text-sm font-bold line-clamp-2">{post.bookData.title}</h4>
                <p className="text-xs opacity-70">{post.bookData.author}</p>
                <p className="text-xs mt-2 line-clamp-2 opacity-90">{post.content}</p>
              </div>
            </div>
          ) : post.type === 'audio' ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-2 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                  <HugeiconsIcon icon={PlayIcon} className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold line-clamp-1">{post.audioData?.title || 'Audio Recording'}</p>
                  <p className="text-[10px] opacity-70">{post.audioData?.duration || '0:00'}</p>
                </div>
              </div>
              <p className="text-xs opacity-90 line-clamp-2">{post.content}</p>
            </div>
          ) : post.type === 'qna' && post.qnaData ? (
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-[10px] font-bold">Q</div>
                <p className="text-xs font-bold line-clamp-2">{post.qnaData.question}</p>
              </div>
              <p className="text-xs opacity-90 line-clamp-2">{post.content}</p>
            </div>
          ) : post.type === 'fundraiser' && post.fundraiser ? (
            <div className="space-y-2">
              {previewImage && <img src={previewImage} alt="Fundraiser" className="w-full h-24 object-cover rounded-lg mb-2" />}
              <p className="text-xs font-bold line-clamp-2">{post.content}</p>
              <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5 mt-2">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (post.fundraiser.raised / post.fundraiser.target) * 100)}%` }}></div>
              </div>
              <div className="flex justify-between text-[10px] opacity-70 mt-1">
                <span>{post.fundraiser.currency}{post.fundraiser.raised} raised</span>
                <span>{post.fundraiser.currency}{post.fundraiser.target}</span>
              </div>
            </div>
          ) : post.type === 'poll' && post.pollOptions ? (
            <div className="space-y-2">
              <p className="text-xs font-bold line-clamp-2">{post.content}</p>
              <div className="space-y-1 mt-2">
                {post.pollOptions.slice(0, 2).map((opt: any) => (
                  <div key={opt.id} className="bg-black/5 dark:bg-white/5 p-1.5 rounded text-[10px] truncate">
                    {opt.text}
                  </div>
                ))}
                {post.pollOptions.length > 2 && <p className="text-[10px] opacity-70">+{post.pollOptions.length - 2} more options</p>}
              </div>
            </div>
          ) : post.type === 'video' || post.type === 'reel' ? (
            <div className="space-y-2 relative">
              {previewImage && (
                <div className="relative">
                  <img src={previewImage} alt="Video preview" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white backdrop-blur-sm">
                      <HugeiconsIcon icon={PlayIcon} className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              )}
              <p className="text-xs opacity-90 line-clamp-2">{post.content}</p>
            </div>
          ) : (
            /* Default Text/Image Post */
            <div className="space-y-2">
              {previewImage && (
                <img 
                  src={previewImage} 
                  alt="Post preview" 
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}
              <p className="text-xs opacity-90 line-clamp-3">{post.content}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10 custom-scrollbar">
      {messages.map(msg => {
        const isMe = msg.senderId === 'me';
        return (
          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2 shadow-sm relative group ${
              isMe 
                ? 'bg-emerald-600 text-white rounded-tr-none' 
                : (theme === 'dark' ? 'bg-slate-800 text-white rounded-tl-none' : 'bg-white text-gray-800 rounded-tl-none')
            }`}>
              
              {msg.isPostShare && (
                <div className={`mb-2 p-3 rounded-xl flex flex-col gap-3 border ${
                  isMe 
                    ? 'bg-emerald-700/50 border-emerald-500/30' 
                    : (theme === 'dark' ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200')
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-full shrink-0 ${
                      isMe ? 'bg-emerald-500/50' : (theme === 'dark' ? 'bg-slate-600' : 'bg-white shadow-sm')
                    }`}>
                      <HugeiconsIcon icon={Share01Icon} className="w-3 h-3" />
                    </div>
                    <p className="text-xs font-bold">Shared a post</p>
                  </div>
                  
                  {msg.postContext ? (
                    renderPostPreview(msg.postContext, isMe)
                  ) : (
                    <div>
                      <p className="text-xs opacity-80 line-clamp-2">Post ID: {msg.postId}</p>
                    </div>
                  )}

                  <button className={`w-full text-xs font-bold px-3 py-2 rounded-lg transition-colors ${
                    isMe 
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-white' 
                      : (theme === 'dark' ? 'bg-slate-600 hover:bg-slate-500 text-white' : 'bg-white hover:bg-gray-100 text-gray-800 shadow-sm border border-gray-200')
                  }`}>
                    View Post
                  </button>
                </div>
              )}

              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <span className={`text-[10px] mt-1 block text-right opacity-70 ${
                isMe ? 'text-emerald-100' : 'text-gray-400'
              }`}>
                {msg.time}
              </span>
              
              {/* Message Tail (Visual Polish) */}
              <div className={`absolute top-0 w-3 h-3 ${
                 isMe 
                 ? '-right-2 bg-emerald-600 [clip-path:polygon(0_0,0_100%,100%_0)]' 
                 : `-left-2 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} [clip-path:polygon(100%_0,100%_100%,0_0)]`
              }`}></div>
            </div>
          </div>
        );
      })}
      
      {isTyping && (
        <div className="flex justify-start">
          <div className={`rounded-2xl px-4 py-3 shadow-sm rounded-tl-none flex items-center gap-1 ${
            theme === 'dark' ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
