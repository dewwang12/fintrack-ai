const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Transaction = require('../src/models/transaction.model');

// Load environment variables
require('dotenv').config();

const testUser = {
  name: 'Transaction Tester',
  email: 'trtester@example.com',
  password: 'Password123!',
};

const secondUser = {
  name: 'Second User',
  email: 'second@example.com',
  password: 'Password123!',
};

let userToken;
let secondUserToken;
let createdTransactionId;

beforeAll(async () => {
  const connStr = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/fintrack-ai-test';
  await mongoose.connect(connStr);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clear records before starting tests
  await User.deleteMany({});
  await Transaction.deleteMany({});

  // Register and login first user
  await request(app).post('/api/v1/auth/register').send(testUser);
  const loginRes = await request(app).post('/api/v1/auth/login').send({
    email: testUser.email,
    password: testUser.password,
  });
  userToken = loginRes.body.data.accessToken;

  // Register and login second user
  await request(app).post('/api/v1/auth/register').send(secondUser);
  const secondLoginRes = await request(app).post('/api/v1/auth/login').send({
    email: secondUser.email,
    password: secondUser.password,
  });
  secondUserToken = secondLoginRes.body.data.accessToken;
});

describe('Transaction API Endpoints', () => {
  describe('POST /api/v1/transactions', () => {
    it('should create a transaction successfully', async () => {
      const payload = {
        amount: '150.50',
        type: 'expense',
        category: 'Food',
        description: 'Dinner with client',
        date: new Date().toISOString(),
      };

      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.transaction).toHaveProperty('amount', 150.50);
      expect(res.body.data.transaction).toHaveProperty('category', 'Food');
      expect(res.body.data.transaction).toHaveProperty('type', 'expense');
      
      createdTransactionId = res.body.data.transaction._id;
    });

    it('should fail creation on negative amount validation (Zod validation)', async () => {
      const payload = {
        amount: '-5.00',
        type: 'expense',
        category: 'Food',
      };

      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.details[0]).toContain('Amount must be a positive number');
    });
  });

  describe('GET /api/v1/transactions', () => {
    beforeEach(async () => {
      // Create seed transactions
      await Transaction.create([
        { user: new mongoose.Types.ObjectId(), amount: 100, type: 'income', category: 'Salary', date: new Date() },
        { user: (await User.findOne({ email: testUser.email }))._id, amount: 50, type: 'expense', category: 'Food', date: new Date() },
        { user: (await User.findOne({ email: testUser.email }))._id, amount: 200, type: 'income', category: 'Investment', date: new Date() },
      ]);
    });

    it('should retrieve only the logged-in user transactions with pagination info', async () => {
      const res = await request(app)
        .get('/api/v1/transactions')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.transactions).toHaveLength(2); // Should only see their own 2 transactions
      expect(res.body.data.pagination).toHaveProperty('totalRecords', 2);
    });

    it('should filter transactions by type', async () => {
      const res = await request(app)
        .get('/api/v1/transactions?type=expense')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.transactions).toHaveLength(1);
      expect(res.body.data.transactions[0]).toHaveProperty('category', 'Food');
    });
  });

  describe('PUT /api/v1/transactions/:id', () => {
    let transactionId;

    beforeEach(async () => {
      const tr = await Transaction.create({
        user: (await User.findOne({ email: testUser.email }))._id,
        amount: 25.0,
        type: 'expense',
        category: 'Transport',
      });
      transactionId = tr._id;
    });

    it('should update transaction details successfully', async () => {
      const res = await request(app)
        .put(`/api/v1/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ amount: '35.00', category: 'Taxi' });

      expect(res.status).toBe(200);
      expect(res.body.data.transaction).toHaveProperty('amount', 35.0);
      expect(res.body.data.transaction).toHaveProperty('category', 'Taxi');
    });

    it('should forbid user from updating another user\'s transactions', async () => {
      const res = await request(app)
        .put(`/api/v1/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({ amount: '500.00' });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('permission');
    });
  });

  describe('DELETE /api/v1/transactions/:id', () => {
    let transactionId;

    beforeEach(async () => {
      const tr = await Transaction.create({
        user: (await User.findOne({ email: testUser.email }))._id,
        amount: 80.00,
        type: 'expense',
        category: 'Bills',
      });
      transactionId = tr._id;
    });

    it('should delete user transaction successfully', async () => {
      const res = await request(app)
        .delete(`/api/v1/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted successfully');

      // Verify db is empty
      const count = await Transaction.countDocuments({ _id: transactionId });
      expect(count).toBe(0);
    });

    it('should forbid user from deleting another user\'s transactions', async () => {
      const res = await request(app)
        .delete(`/api/v1/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${secondUserToken}`);

      expect(res.status).toBe(403);
    });
  });
});
