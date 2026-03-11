import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, UserGroupIcon, BookOpen01Icon, StarIcon, CheckmarkCircle02Icon, MoreVerticalIcon, Notification01Icon, Share01Icon } from '@hugeicons/core-free-icons';

import React, { useState } from 'react';

import { Uploader, Book, MOCK_BOOKS } from './data';
import { useToast } from '@/contexts/ToastContext';

interface AuthorProfileViewProps {
  author: Uploader;
  onBack: () => void;
  onSelectBook: (book: Book) => void;
  className?: string;
}

export const AuthorProfileView: React.FC<AuthorProfileViewProps> = ({ author, onBack, onSelectBook, className }) => {
  const { showToast } = useToast();
  const [isFollowed, setIsFollowed] = useState(false);

  // Filter books by this author
  const authorBooks = MOCK_BOOKS.filter(b => b.uploader.id === author.id);
  
  // Mock Stats
  const totalViews = authorBooks.reduce((acc, curr) => acc + curr.views, 0);
  const totalLikes = authorBooks.reduce((acc, curr) => acc + curr.likes, 0);

  return (
    <div className={className || "fixed inset-0 md:left-20 z-[999] bg-gray-50 flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto"}>
      
      {/* Header Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-emerald-800 to-teal-900 shrink-0">
         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
         <button 
            onClick={onBack}
            className="absolute top-4 left-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-colors z-10"
         >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-6 h-6" />
         </button>
         <button className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-colors z-10">
            <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={1.5} className="w-6 h-6" />
         </button>
      </div>

      {/* Profile Info Card */}
      <div className="px-4 md:px-8 -mt-16 mb-6 relative z-10">
         <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-start md:items-end gap-6 border border-gray-100">
            
            {/* Avatar */}
            <div className="relative -mt-16 md:-mt-20">
               <div className="w-32 h-32 rounded-full p-1 bg-white shadow-md">
                  <img referrerPolicy="no-referrer" src={author.avatar} alt={author.name} className="w-full h-full rounded-full object-cover border-4 border-gray-50" />
               </div>
               {author.isVerified && (
                  <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1 rounded-full border-2 border-white" title="Verified Author">
                     <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="w-4 h-4" />
                  </div>
               )}
            </div>

            {/* Name & Bio */}
            <div className="flex-1 min-w-0 pb-2">
               <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-khmer flex items-center gap-2">
                  {author.name}
               </h1>
               <p className="text-emerald-600 font-medium text-sm mb-2">{author.role}</p>
               <p className="text-gray-500 text-sm line-clamp-2">
                  អ្នកចែករំលែកចំណេះដឹងឥស្លាម និងឯកសារដែលមានប្រយោជន៍សម្រាប់សហគមន៍។
               </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full md:w-auto mt-2 md:mt-0">
               <button 
                  onClick={() => {
                      setIsFollowed(!isFollowed);
                      showToast(isFollowed ? 'បានឈប់តាមដាន' : 'បានតាមដានដោយជោគជ័យ', 'success');
                  }}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                     isFollowed 
                     ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' 
                     : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200'
                  }`}
               >
                  {isFollowed ? <><HugeiconsIcon icon={Notification01Icon} strokeWidth={1.5} className="w-4 h-4 fill-current" /> តាមដាន</> : 'Follow'}
               </button>
               <button 
                  onClick={() => showToast('មុខងារចែករំលែកកំពុងអភិវឌ្ឍ', 'info')}
                  className="p-2.5 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600"
               >
                  <HugeiconsIcon icon={Share01Icon} strokeWidth={1.5} className="w-5 h-5" />
               </button>
            </div>
         </div>
      </div>

      {/* Stats Row */}
      <div className="px-4 md:px-8 mb-8">
         <div className="grid grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center divide-x divide-gray-100">
            <div>
               <span className="block text-xl font-bold text-gray-900">{authorBooks.length}</span>
               <span className="text-xs text-gray-500 uppercase tracking-wide">ស្នាដៃ</span>
            </div>
            <div>
               <span className="block text-xl font-bold text-gray-900">{(totalViews / 1000).toFixed(1)}k</span>
               <span className="text-xs text-gray-500 uppercase tracking-wide">អ្នកអាន</span>
            </div>
            <div>
               <span className="block text-xl font-bold text-gray-900">{totalLikes}</span>
               <span className="text-xs text-gray-500 uppercase tracking-wide">Likes</span>
            </div>
         </div>
      </div>

      {/* Content Tabs */}
      <div className="flex-1 bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.02)] border-t border-gray-100 px-4 md:px-8 pt-6 pb-20">
         <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2 font-khmer">
            <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className="w-5 h-5 text-emerald-600" />
            ស្នាដៃដែលបានបង្ហោះ
         </h3>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {authorBooks.map(book => (
               <div 
                  key={book.id}
                  onClick={() => onSelectBook(book)}
                  className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all cursor-pointer group"
               >
                  <div className="w-20 h-28 rounded-lg bg-gray-200 overflow-hidden shrink-0 shadow-sm relative">
                     <img referrerPolicy="no-referrer" src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                     {book.type === 'PDF' && <div className="absolute top-1 left-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">PDF</div>}
                     {book.type === 'TEXT' && <div className="absolute top-1 left-1 bg-blue-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">TEXT</div>}
                  </div>
                  
                  <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                     <div>
                        <h4 className="font-bold text-gray-900 font-khmer line-clamp-2 leading-snug mb-1 group-hover:text-emerald-700">
                           {book.title}
                        </h4>
                        <p className="text-xs text-gray-500">{book.publishedDate}</p>
                     </div>
                     
                     <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                        <span className="flex items-center gap-1"><HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.5} className="w-3 h-3" /> {book.views}</span>
                        <span className="flex items-center gap-1 text-amber-500"><HugeiconsIcon icon={StarIcon} strokeWidth={1.5} className="w-3 h-3 fill-current" /> {book.rating}</span>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>

    </div>
  );
};
