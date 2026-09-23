const express = require('express');
const router = express.Router();
const {
  rentSingleBook,
  getMyRentals,
  getRentalById,
  requestReturn,
  joinWaitingList,
  getWaitingListStatus,
  getMyReservations
} = require('../controllers/rentalController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/direct', rentSingleBook);
router.get('/my', getMyRentals);
router.get('/my-reservations', getMyReservations);
router.post('/waiting-list', joinWaitingList);
router.get('/waiting-list/:bookId', getWaitingListStatus);
router.get('/:id', getRentalById);
router.post('/:id/return-request', requestReturn);

module.exports = router;
