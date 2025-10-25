import { NextApiResponse } from 'next';
import { index, show, store, update, destroy } from '../../src/lib/controllers/product';
import { Product } from '../../src/lib/models/Product';
import { Category } from '../../src/lib/models/Category';
import { AuthenticatedRequest } from '../../src/lib/middleware/auth';
import * as productUtils from '../../src/lib/utils/product';

// Mock dependencies
jest.mock('../../src/lib/models/Product');
jest.mock('../../src/lib/models/Category');
jest.mock('../../src/lib/utils/product', () => ({
  ...jest.requireActual('../../src/lib/utils/product'),
  validateProductRequest: jest.fn(),
  buildProductResponse: jest.fn(),
  validateImageFile: jest.fn(),
}));

describe('Admin Product Controller API Tests', () => {
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
        email: 'admin@example.com',
        role: 'admin',
        name: 'Admin User',
      },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('index - Get all products', () => {
    it('should get all products successfully', async () => {
      const mockProducts = [
        {
          _id: '507f1f77bcf86cd799439012',
          name: 'Test Product 1',
          description: 'Description 1',
          price: 99.99,
          stock: 10,
          categoryId: {
            _id: '507f1f77bcf86cd799439013',
            name: 'Electronics',
          },
          isActive: true,
        },
        {
          _id: '507f1f77bcf86cd799439014',
          name: 'Test Product 2',
          description: 'Description 2',
          price: 149.99,
          stock: 5,
          categoryId: {
            _id: '507f1f77bcf86cd799439013',
            name: 'Electronics',
          },
          isActive: true,
        },
      ];

      mockReq.query = { page: '1', limit: '10' };

      (Product.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProducts),
      });

      (Product.countDocuments as jest.Mock).mockResolvedValue(2);

      const result = await index(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(true);
      expect(result.products).toHaveLength(2);
      expect(result.statusCode).toBe(200);
    });

    it('should filter products by category', async () => {
      const mockProducts = [
        {
          _id: '507f1f77bcf86cd799439012',
          name: 'Test Product',
          categoryId: {
            _id: '507f1f77bcf86cd799439013',
            name: 'Electronics',
          },
        },
      ];

      mockReq.query = { page: '1', limit: '10', categoryId: '507f1f77bcf86cd799439013' };

      (Product.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProducts),
      });

      (Product.countDocuments as jest.Mock).mockResolvedValue(1);

      const result = await index(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(true);
      expect(result.products).toHaveLength(1);
    });

    it('should search products by name', async () => {
      const mockProducts = [
        {
          _id: '507f1f77bcf86cd799439012',
          name: 'Laptop Computer',
        },
      ];

      mockReq.query = { page: '1', limit: '10', search: 'laptop' };

      (Product.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProducts),
      });

      (Product.countDocuments as jest.Mock).mockResolvedValue(1);

      const result = await index(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(true);
      expect(result.products).toHaveLength(1);
    });

    it('should handle database errors gracefully', async () => {
      mockReq.query = { page: '1', limit: '10' };

      (Product.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      const result = await index(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Internal server error');
      expect(result.statusCode).toBe(500);
    });
  });

  describe('show - Get product by ID', () => {
    it('should get product by ID successfully', async () => {
      const mockProduct = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        stock: 10,
        categoryId: {
          _id: '507f1f77bcf86cd799439013',
          name: 'Electronics',
        },
        isActive: true,
        images: ['https://example.com/image.jpg'],
      };

      mockReq.query = { id: '507f1f77bcf86cd799439012' };

      (Product.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProduct),
      });

      (productUtils.buildProductResponse as jest.Mock).mockReturnValue({
        id: '507f1f77bcf86cd799439012',
        name: 'Test Product',
        price: 99.99,
      });

      const result = await show(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(true);
      expect(result.product).toBeDefined();
      expect(result.statusCode).toBe(200);
    });

    it('should return error for invalid product ID', async () => {
      mockReq.query = { id: 'invalid-id' };

      const result = await show(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid product ID');
      expect(result.statusCode).toBe(400);
    });

    it('should return error for non-existent product', async () => {
      mockReq.query = { id: '507f1f77bcf86cd799439012' };

      (Product.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      const result = await show(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Product not found');
      expect(result.statusCode).toBe(404);
    });
  });

  describe('store - Create product', () => {
    it('should create product successfully', async () => {
      const mockCategory = {
        _id: '507f1f77bcf86cd799439013',
        name: 'Electronics',
      };

      const mockProduct = {
        _id: '507f1f77bcf86cd799439012',
        name: 'New Product',
        description: 'New Description',
        price: 99.99,
        stock: 10,
        categoryId: '507f1f77bcf86cd799439013',
        isActive: true,
        save: jest.fn().mockResolvedValue(true),
      };

      mockReq.body = {
        name: 'New Product',
        description: 'New Description',
        price: 99.99,
        stock: 10,
        categoryId: '507f1f77bcf86cd799439013',
      };

      (productUtils.validateProductRequest as jest.Mock).mockReturnValue(null);
      (Category.findById as jest.Mock).mockResolvedValue(mockCategory);
      (Product.create as jest.Mock).mockResolvedValue(mockProduct);
      (productUtils.buildProductResponse as jest.Mock).mockReturnValue({
        id: '507f1f77bcf86cd799439012',
        name: 'New Product',
      });

      const result = await store(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(true);
      expect(result.message).toContain('created successfully');
      expect(result.statusCode).toBe(201);
    });

    it('should return validation error for invalid data', async () => {
      mockReq.body = {
        name: '',
        price: -10,
      };

      (productUtils.validateProductRequest as jest.Mock).mockReturnValue('Name is required');

      const result = await store(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
    });

    it('should return error for invalid category', async () => {
      mockReq.body = {
        name: 'New Product',
        description: 'New Description',
        price: 99.99,
        stock: 10,
        categoryId: '507f1f77bcf86cd799439013',
      };

      (productUtils.validateProductRequest as jest.Mock).mockReturnValue(null);
      (Category.findById as jest.Mock).mockResolvedValue(null);

      const result = await store(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Category not found');
      expect(result.statusCode).toBe(404);
    });

    it('should return error for duplicate product name', async () => {
      const mockCategory = {
        _id: '507f1f77bcf86cd799439013',
        name: 'Electronics',
      };

      mockReq.body = {
        name: 'Existing Product',
        description: 'Description',
        price: 99.99,
        stock: 10,
        categoryId: '507f1f77bcf86cd799439013',
      };

      (productUtils.validateProductRequest as jest.Mock).mockReturnValue(null);
      (Category.findById as jest.Mock).mockResolvedValue(mockCategory);
      (Product.create as jest.Mock).mockRejectedValue({ code: 11000 });

      const result = await store(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toContain('already exists');
      expect(result.statusCode).toBe(409);
    });
  });

  describe('update - Update product', () => {
    it('should update product successfully', async () => {
      const mockProduct = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Product',
        price: 99.99,
        stock: 10,
        categoryId: '507f1f77bcf86cd799439013',
        save: jest.fn().mockResolvedValue(true),
      };

      const mockCategory = {
        _id: '507f1f77bcf86cd799439013',
        name: 'Electronics',
      };

      mockReq.query = { id: '507f1f77bcf86cd799439012' };
      mockReq.body = {
        name: 'Updated Product',
        price: 149.99,
      };

      (Product.findById as jest.Mock).mockResolvedValue(mockProduct);
      (productUtils.validateProductRequest as jest.Mock).mockReturnValue(null);
      (Category.findById as jest.Mock).mockResolvedValue(mockCategory);
      (productUtils.buildProductResponse as jest.Mock).mockReturnValue({
        id: '507f1f77bcf86cd799439012',
        name: 'Updated Product',
      });

      const result = await update(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(true);
      expect(result.message).toContain('updated successfully');
      expect(result.statusCode).toBe(200);
    });

    it('should return error for invalid product ID', async () => {
      mockReq.query = { id: 'invalid-id' };
      mockReq.body = { name: 'Updated Name' };

      const result = await update(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid product ID');
      expect(result.statusCode).toBe(400);
    });

    it('should return error for non-existent product', async () => {
      mockReq.query = { id: '507f1f77bcf86cd799439012' };
      mockReq.body = { name: 'Updated Name' };

      (Product.findById as jest.Mock).mockResolvedValue(null);

      const result = await update(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Product not found');
      expect(result.statusCode).toBe(404);
    });

    it('should return validation error for invalid update data', async () => {
      const mockProduct = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Product',
      };

      mockReq.query = { id: '507f1f77bcf86cd799439012' };
      mockReq.body = {
        price: -50, // Invalid price
      };

      (Product.findById as jest.Mock).mockResolvedValue(mockProduct);
      (productUtils.validateProductRequest as jest.Mock).mockReturnValue('Price must be positive');

      const result = await update(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
    });
  });

  describe('destroy - Delete product', () => {
    it('should delete product successfully', async () => {
      const mockProduct = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Product',
        images: [],
      };

      mockReq.query = { id: '507f1f77bcf86cd799439012' };

      (Product.findById as jest.Mock).mockResolvedValue(mockProduct);
      (Product.findByIdAndDelete as jest.Mock).mockResolvedValue(mockProduct);

      const result = await destroy(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(true);
      expect(result.message).toContain('deleted successfully');
      expect(result.statusCode).toBe(200);
    });

    it('should return error for invalid product ID', async () => {
      mockReq.query = { id: 'invalid-id' };

      const result = await destroy(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid product ID');
      expect(result.statusCode).toBe(400);
    });

    it('should return error for non-existent product', async () => {
      mockReq.query = { id: '507f1f77bcf86cd799439012' };

      (Product.findById as jest.Mock).mockResolvedValue(null);

      const result = await destroy(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Product not found');
      expect(result.statusCode).toBe(404);
    });

    it('should handle database errors during deletion', async () => {
      const mockProduct = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Product',
        images: [],
      };

      mockReq.query = { id: '507f1f77bcf86cd799439012' };

      (Product.findById as jest.Mock).mockResolvedValue(mockProduct);
      (Product.findByIdAndDelete as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await destroy(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Internal server error');
      expect(result.statusCode).toBe(500);
    });
  });
});
