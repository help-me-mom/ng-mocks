// istanbul ignore file

import { DebugElement, DebugNode, Provider } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

export interface MockedDebugNode<T = any> extends DebugNode {
  componentInstance: T;
}

export interface MockedDebugElement<T = any> extends DebugElement, MockedDebugNode<T> {
  componentInstance: T;
}

export interface IMockRenderOptions {
  detectChanges?: boolean;
  providers?: Provider[];
  reset?: boolean;
}

export interface IMockRenderFactoryOptions extends IMockRenderOptions {
  configureTestBed?: boolean;
}

export interface MockedComponentFixture<C = any, F = DefaultRenderComponent<C>> extends ComponentFixture<F> {
  point: MockedDebugElement<C>;
}

export type DefaultRenderComponent<MComponent extends Record<keyof any, any>> = {
  [K in keyof MComponent]: MComponent[K];
};
