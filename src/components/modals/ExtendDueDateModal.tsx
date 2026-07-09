import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLibrary } from '@/context/LibraryContext';
import { GlassCard } from '@/components/GlassCard';
import { X, Calendar, Plus, Minus } from 'lucide-react';
import type { BorrowedBook } from '@/types';

interface ExtendDueDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  borrowedBook: BorrowedBook | null;
}

export function ExtendDueDateModal({ isOpen, onClose, borrowedBook }: ExtendDueDateModalProps) {
  const { t, extendDueDate } = useLibrary();
  const [additionalDays, setAdditionalDays] = useState(7);

  const handleIncrement = () => {
    if (additionalDays < 30) {
      setAdditionalDays(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (additionalDays > 1) {
      setAdditionalDays(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (borrowedBook) {
      extendDueDate(borrowedBook.id, additionalDays);
      onClose();
    }
  };

  const calculateNewDueDate = () => {
    if (!borrowedBook) return null;
    const newDate = new Date(borrowedBook.dueDate);
    newDate.setDate(newDate.getDate() + additionalDays);
    return newDate;
  };

  if (!borrowedBook) return null;

  const newDueDate = calculateNewDueDate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <GlassCard className="w-full max-w-md" hover={false}>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#4B2E2B]/10 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#4B2E2B]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#4B2E2B]">{t('extendDueDate')}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Book Info */}
                <div className="bg-[#FFF8F0] rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Book</p>
                  <p className="font-semibold text-gray-900">{borrowedBook.bookTitle}</p>
                  <p className="text-sm text-gray-600">{borrowedBook.bookAuthor}</p>
                </div>

                {/* Current Due Date */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Due Date</span>
                  <span className={`font-semibold ${
                    borrowedBook.status === 'overdue' ? 'text-red-500' : 'text-gray-900'
                  }`}>
                    {borrowedBook.dueDate.toLocaleDateString()}
                  </span>
                </div>

                {/* Days Selector */}
                <div className="space-y-3">
                  <label className="block text-base font-semibold text-[#4B2E2B]">
                    Additional Days
                  </label>
                  <div className="flex items-center justify-center gap-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleDecrement}
                      disabled={additionalDays <= 1}
                      className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      <Minus className="w-5 h-5" />
                    </motion.button>
                    <div className="w-24 h-16 bg-white border-2 border-[#C08552] rounded-xl flex items-center justify-center">
                      <span className="text-3xl font-bold text-[#C08552]">{additionalDays}</span>
                    </div>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleIncrement}
                      disabled={additionalDays >= 30}
                      className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-5 h-5" />
                    </motion.button>
                  </div>
                  <p className="text-center text-sm text-gray-500">
                    Max 30 days extension allowed
                  </p>
                </div>

                {/* New Due Date Preview */}
                <div className="bg-[#138808]/10 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#138808] font-medium">New Due Date</span>
                    <span className="text-xl font-bold text-[#138808]">
                      {newDueDate?.toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    {t('cancel')}
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    className="flex-1 btn-saffron"
                  >
                    Confirm Extension
                  </motion.button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
