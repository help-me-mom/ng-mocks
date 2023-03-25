import { Component, NgModule, OnInit } from '@angular/core';

import {
  MockBuilder,
  MockedComponentFixture,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'target-488-faster',
  template: '{{ value }}',
})
class MyComponent implements OnInit {
  public value = 0;

  public ngOnInit(): void {
    this.value += 1;
  }

  public reset(): void {
    this.value = 0;
  }
}

@NgModule({
  declarations: [MyComponent],
})
class MyModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/488
describe('issue-488:faster', () => {
  let fixture: MockedComponentFixture<MyComponent>;

  ngMocks.throwOnConsole();
  ngMocks.faster();

  beforeAll(() => MockBuilder(MyComponent, MyModule));

  describe('multi render', () => {
    beforeEach(() => (fixture = MockRender(MyComponent)));

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
    beforeAll(() => (fixture = MockRender(MyComponent)));

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
