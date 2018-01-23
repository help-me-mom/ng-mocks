import { Pipe, PipeTransform, Type } from '@angular/core';

export function MockPipe<TPipe>(pipe: Type<TPipe>): Type<TPipe> {
  const pipeName = (pipe as any).__annotations__[0].name;

  class PipeMock implements PipeTransform {
    transform = (...args: any[]): any[] => args;
  }

  /* tslint:disable:no-angle-bracket-type-assertion */
  return Pipe({ name: pipeName })(<any> PipeMock as Type<TPipe>);
  /* tslint:enable:no-angle-bracket-type-assertion */
}
