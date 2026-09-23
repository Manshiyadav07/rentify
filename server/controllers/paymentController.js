const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const Notification = require('../models/Notification');
const paymentService = require('../services/paymentService');
const rentalService = require('../services/rentalService');

// @desc    Create Razorpay / Sandbox Payment Order
// @route   POST /api/payments/create-order
// @access  Private
const createPaymentOrder = async (req, res, next) => {
  try {
    const { items } = req.body; // Array of { bookId, rentalDays }

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'No items provided for checkout.' });
    }

    // Recalculate exact total from Database to prevent client price tampering
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const book = await Book.findById(item.bookId);
      if (!book) {
        return res.status(404).json({ success: false, message: `Book with ID ${item.bookId} not found` });
      }

      if (book.availableCopies < 1) {
        return res.status(409).json({
          success: false,
          code: 'OUT_OF_STOCK',
          message: `"${book.title}" is out of stock. Please remove it from checkout or join the waiting list.`
        });
      }

      const rentalPrice = book.rentalPrice;
      const securityDeposit = book.securityDeposit || 0;
      const itemTotal = rentalPrice + securityDeposit;
      totalAmount += itemTotal;

      validatedItems.push({
        bookId: book._id,
        title: book.title,
        author: book.author,
        rentalDays: Number(item.rentalDays) || 14,
        rentalPrice,
        securityDeposit,
        total: itemTotal
      });
    }

    const receipt = `rcpt_${Date.now()}_${req.user._id.toString().slice(-4)}`;

    const orderData = await paymentService.createOrder({
      amount: totalAmount,
      receipt,
      userId: req.user._id,
      notes: {
        userId: req.user._id.toString(),
        itemCount: validatedItems.length
      }
    });

    res.json({
      success: true,
      order: orderData,
      items: validatedItems,
      totalAmount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Payment, complete rentals, and generate invoice
// @route   POST /api/payments/verify
// @access  Private
const verifyPaymentAndCheckout = async (req, res, next) => {
  try {
    const {
      orderId,
      paymentId,
      signature,
      items,
      isSandbox = false
    } = req.body;

    if (!orderId || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Missing order details or items.' });
    }

    // 1. Verify Payment & Idempotency (Never trust frontend payment confirmation!)
    const payment = await paymentService.verifyPayment({
      orderId,
      paymentId,
      signature,
      userId: req.user._id,
      isSandbox
    });

    // 2. Perform Atomic Rental Allocation for each item
    const createdRentals = [];
    let subtotal = 0;
    let securityDepositTotal = 0;
    const invoiceItems = [];

    for (const item of items) {
      const book = await Book.findById(item.bookId);
      if (!book) continue;

      const rental = await rentalService.rentBookAtomic({
        userId: req.user._id,
        bookId: book._id,
        rentalDays: item.rentalDays || 14,
        orderId,
        paymentId: payment.paymentId
      });

      createdRentals.push(rental);
      subtotal += book.rentalPrice;
      securityDepositTotal += (book.securityDeposit || 0);

      invoiceItems.push({
        bookId: book._id,
        title: book.title,
        author: book.author,
        rentalDays: item.rentalDays || 14,
        rentalPrice: book.rentalPrice,
        securityDeposit: book.securityDeposit || 0,
        total: book.rentalPrice + (book.securityDeposit || 0)
      });
    }

    // 3. Generate Official Invoice
    const invoice = await paymentService.generateInvoice({
      orderId,
      paymentId: payment.paymentId,
      user: req.user,
      items: invoiceItems,
      subtotal,
      securityDepositTotal,
      grandTotal: subtotal + securityDepositTotal
    });

    // 4. Clear user cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // 5. In-App Notification
    await Notification.create({
      user: req.user._id,
      type: 'PAYMENT_SUCCESS',
      title: 'Payment Successful',
      message: `Your payment of ₹${subtotal + securityDepositTotal} was successful. Invoice #${invoice.invoiceNumber} has been generated.`,
      link: '/rental-history',
      metadata: { orderId, invoiceNumber: invoice.invoiceNumber }
    });

    res.status(201).json({
      success: true,
      message: 'Payment verified and rental order completed!',
      rentals: createdRentals,
      invoice,
      payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user invoice by orderId or invoiceNumber
// @route   GET /api/payments/invoice/:identifier
// @access  Private
const getInvoice = async (req, res, next) => {
  try {
    const { identifier } = req.params;

    const invoice = await Invoice.findOne({
      $or: [
        { invoiceNumber: identifier },
        { orderId: identifier }
      ]
    }).populate('items.bookId');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Ensure access control: only user or admin
    if (invoice.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this invoice' });
    }

    res.json({ success: true, invoice });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPaymentAndCheckout,
  getInvoice
};
