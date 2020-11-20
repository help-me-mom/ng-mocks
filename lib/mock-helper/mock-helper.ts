import { EventEmitter, InjectionToken, Provider } from '@angular/core';
import { ComponentFixture, TestModuleMetadata } from '@angular/core/testing';

import { AnyType, Type } from '../common/core.types';
import { NgModuleWithProviders } from '../common/func.is-ng-module-def-with-providers';
import { MockedDebugElement, MockedDebugNode } from '../mock-render/types';
import { MockedFunction } from '../mock-service/types';

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

/**
 * @see https://github.com/ike18t/ng-mocks#ngmocks
 */
export const ngMocks: {
  /**
   * @see https://github.com/ike18t/ng-mocks#making-angular-tests-faster
   */
  faster(): void;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksfind
   */
  find<T>(component: Type<T>): MockedDebugElement<T>;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksfind
   */
  find<T>(debugElement: MockedDebugElement | ComponentFixture<any>, component: Type<T>): MockedDebugElement<T>;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksfind
   */
  find<T, D>(component: Type<T>, notFoundValue: D): D | MockedDebugElement<T>;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksfind
   */
  find<T, D>(
    debugElement: MockedDebugElement | ComponentFixture<any>,
    component: Type<T>,
    notFoundValue: D,
  ): D | MockedDebugElement<T>;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksfind
   */
  find<T = any>(cssSelector: string): MockedDebugElement<T>;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksfind
   */
  find<T = any>(debugElement: MockedDebugElement | ComponentFixture<any>, cssSelector: string): MockedDebugElement<T>;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksfind
   */
  find<T = any, D = undefined>(cssSelector: string, notFoundValue: D): D | MockedDebugElement<T>;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksfind
   */
  find<T = any, D = undefined>(
    debugElement: MockedDebugElement | ComponentFixture<any>,
    cssSelector: string,
    notFoundValue: D,
  ): D | MockedDebugElement<T>;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksfindall
   */
  findAll<T>(component: Type<T>): Array<MockedDebugElement<T>>;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksfindall
   */
  findAll<T>(
    debugElement: MockedDebugElement | ComponentFixture<any>,
    component: Type<T>,
  ): Array<MockedDebugElement<T>>;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksfindall
   */
  findAll<T = any>(cssSelector: string): Array<MockedDebugElement<T>>;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksfindall
   */
  findAll<T = any>(
    debugElement: MockedDebugElement | ComponentFixture<any>,
    cssSelector: string,
  ): Array<MockedDebugElement<T>>;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksfindinstance
   */
  findInstance<T>(instanceClass: Type<T>): T;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksfindinstance
   */
  findInstance<T>(debugNode: MockedDebugNode | ComponentFixture<any>, instanceClass: Type<T>): T;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksfindinstance
   */
  findInstance<T, D>(instanceClass: Type<T>, notFoundValue: D): D | T;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksfindinstance
   */
  findInstance<T, D>(
    debugNode: MockedDebugNode | ComponentFixture<any>,
    instanceClass: Type<T>,
    notFoundValue: D,
  ): D | T;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksfindinstances
   */
  findInstances<T>(instanceClass: Type<T>): T[];

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksfindinstances
   */
  findInstances<T>(debugNode: MockedDebugNode | ComponentFixture<any>, instanceClass: Type<T>): T[];

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksflushtestbed
   */
  flushTestBed(): void;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksget
   */
  get<T>(debugNode: MockedDebugNode, directive: Type<T>): T;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksget
   */
  get<T, D>(debugNode: MockedDebugNode, directive: Type<T>, notFoundValue: D): D | T;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksguts
   */
  guts(
    keep:
      | AnyType<any>
      | InjectionToken<any>
      | Provider
      | Array<AnyType<any> | InjectionToken<any> | Provider>
      | null
      | undefined,
    mock?:
      | AnyType<any>
      | InjectionToken<any>
      | NgModuleWithProviders
      | Provider
      | Array<AnyType<any> | InjectionToken<any> | NgModuleWithProviders | Provider>
      | null
      | undefined,
    exclude?: AnyType<any> | InjectionToken<any> | Array<AnyType<any> | InjectionToken<any>> | null | undefined,
  ): TestModuleMetadata;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksinput
   */
  input<T = any>(debugNode: MockedDebugNode, input: string): T;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksinput
   */
  input<T = any, D = undefined>(debugNode: MockedDebugNode, input: string, notFoundValue: D): D | T;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksoutput
   */
  output<T = any>(debugNode: MockedDebugNode, output: string): EventEmitter<T>;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksoutput
   */
  output<T = any, D = undefined>(debugNode: MockedDebugNode, output: string, notFoundValue: D): D | EventEmitter<T>;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksreset
   */
  reset(): void;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksstub
   */
  stub<T = MockedFunction, I = any>(instance: I, name: keyof I, style?: 'get' | 'set'): T;

  /**
   * @see https://github.com/ike18t/ng-mocks#ngmocksstub
   */
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
