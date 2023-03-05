/* eslint-disable max-lines */

import { DebugNode, EventEmitter, InjectionToken, Injector, Provider, TemplateRef } from '@angular/core';
import { ComponentFixture, TestModuleMetadata } from '@angular/core/testing';

import { AnyDeclaration, AnyType, DebugNodeSelector, Type } from '../common/core.types';
import { NgModuleWithProviders } from '../common/func.is-ng-module-def-with-providers';
import { IMockBuilderConfig } from '../mock-builder/types';
import { MockedDebugElement, MockedDebugNode } from '../mock-render/types';
import { CustomMockFunction, MockedFunction } from '../mock-service/types';

import { FORMAT_SET, FORMAT_SINGLE } from './format/types';
import mockHelperObject from './mock-helper.object';

/**
 * ngMocks provides a lot of tools to simply testing.
 *
 * @see https://ng-mocks.sudo.eu/api/ngMocks
 */
export const ngMocks: {
  /**
   * ngMocks.autoSpy installs proper spies instead of empty functions.
   *
   * @see https://ng-mocks.sudo.eu/extra/auto-spy
   */
  autoSpy(type: 'jasmine' | 'jest' | 'default' | 'reset'): void;

  /**
   * ngMocks.autoSpy installs proper spies instead of empty functions.
   *
   * @see https://ng-mocks.sudo.eu/extra/auto-spy
   */
  autoSpy(type: CustomMockFunction): void;

  /**
   * ngMocks.defaultConfig sets the default config of declarations for MockBuilder.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/defaultConfig
   */
  defaultConfig<T>(token: string | AnyDeclaration<T>, config?: IMockBuilderConfig): void;

  /**
   * ngMocks.defaultMock sets default customizations of mock tokens.
   * It helps to avoid repetitions from test to test.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/defaultMock
   */
  defaultMock<T>(
    token: InjectionToken<T>,
    handler?: (value: undefined | T, injector: Injector) => undefined | Partial<T>,
    config?: IMockBuilderConfig,
  ): void;

  /**
   * ngMocks.defaultMock sets default customizations of mock string tokens.
   * It helps to avoid repetitions from test to test.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/defaultMock
   */
  defaultMock<T = any>(
    token: string,
    handler?: (value: undefined | T, injector: Injector) => undefined | Partial<T>,
    config?: IMockBuilderConfig,
  ): void;

  /**
   * ngMocks.defaultMock sets default customizations of mock declarations.
   * It helps to avoid repetitions from test to test.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/defaultMock
   */
  defaultMock<T>(
    def: AnyType<T>,
    handler?: (value: T, injector: Injector) => void | Partial<T>,
    config?: IMockBuilderConfig,
  ): void;

  /**
   * ngMocks.defaultMock sets default customizations of mock declarations and tokens.
   * It helps to avoid repetitions from test to test.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/defaultMock
   */
  defaultMock<T = any>(
    defs: Array<AnyDeclaration<T>>,
    handler?: (value: undefined | T, injector: Injector) => undefined | Partial<T>,
    config?: IMockBuilderConfig,
  ): void;

  /**
   * ngMocks.globalExclude configures which declarations, providers and tokens
   * should be excluded from mocks.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/globalExclude
   *
   * ```ts
   * ngMocks.globalExclude(TranslationModule);
   * ```
   */
  globalExclude(source: AnyDeclaration<any>, recursively?: boolean): void;

  /**
   * ngMocks.globalKeep configures which declarations, providers and tokens
   * should not be mocked and will stay as they are in mocks.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/globalKeep
   *
   * ```ts
   * ngMocks.globalKeep(TranslationModule);
   * ```
   */
  globalKeep(source: AnyDeclaration<any>, recursively?: boolean): void;

  /**
   * ngMocks.globalMock configures which declarations, providers and tokens
   * should be mocked in kept declarations.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/globalMock
   *
   * ```ts
   * ngMocks.globalMock(TranslationModule);
   * ```
   */
  globalMock(source: AnyDeclaration<any>, recursively?: boolean): void;

  /**
   * ngMocks.globalReplace configures which declarations, providers and tokens
   * should be substituted in mocks.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/globalReplace
   *
   * ```ts
   * ngMocks.globalReplace(BrowserAnimationsModule, NoopAnimationsModule);
   * ```
   */
  globalReplace(source: AnyType<any>, destination: AnyType<any>): void;

  /**
   * ngMocks.globalWipe resets all customizations of ngMocks.global* and mgMocks.default* functions.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/globalWipe
   *
   * ```ts
   * ngMocks.globalWipe(TranslationModule);
   * ngMocks.globalWipe(BrowserAnimationsModule);
   * ```
   */
  globalWipe(source: AnyDeclaration<any>, recursively?: boolean): void;

  /**
   * ngMocks.change triggers ControlValueAccessor update.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/change
   */
  change(elSelector: DebugNodeSelector, value: any, methodName?: string): void;

  /**
   * ngMocks.touch triggers ControlValueAccessor touch.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/touch
   */
  touch(elSelector: DebugNode | DebugNodeSelector, methodName?: string): void;

  /**
   * ngMocks.click properly simulates a click on an element.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/click
   */
  click(elSelector: HTMLElement | DebugNodeSelector, payload?: Partial<MouseEvent>): void;

  /**
   * ngMocks.trigger lets trigger custom events on DebugElements.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/trigger
   *
   * ```ts
   * ngMocks.trigger(el, new CustomEvent('my-event'));
   * ```
   */
  trigger(elSelector: DebugNodeSelector, event: Event): void;

  /**
   * ngMocks.trigger lets trigger custom events on DebugElements.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/trigger
   *
   * ```ts
   * ngMocks.trigger(el, 'click');
   * ngMocks.trigger(el, 'keydown.control.shift.z');
   * ```
   */
  trigger(
    elSelector: HTMLElement | DebugNodeSelector,
    event: string,
    payload?: Partial<UIEvent | KeyboardEvent | MouseEvent | TouchEvent>,
  ): void;

  /**
   * ngMocks.event builds correct event objects.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/event
   */
  event(
    event: string,
    init?: EventInit,
    overrides?: Partial<UIEvent | KeyboardEvent | MouseEvent | TouchEvent | Event>,
  ): Event;

  /**
   * ngMocks.render renders a templateRef or DebugElement.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/render
   *
   * ```ts
   * ngMocks.header(component, headerEl);
   * ```
   */
  render(
    instance: object,
    template: TemplateRef<any> | DebugNode,
    $implicit?: any,
    variables?: Record<keyof any, any>,
  ): void;

  /**
   * ngMocks.render renders a structural directive.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/render
   *
   * ```ts
   * ngMocks.render(component, directiveInstance);
   * ```
   */
  render(instance: object, directive: object, $implicit?: any, variables?: Record<keyof any, any>): void;

  /**
   * ngMocks.hide hides a rendered templateRef or DebugElement.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/hide
   *
   * ```ts
   * ngMocks.hide(component, headerEl);
   * ```
   */
  hide(instance: object, tpl?: TemplateRef<any> | DebugNode): void;

  /**
   * ngMocks.hide hides a rendered structural directive.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/hide
   *
   * ```ts
   * ngMocks.hide(component, directiveInstance);
   * ```
   */
  hide(instance: object, directive: object): void;

  /**
   * ngMocks.input allows to get an input value without knowing
   * which component / directive it belongs to.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/input
   *
   * ```ts
   * const input = ngMocks.input('app-component', 'version');
   * ```
   */
  input<T = any>(elSelector: DebugNodeSelector, input: string): T;

  /**
   * ngMocks.input allows to get an input value without knowing
   * which component / directive it belongs to, otherwise the notFoundValue.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/input
   *
   * ```ts
   * const input = ngMocks.input('app-component', 'version', undefined);
   * ```
   */
  input<T = any, D = undefined>(elSelector: DebugNodeSelector, input: string, notFoundValue: D): D | T;

  /**
   * ngMocks.output allows to get an output emitter without knowing
   * which component / directive it belongs to.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/output
   *
   * ```ts
   * const outputEmitter = ngMocks.output('app-component', 'update');
   * ```
   */
  output<T = any>(elSelector: DebugNodeSelector, output: string): EventEmitter<T>;

  /**
   * ngMocks.output allows to get an output emitter without knowing
   * which component / directive it belongs to, otherwise the notFoundValue.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/output
   *
   * ```ts
   * const outputEmitter = ngMocks.output('app-component', 'update', undefined);
   * ```
   */
  output<T = any, D = undefined>(elSelector: DebugNodeSelector, output: string, notFoundValue: D): D | EventEmitter<T>;

  /**
   * ngMocks.find searches for the DebugElement of a particular component,
   * and returns the first found.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/find
   *
   * ```ts
   * const el = ngMocks.find(MyComponent);
   * ```
   */
  find<T>(component: Type<T>): MockedDebugElement<T>;

  /**
   * ngMocks.find searches for the DebugElement of a particular component
   * starting from an element, and returns the first found.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/find
   *
   * ```ts
   * const el = ngMocks.find(fixture.debugElement, MyComponent);
   * ```
   */
  find<T>(
    debugElement: MockedDebugElement | ComponentFixture<any> | undefined | null,
    component: Type<T>,
  ): MockedDebugElement<T>;

  /**
   * ngMocks.find searches for the DebugElement of a particular component,
   * and returns the first found, otherwise the notFoundValue.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/find
   *
   * ```ts
   * const el = ngMocks.find(MyComponent, undefined);
   * ```
   */
  find<T, D>(component: Type<T>, notFoundValue: D): D | MockedDebugElement<T>;

  /**
   * ngMocks.find searches for the DebugElement of a particular component
   * starting from an element, and returns the first found, otherwise the notFoundValue.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/find
   *
   * ```ts
   * const el = ngMocks.find(fixture, MyComponent, undefined);
   * ```
   */
  find<T, D>(
    debugElement: MockedDebugElement | ComponentFixture<any> | undefined | null,
    component: Type<T>,
    notFoundValue: D,
  ): D | MockedDebugElement<T>;

  /**
   * ngMocks.find searches for the DebugElement based on css selector,
   * and returns the first found.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/find
   *
   * ```ts
   * const el = ngMocks.find('.header');
   * const el = ngMocks.find('[data-key=5]');
   * const el = ngMocks.find(['data-key', 5]);
   * ```
   */
  find<T = any>(cssSelector: string | [string] | [string, string | number]): MockedDebugElement<T>;

  /**
   * ngMocks.find searches for the DebugElement based on css selector
   * starting from an element, and returns the first found.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/find
   *
   * ```ts
   * const el = ngMocks.find(fixture.debugElement, '.header');
   * const el = ngMocks.find(fixture, '[data-key=5]');
   * const el = ngMocks.find(debugElement, ['data-key', 5]);
   * ```
   */
  find<T = any>(
    debugElement: MockedDebugElement | ComponentFixture<any> | undefined | null,
    cssSelector: string | [string] | [string, string | number],
  ): MockedDebugElement<T>;

  /**
   * ngMocks.find searches for the DebugElement based on css selector,
   * and returns the first found, otherwise the notFoundValue.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/find
   *
   * ```ts
   * const el = ngMocks.find('.header', undefined);
   * const el = ngMocks.find('[data-key=5]', null);
   * const el = ngMocks.find(['data-key', 5], null);
   * ```
   */
  find<T = any, D = undefined>(
    cssSelector: string | [string] | [string, string | number],
    notFoundValue: D,
  ): D | MockedDebugElement<T>;

  /**
   * ngMocks.find searches for the DebugElement based on css selector
   * starting from an element, and returns the first found, otherwise the notFoundValue.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/find
   *
   * ```ts
   * const el = ngMocks.find(fixture.debugElement, '.header', undefined);
   * const el = ngMocks.find(fixture, '[data-key=5]', null);
   * const el = ngMocks.find(debugElement, ['data-key', 5], null);
   * ```
   */
  find<T = any, D = undefined>(
    debugElement: MockedDebugElement | ComponentFixture<any> | undefined | null,
    cssSelector: string | [string] | [string, string | number],
    notFoundValue: D,
  ): D | MockedDebugElement<T>;

  /**
   * ngMocks.findAll searches for all DebugElements of a particular component,
   * and returns an array of them.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findAll
   *
   * ```ts
   * const all = ngMocks.findAll(MyComponent);
   * ```
   */
  findAll<T>(component: Type<T>): Array<MockedDebugElement<T>>;

  /**
   * ngMocks.findAll searches for all DebugElements of a particular component
   * starting from an element, and returns an array of them.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findAll
   *
   * ```ts
   * const all = ngMocks.findAll(fixture.debugElement, MyComponent);
   * ```
   */
  findAll<T>(
    debugElement: MockedDebugElement | ComponentFixture<any> | undefined | null,
    component: Type<T>,
  ): Array<MockedDebugElement<T>>;

  /**
   * ngMocks.findAll searches for all DebugElements based on css selector,
   * and returns an array of them.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findAll
   *
   * ```ts
   * const all = ngMocks.findAll('.header');
   * const all = ngMocks.findAll('[data-key=5]');
   * const all = ngMocks.findAll(['data-key', 5]);
   * ```
   */
  findAll<T = any>(cssSelector: string | [string] | [string, string | number]): Array<MockedDebugElement<T>>;

  /**
   * ngMocks.findAll searches for all DebugElements based on css selector
   * starting from an element, and returns an array of them.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findAll
   *
   * ```ts
   * const all = ngMocks.findAll(fixture.debugElement, '.header');
   * const all = ngMocks.findAll(fixture, '[data-key=5]');
   * const all = ngMocks.findAll(debugElement, ['data-key', 5]);
   * ```
   */
  findAll<T = any>(
    debugElement: MockedDebugElement | ComponentFixture<any> | undefined | null,
    cssSelector: string | [string] | [string, string | number],
  ): Array<MockedDebugElement<T>>;

  /**
   * ngMocks.reveal allows finding DebugNodes which belong to ng-container or ng-template.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/reveal
   *
   * ```ts
   * const ngContainer = ngMocks.reveal(HeaderComponent);
   * ```
   */
  reveal<T>(selector: AnyType<T>): MockedDebugNode<T> | MockedDebugElement<T>;

  /**
   * ngMocks.reveal allows finding DebugNodes which belong to ng-container or ng-template
   * starting from an element.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/reveal
   *
   * ```ts
   * const ngContainer = ngMocks.reveal('header', HeaderComponent);
   * ```
   */
  reveal<T>(elSelector: DebugNodeSelector, selector: AnyType<T>): MockedDebugNode<T> | MockedDebugElement<T>;

  /**
   * ngMocks.reveal allows finding DebugNodes which belong to ng-container or ng-template.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/reveal
   *
   * ```ts
   * const ngContainer = ngMocks.reveal(['tpl', 'header']);
   * ```
   */
  reveal<T = any>(selector: string | [string] | [string, any]): MockedDebugNode<T> | MockedDebugElement<T>;

  /**
   * ngMocks.reveal allows finding DebugNodes which belong to ng-container or ng-template
   * starting from an element.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/reveal
   *
   * ```ts
   * const ngContainer = ngMocks.reveal('header', ['tpl', 'header']);
   * ```
   */
  reveal<T = any>(
    elSelector: DebugNodeSelector,
    selector: string | [string] | [string, any],
  ): MockedDebugNode<T> | MockedDebugElement<T>;

  /**
   * ngMocks.reveal allows finding DebugNodes which belong to ng-container or ng-template,
   * otherwise the notFoundValue.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/reveal
   *
   * ```ts
   * const ngContainer = ngMocks.reveal(HeaderComponent, undefined);
   * ```
   */
  reveal<T, D>(selector: AnyType<T>, notFoundValue: D): D | MockedDebugNode<T> | MockedDebugElement<T>;

  /**
   * ngMocks.reveal allows finding DebugNodes which belong to ng-container or ng-template
   * starting from an element, otherwise the notFoundValue.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/reveal
   *
   * ```ts
   * const ngContainer = ngMocks.reveal('sidebar', HeaderComponent, undefined);
   * ```
   */
  reveal<T, D>(
    elSelector: DebugNodeSelector,
    selector: AnyType<T>,
    notFoundValue: D,
  ): D | MockedDebugNode<T> | MockedDebugElement<T>;

  /**
   * ngMocks.reveal allows finding DebugNodes which belong to ng-container or ng-template,
   * otherwise the notFoundValue.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/reveal
   *
   * ```ts
   * const ngContainer = ngMocks.reveal(['tpl', 'header'], undefined);
   * ```
   */
  reveal<T = any, D = undefined>(
    selector: string | [string] | [string, any],
    notFoundValue: D,
  ): D | MockedDebugNode<T> | MockedDebugElement<T>;

  /**
   * ngMocks.reveal allows finding DebugNodes which belong to ng-container or ng-template
   * starting from an element, otherwise the notFoundValue.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/reveal
   *
   * ```ts
   * const ngContainer = ngMocks.reveal('sidebar', ['tpl', 'header'], undefined);
   * ```
   */
  reveal<T = any, D = undefined>(
    elSelector: DebugNodeSelector,
    selector: string | [string] | [string, any],
    notFoundValue: D,
  ): D | MockedDebugNode<T> | MockedDebugElement<T>;

  /**
   * ngMocks.revealAll allows finding all DebugNodes which belong to ng-container or ng-template.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/revealAll
   *
   * ```ts
   * const ngContainers = ngMocks.revealAll(HeaderComponent);
   * ```
   */
  revealAll<T>(selector: AnyType<T>): Array<MockedDebugNode<T> | MockedDebugElement<T>>;

  /**
   * ngMocks.reveal allows finding all DebugNodes which belong to ng-container or ng-template.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/revealAll
   *
   * ```ts
   * const ngContainers = ngMocks.revealAll(['tpl', 'header']);
   * ```
   */
  revealAll<T = any>(selector: string | [string] | [string, any]): Array<MockedDebugNode<T> | MockedDebugElement<T>>;

  /**
   * ngMocks.reveal allows finding all DebugNodes which belong to ng-container or ng-template
   * starting from an element.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/revealAll
   *
   * ```ts
   * const ngContainers = ngMocks.revealAll('sidebar', HeaderComponent);
   * ```
   */
  revealAll<T>(elSelector: DebugNodeSelector, selector: AnyType<T>): Array<MockedDebugNode<T> | MockedDebugElement<T>>;

  /**
   * ngMocks.reveal allows finding all DebugNodes which belong to ng-container or ng-template
   * starting from an element.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/revealAll
   *
   * ```ts
   * const ngContainers = ngMocks.revealAll('sidebar', ['tpl', 'header']);
   * ```
   */
  revealAll<T = any>(
    elSelector: DebugNodeSelector,
    selector: string | [string] | [string, any],
  ): Array<MockedDebugNode<T> | MockedDebugElement<T>>;

  /**
   * ngMocks.get tries to get an instance of declaration, provider or token
   * from the element which is matching a selector.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/get
   *
   * ```ts
   * const myComponent = ngMocks.get('my-component', MyComponent);
   * const myDirective = ngMocks.get('my-component', MyDirective);
   * ```
   */
  get<T>(elSelector: DebugNodeSelector, provider: AnyDeclaration<T>): T;

  /**
   * ngMocks.get tries to get an instance of declaration, provider or token
   * from the element which is matching a selector, otherwise the notFoundValue.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/get
   *
   * ```ts
   * const myComponent = ngMocks.get('my-component', MyComponent, undefined);
   * const myDirective = ngMocks.get('my-component', MyDirective, null);
   * ```
   */
  get<T, D>(elSelector: DebugNodeSelector, provider: AnyDeclaration<T>, notFoundValue: D): D | T;

  /**
   * ngMocks.get tries to get an instance of provider or token for TestBed.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/get
   *
   * ```ts
   * const myComponent = ngMocks.get(MyComponent);
   * const myDirective = ngMocks.get(MyDirective);
   * ```
   */
  get<T>(provider: AnyDeclaration<T>): T;

  /**
   * ngMocks.findInstance searches for an instance of declaration, provider or token,
   * and returns the first one.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findInstance
   *
   * ```ts
   * const component = ngMocks.findInstance(SidebarComponent);
   * const service = ngMocks.findInstance(AuthService);
   * const config = ngMocks.findInstance(APP_CONFIG);
   * ```
   */
  findInstance<T>(instanceClass: AnyDeclaration<T>): T;

  /**
   * ngMocks.findInstance searches for an instance of declaration, provider or token
   * starting from an element, and returns the first one.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findInstance
   *
   * ```ts
   * const component = ngMocks.findInstance(fixture, SidebarComponent);
   * const service = ngMocks.findInstance('header', AuthService);
   * const config = ngMocks.findInstance(debugElement, APP_CONFIG);
   * ```
   */
  findInstance<T>(elSelector: DebugNodeSelector, instanceClass: AnyDeclaration<T>): T;

  /**
   * ngMocks.findInstance searches for an instance of declaration, provider or token,
   * and returns the first one, otherwise the notFoundValue.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findInstance
   *
   * ```ts
   * const component = ngMocks.findInstance(SidebarComponent, undefined);
   * const service = ngMocks.findInstance(AuthService, null);
   * const config = ngMocks.findInstance(APP_CONFIG, false);
   */
  findInstance<T, D>(instanceClass: AnyDeclaration<T>, notFoundValue: D): D | T;

  /**
   * ngMocks.findInstance searches for an instance of declaration, provider or token
   * starting from an element, and returns the first one, otherwise the notFoundValue.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findInstance
   *
   * ```ts
   * const component = ngMocks.findInstance(fixture, SidebarComponent, undefined);
   * const service = ngMocks.findInstance('header', AuthService, null);
   * const config = ngMocks.findInstance(debugElement, APP_CONFIG, false);
   * ```
   */
  findInstance<T, D>(elSelector: DebugNodeSelector, instanceClass: AnyDeclaration<T>, notFoundValue: D): D | T;

  /**
   * ngMocks.findInstances searches for all instances of declaration, provider or token,
   * and returns an array of them.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findInstances
   *
   * ```ts
   * const components = ngMocks.findInstances(SidebarComponent);
   * const services = ngMocks.findInstances(AuthService);
   * const configs = ngMocks.findInstances(APP_CONFIG);
   * ```
   */
  findInstances<T>(instanceClass: AnyDeclaration<T>): T[];

  /**
   * ngMocks.findInstances searches for all instances of declaration, provider or token
   * starting from an element, and returns an array of them.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findInstances
   *
   * ```ts
   * const components = ngMocks.findInstances(fixture, SidebarComponent);
   * const services = ngMocks.findInstances('header', AuthService);
   * const configs = ngMocks.findInstances(debugElement, APP_CONFIG);
   * ```
   */
  findInstances<T>(elSelector: DebugNodeSelector, instanceClass: AnyDeclaration<T>): T[];

  /**
   * ngMocks.findTemplateRef searches for a TemplateRef which is matching the selector,
   * and returns the first found, otherwise the notFoundValue.
   * The TemplateRef can be rendered later on.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findTemplateRef
   *
   * ```ts
   * const templateRef = ngMocks.findTemplateRef('sidebar', StructuralDirective, undefined);
   * ```
   */
  findTemplateRef<T = any, D = undefined>(
    elSelector: DebugNodeSelector,
    selector: string | [string] | [string, any] | AnyType<any>,
    notFoundValue: D,
  ): D | TemplateRef<T>;

  /**
   * ngMocks.findTemplateRef searches for a TemplateRef which is matching the selector,
   * and returns the first found.
   * The TemplateRef can be rendered later on.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findTemplateRef
   *
   * ```ts
   * const templateRef = ngMocks.findTemplateRef('sidebar', StructuralDirective);
   * ```
   */
  findTemplateRef<T = any>(
    elSelector: DebugNodeSelector,
    selector: string | [string] | [string, any] | AnyType<any>,
  ): TemplateRef<T>;

  /**
   * ngMocks.findTemplateRef searches for a TemplateRef which is matching the selector,
   * and returns the first found, otherwise the notFoundValue.
   * The TemplateRef can be rendered later on.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findTemplateRef
   *
   * ```ts
   * const templateRef = ngMocks.findTemplateRef(['mat-row'], null);
   * ```
   */
  findTemplateRef<T = any, D = undefined>(
    selector: string | [string] | [string, any] | AnyType<any>,
    notFoundValue: D,
  ): D | TemplateRef<T>;

  /**
   * ngMocks.findTemplateRef searches for a TemplateRef which is matching the selector,
   * and returns the first found.
   * The TemplateRef can be rendered later on.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findTemplateRef
   *
   * ```ts
   * const templateRef = ngMocks.findTemplateRef(['mat-row']);
   * ```
   */
  findTemplateRef<T = any>(selector: string | [string] | [string, any] | AnyType<any>): TemplateRef<T>;

  /**
   * ngMocks.findTemplateRefs searches for all TemplateRefs which is matching the selector
   * starting from an element, and returns an array of them.
   * The TemplateRef can be rendered later on.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findTemplateRefs
   *
   * ```ts
   * const templateRefs = ngMocks.findTemplateRefs('header', StructuralDirective);
   * ```
   */
  findTemplateRefs<T = any>(
    elSelector: DebugNodeSelector,
    selector: string | [string] | [string, any] | AnyType<any>,
  ): Array<TemplateRef<T>>;

  /**
   * ngMocks.findTemplateRefs searches for all TemplateRefs which is matching the selector,
   * and returns an array of them.
   * The TemplateRef can be rendered later on.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/findTemplateRefs
   *
   * ```ts
   * const templateRefs = ngMocks.findTemplateRefs(['mat-row']);
   * ```
   */
  findTemplateRefs<T = any>(selector: string | [string] | [string, any] | AnyType<any>): Array<TemplateRef<T>>;

  /**
   * ngMocks.crawl correctly crawls through Angular DOM with respect of TemplateRefs and ng-containers.
   * Usually, it's used internally.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/crawl
   */
  crawl(
    elSelector: DebugNodeSelector,
    callback: (
      node: MockedDebugNode | MockedDebugElement,
      parent?: MockedDebugNode | MockedDebugElement,
    ) => boolean | void,
    includeTextNodes?: boolean,
  ): void;

  /**
   * ngMocks.stub lets replace a method, getter or setter with a dummy callback.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/stub
   *
   * ```ts
   * ngMocks.stub(instance, 'save'); // save is an empty callback now.
   * ngMocks.stub(instance, 'user', 'get'); // getter is an empty callback now.
   * ngMocks.stub(instance, 'user', 'set'); // setter is an empty callback now.
   * ```
   */
  stub<T = MockedFunction, I = any>(instance: I, name: keyof I, style?: 'get' | 'set'): T;

  /**
   * ngMocks.stub lets apply partial customizations to an instance.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/stub
   *
   * ```ts
   * ngMocks.stub(instance, {
   *   save: () => undefined,
   *   user: null,
   * });
   * ```
   */
  stub<I extends object>(instance: I, overrides: Partial<I>): I;

  /**
   * ngMocks.stubMember lets inject spies it to getters of properties of an instance.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/stubMember
   *
   * ```ts
   * ngMocks.stubMember(instance, 'user', jasmine.createSpy(), 'get')
   *   .and.returnValue(null);
   * ```
   */
  stubMember<T extends object, K extends keyof T, S extends () => T[K]>(
    instance: T,
    name: K,
    stub: S,
    encapsulation: 'get',
  ): S;

  /**
   * ngMocks.stubMember lets inject spies it to setters of properties of an instance.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/stubMember
   *
   * ```ts
   * ngMocks.stubMember(instance, 'user', jasmine.createSpy(), 'set')
   *   .and.throwError('setter is forbidden');
   * ```
   */
  stubMember<T extends object, K extends keyof T, S extends (value: T[K]) => void>(
    instance: T,
    name: K,
    stub: S,
    encapsulation: 'set',
  ): S;

  /**
   * ngMocks.stubMember lets inject spies it to an instance.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/stubMember
   *
   * ```ts
   * ngMocks.stubMember(instance, 'save', jasmine.createSpy());
   * ngMocks.stubMember(instance, 'user', null);
   * ```
   */
  stubMember<T extends object, K extends keyof T, S extends T[K]>(instance: T, name: K, stub: S): S;

  /**
   * ngMocks.guts provides a simple way to configure complex mocks.
   * Please check documentation.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/guts
   */
  guts(
    keep: AnyDeclaration<any> | Provider | Array<AnyDeclaration<any> | Provider> | null | undefined,
    mock?:
      | AnyDeclaration<any>
      | NgModuleWithProviders
      | Provider
      | Array<AnyDeclaration<any> | NgModuleWithProviders | Provider>
      | null
      | undefined,
    exclude?: AnyDeclaration<any> | Array<AnyDeclaration<any>> | null | undefined,
  ): TestModuleMetadata;

  /**
   * ngMocks.faster lets reuse the same TestBed between tests instead of resetting it.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/faster
   */
  faster(): void;

  /**
   * ignoreOnConsole suppresses any log calls, other methods can be suppressed too.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/ignoreOnConsole
   */
  ignoreOnConsole(...args: Array<keyof typeof console>): void;

  /**
   * Thanks Ivy, it does not throw an error, and we have to use injector.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/throwOnConsole
   */
  throwOnConsole(...args: Array<keyof typeof console>): void;

  /**
   * ngMocks.formatHtml normalizes html for a DebugElement, fixture or html string.
   * It removes redundant spaces, comments etc.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/formatHtml
   *
   * ```ts
   * const html = ngMocks.formatHTML(fixture);
   * const html = ngMocks.formatHTML(debugElement);
   * const html = ngMocks.formatHTML('<div>   </div>');
   * ```
   */
  formatHtml(html: FORMAT_SINGLE, outer?: boolean): string;

  /**
   * ngMocks.formatHtml normalizes html for an array of DebugElements, fixtures or html strings.
   * It removes redundant spaces, comments etc.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/formatHtml
   *
   * const [html1, html2] = ngMocks.formatHTML([fixture1, fixture2]);
   * const htmlStrings = ngMocks.formatHTML(debugElements);
   */
  formatHtml(html: FORMAT_SET, outer?: boolean): string[];

  /**
   * ngMocks.formatText normalizes text for a DebugElement, fixture or html string.
   * It removes tags, redundant spaces, comments etc.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/formatText
   *
   * ```ts
   * const txt = ngMocks.formatText(fixture);
   * const txt = ngMocks.formatText(debugElement);
   * const txt = ngMocks.formatText('<div>   </div>');
   * ```
   */
  formatText(text: FORMAT_SINGLE, outer?: boolean): string;

  /**
   * ngMocks.formatText normalizes text for an array of DebugElements, fixtures or html strings.
   * It removes tags, redundant spaces, comments etc.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/formatText
   *
   * const [txt1, txt2] = ngMocks.formatText([fixture1, fixture2]);
   * const txtStrings = ngMocks.formatText(debugElements);
   */
  formatText(text: FORMAT_SET, outer?: boolean): string[];

  /**
   * ngMocks.flushTestBed resets TestBed.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/flushTestBed
   */
  flushTestBed(): void;

  /**
   * ngMocks.reset resets cache of ng-mocks.
   *
   * @see https://ng-mocks.sudo.eu/api/ngMocks/reset
   */
  reset(): void;

  /**
   * ngMocks.config lets customize default behavior of error reporting.
   */
  config(config: {
    mockRenderCacheSize?: number | null;
    onMockBuilderMissingDependency?: 'throw' | 'warn' | 'i-know-but-disable' | null;
    onMockInstanceRestoreNeed?: 'throw' | 'warn' | 'i-know-but-disable' | null;
    onTestBedFlushNeed?: 'throw' | 'warn' | 'i-know-but-disable' | null;
  }): void;
} = mockHelperObject;
