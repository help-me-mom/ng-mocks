import { InjectionToken, NgModule, PipeTransform, Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AnyType } from '../common/core.types';

export interface IMockBuilderResult {
  testBed: typeof TestBed;
}
export interface IMockBuilderConfigAll {
  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuilder-dependency-flag
   */
  dependency?: boolean; //

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuilder-export-flag
   */
  export?: boolean;
}

export interface IMockBuilderConfigModule {
  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuilder-exportall-flag
   */
  exportAll?: boolean;
}

export interface IMockBuilderConfigComponent {
  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuilder-render-flag
   */
  render?: {
    [blockName: string]:
      | boolean
      | {
          $implicit?: any;
          variables?: Record<keyof any, any>;
        };
  };
}

export interface IMockBuilderConfigDirective {
  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuilder-render-flag
   */
  render?:
    | boolean
    | {
        $implicit?: any;
        variables?: Record<keyof any, any>;
      };
}

export interface IMockBuilderConfigMock {
  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuilder-precise-flag
   */
  precise?: boolean;
}

export type IMockBuilderConfig =
  | IMockBuilderConfigAll
  | IMockBuilderConfigModule
  | IMockBuilderConfigComponent
  | IMockBuilderConfigDirective;

export interface IMockBuilder extends Promise<IMockBuilderResult> {
  beforeCompileComponents(callback: (testBed: typeof TestBed) => void): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuilder-factory
   */
  build(): NgModule;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuilderexclude
   */
  exclude(def: any): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuilderkeep
   */
  keep(def: any, config?: IMockBuilderConfigAll & IMockBuilderConfigModule): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuildermock
   */
  mock<T extends PipeTransform>(pipe: AnyType<T>, mock: T['transform'], config?: IMockBuilderConfig): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuildermock
   */
  mock<T = any>(provider: string, mock: T, config?: IMockBuilderConfig): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuildermock
   */
  mock<T>(token: InjectionToken<T>, mock: InjectionToken<T> | T | undefined, config?: IMockBuilderConfig): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuildermock
   */
  mock<T>(
    provider: AnyType<T>,
    mock: AnyType<T> | Partial<T>,
    config?: IMockBuilderConfig & IMockBuilderConfigMock,
  ): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuildermock
   */
  mock<T>(def: AnyType<T>, config: IMockBuilderConfig): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuildermock
   */
  mock(def: any): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuilderprovide
   */
  provide(def: Provider): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuilderreplace
   */
  replace(
    source: AnyType<any>,
    destination: AnyType<any>,
    config?: IMockBuilderConfigAll & IMockBuilderConfigModule,
  ): this;
}
