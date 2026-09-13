import { jest } from '@jest/globals';
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone/index.mjs';
import { ngMocks } from 'ng-mocks';

setupZoneTestEnv();

// Native ESM exposes Jest through imports instead of a module-scoped global.
ngMocks.autoSpy(name => jest.fn().mockName(name));
