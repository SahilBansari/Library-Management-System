import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLibrary } from '@/context/LibraryContext';
import { GlassCard } from '@/components/GlassCard';
import { User, BookOpen, ScanLine } from 'lucide-react';
import type { Citizen, Book } from '@/types';

export function ScannerInterface() {
  const { t, addToast, citizens, books, checkOutBook, returnBook } = useLibrary();
  
  // Input fields
  const [citizenInput, setCitizenInput] = useState('');
  const [bookInput, setBookInput] = useState('');
  
  // Actual resolved entities
  const [activeCitizen, setActiveCitizen] = useState<Citizen | null>(null);
  const [activeBook, setActiveBook] = useState<Book | null>(null);

  const handleScanCitizen = () => {
    if (!citizenInput.trim()) return;
    const found = citizens.find(c => c.id === citizenInput);
    if (found) {
      setActiveCitizen(found);
      addToast(t('Citizen verified successfully'), 'success');
    } else {
      setActiveCitizen(null);
      addToast(t('Citizen not found in directory'), 'error');
    }
  };

  const handleScanBook = () => {
    if (!bookInput.trim()) return;
    const found = books.find(b => b.id === bookInput || b.isbn === bookInput);
    if (found) {
      setActiveBook(found);
      addToast(t('Book scanned successfully'), 'success');
    } else {
      setActiveBook(null);
      addToast(t('Book not found in database'), 'error');
    }
  };

  const handleCheckOut = () => {
    if (activeCitizen && activeBook) {
      checkOutBook(activeCitizen.id, activeBook.id);
      setActiveBook(null);
      setBookInput(''); 
    }
  };

  const handleReturn = () => {
    if (activeBook) {
      returnBook(activeBook.id);
      setActiveBook(null);
      setBookInput('');
      // FIX: Intentionally do NOT clear activeCitizen so worker can process multiple books
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <GlassCard className="p-6 h-full border border-gray-100 shadow-sm rounded-2xl bg-white">
        <h3 className="text-lg font-bold text-[#4B2E2B] mb-4">{t('Scanner Interface')}</h3>

        <div className="space-y-6">
          {/* Citizen Scan */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('Scan Member ID')}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={citizenInput}
                  onChange={(e) => setCitizenInput(e.target.value)}
                  placeholder={t('Enter Citizen ID or scan card')}
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 focus:border-[#4B2E2B] focus:ring-1 focus:ring-[#4B2E2B] outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleScanCitizen()}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleScanCitizen}
                className="bg-[#4B2E2B] hover:bg-[#000066] text-white px-4 py-2.5 rounded-lg font-bold transition-colors"
              >
                <ScanLine className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Citizen Profile Card */}
            {activeCitizen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-4 bg-gray-50 border border-gray-100 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#4B2E2B]/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-[#4B2E2B]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{activeCitizen.name}</p>
                    <p className="text-sm text-gray-600">{t('ID:')} {activeCitizen.id}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium border ${
                    activeCitizen.isClearToBorrow
                      ? 'bg-[#138808]/10 text-[#138808] border-[#138808]/20'
                      : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {activeCitizen.isClearToBorrow ? t('Clear to Borrow') : t('Has Late Fees')}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Book Scan */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('Scan Book ISBN')}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={bookInput}
                  onChange={(e) => setBookInput(e.target.value)}
                  placeholder={t('Enter Book ID or scan barcode')}
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 focus:border-[#4B2E2B] focus:ring-1 focus:ring-[#4B2E2B] outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleScanBook()}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleScanBook}
                className="bg-[#4B2E2B] hover:bg-[#000066] text-white px-4 py-2.5 rounded-lg font-bold transition-colors"
              >
                <ScanLine className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Book Info Card */}
            {activeBook && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-4 bg-gray-50 border border-gray-100 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-16 bg-gradient-to-br from-[#C08552]/20 to-[#138808]/20 rounded flex items-center justify-center">
                    <span className="text-lg font-bold text-[#4B2E2B]/50">
                      {activeBook.title.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{activeBook.title}</p>
                    <p className="text-sm text-gray-600">{activeBook.author}</p>
                    <p className="text-xs text-gray-500">{activeBook.location}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                    activeBook.status === 'available'
                      ? 'bg-[#138808]/10 text-[#138808] border-[#138808]/20'
                      : 'bg-[#C08552]/10 text-[#C08552] border-[#C08552]/20'
                  }`}>
                    {t(activeBook.status)}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          {activeBook && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200"
            >
              <button
                onClick={handleCheckOut}
                disabled={!activeCitizen || !activeCitizen.isClearToBorrow || (activeBook.status !== 'available' && activeBook.status !== 'ready')}
                className="bg-[#C08552] hover:bg-[#a67041] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed"
              >
                {t('Check Out')}
              </button>
              <button
                onClick={handleReturn}
                className="bg-[#4B2E2B] hover:bg-[#000066] text-white rounded-lg py-3 text-sm font-bold transition-colors"
              >
                {t('Return Item')}
              </button>
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}