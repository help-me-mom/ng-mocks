const { createCjsPreset } = require('jest-preset-angular/presets');

module.exports = {
  ...createCjsPreset({ tsconfig: '<rootDir>/tsconfig.json' }),
  displayName: 'nx',
  workerIdleMemoryLimit: '1024MB',
  maxWorkers: 1,
  preset: './jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/.nx/'],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
};
