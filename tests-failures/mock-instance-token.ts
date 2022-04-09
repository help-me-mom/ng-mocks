import { InjectionToken } from '@angular/core';

import { MockInstance } from 'ng-mocks';

const TOKEN = new InjectionToken<{ prop: boolean }>('TOKEN');

// Accepts valid type.
MockInstance(TOKEN, () => ({
  prop: true,
}));
// Accepts valid type.
MockInstance(TOKEN, {
  init: () => ({
    prop: false,
  }),
});
// Accepts reset.
MockInstance(TOKEN);

// @ts-expect-error: does not support wrong types.
MockInstance(TOKEN, () => true);
// @ts-expect-error: does not support wrong types.
MockInstance(TOKEN, () => ({
  prop: 123,
}));
// @ts-expect-error: does not support wrong types.
MockInstance(TOKEN, {
  init: () => ({
    prop: 123,
  }),
});
