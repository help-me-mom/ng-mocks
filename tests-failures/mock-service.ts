import { InjectionToken } from '@angular/core';

import { MockService } from 'ng-mocks';

const TOKEN = new InjectionToken<{ prop: boolean }>('TOKEN_OBJECT');

class Service {
  public flag = false;

  public getFlag(): boolean {
    return this.flag;
  }
}

MockService(TOKEN);
MockService(Service);

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
