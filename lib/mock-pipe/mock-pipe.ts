import { core } from '@angular/compiler';
import { Pipe, PipeTransform } from '@angular/core';
import { getTestBed } from '@angular/core/testing';

import { AnyType, getMockedNgDefOf, Mock, MockOf, Type } from '../common';
import { ngMocksUniverse } from '../common/ng-mocks-universe';
import { pipeResolver } from '../common/reflect';

export type MockedPipe<T> = T & Mock & {};

export function MockPipes(...pipes: Array<Type<PipeTransform>>): Array<Type<PipeTransform>> {
  return pipes.map(pipe => MockPipe(pipe, undefined));
}

const defaultTransform = (...args: any[]): void => undefined;

/**
 * @see https://github.com/ike18t/ng-mocks#how-to-mock-a-pipe
 */
export function MockPipe<TPipe extends PipeTransform>(
  pipe: AnyType<TPipe>,
  transform?: TPipe['transform']
): Type<MockedPipe<TPipe>>;
export function MockPipe<TPipe extends PipeTransform>(
  pipe: Type<TPipe>,
  transform: TPipe['transform'] = defaultTransform
): Type<MockedPipe<TPipe>> {
  // We are inside of an 'it'.
  // It's fine to to return a mock or to throw an exception if it wasn't mocked in TestBed.
  if ((getTestBed() as any)._instantiated) {
    try {
      return getMockedNgDefOf(pipe, 'p');
    } catch (error) {
      // looks like an in-test mock.
    }
  }
  /* istanbul ignore next */
  if (ngMocksUniverse.flags.has('cachePipe') && ngMocksUniverse.cacheMocks.has(pipe)) {
    return ngMocksUniverse.cacheMocks.get(pipe);
  }

  let meta: core.Pipe;
  try {
    meta = pipeResolver.resolve(pipe);
  } catch (e) {
    /* istanbul ignore next */
    throw new Error('ng-mocks is not in JIT mode and cannot resolve declarations');
  }

  const { name } = meta;

  const options: Pipe = {
    name,
  };

  @Pipe(options)
  @MockOf(pipe)
  class PipeMock extends Mock implements PipeTransform {
    transform = transform;
  }

  if (ngMocksUniverse.flags.has('cachePipe')) {
    ngMocksUniverse.cacheMocks.set(pipe, PipeMock);
  }

  return PipeMock as any;
}
