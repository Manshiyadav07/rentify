import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import BookCard from '../components/BookCard';
import ReviewModal from '../components/ReviewModal';
import {
  Star,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Clock,
  BookOpen,
  MapPin,
  CheckCircle2,
  Users,
  MessageSquare,
  ArrowLeft,
  Share2,
  Sparkles,
  Info
} from 'lucide-react';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const toast = useToast();

  const [book, setBook] = useState(null);
  const [copies, setCopies] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rentalDays, setRentalDays] = useState(14);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Waiting list state
  const [reservation, setReservation] = useState(null);
  const [joiningWaitlist, setJoiningWaitlist] = useState(false);

  useEffect(() => {
    const fetchBookData = async () => {
      setLoading(true);
      try {
        const [bookRes, reviewRes, relatedRes] = await Promise.all([
          axios.get(`/api/books/${id}`),
          axios.get(`/api/reviews/${id}`),
          axios.get(`/api/recommendations/related/${id}`)
        ]);

        if (bookRes.data.success) {
          setBook(bookRes.data.book);
          setCopies(bookRes.data.copies || []);
        }
        if (reviewRes.data.success) {
          setReviews(reviewRes.data.reviews || []);
        }
        if (relatedRes.data.success) {
          setRelatedBooks(relatedRes.data.related || []);
        }

        // If user logged in, check waiting list status
        if (user) {
          try {
            const waitRes = await axios.get(`/api/rentals/waiting-list/${id}`);
            if (waitRes.data.success) {
              setReservation(waitRes.data.reservation);
            }
          } catch {
            // Non-blocking
          }
        }
      } catch (err) {
        console.error('Failed to load book:', err);
        toast.error('Book not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchBookData();
    window.scrollTo(0, 0);
  }, [id, user, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!book) return null;

  const isSaved = isWishlisted(book._id);
  const isOutOfStock = book.availableCopies <= 0;

  const handleRentNow = async () => {
    if (isOutOfStock) {
      handleJoinWaitingList();
      return;
    }

    const success = await addToCart(book, rentalDays);
    if (success) {
      if (user) {
        navigate('/checkout');
      } else {
        toast.info('Please sign in to complete your book rental order');
        navigate('/login', { state: { from: '/checkout' } });
      }
    }
  };

  const handleJoinWaitingList = async () => {
    if (!user) {
      toast.info('Please log in to join the waiting list');
      navigate('/login');
      return;
    }

    setJoiningWaitlist(true);
    try {
      const { data } = await axios.post('/api/rentals/waiting-list', { bookId: book._id });
      if (data.success) {
        toast.success(data.message);
        setReservation({ queuePosition: data.queuePosition, status: 'WAITING' });
      } else {
        toast.info(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join waiting list');
    } finally {
      setJoiningWaitlist(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-6 transition"
      >
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Book Cover Gallery */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex items-center justify-center relative overflow-hidden group">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full max-w-[280px] aspect-[4/5] object-cover rounded-2xl shadow-xl transition-transform duration-500 group-hover:scale-105"
              />
              <button
                onClick={() => toggleWishlist(book)}
                className={`absolute top-5 right-5 w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-90 ${
                  isSaved ? 'bg-rose-500 text-white' : 'bg-white/90 text-slate-500 hover:text-rose-500'
                }`}
                title={isSaved ? 'Saved in Wishlist' : 'Add to Wishlist'}
              >
                <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Platform Guarantee Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <ShieldCheck size={18} className="text-emerald-500 shrink-0" />
                <span>Rentify Reader Guarantee</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                • 100% refundable security deposit upon return<br />
                • Sanitized physical copies inspected before dispatch<br />
                • Free doorstep return pickup available
              </p>
            </div>
          </div>
        </div>

        {/* Right: Book Details & Rental Actions */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header Info */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {book.category}
              </span>
              <span className="text-xs text-slate-400 font-medium">ISBN: {book.isbn || 'N/A'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {book.title}
            </h1>
            <p className="text-sm font-semibold text-slate-600 mt-1">by <span className="text-blue-600">{book.author}</span></p>

            {/* Ratings & Stock Overview */}
            <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(book.averageRating || 4.5) ? 'fill-amber-400' : 'text-slate-200 fill-slate-200'}
                    />
                  ))}
                </div>
                <span className="text-xs font-extrabold text-slate-900">{book.averageRating || 4.5}</span>
                <span className="text-xs text-slate-400">({reviews.length} verified reviews)</span>
              </div>

              <div className="h-4 w-px bg-slate-200"></div>

              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  <Users size={13} /> Out of Stock · Waiting List Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 size={13} /> In Stock ({book.availableCopies} available copies)
                </span>
              )}
            </div>
          </div>

          {/* Pricing & Duration Selection Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Rental Price</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-blue-600">₹{book.rentalPrice}</span>
                  <span className="text-xs text-slate-500 font-medium">/ {rentalDays} days</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Security Deposit</span>
                <div className="flex items-baseline gap-1 justify-end">
                  <span className="text-lg font-bold text-slate-800">₹{book.securityDeposit || 100}</span>
                  <span className="text-[11px] text-emerald-600 font-semibold">(100% Refundable)</span>
                </div>
              </div>
            </div>

            {/* Rental Duration Options */}
            {!isOutOfStock && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1">
                  <Clock size={14} className="text-blue-600" /> Select Reading Duration
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {[7, 14, 21, 30].map(days => (
                    <button
                      key={days}
                      onClick={() => setRentalDays(days)}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition text-center ${
                        rentalDays === days
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {isOutOfStock ? (
              <div className="space-y-3 pt-2">
                {reservation ? (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs">
                    <p className="font-bold flex items-center gap-1.5 text-sm mb-1">
                      <Users size={16} className="text-amber-600" /> You are #{reservation.queuePosition} on the Waiting List!
                    </p>
                    <p className="leading-relaxed">
                      We will notify you via in-app notification the moment a copy is returned. You will have 24 hours to claim it.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleJoinWaitingList}
                    disabled={joiningWaitlist}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 px-6 rounded-2xl text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    <Users size={18} />
                    {joiningWaitlist ? 'Joining...' : 'Join Waiting List (Priority Reservation)'}
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => addToCart(book, rentalDays)}
                  className="flex-1 py-3.5 px-5 rounded-2xl font-bold text-xs border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 transition"
                >
                  <ShoppingBag size={16} /> Add to Cart
                </button>
                <button
                  onClick={handleRentNow}
                  className="flex-1 py-3.5 px-5 rounded-2xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition"
                >
                  Rent Now · Total ₹{(book.rentalPrice + (book.securityDeposit || 100))}
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Book Overview</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line font-normal">
              {book.description}
            </p>

            {book.tags && book.tags.length > 0 && (
              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                {book.tags.map(tag => (
                  <span key={tag} className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-lg">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Physical Copies Overview */}
          {copies.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen size={16} className="text-blue-600" /> Physical Inventory Tracking
                </h3>
                <span className="text-xs text-slate-400">{copies.length} tracked copies</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {copies.map(copy => (
                  <div
                    key={copy.copyId}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-800">{copy.copyId}</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5 flex items-center gap-1">
                        <MapPin size={11} /> {copy.location}
                      </span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          copy.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {copy.status}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Condition: {copy.condition}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Reviews Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Customer Reviews</h3>
                <p className="text-xs text-slate-400 mt-0.5">Verified Reader Feedback</p>
              </div>

              {user && (
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
                >
                  <MessageSquare size={14} /> Write a Review
                </button>
              )}
            </div>

            {reviews.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No reviews yet. Be the first to review after renting!
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-slate-100">
                {reviews.map(r => (
                  <div key={r._id} className="pt-4 first:pt-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800">{r.user?.name || 'Reader'}</span>
                        {r.isVerifiedRental && (
                          <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-100">
                            <CheckCircle2 size={11} /> Verified Reader
                          </span>
                        )}
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < r.rating ? 'fill-amber-400' : 'text-slate-200 fill-slate-200'}
                          />
                        ))}
                      </div>
                    </div>
                    {r.title && <h5 className="font-bold text-xs text-slate-900">{r.title}</h5>}
                    <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                    <span className="text-[10px] text-slate-400 block">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related Books */}
          {relatedBooks.length > 0 && (
            <div className="pt-6">
              <h3 className="font-extrabold text-lg text-slate-900 mb-4">You May Also Like</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {relatedBooks.map(rel => (
                  <BookCard key={rel._id} book={rel} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Submission Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        book={book}
        onReviewSubmitted={(newRev) => {
          setReviews(prev => [newRev, ...prev]);
        }}
      />
    </div>
  );
};

export default BookDetail;
