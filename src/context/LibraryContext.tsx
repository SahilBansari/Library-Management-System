import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { 
  UserRole, Language, Book, Reservation, Toast, BookStatus, Citizen, BookFormData,
  CitizenFormData, CSVImportResult, LateFeeCalculation, BorrowedBook, GovtIdType,
  SystemLog, LibrarySettings, CartItem, HotFolderConfig
} from '@/types';
import { 
  mockBooks, mockReservations, mockCurrentCitizen, mockAllCitizens, mockBorrowedBooks,
  mockCSVImportResult, translations 
} from '@/data/mockData';

interface LibraryContextType {
  // User & View State
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeView: string;
  setActiveView: (view: string) => void;

  // System Logs
  systemLogs: SystemLog[];
  addLog: (message: string, type: SystemLog['type']) => void;
  
  // Language State
  currentLanguage: Language;
  setCurrentLanguage: (lang: Language) => void;
  t: (key: string) => string;
  
  // Global Settings
  settings: LibrarySettings;
  updateSettings: (newSettings: Partial<LibrarySettings>) => void;

  // Books State (CRUD)
  books: Book[];
  updateBookStatus: (bookId: string, status: BookStatus) => void;
  addBook: (bookData: BookFormData) => void;
  updateBook: (bookId: string, bookData: Partial<BookFormData>) => void;
  deleteBook: (bookId: string) => void;
  bulkImportBooks: (csvData: string) => CSVImportResult;
  updateBookLocation: (bookId: string, floor: string, row: string, shelf: string) => void;
  markBookCondition: (bookId: string, condition: 'needs-binding' | 'lost') => void;
  
  // Hot Folder Sync System
  hotFolderConfig: HotFolderConfig | null;
  setupHotFolderSync: (config: Omit<HotFolderConfig, 'totalSynced'>) => void;
  triggerHotFolderSync: () => void;

  // Rental Cart System
  cart: CartItem[];
  addToCart: (bookId: string) => void;
  removeFromCart: (bookId: string) => void;
  clearCart: () => void;
  checkoutCart: (citizenId: string, paymentMethod: 'cash' | 'online') => void;

  // Reservations State
  reservations: Reservation[];
  addReservation: (bookId: string) => void;
  markReservationReady: (reservationId: string) => void;
  markReservationPickedUp: (reservationId: string) => void;
  
  // Citizens State
  citizens: Citizen[];
  currentCitizen: Citizen;
  addCitizen: (citizenData: CitizenFormData) => void;
  updateCitizen: (citizenId: string, citizenData: Partial<CitizenFormData>) => void;
  suspendCitizen: (citizenId: string, reason: string) => void;
  reactivateCitizen: (citizenId: string) => void;
  searchCitizen: (query: string) => Citizen | null;
  
  // Circulation State
  borrowedBooks: BorrowedBook[];
  checkOutBook: (citizenId: string, bookId: string) => void; // Legacy single checkout
  returnBook: (bookId: string) => void;
  extendDueDate: (borrowId: string, additionalDays: number) => void;
  calculateLateFee: (borrowId: string) => LateFeeCalculation | null;
  collectFine: (borrowId: string) => void;
  waiveFine: (borrowId: string, reason: string) => void;
  
  // Toast & Search & Modals
  toasts: Toast[];
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
  scannedCitizen: string | null;
  scannedBook: string | null;
  setScannedCitizen: (id: string | null) => void;
  setScannedBook: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  modalData: unknown;
  setModalData: (data: unknown) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>(null);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  
  // Core Data Arrays
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [citizens, setCitizens] = useState<Citizen[]>(mockAllCitizens);
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>(mockBorrowedBooks);
  
