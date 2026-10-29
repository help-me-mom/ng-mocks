import { Component, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockComponent, ngMocks } from 'ng-mocks';

@Injectable()
class Dependency {}

@Injectable()
class ViewDependency {}

const provider = { provide: Dependency, useClass: Dependency };
const viewProvider = {
  provide: ViewDependency,
  useClass: ViewDependency,
};

@Component({
  selector: 'native-recipe-child',
  standalone: true,
  providers: [provider],
  viewProviders: [viewProvider],
  template: '',
})
class ChildComponent {}

@Component({
  selector: 'native-recipe-host',
  standalone: true,
  imports: [ChildComponent],
  providers: [provider],
  viewProviders: [viewProvider],
  template: '<native-recipe-child></native-recipe-child>',
})
class HostComponent {}

const sharedProvider = {
  provide: Dependency,
  useClass: Dependency,
  multi: true,
};

@Component({
  selector: 'native-shared-recipe-host',
  standalone: true,
  imports: [ChildComponent],
  providers: [sharedProvider],
  viewProviders: [sharedProvider],
  template: '<native-recipe-child></native-recipe-child>',
})
class SharedHostComponent {}

describe('MockComponent:native provider recipe overrides', () => {
  beforeEach(() => {
    ngMocks.globalMock(Dependency);
    ngMocks.globalMock(ViewDependency);
  });

  afterEach(() => {
    ngMocks.globalWipe(Dependency);
    ngMocks.globalWipe(ViewDependency);
  });

  it('removes one shared multi recipe from both native provider scopes', async () => {
    await TestBed.configureTestingModule({
      imports: [SharedHostComponent],
    })
      .overrideComponent(SharedHostComponent, {
        remove: {
          providers: [sharedProvider],
          viewProviders: [sharedProvider],
        },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(SharedHostComponent);
    fixture.detectChanges();

    expect(
      fixture.debugElement.injector.get(Dependency, null),
    ).toBeNull();
    expect(sharedProvider.multi).toBe(true);
    expect(sharedProvider.useClass).toBe(Dependency);
  });

  it('removes every generated recipe when one original multi recipe is shared by both scopes', async () => {
    await TestBed.configureTestingModule({
      imports: [SharedHostComponent, MockComponent(ChildComponent)],
    })
      .overrideComponent(SharedHostComponent, {
        remove: {
          providers: [sharedProvider],
          viewProviders: [sharedProvider],
        },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(SharedHostComponent);
    fixture.detectChanges();

    expect(
      fixture.debugElement.injector.get(Dependency, null),
    ).toBeNull();
    expect(
      isMockOf(
        ngMocks
          .find(fixture, ChildComponent)
          .injector.get(Dependency),
        Dependency,
      ),
    ).toBe(true);
    expect(sharedProvider.multi).toBe(true);
    expect(sharedProvider.useClass).toBe(Dependency);
  });

  it('removes a provider recipe without mocks and preserves the view provider', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] })
      .overrideComponent(HostComponent, {
        remove: { providers: [provider] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(
      fixture.debugElement.injector.get(Dependency, null),
    ).toBeNull();
    expect(
      isMockOf(
        fixture.debugElement.injector.get(ViewDependency),
        ViewDependency,
      ),
    ).toBe(false);
  });

  it('removes a view provider recipe without mocks and preserves the provider', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] })
      .overrideComponent(HostComponent, {
        remove: { viewProviders: [viewProvider] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(
      fixture.debugElement.injector.get(ViewDependency, null),
    ).toBeNull();
    expect(
      isMockOf(
        fixture.debugElement.injector.get(Dependency),
        Dependency,
      ),
    ).toBe(false);
  });

  it('removes a rewritten provider recipe after mixed configuration', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, MockComponent(ChildComponent)],
    })
      .overrideComponent(HostComponent, {
        remove: { providers: [provider] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(
      fixture.debugElement.injector.get(Dependency, null),
    ).toBeNull();
    expect(fixture.debugElement.providerTokens).not.toContain(
      Dependency,
    );
    expect(TestBed.inject(Dependency, null)).toBeNull();
    expect(
      isMockOf(
        ngMocks
          .find(fixture, ChildComponent)
          .injector.get(Dependency),
        Dependency,
      ),
    ).toBe(true);
    expect(
      isMockOf(
        fixture.debugElement.injector.get(ViewDependency),
        ViewDependency,
      ),
    ).toBe(true);
  });

  it('removes a rewritten view provider recipe after mixed configuration', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, MockComponent(ChildComponent)],
    })
      .overrideComponent(HostComponent, {
        remove: { viewProviders: [viewProvider] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(
      fixture.debugElement.injector.get(ViewDependency, null),
    ).toBeNull();
    expect(fixture.debugElement.providerTokens).not.toContain(
      ViewDependency,
    );
    expect(TestBed.inject(ViewDependency, null)).toBeNull();
    expect(
      isMockOf(
        ngMocks
          .find(fixture, ChildComponent)
          .injector.get(ViewDependency),
        ViewDependency,
      ),
    ).toBe(true);
    expect(
      isMockOf(
        fixture.debugElement.injector.get(Dependency),
        Dependency,
      ),
    ).toBe(true);
  });

  it('removes an equivalent provider recipe before mixed configuration', async () => {
    const mock = MockComponent(ChildComponent);
    TestBed.overrideComponent(HostComponent, {
      remove: {
        providers: [{ provide: Dependency, useClass: Dependency }],
      },
    });
    await TestBed.configureTestingModule({
      imports: [HostComponent, mock],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(
      fixture.debugElement.injector.get(Dependency, null),
    ).toBeNull();
    expect(fixture.debugElement.providerTokens).not.toContain(
      Dependency,
    );
    expect(TestBed.inject(Dependency, null)).toBeNull();
    expect(
      isMockOf(
        ngMocks
          .find(fixture, ChildComponent)
          .injector.get(Dependency),
        Dependency,
      ),
    ).toBe(true);
    expect(
      isMockOf(
        fixture.debugElement.injector.get(ViewDependency),
        ViewDependency,
      ),
    ).toBe(true);
    expect(provider.useClass).toBe(Dependency);
  });

  it('removes an equivalent view provider recipe before mixed configuration', async () => {
    const mock = MockComponent(ChildComponent);
    TestBed.overrideComponent(HostComponent, {
      remove: {
        viewProviders: [
          { provide: ViewDependency, useClass: ViewDependency },
        ],
      },
    });
    await TestBed.configureTestingModule({
      imports: [HostComponent, mock],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(
      fixture.debugElement.injector.get(ViewDependency, null),
    ).toBeNull();
    expect(fixture.debugElement.providerTokens).not.toContain(
      ViewDependency,
    );
    expect(TestBed.inject(ViewDependency, null)).toBeNull();
    expect(
      isMockOf(
        ngMocks
          .find(fixture, ChildComponent)
          .injector.get(ViewDependency),
        ViewDependency,
      ),
    ).toBe(true);
    expect(
      isMockOf(
        fixture.debugElement.injector.get(Dependency),
        Dependency,
      ),
    ).toBe(true);
    expect(viewProvider.useClass).toBe(ViewDependency);
  });
});
