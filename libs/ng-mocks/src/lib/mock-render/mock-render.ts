import { InjectionToken } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { Type } from '../common/core.types';

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
  template: Type<MComponent>,
  params: undefined | null,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, MComponent>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
function MockRender<MComponent, TComponent extends object>(
  template: Type<MComponent>,
  params: TComponent,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, TComponent>;

/**
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
function MockRender<MComponent, TComponent extends object = Record<keyof any, any>>(
  template: Type<MComponent>,
  params: TComponent,
  detectChangesOrOptions?: boolean | IMockRenderOptions,
): MockedComponentFixture<MComponent, TComponent>;

/**
 * Without params we should not autocomplete any keys of any types.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
function MockRender<MComponent>(template: Type<MComponent>): MockedComponentFixture<MComponent, MComponent>;

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
  template: string | Type<MComponent> | InjectionToken<MComponent>,
  params?: TComponent,
  flags: boolean | IMockRenderOptions = true,
): any {
  const factory = (MockRenderFactory as any)(template, params, flags);

  return factory();
}

export { MockRender };
