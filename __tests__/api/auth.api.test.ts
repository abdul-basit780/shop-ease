import { NextApiRequest, NextApiResponse } from 'next';
import {
  login,
  register,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  sendVerification,
  me,
} from '../../src/lib/controllers/auth';
import { User } from '../../src/lib/models/User';

import { Address } from '../../src/lib/models/Address';
import { emailService } from '../../src/lib/services/EmailService';
import * as authUtils from '../../src/lib/utils/auth';
import { UserRole, Gender } from '../../src/lib/models/enums';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('../../src/lib/models/User', () => ({
  User: {
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    discriminator: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    }),
    discriminators: {},
  },
}));
jest.mock('../../src/lib/models/Customer', () => ({
  Customer: {
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOne: jest.fn(),
  },
}));
jest.mock('../../src/lib/models/Address', () => ({
  Address: {
    create: jest.fn(),
  },
}));
jest.mock('../../src/lib/services/EmailService', () => ({
  emailService: {
    sendEmailVerification: jest.fn(),
    sendPasswordReset: jest.fn(),
  },
}));
jest.mock('../../src/lib/utils/auth', () => ({
  ...jest.requireActual('../../src/lib/utils/auth'),
  comparePassword: jest.fn(),
  generateToken: jest.fn(),
  hashPassword: jest.fn(),
  handleAccountLocking: jest.fn(),
  handleFailedLogin: jest.fn(),
  handleSuccessfullLogin: jest.fn(),
  checkExistingUser: jest.fn(),
  sendWelcomeEmail: jest.fn(),
  generateAuthToken: jest.fn(),
  verifyAuthToken: jest.fn(),
}));

import { Customer } from '../../src/lib/models/Customer';

