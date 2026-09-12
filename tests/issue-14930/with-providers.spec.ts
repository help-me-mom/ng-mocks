import { forwardRef, Injectable, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, ngMocks } from 'ng-mocks';

// @see https://github.com/help-me-mom/ng-mocks/issues/14930
describe('issue-14930:with-providers', () => {
  for (const wrapped of [false, true]) {
    it(`preserves providers from an ${wrapped ? 'outer forwardRef' : 'unwrapped'} ModuleWithProviders import`, async () => {
      @Injectable({ providedIn: 'root' })
      class RootService {
        public value = 'real root';
      }

      // View Engine copies literal provider objects; class instances retain identity.
      const marker = new RootService();
      marker.value = 'module provider';

      @NgModule({})
      class ProviderModule {
        public static forRoot() {
          return {
            ngModule: ProviderModule,
            providers: [{ provide: RootService, useValue: marker }],
          };
        }
      }

      const moduleImport = wrapped
        ? forwardRef(() => ProviderModule.forRoot())
        : ProviderModule.forRoot();

      @NgModule({ imports: [moduleImport] })
      class TargetModule {}

      ngMocks.globalMock(RootService);
      try {
        await TestBed.configureTestingModule({
          imports: [TargetModule],
        }).compileComponents();

        const actual = ngMocks.get(RootService);

        expect(actual).toBe(marker);
        expect(actual.value).toBe('module provider');
        expect(isMockOf(actual, RootService)).toBe(false);
        expect(ngMocks.get(RootService)).toBe(actual);
        expect(marker.value).toBe('module provider');
      } finally {
        TestBed.resetTestingModule();
        ngMocks.globalWipe(RootService);
      }
    });
  }
});
