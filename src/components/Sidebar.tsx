import { useLibrary } from '@/context/LibraryContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  UserPlus, 
  Activity, 
  Settings, 
  FileText,
  LogOut,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const { currentRole, activeView, setActiveView, setCurrentRole, t } = useLibrary();

  const handleLogout = () => {
    setCurrentRole(null);
    setActiveView('dashboard');
    if (onClose) onClose();
  };

  const handleNavigation = (id: string) => {
    setActiveView(id);
    if (onClose) onClose(); 
  }

  const getNavigationMenu = () => {
    switch (currentRole) {
      case 'citizen':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'all-books', label: 'All Books', icon: BookOpen },
          { id: 'my-activity', label: 'My Activity', icon: Activity },
        ];
      case 'desk-worker':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'all-books', label: 'All Books', icon: BookOpen },
          { id: 'add-member', label: 'Add Member', icon: UserPlus },
          { id: 'my-activity', label: 'My Activity', icon: Activity },
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'all-books', label: 'All Books', icon: BookOpen },
          { id: 'my-activity', label: 'My Activity', icon: Activity },
          { id: 'logs', label: 'System Logs', icon: FileText },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavigationMenu();

  if (!currentRole) return null;

  return (
    <div className="w-full h-full bg-[#FFFFFF] text-[#4B2E2B] flex flex-col border-r border-[#E8DCD0] z-20 shadow-[4px_0_24px_rgba(75,46,43,0.02)]">
      <div className="p-6 border-b border-[#E8DCD0] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[#FAF6F0] border border-[#E8DCD0] rounded-xl flex items-center justify-center p-1.5 shadow-sm">
             <img 
              src="/uttarakhand-emblem.png" 
              alt="State Emblem" 
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
              }}
            />
          </div>
          <div>
            <h2 className="font-bold text-lg text-[#4B2E2B] tracking-tight leading-tight">{t('State Library')}</h2>
            <p className="text-xs text-[#8D7B79] capitalize font-medium mt-0.5">{t(currentRole)} {t('Portal')}</p>
          </div>
        </div>
        
        {onClose && (
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-[#8D7B79] hover:bg-[#FAF6F0] hover:text-[#4B2E2B] rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                ${isActive 
                  ? 'bg-[#C08552]/10 text-[#A66E3E] font-semibold' 
                  : 'text-[#6B5A58] hover:bg-[#FAF6F0] hover:text-[#4B2E2B]'
                }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-sidebar-indicator"
                  className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#C08552] rounded-r-full"
                />
              )}
              <Icon size={20} className={isActive ? 'text-[#C08552]' : 'text-[#8D7B79] group-hover:text-[#4B2E2B] transition-colors'} />
              <span className="text-sm tracking-wide">{t(item.label)}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#E8DCD0]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[#6B5A58] hover:bg-red-50 hover:text-red-600 transition-colors group"
        >
          <LogOut size={20} className="text-[#8D7B79] group-hover:text-red-500 transition-colors" />
          <span className="text-sm font-medium tracking-wide">{t('Sign Out')}</span>
        </button>
      </div>
    </div>
  );
}