import { NgModule } from '@angular/core';

import { ngMocks } from '../mock-helper/mock-helper';

import { MockBuilder } from './mock-builder';

@NgModule({})
class Target1Module {}

@NgModule({})
class Target2Module {}

describe('MockBuilderPerformance:config', () => {
  afterEach(ngMocks.reset);

  it('reuses the cache for equal empty declaration options', () => {
    const ngModule1 = MockBuilder().keep(Target1Module, {}).build();
    const ngModule2 = MockBuilder().keep(Target1Module, {}).build();

    expect(ngModule1.providers?.[0]).toBe(ngModule2.providers?.[0]);
  });
  it('invalidates the cache when dependency options are added', () => {
    const ngModule1 = MockBuilder().keep(Target1Module).build();
    const ngModule2 = MockBuilder()
      .keep(Target1Module, { dependency: true })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('invalidates the cache when options move to another module', () => {
    const ngModule1 = MockBuilder()
      .keep(Target1Module)
      .keep(Target2Module, { dependency: true })
      .build();
    const ngModule2 = MockBuilder()
      .keep(Target2Module)
      .keep(Target1Module, { dependency: true })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('reuses the cache for the same declaration options object', () => {
    const config = {};
    const ngModule1 = MockBuilder()
      .keep(Target1Module, config)
      .build();
    const ngModule2 = MockBuilder()
      .keep(Target1Module, config)
      .build();

    expect(ngModule1.providers?.[0]).toBe(ngModule2.providers?.[0]);
  });
  it('invalidates the cache when the dependency flag changes', () => {
    const ngModule1 = MockBuilder()
      .keep(Target1Module, { dependency: true })
      .build();
    const ngModule2 = MockBuilder()
      .keep(Target1Module, { dependency: false })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('invalidates the cache when the export flag changes', () => {
    const ngModule1 = MockBuilder()
      .keep(Target1Module, { export: true })
      .build();
    const ngModule2 = MockBuilder()
      .keep(Target1Module, { export: false })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('invalidates the cache when the exportAll flag changes', () => {
    const ngModule1 = MockBuilder()
      .keep(Target1Module, { exportAll: true })
      .build();
    const ngModule2 = MockBuilder()
      .keep(Target1Module, { exportAll: false })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
});
