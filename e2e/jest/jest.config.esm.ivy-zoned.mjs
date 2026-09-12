import presets from 'jest-preset-angular/presets/index.js';

export default {
  ...presets.createEsmPreset({ tsconfig: '<rootDir>/tsconfig.json' }),
  workerIdleMemoryLimit: '1024MB',
  maxWorkers: 1,
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest-esm.ts'],
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  testMatch: ['<rootDir>/src/esm/**/*.spec.ts', '<rootDir>/src/tests/issue-14931/test.spec.ts'],
};
