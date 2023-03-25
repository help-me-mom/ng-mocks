import { CommonModule, DatePipe } from '@angular/common';
import { Component, NgModule } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-435',
  template: '{{ stamp | date }}',
})
class TargetComponent {
  public readonly stamp = '2021-05-01';
}

@NgModule({
  declarations: [TargetComponent],
  imports: [CommonModule],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/435
describe('issue-435', () => {
  describe('mock pipe', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).mock(
        DatePipe,
        (value: string) => `MOCK:${value}`,
      ),
    );

    it('mocks declarations from CommonModule', () => {
      const fixture = MockRender(TargetComponent);
      expect(ngMocks.formatText(fixture)).toEqual('MOCK:2021-05-01');
    });
  });

  describe('normal pipe', () => {
    beforeEach(() => MockBuilder(TargetComponent, TargetModule));

    it('restores original declarations from CommonModule', () => {
      const fixture = MockRender(TargetComponent);
      expect(ngMocks.formatText(fixture)).not.toEqual(
        'MOCK:2021-05-01',
      );
    });
  });
});
