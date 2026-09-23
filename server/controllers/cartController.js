const Cart = require('../models/Cart');
const Book = require('../models/Book');

// Helper to compute prices strictly from database records
const calculateCartTotals = (items) => {
  let subtotal = 0;
  let securityDepositTotal = 0;

  const populatedItems = items
    .filter(item => item.book) // In case a book was deleted
    .map(item => {
      const rentalFee = item.book.rentalPrice;
      const deposit = item.book.securityDeposit || 0;
      subtotal += rentalFee;
      securityDepositTotal += deposit;

      return {
        _id: item._id,
        book: {
          _id: item.book._id,
          title: item.book.title,
          author: item.book.author,
          category: item.book.category,
          coverImage: item.book.coverImage,
          rentalPrice: item.book.rentalPrice,
          securityDeposit: item.book.securityDeposit,
          availableCopies: item.book.availableCopies
        },
        rentalDays: item.rentalDays,
        rentalFee,
        securityDeposit: deposit,
        totalItemCost: rentalFee + deposit
      };
    });

  const grandTotal = subtotal + securityDepositTotal;

  return {
    items: populatedItems,
    subtotal,
    securityDepositTotal,
    grandTotal,
    itemCount: populatedItems.length
  };
};

// @desc    Get current user cart with backend-calculated totals
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.book');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const calculated = calculateCartTotals(cart.items);
    res.json({ success: true, cart: calculated });
  } catch (error) {
    next(error);
  }
};

// @desc    Add book to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { bookId, rentalDays = 14 } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Check if book already in cart
    const existingIndex = cart.items.findIndex(
      item => item.book.toString() === bookId.toString()
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].rentalDays = Number(rentalDays);
    } else {
      cart.items.push({
        book: bookId,
        rentalDays: Number(rentalDays)
      });
    }

    await cart.save();
    await cart.populate('items.book');

    const calculated = calculateCartTotals(cart.items);
    res.json({ success: true, cart: calculated, message: `"${book.title}" added to your cart!` });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item duration
// @route   PUT /api/cart/:bookId
// @access  Private
const updateCartItem = async (req, res, next) => {
  try {
    const { rentalDays } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.find(i => i.book.toString() === req.params.bookId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Book not found in cart' });
    }

    item.rentalDays = Number(rentalDays);
    await cart.save();
    await cart.populate('items.book');

    const calculated = calculateCartTotals(cart.items);
    res.json({ success: true, cart: calculated });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove book from cart
// @route   DELETE /api/cart/:bookId
// @access  Private
const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(i => i.book.toString() !== req.params.bookId);
    await cart.save();
    await cart.populate('items.book');

    const calculated = calculateCartTotals(cart.items);
    res.json({ success: true, cart: calculated, message: 'Item removed from cart' });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
