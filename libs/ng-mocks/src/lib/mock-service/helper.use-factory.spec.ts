import * as core from '@angular/core';
import {
  createEnvironmentInjector,
  EnvironmentInjector,
  Injector,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import helperUseFactory from './helper.use-factory';

describe('helper.use-factory', () => {
  describe('tryRunInInjectionContext fallback', () => {
    it('falls back to direct execution when runInInjectionContext throws', () => {
      // Only test this if runInInjectionContext exists (Angular 16+)
      const runInContext = (core as any).runInInjectionContext;
      if (typeof runInContext !== 'function') {
        expect(true).toBeTruthy();

        return;
      }

      // Create a test service class
      class TestService {
        public value = 'test';
      }

      // Create a factory provider using helperUseFactory
      const provider = helperUseFactory(TestService);

      // Create an environment injector and then destroy it
      // This will cause runInInjectionContext to throw when called
      const parentInjector = TestBed.inject(EnvironmentInjector);
      const childInjector = createEnvironmentInjector(
        [],
        parentInjector,
      );

      // Destroy the injector to make runInInjectionContext throw
      childInjector.destroy();

      // Invoke the factory with the destroyed injector as the EnvironmentInjector
      // This should trigger the catch block and fall back to direct execution
      const result = provider.useFactory(childInjector, undefined);

      // Verify the mock was created successfully despite the error
      expect(result).toBeDefined();
    });

    it('falls back when runInInjectionContext throws with fake injector', () => {
      // Only test this if runInInjectionContext exists (Angular 16+)
      const runInContext = (core as any).runInInjectionContext;
      if (typeof runInContext !== 'function') {
        expect(true).toBeTruthy();

        return;
      }

      // Create a test service class
      class TestService {
        public value = 'test';
      }

      // Create a factory provider using helperUseFactory
      const provider = helperUseFactory(TestService);

      // Create a fake injector-like object that will cause
      // runInInjectionContext to throw
      const fakeInjector = {
        // This is not a real injector, so runInInjectionContext will throw
        get: () => {
          throw new Error('Not a real injector');
        },
      } as unknown as Injector;

      // Invoke the factory with the fake injector as the EnvironmentInjector
      // This should trigger the catch block and fall back to direct execution
      const result = provider.useFactory(
        fakeInjector as unknown as EnvironmentInjector,
        undefined,
      );

      // Verify the mock was created successfully despite the error
      expect(result).toBeDefined();
    });

    it('executes directly when both injectors are undefined', () => {
      // Create a test service class
      class TestService {
        public value = 'test';
      }

      // Create a factory provider using helperUseFactory
      const provider = helperUseFactory(TestService);

      // Invoke the factory without any injectors
      const result = provider.useFactory(undefined, undefined);

      // Verify the mock was created successfully
      expect(result).toBeDefined();
    });

    it('uses EnvironmentInjector when available', () => {
      // This test verifies that EnvironmentInjector is preferred
      class TestService {
        public value = 'test';
      }

      const provider = helperUseFactory(TestService);
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const result = provider.useFactory(
        environmentInjector,
        undefined,
      );

      expect(result).toBeDefined();
    });

    it('falls back to Injector when EnvironmentInjector is not available', () => {
      // This test covers the fallback to Injector
      class TestService {
        public value = 'test';
      }

      const provider = helperUseFactory(TestService);
      const injector = TestBed.inject(Injector);
      const result = provider.useFactory(undefined, injector);

      expect(result).toBeDefined();
    });
  });
});
