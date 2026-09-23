const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Book = require('../models/Book');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const jwt = require('jsonwebtoken');

describe('Payment Gateway & Verification Tests', () => {
  let user, token, testBook;

  beforeAll(async () => {
    user = await User.create({
      name: 'Payment Tester',
      email: `paytest_${Date.now()}@example.com`,
      password: 'password123'
    });
    token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET || 'rentify_super_secret_key_2024');

    testBook = await Book.create({
      title: 'Payment Verification Guide',
      author: 'Fintech Specialist',
      category: 'Business',
      description: 'Test book for payment orders.',
      rentalPrice: 75,
      securityDeposit: 150,
      totalCopies: 5,
      availableCopies: 5
    });
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /paytest_/ } });
    if (testBook) await Book.deleteOne({ _id: testBook._id });
    await Payment.deleteMany({ user: user._id });
    await Invoice.deleteMany({ user: user._id });
  });

  it('should create a payment order with server-calculated total', async () => {
    const res = await request(app)
      .post('/api/payments/create-order')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ bookId: testBook._id, rentalDays: 14 }]
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.order.orderId).toBeDefined();
    // 75 rental + 150 deposit = 225
    expect(res.body.totalAmount).toBe(225);
  });

  it('should verify payment, allocate rental, and generate tax invoice', async () => {
    const orderRes = await request(app)
      .post('/api/payments/create-order')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ bookId: testBook._id, rentalDays: 14 }]
      });

    const orderId = orderRes.body.order.orderId;
    const paymentId = `pay_mock_${Date.now()}`;

    const verifyRes = await request(app)
      .post('/api/payments/verify')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orderId,
        paymentId,
        signature: 'simulated_valid_signature',
        isSandbox: true,
        items: [{ bookId: testBook._id, rentalDays: 14 }]
      });

    expect(verifyRes.statusCode).toBe(201);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.invoice.invoiceNumber).toBeDefined();
    expect(verifyRes.body.rentals.length).toBe(1);
  });

  it('should reject duplicate payment attempts with the same payment ID', async () => {
    const paymentId = `pay_duplicate_check_${Date.now()}`;
    const orderId = `order_dup_${Date.now()}`;

    // First verification
    await request(app)
      .post('/api/payments/verify')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orderId,
        paymentId,
        signature: 'valid_sig',
        isSandbox: true,
        items: [{ bookId: testBook._id, rentalDays: 14 }]
      });

    // Second verification attempt with same paymentId (Replay attack)
    const duplicateRes = await request(app)
      .post('/api/payments/verify')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orderId,
        paymentId,
        signature: 'valid_sig',
        isSandbox: true,
        items: [{ bookId: testBook._id, rentalDays: 14 }]
      });

    expect(duplicateRes.statusCode).toBe(500);
    expect(duplicateRes.body.message).toMatch(/duplicate payment/i);
  });
});
