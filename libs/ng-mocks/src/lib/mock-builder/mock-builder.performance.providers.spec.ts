import { Injectable, InjectionToken, NgModule } from '@angular/core';

import { ngMocks } from '../mock-helper/mock-helper';

import { MockBuilder } from './mock-builder';

const TARGET1_TOKEN = new InjectionToken('TARGET1');
const TARGET2_TOKEN = new InjectionToken('TARGET2');

@Injectable()
class Target1Service {}

@Injectable()
class Target2Service {}

@NgModule({
  providers: [Target1Service],
})
class Target1Module {}

@NgModule({
  providers: [Target2Service],
})
class Target2Module {}

describe('MockBuilderPerformance:providers', () => {
  afterEach(ngMocks.reset);

  it('reuses the cache for the same provider class', () => {
    const ngModule1 = MockBuilder().provide(Target1Service).build();
    const ngModule2 = MockBuilder().provide(Target1Service).build();

    expect(ngModule1.providers?.[0]).toBe(ngModule2.providers?.[0]);
  });
  it('invalidates the cache when a provider is added', () => {
    const ngModule1 = MockBuilder().build();
    const ngModule2 = MockBuilder().provide(Target1Service).build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('invalidates the cache when the provider class changes', () => {
    const ngModule1 = MockBuilder().provide(Target1Service).build();
    const ngModule2 = MockBuilder().provide(Target2Service).build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('reuses the cache for equal value providers', () => {
    const ngModule1 = MockBuilder()
      .provide({ provide: Target1Service, useValue: 1 })
      .build();
    const ngModule2 = MockBuilder()
      .provide({ provide: Target1Service, useValue: 1 })
      .build();

    expect(ngModule1.providers?.[0]).toBe(ngModule2.providers?.[0]);
  });
  it('invalidates the cache when a provided value changes', () => {
    const ngModule1 = MockBuilder()
      .provide({ provide: Target1Service, useValue: 1 })
      .build();
    const ngModule2 = MockBuilder()
      .provide({ provide: Target1Service, useValue: 2 })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('reuses the cache for the same provider implementation class', () => {
    const ngModule1 = MockBuilder()
      .provide({ provide: Target1Service, useClass: Target2Service })
      .build();
    const ngModule2 = MockBuilder()
      .provide({ provide: Target1Service, useClass: Target2Service })
      .build();

    expect(ngModule1.providers?.[0]).toBe(ngModule2.providers?.[0]);
  });
  it('invalidates the cache when the provider implementation changes', () => {
    const ngModule1 = MockBuilder()
      .provide({ provide: Target1Service, useClass: Target1Service })
      .build();
    const ngModule2 = MockBuilder()
      .provide({ provide: Target1Service, useClass: Target2Service })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('reuses the cache for the same provider factory', () => {
    const factory = () => 1;
    const ngModule1 = MockBuilder()
      .provide({ provide: Target1Service, useFactory: factory })
      .build();
    const ngModule2 = MockBuilder()
      .provide({ provide: Target1Service, useFactory: factory })
      .build();

    expect(ngModule1.providers?.[0]).toBe(ngModule2.providers?.[0]);
  });
  it('invalidates the cache when the provider factory changes', () => {
    const ngModule1 = MockBuilder()
      .provide({ provide: Target1Service, useFactory: () => 1 })
      .build();
    const ngModule2 = MockBuilder()
      .provide({ provide: Target1Service, useFactory: () => 2 })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('reuses the cache for the same provider alias', () => {
    const ngModule1 = MockBuilder()
      .provide({
        provide: Target1Service,
        useExisting: Target2Service,
      })
      .build();
    const ngModule2 = MockBuilder()
      .provide({
        provide: Target1Service,
        useExisting: Target2Service,
      })
      .build();

    expect(ngModule1.providers?.[0]).toBe(ngModule2.providers?.[0]);
  });
  it('invalidates the cache when the provider alias changes', () => {
    const ngModule1 = MockBuilder()
      .provide({
        provide: Target1Service,
        useExisting: Target1Service,
      })
      .build();
    const ngModule2 = MockBuilder()
      .provide({
        provide: Target1Service,
        useExisting: Target2Service,
      })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('reuses the cache for the same constructor provider object', () => {
    const def = { provide: Target1Service };
    const ngModule1 = MockBuilder().provide(def).build();
    const ngModule2 = MockBuilder().provide(def).build();

    expect(ngModule1.providers?.[0]).toBe(ngModule2.providers?.[0]);
  });
  it('invalidates the cache for a new constructor provider object', () => {
    const ngModule1 = MockBuilder()
      .provide({ provide: Target1Service })
      .build();
    const ngModule2 = MockBuilder()
      .provide({ provide: Target1Service })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('invalidates the cache when the multi provider flag changes', () => {
    const ngModule1 = MockBuilder()
      .provide({ provide: Target1Service, useValue: 1 })
      .build();
    const ngModule2 = MockBuilder()
      .provide({ provide: Target1Service, useValue: 1, multi: true })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('reuses the cache for equal multi providers', () => {
    const ngModule1 = MockBuilder()
      .provide({ provide: Target1Service, useValue: 1, multi: true })
      .build();
    const ngModule2 = MockBuilder()
      .provide({ provide: Target1Service, useValue: 1, multi: true })
      .build();

    expect(ngModule1.providers?.[0]).toBe(ngModule2.providers?.[0]);
  });
  it('invalidates the cache when a multi provider is added', () => {
    const ngModule1 = MockBuilder()
      .provide({ provide: Target1Service, useValue: 1, multi: true })
      .build();
    const ngModule2 = MockBuilder()
      .provide({ provide: Target1Service, useValue: 1, multi: true })
      .provide({ provide: Target1Service, useValue: 2, multi: true })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('invalidates the cache when a multi provider value changes', () => {
    const ngModule1 = MockBuilder()
      .provide({ provide: Target1Service, useValue: 1, multi: true })
      .build();
    const ngModule2 = MockBuilder()
      .provide({ provide: Target1Service, useValue: 2, multi: true })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });

  it('reuses the cache for equal module providers', () => {
    const ngModule1 = MockBuilder()
      .keep({
        ngModule: Target1Module,
        providers: [
          {
            provide: TARGET1_TOKEN,
            useValue: 1,
          },
        ],
      })
      .build();
    const ngModule2 = MockBuilder()
      .keep({
        ngModule: Target1Module,
        providers: [
          {
            provide: TARGET1_TOKEN,
            useValue: 1,
          },
        ],
      })
      .build();

    expect(ngModule1.imports?.[0]).toBe(ngModule2.imports?.[0]);
  });
  it('invalidates the cache when a module provider is added', () => {
    const ngModule1 = MockBuilder().keep(Target1Module).build();
    const ngModule2 = MockBuilder()
      .keep({
        ngModule: Target1Module,
        providers: [
          {
            provide: TARGET1_TOKEN,
            useValue: 1,
          },
        ],
      })
      .build();

    expect(ngModule1.imports?.[0]).not.toBe(ngModule2.imports?.[0]);
  });
  it('invalidates the cache when providers move between modules', () => {
    const ngModule1 = MockBuilder()
      .keep(Target2Module)
      .keep({
        ngModule: Target1Module,
        providers: [
          {
            provide: TARGET2_TOKEN,
            useValue: 1,
          },
        ],
      })
      .build();
    const ngModule2 = MockBuilder()
      .keep(Target1Module)
      .keep({
        ngModule: Target2Module,
        providers: [
          {
            provide: TARGET2_TOKEN,
            useValue: 1,
          },
        ],
      })
      .build();

    expect(ngModule1.imports?.[0]).not.toBe(ngModule2.imports?.[0]);
  });
  it('invalidates the cache when a module provider value changes', () => {
    const ngModule1 = MockBuilder()
      .keep({
        ngModule: Target1Module,
        providers: [
          {
            provide: TARGET1_TOKEN,
            useValue: 1,
          },
        ],
      })
      .build();
    const ngModule2 = MockBuilder()
      .keep({
        ngModule: Target1Module,
        providers: [
          {
            provide: TARGET1_TOKEN,
            useValue: 2,
          },
        ],
      })
      .build();

    expect(ngModule1.imports?.[0]).not.toBe(ngModule2.imports?.[0]);
  });
  it('invalidates the cache when a module provider multi flag changes', () => {
    const ngModule1 = MockBuilder()
      .keep({
        ngModule: Target1Module,
        providers: [
          {
            multi: true,
            provide: TARGET1_TOKEN,
            useValue: 1,
          },
        ],
      })
      .build();
    const ngModule2 = MockBuilder()
      .keep({
        ngModule: Target1Module,
        providers: [
          {
            provide: TARGET1_TOKEN,
            useValue: 1,
          },
        ],
      })
      .build();

    expect(ngModule1.imports?.[0]).not.toBe(ngModule2.imports?.[0]);
  });

  it('reuses the cache for equal mock values', () => {
    const ngModule1 = MockBuilder()
      .mock(Target1Module)
      .mock(Target1Service, 1)
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module)
      .mock(Target1Service, 1)
      .build();

    expect(ngModule1.providers?.[0]).toBe(ngModule2.providers?.[0]);
  });
  it('invalidates the cache when an explicit mock value is added', () => {
    const ngModule1 = MockBuilder()
      .mock(Target1Module)
      .mock(Target1Service)
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module)
      .mock(Target1Service, 1)
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('invalidates the cache when mock values move between services', () => {
    const ngModule1 = MockBuilder()
      .mock(Target1Module)
      .mock(Target1Service)
      .mock(Target2Service, 2)
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module)
      .mock(Target2Service)
      .mock(Target1Service, 1)
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('invalidates the cache when a mock value changes', () => {
    const ngModule1 = MockBuilder()
      .mock(Target1Module)
      .mock(Target1Service, 1)
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module)
      .mock(Target1Service, 2)
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
});
