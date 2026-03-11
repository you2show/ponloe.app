import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, Share01Icon, MoreHorizontalIcon, ListViewIcon, Cancel01Icon, Clock01Icon } from '@hugeicons/core-free-icons';

import React, { useEffect, useState, useRef } from 'react';

import { Post } from '../shared';

interface ArticleReaderProps {
  post: Post;
  onClose: () => void;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export const ArticleReader: React.FC<ArticleReaderProps> = ({ post, onClose }) => {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Generate TOC and add IDs to headings
  useEffect(() => {
    if (contentRef.current) {
      const headings = contentRef.current.querySelectorAll('h1, h2, h3');
      const items: TocItem[] = [];

      headings.forEach((heading, index) => {
        const id = `heading-${index}`;
        heading.id = id;
        items.push({
          id,
          text: heading.textContent || '',
          level: parseInt(heading.tagName.substring(1))
        });
      });

      setToc(items);
    }
  }, [post.content]);

  // Scroll Spy for TOC
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const headings = contentRef.current.querySelectorAll('h1, h2, h3');
      let currentId = '';

      headings.forEach((heading) => {
        const top = heading.getBoundingClientRect().top;
        if (top < 150) {
          currentId = heading.id;
        }
      });

      if (currentId) setActiveId(currentId);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Offset for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveId(id);
      setIsMobileTocOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 md:left-20 z-[100] bg-white flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-y-auto">
      
      {/* 1. Header (Sticky) */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
                <img src={post.user.avatar || undefined} className="w-8 h-8 rounded-full border border-gray-200" alt={post.user.name} referrerPolicy="no-referrer" />
                <div className="hidden sm:block">
                    <p className="text-sm font-bold text-gray-900">{post.user.name}</p>
                    <p className="text-[10px] text-gray-500">{post.timestamp} • 5 min read</p>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => setIsMobileTocOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <HugeiconsIcon icon={ListViewIcon} strokeWidth={1.5} className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <HugeiconsIcon icon={Share01Icon} strokeWidth={1.5} className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.5} className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row relative">
          
          {/* 2. Main Content (Left) */}
          <div className="flex-1 px-6 py-8 lg:pr-12">
              {/* Article Header */}
              <div className="mb-8 border-b border-gray-100 pb-6">
                  <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-3">
                      <HugeiconsIcon icon={Clock01Icon} strokeWidth={1.5} className="w-3 h-3" />
                      <span>Article View</span>
                  </div>
                  {/* Extract H1 from content if possible, or use a placeholder if not present in content. 
                      Ideally content has title. If not, we rely on post content structure. */}
              </div>

              {/* Render HTML Content */}
              <div 
                ref={contentRef}
                className="prose prose-emerald prose-lg max-w-none font-khmer text-gray-800 leading-loose"
                dangerouslySetInnerHTML={{ __html: post.content }} 
              />
              
              {/* Article Footer */}
              <div className="mt-12 pt-8 border-t border-gray-100 text-center text-gray-500 text-sm">
                  <p>អរគុណសម្រាប់ការអាន។</p>
              </div>
          </div>

          {/* 3. Table of Contents (Right Sidebar - Sticky on Desktop) */}
          <div className="hidden lg:block w-80 shrink-0 border-l border-gray-100 bg-gray-50/50">
              <div className="sticky top-20 p-6 max-h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
                  <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">មាតិកា (Table of Contents)</h4>
                  <nav className="space-y-1">
                      {toc.length === 0 ? (
                          <p className="text-sm text-gray-400 italic">No headings found.</p>
                      ) : (
                          toc.map((item) => (
                              <button
                                  key={item.id}
                                  onClick={() => scrollToHeading(item.id)}
                                  className={`
                                      block w-full text-left text-sm py-1.5 transition-all
                                      ${item.level === 1 ? 'font-bold' : item.level === 2 ? 'pl-4' : 'pl-8 text-xs'}
                                      ${activeId === item.id ? 'text-emerald-600 border-l-2 border-emerald-500 pl-3' : 'text-gray-600 hover:text-gray-900 border-l-2 border-transparent'}
                                  `}
                              >
                                  {item.text}
                              </button>
                          ))
                      )}
                  </nav>
              </div>
          </div>

      </div>

      {/* Mobile TOC Drawer */}
      {isMobileTocOpen && (
          <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileTocOpen(false)}>
              <div className="absolute right-0 top-0 bottom-0 w-3/4 max-w-sm bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col" onClick={e => e.stopPropagation()}>
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-gray-900">មាតិកា</h3>
                      <button onClick={() => setIsMobileTocOpen(false)} className="p-1 hover:bg-gray-100 rounded-full"><HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5"/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                      {toc.map((item) => (
                          <button
                              key={item.id}
                              onClick={() => scrollToHeading(item.id)}
                              className={`
                                  block w-full text-left py-3 border-b border-gray-50
                                  ${item.level === 1 ? 'font-bold text-base' : item.level === 2 ? 'pl-4 text-sm' : 'pl-8 text-sm text-gray-500'}
                                  ${activeId === item.id ? 'text-emerald-600' : 'text-gray-700'}
                              `}
                          >
                              {item.text}
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}

      <style>{`
        .prose h1 { font-size: 2.25em; font-weight: 800; margin-top: 0; margin-bottom: 0.8em; line-height: 1.2; color: #111827; }
        .prose h2 { font-size: 1.75em; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.6em; color: #1f2937; border-bottom: 2px solid #f3f4f6; padding-bottom: 0.3em; }
        .prose h3 { font-size: 1.35em; font-weight: 600; margin-top: 1.3em; margin-bottom: 0.5em; color: #374151; }
        .prose p { margin-bottom: 1.2em; }
        .prose ul { list-style-type: disc; padding-left: 1.5rem; }
        .prose ol { list-style-type: decimal; padding-left: 1.5rem; }
        .prose blockquote { border-left: 4px solid #10b981; padding-left: 1rem; font-style: italic; color: #4b5563; background: #f0fdf4; padding: 1rem; border-radius: 0 8px 8px 0; margin: 1.5em 0; }
        .prose img { border-radius: 0.75rem; margin: 1.5em 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
      `}</style>
    </div>
  );
};
