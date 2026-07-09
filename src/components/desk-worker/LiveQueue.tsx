import { motion, AnimatePresence } from 'framer-motion';
import { useLibrary } from '@/context/LibraryContext';
import { GlassCard } from '@/components/GlassCard';
import { User, BookOpen, MapPin, CheckCircle, Clock } from 'lucide-react';

export function LiveQueue() {
  const { reservations, markReservationReady, t } = useLibrary();

  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const readyReservations = reservations.filter(r => r.status === 'ready');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <GlassCard className="p-6 h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#4B2E2B]">{t('liveQueue')}</h3>
          <span className="bg-[#C08552]/10 text-[#C08552] px-3 py-1 rounded-full text-sm font-medium">
            {pendingReservations.length} Pending
          </span>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          <AnimatePresence>
            {/* Pending Reservations */}
            {pendingReservations.map((reservation) => (
              <motion.div
                key={reservation.id}
                initial={{ opacity: 0, x: -20, backgroundColor: '#FAF6F0' }}
                animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(255,255,255,0.6)' }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="p-4 rounded-xl border border-[#E8DCD0]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#4B2E2B]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-[#4B2E2B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#4B2E2B] truncate">
                      {reservation.citizenName}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-[#6B5A58] mt-1">
                      <BookOpen className="w-3 h-3" />
                      <span className="truncate">{reservation.bookTitle}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#8D7B79] mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{reservation.bookLocation}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#8D7B79] mt-2 opacity-80">
                      <Clock className="w-3 h-3" />
                      <span>Requested {reservation.requestedAt.toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => markReservationReady(reservation.id)}
                    className="btn-secondary text-sm py-2 px-3 whitespace-nowrap"
                  >
                    {t('markReady')}
                  </motion.button>
                </div>
              </motion.div>
            ))}

            {/* Ready Reservations */}
            {readyReservations.map((reservation) => (
              <motion.div
                key={reservation.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-xl bg-[#FAF6F0] border border-[#C08552]/30"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#C08552]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-[#C08552]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#4B2E2B] truncate">
                      {reservation.citizenName}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-[#6B5A58] mt-1">
                      <BookOpen className="w-3 h-3" />
                      <span className="truncate">{reservation.bookTitle}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-[#C08552]">
                      <CheckCircle className="w-3 h-3" />
                      Ready for Pickup
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            {pendingReservations.length === 0 && readyReservations.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-[#8D7B79]"
              >
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No active reservations</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>
    </motion.div>
  );
}