module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  testPathIgnorePatterns: ['<rootDir>/src/test.ts'],
  transform: {
    '\\.tsx?$': ['jest-preset-angular', { tsconfig: './tsconfig.json' }],
  },
};
