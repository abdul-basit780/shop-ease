import { NextApiResponse } from 'next';
import { getOrders, getOrderById, createOrder } from '../../src/lib/controllers/order';
import { Order } from '../../src/lib/models/Order';
import { Cart } from '../../src/lib/models/Cart';
import { Product } from '../../src/lib/models/Product';
import { Address } from '../../src/lib/models/Address';
import { AuthenticatedRequest } from '../../src/lib/middleware/auth';
import mongoose from 'mongoose';
import { OrderStatus } from '../../src/lib/models/enums';

// Mock dependencies
jest.mock('../../src/lib/models/Order');
jest.mock('../../src/lib/models/Cart');
jest.mock('../../src/lib/models/Product');
jest.mock('../../src/lib/models/Address');

describe('Customer Order Controller API Tests', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<NextApiResponse>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      body: {},
      query: {},
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

  describe('getOrders', () => {
    it('should get customer orders successfully', async () => {
      const mockOrders = [
        {
          _id: '507f1f77bcf86cd799439012',
          customerId: '507f1f77bcf86cd799439011',
          products: [
            {
              productId: {
                _id: '507f1f77bcf86cd799439013',
                name: 'Test Product',
                price: 99.99,
              },
              quantity: 2,
              price: 99.99,
            },
          ],
          totalAmount: 199.98,
          status: OrderStatus.PENDING,
          createdAt: new Date(),
        },
      ];

      mockReq.query = { page: '1', limit: '10' };

      (Order.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockOrders),
      });

      (Order.countDocuments as jest.Mock).mockResolvedValue(1);

      const result = await getOrders(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(true);
      expect(result.orders).toHaveLength(1);
      expect(result.statusCode).toBe(200);
    });

    it('should return empty array when no orders exist', async () => {
      mockReq.query = { page: '1', limit: '10' };

      (Order.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      (Order.countDocuments as jest.Mock).mockResolvedValue(0);

      const result = await getOrders(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(true);
      expect(result.orders).toHaveLength(0);
      expect(result.statusCode).toBe(200);
    });

    it('should handle pagination correctly', async () => {
      const mockOrders = Array(5)
        .fill(null)
        .map((_, i) => ({
          _id: `507f1f77bcf86cd79943901${i}`,
          customerId: '507f1f77bcf86cd799439011',
          products: [],
          totalAmount: 100,
          status: OrderStatus.PENDING,
        }));

      mockReq.query = { page: '2', limit: '5' };

      (Order.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockOrders),
      });

      (Order.countDocuments as jest.Mock).mockResolvedValue(15);

      const result = await getOrders(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(true);
      expect(result.pagination).toBeDefined();
      expect(result.pagination?.page).toBe(2);
      expect(result.pagination?.totalPages).toBe(3);
      expect(result.pagination?.hasNext).toBe(true);
      expect(result.pagination?.hasPrev).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      mockReq.query = { page: '1', limit: '10' };

      (Order.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      const result = await getOrders(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Internal server error');
      expect(result.statusCode).toBe(500);
    });
  });

  describe('getOrderById', () => {
    it('should get order by ID successfully', async () => {
      const mockOrder = {
        _id: '507f1f77bcf86cd799439012',
        customerId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        products: [
          {
            productId: {
              _id: '507f1f77bcf86cd799439013',
              name: 'Test Product',
              price: 99.99,
            },
            quantity: 2,
            price: 99.99,
          },
        ],
        totalAmount: 199.98,
        status: OrderStatus.PENDING,
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
        },
      };

      mockReq.query = { id: '507f1f77bcf86cd799439012' };

      (Order.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockOrder),
      });

      const result = await getOrderById(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(true);
      expect(result.order).toBeDefined();
      expect(result.statusCode).toBe(200);
    });

    it('should return error for invalid order ID format', async () => {
      mockReq.query = { id: 'invalid-id' };

      const result = await getOrderById(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid order ID');
      expect(result.statusCode).toBe(400);
    });

    it('should return error for non-existent order', async () => {
      mockReq.query = { id: '507f1f77bcf86cd799439012' };

      (Order.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      const result = await getOrderById(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Order not found');
      expect(result.statusCode).toBe(404);
    });

    it('should return error for unauthorized access to order', async () => {
      const mockOrder = {
        _id: '507f1f77bcf86cd799439012',
        customerId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439099'), // Different customer
        products: [],
        totalAmount: 100,
      };

      mockReq.query = { id: '507f1f77bcf86cd799439012' };

      (Order.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockOrder),
      });

      const result = await getOrderById(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Unauthorized');
      expect(result.statusCode).toBe(403);
    });
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const mockCart = {
        _id: '507f1f77bcf86cd799439012',
        customerId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        products: [
          {
            productId: {
              _id: '507f1f77bcf86cd799439013',
              name: 'Test Product',
              price: 99.99,
              stock: 10,
            },
            quantity: 2,
            selectedOptions: [],
          },
        ],
        totalAmount: 199.98,
        save: jest.fn(),
      };

      const mockAddress = {
        _id: '507f1f77bcf86cd799439014',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
      };

      const mockOrder = {
        _id: '507f1f77bcf86cd799439015',
        customerId: '507f1f77bcf86cd799439011',
        products: mockCart.products,
        totalAmount: 199.98,
        status: OrderStatus.PENDING,
        save: jest.fn(),
      };

      mockReq.body = {
        addressId: '507f1f77bcf86cd799439014',
        paymentMethod: 'card',
      };

      (Cart.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCart),
      });

      (Address.findById as jest.Mock).mockResolvedValue(mockAddress);
      (Order.create as jest.Mock).mockResolvedValue(mockOrder);
      (Product.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

      const result = await createOrder(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(true);
      expect(result.message).toContain('created successfully');
      expect(result.statusCode).toBe(201);
    });

    it('should return error for empty cart', async () => {
      const mockCart = {
        _id: '507f1f77bcf86cd799439012',
        customerId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        products: [],
        totalAmount: 0,
      };

      mockReq.body = {
        addressId: '507f1f77bcf86cd799439014',
        paymentMethod: 'card',
      };

      (Cart.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCart),
      });

      const result = await createOrder(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Cart is empty');
      expect(result.statusCode).toBe(400);
    });

    it('should return error for invalid address', async () => {
      const mockCart = {
        _id: '507f1f77bcf86cd799439012',
        customerId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        products: [
          {
            productId: {
              _id: '507f1f77bcf86cd799439013',
              price: 99.99,
              stock: 10,
            },
            quantity: 1,
          },
        ],
        totalAmount: 99.99,
      };

      mockReq.body = {
        addressId: '507f1f77bcf86cd799439014',
        paymentMethod: 'card',
      };

      (Cart.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCart),
      });

      (Address.findById as jest.Mock).mockResolvedValue(null);

      const result = await createOrder(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Address not found');
      expect(result.statusCode).toBe(404);
    });

    it('should return error for missing required fields', async () => {
      mockReq.body = {
        paymentMethod: 'card',
      };

      const result = await createOrder(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
    });

    it('should return error for insufficient stock', async () => {
      const mockCart = {
        _id: '507f1f77bcf86cd799439012',
        customerId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        products: [
          {
            productId: {
              _id: '507f1f77bcf86cd799439013',
              name: 'Test Product',
              price: 99.99,
              stock: 1,
            },
            quantity: 5, // More than available stock
          },
        ],
        totalAmount: 499.95,
      };

      const mockAddress = {
        _id: '507f1f77bcf86cd799439014',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
      };

      mockReq.body = {
        addressId: '507f1f77bcf86cd799439014',
        paymentMethod: 'card',
      };

      (Cart.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCart),
      });

      (Address.findById as jest.Mock).mockResolvedValue(mockAddress);

      const result = await createOrder(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Insufficient stock');
      expect(result.statusCode).toBe(400);
    });
  });
});
