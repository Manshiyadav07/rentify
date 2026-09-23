const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPaymentAndCheckout,
  getInvoice
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPaymentAndCheckout);
router.get('/invoice/:identifier', getInvoice);

module.exports = router;
