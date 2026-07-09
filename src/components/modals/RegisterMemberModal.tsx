import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLibrary } from '@/context/LibraryContext';
import { GlassCard } from '@/components/GlassCard';
import { FormInput, FormSelect } from '@/components/forms';
import { X, UserPlus, CheckCircle } from 'lucide-react';
import { govtIdTypeLabels } from '@/data/mockData';
import type { CitizenFormData } from '@/types';

interface RegisterMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialFormData: CitizenFormData = {
  name: '',
  phone: '',
  govtIdType: '',
  govtIdNumber: '',
};

export function RegisterMemberModal({ isOpen, onClose }: RegisterMemberModalProps) {
  const { t, addCitizen } = useLibrary();
  const [formData, setFormData] = useState<CitizenFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof CitizenFormData, string>>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const govtIdOptions = Object.entries(govtIdTypeLabels).map(([value, label]) => ({
    value,
    label,
  }));

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CitizenFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('required');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('required');
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Invalid mobile number (10 digits required)';
    }

    if (!formData.govtIdType) {
      newErrors.govtIdType = t('required');
    }

    if (!formData.govtIdNumber.trim()) {
      newErrors.govtIdNumber = t('required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      addCitizen(formData);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setFormData(initialFormData);
        onClose();
      }, 2000);
    }
  };

  const updateField = (field: keyof CitizenFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

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
                  <div className="w-10 h-10 bg-[#138808]/10 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-[#138808]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#4B2E2B]">{t('registerMember')}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Success State */}
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-[60%] p-6"
                >
                  <div className="w-20 h-20 bg-[#138808]/10 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-10 h-10 text-[#138808]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
                  <p className="text-gray-600 text-center">
                    Member has been registered and can now borrow books.
                  </p>
                </motion.div>
              ) : (
                /* Form */
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Full Name */}
                  <FormInput
                    label={t('fullName')}
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    error={errors.name}
                    required
                    placeholder="Enter full name"
                  />

                  {/* Mobile Number */}
                  <FormInput
                    label={t('mobileNumber')}
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    error={errors.phone}
                    required
                    placeholder="10-digit mobile number"
                    maxLength={10}
                  />

                  {/* Government ID Type */}
                  <FormSelect
                    label={t('govtIdType')}
                    value={formData.govtIdType}
                    onChange={(e) => updateField('govtIdType', e.target.value)}
                    options={[{ value: '', label: 'Select ID Type' }, ...govtIdOptions]}
                    error={errors.govtIdType}
                    required
                  />

                  {/* ID Number */}
                  <FormInput
                    label={t('idNumber')}
                    value={formData.govtIdNumber}
                    onChange={(e) => updateField('govtIdNumber', e.target.value)}
                    error={errors.govtIdNumber}
                    required
                    placeholder="Enter ID number"
                  />

                  {/* Info Box */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-blue-700">
                      <strong>Note:</strong> Membership will be valid for 1 year from registration date. 
                      Member must present original ID proof for verification.
                    </p>
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
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 btn-navy"
                    >
                      {t('verifyRegister')}
                    </motion.button>
                  </div>
                </form>
              )}
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
