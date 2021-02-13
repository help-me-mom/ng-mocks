import { DebugNode } from '@angular/core';

import { Type } from '../common/core.types';

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

export default <T>(result: T[], node: (DebugNode & Node) | null | undefined, proto: Type<T>): T[] => {
  funcGetFromNodeInjector(result, node, proto);
  funcGetFromNodeStandard(result, node, proto);
  funcGetFromNodeIvy(result, node, proto);

  return result;
};
