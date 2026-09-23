import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { BookOpen, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState(null);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/forgot-password', { email });
      if (data.success) {
        setSubmitted(true);
        if (data.devResetToken) {
          setDevToken(data.devResetToken);
        }
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send password reset instructions');
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

        {submitted ? (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={30} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Instructions Sent!</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an account is associated with <strong>{email}</strong>, you will receive password reset instructions.
            </p>

            {devToken && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-left text-blue-900 space-y-2">
                <span className="font-bold text-[10px] uppercase tracking-wider bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                  Dev Mode Test Token
                </span>
                <p className="font-mono break-all text-[11px]">{devToken}</p>
                <Link
                  to={`/reset-password/${devToken}`}
                  className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs"
                >
                  Click to Reset Password Now &rarr;
                </Link>
              </div>
            )}

            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline pt-2"
            >
              <ArrowLeft size={14} /> Return to Login
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Forgot Password?</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Enter your registered email address and we'll send you a link to reset your account password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-left pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. reader@example.com"
                    className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs shadow-md shadow-blue-500/20 transition disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 pt-3"
            >
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
