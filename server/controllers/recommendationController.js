const recommendationService = require('../services/recommendationService');

// @desc    Get personalized book recommendations for user
// @route   GET /api/recommendations
// @access  Public (Optional auth for personalization)
const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const limit = parseInt(req.query.limit, 10) || 8;

    const recommendations = await recommendationService.getPersonalizedRecommendations(userId, limit);

    res.json({
      success: true,
      recommendations,
      isPersonalized: Boolean(userId)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get related books for a book detail page
// @route   GET /api/recommendations/related/:bookId
// @access  Public
const getRelatedBooks = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 4;
    const related = await recommendationService.getRelatedBooks(req.params.bookId, limit);

    res.json({
      success: true,
      related
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
  getRelatedBooks
};
