import {
  buildProfileResponse,
  validateProfileUpdate,
  PROFILE_MESSAGES,
} from '../../src/lib/utils/profile';
import { Gender } from '../../src/lib/models/enums';

describe('profile utils', () => {
  describe('buildProfileResponse', () => {
    it('should build profile response correctly', () => {
      const mockCustomer = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        name: 'John Doe',
        email: 'john@example.com',
        dob: new Date('1990-01-01'),
        phone: '+1234567890',
        gender: Gender.MALE,
        occupation: 'Engineer',
        isActive: true,
        isVerified: true,
        totalOrders: 5,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response = buildProfileResponse(mockCustomer);

      expect(response).toEqual({
        id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        dob: mockCustomer.dob,
        phone: '+1234567890',
        gender: Gender.MALE,
        occupation: 'Engineer',
        isActive: true,
        isVerified: true,
        totalOrders: 5,
        createdAt: mockCustomer.createdAt,
        updatedAt: mockCustomer.updatedAt,
      });
    });

    it('should handle missing occupation', () => {
      const mockCustomer = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        name: 'John Doe',
        email: 'john@example.com',
        dob: new Date('1990-01-01'),
        phone: '+1234567890',
        gender: Gender.MALE,
        occupation: undefined,
        isActive: true,
        isVerified: false,
        totalOrders: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response = buildProfileResponse(mockCustomer);

      expect(response.occupation).toBeUndefined();
      expect(response.totalOrders).toBe(0);
    });

    it('should default totalOrders to 0 if not provided', () => {
      const mockCustomer = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        name: 'John Doe',
        email: 'john@example.com',
        dob: new Date('1990-01-01'),
        phone: '+1234567890',
        gender: Gender.MALE,
        isActive: true,
        isVerified: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response = buildProfileResponse(mockCustomer);

      expect(response.totalOrders).toBe(0);
    });
  });

  describe('validateProfileUpdate', () => {
    it('should return empty array for valid update data', () => {
      const data = {
        name: 'Jane Doe',
        phone: '+9876543210',
      };

      const errors = validateProfileUpdate(data);

      expect(errors).toEqual([]);
    });

    it('should return error when no fields provided', () => {
      const data = {};

      const errors = validateProfileUpdate(data);

      expect(errors).toContain('At least one field must be provided for update');
    });

    describe('name validation', () => {
      it('should return error for non-string name', () => {
        const data = {
          name: 123 as any,
        };

        const errors = validateProfileUpdate(data);

        expect(errors).toContain('Name must be a string');
      });

      it('should return error for name less than 2 characters', () => {
        const data = {
          name: 'A',
        };

        const errors = validateProfileUpdate(data);

        expect(errors).toContain('Name must be at least 2 characters');
      });

      it('should return error for name exceeding 100 characters', () => {
        const data = {
          name: 'a'.repeat(101),
        };

        const errors = validateProfileUpdate(data);

        expect(errors).toContain('Name must not exceed 100 characters');
      });

      it('should trim name before validation', () => {
        const data = {
          name: '   Jo   ',
        };

        const errors = validateProfileUpdate(data);

        expect(errors).toEqual([]);
      });
    });

    describe('dob validation', () => {
      it('should return error for non-string dob', () => {
        const data = {
          dob: 123 as any,
        };

        const errors = validateProfileUpdate(data);

        expect(errors).toContain('Date of birth must be a valid date string');
      });

      it('should return error for invalid date', () => {
        const data = {
          dob: 'invalid-date',
        };

        const errors = validateProfileUpdate(data);

        expect(errors).toContain('Date of birth must be a valid date');
      });

      it('should return error for future date', () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);

        const data = {
          dob: futureDate.toISOString(),
        };

        const errors = validateProfileUpdate(data);

        expect(errors).toContain('Date of birth cannot be in the future');
      });

      it('should return error for age less than 13', () => {
        const recentDate = new Date();
        recentDate.setFullYear(recentDate.getFullYear() - 10);

        const data = {
          dob: recentDate.toISOString(),
        };

        const errors = validateProfileUpdate(data);

        expect(errors).toContain('You must be at least 13 years old');
      });

      it('should return error for age greater than 120', () => {
        const oldDate = new Date();
        oldDate.setFullYear(oldDate.getFullYear() - 121);

        const data = {
          dob: oldDate.toISOString(),
        };

        const errors = validateProfileUpdate(data);

        expect(errors).toContain('Invalid date of birth');
      });

      it('should accept valid date of birth', () => {
        const validDate = new Date();
        validDate.setFullYear(validDate.getFullYear() - 25);

        const data = {
          dob: validDate.toISOString(),
        };

        const errors = validateProfileUpdate(data);

        expect(errors).toEqual([]);
      });
    });

    describe('phone validation', () => {
      it('should return error for non-string phone', () => {
        const data = {
          phone: 123 as any,
        };

        const errors = validateProfileUpdate(data);

        expect(errors).toContain('Phone must be a string');
      });

      it('should return error for phone less than 10 characters', () => {
        const data = {
          phone: '123456789',
        };

        const errors = validateProfileUpdate(data);

        expect(errors).toContain('Phone must be at least 10 characters');
      });

      it('should return error for phone exceeding 20 characters', () => {
        const data = {
          phone: '1'.repeat(21),
        };

        const errors = validateProfileUpdate(data);

        expect(errors).toContain('Phone must not exceed 20 characters');
      });

      it('should return error for invalid phone characters', () => {
        const data = {
          phone: 'abc1234567890',
        };

        const errors = validateProfileUpdate(data);

        expect(errors).toContain(
          'Phone must contain only numbers and valid characters (+, -, space, parentheses)'
        );
      });

      it('should accept valid phone formats', () => {
        const validPhones = [
          '+1234567890',
          '1234567890',
          '(123) 456-7890',
          '+1 (123) 456-7890',
        ];

        validPhones.forEach((phone) => {
          const data = { phone };
          const errors = validateProfileUpdate(data);

          expect(errors).toEqual([]);
        });
      });
    });

    describe('gender validation', () => {
      it('should accept valid gender values', () => {
        Object.values(Gender).forEach((gender) => {
          const data = { gender };
          const errors = validateProfileUpdate(data);

          expect(errors).toEqual([]);
        });
      });

      it('should return error for invalid gender', () => {
        const data = {
          gender: 'invalid' as any,
        };

        const errors = validateProfileUpdate(data);

        expect(errors).toContain(`Gender must be one of: ${Object.values(Gender).join(', ')}`);
      });
    });

    describe('occupation validation', () => {
      it('should accept valid occupation', () => {
        const data = {
          occupation: 'Engineer',
        };

        const errors = validateProfileUpdate(data);

        expect(errors).toEqual([]);
      });

      it('should accept empty string occupation', () => {
        const data = {
          occupation: '',
        };

        const errors = validateProfileUpdate(data);

        expect(errors).toEqual([]);
      });

      it('should accept null occupation', () => {
        const data = {
          occupation: null,
        };

        const errors = validateProfileUpdate(data);

        expect(errors).toEqual([]);
      });

      it('should return error for non-string occupation', () => {
        const data = {
          occupation: 123 as any,
        };

        const errors = validateProfileUpdate(data);

        expect(errors).toContain('Occupation must be a string');
      });

      it('should return error for occupation exceeding 100 characters', () => {
        const data = {
          occupation: 'a'.repeat(101),
        };

        const errors = validateProfileUpdate(data);

        expect(errors).toContain('Occupation must not exceed 100 characters');
      });
    });

    it('should allow updating multiple fields', () => {
      const data = {
        name: 'Jane Doe',
        phone: '+9876543210',
        gender: Gender.FEMALE,
        occupation: 'Doctor',
      };

      const errors = validateProfileUpdate(data);

      expect(errors).toEqual([]);
    });

    it('should return multiple errors for multiple invalid fields', () => {
      const data = {
        name: 'A',
        phone: '123',
        gender: 'invalid' as any,
      };

      const errors = validateProfileUpdate(data);

      expect(errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('PROFILE_MESSAGES', () => {
    it('should have all required message constants', () => {
      expect(PROFILE_MESSAGES.RETRIEVED).toBe('Profile retrieved successfully');
      expect(PROFILE_MESSAGES.UPDATED).toBe('Profile updated successfully');
      expect(PROFILE_MESSAGES.PHONE_EXISTS).toBe('Phone number already exists');
    });
  });
});
