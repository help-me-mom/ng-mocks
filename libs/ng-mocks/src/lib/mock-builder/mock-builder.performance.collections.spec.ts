import { Component, Directive, NgModule } from '@angular/core';

import { ngMocks } from '../mock-helper/mock-helper';

import { MockBuilder } from './mock-builder';

@Component({
  selector: 'target1',
  standalone: false,
  template: 'target1',
})
class Target1Component {}

@Directive({
  selector: '[target1]',
  standalone: false,
})
class Target1Directive {}

@NgModule({
  declarations: [Target1Component, Target1Directive],
})
class Target1Module {}

@Component({
  selector: 'target2',
  standalone: false,
  template: 'target2',
})
class Target2Component {}

@Directive({
  selector: '[target2]',
  standalone: false,
})
class Target2Directive {}

@NgModule({
  declarations: [Target2Component, Target2Directive],
})
class Target2Module {}

describe('MockBuilderPerformance:collections', () => {
  afterEach(ngMocks.reset);

  it('reuses the cache for the same compilation callback', () => {
    const beforeCC = () => undefined;

    const ngModule1 = MockBuilder()
      .mock(Target1Module)
      .beforeCompileComponents(beforeCC)
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module)
      .beforeCompileComponents(beforeCC)
      .build();

    expect(ngModule1.imports?.[0]).toBe(ngModule2.imports?.[0]);
  });
  it('invalidates the cache when a compilation callback is added', () => {
    const beforeCC = () => undefined;

    const ngModule1 = MockBuilder().mock(Target1Module).build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module)
      .beforeCompileComponents(beforeCC)
      .build();

    expect(ngModule1.imports?.[0]).not.toBe(ngModule2.imports?.[0]);
  });
  it('invalidates the cache when the compilation callback changes', () => {
    const beforeCC1 = () => undefined;
    const beforeCC2 = () => undefined;

    const ngModule1 = MockBuilder()
      .mock(Target1Module)
      .beforeCompileComponents(beforeCC1)
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module)
      .beforeCompileComponents(beforeCC2)
      .build();

    expect(ngModule1.imports?.[0]).not.toBe(ngModule2.imports?.[0]);
  });

  it('reuses the cache for the same kept module', () => {
    const ngModule1 = MockBuilder().keep(Target1Module).build();
    const ngModule2 = MockBuilder().keep(Target1Module).build();

    expect(ngModule1.imports?.[0]).toBe(ngModule2.imports?.[0]);
  });
  it('invalidates the cache when a kept module is added', () => {
    const ngModule1 = MockBuilder().build();
    const ngModule2 = MockBuilder().keep(Target1Module).build();

    expect(ngModule1.imports?.[0]).not.toBe(ngModule2.imports?.[0]);
  });
  it('invalidates the cache when the kept module changes', () => {
    const ngModule1 = MockBuilder().keep(Target1Module).build();
    const ngModule2 = MockBuilder().keep(Target2Module).build();

    expect(ngModule1.imports?.[0]).not.toBe(ngModule2.imports?.[0]);
  });

  it('reuses the cache for the same replacement', () => {
    const ngModule1 = MockBuilder()
      .keep(Target1Module)
      .replace(Target1Component, Target2Component)
      .build();
    const ngModule2 = MockBuilder()
      .keep(Target1Module)
      .replace(Target1Component, Target2Component)
      .build();

    expect(ngModule1.imports?.[0]).toBe(ngModule2.imports?.[0]);
  });
  it('invalidates the cache when a replacement is added', () => {
    const ngModule1 = MockBuilder().keep(Target1Module).build();
    const ngModule2 = MockBuilder()
      .keep(Target1Module)
      .replace(Target1Component, Target2Component)
      .build();

    expect(ngModule1.imports?.[0]).not.toBe(ngModule2.imports?.[0]);
  });
  it('invalidates the cache when another declaration is replaced', () => {
    const ngModule1 = MockBuilder()
      .keep(Target1Module)
      .replace(Target1Component, Target2Component)
      .build();
    const ngModule2 = MockBuilder()
      .keep(Target1Module)
      .replace(Target1Directive, Target2Directive)
      .build();

    expect(ngModule1.imports?.[0]).not.toBe(ngModule2.imports?.[0]);
  });

  it('reuses the cache for the same excluded declaration', () => {
    const ngModule1 = MockBuilder()
      .keep(Target1Module)
      .exclude(Target1Component)
      .build();
    const ngModule2 = MockBuilder()
      .keep(Target1Module)
      .exclude(Target1Component)
      .build();

    expect(ngModule1.imports?.[0]).toBe(ngModule2.imports?.[0]);
  });
  it('invalidates the cache when an exclusion is added', () => {
    const ngModule1 = MockBuilder().keep(Target1Module).build();
    const ngModule2 = MockBuilder()
      .keep(Target1Module)
      .exclude(Target1Component)
      .build();

    expect(ngModule1.imports?.[0]).not.toBe(ngModule2.imports?.[0]);
  });
  it('invalidates the cache when the excluded declaration changes', () => {
    const ngModule1 = MockBuilder()
      .keep(Target1Module)
      .exclude(Target1Component)
      .build();
    const ngModule2 = MockBuilder()
      .keep(Target1Module)
      .exclude(Target2Component)
      .build();

    expect(ngModule1.imports?.[0]).not.toBe(ngModule2.imports?.[0]);
  });

  it('reuses the cache for the same mocked declarations', () => {
    const ngModule1 = MockBuilder()
      .mock(Target1Module)
      .mock(Target1Component)
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module)
      .mock(Target1Component)
      .build();

    expect(ngModule1.imports?.[0]).toBe(ngModule2.imports?.[0]);
  });
  it('invalidates the cache when a mocked module is added', () => {
    const ngModule1 = MockBuilder().build();
    const ngModule2 = MockBuilder().mock(Target1Module).build();

    expect(ngModule1.imports?.[0]).not.toBe(ngModule2.imports?.[0]);
  });
  it('invalidates the cache when the mocked module changes', () => {
    const ngModule1 = MockBuilder().mock(Target1Module).build();
    const ngModule2 = MockBuilder().mock(Target2Module).build();

    expect(ngModule1.imports?.[0]).not.toBe(ngModule2.imports?.[0]);
  });
});
