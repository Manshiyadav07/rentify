import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BookOpen, KeyRound, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`/api/auth/reset-password/${token}`, { password });
      if (data.success) {
        toast.success(data.message || 'Password reset successfully!');
        if (data.token) {
          login(data);
          navigate('/');
        } else {
          navigate('/login');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset link is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm max-w-md w-full p-8 text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 font-extrabold text-xl mb-6">
          <BookOpen size={24} /> Rentify
        </Link>

        <h2 className="text-xl font-bold text-slate-900 mb-1">Set New Password</h2>
        <p className="text-xs text-slate-500 mb-6">Please choose a strong password with at least 6 characters.</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs shadow-md shadow-blue-500/20 transition disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password & Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
