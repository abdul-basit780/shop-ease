// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
    dir: './',
});

const customJestConfig = {
    // Add more setup options before each test is run
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

    // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
    moduleDirectories: ['node_modules', '<rootDir>/'],
    testEnvironment: 'node',
    testMatch: [
        '**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)',
        '**/*.(test|spec).(js|jsx|ts|tsx)',
    ],

    // Disable coverage by default
    collectCoverage: false,

    // Coverage configuration (only used when --coverage flag is passed)
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    collectCoverageFrom: [
        'pages/api/**/*.{js,ts}',
        'lib/**/*.{js,ts}',
        '!lib/**/*.d.ts',
        '!**/*.config.js',
        '!**/node_modules/**',
        '!**/__tests__/**',
        '!**/*.test.{js,ts}',
        '!**/*.spec.{js,ts}',
    ],

    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
    },

    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

    testPathIgnorePatterns: [
        '<rootDir>/.next/',
        '<rootDir>/node_modules/',
    ],

    clearMocks: true,
    verbose: true,
};

module.exports = createJestConfig(customJestConfig);