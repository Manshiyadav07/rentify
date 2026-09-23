const express = require('express');
const router = express.Router();
const {
  createReview,
  getBookReviews,
  deleteReview,
  reportReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:bookId', getBookReviews);
router.post('/:bookId', protect, createReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/report', protect, reportReview);

module.exports = router;
