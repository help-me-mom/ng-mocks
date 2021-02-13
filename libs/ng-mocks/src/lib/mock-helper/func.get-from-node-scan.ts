import { DebugNode } from '@angular/core';

import { Type } from '../common/core.types';

const detectGatherFlag = (gather: boolean, el: DebugNode | null, node: any): boolean => {
  // LContainer should stop the scan.
  if (Array.isArray(node)) {
    return false;
  }

  if (!el || !node.nodeName) {
    return gather;
  }

  // checking if a textNode belongs to the current element.
  if (node.nodeName === '#text') {
    return node.parentNode === el.nativeNode;
  }

  return false;
};

const isNotObject = (node: any): boolean => !node || typeof node !== 'object';

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
