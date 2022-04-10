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
where **everything in the module will be replaced with their mocks**, except the tested thing: `MockBuilder( TheThing, ItsModule )`.

MockBuilder tends to provide **a simple instrument to turn Angular dependencies into their mocks**,
does it in isolated scopes,
and has a rich toolkit that supports:

- detection and creation of mocks for root providers
- replacement of modules and declarations in any depth
- exclusion of modules, declarations and providers in any depth

## Simple example

A code sample demonstrating ease of creating mocks in Angular tests with help of `MockBuilder`.
Please, pay attention to comments in the code.

- [Try it on StackBlitz](https://stackblitz.com/github/ng-mocks/examples/tree/tests?file=src/examples/MockBuilder/test.simple.spec.ts&initialpath=%3Fspec%3DMockBuilder%3Asimple)
- [Try it on CodeSandbox](https://codesandbox.io/s/github/ng-mocks/examples/tree/tests?file=/src/examples/MockBuilder/test.simple.spec.ts&initialpath=%3Fspec%3DMockBuilder%3Asimple)

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

## Chain functions

### .keep()

If we want to keep a module, component, directive, pipe or provider as it is. We should use `.keep`.

```ts
beforeEach(() => {
  return MockBuilder(MyComponent, MyModule)
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
  return MockBuilder(MyComponent, MyModule)
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
  return MockBuilder(MyComponent, MyModule)
    .mock(SomePipe, value => 'My Custom Content');
});
```

For services and tokens, we can optionally provide their stubs.
Please keep in mind that the mock object of the service will be extended with the provided value.

```ts
beforeEach(() => {
  return MockBuilder(MyComponent, MyModule)
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

In case of `RouterTestingModule` we need to use [`.keep`](#keep) for both of the modules and to pass an empty array into `.withRoutes`.

```ts
beforeEach(() => {
  return MockBuilder(MyComponent, MyModule)
    .keep(RouterModule)
    .keep(RouterTestingModule.withRoutes([]));
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
Also, it can be done globally via [`ngMocks.defaultConfig()`](./ngMocks/defaultConfig.md) to avoid repetitions.

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
Does not matter how deep it is. It will be exported to the level of `TestingModule`.

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

By default, all definitions are added to the `TestingModule` if they are not a dependency of another definition.
Modules are added as imports to the `TestingModule`.
Components, Directive, Pipes are added as declarations to the `TestingModule`.
Tokens and Services are added as providers to the `TestingModule`.
If we do not want something to be added to the `TestingModule` at all, then we need to mark it with the `dependency` flag.

```ts
beforeEach(() => {
  return (
    MockBuilder(MyComponent, MyModule)
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

## Tokens

### `NG_MOCKS_GUARDS` token

If we want to test guards, we need to [`.keep`](#keep) them, but what should we do with other guards we do not want to care about at all?
The answer is to exclude `NG_MOCKS_GUARDS` token, it will **remove all the guards** from routes except the explicitly configured ones.

```ts
beforeEach(() => {
  return MockBuilder(MyGuard, MyModule)
    .exclude(NG_MOCKS_GUARDS);
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

Also, we can suppress the first parameter with `null` if we want to create mocks for all declarations.

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
