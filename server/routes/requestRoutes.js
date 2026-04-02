const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createRequest,
  getOwnerRequests,
  getMyRequests,
  updateRequestStatus,
  checkRequest
} = require('../controllers/requestController');

router.post('/', protect, createRequest);
router.get('/owner', protect, getOwnerRequests);
router.get('/my', protect, getMyRequests);
router.get('/check/:listingId', protect, checkRequest);
router.patch('/:id', protect, updateRequestStatus);

module.exports = router;