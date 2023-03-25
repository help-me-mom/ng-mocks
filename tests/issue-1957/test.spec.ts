import { CommonModule, DatePipe } from '@angular/common';
import { Component, NgModule } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-1957',
  template: "{{ '2022-03-03' | date }}",
})
class TargetComponent {}

@NgModule({
  declarations: [TargetComponent],
  imports: [CommonModule],
})
class TargetModule {}

const dateSpy = (value: string) => value.length;

// @see https://github.com/help-me-mom/ng-mocks/issues/1957
describe('issue-1957:MockBuilder', () => {
  describe('mock', () => {
    ngMocks.faster();

    beforeAll(() =>
      MockBuilder(TargetComponent, TargetModule).mock(
        DatePipe,
        dateSpy,
      ),
    );

    it('uses a mock', () => {
      const fixture = MockRender(TargetComponent);
      const text = ngMocks.formatText(fixture);
      expect(text).toEqual('10');
    });
  });

  describe('restored', () => {
    ngMocks.faster();

    beforeAll(() => MockBuilder(TargetComponent, TargetModule));

    it('uses a mock', () => {
      const fixture = MockRender(TargetComponent);
      const text = ngMocks.formatText(fixture);
      expect(text).toEqual('Mar 3, 2022');
    });
  });
});
