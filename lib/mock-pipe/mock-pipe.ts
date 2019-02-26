import { Pipe, PipeTransform, Type } from '@angular/core';

import { MockOf } from '../common';
import { pipeResolver } from '../common/reflect';

const cache = new Map<Type<PipeTransform>, Type<PipeTransform>>();

export function MockPipes(...pipes: Array<Type<PipeTransform>>): Array<Type<PipeTransform>> {
  return pipes.map((pipe) => MockPipe(pipe, undefined));
}

export function MockPipe<TPipe extends PipeTransform>(pipe: Type<TPipe>, transform?: TPipe['transform']): Type<TPipe> {
  const cacheHit = cache.get(pipe);
  if (cacheHit) {
    return cacheHit as Type<TPipe>;
  }

  const pipeName = pipeResolver.resolve(pipe).name;
  const defaultTransform = (...args: any[]): void => undefined;

  @MockOf(pipe)
  class PipeMock implements PipeTransform {
    transform = transform || defaultTransform;
  }

  const mockedPipe = Pipe({ name: pipeName })(PipeMock as Type<TPipe>);
  cache.set(pipe, mockedPipe);
  return mockedPipe;
}
