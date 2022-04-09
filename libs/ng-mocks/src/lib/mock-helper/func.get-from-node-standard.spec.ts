import funcGetFromNodeStandard from './func.get-from-node-standard';

describe('func.get-from-node-standard', () => {
  class Proto {}

  it('finds proto in renderElement', () => {
    const result: any[] = [];
    const proto = new Proto();
    const node: any = {
      _debugContext: {
        view: {
          nodes: [
            {
              renderElement: proto,
            },
          ],
        },
      },
      nativeNode: {
        nodeName: '#text',
      },
      parent: {},
    };

    funcGetFromNodeStandard(result, node, Proto);

    expect(result).toEqual([proto]);
  });

  it('finds proto in renderText', () => {
    const result: any[] = [];
    const proto = new Proto();
    const node: any = {
      _debugContext: {
        view: {
          nodes: [
            {
              renderText: proto,
            },
          ],
        },
      },
      nativeNode: {
        nodeName: '#text',
      },
      parent: {},
    };

    funcGetFromNodeStandard(result, node, Proto);

    expect(result).toEqual([proto]);
  });

  it('finds proto in instance', () => {
    const result: any[] = [];
    const proto = new Proto();
    const node: any = {
      _debugContext: {
        view: {
          nodes: [
            {
              instance: proto,
            },
          ],
        },
      },
      nativeNode: {
        nodeName: '#text',
      },
      parent: {},
    };

    funcGetFromNodeStandard(result, node, Proto);

    expect(result).toEqual([proto]);
  });

  it('does not find proto in a random key', () => {
    const result: any[] = [];
    const proto = new Proto();
    const node: any = {
      _debugContext: {
        view: {
          nodes: [
            {
              random: proto,
            },
          ],
        },
      },
      nativeNode: {
        nodeName: '#text',
      },
      parent: {},
    };

    funcGetFromNodeStandard(result, node, Proto);

    expect(result).toEqual([]);
  });

  it('does not find proto in literals', () => {
    const result: any[] = [];
    const node: any = {
      _debugContext: {
        view: {
          nodes: [true, false, null, 1, ''],
        },
      },
      nativeNode: {
        nodeName: '#text',
      },
      parent: {},
    };

    funcGetFromNodeStandard(result, node, Proto);

    expect(result).toEqual([]);
  });

  it('skips empty nodes', () => {
    const result: any[] = [];
    funcGetFromNodeStandard(result, undefined, Proto);
    expect(result).toEqual([]);
  });

  it('skips nodes without debugElement', () => {
    const result: any[] = [];
    const node: any = {};
    funcGetFromNodeStandard(result, node, Proto);
    expect(result).toEqual([]);
  });
});
