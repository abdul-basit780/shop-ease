// lib/middleware/auth.ts
import { NextApiRequest, NextApiResponse } from "next";
import { verifyToken, extractTokenFromHeader, JWTPayload } from "../utils/auth";
import { sendUnauthorized, sendForbidden } from "../utils/apiResponse";
import { UserRole } from "../models/enums";
import Joi, { ObjectSchema } from "joi";

type NextFn = () => void | Promise<void>;

export type Middleware<
  Req extends NextApiRequest = NextApiRequest,
  Res extends NextApiResponse = NextApiResponse
> = (req: Req, res: Res, next: NextFn) => void | Promise<void>;

// Extend NextApiRequest to include user
export interface AuthenticatedRequest extends NextApiRequest {
  user: JWTPayload;
}

// Authentication middleware
export const authenticate = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return sendUnauthorized(res, "Access token required");
    }

    const decoded = verifyToken(token);
    (req as AuthenticatedRequest).user = decoded;

    next();
  } catch (error: unknown) {
    console.error("Authentication error:", error);
    return sendUnauthorized(res, "Invalid or expired token");
  }
};

// Role-based authorization middleware
export const authorize = (...roles: UserRole[]) => {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      return sendUnauthorized(res, "Authentication required");
    }

    if (!roles.includes(user.role)) {
      return sendForbidden(res, "Insufficient permissions");
    }

    next();
  };
};

// Admin only middleware
export const adminOnly = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  return authorize(UserRole.ADMIN)(req, res, next);
};

// Customer only middleware
export const customerOnly = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  return authorize(UserRole.CUSTOMER)(req, res, next);
};

// Middleware composer
export const composeMiddleware = <
  Req extends NextApiRequest = NextApiRequest,
  Res extends NextApiResponse = NextApiResponse
>(
  ...middlewares: Middleware<Req, Res>[]
) => {
  return async (req: Req, res: Res): Promise<void> => {
    let index = -1;

    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) throw new Error("next() called multiple times");
      index = i;

      // Stop if response already ended (middleware wrote a response)
      if (res.writableEnded) return;

      const mw = middlewares[i];
      if (!mw) return;

      await mw(req, res, () => dispatch(i + 1));
    };

    await dispatch(0);
  };
};

// Rate limiting middleware (simple in-memory store)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (
  maxRequests: number = 10,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) => {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const key = req.socket.remoteAddress || "unknown";
    const now = Date.now();

    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: "Too many requests",
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    record.count++;
    next();
  };
};

// Method validation middleware
export const allowMethods = (methods: string[]) => {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    if (!req.method || !methods.includes(req.method)) {
      return res.status(405).json({
        success: false,
        message: `Method ${req.method} not allowed`,
        allowedMethods: methods,
      });
    }
    next();
  };
};

// Request validation middleware
export const validateRequest = (schema: ObjectSchema) => {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const { error } = schema.validate(req.body);

    if (error) {
      const errors = error.details.map(
        (detail: Joi.ValidationErrorItem) => detail.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    next();
  };
};
