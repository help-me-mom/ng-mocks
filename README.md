[![chat on gitter](https://badges.gitter.im/ng-mocks/community.svg)](https://gitter.im/ng-mocks/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![npm version](https://badge.fury.io/js/ng-mocks.svg)](https://badge.fury.io/js/ng-mocks)
[![build status](https://travis-ci.org/ike18t/ng-mocks.svg?branch=master)](https://travis-ci.org/ike18t/ng-mocks)
[![coverage status](https://coveralls.io/repos/github/ike18t/ng-mocks/badge.svg?branch=master)](https://coveralls.io/github/ike18t/ng-mocks?branch=master)

# ngMocks - ease of mocking annoying dependencies in Angular unit tests

`ngMocks` is a library providing **helper functions for creating mocked dependencies in Angular** that supports components, directives, pipes, modules and services.

The current version of the library has been tested and can be used with:

- Angular 5 (Jasmine, Jest, es5, es2015)
- Angular 6 (Jasmine, Jest, es5, es2015)
- Angular 7 (Jasmine, Jest, es5, es2015)
- Angular 8 (Jasmine, Jest, es5, es2015)
- Angular 9 (Jasmine, Jest, Ivy, es5, es2015)
- Angular 10 (Jasmine, Jest, Ivy, es5, es2015)
- Angular 11 (Jasmine, Jest, Ivy, es5, es2015)

There is a preconfigured sandbox [codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/test.spec.ts)
where you might check all the features. To focus on a particular one simply prefix it with `fdescribe` or `fit`.

There is a brief summary of the latest changes in [CHANGELOG](https://github.com/ike18t/ng-mocks/blob/master/CHANGELOG.md).

## Why use this?

Sure, you could flip a flag on schema errors to make your component dependencies not matter.
Or you could use `ngMocks` to mock them out and have the ability to assert on their inputs or emit on an output to assert on a side effect.

### Find an issue or have a question or a request?

I'm open to contributions.

- [ask a question on gitter](https://gitter.im/ng-mocks/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
- [report it as an issue on github](https://github.com/ike18t/ng-mocks/issues)
- or submit a PR

### Content:

- [How to install](#install)
- [Motivation and easy start](#motivation-and-easy-start)

* [How to mock](#how-to-mock-dependencies-in-an-angular-application)
  - [a component](#how-to-mock-a-component)
  - [a directive](#how-to-mock-a-directive)
  - [a pipe](#how-to-mock-a-pipe)
  - [a service](#how-to-mock-a-service)
  - [a provider](#how-to-mock-a-provider)
  - [a module](#how-to-mock-a-module)
  - [an observable](#how-to-mock-an-observable)
  - [a form control](#how-to-mock-classic-and-reactive-form-components)

- [Extensive example](#extensive-example-of-mocking-in-angular-tests)

* [`MockBuilder` in details](#mockbuilder)
* [`MockRender` in details](#mockrender)
* [`MockInstance` in details](#mockinstance)
* [`ngMocks` in details](#ngmocks)
* [Helper functions](#helper-functions)

- [Usage with 3rd-party libraries](#usage-with-3rd-party-libraries)
- [Making tests faster](#making-angular-tests-faster)
- [Auto Spy](#auto-spy)

* [How to fix](#how-to-fix-an-error-in-angular-tests)
  - [`TypeError: Cannot read property 'subscribe' of undefined`](#how-to-fix-typeerror-cannot-read-property-subscribe-of-undefined)
  - [`Error: Type is part of the declarations of 2 modules`](#how-to-fix-error-type-is-part-of-the-declarations-of-2-modules)

- [How to test](#how-to-test-an-angular-application)
  - [a component](#how-to-test-a-component)
  - [a provider of a component](#how-to-test-a-provider-of-a-component)
  - [an attribute directive](#how-to-test-an-attribute-directive)
  - [a provider of a directive](#how-to-test-a-provider-of-a-directive)
  - [a structural directive](#how-to-test-a-structural-directive)
  - [a structural directive with a context](#how-to-test-a-structural-directive-with-a-context)
  - [a pipe](#how-to-test-a-pipe)
  - [ngOnChanges lifecycle hook](#how-to-test-ngonchanges-lifecycle-hook)
  - [a provider](#how-to-test-a-provider)
  - [a token](#how-to-test-a-token)
  - [a multi token](#how-to-test-a-multi-token)
  - [a route](#how-to-test-a-route)
  - [a routing guard](#how-to-test-a-routing-guard)
  - [a routing resolver](#how-to-test-a-routing-resolver)
  - [a http request](#how-to-test-a-http-request)
  - [a http interceptor](#how-to-test-a-http-interceptor)

---

## Install

For any Angular project you can use the latest version of the library.

NPM

> npm install ng-mocks --save-dev

Yarn

> yarn add ng-mocks --dev

---

## Motivation and easy start

Angular testing is fun and easy until you've met complex dependencies,
and setting up the `TestBed` becomes really annoying and time consuming.

`ngMocks` helps to bring fun and ease back allowing developers **to stub
and/or mock child components** and dependencies via a few lines of code with help of
[`MockComponent`](#how-to-mock-a-component),
[`MockDirective`](#how-to-mock-a-directive),
[`MockPipe`](#how-to-mock-a-pipe),
[`MockProvider`](#how-to-mock-a-provider),
[`MockModule`](#how-to-mock-a-module),
or with pro tools such as
[`MockBuilder`](#mockbuilder) with
[`MockRender`](#mockrender).

Let's imagine that in our Angular application we have a base component
and its template looks like that:

```html
<app-header [menu]="items">
  <app-search (search)="search($event)" [results]="search$ | async">
    <ng-template #item let-item>
      <strong>{{ item }}</strong>
    </ng-template>
  </app-search>
  {{ title | translate }}
</app-header>
<app-body appDark>
  <router-outlet></router-outlet>
</app-body>
<app-footer></app-footer>
```

This means that our base component depends on:
`AppHeaderComponent`,
`AppSearchComponent`,
`AppBodyComponent`,
`AppFooterComponent`,
`SearchService`,
`TranslatePipe`
etc.

We could easily test it with `schemas: [NO_ERRORS_SCHEMA]` and it would
work, but in this case we have zero guarantee, that our tests will fail
if an interface of a dependency has been changed and requires
code updates. Therefore, we have to avoid `NO_ERRORS_SCHEMA`.

However, it forces us putting all dependencies in the `TestBed` like that:

```typescript
TestBed.configureTestingModule({
  declarations: [
    AppBaseComponent, // <- the only declaration we care about.
    AppHeaderComponent,
    AppDarkDirective,
    TranslatePipe,
    // ...
  ],
  imports: [
    CommonModule,
    AppSearchModule,
    // ...
  ],
  providers: [
    LoginService,
    DataService,
    // ...
  ],
});
```

And... nobody knows which dependencies the dependencies have.
Although, we definitely know that we do not want to worry about them.

That's where `ngMocks` comes for help. Simply pass all the dependencies
into **helper functions to get their mocked copies** and to avoid a dependency hassle.

```typescript
TestBed.configureTestingModule({
  declarations: [
    AppBaseComponent, // <- the only declaration we care about.
    MockComponent(AppHeaderComponent),
    MockDirective(AppDarkDirective),
    MockPipe(TranslatePipe),
    // ...
  ],
  imports: [
    MockModule(CommonModule),
    MockModule(AppSearchModule),
    // ...
  ],
  providers: [
    MockProvider(LoginService),
    MockProvider(DataService),
    // ...
  ],
});
```

Profit. Now we can forget about noise of child dependencies.

Nevertheless, if we count lines of mocked declarations we see that
there are a lot of them, and looks like here might be dozens more for big
components. Also, what happens if someone deletes `AppSearchModule`
from `AppBaseModule`? Doesn't look like the test will fail due to
the missed dependency.

Right, we need a tool that would extract declarations of the module
`AppBaseComponent` belongs to, and mock them like the code above.
Then, if someone deletes `AppSearchModule` the test fails too.

[`ngMocks.guts`](#ngmocks) is the tool for that.
Its first parameter accepts things we want to test (avoid mocking) and
the second parameter accepts things we want to mock, if it is a module,
its declarations (guts) will be extracted and mocked except the things
from the first parameter, and the third parameter accepts things we want
to exclude at all from the final meta. Any parameter can be `null` if
we need to skip it, or an array if we want to pass several things there.

```typescript
const testModuleMeta = ngMocks.guts(AppBaseComponent, AppBaseModule);
// feel free to add extra stuff
// testModuleMeta.providers.push({
//   provide: SearchService,
//   useValue: SpiedSearchService,
// });
TestBed.configureTestingModule(testModuleMeta);
```

Profit, but what about lazy loaded modules?

If we have a lazy module, then it alone might be not sufficient, and
we need to add its parent module, for example `AppModule`.
In such a case, simply pass an array of modules as the second
parameter.

```typescript
TestBed.configureTestingModule(
  ngMocks.guts(
    AppBaseComponent, // <- is not touched
    [AppBaseModule, AppModule]
  )
);
```

Profit. That should be enough for the start.

The functions above help with an easy start, but they do not cover all
possible cases and do not provide tools for customizing behavior.
Consider reading [`MockBuilder`](#mockbuilder) and [`MockRender`](#mockrender)
if you want **to mock child dependencies like a pro** in your Angular tests.

For example, if we needed `TranslatePipe` to prefix its strings instead of
translating them, and to stub `SearchService` with an empty result that would not cause
an error during execution due to a missed observable in its mocked copy,
the code would look like:

```typescript
beforeEach(() =>
  MockBuilder(AppBaseComponent, AppBaseModule)
    .mock(TranslatePipe, v => `translated:${v}`)
    .mock(SearchService, {
      search: of([]),
    })
);
```

Profit. Subscribe, like, share! [to the top](#content).

Below more detailed documentation begins, please bear with us.

---

## How to mock dependencies in an Angular application

This section provides vast **information how to mock dependencies in angular** with real examples and detailed explanations
of all aspects might be useful in writing fully isolated unit tests.

- [mock a component](#how-to-mock-a-component)
- [mock a directive](#how-to-mock-a-directive)
- [mock a pipe](#how-to-mock-a-pipe)
- [mock a service](#how-to-mock-a-service)
- [mock a provider](#how-to-mock-a-provider)
- [mock a module](#how-to-mock-a-module)
- [mock an observable](#how-to-mock-an-observable)
- [mock a form control](#how-to-mock-classic-and-reactive-form-components)

---

### How to mock a component

There is a `MockComponent` function. It covers almost all needs for mocking behavior.

- `MockComponent( MyComponent )` - returns a mocked copy of `MyComponent` component.
- `MockComponents( MyComponent1, SomeComponent2, ... )` - returns an array of mocked components.

**A mocked copy of an angular component** respects its original component as
a type of `MockedComponent<T>` and provides:

- the same `selector`
- the same `Inputs` and `Outputs` with alias support
- templates are pure `ng-content` tags to allow transclusion
- supports `@ContentChild` with an `$implicit` context
  - `__render('id', $implicit, variables)` - renders a template
  - `__hide('id')` - hides a rendered template
- supports `FormsModule`, `ReactiveFormsModule` and `ControlValueAccessor`
  - `__simulateChange()` - calls `onChanged` on the mocked component bound to a `FormControl`
  - `__simulateTouch()` - calls `onTouched` on the mocked component bound to a `FormControl`
- supports `exportAs`

Let's pretend that in our Angular application `TargetComponent` depends on a child component of `DependencyComponent`
and we want to mock it in a test.

Usually `beforeEach` looks like:

```typescript
describe('Test', () => {
  let component: TargetComponent;
  let fixture: ComponentFixture<TargetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TargetComponent,
        DependencyComponent, // <- annoying dependency
      ],
    });

    fixture = TestBed.createComponent(TargetComponent);
    component = fixture.componentInstance;
  });
});
```

To **mock a child component** simply pass its class into `MockComponent`:

```typescript
TestBed.configureTestingModule({
  declarations: [
    TargetComponent,
    MockComponent(DependencyComponent), // <- profit
  ],
});
```

Or be like a pro and use [`MockBuilder`](#mockbuilder), its `.mock` method
and [`MockRender`](#mockrender):

```typescript
describe('Test', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent).mock(DependencyComponent)
  );

  it('should create', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.point.componentInstance).toBeDefined();
  });
});
```

<details><summary>Click to see <strong>an example of mocking components in Angular tests</strong></summary>
<p>

The source file is here:
[MockComponent](https://github.com/ike18t/ng-mocks/blob/master/examples/MockComponent/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/MockComponent/test.spec.ts)
to play with.

```typescript
describe('MockComponent', () => {
  beforeEach(() =>
    MockBuilder(TestedComponent).mock(DependencyComponent)
  );

  it('sends the correct value to the child input', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // The same as
    // fixture.debugElement.query(
    //   By.css('app-child')
    // ).componentInstance
    // but properly typed.
    const mockedComponent = ngMocks.find<DependencyComponent>(
      fixture,
      'app-child'
    ).componentInstance;

    // Let's pretend that DependencyComponent has 'someInput' as
    // an input. TestedComponent sets its value via
    // `[someInput]="value"`. The input's value will be passed into
    // the mocked component so you can assert on it.
    component.value = 'foo';
    fixture.detectChanges();

    // Thanks to ngMocks, this is type safe.
    expect(mockedComponent.someInput).toEqual('foo');
  });

  it('does something on an emit of the child component', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // The same as
    // fixture.debugElement.query(
    //   By.directive(DependencyComponent)
    // ).componentInstance
    // but properly typed.
    const mockedComponent = ngMocks.find(fixture, DependencyComponent)
      .componentInstance;

    // Again, let's pretend DependencyComponent has an output
    // called 'someOutput'. TestedComponent listens on the output via
    // `(someOutput)="trigger($event)"`.
    // Let's install a spy and trigger the output.
    spyOn(component, 'trigger');
    mockedComponent.someOutput.emit({
      payload: 'foo',
    });

    // Assert on the effect.
    expect(component.trigger).toHaveBeenCalledWith({
      payload: 'foo',
    });
  });

  it('renders something inside of the child component', () => {
    const localFixture = MockRender<DependencyComponent>(`
      <app-child>
        <p>inside content</p>
      </app-child>
    `);

    // We can access html directly asserting on some side effect.
    const mockedNgContent =
      localFixture.point.nativeElement.innerHTML;
    expect(mockedNgContent).toContain('<p>inside content</p>');
  });

  it('renders ContentChild of the child component', () => {
    const fixture = MockRender<DependencyComponent>(`
      <app-child>
        <ng-template #something>
          <p>inside template</p>
        </ng-template>
        <p>inside content</p>
      </app-child>
    `);

    // Injected ng-content rendered everything except templates.
    const mockedNgContent = fixture.point.nativeElement.innerHTML;
    expect(mockedNgContent).toContain('<p>inside content</p>');
    expect(mockedNgContent).not.toContain('<p>inside template</p>');

    // Let's render the template. First, we need to assert that
    // componentInstance is a MockedComponent<T> to access
    // its `__render` method. `isMockOf` function helps here.
    const mockedComponent = fixture.point.componentInstance;
    if (isMockOf(mockedComponent, DependencyComponent, 'c')) {
      mockedComponent.__render('something');
      fixture.detectChanges();
    }

    // The rendered template is wrapped by <div data-key="something">.
    // We can use this selector to assert exactly its content.
    const mockedNgTemplate = ngMocks.find(
      fixture.debugElement,
      '[data-key="something"]'
    ).nativeElement.innerHTML;
    expect(mockedNgTemplate).toContain('<p>inside template</p>');
  });
});
```

</p>
</details>

[to the top](#content)

---

### How to mock a directive

There is a `MockDirective` function covering almost all needs for mocking behavior.

- `MockDirective( MyDirective )` - returns a mocked copy of `MyDirective` directive.
- `MockDirectives( MyDirective1, MyDirective2, ... )` - returns an array of mocked directives.

**A mocked copy of an angular directive** respects its original directive as
a type of `MockedDirective<T>` and provides:

- the same `selector`
- the same `Inputs` and `Outputs` with alias support
- supports structural directives
  - `__render($implicit, variables)` - renders content
- supports `FormsModule`, `ReactiveFormsModule` and `ControlValueAccessor`
  - `__simulateChange()` - calls `onChanged` on the mocked component bound to a `FormControl`
  - `__simulateTouch()` - calls `onTouched` on the mocked component bound to a `FormControl`
- supports `exportAs`

Let's assume that an Angular application has `TargetComponent` that depends on a directive of `DependencyDirective` and
we need to mock it for facilitating unit tests.

Usually a test looks like:

```typescript
describe('Test', () => {
  let component: TargetComponent;
  let fixture: ComponentFixture<TargetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TargetComponent,
        DependencyDirective, // <- annoying dependency
      ],
    });

    fixture = TestBed.createComponent(TargetComponent);
    component = fixture.componentInstance;
  });
});
```

To **mock a child directive** simply pass its class into `MockDirective`:

```typescript
TestBed.configureTestingModule({
  declarations: [
    TargetComponent,
    MockDirective(DependencyDirective), // <- profit
  ],
});
```

Or be like a pro and use [`MockBuilder`](#mockbuilder), its `.mock` method
and [`MockRender`](#mockrender):

```typescript
describe('Test', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent).mock(DependencyDirective)
  );

  it('should create', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.point.componentInstance).toBeDefined();
  });
});
```

<details><summary>Click to see <strong>an example of mocking attribute directives in Angular tests</strong></summary>
<p>

The source file is here:
[MockDirective-Attribute](https://github.com/ike18t/ng-mocks/blob/master/examples/MockDirective-Attribute/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/MockDirective-Attribute/test.spec.ts)
to play with.

```typescript
describe('MockDirective', () => {
  beforeEach(() =>
    MockBuilder(TestedComponent).mock(DependencyDirective)
  );

  it('sends the correct value to the input', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // The same as
    // fixture.debugElement.query(
    //   By.css('span')
    // ).injector.get(DependencyDirective)
    // but easier and more precise.
    const mockedDirective = ngMocks.get(
      ngMocks.find(fixture.debugElement, 'span'),
      DependencyDirective
    );

    // Let's pretend DependencyDirective has 'someInput'
    // as an input. TestedComponent sets its value via
    // `[someInput]="value"`. The input's value will be passed into
    // the mocked directive so you can assert on it.
    component.value = 'foo';
    fixture.detectChanges();

    // Thanks to ngMocks, this is type safe.
    expect(mockedDirective.someInput).toEqual('foo');
  });

  it('does something on an emit of the child directive', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // The same as
    // fixture.debugElement.query(
    //   By.css('span')
    // ).injector.get(DependencyDirective)
    // but easier and more precise.
    const mockedDirective = ngMocks.get(
      ngMocks.find(fixture.debugElement, 'span'),
      DependencyDirective
    );

    // Again, let's pretend DependencyDirective has an output called
    // 'someOutput'. TestedComponent listens on the output via
    // `(someOutput)="trigger($event)"`.
    // Let's install a spy and trigger the output.
    spyOn(component, 'trigger');
    mockedDirective.someOutput.emit();

    // Assert on the effect.
    expect(component.trigger).toHaveBeenCalled();
  });
});
```

</p>
</details>

<details><summary>Click to see <strong>an example of mocking structural directives in Angular tests</strong></summary>
<p>

It's important to render a structural directive with the right context first,
if you want to assert on its nested elements.

The source file is here:
[MockDirective-Structural](https://github.com/ike18t/ng-mocks/blob/master/examples/MockDirective-Structural/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/MockDirective-Structural/test.spec.ts)
to play with.

```typescript
describe('MockDirective', () => {
  // IMPORTANT: by default structural directives are not rendered.
  // Because they might require a context which should be provided.
  // Usually a developer knows the context and can render it
  // manually with proper setup.
  beforeEach(() =>
    MockBuilder(TestedComponent).mock(DependencyDirective, {
      // render: true, // <-- a flag to render the directive by default
    })
  );

  it('renders content of the child structural directive', () => {
    const fixture = MockRender(TestedComponent);

    // Let's assert that nothing has been rendered inside of
    // the structural directive by default.
    expect(
      fixture.debugElement.nativeElement.innerHTML
    ).not.toContain('>content<');

    // And let's render it manually now.
    const mockedDirective = ngMocks.findInstance(
      fixture.debugElement,
      DependencyDirective
    );
    if (isMockOf(mockedDirective, DependencyDirective, 'd')) {
      mockedDirective.__render();
      fixture.detectChanges();
    }

    // The content of the structural directive should be rendered.
    expect(fixture.debugElement.nativeElement.innerHTML).toContain(
      '>content<'
    );
  });
});
```

</p>
</details>

[to the top](#content)

---

### How to mock a pipe

`MockPipe` is a function that mocks pipes for needs in Angular testing.

- `MockPipe( MyPipe )` - returns a mocked copy of `MyPipe` pipe that always returns `undefined`.
- `MockPipe( MyPipe, value => 'stub behavior' )` - returns a mocked copy of `MyPipe` pipe.
- `MockPipes( MyPipe1, MyPipe2, ... )` - returns an array of mocked pipes.

**A mocked copy of an angular pipe** respects its original pipe as
a type of `MockedPipe<T>` and provides:

- the same `name`
- ability to override the transform function with a type-safe function
- default transform is `() => undefined` to prevent problems with chaining

Let's imagine that in an Angular application `TargetComponent` depends on a pipe of `DependencyPipe` and
we would like to mock it in a test.

Usually a test looks like:

```typescript
describe('Test', () => {
  let component: TargetComponent;
  let fixture: ComponentFixture<TargetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TargetComponent,
        DependencyPipe, // <- annoying dependency
      ],
    });

    fixture = TestBed.createComponent(TargetComponent);
    component = fixture.componentInstance;
  });
});
```

To **mock a child pipe** simply pass its class into `MockPipe`:

```typescript
TestBed.configureTestingModule({
  declarations: [
    TargetComponent,
    MockPipe(DependencyPipe), // <- profit
  ],
});
```

Or if you want to be like a pro, use [`MockBuilder`](#mockbuilder), its `.mock` method
and call [`MockRender`](#mockrender):

```typescript
describe('Test', () => {
  beforeEach(() => MockBuilder(TargetComponent).mock(DependencyPipe));

  it('should create', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.point.componentInstance).toBeDefined();
  });
});
```

<details><summary>Click to see <strong>an example of mocking pipes in Angular tests</strong></summary>
<p>

The source file is here:
[MockPipe](https://github.com/ike18t/ng-mocks/blob/master/examples/MockPipe/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/MockPipe/test.spec.ts)
to play with.

```typescript
describe('MockPipe', () => {
  beforeEach(() =>
    MockBuilder(TestedComponent).mock(
      DependencyPipe,
      (...args: string[]) => JSON.stringify(args)
    )
  );

  it('transforms values to jsoin', () => {
    const fixture = MockRender(TestedComponent);

    const pipeElement = ngMocks.find(fixture.debugElement, 'span');
    expect(pipeElement.nativeElement.innerHTML).toEqual('["foo"]');
  });
});
```

</p>
</details>

[to the top](#content)

---

### How to mock a service

`ngMocks` provides a `MockService` function that tries its best
to facilitate creation of mocked copies of services.
It tends to avoid a hassle of providing customized mocked copies for huge services.
Simply pass a class into it and its result will be a mocked instance that respects the class,
but all methods and properties are customizable dummies.

- `MockService( MyService )` - returns a mocked instance of `MyService` class.
- `MockService( MyOb )` - returns a mocked clone of `MyOb` object.

**A mocked copy of an angular service** is based on its original class, and provides:

- all methods are dummies like `() => undefined`
- all properties have been linked via getters and setters <small>(might not work in some cases, use [`ngMocks.stub`](#ngmocks) then)</small>
- respects [auto spy](#auto-spy) environment

A class with dozens of methods, where we want to change behavior of
a single method, can be mocked like that:

```typescript
const instance = MockService(MyClass);
// instance.method() returns undefined
instance.method = () => 'My Custom Behavior';
```

It also supports objects. All properties that are not objects or functions will be omitted,
the functions will become dummy functions.

```typescript
const instance = MockService({
  nested: {
    prop: true,
    func: () => 'hello',
  },
});
// instance.nested.prop is undefined
// instance.nested.func() returns undefined
instance.nested.func = () => 'My Custom Behavior';
```

[to the top](#content)

---

### How to mock a provider

`MockProvider` might be useful If you want to stub a service or a token in providers.

- `MockProvider( MyService )` - creates a `useFactory` provider with `MockService(MyService)` under the hood.
- `MockProvider( MY_TOKEN_1 )` - creates a `useValue` provider that returns `undefined`.
- `MockProvider( MyService, {mocked: true} )` - creates a `useValue` provider that returns the passed value.
- `MockProvider( MY_TOKEN_1, 'fake' )` - creates a `useValue` provider that returns the passed value.
- `MockProviders( MyService1, MY_TOKEN_1, ... )` - returns an array of mocked services and tokens.

Now let's pretend that in an Angular application `TargetComponent` depends on a service of `DependencyService`,
and it should be mocked in favor of avoiding overhead.

Usually a test looks like:

```typescript
describe('Test', () => {
  let component: TargetComponent;
  let fixture: ComponentFixture<TargetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
      providers: [
        // Annoying dependencies.
        DependencyService,
        ObservableService,
      ],
    });

    fixture = TestBed.createComponent(TargetComponent);
    component = fixture.componentInstance;
  });
});
```

To **mock a service** simply pass its class into `MockProvider`:

```typescript
TestBed.configureTestingModule({
  declarations: [TargetComponent],
  providers: [
    // Profit.
    MockProvider(DependencyService),
    MockProvider(ObservableService, {
      prop$: EMPTY,
      getStream$: () => EMPTY,
    }),
  ],
});
```

Or, to be like a pro, use [`MockBuilder`](#mockbuilder), `.mock` method
and call [`MockRender`](#mockrender):

```typescript
describe('Test', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent)
      .mock(DependencyService)
      .mock(ObservableService, {
        prop$: EMPTY,
        getStream$: () => EMPTY,
      })
  );

  it('should create', () => {
    const fixture = MockRender(TargetComponent);
    expect(component).toBeDefined();
  });
});
```

**Please note**: The most common error developers meet, when they mock services, is "**TypeError: Cannot read property 'subscribe' of undefined**".
If you are encountering it too, please read a section called [How to fix `TypeError: Cannot read property 'subscribe' of undefined`](#how-to-fix-typeerror-cannot-read-property-subscribe-of-undefined).

<details><summary>Click to see <strong>an example of mocking providers in Angular tests</strong></summary>
<p>

The source file is here:
[MockProvider](https://github.com/ike18t/ng-mocks/blob/master/examples/MockProvider/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/MockProvider/test.spec.ts)
to play with.

```typescript
describe('MockProvider', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
      providers: [
        MockProvider(DependencyService),
        MockProvider(DEPENDENCY_TOKEN, 'mocked token'),
      ],
    }).compileComponents()
  );

  it('mocks providers', () => {
    const fixture = TestBed.createComponent(TargetComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).not.toContain('target');
    expect(fixture.nativeElement.innerHTML).toContain('mocked token');
  });
});
```

</p>
</details>

[to the top](#content)

---

### How to mock a module

There is a `MockModule` function covering almost all needs for mocking behavior.
**Mocking a module in Angular tests** with `ngMocks` is quite easy.
The library does it recursively for modules, and mocks all imports, exports and their declarations.

- `MockModule( MyModule )` - returns a mocked copy of `MyModule` module.
- `MockModule( MyModule.forRoots() )` - additionally to a mocked copy of `MyModule` module returns mocked providers.

**A mocked module** respects its original module as
a type of `MockedModule<T>` and provides:

- mocked copies of all components, directives, pipes and providers
- mocked copies of all imports and exports
- dummy clones of all services
- dummy abstract methods for services with a `useClass` definition
- mocked dummies of tokens with a `useClass` definition
- respect of tokens with a `useExisting` definition
- empty objects instead of tokens with a `useFactory` definition
- base primitives instead of tokens with a `useValue` definition
- mocked copies of tokens with a `useValue` definition

If you get an error like: "**Type is part of the declarations of 2 modules**",
then consider usage of [`MockBuilder`](#mockbuilder).
More detailed information about its cause and a solution you can read in a section called [How to fix `Type is part of the declarations of 2 modules`](#how-to-fix-error-type-is-part-of-the-declarations-of-2-modules).

Let's imagine an Angular application where `TargetComponent` depends on a module of `DependencyModule`
and we would like to mock in a test.

Usually `beforeEach` looks like:

```typescript
describe('Test', () => {
  let component: TargetComponent;
  let fixture: ComponentFixture<TargetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DependencyModule], // <- annoying dependency
      declarations: [TargetComponent],
    });

    fixture = TestBed.createComponent(TargetComponent);
    component = fixture.componentInstance;
  });
});
```

To **mock a module** simply pass its class into `MockModule`:

```typescript
TestBed.configureTestingModule({
  imports: [
    MockModule(DependencyModule), // <- profit
  ],
  declarations: [TargetComponent],
});
```

Or be like a pro and use [`MockBuilder`](#mockbuilder), its `.mock` method
and [`MockRender`](#mockrender):

```typescript
describe('Test', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent).mock(DependencyModule)
  );

  it('should create', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.point.componentInstance).toBeDefined();
  });
});
```

There is a trick to avoid specifying all dependencies of the `TargetComponent` in the chain:
simply pass its module as the second parameter of [`MockBuilder`](#mockbuilder).
Everything in `TargetModule` will be mocked, but not `TargetComponent`, it will stay as it is:

```typescript
beforeEach(() => MockBuilder(TargetComponent, TargetModule));
```

<details><summary>Click to see <strong>an example of mocking modules in Angular tests</strong></summary>
<p>

The source file is here:
[MockModule](https://github.com/ike18t/ng-mocks/blob/master/examples/MockModule/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/MockModule/test.spec.ts)
to play with.

```typescript
describe('MockModule', () => {
  beforeEach(() =>
    MockBuilder(TestedComponent).mock(DependencyModule)
  );

  it('renders TestedComponent with its dependencies', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    expect(component).toBeTruthy();
  });
});
```

</p>
</details>

[to the top](#content)

---

### How to mock an `Observable`

For example, if we have `TodoService.list$()`,
that returns a type of `Observable<Array<Todo>>`,
and a component,
that fetches the list in `OnInit` via `subscribe` method:

```typescript
class TodoComponent implements OnInit {
  public list: Observable<Array<Todo>>;

  constructor(protected service: TodoService) {}

  ngOnInit(): void {
    // Never do like that.
    // It is just for the demonstration purposes.
    this.service.list$().subscribe(list => (this.list = list));
  }
}
```

If we wanted to test the component, we would like to mock its dependencies. In our case it is `TodoService`.

```typescript
TestBed.configureTestingModule({
  declarations: [TodoComponent],
  providers: [MockProvider(TodoService)],
});
```

If we created a fixture, we would face an error about reading properties of `undefined`. This happens because a mocked copy of `TodoService.list$`
returns a spy, if [auto spy](#auto-spy) has been configured, or `undefined`. Therefore, neither has the `subscribe` property.

Obviously, to solve this, we need to get the method to return an observable stream.
For that, we could create a mocked copy via [`MockService`](#how-to-mock-a-service) and to pass it as the second parameter into [`MockProvider`](#how-to-mock-a-provider).

```typescript
const todoServiceMock = MockService(TodoService);
ngMocks.stub(todoServiceMock, {
  list$: () => EMPTY,
});

TestBed.configureTestingModule({
  declarations: [TodoComponent],
  providers: [MockProvider(TodoService, todoServiceMock)],
});
```

Profit, now initialization of the component with the mocked service does not throw the error anymore.

Nevertheless, usually, we want not only to stub the result with an `EMPTY` observable stream,
but also to provide a fake subject, that would simulate its calls.

A possible solution is to create a context variable of `Subject` type for that.

```typescript
let todoServiceList$: Subject<any>; // <- a context variable.

beforeEach(() => {
  todoServiceList$ = new Subject(); // <- create the subject.
  const todoServiceMock = MockService(TodoService);
  ngMocks.stub(todoServiceMock, {
    list$: () => todoServiceList$,
  });

  TestBed.configureTestingModule({
    declarations: [TodoComponent],
    providers: [MockProvider(TodoService, todoServiceMock)],
  });
});

it('test', () => {
  const fixture = TestBed.createComponent(TodoComponent);
  // Let's simulate emits.
  todoServiceList$.next([]);
  // Here we can do some assertions.
});
```

A solution for [`MockBuilder`](#mockbuilder) is quite similar.

```typescript
let todoServiceList$: Subject<any>; // <- a context variable.

beforeEach(() => {
  todoServiceList$ = new Subject(); // <- create the subject.
  const todoServiceMock = MockService(TodoService);
  ngMocks.stub(todoServiceMock, {
    list$: () => todoServiceList$,
  });

  return MockBuilder(TodoComponent).mock(
    TodoService,
    todoServiceMock
  );
});

it('test', () => {
  const fixture = MockRender(TodoComponent);
  todoServiceList$.next([]);
  // some assertions.
});
```

This all might be implemented with [`MockInstance`](#mockinstance) too,
but it goes beyond the topic.

<details><summary>Click to see <strong>an example of mocking an Observable in Angular tests</strong></summary>
<p>

The source file is here:
[MockObservable](https://github.com/ike18t/ng-mocks/blob/master/examples/MockObservable/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/MockObservable/test.spec.ts)
to play with.

```typescript
describe('MockObservable', () => {
  // Because we want to test the component, we pass it as the first
  // parameter of MockBuilder. To mock its dependencies we pass its
  // module as the second parameter.
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  // Now we need to customize the mocked copy of the service.
  // value$ is our access point to the stream.
  const value$: Subject<number[]> = new Subject();
  beforeAll(() => {
    // MockInstance helps to override mocked instances.
    MockInstance(TargetService, instance =>
      ngMocks.stub(instance, {
        value$, // even it is a read-only property we can override.
      })
    );
  });

  // Cleanup after tests.
  afterAll(() => {
    value$.complete();
    MockInstance(TargetService);
  });

  it('listens on emits of an injected subject', () => {
    // Let's render the component.
    const fixture = MockRender(TargetComponent);

    // We haven't emitted anything yet, let's check the template.
    expect(fixture.nativeElement.innerHTML).not.toContain('1');
    expect(fixture.nativeElement.innerHTML).not.toContain('2');
    expect(fixture.nativeElement.innerHTML).not.toContain('3');

    // Let's simulate an emit.
    value$.next([1, 2, 3]);
    fixture.detectChanges();

    // The template should contain the emitted numbers.
    expect(fixture.nativeElement.innerHTML).toContain('1');
    expect(fixture.nativeElement.innerHTML).toContain('2');
    expect(fixture.nativeElement.innerHTML).toContain('3');

    // Let's simulate an emit.
    value$.next([]);
    fixture.detectChanges();

    // The numbers should disappear.
    expect(fixture.nativeElement.innerHTML).not.toContain('1');
    expect(fixture.nativeElement.innerHTML).not.toContain('2');
    expect(fixture.nativeElement.innerHTML).not.toContain('3');
  });
});
```

</p>
</details>

[to the top](#content)

---

### How to mock classic and reactive form components

`ngMocks` respects `ControlValueAccessor` interface if a directive, or a component implements it.
Apart from that, `ngMocks` provides helper functions to cause changes and touches.

A mocked instance of `ControlValueAccessor` provides:

- `__simulateChange()` - calls `onChanged` on the mocked component bound to a `FormControl`
- `__simulateTouch()` - calls `onTouched` on the mocked component bound to a `FormControl`

<details><summary>Click to see <strong>an example of mocking Angular form with FormControl in tests</strong></summary>
<p>

The source file is here:
[MockReactiveForms](https://github.com/ike18t/ng-mocks/blob/master/examples/MockReactiveForms/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/MockReactiveForms/test.spec.ts)
to play with.

```typescript
describe('MockReactiveForms', () => {
  beforeEach(() =>
    MockBuilder(TestedComponent)
      .mock(DependencyComponent)
      .keep(ReactiveFormsModule)
  );

  it('sends the correct value to the mocked form component', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // Let's find the mocked form component.
    const mockedControl = ngMocks.find(
      fixture.debugElement,
      DependencyComponent
    ).componentInstance;

    // Let's simulate its change, like a user does it.
    if (isMockOf(mockedControl, DependencyComponent, 'c')) {
      mockedControl.__simulateChange('foo');
    }
    expect(component.formControl.value).toBe('foo');

    // Let's check that change on existing formControl
    // causes calls of `writeValue` on the mocked component.
    spyOn(mockedControl, 'writeValue');
    component.formControl.setValue('bar');
    expect(mockedControl.writeValue).toHaveBeenCalledWith('bar');
  });
});
```

</p>
</details>

<details><summary>Click to see <strong>an example of mocking Angular forms with ngModel in tests</strong></summary>
<p>

The source file is here:
[MockForms](https://github.com/ike18t/ng-mocks/blob/master/examples/MockForms/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/MockForms/test.spec.ts)
to play with.

```typescript
describe('MockForms', () => {
  beforeEach(() =>
    MockBuilder(TestedComponent)
      .mock(DependencyComponent)
      .keep(FormsModule)
  );

  it('sends the correct value to the mocked form component', async () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // Let's find the mocked form component.
    const mockedControl = ngMocks.find(
      fixture.debugElement,
      DependencyComponent
    ).componentInstance;

    // Let's simulate its change, like a user does it.
    if (isMockOf(mockedControl, DependencyComponent, 'c')) {
      mockedControl.__simulateChange('foo');
      fixture.detectChanges();
      await fixture.whenStable();
    }
    expect(component.value).toBe('foo');

    // Let's check that change on existing value
    // causes calls of `writeValue` on the mocked component.
    spyOn(mockedControl, 'writeValue');
    component.value = 'bar';
    fixture.detectChanges();
    await fixture.whenStable();
    expect(mockedControl.writeValue).toHaveBeenCalledWith('bar');
  });
});
```

</p>
</details>

[to the top](#content)

---

## Extensive example of mocking in Angular tests

The source file is here:
[MAIN](https://github.com/ike18t/ng-mocks/blob/master/examples/MAIN/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/MAIN/test.spec.ts)
to play with.

```typescript
import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Input,
  NgModule,
  Output,
  TemplateRef,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// Our main component that we want to test.
@Component({
  selector: 'app-root',
  template: `
    <app-header
      [showLogo]="true"
      [title]="title"
      (logo)="logoClick.emit()"
    >
      <ng-template #menu>
        <ul>
          <li><a [routerLink]="['/home']">Home</a></li>
          <li><a [routerLink]="['/about']">Home</a></li>
        </ul>
      </ng-template>
    </app-header>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {
  @Input() public title = 'My Application';

  @Output() public logoClick = new EventEmitter<void>();
}

// A dependency component that we want to mock with a respect
// of its inputs, outputs and ContentChild.
@Component({
  selector: 'app-header',
  template: `
    <a (click)="logo.emit()"
      ><img src="assets/logo.png" *ngIf="showLogo"
    /></a>
    {{ title }}
    <template [ngTemplateOutlet]="menu"></template>
  `,
})
export class AppHeaderComponent {
  @Input() public showLogo: boolean;
  @Input() public title: string;

  @Output() public logo: EventEmitter<void>;

  @ContentChild('menu', { read: false } as any)
  public menu: TemplateRef<ElementRef>;
}

// The module where our components are declared.
@NgModule({
  declarations: [AppComponent, AppHeaderComponent],
  imports: [CommonModule, RouterModule.forRoot([])],
})
export class AppModule {}

describe('MAIN', () => {
  // Usually we would have something like that.
  // beforeEach(() => {
  //   TestBed.configureTestingModule({
  //     imports: [
  //       CommonModule,
  //       RouterModule.forRoot([]),
  //     ],
  //     declarations: [AppComponent, AppHeaderComponent],
  //   });
  //
  //   fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  // });
  // But, usually, instead of AppHeaderComponent we want to have
  // a mocked copy.

  // With ngMocks it can be defined in the next way.
  beforeEach(() => {
    // AppComponent will stay as it is,
    // everything in AppModule will be mocked.
    return (
      MockBuilder(AppComponent, AppModule)
        // Adding a special config how to mock AppHeaderComponent.
        .mock(AppHeaderComponent, {
          render: {
            // #menu template will be rendered simultaneously
            // with mocked AppHeaderComponent.
            menu: true,
          },
        })
    );
    // the same as
    // TestBed.configureTestingModule({
    //   imports: [
    //     MockModule(CommonModule),
    //     MockModule(RouterModule.forRoot([])),
    //   ],
    //   declarations: [
    //     AppComponent, // <- not mocked
    //     MockComponent(AppHeaderComponent),
    //   ],
    // });
    // return testBed.compileComponents();
    //
    // of if we used ngMocks.guts
    // TestBed.configureTestingModule(ngMocks.guts(
    //   AppComponent, // <- not mocked
    //   AppModule,
    // ));
    // return testBed.compileComponents();
  });

  it('asserts behavior of AppComponent', () => {
    const logoClickSpy = jasmine.createSpy();
    // in case of jest
    // const logoClickSpy = jest.fn();

    // Instead of TestBed.createComponent(AppComponent) in beforeEach
    // MockRender might be used directly in tests.
    const fixture = MockRender(AppComponent, {
      title: 'Fake Application',
      logoClick: logoClickSpy,
    });
    // It creates a helper component
    // with the next template:
    // <app-root
    //   [title]="'Fake Application'"
    //   (logoClick)="logoClickSpy($event)"
    // ></app-root>
    // and renders it via TestBed.createComponent(HelperComponent).
    // AppComponent is accessible via fixture.point.

    // The same as fixture.debugElement.query(
    //   By.directive(AppHeaderComponent)
    // );
    // but typesafe and fails if nothing has been found.
    const header = ngMocks.find(
      fixture.debugElement,
      AppHeaderComponent
    );

    // Asserting how AppComponent uses AppHeaderComponent.
    expect(header.componentInstance.showLogo).toBe(true);
    expect(header.componentInstance.title).toBe('Fake Application');

    // Checking that AppComponents updates AppHeaderComponent.
    fixture.componentInstance.title = 'Updated Application';
    fixture.detectChanges();
    expect(header.componentInstance.title).toBe(
      'Updated Application'
    );

    // Checking that AppComponent listens on outputs of
    // AppHeaderComponent.
    expect(logoClickSpy).not.toHaveBeenCalled();
    header.componentInstance.logo.emit();
    expect(logoClickSpy).toHaveBeenCalled();

    // Asserting that AppComponent passes the right menu into
    // AppHeaderComponent.
    const links = ngMocks.findAll(header, 'a');
    expect(links.length).toBe(2);

    // An easy way to get a value of an input. The same as
    // links[0].injector.get(RouterLinkWithHref).routerLink
    expect(ngMocks.input(links[0], 'routerLink')).toEqual(['/home']);
    expect(ngMocks.input(links[1], 'routerLink')).toEqual(['/about']);
  });
});
```

Our tests:

- [sandbox on codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/e2e.ts)
- [examples from the doc](https://github.com/ike18t/ng-mocks/tree/master/examples)
- [current e2e tests](https://github.com/ike18t/ng-mocks/tree/master/tests)

[to the top](#content)

---

## Functions for easy mocking and rendering

The section provides information about essential functions for creating mocked environments
with minimum coding.

- [`MockBuilder`](#mockbuilder) - mocks declarations
- [`MockRender`](#mockrender) - renders customized templates
- [`MockInstance`](#mockinstance) - edits anything on an early stage
- [`ngMocks`](#ngmocks) - facilitates work with fixtures

---

### MockBuilder

`MockBuilder` is the simplest way to mock everything.
It provides a rich toolkit of functions to manipulate the mocked copies in the way your test requires,
but with minimum overhead.

Usually, we have something simple to test, but, time to time, the simplicity is killed by nightmarish dependencies.
The good thing here is that commonly the dependencies have been declared or imported in the same module, where our
tested thing is. Therefore, with help of `MockBuilder` we can quite easily define a testing module,
where everything in the module will be mocked except the tested thing: `MockBuilder( TheThing, ItsModule )`.

MockBuilder tends to provide **a simple instrument to mock Angular dependencies**, does it in isolated scopes,
and has a rich toolkit that supports:

- respect of internal vs external declarations (precise exports)
- detection and creation of mocked copies for root providers
- replacement of modules and declarations in any depth
- exclusion of modules, declarations and providers in any depth

* [Factory function](#mockbuilder-factory)
* [`.keep()`](#mockbuilderkeep)
* [`.mock()`](#mockbuildermock)
* [`.exclude()`](#mockbuilderexclude)
* [`.replace()`](#mockbuilderreplace)
* [`.provide()`](#mockbuilderprovide)
* [`export` flag](#mockbuilder-export-flag)
* [`exportAll` flag](#mockbuilder-exportall-flag)
* [`dependency` flag](#mockbuilder-dependency-flag)
* [`render` flag](#mockbuilder-render-flag)
* [`NG_MOCKS_GUARDS` token](#ng_mocks_guards-token)
* [`NG_MOCKS_INTERCEPTORS` token](#ng_mocks_interceptors-token)
* [`NG_MOCKS_ROOT_PROVIDERS` token](#ng_mocks_root_providers-token)
* [Good to know](#mockbuilder-good-to-know)

<details><summary>Click to see <strong>a code sample demonstrating ease of mocking in Angular tests</strong></summary>
<p>

The source file is here:
[MockBuilder](https://github.com/ike18t/ng-mocks/blob/master/examples/MockBuilder/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/MockBuilder/test.spec.ts)
to play with.

```typescript
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';

import { MyComponent } from './fixtures.components';
import { MyModule } from './fixtures.modules';

describe('MockBuilder:simple', () => {
  beforeEach(() => MockBuilder(MyComponent, MyModule));
  // The same as
  // beforeEach(() => TestBed.configureTestingModule({{
  //   imports: [MockModule(MyModule)],
  // }).compileComponents());
  // but MyComponent has not been mocked for the testing purposes.

  it('should render content ignoring all dependencies', () => {
    const fixture = MockRender(MyComponent);
    expect(fixture).toBeDefined();
    expect(fixture.debugElement.nativeElement.innerHTML).toContain(
      '<div>My Content</div>'
    );
  });
});
```

</p>
</details>

#### MockBuilder factory

```typescript
const ngModule = MockBuilder(MyComponent, MyModule).build();
```

The code above mocks everything in `MyModule` (imports, declarations, providers and exports), but keeps `MyComponent` as it is for testing purposes.
Actually, it does the next:

```typescript
const ngModule = MockBuilder()
  .keep(MyComponent, { export: true })
  .mock(MyModule, { exportAll: true })
  .build();
```

Also, you can suppress the first parameter with `null` if you want to mock only a class and export its declarations.

```typescript
const ngModule = MockBuilder(null, MyModule).build();
```

It does the next:

```typescript
const ngModule = MockBuilder()
  .mock(MyModule, { exportAll: true })
  .build();
```

If you do not plan further customization of `ngModule` then you do not need to call `.build()`. Simply return result of `MockBuilder` in `beforeEach`.

```typescript
beforeEach(() => MockBuilder(MyComponent, MyModule));
```

It does the next:

```typescript
beforeEach(() => {
  const ngModule = MockBuilder()
    .keep(MyComponent, { export: true })
    .mock(MyModule, { exportAll: true })
    .build();
  TestBed.configureTestingModule(ngModule);
  return TestBed.compileComponents();
});
```

#### MockBuilder.keep

If we want to keep a module, component, directive, pipe or provider as it is (not mocking). We should use `.keep`.

```typescript
beforeEach(() =>
  MockBuilder(MyComponent, MyModule)
    .keep(SomeModule)
    .keep(SomeModule.forSome())
    .keep(SomeModule.forAnother())
    .keep(SomeComponent)
    .keep(SomeDirective)
    .keep(SomePipe)
    .keep(SomeService)
    .keep(SomeInjectionToken)
);
```

#### MockBuilder.mock

If we want to mock something, even a part of a kept module we should use `.mock`.

```typescript
beforeEach(() =>
  MockBuilder(MyComponent, MyModule)
    .mock(SomeModule)
    .mock(SomeModule.forSome())
    .mock(SomeModule.forAnother())
    .mock(SomeComponent)
    .mock(SomeDirective)
    .mock(SomePipe)
    .mock(SomeService)
    .mock(SomeInjectionToken)
);
```

For pipes, we can set their handlers as the 2nd parameter of .mock.

```typescript
beforeEach(() =>
  MockBuilder(MyComponent, MyModule).mock(
    SomePipe,
    value => 'My Custom Content'
  )
);
```

For services and tokens, we can optionally provide their mocked values.
They are added as `useValue` in providers.

```typescript
beforeEach(() =>
  MockBuilder(MyComponent, MyModule)
    .mock(SomeService3, anything1)
    .mock(SOME_TOKEN, anything2)
);
```

#### MockBuilder.exclude

If we want to exclude something, even a part of a kept module we should use `.exclude`.

```typescript
beforeEach(() =>
  MockBuilder(MyComponent, MyModule)
    .exclude(SomeModule)
    .exclude(SomeComponent)
    .exclude(SomeDirective)
    .exclude(SomePipe)
    .exclude(SomeDependency)
    .exclude(SomeInjectionToken)
);
```

#### MockBuilder.replace

If we want to replace something with something, we should use `.replace`.
The replacement has to be decorated with the same decorator as the source.
It is not impossible to replace a provider / service, we should use [`.provide`](#mockbuilderprovide) or [`.mock`](#mockbuildermock) for that.

```typescript
beforeEach(() =>
  MockBuilder(MyComponent, MyModule)
    .replace(SomeModule, SomeOtherModule)
    .replace(SomeComponent, SomeOtherComponent)
    .replace(SomeDirective, SomeOtherDirective)
    .replace(SomePipe, SomeOtherPipe)
);
```

In case of `HttpClientTestingModule` you can use `.replace` too.

```typescript
beforeEach(() =>
  MockBuilder(MyComponent, MyModule).replace(
    HttpClientModule,
    HttpClientTestingModule
  )
);
```

In case of `RouterTestingModule` you need to use [`.keep`](#mockbuilderkeep) for both of the modules and to pass an empty array into `.withRoutes`.

```typescript
beforeEach(() =>
  MockBuilder(MyComponent, MyModule)
    .keep(RouterModule)
    .keep(RouterTestingModule.withRoutes([]))
);
```

#### MockBuilder.provide

If we want to add or replace providers / services we should use `.provide`. It has the same interface as a regular provider.

```typescript
beforeEach(() =>
  MockBuilder(MyComponent, MyModule)
    .provide(MyService)
    .provide([SomeService1, SomeService2])
    .provide({ provide: SomeComponent3, useValue: anything1 })
    .provide({ provide: SOME_TOKEN, useFactory: () => anything2 })
);
```

#### MockBuilder `export` flag

If we want to test a component, directive or pipe which, unfortunately, has not been exported,
then we need to mark it with the `export` flag.
Does not matter how deep it is. It will be exported to the level of `TestingModule`.

```typescript
beforeEach(() =>
  MockBuilder(MyComponent, MyModule)
    .keep(SomeDeclaration1, {
      export: true,
    })
    .mock(SomeDeclaration2, {
      export: true,
    })
);
```

#### MockBuilder `exportAll` flag

If we want to use all the declarations of a module which have not been exported,
we need to mark the module with the `exportAll` flag. Then all its imports and declarations will be exported.
If the module is nested, then add the [`export`](#mockbuilder-export-flag) flag beside `exportAll` too.

```typescript
beforeEach(() =>
  MockBuilder(MyComponent)
    .keep(MyModule, {
      exportAll: true,
    })
    .mock(MyNestedModule, {
      exportAll: true,
      export: true,
    })
);
```

#### MockBuilder `dependency` flag

By default, all definitions (kept and mocked) are added to the `TestingModule` if they are not a dependency of another definition.
Modules are added as imports to the `TestingModule`.
Components, Directive, Pipes are added as declarations to the `TestingModule`.
Tokens and Services are added as providers to the `TestingModule`.
If we do not want something to be added to the `TestingModule` at all, then we need to mark it with the `dependency` flag.

```typescript
beforeEach(() =>
  MockBuilder(MyComponent, MyModule)
    .keep(SomeModuleComponentDirectivePipeProvider1, {
      dependency: true,
    })
    .mock(SomeModuleComponentDirectivePipe, {
      dependency: true,
    })
    // Pass the same def as a mocked instance, if you want only to
    // specify the config.
    .mock(SomeProvider, SomeProvider, {
      dependency: true,
    })
    // Or provide a mocked instance together with the config.
    .mock(SomeProvider, mockedInstance, {
      dependency: true,
    })
    .replace(SomeModuleComponentDirectivePipeProvider1, anything1, {
      dependency: true,
    })
);
```

#### MockBuilder `render` flag

If we want to render a structural directive by default. Now we can do that via adding the `render` flag in its config.

```typescript
beforeEach(() =>
  MockBuilder(MyComponent, MyModule).mock(MyDirective, {
    render: true,
  })
);
```

If the directive has own context and variables. Then instead of setting `render` to true we can set the context.

```typescript
beforeEach(() =>
  MockBuilder(MyComponent, MyModule).mock(MyDirective, {
    render: {
      $implicit: something1,
      variables: { something2: something3 },
    },
  })
);
```

If we use `ContentChild` in a component, and we want to render it by default, we should use its id for that in the same way as for a mocked directive.

```typescript
beforeEach(() =>
  MockBuilder(MyComponent, MyModule).mock(MyComponent, {
    render: {
      blockId: true,
      blockWithContext: {
        $implicit: something1,
        variables: { something2: something3 },
      },
    },
  })
);
```

#### `NG_MOCKS_GUARDS` token

If we want to test guards we need to `.keep` them, but what should we do with other guards we do not want to care about at all?
The answer is to exclude `NG_MOCKS_GUARDS` token, it will **remove all the guards from routes** except the explicitly configured ones.

```typescript
beforeEach(() =>
  MockBuilder(MyGuard, MyModule).exclude(NG_MOCKS_GUARDS)
);
```

#### `NG_MOCKS_INTERCEPTORS` token

Usually, when we want to test an interceptor, we want to avoid influences of other interceptors.
To **remove all interceptors in an angular test** we need to exclude `NG_MOCKS_INTERCEPTORS` token,
then all interceptors will be excluded except the explicitly configured ones.

```typescript
beforeEach(() =>
  MockBuilder(MyInterceptor, MyModule).exclude(NG_MOCKS_INTERCEPTORS)
);
```

#### `NG_MOCKS_ROOT_PROVIDERS` token

There are root services and tokens apart from provided ones in Angular applications.
It might happen that in a test we want these providers to be mocked, or kept.

If we want to mock all root providers in an angular test we need to mock `NG_MOCKS_ROOT_PROVIDERS` token.

```typescript
beforeEach(() =>
  MockBuilder(
    MyComponentWithRootServices,
    MyModuleWithRootTokens
  ).mock(NG_MOCKS_ROOT_PROVIDERS)
);
```

In contrast to that, we might want to keep all root providers for mocked declarations.
For that, we need to keep `NG_MOCKS_ROOT_PROVIDERS` token.

```typescript
beforeEach(() =>
  MockBuilder(
    MyComponentWithRootServices,
    MyModuleWithRootTokens
  ).keep(NG_MOCKS_ROOT_PROVIDERS)
);
```

If we do not pass `NG_MOCKS_ROOT_PROVIDERS` anywhere,
then only root providers for kept modules will stay as they are.
All other root providers will be mocked, even for kept declarations of mocked modules.

#### MockBuilder good to know

Anytime we can change our decision. The last action on the same object wins. SomeModule will be mocked.

```typescript
beforeEach(() =>
  MockBuilder(MyComponent, MyModule)
    .keep(SomeModule)
    .mock(SomeModule)
    .keep(SomeModule)
    .mock(SomeModule)
);
```

[to the top](#content)

---

### MockRender

`MockRender` is a simple tool that helps with **shallow rendering in Angular tests**
when we want to assert `Inputs`, `Outputs`, `ChildContent` and custom templates.

The best thing about it is that `MockRender` properly triggers all lifecycle hooks,
and allows **to test `ngOnChanges` hook from `OnChanges` interface**.

**Please note**, that `MockRender(MyComponent)` is not assignable to
`ComponentFixture<MyComponent>`. You should use either

```typescript
MockedComponentFixture<MyComponent>
```

or

```typescript
ComponentFixture<
  DefaultRenderComponent<MyComponent>
>
```

It happens because `MockRender` generates an additional component to
render the desired thing and its interface differs.

It returns `MockedComponentFixture<T>` type. The difference is an additional `point` property.
The best thing about it is that `fixture.point.componentInstance` is typed to the component's class instead of `any`.

```typescript
const fixture = MockRender(ComponentToRender);
fixture.componentInstance; // is a middle component, mostly useless
fixture.point.componentInstance; // the thing we need
```

If you want, you can specify providers for the render passing them via the 3rd parameter.
It is useful when you want to mock system tokens / services such as `APP_INITIALIZER`, `DOCUMENT` etc.

```typescript
const fixture = MockRender(
  ComponentToRender,
  {},
  {
    providers: [
      SomeService,
      {
        provide: DOCUMENT,
        useValue: MockService(Document),
      },
    ],
  }
);
```

And do not forget to call `fixture.detectChanges()` and / or `await fixture.whenStable()` to reflect changes in
the render.

There is **an example how to render a custom template in an Angular tests** below.

The source file is here:
[MockRender](https://github.com/ike18t/ng-mocks/blob/master/examples/MockRender/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/MockRender/test.spec.ts)
to play with.

```typescript
describe('MockRender', () => {
  beforeEach(() => MockBuilder(TestedComponent, DependencyModule));

  it('renders template', () => {
    const spy = jasmine.createSpy();
    // in case of jest
    // const spy = jest.fn();

    const fixture = MockRender(
      `
        <tested
          (trigger)="myListener1($event)"
          [value1]="myParam1"
          value2="check"
        >
          <ng-template #header>
            something as ng-template
          </ng-template>
          something as ng-content
        </tested>
      `,
      {
        myListener1: spy,
        myParam1: 'something1',
      }
    );

    // ngMocks.input helps to get the current value of an input on
    // a related debugElement without knowing its owner.
    expect(ngMocks.input(fixture.point, 'value1')).toEqual(
      'something1'
    );
    expect(ngMocks.input(fixture.point, 'value2')).toEqual('check');

    // ngMocks.output does the same with outputs.
    ngMocks.output(fixture.point, 'trigger').emit('foo1');
    expect(spy).toHaveBeenCalledWith('foo1');
  });

  it('renders inputs and outputs automatically', () => {
    const spy = jasmine.createSpy();
    // Generates a template like:
    // <tested [value1]="value1" [value2]="value2"
    // (trigger)="trigger"></tested>.
    const fixture = MockRender(TestedComponent, {
      trigger: spy,
      value1: 'something2',
    });

    // Checking the inputs.
    expect(ngMocks.input(fixture.point, 'value1')).toEqual(
      'something2'
    );
    expect(ngMocks.input(fixture.point, 'value2')).toBeUndefined();

    // Checking the outputs.
    ngMocks.output(fixture.point, 'trigger').emit('foo2');
    expect(spy).toHaveBeenCalledWith('foo2');

    // checking that an updated value has been passed into
    // the testing component.
    fixture.componentInstance.value1 = 'updated';
    fixture.detectChanges();
    expect(ngMocks.input(fixture.point, 'value1')).toEqual('updated');
  });
});
```

[to the top](#content)

---

### MockInstance

`MockInstance` is useful when you want to configure spies of a declaration or a service before its render.
It supports: Modules, Components, Directives, Pipes and Services.

- `MockInstance( MyService, ( instance, injector ) => void)` - sets a callback to initialize an instance.
- `MockInstance( MyService, config: {init: Function} )` - sets a config, currently only `init` is supported, it is the callback.
- `MockInstance( MyService )` - removes initialization from the service.
- `MockReset()` - removes initialization from all services.

**Please note**

> that it works only for pure mocked copies without overrides.
> If you provide an own mocked copy via `useValue` or like `.mock(MyService, myMock)` then `MockInstance` does not have an effect.

You definitely need it when a test fails like:

- [TypeError: Cannot read property 'subscribe' of undefined](##how-to-fix-typeerror-cannot-read-property-subscribe-of-undefined)
- [TypeError: Cannot read property 'pipe' of undefined](#how-to-fix-typeerror-cannot-read-property-subscribe-of-undefined)
- or any other issue like reading properties or calling methods of undefined

Let's pretend a situation when our component uses `ViewChild` to access a child component instance.
Its property has `protected` visibility, therefore, we cannot access it easily.

```typescript
class RealComponent implements AfterViewInit {
  @ViewChild(ChildComponent) protected child: ChildComponent;

  ngAfterViewInit() {
    this.child.update$.subscribe();
  }
}
```

When we test `RealComponent` we would like to mock `ChildComponent`, and it would mean, if we mocked `ChildComponent` then its `update$` would be mocked to and would return `undefined`,
therefore our test would fail in `ngAfterViewInit` because of [`TypeError: Cannot read property 'subscribe' of undefined`](#how-to-fix-typeerror-cannot-read-property-subscribe-of-undefined).

If it was a service, we would use `providers` to set a properly mocked instance of the service.

```typescript
TestBed.configureTestingModule({
  declarations: [RealComponent],
  providers: [
    {
      provide: ChildService,
      useValue: {
        update$: EMPTY,
      },
    },
  ],
});
```

In our case, we have a component instance created by Angular, and does not look like `TestBed` provides
a solution here. That's where `ngMocks` helps again with `MockInstance` helper function.
It accepts a class as the first parameter, and a tiny callback describing how to mock its instances as the second one.

```typescript
beforeAll(() =>
  MockInstance(
    ChildComponent,
    (instance: ChildComponent, injector: Injector): void => {
      // Now you can customize a mocked instance of ChildComponent.
      // If you had used auto-spy then all its methods have been spied already
      // here.
      ngMocks.stub(instance, {
        update$: EMPTY,
      });
      // if you want you can use injector.get(SomeService) for more
      // complicated customization.
    }
  )
);
```

Profit. Now, when Angular creates an instance of `ChildComponent` the callback is called too and `update$` property
of the instance is an `Observable` instead of `undefined`.

_Good to know_: you might notice `ngMocks.stub` usage instead of `instance.update$ = EMPTY`. This has been made with intention to
show **how to mock `readonly` properties in Angular**.

After a test you can reset changes to avoid their influence in other tests via a call of
`MockInstance` without the second parameter or simply
`MockReset()` to reset all customizations.

```typescript
afterAll(() => MockInstance(ChildComponent)); // <- resets ChildComponent.
// afterAll(MockReset); // <- or this one to reset all MockInstances.
```

<details><summary>Click to see <strong>an example of mocking services before initialization in Angular tests</strong></summary>
<p>

The source file is here:
[MockInstance](https://github.com/ike18t/ng-mocks/blob/master/examples/MockInstance/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/MockInstance/test.spec.ts)
to play with.

```typescript
describe('MockInstance', () => {
  // A normal setup of the TestBed, TargetComponent will be mocked.
  beforeEach(() => MockBuilder(RealComponent).mock(ChildComponent));

  beforeAll(() => {
    // Because TargetComponent is mocked its update$ is undefined and
    // ngAfterViewInit of the parent component will fail on
    // .subscribe().
    // Let's fix it via defining customization for the mocked copy.
    MockInstance(ChildComponent, (instance, injector) => {
      const subject = new Subject<void>();
      subject.complete();
      ngMocks.stub(instance, {
        // comment the next line to check the failure.
        update$: subject,
      });
      // if you want you can use injector.get(Service) for more
      // complicated customization.
    });
  });

  // Do not forget to reset MockInstance back.
  afterAll(MockReset);

  it('should render', () => {
    // Without the custom initialization rendering would fail here
    // with "Cannot read property 'subscribe' of undefined".
    expect(() => MockRender(RealComponent)).not.toThrowError(
      /Cannot read property 'subscribe' of undefined/
    );
  });
});
```

</p>
</details>

[to the top](#content)

---

### ngMocks

`ngMocks` provides functions to get attribute and structural directives from an element, find components and mock objects.

- [`.guts()`](#ngmocksguts)
- [`.get()`](#ngmocksget)
- [`.findInstance()`](#ngmocksfindinstance)
- [`.findInstances()`](#ngmocksfindinstances)
- [`.find()`](#ngmocksfind)
- [`.findAll()`](#ngmocksfindall)
- [`.input()`](#ngmocksinput)
- [`.output()`](#ngmocksoutput)
- [`.stub()`](#ngmocksstub)
- [`.faster()`](#ngmocksfaster)
- [`.flushTestBed()`](#ngmocksflushtestbed)
- [`.reset()`](#ngmocksreset)

#### ngMocks.guts

Generates and returns metadata for `TestBed` module.

- `ngMocks.guts( TestingDeclaration, ItsModule )`
- `ngMocks.guts( [Thing1, Thing2], [ToMock1, ToMock2], [Skip1, Skip2] )`

The first parameter can be a declaration or an array of them we want to test.
The second parameter can be a declaration or an array of them we want to mock.
The third parameter can be a declaration or an array of them we want to exclude.
They support: Modules, Components, Directives, Pipes, Services and tokens.

If there is a module in the second parameter, then its guts will be mocked excluding things from the first parameter.
Any parameter might be `null` if we need to skip it.

```typescript
const ngModuleMeta = ngMocks.guts(Component, ItsModule);
```

```typescript
const ngModuleMeta = ngMocks.guts(
  [Component1, Component2, Service3],
  [ModuleToMock, DirectiveToMock, WhateverToMock],
  [ServiceToExclude, DirectiveToExclude]
);
```

```typescript
const ngModuleMeta = ngMocks.guts(
  null,
  ModuleToMock,
  ComponentToExclude
);
```

#### ngMocks.get

Returns an attribute or structural directive which belongs to the current element.

- `ngMocks.get( debugElement, directive, notFoundValue? )`

```typescript
const directive = ngMocks.get(fixture.debugElement, Directive);
```

#### ngMocks.findInstance

Returns the first found attribute or structural directive which belongs to the current element or its any child.

- `ngMocks.findInstance( debugElement, directive, notFoundValue? )`

```typescript
const directive = ngMocks.findInstance(
  fixture.debugElement,
  Directive
);
```

#### ngMocks.findInstances

Returns an array of all found attribute or structural directives which belong to the current element and all its children.

- `ngMocks.findInstances( debugElement, directive )`

```typescript
const directives = ngMocks.findInstances(
  fixture.debugElement,
  Directive
);
```

#### ngMocks.find

Returns a found DebugElement which belongs to a component with the correctly typed componentInstance,
or matches a css selector.

- `ngMocks.find( fixture, component, notFoundValue? )`
- `ngMocks.find( debugElement, component, notFoundValue? )`
- `ngMocks.find( debugElement, selector, notFoundValue? )`

```typescript
const element = ngMocks.find(fixture.debugElement, Component);
```

```typescript
const element = ngMocks.find(fixture.debugElement, 'div.container');
```

#### ngMocks.findAll

Returns an array of found DebugElements which belong to a component with the correctly typed componentInstance,
or match a css selector.

- `ngMocks.findAll( fixture, component )`
- `ngMocks.findAll( debugElement, component )`
- `ngMocks.findAll( debugElement, selector )`

```typescript
const elements = ngMocks.findAll(fixture.debugElement, Component);
```

```typescript
const elements = ngMocks.findAll(fixture.debugElement, 'div.item');
```

#### ngMocks.input

Returns value of an `input` of an element.
It avoids the issue of knowing the name of a component / directive the input belongs to.

- `ngMocks.input( debugElement, input, notFoundValue? )`

```typescript
const inputValue = ngMocks.input(debugElement, 'param1');
```

#### ngMocks.output

Returns an emitter of an `output` of an element.
It avoids the issue of knowing the name of a component / directive the output belongs to.

- `ngMocks.output( debugElement, output, notFoundValue? )`

```typescript
const outputEmitter = ngMocks.output(debugElement, 'update');
```

#### ngMocks.stub

In case if we want to mock methods / properties of a service.

- `ngMocks.stub( service, method )`
- `ngMocks.stub( service, methods )`
- `ngMocks.stub( service, property, 'get' | 'set' )`

Returns a mocked function / spy of the method. If the method has not been mocked yet - mocks it.

```typescript
const spy: Function = ngMocks.stub(instance, methodName);
```

Returns a mocked function / spy of the property. If the property has not been mocked yet - mocks it.

```typescript
const spyGet: Function = ngMocks.stub(instance, propertyName, 'get');
const spySet: Function = ngMocks.stub(instance, propertyName, 'set');
```

Or override properties and methods.

```typescript
ngMocks.stub(instance, {
  existingProperty: true,
  existingMethod: jasmine.createSpy(),
});
```

#### ngMocks.faster

`ngMocks.faster()` [optimizes setup](#making-angular-tests-faster) between tests in a suite.

#### ngMocks.flushTestBed

`ngMocks.flushTestBed()` flushes initialization of TestBed.

#### ngMocks.reset

`ngMocks.reset()` resets cache of [`ngMocks`](#ngmocks).

[to the top](#content)

---

### Helper functions

`ngMocks` provides several functions which help with **detection of mocked instances**.
For example, they are useful in situations when we want to render `ChildContent` of a mocked component, or to touch a
mocked form control.

- [isMockOf](#ismockof)
- [isMockedNgDefOf](#ismockedngdefof)
- [getMockedNgDefOf](#getmockedngdefof)
- [isNgDef](#isngdef)
- [getSourceOfMock](#getsourceofmock)
- [isNgInjectionToken](#isnginjectiontoken)

#### isMockOf

This function helps when we want to use mocked tools for rendering or change simulation,
but typescript doesn't recognize `instance` as a mocked instance.

You need it when you get an error like:

- Property '\_\_render' does not exist on type ...
- Property '\_\_simulateChange' does not exist on type ...

```typescript
if (isMockOf(instance, SomeClass, 'c')) {
  instance.__render('block');
  instance.__simulateChange(123);
}
```

- `isMockOf( inst, SomeClass, 'm' )` - checks whether `inst` is an instance of `MockedModule<SomeClass>`
- `isMockOf( inst, SomeClass, 'c' )` - checks whether `inst` is an instance of `MockedComponent<SomeClass>`
- `isMockOf( inst, SomeClass, 'd' )` - checks whether `inst` is an instance of `MockedDirective<SomeClass>`
- `isMockOf( inst, SomeClass, 'p' )` - checks whether `inst` is an instance of `MockedPipe<SomeClass>`
- `isMockOf( inst, SomeClass )` - checks whether `inst` is an inst of mocked `SomeClass`

#### isMockedNgDefOf

This function helps when we need to verify that a class is actually a mocked copy of a class.

- `isMockedNgDefOf( MockedClass, SomeClass, 'm' )` - checks whether `MockedClass` is a mocked copy of `SomeClass` and a module
- `isMockedNgDefOf( MockedClass, SomeClass, 'c' )` - checks whether `MockedClass` is a mocked copy of `SomeClass` and a component
- `isMockedNgDefOf( MockedClass, SomeClass, 'd' )` - checks whether `MockedClass` is a mocked copy of `SomeClass` and a directive
- `isMockedNgDefOf( MockedClass, SomeClass, 'p' )` - checks whether `MockedClass` is a mocked copy of `SomeClass` and a pipe
- `isMockedNgDefOf( MockedClass, SomeClass )` - checks whether `MockedClass` is a mocked copy of `SomeClass`

#### getMockedNgDefOf

This function helps when in a test we want to get a mocked copy of a class created in TestBed.

- `getMockedNgDefOf( SomeClass, 'm' )` - returns an existing `MockedModule<SomeClass>` of `SomeClass`
- `getMockedNgDefOf( SomeClass, 'c' )` - returns an existing `MockedComponent<SomeClass>` of `SomeClass`
- `getMockedNgDefOf( SomeClass, 'd' )` - returns an existing `MockedDirective<SomeClass>` of `SomeClass`
- `getMockedNgDefOf( SomeClass, 'p' )` - returns an existing `MockedPipe<SomeClass>` of `SomeClass`
- `getMockedNgDefOf( SomeClass )` - returns an existing mocked class of `SomeClass`

#### isNgDef

This function verifies how a class has been decorated.

- `isNgDef( SomeClass, 'm' )` - checks whether `SomeClass` is a module
- `isNgDef( SomeClass, 'c' )` - checks whether `SomeClass` is a component
- `isNgDef( SomeClass, 'd' )` - checks whether `SomeClass` is a directive
- `isNgDef( SomeClass, 'p' )` - checks whether `SomeClass` is a pipe
- `isNgDef( SomeClass )` - checks whether `SomeClass` is a module / component / directive / pipe.

#### getSourceOfMock

This function returns an origin of the mocked copy.

- `getSourceOfMock( MockedClass )` - returns the source class of `MockedClass`

#### isNgInjectionToken

This function verifies tokens.

- `isNgInjectionToken( TOKEN )` - checks whether `TOKEN` is a token

[to the top](#content)

---

### Usage with 3rd-party libraries

`ngMocks` provides flexibility via [`ngMocks.guts`](#ngmocks) and [`MockBuilder`](#mockbuilder)
that allows developers to use another **Angular testing libraries** for creation of `TestBed`,
and in the same time to **mock all dependencies** via `ngMocks`.

For example if we use `@ngneat/spectator` and its functions
like `createHostFactory`, `createComponentFactory`, `createDirectiveFactory` and so on,
then to mock everything properly we need:

- exclude the component we want to test
- mock its module
- export all declarations the module has

if we use [`ngMocks.guts`](#ngmocks) we need to skip the first parameter, pass the module
as the second parameter to export its declaration, and to pass the component as the third one to exclude it.

```typescript
const dependencies = ngMocks.guts(null, MyModule, MyComponent);
const createComponent = createComponentFactory({
  component: MyComponent,
  ...dependencies,
});
```

If we use [`MockBuilder`](#mockbuilder) we need `.exclude`, `.mock` and `exportAll` flag.

```typescript
const dependencies = MockBuilder()
  .exclude(MyComponent)
  .mock(MyModule, {
    exportAll: true,
  })
  .build();

const createComponent = createComponentFactory({
  component: MyComponent,
  ...dependencies,
});
```

Profit. Subscribe, like, share!

[to the top](#content)

---

### Making Angular tests faster

There is a `ngMocks.faster` feature that optimizes setup of similar test modules between tests
and reduces required time on their execution.

Imagine a situation when `beforeEach` creates the same setup used by dozens of `it`.
This is the case where `ngMocks.faster` might be useful, simply call it before `beforeEach` and
**the Angular tests will run faster**.

```typescript
describe('performance:correct', () => {
  ngMocks.faster(); // <-- add it before

  // The TestBed is not going to be changed between tests.
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).keep(TargetService)
  );

  it('...', () => {
    // ...
  });

  it('...', () => {
    // ...
  });

  // ...
});
```

If a test creates spies in `beforeEach` then this should be tuned,
because `ngMocks.faster` will detect this difference and display a notice.

A possible solution is usage of [MockInstance](#mockinstance) or to move creation of spies
outside of `beforeEach`.

<details><summary>Click to see <strong>an example of MockInstance</strong></summary>
<p>

```typescript
describe('beforeEach:mock-instance', () => {
  ngMocks.faster(); // <-- add it before

  // A normal setup of the TestBed, TargetService will be mocked.
  beforeEach(() => MockBuilder(TargetComponent).mock(TargetService));

  // Configuring behavior of the mocked TargetService.
  beforeAll(() => {
    MockInstance(TargetService, {
      init: instance => {
        instance.method = jasmine.createSpy().and.returnValue(5);
        // in case of jest
        // instance.method = jest.fn().mockReturnValue(5);
        instance.prop = 123;
      },
    });
  });

  // Do not forget to reset the spy between runs.
  afterAll(MockReset);
});
```

</p>
</details>

<details><summary>Click to see <strong>an example of optimizing spies in beforeEach</strong></summary>
<p>

```typescript
describe('beforeEach:manual-spy', () => {
  ngMocks.faster(); // <-- add it before

  // Creating a spy outside of `beforeEach` allows its pointer being
  // the same between tests and this let ngMocks.faster do its job.
  const mock = {
    method: jasmine.createSpy().and.returnValue(5),
    // in case of jest
    // method: jest.fn().mockReturnValue(5),
    prop: 123,
  };

  // Do not forget to reset the spy between runs.
  beforeEach(() => {
    mock.method.calls.reset();
    // in case of jest
    // mock.method = jest.fn().mockReturnValue(5);
    mock.prop = 123;
  });

  // A normal setup of the TestBed, TargetService will be mocked.
  beforeEach(() =>
    MockBuilder(TargetComponent).mock(TargetService, mock)
  );
});
```

</p>
</details>

[to the top](#content)

---

### Auto Spy

If you want **automatically spy all functions in Angular tests** then
add the next code to `src/test.ts`.

```typescript
import 'ng-mocks/dist/jasmine';

// uncomment in case if existing tests are with spies already.
// jasmine.getEnv().allowRespy(true);
```

In case of jest add it to `src/setupJest.ts`.

```typescript
import 'ng-mocks/dist/jest';
```

[to the top](#content)

---

## How to fix an error in Angular tests

We may encounter different unpleasant issues, when we mock declarations in testing environment.

There is a list of most common issues and their solutions below,
feel free to [contact us](#find-an-issue-or-have-a-question-or-a-request) if you are facing or struggling with them or anything else.

- [`TypeError: Cannot read property 'subscribe' of undefined`](#how-to-fix-typeerror-cannot-read-property-subscribe-of-undefined)
- [`Error: Type is part of the declarations of 2 modules`](#how-to-fix-error-type-is-part-of-the-declarations-of-2-modules)

---

### How to fix `TypeError: Cannot read property 'subscribe' of undefined`

This issue means that something has been mocked and returns a dummy result (`undefined`) instead of observable streams.

There is an answer for this error in the section called [How to mock an observable](#how-to-mock-an-observable),
if the error is triggered by a mocked service, and its property is of type of `undefined`.

Or you might check [`MockInstance`](#mockinstance) in case if the error has been caused by a mocked component or a mocked directive.

[to the top](#content)

---

### How to fix `Error: Type is part of the declarations of 2 modules`

If you encounter the issue, highly likely it means that a mocked declaration,
usually a mocked module, contains something, that is declared in the `TestBed` module directly.

Let's imagine a situation that we have a module which exports declarations, for example directives, we need in our test.
In the same time, we have another module that has another declarations, our component depends on,
but we would like to mock them, and it imports the same module we want to import in `TestBed`.

```typescript
TestBed.configureTestingModule({
  imports: [
    SharedModule,
    MockModule(ModuleWithServicesAndSharedModule),
  ],
  declarations: [ComponentToTest],
});
```

The problem is clear: when we mock the module, [`MockModule`](#how-to-mock-a-module) recursively mocks its dependencies, and, therefore, it creates a mocked copy of `SharedModule`.
Now imported and mocked declarations are part of 2 modules.

To solve this, we need to let [`MockModule`](#how-to-mock-a-module) know, that `SharedModule` should not be mocked.

There are good and bad news. Bad news is that [`MockModule`](#how-to-mock-a-module) does not support that, but good news is that `ngMocks` has [`MockBuilder`](#mockbuilder) for such a complicated case.
The only problem now is to rewrite `beforeEach` to use [`MockBuilder`](#mockbuilder) instead of [`MockModule`](#how-to-mock-a-module).
A possible solution might looks like:

```typescript
beforeEach(() =>
  MockBuilder(ComponentToTest)
    .keep(SharedModule)
    .mock(ModuleWithServicesAndSharedModule)
);
```

The configuration says that we want to test `ComponentToTest`, which depends on `SharedModule` and `ModuleWithServicesAndSharedModule`, but `SharedModule` should stay as it is.

Now, during the mocking process, [`MockBuilder`](#mockbuilder) will keep `SharedModule` as it is, although it is a dependency of the mocked module, and that avoids declarations of the same things in 2 modules.

More detailed information how to use it you can find in the section called [`MockBuilder`](#mockbuilder).

[to the top](#content)

---

## How to test an Angular application

The goal of this section is to demonstrate **comprehensive examples of angular unit tests**
covering almost all possible cases.

Should you not find an example you are interested in?
Just [contact us](#find-an-issue-or-have-a-question-or-a-request).

- [testing a component](#how-to-test-a-component)
- [testing a provider of a component](#how-to-test-a-provider-of-a-component)
- [testing an attribute directive](#how-to-test-an-attribute-directive)
- [testing a provider of a directive](#how-to-test-a-provider-of-a-directive)
- [testing a structural directive](#how-to-test-a-structural-directive)
- [testing a structural directive with a context](#how-to-test-a-structural-directive-with-a-context)
- [testing a pipe](#how-to-test-a-pipe)
- [testing ngOnChanges lifecycle hook](#how-to-test-ngonchanges-lifecycle-hook)
- [testing a provider](#how-to-test-a-provider)
- [testing a token](#how-to-test-a-token)
- [testing a multi token](#how-to-test-a-multi-token)
- [testing a route](#how-to-test-a-route)
- [testing a routing guard](#how-to-test-a-routing-guard)
- [testing a routing resolver](#how-to-test-a-routing-resolver)
- [testing a http request](#how-to-test-a-http-request)
- [testing a http interceptor](#how-to-test-a-http-interceptor)

---

### How to test a component

Please check [the extensive example](#extensive-example-of-mocking-in-angular-tests),
it covers all aspects of **testing components in angular applications**.

[to the top](#content)

---

### How to test a provider of a component

If we have a component with providers for testing, we need to mock everything
except the provider:

```typescript
beforeEach(() => MockBuilder(TargetService, TargetComponent));
```

This code will setup `TestBed` with a mocked copy of `TargetComponent`, but leave `TargetService` as it is,
so we would be able to assert it.

In the test we need to render the mocked component, find its element in the fixture and extract the service from the element.
If we use `MockRender` we can access the element of the component via `fixture.point`.

```typescript
const fixture = MockRender(TargetComponent);
const service = fixture.point.injector.get(TargetService);
```

Profit. Now we can assert behavior of the service.

A source file of this test is here:
[TestProviderInComponent](https://github.com/ike18t/ng-mocks/blob/master/examples/TestProviderInComponent/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/TestProviderInComponent/test.spec.ts)
to play with.

[to the top](#content)

---

### How to test an attribute directive

Attribute directives usually manipulate DOM, or mark a group of similar elements.
For a test, it means we need to render a custom template, where we use the directive, then we can assert its behavior.

Therefore, we should mock everything except the directive.
Or we can simply pass it alone if the directive does not have dependencies:

```typescript
beforeEach(() => MockBuilder(TargetDirective));
```

The next step is to render a custom template. Let's assume that the selector of the directive is `[target]`.
Now let's render it in a test:

```typescript
const fixture = MockRender(`<div target></div>`);
```

Because we use [`MockRender`](#mockrender) we know that the element with the directive can be accessed by
`fixture.point`.

Now we can cause events the directive listens on,
or to access its instance for further assertions:

```typescript
fixture.point.triggerEventHandler('mouseenter', null);
const instance = ngMocks.get(fixture.point, TargetDirective);
```

A source file of this test is here:
[TestAttributeDirective](https://github.com/ike18t/ng-mocks/blob/master/examples/TestAttributeDirective/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/TestAttributeDirective/test.spec.ts)
to play with.

[to the top](#content)

---

### How to test a provider of a directive

This test is quite similar to ["How to test a provider of a component"](#how-to-test-a-provider-of-a-component).
With difference that we need a bit different template.

Let's prepare `TestBed`: the service for testing is the first parameter, the directive is the second one:

```typescript
beforeEach(() => MockBuilder(TargetService, TargetDirective));
```

A custom template for the test could look like:

```typescript
const fixture = MockRender(`<div target></div>`);
```

Once we have the fixture we can extract the service from it and assert its behavior:

```typescript
const service = fixture.point.injector.get(TargetService);
```

A source file of this test is here:
[TestProviderInDirective](https://github.com/ike18t/ng-mocks/blob/master/examples/TestProviderInDirective/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/TestProviderInDirective/test.spec.ts)
to play with.

[to the top](#content)

---

### How to test a structural directive

Structural directives influence render of their child view, you definitely have used `*ngIf`, that's the thing.
Steps for testing are quite close to the steps for testing attribute directives: we need to render a custom template and
then to assert behavior of the directive.

Let's configure `TestBed`. The first parameter for [`MockBuilder`](#mockbuilder) is the directive itself,
and if it has dependencies we should pass its module as the second parameter:

```typescript
beforeEach(() => MockBuilder(TargetDirective));
```

The next step is to render a custom template. Let's assume that the selector of the directive is `[target]`.
Now let's render it in a test:

```typescript
const fixture = MockRender(
  `<div *target="value">
    content
  </div>`,
  {
    value: false,
  }
);
```

Let's assert that the content has not been rendered.

```typescript
expect(fixture.nativeElement.innerHTML).not.toContain('content');
```

With help of [`MockRender`](#mockrender) we can access the element of the directive via `fixture.point` to cause events on,
and we can change the `value` via `fixture.componentInstance.value`.

```typescript
fixture.componentInstance.value = true;
```

Because `value` is `true` now, the content should be rendered.

```typescript
fixture.detectChanges();
expect(fixture.nativeElement.innerHTML).toContain('content');
```

A source file of this test is here:
[TestStructuralDirective](https://github.com/ike18t/ng-mocks/blob/master/examples/TestStructuralDirective/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/TestStructuralDirective/test.spec.ts)
to play with.

[to the top](#content)

---

### How to test a structural directive with a context

If you did not read ["How to test a structural directive"](#how-to-test-a-structural-directive), please do it first.

The difference for structural directives with a context in terms of testing is that our custom template has variables.

```typescript
const fixture = MockRender(
  `<div *target="values; let value; let index = myIndex">
    {{index}}: {{ value }}
  </div>`,
  {
    values: ['hello', 'world'],
  }
);
```

This directive simulates behavior of `*ngFor`. We can do different assertions checking rendered html, and to verify how the
directive behaves when we are changing `values`:

```typescript
expect(fixture.nativeElement.innerHTML).toContain('0: hello');
expect(fixture.nativeElement.innerHTML).toContain('1: world');
```

```typescript
fixture.componentInstance.values = ['ngMocks'];
fixture.detectChanges();
expect(fixture.nativeElement.innerHTML).toContain('0: ngMocks');
expect(fixture.nativeElement.innerHTML).not.toContain('0: hello');
expect(fixture.nativeElement.innerHTML).not.toContain('1: world');
```

A source file of this test is here:
[TestStructuralDirectiveWithContext](https://github.com/ike18t/ng-mocks/blob/master/examples/TestStructuralDirectiveWithContext/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/TestStructuralDirectiveWithContext/test.spec.ts)
to play with.

[to the top](#content)

---

### How to test a pipe

An approach with testing pipes is similar to directives. We pass the pipe as the first parameter of [`MockBuilder`](#mockbuilder),
and its module with dependencies as the second one if they exist:

```typescript
beforeEach(() => MockBuilder(TargetPipe));
```

To verify how the pipe behaives we need to render a custom template:

```typescript
const fixture = MockRender(`{{ values | target}}`, {
  values: ['1', '3', '2'],
});
```

Now we can assert what has been rendered:

```typescript
expect(fixture.nativeElement.innerHTML).toEqual('1, 2, 3');
```

A source file of this test is here:
[TestPipe](https://github.com/ike18t/ng-mocks/blob/master/examples/TestPipe/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/TestPipe/test.spec.ts)
to play with.

[to the top](#content)

---

### How to test `ngOnChanges` lifecycle hook

`TestBed.createComponent` does not support `ngOnChanges` out of the box.
That is where [`MockRender`](#mockrender) might be helpful.

Simply use it instead of `TestBed.createComponent`.

```typescript
const fixture = MockRender(TargetComponent, {
  input: '',
});
// The hook has been already called here.
```

Changes of parameters will trigger the hook.

```typescript
fixture.componentInstance.input = 'change';
fixture.detectChanges(); // <- triggers the hook again.
// Here we can do desired assertions.
```

A source file of this test is here:
[TestLifecycleHooks](https://github.com/ike18t/ng-mocks/blob/master/examples/TestLifecycleHooks/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/TestLifecycleHooks/test.spec.ts)
to play with.

[to the top](#content)

---

### How to test a provider

Usually, you don't need `TestBed` if you want to test a simple
provider, the best way would be to write isolated pure unit tests.

Nevertheless, [`MockBuilder`](#mockbuilder) might help here too. If a provider has complex dependencies, or you want to verify
that its module creates the provider in a particular way, then simply pass the provider as the first parameter and its module as the second one.

```typescript
beforeEach(() => MockBuilder(TargetService, TargetModule));
```

In a test you need to use the global injector for getting an instance of the service to assert its behavior:

```typescript
const service = TestBed.get(TargetService);
expect(service.echo()).toEqual(service.value);
```

What might be useful here is knowledge of how to customize the dependencies.
There are 3 options: `.mock`, `.provide` and `MockInstance`. All of them are a good choice:

```typescript
beforeEach(() =>
  MockBuilder(TargetService, TargetModule)
    .mock(Service2, {
      trigger: () => 'mock2',
    })
    .provide({
      provide: Service3,
      useValue: {
        trigger: () => 'mock3',
      },
    })
);
```

```typescript
beforeAll(() => {
  MockInstance(Service1, {
    init: instance => {
      instance.trigger = () => 'mock1';
    },
  });
});
```

Despite the way providers are created: `useClass`, `useValue` etc.
Their tests are quite similar.

A source file of a test without dependencies is here:
[TestProvider](https://github.com/ike18t/ng-mocks/blob/master/examples/TestProvider/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/TestProvider/test.spec.ts)
to play with.

A source file of a test with dependencies is here:
[TestProviderWithDependencies](https://github.com/ike18t/ng-mocks/blob/master/examples/TestProviderWithDependencies/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/TestProviderWithDependencies/test.spec.ts)
to play with.

A source file of a test with `useClass` is here:
[TestProviderWithUseClass](https://github.com/ike18t/ng-mocks/blob/master/examples/TestProviderWithUseClass/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/TestProviderWithUseClass/test.spec.ts)
to play with.

A source file of a test with `useValue` is here:
[TestProviderWithUseValue](https://github.com/ike18t/ng-mocks/blob/master/examples/TestProviderWithUseValue/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/examples/TestProviderWithUseValue/test.spec.ts)
to play with.

A source file of a test with `useExisting` is here:
[TestProviderWithUseExisting](https://github.com/ike18t/ng-mocks/blob/master/examples/TestProviderWithUseExisting/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/TestProviderWithUseExisting/test.spec.ts)
to play with.

A source file of a test with `useFactory` is here:
[TestProviderWithUseFactory](https://github.com/ike18t/ng-mocks/blob/master/examples/TestProviderWithUseFactory/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/examples/TestProviderWithUseFactory/test.spec.ts)
to play with.

[to the top](#content)

---

### How to test a token

For proper testing of tokens in Angular application, we need extra declarations compare to their usage in the application.

Because a token might have a factory function, it is not always necessary to list the token in providers for successful execution of its application.
Unfortunately, for testing it is not like that, and in this case `ngMocks` cannot detect the token.
Please make sure, that the token and its dependencies are listed in providers of a related module, then `ngMocks` can mock them properly.

Configuration of `TestBed` should be done via `MockBuilder` where its first parameter is the token we want to test, and
the second parameter is its module.

```typescript
beforeEach(() => MockBuilder(TOKEN_EXISTING, TargetModule));
```

If you test a token with `useExisting` flag, then you need to keep in mind that the pointer will be mocked unless it has
been marked for being kept.

```typescript
beforeEach(() =>
  MockBuilder(TOKEN_EXISTING, TargetModule).keep(ServiceExisting)
);
```

In a test we need to fetch the token and assert its value.

```typescript
const token = TestBed.get(TOKEN_EXISTING);
expect(token).toEqual(jasmine.any(ServiceExisting));
```

A source file of this test is here:
[TestToken](https://github.com/ike18t/ng-mocks/blob/master/examples/TestToken/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/TestToken/test.spec.ts)
to play with.

[to the top](#content)

---

### How to test a multi token

If you did not read ["How to test a token"](#how-to-test-a-token), please do it first.

Testing multi tokens is quite similar with the difference that `TestBet.get` returns an array of all providers
matching the token.

```typescript
const values = TestBed.get(TOKEN_MULTI);
expect(values).toEqual(jasmine.any(Array));
expect(values.length).toEqual(4);
```

A source file of this test is here:
[TestMultiToken](https://github.com/ike18t/ng-mocks/blob/master/examples/TestMultiToken/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/TestMultiToken/test.spec.ts)
to play with.

[to the top](#content)

---

### How to test a route

Testing a route means that we want to assert that a specific page renders a specific component.

With `ngMocks` you can be confident, that a route exists and all its dependencies are present in the related module,
otherwise tests will fail.

However, to test that, we need to configure `TestBed` a bit differently: it is fine to mock all components and declarations,
we should only keep the `RouterModule` as it is, and to add `RouterTestingModule` with empty routes.
This guarantees that the application routes will be used, and tests fail if a route or its dependencies have been removed.

```typescript
beforeEach(() =>
  MockBuilder(RouterModule, TargetModule).keep(
    RouterTestingModule.withRoutes([])
  )
);
```

The next and very import step is to wrap a test callback in `it` with `fakeAsync` function and to render `RouterOutlet`.
We need this, because `RouterModule` relies on async zones.

```typescript
// fakeAsync --------------------------|||||||||
it('renders /1 with Target1Component', fakeAsync(() => {
  const fixture = MockRender(RouterOutlet);
}));
```

After we have rendered `RouterOutlet` we should initialize the router, also we can set the default url here.
As mentioned above, we should use zones and `fakeAsync` for that.

```typescript
const router = TestBed.get(Router);
const location = TestBed.get(Location);

location.go('/1');
if (fixture.ngZone) {
  fixture.ngZone.run(() => router.initialNavigation());
  tick();
}
```

Now we can assert the current route and what it has rendered.

```typescript
expect(location.path()).toEqual('/1');
expect(() => ngMocks.find(fixture, Target1Component)).not.toThrow();
```

That's it.

Additionally, we might assert that a link on a page navigates to the right route.
In this case, we should pass a component of the link as the first parameter to [`MockBuilder`](#mockbuilder),
to `.keep` `RouterModule` and to render the component instead of `RouterOutlet`.

```typescript
beforeEach(() =>
  MockBuilder(TargetComponent, TargetModule)
    .keep(RouterModule)
    .keep(RouterTestingModule.withRoutes([]))
);
```

```typescript
it('navigates between pages', fakeAsync(() => {
  const fixture = MockRender(TargetComponent);
}));
```

The next step is to find the link we want to click. The click event should be inside of zones, because it triggers navigation.
Please notice, that `button: 0` should be sent with the event to simulate the left button click.

```typescript
const links = ngMocks.findAll(fixture, 'a');
if (fixture.ngZone) {
  fixture.ngZone.run(() => {
    links[0].triggerEventHandler('click', {
      button: 0, // <- simulating the left button click, not right one.
    });
  });
  tick();
}
```

Now we can assert the current state: the location should be changed to the expected route, and the fixture should contain
its component.

```typescript
expect(location.path()).toEqual('/1');
expect(() => ngMocks.find(fixture, Target1Component)).not.toThrow();
```

A source file of these tests is here:
[TestRoute](https://github.com/ike18t/ng-mocks/blob/master/examples/TestRoute/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/TestRoute/test.spec.ts)
to play with.

[to the top](#content)

---

### How to test a routing guard

If you did not read ["How to test a route"](#how-to-test-a-route), please do it first.

To test a guard means that we need to mock everything except the guard and `RouterModule`.
But, what if we have several guards? If we mocked them they would block routes due to falsy returns of their mocked methods.
**To skip guards in angular tests `ngMocks` provides `NG_MOCKS_GUARDS` token**, we should pass it into `.exclude`, then all other guards will be
excluded from `TestBed` and we can be sure, that we are **testing only the guard we want**.

```typescript
beforeEach(() =>
  MockBuilder(LoginGuard, TargetModule)
    .exclude(NG_MOCKS_GUARDS)
    .keep(RouterModule)
    .keep(RouterTestingModule.withRoutes([]))
);
```

Let's assume that we have `LoginGuard` that redirects all routes to `/login` if a user is not logged in.
It means when we initialize the router we should end up on `/login`. So let's do that.

```typescript
if (fixture.ngZone) {
  fixture.ngZone.run(() => router.initialNavigation());
  tick();
}
```

Now we can assert the current state.

```typescript
expect(location.path()).toEqual('/login');
expect(() => ngMocks.find(fixture, LoginComponent)).not.toThrow();
```

A source file of this test is here:
[TestRoutingGuard](https://github.com/ike18t/ng-mocks/blob/master/examples/TestRoutingGuard/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/TestRoutingGuard/test.spec.ts)
to play with.

[to the top](#content)

---

### How to test a routing resolver

If you did not read ["How to test a route"](#how-to-test-a-route), please do it first.

When we want to test a resolver it means we need to mock everything except the resolver and `RouterModule`.
Optionally, we can disable guards to avoid influence of their mocked methods returning falsy values and blocking routes.

```typescript
beforeEach(() =>
  MockBuilder(DataResolver, TargetModule)
    .exclude(NG_MOCKS_GUARDS)
    .keep(RouterModule)
    .keep(RouterTestingModule.withRoutes([]))
);
```

To test the resolver we need to render `RouterOutlet`.

```typescript
const fixture = MockRender(RouterOutlet);
```

Additionally, we also need to properly customize mocked services if the resolver is using them to fetch data.

```typescript
const dataService = TestBed.get(DataService);

dataService.data = () => from([false]);
```

The next step is to go to the route where the resolver is, and to trigger initialization of the router.

```typescript
const location = TestBed.get(Location);
const router = TestBed.get(Router);

location.go('/target');
if (fixture.ngZone) {
  fixture.ngZone.run(() => router.initialNavigation());
  tick();
}
```

Because data is provided to a particular route, we need to find its component in the `fixture` and
to extract `ActivatedRoute` from its injector.
Let's pretend that `/target` renders `TargetComponent`.

```typescript
const el = ngMocks.find(fixture, TargetComponent);
const route: ActivatedRoute = el.injector.get(ActivatedRoute);
```

Profit, now we can assert the data the resolver has provided.

```typescript
expect(route.snapshot.data).toEqual({
  data: {
    flag: false,
  },
});
```

A source file of this test is here:
[TestRoutingResolver](https://github.com/ike18t/ng-mocks/blob/master/examples/TestRoutingResolver/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/TestRoutingResolver/test.spec.ts)
to play with.

[to the top](#content)

---

### How to test a http request

Testing a http request means that we want to cover a service or a declaration sending it. For that we need to keep the
thing as it is and to mock all its dependencies. The last important step is to replace `HttpClientModule`
with `HttpClientTestingModule` so we can use `HttpTestingController` for faking requests.

```typescript
beforeEach(() =>
  MockBuilder(TargetService, TargetModule).replace(
    HttpClientModule,
    HttpClientTestingModule
  )
);
```

Let's pretend that `TargetService` sends a simple GET request to `/data` and returns its result. To test it we need to
subscribe to the service and to write an expectation of the request.

```typescript
const service = TestBed.get(TargetService);
let actual: any;

service.fetch().subscribe(value => (actual = value));
```

```typescript
const httpMock = TestBed.get(HttpTestingController);

const req = httpMock.expectOne('/data');
expect(req.request.method).toEqual('GET');
req.flush([false, true, false]);
httpMock.verify();
```

Now we can assert the result the service returns.

```typescript
expect(actual).toEqual([false, true, false]);
```

A source file of this test is here:
[TestHttpRequest](https://github.com/ike18t/ng-mocks/blob/master/examples/TestHttpRequest/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/TestHttpRequest/test.spec.ts)
to play with.

[to the top](#content)

---

### How to test a http interceptor

To test an interceptor we need the interceptor itself and its module.
Please consider refactoring if the interceptor is defined by `useValue` or `useFactory`, whereas `useClass` and `useExisting` are supported.
The problem of `useValue` and `useFactory` is that it is quite hard to distinguish them to avoid influence of other interceptors
in `TestBed`.

We need to keep `HTTP_INTERCEPTORS` token, because the interceptor is defined by it.
But this cause that all other interceptors will be kept too, therefore, we need to get rid of them via excluding `NG_MOCKS_INTERCEPTORS` token.
The issue here is that if there are more interceptors, then their mocked copies will fail
with "You provided 'undefined' where a stream was expected." error.
And the last important step is to replace `HttpClientModule` with `HttpClientTestingModule`,
so we can use `HttpTestingController` for faking requests.

```typescript
beforeEach(() =>
  MockBuilder(TargetInterceptor, TargetModule)
    .exclude(NG_MOCKS_INTERCEPTORS)
    .keep(HTTP_INTERCEPTORS)
    .replace(HttpClientModule, HttpClientTestingModule)
);
```

Let's pretend that `TargetInterceptor` adds `My-Custom: HttpInterceptor` header to every request.
To test it we need to send a request via `HttpClient`.

```typescript
const client = TestBed.get(HttpClient);

client.get('/target').subscribe();
```

The next step is to write an expectation of the request.

```typescript
const req = httpMock.expectOne('/target');

req.flush('');
httpMock.verify();
```

Now we can assert the headers of the request.

```typescript
expect(req.request.headers.get('My-Custom')).toEqual(
  'HttpInterceptor'
);
```

A source file of this test is here:
[TestHttpInterceptor](https://github.com/ike18t/ng-mocks/blob/master/examples/TestHttpInterceptor/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/examples/TestHttpInterceptor/test.spec.ts)
to play with.

[to the top](#content)
