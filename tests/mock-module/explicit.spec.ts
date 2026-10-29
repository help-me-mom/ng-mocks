import {
  Component,
  Inject,
  Injectable,
  InjectionToken,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  getMockedNgDefOf,
  isMockOf,
  MockModule,
  ngMocks,
} from 'ng-mocks';

const VALUE = new InjectionToken<number>('explicit-module-value');
const MULTI = new InjectionToken<number[]>('explicit-module-multi');

@Injectable()
class Dependency {
  public static constructed = 0;

  public constructor() {
    Dependency.constructed += 1;
  }

  public read(): string {
    return 'real';
  }
}

class ConfiguredDependency {
  public read(): string {
    return 'configured';
  }
}

@NgModule({ providers: [Dependency] })
class DependencyModule {}

@Component({
  selector: 'explicit-module-host',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ dependency.read() }}:{{ value }}',
})
class HostComponent {
  public constructor(
    public readonly dependency: Dependency,
    @Inject(VALUE) public readonly value: number,
    @Inject(MULTI) public readonly multi: number[],
  ) {}
}

@NgModule({
  imports: [DependencyModule],
  declarations: [HostComponent],
})
class HostModule {}

describe('MockModule:explicit class', () => {
  beforeEach(() => {
    Dependency.constructed = 0;
  });

  it('retains the supplied module and native provider recipes', async () => {
    const mock = MockModule(DependencyModule);
    // View Engine compiles plain useValue objects as literals; an instance
    // retains reference identity on every supported compiler profile.
    const dependency = new ConfiguredDependency();
    const valueProvider = {
      provide: Dependency,
      useValue: dependency,
    };
    let factoryCalls = 0;
    const providers = [
      valueProvider,
      {
        provide: VALUE,
        useFactory: () => {
          factoryCalls += 1;

          return 0;
        },
      },
      { provide: MULTI, useValue: 0, multi: true },
      { provide: MULTI, useValue: 2, multi: true },
    ];
    TestBed.overrideModule(mock, { set: { providers } });
    await TestBed.configureTestingModule({
      imports: [HostModule, mock],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.dependency).toBe(dependency);
    expect(fixture.componentInstance.value).toBe(0);
    expect(fixture.componentInstance.multi).toEqual([0, 2]);
    expect(factoryCalls).toBe(1);
    expect(Dependency.constructed).toBe(0);
    expect(ngMocks.formatText(fixture)).toBe('configured:0');
    expect(getMockedNgDefOf(DependencyModule, 'm')).toBe(mock);
    expect(valueProvider.useValue).toBe(dependency);
  });

  it('keeps services mocked without invoking their real constructors', async () => {
    const mock = MockModule(DependencyModule);
    await TestBed.configureTestingModule({
      imports: [HostModule, mock],
      providers: [
        { provide: VALUE, useValue: 0 },
        { provide: MULTI, useValue: 1, multi: true },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(
      isMockOf(fixture.componentInstance.dependency, Dependency),
    ).toBe(true);
    expect(
      fixture.componentInstance.dependency.read(),
    ).toBeUndefined();
    expect(fixture.componentInstance.value).toBe(0);
    expect(fixture.componentInstance.multi).toEqual([1]);
    expect(Dependency.constructed).toBe(0);
    expect(getMockedNgDefOf(DependencyModule, 'm')).toBe(mock);
  });
});
