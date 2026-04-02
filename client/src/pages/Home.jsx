import { useState, useEffect } from 'react'
import axios from 'axios'
import ListingCard from '../components/ListingCard'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { Search, SlidersHorizontal, X } from 'lucide-react'

const CATEGORIES = ['All', 'Book', 'Notes', 'PYQ']
const TYPES = ['All', 'Rent', 'Donate']

const Home = () => {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [type, setType] = useState('All')
  const [showFilters, setShowFilters] = useState(false)

  const fetchListings = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (category !== 'All') params.category = category
      if (type !== 'All') params.type = type

      const { data } = await axios.get('/api/listings', { params })
      setListings(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchListings()
  }, [category, type])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchListings()
  }

  const clearFilters = () => {
    setSearch('')
    setCategory('All')
    setType('All')
  }

  const hasActiveFilters = search || category !== 'All' || type !== 'All'

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
           Find Study Resources Near You
        </h1>
        <p className="text-gray-500">Rent or get free books, notes, and PYQs from fellow students</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4 max-w-2xl mx-auto">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search books, notes, PYQs..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm border transition ${
            showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal size={15} /> Filters
        </button>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 max-w-2xl mx-auto flex flex-wrap gap-4 items-center">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Category</p>
            <div className="flex gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    category === c
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Type</p>
            <div className="flex gap-2">
              {TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    type === t
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 ml-auto"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
      )}

      {/* Results Count */}
      {!loading && (
        <p className="text-sm text-gray-400 mb-4 max-w-2xl mx-auto">
          {listings.length} listing{listings.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Listings Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : listings.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {listings.map(listing => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Home