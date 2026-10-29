import {
  Component,
  Inject,
  InjectionToken,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockModule, ngMocks } from 'ng-mocks';

const VALUE = new InjectionToken<number>(
  'native-module-with-providers',
);

@Component({
  selector: 'native-providers-child',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'original',
})
class ChildComponent {}

@NgModule({
  declarations: [ChildComponent],
  exports: [ChildComponent],
})
class DependencyModule {}

const provider = { provide: VALUE, useValue: 0 };
const dependency = {
  ngModule: DependencyModule,
  providers: [provider],
};

@Component({
  selector: 'native-providers-child',
  host: { 'data-native-providers': '' },
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'replacement',
})
class ReplacementComponent {}

@NgModule({
  declarations: [ReplacementComponent],
  exports: [ReplacementComponent],
  providers: [{ provide: VALUE, useValue: 2 }],
})
class ReplacementModule {}

@Component({
  selector: 'native-providers-host',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template:
    '{{ value }}:<native-providers-child></native-providers-child>',
})
class HostComponent {
  public constructor(@Inject(VALUE) public readonly value: number) {}
}

@NgModule({ imports: [dependency], declarations: [HostComponent] })
class HostModule {}

describe('MockModule:native ModuleWithProviders overrides', () => {
  it('removes the resolved wrapper when a native replacement follows configuration', async () => {
    await TestBed.configureTestingModule({
      imports: [HostModule, MockModule(DependencyModule)],
    })
      .overrideModule(HostModule, {
        remove: { imports: [dependency] },
        add: { imports: [ReplacementModule] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('2:replacement');
    expect(ngMocks.find(fixture, ChildComponent, null)).toBeNull();
    expect(ngMocks.find(fixture, ReplacementComponent)).toBeDefined();
    expect(provider.useValue).toBe(0);
    expect(dependency.providers[0]).toBe(provider);
  });

  it('retains a native wrapper replacement made before configuration', async () => {
    const mock = MockModule(DependencyModule);
    TestBed.overrideModule(HostModule, {
      remove: { imports: [dependency] },
      add: { imports: [ReplacementModule] },
    });
    await TestBed.configureTestingModule({
      imports: [HostModule, mock],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('2:replacement');
    expect(ngMocks.find(fixture, ChildComponent, null)).toBeNull();
    expect(ngMocks.find(fixture, ReplacementComponent)).toBeDefined();
    expect(provider.useValue).toBe(0);
    expect(dependency.providers[0]).toBe(provider);
  });
});
