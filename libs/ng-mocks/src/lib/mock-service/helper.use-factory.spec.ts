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

      // Invoke the factory with the destroyed injector
      // This should trigger the catch block and fall back to direct execution
      const result = provider.useFactory(childInjector);

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

      // Invoke the factory with the fake injector
      // This should trigger the catch block and fall back to direct execution
      const result = provider.useFactory(fakeInjector);

      // Verify the mock was created successfully despite the error
      expect(result).toBeDefined();
    });

    it('executes directly when injector is undefined', () => {
      // Create a test service class
      class TestService {
        public value = 'test';
      }

      // Create a factory provider using helperUseFactory
      const provider = helperUseFactory(TestService);

      // Invoke the factory without an injector
      const result = provider.useFactory(undefined);

      // Verify the mock was created successfully
      expect(result).toBeDefined();
    });

    it('executes directly when runInInjectionContext is not available', () => {
      // This test covers the case when runInInjectionContext doesn't exist
      // (Angular < 16). Since we can't easily simulate this in Angular 16+,
      // we just verify the factory works with a valid injector.
      class TestService {
        public value = 'test';
      }

      const provider = helperUseFactory(TestService);
      const injector = TestBed.inject(Injector);
      const result = provider.useFactory(injector);

      expect(result).toBeDefined();
    });
  });
});
