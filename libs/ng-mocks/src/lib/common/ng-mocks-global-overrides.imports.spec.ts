import {
  Component,
  Injectable,
  InjectionToken,
  NgModule,
} from '@angular/core';
import { TestBed, TestModuleMetadata } from '@angular/core/testing';

import funcExtractTokens from '../mock-builder/func.extract-tokens';
import { MockBuilderStash } from '../mock-builder/mock-builder-stash';
import { EntryComponentsModule } from '../mock-builder/promise/handle-entry-components';
import { MockComponent } from '../mock-component/mock-component';
import { ngMocks } from '../mock-helper/mock-helper';
import mockHelperFasterInstall from '../mock-helper/mock-helper.faster-install';
import { MockModule } from '../mock-module/mock-module';

import { flatten } from './core.helpers';
import { getSourceOfMock } from './func.get-source-of-mock';
import { isMockedNgDefOf } from './func.is-mocked-ng-def-of';
import { isNgDef } from './func.is-ng-def';
import { isNgModuleDefWithProviders } from './func.is-ng-module-def-with-providers';

import './ng-mocks-global-overrides';

// @see https://github.com/help-me-mom/ng-mocks/issues/14937
describe('ng-mocks-global-overrides:imports', () => {
  const stash = new MockBuilderStash();

  beforeEach(() => {
    ngMocks.flushTestBed();
    stash.backup();
    expect(mockHelperFasterInstall().before.length).toBe(1);
  });

  afterEach(() => {
    try {
      ngMocks.flushTestBed();
      TestBed.resetTestingModule();
    } finally {
      stash.restore();
    }
  });

  for (const mockFirst of [false, true]) {
    it(`preserves explicit imports with the mock ${mockFirst ? 'first' : 'last'}`, () => {
      @Injectable()
      class BoundaryService {
        public read(): string {
          return 'original';
        }
      }

      @NgModule({ providers: [BoundaryService] })
      class BoundaryModule {}

      @NgModule({})
      class RealModule {}

      const boundary = MockModule(BoundaryModule);
      const imports = mockFirst
        ? [boundary, RealModule]
        : [RealModule, boundary];
      const input = { imports };
      let metadata: TestModuleMetadata = {};
      const nativeConfigure = jasmine
        .createSpy('nativeConfigure')
        .and.callFake((value: TestModuleMetadata) => {
          metadata = value;

          return TestBed;
        });
      const configure = mockHelperFasterInstall().before[0](
        nativeConfigure,
        TestBed,
      );

      expect(configure(input)).toBe(TestBed);

      const actual = flatten<unknown>(metadata.imports || []);
      const mock = funcExtractTokens(metadata.providers).mocks?.get(
        BoundaryModule,
      );
      expect(isMockedNgDefOf(mock, BoundaryModule, 'm')).toBe(true);
      expect(actual.slice(0, -1)).toEqual(
        mockFirst ? [mock, RealModule] : [RealModule, mock],
      );
      const entryModule = actual[actual.length - 1];
      expect(typeof entryModule).toBe('function');
      if (typeof entryModule === 'function') {
        expect(
          entryModule.prototype instanceof EntryComponentsModule,
        ).toBe(true);
      }
      expect(nativeConfigure).toHaveBeenCalledTimes(1);
      expect(nativeConfigure.calls.mostRecent().object).toBe(TestBed);
      expect(input.imports).toBe(imports);
      expect(imports).toEqual(
        mockFirst ? [boundary, RealModule] : [RealModule, boundary],
      );
    });
  }

  it('preserves flattened import order without changing nested source arrays', () => {
    @Injectable()
    class BoundaryService {
      public read(): string {
        return 'original';
      }
    }

    @NgModule({ providers: [BoundaryService] })
    class BoundaryModule {}

    @NgModule({})
    class FirstModule {}

    @NgModule({})
    class LastModule {}

    const boundary = MockModule(BoundaryModule);
    const nested = [boundary, [undefined, LastModule]];
    const imports = [[FirstModule], nested];
    const input = { imports };
    let metadata: TestModuleMetadata = {};
    const nativeConfigure = jasmine
      .createSpy('nativeConfigure')
      .and.callFake((value: TestModuleMetadata) => {
        metadata = value;

        return TestBed;
      });

    mockHelperFasterInstall().before[0](
      nativeConfigure,
      TestBed,
    )(input);

    const mock = funcExtractTokens(metadata.providers).mocks?.get(
      BoundaryModule,
    );
    expect(isMockedNgDefOf(mock, BoundaryModule, 'm')).toBe(true);
    const actual = flatten<unknown>(metadata.imports || []);
    expect(actual.slice(0, -1)).toEqual([
      FirstModule,
      mock,
      LastModule,
    ]);
    const entryModule = actual[actual.length - 1];
    expect(typeof entryModule).toBe('function');
    if (typeof entryModule === 'function') {
      expect(
        entryModule.prototype instanceof EntryComponentsModule,
      ).toBe(true);
    }
    expect(nativeConfigure).toHaveBeenCalledTimes(1);
    expect(input.imports).toBe(imports);
    expect(imports[1]).toBe(nested);
    expect(imports).toEqual([
      [FirstModule],
      [boundary, [undefined, LastModule]],
    ]);
  });

  it('preserves ModuleWithProviders placement and provider identities', () => {
    @Injectable()
    class BoundaryService {
      public read(): string {
        return 'original';
      }
    }

    @NgModule({ providers: [BoundaryService] })
    class BoundaryModule {}

    @NgModule({})
    class RealModule {}

    const token = new InjectionToken<object>('configured value');
    const factoryToken = new InjectionToken<object>(
      'configured factory',
    );
    const value = { label: 'configured' };
    const factory = jasmine
      .createSpy('provider factory')
      .and.returnValue(value);
    const valueProvider = { provide: token, useValue: value };
    const factoryProvider = {
      provide: factoryToken,
      useFactory: factory,
    };
    const providers = [valueProvider, factoryProvider];
    const configured = { ngModule: RealModule, providers };
    const boundary = MockModule(BoundaryModule);
    const imports = [configured, boundary];
    let metadata: TestModuleMetadata = {};
    const nativeConfigure = jasmine
      .createSpy('nativeConfigure')
      .and.callFake((result: TestModuleMetadata) => {
        metadata = result;

        return TestBed;
      });

    mockHelperFasterInstall().before[0](
      nativeConfigure,
      TestBed,
    )({ imports });

    const actual = flatten<unknown>(metadata.imports || []);
    const mock = funcExtractTokens(metadata.providers).mocks?.get(
      BoundaryModule,
    );
    expect(isMockedNgDefOf(mock, BoundaryModule, 'm')).toBe(true);
    expect(actual.length).toBe(3);
    expect(actual[1]).toBe(mock);
    expect(isNgModuleDefWithProviders(actual[0])).toBe(true);
    if (isNgModuleDefWithProviders(actual[0])) {
      expect(actual[0].ngModule).toBe(RealModule);
      expect(actual[0].providers).toEqual(providers);
      expect(actual[0].providers?.[0]).toBe(valueProvider);
      expect(actual[0].providers?.[1]).toBe(factoryProvider);
    }
    const entryModule = actual[actual.length - 1];
    expect(typeof entryModule).toBe('function');
    if (typeof entryModule === 'function') {
      expect(
        entryModule.prototype instanceof EntryComponentsModule,
      ).toBe(true);
    }
    expect(valueProvider.useValue).toBe(value);
    expect(factoryProvider.useFactory).toBe(factory);
    expect(factory).not.toHaveBeenCalled();
    expect(configured.ngModule).toBe(RealModule);
    expect(configured.providers).toBe(providers);
    expect(imports).toEqual([configured, boundary]);
    expect(nativeConfigure).toHaveBeenCalledTimes(1);
  });

  it('preserves provider precedence when repeated ModuleWithProviders entries are merged', () => {
    @Injectable()
    class BoundaryService {
      public read(): string {
        return 'original';
      }
    }

    @NgModule({ providers: [BoundaryService] })
    class BoundaryModule {}

    @NgModule({})
    class AModule {}

    @NgModule({})
    class BModule {}

    const token = new InjectionToken<number>(
      'repeated configuration',
    );
    const firstProvider = { provide: token, useValue: 1 };
    const secondProvider = { provide: token, useValue: 2 };
    const lastProvider = { provide: token, useValue: 3 };
    const first = { ngModule: AModule, providers: [firstProvider] };
    const second = { ngModule: BModule, providers: [secondProvider] };
    const last = { ngModule: AModule, providers: [lastProvider] };
    const boundary = MockModule(BoundaryModule);
    const imports = [first, second, last, boundary];
    let metadata: TestModuleMetadata = {};
    const nativeConfigure = jasmine
      .createSpy('nativeConfigure')
      .and.callFake((value: TestModuleMetadata) => {
        metadata = value;

        return TestBed;
      });

    mockHelperFasterInstall().before[0](
      nativeConfigure,
      TestBed,
    )({ imports });

    const actual = flatten<unknown>(metadata.imports || []);
    const configured = actual.filter(isNgModuleDefWithProviders);
    const [mergedB, mergedA] = configured;
    const mock = funcExtractTokens(metadata.providers).mocks?.get(
      BoundaryModule,
    );
    expect(isMockedNgDefOf(mock, BoundaryModule, 'm')).toBe(true);
    expect(configured.map(module => module.ngModule)).toEqual([
      BModule,
      AModule,
    ]);
    expect(actual.slice(0, -1)).toEqual([mergedB, mergedA, mock]);
    const entryModule = actual[actual.length - 1];
    expect(typeof entryModule).toBe('function');
    if (typeof entryModule === 'function') {
      expect(
        entryModule.prototype instanceof EntryComponentsModule,
      ).toBe(true);
    }
    expect(mergedA?.providers).toEqual([firstProvider, lastProvider]);
    expect(mergedA?.providers?.[0]).toBe(firstProvider);
    expect(mergedA?.providers?.[1]).toBe(lastProvider);
    expect(mergedB?.providers).toEqual([secondProvider]);
    expect(mergedB?.providers?.[0]).toBe(secondProvider);
    expect(imports).toEqual([first, second, last, boundary]);
    expect(first.providers).toEqual([firstProvider]);
    expect(first.providers[0]).toBe(firstProvider);
    expect(second.providers).toEqual([secondProvider]);
    expect(last.providers).toEqual([lastProvider]);
    expect(last.providers[0]).toBe(lastProvider);
    expect(nativeConfigure).toHaveBeenCalledTimes(1);
  });

  it('preserves configured providers when a replacement also adds a bare module import', () => {
    @Injectable()
    class BoundaryService {
      public read(): string {
        return 'original';
      }
    }

    @NgModule({ providers: [BoundaryService] })
    class BoundaryModule {}

    @NgModule({})
    class OriginalModule {}

    @NgModule({})
    class ReplacementModule {}

    @NgModule({ imports: [OriginalModule] })
    class HostModule {}

    const token = new InjectionToken<object>(
      'replacement configuration',
    );
    const value = { label: 'configured replacement' };
    const valueProvider = { provide: token, useValue: value };
    const providers = [valueProvider];
    const configured = { ngModule: ReplacementModule, providers };
    const boundary = MockModule(BoundaryModule);
    const imports = [HostModule, configured, boundary];
    let metadata: TestModuleMetadata = {};
    const nativeConfigure = jasmine
      .createSpy('nativeConfigure')
      .and.callFake((result: TestModuleMetadata) => {
        metadata = result;

        return TestBed;
      });
    ngMocks.globalReplace(OriginalModule, ReplacementModule);

    try {
      mockHelperFasterInstall().before[0](
        nativeConfigure,
        TestBed,
      )({ imports });

      const actual = flatten<unknown>(metadata.imports || []);
      const wrappers = actual.filter(isNgModuleDefWithProviders);
      expect(wrappers.length).toBe(1);
      const [replacement] = wrappers;
      const mocks = funcExtractTokens(metadata.providers).mocks;
      const mock = mocks?.get(BoundaryModule);
      expect(isMockedNgDefOf(mock, BoundaryModule, 'm')).toBe(true);
      expect(replacement).toBeDefined();
      expect(replacement?.ngModule).toBe(ReplacementModule);
      expect(replacement?.providers).toEqual([valueProvider]);
      expect(replacement?.providers?.[0]).toBe(valueProvider);
      expect(
        actual.filter(module =>
          isNgModuleDefWithProviders(module)
            ? module.ngModule === ReplacementModule
            : module === ReplacementModule,
        ).length,
      ).toBe(2);
      const host = actual[0];
      expect(isNgDef(host, 'm')).toBe(true);
      if (isNgDef(host, 'm')) {
        expect(getSourceOfMock(host)).toBe(HostModule);
      }
      expect(actual.slice(1, -1)).toEqual([
        replacement,
        ReplacementModule,
        mock,
      ]);
      const entryModule = actual[actual.length - 1];
      expect(typeof entryModule).toBe('function');
      if (typeof entryModule === 'function') {
        expect(
          entryModule.prototype instanceof EntryComponentsModule,
        ).toBe(true);
      }
      expect(configured.providers).toBe(providers);
      expect(configured.providers[0]).toBe(valueProvider);
      expect(valueProvider.useValue).toBe(value);
      expect(imports).toEqual([HostModule, configured, boundary]);
      expect(nativeConfigure).toHaveBeenCalledTimes(1);
    } finally {
      ngMocks.globalWipe(OriginalModule);
    }
  });

  it('preserves standalone imports interleaved with real and mocked modules', () => {
    @Injectable()
    class BoundaryService {
      public read(): string {
        return 'original';
      }
    }

    @NgModule({ providers: [BoundaryService] })
    class BoundaryModule {}

    @NgModule({})
    class RealModule {}

    @Component({
      selector: 'real-import',
      standalone: true,
      template: '',
    })
    class RealComponent {}

    @Component({
      selector: 'mock-import',
      standalone: true,
      template: '',
    })
    class BoundaryComponent {}

    const boundaryModule = MockModule(BoundaryModule);
    const boundaryComponent = MockComponent(BoundaryComponent);
    const imports = [
      RealComponent,
      boundaryModule,
      boundaryComponent,
      RealModule,
    ];
    let metadata: TestModuleMetadata = {};
    const nativeConfigure = jasmine
      .createSpy('nativeConfigure')
      .and.callFake((value: TestModuleMetadata) => {
        metadata = value;

        return TestBed;
      });

    mockHelperFasterInstall().before[0](
      nativeConfigure,
      TestBed,
    )({ imports });

    const mocks = funcExtractTokens(metadata.providers).mocks;
    const mockModule = mocks?.get(BoundaryModule);
    const mockComponent = mocks?.get(BoundaryComponent);
    expect(isMockedNgDefOf(mockModule, BoundaryModule, 'm')).toBe(
      true,
    );
    expect(
      isMockedNgDefOf(mockComponent, BoundaryComponent, 'c'),
    ).toBe(true);
    const actual = flatten<unknown>(metadata.imports || []);
    expect(actual.slice(0, -1)).toEqual([
      RealComponent,
      mockModule,
      mockComponent,
      RealModule,
    ]);
    const entryModule = actual[actual.length - 1];
    expect(typeof entryModule).toBe('function');
    if (typeof entryModule === 'function') {
      expect(
        entryModule.prototype instanceof EntryComponentsModule,
      ).toBe(true);
    }
    expect(metadata.declarations).toEqual([]);
    expect(imports).toEqual([
      RealComponent,
      boundaryModule,
      boundaryComponent,
      RealModule,
    ]);
    expect(nativeConfigure).toHaveBeenCalledTimes(1);
  });
});
