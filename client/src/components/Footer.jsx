import { BookOpen, Github, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl mb-3">
              <BookOpen size={22} /> Rentify
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              A student-friendly marketplace to rent, donate, and share educational resources.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 text-sm">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-blue-600 transition">Home</Link></li>
              <li><Link to="/add-listing" className="hover:text-blue-600 transition">Add Listing</Link></li>
              <li><Link to="/my-listings" className="hover:text-blue-600 transition">My Listings</Link></li>
              <li><Link to="/register" className="hover:text-blue-600 transition">Register</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 text-sm">Categories</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li> Books</li>
              <li> Notes</li>
              <li>Previous Year Papers</li>
              <li>Donations</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © 2026 Rentify. Made with <Heart size={11} className="inline text-red-400" /> for students.
          </p>
          
            <button
            onClick={() => window.open('https://github.com', '_blank')}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition"
          >
            <Github size={13} /> View on GitHub
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer