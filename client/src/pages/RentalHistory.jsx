import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import InvoiceModal from '../components/InvoiceModal';
import ReviewModal from '../components/ReviewModal';
import {
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  FileText,
  RotateCcw,
  MessageSquare,
  BookOpen,
  ArrowRight
} from 'lucide-react';

const statusBadges = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  RETURN_REQUESTED: 'bg-amber-50 text-amber-700 border-amber-200',
  RETURNED: 'bg-blue-50 text-blue-700 border-blue-200',
  OVERDUE: 'bg-rose-50 text-rose-700 border-rose-200',
  CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200'
};

const RentalHistory = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [reviewBook, setReviewBook] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const toast = useToast();

  const fetchRentals = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeTab !== 'ALL' ? { status: activeTab } : {};
      const { data } = await axios.get('/api/rentals/my', { params });
      if (data.success) {
        setRentals(data.rentals || []);
      }
    } catch (err) {
      console.error('Failed to load rentals:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  const handleRequestReturn = async (rentalId) => {
    if (!window.confirm('Request return for this book? Our courier team or library desk will verify and process your deposit refund.')) return;

    setActionLoading(rentalId);
    try {
      const { data } = await axios.post(`/api/rentals/${rentalId}/return-request`);
      if (data.success) {
        toast.success('Return requested successfully!');
        fetchRentals();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request return');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewInvoice = async (rental) => {
    try {
      const { data } = await axios.get(`/api/payments/invoice/${rental.orderId}`);
      if (data.success) {
        setSelectedInvoice(data.invoice);
        setIsInvoiceOpen(true);
      }
    } catch {
      toast.error('Invoice could not be retrieved');
    }
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock size={26} className="text-blue-600" /> My Rental History
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage current book loans, return requests, and invoices</p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-100 p-1.5 rounded-2xl">
          {['ALL', 'ACTIVE', 'RETURN_REQUESTED', 'OVERDUE', 'RETURNED'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'RETURN_REQUESTED' ? 'Pending Return' : tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        </div>
      ) : rentals.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto shadow-xs my-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No rentals found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            You don't have any book loans in this category.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rentals.map(rental => {
            const daysLeft = getDaysRemaining(rental.dueDate);
            const isOverdue = rental.status === 'OVERDUE' || (rental.status === 'ACTIVE' && daysLeft < 0);

            return (
              <div
                key={rental._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Book Info */}
                <div className="flex items-start gap-4 flex-1">
                  <img
                    src={rental.book?.coverImage}
                    alt={rental.book?.title}
                    className="w-16 h-22 object-cover rounded-xl shadow-sm shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadges[rental.status]}`}>
                        {rental.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">#{rental.rentalId}</span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 leading-snug">
                      {rental.book?.title}
                    </h3>
                    <p className="text-xs text-slate-500">by {rental.book?.author}</p>

                    <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-slate-400" /> Rented: {new Date(rental.startDate).toLocaleDateString('en-IN')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-slate-400" /> Due: <strong className="text-slate-800">{new Date(rental.dueDate).toLocaleDateString('en-IN')}</strong>
                      </span>
                    </div>

                    {/* Due Countdown Indicator */}
                    {rental.status === 'ACTIVE' && (
                      <div className="mt-1">
                        {daysLeft > 0 ? (
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                            daysLeft <= 3 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            ⏳ {daysLeft} day{daysLeft !== 1 ? 's' : ''} left to return
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 flex items-center gap-1 w-fit">
                            <AlertCircle size={12} /> Overdue by {Math.abs(daysLeft)} days! Late fee: ₹{rental.lateFee || Math.abs(daysLeft) * 10}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Summary & Action Buttons */}
                <div className="flex flex-col md:items-end gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="text-xs text-right">
                    <span className="text-slate-400">Total Paid: </span>
                    <span className="font-extrabold text-blue-600 text-sm">₹{rental.totalAmount}</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      (₹{rental.rentalPrice} rent + ₹{rental.securityDeposit} deposit)
                    </span>
                    {rental.refundedDeposit > 0 && (
                      <span className="text-[11px] text-emerald-600 font-bold block">
                        Refunded Deposit: ₹{rental.refundedDeposit}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {rental.status === 'ACTIVE' || rental.status === 'OVERDUE' ? (
                      <button
                        onClick={() => handleRequestReturn(rental._id)}
                        disabled={actionLoading === rental._id}
                        className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
                      >
                        <RotateCcw size={13} />
                        {actionLoading === rental._id ? 'Submitting...' : 'Request Return'}
                      </button>
                    ) : null}

                    {rental.orderId && (
                      <button
                        onClick={() => handleViewInvoice(rental)}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                      >
                        <FileText size={13} /> Invoice
                      </button>
                    )}

                    {rental.status === 'RETURNED' && (
                      <button
                        onClick={() => {
                          setReviewBook(rental.book);
                          setIsReviewOpen(true);
                        }}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition"
                      >
                        <MessageSquare size={13} /> Review Book
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        invoice={selectedInvoice}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        book={reviewBook}
      />
    </div>
  );
};

export default RentalHistory;
