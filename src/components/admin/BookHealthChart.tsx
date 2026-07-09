import { motion } from 'framer-motion';
import { GlassCard } from '@/components/GlassCard';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { mockAdminKPIs } from '@/data/mockData';

const COLORS = {
  good: '#C08552', // Caramel
  'needs-binding': '#8D7B79', // Warm Taupe
  lost: '#4B2E2B', // Espresso
};

const LABELS = {
  good: 'Good Condition',
  'needs-binding': 'Needs Binding',
  lost: 'Lost/Discarded',
};

export function BookHealthChart() {
  const data = mockAdminKPIs.bookHealth.map(item => ({
    ...item,
    name: LABELS[item.status],
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
    >
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold text-[#4B2E2B] mb-4">Book Health Audit</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E8DCD0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(75, 46, 43, 0.08)'
                }}
                formatter={(value: number) => [value.toLocaleString(), 'Books']}
              />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Stats Summary */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {data.map((item) => (
            <div key={item.status} className="text-center">
              <p className="text-2xl font-bold" style={{ color: COLORS[item.status as keyof typeof COLORS] }}>
                {((item.count / 45230) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-[#8D7B79]">{item.name}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
}