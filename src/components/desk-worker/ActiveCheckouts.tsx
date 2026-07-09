import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLibrary } from '@/context/LibraryContext';
import { GlassCard } from '@/components/GlassCard';
import { Calendar, AlertTriangle, Clock, IndianRupee } from 'lucide-react';
import { ExtendDueDateModal } from '@/components/modals/ExtendDueDateModal';
import { LateFeeModal } from '@/components/modals/LateFeeModal';
import type { BorrowedBook } from '@/types';

export function ActiveCheckouts() {
  const { borrowedBooks, calculateLateFee } = useLibrary();
  const [selectedBook, setSelectedBook] = useState<BorrowedBook | null>(null);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showLateFeeModal, setShowLateFeeModal] = useState(false);
  const [lateFeeCalc, setLateFeeCalc] = useState<ReturnType<typeof calculateLateFee>>(null);

  const activeBooks = borrowedBooks.filter(b => b.status === 'active' || b.status === 'overdue');

  const handleExtend = (book: BorrowedBook) => {
    setSelectedBook(book);
    setShowExtendModal(true);
  };

  const handleReturn = (book: BorrowedBook) => {
    if (book.status === 'overdue') {
      const feeCalc = calculateLateFee(book.id);
      setLateFeeCalc(feeCalc);
      setSelectedBook(book);
      setShowLateFeeModal(true);
    }
  };

  const getStatusBadge = (book: BorrowedBook) => {
    if (book.status === 'overdue') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-[#4B2E2B]/10 text-[#4B2E2B]">
          <AlertTriangle className="w-3 h-3" />
          Overdue
        </span>
      );
    }
    const daysLeft = Math.ceil((book.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 3) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-[#C08552]/10 text-[#C08552]">
          <Clock className="w-3 h-3" />
          {daysLeft} days left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-[#8D7B79]/10 text-[#8D7B79]">
        <Clock className="w-3 h-3" />
        Active
      </span>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#4B2E2B]">Active Checkouts</h3>
            <span className="bg-[#4B2E2B]/10 text-[#4B2E2B] px-3 py-1 rounded-full text-sm font-medium">
              {activeBooks.length} Books
            </span>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {activeBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                className={`p-4 rounded-xl border ${
                  book.status === 'overdue' 
                    ? 'bg-[#FAF6F0] border-[#C08552]/40' 
                    : 'bg-white/50 border-[#E8DCD0]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-[#4B2E2B]">{book.bookTitle}</p>
                    <p className="text-sm text-[#6B5A58]">{book.bookAuthor}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-[#8D7B79] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due: {book.dueDate.toLocaleDateString()}
                      </span>
                      {book.fineAmount && book.fineAmount > 0 && (
                        <span className="text-xs text-[#C08552] flex items-center gap-1 font-medium">
                          <IndianRupee className="w-3 h-3" />
                          Fine: ₹{book.fineAmount}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(book)}
                    <div className="flex gap-2 mt-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleExtend(book)}
                        className="px-3 py-1.5 bg-white border border-[#E8DCD0] text-[#6B5A58] text-sm rounded-lg hover:bg-[#FAF6F0] transition-colors flex items-center gap-1"
                      >
                        <Calendar className="w-3 h-3" />
                        Extend
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleReturn(book)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${
                          book.status === 'overdue'
                            ? 'bg-[#4B2E2B] text-white hover:bg-[#36211F]'
                            : 'btn-primary'
                        }`}
                      >
                        Return
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {activeBooks.length === 0 && (
              <div className="text-center py-8 text-[#8D7B79]">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No active checkouts</p>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      <ExtendDueDateModal isOpen={showExtendModal} onClose={() => { setShowExtendModal(false); setSelectedBook(null); }} borrowedBook={selectedBook} />
      <LateFeeModal isOpen={showLateFeeModal} onClose={() => { setShowLateFeeModal(false); setSelectedBook(null); setLateFeeCalc(null); }} borrowedBook={selectedBook} lateFeeCalc={lateFeeCalc} />
    </>
  );
}