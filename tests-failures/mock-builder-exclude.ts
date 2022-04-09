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
  .exclude(MyModule)
  .exclude(moduleWithProviders)
  .exclude(MyComponent)
  .exclude(AbstractDirective)
  .exclude(MyService)
  .exclude(TOKEN_OBJECT)
  .exclude(TOKEN_BOOLEAN)
  .exclude(TOKEN_STRING)
  .exclude(TOKEN_UNKNOWN)
  .exclude('string_provider');
