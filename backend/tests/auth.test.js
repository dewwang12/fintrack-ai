const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user.model');

// Load env variables
require('dotenv').config();

const testUser = {
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'Password123!',
};

beforeAll(async () => {
  // Use a dedicated local test database to avoid messing with development data
  const connStr = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/fintrack-ai-test';
  await mongoose.connect(connStr);
});

afterAll(async () => {
  // Close connection and clean up
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clear the users collection before each test to run tests in isolation
  await User.deleteMany({});
});

describe('Authentication API Endpoints', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully and return user details (excluding password)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('name', testUser.name);
      expect(res.body.data.user).toHaveProperty('email', testUser.email);
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should return 400 when registering with a duplicate email', async () => {
      // Register first user
      await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      // Register second user with same email
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('email already exists');
    });

    it('should return 400 when password strength validation fails (Zod validation)', async () => {
      const weakUser = {
        name: 'Weak User',
        email: 'weak@example.com',
        password: '123', // Too short, no caps, no special char
      };

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(weakUser);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.details[0]).toContain('password');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Pre-register user for login tests
      await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);
    });

    it('should login successfully, return access token, and set refresh cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      
      // Verify HTTP-Only Refresh Token Cookie exists in headers
      const cookieHeader = res.headers['set-cookie'][0];
      expect(cookieHeader).toContain('refreshToken');
      expect(cookieHeader).toContain('HttpOnly');
    });

    it('should return 401 on incorrect password credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Incorrect email or password');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let accessToken;

    beforeEach(async () => {
      // Pre-register and login user to acquire access token
      await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      accessToken = loginRes.body.data.accessToken;
    });

    it('should retrieve user details when authorized with Bearer token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('email', testUser.email);
    });

    it('should return 401 when request lacks authorization header', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
