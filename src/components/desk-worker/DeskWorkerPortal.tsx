import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLibrary } from '@/context/LibraryContext';
import { 
  Users, BookOpen, Clock, Search, CheckCircle2, 
  Plus, Library as LibraryIcon, BookPlus
} from 'lucide-react';
import type { Book, CitizenFormData, GovtIdType } from '@/types';
import { BookReader } from '@/components/BookReader';
import { AddBookModal } from '@/components/modals/AddBookModal';
import { EditBookModal } from '@/components/modals/EditBookModal';
import { ScannerInterface } from '@/components/desk-worker/ScannerInterface';

export function DeskWorkerPortal() {
  const { 
    activeView, books, reservations, citizens, borrowedBooks,
    markReservationReady, markReservationPickedUp, addCitizen,
    updateBookStatus, searchQuery, setSearchQuery, selectedCategory,
    setSelectedCategory, addToast, t 
  } = useLibrary();

  const [activeFormat, setActiveFormat] = useState<'all' | 'physical' | 'digital'>('all');
  const [readingBook, setReadingBook] = useState<Book | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showAddBook, setShowAddBook] = useState(false);

  const renderDashboard = () => {
    const pendingRes = reservations.filter(r => r.status === 'pending');
    const today = new Date().toLocaleDateString();
    const activeCheckouts = borrowedBooks.filter(b => b.status === 'active').length;
    
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-[#4B2E2B]">{t('Staff Dashboard')}</h2>
          <p className="text-gray-500 text-sm mt-1">{t("Overview of today's library operations.")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-[#C08552]">
            <div className="bg-orange-50 p-4 rounded-xl">
              <Clock className="w-8 h-8 text-[#C08552]" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{pendingRes.length}</p>
              <p className="text-sm text-gray-500 font-medium">{t('Pending Reservations')}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-[#138808]">
            <div className="bg-green-50 p-4 rounded-xl">
              <BookOpen className="w-8 h-8 text-[#138808]" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{activeCheckouts}</p>
              <p className="text-sm text-gray-500 font-medium">{t('Active Checkouts')}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-[#4B2E2B]">
            <div className="bg-[#4B2E2B]/10 p-4 rounded-xl">
              <Users className="w-8 h-8 text-[#4B2E2B]" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{citizens.length}</p>
              <p className="text-sm text-gray-500 font-medium">{t('Total Registered Members')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-96">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#FFF8F0]">
              <h3 className="font-bold text-[#4B2E2B] flex items-center gap-2">
                <Users className="w-5 h-5" /> {t('Live Desk Queue')}
              </h3>
              <span className="text-xs bg-[#4B2E2B]/10 text-[#4B2E2B] py-1 px-3 rounded-full font-bold">{t('Action Needed')}</span>
            </div>
            <div className="p-0 overflow-y-auto flex-1">
              {pendingRes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                  <CheckCircle2 className="w-12 h-12 mb-2 text-gray-300" />
                  <p>{t('Queue is empty. All caught up!')}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {pendingRes.map(res => (
                    <div key={res.id} className="p-4 flex items-center justify-between hover:bg-[#FFF8F0] transition-colors">
                      <div>
                        <p className="font-bold text-gray-900">{res.citizenName}</p>
                        <p className="text-sm text-gray-600 truncate max-w-[200px]">{res.bookTitle}</p>
                        <p className="text-xs text-[#C08552] font-medium mt-1">{t('Loc:')} {res.bookLocation}</p>
                      </div>
                      <button
                        onClick={() => markReservationReady(res.id)}
                        className="bg-[#138808] hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                      >
                        {t('Mark Ready')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-96">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#FFF8F0]">
              <h3 className="font-bold text-[#4B2E2B] flex items-center gap-2">
                <Clock className="w-5 h-5" /> {t('Hourly Desk Traffic')}
              </h3>
              <span className="text-xs text-gray-500">{today}</span>
            </div>
            <div className="p-6 flex-1 flex items-end justify-between gap-2 pb-8">
              {[4, 7, 5, 12, 15, 8, 3].map((val, i) => (
                <div key={i} className="flex flex-col items-center flex-1 gap-2 group">
                  <div className="w-full relative flex justify-center h-48 items-end">
                    <div 
                      className="w-full max-w-[40px] bg-gradient-to-t from-[#4B2E2B] to-[#C08552] rounded-t-md transition-all duration-500 group-hover:opacity-80"
                      style={{ height: `${(val / 15) * 100}%` }}
                    />
                    <div className="absolute -top-8 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {val} {t('actions')}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{9 + i}:00</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAllBooks = () => {
    const categories = [
      { id: 'all', label: 'All Inventory' },
      { id: 'fiction', label: 'Fiction' },
      { id: 'history', label: 'History' },
      { id: 'science', label: 'Science' },
      { id: 'ukpsc', label: 'UKPSC' },
      { id: 'exam', label: 'Exam Prep' } 
    ];

    const filteredBooks = books.filter(book => {
      const matchesSearch = book.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            book.isbn?.includes(searchQuery);
                            
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
            <h2 className="text-2xl font-bold text-[#4B2E2B]">{t('Library Catalog Management')}</h2>
            <p className="text-gray-500 text-sm mt-1">{t('Search inventory by Title, Author, or ISBN.')}</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-full md:w-[400px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("Scan ISBN or type title...")}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#4B2E2B] focus:ring-2 focus:ring-[#4B2E2B]/20 shadow-sm"
              />
            </div>
            <button 
              onClick={() => setShowAddBook(true)}
              className="bg-[#4B2E2B] text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#2A1816] transition-colors whitespace-nowrap"
            >
              <BookPlus className="w-5 h-5" />
              {t('Add Book')}
            </button>
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
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#4B2E2B] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-[#FFF8F0]'
              }`}
            >
              {t(cat.label)}
            </button>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FFF8F0] text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">{t('Book Details')}</th>
                  <th className="px-6 py-4">{t('Category')}</th>
                  <th className="px-6 py-4">{t('Location')}</th>
                  <th className="px-6 py-4">{t('Status')}</th>
                  <th className="px-6 py-4 text-right">{t('Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBooks.map((book: Book) => (
                  <tr key={book.id} className="hover:bg-[#FFF8F0] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{book.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">ISBN: {book.isbn}</p>
                    </td>
                    <td className="px-6 py-4 capitalize">
                      <span className="bg-gray-100 text-gray-700 py-1 px-3 rounded-md text-xs font-medium border border-gray-200">
                        {t(book.category || '')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <LibraryIcon className="w-4 h-4 text-gray-400" />
                        {book.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        book.status === 'available' ? 'bg-[#138808]/10 text-[#138808] border-[#138808]/20' :
                        book.status === 'reserved' ? 'bg-[#C08552]/10 text-[#C08552] border-[#C08552]/20' :
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {t(book.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {book.bookType === 'digital' && (
                        <button 
                          onClick={() => setReadingBook(book)}
                          className="text-[#138808] hover:text-green-800 text-xs font-semibold underline mr-3"
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
                      {book.status === 'available' && book.bookType === 'physical' && (
                        <button 
                          onClick={() => updateBookStatus(book.id, 'under-repair')}
                          className="text-red-600 hover:text-red-800 text-xs font-semibold underline"
                        >
                          {t('Mark Repair')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredBooks.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                <p>{t('No books found matching criteria.')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const [memberForm, setMemberForm] = useState<CitizenFormData>({
    name: '', phone: '', govtIdType: '', govtIdNumber: ''
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name || !memberForm.phone || !memberForm.govtIdType || !memberForm.govtIdNumber) {
      addToast(t('All fields are required.'), 'warning');
      return;
    }
    addCitizen(memberForm);
    setMemberForm({ name: '', phone: '', govtIdType: '', govtIdNumber: '' });
  };

  const renderAddMember = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-[#4B2E2B] mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#C08552]" /> {t('Register New Member')}
          </h3>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t('Full Name')}</label>
              <input 
                type="text" 
                value={memberForm.name}
                onChange={e => setMemberForm({...memberForm, name: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:border-[#4B2E2B] focus:ring-1 focus:ring-[#4B2E2B] outline-none"
                placeholder={t("Enter full name")}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t('Phone Number')}</label>
              <input 
                type="tel" 
                value={memberForm.phone}
                onChange={e => setMemberForm({...memberForm, phone: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:border-[#4B2E2B] focus:ring-1 focus:ring-[#4B2E2B] outline-none"
                placeholder={t("10-digit mobile number")}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t('Govt ID Type')}</label>
              <select 
                value={memberForm.govtIdType}
                onChange={e => setMemberForm({...memberForm, govtIdType: e.target.value as GovtIdType})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:border-[#4B2E2B] focus:ring-1 focus:ring-[#4B2E2B] outline-none bg-white"
              >
                <option value="">{t('Select ID Type')}</option>
                <option value="aadhar">{t('Aadhar Card')}</option>
                <option value="voter-id">{t('Voter ID')}</option>
                <option value="driving-license">{t('Driving License')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t('ID Number')}</label>
              <input 
                type="text" 
                value={memberForm.govtIdNumber}
                onChange={e => setMemberForm({...memberForm, govtIdNumber: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:border-[#4B2E2B] focus:ring-1 focus:ring-[#4B2E2B] outline-none"
                placeholder={t("Enter ID number")}
              />
            </div>
            <button 
              type="submit"
              className="w-full mt-4 bg-[#4B2E2B] hover:bg-[#2A1816] text-white py-3 rounded-lg font-bold transition-colors"
            >
              {t('Register Member')}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
          <div className="p-6 border-b border-gray-100 bg-[#FFF8F0] flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">{t('Member Directory')}</h3>
            <span className="bg-[#138808]/10 text-[#138808] px-3 py-1 rounded-full text-sm font-bold">
              {citizens.length} {t('Total')}
            </span>
          </div>
          <div className="p-0 overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FFF8F0] text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">{t('Name')}</th>
                  <th className="px-6 py-4">{t('Contact')}</th>
                  <th className="px-6 py-4">{t('ID Details')}</th>
                  <th className="px-6 py-4">{t('Status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {citizens.map(c => (
                  <tr key={c.id} className="hover:bg-[#FFF8F0]">
                    <td className="px-6 py-4 font-bold text-gray-900">{c.name}</td>
                    <td className="px-6 py-4 text-gray-600">{c.phone}</td>
                    <td className="px-6 py-4">
                      <p className="text-xs uppercase text-gray-500 font-bold">{t(c.govtIdType || '')}</p>
                      <p className="text-gray-900">{c.govtIdNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${
                        c.status === 'active' ? 'bg-[#138808]/10 text-[#138808] border-[#138808]/20' : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {t(c.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMyActivity = () => {
    const readyReservations = reservations.filter(r => r.status === 'ready');

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="h-full flex flex-col">
          <ScannerInterface />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
          <div className="p-6 border-b border-gray-100 bg-[#FFF8F0] flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#138808]" /> {t('Ready for Pickup')}
            </h3>
            <span className="bg-[#C08552]/10 text-[#C08552] px-3 py-1 rounded-full text-sm font-bold">
              {readyReservations.length} {t('Pending')}
            </span>
          </div>
          <div className="p-0 overflow-y-auto flex-1">
            {readyReservations.length === 0 ? (
              <p className="text-center text-gray-500 py-12">{t('No books currently waiting for pickup.')}</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {readyReservations.map(res => (
                  <div key={res.id} className="p-5 hover:bg-[#FFF8F0] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900 mb-1">{res.citizenName}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md w-fit">
                        <BookOpen className="w-4 h-4" /> {res.bookTitle}
                      </div>
                    </div>
                    <button
                      onClick={() => markReservationPickedUp(res.id)}
                      className="bg-white border-2 border-[#138808] text-[#138808] hover:bg-[#138808] hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
                    >
                      {t('Handover')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

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
        {activeView === 'add-member' && renderAddMember()}
        {activeView === 'my-activity' && renderMyActivity()}
      </motion.div>

      {readingBook && (
        <BookReader book={readingBook} onClose={() => setReadingBook(null)} />
      )}
      
      <EditBookModal isOpen={!!editingBook} onClose={() => setEditingBook(null)} book={editingBook} />
      <AddBookModal isOpen={showAddBook} onClose={() => setShowAddBook(false)} />
    </>
  );
}