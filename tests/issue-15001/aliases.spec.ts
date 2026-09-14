import {
  Component,
  Directive,
  forwardRef,
  Inject,
  InjectionToken,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  isMockOf,
  MockComponent,
  MockDirective,
  ngMocks,
} from 'ng-mocks';

const ALIASES = new InjectionToken<
  Array<ProviderComponent | TargetDirective>
>('issue-15001 aliases');
const COMPONENT_ALIAS = new InjectionToken<ProviderComponent>(
  'issue-15001 component alias',
);
const DIRECTIVE_ALIAS = new InjectionToken<TargetDirective>(
  'issue-15001 directive alias',
);
const VIEW_ALIASES = new InjectionToken<ViewComponent[]>(
  'issue-15001 view aliases',
);
const VIEW_ALIAS = new InjectionToken<ViewComponent>(
  'issue-15001 view alias',
);
const DEPENDENCY = new InjectionToken<string>(
  'issue-15001 dependency',
);
let constructions = 0;
let methodCalls = 0;
let factoryCalls = 0;

@Component({
  providers: [
    {
      provide: ALIASES,
      useExisting: forwardRef(() => ProviderComponent),
      multi: true,
    },
    {
      provide: COMPONENT_ALIAS,
      useExisting: forwardRef(() => ProviderComponent),
    },
    {
      provide: DEPENDENCY,
      useFactory: () => {
        factoryCalls += 1;
        return 'provided dependency';
      },
    },
  ],
  selector: 'provider-15001',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'real component',
})
class ProviderComponent {
  public constructor(
    @Inject(DEPENDENCY) public readonly dependency: string,
  ) {
    constructions += 1;
  }

  public method(): string {
    methodCalls += 1;
    return 'real component method';
  }
}

