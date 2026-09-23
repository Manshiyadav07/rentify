const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getAllRentals,
  processAdminReturn,
  syncOverdueRentals,
  getAllUsers,
  updateUserRole,
  getAllCopies,
  updateCopy,
  getReportedReviews,
  dismissReport
} = require('../controllers/adminController');
const { protect, adminProtect } = require('../middleware/authMiddleware');

router.use(protect);
router.use(adminProtect);

router.get('/analytics', getAnalytics);
router.get('/rentals', getAllRentals);
router.post('/rentals/:id/process-return', processAdminReturn);
router.post('/rentals/sync-overdue', syncOverdueRentals);

router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);

router.get('/inventory/copies', getAllCopies);
router.patch('/inventory/copies/:copyId', updateCopy);

router.get('/reviews/reported', getReportedReviews);
router.patch('/reviews/:id/dismiss', dismissReport);

module.exports = router;
