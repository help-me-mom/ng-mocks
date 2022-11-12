import { getMockedNgDefOf } from 'ng-mocks';
import { Type } from '@angular/core';

declare class Expected {
  public name: string;
}

declare class Actual {
  public name: number;
}

declare let result1: Type<Actual>;
declare let result2: Type<Expected>;

// @ts-expect-error: string is not boolean
result1 = getMockedNgDefOf(Expected);

// boolean is boolean
result2 = getMockedNgDefOf(Expected);
