const testMatch = require('../tests');

module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/setupJest.ts'],
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest',
  },

  testURL: 'http://localhost',
  testPathIgnorePatterns: ['<rootDir>/src/test.ts'],
  testMatch: testMatch.map(file => '<rootDir>/' + file),
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.es2015.spec.json',
    },
  },
};
