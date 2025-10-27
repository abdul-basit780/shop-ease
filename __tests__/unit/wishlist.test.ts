import {
  buildWishlistResponse,
  validateProductId,
  isProductInWishlist,
  WISHLIST_MESSAGES,
} from '../../src/lib/utils/wishlist';
import mongoose from 'mongoose';

jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');

  return {
    Types: {
      ObjectId: actualMongoose.Types.ObjectId,
    },
    isValidObjectId: jest.fn((id: string) => /^[0-9a-fA-F]{24}$/.test(id))
  }
});

describe('wishlist utils', () => {
  describe('buildWishlistResponse', () => {
    it('should build wishlist response correctly', () => {
      const mockWishlist = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        customerId: { toString: () => '507f1f77bcf86cd799439012' },
        products: [
          {
            productId: {
              _id: { toString: () => '507f1f77bcf86cd799439013' },
              name: 'Product 1',
              price: 99.99,
              stock: 50,
              img: 'product1.jpg',
              description: 'Description 1',
              categoryId: { _id: { toString: () => 'cat1' }, name: 'Category 1' },
              deletedAt: null,
            },
            addedAt: new Date('2024-01-01'),
          },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response = buildWishlistResponse(mockWishlist);

      expect(response).toEqual({
        id: '507f1f77bcf86cd799439011',
        customerId: '507f1f77bcf86cd799439012',
        count: 1,
        totalValue: 99.99,
        products: [
          {
            productId: '507f1f77bcf86cd799439013',
            name: 'Product 1',
            price: 99.99,
            stock: 50,
            img: 'product1.jpg',
            description: 'Description 1',
            categoryId: 'cat1',
            categoryName: 'Category 1',
            addedAt: mockWishlist.products[0].addedAt,
            isAvailable: true,
          },
        ],
        createdAt: mockWishlist.createdAt,
        updatedAt: mockWishlist.updatedAt,
      });
    });

    it('should filter out deleted products', () => {
      const mockWishlist = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        customerId: { toString: () => '507f1f77bcf86cd799439012' },
        products: [
          {
            productId: null,
          },
          {
            productId: {
              _id: { toString: () => '507f1f77bcf86cd799439013' },
              name: 'Product 1',
              price: 49.99,
              stock: 50,
              img: 'product1.jpg',
              description: 'Description 1',
              categoryId: { toString: () => 'cat1' },
              deletedAt: null,
            },
            addedAt: new Date('2024-01-01'),
          },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response = buildWishlistResponse(mockWishlist);

      expect(response.count).toBe(1);
      expect(response.products).toHaveLength(1);
    });

    it('should mark product as unavailable if out of stock', () => {
      const mockWishlist = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        customerId: { toString: () => '507f1f77bcf86cd799439012' },
        products: [
          {
            productId: {
              _id: { toString: () => '507f1f77bcf86cd799439013' },
              name: 'Out of Stock Product',
              price: 99.99,
              stock: 0,
              img: 'product.jpg',
              description: 'Description',
              categoryId: { toString: () => 'cat1' },
              deletedAt: null,
            },
            addedAt: new Date('2024-01-01'),
          },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response = buildWishlistResponse(mockWishlist);

      expect(response.products[0].isAvailable).toBe(false);
      expect(response.totalValue).toBe(0);
    });

    it('should mark product as unavailable if soft deleted', () => {
      const mockWishlist = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        customerId: { toString: () => '507f1f77bcf86cd799439012' },
        products: [
          {
            productId: {
              _id: { toString: () => '507f1f77bcf86cd799439013' },
              name: 'Deleted Product',
              price: 99.99,
              stock: 50,
              img: 'product.jpg',
              description: 'Description',
              categoryId: { toString: () => 'cat1' },
              deletedAt: new Date('2024-01-15'),
            },
            addedAt: new Date('2024-01-01'),
          },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response = buildWishlistResponse(mockWishlist);

      expect(response.products[0].isAvailable).toBe(false);
      expect(response.totalValue).toBe(0);
    });

    it('should calculate total value correctly', () => {
      const mockWishlist = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        customerId: { toString: () => '507f1f77bcf86cd799439012' },
        products: [
          {
            productId: {
              _id: { toString: () => '507f1f77bcf86cd799439013' },
              name: 'Product 1',
              price: 99.99,
              stock: 50,
              img: 'product1.jpg',
              description: 'Description 1',
              categoryId: { toString: () => 'cat1' },
              deletedAt: null,
            },
            addedAt: new Date('2024-01-01'),
          },
          {
            productId: {
              _id: { toString: () => '507f1f77bcf86cd799439014' },
              name: 'Product 2',
              price: 149.99,
              stock: 30,
              img: 'product2.jpg',
              description: 'Description 2',
              categoryId: { toString: () => 'cat2' },
              deletedAt: null,
            },
            addedAt: new Date('2024-01-02'),
          },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response = buildWishlistResponse(mockWishlist);

      expect(response.totalValue).toBe(249.98);
    });

    it('should round total value to 2 decimal places', () => {
      const mockWishlist = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        customerId: { toString: () => '507f1f77bcf86cd799439012' },
        products: [
          {
            productId: {
              _id: { toString: () => '507f1f77bcf86cd799439013' },
              name: 'Product 1',
              price: 10.333,
              stock: 50,
              img: 'product1.jpg',
              description: 'Description 1',
              categoryId: { toString: () => 'cat1' },
              deletedAt: null,
            },
            addedAt: new Date('2024-01-01'),
          },
          {
            productId: {
              _id: { toString: () => '507f1f77bcf86cd799439014' },
              name: 'Product 2',
              price: 20.666,
              stock: 30,
              img: 'product2.jpg',
              description: 'Description 2',
              categoryId: { toString: () => 'cat2' },
              deletedAt: null,
            },
            addedAt: new Date('2024-01-02'),
          },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response = buildWishlistResponse(mockWishlist);

      expect(response.totalValue).toBe(31.00);
    });

    it('should handle unpopulated categoryId', () => {
      const mockWishlist = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        customerId: { toString: () => '507f1f77bcf86cd799439012' },
        products: [
          {
            productId: {
              _id: { toString: () => '507f1f77bcf86cd799439013' },
              name: 'Product 1',
              price: 99.99,
              stock: 50,
              img: 'product1.jpg',
              description: 'Description 1',
              categoryId: { toString: () => 'cat1' },
              deletedAt: null,
            },
            addedAt: new Date('2024-01-01'),
          },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response = buildWishlistResponse(mockWishlist);

      expect(response.products[0].categoryId).toBe('cat1');
      expect(response.products[0].categoryName).toBeUndefined();
    });
  });

  describe('validateProductId', () => {
    it('should return empty array for valid product ID', () => {
      const errors = validateProductId('507f1f77bcf86cd799439011');

      expect(errors).toEqual([]);
    });

    it('should return error for missing product ID', () => {
      const errors = validateProductId('');

      expect(errors).toContain('Product ID is required');
    });

    it('should return error for invalid product ID format', () => {
      const errors = validateProductId('invalid-id');

      expect(errors).toContain('Invalid product ID format');
    });
  });

  describe('isProductInWishlist', () => {
    const mockWishlist = {
      products: [
        {
          productId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
          addedAt: new Date('2024-01-01'),
        },
        {
          productId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
          addedAt: new Date('2024-01-02'),
        },
      ],
    } as any;

    it('should return true if product is in wishlist', () => {
      const result = isProductInWishlist(mockWishlist, '507f1f77bcf86cd799439011');

      expect(result).toBe(true);
    });

    it('should return false if product is not in wishlist', () => {
      const result = isProductInWishlist(mockWishlist, '507f1f77bcf86cd799439099');

      expect(result).toBe(false);
    });

    it('should handle empty wishlist', () => {
      const emptyWishlist = {
        products: [],
      } as any;

      const result = isProductInWishlist(emptyWishlist, '507f1f77bcf86cd799439011');

      expect(result).toBe(false);
    });

    it('should compare product IDs as strings', () => {
      const result = isProductInWishlist(mockWishlist, '507f1f77bcf86cd799439012');

      expect(result).toBe(true);
    });
  });

  describe('WISHLIST_MESSAGES', () => {
    it('should have all required message constants', () => {
      expect(WISHLIST_MESSAGES.RETRIEVED).toBe('Wishlist retrieved successfully');
      expect(WISHLIST_MESSAGES.CREATED).toBe('Wishlist created successfully');
      expect(WISHLIST_MESSAGES.PRODUCT_ADDED).toBe('Product added to wishlist');
      expect(WISHLIST_MESSAGES.PRODUCT_REMOVED).toBe('Product removed from wishlist');
      expect(WISHLIST_MESSAGES.PRODUCT_ALREADY_EXISTS).toBe('Product is already in wishlist');
      expect(WISHLIST_MESSAGES.PRODUCT_NOT_IN_WISHLIST).toBe('Product is not in wishlist');
      expect(WISHLIST_MESSAGES.WISHLIST_EMPTY).toBe('Wishlist is empty');
      expect(WISHLIST_MESSAGES.PRODUCT_NOT_FOUND).toBe('Product not found or has been deleted');
    });
  });
});
