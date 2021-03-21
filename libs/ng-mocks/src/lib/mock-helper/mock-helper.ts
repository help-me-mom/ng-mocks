// tslint:disable max-file-line-count

import { DebugNode, EventEmitter, InjectionToken, Injector, Provider, TemplateRef } from '@angular/core';
import { ComponentFixture, TestModuleMetadata } from '@angular/core/testing';

import { AnyType, Type } from '../common/core.types';
import { NgModuleWithProviders } from '../common/func.is-ng-module-def-with-providers';
import { MockedDebugElement, MockedDebugNode } from '../mock-render/types';
import { CustomMockFunction, MockedFunction } from '../mock-service/types';

import { FORMAT_SET, FORMAT_SINGLE } from './format/types';
import mockHelperObject from './mock-helper.object';

/**
 * @see https://ng-mocks.sudo.eu/api/ngMocks
 */
export const ngMocks: {
  /**
   * @see https://ng-mocks.sudo.eu/extra/auto-spy
   */
  autoSpy(type: 'jasmine' | 'jest' | 'default' | 'reset'): void;

  /**
   * @see https://ng-mocks.sudo.eu/extra/auto-spy
   */
  autoSpy(type: CustomMockFunction): void;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/change
   */
  change(el: DebugNode, value: any): void;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/crawl
   */
  crawl(
    debugElement: MockedDebugNode,
    callback: (
      node: MockedDebugNode | MockedDebugElement,
      parent?: MockedDebugNode | MockedDebugElement,
    ) => boolean | void,
    includeTextNodes?: boolean,
  ): void;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/defaultMock
   */
  defaultMock<T>(
    token: InjectionToken<T>,
    handler?: (value: undefined | T, injector: Injector) => undefined | Partial<T>,
  ): void;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/defaultMock
   */
  defaultMock<T = any>(
    token: string,
    handler?: (value: undefined | T, injector: Injector) => undefined | Partial<T>,
  ): void;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/defaultMock
   */
  defaultMock<T>(def: AnyType<T>, handler?: (value: T, injector: Injector) => void | Partial<T>): void;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/faster
   */
  faster(): void;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/find
   */
  find<T>(component: Type<T>): MockedDebugElement<T>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/find
   */
  find<T>(
    debugElement: MockedDebugElement | ComponentFixture<any> | undefined | null,
    component: Type<T>,
  ): MockedDebugElement<T>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/find
   */
  find<T, D>(component: Type<T>, notFoundValue: D): D | MockedDebugElement<T>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/find
   */
  find<T, D>(
    debugElement: MockedDebugElement | ComponentFixture<any> | undefined | null,
    component: Type<T>,
    notFoundValue: D,
  ): D | MockedDebugElement<T>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/find
   */
  find<T = any>(cssSelector: string | [string] | [string, string | number]): MockedDebugElement<T>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/find
   */
  find<T = any>(
    debugElement: MockedDebugElement | ComponentFixture<any> | undefined | null,
    cssSelector: string | [string] | [string, string | number],
  ): MockedDebugElement<T>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/find
   */
  find<T = any, D = undefined>(
    cssSelector: string | [string] | [string, string | number],
    notFoundValue: D,
  ): D | MockedDebugElement<T>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/find
   */
  find<T = any, D = undefined>(
    debugElement: MockedDebugElement | ComponentFixture<any> | undefined | null,
    cssSelector: string | [string] | [string, string | number],
    notFoundValue: D,
  ): D | MockedDebugElement<T>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findAll
   */
  findAll<T>(component: Type<T>): Array<MockedDebugElement<T>>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findAll
   */
  findAll<T>(
    debugElement: MockedDebugElement | ComponentFixture<any> | undefined | null,
    component: Type<T>,
  ): Array<MockedDebugElement<T>>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findAll
   */
  findAll<T = any>(cssSelector: string | [string] | [string, string | number]): Array<MockedDebugElement<T>>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findAll
   */
  findAll<T = any>(
    debugElement: MockedDebugElement | ComponentFixture<any> | undefined | null,
    cssSelector: string | [string] | [string, string | number],
  ): Array<MockedDebugElement<T>>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findInstance
   */
  findInstance<T>(instanceClass: Type<T>): T;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findInstance
   */
  findInstance<T>(debugNode: MockedDebugNode | ComponentFixture<any> | undefined | null, instanceClass: Type<T>): T;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findInstance
   */
  findInstance<T, D>(instanceClass: Type<T>, notFoundValue: D): D | T;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findInstance
   */
  findInstance<T, D>(
    debugNode: MockedDebugNode | ComponentFixture<any> | undefined | null,
    instanceClass: Type<T>,
    notFoundValue: D,
  ): D | T;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findInstances
   */
  findInstances<T>(instanceClass: Type<T>): T[];

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findInstances
   */
  findInstances<T>(debugNode: MockedDebugNode | ComponentFixture<any> | undefined | null, instanceClass: Type<T>): T[];

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findTemplateRef
   */
  findTemplateRef<T = any, D = undefined>(
    debugNode: MockedDebugNode | ComponentFixture<any> | undefined | null,
    selector: string | [string] | [string, any] | AnyType<any>,
    notFoundValue: D,
  ): D | TemplateRef<T>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findTemplateRef
   */
  findTemplateRef<T = any>(
    debugNode: MockedDebugNode | ComponentFixture<any> | undefined | null,
    selector: string | [string] | [string, any] | AnyType<any>,
  ): TemplateRef<T>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findTemplateRef
   */
  findTemplateRef<T = any, D = undefined>(
    selector: string | [string] | [string, any] | AnyType<any>,
    notFoundValue: D,
  ): D | TemplateRef<T>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findTemplateRef
   */
  findTemplateRef<T = any>(selector: string | [string] | [string, any] | AnyType<any>): TemplateRef<T>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findTemplateRefs
   */
  findTemplateRefs<T = any>(
    debugNode: MockedDebugNode | ComponentFixture<any> | undefined | null,
    selector: string | [string] | [string, any] | AnyType<any>,
  ): Array<TemplateRef<T>>;
  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findTemplateRefs
   */
  findTemplateRefs<T = any>(selector: string | [string] | [string, any] | AnyType<any>): Array<TemplateRef<T>>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/flushTestBed
   */
  flushTestBed(): void;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/formatHtml
   */
  formatHtml(html: FORMAT_SINGLE, outer?: boolean): string;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/formatHtml
   */
  formatHtml(html: FORMAT_SET, outer?: boolean): string[];

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/formatText
   */
  formatText(text: FORMAT_SINGLE, outer?: boolean): string;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/formatText
   */
  formatText(text: FORMAT_SET, outer?: boolean): string[];

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/get
   */
  get<T>(debugNode: MockedDebugNode | undefined | null, directive: AnyType<T>): T;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/get
   */
  get<T, D>(debugNode: MockedDebugNode | undefined | null, directive: AnyType<T>, notFoundValue: D): D | T;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/globalExclude
   */
  globalExclude(source: AnyType<any> | InjectionToken<any>): void;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/globalKeep
   */
  globalKeep(source: AnyType<any> | InjectionToken<any>): void;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/globalMock
   */
  globalMock(source: AnyType<any> | InjectionToken<any>): void;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/globalReplace
   */
  globalReplace(source: AnyType<any>, destination: AnyType<any>): void;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/globalWipe
   */
  globalWipe(source: AnyType<any> | InjectionToken<any>): void;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/guts
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
   * @see https://ng-mocks.sudo.eu/api/ngMocks/hide
   */
  hide(instance: object, tpl?: TemplateRef<any> | DelayNode): void;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/hide
   */
  hide(instance: object, directive: object): void;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/input
   */
  input<T = any>(debugNode: MockedDebugNode | undefined | null, input: string): T;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/input
   */
  input<T = any, D = undefined>(debugNode: MockedDebugNode | undefined | null, input: string, notFoundValue: D): D | T;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/output
   */
  output<T = any>(debugNode: MockedDebugNode | undefined | null, output: string): EventEmitter<T>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/output
   */
  output<T = any, D = undefined>(
    debugNode: MockedDebugNode | undefined | null,
    output: string,
    notFoundValue: D,
  ): D | EventEmitter<T>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/render
   */
  render(
    instance: object,
    template: TemplateRef<any> | DebugNode,
    $implicit?: any,
    variables?: Record<keyof any, any>,
  ): void;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/render
   */
  render(instance: object, directive: object, $implicit?: any, variables?: Record<keyof any, any>): void;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/reset
   */
  reset(): void;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/reveal
   */
  reveal<T>(selector: AnyType<T>): MockedDebugNode<T> | MockedDebugElement<T>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/reveal
   */
  reveal<T>(
    debugNode: MockedDebugNode | ComponentFixture<any> | undefined | null,
    selector: AnyType<T>,
  ): MockedDebugNode<T> | MockedDebugElement<T>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/reveal
   */
  reveal<T = any>(selector: string | [string] | [string, any]): MockedDebugNode<T> | MockedDebugElement<T>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/reveal
   */
  reveal<T = any>(
    debugNode: MockedDebugNode | ComponentFixture<any> | undefined | null,
    selector: string | [string] | [string, any],
  ): MockedDebugNode<T> | MockedDebugElement<T>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/reveal
   */
  reveal<T, D>(selector: AnyType<T>, notFoundValue: D): D | MockedDebugNode<T> | MockedDebugElement<T>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/reveal
   */
  reveal<T, D>(
    debugNode: MockedDebugNode | ComponentFixture<any> | undefined | null,
    selector: AnyType<T>,
    notFoundValue: D,
  ): D | MockedDebugNode<T> | MockedDebugElement<T>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/reveal
   */
  reveal<T = any, D = undefined>(
    selector: string | [string] | [string, any],
    notFoundValue: D,
  ): D | MockedDebugNode<T> | MockedDebugElement<T>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/reveal
   */
  reveal<T = any, D = undefined>(
    debugNode: MockedDebugNode | ComponentFixture<any> | undefined | null,
    selector: string | [string] | [string, any],
    notFoundValue: D,
  ): D | MockedDebugNode<T> | MockedDebugElement<T>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/revealAll
   */
  revealAll<T>(selector: AnyType<T>): Array<MockedDebugNode<T> | MockedDebugElement<T>>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/revealAll
   */
  revealAll<T = any>(selector: string | [string] | [string, any]): Array<MockedDebugNode<T> | MockedDebugElement<T>>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/revealAll
   */
  revealAll<T>(
    debugNode: MockedDebugNode | ComponentFixture<any> | undefined | null,
    selector: AnyType<T>,
  ): Array<MockedDebugNode<T> | MockedDebugElement<T>>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/revealAll
   */
  revealAll<T = any>(
    debugNode: MockedDebugNode | ComponentFixture<any> | undefined | null,
    selector: string | [string] | [string, any],
  ): Array<MockedDebugNode<T> | MockedDebugElement<T>>;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/stub
   */
  stub<T = MockedFunction, I = any>(instance: I, name: keyof I, style?: 'get' | 'set'): T;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/stub
   */
  stub<I extends object>(instance: I, overrides: Partial<I>): I;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/stubMember
   */
  stubMember<T extends object, K extends keyof T, S extends () => T[K]>(
    instance: T,
    name: K,
    stub: S,
    encapsulation: 'get',
  ): S;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/stubMember
   */
  stubMember<T extends object, K extends keyof T, S extends (value: T[K]) => void>(
    instance: T,
    name: K,
    stub: S,
    encapsulation: 'set',
  ): S;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/stubMember
   */
  stubMember<T extends object, K extends keyof T, S extends T[K]>(instance: T, name: K, stub: S): S;

  /**
   * Thanks Ivy, it does not throw an error and we have to use injector.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/throwOnConsole
   */
  throwOnConsole(): void;

  /**
   * @see https://ng-mocks.sudo.eu/api/ngMocks/touch
   */
  touch(el: DebugNode): void;
} = mockHelperObject;
