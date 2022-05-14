import { DebugNode } from '@angular/core';

import { AnyDeclaration } from '../common/core.types';
import { isNgDef } from '../common/func.is-ng-def';

import funcGetFromNodeInjector from './func.get-from-node-injector';
import funcGetFromNodeIvy from './func.get-from-node-ivy';
import funcGetFromNodeStandard from './func.get-from-node-standard';

export interface Node {
  _debugContext?: {
    elDef: {
      nodeIndex: number;
    };
    nodeDef: {
      nodeIndex: number;
    };
    nodeIndex: number;
    view: {
      nodes: Array<{
        instance?: any;
        renderElement?: any;
        renderText?: any;
        value?: any;
      }>;
    };
  };
  parent?: (DebugNode & Node) | null;
}

export default <T>(result: T[], node: DebugNode & Node, proto: AnyDeclaration<T>): T[] => {
  funcGetFromNodeInjector(result, node, proto);
  if (!isNgDef(proto, 't')) {
    funcGetFromNodeStandard(result, node, proto);
    funcGetFromNodeIvy(result, node, proto);
  }

  return result;
};
