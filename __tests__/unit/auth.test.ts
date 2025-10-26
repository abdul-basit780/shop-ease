import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  generateRefreshToken,
  verifyRefreshToken,
  generateAuthToken,
  verifyAuthToken,
  generatePasswordResetUrl,
  generateEmailVerificationUrl,
  validatePasswordStrength,
  validateEmailFormat,
  validatePhoneFormat,
  generateRandomPassword,
  isAccountLocked,
  createRateLimitKey,
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateDateOfBirth,
  validateAddress,
  validateGender,
  validateOptionalStringArray,
  validateOptionalEnum,
  validateOptionalString,
  validateLoginCredentials,
  validateRegistrationData,
  sanitizeCustomerData,
  prepareUserResponse,
  TOKEN_EXPIRY,
} from '../../src/lib/utils/auth';
import { UserRole, Gender } from '../../src/lib/models/enums';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('auth utils', () => {
  describe('hashPassword', () => {
    it('should hash password with bcrypt', async () => {
      const mockHash = '$2a$12$hashedpassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

      const result = await hashPassword('password123');

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(result).toBe(mockHash);
    });
  });

  describe('comparePassword', () => {
    it('should compare password correctly', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await comparePassword('password123', '$2a$12$hashedpassword');

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', '$2a$12$hashedpassword');
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await comparePassword('wrongpassword', '$2a$12$hashedpassword');

      expect(result).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate JWT token with correct payload', () => {
      const mockToken = 'jwt.token.here';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
        name: 'Test User',
      };

      const result = generateToken(user);

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: '507f1f77bcf86cd799439011',
          email: 'test@example.com',
          role: UserRole.CUSTOMER,
          name: 'Test User',
        },
        expect.any(String),
        expect.objectContaining({
          issuer: 'shop-ease',
          audience: 'shop-ease-users',
          algorithm: 'HS256',
        })
      );
      expect(result).toBe(mockToken);
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const mockPayload = {
        userId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
        name: 'Test User',
      };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = verifyToken('valid.jwt.token');

      expect(result).toEqual(mockPayload);
    });

    it('should throw error for invalid token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => verifyToken('invalid.token')).toThrow('Invalid or expired token');
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from Bearer header', () => {
      const result = extractTokenFromHeader('Bearer abc123token');

      expect(result).toBe('abc123token');
    });

    it('should return null for missing header', () => {
      const result = extractTokenFromHeader(undefined);

      expect(result).toBeNull();
    });

    it('should return null for invalid format', () => {
      const result = extractTokenFromHeader('Invalid format');

      expect(result).toBeNull();
    });

    it('should return null for Bearer without token', () => {
      const result = extractTokenFromHeader('Bearer ');

      expect(result).toBeNull();
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token', () => {
      const mockToken = 'refresh.token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
        name: 'Test User',
      };

      const result = generateRefreshToken(user);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: '507f1f77bcf86cd799439011', type: 'refresh' },
        expect.any(String),
        expect.objectContaining({
          issuer: 'shop-ease',
          audience: 'shop-ease-refresh',
        })
      );
      expect(result).toBe(mockToken);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      (jwt.verify as jest.Mock).mockReturnValue({ userId: '507f1f77bcf86cd799439011' });

      const result = verifyRefreshToken('valid.refresh.token');

      expect(result).toEqual({ userId: '507f1f77bcf86cd799439011' });
    });

    it('should throw error for invalid refresh token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => verifyRefreshToken('invalid.token')).toThrow('Invalid refresh token');
    });
  });

  describe('generateAuthToken', () => {
    it('should generate auth token with custom expiry', () => {
      const mockToken = 'auth.token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const payload = {
        userId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        type: 'password-reset',
      };

      const result = generateAuthToken(payload, '1h');

      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        expect.any(String),
        expect.objectContaining({
          issuer: 'shop-ease',
          audience: 'shop-ease-auth',
        })
      );
      expect(result).toBe(mockToken);
    });
  });

  describe('verifyAuthToken', () => {
    it('should verify valid auth token', () => {
      const mockPayload = {
        userId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        type: 'password-reset',
      };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = verifyAuthToken('valid.auth.token');

      expect(result).toEqual(mockPayload);
    });

    it('should return null for invalid auth token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = verifyAuthToken('invalid.token');

      expect(result).toBeNull();
    });
  });

  describe('generatePasswordResetUrl', () => {
    it('should generate password reset URL', () => {
      const originalEnv = process.env.NEXT_PUBLIC_URL;
      process.env.NEXT_PUBLIC_URL = 'https://example.com';

      const result = generatePasswordResetUrl('token123');

      expect(result).toBe('https://example.com/auth/reset-password?token=token123');

      process.env.NEXT_PUBLIC_URL = originalEnv;
    });

    it('should use default URL if env not set', () => {
      const originalEnv = process.env.NEXT_PUBLIC_URL;
      delete process.env.NEXT_PUBLIC_URL;

      const result = generatePasswordResetUrl('token123');

      expect(result).toBe('http://localhost:3000/auth/reset-password?token=token123');

      process.env.NEXT_PUBLIC_URL = originalEnv;
    });
  });

  describe('generateEmailVerificationUrl', () => {
    it('should generate email verification URL', () => {
      const originalEnv = process.env.NEXT_PUBLIC_URL;
      process.env.NEXT_PUBLIC_URL = 'https://example.com';

      const result = generateEmailVerificationUrl('token456');

      expect(result).toBe('https://example.com/auth/verify-email?token=token456');

      process.env.NEXT_PUBLIC_URL = originalEnv;
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong password', () => {
      const result = validatePasswordStrength('Password123!');

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return error for short password', () => {
      const result = validatePasswordStrength('Pass1!');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should return error for missing lowercase', () => {
      const result = validatePasswordStrength('PASSWORD123!');

      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should return error for missing uppercase', () => {
      const result = validatePasswordStrength('password123!');

      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should return error for missing number', () => {
      const result = validatePasswordStrength('Password!');

      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should return error for missing special character', () => {
      const result = validatePasswordStrength('Password123');

      expect(result.errors).toContain(
        'Password must contain at least one special character (@$!%*?&)'
      );
    });

    it('should return multiple errors for weak password', () => {
      const result = validatePasswordStrength('pass');

      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('validateEmailFormat', () => {
    it('should validate correct email format', () => {
      expect(validateEmailFormat('test@example.com')).toBe(true);
      expect(validateEmailFormat('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email format', () => {
      expect(validateEmailFormat('invalid')).toBe(false);
      expect(validateEmailFormat('invalid@')).toBe(false);
      expect(validateEmailFormat('@domain.com')).toBe(false);
      expect(validateEmailFormat('test@domain')).toBe(false);
    });
  });

  describe('validatePhoneFormat', () => {
    it('should validate correct phone format', () => {
      expect(validatePhoneFormat('+1234567890')).toBe(true);
      expect(validatePhoneFormat('1234567890')).toBe(true);
    });

    it('should reject invalid phone format', () => {
      expect(validatePhoneFormat('123a')).toBe(false);
      expect(validatePhoneFormat('abc123')).toBe(false);
      expect(validatePhoneFormat('+0123456789')).toBe(false);
    });
  });

  describe('generateRandomPassword', () => {
    it('should generate password of correct length', () => {
      const password = generateRandomPassword();

      expect(password).toHaveLength(12);
    });

    it('should pass strength validation', () => {
      const password = generateRandomPassword();
      const validation = validatePasswordStrength(password);

      expect(validation.isValid).toBe(true);
    });

    it('should contain all required character types', () => {
      const password = generateRandomPassword();

      expect(/[a-z]/.test(password)).toBe(true);
      expect(/[A-Z]/.test(password)).toBe(true);
      expect(/\d/.test(password)).toBe(true);
      expect(/[@$!%*?&]/.test(password)).toBe(true);
    });
  });

  describe('isAccountLocked', () => {
    it('should return false for less than 5 attempts', () => {
      const result = isAccountLocked(4, new Date());

      expect(result).toBe(false);
    });

    it('should return true for 5 or more attempts without lastLoginAttempt', () => {
      const result = isAccountLocked(5);

      expect(result).toBe(true);
    });

    it('should return true if locked within 30 minutes', () => {
      const recentAttempt = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago
      const result = isAccountLocked(5, recentAttempt);

      expect(result).toBe(true);
    });

    it('should return false if lock period expired', () => {
      const oldAttempt = new Date(Date.now() - 31 * 60 * 1000); // 31 minutes ago
      const result = isAccountLocked(5, oldAttempt);

      expect(result).toBe(false);
    });
  });

  describe('createRateLimitKey', () => {
    it('should create correct rate limit key for login', () => {
      const result = createRateLimitKey('192.168.1.1', 'login');

      expect(result).toBe('login_192.168.1.1');
    });

    it('should create correct rate limit key for register', () => {
      const result = createRateLimitKey('192.168.1.1', 'register');

      expect(result).toBe('register_192.168.1.1');
    });
  });

  describe('validateEmail', () => {
    it('should return null for valid email', () => {
      const result = validateEmail('test@example.com');

      expect(result).toBeNull();
    });

    it('should return error for missing email', () => {
      expect(validateEmail('')).toBe('Email is required');
      expect(validateEmail(null)).toBe('Email is required');
    });

    it('should return error for invalid email format', () => {
      const result = validateEmail('invalid-email');

      expect(result).toBe('Please provide a valid email address');
    });
  });

  describe('validatePassword', () => {
    it('should return null for valid password', () => {
      const result = validatePassword('password123');

      expect(result).toBeNull();
    });

    it('should return error for missing password', () => {
      expect(validatePassword('')).toBe('Password is required');
      expect(validatePassword(null)).toBe('Password is required');
    });

    it('should return error for short password', () => {
      const result = validatePassword('pass');

      expect(result).toBe('Password must be at least 6 characters long');
    });
  });

  describe('validateName', () => {
    it('should return null for valid name', () => {
      const result = validateName('John Doe');

      expect(result).toBeNull();
    });

    it('should return error for missing name', () => {
      expect(validateName('')).toBe('Name is required');
      expect(validateName(null)).toBe('Name is required');
    });
  });

  describe('validatePhone', () => {
    it('should return null for valid phone', () => {
      const result = validatePhone('+1234567890');

      expect(result).toBeNull();
    });

    it('should return error for missing phone', () => {
      expect(validatePhone('')).toBe('Phone is required');
    });

    it('should return error for invalid phone format', () => {
      const result = validatePhone('123');

      expect(result).toBe('Please provide a valid phone number');
    });
  });

  describe('validateDateOfBirth', () => {
    it('should return null for valid date', () => {
      const result = validateDateOfBirth('1990-01-01');

      expect(result).toBeNull();
    });

    it('should return error for invalid date', () => {
      const result = validateDateOfBirth('invalid-date');

      expect(result).toBe('Valid date of birth is required');
    });
  });

  describe('validateAddress', () => {
    it('should return empty array for valid address', () => {
      const address = {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: 'A1B 2C3',
      };

      const result = validateAddress(address);

      expect(result).toEqual([]);
    });

    it('should return error for missing address', () => {
      const result = validateAddress(null);

      expect(result).toContain('Address is required');
    });

    it('should return error for missing street', () => {
      const address = {
        street: '',
        city: 'New York',
        state: 'NY',
        zipCode: 'A1B 2C3',
      };

      const result = validateAddress(address);

      expect(result).toContain('Street address is required');
    });

    it('should return error for invalid zipCode format', () => {
      const address = {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '12345',
      };

      const result = validateAddress(address);

      expect(result).toContain('Please enter a valid zip code');
    });
  });

  describe('validateGender', () => {
    it('should return null for valid gender', () => {
      expect(validateGender(Gender.MALE)).toBeNull();
      expect(validateGender(Gender.FEMALE)).toBeNull();
    });

    it('should return error for invalid gender', () => {
      const result = validateGender('invalid');

      expect(result).toBe('Valid gender is required');
    });
  });

  describe('validateOptionalStringArray', () => {
    it('should return null for valid string array', () => {
      const result = validateOptionalStringArray(['item1', 'item2'], 'Field');

      expect(result).toBeNull();
    });

    it('should return null for undefined', () => {
      const result = validateOptionalStringArray(undefined, 'Field');

      expect(result).toBeNull();
    });

    it('should return error for non-array', () => {
      const result = validateOptionalStringArray('string', 'Field');

      expect(result).toBe('Field must be an array of strings');
    });

    it('should return error for array with non-string items', () => {
      const result = validateOptionalStringArray([1, 2, 3], 'Field');

      expect(result).toBe('Field must be an array of strings');
    });
  });

  describe('validateOptionalEnum', () => {
    enum TestEnum {
      VALUE1 = 'value1',
      VALUE2 = 'value2',
    }

    it('should return null for valid enum value', () => {
      const result = validateOptionalEnum('value1', TestEnum, 'Field');

      expect(result).toBeNull();
    });

    it('should return null for undefined', () => {
      const result = validateOptionalEnum(undefined, TestEnum, 'Field');

      expect(result).toBeNull();
    });

    it('should return error for invalid enum value', () => {
      const result = validateOptionalEnum('invalid', TestEnum, 'Field');

      expect(result).toBe('Invalid Field');
    });
  });

  describe('validateOptionalString', () => {
    it('should return null for valid string', () => {
      const result = validateOptionalString('valid string', 'Field');

      expect(result).toBeNull();
    });

    it('should return null for undefined', () => {
      const result = validateOptionalString(undefined, 'Field');

      expect(result).toBeNull();
    });

    it('should return error for empty string', () => {
      const result = validateOptionalString('', 'Field');

      expect(result).toBe('Field must be a non-empty string');
    });
  });

  describe('validateLoginCredentials', () => {
    it('should return empty array for valid credentials', () => {
      const errors = validateLoginCredentials('test@example.com', 'password123');

      expect(errors).toEqual([]);
    });

    it('should return errors for missing fields', () => {
      const errors = validateLoginCredentials('', '');

      expect(errors).toContain('Password is required');
      expect(errors).toContain('Email is required');
    });

    it('should return error for invalid email', () => {
      const errors = validateLoginCredentials('invalid-email', 'password123');

      expect(errors).toContain('Please provide a valid email address');
    });
  });

  describe('validateRegistrationData', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      dob: '1990-01-01',
      phone: '+1234567890',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: 'A1B 2C3',
      },
      gender: Gender.MALE,
      occupation: 'Engineer',
    };

    it('should return empty array for valid data', () => {
      const errors = validateRegistrationData(validData);

      expect(errors).toEqual([]);
    });

    it('should return errors for invalid data', () => {
      const invalidData = {
        ...validData,
        name: '',
        email: 'invalid',
      };

      const errors = validateRegistrationData(invalidData);

      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('sanitizeCustomerData', () => {
    it('should sanitize and trim customer data', () => {
      const data = {
        name: '  John Doe  ',
        email: '  JOHN@EXAMPLE.COM  ',
        password: 'password123',
        phone: '  +1234567890  ',
        address: {
          street: '  123 Main St  ',
          city: '  New York  ',
          state: '  NY  ',
          zipCode: '  A1B 2C3  ',
        },
        dob: '  1990-01-01  ',
        gender: Gender.MALE,
        occupation: '  Engineer  ',
      };

      const result = sanitizeCustomerData(data);

      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.phone).toBe('+1234567890');
      expect(result.address.street).toBe('123 Main St');
      expect(result.occupation).toBe('Engineer');
    });
  });

  describe('prepareUserResponse', () => {
    it('should prepare customer response with customer fields', () => {
      const customer = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        role: UserRole.CUSTOMER,
        dob: new Date('1990-01-01'),
        phone: '+1234567890',
        gender: Gender.MALE,
        isVerified: true,
        isActive: true,
        occupation: 'Engineer',
      } as any;

      const result = prepareUserResponse(customer);

      expect(result).toEqual({
        id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        role: UserRole.CUSTOMER,
        dob: customer.dob.toISOString(),
        phone: '+1234567890',
        gender: Gender.MALE,
        isVerified: true,
        isActive: true,
        occupation: 'Engineer',
      });
    });

    it('should prepare admin response without customer fields', () => {
      const admin = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Admin User',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      } as any;

      const result = prepareUserResponse(admin);

      expect(result).toEqual({
        id: '507f1f77bcf86cd799439011',
        name: 'Admin User',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      });
    });
  });

  describe('TOKEN_EXPIRY', () => {
    it('should have correct token expiry constants', () => {
      expect(TOKEN_EXPIRY.PASSWORD_RESET).toBe('1h');
      expect(TOKEN_EXPIRY.EMAIL_VERIFICATION).toBe('24h');
      expect(TOKEN_EXPIRY.REFRESH_TOKEN).toBe('7d');
    });
  });
});
