import {
  MockComponent,
  MockDirective,
  MockInstance,
  MockModule,
  MockPipe,
  MockProvider,
  MockRender,
} from 'ng-mocks';

// @see https://github.com/help-me-mom/ng-mocks/issues/354
describe('issue-354', () => {
  it('does not accept an empty module', () => {
    try {
      MockModule(undefined as any);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'null / undefined has been passed into MockModule. Please check that its import is correct.',
      );
    }
    try {
      MockModule(null as any);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'null / undefined has been passed into MockModule. Please check that its import is correct.',
      );
    }
  });

  it('does not accept an empty component', () => {
    try {
      MockComponent(undefined as any);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'null / undefined has been passed into MockComponent. Please check that its import is correct.',
      );
    }
    try {
      MockComponent(null as any);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'null / undefined has been passed into MockComponent. Please check that its import is correct.',
      );
    }
  });

  it('does not accept an empty directive', () => {
    try {
      MockDirective(undefined as any);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'null / undefined has been passed into MockDirective. Please check that its import is correct.',
      );
    }
    try {
      MockDirective(null as any);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'null / undefined has been passed into MockDirective. Please check that its import is correct.',
      );
    }
  });

  it('does not accept an empty pipe', () => {
    try {
      MockPipe(undefined as any);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'null / undefined has been passed into MockPipe. Please check that its import is correct.',
      );
    }
    try {
      MockPipe(null as any);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'null / undefined has been passed into MockPipe. Please check that its import is correct.',
      );
    }
  });

  it('does not accept an empty provider', () => {
    try {
      MockProvider(undefined as any);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'null / undefined has been passed into MockProvider. Please check that its import is correct.',
      );
    }
    try {
      MockProvider(null as any);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'null / undefined has been passed into MockProvider. Please check that its import is correct.',
      );
    }
  });

  it('does not accept an empty render', () => {
    try {
      MockRender(undefined as any);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'null / undefined has been passed into MockRender. Please check that its import is correct.',
      );
    }
    try {
      MockRender(null as any);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'null / undefined has been passed into MockRender. Please check that its import is correct.',
      );
    }
  });

  it('does not accept an empty instance', () => {
    try {
      MockInstance(undefined as any);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'null / undefined has been passed into MockInstance. Please check that its import is correct.',
      );
    }
    try {
      MockInstance(null as any);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'null / undefined has been passed into MockInstance. Please check that its import is correct.',
      );
    }
  });
});
