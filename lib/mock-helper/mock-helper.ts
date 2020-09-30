/* tslint:disable:variable-name unified-signatures */

import { core } from '@angular/compiler';
import { EventEmitter } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { AbstractType, getSourceOfMock, isNgInjectionToken, Type } from '../common';
import { ngMocksUniverse } from '../common/ng-mocks-universe';
import { directiveResolver } from '../common/reflect';
import { MockedDebugElement, MockedDebugNode } from '../mock-render';
import { MockedFunction, mockServiceHelper } from '../mock-service';

function nestedCheck<T>(
  result: T[],
  node: MockedDebugNode & { childNodes?: MockedDebugNode[] },
  callback: (node: MockedDebugNode) => undefined | T
) {
  const element = callback(node);
  if (element) {
    result.push(element);
  }
  const childNodes = node.childNodes ? node.childNodes : [];
  childNodes.forEach(childNode => {
    nestedCheck(result, childNode, callback);
  });
}

/**
 * @deprecated use ngMocks instead
 */
export const MockHelper: {
  find<T>(debugElement: MockedDebugElement, component: Type<T>): null | MockedDebugElement<T>;
  find<T>(debugElement: MockedDebugElement, component: AbstractType<T>): null | MockedDebugElement<T>;
  find<T = any>(debugElement: MockedDebugElement, cssSelector: string): null | MockedDebugElement<T>;
  findAll<T>(debugElement: MockedDebugElement, component: Type<T>): Array<MockedDebugElement<T>>;
  findAll<T>(debugElement: MockedDebugElement, component: AbstractType<T>): Array<MockedDebugElement<T>>;
  findAll<T = any>(debugElement: MockedDebugElement, cssSelector: string): Array<MockedDebugElement<T>>;
  findDirective<T>(debugNode: MockedDebugNode, directive: Type<T>): undefined | T;
  findDirective<T>(debugNode: MockedDebugNode, directive: AbstractType<T>): undefined | T;
  findDirectiveOrFail<T>(debugNode: MockedDebugNode, directive: Type<T>): T;
  findDirectiveOrFail<T>(debugNode: MockedDebugNode, directive: AbstractType<T>): T;
  findDirectives<T>(debugNode: MockedDebugNode, directive: Type<T>): T[];
  findDirectives<T>(debugNode: MockedDebugNode, directive: AbstractType<T>): T[];
  findOrFail<T>(debugElement: MockedDebugElement, component: Type<T>): MockedDebugElement<T>;
  findOrFail<T>(debugElement: MockedDebugElement, component: AbstractType<T>): MockedDebugElement<T>;
  findOrFail<T = any>(debugElement: MockedDebugElement, cssSelector: string): MockedDebugElement<T>;
  getDirective<T>(debugNode: MockedDebugNode, directive: Type<T>): undefined | T;
  getDirective<T>(debugNode: MockedDebugNode, directive: AbstractType<T>): undefined | T;
  getDirectiveOrFail<T>(debugNode: MockedDebugNode, directive: Type<T>): T;
  getDirectiveOrFail<T>(debugNode: MockedDebugNode, directive: AbstractType<T>): T;
  getInput<T = any>(debugNode: MockedDebugNode, input: string): undefined | T;
  getInputOrFail<T = any>(debugNode: MockedDebugNode, input: string): T;
  getOutput<T = any>(debugNode: MockedDebugNode, output: string): undefined | EventEmitter<T>;
  getOutputOrFail<T = any>(debugNode: MockedDebugNode, output: string): EventEmitter<T>;
  mockService<I extends object, O extends object>(instance: I, overrides: O): I & O;
  mockService<T = MockedFunction>(instance: any, name: string, style?: 'get' | 'set'): T;
} = {
  getInput: (debugNode: MockedDebugNode, input: string): any => ngMocks.input(debugNode, input, undefined),

  getInputOrFail: (debugNode: MockedDebugNode, input: string): any => ngMocks.input(debugNode, input),

  getOutput: (debugNode: MockedDebugNode, output: string): any => ngMocks.output(debugNode, output, undefined),

  getOutputOrFail: (debugNode: MockedDebugNode, output: string): any => ngMocks.output(debugNode, output),

  getDirectiveOrFail: <T>(debugNode: MockedDebugNode, directive: Type<T>): T => ngMocks.get(debugNode, directive),

  getDirective: <T>(debugNode: MockedDebugNode, directive: Type<T>): undefined | T =>
    ngMocks.get(debugNode, directive, undefined),

  findDirectiveOrFail: <T>(debugNode: MockedDebugNode, directive: Type<T>): T =>
    ngMocks.findInstance(debugNode, directive),

  findDirective: <T>(debugNode: MockedDebugNode, directive: Type<T>): undefined | T =>
    ngMocks.findInstance(debugNode, directive, undefined),

  findDirectives: <T>(debugNode: MockedDebugNode, directive: Type<T>): T[] =>
    ngMocks.findInstances(debugNode, directive),

  findOrFail: (el: MockedDebugElement, sel: any) => ngMocks.find(el, sel),

  // tslint:disable-next-line:no-null-keyword
  find: (el: MockedDebugElement, sel: any) => ngMocks.find(el, sel, null),

  findAll: (el: MockedDebugElement, sel: any) => ngMocks.findAll(el, sel),

  mockService: <T = MockedFunction>(instance: any, override: any, style?: 'get' | 'set'): T => {
    if (typeof override !== 'object') {
      return ngMocks.stub(instance, override, style);
    }

    return ngMocks.stub(instance, override);
  },
};

