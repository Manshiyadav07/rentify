import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, ArrowUpDown, Check } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Technology',
  'Self-Help',
  'Business',
  'Psychology',
  'Science',
  'Fiction',
  'Literature',
  'Non-Fiction'
];

const SORT_OPTIONS = [
  { label: 'Newest Arrivals', value: 'newest' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Most Popular', value: 'most_rented' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' }
];

const SearchAndFilterBar = ({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  minRating,
  setMinRating,
  availability,
  setAvailability,
  maxPrice,
  setMaxPrice,
  onReset
}) => {
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce search update to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(localSearch);
    }, 350);
    return () => clearTimeout(timer);
  }, [localSearch, setSearch]);

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    sortBy !== 'newest' ||
    minRating > 0 ||
    availability !== 'all' ||
    maxPrice < 200 ||
    search !== '';

  return (
    <div className="space-y-4 mb-8">
      {/* Search Input and Filter Triggers */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by book title, author, ISBN, or topic (e.g. system design, habits)..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 text-sm bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch('');
                setSearch('');
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium py-3 pl-4 pr-10 rounded-2xl shadow-sm focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ArrowUpDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Filters Toggle Button */}
        <button
          onClick={() => setShowFiltersModal(!showFiltersModal)}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold border shadow-sm transition ${
            showFiltersModal || hasActiveFilters
              ? 'bg-blue-50 border-blue-200 text-blue-600'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal size={16} />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          )}
        </button>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Expanded Filters Panel */}
      {showFiltersModal && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-800">Advanced Filters</h4>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setLocalSearch('');
                  onReset();
                }}
                className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1"
              >
                <X size={13} /> Reset All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Price Max Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
                <span>Maximum Rental Price</span>
                <span className="text-blue-600 font-bold">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min={20}
                max={200}
                step={5}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹20</span>
                <span>₹200</span>
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-2">Minimum Rating</span>
              <div className="flex gap-2">
                {[0, 3, 4, 4.5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-medium border transition text-center ${
                      minRating === rating
                        ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {rating === 0 ? 'All' : `${rating}★+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-2">Availability</span>
              <div className="flex gap-2">
                {[
                  { label: 'All', value: 'all' },
                  { label: 'In Stock', value: 'in_stock' },
                  { label: 'Waitlist', value: 'out_of_stock' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setAvailability(opt.value)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-medium border transition text-center ${
                      availability === opt.value
                        ? 'bg-blue-600 text-white border-blue-600 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilterBar;
