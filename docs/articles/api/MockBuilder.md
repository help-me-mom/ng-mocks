---
title: MockBuilder - the simplest way to create mocks in Angular tests
description: MockBuilder - the simplest way to create mocks in Angular tests
sidebar_label: MockBuilder
---

`MockBuilder` is **the simplest way to create mocks** out of everything.
It provides a rich toolkit of functions to manipulate the mocks in the way tests require,
but with minimum overhead.

Usually, we have something simple to test, but time to time, the simplicity is killed by nightmarish dependencies.
The good thing here is that commonly the dependencies have been declared or imported in the same module, where our
tested thing is. Therefore, with help of `MockBuilder` we can quite easily define a testing module,
where **everything in the module will be replaced with their mocks**, except the tested thing:

```ts
beforeEach(() => {
  return MockBuilder(TheThing, ItsModule);
});

// To test a component
beforeEach(() => {
  return MockBuilder(TheComponent, ItsModule);
});

// To test a directive
beforeEach(() => {
  return MockBuilder(TheDirective, ItsModule);
});

// To test a pipe
beforeEach(() => {
  return MockBuilder(ThePipe, ItsModule);
});

// To test a standalone declarations
beforeEach(() => {
  return MockBuilder(TheStandaloneDeclaration).mock(OneOfItsImports);
});
```

`MockBuilder` tends to provide **a simple instrument to turn Angular dependencies into their mocks**,
does it in isolated scopes,
and has a rich toolkit that supports:

- detection and creation of mocks for root providers
- replacement of modules and declarations at any depth
- exclusion of modules, declarations and providers at any depth
- shallow testing of [standalone declarations](#shallow-flag)

## Simple example

A code sample demonstrating ease of creating mocks in Angular tests with help of `MockBuilder`.
Please, pay attention to comments in the code.

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/MockBuilder/test.simple.spec.ts&initialpath=%3Fspec%3DMockBuilder%3Asimple)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockBuilder/test.simple.spec.ts&initialpath=%3Fspec%3DMockBuilder%3Asimple)

```ts
describe('MockBuilder:simple', () => {
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(MyComponent, MyModule));
  // The same as
  // beforeEach(() => TestBed.configureTestingModule({{
  //   imports: [MockModule(MyModule)],
  // }).compileComponents());
  // but MyComponent has not been replaced with a mock object for
  // the testing purposes.

  it('should render content ignoring all dependencies', () => {
    const fixture = MockRender(MyComponent);
    expect(fixture).toBeDefined();
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div>My Content</div>',
    );
  });
});
```

## Flex mode

You can use the flex mode to build TestBed in the way you want.
Let's assume you want to test `TargetComponent` and it has 3 dependencies:

- `CurrencyPipe` should be a mock
- `TimeService` should be a mock
- `ReactiveFormModule` should stay as it is

For this case, `MockBuilder` can be called like that:

```ts
beforeEach(() => {
  return MockBuilder()
    // It will be declared as it is in the TestBed.
    .keep(TargetComponent)
    
    // It will be declared as a mock in the TestBed.
    .mock(CurrencyPipe)

    // It will be provided as a mock in the TestBed.
    .mock(TimeService)

    // It will be imported as it is in the TestBed.
    .keep(ReactiveFormModule);
});
```

This approach is good, however the problem is that dependencies are provided explicitly,
and if someone has removed `ReactiveFormModule` from the module where `TargetComponent` has been declared,
the test won't fail, whereas the app will.

