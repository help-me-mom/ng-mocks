import { DebugNode } from '@angular/core';

import { Type } from '../common/core.types';

const detectGatherFlag = (gather: boolean, el: DebugNode | null, node: any): boolean => {
  if (!el || !node.nodeName) {
    return gather;
  }

  // checking if a textNode belongs to the current element.
  if (node.nodeName === '#text') {
    return node.parentNode === el.nativeNode;
  }

  // checking if an injectedNode belongs to the current element.
  return node === el.nativeNode;
};

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
    normalize: (item: any) => any;
    proto: Type<T>;
    result: T[];
  },
  gatherDefault: boolean,
  scanned: any[] = [],
): void => {
  scanned.push(nodes);
  let gather = gatherDefault;

  for (const raw of nodes) {
    const node = normalize(raw);
    if (!node || typeof node !== 'object') {
      continue;
    }

    if (scanned.indexOf(node) === -1 && Array.isArray(node)) {
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
