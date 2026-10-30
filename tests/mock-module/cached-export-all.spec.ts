import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { getMockedNgDefOf, MockBuilder, ngMocks } from 'ng-mocks';

@Component({
  selector: 'cached-public-export',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'public',
})
class PublicComponent {}

@Component({
  selector: 'cached-private-export',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'private',
})
class PrivateComponent {}

@NgModule({
  declarations: [PublicComponent, PrivateComponent],
  exports: [PublicComponent],
})
class DependencyModule {}

@Component({
  selector: 'cached-export-boundary-host',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template:
    '<cached-public-export></cached-public-export><cached-private-export></cached-private-export>',
})
class HostComponent {}

@NgModule({
  imports: [DependencyModule],
  declarations: [HostComponent],
  // The unknown private tag is allowed, so instance lookup verifies export scope.
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class HostModule {}

describe('MockModule:cached exportAll policy', () => {
  it('restores current export boundaries after retaining an exportAll module class', async () => {
    await MockBuilder().mock(DependencyModule, { exportAll: true });
    const module = getMockedNgDefOf(DependencyModule, 'm');
    const publicMock = getMockedNgDefOf(PublicComponent, 'c');
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [HostModule, module],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(
      ngMocks.find(fixture, PublicComponent).providerTokens,
    ).toContain(publicMock);
    expect(
      ngMocks.findInstance(fixture, PrivateComponent, null),
    ).toBeNull();
    expect(getMockedNgDefOf(DependencyModule, 'm')).toBe(module);
    expect(ngMocks.formatText(fixture)).toBe('');
  });
});
