const express = require('express');
const router = express.Router();
const {
  getAllBooks,
  getBookById,
  getCategories,
  createBook,
  updateBook,
  deleteBook
} = require('../controllers/bookController');
const { protect, adminProtect } = require('../middleware/authMiddleware');

router.get('/', getAllBooks);
router.get('/categories', getCategories);
router.get('/:id', getBookById);

// Admin only routes
router.post('/', protect, adminProtect, createBook);
router.put('/:id', protect, adminProtect, updateBook);
router.delete('/:id', protect, adminProtect, deleteBook);

module.exports = router;
