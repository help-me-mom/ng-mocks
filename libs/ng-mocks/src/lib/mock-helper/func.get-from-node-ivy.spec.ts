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
});