@Directive({
  providers: [
    {
      provide: ALIASES,
      useExisting: forwardRef(() => TargetDirective),
      multi: true,
    },
    {
      provide: DIRECTIVE_ALIAS,
      useExisting: forwardRef(() => TargetDirective),
    },
  ],
  selector: '[directive-15001]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetDirective {
  public constructor(
    @Inject(DEPENDENCY) public readonly dependency: string,
  ) {
    constructions += 1;
  }

  public method(): string {
    methodCalls += 1;
    return 'real directive method';
  }
}

@Component({
  selector: 'host-aliases-15001',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '<provider-15001 directive-15001></provider-15001>',
})
class HostComponent {}

@Component({
  selector: 'view-aliases-15001',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'real view',
  viewProviders: [
    {
      provide: VIEW_ALIASES,
      useExisting: forwardRef(() => ViewComponent),
      multi: true,
    },
    {
      provide: VIEW_ALIAS,
      useExisting: forwardRef(() => ViewComponent),
    },
    {
      provide: DEPENDENCY,
      useFactory: () => {
        factoryCalls += 1;
        return 'view dependency';
      },
    },
  ],
})
class ViewComponent {
  public constructor(
    @Inject(DEPENDENCY) public readonly dependency: string,
  ) {
    constructions += 1;
  }

  public method(): string {
    methodCalls += 1;
    return 'real view method';
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15001
describe('issue-15001:aliases', () => {
  beforeEach(() => {
    constructions = 0;
    methodCalls = 0;
    factoryCalls = 0;
  });

  it('aggregates real component and directive self aliases in provider order', async () => {
    await TestBed.configureTestingModule({
      declarations: [
        HostComponent,
        ProviderComponent,
        TargetDirective,
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const element = ngMocks.find(fixture, ProviderComponent);
    const component = ngMocks.get(element, ProviderComponent);
    const directive = ngMocks.get(element, TargetDirective);
    const aliases = ngMocks.get(element, ALIASES);
    expect(Array.isArray(aliases)).toBe(true);
    expect(aliases.length).toBe(2);
    expect(aliases[0]).toBe(component);
    expect(aliases[1]).toBe(directive);
    expect(ngMocks.get(element, ALIASES)).toBe(aliases);
    expect(ngMocks.get(element, COMPONENT_ALIAS)).toBe(component);
    expect(ngMocks.get(element, DIRECTIVE_ALIAS)).toBe(directive);
    expect(isMockOf(component, ProviderComponent)).toBe(false);
    expect(isMockOf(directive, TargetDirective)).toBe(false);
    expect(component.dependency).toBe('provided dependency');
    expect(directive.dependency).toBe(component.dependency);
    expect(component.method()).toBe('real component method');
    expect(directive.method()).toBe('real directive method');
    expect(ngMocks.formatText(fixture)).toBe('real component');
    expect(constructions).toBe(2);
    expect(methodCalls).toBe(2);
    expect(factoryCalls).toBe(1);
  });

  it('aggregates mocked component and directive instances without executing their real behavior', async () => {
    await TestBed.configureTestingModule({
      declarations: [
        HostComponent,
        MockComponent(ProviderComponent),
        MockDirective(TargetDirective),
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const element = ngMocks.find(fixture, ProviderComponent);
    const component = ngMocks.get(element, ProviderComponent);
    const directive = ngMocks.get(element, TargetDirective);
    // Each declaration contributes its own alias, without keeping other multi-token recipes.
    const aliases = ngMocks.get(element, ALIASES);
    expect(Array.isArray(aliases)).toBe(true);
    expect(aliases.length).toBe(2);
    expect(aliases[0]).toBe(component);
    expect(aliases[1]).toBe(directive);
    expect(ngMocks.get(element, ALIASES)).toBe(aliases);
    expect(ngMocks.get(element, COMPONENT_ALIAS)).toBe(component);
    expect(ngMocks.get(element, DIRECTIVE_ALIAS)).toBe(directive);
    expect(isMockOf(component, ProviderComponent)).toBe(true);
    expect(isMockOf(directive, TargetDirective)).toBe(true);
    expect(component.method()).toBeUndefined();
    expect(directive.method()).toBeUndefined();
    expect(ngMocks.get(element, DEPENDENCY)).not.toBe(
      'provided dependency',
    );
    expect(ngMocks.formatText(fixture)).toBe('');
    expect(constructions).toBe(0);
    expect(methodCalls).toBe(0);
    expect(factoryCalls).toBe(0);
  });

  it('resolves real view-provider self aliases as an array and a scalar', async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(ViewComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const aliases = ngMocks.get(fixture.debugElement, VIEW_ALIASES);
    expect(Array.isArray(aliases)).toBe(true);
    expect(aliases.length).toBe(1);
    expect(aliases[0]).toBe(component);
    expect(ngMocks.get(fixture.debugElement, VIEW_ALIASES)).toBe(
      aliases,
    );
    expect(ngMocks.get(fixture.debugElement, VIEW_ALIAS)).toBe(
      component,
    );
    expect(isMockOf(component, ViewComponent)).toBe(false);
    expect(component.dependency).toBe('view dependency');
    expect(component.method()).toBe('real view method');
    expect(ngMocks.formatText(fixture)).toBe('real view');
    expect(constructions).toBe(1);
    expect(methodCalls).toBe(1);
    expect(factoryCalls).toBe(1);
  });

  it('resolves mocked view-provider aliases to the same mock instance', async () => {
    const mock = MockComponent(ViewComponent);
    await TestBed.configureTestingModule({
      declarations: [mock],
    }).compileComponents();
    const fixture = TestBed.createComponent(mock);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const aliases = ngMocks.get(fixture.debugElement, VIEW_ALIASES);
    expect(Array.isArray(aliases)).toBe(true);
    expect(aliases.length).toBe(1);
    expect(aliases[0]).toBe(component);
    expect(ngMocks.get(fixture.debugElement, VIEW_ALIASES)).toBe(
      aliases,
    );
    expect(ngMocks.get(fixture.debugElement, VIEW_ALIAS)).toBe(
      component,
    );
    expect(isMockOf(component, ViewComponent)).toBe(true);
    expect(component.method()).toBeUndefined();
    expect(ngMocks.get(fixture.debugElement, DEPENDENCY)).not.toBe(
      'view dependency',
    );
    expect(ngMocks.formatText(fixture)).toBe('');
    expect(constructions).toBe(0);
    expect(methodCalls).toBe(0);
    expect(factoryCalls).toBe(0);
  });
});