  // System State Arrays
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hotFolderConfig, setHotFolderConfig] = useState<HotFolderConfig | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // UI Interaction States
  const [scannedCitizen, setScannedCitizen] = useState<string | null>(null);
  const [scannedBook, setScannedBook] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<unknown>(null);

  const [settings, setSettings] = useState<LibrarySettings>({
    defaultLoanPeriod: 14,
    maxBooksPerMember: 5,
    lateFeePerDay: 10,
    autoCalculateLateFees: true,
    allowPublicRegistration: true,
    maintenanceMode: false
  });

  // Handle RTL Layout Globally
  useEffect(() => {
    const isRTL = currentLanguage === 'ur' || currentLanguage === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const newToast: Toast = { id: `toast-${Date.now()}`, message, type, duration: 3000 };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => removeToast(newToast.id), 3000);
  }, [removeToast]);

  const addLog = useCallback((message: string, type: SystemLog['type']) => {
    const newLog: SystemLog = { id: `log-${Date.now()}`, message, type, timestamp: new Date() };
    setSystemLogs(prev => [newLog, ...prev]);
  }, []);

  const t = useCallback((key: string): string => {
    // Add fallback so it doesn't break if translation is missing
    const langTranslations = translations[currentLanguage] as Record<string, string>;
    return langTranslations?.[key] || key;
  }, [currentLanguage]);

  const updateSettings = useCallback((newSettings: Partial<LibrarySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addLog('Library settings updated globally', 'info');
  }, [addLog]);

  const updateBookStatus = useCallback((bookId: string, status: BookStatus) => {
    setBooks(prev => prev.map(book => book.id === bookId ? { ...book, status } : book));
    addLog(`Book ${bookId} status updated to ${status}`, 'info');
  }, [addLog]);

  const addBook = useCallback((bookData: BookFormData) => {
    const isDigital = bookData.bookType === 'digital';
    const newBook: Book = {
      id: `book-${Date.now()}`,
      title: bookData.title,
      author: bookData.author,
      isbn: bookData.isbn,
      publishYear: parseInt(bookData.publishYear),
      category: bookData.category as Book['category'],
      department: bookData.department,
      rentalPrice: parseFloat(bookData.rentalPrice || '0'),
      bookType: bookData.bookType,
      floor: bookData.floor,
      row: bookData.row,
      shelf: bookData.shelf,
      location: isDigital ? 'Digital Archive Server' : `Floor ${bookData.floor}, Row ${bookData.row}, Shelf ${bookData.shelf}`,
      status: 'available',
      description: bookData.description,
      digitalContent: bookData.digitalContent,
      digitalPages: bookData.digitalPages,
      fileUrl: bookData.fileUrl,
      conditionNotes: isDigital ? 'N/A' : 'New',
    };
    setBooks(prev => [newBook, ...prev]);
    addToast(isDigital ? `Digital copy uploaded: ${newBook.title}` : `Book added: ${newBook.title}`, 'success');
    addLog(`Added new book: ${newBook.title} (${newBook.department || 'General'})`, 'success');
  }, [addLog, addToast]);

  const updateBook = useCallback((bookId: string, bookData: Partial<BookFormData>) => {
    setBooks(prev => prev.map(book => {
      if (book.id !== bookId) return book;
      const updatedBook = { ...book, ...bookData };
      if (bookData.publishYear) updatedBook.publishYear = parseInt(bookData.publishYear);
      if (bookData.rentalPrice) updatedBook.rentalPrice = parseFloat(bookData.rentalPrice);
      if (bookData.category) updatedBook.category = bookData.category as Book['category'];
      return updatedBook as Book;
    }));
    addToast('Book updated successfully', 'success');
    addLog(`Updated book: ${bookId}`, 'info');
  }, [addLog, addToast]);

  const deleteBook = useCallback((bookId: string) => {
    setBooks(prev => prev.map(book => book.id === bookId ? { ...book, status: 'lost' as BookStatus } : book));
    addToast('Book marked as lost/discarded', 'info');
    addLog(`Book ${bookId} marked as lost/discarded`, 'warning');
  }, [addLog, addToast]);

  const bulkImportBooks = useCallback((_csvData: string): CSVImportResult => {
    addToast('Offline CSV import simulated successfully', 'success');
    addLog('Bulk imported books via offline CSV', 'success');
    return mockCSVImportResult;
  }, [addLog, addToast]);

  const updateBookLocation = useCallback((bookId: string, floor: string, row: string, shelf: string) => {
    setBooks(prev => prev.map(book => book.id === bookId ? { ...book, floor, row, shelf, location: `Floor ${floor}, Row ${row}, Shelf ${shelf}` } : book));
    addToast('Book location updated', 'success');
    addLog(`Updated location for book: ${bookId}`, 'info');
  }, [addLog, addToast]);

  const markBookCondition = useCallback((bookId: string, condition: 'needs-binding' | 'lost') => {
    setBooks(prev => prev.map(book => book.id === bookId ? { ...book, status: condition === 'needs-binding' ? 'under-repair' : 'lost', conditionNotes: condition === 'needs-binding' ? 'Needs binding' : 'Lost/Discarded'} : book));
    addToast(`Book marked as ${condition === 'needs-binding' ? 'needs binding' : 'lost'}`, 'info');
    addLog(`Condition for book ${bookId} marked as ${condition}`, 'warning');
  }, [addLog, addToast]);

  // Hot Folder Synchronization
  const setupHotFolderSync = useCallback((config: Omit<HotFolderConfig, 'totalSynced'>) => {
    setHotFolderConfig({ ...config, totalSynced: 0, lastSyncedAt: new Date() });
    addToast(`Hot folder pointing to ${config.folderPath} established.`, 'success');
    addLog(`Hot folder sync initialized for ${config.targetDepartment}`, 'info');
  }, [addToast, addLog]);

  const triggerHotFolderSync = useCallback(() => {
    if (!hotFolderConfig) return;
    addToast('Simulating hot folder digital ingest...', 'info');
    setTimeout(() => {
      addToast('5 new digital files automatically synced and cataloged.', 'success');
      setHotFolderConfig(prev => prev ? { ...prev, totalSynced: prev.totalSynced + 5, lastSyncedAt: new Date() } : null);
      addLog(`Hot folder pulled 5 items into ${hotFolderConfig.targetDepartment}`, 'success');
    }, 1500);
  }, [hotFolderConfig, addToast, addLog]);

  // Rental Cart Operations
  const addToCart = useCallback((bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book || book.status !== 'available') {
      addToast('Book is not available for rental.', 'error');
      return;
    }
    if (cart.find(item => item.bookId === bookId)) {
      addToast('Book is already in the cart.', 'warning');
      return;
    }
    setCart(prev => [...prev, { bookId: book.id, title: book.title, rentalPrice: book.rentalPrice, bookType: book.bookType }]);
    addToast(`${book.title} added to cart.`, 'success');
  }, [books, cart, addToast]);

  const removeFromCart = useCallback((bookId: string) => {
    setCart(prev => prev.filter(item => item.bookId !== bookId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const checkoutCart = useCallback((citizenId: string, paymentMethod: 'cash' | 'online') => {
    const citizen = citizens.find(c => c.id === citizenId);
    if (!citizen || !citizen.isClearToBorrow) {
      addToast('Cannot process rental checkout. Member has outstanding issues.', 'error');
      return;
    }

    if (cart.length === 0) return;

    const totalAmount = cart.reduce((sum, item) => sum + item.rentalPrice, 0);
    
    const newBorrows = cart.map(item => {
      updateBookStatus(item.bookId, 'checked-out');
      return {
        id: `borrow-${Date.now()}-${item.bookId}`,
        bookId: item.bookId,
        bookTitle: item.title,
        bookAuthor: books.find(b => b.id === item.bookId)?.author || 'Unknown',
        borrowedAt: new Date(),
        dueDate: new Date(Date.now() + settings.defaultLoanPeriod * 24 * 60 * 60 * 1000),
        status: 'active' as const,
        rentalFeePaid: item.rentalPrice
      };
    });

    setBorrowedBooks(prev => [...newBorrows, ...prev]);
    addToast(`Rental successful! Total paid via ${paymentMethod}: ₹${totalAmount}`, 'success');
    addLog(`Cart checkout: ${cart.length} books rented to ${citizenId} for ₹${totalAmount}`, 'success');
    
    clearCart();
  }, [cart, citizens, books, settings.defaultLoanPeriod, updateBookStatus, addToast, addLog, clearCart]);

  // Reservations
  const addReservation = useCallback((bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    const newReservation: Reservation = { id: `res-${Date.now()}`, bookId: book.id, bookTitle: book.title, bookAuthor: book.author, bookLocation: book.location, citizenId: mockCurrentCitizen.id, citizenName: mockCurrentCitizen.name, status: 'pending', requestedAt: new Date() };
    setReservations(prev => [newReservation, ...prev]);
    updateBookStatus(bookId, 'reserved');
    addToast(`Reserved: ${book.title}`, 'success');
    addLog(`New reservation created for book ${bookId} by ${mockCurrentCitizen.id}`, 'info');
  }, [books, updateBookStatus, addLog, addToast]);

  const markReservationReady = useCallback((reservationId: string) => {
    setReservations(prev => prev.map(res => res.id === reservationId ? { ...res, status: 'ready', readyAt: new Date() } : res));
    const reservation = reservations.find(r => r.id === reservationId);
    if (reservation) {
      addToast(`Book ready for ${reservation.citizenName}`, 'success');
      addLog(`Reservation ${reservationId} marked as ready`, 'info');
    }
  }, [reservations, addLog, addToast]);

  const markReservationPickedUp = useCallback((reservationId: string) => {
    const reservation = reservations.find(res => res.id === reservationId);
    if (!reservation) return;
    
    const book = books.find(b => b.id === reservation.bookId);
    const rentalFee = book ? book.rentalPrice : 0;

    setReservations(prev => prev.map(res => res.id === reservationId ? { ...res, status: 'picked-up', pickedUpAt: new Date() } : res));
    
    const newBorrow: BorrowedBook = {
      id: `borrow-${Date.now()}`, 
      bookId: reservation.bookId, 
      bookTitle: reservation.bookTitle, 
      bookAuthor: reservation.bookAuthor,
      borrowedAt: new Date(), 
      dueDate: new Date(Date.now() + settings.defaultLoanPeriod * 24 * 60 * 60 * 1000), 
      status: 'active',
      rentalFeePaid: rentalFee
    };
    
    setBorrowedBooks(prev => [newBorrow, ...prev]);
    updateBookStatus(reservation.bookId, 'checked-out');

    addToast(`Handover successful for ${reservation.citizenName}`, 'success');
    addLog(`Reservation ${reservationId} picked up and checked out`, 'success');
  }, [reservations, books, settings.defaultLoanPeriod, updateBookStatus, addToast, addLog]);

  // Citizens
  const addCitizen = useCallback((citizenData: CitizenFormData) => {
    const newCitizen: Citizen = { id: `cit-${Date.now()}`, name: citizenData.name, email: '', phone: citizenData.phone, memberSince: new Date(), membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), booksRead: 0, currentStreak: 0, totalReservations: 0, hasLateFees: false, lateFeeAmount: 0, isClearToBorrow: true, status: 'active', govtIdType: citizenData.govtIdType as GovtIdType, govtIdNumber: citizenData.govtIdNumber };
    setCitizens(prev => [newCitizen, ...prev]);
    addToast(`Member registered: ${newCitizen.name}`, 'success');
    addLog(`New member registered: ${newCitizen.id}`, 'success');
  }, [addLog, addToast]);

  const updateCitizen = useCallback((citizenId: string, citizenData: Partial<CitizenFormData>) => {
    setCitizens(prev => prev.map(citizen => {
      if (citizen.id !== citizenId) return citizen;
      return { ...citizen, ...citizenData, govtIdType: citizenData.govtIdType as GovtIdType || citizen.govtIdType };
    }));
    addToast('Member profile updated', 'success');
    addLog(`Member profile updated: ${citizenId}`, 'info');
  }, [addLog, addToast]);

  const suspendCitizen = useCallback((citizenId: string, reason: string) => {
    setCitizens(prev => prev.map(citizen => citizen.id === citizenId ? { ...citizen, status: 'suspended', suspendReason: reason, isClearToBorrow: false } : citizen));
    addToast('Member account suspended', 'warning');
    addLog(`Member account suspended: ${citizenId}. Reason: ${reason}`, 'warning');
  }, [addLog, addToast]);

  const reactivateCitizen = useCallback((citizenId: string) => {
    setCitizens(prev => prev.map(citizen => citizen.id === citizenId ? { ...citizen, status: 'active', suspendReason: undefined, isClearToBorrow: citizen.lateFeeAmount === 0 } : citizen));
    addToast('Member account reactivated', 'success');
    addLog(`Member account reactivated: ${citizenId}`, 'success');
  }, [addLog, addToast]);

  const searchCitizen = useCallback((query: string): Citizen | null => {
    return citizens.find(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.phone.includes(query) || c.govtIdNumber.includes(query)) || null;
  }, [citizens]);

  // Circulation
  const checkOutBook = useCallback((citizenId: string, bookId: string) => {
    const book = books.find(b => b.id === bookId);
    const citizen = citizens.find(c => c.id === citizenId);
    if (!book || !citizen) return;

    if (!citizen.isClearToBorrow) {
       addToast(`${citizen.name} has outstanding late fees. Please clear before checkout.`, 'error');
       return;
    }

    if (book.status === 'reserved' || book.status === 'ready') {
      const activeReservation = reservations.find(r => r.bookId === bookId && r.status !== 'picked-up' && r.status !== 'cancelled');
      if (activeReservation && activeReservation.citizenId !== citizenId) {
        addToast(`Cannot check out. This book is reserved by ${activeReservation.citizenName}.`, 'error');
        return;
      }
      
      if (activeReservation) {
         setReservations(prev => prev.map(res => res.id === activeReservation.id ? { ...res, status: 'picked-up', pickedUpAt: new Date() } : res));
      }
    } else if (book.status !== 'available') {
      addToast('Book is currently unavailable for checkout', 'error');
      return;
    }

    const newBorrow: BorrowedBook = {
      id: `borrow-${Date.now()}`, bookId: book.id, bookTitle: book.title, bookAuthor: book.author,
      borrowedAt: new Date(), dueDate: new Date(Date.now() + settings.defaultLoanPeriod * 24 * 60 * 60 * 1000), 
      status: 'active', rentalFeePaid: book.rentalPrice
    };
    
    setBorrowedBooks(prev => [newBorrow, ...prev]);
    updateBookStatus(book.id, 'checked-out');
    addToast(`Successfully checked out: ${book.title}`, 'success');
    addLog(`Book ${bookId} checked out to citizen ${citizenId}`, 'info');
  }, [books, citizens, reservations, settings.defaultLoanPeriod, updateBookStatus, addToast, addLog]);

  const returnBook = useCallback((bookId: string) => {
    const activeBorrow = borrowedBooks.find(b => b.bookId === bookId && (b.status === 'active' || b.status === 'overdue'));
    if (!activeBorrow) {
      addToast('No active checkout record found for this book.', 'error');
      return;
    }

    setBorrowedBooks(prev => prev.map(b => b.id === activeBorrow.id ? { ...b, status: 'returned', returnedAt: new Date() } : b));
    updateBookStatus(bookId, 'available');
    addToast(`Successfully returned: ${activeBorrow.bookTitle}`, 'success');
    addLog(`Book ${bookId} returned`, 'info');
  }, [borrowedBooks, updateBookStatus, addToast, addLog]);

  const extendDueDate = useCallback((borrowId: string, additionalDays: number) => {
    setBorrowedBooks(prev => prev.map(book => book.id === borrowId ? { ...book, dueDate: new Date(book.dueDate.getTime() + additionalDays * 24 * 60 * 60 * 1000) } : book));
    addToast(`Due date extended by ${additionalDays} days`, 'success');
  }, [addToast]);

  const calculateLateFee = useCallback((borrowId: string): LateFeeCalculation | null => {
    const borrowedBook = borrowedBooks.find(b => b.id === borrowId);
    if (!borrowedBook || borrowedBook.status !== 'overdue') return null;
    const daysLate = Math.ceil((new Date().getTime() - borrowedBook.dueDate.getTime()) / (1000 * 60 * 60 * 24));
    return { daysLate, finePerDay: settings.lateFeePerDay, totalFine: daysLate * settings.lateFeePerDay, bookTitle: borrowedBook.bookTitle, dueDate: borrowedBook.dueDate };
  }, [borrowedBooks, settings.lateFeePerDay]);

  const collectFine = useCallback((borrowId: string) => {
    setBorrowedBooks(prev => prev.map(book => {
      if (book.id === borrowId) {
        updateBookStatus(book.bookId, 'available');
        return { ...book, finePaid: true, status: 'returned' };
      }
      return book;
    }));
    addToast('Fine collected and book returned', 'success');
  }, [updateBookStatus, addToast]);

  const waiveFine = useCallback((borrowId: string, reason: string) => {
    setBorrowedBooks(prev => prev.map(book => {
      if (book.id === borrowId) {
        updateBookStatus(book.bookId, 'available');
        return { ...book, finePaid: true, fineAmount: 0, status: 'returned' };
      }
      return book;
    }));
    addToast(`Fine waived: ${reason}`, 'info');
  }, [updateBookStatus, addToast]);

  const value: LibraryContextType = {
    currentRole, setCurrentRole, activeView, setActiveView, systemLogs, addLog, currentLanguage, setCurrentLanguage, t,
    settings, updateSettings, books, updateBookStatus, addBook, updateBook, deleteBook, bulkImportBooks, updateBookLocation, markBookCondition,
    setupHotFolderSync, triggerHotFolderSync, hotFolderConfig, 
    cart, addToCart, removeFromCart, clearCart, checkoutCart,
    reservations, addReservation, markReservationReady, markReservationPickedUp, citizens, currentCitizen: mockCurrentCitizen, addCitizen, updateCitizen, suspendCitizen, reactivateCitizen, searchCitizen,
    borrowedBooks, checkOutBook, returnBook, extendDueDate, calculateLateFee, collectFine, waiveFine, toasts, addToast, removeToast,
    scannedCitizen, scannedBook, setScannedCitizen, setScannedBook, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, activeModal, setActiveModal, modalData, setModalData,
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (context === undefined) throw new Error('useLibrary must be used within a LibraryProvider');
  return context;
}