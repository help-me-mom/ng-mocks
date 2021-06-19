const testMatch = require('../tests');

module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/setupJest.ts'],
  testURL: 'http://localhost',
  testPathIgnorePatterns: ['<rootDir>/src/test.ts'],
  testMatch: testMatch.map(file => '<rootDir>/' + file),
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.es5ivy.spec.json',
    },
  },
};
