import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLibrary } from '@/context/LibraryContext';
import { 
  Search, BookOpen, TrendingUp, Award, Clock, CheckCircle2, 
  AlertCircle, Calendar, Library as LibraryIcon, ShoppingCart, IndianRupee, Languages, X, Loader2, UploadCloud, FileText
} from 'lucide-react';
import type { Book, BorrowedBook, Reservation } from '@/types';
import { BookReader } from '@/components/BookReader';

const TRANSLATION_LANGUAGES = [
  { code: 'hi', label: 'Hindi (हिंदी)' },
  { code: 'ur', label: 'Urdu (اردو)' },
  { code: 'mr', label: 'Marathi (मराठी)' },
  { code: 'sa', label: 'Sanskrit (संस्कृत)' },
  { code: 'ar', label: 'Arabic (عربي)' },
  { code: 'en', label: 'English (US)' },
];

export function CitizenPortal() {
  const { 
    activeView, setActiveView, currentCitizen, books, borrowedBooks, reservations,
    searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, 
    cart, addToCart, t 
  } = useLibrary();

  const [activeFormat, setActiveFormat] = useState<'all' | 'physical' | 'digital'>('all');
  const [readingBook, setReadingBook] = useState<Book | null>(null);

  // Translation & OCR State
  const [showTranslator, setShowTranslator] = useState(false);
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [targetLang, setTargetLang] = useState("mr"); // Defaulting to Marathi conceptually
  const [isTranslating, setIsTranslating] = useState(false);
  const [isExtractingOCR, setIsExtractingOCR] = useState(false);

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.author?.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const matchesCategory = selectedCategory === 'all' || 
                            book.category?.toLowerCase() === selectedCategory.toLowerCase();
                            
    const matchesFormat = activeFormat === 'all' || book.bookType === activeFormat;
    
    if (selectedCategory === 'exam') {
      return matchesSearch && matchesFormat && (book.category?.toLowerCase() === 'ukpsc' || book.description?.toLowerCase().includes('exam'));
    }
    return matchesSearch && matchesCategory && matchesFormat;
  });

  const myBorrowedBooks = borrowedBooks.filter(b => b.status === 'active' || b.status === 'overdue');

  const handleQuickSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActiveView('all-books');
  };

  const simulateOCRUpload = () => {
    setIsExtractingOCR(true);
    setSourceText("");
    setTranslatedText("");
    
    setTimeout(() => {
      setSourceText("The central library represents a core pillar of modern education. By preserving historical texts and offering open access to digital archives, it bridges the gap between generations. This document serves to highlight the importance of continuous learning and community engagement through literature.");
      setIsExtractingOCR(false);
    }, 2000);
  };

  const executeTranslation = async () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);
    
    setTimeout(() => {
      const mockTranslations: Record<string, string> = {
        hi: "केंद्रीय पुस्तकालय आधुनिक शिक्षा का एक मुख्य स्तंभ है। ऐतिहासिक ग्रंथों को संरक्षित करके और डिजिटल अभिलेखागार तक खुली पहुंच प्रदान करके, यह पीढ़ियों के बीच की खाई को पाटता है। यह दस्तावेज़ साहित्य के माध्यम से निरंतर सीखने और सामुदायिक जुड़ाव के महत्व को उजागर करने का काम करता है।",
        ur: "مرکزی لائبریری جدید تعلیم کا ایک بنیادی ستون ہے۔ تاریخی متن کو محفوظ کر کے اور ڈیجیٹل آرکائیوز تک کھلی رسائی کی پیشکش کر کے، یہ نسلوں کے درمیان خلیج کو پر کرتا ہے۔ یہ دستاویز ادب کے ذریعے مسلسل سیکھنے اور کمیونٹی کی شمولیت کی اہمیت کو اجاگر کرتی ہے۔",
        mr: "केंद्रीय ग्रंथालय हा आधुनिक शिक्षणाचा मुख्य आधारस्तंभ आहे. ऐतिहासिक ग्रंथांचे जतन करून आणि डिजिटल संग्रहणांना खुली प्रवेशाची सोय करून, ते पिढ्यांमधील दरी कमी करते. हे दस्तऐवज साहित्याद्वारे निरंतर शिक्षण आणि सामुदायिक सहभागाचे महत्त्व अधोरेखित करते.",
        sa: "केन्द्रीयपुस्तकालयः आधुनिकशिक्षायाः मुख्यस्तम्भः अस्ति। ऐतिहासिकग्रन्थानां संरक्षणेन तथा च डिजिटल-अभिलेखागाराणां कृते मुक्तप्रवेशं प्रदातुं एतत् पीढीनां मध्ये अन्तरं पूरयति। एतत् दस्तावेज़ं साहित्यमाध्यमेन निरन्तरशिक्षणस्य तथा सामुदायिकसंलग्नतायाः महत्त्वं प्रकाशयति।",
        ar: "تمثل المكتبة المركزية ركيزة أساسية للتعليم الحديث. من خلال الحفاظ على النصوص التاريخية وتوفير الوصول المفتوح إلى الأرشيفات الرقمية، فإنها تسد الفجوة بين الأجيال. تعمل هذه الوثيقة على إبراز أهمية التعلم المستمر والمشاركة المجتمعية من خلال الأدب.",
        en: sourceText // If english to english
      };
      
      setTranslatedText(`${mockTranslations[targetLang]}\n\n[System Note: This is an AI Simulated Response. The real API hook should be implemented here.]`);
      setIsTranslating(false);
    }, 1500);
  };

  const renderDashboard = () => (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="bg-gradient-to-r from-[#4B2E2B] to-[#2A1816] rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C08552]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('Welcome back')}, {currentCitizen.name}!</h1>
            <p className="text-white/80 text-sm md:text-lg max-w-2xl">
              {t("Explore the State Library's extensive collection. Rent physical copies or read our digital archives for free.")}
            </p>
          </div>
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-4">
              <div className="bg-[#138808] p-3 rounded-full shrink-0">
                <Award className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-white/70">{t('Membership Status')}</p>
                <p className="font-bold text-sm md:text-base text-[#C08552]">{t('Active Citizen')}</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowTranslator(true)}
              className="bg-[#C08552] hover:bg-[#a67142] transition-colors border border-white/20 rounded-xl p-4 flex items-center gap-4 shadow-lg group w-full"
            >
              <div className="bg-white/20 p-3 rounded-full group-hover:rotate-12 transition-transform shrink-0">
                <Languages className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-sm md:text-base leading-tight">{t('AI Document Translator')}</p>
                <p className="text-[10px] md:text-xs text-white/80">{t('OCR & Dual View Mode')}</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 text-center">
        <LibraryIcon className="w-10 h-10 md:w-12 md:h-12 text-[#4B2E2B] mx-auto mb-4" />
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">{t('What would you like to read today?')}</h2>
        <form onSubmit={handleQuickSearch} className="max-w-2xl mx-auto relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("Search by book title, author, or subject...")}
            className="w-full pl-6 pr-14 py-3 md:py-4 bg-[#FFF8F0] border-2 border-gray-200 rounded-full text-base md:text-lg focus:outline-none focus:border-[#4B2E2B] focus:ring-4 focus:ring-[#4B2E2B]/10 transition-all"
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 bottom-2 bg-[#C08552] hover:bg-[#e68a2e] text-white p-2 md:p-3 rounded-full transition-colors flex items-center justify-center"
          >
            <Search className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="text-[#C08552]" />
          {t('Your Reading Journey')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-[#4B2E2B]/10 p-3 md:p-4 rounded-xl shrink-0">
              <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-[#4B2E2B]" />
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{currentCitizen.booksRead}</p>
              <p className="text-xs md:text-sm text-gray-500 font-medium">{t('Books Read')}</p>
            </div>
          </div>
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-[#C08552]/10 p-3 md:p-4 rounded-xl shrink-0">
              <Award className="w-6 h-6 md:w-8 md:h-8 text-[#C08552]" />
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{currentCitizen.currentStreak} <span className="text-base md:text-lg text-gray-500 font-normal">{t('weeks')}</span></p>
              <p className="text-xs md:text-sm text-gray-500 font-medium">{t('Current Streak')}</p>
            </div>
          </div>
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 sm:col-span-2 md:col-span-1">
            <div className="bg-green-50 p-3 md:p-4 rounded-xl shrink-0">
              <Clock className="w-6 h-6 md:w-8 md:h-8 text-[#138808]" />
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{myBorrowedBooks.length}</p>
              <p className="text-xs md:text-sm text-gray-500 font-medium">{t('Currently Borrowed')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAllBooks = () => {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 h-full flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#4B2E2B]">{t('Library Catalog')}</h2>
            <p className="text-gray-500 text-xs md:text-sm mt-1">{t('Browse, rent physical books, or read digital formats.')}</p>
          </div>
          <div className="w-full md:w-96 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("Search books...")}
              className="w-full pl-10 pr-4 py-2.5 text-sm md:text-base bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#4B2E2B] focus:ring-2 focus:ring-[#4B2E2B]/20 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap md:flex-nowrap bg-gray-100 p-1 md:p-1.5 rounded-xl w-full md:w-fit mb-6 shadow-inner border border-gray-200 gap-1 md:gap-0">
          <button 
            onClick={() => setActiveFormat('all')} 
            className={`flex-1 md:flex-none px-3 md:px-6 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${activeFormat === 'all' ? 'bg-[#4B2E2B] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
          >
            {t('All Formats')}
          </button>
          <button 
            onClick={() => setActiveFormat('physical')} 
            className={`flex-1 md:flex-none px-3 md:px-6 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${activeFormat === 'physical' ? 'bg-[#4B2E2B] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
          >
            {t('Physical')}
          </button>
          <button 
            onClick={() => setActiveFormat('digital')} 
            className={`flex-1 md:flex-none px-3 md:px-6 py-2 rounded-lg font-bold text-xs md:text-sm transition-all flex justify-center items-center gap-1.5 ${activeFormat === 'digital' ? 'bg-[#8C5A3C] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <BookOpen className="w-3.5 h-3.5" /> {t('Digital')}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pb-8">
          {filteredBooks.map((book: Book) => {
            const isInCart = cart.some(item => item.bookId === book.id);
            const isReserved = reservations.some(r => r.bookId === book.id && r.status !== 'picked-up');
            const canAddToCart = book.status === 'available' && !isReserved && !isInCart && book.bookType === 'physical';

            return (
              <div key={book.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col group relative">
                
                <div className="absolute top-3 left-3 z-10">
                  {book.bookType === 'digital' ? (
                    <span className="bg-[#138808] text-white text-[10px] md:text-xs font-bold px-2.5 py-1 md:py-1.5 rounded-full shadow-md">
                      {t('Free Access')}
                    </span>
                  ) : (
                    <span className="bg-white border-2 border-green-600 text-green-700 text-[10px] md:text-xs font-bold px-2.5 py-1 md:py-1.5 rounded-full shadow-md flex items-center gap-1">
                      <IndianRupee className="w-2.5 h-2.5 md:w-3 md:h-3" /> {book.rentalPrice} {t('Rental')}
                    </span>
                  )}
                </div>

                <div className="h-40 md:h-48 bg-gradient-to-br from-gray-100 to-gray-50 relative flex items-center justify-center border-b border-gray-100">
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                  <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-gray-300 drop-shadow-sm" />
                </div>
                
                <div className="p-4 md:p-5 flex-1 flex flex-col">
                  <p className="text-[9px] md:text-[10px] text-[#C08552] font-bold uppercase tracking-wider mb-1">{t(book.category || '')}</p>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 line-clamp-2 leading-tight mb-1">{book.title}</h3>
                  <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">{book.author}</p>
                  
                  <div className="mt-auto">
                    {book.bookType === 'digital' ? (
                      <button
                        onClick={() => setReadingBook(book)}
                        className="w-full py-2.5 md:py-3 rounded-xl text-sm md:text-base font-bold transition-all bg-[#138808] hover:bg-green-700 text-white shadow-md shadow-[#138808]/20 flex items-center justify-center gap-2"
                      >
                        <BookOpen className="w-4 h-4" /> {t('Read Online')}
                      </button>
                    ) : (
                      <button
                        onClick={() => addToCart(book.id)}
                        disabled={!canAddToCart}
                        className={`w-full py-2.5 md:py-3 rounded-xl text-sm md:text-base font-bold transition-all flex items-center justify-center gap-2 ${
                          isInCart 
                            ? 'bg-green-50 text-green-700 border-2 border-green-200 cursor-not-allowed'
                            : canAddToCart
                              ? 'bg-[#4B2E2B] hover:bg-[#2A1816] text-white shadow-md shadow-[#4B2E2B]/20'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isInCart ? <><CheckCircle2 className="w-4 h-4" /> {t('In Cart')}</> : <><ShoppingCart className="w-4 h-4" /> {t('Add to Cart')}</>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMyActivity = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-[#4B2E2B]">{t('My Activity')}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-100 bg-[#FFF8F0] flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-[#4B2E2B]" />
            <h3 className="font-bold text-gray-900 text-base md:text-lg">{t('Currently Borrowed')}</h3>
          </div>
          <div className="p-4 md:p-6 divide-y divide-gray-100">
            {myBorrowedBooks.length === 0 ? (
              <p className="text-center text-gray-500 py-6 md:py-8 text-sm md:text-base">{t('You have no active borrowed books.')}</p>
            ) : (
              myBorrowedBooks.map((borrowed: BorrowedBook) => (
                <div key={borrowed.id} className="py-4 flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm md:text-base">{borrowed.bookTitle}</h4>
                    <p className="text-xs md:text-sm text-gray-500 mb-1 md:mb-2">{borrowed.bookAuthor}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="h-full bg-[#FFF8F0] relative"
      >
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'all-books' && renderAllBooks()}
        {activeView === 'my-activity' && renderMyActivity()}
      </motion.div>

      {readingBook && (
        <BookReader book={readingBook} onClose={() => setReadingBook(null)} />
      )}

      {/* AI Translator Modal - DUAL VIEW ARCHITECTURE (Mobile optimized) */}
      <AnimatePresence>
        {showTranslator && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-8"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#FFF8F0] w-full max-w-6xl rounded-2xl md:rounded-3xl shadow-2xl flex flex-col h-[90vh] md:max-h-[95vh] overflow-hidden border border-gray-200"
            >
              <div className="bg-[#4B2E2B] p-4 md:p-6 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="bg-white/20 p-2 rounded-lg hidden sm:block">
                    <Languages className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-xl font-bold flex items-center flex-wrap gap-2">
                      {t('AI Library Translator')} 
                      <span className="text-[9px] md:text-xs bg-[#C08552] px-2 py-0.5 rounded-full uppercase tracking-wider">Dual View</span>
                    </h2>
                    <p className="text-xs md:text-sm text-white/70 hidden sm:block">{t('Upload Any OCR Text → Read Side-by-Side in Your Language')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowTranslator(false)}
                  className="p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              {/* Toolbar */}
              <div className="bg-white border-b border-gray-200 p-3 md:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0 shadow-sm relative z-10">
                
                <button 
                  onClick={simulateOCRUpload}
                  disabled={isExtractingOCR}
                  className="flex items-center justify-center md:justify-start gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-sm md:text-base font-semibold transition-colors disabled:opacity-50 border border-gray-300 w-full md:w-auto"
                >
                  {isExtractingOCR ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin text-[#C08552]" /> : <UploadCloud className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />}
                  {isExtractingOCR ? "Extracting..." : "Simulate PDF/Image Upload (OCR)"}
                </button>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                  <div className="flex items-center justify-between sm:justify-start gap-2 bg-[#FFF8F0] border border-[#E5D5C5] px-3 py-2 md:py-1.5 rounded-lg w-full sm:w-auto">
                    <span className="text-xs md:text-sm font-bold text-gray-600 uppercase tracking-wider">{t('Translate to:')}</span>
                    <select 
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                      className="bg-transparent border-none font-bold text-[#4B2E2B] text-sm focus:ring-0 outline-none cursor-pointer p-0"
                    >
                      {TRANSLATION_LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button 
                    onClick={executeTranslation}
                    disabled={isTranslating || !sourceText.trim()}
                    className="bg-[#C08552] hover:bg-[#a67142] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 md:px-8 py-2.5 rounded-xl text-sm md:text-base font-bold shadow-md transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    {isTranslating ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('Processing...')}</> : t('Translate Now')}
                  </button>
                </div>
              </div>

              {/* DUAL VIEW CONTENT AREA (Stacked on mobile, Side-by-side on desktop) */}
              <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden bg-gray-200">
                
                {/* LEFT: ORIGINAL TEXT */}
                <div className="w-full md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r border-gray-300 min-h-[250px] md:min-h-0">
                  <div className="bg-gray-100 px-4 md:px-6 py-2.5 md:py-3 border-b border-gray-200 flex items-center justify-between shrink-0">
                    <h3 className="text-xs md:text-sm font-bold text-gray-600 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 md:w-4 md:h-4"/> Original Text</h3>
                    <span className="text-[9px] md:text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded font-bold uppercase">Auto-Detected: English</span>
                  </div>
                  <textarea 
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder={t('Paste your OCR extracted text here, or use the upload button above...')}
                    className="flex-1 w-full p-4 md:p-8 bg-white focus:outline-none focus:ring-inset focus:ring-4 focus:ring-[#C08552]/20 resize-none font-sans text-base md:text-lg text-gray-700 leading-relaxed min-h-[200px] md:min-h-full"
                  />
                </div>

                {/* RIGHT: TRANSLATED TEXT (Handles RTL automatically) */}
                <div className="w-full md:w-1/2 flex flex-col bg-[#FFF8F0] min-h-[250px] md:min-h-0">
                  <div className="bg-[#EAE0D5] px-4 md:px-6 py-2.5 md:py-3 border-b border-[#D5C6B5] flex items-center justify-between shrink-0">
                    <h3 className="text-xs md:text-sm font-bold text-[#4B2E2B] flex items-center gap-1.5"><Languages className="w-3.5 h-3.5 md:w-4 md:h-4"/> Translated Output</h3>
                    <span className="text-[9px] md:text-xs bg-[#4B2E2B] text-white px-2 py-1 rounded font-bold">{TRANSLATION_LANGUAGES.find(l => l.code === targetLang)?.label}</span>
                  </div>
                  
                  <div 
                    dir={targetLang === 'ur' || targetLang === 'ar' ? 'rtl' : 'ltr'}
                    className={`flex-1 w-full p-4 md:p-8 overflow-y-auto text-gray-900 min-h-[200px] md:min-h-full ${
                      targetLang === 'ur' || targetLang === 'ar' ? 'text-right text-xl md:text-2xl font-arabic leading-loose' : 'text-left text-base md:text-lg font-serif leading-relaxed'
                    }`}
                  >
                    {isTranslating ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 py-8 md:py-0">
                        <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin mb-3 md:mb-4 text-[#C08552]" />
                        <p className="text-sm md:text-base font-semibold text-gray-600 text-center px-4">{t('Neural Engine is translating context...')}</p>
                      </div>
                    ) : translatedText ? (
                      <p className="whitespace-pre-wrap">{translatedText}</p>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400 italic text-sm md:text-base py-8 md:py-0">
                        {t('Translation will appear here')}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}