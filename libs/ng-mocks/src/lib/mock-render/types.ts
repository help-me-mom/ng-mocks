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
// Detect signal inputs structurally, so older Angular packages do not need
// to export signal input types for ng-mocks declarations to compile.
type MockRenderInputSignalNode<T> = T extends (...args: any[]) => any
  ? Extract<T[keyof T], { transformFn: ((value: any) => any) | undefined }>
  : never;

type MockRenderInputBinding<T> = 0 extends 1 & T
  ? T
  : [MockRenderInputSignalNode<T>] extends [never]
    ? T
    : MockRenderInputSignalNode<T> extends {
          transformFn: ((value: infer WriteT) => any) | undefined;
        }
      ? WriteT
      : T;

type MockRenderInputSignalKeys<MComponent> = {
  [K in keyof MComponent]-?: 0 extends 1 & MComponent[K]
    ? never
    : [MockRenderInputSignalNode<MComponent[K]>] extends [never]
      ? never
      : K;
}[keyof MComponent];

type MockRenderInputSignals<MComponent> = Pick<MComponent, MockRenderInputSignalKeys<MComponent>>;

type MockRenderInputBindings<MComponent> = {
  -readonly [K in keyof MockRenderInputSignals<MComponent>]: MockRenderInputBinding<
    MockRenderInputSignals<MComponent>[K]
  >;
};

type MockRenderComponentBindings<MComponent> = Pick<
  MComponent,
  Exclude<keyof MComponent, MockRenderInputSignalKeys<MComponent>>
> &
  MockRenderInputBindings<MComponent>;

export type DefaultRenderComponent<MComponent> = 0 extends 1 & MComponent
  ? MComponent
  : MComponent extends object
    ? MockRenderComponentBindings<MComponent>
    : MComponent;
