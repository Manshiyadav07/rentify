import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Clock, RefreshCw, Sparkles, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80 mt-20 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Props Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">100% Refundable Deposit</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">Security deposits are automatically returned upon safe book return.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Clock size={22} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Flexible Rental Terms</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">Choose from 7, 14, 21, or 30 days reading periods with low rates.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <RefreshCw size={22} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Smart Waiting Lists</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">Never miss an out-of-stock book. Join the queue for priority notification.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Sparkles size={22} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Grok AI Assistant</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">Personalized recommendations and platform questions answered 24/7.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 text-blue-600 font-extrabold text-xl tracking-tight mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                <BookOpen size={18} />
              </div>
              <span>Rentify</span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              Rentify is a production-grade intelligent book rental platform empowering lifelong readers and students with affordable access to physical books.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">Explore Books</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><Link to="/?category=Technology" className="hover:text-blue-600 transition">Technology & Engineering</Link></li>
              <li><Link to="/?category=Self-Help" className="hover:text-blue-600 transition">Self-Help & Productivity</Link></li>
              <li><Link to="/?category=Business" className="hover:text-blue-600 transition">Business & Finance</Link></li>
              <li><Link to="/?category=Psychology" className="hover:text-blue-600 transition">Psychology & Science</Link></li>
              <li><Link to="/?category=Fiction" className="hover:text-blue-600 transition">Fiction & Bestsellers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">Reader Account</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><Link to="/rental-history" className="hover:text-blue-600 transition">My Active Rentals</Link></li>
              <li><Link to="/wishlist" className="hover:text-blue-600 transition">Saved Wishlist</Link></li>
              <li><Link to="/profile" className="hover:text-blue-600 transition">Profile & Addresses</Link></li>
              <li><Link to="/my-listings" className="hover:text-blue-600 transition">Peer Notes & PYQs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">Rental Policies</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>Rental Duration: 14 Days standard</li>
              <li>Late Fee: ₹10 / day overdue</li>
              <li>Instant Deposit Refund upon Return</li>
              <li>Verified Reader Reviews</li>
              <li>Razorpay Secured Transactions</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} Rentify Book Rental Platform. Built with <Heart size={12} className="inline text-rose-500" /> for passionate readers.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 cursor-pointer">Terms of Service</span>
            <span>·</span>
            <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-slate-600 cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;