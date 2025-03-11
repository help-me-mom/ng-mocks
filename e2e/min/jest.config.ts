export default {
  preset: 'jest-preset-angular',
  workerIdleMemoryLimit: '1024MB',
  maxWorkers: 1,
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  transform: {
    '^.+\\.(ts|js|html|svg)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
      { useESM: true },
    ],
  },
};
