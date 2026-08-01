// istanbul ignore file

import { DebugElement, DebugNode, NgModule } from '@angular/core';

/**
 * MockedDebugNode is a way to simplify the type of DebugNode.
 * Usually, it should not be used externally.
 */
export interface MockedDebugNode<T = any> extends DebugNode {
  componentInstance: T;
}

/**
 * MockedDebugElement is a way to simplify the type of DebugElement.
 * Usually, it should not be used externally.
 */
export interface MockedDebugElement<T = any> extends DebugElement, MockedDebugNode<T> {
  componentInstance: T;
}

/**
 * IMockRenderOptions describes parameters for MockRender.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender
 */
export interface IMockRenderOptions {
  /**
   * Pass false to suppress the change detection.
   */
  detectChanges?: boolean;

  /**
   * Extra providers for the testing environment.
   */
  providers?: NgModule['providers'];

  /**
   * Pass true to reset TestBed before render.
   * Usually, it's done automatically.
   */
  reset?: boolean;

  /**
   * Extra providers for the testing environment.
   */
  viewProviders?: NgModule['providers'];
}

/**
 * IMockRenderFactoryOptions describes parameters for MockRenderFactory.
 * By default, it doesn't configure TestBed, but if you need it, you can pass
 * configureTestBed as true.
 *
 * @see https://ng-mocks.sudo.eu/api/MockRender#factory
 */
export interface IMockRenderFactoryOptions extends IMockRenderOptions {
  configureTestBed?: boolean;
}
