import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  getMockedNgDefOf,
  MockBuilder,
  MockComponent,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'cached-private-only',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'private',
})
class PrivateComponent {}

@NgModule({ declarations: [PrivateComponent] })
class DependencyModule {}

@Component({
  selector: 'cached-private-only-host',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '<cached-private-only></cached-private-only>',
})
class HostComponent {}

@NgModule({
  imports: [DependencyModule],
  declarations: [HostComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class HostModule {}

describe('MockModule:cached private exports', () => {
  it('clears earlier generated exports when the current module has no public exports', async () => {
    await MockBuilder().mock(DependencyModule, { exportAll: true });
    const module = getMockedNgDefOf(DependencyModule, 'm');
    const privateMock = getMockedNgDefOf(PrivateComponent, 'c');
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [HostModule, module],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(getMockedNgDefOf(DependencyModule, 'm')).toBe(module);
    expect(
      ngMocks.findInstance(fixture, PrivateComponent, null),
    ).toBeNull();
    expect(ngMocks.formatText(fixture)).toBe('');

    TestBed.resetTestingModule();
    const host = MockComponent(HostComponent);
    // Only mock entries bypass the mixed builder, so it cannot repair stale metadata.
    await TestBed.configureTestingModule({
      imports: [module],
      declarations: [host],
    })
      .overrideComponent(host, {
        set: {
          template: '<cached-private-only></cached-private-only>',
        },
      })
      .compileComponents();
    const restored = TestBed.createComponent(host);
    restored.detectChanges();

    expect(
      ngMocks.find(restored, PrivateComponent).providerTokens,
    ).toContain(privateMock);
    expect(ngMocks.formatText(restored)).toBe('');
  });
});
