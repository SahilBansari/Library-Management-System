import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLibrary } from '@/context/LibraryContext';
import { 
  Library, 
  Users, 
  Briefcase, 
  ShieldUser, 
  ArrowRight,
  Lock,
  User as UserIcon
} from 'lucide-react';
import type { UserRole } from '@/types';

type TabType = 'citizen' | 'desk-worker' | 'admin';

export function RoleSelector() {
  const { setCurrentRole, addToast } = useLibrary();
  const [activeTab, setActiveTab] = useState<TabType>('citizen');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // =========================================================================
  // 🛠️ TRANSPARENCY TWEAKER
  const MASK_OPACITY = 0.85; 
  // =========================================================================

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      addToast('Please fill in all required fields.', 'warning');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setCurrentRole(activeTab as UserRole);
      addToast(`Successfully logged in as ${activeTab.replace('-', ' ')}.`, 'success');
      setIsLoading(false);
    }, 800);
  };

  const tabs = [
    { id: 'citizen', label: 'Public Reader', icon: Users },
    { id: 'desk-worker', label: 'Library Staff', icon: Briefcase },
    { id: 'admin', label: 'Chief Librarian', icon: ShieldUser },
  ];

  return (
    /* SENIOR DEV FIX: 
      - Uses dvh (dynamic viewport height) to bypass mobile address bar issues.
      - MOBILE: min-h lets it scroll if needed.
      - DESKTOP (lg): strict h-[calc] and overflow-hidden ensures absolutely zero scroll.
      - z-10 ensures it stays beneath the z-[100] navbar.
    */
    <div className="relative z-10 w-full flex flex-col lg:flex-row bg-[#1A1110] min-h-[calc(100dvh-80px)] lg:h-[calc(100dvh-80px)] lg:overflow-hidden">
      
      {/* Background Container - FIXED inset-0 so scrolling on mobile never shows a white gap */}
      <div className="fixed inset-0 z-0 w-full h-full pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop")',
            opacity: 0.5 
          }}
        />
        <div 
          className="absolute inset-0 z-10 transition-colors duration-200"
          style={{ 
            background: `linear-gradient(to bottom right, rgba(75, 46, 43, ${MASK_OPACITY}), rgba(42, 24, 22, ${Math.max(0, MASK_OPACITY - 0.2)}))`
          }} 
        />
      </div>

      {/* Left Panel - Hero Text 
        SENIOR DEV FIX: 
        - MOBILE: Added explicit py-12 so it pads away from edges, no overlapping with form.
        - DESKTOP: Centered vertically, flex-1.
      */}
      <div className="w-full lg:w-1/2 relative z-20 flex flex-col justify-center items-center lg:items-start p-6 py-12 lg:p-16 xl:p-24 text-center lg:text-left">
        <div className="max-w-2xl">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight lg:leading-[1.15] drop-shadow-xl text-white">
            Empowering Minds <br className="hidden lg:block"/>
            <span className="text-[#E8B273]">Through Knowledge</span>
          </h2>
          <p className="hidden lg:block text-lg lg:text-xl text-white/90 leading-relaxed drop-shadow-md mt-6">
            Access millions of books, journals, and digital resources. A centralized hub for citizens, researchers, and administrators to seamlessly manage library services.
          </p>
        </div>

        <div className="hidden lg:block space-y-3 border-l-4 border-[#E8B273] pl-6 mt-14">
          <p className="font-semibold text-lg tracking-wide text-white/95">Department of Culture & Education</p>
          <div className="flex items-center justify-start gap-2.5 text-sm font-medium text-[#E8B273]">
            <Library size={18} />
            <span>Integrated Library Management System v2.0</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form
        SENIOR DEV FIX: 
        - MOBILE: Centered block, margin-bottom applied via pb-12 so it breathes.
        - DESKTOP: Centered perfectly within its rigid half.
      */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 pb-12 lg:p-8 relative z-30 lg:h-full">
        <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/30 overflow-hidden transform transition-all">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-extrabold text-[#4B2E2B] mb-1.5">Welcome Back</h3>
              <p className="text-[#6B5A58] text-sm font-medium">Please select your portal and sign in.</p>
            </div>

            {/* Role Tabs */}
            <div className="flex p-1 bg-[#F5EFE6] rounded-xl mb-6 shadow-inner border border-[#E8DCD0]">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as TabType);
                      setIdentifier('');
                      setPassword('');
                    }}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-lg text-xs sm:text-sm font-bold transition-all relative z-10 ${
                      isActive ? 'text-[#4B2E2B]' : 'text-[#8A7977] hover:text-[#4B2E2B]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-login-tab"
                        className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10 border border-[#E8DCD0]"
                        transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                      />
                    )}
                    <Icon size={18} className={isActive ? 'text-[#C08552]' : 'text-[#B0A19F]'} />
                    <span className="text-center leading-tight">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Login Form */}
            <AnimatePresence mode="wait">
              <motion.form
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#4B2E2B] ml-1 block">
                    {activeTab === 'citizen' ? 'Library Card Number / Phone' : 
                     activeTab === 'desk-worker' ? 'Employee ID' : 'Administrator ID'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon size={18} className="text-[#A0908E]" />
                    </div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm bg-white border-2 border-[#E8DCD0] rounded-xl focus:bg-white focus:ring-0 focus:border-[#C08552] transition-colors outline-none font-medium text-[#4B2E2B] placeholder:text-[#B0A19F]"
                      placeholder={`Enter your ${activeTab === 'citizen' ? 'credentials' : 'ID'}`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#4B2E2B] ml-1 block">
                    {activeTab === 'citizen' ? 'PIN / Password' : 'Password'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-[#A0908E]" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm bg-white border-2 border-[#E8DCD0] rounded-xl focus:bg-white focus:ring-0 focus:border-[#C08552] transition-colors outline-none font-medium text-[#4B2E2B] placeholder:text-[#B0A19F]"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {activeTab === 'citizen' && (
                  <div className="flex justify-end pt-0.5">
                    <button type="button" className="text-xs text-[#C08552] hover:text-[#9A6A42] font-bold transition-colors">
                      Forgot PIN?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#4B2E2B] hover:bg-[#3A2220] text-white rounded-xl text-sm font-bold shadow-[0_8px_20px_rgba(75,46,43,0.25)] transition-all hover:shadow-[0_8px_25px_rgba(75,46,43,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-70 disabled:cursor-not-allowed group mt-3"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            </AnimatePresence>

            {activeTab === 'citizen' && (
              <div className="mt-6 pt-5 border-t-2 border-[#F5EFE6] text-center">
                <p className="text-sm font-medium text-[#6B5A58]">
                  Don't have a library card?{' '}
                  <button type="button" className="text-[#C08552] hover:text-[#9A6A42] font-extrabold transition-colors">
                    Register online
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}