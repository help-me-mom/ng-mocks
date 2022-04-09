import {
  Component,
  Directive,
  Injectable,
  InjectionToken,
  NgModule,
} from '@angular/core';

import { ngMocks } from '../mock-helper/mock-helper';

import { MockBuilder } from './mock-builder';

const TARGET1_TOKEN = new InjectionToken('TARGET1');
const TARGET2_TOKEN = new InjectionToken('TARGET2');

@Component({
  selector: 'target1',
  template: 'target1',
})
class Target1Component {}

@Directive({
  selector: '[target1]',
})
class Target1Directive {}

@Injectable()
class Target1Service {}

@NgModule({
  declarations: [Target1Component, Target1Directive],
  providers: [Target1Service],
})
export class Target1Module {}

@Component({
  selector: 'target2',
  template: 'target2',
})
class Target2Component {}

@Directive({
  selector: '[target2]',
})
class Target2Directive {}

@Injectable()
class Target2Service {}

@NgModule({
  declarations: [Target2Component, Target2Directive],
  providers: [Target2Service],
})
export class Target2Module {}

describe('MockBuilderPerformance', () => {
  afterEach(ngMocks.reset);

  it('accepts the same beforeCC', () => {
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
  it('fails on a different size beforeCC', () => {
    const beforeCC = () => undefined;

    const ngModule1 = MockBuilder().mock(Target1Module).build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module)
      .beforeCompileComponents(beforeCC)
      .build();

    expect(ngModule1.imports?.[0]).not.toBe(ngModule2.imports?.[0]);
  });
  it('fails on a missed beforeCC', () => {
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

  it('accepts the same keepDef', () => {
    const ngModule1 = MockBuilder().keep(Target1Module).build();
    const ngModule2 = MockBuilder().keep(Target1Module).build();

    expect(ngModule1.imports?.[0]).toBe(ngModule2.imports?.[0]);
  });
  it('fails on a different size keepDef', () => {
    const ngModule1 = MockBuilder().build();
    const ngModule2 = MockBuilder().keep(Target1Module).build();

    expect(ngModule1.imports?.[0]).not.toBe(ngModule2.imports?.[0]);
  });
  it('fails on a missed keepDef', () => {
    const ngModule1 = MockBuilder().keep(Target1Module).build();
    const ngModule2 = MockBuilder().keep(Target2Module).build();

    expect(ngModule1.imports?.[0]).not.toBe(ngModule2.imports?.[0]);
  });

  it('accepts the same replaceDef', () => {
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
  it('fails on a different size replaceDef', () => {
    const ngModule1 = MockBuilder().keep(Target1Module).build();
    const ngModule2 = MockBuilder()
      .keep(Target1Module)
      .replace(Target1Component, Target2Component)
      .build();

    expect(ngModule1.imports?.[0]).not.toBe(ngModule2.imports?.[0]);
  });
  it('fails on a missed replaceDef', () => {
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

  it('accepts the same excludeDef', () => {
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
  it('fails on a different size excludeDef', () => {
    const ngModule1 = MockBuilder().keep(Target1Module).build();
    const ngModule2 = MockBuilder()
      .keep(Target1Module)
      .exclude(Target1Component)
      .build();

    expect(ngModule1.imports?.[0]).not.toBe(ngModule2.imports?.[0]);
  });
  it('fails on a missed excludeDef', () => {
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

  it('accepts the same mockDef', () => {
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
  it('fails on a different size mockDef', () => {
    const ngModule1 = MockBuilder().build();
    const ngModule2 = MockBuilder().mock(Target1Module).build();

    expect(ngModule1.imports?.[0]).not.toBe(ngModule2.imports?.[0]);
  });
  it('fails on a missed mockDef', () => {
    const ngModule1 = MockBuilder().mock(Target1Module).build();
    const ngModule2 = MockBuilder().mock(Target2Module).build();

    expect(ngModule1.imports?.[0]).not.toBe(ngModule2.imports?.[0]);
  });

  it('accepts the same providerDef', () => {
    const ngModule1 = MockBuilder().provide(Target1Service).build();
    const ngModule2 = MockBuilder().provide(Target1Service).build();

    expect(ngModule1.providers?.[0]).toBe(ngModule2.providers?.[0]);
  });
  it('fails on a different size providerDef', () => {
    const ngModule1 = MockBuilder().build();
    const ngModule2 = MockBuilder().provide(Target1Service).build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('fails on a missed providerDef', () => {
    const ngModule1 = MockBuilder().provide(Target1Service).build();
    const ngModule2 = MockBuilder().provide(Target2Service).build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('accepts on the same providerDef useValue', () => {
    const ngModule1 = MockBuilder()
      .provide({ provide: Target1Service, useValue: 1 })
      .build();
    const ngModule2 = MockBuilder()
      .provide({ provide: Target1Service, useValue: 1 })
      .build();

    expect(ngModule1.providers?.[0]).toBe(ngModule2.providers?.[0]);
  });
  it('fails on a different providerDef useValue', () => {
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
  it('accepts the same providerDef useValue', () => {
    const ngModule1 = MockBuilder()
      .provide({ provide: Target1Service, useClass: Target2Service })
      .build();
    const ngModule2 = MockBuilder()
      .provide({ provide: Target1Service, useClass: Target2Service })
      .build();

    expect(ngModule1.providers?.[0]).toBe(ngModule2.providers?.[0]);
  });
  it('fails on a different providerDef useValue', () => {
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
  it('accepts the same providerDef helperUseFactory', () => {
    const factory = () => 1;
    const ngModule1 = MockBuilder()
      .provide({ provide: Target1Service, useFactory: factory })
      .build();
    const ngModule2 = MockBuilder()
      .provide({ provide: Target1Service, useFactory: factory })
      .build();

    expect(ngModule1.providers?.[0]).toBe(ngModule2.providers?.[0]);
  });
  it('fails on a different providerDef helperUseFactory', () => {
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
  it('accepts the same providerDef useExisting', () => {
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
  it('fails on a different providerDef useExisting', () => {
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
  it('accepts the same providerDef', () => {
    const def = { provide: Target1Service };
    const ngModule1 = MockBuilder().provide(def).build();
    const ngModule2 = MockBuilder().provide(def).build();

    expect(ngModule1.providers?.[0]).toBe(ngModule2.providers?.[0]);
  });
  it('fails on a different providerDef', () => {
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
  it('fails on a different multi flags', () => {
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
  it('accepts the same multi flags', () => {
    const ngModule1 = MockBuilder()
      .provide({ provide: Target1Service, useValue: 1, multi: true })
      .build();
    const ngModule2 = MockBuilder()
      .provide({ provide: Target1Service, useValue: 1, multi: true })
      .build();

    expect(ngModule1.providers?.[0]).toBe(ngModule2.providers?.[0]);
  });
  it('fails on a different multi size', () => {
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
  it('fails on a different multi values', () => {
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

  it('accepts the same defProviders', () => {
    const ngModule1 = MockBuilder()
      .keep({
        ngModule: Target1Module,
        providers: [
          {
            provides: TARGET1_TOKEN,
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
            provides: TARGET1_TOKEN,
            useValue: 1,
          },
        ],
      })
      .build();

    expect(ngModule1.imports?.[0]).toBe(ngModule2.imports?.[0]);
  });
  it('fails on a different size defProviders', () => {
    const ngModule1 = MockBuilder().keep(Target1Module).build();
    const ngModule2 = MockBuilder()
      .keep({
        ngModule: Target1Module,
        providers: [
          {
            provides: TARGET1_TOKEN,
            useValue: 1,
          },
        ],
      })
      .build();

    expect(ngModule1.imports?.[0]).not.toBe(ngModule2.imports?.[0]);
  });
  it('fails on a missed defProviders', () => {
    const ngModule1 = MockBuilder()
      .keep(Target2Module)
      .keep({
        ngModule: Target1Module,
        providers: [
          {
            provides: TARGET2_TOKEN,
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
            provides: TARGET2_TOKEN,
            useValue: 1,
          },
        ],
      })
      .build();

    expect(ngModule1.imports?.[0]).not.toBe(ngModule2.imports?.[0]);
  });
  it('fails on a different defProviders', () => {
    const ngModule1 = MockBuilder()
      .keep({
        ngModule: Target1Module,
        providers: [
          {
            provides: TARGET1_TOKEN,
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
            provides: TARGET1_TOKEN,
            useValue: 2,
          },
        ],
      })
      .build();

    expect(ngModule1.imports?.[0]).not.toBe(ngModule2.imports?.[0]);
  });
  it('fails on the same defProviders but different multi', () => {
    const ngModule1 = MockBuilder()
      .keep({
        ngModule: Target1Module,
        providers: [
          {
            multi: true,
            provides: TARGET1_TOKEN,
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
            provides: TARGET1_TOKEN,
            useValue: 1,
          },
        ],
      })
      .build();

    expect(ngModule1.imports?.[0]).not.toBe(ngModule2.imports?.[0]);
  });

  it('accepts the same defValue', () => {
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
  it('fails on a different size defValue', () => {
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
  it('fails on a missed defValue', () => {
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
  it('fails on a different defValue', () => {
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

  it('accepts the same size configDef', () => {
    const ngModule1 = MockBuilder().keep(Target1Module, {}).build();
    const ngModule2 = MockBuilder().keep(Target1Module, {}).build();

    expect(ngModule1.providers?.[0]).toBe(ngModule2.providers?.[0]);
  });
  it('fails on a different size configDef', () => {
    const ngModule1 = MockBuilder().keep(Target1Module).build();
    const ngModule2 = MockBuilder().keep(Target1Module, {}).build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('fails on a missed configDef', () => {
    const ngModule1 = MockBuilder()
      .keep(Target1Module)
      .keep(Target2Module, {})
      .build();
    const ngModule2 = MockBuilder()
      .keep(Target2Module)
      .keep(Target1Module, {})
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('accepts the same configDef', () => {
    const config = {};
    const ngModule1 = MockBuilder()
      .keep(Target1Module, config)
      .build();
    const ngModule2 = MockBuilder()
      .keep(Target1Module, config)
      .build();

    expect(ngModule1.providers?.[0]).toBe(ngModule2.providers?.[0]);
  });
  it('fails on different dependency configDef', () => {
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
  it('fails on different export configDef', () => {
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
  it('fails on different exportAll configDef', () => {
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
  it('accepts the same render configDef', () => {
    const render = {};
    const ngModule1 = MockBuilder()
      .mock(Target1Module, { render })
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module, { render })
      .build();

    expect(ngModule1.providers?.[0]).toBe(ngModule2.providers?.[0]);
  });
  it('fails on different render flag configDef', () => {
    const ngModule1 = MockBuilder()
      .mock(Target1Module, { render: true })
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module, { render: false })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('fails on different render length configDef', () => {
    const ngModule1 = MockBuilder()
      .mock(Target1Module, { render: {} })
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module, {
        render: {
          variables: {},
        },
      })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('fails on different render.$implicit configDef', () => {
    const ngModule1 = MockBuilder()
      .mock(Target1Module, {
        render: {
          $implicit: true,
        },
      })
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module, {
        render: {
          $implicit: false,
        },
      })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('accepts the same render.variables configDef', () => {
    const variables = {};
    const ngModule1 = MockBuilder()
      .mock(Target1Module, {
        render: {
          variables,
        },
      })
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module, {
        render: {
          variables,
        },
      })
      .build();

    expect(ngModule1.providers?.[0]).toBe(ngModule2.providers?.[0]);
  });
  it('accepts equal render.variables configDef', () => {
    const ngModule1 = MockBuilder()
      .mock(Target1Module, {
        render: {
          variables: {
            flag: 1,
          },
        },
      })
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module, {
        render: {
          variables: {
            flag: 1,
          },
        },
      })
      .build();

    expect(ngModule1.providers?.[0]).toBe(ngModule2.providers?.[0]);
  });
  it('fails on missed definition configDef', () => {
    const ngModule1 = MockBuilder()
      .mock(Target1Module, { render: {} })
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module, {
        render: {
          variables: {
            flag: 2,
          },
        },
      })
      .build();
    const ngModule3 = MockBuilder()
      .mock(Target1Module, { render: {} })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
    expect(ngModule2.providers?.[0]).not.toBe(
      ngModule3.providers?.[0],
    );
  });
  it('fails on different render.variables configDef', () => {
    const ngModule1 = MockBuilder()
      .mock(Target1Module, {
        render: {
          variables: {
            flag: 1,
          },
        },
      })
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module, {
        render: {
          variables: {
            flag: 1,
            key: false,
          },
        },
      })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('fails on different values in render.variables configDef', () => {
    const ngModule1 = MockBuilder()
      .mock(Target1Module, {
        render: {
          variables: {
            flag: 1,
          },
        },
      })
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module, {
        render: {
          variables: {
            flag: 2,
          },
        },
      })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('fails on different amount of blocks in render configDef', () => {
    const ngModule1 = MockBuilder()
      .mock(Target1Module, {
        render: {
          block1: {},
        },
      })
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module, {
        render: {
          block1: {},
          block2: {},
        },
      })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('fails on different block definitions in render configDef', () => {
    const ngModule1 = MockBuilder()
      .mock(Target1Module, {
        render: {
          block1: {
            $implicit: true,
          },
        },
      })
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module, {
        render: {
          block1: {
            $implicit: false,
          },
        },
      })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
});
