import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLibrary } from '@/context/LibraryContext';
import { GlassCard } from '@/components/GlassCard';
import { Search, User, Phone, CreditCard, Edit3, UserPlus, CheckCircle, Ban } from 'lucide-react';
import { RegisterMemberModal } from '@/components/modals/RegisterMemberModal';
import { EditMemberModal } from '@/components/modals/EditMemberModal';
import type { Citizen } from '@/types';

export function MemberSearch() {
  const { citizens, searchCitizen, t } = useLibrary();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<Citizen | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Citizen | null>(null);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const result = searchCitizen(searchQuery);
      setSearchResult(result);
    }
  };

  const handleEdit = (member: Citizen) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const getStatusBadge = (member: Citizen) => {
    switch (member.status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-[#138808]/10 text-[#138808]">
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-600">
            <Ban className="w-3 h-3" />
            Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
            Expired
          </span>
        );
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#4B2E2B]">Member Management</h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowRegisterModal(true)}
              className="px-4 py-2 bg-[#138808] text-white rounded-xl font-medium flex items-center gap-2 hover:bg-[#138808]/90 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              {t('registerMember')}
            </motion.button>
          </div>

          {/* Search */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone, or ID number"
                className="w-full input-solid pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearch}
              className="btn-navy px-4"
            >
              Search
            </motion.button>
          </div>

          {/* Search Result */}
          <AnimatePresence>
            {searchResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/70 rounded-xl p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#4B2E2B]/10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-[#4B2E2B]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{searchResult.name}</p>
                      <p className="text-sm text-gray-600">ID: {searchResult.id}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {searchResult.phone}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          {searchResult.govtIdNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(searchResult)}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEdit(searchResult)}
                      className="mt-2 px-3 py-1.5 bg-[#4B2E2B]/10 text-[#4B2E2B] text-sm rounded-lg hover:bg-[#4B2E2B]/20 transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      {t('editProfile')}
                    </motion.button>
                  </div>
                </div>

                {/* Member Details */}
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="text-sm font-medium">{searchResult.memberSince.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Books Read</p>
                    <p className="text-sm font-medium">{searchResult.booksRead}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Outstanding Fines</p>
                    <p className={`text-sm font-medium ${searchResult.lateFeeAmount > 0 ? 'text-red-500' : ''}`}>
                      ₹{searchResult.lateFeeAmount}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {searchQuery && !searchResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-6 text-gray-500"
              >
                <User className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>No member found</p>
                <p className="text-sm">Try a different search term</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recent Members */}
          {!searchResult && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-3">Recent Members</h4>
              <div className="space-y-2">
                {citizens.slice(0, 3).map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                    className="flex items-center justify-between p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors cursor-pointer"
                    onClick={() => handleEdit(member)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#4B2E2B]/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-[#4B2E2B]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.phone}</p>
                      </div>
                    </div>
                    {getStatusBadge(member)}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Modals */}
      <RegisterMemberModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />

      <EditMemberModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedMember(null);
        }}
        citizen={selectedMember}
      />
    </>
  );
}
