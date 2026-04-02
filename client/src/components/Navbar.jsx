import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Plus, LogOut, User } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <BookOpen size={24} />
          Rentify
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-gray-600 text-sm">Hi, {user.name} </span>
              <Link
                to="/add-listing"
                className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
              >
                <Plus size={16} /> Add Listing
              </Link>
              <Link
                to="/my-listings"
                className="flex items-center gap-1 text-gray-600 hover:text-blue-600 text-sm transition"
              >
                <User size={16} /> My Listings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-gray-500 hover:text-red-500 text-sm transition"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-blue-600 text-sm transition">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar