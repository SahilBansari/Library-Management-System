import { motion, AnimatePresence } from 'framer-motion';
import { useLibrary } from '@/context/LibraryContext';
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react';

const iconMap = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
};

const colorMap = {
  success: 'bg-[#138808]',
  info: 'bg-[#4B2E2B]',
  warning: 'bg-[#C08552]',
  error: 'bg-red-500',
};

export function ToastContainer() {
  const { toasts, removeToast } = useLibrary();

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex items-center gap-3 bg-white rounded-xl shadow-lg border border-gray-100 p-4 min-w-[300px]"
            >
              <div className={`${colorMap[toast.type]} text-white p-2 rounded-full`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="flex-1 text-sm font-medium text-gray-800">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
