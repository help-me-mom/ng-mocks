import funcGetFromNodeScan from './func.get-from-node-scan';

describe('func.get-from-node-scan:performance', () => {
  class Proto {}

  it('preserves collection boundaries without a selected debug node', () => {
    const first = new Proto();
    const nested = new Proto();
    const ignored = new Proto();
    const result: Proto[] = [];

    funcGetFromNodeScan(
      {
        el: null,
        nodes: [first, [nested], ignored],
        normalize: item => item,
        proto: Proto,
        result,
      },
      true,
    );

    expect(result).toEqual([first, nested]);
    expect(result[0]).toBe(first);
    expect(result[1]).toBe(nested);

    const disabled: Proto[] = [];
    funcGetFromNodeScan(
      {
        el: null,
        nodes: [first, [nested], ignored],
        normalize: item => item,
        proto: Proto,
        result: disabled,
      },
      false,
    );

    expect(disabled).toEqual([]);
  });

  it('reads a scanned DOM node name only once', () => {
    const nativeNode = document.createElement('div');
    nativeNode.textContent = 'target';
    const text = nativeNode.firstChild as Text;
    const nodeName = spyOnProperty(
      text,
      'nodeName',
      'get',
    ).and.callThrough();
    const instance = new Proto();
    const result: Proto[] = [];

    funcGetFromNodeScan(
      {
        el: { nativeNode } as never,
        nodes: [text, instance],
        normalize: item => item,
        proto: Proto,
        result,
      },
      true,
    );

    expect(result).toEqual([instance]);
    // DOM getters are expensive in repeated instance searches.
    expect(nodeName.calls.count()).toBe(1);
  });

  it('avoids reading the selected DOM node name for ordinary values', () => {
    const nativeNode = document.createComment('target');
    const nodeName = spyOnProperty(
      nativeNode,
      'nodeName',
      'get',
    ).and.callThrough();
    const instance = new Proto();
    const result: Proto[] = [];

    funcGetFromNodeScan(
      {
        el: { nativeNode } as never,
        nodes: [instance],
        normalize: item => item,
        proto: Proto,
        result,
      },
      true,
    );

    expect(result).toEqual([instance]);
    expect(nodeName).not.toHaveBeenCalled();
  });

  it('visits shared cyclic arrays once per search and observes later changes', () => {
    const first = new Proto();
    const shared: any[] = [first];
    shared.push(shared);
    const normalize = jasmine
      .createSpy('normalize')
      .and.callFake(item => item);
    const result: Proto[] = [];

    funcGetFromNodeScan(
      {
        el: null,
        nodes: [shared, shared],
        normalize,
        proto: Proto,
        result,
      },
      true,
    );

    expect(result).toEqual([first]);
    expect(result[0]).toBe(first);
    expect(normalize.calls.count()).toBe(4);

    const second = new Proto();
    shared[0] = second;
    const updated: Proto[] = [];
    funcGetFromNodeScan(
      {
        el: null,
        nodes: [shared, shared],
        normalize,
        proto: Proto,
        result: updated,
      },
      true,
    );

    expect(updated).toEqual([second]);
    expect(updated[0]).toBe(second);
    expect(normalize.calls.count()).toBe(8);
  });
});
