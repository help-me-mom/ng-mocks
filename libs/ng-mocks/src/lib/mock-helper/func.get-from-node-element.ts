import { DebugNode } from '@angular/core';

export default (node: DebugNode): DebugNode =>
  node.nativeNode.nodeName === '#text' && node.parent ? node.parent : node;
