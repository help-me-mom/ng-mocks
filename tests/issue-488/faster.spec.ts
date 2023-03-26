import { Component, NgModule, OnInit } from '@angular/core';

import {
  MockBuilder,
  MockedComponentFixture,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'target',
  template: '{{ value }}',
})
class TargetComponent implements OnInit {
  public value = 0;

  public ngOnInit(): void {
    this.value += 1;
  }

  public reset(): void {
    this.value = 0;
  }

  public target488faster() {}
}

@NgModule({
  declarations: [TargetComponent],
})
class ItsModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/488
describe('issue-488:faster', () => {
  let fixture: MockedComponentFixture<TargetComponent>;

  ngMocks.throwOnConsole();
  ngMocks.faster();

  beforeAll(() => MockBuilder(TargetComponent, ItsModule));

  describe('multi render', () => {
    beforeEach(() => (fixture = MockRender(TargetComponent)));

    it('first test has brand new render', () => {
      expect(ngMocks.formatText(fixture)).toEqual('1');

      fixture.point.componentInstance.value += 1;
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('2');

      fixture.point.componentInstance.reset();
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('0');
    });

    it('second test has brand new render', () => {
      expect(ngMocks.formatText(fixture)).toEqual('1');

      fixture.point.componentInstance.value += 1;
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('2');

      fixture.point.componentInstance.reset();
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('0');
    });
  });

  describe('single render', () => {
    beforeAll(() => (fixture = MockRender(TargetComponent)));

    it('first test has initial render', () => {
      expect(ngMocks.formatText(fixture)).toEqual('1');

      fixture.point.componentInstance.value += 1;
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('2');

      fixture.point.componentInstance.reset();
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('0');
    });

    it('second test continues the prev state', () => {
      expect(ngMocks.formatText(fixture)).toEqual('0');

      fixture.point.componentInstance.value += 1;
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('1');

      fixture.point.componentInstance.reset();
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('0');
    });
  });
});
