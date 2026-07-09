import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Loader2, Languages, AlertTriangle } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import type { Book } from '@/types';

// More reliable CDN for the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi (हिंदी)' },
  { code: 'ur', label: 'Urdu (اردو)' },
  { code: 'mr', label: 'Marathi (मराठी)' },
  { code: 'sa', label: 'Sanskrit (संस्कृत)' },
  { code: 'ar', label: 'Arabic (عربي)' },
];

export const BookReader = ({ book, onClose }: { book: Book, onClose: () => void }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  
  // PDF State
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isPdfLoaded, setIsPdfLoaded] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  
  // Container sizing
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageWidth, setPageWidth] = useState(400);

  // Safely extract text to prevent .join or .split crashes (The main cause of blank pages)
  const getInitialText = () => {
    try {
      if (book.digitalPages && Array.isArray(book.digitalPages)) return book.digitalPages.join('\n\n');
      if (typeof book.digitalContent === 'string' && book.digitalContent.trim() !== '') return book.digitalContent;
      if (typeof book.description === 'string' && book.description.trim() !== '') return book.description;
      return 'No digital content available for this book.';
    } catch (e) {
      return 'Error loading content.';
    }
  };

  const rawOriginalText = getInitialText();
  const [activeText, setActiveText] = useState(rawOriginalText);
  const [targetLang, setTargetLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);

  // Check if we should attempt PDF rendering
  const isPdf = Boolean(book.fileUrl && typeof book.fileUrl === 'string' && book.fileUrl.trim() !== '');
  const isRTL = targetLang === 'ur' || targetLang === 'ar';

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const marginOffset = window.innerWidth < 640 ? 32 : 80;
        setPageWidth((containerRef.current.clientWidth / 2) - marginOffset);
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize(); 
    
    // Fallback resize trigger
    const timeout = setTimeout(updateSize, 100);
    return () => {
      window.removeEventListener('resize', updateSize);
      clearTimeout(timeout);
    };
  }, [isPdfLoaded]);

  // Handle Translation
  const handleTranslate = async (langCode: string) => {
    if (isPdf) return;
    setTargetLang(langCode);
    
    if (langCode === 'en') {
      setActiveText(rawOriginalText);
      setCurrentPageIndex(0);
      return;
    }

    setIsTranslating(true);
    
    setTimeout(() => {
      const mockPrefixes: Record<string, string> = {
        hi: "[अनुवादित सामग्री]:",
        ur: "[ترجمہ شدہ مواد]:",
        mr: "[अनुवादित सामग्री]:",
        sa: "[अनुवादित सामग्री]:",
        ar: "[المحتوى المترجم]:"
      };
      
      const simulatedTranslation = `${mockPrefixes[langCode] || ''} \n\n${rawOriginalText}\n\n[System: This text was dynamically translated by the AI model. Connect your real backend to replace this simulation.]`;
      
      setActiveText(simulatedTranslation);
      setCurrentPageIndex(0);
      setIsTranslating(false);
    }, 1500);
  };

  // Safe split for text pages
  const words = (activeText || "").toString().split(/\s+/);
  const textPages: React.ReactNode[] = [];
  const wordsPerPage = 120; 
  
  if (!isPdf) {
    for (let i = 0; i < Math.max(words.length, 1); i += wordsPerPage) {
      textPages.push(<>{words.slice(i, i + wordsPerPage).join(' ')}</>);
    }
    if (textPages.length % 2 !== 0) textPages.push(<></>); 
  }

  const effectiveTotalPages = isPdf 
    ? (numPages ? numPages + (numPages % 2 !== 0 ? 1 : 0) + 2 : 999) 
    : (textPages.length + 2);

  const turnNext = () => {
    if (isFlipping || (!isPdfLoaded && isPdf && !pdfError)) return;
    if (currentPageIndex + 2 >= effectiveTotalPages) return;
    
    setFlipDirection('next');
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPageIndex(prev => prev + 2);
      setIsFlipping(false);
    }, 700);
  };

  const turnPrev = () => {
    if (currentPageIndex - 2 < 0 || isFlipping) return;
    setFlipDirection('prev');
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPageIndex(prev => prev - 2);
      setIsFlipping(false);
    }, 700);
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsPdfLoaded(true);
    setPdfError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error("PDF Load Error:", error);
    setPdfError("Failed to load PDF document. The file might be corrupted or blocked by CORS.");
    setIsPdfLoaded(false);
  }

  const renderClosingPage = (side: 'left' | 'right') => {
    if (side === 'left') {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-[#FFF8F0] border-r border-gray-300">
          <div className="w-16 h-px bg-gray-400 mb-4" />
          <p className="font-serif italic text-lg text-gray-600">End of Volume</p>
          <div className="w-16 h-px bg-gray-400 mt-4" />
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-full w-full px-6 text-center bg-[#FFF8F0]">
        <h2 className="text-4xl font-serif font-bold text-[#4B2E2B] mb-4">The End</h2>
        <p className="text-gray-600 mb-8 font-sans font-medium">We hope you enjoyed reading this book.</p>
        <button 
          onClick={onClose}
          className="px-8 py-3 bg-[#4B2E2B] hover:bg-[#2A1816] text-white font-bold rounded-xl shadow-xl transition-all font-sans flex items-center gap-2 group mx-auto"
        >
          Close Book
          <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
        </button>
      </div>
    );
  };

  const renderPage = (pageNum: number) => {
    if (pageNum === effectiveTotalPages - 1) return renderClosingPage('left');
    if (pageNum === effectiveTotalPages) return renderClosingPage('right');
    if (pageNum > effectiveTotalPages) return <div className="w-full h-full bg-[#FFF8F0]" />;

    if (isPdf) {
      if (pdfError) {
        return (
          <div className="w-full h-full bg-[#FFF8F0] flex flex-col items-center justify-center p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-red-700 font-bold mb-2">Error Loading Page</p>
            <p className="text-gray-600 text-sm">{pdfError}</p>
          </div>
        );
      }

      if (pageNum > (numPages || 0)) return <div className="w-full h-full bg-[#FFF8F0]" />;
      
      return (
        <div className="w-full h-full bg-[#FFF8F0] flex items-center justify-center overflow-hidden relative">
          <div className="bg-white shadow-md">
            <Page 
              pageNumber={pageNum} 
              width={pageWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="flex items-center justify-center"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent pointer-events-none mix-blend-multiply" />
        </div>
      );
    }

    return (
      <div className="w-full h-full p-8 sm:p-12 flex flex-col justify-between bg-[#FFF8F0]">
        {isTranslating ? (
          <div className="flex flex-1 flex-col items-center justify-center text-[#4B2E2B]/60">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="font-serif">AI Translating Context...</p>
          </div>
        ) : (
          <div 
            dir={isRTL ? 'rtl' : 'ltr'}
            className={`font-serif text-lg leading-relaxed text-gray-800 flex-1 overflow-y-auto pr-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 transition-colors ${isRTL ? 'text-right font-arabic text-2xl leading-loose' : 'text-justify'}`}
          >
            {textPages[pageNum - 1] || ''}
          </div>
        )}
        <div className="text-center text-gray-400 text-sm font-medium mt-4 shrink-0">{pageNum}</div>
      </div>
    );
  };

  const readerContent = (
    <div className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 perspective-[2500px]">
      
      {/* Header Actions */}
      <div className="fixed top-6 left-6 right-6 z-[1000000] flex items-start justify-between pointer-events-none">
        
        {/* Translator Toolbar */}
        <div className="pointer-events-auto bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-2xl flex items-center gap-3">
          <div className="bg-[#C08552] p-2 rounded-xl">
            <Languages className="w-5 h-5 text-white" />
          </div>
          {isPdf ? (
            <p className="text-white/80 text-sm px-2 pr-4 font-medium">Auto-translation unavailable for PDF scans</p>
          ) : (
            <select
              value={targetLang}
              onChange={(e) => handleTranslate(e.target.value)}
              disabled={isTranslating}
              className="bg-transparent text-white font-medium focus:outline-none border-none pr-4 cursor-pointer [&>option]:text-gray-900"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          )}
        </div>

        <button 
          onClick={onClose} 
          className="pointer-events-auto flex items-center justify-center p-3 sm:p-4 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all cursor-pointer border-2 border-white/20 group"
        >
          <X className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform" />
        </button>
      </div>
      
      <div className="text-center text-white mb-6 mt-12 sm:mt-0 z-[100000] drop-shadow-xl shrink-0">
        <h2 className="text-2xl sm:text-3xl font-bold font-serif tracking-wide">{book.title || 'Unknown Title'}</h2>
        <p className="text-[#C08552] text-sm sm:text-base mt-2 tracking-widest uppercase">{book.author || 'Unknown Author'}</p>
      </div>

      {isPdf ? (
        <Document
          file={book.fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex flex-col items-center text-white/70 mt-20">
              <Loader2 className="w-12 h-12 animate-spin mb-4 text-[#C08552]" />
              <p>Processing High-Fidelity Document...</p>
            </div>
          }
          className="w-full flex justify-center items-center flex-1 max-h-[85vh]"
        >
          {(isPdfLoaded || pdfError) && (
            <>
              {numPages === 1 && !pdfError ? (
                <div 
                  ref={containerRef}
                  className="relative flex w-full max-w-2xl h-[75vh] shadow-[0_30px_60px_rgba(0,0,0,0.6)] items-center justify-center rounded-md overflow-hidden bg-[#FFF8F0] border-[6px] border-[#3A2220] p-4 sm:p-8"
                >
                  <div className="bg-white shadow-xl h-full flex items-center justify-center w-full">
                    <Page 
                      pageNumber={1} 
                      height={window.innerHeight * 0.65} 
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </div>
                </div>
              ) : (
                <div 
                  ref={containerRef}
                  className="relative flex w-full max-w-6xl h-full shadow-2xl items-center justify-center"
                >
                  <button 
                    onClick={turnPrev} 
                    disabled={currentPageIndex === 0}
                    className="absolute -left-4 sm:-left-20 top-1/2 -translate-y-1/2 z-[1000000] p-4 bg-gray-900/90 text-white rounded-full shadow-2xl transition-all hover:bg-gray-800 disabled:opacity-0 disabled:cursor-not-allowed border border-white/10 hover:scale-110"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  
                  <button 
                    onClick={turnNext}
                    disabled={currentPageIndex + 2 >= effectiveTotalPages}
                    className="absolute -right-4 sm:-right-20 top-1/2 -translate-y-1/2 z-[1000000] p-4 bg-gray-900/90 text-white rounded-full shadow-2xl transition-all hover:bg-gray-800 disabled:opacity-0 disabled:cursor-not-allowed border border-white/10 hover:scale-110"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>

                  <div className="relative w-full h-full flex bg-[#E5D5C5] rounded-md shadow-[0_30px_60px_rgba(0,0,0,0.6)] border-[6px] border-[#3A2220] [transform-style:preserve-3d]">
                    <div className="absolute left-1/2 top-0 bottom-0 w-16 -ml-8 bg-gradient-to-r from-transparent via-black/40 to-transparent z-40 pointer-events-none shadow-inner" />

                    <div className="w-1/2 h-full bg-[#FFF8F0] border-r border-gray-400 relative overflow-hidden flex items-center justify-center">
                      {renderPage(currentPageIndex + 1)}
                    </div>

                    <div className="w-1/2 h-full bg-[#FFF8F0] border-l border-white relative overflow-hidden flex items-center justify-center">
                      {renderPage(currentPageIndex + 2)}
                    </div>

                    <AnimatePresence>
                      {isFlipping && flipDirection === 'next' && (
                        <motion.div
                          initial={{ rotateY: 0 }}
                          animate={{ rotateY: -180 }}
                          transition={{ duration: 0.7, ease: [0.645, 0.045, 0.355, 1.000] }}
                          className="absolute right-0 w-1/2 h-full origin-left z-30 pointer-events-none [transform-style:preserve-3d]"
                        >
                          <div className="absolute inset-0 bg-[#FFF8F0] [backface-visibility:hidden] shadow-[-10px_0_30px_rgba(0,0,0,0.2)] overflow-hidden border-l border-white flex items-center justify-center">
                            {renderPage(currentPageIndex + 2)}
                          </div>
                          <div 
                            className="absolute inset-0 bg-[#F0E6D8] [backface-visibility:hidden] overflow-hidden border-r border-gray-300 flex items-center justify-center" 
                            style={{ transform: 'rotateY(180deg)' }}
                          >
                            <div className="w-full h-full transform scale-x-[-1]">
                              {renderPage(currentPageIndex + 3)}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {isFlipping && flipDirection === 'prev' && (
                        <motion.div
                          initial={{ rotateY: -180 }}
                          animate={{ rotateY: 0 }}
                          transition={{ duration: 0.7, ease: [0.645, 0.045, 0.355, 1.000] }}
                          className="absolute right-0 w-1/2 h-full origin-left z-30 pointer-events-none [transform-style:preserve-3d]"
                        >
                          <div className="absolute inset-0 bg-[#FFF8F0] [backface-visibility:hidden] shadow-[-10px_0_30px_rgba(0,0,0,0.2)] overflow-hidden border-l border-white flex items-center justify-center">
                            {renderPage(currentPageIndex)}
                          </div>
                          <div 
                            className="absolute inset-0 bg-[#F0E6D8] [backface-visibility:hidden] overflow-hidden border-r border-gray-300 flex items-center justify-center" 
                            style={{ transform: 'rotateY(180deg)' }}
                          >
                            <div className="w-full h-full transform scale-x-[-1]">
                              {renderPage(currentPageIndex + 1)}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </>
          )}
        </Document>
      ) : (
        <div 
          ref={containerRef}
          className="relative flex w-full max-w-6xl flex-1 max-h-[85vh] shadow-2xl items-center justify-center"
        >
          <button 
            onClick={turnPrev} 
            disabled={currentPageIndex === 0}
            className="absolute -left-4 sm:-left-20 top-1/2 -translate-y-1/2 z-[1000000] p-4 bg-gray-900/90 text-white rounded-full shadow-2xl transition-all hover:bg-gray-800 disabled:opacity-0 disabled:cursor-not-allowed border border-white/10 hover:scale-110"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <button 
            onClick={turnNext}
            disabled={currentPageIndex + 2 >= effectiveTotalPages}
            className="absolute -right-4 sm:-right-20 top-1/2 -translate-y-1/2 z-[1000000] p-4 bg-gray-900/90 text-white rounded-full shadow-2xl transition-all hover:bg-gray-800 disabled:opacity-0 disabled:cursor-not-allowed border border-white/10 hover:scale-110"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="relative w-full h-full flex bg-[#E5D5C5] rounded-md shadow-[0_30px_60px_rgba(0,0,0,0.6)] border-[6px] border-[#3A2220] [transform-style:preserve-3d]">
            <div className="absolute left-1/2 top-0 bottom-0 w-16 -ml-8 bg-gradient-to-r from-transparent via-black/40 to-transparent z-40 pointer-events-none shadow-inner" />

            <div className="w-1/2 h-full bg-[#FFF8F0] border-r border-gray-400 relative overflow-hidden">
              {renderPage(currentPageIndex + 1)}
            </div>

            <div className="w-1/2 h-full bg-[#FFF8F0] border-l border-white relative overflow-hidden">
              {renderPage(currentPageIndex + 2)}
            </div>

            <AnimatePresence>
              {isFlipping && flipDirection === 'next' && (
                <motion.div
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: -180 }}
                  transition={{ duration: 0.7, ease: [0.645, 0.045, 0.355, 1.000] }}
                  className="absolute right-0 w-1/2 h-full origin-left z-30 pointer-events-none [transform-style:preserve-3d]"
                >
                  <div className="absolute inset-0 bg-[#FFF8F0] [backface-visibility:hidden] shadow-[-10px_0_30px_rgba(0,0,0,0.2)] overflow-hidden border-l border-white">
                    {renderPage(currentPageIndex + 2)}
                  </div>
                  <div className="absolute inset-0 bg-[#F0E6D8] [backface-visibility:hidden] overflow-hidden border-r border-gray-300" style={{ transform: 'rotateY(180deg)' }}>
                    <div className="w-full h-full transform scale-x-[-1]">
                      {renderPage(currentPageIndex + 3)}
                    </div>
                  </div>
                </motion.div>
              )}

              {isFlipping && flipDirection === 'prev' && (
                <motion.div
                  initial={{ rotateY: -180 }}
                  animate={{ rotateY: 0 }}
                  transition={{ duration: 0.7, ease: [0.645, 0.045, 0.355, 1.000] }}
                  className="absolute right-0 w-1/2 h-full origin-left z-30 pointer-events-none [transform-style:preserve-3d]"
                >
                  <div className="absolute inset-0 bg-[#FFF8F0] [backface-visibility:hidden] shadow-[-10px_0_30px_rgba(0,0,0,0.2)] overflow-hidden border-l border-white">
                    {renderPage(currentPageIndex)}
                  </div>
                  <div className="absolute inset-0 bg-[#F0E6D8] [backface-visibility:hidden] overflow-hidden border-r border-gray-300" style={{ transform: 'rotateY(180deg)' }}>
                    <div className="w-full h-full transform scale-x-[-1]">
                      {renderPage(currentPageIndex + 1)}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(readerContent, document.body);
};