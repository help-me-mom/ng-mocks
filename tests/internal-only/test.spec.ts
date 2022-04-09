import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import { InternalComponent, TargetModule } from './fixtures';

describe('InternalOnly:real', () => {
  ngMocks.throwOnConsole();

  beforeEach(() => MockBuilder(TargetModule));

  it('should render', () => {
    expect(() => MockRender(InternalComponent)).toThrowError(
      /'internal-component' is not a known element/,
    );
  });
});

describe('InternalOnly:mock', () => {
  beforeEach(() =>
    MockBuilder()
      .mock(TargetModule)
      .mock(InternalComponent, { export: true }),
  );

  // The expectation is to see that InternalComponent was exported and can be accessed from the test.
  it('should render', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture).toBeDefined();
    const content = fixture.nativeElement.innerHTML;
    expect(content).toEqual(
      '<internal-component></internal-component>',
    );
  });
});
