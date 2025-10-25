import {
  buildCartResponse,
  validateProductId,
  validateQuantity,
  validateAddToCart,
  isProductInCart,
  getCartItemQuantity,
  CART_MESSAGES,
} from '../../src/lib/utils/cart';
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

describe('cart utils', () => {
  describe('buildCartResponse', () => {
    it('should build cart response with products', async () => {
      const mockCart = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        customerId: { toString: () => '507f1f77bcf86cd799439012' },
        products: [
          {
            productId: {
              _id: { toString: () => '507f1f77bcf86cd799439013' },
              name: 'Product 1',
              price: 10.99,
              stock: 50,
              img: 'image1.jpg',
              description: 'Description 1',
              categoryId: { _id: { toString: () => 'cat1' }, name: 'Category 1' },
              deletedAt: null,
            },
            quantity: 2,
            selectedOptions: [],
          },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response = await buildCartResponse(mockCart);

      expect(response.id).toBe('507f1f77bcf86cd799439011');
      expect(response.customerId).toBe('507f1f77bcf86cd799439012');
      expect(response.count).toBe(1);
      expect(response.totalAmount).toBe(21.98);
      expect(response.products[0]).toEqual({
        productId: '507f1f77bcf86cd799439013',
        name: 'Product 1',
        price: 10.99,
        stock: 50,
        img: 'image1.jpg',
        description: 'Description 1',
        categoryId: 'cat1',
        categoryName: 'Category 1',
        quantity: 2,
        subtotal: 21.98,
        isAvailable: true,
      });
    });

    it('should calculate total with selected options', async () => {
      const mockCart = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        customerId: { toString: () => '507f1f77bcf86cd799439012' },
        products: [
          {
            productId: {
              _id: { toString: () => '507f1f77bcf86cd799439013' },
              name: 'Product 1',
              price: 10.0,
              stock: 50,
              img: 'image1.jpg',
              description: 'Description 1',
              categoryId: { toString: () => 'cat1' },
              deletedAt: null,
            },
            quantity: 1,
            selectedOptions: [
              {
                _id: { toString: () => 'opt1' },
                value: 'Large',
                price: 5.0,
                stock: 30,
                optionTypeId: { name: 'Size' },
              },
            ],
          },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response = await buildCartResponse(mockCart);

      expect(response.products[0].price).toBe(15.0);
      expect(response.products[0].subtotal).toBe(15.0);
      expect(response.totalAmount).toBe(15.0);
      expect(response.products[0].selectedOptions).toHaveLength(1);
    });

    it('should filter out deleted products', async () => {
      const mockCart = {
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
              price: 10.0,
              stock: 50,
              img: 'image1.jpg',
              description: 'Description 1',
              categoryId: { toString: () => 'cat1' },
              deletedAt: null,
            },
            quantity: 1,
            selectedOptions: [],
          },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response = await buildCartResponse(mockCart);

      expect(response.count).toBe(1);
      expect(response.products).toHaveLength(1);
    });

    it('should mark product as unavailable if out of stock', async () => {
      const mockCart = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        customerId: { toString: () => '507f1f77bcf86cd799439012' },
        products: [
          {
            productId: {
              _id: { toString: () => '507f1f77bcf86cd799439013' },
              name: 'Product 1',
              price: 10.0,
              stock: 0,
              img: 'image1.jpg',
              description: 'Description 1',
              categoryId: { toString: () => 'cat1' },
              deletedAt: null,
            },
            quantity: 1,
            selectedOptions: [],
          },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response = await buildCartResponse(mockCart);

      expect(response.products[0].isAvailable).toBe(false);
      expect(response.totalAmount).toBe(0);
    });

    it('should round total amount to 2 decimal places', async () => {
      const mockCart = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        customerId: { toString: () => '507f1f77bcf86cd799439012' },
        products: [
          {
            productId: {
              _id: { toString: () => '507f1f77bcf86cd799439013' },
              name: 'Product 1',
              price: 10.333,
              stock: 50,
              img: 'image1.jpg',
              description: 'Description 1',
              categoryId: { toString: () => 'cat1' },
              deletedAt: null,
            },
            quantity: 3,
            selectedOptions: [],
          },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const response = await buildCartResponse(mockCart);

      expect(response.totalAmount).toBe(31.00);
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

  describe('validateQuantity', () => {
    it('should return empty array for valid quantity', () => {
      const errors = validateQuantity(5);

      expect(errors).toEqual([]);
    });

    it('should return error for missing quantity', () => {
      const errors = validateQuantity(undefined as any);

      expect(errors).toContain('Quantity is required');
    });

    it('should return error for non-number quantity', () => {
      const errors = validateQuantity('5' as any);

      expect(errors).toContain('Quantity must be a number');
    });

    it('should return error for quantity less than 1', () => {
      const errors = validateQuantity(0);

      expect(errors).toContain('Quantity must be at least 1');
    });

    it('should return error for quantity greater than 999', () => {
      const errors = validateQuantity(1000);

      expect(errors).toContain('Quantity cannot exceed 999');
    });

    it('should return error for non-integer quantity', () => {
      const errors = validateQuantity(5.5);

      expect(errors).toContain('Quantity must be a whole number');
    });

    it('should allow quantity of 0 to be checked specifically', () => {
      const errors = validateQuantity(0);

      expect(errors).not.toContain('Quantity is required');
      expect(errors).toContain('Quantity must be at least 1');
    });
  });

  describe('validateAddToCart', () => {
    it('should return empty array for valid data', () => {
      const errors = validateAddToCart('507f1f77bcf86cd799439011', 5);

      expect(errors).toEqual([]);
    });

    it('should return errors for invalid data', () => {
      const errors = validateAddToCart('invalid', 0);

      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('isProductInCart', () => {
    const mockCart = {
      products: [
        {
          productId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
          quantity: 2,
          selectedOptions: [],
        },
        {
          productId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
          quantity: 1,
          selectedOptions: [
            new mongoose.Types.ObjectId('507f1f77bcf86cd799439020'),
            new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'),
          ],
        },
      ],
    } as any;

    it('should return true if product is in cart without options', () => {
      const result = isProductInCart(mockCart, '507f1f77bcf86cd799439011');

      expect(result).toBe(true);
    });

    it('should return false if product is not in cart', () => {
      const result = isProductInCart(mockCart, '507f1f77bcf86cd799439099');

      expect(result).toBe(false);
    });

    it('should match product with same options', () => {
      const selectedOptions = [
        new mongoose.Types.ObjectId('507f1f77bcf86cd799439020'),
        new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'),
      ];

      const result = isProductInCart(mockCart, '507f1f77bcf86cd799439012', selectedOptions);

      expect(result).toBe(true);
    });

    it('should not match product with different options', () => {
      const selectedOptions = [
        new mongoose.Types.ObjectId('507f1f77bcf86cd799439099'),
      ];

      const result = isProductInCart(mockCart, '507f1f77bcf86cd799439012', selectedOptions);

      expect(result).toBe(false);
    });

    it('should handle empty options array', () => {
      const result = isProductInCart(mockCart, '507f1f77bcf86cd799439011', []);

      expect(result).toBe(true);
    });
  });

  describe('getCartItemQuantity', () => {
    const mockCart = {
      products: [
        {
          productId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
          quantity: 5,
          selectedOptions: [],
        },
        {
          productId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
          quantity: 3,
          selectedOptions: [
            new mongoose.Types.ObjectId('507f1f77bcf86cd799439020'),
          ],
        },
      ],
    } as any;

    it('should return correct quantity for product in cart', () => {
      const quantity = getCartItemQuantity(mockCart, '507f1f77bcf86cd799439011');

      expect(quantity).toBe(5);
    });

    it('should return 0 for product not in cart', () => {
      const quantity = getCartItemQuantity(mockCart, '507f1f77bcf86cd799439099');

      expect(quantity).toBe(0);
    });

    it('should return correct quantity with matching options', () => {
      const selectedOptions = [
        new mongoose.Types.ObjectId('507f1f77bcf86cd799439020'),
      ];

      const quantity = getCartItemQuantity(mockCart, '507f1f77bcf86cd799439012', selectedOptions);

      expect(quantity).toBe(3);
    });

    it('should return 0 with non-matching options', () => {
      const selectedOptions = [
        new mongoose.Types.ObjectId('507f1f77bcf86cd799439099'),
      ];

      const quantity = getCartItemQuantity(mockCart, '507f1f77bcf86cd799439012', selectedOptions);

      expect(quantity).toBe(0);
    });
  });

  describe('CART_MESSAGES', () => {
    it('should have all required message constants', () => {
      expect(CART_MESSAGES.RETRIEVED).toBe('Cart retrieved successfully');
      expect(CART_MESSAGES.CREATED).toBe('Cart created successfully');
      expect(CART_MESSAGES.PRODUCT_ADDED).toBe('Product added to cart');
      expect(CART_MESSAGES.PRODUCT_UPDATED).toBe('Cart item quantity updated');
      expect(CART_MESSAGES.PRODUCT_REMOVED).toBe('Product removed from cart');
      expect(CART_MESSAGES.CART_EMPTY).toBe('Cart is empty');
      expect(CART_MESSAGES.PRODUCT_NOT_FOUND).toBe('Product not found or has been deleted');
      expect(CART_MESSAGES.PRODUCT_NOT_IN_CART).toBe('Product is not in cart');
      expect(CART_MESSAGES.INSUFFICIENT_STOCK).toBe('Insufficient stock available');
      expect(CART_MESSAGES.PRODUCT_OUT_OF_STOCK).toBe('Product is out of stock');
    });
  });
});
