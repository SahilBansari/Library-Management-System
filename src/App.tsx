import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LibraryProvider, useLibrary } from '@/context/LibraryContext';
import { Navbar } from '@/components/Navbar';
import { ToastContainer } from '@/components/ToastContainer';
import { RoleSelector } from '@/components/RoleSelector';
import { CitizenPortal } from '@/components/citizen/CitizenPortal';
import { DeskWorkerPortal } from '@/components/desk-worker/DeskWorkerPortal';
import { AdminPortal } from '@/components/admin/AdminPortal';
import { Sidebar } from '@/components/Sidebar';

function AppContent() {
  const { currentRole } = useLibrary();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-warm-gradient overflow-hidden">
      
      {currentRole && (
        <>
          {/* Mobile Overlay Background */}
          {isMobileSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[140] lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}
          
          {/* Responsive Sidebar Container */}
          <div className={`fixed inset-y-0 left-0 z-[150] w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:relative lg:shadow-none lg:translate-x-0 ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <Sidebar onClose={() => setIsMobileSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden min-w-0">
        <div 
          className="fixed bottom-0 left-0 right-0 h-64 pointer-events-none z-0 opacity-[0.05]"
          style={{
            backgroundImage: 'url(/himalaya-silhouette.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'bottom center',
            backgroundRepeat: 'no-repeat',
            filter: 'sepia(1) hue-rotate(-50deg) saturate(2)'
          }}
        />

        <div className="relative z-[100] flex-shrink-0">
          <Navbar onMenuClick={() => setIsMobileSidebarOpen(true)} />
        </div>
        
        <main 
          className={`flex-1 relative z-10 w-full scroll-smooth ${
            currentRole === null 
              ? 'overflow-y-auto lg:overflow-hidden pb-8 lg:pb-0' 
              : 'overflow-y-auto pb-8'
          }`}
        >
          <AnimatePresence mode="wait">
            {currentRole === null && (
              <motion.div
                key="role-selector"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="min-h-full"
              >
                <RoleSelector />
              </motion.div>
            )}

            {currentRole === 'citizen' && (
              <motion.div
                key="citizen-portal"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="min-h-full"
              >
                <CitizenPortal />
              </motion.div>
            )}

            {currentRole === 'desk-worker' && (
              <motion.div
                key="desk-worker-portal"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="min-h-full"
              >
                <DeskWorkerPortal />
              </motion.div>
            )}

            {currentRole === 'admin' && (
              <motion.div
                key="admin-portal"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="min-h-full"
              >
                <AdminPortal />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <div className="absolute z-[110] pointer-events-none">
          <ToastContainer />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <LibraryProvider>
      <AppContent />
    </LibraryProvider>
  );
}

export default App;