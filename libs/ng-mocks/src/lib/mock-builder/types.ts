import { InjectionToken, PipeTransform, Provider } from '@angular/core';
import { TestBedStatic, TestModuleMetadata } from '@angular/core/testing';

import { AnyType } from '../common/core.types';

/**
 * The interface describes the type of the next value in MockBuilder().then().
 */
export interface IMockBuilderResult {
  testBed: TestBedStatic;
}

/**
 * The interface with flags which are suitable for each declaration in MockBuilder chain functions.
 *
 * @see https://ng-mocks.sudo.eu/api/MockBuilder#config
 */
export interface IMockBuilderConfigAll {
  /**
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#dependency-flag
   */
  dependency?: boolean;

  /**
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#export-flag
   */
  export?: boolean;

  /**
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#shallow-flag
   */
  shallow?: boolean;

  /**
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#onroot-flag
   */
  onRoot?: boolean;
}

/**
 * The interface with flags which are suitable for modules in MockBuilder chain functions.
 *
 * @see https://ng-mocks.sudo.eu/api/MockBuilder#config
 */
export interface IMockBuilderConfigModule {
  /**
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#exportall-flag
   */
  exportAll?: boolean;
}

/**
 * The interface with flags which are suitable for components in MockBuilder chain functions.
 *
 * @see https://ng-mocks.sudo.eu/api/MockBuilder#config
 */
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

/**
 * The interface with flags which are suitable for directives in MockBuilder chain functions.
 *
 * @see https://ng-mocks.sudo.eu/api/MockBuilder#config
 */
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

/**
 * The interface with flags which are suitable for providers in MockBuilder chain functions.
 *
 * @see https://ng-mocks.sudo.eu/api/MockBuilder#config
 */
export interface IMockBuilderConfigMock {
  /**
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#precise-flag
   */
  precise?: boolean;
}

/**
 * IMockBuilderConfig is a union of all flags for all MockBuilder chain functions.
 *
 * @see https://ng-mocks.sudo.eu/api/MockBuilder#config
 */
export type IMockBuilderConfig =
  | IMockBuilderConfigAll
  | IMockBuilderConfigModule
  | IMockBuilderConfigComponent
  | IMockBuilderConfigDirective;

/**
 * IMockBuilder describes chain functions of MockBuilder.
 *
 * @see https://ng-mocks.sudo.eu/api/MockBuilder
 */
export interface IMockBuilder extends Promise<IMockBuilderResult> {
  /**
   * beforeCompileComponents lets extend TestBed.
   * For example, to add NO_ERRORS_SCHEMA, please don't do so.
   *
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#adding-schemas
   */
  beforeCompileComponents(callback: (testBed: TestBedStatic) => void): this;

  /**
   * .build() returns a declaration which can be used in TestBed.configureTestingModule.
   * It is usually helpful with 3rd-party libraries when something should be excluded.
   *
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#factory-function
   * @see https://ng-mocks.sudo.eu/extra/with-3rd-party
   */
  build(): TestModuleMetadata;

  /**
   * .exclude() excludes declarations.
   *
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#exclude
   */
  exclude(def: any): this;

  /**
   * .keep() keeps declarations as they are, and doesn't mock them.
   *
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#keep
   */
  keep(def: any, config?: IMockBuilderConfigAll & IMockBuilderConfigModule): this;

  /**
   * .mock() with a transform function is useful to mock pipes.
   *
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#mock
   */
  mock<T extends PipeTransform>(pipe: AnyType<T>, mock: T['transform'], config?: IMockBuilderConfig): this;

  /**
   * .mock() for strings is useful to mock string providers.
   * However, please considering using tokens instead of string providers.
   *
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#mock
   */
  mock<T = any>(provider: string, mock: T, config?: IMockBuilderConfig): this;

  /**
   * .mock() for tokens is useful to provide a mock copy of the token.
   *
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#mock
   */
  mock<T>(token: InjectionToken<T>, mock: InjectionToken<T> | T | undefined, config?: IMockBuilderConfig): this;

  /**
   * .mock() for declarations is useful to provide a partial mock implementation.
   *
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#mock
   */
  mock<T>(
    provider: AnyType<T>,
    mock: AnyType<T> | Partial<T>,
    config?: IMockBuilderConfig & IMockBuilderConfigMock,
  ): this;

  /**
   * .mock() for declarations which mocks all methods and properties.
   *
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#mock
   */
  mock<T>(def: AnyType<T>, config: IMockBuilderConfig): this;

  /**
   * .mock() for declarations which mocks all methods and properties.
   *
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#mock
   */
  mock(def: any): this;

  /**
   * .provide() lets add additional providers to TestBed.
   * If you need to mock an existing provider, please use .mock().
   *
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#provide
   */
  provide(def: Provider): this;

  /**
   * .replace() lets substitute declarations.
   * For example, BrowserAnimationsModule with NoopAnimationsModule.
   *
   * @see https://ng-mocks.sudo.eu/api/MockBuilder#replace
   */
  replace(
    source: AnyType<any>,
    destination: AnyType<any>,
    config?: IMockBuilderConfigAll & IMockBuilderConfigModule,
  ): this;
}

/**
 * IMockBuilderExtended
 *
 * @see https://ng-mocks.sudo.eu/api/MockBuilder#extending-mockbuilder
 */
export interface IMockBuilderExtended extends IMockBuilder {}
