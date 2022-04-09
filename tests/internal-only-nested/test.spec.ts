import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import { InternalComponent, TargetModule } from './fixtures';

describe('InternalOnlyNested:real', () => {
  ngMocks.throwOnConsole();

  beforeEach(() => MockBuilder(TargetModule));

  it('should render', () => {
    expect(() => MockRender(InternalComponent)).toThrowError(
      /'internal-component' is not a known element/,
    );
  });
});

describe('InternalOnlyNested:mock', () => {
  beforeEach(() =>
    MockBuilder()
      .mock(TargetModule)
      .mock(InternalComponent, { export: true }),
  );

  // The expectation is to see that InternalComponent was exported to the level of the TestingModule
  // and can be accessed in the test even it was deeply nested.
  it('should render', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture).toBeDefined();
    const content = fixture.nativeElement.innerHTML;
    expect(content).toEqual(
      '<internal-component></internal-component>',
    );
  });
});
