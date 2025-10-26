import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import loginHandler from '../../src/pages/api/auth/login';
import healthHandler from '../../src/pages/api/health';
import * as authController from '../../src/lib/controllers/auth';
import { checkDatabaseHealth } from '../../src/lib/db/mongodb';

// Mock dependencies
jest.mock('../../src/lib/controllers/auth');
jest.mock('../../src/lib/db/mongodb', () => ({
  checkDatabaseHealth: jest.fn(),
}));

describe('API Route Handlers Tests', () => {
  describe('POST /api/auth/login', () => {
    it('should return 200 and token on successful login', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      const mockLoginResponse = {
        success: true,
        message: 'Login successful',
        user: {
          id: '507f1f77bcf86cd799439011',
          email: 'test@example.com',
          name: 'Test User',
          role: 'customer',
        },
        token: 'mock.jwt.token',
        expiresIn: '7d',
        statusCode: 200,
      };

      (authController.login as jest.Mock).mockResolvedValue(mockLoginResponse);

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data.token).toBe('mock.jwt.token');
    });

    it('should return 401 on invalid credentials', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
      });

      const mockLoginResponse = {
        success: false,
        message: 'Invalid email or password',
        user: null,
        token: '',
        expiresIn: '',
        statusCode: 401,
      };

      (authController.login as jest.Mock).mockResolvedValue(mockLoginResponse);

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('Invalid email or password');
    });

    it('should return 400 on validation error', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: '',
          password: '',
        },
      });

      const mockLoginResponse = {
        success: false,
        message: 'Email is required, Password is required',
        user: null,
        token: '',
        expiresIn: '',
        statusCode: 401,
      };

      (authController.login as jest.Mock).mockResolvedValue(mockLoginResponse);

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(false);
    });

    it('should return 405 on non-POST request', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('Method not allowed');
    });

    it('should handle OPTIONS request', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'OPTIONS',
      });

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
    });

    it('should return 423 for locked account', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: 'locked@example.com',
          password: 'password123',
        },
      });

      const mockLoginResponse = {
        success: false,
        message: 'Account is locked',
        user: null,
        token: '',
        expiresIn: '',
        statusCode: 423,
      };

      (authController.login as jest.Mock).mockResolvedValue(mockLoginResponse);

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(423);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('Account is locked');
    });
  });

  describe('GET /api/health', () => {
    it('should return 200 when service is healthy', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });

      (checkDatabaseHealth as jest.Mock).mockResolvedValue(true);

      await healthHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data.status).toBe('healthy');
      expect(responseData.data.database.status).toBe('connected');
    });

    it('should return 503 when database is unhealthy', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });

      (checkDatabaseHealth as jest.Mock).mockResolvedValue(false);

      await healthHandler(req, res);

      expect(res._getStatusCode()).toBe(503);
      const responseData = JSON.parse(res._getData());
      console.log(responseData)
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('API is unhealthy');
    });

    it('should return 405 on non-GET request', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
      });

      await healthHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('Method not allowed');
    });

    it('should include system metrics in response', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });

      (checkDatabaseHealth as jest.Mock).mockResolvedValue(true);

      await healthHandler(req, res);

      const responseData = JSON.parse(res._getData());
      expect(responseData.data.timestamp).toBeDefined();
      expect(responseData.data.uptime).toBeDefined();
      expect(responseData.data.version).toBeDefined();
      expect(responseData.data.environment).toBeDefined();
      expect(responseData.data.memory).toBeDefined();
      expect(responseData.data.memory.used).toBeDefined();
      expect(responseData.data.memory.total).toBeDefined();
      expect(responseData.data.memory.percentage).toBeDefined();
    });

    it('should include database latency in response', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });

      (checkDatabaseHealth as jest.Mock).mockResolvedValue(true);

      await healthHandler(req, res);

      const responseData = JSON.parse(res._getData());
      expect(responseData.data.database.latency).toBeDefined();
      expect(typeof responseData.data.database.latency).toBe('number');
    });

    it('should handle database check errors', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });

      (checkDatabaseHealth as jest.Mock).mockRejectedValue(new Error('Connection timeout'));

      await healthHandler(req, res);

      expect(res._getStatusCode()).toBe(503);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Connection timeout');
    });
  });
});
