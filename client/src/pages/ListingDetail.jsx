import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import LoadingSpinner from '../components/LoadingSpinner'
import { MapPin, Tag, User, ArrowLeft, Trash2, Calendar, Clock } from 'lucide-react'

const categoryColors = {
  Book: 'bg-blue-100 text-blue-700',
  Notes: 'bg-green-100 text-green-700',
  PYQ: 'bg-purple-100 text-purple-700',
}

const ListingDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [requestStatus, setRequestStatus] = useState(null)
  const [requestInfo, setRequestInfo] = useState(null)
  const [requesting, setRequesting] = useState(false)
  const [message, setMessage] = useState('')
  const [rentalDays, setRentalDays] = useState(7)
  const [showMessageBox, setShowMessageBox] = useState(false)

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data } = await axios.get(`/api/listings/${id}`)
        setListing(data)

        if (user) {
          const { data: reqData } = await axios.get(`/api/requests/check/${id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          })
          if (reqData.requested) {
            setRequestStatus(reqData.status)
            setRequestInfo(reqData)
          }
        }
      } catch {
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    fetchListing()
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('Delete this listing?')) return
    setDeleting(true)
    try {
      await axios.delete(`/api/listings/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      navigate('/my-listings')
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed')
      setDeleting(false)
    }
  }

  const handleRequest = async () => {
    setRequesting(true)
    try {
      await axios.post('/api/requests', {
        listingId: id,
        message,
        rentalDays: listing.type === 'Rent' ? rentalDays : null
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      setRequestStatus('Pending')
      setRequestInfo({ rentalDays })
      setShowMessageBox(false)
    } catch (err) {
      alert(err.response?.data?.message || 'Request failed')
    } finally {
      setRequesting(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  const getDaysRemaining = (returnDate) => {
    const today = new Date()
    const due = new Date(returnDate)
    return Math.ceil((due - today) / (1000 * 60 * 60 * 24))
  }

  if (loading) return <LoadingSpinner />
  if (!listing) return null

  const isOwner = user && user._id === listing.owner?._id

  const renderActionButton = () => {
    if (!user) {
      return (
        <Link
          to="/login"
          className="block text-center bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition text-sm"
        >
          Login to Request
        </Link>
      )
    }

    if (isOwner) {
      return (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-100 transition disabled:opacity-50"
        >
          <Trash2 size={15} /> {deleting ? 'Deleting...' : 'Delete Listing'}
        </button>
      )
    }

    if (listing.status === 'Taken') {
      return (
        <div className="bg-gray-100 text-gray-500 py-3 rounded-lg text-center text-sm font-medium">
          This listing has already been taken
        </div>
      )
    }

    if (requestStatus === 'Pending') {
      return (
        <div className="space-y-3">
          <div className="bg-yellow-50 text-yellow-700 border border-yellow-200 py-3 rounded-lg text-center text-sm font-medium">
             Request Sent — Waiting for owner's response
          </div>
          {requestInfo?.rentalDays && (
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2.5 rounded-lg text-sm">
              <Clock size={14} />
              You requested for <strong>{requestInfo.rentalDays} days</strong>
            </div>
          )}
        </div>
      )
    }

    if (requestStatus === 'Accepted') {
      const daysLeft = requestInfo?.returnDate ? getDaysRemaining(requestInfo.returnDate) : null
      return (
        <div className="space-y-3">
          <div className="bg-green-50 text-green-700 border border-green-200 py-3 rounded-lg text-center text-sm font-medium">
             Your request was accepted!
          </div>
          {requestInfo?.returnDate && (
            <div className="bg-blue-50 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-blue-800 flex items-center gap-1">
                <Calendar size={14} /> Rental Details
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-blue-500 mb-0.5">Start Date</p>
                  <p className="font-medium text-blue-800">{formatDate(requestInfo.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-500 mb-0.5">Return By</p>
                  <p className="font-medium text-blue-800">{formatDate(requestInfo.returnDate)}</p>
                </div>
              </div>
              <div className={`text-center py-2 rounded-lg text-sm font-semibold mt-1 ${
                daysLeft <= 2 ? 'bg-red-100 text-red-700' :
                daysLeft <= 5 ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {daysLeft > 0
                  ? ` ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining to return`
                  : ' Return date has passed!'}
              </div>
            </div>
          )}
          <button
            onClick={() => window.location.href = `mailto:${listing.owner?.email}`}
            className="w-full text-center bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition text-sm"
          >
             Contact Owner to arrange handover
          </button>
        </div>
      )
    }

    if (requestStatus === 'Rejected') {
      return (
        <div className="bg-red-50 text-red-600 border border-red-200 py-3 rounded-lg text-center text-sm font-medium">
           Your request was rejected by the owner
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {/* Rental Days — only for Rent type */}
        {listing.type === 'Rent' && (
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-1">
              <Clock size={14} /> How many days do you need?
            </p>
            <div className="flex gap-2 flex-wrap mb-3">
              {[3, 7, 14, 30].map(day => (
                <button
                  key={day}
                  onClick={() => setRentalDays(day)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                    rentalDays === day
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  {day} days
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={rentalDays}
                onChange={(e) => setRentalDays(Number(e.target.value))}
                min={1}
                max={365}
                className="w-24 border border-blue-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-blue-700">days (custom)</span>
            </div>
            {rentalDays > 0 && (
              <p className="text-xs text-blue-600 mt-2">
                 Expected return by: <strong>
                  {formatDate(new Date(Date.now() + rentalDays * 24 * 60 * 60 * 1000))}
                </strong>
              </p>
            )}
          </div>
        )}

        {showMessageBox && (
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a message to the owner (optional)..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setShowMessageBox(!showMessageBox)}
            className="flex-1 border border-blue-300 text-blue-600 py-3 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
          >
            {showMessageBox ? 'Hide Message' : ' Add Message'}
          </button>
          <button
            onClick={handleRequest}
            disabled={requesting}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 text-sm"
          >
            {requesting ? 'Sending...' : " I'm Interested"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6 transition">
        <ArrowLeft size={15} /> Back to listings
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-72 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          {listing.image ? (
            <img src={listing.image} alt={listing.title} className="w-full h-full object-contain bg-gray-50" />
          ) : (
            <span className="text-6xl"></span>
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColors[listing.category]}`}>
              {listing.category}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              listing.type === 'Donate' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {listing.type}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              listing.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
            }`}>
              {listing.status}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-1">{listing.title}</h1>
          <p className="text-2xl font-bold mb-4">
            {listing.type === 'Donate' ? (
              <span className="text-green-600">Free </span>
            ) : (
              <span className="text-blue-600">₹{listing.price}<span className="text-sm text-gray-400 font-normal">/rent</span></span>
            )}
          </p>

          <p className="text-gray-600 text-sm leading-relaxed mb-6">{listing.description}</p>

          <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4 mb-6 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-1">Condition</p>
              <p className="font-medium text-gray-700 flex items-center gap-1"><Tag size={13} /> {listing.condition}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Location</p>
              <p className="font-medium text-gray-700 flex items-center gap-1"><MapPin size={13} /> {listing.location}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Posted by</p>
              <p className="font-medium text-gray-700 flex items-center gap-1"><User size={13} /> {listing.owner?.name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Contact</p>
              <p className="font-medium text-gray-700">{listing.owner?.email}</p>
            </div>
          </div>

          {renderActionButton()}
        </div>
      </div>
    </div>
  )
}

export default ListingDetail