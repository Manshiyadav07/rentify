import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import BookCard from '../components/BookCard';
import SearchAndFilterBar from '../components/SearchAndFilterBar';
import SkeletonCard from '../components/SkeletonCard';
import { BookOpen, Sparkles, TrendingUp, ChevronLeft, ChevronRight, ShieldCheck, Zap } from 'lucide-react';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recsLoading, setRecsLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [minRating, setMinRating] = useState(0);
  const [availability, setAvailability] = useState('all');
  const [maxPrice, setMaxPrice] = useState(200);

  // Pagination State
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        sortBy
      };
      if (search) params.search = search;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (minRating > 0) params.minRating = minRating;
      if (availability !== 'all') params.availability = availability;
      if (maxPrice < 200) params.maxPrice = maxPrice;

      const { data } = await axios.get('/api/books', { params });
      if (data.success) {
        setBooks(data.books);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to load books:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedCategory, sortBy, minRating, availability, maxPrice]);

  const fetchRecommendations = async () => {
    setRecsLoading(true);
    try {
      const { data } = await axios.get('/api/recommendations?limit=4');
      if (data.success) {
        setRecommendations(data.recommendations);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setRecsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSortBy('newest');
    setMinRating(0);
    setAvailability('all');
    setMaxPrice(200);
    setPage(1);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-indigo-50/40 to-transparent pt-12 pb-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200/60 text-blue-700 text-xs font-bold tracking-wide animate-fade-in shadow-xs">
              <Sparkles size={14} className="text-blue-600" />
              <span>Smart Book Rentals · Starting at ₹35</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Read More. Spend Less. <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Rent Bestselling Books
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
              Access top physical books in technology, business, psychology, and literature with flexible 14-day rental durations, 100% refundable security deposits, and instant delivery.
            </p>

            {/* Quick Feature Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5 bg-white/80 border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-xs">
                <ShieldCheck size={16} className="text-emerald-500" /> 100% Refundable Deposit
              </span>
              <span className="flex items-center gap-1.5 bg-white/80 border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-xs">
                <Zap size={16} className="text-amber-500" /> BookMyShow Waiting Lists
              </span>
              <span className="flex items-center gap-1.5 bg-white/80 border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-xs">
                <Sparkles size={16} className="text-indigo-500" /> Grok AI Recommendations
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Recommended Books Section (if available) */}
        {recommendations.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Recommended For You</h2>
                  <p className="text-xs text-slate-500">Based on reader popularity and content affinity</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map(book => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          </div>
        )}

        {/* Catalog Search & Filters */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Explore Full Catalog</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {loading ? 'Searching available titles...' : `${pagination.totalCount} books available for rent`}
              </p>
            </div>
          </div>

          <SearchAndFilterBar
            search={search}
            setSearch={(val) => {
              setSearch(val);
              setPage(1);
            }}
            selectedCategory={selectedCategory}
            setSelectedCategory={(cat) => {
              setSelectedCategory(cat);
              setPage(1);
            }}
            sortBy={sortBy}
            setSortBy={(sort) => {
              setSortBy(sort);
              setPage(1);
            }}
            minRating={minRating}
            setMinRating={(r) => {
              setMinRating(r);
              setPage(1);
            }}
            availability={availability}
            setAvailability={(avail) => {
              setAvailability(avail);
              setPage(1);
            }}
            maxPrice={maxPrice}
            setMaxPrice={(p) => {
              setMaxPrice(p);
              setPage(1);
            }}
            onReset={handleResetFilters}
          />
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-xs my-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <BookOpen size={32} />
            </div>
            <h3 className="font-bold text-slate-800 text-base">No books match your criteria</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Try loosening your filters, adjusting the maximum rental price, or clearing your search term.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.map(book => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>

            {/* Pagination Bar */}
            {pagination.totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                <div className="flex items-center gap-1 px-2">
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                          page === pageNum
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage(prev => prev + 1)}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;