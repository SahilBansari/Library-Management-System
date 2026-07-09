import { motion } from 'framer-motion';
import { GlassCard } from '@/components/GlassCard';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { mockAdminKPIs } from '@/data/mockData';

// Strictly Browns, Caramels, and Warm Taupes
const COLORS = ['#4B2E2B', '#C08552', '#8D7B79', '#A66E3E', '#6B5A58', '#DCCBBF'];

export function CategoryChart() {
  const data = mockAdminKPIs.booksBorrowedByCategory;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold text-[#4B2E2B] mb-4">Borrowing by Category</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E8DCD0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#8D7B79' }} axisLine={false} tickLine={false} />
              <YAxis 
                dataKey="category" 
                type="category" 
                tick={{ fontSize: 12, fill: '#6B5A58' }}
                width={100}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: '#FAF6F0' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E8DCD0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(75, 46, 43, 0.08)',
                  color: '#4B2E2B'
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </motion.div>
  );
}