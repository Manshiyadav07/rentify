const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  getRelatedBooks
} = require('../controllers/recommendationController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, getRecommendations);
router.get('/related/:bookId', getRelatedBooks);

module.exports = router;
