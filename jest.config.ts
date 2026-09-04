import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  testEnvironment: 'jsdom',

  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.ts',
  ],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // Fallbacks if underlying nested dependency imports throw errors
    '^@ai-sdk/(.*)$': '<rootDir>/node_modules/@ai-sdk/$1',
  },

  testMatch: [
    '<rootDir>/tests/**/*.test.[jt]s?(x)',
    '<rootDir>/tests/**/*.spec.[jt]s?(x)',
  ],

  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
  ],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 75,
      statements: 75,
    },
  },

  clearMocks: true,
};

// next/jest resolves asynchronously. We intercept the built configuration to append our rules.
export default async () => {
  const nextJestConfig = await createJestConfig(config)();

  return {
    ...nextJestConfig,
    transformIgnorePatterns: [
      // Force Jest to compile the root 'ai' library AND its nested workspace ecosystems
      '/node_modules/(?!(ai|@ai-sdk|@workflow|pdf-parse)/)',
    ],
  };
};
