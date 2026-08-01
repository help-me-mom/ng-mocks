import { InjectionToken } from '@angular/core';

import { AnyType } from '../lib/common/core.types';
import { IMockRenderFactoryOptions, MockedComponentFixture } from '../lib/mock-render/types.legacy';

export interface MockRenderFactory<C = any, F extends keyof any = keyof C> {
  bindings: keyof F;
  configureTestBed: () => void;
  declaration: AnyType<never>;
  <T extends Record<F, any>>(params?: Partial<T>, detectChanges?: boolean): MockedComponentFixture<C, T>;
}

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
export declare function MockRenderFactory<MComponent>(
  template: InjectionToken<MComponent>,
  bindings?: undefined | null,
  options?: IMockRenderFactoryOptions,
): MockRenderFactory<MComponent, never>;

/**
 * MockRenderFactory is a delayed version of MockRender.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
export declare function MockRenderFactory<MComponent>(
  template: AnyType<MComponent>,
  bindings: undefined | null,
  options?: IMockRenderFactoryOptions,
): MockRenderFactory<MComponent, keyof MComponent>;

/**
 * MockRenderFactory is a delayed version of MockRender.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
export declare function MockRenderFactory<MComponent, TKeys extends keyof any>(
  template: AnyType<MComponent>,
  bindings: TKeys[],
  options?: IMockRenderFactoryOptions,
): MockRenderFactory<MComponent, TKeys>;

/**
 * MockRenderFactory is a delayed version of MockRender.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
export declare function MockRenderFactory<MComponent, TKeys extends keyof any = keyof any>(
  template: AnyType<MComponent>,
  bindings: TKeys[],
  options?: IMockRenderFactoryOptions,
): MockRenderFactory<MComponent, TKeys>;

/**
 * Without params we should not autocomplete any keys of any types.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
export declare function MockRenderFactory<MComponent>(
  template: AnyType<MComponent>,
): MockRenderFactory<MComponent, keyof MComponent>;

/**
 * An empty string does not have point.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
export declare function MockRenderFactory(template: ''): MockRenderFactory<void, never>;

/**
 * Without params we should not autocomplete any keys of any types.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
export declare function MockRenderFactory<MComponent = void>(template: string): MockRenderFactory<MComponent>;

/**
 * MockRenderFactory is a delayed version of MockRender.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
export declare function MockRenderFactory<MComponent = void, TKeys extends keyof any = keyof any>(
  template: string,
  bindings: TKeys[],
  options?: IMockRenderFactoryOptions,
): MockRenderFactory<MComponent, TKeys>;
