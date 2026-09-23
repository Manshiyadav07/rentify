const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

describe('Authentication & Authorization Tests', () => {
  const testUser = {
    name: 'Jest Test User',
    email: `jest_${Date.now()}@example.com`,
    password: 'password123'
  };

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /jest_/ } });
  });

  it('should register a new user successfully with JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.email).toBe(testUser.email.toLowerCase());
  });

  it('should reject registration with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should login an existing user with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('should reject login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject access to protected routes without a token', async () => {
    const res = await request(app)
      .get('/api/auth/profile');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
