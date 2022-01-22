import nestedCheck from './nested-check';

describe('nested-check', () => {
  it('handles empty nodes', () => {
    const node: any = {
      injector: {},
      nativeNode: {},
    };
    const check = jasmine.createSpy();

    expect(() => nestedCheck(node, undefined, check)).not.toThrow();
  });

  it('handles missed parent def', () => {
    const parent = {};
    const node: any = {
      injector: {
        _tNode: {
          parent,
        },
      },
      nativeNode: {},
    };
    const check = jasmine.createSpy();

    expect(() => nestedCheck(node, undefined, check)).not.toThrow();
  });

  it('handles elDef.parent', () => {
    const parent = {
      injector: {
        elDef: {},
      },
      nativeNode: {},
    };
    const node: any = {
      injector: {
        elDef: {
          parent,
        },
      },
      nativeNode: {},
      parent,
    };
    const check = jasmine.createSpy();

    expect(() => nestedCheck(node, undefined, check)).not.toThrow();
  });
});
