import {
  sendSuccess,
  sendError,
  sendValidationError,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendConflict,
  sendRateLimit,
  sendPaginatedResponse,
  asyncHandler,
  setCorsHeaders,
  handleOptions,
} from '../../src/lib/utils/apiResponse';
import { NextApiRequest, NextApiResponse } from 'next';

describe('apiResponse utils', () => {
  let mockRes: Partial<NextApiResponse>;
  let mockReq: Partial<NextApiRequest>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let setHeaderMock: jest.Mock;
  let endMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    setHeaderMock = jest.fn();
    endMock = jest.fn();

    mockRes = {
      status: statusMock,
      setHeader: setHeaderMock,
      end: endMock,
    } as Partial<NextApiResponse>;

    mockReq = {} as Partial<NextApiRequest>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendSuccess', () => {
    it('should send success response with default values', () => {
      const data = { id: '123', name: 'Test' };

      sendSuccess(mockRes as NextApiResponse, data);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Success',
          data,
          timestamp: expect.any(String),
        })
      );
    });

    it('should send success response with custom message and status code', () => {
      const data = { id: '456' };

      sendSuccess(mockRes as NextApiResponse, data, 'Created successfully', 201);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Created successfully',
          data,
        })
      );
    });

    it('should include valid ISO timestamp', () => {
      sendSuccess(mockRes as NextApiResponse, {});

      const response = jsonMock.mock.calls[0][0];
      expect(new Date(response.timestamp).toISOString()).toBe(response.timestamp);
    });
  });

  describe('sendError', () => {
    it('should send error response with default status code', () => {
      sendError(mockRes as NextApiResponse, 'Something went wrong');

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Something went wrong',
          error: 'Something went wrong',
          timestamp: expect.any(String),
        })
      );
    });

    it('should send error response with custom status code', () => {
      sendError(mockRes as NextApiResponse, 'Bad request', 400);

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should include errors array if provided', () => {
      const errors = ['Error 1', 'Error 2'];

      sendError(mockRes as NextApiResponse, 'Validation failed', 400, errors);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          errors,
        })
      );
    });
  });

  describe('sendValidationError', () => {
    it('should send validation error with 400 status', () => {
      const errors = ['Name is required', 'Email is invalid'];

      sendValidationError(mockRes as NextApiResponse, errors);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Validation failed',
          errors,
        })
      );
    });

    it('should accept custom message', () => {
      sendValidationError(mockRes as NextApiResponse, [], 'Custom validation message');

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Custom validation message',
        })
      );
    });
  });

  describe('sendUnauthorized', () => {
    it('should send 401 unauthorized response', () => {
      sendUnauthorized(mockRes as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Unauthorized access',
        })
      );
    });

    it('should accept custom message', () => {
      sendUnauthorized(mockRes as NextApiResponse, 'Invalid credentials');

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid credentials',
        })
      );
    });
  });

  describe('sendForbidden', () => {
    it('should send 403 forbidden response', () => {
      sendForbidden(mockRes as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Forbidden access',
        })
      );
    });
  });

  describe('sendNotFound', () => {
    it('should send 404 not found response', () => {
      sendNotFound(mockRes as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Resource not found',
        })
      );
    });
  });

  describe('sendConflict', () => {
    it('should send 409 conflict response', () => {
      sendConflict(mockRes as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Resource already exists',
        })
      );
    });
  });

  describe('sendRateLimit', () => {
    it('should send 429 rate limit response', () => {
      sendRateLimit(mockRes as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(429);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Too many requests',
        })
      );
    });
  });

  describe('sendPaginatedResponse', () => {
    it('should send paginated response with correct meta', () => {
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const page = 1;
      const limit = 10;
      const total = 25;

      sendPaginatedResponse(
        mockRes as NextApiResponse,
        data,
        page,
        limit,
        total
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Success',
          data,
          meta: {
            page: 1,
            limit: 10,
            total: 25,
            totalPages: 3,
            hasNext: true,
            hasPrev: false,
          },
        })
      );
    });

    it('should calculate totalPages correctly', () => {
      sendPaginatedResponse(mockRes as NextApiResponse, [], 1, 10, 25);

      const response = jsonMock.mock.calls[0][0];
      expect(response.meta.totalPages).toBe(3);
    });

    it('should set hasNext and hasPrev correctly for first page', () => {
      sendPaginatedResponse(mockRes as NextApiResponse, [], 1, 10, 30);

      const response = jsonMock.mock.calls[0][0];
      expect(response.meta.hasNext).toBe(true);
      expect(response.meta.hasPrev).toBe(false);
    });

    it('should set hasNext and hasPrev correctly for middle page', () => {
      sendPaginatedResponse(mockRes as NextApiResponse, [], 2, 10, 30);

      const response = jsonMock.mock.calls[0][0];
      expect(response.meta.hasNext).toBe(true);
      expect(response.meta.hasPrev).toBe(true);
    });

    it('should set hasNext and hasPrev correctly for last page', () => {
      sendPaginatedResponse(mockRes as NextApiResponse, [], 3, 10, 30);

      const response = jsonMock.mock.calls[0][0];
      expect(response.meta.hasNext).toBe(false);
      expect(response.meta.hasPrev).toBe(true);
    });
  });

  describe('asyncHandler', () => {
    it('should handle successful async function', async () => {
      const handler = jest.fn().mockResolvedValue(undefined);
      const wrappedHandler = asyncHandler(handler);

      await wrappedHandler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(handler).toHaveBeenCalledWith(mockReq, mockRes, undefined);
    });

    it('should handle ValidationError', async () => {
      const validationError = {
        name: 'ValidationError',
        errors: {
          field1: { message: 'Field 1 error' },
          field2: { message: 'Field 2 error' },
        },
      };

      const handler = jest.fn().mockRejectedValue(validationError);
      const wrappedHandler = asyncHandler(handler);

      await wrappedHandler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          errors: expect.arrayContaining(['Field 1 error', 'Field 2 error']),
        })
      );
    });

    it('should handle duplicate key error (code 11000)', async () => {
      const duplicateError = {
        name: 'MongoError',
        code: 11000,
        keyValue: { email: 'test@test.com' },
      };

      const handler = jest.fn().mockRejectedValue(duplicateError);
      const wrappedHandler = asyncHandler(handler);

      await wrappedHandler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'email already exists',
        })
      );
    });

    it('should handle JsonWebTokenError', async () => {
      const jwtError = { name: 'JsonWebTokenError' };

      const handler = jest.fn().mockRejectedValue(jwtError);
      const wrappedHandler = asyncHandler(handler);

      await wrappedHandler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid token',
        })
      );
    });

    it('should handle TokenExpiredError', async () => {
      const expiredError = { name: 'TokenExpiredError' };

      const handler = jest.fn().mockRejectedValue(expiredError);
      const wrappedHandler = asyncHandler(handler);

      await wrappedHandler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Token expired',
        })
      );
    });

    it('should handle CastError', async () => {
      const castError = { name: 'CastError' };

      const handler = jest.fn().mockRejectedValue(castError);
      const wrappedHandler = asyncHandler(handler);

      await wrappedHandler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid ID format',
        })
      );
    });

    it('should handle generic Error', async () => {
      const error = new Error('Generic error');

      const handler = jest.fn().mockRejectedValue(error);
      const wrappedHandler = asyncHandler(handler);

      await wrappedHandler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Generic error',
        })
      );
    });

    it('should handle non-Error objects', async () => {
      const handler = jest.fn().mockRejectedValue('string error');
      const wrappedHandler = asyncHandler(handler);

      await wrappedHandler(mockReq as NextApiRequest, mockRes as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Internal server error',
        })
      );
    });
  });

  describe('setCorsHeaders', () => {
    it('should set correct CORS headers', () => {
      setCorsHeaders(mockRes as NextApiResponse);

      expect(setHeaderMock).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
      expect(setHeaderMock).toHaveBeenCalledWith(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      expect(setHeaderMock).toHaveBeenCalledWith(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
      );
    });
  });

  describe('handleOptions', () => {
    it('should set CORS headers and return 200', () => {
      handleOptions(mockRes as NextApiResponse);

      expect(setHeaderMock).toHaveBeenCalledTimes(3);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(endMock).toHaveBeenCalled();
    });
  });
});
