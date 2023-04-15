import { DebugNode } from '@angular/core';

import { AnyType } from '../common/core.types';

const detectGatherFlag = (gather: boolean, el: DebugNode | null, node: any): boolean => {
  // LContainer for structural directives can be a trigger for pipes.
  if (
    el &&
    el.nativeNode &&
    el.nativeNode.nodeName === '#comment' &&
    Array.isArray(node) &&
    node[0] === el.nativeNode
  ) {
    return true;
  }

  // LContainer should stop the scan.
  if (Array.isArray(node)) {
    return false;
  }

  if (!el || !node.nodeName) {
    return gather;
  }

  // checking if a commentNode belongs to the current element.
  // it comes from structural directives.
  if (node.nodeName === '#comment') {
    return node === el.nativeNode;
  }

  // checking if a textNode belongs to the current element.
  if (node.nodeName === '#text') {
    return node.parentNode === el.nativeNode;
  }

  return false;
};

const isNotObject = <T>(node: T): boolean => !node || typeof node !== 'object';

const shouldBeScanned = (scanned: any[], node: any): boolean => scanned.indexOf(node) === -1 && Array.isArray(node);

const scan = <T>(
  {
    result,
    el,
    nodes,
    normalize,
    proto,
  }: {
    el: DebugNode | null;
    nodes: any[];
    normalize: (item: T) => T;
    proto: AnyType<T>;
    result: T[];
  },
  gatherDefault: boolean,
  scanned: any[] = [],
): void => {
  scanned.push(nodes);
  let gather = gatherDefault;

  let nodesLength = nodes.length;
  if (nodes.length > 1 && nodes[1] && typeof nodes[1] === 'object' && nodes[1].bindingStartIndex) {
    nodesLength = nodes[1].bindingStartIndex;
  }

  for (let index = 0; index < nodesLength; index += 1) {
    const node = normalize(nodes[index]);
    if (isNotObject(node)) {
      continue;
    }

    if (shouldBeScanned(scanned, node) && Array.isArray(node)) {
      scan({ result, el, nodes: node, normalize, proto }, gather, scanned);
    }

    gather = detectGatherFlag(gather, el, node);
    if (!gather) {
      continue;
    }

    if (result.indexOf(node) === -1 && node instanceof proto) {
      result.push(node);
    }
  }
};

export default (() => scan)();
