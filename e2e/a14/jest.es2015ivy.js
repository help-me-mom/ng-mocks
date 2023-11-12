module.exports = {
  preset: 'jest-preset-angular',
  workerIdleMemoryLimit: '1024MB',
  maxWorkers: 1,
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  testPathIgnorePatterns: ['<rootDir>/src/test.ts'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.es2015ivy.spec.json',
    },
  },
};
