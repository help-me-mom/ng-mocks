import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import {
  ExternalComponent,
  InternalComponent,
  TargetModule,
} from './fixtures';

describe('InternalVsExternal:real', () => {
  ngMocks.throwOnConsole();

  beforeEach(() => MockBuilder(TargetModule));

  it('should render', () => {
    const fixture = MockRender(ExternalComponent);
    expect(fixture).toBeDefined();
    const content = fixture.nativeElement.innerHTML;
    expect(content).toContain(
      'external <internal-component>internal</internal-component>',
    );

    expect(() =>
      MockRender(InternalComponent, null, { reset: true }),
    ).toThrowError(/'internal-component' is not a known element/);
  });
});

describe('InternalVsExternal:mock', () => {
  ngMocks.throwOnConsole();

  beforeEach(() => MockBuilder().mock(TargetModule));

  // The expectation is to see that ExternalComponent was exported and InternalComponent was not.
  it('should render', () => {
    const fixture = MockRender(ExternalComponent);
    expect(fixture).toBeDefined();
    const content = fixture.nativeElement.innerHTML;
    expect(content).toEqual(
      '<external-component></external-component>',
    );

    expect(() =>
      MockRender(InternalComponent, null, { reset: true }),
    ).toThrowError(/'internal-component' is not a known element/);
  });
});

describe('InternalVsExternal:legacy', () => {
  beforeEach(() => MockBuilder().mock(TargetModule));

  it('should render', () => {
    const fixture = MockRender(ExternalComponent);
    expect(fixture).toBeDefined();
    const content = fixture.nativeElement.innerHTML;
    expect(content).toEqual(
      '<external-component></external-component>',
    );

    // the code below will fail because the MockModule outside of the MockBuilder exports everything.
    // try {
    //   MockRender(InternalComponent);
    //   fail('should fail on the internal component');
    // } catch (e) {
    //   expect(e).toEqual(jasmine.objectContaining({ngSyntaxError: true}));
    // }
  });
});
