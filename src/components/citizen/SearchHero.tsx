import { motion } from 'framer-motion';
import { useLibrary } from '@/context/LibraryContext';
import { Search, BookOpen, GraduationCap, Baby } from 'lucide-react';

const filters = [
  { id: 'all', label: 'allBooks', icon: BookOpen },
  { id: 'ukpsc', label: 'UKPSC Exam Materials', icon: GraduationCap },
  { id: 'fiction', label: 'Fiction', icon: BookOpen },
  { id: 'children', label: 'Children\'s Section', icon: Baby },
];

export function SearchHero() {
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, t } = useLibrary();

  return (
    <div className="mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-[#4B2E2B] mb-2">
          Discover Your Next Read
        </h2>
        <p className="text-[#6B5A58]">
          Browse our collection of {45230}+ books across all categories
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="max-w-2xl mx-auto mb-6"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8D7B79]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full bg-white/80 border-2 border-[#E8DCD0] rounded-xl pl-12 pr-4 py-4 text-lg text-[#4B2E2B] placeholder:text-[#8D7B79] focus:outline-none focus:border-[#C08552] transition-colors"
          />
        </div>
      </motion.div>

      {/* Filter Chips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex flex-wrap justify-center gap-2"
      >
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isSelected = selectedCategory === filter.id;
          return (
            <motion.button
              key={filter.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(filter.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                isSelected
                  ? 'bg-[#C08552] text-white shadow-md shadow-[#C08552]/20'
                  : 'bg-white/70 backdrop-blur-sm text-[#6B5A58] hover:bg-white border border-[#E8DCD0]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">
                {filter.id === 'all' ? t(filter.label) : filter.label}
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}