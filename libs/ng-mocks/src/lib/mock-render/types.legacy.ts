// istanbul ignore file

import { ComponentFixture } from '@angular/core/testing';

import type { MockedDebugElement } from './types.common';

export type {
  IMockRenderFactoryOptions,
  IMockRenderOptions,
  MockedDebugElement,
  MockedDebugNode,
} from './types.common';

/**
 * MockedComponentFixture replaces ComponentFixture if MockRender is used.
 * MockRender provides `fixture.point` to access the rendered component.
 * MockedComponentFixture helps to define its type correctly.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
export interface MockedComponentFixture<C = any, F = DefaultRenderComponent<C>> extends ComponentFixture<F> {
  componentInstance: ComponentFixture<F>['componentInstance'];
  debugElement: ComponentFixture<F>['debugElement'] & MockedDebugElement<F>;
  nativeElement: ComponentFixture<F>['nativeElement'];
  point: MockedDebugElement<C>;
}

/**
 * DefaultRenderComponent described a middleware component `fixture.componentInstance`,
 * which is used to manipulate `fixture.point.componentInstance`.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
export type DefaultRenderComponent<MComponent> = {
  [K in keyof MComponent]: MComponent[K];
};
