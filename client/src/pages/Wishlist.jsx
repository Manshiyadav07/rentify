import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingBag, Trash2, ArrowLeft, BookOpen } from 'lucide-react';

const Wishlist = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/" className="text-xs text-slate-400 hover:text-slate-600 transition flex items-center gap-1">
              <ArrowLeft size={14} /> Back to Catalog
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Heart size={26} className="text-rose-500 fill-rose-500" /> Saved Wishlist
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {wishlist.length} book{wishlist.length !== 1 ? 's' : ''} saved to read later
          </p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto shadow-xs my-8">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <Heart size={32} />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Your wishlist is empty</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Click the heart icon on any book card to save books you're excited to read later.
          </p>
          <Link
            to="/"
            className="mt-5 inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-xs"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map(book => (
            <div
              key={book._id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
            >
              <Link to={`/books/${book._id}`} className="block relative aspect-[4/5] bg-slate-100 overflow-hidden">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-700 shadow-sm">
                  {book.category}
                </span>
              </Link>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <Link to={`/books/${book._id}`}>
                    <h4 className="font-bold text-slate-900 text-xs line-clamp-2 hover:text-blue-600 transition">
                      {book.title}
                    </h4>
                  </Link>
                  <p className="text-[11px] text-slate-400 mt-0.5">by {book.author}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-extrabold text-blue-600">₹{book.rentalPrice}</span>
                    <span className="text-[10px] text-slate-400"> / rent</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleWishlist(book)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-50 transition"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => addToCart(book._id, 14)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1"
                    >
                      <ShoppingBag size={13} /> Rent
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
