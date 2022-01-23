import { JitReflector } from './jit-reflector';

describe('JitReflector', () => {
  class MockJitReflector extends JitReflector {
    public readonly mock: any = {
      annotations: jasmine.createSpy('annotations'),
      hasLifecycleHook: jasmine.createSpy('hasLifecycleHook'),
      parameters: jasmine.createSpy('parameters'),
      propMetadata: jasmine.createSpy('propMetadata'),
    };

    public constructor() {
      super();
      this.reflectionCapabilities = this.mock;
    }
  }

  let instance: MockJitReflector;

  beforeEach(() => {
    instance = new MockJitReflector();
  });

  it('annotations', () => {
    const expected = {};
    instance.mock.annotations.and.returnValue([1, 2, 3]);

    const actual = instance.annotations(expected);

    expect(instance.mock.annotations).toHaveBeenCalledWith(expected);
    expect(actual).toEqual([1, 2, 3]);
  });

  it('componentModuleUrl', () => {
    const expected = 'value';
    const actual = instance.componentModuleUrl(expected);
    expect(actual).toEqual('./value');
  });

  it('guards', () => {
    const actual = instance.guards();
    expect(actual).toEqual({});
  });

  it('hasLifecycleHook', () => {
    const expectedType = {};
    const expectedLcProperty = 'string';
    instance.mock.hasLifecycleHook.and.returnValue(false);

    const actual = instance.hasLifecycleHook(
      expectedType,
      expectedLcProperty,
    );

    expect(instance.mock.hasLifecycleHook).toHaveBeenCalledWith(
      expectedType,
      expectedLcProperty,
    );
    expect(actual).toEqual(false);
  });

  it('parameters', () => {
    const expected = {};
    instance.mock.parameters.and.returnValue([[1, 2, 3]]);

    const actual = instance.parameters(expected);

    expect(instance.mock.parameters).toHaveBeenCalledWith(expected);
    expect(actual).toEqual([[1, 2, 3]]);
  });

  it('propMetadata', () => {
    const expected = {};
    instance.mock.propMetadata.and.returnValue({ tst: [1, 2, 3] });

    const actual = instance.propMetadata(expected);

    expect(instance.mock.propMetadata).toHaveBeenCalledWith(expected);
    expect(actual).toEqual({ tst: [1, 2, 3] });
  });

  it('shallowAnnotations', () => {
    expect(() => instance.shallowAnnotations()).toThrowError(
      /Not supported in JIT mode/,
    );
  });

  it('tryAnnotations', () => {
    const expected = {};
    instance.mock.annotations.and.returnValue([1, 2, 3]);

    const actual = instance.tryAnnotations(expected);

    expect(instance.mock.annotations).toHaveBeenCalledWith(expected);
    expect(actual).toEqual([1, 2, 3]);
  });
});
