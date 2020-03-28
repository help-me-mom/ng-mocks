/* tslint:disable:variable-name */

import { DebugNode, Type } from '@angular/core';

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

export const MockHelper = {
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

  mockService: <T = MockedFunction>(instance: any, name: string, style?: 'get' | 'set'): T =>
    mockServiceHelper.mock(instance, name, style),
};
