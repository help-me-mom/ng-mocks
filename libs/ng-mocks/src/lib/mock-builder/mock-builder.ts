import { InjectionToken } from '@angular/core';

import { flatten } from '../common/core.helpers';
import { AnyType } from '../common/core.types';
import { NgModuleWithProviders } from '../common/func.is-ng-module-def-with-providers';

import { MockBuilderPerformance } from './mock-builder.performance';
import { IMockBuilder } from './types';

export type MockBuilderParam = string | AnyType<any> | InjectionToken<any> | NgModuleWithProviders;

/**
 * MockBuilder provides reach and simple interfaces of chain functions
 * to build desired mock environment for tests.
 *
 * @see https://ng-mocks.sudo.eu/api/MockBuilder
 */
export function MockBuilder(
  keepDeclaration?: MockBuilderParam | MockBuilderParam[] | null | undefined,
  itsModuleToMock?: MockBuilderParam | MockBuilderParam[] | null | undefined,
): IMockBuilder {
  const instance = new MockBuilderPerformance();

  if (keepDeclaration) {
    for (const declaration of flatten(keepDeclaration)) {
      instance.keep(declaration, {
        export: true,
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