There is where the [strict mode](#strict-mode) shines.

## Strict mode

The strict mode is enabled if you pass 2 parameters to `MockBuilder`:

- the first parameter is what should be provided and kept as it is for testing
- the second parameter is what should be provided and mocked for testing
- the chain calls only customize these declarations

If we consider the example from the [flex mode](#flex-mode), then, to enable the strict mode, the code should look like:

```ts
beforeEach(() => {
  // TargetComponent is exported as it is from TargetModule
  // all imports and declarations of TargetModule should be mocked
  return MockBuilder(TargetComponent, TargetModule)
    
    // It marks ReactiveFormModule to be kept as it is in TargetModule
    // and throw an error if TargetModule or its imports don't import it.
    .keep(ReactiveFormModule);
});
```

All dependencies of `TargetComponent` are in `TargetModule`, and if any of them have been deleted, tests will fail.

Also, if someone has deleted `ReactiveFormModule` from `TargetModule`, tests will fail too,
because `MockBuilder` will throw an error about missing `ReactiveFormModule` which should be kept.

However, what if more than 1 module is requires? For example, for lazy modules.
In the case of lazy loaded modules, you need to import more than 1 module in TestBed.
Usually, it's an `AppModule` which provides root declarations, and a `LazyModule` which belongs to a specific route.
In order to do so, simply pass arrays as parameters of `MockBuilder`:

```ts
beforeEach(() => {
  return MockBuilder(
    // It can be an array too, if you want to keep and export more than 1 thing
    TargetComponent,

    [
      // It will mock and import TargetModule in TestBed  
      TargetModule,
      // It will mock and import AppModule in TestBed  
      AppModule,
    ],
  )
    
  // It will keep CurrencyPipe as it is,
  // and throw if neither TargetModule nor AppModule declares or imports it.
  .keep(CurrencyPipe);
});
```

**The strict mode is the recommended approach**.

## Chain functions

### .keep()

If we want to keep a module, component, directive, pipe or provider as it is. We should use `.keep`.

```ts
beforeEach(() => {
  return MockBuilder(MyComponent)
    .keep(SomeModule)
    .keep(SomeModule.forSome())
    .keep(SomeModule.forAnother())
    .keep(SomeComponent)
    .keep(SomeDirective)
    .keep(SomePipe)
    .keep(SomeService)
    .keep(SomeInjectionToken);
});
```

### .mock()

If we want to turn anything into a mock object, even a part of a kept module we should use `.mock`.

```ts
beforeEach(() => {
  return MockBuilder(MyComponent)
    .mock(SomeModule)
    .mock(SomeModule.forSome())
    .mock(SomeModule.forAnother())
    .mock(SomeComponent)
    .mock(SomeDirective)
    .mock(SomePipe)
    .mock(SomeService)
    .mock(SomeInjectionToken);
});
```

For pipes, we can set their handlers as the 2nd parameter of `.mock`.

```ts
beforeEach(() => {
  return MockBuilder(MyComponent)
    .mock(SomePipe, value => 'My Custom Content');
});
```

For services and tokens, we can optionally provide their stubs.
Please keep in mind that the mock object of the service will be extended with the provided value.

```ts
beforeEach(() => {
  return MockBuilder(MyComponent)
    .mock(SomeService3, anything1)
    .mock(SOME_TOKEN, anything2);
});
```

### .exclude()

If we want to exclude something, even a part of a kept module we should use `.exclude`.

```ts
beforeEach(() => {
  return MockBuilder(MyComponent, MyModule)
    .exclude(SomeModule)
    .exclude(SomeComponent)
    .exclude(SomeDirective)
    .exclude(SomePipe)
    .exclude(SomeDependency)
    .exclude(SomeInjectionToken);
});
```

### .replace()

If we want to replace something with something, we should use `.replace`.
The replacement has to be decorated with the same decorator as the source.
It is not impossible to replace a provider / service, we should use [`.provide`](#provide) or [`.mock`](#mock) for that.

```ts
beforeEach(() => {
  return MockBuilder(MyComponent, MyModule)
    .replace(SomeModule, SomeOtherModule)
    .replace(SomeComponent, SomeOtherComponent)
    .replace(SomeDirective, SomeOtherDirective)
    .replace(SomePipe, SomeOtherPipe);
});
```

In case of `HttpClientTestingModule` we can use `.replace` too.

```ts
beforeEach(() => {
  return MockBuilder(MyComponent, MyModule)
    .replace(HttpClientModule, HttpClientTestingModule);
});
```

In case of `RouterTestingModule`,
we need to use [`.keep`](#keep) for both of the modules and [`NG_MOCKS_ROOT_PROVIDERS`](#ng_mocks_root_providers-token),
and to pass an empty array into `.withRoutes`.
[`NG_MOCKS_ROOT_PROVIDERS`](#ng_mocks_root_providers-token) is needed,
because `RouterModule` has many root dependencies which should be also kept. 

```ts
beforeEach(() => {
  return MockBuilder(MyComponent)
    .keep(RouterModule)
    .keep(RouterTestingModule.withRoutes([]))
    .keep(NG_MOCKS_ROOT_PROVIDERS);
});
```

### .provide()

If we want to add or replace providers / services, we should use `.provide`. It has the same interface as a regular provider.

```ts
beforeEach(() => {
  return MockBuilder(MyComponent, MyModule)
    .provide(MyService)
    .provide([SomeService1, SomeService2])
    .provide({ provide: SomeComponent3, useValue: anything1 })
    .provide({ provide: SOME_TOKEN, useFactory: () => anything2 });
});
```

## Config

You can customize default behavior of mock things.
Also, it can be done globally via [`ngMocks.defaultConfig()`](ngMocks/defaultConfig.md) to avoid repetitions.

### `precise` flag

By default, when [`.mock(Service, mock)`](#mock) is used it creates a mock object via
[`MockService(Service, mock)`](MockService.md).
In some cases, we might want to use the exactly passed mock object instead of extension.
For this behavior we need to set `precise` flag to `true`. Tokens are always precise.

```ts
declare class MyService {
  p1: boolean;
  getP1(): boolean;
}
const mock = {
  p1: true,
};

beforeEach(() => {
  return (
    MockBuilder(MyComponent, MyModule)
      // its instance !== mock, but instance.p1 === mock.p1
      // instance.getP1() returns undefined
      .mock(MyService, mock)
      // its instance === mock, therefore instance.p1 === mock.p1
      // and instance.getP1 does not exist.
      .mock(MyService, mock, {
        precise: true,
      })
  );
});
```

### `export` flag

If we want to test a component, directive or pipe which, unfortunately, has not been exported,
then we need to mark it with the `export` flag.
Does not matter how deep it is. It will be exported to the level of `MyModule`.

```ts
beforeEach(() => {
  return MockBuilder(MyComponent, MyModule)
    .keep(SomeDeclaration1, {
      export: true,
    })
    .mock(SomeDeclaration2, {
      export: true,
    });
});
```

### `exportAll` flag

If we want to use all the declarations of a module which have not been exported,
we need to mark the module with the `exportAll` flag. Then all its imports and declarations will be exported.
If the module is nested, then add the [`export`](#export-flag) flag beside `exportAll` too.

```ts
beforeEach(() => {
  return MockBuilder(MyComponent)
    .keep(MyModule, {
      exportAll: true,
    })
    .mock(MyNestedModule, {
      exportAll: true,
      export: true,
    });
});
```

### `dependency` flag

By default, all definitions are added to the `MyModule` if they are not a dependency of another definition.
Modules are added as imports to the `MyModule`.
Components, Directive, Pipes are added as declarations to the `MyModule`.
Tokens and Services are added as providers to the `MyModule`.
If we do not want something to be added to the `MyModule` at all, then we need to mark it with the `dependency` flag.

```ts
beforeEach(() => {
  return (
    MockBuilder(MyComponent)
      .mock(MyModule)
      .keep(SomeModuleComponentDirectivePipeProvider1, {
        dependency: true,
      })
      .mock(SomeModuleComponentDirectivePipe, {
        dependency: true,
      })
      // Pass the same def as a mock instance, if we want only to
      // specify the config.
      .mock(SomeProvider, SomeProvider, {
        dependency: true,
      })
      // Or provide a mock instance together with the config.
      .mock(SomeProvider, mockInstance, {
        dependency: true,
      })
      .replace(SomeModuleComponentDirectivePipeProvider1, anything1, {
        dependency: true,
      })
  );
});
```

### `shallow` flag

The `shallow` flag works with kept standalone declarations.
It signals `MockBuilder` to mock all imports of the declaration, whereas the declaration itself won't be mocked.

```ts
beforeEach(() => {
  return MockBuilder()
    .keep(StandaloneComponent, {
      shallow: true, // all imports of StandaloneComponent will be mocks.
    });
});
```

Also, if a standalone declaration has been passed as the first parameter of `MockBuilder`,
then the `shallow` flag will be automatically set. It allows smooth shallow testing of them.

```ts
beforeEach(() => {
  // All imports, apart from OneOfItsDependenciesPipe, of StandaloneComponent will be mocks.
  return MockBuilder(StandaloneComponent).keep(OneOfItsDependenciesPipe);
});
```

### `render` flag

When we want to render a structural directive by default, we can do that via adding the `render` flag in its config.

```ts
beforeEach(() => {
  return MockBuilder(MyComponent, MyModule).mock(MyDirective, {
    render: true,
  });
});
```

If the directive has own context and variables. Then instead of setting `render` to true we can set the context.

```ts
beforeEach(() => {
  return MockBuilder(MyComponent, MyModule).mock(MyDirective, {
    render: {
      $implicit: something1,
      variables: { something2: something3 },
    },
  });
});
```

If we use `ContentChild` in a component, and we want to render it by default, we should use its id for that in the same way as for a mock directive.

```ts
beforeEach(() => {
  return MockBuilder(MyComponent, MyModule).mock(MyComponent, {
    render: {
      blockId: true,
      blockWithContext: {
        $implicit: something1,
        variables: { something2: something3 },
      },
    },
  });
});
```

### `onRoot` flag

This is an internal flag and should not be used explicitly.
It indicates whether a module or declaration should be directly defined in `TestBedModule`,
even if it has been imported or declared in nested modules.

## Tokens

### `NG_MOCKS_GUARDS` token

`NG_MOCKS_GUARDS` helps to **remove guards from all routes** in a test.
It's useful if you want to test a specific guard. 
To do so, you need to [`.exclude`](#exclude) `NG_MOCKS_GUARDS` and to [`.keep`](#keep) the guard.

```ts
beforeEach(() => {
  return MockBuilder(
      [RouterModule, RouterTestingModule.withRoutes([])],
      ModuleWithRoutes,
    )
    .exclude(NG_MOCKS_GUARDS) // <- remotes all guards
    .keep(GuardUnderTest) // <- but keeps GuardUnderTest
  ;
});
```

### `NG_MOCKS_RESOLVERS` token

`NG_MOCKS_RESOLVERS` helps to **remove all resolves from all routes** in a test.
It's useful if you want to test a specific resolver.
To do so, you need to [`.exclude`](#exclude) `NG_MOCKS_RESOLVERS` and to [`.keep`](#keep) the resolver.

```ts
beforeEach(() => {
  return MockBuilder(
      [RouterModule, RouterTestingModule.withRoutes([])],
      ModuleWithRoutes,
    )
    .exclude(NG_MOCKS_RESOLVERS) // <- remotes all resolvers
    .keep(ResolverUnderTest) // <- but keeps ResolverUnderTest
  ;
});
```

### `NG_MOCKS_INTERCEPTORS` token

Usually, when we want to test an interceptor, we want to avoid influences of other interceptors.
To **remove all interceptors in an angular test** we need to exclude `NG_MOCKS_INTERCEPTORS` token,
then all interceptors will be excluded except the explicitly configured ones.

```ts
beforeEach(() => {
  return MockBuilder(MyInterceptor, MyModule)
    .exclude(NG_MOCKS_INTERCEPTORS);
});
```

### `NG_MOCKS_ROOT_PROVIDERS` token

There are root services and tokens apart from provided ones in Angular applications.
It might happen that in a test we want these providers to be replaced with their mocks or to be kept.

If we want to replace all root providers with their mocks in an angular test,
we need to pass `NG_MOCKS_ROOT_PROVIDERS` token into [`.mock`](#mock).

```ts
beforeEach(() => {
  return MockBuilder(MyComponentWithRootServices, MyModuleWithRootTokens)
    .mock(NG_MOCKS_ROOT_PROVIDERS);
});
```

In contrast to that, we might want to keep all root providers for mock declarations.
For that, we need to keep `NG_MOCKS_ROOT_PROVIDERS` token.

```ts
beforeEach(() => {
  return MockBuilder(MyComponentWithRootServices, MyModuleWithRootTokens)
    .keep(NG_MOCKS_ROOT_PROVIDERS);
});
```

If we do not pass `NG_MOCKS_ROOT_PROVIDERS` anywhere,
then only root providers for kept modules will stay as they are.
All other root providers will be replaced with their mocks, even for kept declarations of mock modules.

## Factory function

You might be using other [testing frameworks for angular](/extra/with-3rd-party.md),
such as [`@ngneat/spectator`](https://www.npmjs.com/package/@ngneat/spectator)
or [`@testing-library/angular`](https://www.npmjs.com/package/@testing-library/angular).

This is a use-case for the factory function.

The factory function allows you to get a preconfigured `TestBed` declarations which can be passed wherever else. 

```ts
const ngModule = MockBuilder(MyComponent, MyModule)
  .build();
```

The code above creates mocks for everything in `MyModule` (imports, declarations, providers and exports), but keeps `MyComponent` as it is for testing purposes.
Actually, it does the next:

```ts
const ngModule = MockBuilder()
  .keep(MyComponent, { export: true })
  .mock(MyModule, { exportAll: true })
  .build();
```

Also, we can suppress the first parameter with `null` or `undefined` if we want to create mocks for all declarations.

```ts
const ngModule = MockBuilder(null, MyModule)
  .build();
```

It does the next:

```ts
const ngModule = MockBuilder()
  .mock(MyModule, { exportAll: true })
  .build();
```

If we do not plan further customization of `ngModule` then we do not need to call `.build()`. Simply return result of `MockBuilder` in `beforeEach`.

```ts
// Do not forget to return the promise of MockBuilder.
beforeEach(() => MockBuilder(MyComponent, MyModule));
```

It does the next:

```ts
beforeEach(() => {
  const ngModule = MockBuilder()
    .keep(MyComponent, { export: true })
    .mock(MyModule, { exportAll: true })
    .build();
  TestBed.configureTestingModule(ngModule);
  return TestBed.compileComponents();
});
```

## Extending `MockBuilder`

If you want to add your own methods to `MockBuilder`, you can use `MockBuilder.extend(method, callback)` for that.

Let's assume, we want to add a method called `customMock` which accepts a string,
and the string will be used a return value in a service.

Eventually, it should be used like that:

```ts
MockBuilder(/* ... */)
  .mock(/* ... */)
  .customMock('value') // <-- the extension to MockBuilder
  .keep(/* ... */);
```


The first step is to declare `customMock` as a part of the type of `MockBuilder`:

```ts
declare module 'ng-mocks' {
  interface IMockBuilderExtended {
    // parameters can be whatever you want
    customMock(value: string): this; // it has to return this
  }
}
```

Parameters of `customMock` can be whatever you want to pass to your custom callback, in our case, it's a string.
However, please note, that the return type has to be `this`.

The second step is to register a callback as an implementation of `customMock` via `MockBuilder.extend()`.

The callback will receive two parameters:

- the first parameter is the current instance of `MockBuilder`
- the second parameter is an array of all parameters passed to `customMock`

:::tip correct parameters type
You can use a builtin type called `Parameters` to get a correct type tuple:
`Parameters<IMockBuilderExtended['customMock']>`,
simply replace `customMock` with the name of your custom method.
::: 

```ts
// Builtin `Parameters` type can be used for type safety. 
MockBuilder.extend(
  'customMock', // <-- name of our custom method
  
  (builder, parameters: Parameters<IMockBuilderExtended['customMock']>) => {
    // Extracting the value.
    const value = parameters[0];
    
    // Calling custom logic on builder.
    // In this case, TargetService.echo() should return the value.  
    builder.mock(TargetService, {
      echo: () => value,
    });
  },
);
```

Profit, now if you call `MockBuilder().customMock('mock')` then,
in its test, a call of `TargetService.echo()` will return `'mock'`.

If you need to delete a custom method, simply call `MockBuilder.extend()` without the second parameter:

```ts
MockBuilder.extend('customMock');
MockBulder().customMock(''); // throws an error now
```

## Adding schemas

`MockBuilder` provides a method called `beforeCompileComponents`,
it allows to customize the generated `testBed`.
For example, to add `schemas`:  `CUSTOM_ELEMENTS_SCHEMA`, `NO_ERRORS_SCHEMA`.

```ts
beforeEach(() => {
  return MockBuilder(MyComponent, MyModule)
    .beforeCompileComponents(testBed => {
      testBed.configureTestingModule({
        schemas: [
          NO_ERRORS_SCHEMA,
        ],
      });
    });
});
```

## Good to know

Anytime we can change our decision. The last action on the same object wins.
`SomeModule` will be replaced with its mock object.

```ts
beforeEach(() => {
  return MockBuilder(MyComponent, MyModule)
    .keep(SomeModule)
    .mock(SomeModule)
    .keep(SomeModule)
    .mock(SomeModule);
});
```
