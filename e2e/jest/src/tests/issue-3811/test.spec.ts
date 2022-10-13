import { Component, Input } from '@angular/core';
import { MockBuilder, MockRender } from 'ng-mocks';

@Component({
  selector: 'hello',
  template: `<h1>Hello {{ name }}!</h1>`,
})
export class HelloComponent {
  @Input() public name: string | null = null;
}

// @see https://github.com/help-me-mom/ng-mocks/issues/3811
// The problem is that Angular adds `__ngContext__` on the host element (<mock-render>).
// It's an index of the current context: 0, 1, 2, 3.
// So if you have 2 tests, you have 2 contexts, but if you run only 1 test, you have 1 context,
// and, therefore, the snapshot assertion will fail, because the single run has `0` index, whereas in the suite run,
// it can be any other number.
// The solution is to remove __ngContext__ from the snapshot html, so there is no number with the index in it.
// The test below asserts that snapshots don't have __ngContext__ anymore.
describe('issue-3811', () => {
  beforeEach(() => {
    return MockBuilder(HelloComponent);
  });

  it('should render mock-render without __ngContext__ on the first run', () => {
    const fixture = MockRender(HelloComponent, { name: 'Joe' });
    expect(fixture).toMatchSnapshot();
  });

  it('should render mock-render without __ngContext__ on the second run', () => {
    const fixture = MockRender(HelloComponent, { name: 'Jane' });
    expect(fixture).toMatchSnapshot();
  });
});
