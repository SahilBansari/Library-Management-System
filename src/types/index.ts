// User Roles
export type UserRole = 'citizen' | 'desk-worker' | 'admin' | null;

// Language Support (UPDATED)
export type Language = 'en' | 'hi' | 'ur' | 'mr' | 'sa' | 'ar';

// Book Status
export type BookStatus = 'available' | 'reserved' | 'ready' | 'checked-out' | 'under-repair' | 'lost';

// Book Category
export type BookCategory = 'ukpsc' | 'fiction' | 'children' | 'history' | 'science' | 'technology' | 'literature';

// Book Format
export type BookType = 'physical' | 'digital';

// Government ID Types
export type GovtIdType = 'aadhar' | 'voter-id' | 'driving-license' | 'passport';

// Member Status
export type MemberStatus = 'active' | 'suspended' | 'expired';

// Book Interface
export interface Book {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  department?: string;
  rentalPrice: number;
  status: BookStatus;
  bookType: BookType;
  location: string;
  floor: string;
  row: string;
  shelf: string;
  coverImage?: string;
  isbn: string;
  publishYear: number;
  description: string;
  digitalContent?: string;
  digitalPages?: string[];
  fileUrl?: string;
  dueDate?: Date;
  conditionNotes?: string;
}

// Book Form Data (for CRUD)
export interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  publishYear: string;
  category: BookCategory | '';
  department: string;
  rentalPrice: string;
  bookType: BookType;
  floor: string;
  row: string;
  shelf: string;
  description: string;
  digitalContent?: string;
  digitalPages?: string[];
  fileUrl?: string;
}

// Rental Cart Item
export interface CartItem {
  bookId: string;
  title: string;
  rentalPrice: number;
  bookType: BookType;
}

// Hot Folder Configuration for Bulk Import
export interface HotFolderConfig {
  isActive: boolean;
  folderPath: string;
  targetDepartment: string;
  targetCategory: BookCategory | '';
  defaultPrice: number;
  lastSyncedAt?: Date;
  totalSynced: number;
}

// Reservation Interface
export interface Reservation {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookLocation: string;
  citizenId: string;
  citizenName: string;
  citizenPhoto?: string;
  status: 'pending' | 'ready' | 'picked-up' | 'cancelled';
  requestedAt: Date;
  readyAt?: Date;
  pickedUpAt?: Date;
}

// Borrowed Book Interface
export interface BorrowedBook {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  borrowedAt: Date;
  dueDate: Date;
  returnedAt?: Date;
  status: 'active' | 'returned' | 'overdue';
  rentalFeePaid: number;
  fineAmount?: number;
  finePaid?: boolean;
}

// Citizen/Member Profile
export interface Citizen {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  memberSince: Date;
  membershipExpiry: Date;
  booksRead: number;
  currentStreak: number;
  totalReservations: number;
  hasLateFees: boolean;
  lateFeeAmount: number;
  isClearToBorrow: boolean;
  status: MemberStatus;
  suspendReason?: string;
  govtIdType: GovtIdType;
  govtIdNumber: string;
}

// Citizen Form Data (for CRUD)
export interface CitizenFormData {
  name: string;
  phone: string;
  govtIdType: GovtIdType | '';
  govtIdNumber: string;
}

// Desk Worker Stats
export interface DeskWorkerStats {
  pendingReservations: number;
  booksReturnedToday: number;
  booksCheckedOutToday: number;
  hourlyTraffic: HourlyTraffic[];
}

export interface HourlyTraffic {
  hour: string;
  checkouts: number;
  returns: number;
}

// Admin KPIs
export interface AdminKPIs {
  totalBooks: number;
  activeReaders: number;
  todayFootfall: number;
  procurementBudget: number;
  totalRevenue: number;
  booksBorrowedByCategory: CategoryStat[];
  booksByDepartment: DepartmentStat[];
  revenueByDepartment: RevenueStat[];
  bookHealth: BookHealthStat[];
}

export interface CategoryStat {
  category: string;
  count: number;
}

export interface DepartmentStat {
  department: string;
  count: number;
}

export interface RevenueStat {
  department: string;
  amount: number;
}

export interface BookHealthStat {
  status: 'good' | 'needs-binding' | 'lost';
  count: number;
}

// Internal Workflow Item
export interface WorkflowItem {
  id: string;
  bookId: string;
  bookTitle: string;
  currentStatus: 'returned' | 'flagged-for-repair' | 'in-binding' | 'reshelved';
  flaggedBy?: string;
  flaggedAt?: Date;
  action?: 'reshelve' | 'send-to-binding' | 'mark-lost';
}

// Reading Stats for Citizen Dashboard
export interface ReadingStats {
  booksReadThisYear: number;
  currentStreak: number;
  genresExplored: GenreStat[];
  monthlyReading: MonthlyReading[];
}

export interface GenreStat {
  genre: string;
  percentage: number;
  count: number;
}

export interface MonthlyReading {
  month: string;
  booksRead: number;
}

// Toast Notification
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

// CSV Import Result
export interface CSVImportResult {
  success: number;
  errors: number;
  errorDetails: string[];
}

// Fine Waiver Reason
export type WaiverReason = 'medical' | 'weather' | 'system-error' | 'staff-discretion' | 'other';

// Late Fee Calculation
export interface LateFeeCalculation {
  daysLate: number;
  finePerDay: number;
  totalFine: number;
  bookTitle: string;
  dueDate: Date;
}

// System Logs for Admin
export interface SystemLog {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
}

// Global Library Settings
export interface LibrarySettings {
  defaultLoanPeriod: number;
  maxBooksPerMember: number;
  lateFeePerDay: number;
  autoCalculateLateFees: boolean;
  allowPublicRegistration: boolean;
  maintenanceMode: boolean;
}