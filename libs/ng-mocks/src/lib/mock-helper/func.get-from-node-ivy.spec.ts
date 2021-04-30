import funcGetFromNodeIvy from './func.get-from-node-ivy';

describe('func.get-from-node-ivy', () => {
  class Proto {}

  it('finds parent context', () => {
    const result: any[] = [];
    const proto = new Proto();
    const node: any = {
      nativeNode: {},
      parent: {
        nativeNode: {
          __ngContext__: [proto],
        },
      },
    };

    funcGetFromNodeIvy(result, node, Proto);

    expect(result).toEqual([proto]);
  });

  it('handles lView context', () => {
    const result: any[] = [];
    const proto = new Proto();
    const node: any = {
      nativeNode: {},
      parent: {
        nativeNode: {
          __ngContext__: {
            lView: [proto],
          },
        },
      },
    };

    funcGetFromNodeIvy(result, node, Proto);

    expect(result).toEqual([proto]);
  });

  it('disables on arrays', () => {
    const result: any[] = [];
    const proto = new Proto();
    const node: any = {
      nativeNode: {},
      parent: {
        nativeNode: {
          __ngContext__: {
            lView: [
              [] /* now proto should not be collected */,
              proto,
            ],
          },
        },
      },
    };

    funcGetFromNodeIvy(result, node, Proto);

    expect(result).toEqual([]);
  });

  it('handles empty context', () => {
    const result: any[] = [];
    const node: any = {
      nativeNode: {},
      parent: {
        nativeNode: {},
      },
    };

    funcGetFromNodeIvy(result, node, Proto);

    expect(result).toEqual([]);
  });

  it('scans nested arrays', () => {
    const result: any[] = [];
    const proto = new Proto();
    const node: any = {
      nativeNode: {},
      parent: {
        nativeNode: {
          __ngContext__: [[[proto]]],
        },
      },
    };

    funcGetFromNodeIvy(result, node, Proto);
    expect(result).toEqual([proto]);
  });

  it('handles missed nativeNode', () => {
    const result: any[] = [];
    const node: any = {
      parent: {
        nativeNode: {
          __ngContext__: [],
        },
      },
    };

    funcGetFromNodeIvy(result, node, Proto);
    expect(result).toEqual([]);
  });

  it('skips node with _debugContext', () => {
    const result: any[] = [];
    const proto = new Proto();
    const node: any = {
      _debugContext: {},
      nativeNode: {},
      parent: {
        nativeNode: {
          __ngContext__: [[[proto]]],
        },
      },
    };

    funcGetFromNodeIvy(result, node, Proto);
    expect(result).toEqual([]);
  });

  it('handles root node indexes instead of contexts', () => {
    const result: any[] = [];
    const proto = new Proto();

    const lView = [];
    lView[1] = {};
    lView[20] = 6;
    lView[21] = [proto];

    const node: any = {
      nativeNode: {},
      parent: {
        injector: {
          _lView: lView,
        },
        nativeNode: {
          __ngContext__: 6,
        },
      },
    };

    funcGetFromNodeIvy(result, node, Proto);
    expect(result).toEqual([proto]);
  });

  it('skips unknown root node indexes', () => {
    const result: any[] = [];

    const node: any = {
      nativeNode: {},
      parent: {
        injector: {},
        nativeNode: {
          __ngContext__: 6,
        },
      },
    };

    funcGetFromNodeIvy(result, node, Proto);
    expect(result).toEqual([]);
  });

  it('handles child node indexes instead of contexts', () => {
    const result: any[] = [];
    const proto = new Proto();

    const lView = [];
    lView[1] = {};
    lView[20] = 6;
    lView[21] = [proto];

    const rootLView = [];
    rootLView[1] = {};
    rootLView[20] = 0;
    rootLView[21] = lView;

    const node: any = {
      nativeNode: {},
      parent: {
        injector: {
          _lView: rootLView,
        },
        nativeNode: {
          __ngContext__: 6,
        },
      },
    };

    funcGetFromNodeIvy(result, node, Proto);
    expect(result).toEqual([proto]);
  });

  it('skips unknown child node with indexes', () => {
    const result: any[] = [];
    const proto = new Proto();

    const lView = [];
    lView[21] = [proto];

    const rootLView = [];
    rootLView[21] = lView;

    const node: any = {
      nativeNode: {},
      parent: {
        injector: {
          _lView: rootLView,
        },
        nativeNode: {
          __ngContext__: 6,
        },
      },
    };

    funcGetFromNodeIvy(result, node, Proto);
    expect(result).toEqual([]);
  });
});
