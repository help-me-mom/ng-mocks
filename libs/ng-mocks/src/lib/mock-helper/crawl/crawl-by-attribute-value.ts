import funcDirectiveIoParse from '../../common/func.directive-io-parse';
import { MockedDebugNode } from '../../mock-render/types';

import funcGetPublicProviderKeys from './func.get-public-provider-keys';
import funcParseInputsAndRequiresAttributes from './func.parse-inputs-and-requires-attributes';

const detectInClassic = (node: MockedDebugNode, attribute: string, value: any): boolean => {
  for (const key of funcGetPublicProviderKeys(node)) {
    const [inputs, expectedAttributes, nodeIndex] = funcParseInputsAndRequiresAttributes(node, key);
    for (const input of inputs) {
      const { name, alias } = funcDirectiveIoParse(input);
      if (attribute !== (alias || name) || expectedAttributes.indexOf(name) === -1) {
        continue;
      }
      if (value === (node.injector as any).view.nodes[nodeIndex].instance[name]) {
        return true;
      }
    }
  }

  return false;
};

const detectInIvy = (node: MockedDebugNode, attribute: string, value: any): boolean => {
  const attrs = (node.injector as any)._tNode?.attrs || [];
  let step = 2;
  for (let index = 0; index < attrs.length; index += step) {
    // 3 is a divider between static and dynamic bindings
    if (typeof attrs[index] === 'number') {
      step = 1;
      continue;
    }
    const attr = attrs[index];
    if (attr !== attribute || !(node.injector as any)._tNode.inputs?.[attr]) {
      continue;
    }
    const [attrIndex, attrProp] = (node.injector as any)._tNode.inputs[attr];

    if (value === (node.injector as any)._lView?.[attrIndex][attrProp]) {
      return true;
    }
  }

  return false;
};

export default (attribute: string, value: any): ((node: MockedDebugNode) => boolean) =>
  node => {
    if (detectInIvy(node, attribute, value)) {
      return true;
    }

    return detectInClassic(node, attribute, value);
  };
