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

  const tNode = (
    node.injector as {
      _tNode?: {
        attrs?: Array<string | number>;
        hostDirectiveInputs?: Record<string, unknown> | null;
        inputs?: Record<string, unknown> | null;
      };
    }
  )._tNode;
  if (!tNode) {
    return result;
  }

  const attrs = tNode.attrs || [];
  let step = 2;
  for (let index = 0; index < attrs.length; index += step) {
    const attr = attrs[index];
    // 3 is a divider between static and dynamic bindings
    if (typeof attr === 'number') {
      step = 1;
      continue;
    }
    // Angular input tables can inherit Object.prototype; only declared bindings count.
    const input = tNode.inputs && Object.prototype.hasOwnProperty.call(tNode.inputs, attr) && tNode.inputs[attr];
    const hostInput =
      tNode.hostDirectiveInputs &&
      Object.prototype.hasOwnProperty.call(tNode.hostDirectiveInputs, attr) &&
      tNode.hostDirectiveInputs[attr];
    if ((input || hostInput) && result.indexOf(attr) === -1) {
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
