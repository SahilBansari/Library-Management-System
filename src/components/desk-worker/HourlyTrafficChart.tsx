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
  Legend
} from 'recharts';
import { mockDeskWorkerStats } from '@/data/mockData';

export function HourlyTrafficChart() {
  const data = mockDeskWorkerStats.hourlyTraffic;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold text-[#4B2E2B] mb-6 flex items-center gap-2">
          Hourly Desk Traffic
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0E6D9" vertical={false} />
              <XAxis 
                dataKey="hour" 
                tick={{ fill: '#8D7B79', fontSize: 12 }} 
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                tick={{ fill: '#8D7B79', fontSize: 12 }} 
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
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Bar 
                dataKey="checkouts" 
                fill="#C08552" 
                radius={[6, 6, 0, 0]}
                name="Check-outs"
                barSize={32}
              />
              <Bar 
                dataKey="returns" 
                fill="#4B2E2B" 
                radius={[6, 6, 0, 0]}
                name="Returns"
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </motion.div>
  );
}