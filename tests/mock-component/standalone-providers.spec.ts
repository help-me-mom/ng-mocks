import { Component, Injectable, InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockComponent, ngMocks } from 'ng-mocks';

const ALIAS = new InjectionToken<object>('explicit-component-alias');

@Injectable()
class Dependency {
  public static constructed = 0;

  public constructor() {
    Dependency.constructed += 1;
  }
}

@Injectable()
class ViewDependency {
  public static constructed = 0;
  public readonly value = 0;

  public constructor() {
    ViewDependency.constructed += 1;
  }
}

@Component({
  selector: 'explicit-provider-kept',
  standalone: true,
  template: 'kept',
})
class KeptComponent {}

@Component({
  selector: 'explicit-provider-child',
  standalone: true,
  imports: [KeptComponent],
  template: '',
  providers: [
    Dependency,
    { provide: ALIAS, useExisting: ChildComponent },
  ],
  viewProviders: [ViewDependency],
})
class ChildComponent {}

@Component({
  selector: 'explicit-provider-host',
  standalone: true,
  imports: [ChildComponent],
  template: '<explicit-provider-child></explicit-provider-child>',
})
class HostComponent {}

@Component({
  selector: 'explicit-provider-override-host',
  standalone: true,
  imports: [ChildComponent],
  providers: [Dependency],
  viewProviders: [ViewDependency],
  template: '<explicit-provider-child></explicit-provider-child>',
})
class ProviderHostComponent {}

describe('MockComponent:standalone providers', () => {
  beforeEach(() => {
    Dependency.constructed = 0;
    ViewDependency.constructed = 0;
  });

  afterEach(() => {
    ngMocks.globalWipe(Dependency);
    ngMocks.globalWipe(ViewDependency);
    ngMocks.globalWipe(KeptComponent);
  });

  it('removes automatically mocked provider and view-provider class references', async () => {
    const mock = MockComponent(ChildComponent);
    ngMocks.globalMock(Dependency);
    ngMocks.globalMock(ViewDependency);
    await TestBed.configureTestingModule({
      imports: [ProviderHostComponent, mock],
    })
      .overrideComponent(ProviderHostComponent, {
        remove: {
          providers: [Dependency],
          viewProviders: [ViewDependency],
        },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(ProviderHostComponent);
    fixture.detectChanges();
    const child = ngMocks.find(fixture, ChildComponent);

    expect(
      fixture.debugElement.injector.get(Dependency, null),
    ).toBeNull();
    expect(
      fixture.debugElement.injector.get(ViewDependency, null),
    ).toBeNull();
    expect(isMockOf(child.injector.get(Dependency), Dependency)).toBe(
      true,
    );
    expect(
      isMockOf(child.injector.get(ViewDependency), ViewDependency),
    ).toBe(true);
    expect(Dependency.constructed).toBe(0);
    expect(ViewDependency.constructed).toBe(0);
  });

  it('reuses the explicit class while mocking providers and retaining its own alias', async () => {
    const mock = MockComponent(ChildComponent);
    expect(MockComponent(ChildComponent)).toBe(mock);
    await TestBed.configureTestingModule({
      imports: [HostComponent, mock],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const child = ngMocks.find(fixture, ChildComponent);

    expect(child.providerTokens).toContain(mock);
    expect(child.injector.get(ALIAS)).toBe(child.componentInstance);
    expect(isMockOf(child.injector.get(Dependency), Dependency)).toBe(
      true,
    );
    expect(
      isMockOf(child.injector.get(ViewDependency), ViewDependency),
    ).toBe(true);
    expect(Dependency.constructed).toBe(0);
    expect(ViewDependency.constructed).toBe(0);
  });

  it('resolves current keep and exclude choices after the explicit class was cached', async () => {
    const mock = MockComponent(ChildComponent);
    // Reusing the class must not reuse the earlier provider resolution.
    ngMocks.globalKeep(KeptComponent);
    ngMocks.globalExclude(Dependency);
    await TestBed.configureTestingModule({
      imports: [HostComponent, mock],
    })
      .overrideComponent(mock, {
        set: {
          template:
            '<explicit-provider-kept></explicit-provider-kept>',
        },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const child = ngMocks.find(fixture, ChildComponent);

    expect(child.providerTokens).toContain(mock);
    expect(child.injector.get(ALIAS)).toBe(child.componentInstance);
    expect(child.injector.get(Dependency, null)).toBeNull();
    expect(
      isMockOf(
        ngMocks.findInstance(fixture, KeptComponent),
        KeptComponent,
      ),
    ).toBe(false);
    expect(ngMocks.formatText(fixture)).toBe('kept');
    expect(
      isMockOf(child.injector.get(ViewDependency), ViewDependency),
    ).toBe(true);
    expect(Dependency.constructed).toBe(0);
    expect(ViewDependency.constructed).toBe(0);
  });
});
