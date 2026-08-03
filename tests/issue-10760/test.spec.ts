import {
  Component,
  inject,
  InjectionToken,
  NgModule,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

const BASE_PATH = new InjectionToken<string>('BASE_PATH');

@Component({
  selector: 'target-10760',
  standalone: true,
  template: '',
})
class StandaloneComponent {
  public readonly basePath = inject(BASE_PATH);
}

@Component({
  selector: 'target-classic-10760',
  standalone: false,
  template: '',
})
class ClassicComponent {
  public readonly basePath = inject(BASE_PATH);
}

@NgModule({
  declarations: [ClassicComponent],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/10760
describe('issue-10760', () => {
  beforeAll(() => {
    ngMocks.globalMock(BASE_PATH);
    ngMocks.defaultMock(BASE_PATH, () => '/api/test-path');
  });
  afterAll(() => {
    ngMocks.globalWipe(BASE_PATH);
    ngMocks.defaultMock(BASE_PATH);
  });

  describe('standalone component', () => {
    beforeEach(() => MockBuilder(StandaloneComponent));

    it('uses the global mock for a runtime inject token', () => {
      const fixture = MockRender(StandaloneComponent);

      expect(fixture.point.componentInstance.basePath).toEqual(
        '/api/test-path',
      );
    });
  });

  describe('module component', () => {
    beforeEach(() => MockBuilder(ClassicComponent, TargetModule));

    it('uses the global mock for a runtime inject token', () => {
      const fixture = MockRender(ClassicComponent);

      expect(fixture.point.componentInstance.basePath).toEqual(
        '/api/test-path',
      );
    });
  });
});
