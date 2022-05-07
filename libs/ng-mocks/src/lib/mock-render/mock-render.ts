import { InjectionToken } from '@angular/core';

import { AnyType } from '../common/core.types';

import { MockRenderFactory } from './mock-render-factory';
import { IMockRenderOptions, MockedComponentFixture } from './types';

/**
 * This signature of MockRender lets create an empty fixture.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
export function MockRender(): MockedComponentFixture<void, void>;

/**
 * This signature of MockRender lets create a fixture to access a token.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
export function MockRender<MComponent>(
  template: InjectionToken<MComponent>,
  params?: undefined | null,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, void>;

/**
 * This signature of MockRender lets create a fixture to access a component without parameters.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
export function MockRender<MComponent>(
  template: AnyType<MComponent>,
  params: undefined | null,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, MComponent>;

/**
 * This signature of MockRender lets create a fixture with parameters to access a component.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
export function MockRender<MComponent, TComponent extends object>(
  template: AnyType<MComponent>,
  params: TComponent,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, TComponent>;

/**
 * This signature of MockRender lets create a fixture with parameters to access a component.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
export function MockRender<MComponent, TComponent extends object = Record<keyof any, any>>(
  template: AnyType<MComponent>,
  params: TComponent,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, TComponent>;

/**
 * This signature of MockRender without params should not autocomplete any keys of any types.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
export function MockRender<MComponent>(template: AnyType<MComponent>): MockedComponentFixture<MComponent, MComponent>;

/**
 * This signature of MockRender without params should not autocomplete any keys of any types.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
export function MockRender<MComponent = void>(template: string): MockedComponentFixture<MComponent>;

/**
 * This signature of MockRender lets create a fixture based on string template.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
export function MockRender<MComponent = void>(
  template: string,
  params: undefined | null,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, void>;

/**
 * This signature of MockRender lets create a fixture with parameters to access a string based template.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
export function MockRender<MComponent = void, TComponent extends Record<keyof any, any> = Record<keyof any, any>>(
  template: string,
  params: TComponent,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, TComponent>;

/**
 * This signature of MockRender lets create a fixture with parameters to access a string based template.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
export function MockRender<MComponent, TComponent extends Record<keyof any, any> = Record<keyof any, any>>(
  template: string,
  params: TComponent,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, TComponent>;

export function MockRender<MComponent, TComponent extends Record<keyof any, any>>(
  template?: string | AnyType<MComponent> | InjectionToken<MComponent>,
  params?: TComponent,
  flags: boolean | IMockRenderOptions = true,
): any {
  const tpl = arguments.length === 0 ? '' : template;
  const bindings = params && typeof params === 'object' ? Object.keys(params) : params;
  const options = typeof flags === 'boolean' ? { detectChanges: flags } : { ...flags };
  const factory = (MockRenderFactory as any)(tpl, bindings, options);

  return factory(params, options.detectChanges);
}
