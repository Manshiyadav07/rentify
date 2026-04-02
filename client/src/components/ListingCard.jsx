import { Link } from 'react-router-dom'
import { MapPin, Tag, BookOpen } from 'lucide-react'

const categoryColors = {
  Book: 'bg-blue-100 text-blue-700',
  Notes: 'bg-green-100 text-green-700',
  PYQ: 'bg-purple-100 text-purple-700',
}

const ListingCard = ({ listing }) => {
  const { _id, title, category, type, price, condition, location, status, owner, image } = listing

  return (
    <Link to={`/listings/${_id}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden">
        
        {/* Image */}
        <div className="h-44 bg-gray-100 overflow-hidden">
          {image ? (
            <img src={image} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
              <BookOpen size={40} className="text-blue-300" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[category]}`}>
              {category}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              type === 'Donate' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {type}
            </span>
            {status === 'Taken' && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                Taken
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 mb-2">
            {title}
          </h3>

          {/* Price */}
          <p className="text-blue-600 font-bold text-lg mb-3">
            {type === 'Donate' ? (
              <span className="text-green-600">Free </span>
            ) : (
              <>₹{price}<span className="text-gray-400 text-sm font-normal">/rent</span></>
            )}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-2">
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {location}
            </span>
            <span className="flex items-center gap-1">
              <Tag size={11} /> {condition}
            </span>
          </div>

          {owner?.name && (
            <p className="text-xs text-gray-400 mt-1">by {owner.name}</p>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ListingCard