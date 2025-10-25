// jest.setup.js
import 'jest-extended';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '7d';

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    // Uncomment to ignore specific log levels
    // log: jest.fn(),
    // debug: jest.fn(),
    // info: jest.fn(),
    // warn: jest.fn(),
    error: jest.fn(),
};

// Set up global test timeout
jest.setTimeout(30000);

// Mock Next.js config
jest.mock('next/config', () => () => ({
    publicRuntimeConfig: {},
    serverRuntimeConfig: {},
}));

// Mock database connection
jest.mock('./src/lib/db/mongodb', () => ({
    __esModule: true,
    default: jest.fn(() => Promise.resolve()),
}));