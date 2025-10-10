// lib/utils/common.ts
export interface PaginationParams {
  page: string;
  limit: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  includeDeleted?: boolean; // Add option to include deleted records
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Pagination utilities
export const buildPaginationParams = (query: any): PaginationParams => {
  return {
    page: query.page || "1",
    limit: query.limit || "10",
    search: query.search || "",
    sortBy: query.sortBy || "name",
    sortOrder: query.sortOrder || "asc",
    includeDeleted: query.includeDeleted === "true", // Parse from query string
  };
};

export const buildMongoFilter = (params: PaginationParams): any => {
  const filter: any = {};

  // Filter out soft-deleted records by default
  if (!params.includeDeleted) {
    filter.deletedAt = null;
  }

  if (params.search) {
    filter.$or = [{ name: { $regex: params.search, $options: "i" } }];
  }

  return filter;
};

export const buildMongoSort = (params: PaginationParams): any => {
  const sort: any = {};
  sort[params.sortBy || "name"] = params.sortOrder === "desc" ? -1 : 1;
  return sort;
};

export const calculatePagination = (
  page: string,
  limit: string,
  total: number
): {
  pageNum: number;
  limitNum: number;
  skip: number;
  pagination: PaginationResult;
} => {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const totalPages = Math.ceil(total / limitNum);
  const hasNext = pageNum < totalPages;
  const hasPrev = pageNum > 1;

  return {
    pageNum,
    limitNum,
    skip,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNext,
      hasPrev,
    },
  };
};
