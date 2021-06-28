import { InjectionToken } from '@angular/core';

import { flatten } from '../common/core.helpers';
import { AnyType } from '../common/core.types';

import { MockBuilderPerformance } from './mock-builder.performance';
import { IMockBuilder } from './types';

/**
 * @see https://ng-mocks.sudo.eu/api/MockBuilder
 */
export function MockBuilder(
  keepDeclaration?:
    | string
    | AnyType<any>
    | InjectionToken<any>
    | Array<string | AnyType<any> | InjectionToken<any>>
    | null
    | undefined,
  itsModuleToMock?: AnyType<any> | Array<AnyType<any>> | null | undefined,
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
