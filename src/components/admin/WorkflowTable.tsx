import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/GlassCard';
import { BookOpen, RotateCcw, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';
import { mockWorkflowItems, mockBooks } from '@/data/mockData';

const statusConfig = {
  'returned': { 
    label: 'Returned by Citizen', 
    icon: RotateCcw, 
    color: 'bg-[#8D7B79]/10 text-[#6B5A58]' 
  },
  'flagged-for-repair': { 
    label: 'Flagged for Repair', 
    icon: AlertTriangle, 
    color: 'bg-[#C08552]/10 text-[#C08552]' 
  },
  'in-binding': { 
    label: 'In Binding', 
    icon: Wrench, 
    color: 'bg-[#6B5A58]/10 text-[#6B5A58]' 
  },
  'reshelved': { 
    label: 'Reshelved', 
    icon: CheckCircle, 
    color: 'bg-[#138808]/10 text-[#138808]' 
  },
};

export function WorkflowTable() {
  const [items, setItems] = useState(mockWorkflowItems);

  const handleAction = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#4B2E2B]">Internal Workflow</h3>
          <span className="bg-[#4B2E2B]/10 text-[#4B2E2B] px-3 py-1 rounded-full text-sm font-medium">
            {items.length} Pending
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Book</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Flagged By</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const book = mockBooks.find(b => b.id === item.bookId);
                const status = statusConfig[item.currentStatus];
                const StatusIcon = status?.icon || AlertTriangle;

                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                    className="border-b border-gray-100 hover:bg-white/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 bg-gradient-to-br from-[#C08552]/20 to-[#138808]/20 rounded flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-[#4B2E2B]/50" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{book?.title || item.bookTitle}</p>
                          <p className="text-sm text-gray-500">{book?.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status?.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status?.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">{item.flaggedBy || '-'}</p>
                      <p className="text-xs text-gray-400">
                        {item.flaggedAt?.toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {item.currentStatus === 'returned' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAction(item.id)}
                            className="px-3 py-1.5 bg-[#138808] text-white text-sm rounded-lg hover:bg-[#138808]/90 transition-colors"
                          >
                            Reshelve
                          </motion.button>
                        )}
                        {item.currentStatus === 'flagged-for-repair' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAction(item.id)}
                            className="px-3 py-1.5 bg-[#C08552] text-white text-sm rounded-lg hover:bg-[#C08552]/90 transition-colors"
                          >
                            Send to Binding
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAction(item.id)}
                          className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Mark Lost
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-[#138808]" />
            <p>All workflow items completed!</p>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}