import {
  MockComponent,
  MockDirective,
  MockInstance,
  MockModule,
  MockPipe,
  MockProvider,
  MockRender,
} from 'ng-mocks';

// @see https://github.com/ike18t/ng-mocks/issues/354
describe('issue-354', () => {
  it('does not accept an empty module', () => {
    expect(() => MockModule(undefined as any)).toThrowError(
      'null / undefined has been passed into MockModule. Please check that its import is correct.',
    );
    expect(() => MockModule(null as any)).toThrowError(
      'null / undefined has been passed into MockModule. Please check that its import is correct.',
    );
  });

  it('does not accept an empty component', () => {
    expect(() => MockComponent(undefined as any)).toThrowError(
      'null / undefined has been passed into MockComponent. Please check that its import is correct.',
    );
    expect(() => MockComponent(null as any)).toThrowError(
      'null / undefined has been passed into MockComponent. Please check that its import is correct.',
    );
  });

  it('does not accept an empty directive', () => {
    expect(() => MockDirective(undefined as any)).toThrowError(
      'null / undefined has been passed into MockDirective. Please check that its import is correct.',
    );
    expect(() => MockDirective(null as any)).toThrowError(
      'null / undefined has been passed into MockDirective. Please check that its import is correct.',
    );
  });

  it('does not accept an empty pipe', () => {
    expect(() => MockPipe(undefined as any)).toThrowError(
      'null / undefined has been passed into MockPipe. Please check that its import is correct.',
    );
    expect(() => MockPipe(null as any)).toThrowError(
      'null / undefined has been passed into MockPipe. Please check that its import is correct.',
    );
  });

  it('does not accept an empty provider', () => {
    expect(() => MockProvider(undefined as any)).toThrowError(
      'null / undefined has been passed into MockProvider. Please check that its import is correct.',
    );
    expect(() => MockProvider(null as any)).toThrowError(
      'null / undefined has been passed into MockProvider. Please check that its import is correct.',
    );
  });

  it('does not accept an empty render', () => {
    expect(() => MockRender(undefined as any)).toThrowError(
      'null / undefined has been passed into MockRender. Please check that its import is correct.',
    );
    expect(() => MockRender(null as any)).toThrowError(
      'null / undefined has been passed into MockRender. Please check that its import is correct.',
    );
  });

  it('does not accept an empty instance', () => {
    expect(() => MockInstance(undefined as any)).toThrowError(
      'null / undefined has been passed into MockInstance. Please check that its import is correct.',
    );
    expect(() => MockInstance(null as any)).toThrowError(
      'null / undefined has been passed into MockInstance. Please check that its import is correct.',
    );
  });
});
