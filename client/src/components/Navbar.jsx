import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import NotificationMenu from './NotificationMenu';
import {
  BookOpen,
  ShoppingBag,
  Heart,
  LayoutDashboard,
  LogOut,
  User,
  Clock,
  Plus,
  ChevronDown,
  Menu,
  X,
  Share2
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount, openDrawer } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [userDropdown, setUserDropdown] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserDropdown(false);
    navigate('/');
  };

  return (
    <nav className="glass sticky top-0 z-40 border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 text-blue-600 font-extrabold text-xl tracking-tight">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <BookOpen size={22} />
              </div>
              <span className="bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Rentify
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  location.pathname === '/' ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                Browse Books
              </Link>
              {user && (
                <Link
                  to="/rental-history"
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    location.pathname === '/rental-history' ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  <Clock size={14} /> My Rentals
                </Link>
              )}
              <Link
                to="/peer-notes"
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  location.pathname === '/peer-notes' || location.pathname === '/listings'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
                title="Community Student Exchange"
              >
                <Share2 size={14} /> Peer Notes & PYQs
              </Link>
            </div>
          </div>

          {/* Right Action Icons & Auth Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist Button */}
            <Link
              to="/wishlist"
              className="relative p-2 rounded-xl text-slate-600 hover:text-rose-500 hover:bg-slate-100 transition"
              title="Saved Books"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={openDrawer}
              className="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition"
              title="Rental Cart"
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {itemCount}
                </span>
              )}
            </button>

            {/* In-App Notifications (Authenticated only) */}
            {user && <NotificationMenu />}

            {/* Admin Badge Shortcut */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1.5 bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs hover:bg-slate-800 transition"
              >
                <LayoutDashboard size={14} className="text-amber-400" />
                Admin
              </Link>
            )}

            {/* User Dropdown / Auth Buttons */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 p-1.5 pl-2 rounded-2xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden md:block text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      <User size={15} /> My Profile
                    </Link>

                    <Link
                      to="/rental-history"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Clock size={15} /> Rental History & Returns
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Heart size={15} /> My Wishlist
                    </Link>

                    <Link
                      to="/my-listings"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Share2 size={15} /> My Uploads & Requests
                    </Link>

                    <Link
                      to="/add-listing"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Plus size={15} /> Share Peer Notes / Books
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition"
                      >
                        <LayoutDashboard size={15} /> Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition text-left"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs shadow-blue-500/20 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenu && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-2 animate-fade-in">
            <Link
              to="/"
              onClick={() => setMobileMenu(false)}
              className="block px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
            >
              Browse Catalog
            </Link>
            {user && (
              <>
                <Link
                  to="/rental-history"
                  onClick={() => setMobileMenu(false)}
                  className="block px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                >
                  My Rentals
                </Link>
                <Link
                  to="/peer-notes"
                  onClick={() => setMobileMenu(false)}
                  className="block px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                >
                  Peer Notes & PYQs
                </Link>
                <Link
                  to="/my-listings"
                  onClick={() => setMobileMenu(false)}
                  className="block px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                >
                  My Uploads & Requests
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenu(false)}
                    className="block px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;