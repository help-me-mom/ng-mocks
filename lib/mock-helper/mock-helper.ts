/* tslint:disable:variable-name unified-signatures */

import { DebugNode, Type } from '@angular/core';
import { By } from '@angular/platform-browser';

import { MockedDebugElement } from '../mock-render';
import { MockedFunction, mockServiceHelper } from '../mock-service';

interface INestedNodes extends DebugNode {
  childNodes?: INestedNodes[];
}

function nestedCheck<T>(result: T[], node: INestedNodes, callback: (node: INestedNodes) => undefined | T) {
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
  find<T>(debugElement: MockedDebugElement<any>, component: Type<T>): null | MockedDebugElement<T>;
  find<T = any>(debugElement: MockedDebugElement<any>, cssSelector: string): null | MockedDebugElement<T>;
  findAll<T>(debugElement: MockedDebugElement<any>, component: Type<T>): Array<MockedDebugElement<T>>;
  findAll<T = any>(debugElement: MockedDebugElement<any>, cssSelector: string): Array<MockedDebugElement<T>>;
  findDirective<T>(debugNode: DebugNode, directive: Type<T>): undefined | T;
  findDirectiveOrFail<T>(debugNode: DebugNode, directive: Type<T>): T;
  findDirectives<T>(debugNode: DebugNode, directive: Type<T>): T[];
  findOrFail<T>(debugElement: MockedDebugElement<any>, component: Type<T>): MockedDebugElement<T>;
  findOrFail<T = any>(debugElement: MockedDebugElement<any>, cssSelector: string): MockedDebugElement<T>;
  getDirective<T>(debugNode: DebugNode, directive: Type<T>): undefined | T;
  getDirectiveOrFail<T>(debugNode: DebugNode, directive: Type<T>): T;
  mockService<T = MockedFunction>(instance: any, name: string, style?: 'get' | 'set'): T;
} = {
  getDirectiveOrFail: <T>(debugNode: DebugNode, directive: Type<T>): T => {
    const result = MockHelper.getDirective(debugNode, directive);
    if (!result) {
      throw new Error(`Cannot find a directive via MockHelper.getDirectiveOrFail`);
    }
    return result;
  },

  getDirective: <T>(debugNode: DebugNode, directive: Type<T>): undefined | T => {
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

  findDirectiveOrFail: <T>(debugNode: DebugNode, directive: Type<T>): T => {
    const result = MockHelper.findDirective(debugNode, directive);
    if (!result) {
      throw new Error(`Cannot find a directive via MockHelper.findDirectiveOrFail`);
    }
    return result;
  },

  findDirective: <T>(debugNode: DebugNode, directive: Type<T>): undefined | T => {
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

  findDirectives: <T>(debugNode: DebugNode, directive: Type<T>): T[] => {
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

  findOrFail: (el: MockedDebugElement<any>, sel: any) => {
    const result = MockHelper.find(el, sel);
    if (!result) {
      throw new Error(`Cannot find an element via MockHelper.findOrFail`);
    }
    return result;
  },

  find: (el: MockedDebugElement<any>, sel: any) => {
    const term = typeof sel === 'string' ? By.css(sel) : By.directive(sel);
    return el.query(term);
  },

  findAll: (el: MockedDebugElement<any>, sel: any) => {
    const term = typeof sel === 'string' ? By.css(sel) : By.directive(sel);
    return el.queryAll(term);
  },

  mockService: <T = MockedFunction>(instance: any, name: string, style?: 'get' | 'set'): T =>
    mockServiceHelper.mock(instance, name, style),
};
