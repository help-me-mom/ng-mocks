import { InjectionToken, PipeTransform } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';

import { MockBuilder } from 'ng-mocks';

class MyModule {
  public readonly name = 'MyModule';
}

const moduleWithProviders = {
  ngModule: MyModule,
  providers: [],
};

class MyComponent {
  public readonly name = 'MyComponent';
}

class MyDirective {
  public readonly name = 'MyDirective';
}

abstract class AbstractDirective {}

class MyPipe implements PipeTransform {
  public readonly name = 'MyPipe';

  public transform(value: string, arg1: boolean): boolean {
    return this.name.length > 0 && value.length > 0 && arg1;
  }
}

class MyService {
  public readonly name = 'MyService';

  public o$: Observable<number> = EMPTY;

  public echo(): Observable<number> {
    return this.o$;
  }
}

const TOKEN_OBJECT = new InjectionToken<{ prop: boolean }>('TOKEN_OBJECT');
const TOKEN_BOOLEAN = new InjectionToken<boolean>('TOKEN_BOOLEAN');
const TOKEN_STRING = new InjectionToken<string>('TOKEN_STRING');
const TOKEN_UNKNOWN = new InjectionToken('TOKEN_UNKNOWN');

// Accepts all possible types without mocks.
MockBuilder()
  .mock(MyModule)
  .mock(moduleWithProviders)
  .mock(MyComponent)
  .mock(AbstractDirective)
  .mock(MyDirective)
  .mock(MyPipe)
  .mock(MyService)
  .mock(TOKEN_OBJECT)
  .mock(TOKEN_BOOLEAN)
  .mock(TOKEN_STRING)
  .mock(TOKEN_UNKNOWN)
  .mock('string_provider');

// Modules, Components, Directives, Pipes
// (actually any classes because we cannot detect declaration with ts)
// support configuration.
MockBuilder().mock(MyModule, { export: true });
MockBuilder().mock(MyModule, { exportAll: true });
MockBuilder().mock(MyModule, { dependency: true });

// @ts-expect-error: does not support unknown parameters.
MockBuilder().mock(MyModule, { unknown: true });

// A config for directives
MockBuilder().mock(MyDirective, { export: true });
MockBuilder().mock(MyDirective, { dependency: true });
MockBuilder().mock(MyDirective, { render: true });
MockBuilder().mock(MyDirective, { render: { $implicit: true } });
MockBuilder().mock(MyDirective, { render: { variables: {} } });
MockBuilder().mock(MyDirective, { render: { $implicit: true, variables: {} } });

MockBuilder().mock(MyDirective, {
  render: {
    // @ts-expect-error: does not support unknown parameters.
    unknown: 123,
  },
});

// A config for components
MockBuilder().mock(MyComponent, {
  render: {
    block1: true,
  },
});
MockBuilder().mock(MyComponent, {
  render: {
    block1: { $implicit: true },
  },
});
MockBuilder().mock(MyComponent, {
  render: {
    block1: { variables: {} },
  },
});
MockBuilder().mock(MyComponent, {
  render: {
    block1: { $implicit: true, variables: {} },
  },
});

MockBuilder().mock(MyComponent, {
  render: {
    // @ts-expect-error: does not support unknown parameters.
    block1: { unknown: true },
  },
});

// A config for pipes
MockBuilder().mock(MyPipe, { export: true });
MockBuilder().mock(MyPipe, { dependency: true });
MockBuilder().mock(MyPipe, () => true);
MockBuilder().mock(MyPipe, (a1: string, a2: boolean) => !a1 || !a2, { precise: true });
MockBuilder().mock(MyPipe, {
  transform: () => true,
});
MockBuilder().mock(
  MyPipe,
  {
    transform: (a1: string, a2: boolean) => !!a1 || !!a2,
  },
  {
    precise: true,
  },
);

// TODO find a way to get them failing
MockBuilder().mock(MyPipe, () => 123);
MockBuilder().mock(MyPipe, (a1: boolean, a2: boolean) => !a1 || !a2);
MockBuilder().mock(MyPipe, (a1: boolean, a2: string) => !a1 || !a2);
MockBuilder().mock(MyPipe, (a1: string, a2: boolean) => `${a1}${a2}`);

MockBuilder().mock(MyPipe, {
  // @ts-expect-error: does not support a wrong return type.
  transform: () => '123',
});

MockBuilder().mock(MyPipe, {
  // @ts-expect-error: does not support a wrong parameter type.
  transform: (a: boolean) => !!a,
});

// A config for services
MockBuilder().mock(MyService, MyService, { dependency: true });
MockBuilder().mock(
  MyService,
  {
    o$: EMPTY,
  },
  { export: true },
);
MockBuilder().mock(
  MyService,
  {
    echo: () => EMPTY,
    o$: EMPTY,
  },
  { export: true },
);

// @ts-expect-error: does not support a class to set the config.
MockBuilder().mock(MyService, MyModule, { export: true });

// @ts-expect-error: does not support wrong config.
MockBuilder().mock(MyService, MyModule, { unknown: true });

MockBuilder().mock(MyService, {
  // @ts-expect-error: does not support unknown properties.
  o: EMPTY,
});

MockBuilder().mock(MyService, {
  // @ts-expect-error: does not support wrong types.
  o$: true,
});

MockBuilder().mock(MyService, {
  // @ts-expect-error: does not support wrong return types.
  echo: () => true,
});

// A config for tokens
MockBuilder().mock(TOKEN_OBJECT, undefined);
MockBuilder().mock(TOKEN_OBJECT, { prop: true });
MockBuilder().mock(TOKEN_OBJECT, TOKEN_OBJECT, { dependency: true });
MockBuilder().mock(TOKEN_BOOLEAN, undefined);
MockBuilder().mock(TOKEN_BOOLEAN, false);
MockBuilder().mock(TOKEN_BOOLEAN, TOKEN_BOOLEAN, { dependency: true });
MockBuilder().mock(TOKEN_STRING, undefined);
MockBuilder().mock(TOKEN_STRING, 'string');
MockBuilder().mock(TOKEN_STRING, TOKEN_STRING, { dependency: true });
MockBuilder().mock(TOKEN_UNKNOWN, undefined);
MockBuilder().mock(TOKEN_UNKNOWN, { prop: true });
MockBuilder().mock(TOKEN_UNKNOWN, false);
MockBuilder().mock(TOKEN_UNKNOWN, 'string');
MockBuilder().mock(TOKEN_UNKNOWN, TOKEN_UNKNOWN, { dependency: true });

// @ts-expect-error: does not support wrong types.
MockBuilder().mock(TOKEN_OBJECT, false);
// @ts-expect-error: does not support wrong types.
MockBuilder().mock(TOKEN_BOOLEAN, '123');
// @ts-expect-error: does not support wrong types.
MockBuilder().mock(TOKEN_STRING, 123);

// @ts-expect-error: does not support wrong types.
MockBuilder().mock(TOKEN_OBJECT, {
  prop: '123',
});
