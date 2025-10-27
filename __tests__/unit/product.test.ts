import {
  buildProductResponse,
  buildPublicProductResponse,
  validateProductRequest,
  validateImageFile,
  buildProductFilter,
  buildProductSort,
} from '../../src/lib/utils/product';

jest.mock('mongoose', () => ({
  isValidObjectId: jest.fn((id: string) => /^[0-9a-fA-F]{24}$/.test(id)),
}));

describe('product utils', () => {
  describe('buildProductResponse', () => {
    it('should build product response with populated category', () => {
      const mockProduct = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        name: 'Laptop',
        price: 999.99,
        stock: 50,
        img: 'laptop.jpg',
        description: 'High-performance laptop',
        categoryId: {
          _id: { toString: () => '507f1f77bcf86cd799439012' },
          name: 'Electronics',
        },
        deletedAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response = buildProductResponse(mockProduct);

      expect(response).toEqual({
        id: '507f1f77bcf86cd799439011',
        name: 'Laptop',
        price: 999.99,
        stock: 50,
        img: 'laptop.jpg',
        description: 'High-performance laptop',
        categoryId: '507f1f77bcf86cd799439012',
        categoryName: 'Electronics',
        deletedAt: null,
        createdAt: mockProduct.createdAt,
        updatedAt: mockProduct.updatedAt,
      });
    });

    it('should handle unpopulated categoryId', () => {
      const mockProduct = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        name: 'Laptop',
        price: 999.99,
        stock: 50,
        img: 'laptop.jpg',
        description: 'High-performance laptop',
        categoryId: { toString: () => '507f1f77bcf86cd799439012' },
        deletedAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response = buildProductResponse(mockProduct);

      expect(response.categoryId).toBe('507f1f77bcf86cd799439012');
      expect(response.categoryName).toBeUndefined();
    });

    it('should include deletedAt timestamp', () => {
      const deletedDate = new Date('2024-01-15');
      const mockProduct = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        name: 'Deleted Product',
        price: 50.00,
        stock: 0,
        img: 'product.jpg',
        description: 'This was deleted',
        categoryId: { toString: () => '507f1f77bcf86cd799439012' },
        deletedAt: deletedDate,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response = buildProductResponse(mockProduct);

      expect(response.deletedAt).toBe(deletedDate);
    });
  });

  describe('buildPublicProductResponse', () => {
    it('should build public product response', () => {
      const mockProduct = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        name: 'Laptop',
        price: 999.99,
        stock: 50,
        img: 'laptop.jpg',
        description: 'High-performance laptop',
        categoryId: {
          _id: { toString: () => '507f1f77bcf86cd799439012' },
          name: 'Electronics',
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response = buildPublicProductResponse(mockProduct);

      expect(response).toEqual({
        id: '507f1f77bcf86cd799439011',
        name: 'Laptop',
        price: 999.99,
        stock: 50,
        img: 'laptop.jpg',
        description: 'High-performance laptop',
        categoryId: '507f1f77bcf86cd799439012',
        categoryName: 'Electronics',
        createdAt: mockProduct.createdAt,
        updatedAt: mockProduct.updatedAt,
      });
    });

    it('should not include deletedAt field', () => {
      const mockProduct = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        name: 'Laptop',
        price: 999.99,
        stock: 50,
        img: 'laptop.jpg',
        description: 'High-performance laptop',
        categoryId: { toString: () => '507f1f77bcf86cd799439012' },
        deletedAt: new Date(),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response = buildPublicProductResponse(mockProduct);

      expect(response).not.toHaveProperty('deletedAt');
    });
  });

  describe('validateProductRequest', () => {
    const validData = {
      name: 'Laptop',
      price: 999.99,
      stock: 50,
      description: 'High-performance laptop for gaming',
      categoryId: '507f1f77bcf86cd799439011',
      img: 'laptop.jpg',
    };

    describe('create validation', () => {
      it('should return empty array for valid data', () => {
        const errors = validateProductRequest(validData);

        expect(errors).toEqual([]);
      });

      describe('name validation', () => {
        it('should return error for missing name', () => {
          const data = { ...validData, name: '' };
          const errors = validateProductRequest(data);

          expect(errors).toContain('Name is required');
        });

        it('should return error for name less than 2 characters', () => {
          const data = { ...validData, name: 'A' };
          const errors = validateProductRequest(data);

          expect(errors).toContain('Name must be at least 2 characters long');
        });

        it('should return error for name exceeding 200 characters', () => {
          const data = { ...validData, name: 'a'.repeat(201) };
          const errors = validateProductRequest(data);

          expect(errors).toContain('Name must not exceed 200 characters');
        });
      });

      describe('price validation', () => {
        it('should return error for missing price', () => {
          const data = { ...validData, price: undefined as any };
          const errors = validateProductRequest(data);

          expect(errors).toContain('Price is required');
        });

        it('should return error for non-number price', () => {
          const data = { ...validData, price: 'invalid' as any };
          const errors = validateProductRequest(data);

          expect(errors).toContain('Price must be a valid number');
        });

        it('should return error for negative price', () => {
          const data = { ...validData, price: -10 };
          const errors = validateProductRequest(data);

          expect(errors).toContain('Price cannot be negative');
        });

        it('should return error for price exceeding max', () => {
          const data = { ...validData, price: 1000000 };
          const errors = validateProductRequest(data);

          expect(errors).toContain('Price cannot exceed 999999.99');
        });

        it('should accept zero price', () => {
          const data = { ...validData, price: 0 };
          const errors = validateProductRequest(data);

          expect(errors).toEqual([]);
        });
      });

      describe('stock validation', () => {
        it('should return error for missing stock', () => {
          const data = { ...validData, stock: undefined as any };
          const errors = validateProductRequest(data);

          expect(errors).toContain('Stock is required');
        });

        it('should return error for non-integer stock', () => {
          const data = { ...validData, stock: 5.5 };
          const errors = validateProductRequest(data);

          expect(errors).toContain('Stock must be a whole number');
        });

        it('should return error for negative stock', () => {
          const data = { ...validData, stock: -10 };
          const errors = validateProductRequest(data);

          expect(errors).toContain('Stock cannot be negative');
        });

        it('should return error for stock exceeding max', () => {
          const data = { ...validData, stock: 1000000 };
          const errors = validateProductRequest(data);

          expect(errors).toContain('Stock cannot exceed 999999');
        });

        it('should accept zero stock', () => {
          const data = { ...validData, stock: 0 };
          const errors = validateProductRequest(data);

          expect(errors).toEqual([]);
        });
      });

      describe('description validation', () => {
        it('should return error for missing description', () => {
          const data = { ...validData, description: '' };
          const errors = validateProductRequest(data);

          expect(errors).toContain('Description is required');
        });

        it('should return error for description less than 10 characters', () => {
          const data = { ...validData, description: 'Short' };
          const errors = validateProductRequest(data);

          expect(errors).toContain('Description must be at least 10 characters long');
        });

        it('should return error for description exceeding 2000 characters', () => {
          const data = { ...validData, description: 'a'.repeat(2001) };
          const errors = validateProductRequest(data);

          expect(errors).toContain('Description must not exceed 2000 characters');
        });
      });

      describe('categoryId validation', () => {
        it('should return error for missing categoryId', () => {
          const data = { ...validData, categoryId: '' };
          const errors = validateProductRequest(data);

          expect(errors).toContain('Category ID is required');
        });

        it('should return error for invalid categoryId format', () => {
          const data = { ...validData, categoryId: 'invalid-id' };
          const errors = validateProductRequest(data);

          expect(errors).toContain('Invalid category ID');
        });
      });
    });

    describe('update validation', () => {
      it('should allow partial updates', () => {
        const data = { name: 'Updated Name' };
        const errors = validateProductRequest(data, true);

        expect(errors).toEqual([]);
      });

      it('should validate provided fields in update', () => {
        const data = { name: 'A' };
        const errors = validateProductRequest(data, true);

        expect(errors).toContain('Name must be at least 2 characters long');
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
  });

  describe('buildProductFilter', () => {
    it('should filter out deleted records by default', () => {
      const params = {
        page: '1',
        limit: '10',
        includeDeleted: false,
      };

      const filter = buildProductFilter(params);

      expect(filter.deletedAt).toBeNull();
    });

    it('should not filter deleted records when includeDeleted is true', () => {
      const params = {
        page: '1',
        limit: '10',
        includeDeleted: true,
      };

      const filter = buildProductFilter(params);

      expect(filter.deletedAt).toBeUndefined();
    });

    it('should add search filter for name and description', () => {
      const params = {
        page: '1',
        limit: '10',
        search: 'laptop',
      };

      const filter = buildProductFilter(params);

      expect(filter.$or).toBeDefined();
      expect(filter.$or).toHaveLength(2);
      expect(filter.$or[0]).toEqual({ name: { $regex: 'laptop', $options: 'i' } });
      expect(filter.$or[1]).toEqual({ description: { $regex: 'laptop', $options: 'i' } });
    });

    it('should filter by categoryId', () => {
      const params = {
        page: '1',
        limit: '10',
        categoryId: '507f1f77bcf86cd799439011',
      };

      const filter = buildProductFilter(params);

      expect(filter.categoryId).toBe('507f1f77bcf86cd799439011');
    });

    it('should not filter by invalid categoryId', () => {
      const params = {
        page: '1',
        limit: '10',
        categoryId: 'invalid-id',
      };

      const filter = buildProductFilter(params);

      expect(filter.categoryId).toBeUndefined();
    });

    it('should filter by price range', () => {
      const params = {
        page: '1',
        limit: '10',
        minPrice: '100',
        maxPrice: '500',
      };

      const filter = buildProductFilter(params);

      expect(filter.price).toEqual({
        $gte: 100,
        $lte: 500,
      });
    });

    it('should filter by minimum price only', () => {
      const params = {
        page: '1',
        limit: '10',
        minPrice: '100',
      };

      const filter = buildProductFilter(params);

      expect(filter.price).toEqual({ $gte: 100 });
    });

    it('should filter by maximum price only', () => {
      const params = {
        page: '1',
        limit: '10',
        maxPrice: '500',
      };

      const filter = buildProductFilter(params);

      expect(filter.price).toEqual({ $lte: 500 });
    });

    it('should filter by inStock true', () => {
      const params = {
        page: '1',
        limit: '10',
        inStock: 'true',
      };

      const filter = buildProductFilter(params);

      expect(filter.stock).toEqual({ $gt: 0 });
    });

    it('should filter by inStock false', () => {
      const params = {
        page: '1',
        limit: '10',
        inStock: 'false',
      };

      const filter = buildProductFilter(params);

      expect(filter.stock).toBe(0);
    });

    it('should combine multiple filters', () => {
      const params = {
        page: '1',
        limit: '10',
        search: 'laptop',
        categoryId: '507f1f77bcf86cd799439011',
        minPrice: '100',
        maxPrice: '1000',
        inStock: 'true',
        includeDeleted: false,
      };

      const filter = buildProductFilter(params);

      expect(filter.deletedAt).toBeNull();
      expect(filter.$or).toBeDefined();
      expect(filter.categoryId).toBe('507f1f77bcf86cd799439011');
      expect(filter.price).toEqual({ $gte: 100, $lte: 1000 });
      expect(filter.stock).toEqual({ $gt: 0 });
    });
  });

  describe('buildProductSort', () => {
    it('should build ascending sort by name by default', () => {
      const params = {
        page: '1',
        limit: '10',
      };

      const sort = buildProductSort(params);

      expect(sort).toEqual({ name: 1 });
    });

    it('should build descending sort', () => {
      const params = {
        page: '1',
        limit: '10',
        sortBy: 'price',
        sortOrder: 'desc',
      };

      const sort = buildProductSort(params);

      expect(sort).toEqual({ price: -1 });
    });

    it('should sort by different fields', () => {
      ['name', 'price', 'stock', 'createdAt', 'updatedAt'].forEach((field) => {
        const params = {
          page: '1',
          limit: '10',
          sortBy: field,
        };

        const sort = buildProductSort(params);

        expect(sort).toEqual({ [field]: 1 });
      });
    });

    it('should default to name sort for invalid sortBy', () => {
      const params = {
        page: '1',
        limit: '10',
        sortBy: 'invalidField',
      };

      const sort = buildProductSort(params);

      expect(sort).toEqual({ name: 1 });
    });
  });
});
