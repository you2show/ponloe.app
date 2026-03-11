import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon, TextAlignCenterIcon, TextAlignLeftIcon, TextAlignRightIcon, BookOpen01Icon, Cancel01Icon, CleanIcon, Delete02Icon, Link01Icon, LeftToRightListBulletIcon, LeftToRightListNumberIcon, Loading02Icon, QuoteUpIcon, ArrowTurnBackwardIcon, TextFontIcon, Tick01Icon, Heading01Icon, Heading02Icon, Heading03Icon, TextBoldIcon, TextItalicIcon, TextUnderlineIcon } from '@hugeicons/core-free-icons';


import React, { useRef, useState, useEffect } from 'react';

import { QuranInput } from './special-inputs';
import { generateArticleContent } from '@/services/geminiService';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';

interface RichTextEditorProps {
  onSave: (htmlContent: string) => void;
  onCancel: () => void;
  initialContent?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ onSave, onCancel, initialContent = '' }) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(initialContent);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  
  // Track changes
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardAlert, setShowDiscardAlert] = useState(false);
  const [showQuranModal, setShowQuranModal] = useState(false);
  
  // AI States
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Editor States for Toolbar Icons
  const [currentBlock, setCurrentBlock] = useState<'p' | 'h1' | 'h2' | 'h3'>('p');
  const [currentAlign, setCurrentAlign] = useState<'left' | 'center' | 'right'>('left');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // Initialize content ONLY ONCE on mount
  useEffect(() => {
    if (editorRef.current) {
        editorRef.current.innerHTML = initialContent;
    }
  }, []);

  // Update internal state when content changes
  const handleInput = () => {
    if (editorRef.current) {
      const currentHtml = editorRef.current.innerHTML;
      setHtml(currentHtml);
      
      // Mark as dirty if content is different from initial or not empty
      if (!isDirty && currentHtml !== initialContent) {
          setIsDirty(true);
      }
      checkActiveFormats();
    }
  };

  // Check cursor position to update toolbar icons
  const checkActiveFormats = () => {
      // Note: queryCommandState/Value is legacy but widely supported for this simple use case
      setIsBold(document.queryCommandState('bold'));
      setIsItalic(document.queryCommandState('italic'));
      setIsUnderline(document.queryCommandState('underline'));

      // Check Alignment
      if (document.queryCommandState('justifyCenter')) setCurrentAlign('center');
      else if (document.queryCommandState('justifyRight')) setCurrentAlign('right');
      else setCurrentAlign('left');

      // Check Block Type
      const block = document.queryCommandValue('formatBlock');
      if (block === 'h1') setCurrentBlock('h1');
      else if (block === 'h2') setCurrentBlock('h2');
      else if (block === 'h3') setCurrentBlock('h3');
      else setCurrentBlock('p');
  };

  const handleAttemptClose = () => {
      if (isDirty && html.trim().length > 0 && html !== '<br>') {
          setShowDiscardAlert(true);
      } else {
          onCancel();
      }
  };

  const confirmDiscard = () => {
      setShowDiscardAlert(false);
      onCancel();
  };

  const exec = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
        editorRef.current.focus();
    }
    checkActiveFormats();
  };

  const addLink = () => {
    if (linkUrl) {
      exec('createLink', linkUrl);
      setShowLinkInput(false);
      setLinkUrl('');
    }
  };

  // --- CYCLING LOGIC ---

  const cycleHeading = () => {
      if (currentBlock === 'p') {
          exec('formatBlock', 'H1');
          setCurrentBlock('h1');
      } else if (currentBlock === 'h1') {
          exec('formatBlock', 'H2');
          setCurrentBlock('h2');
      } else if (currentBlock === 'h2') {
          exec('formatBlock', 'H3');
          setCurrentBlock('h3');
      } else {
          exec('formatBlock', 'P');
          setCurrentBlock('p');
      }
  };

  const cycleAlign = () => {
      if (currentAlign === 'left') {
          exec('justifyCenter');
          setCurrentAlign('center');
      } else if (currentAlign === 'center') {
          exec('justifyRight');
          setCurrentAlign('right');
      } else {
          exec('justifyLeft');
          setCurrentAlign('left');
      }
  };

  // Function to insert Quran Quote HTML
  const insertQuranQuote = (data: any) => {
      if (!data) return;
      const { surahName, ayahNumber, arabicText, translation } = data;
      
      const quranHtml = `
        <blockquote class="quran-quote" style="border-left: 4px solid #10b981; padding-left: 1rem; margin: 1.5rem 0; background: ${theme === 'dark' ? '#064e3b20' : '#f0fdf4'}; border-radius: 0.5rem; padding: 1rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <p style="font-family: 'Amiri', serif; font-size: 1.5rem; text-align: right; margin-bottom: 0.75rem; color: ${theme === 'dark' ? '#34d399' : '#064e3b'}; line-height: 2.2;" dir="rtl">${arabicText}</p>
            <p style="font-size: 1rem; color: ${theme === 'dark' ? '#d1d5db' : '#374151'}; font-family: 'Google Sans', sans-serif; margin-bottom: 0.5rem; line-height: 1.6;">${translation}</p>
            <footer style="font-size: 0.85rem; color: ${theme === 'dark' ? '#10b981' : '#059669'}; font-weight: bold; margin-top: 0.75rem; display: flex; align-items: center; gap: 0.25rem;">
                <span style="display:inline-block; width:6px; height:6px; background:${theme === 'dark' ? '#10b981' : '#059669'}; border-radius:50%;"></span>
                ${surahName} : ${ayahNumber}
            </footer>
        </blockquote>
        <p><br/></p>
      `;

      if (editorRef.current) {
          editorRef.current.focus();
          document.execCommand('insertHTML', false, quranHtml);
          handleInput(); 
      }
      
      setShowQuranModal(false);
  };

  const handleGenerateAi = async () => {
      if (!aiPrompt.trim()) return;
      setIsAiGenerating(true);
      const content = await generateArticleContent(aiPrompt);
      if (content && editorRef.current) {
          editorRef.current.focus();
          document.execCommand('insertHTML', false, content + "<p><br/></p>");
          handleInput();
          setShowAiModal(false);
          setAiPrompt('');
      } else {
          showToast('បរាជ័យក្នុងការបង្កើតអត្ថបទ។ សូមព្យាយាមម្តងទៀត។', 'error');
      }
      setIsAiGenerating(false);
  };

  // Helper for rendering the correct icon based on state
  const getHeadingIcon = () => {
      switch(currentBlock) {
          case 'h1': return Heading01Icon;
          case 'h2': return Heading02Icon;
          case 'h3': return Heading03Icon;
          default: return TextFontIcon;
      }
  };

  const getAlignIcon = () => {
      switch(currentAlign) {
          case 'center': return TextAlignCenterIcon;
          case 'right': return TextAlignRightIcon;
          default: return TextAlignLeftIcon;
      }
  }

  const HeadingIcon = getHeadingIcon();
  const AlignIcon = getAlignIcon();

  // Toolbar Button Component
  const ToolBtn = ({ icon: Icon, cmd, arg, active = false, onClick }: { icon: any, cmd?: string, arg?: string, active?: boolean, onClick?: () => void }) => (
    <button
      onClick={(e) => { 
          e.preventDefault(); 
          if(onClick) onClick();
          else if(cmd) exec(cmd, arg); 
      }}
      className={`p-2 rounded-lg transition-colors flex items-center justify-center h-10 w-10 shrink-0 ${active ? (theme === 'dark' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-100 text-emerald-700') : (theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900')}`}
    >
      <HugeiconsIcon icon={Icon} strokeWidth={1.5} className="w-5 h-5" />
    </button>
  );

  return (
    <div className={`flex flex-col h-full animate-in slide-in-from-bottom duration-300 relative ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
      
      {/* Header / Actions */}
      <div className={`flex justify-between items-center px-4 py-3 border-b z-20 ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-gray-100 bg-white'}`}>
        <button onClick={handleAttemptClose} className={`font-medium text-sm flex items-center gap-1 ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'}`}>
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" /> បោះបង់
        </button>
        <span className={`font-bold font-khmer flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <HugeiconsIcon icon={TextFontIcon} strokeWidth={1.5} className="w-5 h-5 text-emerald-600" />
            សរសេរអត្ថបទ
        </span>
        <button 
            onClick={() => onSave(html)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-1.5 rounded-full font-bold text-sm flex items-center gap-1 transition-colors shadow-sm shadow-emerald-200"
        >
            <HugeiconsIcon icon={Tick01Icon} strokeWidth={1.5} className="w-4 h-4" /> រក្សាទុក
        </button>
      </div>

      {/* Toolbar - Sticky - Compact Scrollable Row */}
      <div className={`px-2 py-2 border-b backdrop-blur-sm sticky top-0 z-10 flex gap-1 items-center overflow-x-auto no-scrollbar ${theme === 'dark' ? 'border-slate-800 bg-slate-900/80' : 'border-gray-100 bg-gray-50/80'}`}>
         
         {/* Heading Cycle Button */}
         <button
            onClick={cycleHeading}
            className={`flex items-center justify-center h-10 w-10 shrink-0 rounded-lg border transition-all shadow-sm ${currentBlock !== 'p' ? (theme === 'dark' ? 'bg-emerald-900/30 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-emerald-300 text-emerald-700') : (theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-gray-200 text-gray-700')}`}
         >
            <HugeiconsIcon icon={HeadingIcon} strokeWidth={1.5} className="w-5 h-5" />
         </button>
         
         <div className={`w-px h-6 mx-1 shrink-0 ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-300'}`}></div>

         <ToolBtn icon={TextBoldIcon} cmd="bold" active={isBold} />
         <ToolBtn icon={TextItalicIcon} cmd="italic" active={isItalic} />
         <ToolBtn icon={TextUnderlineIcon} cmd="underline" active={isUnderline} />

         <div className={`w-px h-6 mx-1 shrink-0 ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-300'}`}></div>

         {/* Align Cycle Button */}
         <button
            onClick={cycleAlign}
            className={`flex items-center justify-center h-10 w-10 shrink-0 rounded-lg transition-all ${currentAlign !== 'left' ? (theme === 'dark' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-100 text-emerald-700') : (theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-100')}`}
         >
            <HugeiconsIcon icon={AlignIcon} strokeWidth={1.5} className="w-5 h-5" />
         </button>

         <ToolBtn icon={LeftToRightListBulletIcon} cmd="insertUnorderedList" />
         <ToolBtn icon={LeftToRightListNumberIcon} cmd="insertOrderedList" />
         <ToolBtn icon={QuoteUpIcon} cmd="formatBlock" arg="blockquote" />

         <div className={`w-px h-6 mx-1 shrink-0 ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-300'}`}></div>

         {/* Link & Special Features */}
         <button
            onClick={() => setShowLinkInput(!showLinkInput)}
            className={`flex items-center justify-center h-10 w-10 shrink-0 rounded-lg transition-colors ${showLinkInput ? (theme === 'dark' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-100 text-emerald-700') : (theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-100')}`}
         >
            <HugeiconsIcon icon={Link01Icon} strokeWidth={1.5} className="w-5 h-5" />
         </button>
         <button
            onClick={() => setShowQuranModal(true)}
            className={`flex items-center justify-center h-10 w-10 shrink-0 rounded-lg transition-colors border ${theme === 'dark' ? 'bg-emerald-900/30 hover:bg-emerald-900/50 border-emerald-800/50 text-emerald-400' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'}`}
            title="Insert Quran Quote"
         >
            <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className="w-5 h-5" />
         </button>
         
         {/* AI Magic Button */}
         <button
            onClick={() => setShowAiModal(true)}
            className={`flex items-center justify-center h-10 w-10 shrink-0 rounded-lg transition-colors text-white bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-sm`}
            title="AI Magic Write"
         >
            <HugeiconsIcon icon={CleanIcon} strokeWidth={1.5} className="w-5 h-5 fill-white/20" />
         </button>

         <div className="flex-1"></div> {/* Spacer */}

         <ToolBtn icon={ArrowTurnBackwardIcon} cmd="undo" />
      </div>

      {/* Link Input Popup */}
      {showLinkInput && (
          <div className={`p-2 flex gap-2 border-b animate-in fade-in slide-in-from-top-2 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-100 border-gray-200'}`}>
              <input 
                type="url" 
                placeholder="https://example.com" 
                className={`flex-1 px-3 py-1.5 rounded-lg border text-sm outline-none ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500' : 'bg-white border-gray-300 focus:border-emerald-500'}`}
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                autoFocus
              />
              <button onClick={addLink} className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold">Add</button>
              <button onClick={() => setShowLinkInput(false)} className={`px-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}><HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-4 h-4"/></button>
          </div>
      )}

      {/* Editor Area */}
      <div className={`flex-1 overflow-y-auto cursor-text ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`} onClick={() => editorRef.current?.focus()}>
        <div 
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning={true}
            onInput={handleInput}
            onMouseUp={checkActiveFormats}
            onKeyUp={checkActiveFormats}
            className={`max-w-3xl mx-auto px-6 py-8 outline-none prose prose-emerald prose-lg md:prose-xl font-khmer min-h-[500px] ${theme === 'dark' ? 'prose-invert' : ''}`}
            style={{ minHeight: '60vh' }}
            data-placeholder="សរសេរអត្ថបទរបស់អ្នកនៅទីនេះ..."
        />
        
        <style>{`
            [contenteditable]:empty:before {
                content: attr(data-placeholder);
                color: #9ca3af;
                pointer-events: none;
                display: block;
            }
            /* Custom Scrollbar for editor */
            .prose h1 { color: ${theme === 'dark' ? '#f9fafb' : '#111827'}; font-weight: 800; margin-bottom: 0.5em; line-height: 1.2; }
            .prose h2 { color: ${theme === 'dark' ? '#f3f4f6' : '#374151'}; font-weight: 700; margin-top: 1.2em; margin-bottom: 0.5em; border-bottom: 2px solid ${theme === 'dark' ? '#374151' : '#f3f4f6'}; padding-bottom: 4px; }
            .prose h3 { color: ${theme === 'dark' ? '#d1d5db' : '#4b5563'}; font-weight: 600; margin-top: 1em; margin-bottom: 0.5em; }
            .prose p { margin-bottom: 1em; line-height: 1.8; color: ${theme === 'dark' ? '#d1d5db' : '#374151'}; }
            .prose blockquote { border-left: 4px solid #10b981; padding-left: 1rem; font-style: italic; color: ${theme === 'dark' ? '#9ca3af' : '#4b5563'}; background: ${theme === 'dark' ? '#064e3b20' : '#f0fdf4'}; padding: 1rem; border-radius: 0 8px 8px 0; }
            .prose ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1em; }
            .prose ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1em; }
            .prose a { color: #059669; text-decoration: underline; }
            .prose .quran-quote { border-left-color: #10b981 !important; background-color: ${theme === 'dark' ? '#064e3b20' : '#f0fdf4'} !important; }
        `}</style>
      </div>

      {/* Discard Alert Dialog */}
      {showDiscardAlert && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
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

      {/* Quran Insertion Modal */}
      {showQuranModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
              <div className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
                  <h3 className={`font-bold text-lg mb-4 text-center ${theme === 'dark' ? 'text-white' : ''}`}>បញ្ចូលអាយ៉ាត់គម្ពីរ</h3>
                  <QuranInput 
                    onCancel={() => setShowQuranModal(false)}
                    onInsert={(data) => {
                        insertQuranQuote(data);
                        setShowQuranModal(false);
                    }}
                  />
                  <div className="mt-4 text-center">
                      <button onClick={() => setShowQuranModal(false)} className={`text-sm underline ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'}`}>បិទផ្ទាំងនេះ</button>
                  </div>
              </div>
          </div>
      )}

      {/* AI Magic Write Modal */}
      {showAiModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
              <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
                  <div className="flex justify-between items-center mb-4">
                      <h3 className={`font-bold text-lg flex items-center gap-2 ${theme === 'dark' ? 'text-violet-400' : 'text-violet-700'}`}>
                          <HugeiconsIcon icon={CleanIcon} strokeWidth={1.5} className="w-5 h-5 fill-violet-200" /> AI Magic Write
                      </h3>
                      <button onClick={() => setShowAiModal(false)} className={`${theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}`}>
                          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <textarea 
                      autoFocus
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="ប្រាប់ AI នូវអ្វីដែលអ្នកចង់សរសេរ... (ឧទាហរណ៍: សរសេរអំពីអត្ថប្រយោជន៍នៃការអត់ធ្មត់)"
                      className={`w-full h-32 p-3 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-sm resize-none mb-4 font-khmer ${theme === 'dark' ? 'bg-slate-900/50 border border-violet-900/30 text-white placeholder-slate-500' : 'bg-violet-50 border border-violet-100'}`}
                  />
                  
                  <button 
                      onClick={handleGenerateAi}
                      disabled={!aiPrompt.trim() || isAiGenerating}
                      className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-200 disabled:opacity-70 transition-all hover:scale-[1.02]"
                  >
                      {isAiGenerating ? (
                          <><HugeiconsIcon icon={Loading02Icon} strokeWidth={1.5} className="w-5 h-5 animate-spin" /> កំពុងសរសេរ...</>
                      ) : (
                          <><HugeiconsIcon icon={CleanIcon} strokeWidth={1.5} className="w-5 h-5" /> បង្កើតអត្ថបទ</>
                      )}
                  </button>
              </div>
          </div>
      )}

    </div>
  );
};
