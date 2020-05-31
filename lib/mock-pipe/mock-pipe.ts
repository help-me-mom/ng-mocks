import { core } from '@angular/compiler';
import { Pipe, PipeTransform, Type } from '@angular/core';

import { Mock, MockOf } from '../common';
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
  let meta: core.Pipe | undefined;
  if (!meta) {
    try {
      meta = pipeResolver.resolve(pipe);
    } catch (e) {
      throw new Error('ng-mocks is not in JIT mode and cannot resolve declarations');
    }
  }

  const { name } = meta;

  const options: Pipe = {
    name,
  };

  @MockOf(pipe)
  class PipeMock extends Mock implements PipeTransform {
    transform = transform || defaultTransform;
  }

  const mockedPipe: Type<MockedPipe<TPipe>> = Pipe(options)(PipeMock as any);

  return mockedPipe;
}
