import { useState } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { Star, X, CheckCircle2 } from 'lucide-react';

const ReviewModal = ({ isOpen, onClose, book, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  if (!isOpen || !book) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please enter a review comment');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await axios.post(`/api/reviews/${book._id}`, {
        rating,
        title,
        comment
      });

      if (data.success) {
        toast.success('Review submitted successfully!');
        if (onReviewSubmitted) onReviewSubmitted(data.review);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-fade-in relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
        >
          <X size={20} />
        </button>

        <h3 className="text-lg font-bold text-slate-900 mb-1">Write a Review</h3>
        <p className="text-xs text-slate-500 mb-4 line-clamp-1">for "{book.title}"</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Picker */}
          <div className="text-center py-2 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-600 block mb-2">Overall Rating</span>
            <div className="flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-slate-300 hover:scale-110 transition-transform"
                >
                  <Star
                    size={28}
                    className={`${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200 fill-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-600 mt-1 block">
              {rating === 5 ? 'Excellent!' : rating === 4 ? 'Very Good' : rating === 3 ? 'Average' : rating === 2 ? 'Poor' : 'Terrible'}
            </span>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Review Headline (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Life changing habits guide!"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Written Review *</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              required
              placeholder="What did you like or dislike about this book? How was the rental condition?"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition resize-none"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>If you rented this book, your review will feature a Verified Reader badge.</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-xs shadow-md shadow-blue-500/20 transition disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
