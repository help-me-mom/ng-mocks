import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockModule, ngMocks } from 'ng-mocks';

@Component({
  selector: 'nested-native-child',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'original',
})
class ChildComponent {}

@NgModule({
  declarations: [ChildComponent],
  exports: [ChildComponent],
})
class DependencyModule {}

@Component({
  selector: 'nested-native-child',
  host: { 'data-nested-native': '' },
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'replacement',
})
class ReplacementComponent {}

@NgModule({
  declarations: [ReplacementComponent],
  exports: [ReplacementComponent],
})
class ReplacementModule {}

@Component({
  selector: 'nested-native-host',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '<nested-native-child></nested-native-child>',
})
class HostComponent {}

const imports = [DependencyModule];

@NgModule({ imports: [imports], declarations: [HostComponent] })
class HostModule {}

@Component({
  selector: 'repeated-nested-native-host',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '<nested-native-child></nested-native-child>',
})
class RepeatedHostComponent {}

@NgModule({
  imports: [imports, DependencyModule],
  declarations: [RepeatedHostComponent],
})
class RepeatedHostModule {}

@NgModule({})
class OtherModule {}

@Component({
  selector: 'kept-nested-native-host',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '<nested-native-child></nested-native-child>',
})
class KeptHostComponent {}

@NgModule({
  imports: [imports, OtherModule],
  declarations: [KeptHostComponent],
})
class KeptHostModule {}

describe('MockModule:native nested import overrides', () => {
  it('keeps a surviving contribution through repeated removal of the same original group', async () => {
    await TestBed.configureTestingModule({
      imports: [RepeatedHostModule, MockModule(DependencyModule)],
    })
      .overrideModule(RepeatedHostModule, {
        remove: { imports: [[DependencyModule]] },
      })
      .overrideModule(RepeatedHostModule, {
        remove: { imports: [[DependencyModule]] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(RepeatedHostComponent);
    fixture.detectChanges();

    expect(
      isMockOf(
        ngMocks.findInstance(fixture, ChildComponent),
        ChildComponent,
      ),
    ).toBe(true);
    expect(ngMocks.formatText(fixture)).toBe('');
  });
  it('keeps a native nested leaf when a distinct import is present', async () => {
    await TestBed.configureTestingModule({
      imports: [KeptHostModule],
    })
      .overrideModule(KeptHostModule, {
        remove: { imports: [DependencyModule] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(KeptHostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('original');
  });

  it('preserves a kept nested leaf when only the distinct import is mocked', async () => {
    await TestBed.configureTestingModule({
      imports: [KeptHostModule, MockModule(OtherModule)],
    })
      .overrideModule(KeptHostModule, {
        remove: { imports: [DependencyModule] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(KeptHostComponent);
    fixture.detectChanges();

    expect(
      isMockOf(
        ngMocks.findInstance(fixture, ChildComponent),
        ChildComponent,
      ),
    ).toBe(false);
    expect(ngMocks.formatText(fixture)).toBe('original');
  });
  it('retains a top-level native contribution when only its nested occurrence is removed', async () => {
    await TestBed.configureTestingModule({
      imports: [RepeatedHostModule],
    })
      .overrideModule(RepeatedHostModule, {
        remove: { imports: [[DependencyModule]] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(RepeatedHostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('original');
  });

  it('retains a top-level mock contribution when only its nested occurrence is removed', async () => {
    await TestBed.configureTestingModule({
      imports: [RepeatedHostModule, MockModule(DependencyModule)],
    })
      .overrideModule(RepeatedHostModule, {
        remove: { imports: [[DependencyModule]] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(RepeatedHostComponent);
    fixture.detectChanges();

    expect(
      isMockOf(
        ngMocks.findInstance(fixture, ChildComponent),
        ChildComponent,
      ),
    ).toBe(true);
    expect(ngMocks.formatText(fixture)).toBe('');
  });
  it('preserves a nested import when a native removal names only its leaf', async () => {
    await TestBed.configureTestingModule({ imports: [HostModule] })
      .overrideModule(HostModule, {
        remove: { imports: [DependencyModule] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('original');
  });

  it('preserves the resolved nested import when only its original leaf is removed', async () => {
    await TestBed.configureTestingModule({
      imports: [HostModule, MockModule(DependencyModule)],
    })
      .overrideModule(HostModule, {
        remove: { imports: [DependencyModule] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(
      isMockOf(
        ngMocks.findInstance(fixture, ChildComponent),
        ChildComponent,
      ),
    ).toBe(true);
    expect(ngMocks.formatText(fixture)).toBe('');
  });

  it('removes an equivalent nested array with native Angular semantics', async () => {
    await TestBed.configureTestingModule({ imports: [HostModule] })
      .overrideModule(HostModule, {
        remove: { imports: [[DependencyModule]] },
        add: { imports: [ReplacementModule] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('replacement');
    expect(ngMocks.find(fixture, ChildComponent, null)).toBeNull();
  });

  it('removes the resolved leaves when the original nested array matches', async () => {
    await TestBed.configureTestingModule({
      imports: [HostModule, MockModule(DependencyModule)],
    })
      .overrideModule(HostModule, {
        remove: { imports: [[DependencyModule]] },
        add: { imports: [ReplacementModule] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('replacement');
    expect(ngMocks.find(fixture, ChildComponent, null)).toBeNull();
  });
});
