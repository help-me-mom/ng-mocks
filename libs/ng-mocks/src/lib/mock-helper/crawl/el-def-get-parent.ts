import { DebugElement, ViewContainerRef } from '@angular/core';

import coreInjector from '../../common/core.injector';

import elDefGetNode from './el-def-get-node';

const getVcr = (node: any, child: any): undefined | ViewContainerRef => {
  if (node === child) {
    return undefined;
  }
  if (child.nativeNode.nodeName !== '#comment') {
    return undefined;
  }

  return coreInjector(ViewContainerRef, child.injector);
};

const getScanViewRefRootNodes = (node: any, child: any): Array<[number, any]> => {
  const vcr = getVcr(node, child);
  if (!vcr) {
    return [];
  }

  const result: Array<[number, any]> = [];
  for (let vrIndex = 0; vrIndex < vcr.length; vrIndex += 1) {
    const vr = vcr.get(vrIndex);
    if (!vr) {
      continue;
    }

    for (let rnIndex = 0; rnIndex < (vr as any).rootNodes.length; rnIndex += 1) {
      result.push([rnIndex, (vr as any).rootNodes[rnIndex]]);
    }
  }

  return result;
};

const scanViewRef = (node: DebugElement) => {
  let result: any;
  let index: any;

  for (const child of node.parent?.childNodes || []) {
    for (const [rnIndex, rootNode] of getScanViewRefRootNodes(node, child)) {
      if (rootNode === node.nativeNode && (index === undefined || rnIndex < index)) {
        result = elDefGetNode(child);
        index = rnIndex;
      }
    }
  }

  return result;
};

export default (node: any) => {
  return (
    node.injector._tNode?.parent || // ivy
    node.injector.elDef?.parent || // classic
    scanViewRef(node) ||
    node.parent?.injector._tNode || // ivy
    node.parent?.injector.elDef || // classic
    undefined
  );
};
