import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLibrary } from '@/context/LibraryContext';
import { 
  BarChart3, Users, BookOpen, Settings, FileText, AlertTriangle, Search, CheckCircle,
  Clock, ShieldAlert, Save, Activity, Library as LibraryIcon, BookPlus, UploadCloud, IndianRupee, PieChart
} from 'lucide-react';
import { EditBookModal } from '@/components/modals/EditBookModal';
import { AddBookModal } from '@/components/modals/AddBookModal';
import { BulkImportModal } from '@/components/modals/BulkImportModal';
import { BookReader } from '@/components/BookReader';
import type { Book, SystemLog } from '@/types';

export function AdminPortal() {
  const { 
    activeView, books, citizens, borrowedBooks, systemLogs,
    searchQuery, setSearchQuery, selectedCategory, setSelectedCategory,
    updateBookStatus, settings, updateSettings, addToast, t 
  } = useLibrary();

  const [activeFormat, setActiveFormat] = useState<'all' | 'physical' | 'digital'>('all');
  const [readingBook, setReadingBook] = useState<Book | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showAddBook, setShowAddBook] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  
  const [localSettings, setLocalSettings] = useState(settings);

  const renderDashboard = () => {
    const totalBooks = books.length;
    const activeReaders = citizens.filter(c => c.status === 'active').length;
    const activeCheckouts = borrowedBooks.filter(b => b.status === 'active').length;
    const needsRepair = books.filter(b => b.status === 'under-repair').length;

    // Revenue Calculation
    const totalRevenue = borrowedBooks.reduce((sum, b) => sum + (b.rentalFeePaid || 0), 0);

    // Category Stats
    const categoryCounts = books.reduce((acc, book) => {
      const cat = book.category || 'other';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);

    // Department Stats
    const deptCounts = books.reduce((acc, book) => {
      const dept = book.department || 'General';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const maxDeptCount = Math.max(...Object.values(deptCounts), 1);

    // Revenue by Department
    const revenueByDept = borrowedBooks.reduce((acc, borrow) => {
      const book = books.find(b => b.id === borrow.bookId);
      const dept = book?.department || 'General';
      acc[dept] = (acc[dept] || 0) + (borrow.rentalFeePaid || 0);
      return acc;
    }, {} as Record<string, number>);
    const maxDeptRevenue = Math.max(...Object.values(revenueByDept), 1);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-[#4B2E2B]">{t('Chief Librarian Dashboard')}</h2>
          <p className="text-gray-500 text-sm mt-1">{t('High-level overview of library inventory, revenue, and operations.')}</p>
        </div>

        {/* Top KPIs including Revenue */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col border-t-4 border-t-[#4B2E2B]">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-[#4B2E2B]/10 p-2.5 rounded-lg"><BookOpen className="w-5 h-5 text-[#4B2E2B]" /></div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalBooks}</p>
            <p className="text-xs text-gray-500 font-medium">{t('Total Inventory')}</p>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col border-t-4 border-t-[#C08552]">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-orange-50 p-2.5 rounded-lg"><Users className="w-5 h-5 text-[#C08552]" /></div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{activeReaders}</p>
            <p className="text-xs text-gray-500 font-medium">{t('Active Members')}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col border-t-4 border-t-[#138808]">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-green-50 p-2.5 rounded-lg"><Activity className="w-5 h-5 text-[#138808]" /></div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{activeCheckouts}</p>
            <p className="text-xs text-gray-500 font-medium">{t('Active Circulations')}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col border-t-4 border-t-blue-600">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-blue-50 p-2.5 rounded-lg"><IndianRupee className="w-5 h-5 text-blue-600" /></div>
            </div>
            <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500 font-medium">{t('Total Rental Revenue')}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col border-t-4 border-t-red-600">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-red-50 p-2.5 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{needsRepair}</p>
            <p className="text-xs text-gray-500 font-medium">{t('Flags for Repair')}</p>
          </div>
        </div>

        {/* Charts Row 1: Category & Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-80">
            <h3 className="font-bold text-[#4B2E2B] mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" /> {t('Inventory by Category')}
            </h3>
            <div className="flex-1 flex flex-col justify-end space-y-4 overflow-y-auto pr-2">
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const percentage = (count / maxCategoryCount) * 100;
                return (
                  <div key={cat} className="flex items-center gap-4">
                    <span className="w-24 text-xs font-semibold text-gray-600 capitalize truncate text-right">
                      {t(cat)}
                    </span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden flex items-center">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-[#4B2E2B] to-[#C08552]"
                      />
                    </div>
                    <span className="w-8 text-xs font-bold text-gray-900 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-80">
            <h3 className="font-bold text-[#4B2E2B] mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5" /> {t('Department Analytics (Count)')}
            </h3>
            <div className="flex-1 flex flex-col justify-end space-y-4 overflow-y-auto pr-2">
              {Object.entries(deptCounts).map(([dept, count]) => {
                const percentage = (count / maxDeptCount) * 100;
                return (
                  <div key={dept} className="flex items-center gap-4">
                    <span className="w-32 text-xs font-semibold text-gray-600 truncate text-right">
                      {t(dept)}
                    </span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden flex items-center">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-[#138808]"
                      />
                    </div>
                    <span className="w-8 text-xs font-bold text-gray-900 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Charts Row 2: Revenue by Department */}
        <div className="grid grid-cols-1 gap-8">
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-80">
            <h3 className="font-bold text-[#4B2E2B] mb-6 flex items-center gap-2">
              <IndianRupee className="w-5 h-5" /> {t('Revenue Generation by Department')}
            </h3>
            <div className="flex-1 flex flex-col justify-end space-y-4 overflow-y-auto pr-2">
              {Object.entries(revenueByDept).map(([dept, revenue]) => {
                const percentage = (revenue / maxDeptRevenue) * 100;
                return (
                  <div key={dept} className="flex items-center gap-4">
                    <span className="w-32 text-xs font-semibold text-gray-600 truncate text-right">
                      {t(dept)}
                    </span>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden flex items-center">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-blue-600"
                      />
                    </div>
                    <span className="w-16 text-sm font-bold text-gray-900 text-right">₹{revenue}</span>
                  </div>
                );
              })}
              {Object.keys(revenueByDept).length === 0 && (
                 <div className="text-center text-gray-400 py-10">{t('No revenue data generated yet.')}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAllBooks = () => {
    const categories = [
      { id: 'all', label: 'Entire Database' },
      { id: 'fiction', label: 'Fiction' },
      { id: 'history', label: 'History' },
      { id: 'science', label: 'Science' },
      { id: 'ukpsc', label: 'UKPSC' },
      { id: 'exam', label: 'Exam Prep' }
    ];

    const filteredBooks = books.filter(book => {
      const matchesSearch = book.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            book.isbn?.includes(searchQuery) ||
                            book.author?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
                              book.category?.toLowerCase() === selectedCategory.toLowerCase();
      
      const matchesFormat = activeFormat === 'all' || book.bookType === activeFormat;
      
      if (selectedCategory === 'exam') {
        return matchesSearch && matchesFormat && (book.category?.toLowerCase() === 'ukpsc' || book.description?.toLowerCase().includes('exam'));
      }
      return matchesSearch && matchesCategory && matchesFormat;
    });

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#4B2E2B]">{t('Master Inventory')}</h2>
            <p className="text-gray-500 text-sm mt-1">{t('Comprehensive view of all library assets & departments.')}</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <div className="w-full md:w-[350px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search by Title, Author, or ISBN...')}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#4B2E2B] focus:ring-2 focus:ring-[#4B2E2B]/20 shadow-sm"
              />
            </div>
            
            {/* BULK IMPORT & ADD BOOK BUTTONS INTEGRATED HERE */}
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={() => setShowBulkImport(true)}
                className="bg-[#138808] text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors flex-1 md:flex-none whitespace-nowrap"
              >
                <UploadCloud className="w-5 h-5" />
                {t('Bulk Import')}
              </button>
              <button 
                onClick={() => setShowAddBook(true)}
                className="bg-[#4B2E2B] text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#2A1816] transition-colors flex-1 md:flex-none whitespace-nowrap"
              >
                <BookPlus className="w-5 h-5" />
                {t('Add Book')}
              </button>
            </div>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-xl w-fit mb-6 shadow-inner border border-gray-200">
          <button 
            onClick={() => setActiveFormat('all')} 
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeFormat === 'all' ? 'bg-[#4B2E2B] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
          >
            {t('All Formats')}
          </button>
          <button 
            onClick={() => setActiveFormat('physical')} 
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeFormat === 'physical' ? 'bg-[#4B2E2B] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
          >
            {t('Offline Books')}
          </button>
          <button 
            onClick={() => setActiveFormat('digital')} 
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeFormat === 'digital' ? 'bg-[#8C5A3C] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <BookOpen className="w-4 h-4" /> {t('Digital Books')}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#4B2E2B] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-[#FFF8F0]'
              }`}
            >
              {t(cat.label)}
            </button>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#4B2E2B] text-white font-semibold sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">{t('Title & Author')}</th>
                  <th className="px-6 py-4">{t('Department / Price')}</th>
                  <th className="px-6 py-4">{t('Category')}</th>
                  <th className="px-6 py-4">{t('Status')}</th>
                  <th className="px-6 py-4 text-right">{t('Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {t('No books found for the selected criteria.')}
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((book: Book) => (
                    <tr key={book.id} className="hover:bg-[#FFF8F0] transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 line-clamp-1">{book.title}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{book.author}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-800 font-semibold">{t(book.department || 'General')}</p>
                        <p className="text-xs text-green-700 font-bold mt-0.5 border border-green-200 bg-green-50 inline-block px-1.5 rounded">
                          {book.bookType === 'digital' ? t('Free (Digital)') : `₹${book.rentalPrice}`}
                        </p>
                      </td>
                      <td className="px-6 py-4 capitalize">
                        <span className="bg-gray-100 text-gray-700 py-1 px-3 rounded-md text-xs font-medium">
                          {t(book.category || '')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                          book.status === 'available' ? 'bg-[#138808]/10 text-[#138808] border-[#138808]/20' :
                          book.status === 'reserved' ? 'bg-[#C08552]/10 text-[#C08552] border-[#C08552]/20' :
                          book.status === 'under-repair' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                          'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {t(book.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {book.bookType === 'digital' && (
                          <button 
                            onClick={() => setReadingBook(book)}
                            className="bg-[#138808]/10 text-[#138808] hover:bg-[#138808]/20 px-3 py-1.5 rounded-lg text-xs font-bold mr-3 transition-colors"
                          >
                            {t('Read Online')}
                          </button>
                        )}
                        <button 
                          onClick={() => setEditingBook(book)} 
                          className="text-[#4B2E2B] hover:text-[#C08552] text-xs font-bold underline mr-3"
                        >
                          {t('Edit')}
                        </button>
                        <button 
                          onClick={() => updateBookStatus(book.id, 'lost')}
                          className="text-red-600 hover:text-red-800 text-xs font-bold underline"
                        >
                          {t('Discard')}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-[#FFF8F0] border-t border-gray-200 px-6 py-4 flex items-center justify-between text-sm text-gray-500">
            <p>{t('Showing')} {filteredBooks.length} {t('records')}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderMyActivity = () => {
    const flaggedBooks = books.filter(b => b.status === 'under-repair');

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
          <div className="p-6 border-b border-gray-100 bg-[#4B2E2B] text-white flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <LibraryIcon className="w-5 h-5" /> {t('Recent Catalog Additions')}
            </h3>
          </div>
          <div className="p-0 overflow-y-auto flex-1">
            <div className="divide-y divide-gray-100">
              {books.slice(0, 8).map(book => (
                <div key={book.id} className="p-4 hover:bg-[#FFF8F0] flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{book.title}</p>
                    <p className="text-xs text-gray-500">{t('Added to')}: {t(book.department || 'General')} • {book.location}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-[#138808]" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
          <div className="p-6 border-b border-gray-100 bg-[#C08552] text-white flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> {t('Workflow: Flagged for Repair')}
            </h3>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
              {flaggedBooks.length} {t('Items')}
            </span>
          </div>
          <div className="p-0 overflow-y-auto flex-1">
            {flaggedBooks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                <CheckCircle className="w-12 h-12 mb-2 text-gray-300" />
                <p>{t('No books currently require binding or repair.')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {flaggedBooks.map(book => (
                  <div key={book.id} className="p-5 hover:bg-orange-50/30 flex flex-col gap-3">
                    <div>
                      <p className="font-bold text-gray-900">{book.title}</p>
                      <p className="text-xs text-gray-500">{t('ID:')} {book.id} • {t('Loc:')} {book.location}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => updateBookStatus(book.id, 'available')}
                        className="flex-1 bg-white border border-gray-300 hover:bg-[#FFF8F0] text-gray-700 py-1.5 rounded-lg text-xs font-bold transition-all"
                      >
                        {t('Reshelve')}
                      </button>
                      <button 
                        onClick={() => updateBookStatus(book.id, 'lost')}
                        className="flex-1 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 py-1.5 rounded-lg text-xs font-bold transition-all"
                      >
                        {t('Mark Lost')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderLogs = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#4B2E2B]">{t('System Logs')}</h2>
          <p className="text-gray-500 text-sm mt-1">{t('Immutable audit trail of system events.')}</p>
        </div>
        <button 
          onClick={() => addToast(t('System logs exported successfully'), 'success')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
        >
          <FileText className="w-4 h-4" /> {t('Export CSV')}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col font-mono text-sm">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-[#FFF8F0] text-gray-500 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-6 py-3 font-semibold w-1/4">{t('Timestamp')}</th>
                <th className="px-6 py-3 font-semibold w-1/4">{t('Level')}</th>
                <th className="px-6 py-3 font-semibold w-1/2">{t('Message / Event Detail')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {systemLogs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-400 font-sans">
                    {t('No system events recorded yet.')}
                  </td>
                </tr>
              ) : (
                systemLogs.map((log: SystemLog) => (
                  <tr key={log.id} className="hover:bg-[#FFF8F0]">
                    <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                      {log.timestamp.toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        log.type === 'info' ? 'bg-[#8D7B79]/10 text-[#6B5A58]' :
                        log.type === 'success' ? 'bg-green-100 text-green-700' :
                        log.type === 'warning' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {t(log.type)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-800 w-full">
                      {t(log.message)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#4B2E2B]">{t('Library Configuration')}</h2>
        <p className="text-gray-500 text-sm mt-1">{t('Manage core system rules and operational settings.')}</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
            <Clock className="w-5 h-5 text-[#4B2E2B]" /> {t('Circulation Rules')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('Default Loan Period (Days)')}</label>
              <input 
                type="number" 
                value={localSettings.defaultLoanPeriod} 
                onChange={(e) => setLocalSettings({...localSettings, defaultLoanPeriod: Number(e.target.value)})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#4B2E2B] outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('Maximum Books Per Member')}</label>
              <input 
                type="number" 
                value={localSettings.maxBooksPerMember} 
                onChange={(e) => setLocalSettings({...localSettings, maxBooksPerMember: Number(e.target.value)})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#4B2E2B] outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('Late Fee Per Day (₹)')}</label>
              <input 
                type="number" 
                value={localSettings.lateFeePerDay} 
                onChange={(e) => setLocalSettings({...localSettings, lateFeePerDay: Number(e.target.value)})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#4B2E2B] outline-none" 
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
            <Settings className="w-5 h-5 text-[#4B2E2B]" /> {t('System Controls')}
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">{t('Auto-calculate Late Fees')}</p>
                <p className="text-sm text-gray-500">{t('Automatically apply fines to overdue returns.')}</p>
              </div>
              <div 
                onClick={() => setLocalSettings({...localSettings, autoCalculateLateFees: !localSettings.autoCalculateLateFees})}
                className={`w-12 h-6 rounded-full relative cursor-pointer border ${localSettings.autoCalculateLateFees ? 'bg-[#138808]' : 'bg-gray-200 border-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${localSettings.autoCalculateLateFees ? 'right-0.5' : 'left-0.5'}`} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">{t('Allow Public Registration')}</p>
                <p className="text-sm text-gray-500">{t('Let citizens register via the public portal.')}</p>
              </div>
              <div 
                onClick={() => setLocalSettings({...localSettings, allowPublicRegistration: !localSettings.allowPublicRegistration})}
                className={`w-12 h-6 rounded-full relative cursor-pointer border ${localSettings.allowPublicRegistration ? 'bg-[#138808]' : 'bg-gray-200 border-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${localSettings.allowPublicRegistration ? 'right-0.5' : 'left-0.5'}`} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">{t('Maintenance Mode')}</p>
                <p className="text-sm text-gray-500">{t('Disable public access temporarily.')}</p>
              </div>
              <div 
                onClick={() => setLocalSettings({...localSettings, maintenanceMode: !localSettings.maintenanceMode})}
                className={`w-12 h-6 rounded-full relative cursor-pointer border ${localSettings.maintenanceMode ? 'bg-[#138808]' : 'bg-gray-200 border-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${localSettings.maintenanceMode ? 'right-0.5' : 'left-0.5'}`} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            onClick={() => {
              updateSettings(localSettings);
              addToast(t('Settings saved successfully.'), 'success');
            }}
            className="bg-[#4B2E2B] hover:bg-[#2A1816] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
          >
            <Save className="w-5 h-5" /> {t('Save Configuration')}
          </button>
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
        {activeView === 'logs' && renderLogs()}
        {activeView === 'settings' && renderSettings()}
      </motion.div>

      {readingBook && (
        <BookReader book={readingBook} onClose={() => setReadingBook(null)} />
      )}
      
      <EditBookModal isOpen={!!editingBook} onClose={() => setEditingBook(null)} book={editingBook} />
      <AddBookModal isOpen={showAddBook} onClose={() => setShowAddBook(false)} />
      <BulkImportModal isOpen={showBulkImport} onClose={() => setShowBulkImport(false)} />
    </>
  );
}