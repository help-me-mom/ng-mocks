module.exports = {
  preset: 'jest-preset-angular',
  workerIdleMemoryLimit: '1024MB',
  maxWorkers: 1,
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.es2015ivy.spec.json',
    },
  },
};
