import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLibrary } from '@/context/LibraryContext';
import { GlassCard } from '@/components/GlassCard';
import { FormSelect } from '@/components/forms';
import { X, IndianRupee, AlertTriangle, CheckCircle, HeartHandshake } from 'lucide-react';
import { waiverReasonLabels } from '@/data/mockData';
import type { BorrowedBook, LateFeeCalculation } from '@/types';

interface LateFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  borrowedBook: BorrowedBook | null;
  lateFeeCalc: LateFeeCalculation | null;
}

export function LateFeeModal({ isOpen, onClose, borrowedBook, lateFeeCalc }: LateFeeModalProps) {
  const { t, collectFine, waiveFine } = useLibrary();
  const [waiverReason, setWaiverReason] = useState('');
  const [showWaiverForm, setShowWaiverForm] = useState(false);

  const waiverOptions = Object.entries(waiverReasonLabels).map(([value, label]) => ({
    value,
    label,
  }));

  const handleCollectPayment = () => {
    if (borrowedBook) {
      collectFine(borrowedBook.id);
      onClose();
    }
  };

  const handleWaiveFine = () => {
    if (borrowedBook && waiverReason) {
      waiveFine(borrowedBook.id, waiverReasonLabels[waiverReason]);
      onClose();
    }
  };

  if (!borrowedBook || !lateFeeCalc) return null;

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
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <h2 className="text-xl font-bold text-[#4B2E2B]">Late Fee Due</h2>
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
                  <p className="font-semibold text-gray-900">{lateFeeCalc.bookTitle}</p>
                </div>

                {/* Fee Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Original Due Date</span>
                    <span className="text-gray-900">{lateFeeCalc.dueDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t('daysLate')}</span>
                    <span className="text-red-500 font-semibold">{lateFeeCalc.daysLate} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Fine per Day</span>
                    <span className="text-gray-900">₹{lateFeeCalc.finePerDay}</span>
                  </div>
                </div>

                {/* Total Fine */}
                <div className="bg-red-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-red-700 font-medium">{t('totalFine')}</span>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-5 h-5 text-red-600" />
                      <span className="text-3xl font-bold text-red-600">{lateFeeCalc.totalFine}</span>
                    </div>
                  </div>
                </div>

                {/* Waiver Form */}
                {showWaiverForm ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    <FormSelect
                      label={t('reasonForWaiver')}
                      value={waiverReason}
                      onChange={(e) => setWaiverReason(e.target.value)}
                      options={[{ value: '', label: 'Select Reason' }, ...waiverOptions]}
                      required
                    />
                    <div className="flex gap-3">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowWaiverForm(false)}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                      >
                        Back
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleWaiveFine}
                        disabled={!waiverReason}
                        className="flex-1 btn-saffron flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <HeartHandshake className="w-5 h-5" />
                        {t('waiveFine')}
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  /* Action Buttons */
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowWaiverForm(true)}
                      className="px-4 py-3 bg-[#C08552] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#C08552]/90 transition-colors"
                    >
                      <HeartHandshake className="w-5 h-5" />
                      {t('waiveFine')}
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCollectPayment}
                      className="px-4 py-3 bg-[#138808] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#138808]/90 transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {t('collectPayment')}
                    </motion.button>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
