export default {
  preset: 'jest-preset-angular',
  workerIdleMemoryLimit: '1024MB',
  maxWorkers: 1,
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  testURL: 'http://localhost',
  testPathIgnorePatterns: ['<rootDir>/src/test.ts'],
  transform: {
    '^.+\\.(ts|mjs|js|html)$': ['jest-preset-angular', { tsconfig: './tsconfig.json' }],
  },
};
