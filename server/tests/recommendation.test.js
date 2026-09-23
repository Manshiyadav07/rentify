const request = require('supertest');
const app = require('../server');
const Book = require('../models/Book');

describe('Recommendation System Tests', () => {
  let sampleBook;

  beforeAll(async () => {
    sampleBook = await Book.findOne({ category: 'Technology' });
  });

  it('should return personalized or trending book recommendations', async () => {
    const res = await request(app)
      .get('/api/recommendations');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.recommendations)).toBe(true);
    expect(res.body.recommendations.length).toBeGreaterThan(0);
  });

  it('should return related books for a valid book id', async () => {
    if (!sampleBook) return;

    const res = await request(app)
      .get(`/api/recommendations/related/${sampleBook._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.related)).toBe(true);
    // Should not include the same book
    res.body.related.forEach(b => {
      expect(b._id.toString()).not.toBe(sampleBook._id.toString());
    });
  });
});
