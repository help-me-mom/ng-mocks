import { TemplateRef } from '@angular/core';

import { Type } from '../common/core.types';
import { MockedDebugNode } from '../mock-render/types';

import funcParseFindArgs from './func.parse-find-args';
import funcParseProviderTokensDirectives from './func.parse-provider-tokens-directives';
import mockHelperInput from './mock-helper.input';

interface DebugNode {
  childNodes?: MockedDebugNode[];
}

type Node = MockedDebugNode & DebugNode;

function nestedCheck<T>(result: T[], node: Node | undefined, check: (node: Node) => void) {
  if (node) {
    check(node);
  }
  for (const childNode of node?.childNodes || []) {
    nestedCheck(result, childNode, check);
  }
}

const compareId = (id: string): ((node: Node) => TemplateRef<any> | undefined) => node => {
  try {
    const tpl = node.injector.get(TemplateRef);
    const tplNativeElement = tpl.elementRef.nativeElement;
    const idNativeElement = node.references[id] ? node.references[id].elementRef.nativeElement : undefined;

    // Ivy things, we need to compare them by elementRef.nativeElement
    return tplNativeElement && tplNativeElement === idNativeElement ? node.references[id] : undefined;
  } catch (e) {
    return undefined;
  }
};

const compareDirective = (declaration: any): ((node: Node) => TemplateRef<any> | undefined) => node => {
  try {
    const tpl = node.injector.get(TemplateRef);
    const instance = node.injector.get(declaration);

    return instance ? tpl : /* istanbul ignore next */ undefined;
  } catch (e) {
    return undefined;
  }
};

const detectSelectorsFromNode = (node: Node): string[] => {
  const selectors: string[] = [];
  for (const token of node.providerTokens) {
    const meta = funcParseProviderTokensDirectives(node, token);
    if (!meta || !meta.selector) {
      continue;
    }
    selectors.push(meta.selector);
  }

  return selectors;
};

const detectQueryInSelectors = (selectors: string[], query: string): boolean => {
  for (const selector of selectors) {
    const attributes = selector.match(/\[([^\]=]+)/g);
    if (!attributes) {
      continue;
    }

    for (const attribute of attributes) {
      if (attribute === `[${query}`) {
        return true;
      }
    }
  }

  return false;
};

const compareAttribute = (query: string): ((node: Node) => TemplateRef<any> | undefined) => node => {
  try {
    const tpl = node.injector.get(TemplateRef);
    if (detectQueryInSelectors(detectSelectorsFromNode(node), query)) {
      return tpl;
    }
  } catch (e) {
    return undefined;
  }

  return undefined;
};

const compareAttributeValue = (
  attribute: string,
  value: any,
): ((node: Node) => TemplateRef<any> | undefined) => node => {
  try {
    const tpl = node.injector.get(TemplateRef);
    const noValue = {};
    const actual = mockHelperInput(node, attribute, noValue);

    return actual === value ? tpl : undefined;
  } catch (e) {
    return undefined;
  }
};

const getDetector = (selector: string | Type<any> | [string] | [string, any] | any) => {
  if (typeof selector === 'string') {
    return compareId(selector);
  }
  if (Array.isArray(selector)) {
    return selector.length === 1 ? compareAttribute(selector[0]) : compareAttributeValue(selector[0], selector[1]);
  }
  if (typeof selector === 'function') {
    return compareDirective(selector);
  }

  throw new Error(`Unknown selector`);
};

export default (...args: any[]): Array<TemplateRef<any>> => {
  const { el, sel } = funcParseFindArgs(args);

  const detector = getDetector(sel);

  const result: Array<TemplateRef<any>> = [];
  nestedCheck(result, el, node => {
    const value = detector(node);
    if (value) {
      result.push(value);
    }
  });

  return result;
};
