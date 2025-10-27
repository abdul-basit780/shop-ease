import {
  buildCategoryResponse,
  buildPublicCategoryResponse,
  validateCategoryRequest,
} from '../../src/lib/utils/category';

describe('category utils', () => {
  describe('buildCategoryResponse', () => {
    it('should build category response correctly', () => {
      const mockCategory = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        parentId: { toString: () => '507f1f77bcf86cd799439012' },
        deletedAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      } as any;

      const response = buildCategoryResponse(mockCategory);

      expect(response).toEqual({
        id: '507f1f77bcf86cd799439011',
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        parentId: '507f1f77bcf86cd799439012',
        deletedAt: null,
        createdAt: mockCategory.createdAt,
        updatedAt: mockCategory.updatedAt,
      });
    });

    it('should handle category without parentId', () => {
      const mockCategory = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        name: 'Root Category',
        description: 'Top level category',
        parentId: null,
        deletedAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      } as any;

      const response = buildCategoryResponse(mockCategory);

      expect(response.parentId).toBeNull();
    });

    it('should include deletedAt timestamp', () => {
      const deletedDate = new Date('2024-01-15');
      const mockCategory = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        name: 'Deleted Category',
        description: 'This was deleted',
        parentId: null,
        deletedAt: deletedDate,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      } as any;

      const response = buildCategoryResponse(mockCategory);

      expect(response.deletedAt).toBe(deletedDate);
    });
  });

  describe('buildPublicCategoryResponse', () => {
    it('should build public category response correctly', () => {
      const mockCategory = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        parentId: { toString: () => '507f1f77bcf86cd799439012' },
        deletedAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      } as any;

      const response = buildPublicCategoryResponse(mockCategory);

      expect(response).toEqual({
        id: '507f1f77bcf86cd799439011',
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        parentId: '507f1f77bcf86cd799439012',
        createdAt: mockCategory.createdAt,
        updatedAt: mockCategory.updatedAt,
      });
    });

    it('should not include deletedAt field', () => {
      const mockCategory = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        name: 'Electronics',
        description: 'Electronic devices',
        parentId: null,
        deletedAt: new Date(),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      } as any;

      const response = buildPublicCategoryResponse(mockCategory);

      expect(response).not.toHaveProperty('deletedAt');
    });

    it('should handle null parentId', () => {
      const mockCategory = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        name: 'Root Category',
        description: 'Top level',
        parentId: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      } as any;

      const response = buildPublicCategoryResponse(mockCategory);

      expect(response.parentId).toBeNull();
    });
  });

  describe('validateCategoryRequest', () => {
    it('should return empty array for valid category data', () => {
      const data = {
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        parentId: '507f1f77bcf86cd799439011',
      };

      const errors = validateCategoryRequest(data);

      expect(errors).toEqual([]);
    });

    it('should return empty array when parentId is null', () => {
      const data = {
        name: 'Electronics',
        description: 'Electronic devices',
        parentId: null,
      };

      const errors = validateCategoryRequest(data);

      expect(errors).toEqual([]);
    });

    it('should return empty array when parentId is undefined', () => {
      const data = {
        name: 'Electronics',
        description: 'Electronic devices',
      };

      const errors = validateCategoryRequest(data);

      expect(errors).toEqual([]);
    });

    describe('name validation', () => {
      it('should return error for missing name', () => {
        const data = {
          name: '',
          description: 'Description',
        };

        const errors = validateCategoryRequest(data);

        expect(errors).toContain('Name is required');
      });

      it('should return error for non-string name', () => {
        const data = {
          name: 123 as any,
          description: 'Description',
        };

        const errors = validateCategoryRequest(data);

        expect(errors).toContain('Name is required');
      });

      it('should return error for name exceeding 100 characters', () => {
        const data = {
          name: 'a'.repeat(101),
          description: 'Description',
        };

        const errors = validateCategoryRequest(data);

        expect(errors).toContain('Name must be less than 100 characters');
      });

      it('should accept name with exactly 100 characters', () => {
        const data = {
          name: 'a'.repeat(100),
          description: 'Description',
        };

        const errors = validateCategoryRequest(data);

        expect(errors).not.toContain('Name must be less than 100 characters');
      });

      it('should trim whitespace from name', () => {
        const data = {
          name: '   Electronics   ',
          description: 'Description',
        };

        const errors = validateCategoryRequest(data);

        expect(errors).toEqual([]);
      });
    });

    describe('description validation', () => {
      it('should return error for missing description', () => {
        const data = {
          name: 'Electronics',
          description: '',
        };

        const errors = validateCategoryRequest(data);

        expect(errors).toContain('Description is required');
      });

      it('should return error for non-string description', () => {
        const data = {
          name: 'Electronics',
          description: 123 as any,
        };

        const errors = validateCategoryRequest(data);

        expect(errors).toContain('Description is required');
      });

      it('should return error for description exceeding 500 characters', () => {
        const data = {
          name: 'Electronics',
          description: 'a'.repeat(501),
        };

        const errors = validateCategoryRequest(data);

        expect(errors).toContain('Description must be less than 500 characters');
      });

      it('should accept description with exactly 500 characters', () => {
        const data = {
          name: 'Electronics',
          description: 'a'.repeat(500),
        };

        const errors = validateCategoryRequest(data);

        expect(errors).not.toContain('Description must be less than 500 characters');
      });

      it('should trim whitespace from description', () => {
        const data = {
          name: 'Electronics',
          description: '   Valid description   ',
        };

        const errors = validateCategoryRequest(data);

        expect(errors).toEqual([]);
      });
    });

    describe('parentId validation', () => {
      it('should return error for non-string parentId', () => {
        const data = {
          name: 'Electronics',
          description: 'Description',
          parentId: 123 as any,
        };

        const errors = validateCategoryRequest(data);

        expect(errors).toContain('Parent ID must be a string or null');
      });

      it('should accept string parentId', () => {
        const data = {
          name: 'Electronics',
          description: 'Description',
          parentId: '507f1f77bcf86cd799439011',
        };

        const errors = validateCategoryRequest(data);

        expect(errors).toEqual([]);
      });

      it('should accept null parentId', () => {
        const data = {
          name: 'Electronics',
          description: 'Description',
          parentId: null,
        };

        const errors = validateCategoryRequest(data);

        expect(errors).toEqual([]);
      });
    });

    it('should return multiple errors for completely invalid data', () => {
      const data = {
        name: '',
        description: '',
        parentId: 123 as any,
      };

      const errors = validateCategoryRequest(data);

      expect(errors.length).toBeGreaterThanOrEqual(3);
      expect(errors).toContain('Name is required');
      expect(errors).toContain('Description is required');
      expect(errors).toContain('Parent ID must be a string or null');
    });
  });
});
