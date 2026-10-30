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
  selector: 'cached-replacement-child',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'original',
})
class ChildComponent {}

@Component({
  selector: 'cached-replacement-child',
  host: { 'data-foreign-cached': '' },
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'foreign',
})
class ForeignComponent {}

@NgModule({
  declarations: [ChildComponent],
  exports: [ChildComponent],
})
class DependencyModule {}

@Component({
  selector: 'cached-replacement-host',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '<cached-replacement-child></cached-replacement-child>',
})
class HostComponent {}

@NgModule({
  imports: [DependencyModule],
  declarations: [HostComponent],
})
class HostModule {}

describe('MockModule:cached replacements', () => {
  afterEach(() => ngMocks.globalWipe(ChildComponent));

  it('uses the current graph when a replacement was removed before creating a fresh module', async () => {
    ngMocks.globalReplace(
      ChildComponent,
      MockComponent(ForeignComponent),
    );
    MockModule(DependencyModule);
    ngMocks.globalWipe(ChildComponent);
    const module = MockModule(DependencyModule);
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
    ).toBe(true);
    expect(
      ngMocks.findInstance(fixture, ForeignComponent, null),
    ).toBeNull();
    expect(() => getMockedNgDefOf(ForeignComponent, 'c')).toThrow(
      new Error(`There is no mock for ${ForeignComponent.name}`),
    );
    expect(ngMocks.formatText(fixture)).toBe('');
    expect(getMockedNgDefOf(DependencyModule, 'm')).toBe(module);
  });

  it('ignores a historical foreign replacement in a retained module graph', async () => {
    ngMocks.globalReplace(
      ChildComponent,
      MockComponent(ForeignComponent),
    );
    const module = MockModule(DependencyModule);
    ngMocks.globalWipe(ChildComponent);
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
    ).toBe(true);
    expect(
      ngMocks.findInstance(fixture, ForeignComponent, null),
    ).toBeNull();
    expect(() => getMockedNgDefOf(ForeignComponent, 'c')).toThrow(
      new Error(`There is no mock for ${ForeignComponent.name}`),
    );
    expect(ngMocks.formatText(fixture)).toBe('');
    expect(getMockedNgDefOf(DependencyModule, 'm')).toBe(module);
  });
});
