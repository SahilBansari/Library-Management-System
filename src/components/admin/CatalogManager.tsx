import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLibrary } from '@/context/LibraryContext';
import { GlassCard } from '@/components/GlassCard';
import { Plus, Upload, Search, Edit3, BookOpen, MapPin, Wrench, AlertTriangle } from 'lucide-react';
import { AddBookModal } from '@/components/modals/AddBookModal';
import { BulkImportModal } from '@/components/modals/BulkImportModal';
import { EditBookModal } from '@/components/modals/EditBookModal';
import type { Book } from '@/types';

export function CatalogManager() {
  const { books, t } = useLibrary();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.isbn.includes(searchQuery)
  );

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    setShowEditModal(true);
  };

  const getStatusBadge = (book: Book) => {
    switch (book.status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#138808]/10 text-[#138808]">
            {t('Available')}
          </span>
        );
      case 'checked-out':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#4B2E2B]/10 text-[#4B2E2B]">
            {t('Checked Out')}
          </span>
        );
      case 'reserved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#C08552]/10 text-[#C08552]">
            {t('Reserved')}
          </span>
        );
      case 'under-repair':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
            <Wrench className="w-3 h-3" />
            {t('Needs Binding')}
          </span>
        );
      case 'lost':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
            <AlertTriangle className="w-3 h-3" />
            {t('Lost')}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
      >
        <GlassCard className="p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-bold text-[#4B2E2B]">{t('Catalog Management')}</h3>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowBulkImportModal(true)}
                className="px-4 py-2 bg-[#4B2E2B]/10 text-[#4B2E2B] rounded-xl font-medium flex items-center gap-2 hover:bg-[#4B2E2B]/20 transition-colors"
              >
                <Upload className="w-4 h-4" />
                {t('Bulk Import')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-[#C08552] text-white rounded-xl font-medium flex items-center gap-2 hover:bg-[#C08552]/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('Add Book')}
              </motion.button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search by title, author, or ISBN')}
              className="w-full input-solid pl-10"
            />
          </div>

          {/* Books Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t('Book')}</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t('Location')}</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t('Status')}</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t('Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.slice(0, 10).map((book, index) => (
                  <motion.tr
                    key={book.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
                    className="border-b border-gray-100 hover:bg-white/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 bg-gradient-to-br from-[#C08552]/20 to-[#138808]/20 rounded flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-[#4B2E2B]/50" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{book.title}</p>
                          <p className="text-sm text-gray-500">{book.author}</p>
                          <p className="text-xs text-gray-400">ISBN: {book.isbn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {book.location}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(book)}
                    </td>
                    <td className="py-3 px-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(book)}
                        className="px-3 py-1.5 bg-[#4B2E2B]/10 text-[#4B2E2B] text-sm rounded-lg hover:bg-[#4B2E2B]/20 transition-colors flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        {t('Edit')}
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBooks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>{t('No books found')}</p>
            </div>
          )}

          {filteredBooks.length > 10 && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                {t('Showing')} 10 {t('of')} {filteredBooks.length} {t('books')}
              </p>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Modals */}
      <AddBookModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <BulkImportModal
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
      />

      <EditBookModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedBook(null);
        }}
        book={selectedBook}
      />
    </>
  );
}