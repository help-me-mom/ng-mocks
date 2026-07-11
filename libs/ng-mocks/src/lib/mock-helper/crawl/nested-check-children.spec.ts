import nestedCheckChildren from './nested-check-children';

describe('nested-check-children', () => {
  it('collects projected body nodes between their anchor boundaries', () => {
    const elementDefinition: any = {};
    elementDefinition.parent = elementDefinition;
    const nativeNode = { nodeName: 'DIV' };
    const node: any = {
      injector: { elDef: { parent: elementDefinition } },
      nativeNode,
    };
    const projectedNode: any = {
      injector: { elDef: { parent: elementDefinition } },
      nativeNode: { nodeName: 'SPAN' },
    };
    const anchorNode: any = {
      injector: { elDef: { parent: elementDefinition } },
      nativeNode: { nodeName: '#comment' },
    };
    node.injector.elDef = elementDefinition;
    node.parent = {
      childNodes: [node, projectedNode, anchorNode],
      name: 'BODY',
    };

    expect(nestedCheckChildren(node)).toEqual([
      node,
      projectedNode,
      anchorNode,
      projectedNode,
    ]);
  });
});
