import { core } from '@angular/compiler';
import { Pipe, PipeTransform } from '@angular/core';
import { getTestBed } from '@angular/core/testing';

import { pipeResolver } from '../common/core.reflect';
import { Type } from '../common/core.types';
import { getMockedNgDefOf } from '../common/func.get-mocked-ng-def-of';
import { Mock } from '../common/mock';
import { MockOf } from '../common/mock-of';
import ngMocksUniverse from '../common/ng-mocks-universe';

import { MockedPipe } from './types';

/**
 * @see https://github.com/ike18t/ng-mocks#how-to-mock-a-pipe
 */
export function MockPipes(...pipes: Array<Type<PipeTransform>>): Array<Type<PipeTransform>> {
  return pipes.map(pipe => MockPipe(pipe, undefined));
}

const defaultTransform = (): void => undefined;

/**
 * @see https://github.com/ike18t/ng-mocks#how-to-mock-a-pipe
 */
export function MockPipe<TPipe extends PipeTransform>(
  pipe: Type<TPipe>,
  transform?: TPipe['transform'],
): Type<MockedPipe<TPipe>>;

export function MockPipe<TPipe extends PipeTransform>(
  pipe: Type<TPipe>,
  transform: TPipe['transform'] = defaultTransform,
): Type<MockedPipe<TPipe>> {
  // We are inside of an 'it'.
  // It's fine to to return a mock copy or to throw an exception if it wasn't replaced with its mock copy in TestBed.
  if ((getTestBed() as any)._instantiated) {
    try {
      return getMockedNgDefOf(pipe, 'p');
    } catch (error) {
      // looks like an in-test mock.
    }
  }
  /* istanbul ignore next */
  if (ngMocksUniverse.flags.has('cachePipe') && ngMocksUniverse.cacheDeclarations.has(pipe)) {
    return ngMocksUniverse.cacheDeclarations.get(pipe);
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
    // tslint:disable-next-line:prefer-function-over-method
    public transform(value: any, ...args: any[]): any {
      return transform(value, ...args);
    }
  }

  if (ngMocksUniverse.flags.has('cachePipe')) {
    ngMocksUniverse.cacheDeclarations.set(pipe, PipeMock);
  }

  return PipeMock as any;
}
