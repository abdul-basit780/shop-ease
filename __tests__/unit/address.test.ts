import {
  buildAddressResponse,
  validateAddressId,
  validateAddressFields,
  validateAddAddress,
  validateUpdateAddress,
  ADDRESS_MESSAGES,
} from '../../src/lib/utils/address';

jest.mock('mongoose', () => ({
  isValidObjectId: jest.fn((id: string) => {
    // Simple mock - valid if 24 char hex string or looks like ObjectId
    return /^[0-9a-fA-F]{24}$/.test(id);
  }),
}));

describe('address utils', () => {
  describe('buildAddressResponse', () => {
    it('should build address response correctly', () => {
      const mockAddress = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        customerId: { toString: () => '507f1f77bcf86cd799439012' },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response = buildAddressResponse(mockAddress);

      expect(response).toEqual({
        id: '507f1f77bcf86cd799439011',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        customerId: '507f1f77bcf86cd799439012',
        fullAddress: '123 Main St, New York, NY 10001',
        createdAt: mockAddress.createdAt,
        updatedAt: mockAddress.updatedAt,
      });
    });

    it('should construct fullAddress correctly', () => {
      const mockAddress = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        customerId: { toString: () => '507f1f77bcf86cd799439012' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response = buildAddressResponse(mockAddress);

      expect(response.fullAddress).toBe('456 Oak Ave, Los Angeles, CA 90001');
    });
  });

  describe('validateAddressId', () => {
    it('should return empty array for valid ObjectId', () => {
      const errors = validateAddressId('507f1f77bcf86cd799439011');

      expect(errors).toEqual([]);
    });

    it('should return error if addressId is missing', () => {
      const errors = validateAddressId('');

      expect(errors).toContain('Address ID is required');
    });

    it('should return error for invalid ObjectId format', () => {
      const errors = validateAddressId('invalid-id');

      expect(errors).toContain('Invalid address ID format');
    });
  });

  describe('validateAddressFields', () => {
    describe('required fields validation', () => {
      it('should return errors when all fields are missing and required', () => {
        const errors = validateAddressFields(undefined, undefined, undefined, undefined, true);

        expect(errors).toContain('Street is required');
        expect(errors).toContain('City is required');
        expect(errors).toContain('State is required');
        expect(errors).toContain('Zip code is required');
      });

      it('should return empty array when all fields are valid and required', () => {
        const errors = validateAddressFields(
          '12345 Main Street',
          'New York',
          'NY',
          '10001',
          true
        );

        expect(errors).toEqual([]);
      });
    });

    describe('street validation', () => {
      it('should return error if street is not a string', () => {
        const errors = validateAddressFields(
          123 as any,
          'City',
          'State',
          '12345',
          false
        );

        expect(errors).toContain('Street must be a string');
      });

      it('should return error if street is too short', () => {
        const errors = validateAddressFields('123', 'City', 'State', '12345', false);

        expect(errors).toContain('Street must be at least 5 characters');
      });

      it('should return error if street is too long', () => {
        const longStreet = 'a'.repeat(201);
        const errors = validateAddressFields(longStreet, 'City', 'State', '12345', false);

        expect(errors).toContain('Street must not exceed 200 characters');
      });

      it('should accept street with exactly 5 characters', () => {
        const errors = validateAddressFields('12345', 'City', 'State', '12345', false);

        expect(errors).not.toContain('Street must be at least 5 characters');
      });
    });

    describe('city validation', () => {
      it('should return error if city is not a string', () => {
        const errors = validateAddressFields(
          '123 Main St',
          123 as any,
          'State',
          '12345',
          false
        );

        expect(errors).toContain('City must be a string');
      });

      it('should return error if city is too short', () => {
        const errors = validateAddressFields('123 Main St', 'N', 'State', '12345', false);

        expect(errors).toContain('City must be at least 2 characters');
      });

      it('should return error if city is too long', () => {
        const longCity = 'a'.repeat(101);
        const errors = validateAddressFields(
          '123 Main St',
          longCity,
          'State',
          '12345',
          false
        );

        expect(errors).toContain('City must not exceed 100 characters');
      });
    });

    describe('state validation', () => {
      it('should return error if state is not a string', () => {
        const errors = validateAddressFields(
          '123 Main St',
          'City',
          123 as any,
          '12345',
          false
        );

        expect(errors).toContain('State must be a string');
      });

      it('should return error if state is too short', () => {
        const errors = validateAddressFields('123 Main St', 'City', 'N', '12345', false);

        expect(errors).toContain('State must be at least 2 characters');
      });

      it('should return error if state is too long', () => {
        const longState = 'a'.repeat(101);
        const errors = validateAddressFields(
          '123 Main St',
          'City',
          longState,
          '12345',
          false
        );

        expect(errors).toContain('State must not exceed 100 characters');
      });
    });

    describe('zipCode validation', () => {
      it('should return error if zipCode is not a string', () => {
        const errors = validateAddressFields(
          '123 Main St',
          'City',
          'State',
          12345 as any,
          false
        );

        expect(errors).toContain('Zip code must be a string');
      });

      it('should return error if zipCode is too short', () => {
        const errors = validateAddressFields('123 Main St', 'City', 'State', '12', false);

        expect(errors).toContain('Zip code must be at least 3 characters');
      });

      it('should return error if zipCode is too long', () => {
        const longZip = '1'.repeat(21);
        const errors = validateAddressFields(
          '123 Main St',
          'City',
          'State',
          longZip,
          false
        );

        expect(errors).toContain('Zip code must not exceed 20 characters');
      });
    });

    describe('optional fields validation', () => {
      it('should not return errors when fields are undefined and not required', () => {
        const errors = validateAddressFields(undefined, undefined, undefined, undefined, false);

        expect(errors).toEqual([]);
      });

      it('should validate provided fields even when not required', () => {
        const errors = validateAddressFields('123', undefined, undefined, undefined, false);

        expect(errors).toContain('Street must be at least 5 characters');
      });
    });
  });

  describe('validateAddAddress', () => {
    it('should validate all required fields', () => {
      const errors = validateAddAddress('', '', '', '');

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should return empty array for valid address data', () => {
      const errors = validateAddAddress(
        '123 Main Street',
        'New York',
        'NY',
        '10001'
      );

      expect(errors).toEqual([]);
    });
  });

  describe('validateUpdateAddress', () => {
    it('should validate address ID', () => {
      const errors = validateUpdateAddress(
        'invalid-id',
        '123 Main St',
        'City',
        'State',
        '12345'
      );

      expect(errors).toContain('Invalid address ID format');
    });

    it('should return error if no fields provided for update', () => {
      const errors = validateUpdateAddress('507f1f77bcf86cd799439011');

      expect(errors).toContain('At least one field must be provided for update');
    });

    it('should validate provided fields', () => {
      const errors = validateUpdateAddress('507f1f77bcf86cd799439011', '123');

      expect(errors).toContain('Street must be at least 5 characters');
    });

    it('should return empty array for valid update data', () => {
      const errors = validateUpdateAddress(
        '507f1f77bcf86cd799439011',
        '123 Main Street'
      );

      expect(errors).toEqual([]);
    });

    it('should allow partial updates', () => {
      const errors = validateUpdateAddress(
        '507f1f77bcf86cd799439011',
        undefined,
        'New York',
        undefined,
        undefined
      );

      expect(errors).toEqual([]);
    });
  });

  describe('ADDRESS_MESSAGES', () => {
    it('should have all required message constants', () => {
      expect(ADDRESS_MESSAGES.LIST_RETRIEVED).toBe('Addresses retrieved successfully');
      expect(ADDRESS_MESSAGES.ADDRESS_RETRIEVED).toBe('Address retrieved successfully');
      expect(ADDRESS_MESSAGES.ADDRESS_ADDED).toBe('Address added successfully');
      expect(ADDRESS_MESSAGES.ADDRESS_UPDATED).toBe('Address updated successfully');
      expect(ADDRESS_MESSAGES.ADDRESS_DELETED).toBe('Address deleted successfully');
      expect(ADDRESS_MESSAGES.ADDRESS_NOT_FOUND).toBe('Address not found');
      expect(ADDRESS_MESSAGES.NO_ADDRESSES).toBe('No addresses found');
      expect(ADDRESS_MESSAGES.UNAUTHORIZED_ACCESS).toBe(
        'You are not authorized to access this address'
      );
    });
  });
});
