import { Pipe, PipeTransform, Type } from '@angular/core';

export function MockPipes<TPipe extends PipeTransform>(...pipes: Array<Type<TPipe>>): Array<Type<TPipe>> {
  return pipes.map((pipe) => MockPipe(pipe, undefined));
}

export function MockPipe<TPipe extends PipeTransform>(pipe: Type<TPipe>, transform?: TPipe['transform']): Type<TPipe> {
  const pipeName = (pipe as any).__annotations__[0].name;
  const defaultTransform = (...args: any[]): void => undefined;

  class PipeMock implements PipeTransform {
    transform = transform || defaultTransform;
  }

  return Pipe({ name: pipeName })(PipeMock as Type<TPipe>);
}
