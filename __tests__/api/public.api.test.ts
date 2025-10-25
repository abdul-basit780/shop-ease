import { NextApiRequest, NextApiResponse } from 'next';
import { index as getProducts, show as getProduct } from '../../src/lib/controllers/publicProduct';
import { index as getCategories, show as getCategory } from '../../src/lib/controllers/publicCategory';
import { getTrending, getPopular, getSimilar } from '../../src/lib/controllers/publicRecommendation';
import { Product } from '../../src/lib/models/Product';
import { Category } from '../../src/lib/models/Category';

// Mock dependencies
jest.mock('../../src/lib/models/Product');
jest.mock('../../src/lib/models/Category');

describe('Public API Tests', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      body: {},
      query: {},
      headers: {},
      method: 'GET',
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('Public Products', () => {
    describe('getProducts', () => {
      it('should get all active products successfully', async () => {
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
            images: ['https://example.com/image1.jpg'],
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
            images: ['https://example.com/image2.jpg'],
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

        const result = await getProducts(mockReq as NextApiRequest, mockRes as NextApiResponse);

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
            isActive: true,
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

        const result = await getProducts(mockReq as NextApiRequest, mockRes as NextApiResponse);

        expect(result.success).toBe(true);
        expect(result.products).toHaveLength(1);
      });

      it('should filter products by price range', async () => {
        const mockProducts = [
          {
            _id: '507f1f77bcf86cd799439012',
            name: 'Affordable Product',
            price: 50,
            isActive: true,
          },
        ];

        mockReq.query = { page: '1', limit: '10', minPrice: '0', maxPrice: '100' };

        (Product.find as jest.Mock).mockReturnValue({
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockProducts),
        });

        (Product.countDocuments as jest.Mock).mockResolvedValue(1);

        const result = await getProducts(mockReq as NextApiRequest, mockRes as NextApiResponse);

        expect(result.success).toBe(true);
        expect(result.products).toHaveLength(1);
      });

      it('should search products by name', async () => {
        const mockProducts = [
          {
            _id: '507f1f77bcf86cd799439012',
            name: 'Laptop Computer',
            isActive: true,
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

        const result = await getProducts(mockReq as NextApiRequest, mockRes as NextApiResponse);

        expect(result.success).toBe(true);
        expect(result.products).toHaveLength(1);
      });

      it('should return empty array when no products found', async () => {
        mockReq.query = { page: '1', limit: '10' };

        (Product.find as jest.Mock).mockReturnValue({
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([]),
        });

        (Product.countDocuments as jest.Mock).mockResolvedValue(0);

        const result = await getProducts(mockReq as NextApiRequest, mockRes as NextApiResponse);

        expect(result.success).toBe(true);
        expect(result.products).toHaveLength(0);
      });

      it('should handle pagination correctly', async () => {
        const mockProducts = Array(10)
          .fill(null)
          .map((_, i) => ({
            _id: `507f1f77bcf86cd79943901${i}`,
            name: `Product ${i}`,
            isActive: true,
          }));

        mockReq.query = { page: '2', limit: '10' };

        (Product.find as jest.Mock).mockReturnValue({
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockProducts),
        });

        (Product.countDocuments as jest.Mock).mockResolvedValue(25);

        const result = await getProducts(mockReq as NextApiRequest, mockRes as NextApiResponse);

        expect(result.success).toBe(true);
        expect(result.pagination).toBeDefined();
        expect(result.pagination?.page).toBe(2);
        expect(result.pagination?.totalPages).toBe(3);
        expect(result.pagination?.hasNext).toBe(true);
        expect(result.pagination?.hasPrev).toBe(true);
      });
    });

    describe('getProduct', () => {
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

        const result = await getProduct(mockReq as NextApiRequest, mockRes as NextApiResponse);

        expect(result.success).toBe(true);
        expect(result.product).toBeDefined();
        expect(result.statusCode).toBe(200);
      });

      it('should return error for invalid product ID', async () => {
        mockReq.query = { id: 'invalid-id' };

        const result = await getProduct(mockReq as NextApiRequest, mockRes as NextApiResponse);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Invalid product ID');
        expect(result.statusCode).toBe(400);
      });

      it('should return error for non-existent product', async () => {
        mockReq.query = { id: '507f1f77bcf86cd799439012' };

        (Product.findById as jest.Mock).mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        });

        const result = await getProduct(mockReq as NextApiRequest, mockRes as NextApiResponse);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Product not found');
        expect(result.statusCode).toBe(404);
      });

      it('should return error for inactive product', async () => {
        const mockProduct = {
          _id: '507f1f77bcf86cd799439012',
          name: 'Test Product',
          isActive: false,
        };

        mockReq.query = { id: '507f1f77bcf86cd799439012' };

        (Product.findById as jest.Mock).mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockProduct),
        });

        const result = await getProduct(mockReq as NextApiRequest, mockRes as NextApiResponse);

        expect(result.success).toBe(false);
        expect(result.message).toContain('not available');
        expect(result.statusCode).toBe(404);
      });
    });
  });

  describe('Public Categories', () => {
    describe('getCategories', () => {
      it('should get all active categories successfully', async () => {
        const mockCategories = [
          {
            _id: '507f1f77bcf86cd799439012',
            name: 'Electronics',
            description: 'Electronic items',
            isActive: true,
          },
          {
            _id: '507f1f77bcf86cd799439013',
            name: 'Clothing',
            description: 'Apparel',
            isActive: true,
          },
        ];

        mockReq.query = { page: '1', limit: '10' };

        (Category.find as jest.Mock).mockReturnValue({
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockCategories),
        });

        (Category.countDocuments as jest.Mock).mockResolvedValue(2);

        const result = await getCategories(mockReq as NextApiRequest, mockRes as NextApiResponse);

        expect(result.success).toBe(true);
        expect(result.categories).toHaveLength(2);
        expect(result.statusCode).toBe(200);
      });

      it('should return empty array when no categories found', async () => {
        mockReq.query = { page: '1', limit: '10' };

        (Category.find as jest.Mock).mockReturnValue({
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([]),
        });

        (Category.countDocuments as jest.Mock).mockResolvedValue(0);

        const result = await getCategories(mockReq as NextApiRequest, mockRes as NextApiResponse);

        expect(result.success).toBe(true);
        expect(result.categories).toHaveLength(0);
      });

      it('should handle database errors gracefully', async () => {
        mockReq.query = { page: '1', limit: '10' };

        (Category.find as jest.Mock).mockReturnValue({
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          exec: jest.fn().mockRejectedValue(new Error('Database error')),
        });

        const result = await getCategories(mockReq as NextApiRequest, mockRes as NextApiResponse);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Internal server error');
        expect(result.statusCode).toBe(500);
      });
    });

    describe('getCategory', () => {
      it('should get category by ID successfully', async () => {
        const mockCategory = {
          _id: '507f1f77bcf86cd799439012',
          name: 'Electronics',
          description: 'Electronic items',
          isActive: true,
        };

        mockReq.query = { id: '507f1f77bcf86cd799439012' };

        (Category.findById as jest.Mock).mockResolvedValue(mockCategory);

        const result = await getCategory(mockReq as NextApiRequest, mockRes as NextApiResponse);

        expect(result.success).toBe(true);
        expect(result.category).toBeDefined();
        expect(result.statusCode).toBe(200);
      });

      it('should return error for invalid category ID', async () => {
        mockReq.query = { id: 'invalid-id' };

        const result = await getCategory(mockReq as NextApiRequest, mockRes as NextApiResponse);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Invalid category ID');
        expect(result.statusCode).toBe(400);
      });

      it('should return error for non-existent category', async () => {
        mockReq.query = { id: '507f1f77bcf86cd799439012' };

        (Category.findById as jest.Mock).mockResolvedValue(null);

        const result = await getCategory(mockReq as NextApiRequest, mockRes as NextApiResponse);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Category not found');
        expect(result.statusCode).toBe(404);
      });

      it('should return error for inactive category', async () => {
        const mockCategory = {
          _id: '507f1f77bcf86cd799439012',
          name: 'Electronics',
          isActive: false,
        };

        mockReq.query = { id: '507f1f77bcf86cd799439012' };

        (Category.findById as jest.Mock).mockResolvedValue(mockCategory);

        const result = await getCategory(mockReq as NextApiRequest, mockRes as NextApiResponse);

        expect(result.success).toBe(false);
        expect(result.message).toContain('not available');
        expect(result.statusCode).toBe(404);
      });
    });
  });

  describe('Public Recommendations', () => {
    describe('getTrending', () => {
      it('should get trending products successfully', async () => {
        const mockProducts = [
          {
            _id: '507f1f77bcf86cd799439012',
            name: 'Trending Product 1',
            price: 99.99,
            isActive: true,
          },
          {
            _id: '507f1f77bcf86cd799439013',
            name: 'Trending Product 2',
            price: 149.99,
            isActive: true,
          },
        ];

        mockReq.query = { limit: '10' };

        (Product.find as jest.Mock).mockReturnValue({
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockProducts),
        });

        const result = await getTrending(mockReq as NextApiRequest, mockRes as NextApiResponse);

        expect(result.success).toBe(true);
        expect(result.products).toHaveLength(2);
        expect(result.statusCode).toBe(200);
      });

      it('should limit trending products to specified count', async () => {
        const mockProducts = Array(5)
          .fill(null)
          .map((_, i) => ({
            _id: `507f1f77bcf86cd79943901${i}`,
            name: `Product ${i}`,
            isActive: true,
          }));

        mockReq.query = { limit: '5' };

        (Product.find as jest.Mock).mockReturnValue({
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockProducts),
        });

        const result = await getTrending(mockReq as NextApiRequest, mockRes as NextApiResponse);

        expect(result.success).toBe(true);
        expect(result.products).toHaveLength(5);
      });
    });

    describe('getPopular', () => {
      it('should get popular products successfully', async () => {
        const mockProducts = [
          {
            _id: '507f1f77bcf86cd799439012',
            name: 'Popular Product 1',
            price: 99.99,
            isActive: true,
          },
          {
            _id: '507f1f77bcf86cd799439013',
            name: 'Popular Product 2',
            price: 149.99,
            isActive: true,
          },
        ];

        mockReq.query = { limit: '10' };

        (Product.find as jest.Mock).mockReturnValue({
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockProducts),
        });

        const result = await getPopular(mockReq as NextApiRequest, mockRes as NextApiResponse);

        expect(result.success).toBe(true);
        expect(result.products).toHaveLength(2);
        expect(result.statusCode).toBe(200);
      });
    });

    describe('getSimilar', () => {
      it('should get similar products successfully', async () => {
        const mockProduct = {
          _id: '507f1f77bcf86cd799439012',
          name: 'Original Product',
          categoryId: {
            _id: '507f1f77bcf86cd799439013',
            name: 'Electronics',
          },
          isActive: true,
        };

        const mockSimilarProducts = [
          {
            _id: '507f1f77bcf86cd799439014',
            name: 'Similar Product 1',
            categoryId: '507f1f77bcf86cd799439013',
            isActive: true,
          },
          {
            _id: '507f1f77bcf86cd799439015',
            name: 'Similar Product 2',
            categoryId: '507f1f77bcf86cd799439013',
            isActive: true,
          },
        ];

        mockReq.query = { id: '507f1f77bcf86cd799439012', limit: '10' };

        (Product.findById as jest.Mock).mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockProduct),
        });

        (Product.find as jest.Mock).mockReturnValue({
          populate: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockSimilarProducts),
        });

        const result = await getSimilar(mockReq as NextApiRequest, mockRes as NextApiResponse);

        expect(result.success).toBe(true);
        expect(result.products).toHaveLength(2);
        expect(result.statusCode).toBe(200);
      });

      it('should return error for invalid product ID', async () => {
        mockReq.query = { id: 'invalid-id', limit: '10' };

        const result = await getSimilar(mockReq as NextApiRequest, mockRes as NextApiResponse);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Invalid product ID');
        expect(result.statusCode).toBe(400);
      });

      it('should return error for non-existent product', async () => {
        mockReq.query = { id: '507f1f77bcf86cd799439012', limit: '10' };

        (Product.findById as jest.Mock).mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        });

        const result = await getSimilar(mockReq as NextApiRequest, mockRes as NextApiResponse);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Product not found');
        expect(result.statusCode).toBe(404);
      });
    });
  });
});