const defaultNotFoundValue = {}; // simulating Symbol

export const ngMocks: {
  find<T>(debugElement: MockedDebugElement, component: Type<T>): MockedDebugElement<T>;
  find<T, D>(debugElement: MockedDebugElement, component: Type<T>, notFoundValue: D): D | MockedDebugElement<T>;

  find<T = any>(debugElement: MockedDebugElement, cssSelector: string): MockedDebugElement<T>;
  find<T = any, D = undefined>(
    debugElement: MockedDebugElement,
    cssSelector: string,
    notFoundValue: D
  ): D | MockedDebugElement<T>;

  findAll<T>(debugElement: MockedDebugElement, component: Type<T>): Array<MockedDebugElement<T>>;
  findAll<T = any>(debugElement: MockedDebugElement, cssSelector: string): Array<MockedDebugElement<T>>;

  findInstance<T>(debugNode: MockedDebugNode, instanceClass: Type<T>): T;
  findInstance<T, D>(debugNode: MockedDebugNode, instanceClass: Type<T>, notFoundValue: D): D | T;
  findInstances<T>(debugNode: MockedDebugNode, instanceClass: Type<T>): T[];

  flushTestBed(): void;

  get<T>(debugNode: MockedDebugNode, directive: Type<T>): T;
  get<T, D>(debugNode: MockedDebugNode, directive: Type<T>, notFoundValue: D): D | T;

  input<T = any>(debugNode: MockedDebugNode, input: string): T;
  input<T = any, D = undefined>(debugNode: MockedDebugNode, input: string, notFoundValue: D): D | T;

  output<T = any>(debugNode: MockedDebugNode, output: string): EventEmitter<T>;
  output<T = any, D = undefined>(debugNode: MockedDebugNode, output: string, notFoundValue: D): D | EventEmitter<T>;

  reset(): void;

  stub<T = MockedFunction, I = any>(instance: I, name: keyof I, style?: 'get' | 'set'): T;
  stub<I extends object, O extends Partial<I>>(instance: I, overrides: O): I & O;
} = {
  find: (...args: any[]) => {
    const el: MockedDebugElement = args[0];
    const sel: string | Type<any> = args[1];
    const notFoundValue: any = args.length === 3 ? args[2] : defaultNotFoundValue;

    const term = typeof sel === 'string' ? By.css(sel) : By.directive(getSourceOfMock(sel));
    const result = el.query(term);
    if (result) {
      return result;
    }
    if (notFoundValue !== defaultNotFoundValue) {
      return notFoundValue;
    }
    if (!result) {
      throw new Error(`Cannot find an element via ngMocks.find(${typeof sel === 'string' ? sel : sel.name})`);
    }
  },

  findAll: (el: MockedDebugElement, sel: any) => {
    const term = typeof sel === 'string' ? By.css(sel) : By.directive(getSourceOfMock(sel));
    return el.queryAll(term);
  },

  findInstance: <T>(...args: any[]) => {
    const el: MockedDebugElement = args[0];
    const sel: Type<T> = args[1];
    const notFoundValue: any = args.length === 3 ? args[2] : defaultNotFoundValue;

    const result = ngMocks.findInstances(el, getSourceOfMock(sel));
    if (result.length) {
      return result[0];
    }
    if (notFoundValue !== defaultNotFoundValue) {
      return notFoundValue;
    }
    throw new Error(`Cannot find ${sel.name} directive via ngMocks.findInstance`);
  },

  findInstances: <T>(el: MockedDebugNode, sel: Type<T>): T[] => {
    const result: T[] = [];
    nestedCheck<T>(result, el, node => {
      try {
        return node.injector.get(getSourceOfMock(sel));
      } catch (error) {
        return undefined;
      }
    });
    return result;
  },

  get: <T>(...args: any[]) => {
    const el: MockedDebugElement = args[0];
    const sel: Type<T> = args[1];
    const notFoundValue: any = args.length === 3 ? args[2] : defaultNotFoundValue;
    let notFound = false;

    // Looking for related attribute directive.
    try {
      return el.injector.get(getSourceOfMock(sel));
    } catch (error) {
      // looks like the directive is structural.
    }

    // Looking for related structural directive.
    // It's located as prev node.
    const prevNode = notFound ? undefined : el.nativeNode.previousSibling;
    if (!prevNode || prevNode.nodeName !== '#comment') {
      notFound = true;
    }
    const matches = notFound || !el || !el.parent ? [] : el.parent.queryAllNodes(node => node.nativeNode === prevNode);
    if (matches.length === 0) {
      notFound = true;
    }
    const matchedNode = matches[0];
    try {
      return matchedNode.injector.get(getSourceOfMock(sel));
    } catch (error) {
      notFound = true;
    }
    if (notFound && notFoundValue !== defaultNotFoundValue) {
      return notFoundValue;
    }
    throw new Error(`Cannot find ${sel.name} directive via ngMocks.get`);
  },

  input: (...args: any[]) => {
    const el: MockedDebugElement = args[0];
    const sel: string = args[1];
    const notFoundValue: any = args.length === 3 ? args[2] : defaultNotFoundValue;

    for (const token of el.providerTokens) {
      if (isNgInjectionToken(token)) {
        continue;
      }

      let meta: core.Directive | undefined;
      if (!meta) {
        try {
          meta = directiveResolver.resolve(token);
        } catch (e) {
          throw new Error('ng-mocks is not in JIT mode and cannot resolve declarations');
        }
      }

      const { inputs } = meta;
      if (!inputs) {
        continue;
      }
      for (const inputDef of inputs) {
        const [prop = '', alias = ''] = inputDef.split(':', 2).map(v => v.trim());
        if (!prop) {
          continue;
        }
        if (!alias && prop !== sel) {
          continue;
        }
        if (alias && alias !== sel) {
          continue;
        }
        const directive: any = ngMocks.get(el, token, undefined);
        if (!directive) {
          continue;
        }
        return directive[prop];
      }
    }
    if (notFoundValue !== defaultNotFoundValue) {
      return notFoundValue;
    }
    throw new Error(`Cannot find ${sel} input via ngMocks.input`);
  },

  output: (...args: any[]) => {
    const el: MockedDebugElement = args[0];
    const sel: string = args[1];
    const notFoundValue: any = args.length === 3 ? args[2] : defaultNotFoundValue;

    for (const token of el.providerTokens) {
      if (isNgInjectionToken(token)) {
        continue;
      }

      let meta: core.Directive | undefined;
      if (!meta) {
        try {
          meta = directiveResolver.resolve(token);
        } catch (e) {
          throw new Error('ng-mocks is not in JIT mode and cannot resolve declarations');
        }
      }

      const { outputs } = meta;
      if (!outputs) {
        continue;
      }
      for (const outputDef of outputs) {
        const [prop = '', alias = ''] = outputDef.split(':', 2).map(v => v.trim());
        if (!prop) {
          continue;
        }
        if (!alias && prop !== sel) {
          continue;
        }
        if (alias && alias !== sel) {
          continue;
        }
        const directive: any = ngMocks.get(el, token, undefined);
        if (!directive) {
          continue;
        }
        return directive[prop];
      }
    }
    if (notFoundValue !== defaultNotFoundValue) {
      return notFoundValue;
    }
    throw new Error(`Cannot find ${sel} input via ngMocks.output`);
  },

  stub: <T = MockedFunction>(instance: any, override: any, style?: 'get' | 'set'): T => {
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

  flushTestBed(): void {
    const testBed: any = getTestBed();
    testBed._instantiated = false;
    testBed._moduleFactory = undefined;
    testBed._testModuleRef = null;
  },

  reset(): void {
    ngMocksUniverse.builder = new Map();
    ngMocksUniverse.cacheMocks = new Map();
    ngMocksUniverse.cacheProviders = new Map();
    ngMocksUniverse.config = new Map();
    ngMocksUniverse.flags = new Set(['cacheModule', 'cacheComponent', 'cacheDirective', 'cacheProvider']);
    ngMocksUniverse.touches = new Set();
  },
};
