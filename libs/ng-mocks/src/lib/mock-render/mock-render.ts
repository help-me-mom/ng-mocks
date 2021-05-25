import { InjectionToken } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { AnyType } from '../common/core.types';

import { MockRenderFactory } from './mock-render-factory';
import { IMockRenderOptions, MockedComponentFixture } from './types';

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
function MockRender<MComponent>(
  template: InjectionToken<MComponent>,
  params?: undefined | null,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, void>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
function MockRender<MComponent>(
  template: AnyType<MComponent>,
  params: undefined | null,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, MComponent>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
function MockRender<MComponent, TComponent extends object>(
  template: AnyType<MComponent>,
  params: TComponent,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, TComponent>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
function MockRender<MComponent, TComponent extends object = Record<keyof any, any>>(
  template: AnyType<MComponent>,
  params: TComponent,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, TComponent>;

/**
 * Without params we should not autocomplete any keys of any types.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
function MockRender<MComponent>(template: AnyType<MComponent>): MockedComponentFixture<MComponent, MComponent>;

/**
 * An empty string does not have point.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
function MockRender(template: ''): ComponentFixture<void> & { point: undefined };

/**
 * Without params we should not autocomplete any keys of any types.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
function MockRender<MComponent = void>(template: string): MockedComponentFixture<MComponent>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
function MockRender<MComponent = void>(
  template: string,
  params: undefined | null,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, void>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
function MockRender<MComponent = void, TComponent extends Record<keyof any, any> = Record<keyof any, any>>(
  template: string,
  params: TComponent,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, TComponent>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
function MockRender<MComponent, TComponent extends Record<keyof any, any> = Record<keyof any, any>>(
  template: string,
  params: TComponent,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, TComponent>;

function MockRender<MComponent, TComponent extends Record<keyof any, any>>(
  template: string | AnyType<MComponent> | InjectionToken<MComponent>,
  params?: TComponent,
  flags: boolean | IMockRenderOptions = true,
): any {
  const bindings = params && typeof params === 'object' ? Object.keys(params) : params;
  const options = typeof flags === 'boolean' ? { detectChanges: flags } : { ...flags };
  const factory = (MockRenderFactory as any)(template, bindings, options);

  return factory(params, options.detectChanges);
}

export { MockRender };
