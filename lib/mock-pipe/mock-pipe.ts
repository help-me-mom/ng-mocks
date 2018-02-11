import { Pipe, PipeTransform, Type } from '@angular/core';

export function MockPipe<TPipe extends PipeTransform>(pipe: Type<TPipe>, transform?: TPipe['transform']): Type<TPipe> {
  const pipeName = (pipe as any).__annotations__[0].name;
  const defaultTransform = (...args: any[]): void => undefined;

  class PipeMock implements PipeTransform {
    transform = transform || defaultTransform;
  }

  /* tslint:disable:no-angle-bracket-type-assertion */
  return Pipe({ name: pipeName })(<any> PipeMock as Type<TPipe>);
  /* tslint:enable:no-angle-bracket-type-assertion */
}
