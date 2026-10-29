import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  getMockedNgDefOf,
  isMockOf,
  MockComponent,
  MockModule,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'explicit-module-child',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'real child',
})
class ChildComponent {}

@Component({
  selector: 'explicit-module-entry',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'real entry',
})
class EntryComponent {}

@NgModule({
  declarations: [ChildComponent, EntryComponent],
  exports: [ChildComponent, EntryComponent],
  ['entryComponents' as never /* Legacy entry-component metadata. */]:
    [EntryComponent],
})
class DependencyModule {}

@Component({
  selector: 'explicit-module-declaration-host',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '<explicit-module-child></explicit-module-child>',
})
class HostComponent {}

@NgModule({
  imports: [DependencyModule],
  declarations: [HostComponent],
})
class HostModule {}

describe('MockModule:explicit declarations', () => {
  afterEach(() => {
    ngMocks.globalWipe(ChildComponent);
    ngMocks.globalWipe(EntryComponent);
  });

  it('uses current keep and exclude choices after caching the module graph', async () => {
    const module = MockModule(DependencyModule);
    const entry = MockComponent(EntryComponent);
    ngMocks.globalKeep(ChildComponent);
    ngMocks.globalExclude(EntryComponent);
    await TestBed.configureTestingModule({
      imports: [HostModule, module],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(
      isMockOf(
        ngMocks.findInstance(fixture, ChildComponent),
        ChildComponent,
      ),
    ).toBe(false);
    expect(ngMocks.formatText(fixture)).toBe('real child');
    expect(getMockedNgDefOf(DependencyModule, 'm')).toBe(module);
    expect(() => getMockedNgDefOf(EntryComponent, 'c')).toThrow(
      new Error(`There is no mock for ${EntryComponent.name}`),
    );

    TestBed.resetTestingModule();
    ngMocks.globalWipe(ChildComponent);
    ngMocks.globalWipe(EntryComponent);
    // A native-only configuration must see the module's original mock metadata,
    // without depending on another mixed configuration to repair its cache.
    await TestBed.configureTestingModule({ imports: [module] })
      .overrideModule(module, {
        add: { declarations: [HostComponent] },
      })
      .overrideComponent(HostComponent, {
        set: {
          template:
            '<explicit-module-child></explicit-module-child><explicit-module-entry></explicit-module-entry>',
        },
      })
      .compileComponents();
    const restored = TestBed.createComponent(HostComponent);
    restored.detectChanges();

    expect(
      isMockOf(
        ngMocks.findInstance(restored, ChildComponent),
        ChildComponent,
      ),
    ).toBe(true);
    expect(ngMocks.formatText(restored)).toBe('');
    const restoredEntry = ngMocks.find(restored, EntryComponent);
    expect(
      isMockOf(restoredEntry.componentInstance, EntryComponent),
    ).toBe(true);
    expect(restoredEntry.providerTokens).toContain(entry);
  });

  it('retains the supplied module graph including an unused entry component', async () => {
    const module = MockModule(DependencyModule);
    const child = MockComponent(ChildComponent);
    const entry = MockComponent(EntryComponent);
    await TestBed.configureTestingModule({
      imports: [HostModule, module],
    }).compileComponents();
    expect(getMockedNgDefOf(ChildComponent, 'c')).toBe(child);
    expect(getMockedNgDefOf(EntryComponent, 'c')).toBe(entry);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const element = ngMocks.find(fixture, ChildComponent);

    expect(element.providerTokens).toContain(child);
    expect(ngMocks.formatText(fixture)).toBe('');

    const entryFixture = TestBed.createComponent(entry);
    entryFixture.detectChanges();

    expect(entryFixture.debugElement.providerTokens).toContain(entry);
    expect(ngMocks.formatText(entryFixture)).toBe('');
  });
});
