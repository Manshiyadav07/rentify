import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BookOpen, Mail, Lock, ArrowRight } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTarget = location.state?.from || '/';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/login', form);
      if (data.success) {
        login(data);
        toast.success(`Welcome back, ${data.name}!`);
        navigate(redirectTarget, { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = (email, password) => {
    setForm({ email, password });
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 text-blue-600 font-black text-2xl tracking-tight mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <BookOpen size={22} />
            </div>
            <span>Rentify</span>
          </Link>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-3">Welcome Back</h1>
          <p className="text-xs text-slate-500 mt-1">Sign in to manage your rentals and discover books</p>
        </div>

        {/* Quick Credentials Helper for Evaluation */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3.5 mb-6 text-xs text-slate-700 space-y-1.5">
          <span className="font-bold text-blue-800 text-[11px] block uppercase tracking-wider">Quick Demo Login:</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fillQuickCredentials('admin@rentify.com', 'admin123')}
              className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700 transition"
            >
              Admin (admin@rentify.com)
            </button>
            <button
              type="button"
              onClick={() => fillQuickCredentials('manshi@gmail.com', 'password123')}
              className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-700 text-[11px] font-semibold hover:bg-blue-100 transition"
            >
              User: manshi@gmail.com
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="reader@example.com"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md shadow-blue-500/20 text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Sign In'}
            <ArrowRight size={15} />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-bold hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
