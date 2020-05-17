import { Pipe, PipeTransform, Type } from '@angular/core';
import { getTestBed } from '@angular/core/testing';

import { getMockedNgDefOf, Mock, MockOf } from '../common';
import { ngMocksUniverse } from '../common/ng-mocks-universe';
import { pipeResolver } from '../common/reflect';

export type MockedPipe<T> = T & Mock & {};

export function MockPipes(...pipes: Array<Type<PipeTransform>>): Array<Type<PipeTransform>> {
  return pipes.map(pipe => MockPipe(pipe, undefined));
}

const defaultTransform = (...args: any[]): void => undefined;
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
  if (ngMocksUniverse.flags.has('cachePipe') && ngMocksUniverse.cache.has(pipe)) {
    return ngMocksUniverse.cache.get(pipe);
  }

  const { name } = pipeResolver.resolve(pipe);

  const options: Pipe = {
    name,
  };

  @MockOf(pipe)
  class PipeMock extends Mock implements PipeTransform {
    transform = transform || defaultTransform;
  }

  const mockedPipe: Type<MockedPipe<TPipe>> = Pipe(options)(PipeMock as any);
  if (ngMocksUniverse.flags.has('cachePipe')) {
    ngMocksUniverse.cache.set(pipe, mockedPipe);
  }

  return mockedPipe;
}
