import coreReflectDirectiveResolve from '../../common/core.reflect.directive-resolve';
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
    if (attr !== attribute) {
      continue;
    }
    const { directiveStart, inputs, hostDirectiveInputs } = (
      node.injector as unknown as {
        _tNode: {
          directiveStart: number;
          inputs?: Record<string, Array<number | string>>;
          hostDirectiveInputs?: Record<string, Array<number | string>>;
        };
      }
    )._tNode;
    const hostInputs = hostDirectiveInputs?.[attr] || [];
    for (const attrIndex of [...(inputs?.[attr] || []), ...hostInputs]) {
      // Input flags are numeric too, but fall below the node's directive indices.
      if (typeof attrIndex !== 'number' || attrIndex < directiveStart) {
        continue;
      }

      // Host mappings pair each index with the directive's original public alias.
      const hostIndex = hostInputs.indexOf(attrIndex);
      const inputName = hostIndex === -1 ? attr : hostInputs[hostIndex + 1];
      const instance = (node.injector as { _lView?: Record<number, Record<string, unknown>> })._lView?.[attrIndex];
      let attributeValue = instance?.[inputName];
      try {
        // Several directives can share an alias, so resolve the current instance's own input.
        for (const input of coreReflectDirectiveResolve(instance?.constructor).inputs!) {
          const parsed = funcDirectiveIoParse(input);
          if (inputName === (parsed.alias || parsed.name)) {
            const inputValue = instance![parsed.name];
            attributeValue = parsed.isSignal && typeof inputValue === 'function' ? inputValue() : inputValue;
            break;
          }
        }
      } catch {
        // Keep direct property lookup when declaration metadata is unavailable.
      }

      if (value === attributeValue) {
        return true;
      }
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
