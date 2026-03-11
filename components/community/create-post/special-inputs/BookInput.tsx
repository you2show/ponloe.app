import React, { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { LibraryIcon, Add01Icon, Link01Icon, File01Icon, Delete02Icon, TextIcon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { SpecialInputProps } from './types';
import { useTheme } from '@/contexts/ThemeContext';

const PREDEFINED_CATEGORIES = [
  'Aqidah (ជំនឿ)',
  'Fiqh (ច្បាប់ឥស្លាម)',
  'Seerah (ប្រវត្តិសាស្ត្រ)',
  'Quran (គម្ពីរគួរអាន)',
  'Hadith (ហាដីស)',
  'Self Development (អភិវឌ្ឍខ្លួន)',
  'Novel (ប្រលោមលោក)',
  'General (ទូទៅ)'
];

export const BookInput: React.FC<SpecialInputProps & { onSave?: (data: any) => void }> = ({ onCancel, onSave }) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pages, setPages] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [category, setCategory] = useState(PREDEFINED_CATEGORIES[7]); // Default to General
  const [customCategory, setCustomCategory] = useState('');
  
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfLink, setPdfLink] = useState('');
  const [textContent, setTextContent] = useState<{title: string, content: string}[]>([{title: '', content: ''}]);
  
  const [inputType, setInputType] = useState<'file' | 'link' | 'text'>('file');

  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCover(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setPdfFile(file);
      } else {
        alert('Please upload a valid PDF file.');
      }
    }
  };

  const handleAddPage = () => {
    setTextContent([...textContent, { title: '', content: '' }]);
  };

  const handleRemovePage = (index: number) => {
    const newContent = [...textContent];
    newContent.splice(index, 1);
    setTextContent(newContent);
  };

  const handlePageChange = (index: number, field: 'title' | 'content', value: string) => {
    const newContent = [...textContent];
    newContent[index][field] = value;
    setTextContent(newContent);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        title,
        author,
        pages,
        publishedDate,
        category: category === 'Other' ? customCategory : category,
        cover,
        coverPreview,
        pdfFile: inputType === 'file' ? pdfFile : null,
        pdfLink: inputType === 'link' ? pdfLink : null,
        textContent: inputType === 'text' ? textContent : null,
        inputType // Save this to know how to render it later if needed
      });
    }
  };

  // Auto-save whenever data changes
  useEffect(() => {
      handleSave();
  }, [title, author, pages, publishedDate, category, customCategory, cover, pdfFile, pdfLink, textContent, inputType]);

  return (
    <div className={`p-4 rounded-xl border mb-4 animate-in fade-in zoom-in-95 space-y-4 ${theme === 'dark' ? 'bg-cyan-900/20 border-cyan-800/50' : 'bg-cyan-50 border-cyan-100'}`}>
        <div className="flex justify-between items-center">
          <h4 className={`font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-cyan-100' : 'text-gray-700'}`}>
            <HugeiconsIcon icon={LibraryIcon} strokeWidth={1.5} className={`w-5 h-5 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}/> ណែនាំសៀវភៅ
          </h4>
          <button onClick={onCancel} className={`text-xs hover:text-red-500 ${theme === 'dark' ? 'text-slate-400 hover:text-red-400' : 'text-gray-500'}`}>លុបចោល</button>
        </div>
        
        <div className="flex gap-4 flex-col md:flex-row">
           {/* Cover Upload */}
           <div className="flex justify-center md:justify-start">
             <div 
               onClick={() => coverInputRef.current?.click()}
               className={`w-24 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors shrink-0 overflow-hidden relative ${theme === 'dark' ? 'bg-slate-800/50 border-cyan-700/50 text-cyan-500 hover:bg-slate-800' : 'bg-white border-cyan-200 text-cyan-400 hover:bg-cyan-50'}`}
             >
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold text-center px-1">រូបភាព</span>
                  </>
                )}
                <input 
                  type="file" 
                  ref={coverInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleCoverChange} 
                />
             </div>
           </div>
           
           <div className="flex-1 space-y-3">
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ចំណងជើងសៀវភៅ" 
                className={`w-full p-2.5 rounded-lg border outline-none text-sm ${theme === 'dark' ? 'bg-slate-800 border-cyan-800/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50' : 'bg-white border-cyan-200 focus:ring-2 focus:ring-cyan-500'}`} 
              />
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="អ្នកនិពន្ធ" 
                  className={`w-full p-2.5 rounded-lg border outline-none text-sm ${theme === 'dark' ? 'bg-slate-800 border-cyan-800/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50' : 'bg-white border-cyan-200 focus:ring-2 focus:ring-cyan-500'}`} 
                />
                <input 
                  type="text" 
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  placeholder="ចំនួនទំព័រ" 
                  className={`w-full p-2.5 rounded-lg border outline-none text-sm ${theme === 'dark' ? 'bg-slate-800 border-cyan-800/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50' : 'bg-white border-cyan-200 focus:ring-2 focus:ring-cyan-500'}`} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                 <input 
                  type="text" 
                  value={publishedDate}
                  onChange={(e) => setPublishedDate(e.target.value)}
                  placeholder="ឆ្នាំចេញផ្សាយ (Optional)" 
                  className={`w-full p-2.5 rounded-lg border outline-none text-sm ${theme === 'dark' ? 'bg-slate-800 border-cyan-800/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50' : 'bg-white border-cyan-200 focus:ring-2 focus:ring-cyan-500'}`} 
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border outline-none text-sm ${theme === 'dark' ? 'bg-slate-800 border-cyan-800/50 text-white focus:ring-2 focus:ring-cyan-500/50' : 'bg-white border-cyan-200 focus:ring-2 focus:ring-cyan-500'}`}
                >
                  {PREDEFINED_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="Other">ផ្សេងៗ (Other)</option>
                </select>
              </div>

              {category === 'Other' && (
                <input 
                  type="text" 
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="បញ្ជាក់ប្រភេទសៀវភៅ" 
                  className={`w-full p-2.5 rounded-lg border outline-none text-sm ${theme === 'dark' ? 'bg-slate-800 border-cyan-800/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50' : 'bg-white border-cyan-200 focus:ring-2 focus:ring-cyan-500'}`} 
                />
              )}
              
              {/* Content Input Section */}
              <div className={`p-3 rounded-lg border space-y-2 ${theme === 'dark' ? 'bg-slate-800/50 border-cyan-800/50' : 'bg-white border-cyan-200'}`}>
                  <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
                      <button 
                        onClick={() => setInputType('file')}
                        className={`flex-1 text-xs py-1.5 px-2 rounded-md font-medium transition-colors whitespace-nowrap ${inputType === 'file' ? (theme === 'dark' ? 'bg-cyan-900/40 text-cyan-300' : 'bg-cyan-100 text-cyan-700') : (theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-50')}`}
                      >
                        Upload PDF
                      </button>
                      <button 
                        onClick={() => setInputType('link')}
                        className={`flex-1 text-xs py-1.5 px-2 rounded-md font-medium transition-colors whitespace-nowrap ${inputType === 'link' ? (theme === 'dark' ? 'bg-cyan-900/40 text-cyan-300' : 'bg-cyan-100 text-cyan-700') : (theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-50')}`}
                      >
                        PDF Link
                      </button>
                      <button 
                        onClick={() => setInputType('text')}
                        className={`flex-1 text-xs py-1.5 px-2 rounded-md font-medium transition-colors whitespace-nowrap ${inputType === 'text' ? (theme === 'dark' ? 'bg-cyan-900/40 text-cyan-300' : 'bg-cyan-100 text-cyan-700') : (theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-50')}`}
                      >
                        អត្ថបទ (Text)
                      </button>
                  </div>

                  {inputType === 'file' && (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => pdfInputRef.current?.click()}
                            className={`flex-1 border border-dashed rounded-lg p-2 text-xs flex items-center justify-center gap-2 ${theme === 'dark' ? 'border-cyan-700/50 text-cyan-400 hover:bg-cyan-900/20' : 'border-cyan-300 text-cyan-600 hover:bg-cyan-50'}`}
                        >
                            <HugeiconsIcon icon={File01Icon} strokeWidth={1.5} className="w-4 h-4" />
                            {pdfFile ? pdfFile.name : 'ជ្រើសរើសឯកសារ PDF'}
                        </button>
                        {pdfFile && (
                            <button onClick={() => setPdfFile(null)} className={`p-1 rounded ${theme === 'dark' ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50'}`}>
                                <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.5} className="w-4 h-4" />
                            </button>
                        )}
                        <input 
                            type="file" 
                            ref={pdfInputRef} 
                            className="hidden" 
                            accept="application/pdf" 
                            onChange={handlePdfChange} 
                        />
                    </div>
                  )}

                  {inputType === 'link' && (
                    <div className={`flex items-center gap-2 rounded-lg px-2 border focus-within:ring-1 ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700 focus-within:ring-cyan-500/50' : 'bg-gray-50 border-gray-200 focus-within:ring-cyan-500'}`}>
                        <HugeiconsIcon icon={Link01Icon} strokeWidth={1.5} className={`w-4 h-4 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
                        <input 
                            type="url" 
                            value={pdfLink}
                            onChange={(e) => setPdfLink(e.target.value)}
                            placeholder="https://example.com/book.pdf" 
                            className={`flex-1 bg-transparent py-2 text-sm outline-none ${theme === 'dark' ? 'text-slate-300 placeholder-slate-500' : 'text-gray-600 placeholder-gray-400'}`} 
                        />
                    </div>
                  )}

                  {inputType === 'text' && (
                    <div className="space-y-3">
                      {textContent.map((page, index) => (
                        <div key={index} className={`border rounded-lg p-3 relative ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'}`}>
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>ទំព័រទី {index + 1}</span>
                            {textContent.length > 1 && (
                              <button onClick={() => handleRemovePage(index)} className={`hover:text-red-700 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>
                                <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.5} className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <input 
                            type="text" 
                            value={page.title}
                            onChange={(e) => handlePageChange(index, 'title', e.target.value)}
                            placeholder="ចំណងជើងទំព័រ (Optional)" 
                            className={`w-full p-2 mb-2 rounded border text-sm ${theme === 'dark' ? 'border-slate-700 bg-slate-900/50 text-white placeholder-slate-500' : 'border-gray-200 bg-white'}`}
                          />
                          <textarea 
                            value={page.content}
                            onChange={(e) => handlePageChange(index, 'content', e.target.value)}
                            placeholder="ខ្លឹមសារអត្ថបទ..." 
                            className={`w-full p-2 rounded border text-sm h-32 ${theme === 'dark' ? 'border-slate-700 bg-slate-900/50 text-white placeholder-slate-500' : 'border-gray-200 bg-white'}`}
                          />
                        </div>
                      ))}
                      <button 
                        onClick={handleAddPage}
                        className={`w-full py-2 border border-dashed rounded-lg text-sm flex items-center justify-center gap-2 ${theme === 'dark' ? 'border-cyan-700/50 text-cyan-400 hover:bg-cyan-900/20' : 'border-cyan-300 text-cyan-600 hover:bg-cyan-50'}`}
                      >
                        <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} className="w-4 h-4" />
                        បន្ថែមទំព័រ
                      </button>
                    </div>
                  )}
              </div>
           </div>
        </div>
    </div>
  );
};

