// tslint:disable:interface-name

import { InjectionToken, NgModule, PipeTransform, Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AnyType, Type } from '../common/core.types';
import { NgModuleWithProviders } from '../common/func.is-ng-module-def-with-providers';

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

export type IMockBuilderConfig =
  | IMockBuilderConfigAll
  | IMockBuilderConfigModule
  | IMockBuilderConfigComponent
  | IMockBuilderConfigDirective;

export interface IMockBuilder {
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
  keep<T>(def: NgModuleWithProviders<T>, config?: IMockBuilderConfig): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuilderkeep
   */
  keep<T>(token: InjectionToken<T>, config?: IMockBuilderConfig): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuilderkeep
   */
  keep<T>(def: AnyType<T>, config?: IMockBuilderConfig): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuilderkeep
   */
  keep(def: any, config?: IMockBuilderConfig): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuildermock
   */
  mock<T extends PipeTransform>(pipe: AnyType<T>, config?: IMockBuilderConfig): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuildermock
   */
  mock<T extends PipeTransform>(pipe: AnyType<T>, mock?: PipeTransform['transform'], config?: IMockBuilderConfig): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuildermock
   */
  mock<T>(token: InjectionToken<T>, mock: any, config: IMockBuilderConfig): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuildermock
   */
  mock<T>(provider: AnyType<T>, mock: AnyType<T> | Partial<T>, config: IMockBuilderConfig): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuildermock
   */
  mock<T>(token: InjectionToken<T>, mock?: any): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuildermock
   */
  mock<T>(def: NgModuleWithProviders<T>): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuildermock
   */
  mock<T>(def: AnyType<T>, config: IMockBuilderConfig): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuildermock
   */
  mock<T>(provider: AnyType<T>, mock?: Partial<T>): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuildermock
   */
  mock<T>(def: AnyType<T>): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuildermock
   */
  mock(input: any, a1: any, a2?: any): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuilderprovide
   */
  provide(def: Provider): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuilderreplace
   */
  replace(source: Type<any>, destination: Type<any>, config?: IMockBuilderConfig): this;

  /**
   * @see https://github.com/ike18t/ng-mocks#mockbuilder-factory
   */
  then<TResult1 = IMockBuilderResult, TResult2 = never>(
    fulfill?: (value: IMockBuilderResult) => PromiseLike<TResult1>,
    reject?: (reason: any) => PromiseLike<TResult2>
  ): PromiseLike<TResult1 | TResult2>;
}
