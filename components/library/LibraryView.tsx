import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, FilterIcon, BookOpen01Icon, File01Icon, HeadphonesIcon, UserIcon, Download01Icon, Bookmark01Icon, CheckmarkCircle02Icon, Delete02Icon, ArrowRight01Icon, LibraryIcon, LayoutGridIcon, Cancel01Icon, Menu01Icon, Book02Icon, AudioBook04Icon, BookDownloadIcon, BookBookmark02Icon } from '@hugeicons/core-free-icons';
import BookImageIcon from './BookImageIcon';
import BookUserIcon from './BookUserIcon';
import { motion, AnimatePresence } from 'motion/react';

import React, { useState, useEffect, useMemo, useRef } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { MOCK_BOOKS, LIBRARY_CATEGORIES, Book, Uploader } from './data';
import { BookReader } from './BookReader';
import { AuthorProfileView } from './AuthorProfileView';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { libraryService, DownloadedBook } from '@/src/services/libraryService';

export const LibraryView: React.FC = () => {
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Navigation State
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<Uploader | null>(null);
  
  // State for Saved/Downloaded books
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());
  const [filterMode, setFilterMode] = useState<'browse' | 'audiobook' | 'picturebook' | 'downloaded' | 'saved' | 'authors'>('browse');

  // Sorting State
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'likes'>('newest');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [fetchedBooks, setFetchedBooks] = useState<Book[]>([]);
  const [localDownloadedBooks, setLocalDownloadedBooks] = useState<DownloadedBook[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
            setIsFilterMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Books from Supabase
  useEffect(() => {
    const fetchBooks = async () => {
        setLoadingBooks(true);
        try {
            if (!supabase) return;

            // Fetch posts that are of type 'book' or have originalType 'book'
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
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const books: Book[] = data
                    .filter((post: any) => {
                        const extra = post.extra_data || {};
                        return post.type === 'book' || extra.originalType === 'book' || extra.bookData;
                    })
                    .map((post: any) => {
                        const extra = post.extra_data || {};
                        const bookData = extra.bookData || {};
                        
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
                                id: post.profiles?.id || 'unknown',
                                name: post.profiles?.full_name || 'Unknown User',
                                avatar: post.profiles?.avatar_url || 'https://ui-avatars.com/api/?name=User',
                                role: post.profiles?.role || 'User',
                                isVerified: post.profiles?.is_verified || false
                            },
                            likes: post.likes || 0,
                            views: 0, // Views not currently tracked on posts
                            comments: [], // Comments fetching would require another query
                            publishedDate: bookData.publishedDate || new Date(post.created_at).toLocaleDateString(),
                            pages: parseInt(bookData.pages) || 0,
                            fileSize: 'Unknown',
                            rating: 0,
                            ratingCount: 0
                        };
                    });
                setFetchedBooks(books);
            }
        } catch (error) {
            console.error("Error fetching books:", error);
        } finally {
            setLoadingBooks(false);
        }
    };

    fetchBooks();
  }, []);

  // Combine Mock and Fetched Books
  const allBooks = useMemo(() => {
      return [...fetchedBooks, ...MOCK_BOOKS];
  }, [fetchedBooks]);

  // Extract unique authors from allBooks for the list
  const distinctAuthors = useMemo(() => {
      const authorMap = new Map();
      allBooks.forEach(book => {
          if (!authorMap.has(book.uploader.id)) {
              authorMap.set(book.uploader.id, book.uploader);
          }
      });
      return Array.from(authorMap.values());
  }, [allBooks]);

  // Load state from local storage or Supabase
  const { user } = useAuth();

  useEffect(() => {
      const loadUserData = async () => {
          // Load IndexedDB books first
          const dbBooks = await libraryService.getAllBooks();
          setLocalDownloadedBooks(dbBooks);
          const dbIds = new Set<string>(dbBooks.map(b => b.id));
          setDownloadedIds(dbIds);

          if (user) {
              try {
                  // Fetch saved posts
                  const { data: savedData } = await supabase
                      .from('saved_posts')
                      .select('post_id')
                      .eq('user_id', user.id);
                  
                  if (savedData) {
                      setSavedIds(new Set(savedData.map(s => s.post_id)));
                  }

                  // Sync downloaded books from user_settings (optional, but good for cross-device ID sync)
                  const { data: downloadedData } = await supabase
                      .from('user_settings')
                      .select('value')
                      .eq('user_id', user.id)
                      .eq('key', 'downloaded_books')
                      .maybeSingle();
                  
                  if (downloadedData && downloadedData.value && Array.isArray(downloadedData.value.ids)) {
                      // Merge with local IDs
                      const mergedIds = new Set([...Array.from(dbIds), ...downloadedData.value.ids]);
                      setDownloadedIds(mergedIds);
                  }
              } catch (error) {
                  console.error("Error loading user library data:", error);
              }
          } else {
              const loadedSaved = localStorage.getItem('library_saved');
              if (loadedSaved) setSavedIds(new Set(JSON.parse(loadedSaved)));
          }
      };

      loadUserData();
  }, [user]);

  const handleToggleSave = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      const newSet = new Set(savedIds);
      const isSaving = !newSet.has(id);

      if (isSaving) newSet.add(id);
      else newSet.delete(id);
      
      setSavedIds(newSet);

      if (user) {
          try {
              if (isSaving) {
                  await supabase.from('saved_posts').insert({ post_id: id, user_id: user.id });
                  showToast("បានរក្សាទុកក្នុងគណនីរបស់អ្នក", "success");
              } else {
                  await supabase.from('saved_posts').delete().eq('post_id', id).eq('user_id', user.id);
              }
          } catch (error) {
              console.error("Error saving book:", error);
              showToast("មានបញ្ហាក្នុងការរក្សាទុក", "error");
          }
      } else {
          localStorage.setItem('library_saved', JSON.stringify(Array.from(newSet)));
          if (isSaving) {
              showToast("បានរក្សាទុកក្នុង Browser របស់អ្នក។ សូមចូលគណនីដើម្បីរក្សាទុកជាអចិន្ត្រៃយ៍។", "info");
          }
      }
  };

  const handleToggleDownload = async (e: React.MouseEvent, book: Book) => {
      e.stopPropagation();
      const id = book.id;
      const newSet = new Set(downloadedIds);
      const isDownloading = !newSet.has(id);

      if (!isDownloading) {
          if(confirm("តើអ្នកចង់លុបសៀវភៅនេះចេញពីការទាញយកឬ?")) {
              newSet.delete(id);
              await libraryService.deleteBook(id);
              // Update local list
              setLocalDownloadedBooks(prev => prev.filter(b => b.id !== id));
          } else {
              return;
          }
      } else {
          showToast("ចាប់ផ្តើមទាញយក...", "info");
          try {
              const fileUrl = book.pdfUrl || '';
              if (!fileUrl && book.type === 'PDF') {
                  showToast("មិនមានឯកសារសម្រាប់ទាញយកទេ", "error");
                  return;
              }

              // If it's a TEXT book, we might want to save the content as a blob too
              // but for now let's focus on PDF as per user's flow (Admin uploads)
              if (book.type === 'PDF') {
                  await libraryService.downloadAndSaveBook(
                      id,
                      book.title,
                      book.author,
                      book.coverUrl,
                      fileUrl
                  );
              } else {
                  // For TEXT books, we can still save them to IndexedDB
                  const blob = new Blob([book.content || ''], { type: 'text/html' });
                  await libraryService.saveBook({
                      id,
                      title: book.title,
                      author: book.author,
                      cover_url: book.coverUrl,
                      file_blob: blob,
                      file_type: 'text/html',
                      downloaded_at: Date.now(),
                      size: blob.size
                  });
              }

              newSet.add(id);
              // Update local list
              const dbBooks = await libraryService.getAllBooks();
              setLocalDownloadedBooks(dbBooks);
          } catch (error) {
              console.error("Download failed:", error);
              showToast("ការទាញយកបានបរាជ័យ", "error");
              return;
          }
      }
      
      setDownloadedIds(newSet);

      if (user) {
          try {
              const { data: existing } = await supabase
                  .from('user_settings')
                  .select('id')
                  .eq('user_id', user.id)
                  .eq('key', 'downloaded_books')
                  .maybeSingle();

              if (existing) {
                  await supabase.from('user_settings').update({
                      value: { ids: Array.from(newSet) },
                      updated_at: new Date().toISOString()
                  }).eq('id', existing.id);
              } else {
                  await supabase.from('user_settings').insert({
                      user_id: user.id,
                      key: 'downloaded_books',
                      value: { ids: Array.from(newSet) }
                  });
              }
              if (isDownloading) {
                  showToast("បានទាញយក និងរក្សាទុកក្នុងគណនីរបស់អ្នក", "success");
              }
          } catch (error) {
              console.error("Error syncing downloaded IDs:", error);
          }
      } else {
          localStorage.setItem('library_downloaded', JSON.stringify(Array.from(newSet)));
          if (isDownloading) {
              showToast("បានទាញយកទុកក្នុង Browser របស់អ្នក។ សូមចូលគណនីដើម្បីរក្សាទុកជាអចិន្ត្រៃយ៍។", "info");
          }
      }
  };

  const handleOpenAuthor = (e: React.MouseEvent, uploader: Uploader) => {
      e.stopPropagation();
      setSelectedAuthor(uploader);
  };

  const filteredBooks = useMemo(() => {
    // If in downloaded mode, we might want to show books that are in IndexedDB
    // even if they are not in the 'allBooks' list (e.g. original post deleted)
    let baseBooks = allBooks;
    if (filterMode === 'downloaded') {
        // Create Book objects from localDownloadedBooks for those not in allBooks
        const allBookIds = new Set(allBooks.map(b => b.id));
        const missingBooks = localDownloadedBooks
            .filter(dbBook => !allBookIds.has(dbBook.id))
            .map(dbBook => ({
                id: dbBook.id,
                title: dbBook.title,
                author: dbBook.author,
                description: 'Downloaded for offline reading',
                category: 'downloaded',
                coverUrl: dbBook.cover_url,
                type: dbBook.file_type === 'text/html' ? 'TEXT' : 'PDF' as 'TEXT' | 'PDF',
                content: dbBook.file_type === 'text/html' ? 'Loading offline content...' : '',
                uploader: { id: 'local', name: 'Local', avatar: '', role: 'Local', isVerified: false },
                likes: 0,
                views: 0,
                comments: [],
                publishedDate: new Date(dbBook.downloaded_at).toLocaleDateString(),
                pages: 0,
                fileSize: (dbBook.size / (1024 * 1024)).toFixed(2) + ' MB',
                rating: 0,
                ratingCount: 0
            }));
        baseBooks = [...allBooks, ...missingBooks];
    }

    let result = baseBooks.filter(book => {
        // 1. Filter by Search
        const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              book.author.toLowerCase().includes(searchQuery.toLowerCase());
        
        // 2. Filter by Category (only in browse mode)
        const matchesCategory = activeCategory === 'all' || book.category === activeCategory || (activeCategory !== 'all' && book.category.includes(activeCategory)); // Loose matching for categories

        // 3. Filter by Mode (Browse / Downloaded / Saved / Authors)
        if (filterMode === 'authors') {
            return false;
        }
        if (filterMode === 'downloaded') {
            return downloadedIds.has(book.id) && matchesSearch;
        }
        if (filterMode === 'saved') {
            return savedIds.has(book.id) && matchesSearch;
        }
        if (filterMode === 'audiobook') {
            return (book.category === 'audiobook' || book.type === 'TEXT') && matchesSearch;
        }
        if (filterMode === 'picturebook') {
            return book.category === 'picturebook' && matchesSearch;
        }

        return matchesCategory && matchesSearch;
    });

    // 4. Apply Sorting
    if (sortBy === 'popular') {
        result.sort((a, b) => b.views - a.views);
    } else if (sortBy === 'likes') {
        result.sort((a, b) => b.likes - a.likes);
    } else {
        // Newest (Default) - Mock: Sort by ID descending as a proxy for date
        // For mixed IDs (string/number), this might be flaky, but works for now if IDs are somewhat sequential or we use publishedDate
        result.sort((a, b) => {
             // Try to sort by published Date if available
             const dateA = new Date(a.publishedDate).getTime();
             const dateB = new Date(b.publishedDate).getTime();
             if (!isNaN(dateA) && !isNaN(dateB)) {
                 return dateB - dateA;
             }
             return 0;
        });
    }

    return result;
  }, [allBooks, searchQuery, activeCategory, filterMode, downloadedIds, savedIds, sortBy]);

  useEffect(() => {
    const event = new CustomEvent('hide-mobile-nav', { detail: !!selectedBook });
    window.dispatchEvent(event);
    return () => {
      window.dispatchEvent(new CustomEvent('hide-mobile-nav', { detail: false }));
    };
  }, [selectedBook]);

  return (
    <div className="h-full bg-[#fafafa] flex overflow-hidden animate-in fade-in duration-300 font-khmer">
      
      {/* --- DESKTOP LEFT SIDEBAR --- */}
      <aside className="hidden lg:flex flex-col w-64 bg-white/50 backdrop-blur-sm border-r border-gray-100 h-full shrink-0 pt-6 overflow-y-auto">
         <div className="px-6 mb-6">
            <h2 className="text-xl font-bold font-khmer-title text-gray-900 flex items-center gap-3">
               <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                  <HugeiconsIcon icon={LibraryIcon} strokeWidth={1.5} className="w-5 h-5" />
               </div>
               បណ្ណាល័យ
            </h2>
         </div>

         {/* Main Filters - Vertical List for PC (Restored) */}
         <div className="px-4 space-y-2">
            <button 
               onClick={() => setFilterMode('browse')}
               className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group ${
                  filterMode === 'browse' 
                  ? 'bg-white shadow-lg shadow-gray-100 text-emerald-700 ring-1 ring-gray-100' 
                  : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm'
               }`}
            >
               <HugeiconsIcon icon={Book02Icon} strokeWidth={1.5} className={`w-5 h-5 transition-colors ${filterMode === 'browse' ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-600'}`} /> 
               បញ្ជីសៀវភៅ
            </button>

            <button 
               onClick={() => setFilterMode('audiobook')}
               className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group ${
                  filterMode === 'audiobook' 
                  ? 'bg-white shadow-lg shadow-gray-100 text-emerald-700 ring-1 ring-gray-100' 
                  : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm'
               }`}
            >
               <HugeiconsIcon icon={AudioBook04Icon} strokeWidth={1.5} className={`w-5 h-5 transition-colors ${filterMode === 'audiobook' ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-600'}`} /> 
               សៀវភៅសំឡេង
            </button>

            <button 
               onClick={() => setFilterMode('picturebook')}
               className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group ${
                  filterMode === 'picturebook' 
                  ? 'bg-white shadow-lg shadow-gray-100 text-emerald-700 ring-1 ring-gray-100' 
                  : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm'
               }`}
            >
               <BookImageIcon className={`w-5 h-5 transition-colors ${filterMode === 'picturebook' ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-600'}`} /> 
               សៀវភៅរូបភាព
            </button>

            <button 
               onClick={() => setFilterMode('authors')}
               className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group ${
                  filterMode === 'authors' 
                  ? 'bg-white shadow-lg shadow-gray-100 text-emerald-700 ring-1 ring-gray-100' 
                  : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm'
               }`}
            >
               <BookUserIcon className={`w-5 h-5 transition-colors ${filterMode === 'authors' ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-600'}`} /> 
               អ្នកនិពន្ធ
            </button>
            
            <button 
               onClick={() => setFilterMode('downloaded')}
               className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group ${
                  filterMode === 'downloaded' 
                  ? 'bg-white shadow-lg shadow-gray-100 text-emerald-700 ring-1 ring-gray-100' 
                  : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm'
               }`}
            >
               <HugeiconsIcon icon={BookDownloadIcon} strokeWidth={1.5} className={`w-5 h-5 transition-colors ${filterMode === 'downloaded' ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-600'}`} /> 
               បានទាញយក
               {downloadedIds.size > 0 && (
                  <span className="ml-auto bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-mono">{downloadedIds.size}</span>
               )}
            </button>
            
            <button 
               onClick={() => setFilterMode('saved')}
               className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group ${
                  filterMode === 'saved' 
                  ? 'bg-white shadow-lg shadow-gray-100 text-emerald-700 ring-1 ring-gray-100' 
                  : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm'
               }`}
            >
               <HugeiconsIcon icon={BookBookmark02Icon} strokeWidth={1.5} className={`w-5 h-5 transition-colors ${filterMode === 'saved' ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-600'}`} /> 
               បានរក្សាទុក
               {savedIds.size > 0 && (
                  <span className="ml-auto bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-mono">{savedIds.size}</span>
               )}
            </button>
         </div>

         {/* Footer Info */}
         <div className="mt-auto p-4">
            <div className="bg-emerald-50/50 rounded-xl p-2 border border-emerald-100/50 flex items-center justify-between px-3">
               <p className="text-[10px] text-emerald-800/60 font-bold uppercase tracking-wider">Total Books</p>
               <p className="text-sm font-bold text-emerald-700">{allBooks.length}</p>
            </div>
         </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
         
         {/* Top Bar (Search) - Floating Style */}
         <div className="px-6 py-2 shrink-0 z-20">
            <div className="flex items-center gap-2 bg-white py-1.5 px-2 rounded-full shadow-sm border border-gray-100 max-w-3xl relative">
               <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-full transition-colors border border-gray-100 shadow-sm mr-1"
               >
                  <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.5} className="w-5 h-5" />
               </button>
               <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="w-5 h-5 text-gray-400 ml-1" />
               <input 
                  type="text" 
                  placeholder="ស្វែងរកចំណងជើងសៀវភៅ, អ្នកនិពន្ធ..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-800 placeholder-gray-400 outline-none h-full py-1.5 min-w-0"
               />
               <div className="w-px h-6 bg-gray-200 mx-1 hidden md:block"></div>
               
               {/* Filter Button (Desktop) */}
               <div className="relative" ref={filterRef}>
                   <button 
                      onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                      className="hidden md:flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-2xl transition-colors text-sm font-bold"
                   >
                      <HugeiconsIcon icon={FilterIcon} strokeWidth={1.5} className="w-4 h-4" />
                      <span>តម្រៀប</span>
                   </button>
                   
                   {/* Filter Button (Mobile) */}
                   <button 
                      onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                      className="md:hidden p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200"
                   >
                      <HugeiconsIcon icon={FilterIcon} strokeWidth={1.5} className="w-5 h-5" />
                   </button>

                   {/* Dropdown Menu */}
                   {isFilterMenuOpen && (
                        <div className="absolute right-0 top-full mt-3 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-[999] overflow-hidden animate-in fade-in zoom-in-95 p-1 origin-top-right">
                            <div className="py-1">
                                <button 
                                    onClick={() => { setSortBy('newest'); setIsFilterMenuOpen(false); }} 
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${sortBy === 'newest' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    ថ្មីបំផុត
                                    {sortBy === 'newest' && <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="w-4 h-4" />}
                                </button>
                                <button 
                                    onClick={() => { setSortBy('popular'); setIsFilterMenuOpen(false); }} 
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${sortBy === 'popular' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    ពេញនិយម
                                    {sortBy === 'popular' && <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="w-4 h-4" />}
                                </button>
                                <button 
                                    onClick={() => { setSortBy('likes'); setIsFilterMenuOpen(false); }} 
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${sortBy === 'likes' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    ចូលចិត្តច្រើន
                                    {sortBy === 'likes' && <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                   )}
               </div>
            </div>
         </div>

         {/* Scrollable Content Area - no-scrollbar class added here */}
         <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar scroll-smooth">
            <div className="w-full pb-8">
               
               {/* 1. Categories (Segmented Control Style) */}
               {filterMode === 'browse' && (
                   <div className="mb-8 animate-in slide-in-from-top-4 duration-500">
                      <div className="bg-gray-100 p-1 rounded-xl flex gap-1 overflow-x-auto no-scrollbar">
                         {LIBRARY_CATEGORIES.map(cat => (
                            <button
                               key={cat.id}
                               onClick={() => setActiveCategory(cat.id)}
                               className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 ${
                                  activeCategory === cat.id 
                                     ? 'bg-white text-emerald-700 shadow-sm' 
                                     : 'text-gray-500 hover:text-gray-700'
                               }`}
                            >
                               {cat.label}
                            </button>
                         ))}
                      </div>
                   </div>
               )}

               {/* Section Title */}
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 font-khmer flex items-center gap-2">
                     <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                     {filterMode === 'authors' ? 'អ្នកនិពន្ធ' : filterMode === 'downloaded' ? 'សៀវភៅបានទាញយក' : filterMode === 'saved' ? 'សៀវភៅបានរក្សាទុក' : filterMode === 'audiobook' ? 'សៀវភៅសំឡេង' : filterMode === 'picturebook' ? 'សៀវភៅរូបភាព' : 'បញ្ជីសៀវភៅ'}
                  </h2>
               </div>

               {/* Empty State */}
               {filterMode !== 'authors' && filteredBooks.length === 0 && (
                   <div className="text-center py-24">
                       <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className="w-8 h-8 text-gray-300" />
                       </div>
                       <p className="font-bold text-gray-500 text-lg">មិនមានសៀវភៅទេ</p>
                       <p className="text-sm text-gray-400 mt-1">សូមព្យាយាមស្វែងរកពាក្យគន្លឹះផ្សេង។</p>
                   </div>
               )}

               {/* Books Grid - Responsive Columns */}
               {filterMode !== 'authors' && (
               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                   {filteredBooks.map((book, idx) => {
                       const isDownloaded = downloadedIds.has(book.id);
                       const isSaved = savedIds.has(book.id);

                       return (
                       <div 
                          key={book.id}
                          onClick={() => setSelectedBook(book)}
                          className="bg-white rounded-3xl p-3.5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group flex flex-col h-full border border-gray-100/80"
                          style={{ animationDelay: `${idx * 50}ms` }}
                       >
                          {/* Cover Image */}
                          <div className="aspect-[3/4] rounded-2xl bg-gray-50 overflow-hidden relative mb-4 shadow-sm border border-gray-100/50">
                              <img referrerPolicy="no-referrer" src={book.coverUrl} alt={book.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                              
                              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-white shadow-sm backdrop-blur-md ${book.type === 'PDF' ? 'bg-red-500/90' : 'bg-blue-500/90'}`}>
                                   {book.type}
                                </div>
                              </div>

                              {/* Overlay Actions */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-3">
                                  <button 
                                      onClick={(e) => { e.stopPropagation(); handleToggleDownload(e, book); }}
                                      className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-emerald-600 hover:scale-110 transition-all shadow-lg"
                                      title="Download"
                                  >
                                      {isDownloaded ? <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="w-5 h-5 text-emerald-600" /> : <HugeiconsIcon icon={Download01Icon} strokeWidth={1.5} className="w-5 h-5" />}
                                  </button>
                                  <button 
                                      onClick={(e) => { e.stopPropagation(); handleToggleSave(e, book.id); }}
                                      className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-amber-500 hover:scale-110 transition-all shadow-lg"
                                      title="Save"
                                  >
                                      <HugeiconsIcon icon={Bookmark01Icon} strokeWidth={1.5} className={`w-5 h-5 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
                                  </button>
                              </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 flex flex-col px-1">
                              <h3 className="font-bold text-gray-900 font-khmer line-clamp-2 leading-snug mb-1.5 group-hover:text-emerald-600 transition-colors">
                                  {book.title}
                              </h3>
                              <p className="text-xs text-gray-500 line-clamp-1 mb-4 font-medium">{book.author}</p>

                              <div className="mt-auto pt-3 border-t border-gray-100/80 flex items-center justify-between">
                                  <div 
                                      onClick={(e) => { e.stopPropagation(); handleOpenAuthor(e, book.uploader); }}
                                      className="flex items-center gap-2 group/author"
                                  >
                                      <img referrerPolicy="no-referrer" src={book.uploader.avatar} className="w-6 h-6 rounded-full object-cover ring-2 ring-transparent group-hover/author:ring-emerald-100 transition-all" alt="upl" />
                                      <span className="text-[10px] font-bold text-gray-500 truncate max-w-[80px] group-hover/author:text-emerald-600 transition-colors">{book.uploader.name}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 bg-gray-50/80 px-2.5 py-1.5 rounded-lg border border-gray-100/50">
                                      <HugeiconsIcon icon={Download01Icon} strokeWidth={1.5} className="w-3.5 h-3.5" /> {book.views}
                                  </div>
                              </div>
                          </div>
                       </div>
                   )})}
               </div>
               )}

               {/* 2. Authors Section */}
               {(filterMode === 'authors') && (
                   <div className="mt-0">
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                         {distinctAuthors.map(author => (
                            <div 
                               key={author.id}
                               onClick={(e) => handleOpenAuthor(e, author)}
                               className="bg-white p-4 rounded-3xl border border-gray-100/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center text-center group relative overflow-hidden"
                            >
                               <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                               
                               <div className="relative mb-3">
                                   <div className="w-16 h-16 rounded-full p-1 bg-white shadow-sm ring-2 ring-transparent group-hover:ring-emerald-100 transition-all duration-300">
                                       <img referrerPolicy="no-referrer" src={author.avatar} alt={author.name} className="w-full h-full rounded-full object-cover" />
                                   </div>
                                   {author.isVerified && <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm"><HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="w-3 h-3" /></div>}
                               </div>
                               
                               <div className="relative z-10 w-full">
                                   <h4 className="font-bold text-gray-900 text-sm truncate w-full group-hover:text-emerald-600 transition-colors">{author.name}</h4>
                                   <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wide font-medium">{author.role}</p>
                                   <div className="mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                       <span className="text-[10px] bg-emerald-50 border border-emerald-100/50 px-3 py-1.5 rounded-full font-bold text-emerald-700 shadow-sm inline-block">View Profile</span>
                                   </div>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
               )}

            </div>
         </div>

         {/* Reader View Overlay */}
         {selectedBook && (
             <BookReader 
               book={selectedBook} 
               onBack={() => setSelectedBook(null)}
               onViewProfile={(uploader) => setSelectedAuthor(uploader)} 
               className={`fixed md:absolute inset-0 z-[1000] md:z-[100] bg-white flex flex-col animate-in slide-in-from-bottom duration-300 overflow-hidden`}
             />
         )}
         {/* Author Profile Overlay */}
         {selectedAuthor && (
             <AuthorProfileView 
               author={selectedAuthor} 
               onBack={() => setSelectedAuthor(null)}
               onSelectBook={(book) => {
                   setSelectedAuthor(null);
                   setSelectedBook(book);
               }}
               className="absolute inset-0 z-[100] bg-gray-50 flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto"
             />
         )}
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[9999] lg:hidden">
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
                onClick={() => setIsMobileMenuOpen(false)}
             />
             <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute left-0 md:left-20 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col pt-6"
             >
                <div className="px-6 mb-6 flex items-center justify-between">
                   <h2 className="text-xl font-bold font-khmer-title text-gray-900 flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                         <HugeiconsIcon icon={LibraryIcon} strokeWidth={1.5} className="w-5 h-5" />
                      </div>
                      បណ្ណាល័យ
                   </h2>
                   <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-gray-100 rounded-full">
                      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-6 h-6 text-gray-400" />
                   </button>
                </div>

                <div className="px-4 space-y-2 flex-1 overflow-y-auto">
                   <button 
                      onClick={() => { setFilterMode('browse'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group ${
                         filterMode === 'browse' 
                         ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' 
                         : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                   >
                      <HugeiconsIcon icon={Book02Icon} strokeWidth={1.5} className={`w-5 h-5 transition-colors ${filterMode === 'browse' ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-600'}`} /> 
                      បញ្ជីសៀវភៅ
                   </button>

                   <button 
                      onClick={() => { setFilterMode('audiobook'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group ${
                         filterMode === 'audiobook' 
                         ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' 
                         : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                   >
                      <HugeiconsIcon icon={AudioBook04Icon} strokeWidth={1.5} className={`w-5 h-5 transition-colors ${filterMode === 'audiobook' ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-600'}`} /> 
                      សៀវភៅសំឡេង
                   </button>

                   <button 
                      onClick={() => { setFilterMode('picturebook'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group ${
                         filterMode === 'picturebook' 
                         ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' 
                         : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                   >
                      <BookImageIcon className={`w-5 h-5 transition-colors ${filterMode === 'picturebook' ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-600'}`} /> 
                      សៀវភៅរូបភាព
                   </button>

                   <button 
                      onClick={() => { setFilterMode('authors'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group ${
                         filterMode === 'authors' 
                         ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' 
                         : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                   >
                      <BookUserIcon className={`w-5 h-5 transition-colors ${filterMode === 'authors' ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-600'}`} /> 
                      អ្នកនិពន្ធ
                   </button>
                   
                   <button 
                      onClick={() => { setFilterMode('downloaded'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group ${
                         filterMode === 'downloaded' 
                         ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' 
                         : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                   >
                      <HugeiconsIcon icon={BookDownloadIcon} strokeWidth={1.5} className={`w-5 h-5 transition-colors ${filterMode === 'downloaded' ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-600'}`} /> 
                      បានទាញយក
                      {downloadedIds.size > 0 && (
                         <span className="ml-auto bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-mono">{downloadedIds.size}</span>
                      )}
                   </button>
                   
                   <button 
                      onClick={() => { setFilterMode('saved'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group ${
                         filterMode === 'saved' 
                         ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' 
                         : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                   >
                      <HugeiconsIcon icon={BookBookmark02Icon} strokeWidth={1.5} className={`w-5 h-5 transition-colors ${filterMode === 'saved' ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-600'}`} /> 
                      បានរក្សាទុក
                      {savedIds.size > 0 && (
                         <span className="ml-auto bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-mono">{savedIds.size}</span>
                      )}
                   </button>
                </div>

                <div className="p-4 text-center mt-auto">
                   <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/50">
                      <p className="text-[10px] text-emerald-800/60 font-medium mb-0.5">សៀវភៅសរុប</p>
                      <p className="text-xl font-bold text-emerald-700">{allBooks.length}</p>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
