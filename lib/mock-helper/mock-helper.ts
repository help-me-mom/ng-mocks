/* tslint:disable:variable-name unified-signatures */

import { EventEmitter, Type } from '@angular/core';
import { By } from '@angular/platform-browser';

import { directiveResolver } from '../common/reflect';
import { MockedDebugElement, MockedDebugNode } from '../mock-render';
import { MockedFunction, mockServiceHelper } from '../mock-service';

function nestedCheck<T>(result: T[], node: MockedDebugNode, callback: (node: MockedDebugNode) => undefined | T) {
  const element = callback(node);
  if (element) {
    result.push(element);
  }
  const childNodes = node.childNodes ? node.childNodes : [];
  childNodes.forEach(childNode => {
    nestedCheck(result, childNode, callback);
  });
}

export const MockHelper: {
  find<T>(debugElement: MockedDebugElement, component: Type<T>): null | MockedDebugElement<T>;
  find<T = any>(debugElement: MockedDebugElement, cssSelector: string): null | MockedDebugElement<T>;
  findAll<T>(debugElement: MockedDebugElement, component: Type<T>): Array<MockedDebugElement<T>>;
  findAll<T = any>(debugElement: MockedDebugElement, cssSelector: string): Array<MockedDebugElement<T>>;
  findDirective<T>(debugNode: MockedDebugNode, directive: Type<T>): undefined | T;
  findDirectiveOrFail<T>(debugNode: MockedDebugNode, directive: Type<T>): T;
  findDirectives<T>(debugNode: MockedDebugNode, directive: Type<T>): T[];
  findOrFail<T>(debugElement: MockedDebugElement, component: Type<T>): MockedDebugElement<T>;
  findOrFail<T = any>(debugElement: MockedDebugElement, cssSelector: string): MockedDebugElement<T>;
  getDirective<T>(debugNode: MockedDebugNode, directive: Type<T>): undefined | T;
  getDirectiveOrFail<T>(debugNode: MockedDebugNode, directive: Type<T>): T;
  getInput<T = any>(debugNode: MockedDebugNode, input: string): undefined | T;
  getInputOrFail<T = any>(debugNode: MockedDebugNode, input: string): T;
  getOutput<T = any>(debugNode: MockedDebugNode, output: string): undefined | EventEmitter<T>;
  getOutputOrFail<T = any>(debugNode: MockedDebugNode, output: string): EventEmitter<T>;
  mockService<I extends object, O extends object>(instance: I, overrides: O): I & O;
  mockService<T = MockedFunction>(instance: any, name: string, style?: 'get' | 'set'): T;
} = {
  getInput: (debugNode: MockedDebugNode, input: string): any => {
    for (const token of debugNode.providerTokens) {
      const { inputs } = directiveResolver.resolve(token);
      if (!inputs) {
        continue;
      }
      for (const inputDef of inputs) {
        const [prop = '', alias = ''] = inputDef.split(':', 2).map(v => v.trim());
        if (!prop) {
          continue;
        }
        if (!alias && prop !== input) {
          continue;
        }
        if (alias !== input) {
          continue;
        }
        const directive: any = MockHelper.getDirective(debugNode, token);
        if (!directive) {
          continue;
        }
        return directive[prop];
      }
    }
  },

  getInputOrFail: (debugNode: MockedDebugNode, input: string): any => {
    // for inputs with a value of undefined it's hard to detect if it exists or doesn't.
    // therefore we have copy-paste until best times when someone combines them correctly together.
    for (const token of debugNode.providerTokens) {
      const { inputs } = directiveResolver.resolve(token);
      if (!inputs) {
        continue;
      }
      for (const inputDef of inputs) {
        const [prop = '', alias = ''] = inputDef.split(':', 2).map(v => v.trim());
        if (!prop) {
          continue;
        }
        if (!alias && prop !== input) {
          continue;
        }
        if (alias !== input) {
          continue;
        }
        const directive: any = MockHelper.getDirective(debugNode, token);
        if (!directive) {
          continue;
        }
        return directive[prop];
      }
    }
    throw new Error(`Cannot find ${input} input via MockHelper.getInputOrFail`);
  },

  getOutput: (debugNode: MockedDebugNode, output: string): any => {
    for (const token of debugNode.providerTokens) {
      const { outputs } = directiveResolver.resolve(token);
      if (!outputs) {
        continue;
      }
      for (const outputDef of outputs) {
        const [prop = '', alias = ''] = outputDef.split(':', 2).map(v => v.trim());
        if (!prop) {
          continue;
        }
        if (!alias && prop !== output) {
          continue;
        }
        if (alias !== output) {
          continue;
        }
        const directive: any = MockHelper.getDirective(debugNode, token);
        if (!directive) {
          continue;
        }
        return directive[prop];
      }
    }
  },

  getOutputOrFail: (debugNode: MockedDebugNode, output: string): any => {
    const result = MockHelper.getOutput(debugNode, output);
    if (!result) {
      throw new Error(`Cannot find ${output} output via MockHelper.getOutputOrFail`);
    }
    return result;
  },

  getDirectiveOrFail: <T>(debugNode: MockedDebugNode, directive: Type<T>): T => {
    const result = MockHelper.getDirective(debugNode, directive);
    if (!result) {
      throw new Error(`Cannot find ${directive.name} directive via MockHelper.getDirectiveOrFail`);
    }
    return result;
  },

  getDirective: <T>(debugNode: MockedDebugNode, directive: Type<T>): undefined | T => {
    // Looking for related attribute directive.
    try {
      return debugNode.injector.get(directive);
    } catch (error) {
      // looks like the directive is structural.
    }

    // Looking for related structural directive.
    // It's located as prev node.
    if (!debugNode || !debugNode.parent) {
      return undefined;
    }
    const prevNode = debugNode.nativeNode.previousSibling;
    if (!prevNode || prevNode.nodeName !== '#comment') {
      return undefined;
    }
    const matches = debugNode.parent.queryAllNodes(node => node.nativeNode === prevNode);
    if (matches.length === 0) {
      return undefined;
    }
    const matchedNode = matches[0];
    try {
      return matchedNode.injector.get(directive);
    } catch (error) {
      return undefined;
    }
  },

  findDirectiveOrFail: <T>(debugNode: MockedDebugNode, directive: Type<T>): T => {
    const result = MockHelper.findDirective(debugNode, directive);
    if (!result) {
      throw new Error(`Cannot find ${directive.name} directive via MockHelper.findDirectiveOrFail`);
    }
    return result;
  },

  findDirective: <T>(debugNode: MockedDebugNode, directive: Type<T>): undefined | T => {
    const result: T[] = [];
    nestedCheck<T>(result, debugNode, node => {
      try {
        return node.injector.get(directive);
      } catch (error) {
        return undefined;
      }
    });
    return result.length ? result[0] : undefined;
  },

  findDirectives: <T>(debugNode: MockedDebugNode, directive: Type<T>): T[] => {
    const result: T[] = [];
    nestedCheck<T>(result, debugNode, node => {
      try {
        return node.injector.get(directive);
      } catch (error) {
        return undefined;
      }
    });
    return result;
  },

  findOrFail: (el: MockedDebugElement, sel: any) => {
    const result = MockHelper.find(el, sel);
    if (!result) {
      throw new Error(`Cannot find an element via MockHelper.findOrFail`);
    }
    return result;
  },

  find: (el: MockedDebugElement, sel: any) => {
    const term = typeof sel === 'string' ? By.css(sel) : By.directive(sel);
    return el.query(term);
  },

  findAll: (el: MockedDebugElement, sel: any) => {
    const term = typeof sel === 'string' ? By.css(sel) : By.directive(sel);
    return el.queryAll(term);
  },

  mockService: <T = MockedFunction>(instance: any, override: string | object, style?: 'get' | 'set'): T => {
    if (typeof override === 'string') {
      return mockServiceHelper.mock(instance, override, style);
    }
    for (const key of Object.getOwnPropertyNames(override)) {
      const def = Object.getOwnPropertyDescriptor(override, key);
      if (def) {
        Object.defineProperty(instance, key, def);
      }
    }
    return instance;
  },
};
