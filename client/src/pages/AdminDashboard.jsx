import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  LayoutDashboard,
  DollarSign,
  Users,
  BookOpen,
  Clock,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  Boxes,
  ShieldAlert,
  Search,
  RefreshCw,
  Edit2
} from 'lucide-react';

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [rentals, setRentals] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [copies, setCopies] = useState([]);
  const [reportedReviews, setReportedReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Return Processing Modal State
  const [selectedRental, setSelectedRental] = useState(null);
  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [adminNotes, setAdminNotes] = useState('');
  const [processingReturn, setProcessingReturn] = useState(false);

  // Copy Edit Modal State
  const [editingCopy, setEditingCopy] = useState(null);
  const [copyStatus, setCopyStatus] = useState('AVAILABLE');
  const [copyCondition, setCopyCondition] = useState('GOOD');

  const fetchAnalytics = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/admin/analytics');
      if (data.success) {
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  }, []);

  const fetchRentals = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/admin/rentals');
      if (data.success) {
        setRentals(data.rentals || []);
      }
    } catch (err) {
      console.error('Failed to load rentals:', err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/admin/users');
      if (data.success) {
        setUsersList(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  }, []);

  const fetchCopies = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/admin/inventory/copies');
      if (data.success) {
        setCopies(data.copies || []);
      }
    } catch (err) {
      console.error('Failed to load copies:', err);
    }
  }, []);

  const fetchReportedReviews = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/admin/reviews/reported');
      if (data.success) {
        setReportedReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchAnalytics(),
      fetchRentals(),
      fetchUsers(),
      fetchCopies(),
      fetchReportedReviews()
    ]).finally(() => setLoading(false));
  }, [fetchAnalytics, fetchRentals, fetchUsers, fetchCopies, fetchReportedReviews]);

  const handleProcessReturn = async () => {
    if (!selectedRental) return;
    setProcessingReturn(true);
    try {
      const { data } = await axios.post(`/api/admin/rentals/${selectedRental._id}/process-return`, {
        condition: returnCondition,
        adminNotes
      });

      if (data.success) {
        toast.success(data.message);
        setSelectedRental(null);
        fetchRentals();
        fetchAnalytics();
        fetchCopies();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process return');
    } finally {
      setProcessingReturn(false);
    }
  };

  const handleSyncOverdue = async () => {
    try {
      const { data } = await axios.post('/api/admin/rentals/sync-overdue');
      if (data.success) {
        toast.success(data.message);
        fetchRentals();
        fetchAnalytics();
      }
    } catch (err) {
      toast.error('Failed to sync overdue rentals');
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const { data } = await axios.patch(`/api/admin/users/${userId}/role`, { role: newRole });
      if (data.success) {
        toast.success(`Role updated to ${newRole}`);
        fetchUsers();
      }
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleUpdateCopy = async () => {
    if (!editingCopy) return;
    try {
      const { data } = await axios.patch(`/api/admin/inventory/copies/${editingCopy.copyId}`, {
        condition: copyCondition,
        status: copyStatus
      });
      if (data.success) {
        toast.success('Inventory copy updated');
        setEditingCopy(null);
        fetchCopies();
        fetchAnalytics();
      }
    } catch (err) {
      toast.error('Failed to update copy');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 text-center text-xs text-slate-500">
        Access Denied. You must be an administrator to view this page.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <LayoutDashboard size={28} className="text-indigo-600" /> Admin Console
            </h1>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Live Operations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Platform analytics, inventory tracking, return inspection, and user roles</p>
        </div>

        <button
          onClick={handleSyncOverdue}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition w-fit"
        >
          <RefreshCw size={14} /> Sync Overdue Rentals
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-8 overflow-x-auto">
        {[
          { key: 'overview', label: 'Analytics & KPIs', icon: TrendingUp },
          { key: 'rentals', label: `All Rentals (${rentals.length})`, icon: Clock },
          { key: 'copies', label: `Inventory Copies (${copies.length})`, icon: Boxes },
          { key: 'users', label: `Users (${usersList.length})`, icon: Users },
          { key: 'reviews', label: `Moderation (${reportedReviews.length})`, icon: ShieldAlert }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-8">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold block">Total Revenue</span>
              <p className="text-2xl font-black text-blue-600 mt-1">₹{analytics.stats.totalRevenue}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">{analytics.stats.totalOrders} total orders</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold block">Active Rentals</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{analytics.stats.activeRentals}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">In circulation</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold block">Overdue Rentals</span>
              <p className="text-2xl font-black text-rose-600 mt-1">{analytics.stats.overdueRentals}</p>
              <span className="text-[10px] text-rose-500 font-semibold mt-1 block">Action required</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold block">Total Books</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{analytics.stats.totalBooks}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">{analytics.stats.totalCopies} physical copies</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold block">Registered Users</span>
              <p className="text-2xl font-black text-indigo-600 mt-1">{analytics.stats.totalUsers}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">Active readers</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold block">Waitlist Queues</span>
              <p className="text-2xl font-black text-amber-600 mt-1">{analytics.stats.totalReservations}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">Awaiting stock</span>
            </div>
          </div>

          {/* Charts & Leaderboards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Top Rented Books Leaderboard */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-600" /> Top Rented Books Leaderboard
              </h3>
              <div className="divide-y divide-slate-100">
                {analytics.topBooks?.map((book, idx) => (
                  <div key={book._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <img src={book.coverImage} alt={book.title} className="w-10 h-14 object-cover rounded-md shadow-xs" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{book.title}</h4>
                        <p className="text-[11px] text-slate-400">by {book.author}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <span className="font-extrabold text-blue-600">{book.rentalCount} rentals</span>
                      <span className="text-[10px] text-slate-400 block">⭐ {book.averageRating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-600" /> Catalog Category Breakdown
              </h3>
              <div className="space-y-3">
                {analytics.categoryDistribution?.map(c => (
                  <div key={c.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{c.category}</span>
                      <span className="text-slate-500">{c.count} titles · {c.totalRentals} rentals</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                        style={{ width: `${Math.min(100, (c.count / analytics.stats.totalBooks) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL RENTALS & RETURN PROCESSING */}
      {activeTab === 'rentals' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Rental ID</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Book Title</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Total Paid</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rentals.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 font-mono font-bold text-slate-800">#{r.rentalId}</td>
                    <td className="p-4 font-medium text-slate-700">
                      {r.user?.name}
                      <span className="text-[10px] text-slate-400 block">{r.user?.email}</span>
                    </td>
                    <td className="p-4 font-semibold text-slate-900 max-w-[200px] truncate">
                      {r.book?.title}
                    </td>
                    <td className="p-4 text-slate-600">
                      Due: {new Date(r.dueDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        r.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                        r.status === 'RETURN_REQUESTED' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                        r.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">₹{r.totalAmount}</td>
                    <td className="p-4 text-right">
                      {r.status !== 'RETURNED' && r.status !== 'CANCELLED' ? (
                        <button
                          onClick={() => {
                            setSelectedRental(r);
                            setReturnCondition('GOOD');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition"
                        >
                          Process Return
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PHYSICAL INVENTORY COPIES */}
      {activeTab === 'copies' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Copy ID</th>
                  <th className="p-4">Book Title</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Condition</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {copies.map(c => (
                  <tr key={c.copyId} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 font-mono font-bold text-slate-800">{c.copyId}</td>
                    <td className="p-4 font-semibold text-slate-900 max-w-[240px] truncate">{c.book?.title}</td>
                    <td className="p-4 text-slate-600">{c.location}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        c.condition === 'NEW' ? 'bg-emerald-100 text-emerald-800' :
                        c.condition === 'GOOD' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {c.condition}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        c.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                        c.status === 'RENTED' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setEditingCopy(c);
                          setCopyCondition(c.condition);
                          setCopyStatus(c.status);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition"
                      >
                        <Edit2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-right">Toggle Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 font-bold text-slate-900">{u.name}</td>
                    <td className="p-4 text-slate-600">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleRole(u._id, u.role)}
                        className="text-xs text-blue-600 hover:underline font-semibold"
                      >
                        {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: REPORTED REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
          {reportedReviews.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No reported reviews pending moderation.
            </div>
          ) : (
            <div className="space-y-4 divide-y divide-slate-100">
              {reportedReviews.map(rev => (
                <div key={rev._id} className="pt-4 first:pt-0 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">"{rev.title || 'Review'}" on {rev.book?.title}</h4>
                    <p className="text-xs text-slate-600 mt-1">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">Author: {rev.user?.name} ({rev.user?.email})</span>
                  </div>
                  <button
                    onClick={async () => {
                      await axios.patch(`/api/admin/reviews/${rev._id}/dismiss`);
                      toast.success('Report dismissed');
                      fetchReportedReviews();
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shrink-0"
                  >
                    Dismiss Report
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Process Return Modal */}
      {selectedRental && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-fade-in space-y-4">
            <h3 className="text-base font-bold text-slate-900">Inspect & Process Return</h3>
            <p className="text-xs text-slate-500">
              Rental #{selectedRental.rentalId} · "{selectedRental.book?.title}"
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Returned Condition</label>
              <select
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
              >
                <option value="GOOD">GOOD (100% Deposit Refunded, Copy Returned to Stock)</option>
                <option value="DAMAGED">DAMAGED (50% Damage Fee Deducted from Deposit)</option>
                <option value="LOST">LOST (100% Deposit Forfeited)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Admin Inspection Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Inspected pages, binding intact..."
                rows={3}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 resize-none"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setSelectedRental(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessReturn}
                disabled={processingReturn}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                {processingReturn ? 'Completing...' : 'Confirm Return'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Copy Modal */}
      {editingCopy && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-fade-in space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Edit Physical Copy {editingCopy.copyId}</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Condition</label>
              <select
                value={copyCondition}
                onChange={(e) => setCopyCondition(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              >
                <option value="NEW">NEW</option>
                <option value="GOOD">GOOD</option>
                <option value="FAIR">FAIR</option>
                <option value="POOR">POOR</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={copyStatus}
                onChange={(e) => setCopyStatus(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="RENTED">RENTED</option>
                <option value="DAMAGED">DAMAGED</option>
                <option value="LOST">LOST</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingCopy(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCopy}
                className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
