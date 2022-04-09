import { InjectionToken } from '@angular/core';

import { MockBuilder } from 'ng-mocks';

class MyService {
  public readonly name = 'MyService';
}

abstract class AbstractService {
  public readonly name = 'AbstractService';
}

const TOKEN_OBJECT = new InjectionToken<{ prop: boolean }>('TOKEN_OBJECT');
const TOKEN_BOOLEAN = new InjectionToken<boolean>('TOKEN_BOOLEAN');
const TOKEN_STRING = new InjectionToken<string>('TOKEN_STRING');
const TOKEN_UNKNOWN = new InjectionToken('TOKEN_UNKNOWN');

// Accepts classes only.
MockBuilder()
  .provide(MyService)
  .provide({
    provide: AbstractService,
    useValue: undefined,
  })
  .provide({
    provide: TOKEN_OBJECT,
    useValue: undefined,
  })
  .provide({
    provide: 'string',
    useValue: undefined,
  })
  .provide([
    MyService,
    {
      provide: TOKEN_BOOLEAN,
      useValue: true,
    },
    {
      provide: TOKEN_STRING,
      useValue: '123',
    },
    {
      provide: TOKEN_UNKNOWN,
      useValue: undefined,
    },
  ]);

// @ts-expect-error: does not support wrong types.
MockBuilder().provide('123');

// @ts-expect-error: does not support tokens.
MockBuilder().provide(TOKEN_OBJECT);
