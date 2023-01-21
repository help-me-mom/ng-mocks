import { Pipe, PipeTransform } from '@angular/core';

import { extendClass } from '../common/core.helpers';
import coreReflectPipeResolve from '../common/core.reflect.pipe-resolve';
import { Type } from '../common/core.types';
import decorateMock from '../common/decorate.mock';
import funcGetName from '../common/func.get-name';
import funcImportExists from '../common/func.import-exists';
import { isMockNgDef } from '../common/func.is-mock-ng-def';
import { Mock } from '../common/mock';
import ngMocksUniverse from '../common/ng-mocks-universe';
import returnCachedMock from '../mock/return-cached-mock';
import helperMockService from '../mock-service/helper.mock-service';

import { MockedPipe } from './types';

/**
 * MockPipes creates an array of mock pipe classes out of pipes passed as parameters.
 *
 * @see https://ng-mocks.sudo.eu/api/MockPipe
 *
 * ```ts
 * TestBed.configureTestingModule({
 *   declarations: MockPipes(
 *     Dep1Pipe,
 *     Dep2Pipe,
 *   ),
 * });
 * ```
 */
export function MockPipes(...pipes: Array<Type<PipeTransform>>): Array<Type<PipeTransform>> {
  return pipes.map(pipe => MockPipe(pipe, undefined));
}

const getMockClass = (pipe: Type<any>, transform?: PipeTransform['transform']): Type<any> => {
  const mock = extendClass(Mock);
  Pipe(coreReflectPipeResolve(pipe))(mock);
  decorateMock(mock, pipe, {
    init: (instance: PipeTransform) => {
      if (transform) {
        instance.transform = transform;
      }
      if (!instance.transform) {
        helperMockService.mock(instance, 'transform', `${funcGetName(instance)}.transform`);
      }
    },
    transform,
  });

  return mock;
};

/**
 * MockPipe creates a mock pipe class out of an arbitrary pipe.
 *
 * @see https://ng-mocks.sudo.eu/api/MockPipe
 *
 * ```ts
 * TestBed.configureTestingModule({
 *   declarations: [
 *     MockPipe(Dep1Pipe),
 *     MockPipe(Dep2Pipe),
 *   ],
 * });
 * ```
 */
export function MockPipe<TPipe extends PipeTransform>(
  pipe: Type<TPipe>,
  transform?: TPipe['transform'],
): Type<MockedPipe<TPipe>>;

export function MockPipe<TPipe extends PipeTransform>(
  pipe: Type<TPipe>,
  transform?: TPipe['transform'],
): Type<MockedPipe<TPipe>> {
  funcImportExists(pipe, 'MockPipe');

  if (isMockNgDef(pipe, 'p')) {
    return pipe;
  }

  // istanbul ignore next
  if (ngMocksUniverse.flags.has('cachePipe') && ngMocksUniverse.cacheDeclarations.has(pipe)) {
    return returnCachedMock(pipe);
  }

  const mock = getMockClass(pipe, transform);
  if (ngMocksUniverse.flags.has('cachePipe')) {
    ngMocksUniverse.cacheDeclarations.set(pipe, mock);
  }

  return mock as any;
}
