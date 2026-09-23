import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Search,
  BookOpen,
  FileText,
  HelpCircle,
  Plus,
  Filter,
  Sparkles,
  MapPin,
  Share2,
  CheckCircle2,
  Layers,
  ArrowRight
} from 'lucide-react';

const PeerNotes = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [type, setType] = useState('All');
  const [condition, setCondition] = useState('All');

  useEffect(() => {
    fetchListings();
  }, [category, type, condition]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'All') params.category = category;
      if (type !== 'All') params.type = type;
      if (search.trim()) params.search = search.trim();

      const { data } = await axios.get('/api/listings', { params });
      setListings(data);
    } catch (err) {
      console.error('Failed to load peer notes & listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

  const filteredListings = listings.filter((item) => {
    if (condition !== 'All' && item.condition !== condition) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchLoc = item.location?.toLowerCase().includes(q);
      const matchOwner = item.owner?.name?.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchLoc || matchOwner;
    }
    return true;
  });

  const notesCount = listings.filter((l) => l.category === 'Notes').length;
  const pyqCount = listings.filter((l) => l.category === 'PYQ').length;
  const bookCount = listings.filter((l) => l.category === 'Book').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-8 sm:p-10 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
              <Share2 size={13} className="text-blue-300" />
              <span>Campus Peer-to-Peer Study Exchange</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Student Peer Notes & Solved PYQs
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Access authentic handwritten class lecture notes, solved semester university exam papers,
              and peer textbooks shared directly by fellow campus students. 100% free community sharing.
            </p>

            {/* Quick Stats Chips */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
                <FileText size={14} className="text-emerald-400" />
                <strong>{notesCount}</strong> Handwritten Lecture Notes
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
                <HelpCircle size={14} className="text-purple-400" />
                <strong>{pyqCount}</strong> Solved Semester PYQs
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
                <BookOpen size={14} className="text-blue-400" />
                <strong>{bookCount}</strong> Student Textbooks
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <Link
              to="/add-listing"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition active:scale-95"
            >
              <Plus size={16} />
              Share Your Notes / PYQ
            </Link>

            {user && (
              <Link
                to="/my-listings"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-md transition"
              >
                <Layers size={15} />
                My Uploads & Requests
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Search & Multi-Filter Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by subject (e.g. Operating Systems, DSA, DBMS, Maths, Gate Notes, PYQ)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-semibold mr-1">Category:</span>
            {['All', 'Notes', 'PYQ', 'Book'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  category === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'All' ? 'All Resources' : cat === 'Notes' ? 'Lecture Notes' : cat === 'PYQ' ? 'Exam PYQs' : 'Textbooks'}
              </button>
            ))}
          </div>

          {/* Secondary Filters */}
          <div className="flex items-center gap-3">
            {/* Type */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Type:</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Types</option>
                <option value="Donate">Free / Donate</option>
                <option value="Rent">Rent</option>
              </select>
            </div>

            {/* Condition */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Condition:</span>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Conditions</option>
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500">
          Showing <span className="font-bold text-slate-800">{filteredListings.length}</span> study material{filteredListings.length !== 1 ? 's' : ''} available across campus
        </p>

        {user && (
          <Link
            to="/add-listing"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            <Plus size={14} /> Have notes to share? Upload here
          </Link>
        )}
      </div>

      {/* Grid of Listings */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <FileText size={32} />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-bold text-slate-800 text-base">No study materials matched your criteria</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search terms or filters, or be the first student to share notes on this subject!
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/add-listing"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <Plus size={15} /> Upload Notes / PYQ
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredListings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PeerNotes;
