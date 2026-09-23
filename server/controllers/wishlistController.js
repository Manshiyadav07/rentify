const Wishlist = require('../models/Wishlist');
const Cart = require('../models/Cart');
const Book = require('../models/Book');

// @desc    Get current user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('books');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, books: [] });
    }

    res.json({
      success: true,
      books: wishlist.books || [],
      count: (wishlist.books || []).length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle book in wishlist (Add/Remove)
// @route   POST /api/wishlist/toggle
// @access  Private
const toggleWishlist = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    if (!bookId) {
      return res.status(400).json({ success: false, message: 'Book ID is required' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, books: [] });
    }

    const index = wishlist.books.indexOf(bookId);
    let action = '';

    if (index > -1) {
      wishlist.books.splice(index, 1);
      action = 'removed';
    } else {
      wishlist.books.push(bookId);
      action = 'added';
    }

    await wishlist.save();
    await wishlist.populate('books');

    res.json({
      success: true,
      action,
      message: action === 'added' ? 'Book saved to wishlist' : 'Book removed from wishlist',
      books: wishlist.books,
      count: wishlist.books.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Move book from wishlist to cart
// @route   POST /api/wishlist/move-to-cart
// @access  Private
const moveToCart = async (req, res, next) => {
  try {
    const { bookId, rentalDays = 14 } = req.body;

    const [wishlist, cart] = await Promise.all([
      Wishlist.findOne({ user: req.user._id }),
      Cart.findOne({ user: req.user._id }) || Cart.create({ user: req.user._id, items: [] })
    ]);

    // 1. Remove from wishlist
    if (wishlist) {
      wishlist.books = wishlist.books.filter(b => b.toString() !== bookId.toString());
      await wishlist.save();
    }

    // 2. Add to cart
    const existingIndex = cart.items.findIndex(i => i.book.toString() === bookId.toString());
    if (existingIndex > -1) {
      cart.items[existingIndex].rentalDays = Number(rentalDays);
    } else {
      cart.items.push({ book: bookId, rentalDays: Number(rentalDays) });
    }
    await cart.save();

    res.json({
      success: true,
      message: 'Moved book from wishlist to cart'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
  moveToCart
};
