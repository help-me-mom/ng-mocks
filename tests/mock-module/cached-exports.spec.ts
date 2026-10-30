import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  getMockedNgDefOf,
  MockComponent,
  MockModule,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'cached-new-export-child',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'original',
})
class ChildComponent {}

@NgModule({ declarations: [ChildComponent] })
class DependencyModule {}

@Component({
  selector: 'cached-new-export-host',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '<cached-new-export-child></cached-new-export-child>',
})
class HostComponent {}

describe('MockModule:cached export choices', () => {
  afterEach(() => ngMocks.globalWipe(ChildComponent));

  it('exports a newly requested mock after the retained module originally excluded it', async () => {
    ngMocks.globalExclude(ChildComponent);
    const module = MockModule(DependencyModule);
    ngMocks.globalWipe(ChildComponent);
    const child = MockComponent(ChildComponent);
    await TestBed.configureTestingModule({
      imports: [module],
      declarations: [HostComponent, child],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(
      ngMocks.find(fixture, ChildComponent).providerTokens,
    ).toContain(child);
    expect(getMockedNgDefOf(DependencyModule, 'm')).toBe(module);
    expect(ngMocks.formatText(fixture)).toBe('');
  });
});
