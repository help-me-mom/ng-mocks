// tslint:disable:no-console

import { MockBuilder, MockRender } from 'ng-mocks';

import { ExternalComponent, InternalComponent } from './fixtures.components';
import { TargetModule } from './fixtures.modules';

describe('InternalVsExternal:real', () => {
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
    const fixture = MockRender(ExternalComponent);
    expect(fixture).toBeDefined();
    const content = fixture.debugElement.nativeElement.innerHTML;
    expect(content).toContain('external <internal-component>internal</internal-component>');

    expect(() => MockRender(InternalComponent)).toThrowError(/'internal-component' is not a known element/);
  });
});

describe('InternalVsExternal:mock', () => {
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

  beforeEach(async done => {
    await MockBuilder().mock(TargetModule);
    done();
  });

  // The expectation is to see that ExternalComponent was exported and InternalComponent wasn't.
  it('should render', () => {
    const fixture = MockRender(ExternalComponent);
    expect(fixture).toBeDefined();
    const content = fixture.debugElement.nativeElement.innerHTML;
    expect(content).toEqual('<external-component></external-component>');

    expect(() => MockRender(InternalComponent)).toThrowError(/'internal-component' is not a known element/);
  });
});

describe('InternalVsExternal:legacy', () => {
  beforeEach(() => MockBuilder().mock(TargetModule));

  it('should render', () => {
    const fixture = MockRender(ExternalComponent);
    expect(fixture).toBeDefined();
    const content = fixture.debugElement.nativeElement.innerHTML;
    expect(content).toEqual('<external-component></external-component>');

    // the code below will fail because the MockModule outside of the MockBuilder exports everything.
    // try {
    //   MockRender(InternalComponent);
    //   fail('should fail on the internal component');
    // } catch (e) {
    //   expect(e).toEqual(jasmine.objectContaining({ngSyntaxError: true}));
    // }
  });
});
