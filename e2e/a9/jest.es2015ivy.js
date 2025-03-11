module.exports = {
  preset: 'jest-preset-angular',
  workerIdleMemoryLimit: '1024MB',
  maxWorkers: 1,
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  testURL: 'http://localhost',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.es2015ivy.spec.json',
    },
  },
};
