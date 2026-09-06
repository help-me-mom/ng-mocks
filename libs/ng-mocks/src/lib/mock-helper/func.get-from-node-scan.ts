import { DebugNode } from '@angular/core';

import { AnyType } from '../common/core.types';

const detectGatherFlag = (gather: boolean, el: DebugNode | null, node: any): boolean => {
  // A container can select pipes only when it belongs to this comment node.
  // Check the array first to avoid reading the DOM for every scanned value.
  if (Array.isArray(node)) {
    const nativeNode = el?.nativeNode;

    return !!nativeNode && node[0] === nativeNode && nativeNode.nodeName === '#comment';
  }

  if (!el) {
    return gather;
  }
  const nodeName = node.nodeName;
  if (!nodeName) {
    return gather;
  }

  // checking if a commentNode belongs to the current element.
  // it comes from structural directives.
  if (nodeName === '#comment') {
    return node === el.nativeNode;
  }

  // checking if a textNode belongs to the current element.
  if (nodeName === '#text') {
    return node.parentNode === el.nativeNode;
  }

  return false;
};

const isNotObject = <T>(node: T): boolean => !node || typeof node !== 'object';

const shouldBeScanned = (scanned: Set<any>, node: any): node is any[] => Array.isArray(node) && !scanned.has(node);

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
  scanned: Set<any> = new Set(),
): void => {
  scanned.add(nodes);
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

    if (shouldBeScanned(scanned, node)) {
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
