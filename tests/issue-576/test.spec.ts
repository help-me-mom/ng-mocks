import { Component, Input } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// @see https://github.com/help-me-mom/ng-mocks/issues/576
describe('issue-576', () => {
  describe('env:1', () => {
    ngMocks.faster();

    @Component({
      ['standalone' as never /* TODO: remove after upgrade to a14 */]:
        false,
      template: '1:{{ value }}',
    })
    class TargetComponent {
      @Input() public value: string | null = null;
    }

    beforeAll(() => MockBuilder(TargetComponent));

    beforeEach(() => MockRender(TargetComponent, { value: 'env:1' }));

    it('succeeds on 1st run', () => {
      expect(
        ngMocks.formatText(ngMocks.find(TargetComponent)),
      ).toEqual('1:env:1');
    });

    it('succeeds on 2nd run', () => {
      expect(
        ngMocks.formatText(ngMocks.find(TargetComponent)),
      ).toEqual('1:env:1');
    });
  });

  describe('env:2', () => {
    ngMocks.faster();

    @Component({
      ['standalone' as never /* TODO: remove after upgrade to a14 */]:
        false,
      template: '2:{{ value }}',
    })
    class TargetComponent {
      @Input() public value: string | null = null;
    }

    beforeAll(() => MockBuilder(TargetComponent));

    beforeEach(() => MockRender(TargetComponent, { value: 'env:2' }));

    it('succeeds on 1st run', () => {
      expect(
        ngMocks.formatText(ngMocks.find(TargetComponent)),
      ).toEqual('2:env:2');
    });

    it('succeeds on 2nd run', () => {
      expect(
        ngMocks.formatText(ngMocks.find(TargetComponent)),
      ).toEqual('2:env:2');
    });
  });
});
