import {
  Component,
  Inject,
  InjectionToken,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockModule, ngMocks } from 'ng-mocks';

const VALUE = new InjectionToken<number>('native-excluded-wrapper');
const EXCLUDED = new InjectionToken<number>(
  'native-excluded-sibling',
);

@Component({
  selector: 'native-excluded-child',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'original',
})
class ChildComponent {}

@NgModule({
  declarations: [ChildComponent],
  exports: [ChildComponent],
})
class DependencyModule {}

const dependency = {
  ngModule: DependencyModule,
  providers: [{ provide: VALUE, useValue: 0 }],
};

@NgModule({ providers: [{ provide: EXCLUDED, useValue: 1 }] })
class ExcludedModule {
  public static constructed = 0;
  public constructor() {
    ExcludedModule.constructed += 1;
  }
}

@Component({
  selector: 'native-excluded-child',
  host: { 'data-excluded-replacement': '' },
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
  selector: 'native-excluded-host',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template:
    '{{ value }}:<native-excluded-child></native-excluded-child>',
})
class HostComponent {
  public constructor(@Inject(VALUE) public readonly value: number) {}
}

@NgModule({
  imports: [dependency, ExcludedModule],
  declarations: [HostComponent],
})
class HostModule {}

describe('MockModule:native wrapper with excluded sibling', () => {
  afterEach(() => ngMocks.globalWipe(ExcludedModule));

  it('retains exclusion while rebasing a kept clone and replacing its wrapper', async () => {
    ExcludedModule.constructed = 0;
    ngMocks.globalExclude(ExcludedModule);
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
    expect(
      fixture.debugElement.injector.get(EXCLUDED, null),
    ).toBeNull();
    expect(ExcludedModule.constructed).toBe(0);
    expect(dependency.providers[0].useValue).toBe(0);
  });
});