describe('Auth Controller API Tests', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      body: {},
      headers: {},
      method: 'POST',
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: UserRole.CUSTOMER,
        isActive: true,
      };

      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      (authUtils.comparePassword as jest.Mock).mockResolvedValue(true);
      (authUtils.generateToken as jest.Mock).mockReturnValue('mock.jwt.token');
      (authUtils.handleAccountLocking as jest.Mock).mockResolvedValue(undefined);
      (authUtils.handleSuccessfullLogin as jest.Mock).mockResolvedValue(undefined);

      const result = await login(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Login successful');
      expect(result.token).toBe('mock.jwt.token');
      expect(result.statusCode).toBe(200);
    });

    it('should return error for invalid credentials', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: UserRole.CUSTOMER,
        isActive: true,
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      (authUtils.comparePassword as jest.Mock).mockResolvedValue(false);
      (authUtils.handleAccountLocking as jest.Mock).mockResolvedValue(undefined);
      (authUtils.handleFailedLogin as jest.Mock).mockResolvedValue(undefined);

      const result = await login(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid email or password');
      expect(result.statusCode).toBe(401);
    });

    it('should return error for missing email', async () => {
      mockReq.body = {
        email: '',
        password: 'password123',
      };

      const result = await login(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Email is required');
      expect(result.statusCode).toBe(401);
    });

    it('should return error for missing password', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: '',
      };

      const result = await login(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Password is required');
      expect(result.statusCode).toBe(401);
    });

    it('should return error for non-existent user', async () => {
      mockReq.body = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const result = await login(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid email or password');
      expect(result.statusCode).toBe(401);
    });

    it('should return error for inactive customer account', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: UserRole.CUSTOMER,
        isActive: false,
      };

      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await login(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Customer account is not active');
      expect(result.statusCode).toBe(401);
    });

    it('should return error for locked account', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: UserRole.ADMIN,
        loginAttempts: 5,
      };

      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      (authUtils.handleAccountLocking as jest.Mock).mockRejectedValue(
        new Error('Account is locked')
      );

      const result = await login(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Account is locked');
      expect(result.statusCode).toBe(423);
    });
  });

  describe('register', () => {
    it('should register a new customer successfully', async () => {
      const mockCustomer = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        role: UserRole.CUSTOMER,
        phone: '+1234567890',
        dob: new Date(1990, 1, 1),
        gender: Gender.MALE,
        occupation: 'Engineer',
        isActive: true,
        isVerified: false,
      };

      mockReq.body = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        phone: '+1234567890',
        dob: new Date(1990, 1, 1),
        gender: Gender.MALE,
        occupation: 'Engineer',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: 'A1B 2C3',
        },
      };

      (authUtils.checkExistingUser as jest.Mock).mockResolvedValue(undefined);
      (authUtils.hashPassword as jest.Mock).mockResolvedValue('hashedPassword123');
      (Customer.create as jest.Mock).mockResolvedValue(mockCustomer);
      (Address.create as jest.Mock).mockResolvedValue({});
      (authUtils.sendWelcomeEmail as jest.Mock).mockResolvedValue(undefined);
      (authUtils.generateAuthToken as jest.Mock).mockReturnValue('verification.token');
      (emailService.sendEmailVerification as jest.Mock).mockResolvedValue(true);
      (authUtils.generateToken as jest.Mock).mockReturnValue('mock.jwt.token');

      const result = await register(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Registration successful');
      expect(result.token).toBe('mock.jwt.token');
      expect(result.statusCode).toBe(201);
      expect(Customer.create).toHaveBeenCalled();
      expect(Address.create).toHaveBeenCalled();
    });

    it('should return error for existing email', async () => {
      mockReq.body = {
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'Password123!',
        phone: '+1234567890',
        dob: '1990-01-01',
        gender: Gender.MALE,
        occupation: 'Engineer',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: 'A1B 2C3',
        },
      };

      (authUtils.checkExistingUser as jest.Mock).mockRejectedValue(
        new Error('Email already registered')
      );

      const result = await register(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Email already registered');
      expect(result.statusCode).toBe(409);
    });

    it('should return validation error for missing required fields', async () => {
      mockReq.body = {
        name: '',
        email: 'invalid-email',
        password: 'short',
      };

      const result = await register(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        password: 'hashedOldPassword',
      };

      mockReq.body = {
        currentPassword: 'oldPassword',
        newPassword: 'newPassword123',
      };
      (mockReq as any).user = { userId: '507f1f77bcf86cd799439011' };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (authUtils.comparePassword as jest.Mock).mockResolvedValue(true);
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUser);

      const result = await changePassword(mockReq as any, mockRes as NextApiResponse);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Password has been changed successfully.');
      expect(result.statusCode).toBe(200);
    });

    it('should return error for incorrect current password', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        password: 'hashedOldPassword',
      };

      mockReq.body = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword123',
      };
      (mockReq as any).user = { userId: '507f1f77bcf86cd799439011' };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (authUtils.comparePassword as jest.Mock).mockResolvedValue(false);

      const result = await changePassword(mockReq as any, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid current password');
      expect(result.statusCode).toBe(401);
    });

    it('should return error for missing current password', async () => {
      mockReq.body = {
        currentPassword: '',
        newPassword: 'newPassword123',
      };
      (mockReq as any).user = { userId: '507f1f77bcf86cd799439011' };

      const result = await changePassword(mockReq as any, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Current password is required');
      expect(result.statusCode).toBe(400);
    });

    it('should return error for short new password', async () => {
      mockReq.body = {
        currentPassword: 'oldPassword',
        newPassword: 'short',
      };
      (mockReq as any).user = { userId: '507f1f77bcf86cd799439011' };

      const result = await changePassword(mockReq as any, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Password must be at least 6 characters long');
      expect(result.statusCode).toBe(400);
    });

    it('should return error for non-existent user', async () => {
      mockReq.body = {
        currentPassword: 'oldPassword',
        newPassword: 'newPassword123',
      };
      (mockReq as any).user = { userId: '507f1f77bcf86cd799439011' };

      (User.findById as jest.Mock).mockResolvedValue(null);

      const result = await changePassword(mockReq as any, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('User not found');
      expect(result.statusCode).toBe(404);
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email successfully', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.CUSTOMER,
      };

      mockReq.body = {
        email: 'test@example.com',
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Customer.findById as jest.Mock).mockResolvedValue({ isActive: true });
      (authUtils.generateAuthToken as jest.Mock).mockReturnValue('reset.token');
      (emailService.sendPasswordReset as jest.Mock).mockResolvedValue(true);

      const result = await forgotPassword(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(true);
      expect(result.message).toContain('If an account with that email exists');
      expect(result.statusCode).toBe(200);
    });

    it('should return error for missing email', async () => {
      mockReq.body = {
        email: '',
      };

      const result = await forgotPassword(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Email is required');
      expect(result.statusCode).toBe(400);
    });

    it('should return error for invalid email format', async () => {
      mockReq.body = {
        email: 'invalid-email',
      };

      const result = await forgotPassword(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Please provide a valid email');
      expect(result.statusCode).toBe(400);
    });

    it('should return error for non-existent user', async () => {
      mockReq.body = {
        email: 'nonexistent@example.com',
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);

      const result = await forgotPassword(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('User not found');
      expect(result.statusCode).toBe(404);
    });

    it('should return error for inactive customer account', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
      };

      mockReq.body = {
        email: 'test@example.com',
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Customer.findById as jest.Mock).mockResolvedValue({ isActive: false });

      const result = await forgotPassword(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Customer account is not active');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully with valid token', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
        isActive: true,
      };

      mockReq.body = {
        token: 'valid.reset.token',
        newPassword: 'newPassword123',
      };

      (authUtils.verifyAuthToken as jest.Mock).mockReturnValue({
        userId: '507f1f77bcf86cd799439011',
        type: 'password-reset',
      });
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUser);

      const result = await resetPassword(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Password has been reset successfully');
      expect(result.statusCode).toBe(200);
    });

    it('should return error for invalid token', async () => {
      mockReq.body = {
        token: 'invalid.token',
        newPassword: 'newPassword123',
      };

      (authUtils.verifyAuthToken as jest.Mock).mockReturnValue(null);

      const result = await resetPassword(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid or expired reset token');
      expect(result.statusCode).toBe(400);
    });

    it('should return error for missing token', async () => {
      mockReq.body = {
        token: '',
        newPassword: 'newPassword123',
      };

      const result = await resetPassword(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Reset token is required');
      expect(result.statusCode).toBe(400);
    });

    it('should return error for short password', async () => {
      mockReq.body = {
        token: 'valid.token',
        newPassword: 'short',
      };

      const result = await resetPassword(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Password must be at least 6 characters long');
      expect(result.statusCode).toBe(400);
    });

    it('should return error for inactive account', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
        isActive: false,
      };

      mockReq.body = {
        token: 'valid.token',
        newPassword: 'newPassword123',
      };

      (authUtils.verifyAuthToken as jest.Mock).mockReturnValue({
        userId: '507f1f77bcf86cd799439011',
        type: 'password-reset',
      });
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await resetPassword(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Account is not active');
      expect(result.statusCode).toBe(403);
    });

    it('should prevent admin password reset', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        isActive: true,
      };

      mockReq.body = {
        token: 'valid.token',
        newPassword: 'newPassword123',
      };

      (authUtils.verifyAuthToken as jest.Mock).mockReturnValue({
        userId: '507f1f77bcf86cd799439011',
        type: 'password-reset',
      });
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await resetPassword(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Cannot reset password for admin account');
      expect(result.statusCode).toBe(400);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully with valid token', async () => {
      const mockCustomer = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        isActive: true,
        isVerified: false,
      };

      mockReq.body = {
        token: 'valid.verification.token',
      };

      (authUtils.verifyAuthToken as jest.Mock).mockReturnValue({
        userId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        type: 'email-verification',
      });
      (Customer.findById as jest.Mock).mockResolvedValue(mockCustomer);
      (Customer.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

      const result = await verifyEmail(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Email verified successfully');
      expect(result.statusCode).toBe(200);
    });

    it('should return error for invalid token', async () => {
      mockReq.body = {
        token: 'invalid.token',
      };

      (authUtils.verifyAuthToken as jest.Mock).mockReturnValue(null);

      const result = await verifyEmail(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid or expired verification token');
      expect(result.statusCode).toBe(400);
    });

    it('should return error for missing token', async () => {
      mockReq.body = {
        token: '',
      };

      const result = await verifyEmail(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Verification token is required');
      expect(result.statusCode).toBe(400);
    });

    it('should handle already verified email', async () => {
      const mockCustomer = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        isActive: true,
        isVerified: true,
      };

      mockReq.body = {
        token: 'valid.token',
      };

      (authUtils.verifyAuthToken as jest.Mock).mockReturnValue({
        userId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        type: 'email-verification',
      });
      (Customer.findById as jest.Mock).mockResolvedValue(mockCustomer);

      const result = await verifyEmail(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Email is already verified');
      expect(result.statusCode).toBe(200);
    });

    it('should return error for inactive account', async () => {
      const mockCustomer = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        isActive: false,
        isVerified: false,
      };

      mockReq.body = {
        token: 'valid.token',
      };

      (authUtils.verifyAuthToken as jest.Mock).mockReturnValue({
        userId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        type: 'email-verification',
      });
      (Customer.findById as jest.Mock).mockResolvedValue(mockCustomer);

      const result = await verifyEmail(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Account is not active');
      expect(result.statusCode).toBe(403);
    });
  });

  describe('sendVerification', () => {
    it('should send verification email successfully', async () => {
      const mockCustomer = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        name: 'Test User',
        isVerified: false,
      };

      (mockReq as any).user = { userId: '507f1f77bcf86cd799439011' };

      (Customer.findById as jest.Mock).mockResolvedValue(mockCustomer);
      (authUtils.generateAuthToken as jest.Mock).mockReturnValue('verification.token');
      (emailService.sendEmailVerification as jest.Mock).mockResolvedValue(true);

      const result = await sendVerification(mockReq as any, mockRes as NextApiResponse);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Verification email sent successfully');
      expect(result.statusCode).toBe(200);
    });

    it('should return error for already verified email', async () => {
      const mockCustomer = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        isVerified: true,
      };

      (mockReq as any).user = { userId: '507f1f77bcf86cd799439011' };

      (Customer.findById as jest.Mock).mockResolvedValue(mockCustomer);

      const result = await sendVerification(mockReq as any, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Email is already verified');
      expect(result.statusCode).toBe(400);
    });

    it('should return error for non-existent customer', async () => {
      (mockReq as any).user = { userId: '507f1f77bcf86cd799439011' };

      (Customer.findById as jest.Mock).mockResolvedValue(null);

      const result = await sendVerification(mockReq as any, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Customer not found');
      expect(result.statusCode).toBe(404);
    });

    it('should return error if email sending fails', async () => {
      const mockCustomer = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        name: 'Test User',
        isVerified: false,
      };

      (mockReq as any).user = { userId: '507f1f77bcf86cd799439011' };

      (Customer.findById as jest.Mock).mockResolvedValue(mockCustomer);
      (authUtils.generateAuthToken as jest.Mock).mockReturnValue('verification.token');
      (emailService.sendEmailVerification as jest.Mock).mockResolvedValue(false);

      const result = await sendVerification(mockReq as any, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to send verification email');
      expect(result.statusCode).toBe(500);
    });
  });

  describe('me', () => {
    it('should return user data for valid token', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.CUSTOMER,
        isActive: true,
      };

      mockReq.headers = {
        authorization: 'Bearer valid.jwt.token',
      };
      (mockReq as any).user = { userId: '507f1f77bcf86cd799439011' };

      jest.spyOn(jwt, 'verify').mockImplementation(() => ({}));
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await me(mockReq as any, mockRes as NextApiResponse);

      expect(result.success).toBe(true);
      expect(result.message).toBe('User data retrieved successfully');
      expect(result.statusCode).toBe(200);
      expect(result.user).toBeDefined();
    });

    it('should return error for missing token', async () => {
      mockReq.headers = {};
      (mockReq as any).user = { userId: '507f1f77bcf86cd799439011' };

      const result = await me(mockReq as any, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('No token provided');
      expect(result.statusCode).toBe(401);
    });

    it('should return error for invalid token', async () => {
      mockReq.headers = {
        authorization: 'Bearer invalid.token',
      };
      (mockReq as any).user = { userId: '507f1f77bcf86cd799439011' };

      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await me(mockReq as any, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid or expired token');
      expect(result.statusCode).toBe(401);
    });

    it('should return error for non-existent user', async () => {
      mockReq.headers = {
        authorization: 'Bearer valid.jwt.token',
      };
      (mockReq as any).user = { userId: '507f1f77bcf86cd799439011' };

      jest.spyOn(jwt, 'verify').mockImplementation(() => ({}));
      (User.findById as jest.Mock).mockResolvedValue(null);

      const result = await me(mockReq as any, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('User not found');
      expect(result.statusCode).toBe(404);
    });

    it('should return error for inactive customer', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
        isActive: false,
      };

      mockReq.headers = {
        authorization: 'Bearer valid.jwt.token',
      };
      (mockReq as any).user = { userId: '507f1f77bcf86cd799439011' };

      jest.spyOn(jwt, 'verify').mockImplementation(() => ({}));
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await me(mockReq as any, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('User account is inactive');
      expect(result.statusCode).toBe(401);
    });

    it('should return error for locked admin account', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        loginAttempts: 5,
      };

      mockReq.headers = {
        authorization: 'Bearer valid.jwt.token',
      };
      (mockReq as any).user = { userId: '507f1f77bcf86cd799439011' };

      jest.spyOn(jwt, 'verify').mockImplementation(() => ({}));
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await me(mockReq as any, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Account is temporarily locked');
      expect(result.statusCode).toBe(423);
    });
  });
});
