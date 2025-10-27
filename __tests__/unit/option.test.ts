import {
  buildOptionValueResponse,
  buildOptionTypeResponse,
  validateOptionValueRequest,
  validateOptionTypeRequest,
  validateImageFile,
} from '../../src/lib/utils/option';

jest.mock('mongoose', () => ({
  isValidObjectId: jest.fn((id: string) => /^[0-9a-fA-F]{24}$/.test(id)),
}));

describe('option utils', () => {
  describe('buildOptionValueResponse', () => {
    it('should build option value response with populated optionType', () => {
      const mockOptionValue = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        optionTypeId: {
          _id: { toString: () => '507f1f77bcf86cd799439012' },
          name: 'Size',
          productId: { toString: () => '507f1f77bcf86cd799439013' },
        },
        value: 'Large',
        img: 'size-large.jpg',
        price: 5.99,
        stock: 50,
        deletedAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response = buildOptionValueResponse(mockOptionValue);

      expect(response).toEqual({
        id: '507f1f77bcf86cd799439011',
        optionTypeId: '507f1f77bcf86cd799439012',
        optionTypeName: 'Size',
        productId: '507f1f77bcf86cd799439013',
        value: 'Large',
        img: 'size-large.jpg',
        price: 5.99,
        stock: 50,
        deletedAt: null,
        createdAt: mockOptionValue.createdAt,
        updatedAt: mockOptionValue.updatedAt,
      });
    });

    it('should handle unpopulated optionTypeId', () => {
      const mockOptionValue = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        optionTypeId: { toString: () => '507f1f77bcf86cd799439012' },
        value: 'Medium',
        img: 'size-medium.jpg',
        price: 3.99,
        stock: 30,
        deletedAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response = buildOptionValueResponse(mockOptionValue);

      expect(response.optionTypeId).toBe('507f1f77bcf86cd799439012');
      expect(response.optionTypeName).toBeUndefined();
      expect(response.productId).toBeUndefined();
    });
  });

  describe('buildOptionTypeResponse', () => {
    it('should build option type response with populated product', () => {
      const mockOptionType = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        productId: {
          _id: { toString: () => '507f1f77bcf86cd799439012' },
          name: 'T-Shirt',
        },
        name: 'Color',
        deletedAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response = buildOptionTypeResponse(mockOptionType);

      expect(response).toEqual({
        id: '507f1f77bcf86cd799439011',
        productId: '507f1f77bcf86cd799439012',
        name: 'Color',
        deletedAt: null,
        createdAt: mockOptionType.createdAt,
        updatedAt: mockOptionType.updatedAt,
      });
    });

    it('should handle unpopulated productId', () => {
      const mockOptionType = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        productId: { toString: () => '507f1f77bcf86cd799439012' },
        name: 'Size',
        deletedAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response = buildOptionTypeResponse(mockOptionType);

      expect(response.productId).toBe('507f1f77bcf86cd799439012');
    });
  });

  describe('validateOptionValueRequest', () => {
    const validData = {
      optionTypeId: '507f1f77bcf86cd799439011',
      value: 'Large',
      img: 'large.jpg',
      price: 5.99,
      stock: 50,
    };

    describe('create validation', () => {
      it('should return empty array for valid data', () => {
        const errors = validateOptionValueRequest(validData);

        expect(errors).toEqual([]);
      });

      it('should return error for missing optionTypeId', () => {
        const data = { ...validData, optionTypeId: undefined };
        const errors = validateOptionValueRequest(data);

        expect(errors).toContain('Option type ID is required');
      });

      it('should return error for invalid optionTypeId format', () => {
        const data = { ...validData, optionTypeId: 'invalid-id' };
        const errors = validateOptionValueRequest(data);

        expect(errors).toContain('Invalid option type ID');
      });

      it('should return error for missing value', () => {
        const data = { ...validData, value: '' };
        const errors = validateOptionValueRequest(data);

        expect(errors).toContain('Value is required');
      });

      it('should return error for value exceeding 100 characters', () => {
        const data = { ...validData, value: 'a'.repeat(101) };
        const errors = validateOptionValueRequest(data);

        expect(errors).toContain('Value must not exceed 100 characters');
      });

      it('should return error for negative price', () => {
        const data = { ...validData, price: -5 };
        const errors = validateOptionValueRequest(data);

        expect(errors).toContain('Price cannot be negative');
      });

      it('should return error for price exceeding max', () => {
        const data = { ...validData, price: 1000000 };
        const errors = validateOptionValueRequest(data);

        expect(errors).toContain('Price cannot exceed 999999.99');
      });

      it('should return error for non-number price', () => {
        const data = { ...validData, price: 'invalid' as any };
        const errors = validateOptionValueRequest(data);

        expect(errors).toContain('Price must be a valid number');
      });

      it('should return error for negative stock', () => {
        const data = { ...validData, stock: -10 };
        const errors = validateOptionValueRequest(data);

        expect(errors).toContain('Stock cannot be negative');
      });

      it('should return error for non-integer stock', () => {
        const data = { ...validData, stock: 5.5 };
        const errors = validateOptionValueRequest(data);

        expect(errors).toContain('Stock must be a whole number');
      });

      it('should return error for stock exceeding max', () => {
        const data = { ...validData, stock: 1000000 };
        const errors = validateOptionValueRequest(data);

        expect(errors).toContain('Stock cannot exceed 999999');
      });

      it('should accept zero price', () => {
        const data = { ...validData, price: 0 };
        const errors = validateOptionValueRequest(data);

        expect(errors).toEqual([]);
      });

      it('should accept zero stock', () => {
        const data = { ...validData, stock: 0 };
        const errors = validateOptionValueRequest(data);

        expect(errors).toEqual([]);
      });
    });

    describe('update validation', () => {
      it('should allow partial updates', () => {
        const data = { value: 'Medium' };
        const errors = validateOptionValueRequest(data, true);

        expect(errors).toEqual([]);
      });

      it('should validate provided fields in update', () => {
        const data = { value: 'a'.repeat(101) };
        const errors = validateOptionValueRequest(data, true);

        expect(errors).toContain('Value must not exceed 100 characters');
      });

      it('should not require optionTypeId in update', () => {
        const data = { value: 'Small', price: 2.99, stock: 20 };
        const errors = validateOptionValueRequest(data, true);

        expect(errors).toEqual([]);
      });
    });
  });

  describe('validateOptionTypeRequest', () => {
    const validData = {
      productId: '507f1f77bcf86cd799439011',
      name: 'Size',
    };

    describe('create validation', () => {
      it('should return empty array for valid data', () => {
        const errors = validateOptionTypeRequest(validData);

        expect(errors).toEqual([]);
      });

      it('should return error for missing productId', () => {
        const data = { ...validData, productId: undefined };
        const errors = validateOptionTypeRequest(data as any);

        expect(errors).toContain('Product ID is required');
      });

      it('should return error for invalid productId format', () => {
        const data = { ...validData, productId: 'invalid-id' };
        const errors = validateOptionTypeRequest(data);

        expect(errors).toContain('Invalid product ID');
      });

      it('should return error for missing name', () => {
        const data = { ...validData, name: '' };
        const errors = validateOptionTypeRequest(data);

        expect(errors).toContain('Name is required');
      });

      it('should return error for name less than 2 characters', () => {
        const data = { ...validData, name: 'A' };
        const errors = validateOptionTypeRequest(data);

        expect(errors).toContain('Name must be at least 2 characters long');
      });

      it('should return error for name exceeding 100 characters', () => {
        const data = { ...validData, name: 'a'.repeat(101) };
        const errors = validateOptionTypeRequest(data);

        expect(errors).toContain('Name must not exceed 100 characters');
      });

      it('should accept name with exactly 2 characters', () => {
        const data = { ...validData, name: 'AB' };
        const errors = validateOptionTypeRequest(data);

        expect(errors).toEqual([]);
      });

      it('should accept name with exactly 100 characters', () => {
        const data = { ...validData, name: 'a'.repeat(100) };
        const errors = validateOptionTypeRequest(data);

        expect(errors).toEqual([]);
      });
    });

    describe('update validation', () => {
      it('should allow partial updates', () => {
        const data = { name: 'Color' };
        const errors = validateOptionTypeRequest(data as any, true);

        expect(errors).toEqual([]);
      });

      it('should validate provided fields in update', () => {
        const data = { name: 'A' };
        const errors = validateOptionTypeRequest(data as any, true);

        expect(errors).toContain('Name must be at least 2 characters long');
      });

      it('should not require productId in update', () => {
        const data = { name: 'Material' };
        const errors = validateOptionTypeRequest(data as any, true);

        expect(errors).toEqual([]);
      });
    });
  });

  describe('validateImageFile', () => {
    it('should return empty array when file is not provided', () => {
      const errors = validateImageFile(null);

      expect(errors).toEqual([]);
    });

    it('should return empty array for valid image file', () => {
      const file = {
        size: 1024 * 1024, // 1MB
        mimetype: 'image/jpeg',
      };

      const errors = validateImageFile(file);

      expect(errors).toEqual([]);
    });

    it('should return error for file size exceeding 5MB', () => {
      const file = {
        size: 6 * 1024 * 1024, // 6MB
        mimetype: 'image/jpeg',
      };

      const errors = validateImageFile(file);

      expect(errors).toContain('Image size must not exceed 5MB');
    });

    it('should accept file with exactly 5MB', () => {
      const file = {
        size: 5 * 1024 * 1024, // 5MB
        mimetype: 'image/jpeg',
      };

      const errors = validateImageFile(file);

      expect(errors).not.toContain('Image size must not exceed 5MB');
    });

    it('should return error for unsupported file type', () => {
      const file = {
        size: 1024 * 1024,
        mimetype: 'application/pdf',
      };

      const errors = validateImageFile(file);

      expect(errors).toContain('Image must be one of: .jpg, .jpeg, .png, .webp');
    });

    it('should accept all supported image types', () => {
      const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

      supportedTypes.forEach((mimetype) => {
        const file = {
          size: 1024 * 1024,
          mimetype,
        };

        const errors = validateImageFile(file);

        expect(errors).toEqual([]);
      });
    });

    it('should return multiple errors for invalid file', () => {
      const file = {
        size: 6 * 1024 * 1024,
        mimetype: 'application/pdf',
      };

      const errors = validateImageFile(file);

      expect(errors.length).toBe(2);
    });
  });
});
