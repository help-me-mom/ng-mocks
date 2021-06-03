module.exports = {
  preset: 'jest-preset-angular',
  testRunner: 'jest-jasmine2',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  testURL: 'http://localhost',
  testPathIgnorePatterns: ['<rootDir>/src/test.ts'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.es5ivy.spec.json',
    },
  },
};
