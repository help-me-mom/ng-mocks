import { InjectionToken } from '@angular/core';

import { MockProvider } from 'ng-mocks';

const TOKEN_OBJECT = new InjectionToken<{ prop: boolean }>('TOKEN_OBJECT');
const TOKEN_BOOLEAN = new InjectionToken<boolean>('TOKEN_BOOLEAN');
const TOKEN_STRING = new InjectionToken<string>('TOKEN_STRING');
const TOKEN_UNKNOWN = new InjectionToken('TOKEN_UNKNOWN');

class Service {
  public flag = false;

  public getFlag(): boolean {
    return this.flag;
  }
}

MockProvider(TOKEN_OBJECT);
MockProvider(Service);
MockProvider('string');

// @ts-expect-error: does not accept wrong types.
MockProvider(Service, {
  flag: '123',
});

// @ts-expect-error: does not accept wrong methods.
MockProvider(Service, {
  getFlag: () => '123',
});

// @ts-expect-error: does not accept extra properties.
MockProvider(Service, {
  mExtra: {},
});

// Accepts any expected values for tokens.
MockProvider(TOKEN_OBJECT, {
  prop: false,
});

// @ts-expect-error: does not accept wrong types for tokens.
MockProvider(TOKEN_OBJECT, {
  prop: 123,
});

// Accepts any expected values for tokens.
MockProvider(TOKEN_BOOLEAN, false);

// @ts-expect-error: does not accept wrong types for tokens.
MockProvider(TOKEN_BOOLEAN, 123);

// Accepts any expected values for tokens.
MockProvider(TOKEN_STRING, 'false');

// @ts-expect-error: does not accept wrong types for tokens.
MockProvider(TOKEN_STRING, 123);

// Accepts any values for unknown tokens.
MockProvider(TOKEN_UNKNOWN, 'false');

// Accepts any values for unknown tokens.
MockProvider(TOKEN_UNKNOWN, 123);

// Accepts any values for string.
MockProvider('string', 'false');

// Accepts any values for string.
MockProvider('string', 123);
