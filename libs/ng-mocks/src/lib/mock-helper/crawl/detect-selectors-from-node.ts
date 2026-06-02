import funcDirectiveIoParse from '../../common/func.directive-io-parse';
import { MockedDebugNode } from '../../mock-render/types';
import funcParseProviderTokensDirectives from '../func.parse-provider-tokens-directives';

import funcGetPublicProviderKeys from './func.get-public-provider-keys';
import funcParseInputsAndRequiresAttributes from './func.parse-inputs-and-requires-attributes';

const collectSelectors = (node: MockedDebugNode): string[] => {
  const selectors: string[] = [];

  for (const token of node.providerTokens) {
    const meta = funcParseProviderTokensDirectives(node, token);
    if (meta?.selector && selectors.indexOf(meta.selector) === -1) {
      selectors.push(meta.selector);
    }
  }

  return selectors;
};

const collectAttributesClassic = (node: MockedDebugNode): string[] => {
  const result: string[] = [];

  for (const key of funcGetPublicProviderKeys(node)) {
    const [inputs, expectedAttributes] = funcParseInputsAndRequiresAttributes(node, key);
    for (const input of inputs) {
      const { name, alias } = funcDirectiveIoParse(input);
      const attr = alias || name;
      if (expectedAttributes.indexOf(name) !== -1 && result.indexOf(attr) === -1) {
        result.push(attr);
      }
    }
  }

  return result;
};

const collectAttributesIvy = (node: MockedDebugNode): string[] => {
  const result: string[] = [];

  const attrs = (node.injector as any)._tNode?.attrs || [];
  let step = 2;
  for (let index = 0; index < attrs.length; index += step) {
    // 3 is a divider between static and dynamic bindings
    if (typeof attrs[index] === 'number') {
      step = 1;
      continue;
    }
    const attr = attrs[index];
    if ((node.injector as any)._tNode.inputs?.[attr] && result.indexOf(attr) === -1) {
      result.push(attr);
    }
  }

  return result;
};

export default (node: MockedDebugNode): [string[], string[]] => {
  const selectors = collectSelectors(node);
  const attributes = [...collectAttributesClassic(node), ...collectAttributesIvy(node)];

  return [selectors, attributes];
};
