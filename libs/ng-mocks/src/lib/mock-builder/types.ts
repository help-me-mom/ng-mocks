import { InjectionToken, PipeTransform, Provider } from '@angular/core';
import { TestBed, TestModuleMetadata } from '@angular/core/testing';

import { AnyType } from '../common/core.types';

export interface IMockBuilderResult {
  testBed: typeof TestBed;
}
export interface IMockBuilderConfigAll {
  /**
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#dependency-flag
   */
  dependency?: boolean; //

  /**
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#export-flag
   */
  export?: boolean;
}

export interface IMockBuilderConfigModule {
  /**
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#exportall-flag
   */
  exportAll?: boolean;
}

export interface IMockBuilderConfigComponent {
  /**
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#render-flag
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
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#render-flag
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
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#precise-flag
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
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#factory-function
   */
  build(): TestModuleMetadata;

  /**
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#exclude
   */
  exclude(def: any): this;

  /**
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#keep
   */
  keep(def: any, config?: IMockBuilderConfigAll & IMockBuilderConfigModule): this;

  /**
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#mock
   */
  mock<T extends PipeTransform>(pipe: AnyType<T>, mock: T['transform'], config?: IMockBuilderConfig): this;

  /**
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#mock
   */
  mock<T = any>(provider: string, mock: T, config?: IMockBuilderConfig): this;

  /**
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#mock
   */
  mock<T>(token: InjectionToken<T>, mock: InjectionToken<T> | T | undefined, config?: IMockBuilderConfig): this;

  /**
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#mock
   */
  mock<T>(
    provider: AnyType<T>,
    mock: AnyType<T> | Partial<T>,
    config?: IMockBuilderConfig & IMockBuilderConfigMock,
  ): this;

  /**
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#mock
   */
  mock<T>(def: AnyType<T>, config: IMockBuilderConfig): this;

  /**
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#mock
   */
  mock(def: any): this;

  /**
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#provide
   */
  provide(def: Provider): this;

  /**
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#replace
   */
  replace(
    source: AnyType<any>,
    destination: AnyType<any>,
    config?: IMockBuilderConfigAll & IMockBuilderConfigModule,
  ): this;
}
