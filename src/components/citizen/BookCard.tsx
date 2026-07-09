import { motion } from 'framer-motion';
import { useLibrary } from '@/context/LibraryContext';
import type { Book } from '@/types';
import { GlassCard } from '@/components/GlassCard';
import { MapPin, CheckCircle, Clock, ShoppingCart, IndianRupee } from 'lucide-react';

interface BookCardProps {
  book: Book;
  index: number;
}

export function BookCard({ book, index }: BookCardProps) {
  const { addToCart, cart, reservations, t } = useLibrary();

  const isReserved = reservations.some(r => r.bookId === book.id && r.status !== 'picked-up');
  const userReservation = reservations.find(r => r.bookId === book.id && r.citizenId === 'cit-1');
  const isInCart = cart.some(item => item.bookId === book.id);

  const getStatusBadge = () => {
    if (userReservation) {
      switch (userReservation.status) {
        case 'pending': return <span className="badge-pending flex items-center gap-1"><Clock className="w-3 h-3" /> {t('pending')}</span>;
        case 'ready': return <span className="badge-ready flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {t('readyForPickup')}</span>;
        default: return null;
      }
    }
    switch (book.status) {
      case 'available': return <span className="badge-available">{t('available')}</span>;
      case 'checked-out': return <span className="badge-checked-out">{t('checkedOut')} {book.dueDate && `- Due ${book.dueDate.toLocaleDateString()}`}</span>;
      case 'reserved': return <span className="badge-pending">{t('reserved')}</span>;
      default: return null;
    }
  };

  const canAddToCart = book.status === 'available' && !isReserved && !isInCart && book.bookType === 'physical';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="h-full"
    >
      <GlassCard className="h-full flex flex-col overflow-hidden group">
        <div className="h-40 bg-gradient-to-br from-[#E8DCD0] via-[#FAF6F0] to-[#DCCBBF] flex items-center justify-center border-b border-[#E8DCD0] relative">
          <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-[10px] font-bold text-gray-600 shadow-sm border border-gray-200">
            {book.department || 'General Library'}
          </div>
          <div className="w-20 h-28 bg-white rounded shadow-md flex items-center justify-center border border-[#E8DCD0]">
            <span className="text-4xl font-bold text-[#4B2E2B]/20">{book.title.charAt(0)}</span>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
             <span className="text-xs font-bold text-[#C08552] uppercase tracking-wide">{t(book.category)}</span>
             {book.bookType === 'physical' && (
               <span className="flex items-center text-sm font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                 <IndianRupee className="w-3 h-3" /> {book.rentalPrice}
               </span>
             )}
          </div>
          
          <h3 className="font-bold text-[#4B2E2B] mb-1 line-clamp-2" title={book.title}>{book.title}</h3>
          <p className="text-sm text-[#6B5A58] mb-3">{book.author}</p>
          
          <div className="flex items-center gap-1 text-xs text-[#8D7B79] mb-4">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="line-clamp-1">{book.location}</span>
          </div>

          <div className="mt-auto space-y-3">
            {getStatusBadge()}
            
            {book.bookType === 'physical' ? (
               <motion.button
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={() => addToCart(book.id)}
                 disabled={!canAddToCart}
                 className={`w-full text-sm py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                   isInCart 
                     ? 'bg-green-100 text-green-700 border border-green-200 cursor-not-allowed'
                     : canAddToCart 
                       ? 'bg-[#4B2E2B] text-white hover:bg-[#2A1816] shadow-md shadow-[#4B2E2B]/20'
                       : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                 }`}
               >
                 {isInCart ? <><CheckCircle className="w-4 h-4" /> In Cart</> : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
               </motion.button>
            ) : (
               <motion.button
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 disabled={book.status !== 'available'}
                 className="w-full text-sm py-2 rounded-xl font-semibold bg-[#138808] text-white hover:bg-green-700 shadow-md flex justify-center items-center"
               >
                 Access Digital Copy
               </motion.button>
            )}
            
            {userReservation?.status === 'ready' && (
              <div className="text-xs text-center text-[#C08552] font-medium">Pick up at front desk</div>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}