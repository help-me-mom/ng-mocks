import { InjectionToken } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';

import { MockBuilder } from 'ng-mocks';

class MyModule {}

const moduleWithProviders = {
  ngModule: MyModule,
  providers: [],
};

class MyComponent {}

abstract class AbstractDirective {}

class MyService {
  public o$: Observable<number> = EMPTY;

  public echo(): Observable<number> {
    return this.o$;
  }
}

const TOKEN_OBJECT = new InjectionToken<{ prop: boolean }>('TOKEN_OBJECT');
const TOKEN_BOOLEAN = new InjectionToken<boolean>('TOKEN_BOOLEAN');
const TOKEN_STRING = new InjectionToken<string>('TOKEN_STRING');
const TOKEN_UNKNOWN = new InjectionToken('TOKEN_UNKNOWN');

// Accepts all possible types.
MockBuilder()
  .keep(MyModule)
  .keep(moduleWithProviders)
  .keep(MyComponent)
  .keep(AbstractDirective)
  .keep(MyService)
  .keep(TOKEN_OBJECT)
  .keep(TOKEN_BOOLEAN)
  .keep(TOKEN_STRING)
  .keep(TOKEN_UNKNOWN)
  .keep('string_provider')
  .keep(MyComponent, { export: true })
  .keep(moduleWithProviders, { exportAll: true })
  .keep(MyService, { dependency: true })
  .keep(TOKEN_OBJECT, { export: true })
  .keep(TOKEN_BOOLEAN, { exportAll: true })
  .keep(MyModule, { dependency: true })
  .keep('string_provider_1', { export: true })
  .keep('string_provider_2', { exportAll: true })
  .keep('string_provider_3', { dependency: true });

// @ts-expect-error: does not support unknown parameters.
MockBuilder().keep(MyComponent, { render: true });

// @ts-expect-error: does not support unknown parameters.
MockBuilder().keep(TOKEN_OBJECT, { precise: true });

// @ts-expect-error: does not support unknown parameters.
MockBuilder().keep('string_provider_1', { unknown3: true });
