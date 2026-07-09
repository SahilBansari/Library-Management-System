import { motion } from 'framer-motion';
import { GlassCard } from '@/components/GlassCard';
import { BookOpen, Users, Footprints, IndianRupee, Landmark } from 'lucide-react';
import { mockAdminKPIs } from '@/data/mockData';

export function KPIBanner() {
  const kpis = mockAdminKPIs;

  const cards = [
    {
      label: 'Total Books',
      value: kpis.totalBooks.toLocaleString(),
      icon: BookOpen,
      color: 'bg-[#C08552]/10',
      iconColor: 'text-[#C08552]',
    },
    {
      label: 'Active Readers',
      value: kpis.activeReaders.toLocaleString(),
      icon: Users,
      color: 'bg-[#138808]/10',
      iconColor: 'text-[#138808]',
    },
    {
      label: "Today's Footfall",
      value: kpis.todayFootfall.toLocaleString(),
      icon: Footprints,
      color: 'bg-[#4B2E2B]/10',
      iconColor: 'text-[#4B2E2B]',
    },
    {
      label: 'Procurement Budget',
      value: `₹${(kpis.procurementBudget / 100000).toFixed(1)}L`,
      icon: Landmark,
      color: 'bg-blue-100',
      iconColor: 'text-blue-700',
    },
    {
      label: 'Rental Revenue',
      value: `₹${kpis.totalRevenue.toLocaleString()}`,
      icon: IndianRupee,
      color: 'bg-green-100',
      iconColor: 'text-green-700',
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05, duration: 0.5 }}
          >
            <GlassCard className="p-5 h-full flex flex-col justify-center">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 leading-tight">{card.value}</p>
                  <p className="text-sm text-gray-600">{card.label}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}