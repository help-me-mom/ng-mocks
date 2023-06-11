import coreDefineProperty from '../common/core.define-property';
import { flatten, mapKeys } from '../common/core.helpers';
import { AnyDeclaration } from '../common/core.types';
import { NgModuleWithProviders } from '../common/func.is-ng-module-def-with-providers';
import { isStandalone } from '../common/func.is-standalone';
import ngMocksUniverse from '../common/ng-mocks-universe';
import helperExtractPropertyDescriptor from '../mock-service/helper.extract-property-descriptor';

import { MockBuilderPerformance } from './mock-builder.performance';
import { IMockBuilder, IMockBuilderExtended } from './types';

export type MockBuilderParam = string | AnyDeclaration<any> | NgModuleWithProviders;

/**
 * MockBuilder provides reach and simple interfaces of chain functions
 * to build desired mock environment for tests.
 *
 * @see https://ng-mocks.sudo.eu/api/MockBuilder
 */
export function MockBuilder(
  keepDeclaration?: MockBuilderParam | MockBuilderParam[] | null | undefined,
  itsModuleToMock?: MockBuilderParam | MockBuilderParam[] | null | undefined,
): IMockBuilderExtended;

export function MockBuilder(...args: Array<MockBuilderParam | MockBuilderParam[] | null | undefined>): IMockBuilder {
  const [keepDeclaration, itsModuleToMock] = args;

  const instance = new MockBuilderPerformance(args.length < 2 ? { export: true } : { dependency: true });
  const extensions: Map<any, any> = ngMocksUniverse.config.get('MockBuilderExtensions');
  for (const func of extensions ? mapKeys(extensions) : []) {
    if (helperExtractPropertyDescriptor(instance, func)) {
      throw new Error(`MockBuilder.${func} is a base method and cannot be customized, please use a different name.`);
    }
    coreDefineProperty(instance, func, (...args: Array<any>) => {
      extensions.get(func)(instance, args);
      return instance;
    });
  }

  if (keepDeclaration) {
    for (const declaration of flatten(keepDeclaration)) {
      instance.keep(declaration, {
        export: true,
        shallow: isStandalone(declaration),
      });
    }
  }
  if (itsModuleToMock) {
    for (const declaration of flatten(itsModuleToMock)) {
      instance.mock(declaration, declaration, {
        export: true,
        exportAll: true,
      });
    }
  }

  return instance;
}

function mockBuilderExtend<K extends keyof IMockBuilderExtended & string>(
  func: K,
  callback?: (builder: IMockBuilderExtended, parameters: never) => void,
): void {
  const extensions: Map<string, typeof callback> = ngMocksUniverse.config.get('MockBuilderExtensions') ?? new Map();
  if (callback) {
    extensions.set(func, callback);
    ngMocksUniverse.config.set('MockBuilderExtensions', extensions);
  } else {
    extensions.delete(func);
  }
}

// istanbul ignore next: issue in istanbul https://github.com/istanbuljs/nyc/issues/1209
export namespace MockBuilder {
  /**
   * Adds a custom function to MockBuilder
   */
  export function extend<K extends keyof IMockBuilderExtended & string>(
    func: K,
    callback: (builder: IMockBuilderExtended, parameters: never) => void,
  ): void;

  /**
   * Removes a custom function from MockBuilder
   */
  export function extend<K extends keyof IMockBuilderExtended & string>(func: K): void;

  export function extend<K extends keyof IMockBuilderExtended & string>(
    func: K,
    callback?: (builder: IMockBuilderExtended, parameters: never) => void,
  ): void {
    mockBuilderExtend(func, callback);
  }
}
