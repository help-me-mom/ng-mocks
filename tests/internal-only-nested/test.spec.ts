// tslint:disable no-console

import { MockBuilder, MockRender } from 'ng-mocks';

import { InternalComponent, TargetModule } from './fixtures';

describe('InternalOnlyNested:real', () => {
  // Thanks Ivy, it doesn't throw an error and we have to use injector.
  let backupWarn: typeof console.warn;
  let backupError: typeof console.error;

  beforeAll(() => {
    backupWarn = console.warn;
    backupError = console.error;
    console.error = console.warn = (...args: any[]) => {
      throw new Error(args.join(' '));
    };
  });

  afterAll(() => {
    console.error = backupError;
    console.warn = backupWarn;
  });

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
