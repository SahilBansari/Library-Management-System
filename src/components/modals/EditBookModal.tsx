import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLibrary } from '@/context/LibraryContext';
import { GlassCard } from '@/components/GlassCard';
import { FormInput, FormSelect, FormTextarea } from '@/components/forms';
import { X, MapPin, Wrench, AlertTriangle, Trash2 } from 'lucide-react';
import { categoryLabels, floorOptions, rowOptions, shelfOptions } from '@/data/mockData';
import type { Book, BookFormData } from '@/types';

interface EditBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
}

export function EditBookModal({ isOpen, onClose, book }: EditBookModalProps) {
  const { t, updateBook, updateBookLocation, markBookCondition, deleteBook } = useLibrary();
  const [formData, setFormData] = useState<Partial<BookFormData>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof BookFormData, string>>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        publishYear: book.publishYear.toString(),
        category: book.category,
        floor: book.floor,
        row: book.row,
        shelf: book.shelf,
        description: book.description,
      });
    }
  }, [book]);

  const categoryOptions = Object.entries(categoryLabels).map(([value, label]) => ({
    value,
    label,
  }));

  const floorOpts = floorOptions.map(f => ({ value: f, label: `Floor ${f}` }));
  const rowOpts = rowOptions.map(r => ({ value: r, label: `Row ${r}` }));
  const shelfOpts = shelfOptions.map(s => ({ value: s, label: `Shelf ${s}` }));

  const updateField = (field: keyof BookFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleUpdateLocation = () => {
    if (book && formData.floor && formData.row && formData.shelf) {
      updateBookLocation(book.id, formData.floor, formData.row, formData.shelf);
    }
  };

  const handleMarkNeedsBinding = () => {
    if (book) {
      markBookCondition(book.id, 'needs-binding');
      onClose();
    }
  };

  const handleMarkLost = () => {
    if (book) {
      deleteBook(book.id);
      onClose();
    }
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (book) {
      updateBook(book.id, formData);
      onClose();
    }
  };

  if (!book) return null;

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
            <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" hover={false}>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-[#4B2E2B]">{t('editBook')}</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveChanges} className="p-6 space-y-6">
                {/* Title */}
                <FormInput
                  label={t('title')}
                  value={formData.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Enter book title"
                />

                {/* Author */}
                <FormInput
                  label={t('author')}
                  value={formData.author || ''}
                  onChange={(e) => updateField('author', e.target.value)}
                  placeholder="Enter author name"
                />

                {/* ISBN */}
                <FormInput
                  label={t('isbn')}
                  value={formData.isbn || ''}
                  onChange={(e) => updateField('isbn', e.target.value)}
                  placeholder="978-XX-XXXX-XXX-X"
                />

                {/* Publication Year */}
                <FormInput
                  label={t('publishYear')}
                  type="number"
                  value={formData.publishYear || ''}
                  onChange={(e) => updateField('publishYear', e.target.value)}
                  placeholder="YYYY"
                />

                {/* Category */}
                <FormSelect
                  label={t('category')}
                  value={formData.category || ''}
                  onChange={(e) => updateField('category', e.target.value)}
                  options={categoryOptions}
                />

                {/* Location */}
                <div className="space-y-2">
                  <label className="block text-base font-semibold text-[#4B2E2B]">
                    {t('location')}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <FormSelect
                      label=""
                      value={formData.floor || ''}
                      onChange={(e) => updateField('floor', e.target.value)}
                      options={floorOpts}
                    />
                    <FormSelect
                      label=""
                      value={formData.row || ''}
                      onChange={(e) => updateField('row', e.target.value)}
                      options={rowOpts}
                    />
                    <FormSelect
                      label=""
                      value={formData.shelf || ''}
                      onChange={(e) => updateField('shelf', e.target.value)}
                      options={shelfOpts}
                    />
                  </div>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpdateLocation}
                    className="mt-2 text-sm text-[#4B2E2B] font-medium flex items-center gap-1 hover:underline"
                  >
                    <MapPin className="w-4 h-4" />
                    {t('updateLocation')}
                  </motion.button>
                </div>

                {/* Description */}
                <FormTextarea
                  label={t('description')}
                  value={formData.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Enter book description"
                  rows={3}
                />

                {/* Inventory Actions */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-[#4B2E2B] mb-4">Inventory Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleMarkNeedsBinding}
                      className="px-4 py-2 bg-[#C08552]/10 text-[#C08552] rounded-xl font-medium flex items-center gap-2 hover:bg-[#C08552]/20 transition-colors"
                    >
                      <Wrench className="w-4 h-4" />
                      {t('markNeedsBinding')}
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-medium flex items-center gap-2 hover:bg-red-200 transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      {t('markLostDiscarded')}
                    </motion.button>
                  </div>
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

          {/* Delete Confirmation */}
          <AnimatePresence>
            {showDeleteConfirm && (
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
                        <Trash2 className="w-8 h-8 text-red-500" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Mark as Lost/Discarded?
                      </h3>
                      <p className="text-gray-600 mb-6">
                        This will remove "{book.title}" from the active catalog. This action cannot be undone.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                        >
                          {t('cancel')}
                        </button>
                        <button
                          onClick={handleMarkLost}
                          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
                        >
                          Confirm
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
