import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLibrary } from '@/context/LibraryContext';
import { GlassCard } from '@/components/GlassCard';
import { FormInput, FormSelect } from '@/components/forms';
import { X, User, AlertTriangle, Ban, CheckCircle } from 'lucide-react';
import { govtIdTypeLabels } from '@/data/mockData';
import type { Citizen, CitizenFormData } from '@/types';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  citizen: Citizen | null;
}

export function EditMemberModal({ isOpen, onClose, citizen }: EditMemberModalProps) {
  const { t, updateCitizen, suspendCitizen, reactivateCitizen } = useLibrary();
  const [formData, setFormData] = useState<Partial<CitizenFormData>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof CitizenFormData, string>>>({});
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendError, setSuspendError] = useState('');

  useEffect(() => {
    if (citizen) {
      setFormData({
        name: citizen.name,
        phone: citizen.phone,
        govtIdType: citizen.govtIdType,
        govtIdNumber: citizen.govtIdNumber,
      });
    }
  }, [citizen]);

  const govtIdOptions = Object.entries(govtIdTypeLabels).map(([value, label]) => ({
    value,
    label,
  }));

  const updateField = (field: keyof CitizenFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (citizen) {
      updateCitizen(citizen.id, formData);
      onClose();
    }
  };

  const handleSuspend = () => {
    if (!suspendReason.trim()) {
      setSuspendError('Reason is required');
      return;
    }
    if (citizen) {
      suspendCitizen(citizen.id, suspendReason);
      setShowSuspendConfirm(false);
      onClose();
    }
  };

  const handleReactivate = () => {
    if (citizen) {
      reactivateCitizen(citizen.id);
      onClose();
    }
  };

  if (!citizen) return null;

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

          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50"
          >
            <GlassCard className="h-full rounded-none overflow-y-auto" hover={false}>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#4B2E2B]/10 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-[#4B2E2B]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#4B2E2B]">{t('editProfile')}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Member Status Banner */}
              <div className={`px-6 py-3 ${
                citizen.status === 'active' 
                  ? 'bg-[#138808]/10' 
                  : citizen.status === 'suspended' 
                    ? 'bg-red-100' 
                    : 'bg-gray-100'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Member Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    citizen.status === 'active' 
                      ? 'bg-[#138808] text-white' 
                      : citizen.status === 'suspended' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-[#FFF8F0]0 text-white'
                  }`}>
                    {citizen.status.toUpperCase()}
                  </span>
                </div>
                {citizen.suspendReason && (
                  <p className="text-sm text-red-600 mt-2">
                    Reason: {citizen.suspendReason}
                  </p>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSaveChanges} className="p-6 space-y-6">
                {/* Member ID */}
                <div className="bg-[#FFF8F0] rounded-xl p-4">
                  <p className="text-sm text-gray-500">Member ID</p>
                  <p className="text-lg font-semibold text-[#4B2E2B]">{citizen.id}</p>
                </div>

                {/* Full Name */}
                <FormInput
                  label={t('fullName')}
                  value={formData.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Enter full name"
                />

                {/* Mobile Number */}
                <FormInput
                  label={t('mobileNumber')}
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />

                {/* Government ID Type */}
                <FormSelect
                  label={t('govtIdType')}
                  value={formData.govtIdType || ''}
                  onChange={(e) => updateField('govtIdType', e.target.value)}
                  options={govtIdOptions}
                />

                {/* ID Number */}
                <FormInput
                  label={t('idNumber')}
                  value={formData.govtIdNumber || ''}
                  onChange={(e) => updateField('govtIdNumber', e.target.value)}
                  placeholder="Enter ID number"
                />

                {/* Membership Info */}
                <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="text-sm font-medium">{citizen.memberSince.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Membership Expiry</span>
                    <span className={`text-sm font-medium ${
                      citizen.membershipExpiry < new Date() ? 'text-red-500' : ''
                    }`}>
                      {citizen.membershipExpiry.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Books Read</span>
                    <span className="text-sm font-medium">{citizen.booksRead}</span>
                  </div>
                  {citizen.lateFeeAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Outstanding Fines</span>
                      <span className="text-sm font-bold text-red-500">₹{citizen.lateFeeAmount}</span>
                    </div>
                  )}
                </div>

                {/* Account Actions */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-[#4B2E2B] mb-4">Account Actions</h3>
                  
                  {citizen.status === 'active' ? (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowSuspendConfirm(true)}
                      className="w-full px-4 py-3 bg-red-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
                    >
                      <Ban className="w-5 h-5" />
                      {t('suspendAccount')}
                    </motion.button>
                  ) : (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleReactivate}
                      className="w-full px-4 py-3 bg-[#138808] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#138808]/90 transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Reactivate Account
                    </motion.button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
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
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 btn-saffron"
                  >
                    {t('saveChanges')}
                  </motion.button>
                </div>
              </form>
            </GlassCard>
          </motion.div>

          {/* Suspend Confirmation */}
          <AnimatePresence>
            {showSuspendConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                >
                  <GlassCard className="p-6 max-w-md" hover={false}>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Suspend Member Account?
                      </h3>
                      <p className="text-gray-600 mb-4">
                        This will prevent {citizen.name} from borrowing books.
                      </p>
                      
                      {/* Reason Input */}
                      <div className="text-left mb-4">
                        <label className="block text-sm font-semibold text-[#4B2E2B] mb-2">
                          {t('suspendReason')} <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={suspendReason}
                          onChange={(e) => {
                            setSuspendReason(e.target.value);
                            setSuspendError('');
                          }}
                          placeholder="e.g., Unpaid late fees exceeding ₹500"
                          className={`w-full bg-white border-2 rounded-xl px-4 py-3 text-base ${
                            suspendError ? 'border-red-500' : 'border-gray-200'
                          } focus:outline-none focus:border-[#C08552]`}
                          rows={3}
                        />
                        {suspendError && (
                          <p className="text-sm text-red-500 mt-1">{suspendError}</p>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowSuspendConfirm(false);
                            setSuspendReason('');
                            setSuspendError('');
                          }}
                          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                        >
                          {t('cancel')}
                        </button>
                        <button
                          onClick={handleSuspend}
                          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
                        >
                          Confirm Suspension
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
