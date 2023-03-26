import {
  Component,
  Pipe,
  PipeTransform,
  VERSION,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  ngMocks,
  MockComponent,
  MockPipe,
  MockRender,
} from 'ng-mocks';

// A simple standalone pipe we are going to mock.
@Pipe(
  {
    name: 'pipe',
    standalone: true,
  } as never /* TODO: remove after upgrade to a14 */,
)
class StandalonePipe implements PipeTransform {
  transform(value: string | null): string {
    return `${value}:${this.constructor.name}`;
  }

  public pipe5239() {}
}

// A simple dependency component we are going to mock that imports the standalone pipe.
@Component(
  {
    selector: 'dependency',
    template: 'dependency',
    standalone: true,
    imports: [StandalonePipe],
  } as never /* TODO: remove after upgrade to a14 */,
)
class DependencyComponent {
  public dependency5239() {}
}

// A standalone component we are going to test.
@Component(
  {
    selector: 'standalone',
    template: `<dependency></dependency> {{ 'test' | pipe }}`,
    standalone: true,
    imports: [DependencyComponent, StandalonePipe],
  } as never /* TODO: remove after upgrade to a14 */,
)
class StandaloneComponent {
  public standalone5239() {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/5239
// The problem here was because of mocks of DependencyComponent.
// It has StandalonePipe too, so it mocked it without the custom function and cached,
// whereas the mock with the custom function was ignored due to existing cache of the pipe.
describe('issue-5239', () => {
  if (Number.parseInt(VERSION.major, 10) < 14) {
    it('needs >=a14', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        // our component for testing
        StandaloneComponent,

        // the dependent component we want to mock
        MockComponent(DependencyComponent),

        // the pipe we want to mock with a custom transform
        MockPipe(StandalonePipe, () => 'mock'),
      ],
    }).compileComponents();
  });

  it('renders dependencies', () => {
    const fixture = MockRender(StandaloneComponent);
    expect(ngMocks.formatHtml(fixture)).toContain('mock');
  });
});
