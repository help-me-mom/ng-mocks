import { PipeTransform } from '@angular/core';

import { MockPipe, MockPipes } from 'ng-mocks';

class MyPipe implements PipeTransform {
  public readonly name = 'MyPipe';

  public transform(value: string, arg1: boolean): boolean {
    return this.name.length > 0 && value.length > 0 && arg1;
  }
}

abstract class AbstractPipe implements PipeTransform {
  public abstract transform(value: any, ...args: any[]): any;
}

MockPipe(MyPipe);
MockPipe(MyPipe, () => true);
MockPipe(MyPipe, (a1: string) => !a1);
MockPipe(MyPipe, (a1: string, a2) => !a1 || !a2);
MockPipes(MyPipe);

// @ts-expect-error: does not accept an abstract pipe.
MockPipe(AbstractPipe);

// @ts-expect-error: does not accept an abstract pipe.
MockPipes(AbstractPipe);

// @ts-expect-error: does not support wrong return types.
MockPipe(MyPipe, () => 132);

// @ts-expect-error: does not support wrong argument types.
MockPipe(MyPipe, (a1: boolean) => !a1);

// @ts-expect-error: does not support wrong argument types.
MockPipe(MyPipe, (a1: string, a2: string) => !a1 || !a2);
