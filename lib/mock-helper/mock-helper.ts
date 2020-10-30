// tslint:disable:variable-name unified-signatures no-default-import

import { EventEmitter, InjectionToken, Provider } from '@angular/core';
import { ComponentFixture, TestModuleMetadata } from '@angular/core/testing';

import { AbstractType, AnyType, NgModuleWithProviders, Type } from '../common';
import { MockedDebugElement, MockedDebugNode } from '../mock-render';
import { MockedFunction } from '../mock-service';

import ngMocksFaster from './mock-helper.faster';
import ngMocksFind from './mock-helper.find';
import ngMocksFindAll from './mock-helper.findAll';
import ngMocksFindInstance from './mock-helper.findInstance';
import ngMocksFindInstances from './mock-helper.findInstances';
import ngMocksFlushTestBed from './mock-helper.flushTestBed';
import ngMocksGet from './mock-helper.get';
import ngMocksGuts from './mock-helper.guts';
import ngMocksInput from './mock-helper.input';
import ngMocksOutput from './mock-helper.output';
import ngMocksReset from './mock-helper.reset';
import ngMocksStub from './mock-helper.stub';

/* istanbul ignore next */
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

/**
 * @see https://github.com/ike18t/ng-mocks#ngmocks
 */
export const ngMocks: {
  /**
   * @see https://github.com/ike18t/ng-mocks#making-angular-tests-faster
   */
  faster(): void;

  find<T>(debugElement: MockedDebugElement | ComponentFixture<any>, component: Type<T>): MockedDebugElement<T>;
  find<T, D>(
    debugElement: MockedDebugElement | ComponentFixture<any>,
    component: Type<T>,
    notFoundValue: D
  ): D | MockedDebugElement<T>;

  find<T = any>(debugElement: MockedDebugElement | ComponentFixture<any>, cssSelector: string): MockedDebugElement<T>;
  find<T = any, D = undefined>(
    debugElement: MockedDebugElement | ComponentFixture<any>,
    cssSelector: string,
    notFoundValue: D
  ): D | MockedDebugElement<T>;

  findAll<T>(
    debugElement: MockedDebugElement | ComponentFixture<any>,
    component: Type<T>
  ): Array<MockedDebugElement<T>>;
  findAll<T = any>(
    debugElement: MockedDebugElement | ComponentFixture<any>,
    cssSelector: string
  ): Array<MockedDebugElement<T>>;

  findInstance<T>(debugNode: MockedDebugNode, instanceClass: Type<T>): T;
  findInstance<T, D>(debugNode: MockedDebugNode, instanceClass: Type<T>, notFoundValue: D): D | T;
  findInstances<T>(debugNode: MockedDebugNode, instanceClass: Type<T>): T[];

  flushTestBed(): void;

  get<T>(debugNode: MockedDebugNode, directive: Type<T>): T;
  get<T, D>(debugNode: MockedDebugNode, directive: Type<T>, notFoundValue: D): D | T;

  guts(
    keep: AnyType<any> | InjectionToken<any> | Array<AnyType<any> | InjectionToken<any>>,
    mock?:
      | AnyType<any>
      | InjectionToken<any>
      | NgModuleWithProviders
      | Provider
      | Array<AnyType<any> | InjectionToken<any> | NgModuleWithProviders | Provider>
  ): TestModuleMetadata;

  input<T = any>(debugNode: MockedDebugNode, input: string): T;
  input<T = any, D = undefined>(debugNode: MockedDebugNode, input: string, notFoundValue: D): D | T;

  output<T = any>(debugNode: MockedDebugNode, output: string): EventEmitter<T>;
  output<T = any, D = undefined>(debugNode: MockedDebugNode, output: string, notFoundValue: D): D | EventEmitter<T>;

  reset(): void;

  stub<T = MockedFunction, I = any>(instance: I, name: keyof I, style?: 'get' | 'set'): T;
  stub<I extends object>(instance: I, overrides: Partial<I>): I;
} = {
  faster: ngMocksFaster,
  find: ngMocksFind,
  findAll: ngMocksFindAll,
  findInstance: ngMocksFindInstance,
  findInstances: ngMocksFindInstances,
  flushTestBed: ngMocksFlushTestBed,
  get: ngMocksGet,
  guts: ngMocksGuts,
  input: ngMocksInput,
  output: ngMocksOutput,
  reset: ngMocksReset,
  stub: ngMocksStub,
};
