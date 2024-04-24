import { Component, input } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'test-component',
  template: '<h1>{{ header() }}</h1>',
  standalone: true,
})
class TestComponent {
  public readonly header = input.required<string>();
}

// See https://github.com/help-me-mom/ng-mocks/issues/7976
describe('issue-7976', () => {
  beforeEach(() => MockBuilder(TestComponent));

  it('should print header', () => {
    const fixture = MockRender(TestComponent, {
      header: 'Hello world!',
    });

    expect(ngMocks.formatText(fixture)).toBe('Hello world!');
  });
});
