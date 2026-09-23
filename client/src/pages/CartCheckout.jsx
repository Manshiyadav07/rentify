import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import InvoiceModal from '../components/InvoiceModal';
import {
  ShoppingBag,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowLeft,
  MapPin,
  Lock,
  Sparkles,
  Info
} from 'lucide-react';

const CartCheckout = () => {
  const { user } = useAuth();
  const { cart, refreshCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    street: user?.address?.street || '123 Tech Park Residency',
    city: user?.address?.city || 'Bengaluru',
    state: user?.address?.state || 'Karnataka',
    zipCode: user?.address?.zipCode || '560001'
  });

  const [loading, setLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  if (cart.items.length === 0 && !completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Your Rental Cart is Empty</h2>
        <p className="text-xs text-slate-500 mb-6">Choose from our catalog to get books delivered to your doorstep.</p>
        <Link
          to="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition"
        >
          Explore Books
        </Link>
      </div>
    );
  }

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // 1. Create order on backend
      const checkoutItems = cart.items.map(i => ({
        bookId: i.book._id,
        rentalDays: i.rentalDays
      }));

      const orderRes = await axios.post('/api/payments/create-order', {
        items: checkoutItems
      });

      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Order creation failed');
      }

      const { order, totalAmount } = orderRes.data;

      // 2. If Real / Test Razorpay Keys are configured, open official Razorpay Popup
      if (!order.isSandbox && order.keyId) {
        if (!window.Razorpay) {
          await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve();
            script.onerror = () => resolve();
            document.body.appendChild(script);
          });
        }

        if (window.Razorpay) {
          const options = {
            key: order.keyId,
            amount: Math.round(totalAmount * 100),
            currency: order.currency || 'INR',
            name: 'Rentify Book Rentals',
            description: `Rental payment for ${checkoutItems.length} book(s)`,
            order_id: order.orderId,
            prefill: {
              name: user?.name || 'Reader',
              email: user?.email || 'reader@rentify.com',
              contact: user?.phone || '9999999999'
            },
            theme: {
              color: '#2563eb'
            },
            handler: async function (response) {
              try {
                // Server-side HMAC-SHA256 signature verification
                const verifyRes = await axios.post('/api/payments/verify', {
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  isSandbox: false,
                  items: checkoutItems
                });

                if (verifyRes.data.success) {
                  toast.success('Payment verified & rental confirmed via Razorpay!');
                  setCompletedOrder({
                    orderId: response.razorpay_order_id,
                    rentals: verifyRes.data.rentals,
                    totalPaid: totalAmount
                  });
                  setInvoice(verifyRes.data.invoice);
                  refreshCart();
                }
              } catch (err) {
                toast.error(err.response?.data?.message || 'Payment verification failed at server.');
              } finally {
                setLoading(false);
              }
            },
            modal: {
              ondismiss: function () {
                setLoading(false);
                toast.info('Razorpay checkout window closed.');
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (response) {
            setLoading(false);
            toast.error(response.error?.description || 'Transaction failed at gateway.');
          });
          rzp.open();
          return;
        }
      }

      // 3. Built-in Developer Sandbox Verification (When no live keys are set in server/.env)
      const verifyRes = await axios.post('/api/payments/verify', {
        orderId: order.orderId,
        paymentId: `pay_demo_${Date.now()}`,
        signature: 'simulated_signature_verified',
        isSandbox: true,
        items: checkoutItems
      });

      if (verifyRes.data.success) {
        toast.success('Payment verified & rental confirmed!');
        setCompletedOrder({
          orderId: order.orderId,
          rentals: verifyRes.data.rentals,
          totalPaid: totalAmount
        });
        setInvoice(verifyRes.data.invoice);
        refreshCart();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-6 transition"
      >
        <ArrowLeft size={16} /> Continue Shopping
      </Link>

      {completedOrder ? (
        /* Order Confirmed Screen */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-1">Rental Confirmed!</h2>
          <p className="text-xs text-slate-500 mb-6">
            Order Reference: <strong className="text-slate-800 font-mono">{completedOrder.orderId}</strong>
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left text-xs space-y-2 mb-6">
            <div className="flex justify-between font-medium text-slate-600">
              <span>Books Rented:</span>
              <span className="font-bold text-slate-900">{completedOrder.rentals.length} book(s)</span>
            </div>
            <div className="flex justify-between font-medium text-slate-600">
              <span>Total Paid:</span>
              <span className="font-bold text-blue-600">₹{completedOrder.totalPaid}</span>
            </div>
            <div className="flex justify-between font-medium text-slate-600">
              <span>Security Deposit (Refundable):</span>
              <span className="font-bold text-emerald-600">Protected & Tracked</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setIsInvoiceOpen(true)}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition shadow-sm"
            >
              View & Print Invoice
            </button>
            <Link
              to="/rental-history"
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-sm"
            >
              Track Active Rentals
            </Link>
          </div>
        </div>
      ) : (
        /* Checkout Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Shipping & Items */}
          <div className="lg:col-span-7 space-y-6">
            {/* Delivery Address Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={18} className="text-blue-600" /> Delivery Address
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-semibold mb-1">Street Address</label>
                  <input
                    type="text"
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">State</label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Items in Checkout */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag size={18} className="text-blue-600" /> Rented Titles ({cart.items.length})
              </h3>

              <div className="divide-y divide-slate-100">
                {cart.items.map(item => (
                  <div key={item._id} className="py-3 flex items-center gap-4 text-xs">
                    <img
                      src={item.book.coverImage}
                      alt={item.book.title}
                      className="w-12 h-16 object-cover rounded-lg shadow-sm shrink-0 bg-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">{item.book.title}</h4>
                      <p className="text-slate-500 text-[11px]">by {item.book.author}</p>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 mt-1">
                        <Clock size={12} /> {item.rentalDays} Days Reading Duration
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-slate-900 text-sm block">₹{item.rentalFee}</span>
                      <span className="text-[10px] text-slate-400">+₹{item.securityDeposit} dep.</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Payment Gateway */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm sticky top-24 space-y-6">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard size={18} className="text-blue-600" /> Order Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Rental Fees:</span>
                  <span className="font-semibold text-slate-800">₹{cart.subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    Security Deposit:
                    <span className="text-[10px] text-emerald-600 font-bold">(100% Refundable)</span>
                  </span>
                  <span className="font-semibold text-slate-800">₹{cart.securityDepositTotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery & Inspection:</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-extrabold text-slate-900">
                  <span>Total Amount Payable:</span>
                  <span className="text-blue-600 text-xl font-black">₹{cart.grandTotal}</span>
                </div>
              </div>

              {/* Razorpay Trust Badge */}
              <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3 text-xs text-blue-900 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-blue-800">
                  <Sparkles size={15} className="text-blue-600" />
                  <span>Razorpay Secure Checkout</span>
                </div>
                <span className="text-[10px] font-semibold bg-white text-blue-700 px-2.5 py-1 rounded-full border border-blue-200 shadow-sm">
                  UPI • Cards • NetBanking
                </span>
              </div>

              {/* Security info */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-500">
                <Lock size={15} className="text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Payments encrypted via 256-bit SSL. Security deposits are credited back to your original payment method immediately upon book return.
                </span>
              </div>

              {/* Pay Button */}
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-blue-500/20 text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50"
              >
                <CreditCard size={18} />
                {loading ? 'Processing Transaction...' : `Pay ₹${cart.grandTotal} & Confirm Rental`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        invoice={invoice}
      />
    </div>
  );
};

export default CartCheckout;
