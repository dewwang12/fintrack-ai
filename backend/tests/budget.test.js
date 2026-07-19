const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Transaction = require('../src/models/transaction.model');
const Budget = require('../src/models/budget.model');

// Load environment variables
require('dotenv').config();

const testUser = {
  name: 'Budget Tester',
  email: 'bgtester@example.com',
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
  await Budget.deleteMany({});

  // Register and login user
  await request(app).post('/api/v1/auth/register').send(testUser);
  const loginRes = await request(app).post('/api/v1/auth/login').send({
    email: testUser.email,
    password: testUser.password,
  });
  userToken = loginRes.body.data.accessToken;
  userId = loginRes.body.data.user._id;
});

describe('Budget API Endpoints', () => {
  describe('POST /api/v1/budgets', () => {
    it('should create a budget rule successfully', async () => {
      const res = await request(app)
        .post('/api/v1/budgets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          category: 'Food & Dining',
          limitAmount: 500,
          period: 'monthly',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.budget).toHaveProperty('category', 'Food & Dining');
      expect(res.body.data.budget).toHaveProperty('limitAmount', 500);
    });

    it('should return 400 when attempting to define a duplicate budget rule for the same category', async () => {
      // Define first budget
      await request(app)
        .post('/api/v1/budgets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ category: 'Food', limitAmount: 300 });

      // Define second budget for same category
      const res = await request(app)
        .post('/api/v1/budgets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ category: 'Food', limitAmount: 500 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });
  });

  describe('GET /api/v1/budgets (spentAmount aggregation check)', () => {
    beforeEach(async () => {
      // Create Food budget limit rule = $400
      await Budget.create({
        user: userId,
        category: 'Food',
        limitAmount: 400,
        period: 'monthly',
      });

      // Insert transactions:
      // 1. Food Expense: $120.50 (Should sum)
      // 2. Food Expense: $35.00 (Should sum)
      // 3. Transport Expense: $45.00 (Different category, ignore)
      // 4. Food Income: $200.00 (Different type, ignore)
      await Transaction.create([
        { user: userId, amount: 120.50, type: 'expense', category: 'Food', date: new Date() },
        { user: userId, amount: 35.00, type: 'expense', category: 'Food', date: new Date() },
        { user: userId, amount: 45.00, type: 'expense', category: 'Transport', date: new Date() },
        { user: userId, amount: 200.00, type: 'income', category: 'Food', date: new Date() },
      ]);
    });

    it('should return the budget list with spentAmount computed dynamically', async () => {
      const res = await request(app)
        .get('/api/v1/budgets')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.budgets).toHaveLength(1);
      
      const foodBudget = res.body.data.budgets[0];
      expect(foodBudget).toHaveProperty('category', 'Food');
      expect(foodBudget).toHaveProperty('limitAmount', 400);
      expect(foodBudget).toHaveProperty('spentAmount', 155.50); // 120.50 + 35.00
    });
  });

  describe('PUT /api/v1/budgets/:id', () => {
    it('should update budget limit successfully', async () => {
      const bg = await Budget.create({
        user: userId,
        category: 'Shopping',
        limitAmount: 100,
      });

      const res = await request(app)
        .put(`/api/v1/budgets/${bg._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ limitAmount: 250 });

      expect(res.status).toBe(200);
      expect(res.body.data.budget).toHaveProperty('limitAmount', 250);
    });
  });

  describe('DELETE /api/v1/budgets/:id', () => {
    it('should delete budget successfully', async () => {
      const bg = await Budget.create({
        user: userId,
        category: 'Bills',
        limitAmount: 300,
      });

      const res = await request(app)
        .delete(`/api/v1/budgets/${bg._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted successfully');

      const count = await Budget.countDocuments({ _id: bg._id });
      expect(count).toBe(0);
    });
  });
});
