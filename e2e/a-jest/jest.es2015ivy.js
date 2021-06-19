const testMatch = require('../tests');

module.exports = {
  preset: 'jest-preset-angular',
  testRunner: 'jest-jasmine2',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  testURL: 'http://localhost',
  testPathIgnorePatterns: ['<rootDir>/src/test.ts'],
  testMatch: testMatch.map(file => '<rootDir>/' + file),
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.es2015ivy.spec.json',
    },
  },
};
