import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import ListingCard from '../components/ListingCard'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { Plus, Bell, CheckCircle, XCircle, Clock } from 'lucide-react'

const MyListings = () => {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [requests, setRequests] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('listings')
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const headers = { Authorization: `Bearer ${user.token}` }
        const [listingsRes, requestsRes, myRequestsRes] = await Promise.all([
          axios.get(`/api/listings/user/${user._id}`, { headers }),
          axios.get('/api/requests/owner', { headers }),
          axios.get('/api/requests/my', { headers })
        ])
        setListings(listingsRes.data)
        setRequests(requestsRes.data)
        setMyRequests(myRequestsRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const handleRequestUpdate = async (requestId, status) => {
    setUpdating(requestId)
    try {
      const { data } = await axios.patch(`/api/requests/${requestId}`, { status }, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      setRequests(prev => prev.map(r => r._id === requestId ? { ...r, status: data.status, returnDate: data.returnDate, startDate: data.startDate } : r))

      if (status === 'Accepted') {
        setListings(prev => prev.map(l =>
          l._id === data.listing ? { ...l, status: 'Taken' } : l
        ))
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed')
    } finally {
      setUpdating(null)
    }
  }

  const pendingCount = requests.filter(r => r.status === 'Pending').length

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage listings and requests</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/peer-notes"
            className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-slate-200 transition"
          >
            Browse Community Notes
          </Link>
          <Link
            to="/add-listing"
            className="flex items-center gap-1.5 bg-blue-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
          >
            <Plus size={15} /> Add New
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{listings.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Listings</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {listings.filter(l => l.status === 'Available').length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Available</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">
            {listings.filter(l => l.type === 'Donate').length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Donated</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
          <p className="text-xs text-gray-500 mt-1">Pending Requests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[
          { key: 'listings', label: 'My Listings', count: listings.length },
          { key: 'requests', label: 'Received Requests', count: pendingCount },
          { key: 'my-requests', label: 'Sent Requests', count: myRequests.length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-1.5 ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'listings' && (
        listings.length === 0 ? (
          <EmptyState message="You haven't posted any listings yet" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {listings.map(listing => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        )
      )}

      {activeTab === 'requests' && (
        requests.length === 0 ? (
          <EmptyState message="No requests received yet" />
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Bell size={14} className="text-blue-500" />
                      <p className="font-semibold text-gray-800 text-sm">
                        {req.requester?.name}
                        <span className="text-gray-400 font-normal"> is interested in </span>
                        {req.listing?.title}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{req.requester?.email}</p>

                    {/* Rental Duration Badge */}
                    {req.rentalDays && (
                      <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full w-fit mt-1">
                        <Clock size={11} /> Needs for {req.rentalDays} days
                        <span className="text-blue-400 ml-1">
                          (return by {new Date(Date.now() + req.rentalDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})
                        </span>
                      </div>
                    )}

                    {/* Accepted return date info */}
                    {req.status === 'Accepted' && req.returnDate && (
                      <div className="bg-green-50 rounded-lg px-3 py-2 mt-2 text-xs text-green-700">
                         Return by: <strong>
                          {new Date(req.returnDate).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </strong>
                      </div>
                    )}

                    {req.message && (
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mt-2">
                         "{req.message}"
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(req.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Status / Actions */}
                  <div className="flex flex-col items-end gap-2">
                    {req.status === 'Pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRequestUpdate(req._id, 'Accepted')}
                          disabled={updating === req._id}
                          className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 transition disabled:opacity-50"
                        >
                          <CheckCircle size={13} /> Accept
                        </button>
                        <button
                          onClick={() => handleRequestUpdate(req._id, 'Rejected')}
                          disabled={updating === req._id}
                          className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-100 transition disabled:opacity-50"
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                        req.status === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {req.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'my-requests' && (
        myRequests.length === 0 ? (
          <EmptyState message="You haven't sent any requests yet" />
        ) : (
          <div className="space-y-4">
            {myRequests.map(req => (
              <div key={req._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm mb-1">{req.listing?.title}</p>
                    <p className="text-xs text-gray-400">Owner: {req.owner?.name} · {req.owner?.email}</p>

                    {/* Rental days info */}
                    {req.rentalDays && (
                      <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full w-fit mt-1">
                        <Clock size={11} /> Requested for {req.rentalDays} days
                      </div>
                    )}

                    {/* Return date if accepted */}
                    {req.status === 'Accepted' && req.returnDate && (
                      <div className="bg-green-50 rounded-lg px-3 py-2 mt-2 text-xs text-green-700">
                         Return by: <strong>
                          {new Date(req.returnDate).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </strong>
                      </div>
                    )}

                    {req.message && (
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mt-2">
                         "{req.message}"
                      </p>
                    )}
                  </div>
                  <span className={`text-xs font-medium px-3 py-1.5 rounded-full ml-4 ${
                    req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    req.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {req.status === 'Pending' ?  'Pending' :
                     req.status === 'Accepted' ?  'Accepted' : ' Rejected'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

export default MyListings