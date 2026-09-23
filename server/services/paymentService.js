const crypto = require('crypto');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

class PaymentService {
  constructor() {
    this.refreshClient();
  }

  refreshClient() {
    this.keyId = process.env.RAZORPAY_KEY_ID;
    this.keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (this.keyId && this.keySecret) {
      try {
        this.razorpay = new Razorpay({
          key_id: this.keyId,
          key_secret: this.keySecret
        });
        console.log(`[Payment] Razorpay Gateway initialized with key: ${this.keyId.substring(0, 10)}...`);
      } catch (err) {
        console.warn('[Payment] Failed to initialize Razorpay SDK. Operating in sandbox mode:', err.message);
      }
    } else {
      console.log('[Payment] RAZORPAY_KEY_ID or SECRET not detected. Built-in Sandbox Mode active.');
    }
  }

  getClient() {
    // Recheck if environment variables changed
    if (this.keyId !== process.env.RAZORPAY_KEY_ID || this.keySecret !== process.env.RAZORPAY_KEY_SECRET) {
      this.refreshClient();
    }
    return this.razorpay;
  }

  // Create payment order
  async createOrder({ amount, currency = 'INR', receipt, notes = {}, userId }) {
    const amountInPaise = Math.round(amount * 100);
    const client = this.getClient();

    // If Razorpay credentials exist, call gateway
    if (client && this.keyId) {
      try {
        const order = await client.orders.create({
          amount: amountInPaise,
          currency,
          receipt,
          notes
        });

        await Payment.create({
          orderId: order.id,
          user: userId,
          amount,
          currency,
          status: 'CREATED',
          receipt: order.receipt,
          notes
        });

        return {
          orderId: order.id,
          amount,
          currency,
          keyId: this.keyId,
          isSandbox: false
        };
      } catch (error) {
        console.error('[Payment] Gateway error, falling back to sandbox order:', error.message);
      }
    }

    // Sandbox / Test fallback order
    const simulatedOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    await Payment.create({
      orderId: simulatedOrderId,
      user: userId,
      amount,
      currency,
      status: 'CREATED',
      receipt: receipt || `rcpt_${Date.now()}`,
      notes
    });

    return {
      orderId: simulatedOrderId,
      amount,
      currency,
      keyId: 'rzp_test_sandbox_mode',
      isSandbox: true
    };
  }

  // Verify payment signature & idempotency
  async verifyPayment({ orderId, paymentId, signature, userId, isSandbox = false }) {
    // 1. Idempotency check: prevent duplicate payment processing
    const existingCaptured = await Payment.findOne({
      paymentId,
      status: 'CAPTURED'
    });

    if (existingCaptured) {
      throw new Error('Duplicate payment detected: This payment has already been verified and processed.');
    }

    // 2. Signature verification
    let isValid = false;

    const secret = process.env.RAZORPAY_KEY_SECRET || this.keySecret;
    if (secret && !isSandbox && !orderId.startsWith('order_sim_')) {
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(`${orderId}|${paymentId}`);
      const generatedSignature = hmac.digest('hex');
      isValid = generatedSignature === signature;
    } else {
      // In Sandbox mode, accept valid simulated signature or non-empty payment ID
      isValid = Boolean(paymentId && orderId);
    }

    if (!isValid) {
      // Record failed payment
      await Payment.findOneAndUpdate(
        { orderId },
        { status: 'FAILED', errorDescription: 'Invalid cryptographic signature' }
      );
      throw new Error('Payment verification failed: Invalid transaction signature');
    }

    // 3. Mark payment as captured
    const payment = await Payment.findOneAndUpdate(
      { orderId },
      {
        paymentId: paymentId || `pay_sim_${Date.now()}`,
        status: 'CAPTURED',
        signature: signature || 'simulated_signature'
      },
      { new: true, upsert: true }
    );

    return payment;
  }

  // Generate official tax invoice
  async generateInvoice({
    orderId,
    paymentId,
    user,
    items,
    subtotal,
    securityDepositTotal,
    discount = 0,
    tax = 0,
    grandTotal
  }) {
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      orderId,
      paymentId,
      user: user._id,
      customerDetails: {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || {}
      },
      items,
      subtotal,
      securityDepositTotal,
      discount,
      tax,
      grandTotal,
      paymentStatus: 'PAID',
      issuedAt: new Date()
    });

    return invoice;
  }
}

module.exports = new PaymentService();
