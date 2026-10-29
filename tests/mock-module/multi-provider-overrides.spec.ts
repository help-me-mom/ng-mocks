import { Component, Injectable, InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockComponent, ngMocks } from 'ng-mocks';

@Injectable()
class FirstDependency {
  public static constructed = 0;
  public constructor() {
    FirstDependency.constructed += 1;
  }
}

@Injectable()
class SecondDependency {
  public static constructed = 0;
  public constructor() {
    SecondDependency.constructed += 1;
  }
}

const MULTI = new InjectionToken<
  Array<FirstDependency | SecondDependency | number>
>('native-multi-cardinality');
const first = {
  provide: MULTI,
  useClass: FirstDependency,
  multi: true,
};
const second = {
  provide: MULTI,
  useClass: SecondDependency,
  multi: true,
};
const added = { provide: MULTI, useValue: 2, multi: true };

@Component({
  selector: 'native-multi-child',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '',
})
class ChildComponent {}

@Component({
  selector: 'native-multi-host',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  providers: [first, second],
  template: '<native-multi-child></native-multi-child>',
})
class HostComponent {}

describe('MockModule:native provider cardinality', () => {
  beforeEach(() => {
    FirstDependency.constructed = 0;
    SecondDependency.constructed = 0;
    ngMocks.globalMock(MULTI);
  });
  afterEach(() => ngMocks.globalWipe(MULTI));

  it('preserves the surviving native contribution and an earlier native addition in order', async () => {
    await TestBed.configureTestingModule({
      declarations: [HostComponent, ChildComponent],
    })
      .overrideComponent(HostComponent, {
        add: { providers: [added] },
      })
      .overrideComponent(HostComponent, {
        remove: { providers: [first] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const values = fixture.debugElement.injector.get(MULTI);

    expect(values.length).toBe(2);
    expect(values[1]).toBe(2);
    expect(FirstDependency.constructed).toBe(0);
    expect(SecondDependency.constructed).toBe(1);
  });

  it('preserves one mock contribution when distinct recipes resolve to equivalent factories', async () => {
    await TestBed.configureTestingModule({
      declarations: [HostComponent, MockComponent(ChildComponent)],
    })
      .overrideComponent(HostComponent, {
        add: { providers: [added] },
      })
      .overrideComponent(HostComponent, {
        remove: { providers: [first] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const values = fixture.debugElement.injector.get(MULTI);

    expect(values.length).toBe(2);
    expect(values[1]).toBe(2);
    expect(FirstDependency.constructed).toBe(0);
    expect(SecondDependency.constructed).toBe(0);
    expect(first.useClass).toBe(FirstDependency);
    expect(second.useClass).toBe(SecondDependency);
  });

  it('retains the same contribution count and order when native operations precede configuration', async () => {
    const mock = MockComponent(ChildComponent);
    TestBed.overrideComponent(HostComponent, {
      add: { providers: [added] },
    });
    TestBed.overrideComponent(HostComponent, {
      remove: { providers: [first] },
    });
    await TestBed.configureTestingModule({
      declarations: [HostComponent, mock],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const values = fixture.debugElement.injector.get(MULTI);

    expect(values.length).toBe(2);
    expect(values[1]).toBe(2);
    expect(FirstDependency.constructed).toBe(0);
    expect(SecondDependency.constructed).toBe(0);
  });
});
