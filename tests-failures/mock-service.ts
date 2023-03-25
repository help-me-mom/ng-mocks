import { InjectionToken } from '@angular/core';

import { MockService } from 'ng-mocks';

const TOKEN = new InjectionToken<{ prop: boolean }>('TOKEN_OBJECT');

class Service {
  public flag = false;

  public getFlag(): boolean {
    return this.flag;
  }
}

const token = MockService(TOKEN);
const service = MockService(Service);

// token is any, so it can be whatever
const tokenCheck1: undefined = token;
// token is any, so it can be  whatever
const tokenCheck2: Service = token;
// token is any, so it can be  whatever
const tokenCheck3: number = token;

// @ts-expect-error: Service is not undefined
const serviceCheck1: undefined = service;
// service is Service
const serviceCheck2: Service = service;
// @ts-expect-error: Service is not number
const serviceCheck3: number = service;

// @ts-expect-error: does not accept wrong types.
MockService(Service, {
  flag: '123',
});

// @ts-expect-error: does not accept wrong methods.
MockService(Service, {
  getFlag: () => '123',
});

// @ts-expect-error: does not accept extra properties.
MockService(Service, {
  mExtra: {},
});

// @ts-expect-error: does not override tokens.
MockService(TOKEN, {
  prop: false,
});
