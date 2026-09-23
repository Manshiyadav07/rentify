const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Book = require('../models/Book');
const Rental = require('../models/Rental');
const BookCopy = require('../models/BookCopy');
const jwt = require('jsonwebtoken');

describe('Rental Concurrency & Race Condition Prevention Tests', () => {
  let userA, userB, tokenA, tokenB;
  let singleCopyBook;

  beforeAll(async () => {
    // 1. Create two test users
    userA = await User.create({
      name: 'User A',
      email: `usera_${Date.now()}@example.com`,
      password: 'password123'
    });
    userB = await User.create({
      name: 'User B',
      email: `userb_${Date.now()}@example.com`,
      password: 'password123'
    });

    tokenA = jwt.sign({ id: userA._id, role: 'user' }, process.env.JWT_SECRET || 'rentify_super_secret_key_2024');
    tokenB = jwt.sign({ id: userB._id, role: 'user' }, process.env.JWT_SECRET || 'rentify_super_secret_key_2024');

    // 2. Create a book with STRICTLY 1 available copy
    singleCopyBook = await Book.create({
      title: 'High Concurrency Mastery Book',
      author: 'Distributed Systems Expert',
      category: 'Technology',
      description: 'Test book to verify double-booking prevention under concurrent race conditions.',
      rentalPrice: 50,
      securityDeposit: 100,
      rentalDurationDays: 14,
      totalCopies: 1,
      availableCopies: 1,
      status: 'AVAILABLE'
    });

    // Create 1 physical copy
    await BookCopy.create({
      copyId: `CPY-TEST-${Date.now().toString().slice(-4)}`,
      book: singleCopyBook._id,
      condition: 'NEW',
      status: 'AVAILABLE'
    });
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /user[ab]_/ } });
    if (singleCopyBook) {
      await Book.deleteOne({ _id: singleCopyBook._id });
      await BookCopy.deleteMany({ book: singleCopyBook._id });
      await Rental.deleteMany({ book: singleCopyBook._id });
    }
  });

  it('should prevent double-booking when two users attempt to rent the last copy simultaneously', async () => {
    // Both users fire checkout at the exact same millisecond
    const reqA = request(app)
      .post('/api/rentals/direct')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ bookId: singleCopyBook._id.toString(), rentalDays: 14 });

    const reqB = request(app)
      .post('/api/rentals/direct')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ bookId: singleCopyBook._id.toString(), rentalDays: 14 });

    const [resA, resB] = await Promise.all([reqA, reqB]);

    const statuses = [resA.statusCode, resB.statusCode];

    // Exactly one must succeed (201 Created)
    expect(statuses.filter(s => s === 201).length).toBe(1);

    // Exactly one must be rejected due to out of stock (409 Conflict)
    expect(statuses.filter(s => s === 409).length).toBe(1);

    // Verify inventory consistency in Database
    const freshBook = await Book.findById(singleCopyBook._id);
    expect(freshBook.availableCopies).toBe(0);

    // Verify only ONE rental record exists
    const rentalCount = await Rental.countDocuments({ book: singleCopyBook._id });
    expect(rentalCount).toBe(1);
  });
});
