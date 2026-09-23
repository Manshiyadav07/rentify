import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Heart, Star, ShoppingBag, BookOpen, Users } from 'lucide-react';

const categoryColors = {
  Technology: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  'Self-Help': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Business: 'bg-amber-50 text-amber-700 border-amber-100',
  Psychology: 'bg-purple-50 text-purple-700 border-purple-100',
  Science: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  Fiction: 'bg-rose-50 text-rose-700 border-rose-100',
  Literature: 'bg-orange-50 text-orange-700 border-orange-100',
  'Non-Fiction': 'bg-blue-50 text-blue-700 border-blue-100',
  Default: 'bg-slate-50 text-slate-700 border-slate-100'
};

const BookCard = ({ book }) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const isSaved = isWishlisted(book._id);
  const isOutOfStock = book.availableCopies <= 0;
  const categoryBadgeClass = categoryColors[book.category] || categoryColors.Default;

  const handleRentNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      navigate(`/books/${book._id}`);
      return;
    }

    const success = await addToCart(book, 14);
    if (success) {
      if (user) {
        navigate('/checkout');
      } else {
        toast.info('Please sign in to complete your book rental order');
        navigate('/login', { state: { from: '/checkout' } });
      }
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Wishlist Floating Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(book);
        }}
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90 shadow-md ${
          isSaved
            ? 'bg-rose-500 text-white'
            : 'bg-white/90 backdrop-blur-md text-slate-500 hover:text-rose-500 hover:bg-white'
        }`}
        title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
      >
        <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
      </button>

      {/* Book Cover */}
      <Link to={`/books/${book._id}`} className="block relative aspect-[4/5] bg-slate-100 overflow-hidden">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 text-blue-300">
            <BookOpen size={48} />
          </div>
        )}

        {/* Stock Status Pill */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-md ${categoryBadgeClass}`}>
            {book.category}
          </span>
          {isOutOfStock ? (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-500/90 text-white shadow-sm flex items-center gap-1">
              <Users size={10} /> Waitlist
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600/90 text-white shadow-sm">
              {book.availableCopies} available
            </span>
          )}
        </div>
      </Link>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 mb-1.5">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-slate-800">{book.averageRating || 4.5}</span>
            <span className="text-[11px] text-slate-400">({book.numReviews || 0})</span>
          </div>

          {/* Title */}
          <Link to={`/books/${book._id}`}>
            <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition">
              {book.title}
            </h3>
          </Link>

          {/* Author */}
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">by {book.author}</p>
        </div>

        {/* Pricing & Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-lg font-extrabold text-blue-600">₹{book.rentalPrice}</span>
              <span className="text-xs text-slate-400 font-normal"> / 14 days</span>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              +₹{book.securityDeposit || 100} dep.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isOutOfStock) {
                  navigate(`/books/${book._id}`);
                } else {
                  addToCart(book, 14);
                }
              }}
              className="w-full flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
            >
              <ShoppingBag size={14} />
              {isOutOfStock ? 'Waitlist' : 'Add Cart'}
            </button>
            <button
              onClick={handleRentNow}
              className="w-full flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition"
            >
              Rent Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
