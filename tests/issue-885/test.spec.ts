import { Component, NgModule } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target1-885',
  template: 'target1',
})
class Target1Component {}

@Component({
  selector: 'target2-885',
  template: 'target2',
})
class Target2Component {}

@NgModule({
  declarations: [Target1Component, Target2Component],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/885
describe('issue-885', () => {
  describe('Target1Component', () => {
    beforeEach(() => MockBuilder(Target1Component, TargetModule));

    it('renders Target1Component', () => {
      const fixture = MockRender(Target1Component);

      expect(ngMocks.formatText(fixture)).toEqual('target1');
    });

    it('renders Target2Component', () => {
      const fixture = MockRender(Target2Component);

      expect(ngMocks.formatText(fixture)).toEqual('');
    });
  });

  describe('Target2Component', () => {
    beforeEach(() => MockBuilder(Target2Component, TargetModule));

    it('renders Target1Component', () => {
      const fixture = MockRender(Target1Component);

      expect(ngMocks.formatText(fixture)).toEqual('');
    });

    it('renders Target2Component', () => {
      const fixture = MockRender(Target2Component);

      expect(ngMocks.formatText(fixture)).toEqual('target2');
    });
  });
});
