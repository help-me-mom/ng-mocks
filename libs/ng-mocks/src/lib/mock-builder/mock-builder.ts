import { flatten } from '../common/core.helpers';
import { AnyDeclaration } from '../common/core.types';
import { NgModuleWithProviders } from '../common/func.is-ng-module-def-with-providers';
import { isStandalone } from '../common/func.is-standalone';

import { MockBuilderPerformance } from './mock-builder.performance';
import { IMockBuilder } from './types';

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
): IMockBuilder;

export function MockBuilder(...args: Array<MockBuilderParam | MockBuilderParam[] | null | undefined>): IMockBuilder {
  const [keepDeclaration, itsModuleToMock] = args;

  const instance = new MockBuilderPerformance(args.length < 2 ? { export: true } : { dependency: true });

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
