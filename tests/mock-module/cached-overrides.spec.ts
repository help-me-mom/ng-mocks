import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockComponent, MockModule, ngMocks } from 'ng-mocks';

@Component({
  selector: 'cached-native-child',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'original',
})
class ChildComponent {}

@Component({
  selector: 'cached-native-child',
  host: { 'data-cached-native': '' },
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'replacement',
})
class ReplacementComponent {}

@NgModule({
  declarations: [ChildComponent],
  exports: [ChildComponent],
})
class DependencyModule {}

@Component({
  selector: 'cached-native-host',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '<cached-native-child></cached-native-child>',
})
class HostComponent {}

@NgModule({
  imports: [DependencyModule],
  declarations: [HostComponent],
})
class HostModule {}

describe('MockModule:cached native overrides', () => {
  afterEach(() => ngMocks.globalWipe(ChildComponent));

  it('removes the cached declaration in a native-only configuration', async () => {
    const module = MockModule(DependencyModule);
    const child = MockComponent(ChildComponent);
    await TestBed.configureTestingModule({ imports: [module] })
      .overrideModule(module, {
        remove: { declarations: [child], exports: [child] },
        add: {
          declarations: [ReplacementComponent, HostComponent],
          exports: [ReplacementComponent],
        },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('replacement');
    expect(ngMocks.find(fixture, ChildComponent, null)).toBeNull();
  });

  it('removes the current kept declaration when native removal addresses its cached mock', async () => {
    const module = MockModule(DependencyModule);
    const child = MockComponent(ChildComponent);
    ngMocks.globalKeep(ChildComponent);
    await TestBed.configureTestingModule({
      imports: [HostModule, module],
    })
      .overrideModule(module, {
        remove: { declarations: [child], exports: [child] },
        add: {
          declarations: [ReplacementComponent],
          exports: [ReplacementComponent],
        },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('replacement');
    expect(ngMocks.find(fixture, ChildComponent, null)).toBeNull();
  });
});
