import {
  ENVIRONMENT_INITIALIZER,
  importProvidersFrom,
  inject,
  Injectable,
  InjectionToken,
  makeEnvironmentProviders,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockBuilder, MockModule, ngMocks } from 'ng-mocks';

class Value {
  public constructor(public readonly label: string) {}
}

const CONFIG = new InjectionToken<Value>('issue-14933-config');
const FACTORY = new InjectionToken<Value>('issue-14933-factory');
const MULTI = new InjectionToken<string[]>('issue-14933-multi');
const originalValue = new Value('original');
const factoryValue = new Value('factory');
let constructorCalls = 0;
let factoryCalls = 0;

@Injectable()
class TargetService {
  public constructor() {
    constructorCalls += 1;
  }

  public read(): string {
    return 'real service';
  }
}

const initializations: Array<{
  service: TargetService;
  config: Value;
  factory: Value;
  multi: string[];
}> = [];
const configProvider = { provide: CONFIG, useValue: originalValue };
const factoryProvider = {
  provide: FACTORY,
  useFactory: () => {
    factoryCalls += 1;

    return factoryValue;
  },
};
const firstProvider = {
  provide: MULTI,
  multi: true,
  useValue: 'first',
};
const secondProvider = {
  provide: MULTI,
  multi: true,
  useValue: 'second',
};
const thirdProvider = {
  provide: MULTI,
  multi: true,
  useValue: 'third',
};
const initializerProvider = {
  provide: ENVIRONMENT_INITIALIZER,
  multi: true,
  useValue: () => {
    initializations.push({
      service: inject(TargetService),
      config: inject(CONFIG),
      factory: inject(FACTORY),
      multi: inject(MULTI),
    });
  },
};
const factoryProviders = [factoryProvider];

@NgModule({ providers: factoryProviders })
class ImportedModule {}

const importedProviders = importProvidersFrom(ImportedModule);
const baseProviders = [
  TargetService,
  configProvider,
  firstProvider,
  initializerProvider,
];
const lastProviders = [thirdProvider];
const orderedProviders = [secondProvider, lastProviders];
const innerProviders = [importedProviders, orderedProviders];
const innerWrapper = makeEnvironmentProviders(innerProviders);
const outerProviders = [baseProviders, innerWrapper];
const outerWrapper = makeEnvironmentProviders(outerProviders);
const wrappedProviders = [outerWrapper];
const ordinaryProviders = [
  baseProviders,
  factoryProviders,
  orderedProviders,
];
const importedDescriptor =
  Object.getOwnPropertyDescriptors(importedProviders);
const importedValues: unknown[] = Object.values(
  importedProviders,
).map(value => (Array.isArray(value) ? [...value] : value));
const innerDescriptor =
  Object.getOwnPropertyDescriptors(innerWrapper);
const outerDescriptor =
  Object.getOwnPropertyDescriptors(outerWrapper);

