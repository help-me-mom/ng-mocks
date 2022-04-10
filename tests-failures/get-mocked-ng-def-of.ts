import { getMockedNgDefOf } from 'ng-mocks';
import { Type } from '@angular/core';

declare class Expected {
  public name: string;
}

declare class Actual {
  public name: number;
}

// @ts-expect-error: string is not boolean
const result1: Type<Actual> = getMockedNgDefOf(Expected);

// boolean is boolean
const result2: Type<Expected> = getMockedNgDefOf(Expected);
