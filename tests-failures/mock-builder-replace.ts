import { InjectionToken } from '@angular/core';

import { MockBuilder } from 'ng-mocks';

class MyModule {}

const moduleWithProviders = {
  ngModule: MyModule,
  providers: [],
};

class MyComponentA {
  public readonly name = 'MyComponentA';
}

class MyComponentB {
  public readonly name = 'MyComponentB';
}

abstract class AbstractComponentA {
  public readonly name = 'AbstractComponentA';
}

abstract class AbstractComponentB {
  public readonly name = 'AbstractComponentB';
}

const TOKEN_OBJECT = new InjectionToken<{ prop: boolean }>('TOKEN_OBJECT');
const TOKEN_UNKNOWN = new InjectionToken('TOKEN_UNKNOWN');

// Accepts classes only.
MockBuilder()
  .replace(MyComponentA, MyComponentB)
  .replace(MyComponentA, AbstractComponentA)
  .replace(AbstractComponentA, MyComponentA)
  .replace(AbstractComponentA, AbstractComponentB)
  .replace(MyComponentA, MyComponentB, { exportAll: true })
  .replace(MyComponentA, AbstractComponentA, { export: true })
  .replace(AbstractComponentA, MyComponentA, { dependency: true });

// @ts-expect-error: does not support modules with providers.
MockBuilder().replace(MyModule, moduleWithProviders);

// @ts-expect-error: does not support modules with providers.
MockBuilder().replace(moduleWithProviders, MyModule);

// @ts-expect-error: fails on tokens.
MockBuilder().replace(MyComponentA, TOKEN_OBJECT);

// @ts-expect-error: fails on tokens.
MockBuilder().replace(TOKEN_OBJECT, MyComponentA);

// @ts-expect-error: fails on tokens.
MockBuilder().replace(TOKEN_OBJECT, TOKEN_UNKNOWN);

// @ts-expect-error: fails on primitives.
MockBuilder().replace(MyComponentA, 1);

// @ts-expect-error: fails no tokens.
MockBuilder().replace(MyComponentA, false);

// @ts-expect-error: fails no tokens.
MockBuilder().replace(MyComponentA, 'string');

// @ts-expect-error: fails no tokens.
MockBuilder().replace(MyComponentA, undefined);

// @ts-expect-error: fails no tokens.
MockBuilder().replace(MyComponentA, null);

// @ts-expect-error: does not support unknown parameters.
MockBuilder().replace(MyComponentA, MyComponentB, { render: true });

// @ts-expect-error: does not support unknown parameters.
MockBuilder().replace(MyComponentA, MyComponentB, { precise: true });

// @ts-expect-error: does not support unknown parameters.
MockBuilder().replace(MyComponentA, MyComponentB, { unknown3: true });
