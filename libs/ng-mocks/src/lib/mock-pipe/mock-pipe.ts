import { Pipe, PipeTransform } from '@angular/core';

import { extendClass } from '../common/core.helpers';
import coreReflectPipeResolve from '../common/core.reflect.pipe-resolve';
import { Type } from '../common/core.types';
import decorateMock from '../common/decorate.mock';
import funcImportExists from '../common/func.import-exists';
import { isMockNgDef } from '../common/func.is-mock-ng-def';
import { Mock } from '../common/mock';
import ngMocksUniverse from '../common/ng-mocks-universe';
import helperMockService from '../mock-service/helper.mock-service';

import { MockedPipe } from './types';

/**
 * @see https://ng-mocks.sudo.eu/api/MockPipe
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
        helperMockService.mock(instance, 'transform', `${instance.constructor.name}.transform`);
      }
    },
  });

  return mock;
};

/**
 * @see https://ng-mocks.sudo.eu/api/MockPipe
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
    return ngMocksUniverse.cacheDeclarations.get(pipe);
  }

  const mock = getMockClass(pipe, transform);
  if (ngMocksUniverse.flags.has('cachePipe')) {
    ngMocksUniverse.cacheDeclarations.set(pipe, mock);
  }

  return mock as any;
}
