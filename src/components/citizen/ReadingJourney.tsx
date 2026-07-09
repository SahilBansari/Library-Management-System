import { motion } from 'framer-motion';
import { useLibrary } from '@/context/LibraryContext';
import { GlassCard } from '@/components/GlassCard';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { BookOpen, Flame, TrendingUp, CheckCircle, Clock, MapPin } from 'lucide-react';
import { mockReadingStats, mockCurrentCitizen, mockReservations } from '@/data/mockData';

const COLORS = ['#C08552', '#4B2E2B', '#8D7B79', '#A66E3E'];

export function ReadingJourney() {
  const { t } = useLibrary();
  const stats = mockReadingStats;
  const citizen = mockCurrentCitizen;

  const activeReservations = mockReservations.filter(
    r => r.citizenId === citizen.id && (r.status === 'pending' || r.status === 'ready')
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-[#4B2E2B] mb-2">
          {t('myReadingJourney')}
        </h2>
        <p className="text-[#6B5A58]">
          Track your reading progress and achievements
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <GlassCard className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#C08552]/10 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[#C08552]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#4B2E2B]">{stats.booksReadThisYear}</p>
                <p className="text-sm text-[#8D7B79]">{t('booksRead')}</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <GlassCard className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#4B2E2B]/10 rounded-xl flex items-center justify-center">
                <Flame className="w-6 h-6 text-[#4B2E2B]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#4B2E2B]">{stats.currentStreak}</p>
                <p className="text-sm text-[#8D7B79]">{t('currentStreak')} ({t('days')})</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <GlassCard className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#8D7B79]/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#8D7B79]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#4B2E2B]">{citizen.totalReservations}</p>
                <p className="text-sm text-[#8D7B79]">Total Reservations</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <GlassCard className="p-5">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                citizen.isClearToBorrow ? 'bg-[#C08552]/10' : 'bg-[#4B2E2B]/10'
              }`}>
                <CheckCircle className={`w-6 h-6 ${
                  citizen.isClearToBorrow ? 'text-[#C08552]' : 'text-[#4B2E2B]'
                }`} />
              </div>
              <div>
                <p className="text-lg font-bold text-[#4B2E2B]">
                  {citizen.isClearToBorrow ? 'Clear' : 'Blocked'}
                </p>
                <p className="text-sm text-[#8D7B79]">To Borrow</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-[#4B2E2B] mb-4">Genres Explored</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.genresExplored}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="percentage"
                    stroke="none"
                  >
                    {stats.genresExplored.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ backgroundColor: 'white', border: '1px solid #E8DCD0', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {stats.genresExplored.map((genre, index) => (
                <div key={genre.genre} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-[#6B5A58]">{genre.genre}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-[#4B2E2B] mb-4">Monthly Reading</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyReading}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8DCD0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#8D7B79', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fill: '#8D7B79', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#FAF6F0' }} contentStyle={{ backgroundColor: 'white', border: '1px solid #E8DCD0', borderRadius: '8px' }} />
                  <Bar dataKey="booksRead" fill="#C08552" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Active Reservations */}
      {activeReservations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-[#4B2E2B] mb-4">Active Reservations</h3>
            <div className="space-y-3">
              {activeReservations.map((reservation, index) => (
                <motion.div
                  key={reservation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                  className="flex items-center gap-4 p-4 bg-white/50 border border-[#E8DCD0] rounded-xl"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    reservation.status === 'ready' 
                      ? 'bg-[#C08552]/10' 
                      : 'bg-[#8D7B79]/10'
                  }`}>
                    {reservation.status === 'ready' ? (
                      <CheckCircle className="w-5 h-5 text-[#C08552]" />
                    ) : (
                      <Clock className="w-5 h-5 text-[#8D7B79]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#4B2E2B]">{reservation.bookTitle}</p>
                    <p className="text-sm text-[#6B5A58]">{reservation.bookAuthor}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      reservation.status === 'ready'
                        ? 'bg-[#C08552]/10 text-[#C08552]'
                        : 'bg-[#8D7B79]/10 text-[#8D7B79]'
                    }`}>
                      {reservation.status === 'ready' ? t('readyForPickup') : t('pending')}
                    </span>
                    <p className="text-xs text-[#8D7B79] mt-1 flex items-center gap-1 justify-end">
                      <MapPin className="w-3 h-3" />
                      {reservation.bookLocation}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}