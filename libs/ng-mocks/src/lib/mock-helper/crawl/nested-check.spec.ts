import nestedCheck from './nested-check';

describe('nested-check', () => {
  it('handles empty nodes', () => {
    const node: any = {
      injector: {},
      nativeNode: {},
    };
    const check = jasmine.createSpy();

    nestedCheck(node, undefined, check);
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

    nestedCheck(node, undefined, check);
  });
});
