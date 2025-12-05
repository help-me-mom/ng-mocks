import funcGetGlobal from './func.get-global';
import funcReflectComponentType from './func.reflect-component-type';

describe('funcReflectComponentType', () => {
  let global: any;

  beforeEach(() => {
    global = funcGetGlobal();
  });

  afterEach(() => {
    delete global.__ngMocksReflectComponentType;
  });

  it('returns undefined when API does not exist', () => {
    // Simulate Angular 13 - where reflectComponentType doesn't exist
    global.__ngMocksReflectComponentType = false;

    const result = funcReflectComponentType({ test: 'component' });
    expect(result).toBeUndefined();
  });

  it('returns result when API exists and works', () => {
    const mockMirror = { inputs: [], outputs: [] };
    global.__ngMocksReflectComponentType = jasmine
      .createSpy('mockReflectComponentType')
      .and.returnValue(mockMirror);

    const result = funcReflectComponentType({ test: 'component' });
    expect(result).toBe(mockMirror);
  });
});
