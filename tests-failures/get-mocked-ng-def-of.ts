import { getMockedNgDefOf, Type } from 'ng-mocks';

declare class Expected {
  public name: string;
}

declare class Actual {
  public name: number;
}

// @ts-expect-error: string is not boolean
const result: Type<Actual> = getMockedNgDefOf(Expected);
