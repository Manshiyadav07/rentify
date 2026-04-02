import { BookOpen } from 'lucide-react'

const EmptyState = ({ message = 'No listings found' }) => (
  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
    <BookOpen size={48} className="mb-4 text-gray-300" />
    <p className="text-lg font-medium">{message}</p>
    <p className="text-sm mt-1">Try adjusting your filters or search</p>
  </div>
)

export default EmptyState