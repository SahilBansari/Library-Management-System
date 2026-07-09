import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLibrary } from '@/context/LibraryContext';
import { User, LogOut, ChevronDown, ShoppingCart, X, CreditCard, Banknote, Trash2, IndianRupee, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'ur', label: 'اردو' },
  { code: 'mr', label: 'मराठी' },
  { code: 'sa', label: 'संस्कृत' },
  { code: 'ar', label: 'عربي' },
] as const;

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { 
    currentRole, 
    setCurrentRole, 
    currentLanguage, 
    setCurrentLanguage, 
    t,
    currentCitizen,
    cart,
    removeFromCart,
    checkoutCart,
    clearCart
  } = useLibrary();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('online');

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  const handleLogout = () => {
    setCurrentRole(null);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.rentalPrice, 0);

  const handleCheckout = () => {
    if (!currentCitizen) return;
    checkoutCart(currentCitizen.id, paymentMethod);
    setIsCartOpen(false);
  };

  return (
    <>
      {/* Reduced height to 64px for a tighter, cleaner look */}
      <nav className="relative z-[100] h-[64px] w-full bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E8DCD0] flex items-center">
        <div className="w-full px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between w-full gap-2">
            
            {/* Left Section */}
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              {currentRole && onMenuClick && (
                <button 
                  onClick={onMenuClick} 
                  className="lg:hidden p-1.5 sm:p-2 text-[#6B5A58] hover:bg-[#F0E6D9]/50 rounded-lg transition-colors shrink-0"
                >
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}
              
              <div className="bg-[#FFF8F0] p-1 sm:p-1.5 rounded-lg shadow-sm border border-[#E8DCD0] shrink-0">
                <img 
                  src="/uttarakhand-emblem.png" 
                  alt="State Emblem" 
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                />
              </div>
              <h1 className="text-sm sm:text-xl font-extrabold text-[#4B2E2B] tracking-tight truncate">
                {t('appName')}
              </h1>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-6 lg:gap-8 shrink-0">
              
              {/* Contact Us */}
              <div className="hidden lg:flex items-center text-sm font-bold text-[#4B2E2B] tracking-wide">
                Contact Us : 7021950643
              </div>

              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-md bg-[#FFF8F0] border border-[#E8DCD0] hover:bg-[#F0E6D9] transition-colors text-[10px] sm:text-xs font-bold text-[#4B2E2B] shadow-sm shrink-0">
                    <span className="uppercase">{currentLanguage}</span>
                    <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-[9999] bg-[#FAF6F0]/95 backdrop-blur-xl border-[#E8DCD0] rounded-xl shadow-2xl min-w-[120px] mt-2">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setCurrentLanguage(lang.code as typeof currentLanguage)}
                      className="cursor-pointer text-sm font-medium text-[#4B2E2B] focus:bg-[#C08552]/10 focus:text-[#4B2E2B] rounded-lg m-1"
                    >
                      {lang.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Orbit Avanya Branding */}
              <div className="flex flex-col items-center justify-center pl-2 sm:pl-6 border-l border-[#E8DCD0] shrink-0">
                <img 
                  src="/Orbitlogo.png" 
                  alt="OrbitAvanya Tech" 
                  className="w-16 sm:w-24 lg:w-32 h-auto object-contain"
                />
                <span className="text-[4px] sm:text-[5px] lg:text-[6px] font-extrabold text-[#1e293b] tracking-tight mt-0.5 whitespace-nowrap uppercase text-center w-full block">
                  Building a Smarter Bharat with AI
                </span>
              </div>

              {/* Authenticated Controls Only */}
              {currentRole === 'citizen' && (
                <div className="relative border-l border-[#E8DCD0] pl-2 sm:pl-6 shrink-0">
                  <button 
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-1.5 sm:p-2 text-[#4B2E2B] hover:bg-[#F0E6D9] rounded-full transition-colors flex items-center justify-center group"
                  >
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                    {cart.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center shadow-md border-2 border-[#FFF8F0]">
                        {cart.length}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {currentRole && (
                <div className="flex items-center gap-2 sm:gap-4 border-l border-[#E8DCD0] pl-2 sm:pl-6 shrink-0">
                  <div className="hidden lg:flex items-center gap-2 text-sm font-bold text-[#4B2E2B]">
                    <div className="w-8 h-8 rounded-full bg-[#F5EFE6] flex items-center justify-center border border-[#E8DCD0]">
                      <User className="w-4 h-4 text-[#C08552]" />
                    </div>
                    <span>{currentCitizen?.name || 'User'}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-primary flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm"
                  >
                    <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{t('Logout')}</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </nav>

      {/* Cart Drawer Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[9999] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative h-full w-full sm:w-[450px] bg-[#FFF8F0] shadow-2xl flex flex-col border-l border-[#E8DCD0]"
            >
              <div className="p-6 border-b border-[#E8DCD0] flex items-center justify-between bg-white shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-[#4B2E2B] flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6" /> {t('Rental Checkout')}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">{t('Review your selections')}</p>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)} 
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                      <ShoppingCart className="w-12 h-12 text-gray-300" />
                    </div>
                    <p className="font-bold text-lg text-gray-700">{t('Your cart is empty')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">{cart.length} {t('Items')}</span>
                      <button onClick={clearCart} className="text-xs font-bold text-red-500 hover:text-red-700 underline flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> {t('Clear Cart')}
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={item.bookId} className="bg-white p-4 rounded-xl border border-[#E8DCD0] flex items-center justify-between shadow-sm">
                          <div className="pr-4">
                            <p className="font-bold text-[#4B2E2B] line-clamp-1">{item.title}</p>
                            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] uppercase font-bold rounded mt-1">
                              {t('Physical Book')}
                            </span>
                            <p className="text-sm font-bold text-green-700 flex items-center mt-2">
                              <IndianRupee className="w-3.5 h-3.5 mr-0.5" /> {item.rentalPrice}
                            </p>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.bookId)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-white border-t border-[#E8DCD0] shrink-0 space-y-6">
                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">{t('Select Payment Method')}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setPaymentMethod('online')}
                        className={`py-3 px-4 rounded-xl border-2 font-semibold flex items-center justify-center gap-2 transition-all ${
                          paymentMethod === 'online' ? 'border-[#138808] bg-green-50 text-[#138808] shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <CreditCard className="w-5 h-5" /> {t('Pay Online')}
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('cash')}
                        className={`py-3 px-4 rounded-xl border-2 font-semibold flex items-center justify-center gap-2 transition-all ${
                          paymentMethod === 'cash' ? 'border-[#C08552] bg-orange-50 text-[#C08552] shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <Banknote className="w-5 h-5" /> {t('Pay at Desk')}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-600">{t('Total Amount')}</span>
                    <span className="text-3xl font-bold text-gray-900 flex items-center">
                      <IndianRupee className="w-7 h-7 mr-1" /> {cartTotal}
                    </span>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    className="w-full py-4 rounded-xl font-bold bg-[#4B2E2B] hover:bg-[#2A1816] text-white shadow-xl shadow-[#4B2E2B]/20 transition-all flex items-center justify-center gap-2"
                  >
                    {t('Confirm & Pay')}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}