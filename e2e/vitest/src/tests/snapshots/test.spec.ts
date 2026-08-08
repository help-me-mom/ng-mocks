import { Component, Input } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'vitest-snapshot-hello',
  standalone: false,
  template: '<h1>Hello {{ name }}!</h1>',
})
class HelloComponent {
  @Input() public name: string | null = null;
}

describe('Vitest snapshots', () => {
  beforeEach(() => MockBuilder(HelloComponent));

  it('serializes the first rendered result', () => {
    const fixture = MockRender(HelloComponent, { name: 'Joe' });

    expect(ngMocks.formatHtml(fixture)).toMatchSnapshot();
  });

  it('serializes the next rendered result without Angular context state', () => {
    const fixture = MockRender(HelloComponent, { name: 'Jane' });

    expect(ngMocks.formatHtml(fixture)).toMatchSnapshot();
  });
});
