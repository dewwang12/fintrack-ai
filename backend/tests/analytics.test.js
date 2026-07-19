const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Transaction = require('../src/models/transaction.model');

// Load environment variables
require('dotenv').config();

const testUser = {
  name: 'Analytics Tester',
  email: 'antester@example.com',
  password: 'Password123!',
};

let userToken;
let userId;

beforeAll(async () => {
  const connStr = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/fintrack-ai-test';
  await mongoose.connect(connStr);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Transaction.deleteMany({});

  // Register and login user
  await request(app).post('/api/v1/auth/register').send(testUser);
  const loginRes = await request(app).post('/api/v1/auth/login').send({
    email: testUser.email,
    password: testUser.password,
  });
  userToken = loginRes.body.data.accessToken;
  userId = loginRes.body.data.user._id;
});

describe('Analytics API Endpoints', () => {
  describe('GET /api/v1/analytics/summary', () => {
    beforeEach(async () => {
      // Seed transactions
      // 1. Income: $3000 (Salary)
      // 2. Expense: $150 (Food)
      // 3. Expense: $350 (Shopping)
      await Transaction.create([
        { user: userId, amount: 3000.00, type: 'income', category: 'Salary & Income', date: new Date() },
        { user: userId, amount: 150.00, type: 'expense', category: 'Food & Dining', date: new Date() },
        { user: userId, amount: 350.00, type: 'expense', category: 'Shopping', date: new Date() },
      ]);
    });

    it('should retrieve dynamic dashboard aggregates and breakdown arrays successfully', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/summary')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify Summary totals
      const { summary, categoryBreakdown, monthlyTrends } = res.body.data;
      expect(summary).toHaveProperty('totalIncome', 3000.00);
      expect(summary).toHaveProperty('totalExpense', 500.00);
      expect(summary).toHaveProperty('netBalance', 2500.00);

      // Verify Category Breakdown details
      expect(categoryBreakdown).toHaveLength(2);
      expect(categoryBreakdown[0]).toHaveProperty('category', 'Shopping'); // $350 > $150
      expect(categoryBreakdown[0]).toHaveProperty('value', 350.00);
      expect(categoryBreakdown[0]).toHaveProperty('percentage', 70); // 350 / 500 = 70%

      expect(categoryBreakdown[1]).toHaveProperty('category', 'Food & Dining');
      expect(categoryBreakdown[1]).toHaveProperty('value', 150.00);
      expect(categoryBreakdown[1]).toHaveProperty('percentage', 30); // 150 / 500 = 30%

      // Verify Monthly Trends contains 6 entries
      expect(monthlyTrends).toHaveLength(6);
    });
  });
});
