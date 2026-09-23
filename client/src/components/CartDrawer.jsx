import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

const CartDrawer = () => {
  const { cart, isDrawerOpen, closeDrawer, updateRentalDays, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-fade-in">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <ShoppingBag size={20} className="text-blue-600" />
              <span>Rental Cart</span>
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                {cart.itemCount} item{cart.itemCount !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
                  <ShoppingBag size={32} />
                </div>
                <p className="font-semibold text-slate-700 text-base">Your rental cart is empty</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Discover thousands of books available for rent with zero commitment.
                </p>
              </div>
            ) : (
              cart.items.map(item => (
                <div
                  key={item._id}
                  className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 flex gap-3 relative group"
                >
                  <img
                    src={item.book.coverImage}
                    alt={item.book.title}
                    className="w-16 h-22 object-cover rounded-lg shadow-sm shrink-0 bg-white"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1 leading-snug">
                        {item.book.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">by {item.book.author}</p>
                    </div>

                    {/* Duration Selector */}
                    <div className="flex items-center gap-1.5 my-2">
                      <Clock size={12} className="text-slate-400" />
                      <span className="text-[11px] text-slate-500">Duration:</span>
                      <select
                        value={item.rentalDays}
                        onChange={(e) => updateRentalDays(item.book._id, e.target.value)}
                        className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                      >
                        <option value={7}>7 Days</option>
                        <option value={14}>14 Days</option>
                        <option value={21}>21 Days</option>
                        <option value={30}>30 Days</option>
                      </select>
                    </div>

                    {/* Price & Deposit */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs">
                        <span className="font-bold text-blue-600">₹{item.rentalFee}</span>
                        <span className="text-slate-400 text-[11px] ml-1">
                          (+₹{item.securityDeposit} deposit)
                        </span>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.book._id)}
                        className="text-slate-400 hover:text-rose-500 transition p-1"
                        title="Remove"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Totals */}
          {cart.items.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-white space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Rental Fees:</span>
                  <span className="font-semibold text-slate-800">₹{cart.subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    Security Deposit:
                    <span className="text-[10px] text-emerald-600 font-medium">(100% Refundable)</span>
                  </span>
                  <span className="font-semibold text-slate-800">₹{cart.securityDepositTotal}</span>
                </div>
                <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-bold text-slate-900">
                  <span>Total Payable:</span>
                  <span className="text-blue-600 text-base">₹{cart.grandTotal}</span>
                </div>
              </div>

              <div className="bg-emerald-50 text-emerald-800 text-[11px] p-2.5 rounded-xl flex items-center gap-2 border border-emerald-100">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>Security deposit is credited back to your account immediately upon return.</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md shadow-blue-500/20 transition"
              >
                Proceed to Checkout
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
