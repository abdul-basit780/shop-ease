import {
  buildPaginationParams,
  buildMongoFilter,
  buildMongoSort,
  calculatePagination,
} from '../../src/lib/utils/common';

describe('common utils', () => {
  describe('buildPaginationParams', () => {
    it('should build pagination params with default values', () => {
      const query = {};

      const result = buildPaginationParams(query);

      expect(result).toEqual({
        page: '1',
        limit: '10',
        search: '',
        sortBy: 'name',
        sortOrder: 'asc',
        includeDeleted: false,
      });
    });

    it('should use provided query values', () => {
      const query = {
        page: '2',
        limit: '20',
        search: 'test',
        sortBy: 'price',
        sortOrder: 'desc',
        includeDeleted: 'true',
      };

      const result = buildPaginationParams(query);

      expect(result).toEqual({
        page: '2',
        limit: '20',
        search: 'test',
        sortBy: 'price',
        sortOrder: 'desc',
        includeDeleted: true,
      });
    });

    it('should parse includeDeleted as false for non-true values', () => {
      const query = {
        includeDeleted: 'false',
      };

      const result = buildPaginationParams(query);

      expect(result.includeDeleted).toBe(false);
    });

    it('should handle missing optional fields', () => {
      const query = {
        page: '3',
      };

      const result = buildPaginationParams(query);

      expect(result.page).toBe('3');
      expect(result.limit).toBe('10');
      expect(result.search).toBe('');
    });
  });

  describe('buildMongoFilter', () => {
    it('should filter out soft-deleted records by default', () => {
      const params = {
        page: '1',
        limit: '10',
        includeDeleted: false,
      };

      const filter = buildMongoFilter(params);

      expect(filter.deletedAt).toBeNull();
    });

    it('should not filter deleted records when includeDeleted is true', () => {
      const params = {
        page: '1',
        limit: '10',
        includeDeleted: true,
      };

      const filter = buildMongoFilter(params);

      expect(filter.deletedAt).toBeUndefined();
    });

    it('should add search filter with regex', () => {
      const params = {
        page: '1',
        limit: '10',
        search: 'electronics',
        includeDeleted: false,
      };

      const filter = buildMongoFilter(params);

      expect(filter.$or).toBeDefined();
      expect(filter.$or).toEqual([
        { name: { $regex: 'electronics', $options: 'i' } },
      ]);
    });

    it('should not add search filter when search is empty', () => {
      const params = {
        page: '1',
        limit: '10',
        search: '',
        includeDeleted: false,
      };

      const filter = buildMongoFilter(params);

      expect(filter.$or).toBeUndefined();
    });

    it('should combine deletedAt and search filters', () => {
      const params = {
        page: '1',
        limit: '10',
        search: 'test',
        includeDeleted: false,
      };

      const filter = buildMongoFilter(params);

      expect(filter.deletedAt).toBeNull();
      expect(filter.$or).toBeDefined();
    });
  });

  describe('buildMongoSort', () => {
    it('should build ascending sort by default', () => {
      const params = {
        page: '1',
        limit: '10',
        sortBy: 'name',
        sortOrder: 'asc',
      };

      const sort = buildMongoSort(params);

      expect(sort).toEqual({ name: 1 });
    });

    it('should build descending sort', () => {
      const params = {
        page: '1',
        limit: '10',
        sortBy: 'price',
        sortOrder: 'desc',
      };

      const sort = buildMongoSort(params);

      expect(sort).toEqual({ price: -1 });
    });

    it('should use default sortBy when not provided', () => {
      const params = {
        page: '1',
        limit: '10',
        sortOrder: 'asc',
      };

      const sort = buildMongoSort(params);

      expect(sort).toEqual({ name: 1 });
    });

    it('should handle different sort fields', () => {
      const params = {
        page: '1',
        limit: '10',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      const sort = buildMongoSort(params);

      expect(sort).toEqual({ createdAt: -1 });
    });

    it('should default to ascending for invalid sortOrder', () => {
      const params = {
        page: '1',
        limit: '10',
        sortBy: 'name',
        sortOrder: 'invalid',
      };

      const sort = buildMongoSort(params);

      expect(sort).toEqual({ name: 1 });
    });
  });

  describe('calculatePagination', () => {
    it('should calculate pagination for first page', () => {
      const result = calculatePagination('1', '10', 25);

      expect(result).toEqual({
        pageNum: 1,
        limitNum: 10,
        skip: 0,
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
        },
      });
    });

    it('should calculate pagination for middle page', () => {
      const result = calculatePagination('2', '10', 25);

      expect(result).toEqual({
        pageNum: 2,
        limitNum: 10,
        skip: 10,
        pagination: {
          page: 2,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: true,
        },
      });
    });

    it('should calculate pagination for last page', () => {
      const result = calculatePagination('3', '10', 25);

      expect(result).toEqual({
        pageNum: 3,
        limitNum: 10,
        skip: 20,
        pagination: {
          page: 3,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNext: false,
          hasPrev: true,
        },
      });
    });

    it('should handle exact page division', () => {
      const result = calculatePagination('1', '10', 20);

      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.hasNext).toBe(true);
    });

    it('should handle single page', () => {
      const result = calculatePagination('1', '10', 5);

      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(false);
    });

    it('should handle empty results', () => {
      const result = calculatePagination('1', '10', 0);

      expect(result.pagination.totalPages).toBe(0);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(false);
    });

    it('should calculate skip correctly', () => {
      expect(calculatePagination('1', '10', 100).skip).toBe(0);
      expect(calculatePagination('2', '10', 100).skip).toBe(10);
      expect(calculatePagination('5', '20', 100).skip).toBe(80);
    });

    it('should handle large page numbers', () => {
      const result = calculatePagination('10', '5', 100);

      expect(result.skip).toBe(45);
      expect(result.pagination.totalPages).toBe(20);
    });

    it('should round up total pages', () => {
      const result = calculatePagination('1', '10', 23);

      expect(result.pagination.totalPages).toBe(3);
    });
  });
});
