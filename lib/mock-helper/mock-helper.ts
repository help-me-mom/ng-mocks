/* tslint:disable:variable-name */

import { DebugElement, Type } from '@angular/core';

export const MockHelper = {
  getDirective: <T>(debugElement: DebugElement, directive: Type<T>): undefined | T => {
    // Looking for related attribute directive.
    try {
      return debugElement.injector.get(directive);
    } catch (error) {
      // looks like the directive is structural.
    }

    // Looking for related structural directive.
    // It's located as prev node.
    if (!debugElement.parent) {
      return undefined;
    }
    const prevNode = debugElement.nativeNode.previousSibling;
    if (!prevNode) {
      return undefined;
    }
    if (prevNode.nodeName !== '#comment') {
      return undefined;
    }
    const matches = debugElement.parent.queryAllNodes((node) => node.nativeNode === prevNode);
    if (matches.length === 0) {
      return undefined;
    }
    const matchedNode = matches[0];
    try {
      return matchedNode.injector.get(directive);
    } catch (error) {
      return undefined;
    }
  }
};
