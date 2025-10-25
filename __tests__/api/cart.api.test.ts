import { NextApiResponse } from 'next';
import { getCart, addProduct } from '../../src/lib/controllers/cart';
import { Cart } from '../../src/lib/models/Cart';
import { Product } from '../../src/lib/models/Product';
import { OptionValue } from '../../src/lib/models/OptionValue';
import { OptionType } from '../../src/lib/models/OptionType';
import * as cartUtils from '../../src/lib/utils/cart';
import { AuthenticatedRequest } from '../../src/lib/middleware/auth';
import mongoose from 'mongoose';

// Mock dependencies
jest.mock('../../src/lib/models/Cart');
jest.mock('../../src/lib/models/Product');
jest.mock('../../src/lib/models/OptionValue');
jest.mock('../../src/lib/utils/cart', () => ({
  ...jest.requireActual('../../src/lib/utils/cart'),
  buildCartResponse: jest.fn(),
  validateAddToCart: jest.fn(),
}));

jest.mock('../../src/lib/models/OptionType', () => ({
  OptionType: {
    find: jest.fn()
  }
}));

describe('Cart Controller API Tests', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<NextApiResponse>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      body: {},
      headers: {},
      method: 'GET',
      user: {
        userId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: 'customer',
        name: 'Test User',
      },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('getCart', () => {
    it('should get customer cart successfully', async () => {
      const mockCart = {
        _id: '507f1f77bcf86cd799439012',
        customerId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        products: [
          {
            productId: {
              _id: '507f1f77bcf86cd799439013',
              name: 'Test Product',
              price: 99.99,
              categoryId: { name: 'Electronics' },
            },
            quantity: 2,
            selectedOptions: [],
          },
        ],
        totalAmount: 199.98,
      };

      const mockCartResponse = {
        id: '507f1f77bcf86cd799439012',
        customerId: '507f1f77bcf86cd799439011',
        products: [
          {
            productId: '507f1f77bcf86cd799439013',
            productName: 'Test Product',
            price: 99.99,
            quantity: 2,
            subtotal: 199.98,
          },
        ],
        totalAmount: 199.98,
        count: 1,
      };

      (Cart.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCart),
      });

      (cartUtils.buildCartResponse as jest.Mock).mockResolvedValue(mockCartResponse);

      const result = await getCart(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(true);
      expect(result.message).toContain('retrieved');
      expect(result.cart).toEqual(mockCartResponse);
      expect(result.statusCode).toBe(200);
    });

    it('should create new cart if not exists', async () => {
      const mockNewCart = {
        _id: '507f1f77bcf86cd799439012',
        customerId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        products: [],
        totalAmount: 0,
      };

      const mockCartResponse = {
        id: '507f1f77bcf86cd799439012',
        customerId: '507f1f77bcf86cd799439011',
        products: [],
        totalAmount: 0,
        count: 0,
      };

      (Cart.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      (Cart.create as jest.Mock).mockResolvedValue(mockNewCart);
      (cartUtils.buildCartResponse as jest.Mock).mockResolvedValue(mockCartResponse);

      const result = await getCart(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(true);
      expect(result.message).toContain('empty');
      expect(result.cart?.count).toBe(0);
      expect(result.statusCode).toBe(200);
      expect(Cart.create).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      (Cart.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      const result = await getCart(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Internal server error');
      expect(result.statusCode).toBe(500);
    });
  });

  describe('addProduct', () => {
    it('should add product to cart successfully', async () => {
      const mockProduct = {
        _id: '507f1f77bcf86cd799439013',
        name: 'Test Product',
        price: 99.99,
        stock: 10,
        isActive: true,
      };

      const mockCart = {
        _id: '507f1f77bcf86cd799439012',
        customerId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        products: [],
        totalAmount: 0,
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn()
      };

      const mockCartResponse = {
        id: '507f1f77bcf86cd799439012',
        customerId: '507f1f77bcf86cd799439011',
        products: [
          {
            productId: '507f1f77bcf86cd799439013',
            productName: 'Test Product',
            price: 99.99,
            quantity: 1,
            subtotal: 99.99,
          },
        ],
        totalAmount: 99.99,
        count: 1,
      };

      mockReq.body = {
        productId: '507f1f77bcf86cd799439013',
        quantity: 1,
      };

      (cartUtils.validateAddToCart as jest.Mock).mockReturnValue([]);
      (Product.findOne as jest.Mock).mockResolvedValue(mockProduct);
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);
      (Cart.findOneAndUpdate as jest.Mock).mockResolvedValue(mockCart);
      (OptionType.find as jest.Mock).mockResolvedValue([]);
      (cartUtils.buildCartResponse as jest.Mock).mockResolvedValue(mockCartResponse);

      const result = await addProduct(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(true);
      expect(result.cart).toEqual(mockCartResponse);
      expect(result.statusCode).toBe(200);
    });

    it('should return validation error for invalid request', async () => {
      mockReq.body = {
        productId: '',
        quantity: -1,
      };

      (cartUtils.validateAddToCart as jest.Mock).mockReturnValue(['Invalid product ID']);

      const result = await addProduct(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
    });

    it('should return error for non-existent product', async () => {
      mockReq.body = {
        productId: '507f1f77bcf86cd799439013',
        quantity: 1,
      };

      (cartUtils.validateAddToCart as jest.Mock).mockReturnValue([]);
      (Product.findOne as jest.Mock).mockResolvedValue(null);

      const result = await addProduct(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
      expect(result.statusCode).toBe(404);
    });

    it('should return error for insufficient stock', async () => {
      const mockProduct = {
        _id: '507f1f77bcf86cd799439013',
        name: 'Test Product',
        price: 99.99,
        stock: 2,
        isActive: true,
      };

      const mockCart = {
        _id: '507f1f77bcf86cd799439012',
        customerId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        products: [
          {
            productId: '507f1f77bcf86cd799439013',
            quantity: 2,
          },
        ],
        totalAmount: 199.98,
        save: jest.fn(),
      };

      mockReq.body = {
        productId: '507f1f77bcf86cd799439013',
        quantity: 5,
      };

      (cartUtils.validateAddToCart as jest.Mock).mockReturnValue([]);
      (Product.findOne as jest.Mock).mockResolvedValue(mockProduct);
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);

      const result = await addProduct(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toContain('stock');
      expect(result.statusCode).toBe(400);
    });

    it('should handle database errors gracefully', async () => {
      mockReq.body = {
        productId: '507f1f77bcf86cd799439013',
        quantity: 1,
      };

      (cartUtils.validateAddToCart as jest.Mock).mockReturnValue([]);
      (Product.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await addProduct(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Internal server error');
      expect(result.statusCode).toBe(500);
    });
  });
});
