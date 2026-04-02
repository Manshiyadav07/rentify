const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAllListings,
  getListingById,
  createListing,
  getUserListings,
  deleteListing,
  updateListingStatus
} = require('../controllers/listingController');

router.get('/', getAllListings);
router.get('/user/:userId', protect, getUserListings);
router.get('/:id', getListingById);
router.post('/', protect, createListing);
router.delete('/:id', protect, deleteListing);
router.patch('/:id/status', protect, updateListingStatus);

module.exports = router;