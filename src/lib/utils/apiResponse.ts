import { NextApiRequest, NextApiResponse } from "next";

/** ---- Shared types ---- */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: string[];
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T> {
  meta: PaginationMeta;
}

/** ---- Success / Error helpers ---- */

export const sendSuccess = <T>(
  res: NextApiResponse,
  data: T,
  message = "Success",
  statusCode = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
};

export const sendError = (
  res: NextApiResponse,
  message: string,
  statusCode = 500,
  errors?: string[]
): void => {
  const response: ApiResponse<unknown> = {
    success: false,
    message,
    error: message,
    errors,
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
};

export const sendValidationError = (
  res: NextApiResponse,
  errors: string[],
  message = "Validation failed"
): void => {
  sendError(res, message, 400, errors);
};

export const sendUnauthorized = (
  res: NextApiResponse,
  message = "Unauthorized access"
): void => {
  sendError(res, message, 401);
};

export const sendForbidden = (
  res: NextApiResponse,
  message = "Forbidden access"
): void => {
  sendError(res, message, 403);
};

export const sendNotFound = (
  res: NextApiResponse,
  message = "Resource not found"
): void => {
  sendError(res, message, 404);
};

export const sendConflict = (
  res: NextApiResponse,
  message = "Resource already exists"
): void => {
  sendError(res, message, 409);
};

export const sendRateLimit = (
  res: NextApiResponse,
  message = "Too many requests"
): void => {
  sendError(res, message, 429);
};

/** ---- Pagination ---- */

export const sendPaginatedResponse = <T>(
  res: NextApiResponse,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message = "Success"
): void => {
  const totalPages = Math.ceil(total / limit);

  const response: PaginatedResponse<T[]> = {
    success: true,
    message,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(200).json(response);
};

/** ---- Async handler with safe typings ---- */

type NextHandler = (err?: unknown) => void;

type ApiHandler<
  Req extends NextApiRequest = NextApiRequest,
  Res extends NextApiResponse = NextApiResponse
> = (req: Req, res: Res, next?: NextHandler) => Promise<void> | void;

export const asyncHandler =
  <
    Req extends NextApiRequest = NextApiRequest,
    Res extends NextApiResponse = NextApiResponse
  >(
    fn: ApiHandler<Req, Res>
  ): ApiHandler<Req, Res> =>
  async (req, res, next) => {
    try {
      await Promise.resolve(fn(req as Req, res as Res, next));
    } catch (error: unknown) {
      console.error("API Error:", error);

      // Narrow to an object for safe property access
      const errObj = (error as Record<string, unknown>) ?? {};

      const name = typeof errObj.name === "string" ? errObj.name : undefined;

      // Mongoose validation error
      if (
        name === "ValidationError" &&
        typeof errObj.errors === "object" &&
        errObj.errors !== null
      ) {
        const errors = Object.values(
          errObj.errors as Record<string, { message?: string }>
        ).map((e) =>
          typeof e?.message === "string" ? e.message : "Validation error"
        );
        return sendValidationError(res, errors);
      }

      // Mongoose duplicate key error
      if (
        typeof errObj.code === "number" &&
        errObj.code === 11000 &&
        typeof errObj.keyValue === "object" &&
        errObj.keyValue !== null
      ) {
        const field =
          Object.keys(errObj.keyValue as Record<string, unknown>)[0] ??
          "resource";
        return sendConflict(res, `${field} already exists`);
      }

      // JWT errors
      if (name === "JsonWebTokenError")
        return sendUnauthorized(res, "Invalid token");
      if (name === "TokenExpiredError")
        return sendUnauthorized(res, "Token expired");

      // Cast error (invalid ObjectId)
      if (name === "CastError") return sendError(res, "Invalid ID format", 400);

      // Default error
      const message =
        error instanceof Error ? error.message : "Internal server error";
      sendError(res, message, 500);
    }
  };

/** ---- CORS helpers ---- */

export const setCorsHeaders = (res: NextApiResponse): void => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

export const handleOptions = (res: NextApiResponse): void => {
  setCorsHeaders(res);
  res.status(200).end();
};