@NgModule({})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14933
// Environment wrappers must preserve ordinary module-provider policy and order.
describe('issue-14933', () => {
  beforeEach(() => {
    constructorCalls = 0;
    factoryCalls = 0;
    initializations.length = 0;
  });

  afterEach(() => {
    expect(factoryProviders).toEqual([factoryProvider]);
    expect(baseProviders).toEqual([
      TargetService,
      configProvider,
      firstProvider,
      initializerProvider,
    ]);
    expect(lastProviders).toEqual([thirdProvider]);
    expect(orderedProviders).toEqual([secondProvider, lastProviders]);
    expect(innerProviders).toEqual([
      importedProviders,
      orderedProviders,
    ]);
    expect(outerProviders).toEqual([baseProviders, innerWrapper]);
    expect(wrappedProviders).toEqual([outerWrapper]);
    expect(ordinaryProviders).toEqual([
      baseProviders,
      factoryProviders,
      orderedProviders,
    ]);
    expect(
      Object.getOwnPropertyDescriptors(importedProviders),
    ).toEqual(importedDescriptor);
    expect<unknown[]>(Object.values(importedProviders)).toEqual(
      importedValues,
    );
    expect(Object.getOwnPropertyDescriptors(innerWrapper)).toEqual(
      innerDescriptor,
    );
    expect(Object.getOwnPropertyDescriptors(outerWrapper)).toEqual(
      outerDescriptor,
    );
    expect(configProvider.useValue).toBe(originalValue);
    expect(originalValue.label).toBe('original');
  });

  for (const wrapped of [false, true]) {
    describe(
      wrapped ? 'nested environment wrappers' : 'ordinary arrays',
      () => {
        it('mocks ModuleWithProviders through MockModule without real effects', async () => {
          const source: ModuleWithProviders<TargetModule> = {
            ngModule: TargetModule,
            providers: wrapped ? wrappedProviders : ordinaryProviders,
          };
          const mock = MockModule(source);

          await TestBed.configureTestingModule({
            imports: [mock],
          }).compileComponents();

          const service = ngMocks.get(TargetService);
          const factory = ngMocks.get(FACTORY);

          expect(isMockOf(service, TargetService)).toBe(true);
          expect(service.read()).toBeUndefined();
          expect(ngMocks.get(TargetService)).toBe(service);
          expect(factory).not.toBe(factoryValue);
          expect(Object.keys(factory)).toEqual([]);
          expect(ngMocks.get(FACTORY)).toBe(factory);
          expect(constructorCalls).toBe(0);
          expect(factoryCalls).toBe(0);
          expect(initializations).toEqual([]);
          expect(source.ngModule).toBe(TargetModule);
          expect(source.providers).toBe(
            wrapped ? wrappedProviders : ordinaryProviders,
          );
        });

        it('mocks ModuleWithProviders through MockBuilder without real effects', async () => {
          const source: ModuleWithProviders<TargetModule> = {
            ngModule: TargetModule,
            providers: wrapped ? wrappedProviders : ordinaryProviders,
          };

          await MockBuilder().mock(source);

          const service = ngMocks.get(TargetService);
          const factory = ngMocks.get(FACTORY);

          expect(isMockOf(service, TargetService)).toBe(true);
          expect(service.read()).toBeUndefined();
          expect(ngMocks.get(TargetService)).toBe(service);
          expect(factory).not.toBe(factoryValue);
          expect(Object.keys(factory)).toEqual([]);
          expect(ngMocks.get(FACTORY)).toBe(factory);
          expect(constructorCalls).toBe(0);
          expect(factoryCalls).toBe(0);
          expect(initializations).toEqual([]);
          expect(source.ngModule).toBe(TargetModule);
          expect(source.providers).toBe(
            wrapped ? wrappedProviders : ordinaryProviders,
          );
        });

        it('keeps ordered providers and initializes once with the explicit token mock', async () => {
          const source: ModuleWithProviders<TargetModule> = {
            ngModule: TargetModule,
            providers: wrapped ? wrappedProviders : ordinaryProviders,
          };
          const replacement = new Value('explicit mock');

          await MockBuilder(source).mock(CONFIG, replacement);

          const service = ngMocks.get(TargetService);
          const factory = ngMocks.get(FACTORY);
          const values = ngMocks.get(MULTI);

          expect(isMockOf(service, TargetService)).toBe(false);
          expect(service.read()).toBe('real service');
          expect(ngMocks.get(CONFIG)).toBe(replacement);
          expect(factory).toBe(factoryValue);
          expect(values).toEqual(['first', 'second', 'third']);
          expect(constructorCalls).toBe(1);
          expect(factoryCalls).toBe(1);
          expect(initializations.length).toBe(1);
          expect(initializations[0].service).toBe(service);
          expect(initializations[0].config).toBe(replacement);
          expect(initializations[0].factory).toBe(factoryValue);
          expect(initializations[0].multi).toBe(values);
          expect(ngMocks.get(TargetService)).toBe(service);
          expect(ngMocks.get(FACTORY)).toBe(factoryValue);
          expect(ngMocks.get(MULTI)).toBe(values);
          expect(constructorCalls).toBe(1);
          expect(factoryCalls).toBe(1);
          expect(initializations.length).toBe(1);
          expect(source.ngModule).toBe(TargetModule);
          expect(source.providers).toBe(
            wrapped ? wrappedProviders : ordinaryProviders,
          );
        });
      },
    );
  }
});
