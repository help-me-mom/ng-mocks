import {
  Component,
  Directive,
  Injectable,
  InjectionToken,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  getMockedNgDefOf,
  isMockedNgDefOf,
  isMockOf,
  MockBuilder,
  MockRender,
  ngMocks,
} from 'ng-mocks';

const PROVIDER_VALUE = new InjectionToken<{ value: string }>(
  'getMockedNgDefOf provider value',
);
const PROVIDER_ALIAS = new InjectionToken<{ enabled: boolean }>(
  'getMockedNgDefOf provider alias',
);
const FALSY_VALUE = new InjectionToken<boolean>(
  'getMockedNgDefOf falsy provider',
);
const MULTI_VALUES = new InjectionToken<Array<number | string>>(
  'getMockedNgDefOf multi providers',
);

// View Engine copies literal provider values; class instances retain their identity.
class ProviderValue {
  public value = 'factory provider';
}

class AliasValue {
  public enabled = false;
}

@Injectable()
@Component({
  selector: 'injectable-lookup-component',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'real component',
})
class TargetComponent {
  public static constructed = 0;
  public value = 'real component';

  public constructor() {
    TargetComponent.constructed += 1;
  }
}

@Injectable()
@Directive({
  selector: '[injectableLookupDirective]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetDirective {
  public static constructed = 0;
  public enabled = true;

  public constructor() {
    TargetDirective.constructed += 1;
  }
}

@Injectable()
class TargetService {
  public static constructed = 0;
  public value = 'real service';

  public constructor() {
    TargetService.constructed += 1;
  }
}

@Injectable()
@NgModule({})
class TargetModule {
  public static constructed = 0;

  public constructor() {
    TargetModule.constructed += 1;
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15340
describe('getMockedNgDefOf:injectable-declarations', () => {
  beforeEach(() => {
    ngMocks.reset();
    TargetComponent.constructed = 0;
    TargetDirective.constructed = 0;
    TargetService.constructed = 0;
    TargetModule.constructed = 0;
  });
  afterEach(() => ngMocks.reset());

  it('returns a component mock while retaining its factory provider and dependency', async () => {
    const providerValue = new ProviderValue();
    let factoryCalls = 0;
    const metadata = MockBuilder()
      .mock(TargetComponent)
      .provide({ provide: PROVIDER_VALUE, useValue: providerValue })
      .provide({
        provide: TargetComponent,
        useFactory: (dependency: { value: string }) => {
          factoryCalls += 1;

          return dependency;
        },
        deps: [PROVIDER_VALUE],
      })
      .build();
    const mocks = metadata.declarations!.filter(declaration =>
      isMockedNgDefOf(declaration, TargetComponent, 'c'),
    );
    expect(mocks.length).toBeGreaterThan(0);
    const mock = mocks[0];
    await TestBed.configureTestingModule(
      metadata,
    ).compileComponents();

    const fixture = MockRender(
      '<injectable-lookup-component></injectable-lookup-component>',
    );
    const element = ngMocks.find(
      fixture,
      'injectable-lookup-component',
    );
    const component = element.componentInstance;

    expect(mock).toBeDefined();
    expect(mock).toBe(getMockedNgDefOf(TargetComponent, 'c'));
    expect(mock).toBe(getMockedNgDefOf(TargetComponent));
    expect(isMockOf(component, TargetComponent)).toBe(true);
    expect(ngMocks.formatText(fixture)).toBe('');
    expect(factoryCalls).toBe(0);

    // Declaration lookup must not replace the independent root provider recipe.
    expect(ngMocks.get(TargetComponent)).toBe(providerValue);
    expect(ngMocks.get(TargetComponent)).toBe(providerValue);
    expect(ngMocks.get(PROVIDER_VALUE)).toBe(providerValue);
    expect(factoryCalls).toBe(1);
    expect(ngMocks.get(element, TargetComponent)).toBe(component);
    expect(component).not.toBe(providerValue);
    expect(TargetComponent.constructed).toBe(0);
  });

  it('returns a directive mock while retaining its provider alias identity', async () => {
    const providerValue = new AliasValue();
    const metadata = MockBuilder()
      .mock(TargetDirective)
      .provide({ provide: PROVIDER_ALIAS, useValue: providerValue })
      .provide({
        provide: TargetDirective,
        useExisting: PROVIDER_ALIAS,
      })
      .build();
    const mocks = metadata.declarations!.filter(declaration =>
      isMockedNgDefOf(declaration, TargetDirective, 'd'),
    );
    expect(mocks.length).toBeGreaterThan(0);
    const mock = mocks[0];
    await TestBed.configureTestingModule(
      metadata,
    ).compileComponents();

    const fixture = MockRender(
      '<div injectableLookupDirective></div>',
    );
    const element = ngMocks.find(
      fixture,
      '[injectableLookupDirective]',
    );
    const directive = ngMocks.get(element, TargetDirective);

    expect(mock).toBeDefined();
    expect(mock).toBe(getMockedNgDefOf(TargetDirective, 'd'));
    expect(mock).toBe(getMockedNgDefOf(TargetDirective));
    expect(isMockOf(directive, TargetDirective)).toBe(true);
    expect(directive).not.toBe(providerValue);
    expect(ngMocks.get(TargetDirective)).toBe(providerValue);
    expect(ngMocks.get(TargetDirective)).toBe(
      ngMocks.get(PROVIDER_ALIAS),
    );
    expect(providerValue.enabled).toBe(false);
    expect(TargetDirective.constructed).toBe(0);
  });

  it('preserves provider-only mocks and falsy multi provider values', async () => {
    const metadata = MockBuilder()
      .mock(TargetComponent)
      .mock(TargetService, { value: 'mock service' })
      .provide({ provide: FALSY_VALUE, useValue: false })
      .provide([
        { provide: MULTI_VALUES, useValue: 0, multi: true },
        { provide: MULTI_VALUES, useValue: '', multi: true },
      ])
      .build();
    const mocks = metadata.declarations!.filter(declaration =>
      isMockedNgDefOf(declaration, TargetComponent, 'c'),
    );
    expect(mocks.length).toBeGreaterThan(0);
    const mock = mocks[0];
    await TestBed.configureTestingModule(
      metadata,
    ).compileComponents();

    const fixture = MockRender(
      '<injectable-lookup-component></injectable-lookup-component>',
    );
    const component = ngMocks.find(
      fixture,
      'injectable-lookup-component',
    ).componentInstance;
    const service = ngMocks.get(TargetService);

    expect(mock).toBeDefined();
    expect(mock).toBe(getMockedNgDefOf(TargetComponent, 'c'));
    expect(isMockOf(component, TargetComponent)).toBe(true);
    expect(ngMocks.get(TargetService)).toBe(service);
    expect(service.value).toBe('mock service');
    expect(ngMocks.get(FALSY_VALUE)).toBe(false);
    expect(ngMocks.get(MULTI_VALUES)).toEqual([0, '']);
    expect(TargetComponent.constructed).toBe(0);
    expect(TargetService.constructed).toBe(0);
  });

  it('returns an injectable module mock instead of its provider recipe', () => {
    const metadata = MockBuilder().mock(TargetModule).build();
    const mocks = metadata.imports!.filter(declaration =>
      isMockedNgDefOf(declaration, TargetModule, 'm'),
    );
    expect(mocks.length).toBeGreaterThan(0);
    const mock = mocks[0];
    TestBed.configureTestingModule(metadata);

    expect(mock).toBeDefined();
    expect(mock).toBe(getMockedNgDefOf(TargetModule, 'm'));
    expect(mock).toBe(getMockedNgDefOf(TargetModule));
    expect(TargetModule.constructed).toBe(0);
  });
});
