import { Component, inject, InjectionToken } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

const BASE_PATH = new InjectionToken<string>('BASE_PATH');

@Component({
  selector: 'target-global-mock',
  standalone: true,
  template: '',
})
class TargetComponent {
  public readonly basePath = inject(BASE_PATH);
}

describe('ngMocks.globalMock:inject', () => {
  beforeAll(() => {
    ngMocks.globalMock(BASE_PATH);
    ngMocks.defaultMock(BASE_PATH, () => '/api/test-path');
  });
  afterAll(() => {
    ngMocks.globalWipe(BASE_PATH);
    ngMocks.defaultMock(BASE_PATH);
  });

  beforeEach(() => MockBuilder(TargetComponent));

  it('uses the global default for a runtime inject token', () => {
    const fixture = MockRender(TargetComponent);

    expect(fixture.point.componentInstance.basePath).toEqual(
      '/api/test-path',
    );
  });
});
