[![chat on gitter](https://badges.gitter.im/ng-mocks/community.svg)](https://gitter.im/ng-mocks/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![npm version](https://badge.fury.io/js/ng-mocks.svg)](https://badge.fury.io/js/ng-mocks)
[![build status](https://travis-ci.org/ike18t/ng-mocks.svg?branch=master)](https://travis-ci.org/ike18t/ng-mocks)
[![coverage status](https://coveralls.io/repos/github/ike18t/ng-mocks/badge.svg?branch=master)](https://coveralls.io/github/ike18t/ng-mocks?branch=master)
[![language grade](https://img.shields.io/lgtm/grade/javascript/g/ike18t/ng-mocks.svg?branch=master)](https://lgtm.com/projects/g/ike18t/ng-mocks)

# ng-mocks - ease of creating mock declarations out of annoying dependencies in Angular unit tests

`ng-mocks` is a library providing **helper functions for creating mock components, directives, pipes, modules and services in Angular**.
Whether you need a mock child component, or any other annoying dependency, `ng-mocks` has a tool to turn this declaration into its mock copy,
keeping its interface as it is, but suppressing its implementation.

The current version of the library has been tested and can be used with:

- Angular 5 (Jasmine, Jest, es5, es2015)
- Angular 6 (Jasmine, Jest, es5, es2015)
- Angular 7 (Jasmine, Jest, es5, es2015)
- Angular 8 (Jasmine, Jest, es5, es2015)
- Angular 9 (Jasmine, Jest, Ivy, es5, es2015)
- Angular 10 (Jasmine, Jest, Ivy, es5, es2015)
- Angular 11 (Jasmine, Jest, Ivy, es5, es2015)

There are preconfigured sandboxes on
[CodeSandbox](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/test.spec.ts)
and
[StackBlitz](https://stackblitz.com/github/ng-mocks/examples?file=src/test.spec.ts)
where you might check all the features. To focus on a particular one simply prefix it with `fdescribe` or `fit`.

There is a brief summary of the latest changes in [CHANGELOG](https://github.com/ike18t/ng-mocks/blob/master/CHANGELOG.md).

## Why use this?

Sure, you could flip a flag on schema errors to make your component dependencies not matter.
Or you could use `ng-mocks` to create mock declarations out of them, and have the ability to assert on their inputs or emit on an output to assert on a side effect.

### Find an issue or have a question or a request?

I'm open to contributions.

- [ask a question on gitter](https://gitter.im/ng-mocks/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
- [report it as an issue on github](https://github.com/ike18t/ng-mocks/issues)
- or submit a PR

## Table of contents

- [Motivation and easy start](#motivation-and-easy-start)
- [How to install](#install)

* [How to create](#how-to-create-mock-dependencies-in-an-angular-application)
  - [a mock component](#how-to-create-a-mock-component)
  - [a mock directive](#how-to-create-a-mock-directive)
  - [a mock pipe](#how-to-create-a-mock-pipe)
  - [a mock service](#how-to-create-a-mock-service)
  - [a mock provider](#how-to-create-a-mock-provider)
  - [a mock module](#how-to-create-a-mock-module)
  - [a mock observable](#how-to-create-a-mock-observable)
  - [a mock form control](#how-to-create-a-mock-form-control)

- [Extensive example](#extensive-example-of-mocks-in-angular-tests)

* [`MockBuilder` in details](#mockbuilder)
* [`MockRender` in details](#mockrender)
* [`MockInstance` in details](#mockinstance)
* [`ngMocks` in details](#ngmocks)
* [Helper functions](#helper-functions)

- [Usage with 3rd-party libraries](#usage-with-3rd-party-libraries)
- [Making tests faster](#making-angular-tests-faster)
- [Auto Spy](#auto-spy)

* [How to fix](https://ng-mocks.github.io/)
  - [`TypeError: Cannot read property 'subscribe' of undefined`](https://ng-mocks.github.io/how-to-fix-typeerror-cannot-read-property-subscribe-of-undefined.html)
  - [`Error: Type is part of the declarations of 2 modules`](https://ng-mocks.github.io/how-to-fix-error-type-is-part-of-the-declarations-of-2-modules.html)
  - [`Error: Directive has no selector, please add it!`](https://ng-mocks.github.io/how-to-fix-error-directive-has-no-selector-please-add-it.html)
  - [`Template parse errors: <component> is not a known element`](https://ng-mocks.github.io/how-to-fix-template-parse-errors-component-is-not-a-known-element.html)

- [How to test Angular application](https://ng-mocks.github.io/)
  - [testing a component](https://ng-mocks.github.io/how-to-test-a-component.html)
  - [testing a provider of a component](https://ng-mocks.github.io/how-to-test-a-provider-of-a-component.html)
  - [testing an attribute directive](https://ng-mocks.github.io/how-to-test-an-attribute-directive.html)
  - [testing a provider of a directive](https://ng-mocks.github.io/how-to-test-a-provider-of-a-directive.html)
  - [testing a structural directive](https://ng-mocks.github.io/how-to-test-a-structural-directive.html)
  - [testing a structural directive with a context](https://ng-mocks.github.io/how-to-test-a-structural-directive-with-a-context.html)
  - [testing a pipe](https://ng-mocks.github.io/how-to-test-a-pipe.html)
  - [testing ngOnChanges lifecycle hook](https://ng-mocks.github.io/how-to-test-ngonchanges-lifecycle-hook.html)
  - [testing a provider](https://ng-mocks.github.io/how-to-test-a-provider.html)
  - [testing a token](https://ng-mocks.github.io/how-to-test-a-token.html)
  - [testing a multi token](https://ng-mocks.github.io/how-to-test-a-multi-token.html)
  - [testing a route](https://ng-mocks.github.io/how-to-test-a-route.html)
  - [testing a routing guard](https://ng-mocks.github.io/how-to-test-a-routing-guard.html)
  - [testing a routing resolver](https://ng-mocks.github.io/how-to-test-a-routing-resolver.html)
  - [testing a http request](https://ng-mocks.github.io/how-to-test-a-http-request.html)
  - [testing a http interceptor](https://ng-mocks.github.io/how-to-test-a-http-interceptor.html)

---

## Motivation and easy start

Angular testing is fun and easy until you've met complex dependencies,
and setting up the `TestBed` becomes really annoying and time consuming.

`ng-mocks` helps to bring fun and ease back allowing developers
**to create mock child components** and stub dependencies via a few lines of code with help of
[`MockComponent`](#how-to-create-a-mock-component),
[`MockDirective`](#how-to-create-a-mock-directive),
[`MockPipe`](#how-to-create-a-mock-pipe),
[`MockProvider`](#how-to-create-a-mock-provider),
[`MockModule`](#how-to-create-a-mock-module),
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

We could easily test it with `schemas: [NO_ERRORS_SCHEMA]`
to avoid `Template parse errors: <component> is not a known element`,
and it would work, but in this case we have zero guarantee, that our tests will fail
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

That's where `ng-mocks` comes for help. Simply pass all the dependencies
into **helper functions to get their mock copies** and to avoid a dependency hassle.

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

Nevertheless, if we count lines of mock declarations we see that
there are a lot of them, and looks like here might be dozens more for big
components. Also, what happens if someone deletes `AppSearchModule`
from `AppBaseModule`? Doesn't look like the test will fail due to
the missed dependency.

Right, we need a tool that would extract declarations of the module
`AppBaseComponent` belongs to, and create mock copies out of them like the code above.
Then, if someone deletes `AppSearchModule` the test fails too.

[`ngMocks.guts`](#ngmocksguts) is the tool for that.
Its first parameter accepts things we want to test (avoid creation of mocks) and
the second parameter accepts things out of which we want to create mocks, if it is a module,
its declarations (guts) will be extracted for creation of their mock copies, except the things
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
    [AppBaseModule, AppModule],
  ),
);
```

Profit. That should be enough for the start.

The functions above help with an easy start, but they do not cover all
possible cases and do not provide tools for customizing behavior.
Consider reading [`MockBuilder`](#mockbuilder) and [`MockRender`](#mockrender)
if you want **to create mock child dependencies like a pro** in your Angular tests.

For example, if we needed `TranslatePipe` to prefix its strings instead of
translating them, and to create a stub `SearchService` with an empty result that would not cause
an error during execution due to a missed observable in its mock copy,
the code would look like:

```typescript
beforeEach(() =>
  MockBuilder(AppBaseComponent, AppBaseModule)
    .mock(TranslatePipe, v => `translated:${v}`)
    .mock(SearchService, {
      search: of([]),
    }),
);
```

Profit. Subscribe, like, share! [to the top](#table-of-contents).

Below more detailed documentation begins, please bear with us.

---

## Install

For any Angular project you can use the latest version of the library.

NPM

> npm install ng-mocks --save-dev

Yarn

> yarn add ng-mocks --dev

---

## How to create mock dependencies in an Angular application

This section provides vast **information how to create mock dependencies in angular** with real examples and detailed explanations
of all aspects might be useful in writing fully isolated unit tests.

- [a mock component](#how-to-create-a-mock-component)
- [a mock directive](#how-to-create-a-mock-directive)
- [a mock pipe](#how-to-create-a-mock-pipe)
- [a mock service](#how-to-create-a-mock-service)
- [a mock provider](#how-to-create-a-mock-provider)
- [a mock module](#how-to-create-a-mock-module)
- [a mock observable](#how-to-create-a-mock-observable)
- [a mock form control](#how-to-create-a-mock-form-control)

---

### How to create a mock component

There is a `MockComponent` function. It covers almost all needs for mock behavior.

- `MockComponent( MyComponent )` - returns a mock copy of `MyComponent` component.
- `MockComponents( MyComponent1, SomeComponent2, ... )` - returns an array of mock components.

**A mock component out of an angular component** respects its original component as
a type of `MockedComponent<T>` and provides:

- the same `selector`
- the same `Inputs` and `Outputs` with alias support
- templates are pure `ng-content` tags to allow transclusion
- supports `@ContentChild` with an `$implicit` context
  - `__render('id', $implicit, variables)` - renders a template
  - `__hide('id')` - hides a rendered template
- supports `FormsModule`, `ReactiveFormsModule` and `ControlValueAccessor`
  - `__simulateChange()` - calls `onChanged` on the mock component bound to a `FormControl`
  - `__simulateTouch()` - calls `onTouched` on the mock component bound to a `FormControl`
- supports `exportAs`

Let's pretend that in our Angular application `TargetComponent` depends on a child component of `DependencyComponent`
and we want to create a mock component out of it in a test.

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

To **create a mock child component** simply pass its class into `MockComponent`:

```typescript
TestBed.configureTestingModule({
  declarations: [
    TargetComponent,
    MockComponent(DependencyComponent), // <- profit
  ],
});
```

Or be like a pro and use [`MockBuilder`](#mockbuilder), its [`.mock`](#mockbuildermock) method
and [`MockRender`](#mockrender):

```typescript
describe('Test', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent).mock(DependencyComponent),
  );

  it('should create', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.point.componentInstance).toBeDefined();
  });
});
```

<details><summary>Click to see <strong>a usage example of mock components in Angular tests</strong></summary>
<p>

The source file is here:
[MockComponent](https://github.com/ike18t/ng-mocks/blob/master/examples/MockComponent/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/examples/MockComponent/test.spec.ts)
to play with.

```typescript
describe('MockComponent', () => {
  beforeEach(() =>
    MockBuilder(TestedComponent).mock(DependencyComponent),
  );

  it('sends the correct value to the child input', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // The same as
    // fixture.debugElement.query(
    //   By.css('app-child')
    // ).componentInstance
    // but properly typed.
    const mockComponent = ngMocks.find<DependencyComponent>(
      fixture,
      'app-child',
    ).componentInstance;

    // Let's pretend that DependencyComponent has 'someInput' as
    // an input. TestedComponent sets its value via
    // `[someInput]="value"`. The input's value will be passed into
    // the mock component so you can assert on it.
    component.value = 'foo';
    fixture.detectChanges();

    // Thanks to ng-mocks, this is type safe.
    expect(mockComponent.someInput).toEqual('foo');
  });

  it('does something on an emit of the child component', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // The same as
    // fixture.debugElement.query(
    //   By.directive(DependencyComponent)
    // ).componentInstance
    // but properly typed.
    const mockComponent = ngMocks.find(fixture, DependencyComponent)
      .componentInstance;

    // Again, let's pretend DependencyComponent has an output
    // called 'someOutput'. TestedComponent listens on the output via
    // `(someOutput)="trigger($event)"`.
    // Let's install a spy and trigger the output.
    spyOn(component, 'trigger');
    mockComponent.someOutput.emit({
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
    const mockNgContent = localFixture.point.nativeElement.innerHTML;
    expect(mockNgContent).toContain('<p>inside content</p>');
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
    const mockNgContent = fixture.point.nativeElement.innerHTML;
    expect(mockNgContent).toContain('<p>inside content</p>');
    expect(mockNgContent).not.toContain('<p>inside template</p>');

    // Let's render the template. First, we need to assert that
    // componentInstance is a MockedComponent<T> to access
    // its `__render` method. `isMockOf` function helps here.
    const mockComponent = fixture.point.componentInstance;
    if (isMockOf(mockComponent, DependencyComponent, 'c')) {
      mockComponent.__render('something');
      fixture.detectChanges();
    }

    // The rendered template is wrapped by <div data-key="something">.
    // We can use this selector to assert exactly its content.
    const mockNgTemplate = ngMocks.find(
      fixture.debugElement,
      '[data-key="something"]',
    ).nativeElement.innerHTML;
    expect(mockNgTemplate).toContain('<p>inside template</p>');
  });
});
```

</p>
</details>

[to the top](#table-of-contents)

---

### How to create a mock directive

There is a `MockDirective` function covering almost all needs for mock behavior.

- `MockDirective( MyDirective )` - returns a mock copy of `MyDirective` directive.
- `MockDirectives( MyDirective1, MyDirective2, ... )` - returns an array of mock directives.

**a mock directive out of an angular directive** respects its original directive as
a type of `MockedDirective<T>` and provides:

- the same `selector`
- the same `Inputs` and `Outputs` with alias support
- supports structural directives
  - `__render($implicit, variables)` - renders content
- supports `FormsModule`, `ReactiveFormsModule` and `ControlValueAccessor`
  - `__simulateChange()` - calls `onChanged` on the mock component bound to a `FormControl`
  - `__simulateTouch()` - calls `onTouched` on the mock component bound to a `FormControl`
- supports `exportAs`

Let's assume that an Angular application has `TargetComponent` that depends on a directive of `DependencyDirective` and
we need to create a mock directive out of it for facilitating unit tests.

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

To **create a mock child directive** simply pass its class into `MockDirective`:

```typescript
TestBed.configureTestingModule({
  declarations: [
    TargetComponent,
    MockDirective(DependencyDirective), // <- profit
  ],
});
```

Or be like a pro and use [`MockBuilder`](#mockbuilder), its [`.mock`](#mockbuildermock) method
and [`MockRender`](#mockrender):

```typescript
describe('Test', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent).mock(DependencyDirective),
  );

  it('should create', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.point.componentInstance).toBeDefined();
  });
});
```

<details><summary>Click to see <strong>a usage example of mock attribute directives in Angular tests</strong></summary>
<p>

The source file is here:
[MockDirective-Attribute](https://github.com/ike18t/ng-mocks/blob/master/examples/MockDirective-Attribute/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/examples/MockDirective-Attribute/test.spec.ts)
to play with.

```typescript
describe('MockDirective:Attribute', () => {
  beforeEach(() =>
    MockBuilder(TestedComponent).mock(DependencyDirective),
  );

  it('sends the correct value to the input', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // The same as
    // fixture.debugElement.query(
    //   By.css('span')
    // ).injector.get(DependencyDirective)
    // but easier and more precise.
    const mockDirective = ngMocks.get(
      ngMocks.find(fixture.debugElement, 'span'),
      DependencyDirective,
    );

    // Let's pretend DependencyDirective has 'someInput'
    // as an input. TestedComponent sets its value via
    // `[someInput]="value"`. The input's value will be passed into
    // the mock directive so you can assert on it.
    component.value = 'foo';
    fixture.detectChanges();

    // Thanks to ng-mocks, this is type safe.
    expect(mockDirective.someInput).toEqual('foo');
  });

  it('does something on an emit of the child directive', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // The same as
    // fixture.debugElement.query(
    //   By.css('span')
    // ).injector.get(DependencyDirective)
    // but easier and more precise.
    const mockDirective = ngMocks.get(
      ngMocks.find(fixture.debugElement, 'span'),
      DependencyDirective,
    );

    // Again, let's pretend DependencyDirective has an output called
    // 'someOutput'. TestedComponent listens on the output via
    // `(someOutput)="trigger($event)"`.
    // Let's install a spy and trigger the output.
    spyOn(component, 'trigger');
    mockDirective.someOutput.emit();

    // Assert on the effect.
    expect(component.trigger).toHaveBeenCalled();
  });
});
```

</p>
</details>

<details><summary>Click to see <strong>a usage example of mock structural directives in Angular tests</strong></summary>
<p>

It's important to render a structural directive with the right context first,
if you want to assert on its nested elements.

The source file is here:
[MockDirective-Structural](https://github.com/ike18t/ng-mocks/blob/master/examples/MockDirective-Structural/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/examples/MockDirective-Structural/test.spec.ts)
to play with.

```typescript
describe('MockDirective:Structural', () => {
  // IMPORTANT: by default structural directives are not rendered.
  // Because they might require a context which should be provided.
  // Usually a developer knows the context and can render it
  // manually with proper setup.
  beforeEach(() =>
    MockBuilder(TestedComponent).mock(DependencyDirective, {
      // render: true, // <-- a flag to render the directive by default
    }),
  );

  it('renders content of the child structural directive', () => {
    const fixture = MockRender(TestedComponent);

    // Let's assert that nothing has been rendered inside of
    // the structural directive by default.
    expect(
      fixture.debugElement.nativeElement.innerHTML,
    ).not.toContain('>content<');

    // And let's render it manually now.
    const mockDirective = ngMocks.findInstance(
      fixture.debugElement,
      DependencyDirective,
    );
    if (isMockOf(mockDirective, DependencyDirective, 'd')) {
      mockDirective.__render();
      fixture.detectChanges();
    }

    // The content of the structural directive should be rendered.
    expect(fixture.debugElement.nativeElement.innerHTML).toContain(
      '>content<',
    );
  });
});
```

</p>
</details>

[to the top](#table-of-contents)

---

### How to create a mock pipe

`MockPipe` is a function that creates mock pipes for needs in Angular testing.

- `MockPipe( MyPipe )` - returns a mock copy of `MyPipe` pipe that always returns `undefined`.
- `MockPipe( MyPipe, value => 'stub behavior' )` - returns a mock copy of `MyPipe` pipe.
- `MockPipes( MyPipe1, MyPipe2, ... )` - returns an array of mock pipes.

**A mock pipe out of an angular pipe** respects its original pipe as
a type of `MockedPipe<T>` and provides:

- the same `name`
- ability to override the transform function with a type-safe function
- default transform is `() => undefined` to prevent problems with chaining

Let's imagine that in an Angular application `TargetComponent` depends on a pipe of `DependencyPipe` and
we would like to create a mock pipe out of it in a test.

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

To **create a mock child pipe** simply pass its class into `MockPipe`:

```typescript
TestBed.configureTestingModule({
  declarations: [
    TargetComponent,
    MockPipe(DependencyPipe), // <- profit
  ],
});
```

Or if you want to be like a pro, use [`MockBuilder`](#mockbuilder), its [`.mock`](#mockbuildermock) method
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

<details><summary>Click to see <strong>a usage example of mock pipes in Angular tests</strong></summary>
<p>

The source file is here:
[MockPipe](https://github.com/ike18t/ng-mocks/blob/master/examples/MockPipe/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/examples/MockPipe/test.spec.ts)
to play with.

```typescript
describe('MockPipe', () => {
  beforeEach(() =>
    MockBuilder(TestedComponent).mock(
      DependencyPipe,
      (...args: string[]) => JSON.stringify(args),
    ),
  );

  it('transforms values to json', () => {
    const fixture = MockRender(TestedComponent);

    const pipeElement = ngMocks.find(fixture.debugElement, 'span');
    expect(pipeElement.nativeElement.innerHTML).toEqual('["foo"]');
  });
});
```

</p>
</details>

[to the top](#table-of-contents)

---

### How to create a mock service

`ng-mocks` provides a `MockService` function that tries its best
to facilitate creation of mock copies of services.
It tends to avoid a hassle of providing customized mock copies for huge services.
Simply pass a class into it and its result will be a mock instance that respects the class,
but all methods and properties are customizable dummies.

- `MockService( MyService, overrides? )` - returns a mock instance of `MyService` class.
- `MockService( MyOb )` - returns a mock clone of `MyOb` object.

**A mock instance out of an angular service** is based on its original class, and provides:

- all methods are dummies like `() => undefined`
- all properties have been linked via getters and setters <small>(might not work in some cases, use [`ngMocks.stub`](#ngmocks) then)</small>
- respects [auto spy](#auto-spy) environment

A class with dozens of methods, where we want to change behavior of
a single method, can be handled like that:

```typescript
const instance = MockService(MyClass);
// instance.method() returns undefined
instance.method = () => 'My Custom Behavior';
```

```typescript
const instance = MockService(MyClass, {
  method: () => 'My Custom Behavior',
});
// instance.method() returns 'My Custom Behavior'
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

[to the top](#table-of-contents)

---

### How to create a mock provider

`MockProvider` might be useful If you want to create a stub service or a stub token in providers.

- `MockProvider( MyService, overrides? )` - creates a factory provider with `MockService(MyService)` under the hood.
- `MockProvider( MY_TOKEN_1, useValue? )` - creates a factory provider that returns `undefined`.
- `MockProvider( MyService, {mock: true} )` - creates a factory provider that extends the mock with the passed value.
- `MockProvider( MY_TOKEN_1, 'fake' )` - creates a factory provider that returns the passed value.
- `MockProviders( MyService1, MY_TOKEN_1, ... )` - returns an array of mock services and tokens.

Now let's pretend that in an Angular application `TargetComponent` depends on a service of `DependencyService`,
and its mock copy should be used in favor of avoiding overhead.

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

To **create a mock service** simply pass its class into `MockProvider`:

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

Or, to be like a pro, use [`MockBuilder`](#mockbuilder), [`.mock`](#mockbuildermock) method
and call [`MockRender`](#mockrender):

```typescript
describe('Test', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent)
      .mock(DependencyService)
      .mock(ObservableService, {
        prop$: EMPTY,
        getStream$: () => EMPTY,
      }),
  );

  it('should create', () => {
    const fixture = MockRender(TargetComponent);
    expect(component).toBeDefined();
  });
});
```

**Please note**: The most common error developers meet, when they create mock services, is "**TypeError: Cannot read property 'subscribe' of undefined**".
If you are encountering it too, please read a section called [How to fix `TypeError: Cannot read property 'subscribe' of undefined`](https://ng-mocks.github.io/how-to-fix-typeerror-cannot-read-property-subscribe-of-undefined.html).

<details><summary>Click to see <strong>a usage example of mock providers in Angular tests</strong></summary>
<p>

The source file is here:
[MockProvider](https://github.com/ike18t/ng-mocks/blob/master/examples/MockProvider/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/examples/MockProvider/test.spec.ts)
to play with.

```typescript
describe('MockProvider', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
      providers: [
        MockProvider(DependencyService),
        MockProvider(DEPENDENCY_TOKEN, 'mock token'),
      ],
    }).compileComponents(),
  );

  it('uses mock providers', () => {
    const fixture = TestBed.createComponent(TargetComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).not.toContain('target');
    expect(fixture.nativeElement.innerHTML).toContain('mock token');
  });
});
```

</p>
</details>

[to the top](#table-of-contents)

---

### How to create a mock module

There is a `MockModule` function covering almost all needs for mock behavior.
**To create a mock module in Angular tests** with `ng-mocks` is quite easy.
The library does it recursively for modules, and creates mocks for all imports, exports and their declarations.

- `MockModule( MyModule )` - returns a mock copy of `MyModule` module.
- `MockModule( MyModule.forRoots() )` - additionally to a mock copy of `MyModule` module returns mock providers.

**A mock module out of an angular module** respects its original module as
a type of `MockedModule<T>` and provides:

- mock copies of all components, directives, pipes and providers
- mock copies of all imports and exports
- dummy clones of all services
- dummy abstract methods for services with a `useClass` definition
- mock dummies of tokens with a `useClass` definition
- respect of tokens with a `useExisting` definition
- empty objects instead of tokens with a `useFactory` definition
- base primitives instead of tokens with a `useValue` definition
- mock copies of tokens with a `useValue` definition

If you get an error like: "**Type is part of the declarations of 2 modules**",
then consider usage of [`MockBuilder`](#mockbuilder).
More detailed information about its cause and a solution you can read in a section called [How to fix `Type is part of the declarations of 2 modules`](https://ng-mocks.github.io/how-to-fix-error-type-is-part-of-the-declarations-of-2-modules.html).

Let's imagine an Angular application where `TargetComponent` depends on a module of `DependencyModule`
and we would like to use its mock copy in a test.

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

To **create a mock module** simply pass its class into `MockModule`:

```typescript
TestBed.configureTestingModule({
  imports: [
    MockModule(DependencyModule), // <- profit
  ],
  declarations: [TargetComponent],
});
```

Or be like a pro and use [`MockBuilder`](#mockbuilder), its [`.mock`](#mockbuildermock) method
and [`MockRender`](#mockrender):

```typescript
describe('Test', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent).mock(DependencyModule),
  );

  it('should create', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.point.componentInstance).toBeDefined();
  });
});
```

There is a trick to avoid specifying all dependencies of the `TargetComponent` in the chain:
simply pass its module as the second parameter of [`MockBuilder`](#mockbuilder).
Everything in `TargetModule` will be replaced with their mock copies, but not `TargetComponent`, it will stay as it is:

```typescript
beforeEach(() => MockBuilder(TargetComponent, TargetModule));
```

<details><summary>Click to see <strong>a usage example of mock modules in Angular tests</strong></summary>
<p>

The source file is here:
[MockModule](https://github.com/ike18t/ng-mocks/blob/master/examples/MockModule/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/examples/MockModule/test.spec.ts)
to play with.

```typescript
describe('MockModule', () => {
  beforeEach(() =>
    MockBuilder(TestedComponent).mock(DependencyModule),
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

[to the top](#table-of-contents)

---

### How to create a mock `Observable`

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

If we wanted to test the component, we would like to use its mock dependencies. In our case it is `TodoService`.

```typescript
TestBed.configureTestingModule({
  declarations: [TodoComponent],
  providers: [MockProvider(TodoService)],
});
```

If we created a fixture, we would face an error about reading properties of `undefined`. This happens because a mock copy of `TodoService.list$`
returns a spy, if [auto spy](#auto-spy) has been configured, or `undefined`. Therefore, neither has the `subscribe` property.

Obviously, to solve this, we need to get the method to return an observable stream.
For that, we could create a mock copy via [`MockService`](#how-to-create-a-mock-service) and to pass it as the second parameter into [`MockProvider`](#how-to-create-a-mock-provider).

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

Profit, now initialization of the component with the mock service does not throw the error anymore.

Nevertheless, usually, we want not only to return a stub result as `EMPTY` observable stream,
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
    todoServiceMock,
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

<details><summary>Click to see <strong>a usage example of an mock observable in Angular tests</strong></summary>
<p>

The source file is here:
[MockObservable](https://github.com/ike18t/ng-mocks/blob/master/examples/MockObservable/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/examples/MockObservable/test.spec.ts)
to play with.

```typescript
describe('MockObservable', () => {
  // Because we want to test the component, we pass it as the first
  // parameter of MockBuilder. To create its mock dependencies
  // we pass its module as the second parameter.
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  // Now we need to customize the mock copy of the service.
  // value$ is our access point to the stream.
  const value$: Subject<number[]> = new Subject();
  beforeAll(() => {
    // MockInstance helps to override mock instances.
    MockInstance(TargetService, instance =>
      ngMocks.stub(instance, {
        value$, // even it is a read-only property we can override.
      }),
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

[to the top](#table-of-contents)

---

### How to create a mock form control

`ng-mocks` respects `ControlValueAccessor` interface if a directive, or a component implements it.
Apart from that, `ng-mocks` provides helper functions to cause changes and touches.

A mock instance of `ControlValueAccessor` provides:

- `__simulateChange()` - calls `onChanged` on the mock component bound to a `FormControl`
- `__simulateTouch()` - calls `onTouched` on the mock component bound to a `FormControl`

<details><summary>Click to see <strong>a usage example of a mock FormControl with ReactiveForms in Angular tests</strong></summary>
<p>

The source file is here:
[MockReactiveForms](https://github.com/ike18t/ng-mocks/blob/master/examples/MockReactiveForms/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/examples/MockReactiveForms/test.spec.ts)
to play with.

```typescript
describe('MockReactiveForms', () => {
  beforeEach(() =>
    MockBuilder(TestedComponent)
      .mock(DependencyComponent)
      .keep(ReactiveFormsModule),
  );

  it('sends the correct value to the mock form component', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // Let's find the mock form component.
    const mockControl = ngMocks.find(
      fixture.debugElement,
      DependencyComponent,
    ).componentInstance;

    // Let's simulate its change, like a user does it.
    if (isMockOf(mockControl, DependencyComponent, 'c')) {
      mockControl.__simulateChange('foo');
    }
    expect(component.formControl.value).toBe('foo');

    // Let's check that change on existing formControl
    // causes calls of `writeValue` on the mock component.
    spyOn(mockControl, 'writeValue');
    component.formControl.setValue('bar');
    expect(mockControl.writeValue).toHaveBeenCalledWith('bar');
  });
});
```

</p>
</details>

<details><summary>Click to see <strong>a usage example of mock FormControl with ngModel in Angular tests</strong></summary>
<p>

The source file is here:
[MockForms](https://github.com/ike18t/ng-mocks/blob/master/examples/MockForms/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/examples/MockForms/test.spec.ts)
to play with.

```typescript
describe('MockForms', () => {
  beforeEach(() =>
    MockBuilder(TestedComponent)
      .mock(DependencyComponent)
      .keep(FormsModule),
  );

  it('sends the correct value to the mock form component', async () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // Let's find the mock form component.
    const mockControl = ngMocks.find(
      fixture.debugElement,
      DependencyComponent,
    ).componentInstance;

    // Let's simulate its change, like a user does it.
    if (isMockOf(mockControl, DependencyComponent, 'c')) {
      mockControl.__simulateChange('foo');
      fixture.detectChanges();
      await fixture.whenStable();
    }
    expect(component.value).toBe('foo');

    // Let's check that change on existing value
    // causes calls of `writeValue` on the mock component.
    spyOn(mockControl, 'writeValue');
    component.value = 'bar';
    fixture.detectChanges();
    await fixture.whenStable();
    expect(mockControl.writeValue).toHaveBeenCalledWith('bar');
  });
});
```

</p>
</details>

[to the top](#table-of-contents)

---

## Extensive example of mocks in Angular tests

The source file is here:
[MAIN](https://github.com/ike18t/ng-mocks/blob/master/examples/MAIN/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/examples/MAIN/test.spec.ts)
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
class AppComponent {
  @Input() public title = 'My Application';

  @Output() public logoClick = new EventEmitter<void>();
}

// A dependency component out of which we want to create a mock
// component with a respect of its inputs, outputs and ContentChild.
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
class AppHeaderComponent {
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
class AppModule {}

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
  // a mock copy.

  // With ng-mocks it can be defined in the next way.
  beforeEach(() => {
    // AppComponent will stay as it is,
    // everything in AppModule will be replaced with their mock copies.
    return (
      MockBuilder(AppComponent, AppModule)
        // Adding a special config how to how to create
        // a mock AppHeaderComponent.
        .mock(AppHeaderComponent, {
          render: {
            // #menu template will be rendered simultaneously
            // with the mock AppHeaderComponent.
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
    //     AppComponent, // <- keeping it as it is.
    //     MockComponent(AppHeaderComponent),
    //   ],
    // });
    // return testBed.compileComponents();
    //
    // of if we used ngMocks.guts
    // TestBed.configureTestingModule(ngMocks.guts(
    //   AppComponent, // <- keeping it as it is.
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
    const header = ngMocks.find(AppHeaderComponent);

    // Asserting how AppComponent uses AppHeaderComponent.
    expect(header.componentInstance.showLogo).toBe(true);
    expect(header.componentInstance.title).toBe('Fake Application');

    // Checking that AppComponents updates AppHeaderComponent.
    fixture.componentInstance.title = 'Updated Application';
    fixture.detectChanges();
    expect(header.componentInstance.title).toBe(
      'Updated Application',
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

- [sandbox on codesandbox.io](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/e2e.ts)
- [examples from the doc](https://github.com/ike18t/ng-mocks/tree/master/examples)
- [current e2e tests](https://github.com/ike18t/ng-mocks/tree/master/tests)

[to the top](#table-of-contents)

---

## Functions for easy builds of mock copies and template rendering

The section provides information about essential functions for creating mock environments
with minimum coding.

- [`MockBuilder`](#mockbuilder) - creates mock declarations
- [`MockRender`](#mockrender) - renders customized templates
- [`MockInstance`](#mockinstance) - edits anything on an early stage
- [`ngMocks`](#ngmocks) - facilitates work with fixtures

---

### MockBuilder

`MockBuilder` is the simplest way to create mock copies out of everything.
It provides a rich toolkit of functions to manipulate the mock copies in the way your test requires,
but with minimum overhead.

Usually, we have something simple to test, but, time to time, the simplicity is killed by nightmarish dependencies.
The good thing here is that commonly the dependencies have been declared or imported in the same module, where our
tested thing is. Therefore, with help of `MockBuilder` we can quite easily define a testing module,
where everything in the module will be replaced with their mock copies, except the tested thing: `MockBuilder( TheThing, ItsModule )`.

MockBuilder tends to provide **a simple instrument to create mock Angular dependencies**, does it in isolated scopes,
and has a rich toolkit that supports:

- respect of internal vs external declarations (precise exports)
- detection and creation of mock copies for root providers
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

<details><summary>Click to see <strong>a code sample demonstrating ease of creating mocks in Angular tests</strong></summary>
<p>

The source file is here:
[MockBuilder](https://github.com/ike18t/ng-mocks/blob/master/examples/MockBuilder/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/examples/MockBuilder/test.spec.ts)
to play with.

```typescript
describe('MockBuilder:simple', () => {
  beforeEach(() => MockBuilder(MyComponent, MyModule));
  // The same as
  // beforeEach(() => TestBed.configureTestingModule({{
  //   imports: [MockModule(MyModule)],
  // }).compileComponents());
  // but MyComponent has not been replaced with a mock copy for
  // the testing purposes.

  it('should render content ignoring all dependencies', () => {
    const fixture = MockRender(MyComponent);
    expect(fixture).toBeDefined();
    expect(fixture.debugElement.nativeElement.innerHTML).toContain(
      '<div>My Content</div>',
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

The code above creates mocks for everything in `MyModule` (imports, declarations, providers and exports), but keeps `MyComponent` as it is for testing purposes.
Actually, it does the next:

```typescript
const ngModule = MockBuilder()
  .keep(MyComponent, { export: true })
  .mock(MyModule, { exportAll: true })
  .build();
```

Also, you can suppress the first parameter with `null` if you want to create mocks for all declarations.

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

If we want to keep a module, component, directive, pipe or provider as it is. We should use `.keep`.

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
    .keep(SomeInjectionToken),
);
```

#### MockBuilder.mock

If we want to create a mock copy out of anything, even a part of a kept module we should use `.mock`.

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
    .mock(SomeInjectionToken),
);
```

For pipes, we can set their handlers as the 2nd parameter of `.mock`.

```typescript
beforeEach(() =>
  MockBuilder(MyComponent, MyModule).mock(
    SomePipe,
    value => 'My Custom Content',
  ),
);
```

For services and tokens, we can optionally provide their mock values.
They are added as `useValue` in providers.

```typescript
beforeEach(() =>
  MockBuilder(MyComponent, MyModule)
    .mock(SomeService3, anything1)
    .mock(SOME_TOKEN, anything2),
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
    .exclude(SomeInjectionToken),
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
    .replace(SomePipe, SomeOtherPipe),
);
```

In case of `HttpClientTestingModule` you can use `.replace` too.

```typescript
beforeEach(() =>
  MockBuilder(MyComponent, MyModule).replace(
    HttpClientModule,
    HttpClientTestingModule,
  ),
);
```

In case of `RouterTestingModule` you need to use [`.keep`](#mockbuilderkeep) for both of the modules and to pass an empty array into `.withRoutes`.

```typescript
beforeEach(() =>
  MockBuilder(MyComponent, MyModule)
    .keep(RouterModule)
    .keep(RouterTestingModule.withRoutes([])),
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
    .provide({ provide: SOME_TOKEN, useFactory: () => anything2 }),
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
    }),
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
    }),
);
```

#### MockBuilder `dependency` flag

By default, all definitions are added to the `TestingModule` if they are not a dependency of another definition.
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
    // Pass the same def as a mock instance, if you want only to
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
    }),
);
```

#### MockBuilder `render` flag

If we want to render a structural directive by default. Now we can do that via adding the `render` flag in its config.

```typescript
beforeEach(() =>
  MockBuilder(MyComponent, MyModule).mock(MyDirective, {
    render: true,
  }),
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
  }),
);
```

If we use `ContentChild` in a component, and we want to render it by default, we should use its id for that in the same way as for a mock directive.

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
  }),
);
```

#### `NG_MOCKS_GUARDS` token

If we want to test guards we need to [`.keep`](#mockbuilderkeep) them, but what should we do with other guards we do not want to care about at all?
The answer is to exclude `NG_MOCKS_GUARDS` token, it will **remove all the guards from routes** except the explicitly configured ones.

```typescript
beforeEach(() =>
  MockBuilder(MyGuard, MyModule).exclude(NG_MOCKS_GUARDS),
);
```

#### `NG_MOCKS_INTERCEPTORS` token

Usually, when we want to test an interceptor, we want to avoid influences of other interceptors.
To **remove all interceptors in an angular test** we need to exclude `NG_MOCKS_INTERCEPTORS` token,
then all interceptors will be excluded except the explicitly configured ones.

```typescript
beforeEach(() =>
  MockBuilder(MyInterceptor, MyModule).exclude(NG_MOCKS_INTERCEPTORS),
);
```

#### `NG_MOCKS_ROOT_PROVIDERS` token

There are root services and tokens apart from provided ones in Angular applications.
It might happen that in a test we want these providers to be replaced with their mock copies, or kept.

If we want to replace all root providers with their mock copies in an angular test,
we need to pass `NG_MOCKS_ROOT_PROVIDERS` token into [`.mock`](#mockbuildermock).

```typescript
beforeEach(() =>
  MockBuilder(
    MyComponentWithRootServices,
    MyModuleWithRootTokens,
  ).mock(NG_MOCKS_ROOT_PROVIDERS),
);
```

In contrast to that, we might want to keep all root providers for mock declarations.
For that, we need to keep `NG_MOCKS_ROOT_PROVIDERS` token.

```typescript
beforeEach(() =>
  MockBuilder(
    MyComponentWithRootServices,
    MyModuleWithRootTokens,
  ).keep(NG_MOCKS_ROOT_PROVIDERS),
);
```

If we do not pass `NG_MOCKS_ROOT_PROVIDERS` anywhere,
then only root providers for kept modules will stay as they are.
All other root providers will be replaced with their mock copies, even for kept declarations of mock modules.

#### MockBuilder good to know

Anytime we can change our decision. The last action on the same object wins. SomeModule will be replaced with its mock copy.

```typescript
beforeEach(() =>
  MockBuilder(MyComponent, MyModule)
    .keep(SomeModule)
    .mock(SomeModule)
    .keep(SomeModule)
    .mock(SomeModule),
);
```

[to the top](#table-of-contents)

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
It is useful when you want to create mock system tokens / services such as `APP_INITIALIZER`, `DOCUMENT` etc.

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
  },
);
```

And do not forget to call `fixture.detectChanges()` and / or `await fixture.whenStable()` to reflect changes in
the render.

There is **an example how to render a custom template in an Angular test** below.

The source file is here:
[MockRender](https://github.com/ike18t/ng-mocks/blob/master/examples/MockRender/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/examples/MockRender/test.spec.ts)
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
      },
    );

    // ngMocks.input helps to get the current value of an input on
    // a related debugElement without knowing its owner.
    expect(ngMocks.input(fixture.point, 'value1')).toEqual(
      'something1',
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
      'something2',
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

[to the top](#table-of-contents)

---

### MockInstance

`MockInstance` is useful when you want to configure spies of a declaration or a service before its render.
It supports: Modules, Components, Directives, Pipes and Services.

- `MockInstance( MyService, ( instance, injector ) => void)` - sets a callback to initialize an instance.
- `MockInstance( MyService, config: {init: Function} )` - sets a config, currently only `init` is supported, it is the callback.
- `MockInstance( MyService )` - removes initialization from the service.
- `MockReset()` - removes initialization from all services.

**Please note**

> that it works only for pure mock copies without overrides.
> If you provide an own mock copy via `useValue` or like `.mock(MyService, myMock)` then `MockInstance` does not have an effect.

You definitely need it when a test fails like:

- [TypeError: Cannot read property 'subscribe' of undefined](https://ng-mocks.github.io/how-to-fix-typeerror-cannot-read-property-subscribe-of-undefined.html)
- [TypeError: Cannot read property 'pipe' of undefined](https://ng-mocks.github.io/how-to-fix-typeerror-cannot-read-property-subscribe-of-undefined.html)
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

When we test `RealComponent` we would like to have a mock `ChildComponent`, and it would mean, if we replaced it with a mock `ChildComponent` then its `update$` would be return `undefined`,
therefore our test would fail in `ngAfterViewInit` because of [`TypeError: Cannot read property 'subscribe' of undefined`](https://ng-mocks.github.io/how-to-fix-typeerror-cannot-read-property-subscribe-of-undefined.html).

If it was a service, we would use `providers` to set a proper mock instance of the service.

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
a solution here. That's where `ng-mocks` helps again with `MockInstance` helper function.
It accepts a class as the first parameter, and a tiny callback describing how to customize its instances as the second one.

```typescript
beforeAll(() =>
  MockInstance(
    ChildComponent,
    (instance: ChildComponent, injector: Injector): void => {
      // Now you can customize a mock instance of ChildComponent.
      // If you had used auto-spy then all its methods have been spied already
      // here.
      ngMocks.stub(instance, {
        update$: EMPTY,
      });
      // if you want you can use injector.get(SomeService) for more
      // complicated customization.
    },
  ),
);
```

Profit. Now, when Angular creates an instance of `ChildComponent` the callback is called too and `update$` property
of the instance is an `Observable` instead of `undefined`.

_Good to know_: you might notice `ngMocks.stub` usage instead of `instance.update$ = EMPTY`. This has been made with intention to
show **how to create stub `readonly` properties in Angular**.

After a test you can reset changes to avoid their influence in other tests via a call of
`MockInstance` without the second parameter or simply
`MockReset()` to reset all customizations.

```typescript
afterAll(() => MockInstance(ChildComponent)); // <- resets ChildComponent.
// afterAll(MockReset); // <- or this one to reset all MockInstances.
```

<details><summary>Click to see <strong>a usage example of mock services before initialization in Angular tests</strong></summary>
<p>

The source file is here:
[MockInstance](https://github.com/ike18t/ng-mocks/blob/master/examples/MockInstance/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/examples/MockInstance/test.spec.ts)
to play with.

```typescript
describe('MockInstance', () => {
  // A normal setup of the TestBed, TargetComponent will be replaced
  // with its mock copy.
  beforeEach(() => MockBuilder(RealComponent).mock(ChildComponent));

  beforeAll(() => {
    // Because TargetComponent is replaced with its mock copy,
    // its update$ is undefined and ngAfterViewInit of the parent
    // component will fail on .subscribe().
    // Let's fix it via defining customization for the mock copy.
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
      /Cannot read property 'subscribe' of undefined/,
    );
  });
});
```

</p>
</details>

[to the top](#table-of-contents)

---

### ngMocks

`ngMocks` provides functions to get attribute and structural directives from an element, find components and create mock objects.

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

The first parameter can be a declaration or an array of them which we want to test.
The second parameter can be a declaration or an array of them out of which we want to create mocks.
The third parameter can be a declaration or an array of them which we want to exclude.
They support: Modules, Components, Directives, Pipes, Services and tokens.

If there is a module in the second parameter, then its guts will be replaced with their mock copies excluding things from the first parameter.
Any parameter might be `null` if we need to skip it.

```typescript
const ngModuleMeta = ngMocks.guts(Component, ItsModule);
```

```typescript
const ngModuleMeta = ngMocks.guts(
  [Component1, Component2, Service3],
  [ModuleToMock, DirectiveToMock, WhateverToMock],
  [ServiceToExclude, DirectiveToExclude],
);
```

```typescript
const ngModuleMeta = ngMocks.guts(
  null,
  ModuleToMock,
  ComponentToExclude,
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
If the element isn't specified then the current fixture is used.

- `ngMocks.findInstance( fixture?, directive, notFoundValue? )`
- `ngMocks.findInstance( debugElement?, directive, notFoundValue? )`

```typescript
const directive1 = ngMocks.findInstance(Directive1);
const directive2 = ngMocks.findInstance(fixture, Directive2);
const directive3 = ngMocks.findInstance(
  fixture.debugElement,
  Directive3,
);
```

#### ngMocks.findInstances

Returns an array of all found attribute or structural directives which belong to the current element and all its children.
If the element isn't specified then the current fixture is used.

- `ngMocks.findInstances( fixture?, directive )`
- `ngMocks.findInstances( debugElement?, directive )`

```typescript
const directives1 = ngMocks.findInstances(Directive1);
const directives2 = ngMocks.findInstances(fixture, Directive2);
const directives3 = ngMocks.findInstances(
  fixture.debugElement,
  Directive3,
);
```

#### ngMocks.find

Returns a found DebugElement which belongs to a component with the correctly typed componentInstance,
or matches a css selector.
If a root element or a fixture aren't specified then the current fixture is used.

- `ngMocks.find( fixture?, component, notFoundValue? )`
- `ngMocks.find( fixture?, cssSelector, notFoundValue? )`
- `ngMocks.find( debugElement?, component, notFoundValue? )`
- `ngMocks.find( debugElement?, cssSelector, notFoundValue? )`

```typescript
const element1 = ngMocks.find(Component1);
const element2 = ngMocks.find(fixture, Component2);
const element3 = ngMocks.find(fixture.debugElement, Component3);
```

```typescript
const element1 = ngMocks.find('div.con1');
const element2 = ngMocks.find(fixture, 'div.con2');
const element3 = ngMocks.find(fixture.debugElement, 'div.con3');
```

#### ngMocks.findAll

Returns an array of found DebugElements which belong to a component with the correctly typed componentInstance,
or match a css selector.
If a root element or a fixture aren't specified then the current fixture is used.

- `ngMocks.findAll( fixture?, component )`
- `ngMocks.findAll( fixture?, cssSelector )`
- `ngMocks.findAll( debugElement?, component )`
- `ngMocks.findAll( debugElement?, cssSelector )`

```typescript
const elements1 = ngMocks.findAll(Component1);
const elements2 = ngMocks.findAll(fixture, Component2);
const elements3 = ngMocks.findAll(fixture.debugElement, Component3);
```

```typescript
const elements1 = ngMocks.findAll('div.item1');
const elements2 = ngMocks.findAll(fixture, 'div.item2');
const elements3 = ngMocks.findAll(fixture.debugElement, 'div.item3');
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

In case if we want to create stub methods / properties of a service.

- `ngMocks.stub( service, method )`
- `ngMocks.stub( service, methods )`
- `ngMocks.stub( service, property, 'get' | 'set' )`

Returns a mock function / spy of the method. If the method has not been replaced with a stub yet - it will.

```typescript
const spy: Function = ngMocks.stub(instance, methodName);
```

Returns a mock function / spy of the property. If the property has not been replaced with a stub yet - it will.

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

[to the top](#table-of-contents)

---

### Helper functions

`ng-mocks` provides several functions which help with **detection of mock instances**.
For example, they are useful in situations when we want to render `ChildContent` of a mock component, or to touch a
mock form control.

- [isMockOf](#ismockof)
- [isMockedNgDefOf](#ismockedngdefof)
- [getMockedNgDefOf](#getmockedngdefof)
- [isNgDef](#isngdef)
- [getSourceOfMock](#getsourceofmock)
- [isNgInjectionToken](#isnginjectiontoken)

#### isMockOf

This function helps when we want to use `ng-mocks` tools for rendering or change simulation,
but typescript doesn't recognize `instance` as a mock instance.

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
- `isMockOf( inst, SomeClass )` - checks whether `inst` is an instance of mock `SomeClass`

#### isMockedNgDefOf

This function helps when we need to verify that a class is actually a mock copy of a class.

- `isMockedNgDefOf( MockClass, SomeClass, 'm' )` - checks whether `MockClass` is a mock copy of `SomeClass` and a module
- `isMockedNgDefOf( MockClass, SomeClass, 'c' )` - checks whether `MockClass` is a mock copy of `SomeClass` and a component
- `isMockedNgDefOf( MockClass, SomeClass, 'd' )` - checks whether `MockClass` is a mock copy of `SomeClass` and a directive
- `isMockedNgDefOf( MockClass, SomeClass, 'p' )` - checks whether `MockClass` is a mock copy of `SomeClass` and a pipe
- `isMockedNgDefOf( MockClass, SomeClass )` - checks whether `MockClass` is a mock copy of `SomeClass`

#### getMockedNgDefOf

This function helps when in a test we want to get a mock copy of a class created in TestBed.

- `getMockedNgDefOf( SomeClass, 'm' )` - returns an existing `MockedModule<SomeClass>` of `SomeClass`
- `getMockedNgDefOf( SomeClass, 'c' )` - returns an existing `MockedComponent<SomeClass>` of `SomeClass`
- `getMockedNgDefOf( SomeClass, 'd' )` - returns an existing `MockedDirective<SomeClass>` of `SomeClass`
- `getMockedNgDefOf( SomeClass, 'p' )` - returns an existing `MockedPipe<SomeClass>` of `SomeClass`
- `getMockedNgDefOf( SomeClass )` - returns an existing mock class of `SomeClass`

#### isNgDef

This function verifies how a class has been decorated.

- `isNgDef( SomeClass, 'm' )` - checks whether `SomeClass` is a module
- `isNgDef( SomeClass, 'c' )` - checks whether `SomeClass` is a component
- `isNgDef( SomeClass, 'd' )` - checks whether `SomeClass` is a directive
- `isNgDef( SomeClass, 'p' )` - checks whether `SomeClass` is a pipe
- `isNgDef( SomeClass, 'i' )` - checks whether `SomeClass` is a service
- `isNgDef( SomeClass )` - checks whether `SomeClass` is a module / component / directive / pipe / service.

#### getSourceOfMock

This function returns an origin of the mock copy.

- `getSourceOfMock( MockClass )` - returns the source class of `MockClass`

#### isNgInjectionToken

This function verifies tokens.

- `isNgInjectionToken( TOKEN )` - checks whether `TOKEN` is a token

[to the top](#table-of-contents)

---

### Usage with 3rd-party libraries

`ng-mocks` provides flexibility via [`ngMocks.guts`](#ngmocksguts) and [`MockBuilder`](#mockbuilder)
that allows developers to use another **Angular testing libraries** for creation of `TestBed`,
and in the same time to **use mock copies out of all dependencies** via `ng-mocks`.

For example if we use `@ngneat/spectator` and its functions
like `createHostFactory`, `createComponentFactory`, `createDirectiveFactory` and so on,
then to get mock declarations properly we need:

- exclude the component we want to test
- get its mock module
- export all declarations the module has

if we use [`ngMocks.guts`](#ngmocksguts) we need to skip the first parameter, pass the module
as the second parameter to export its declaration, and to pass the component as the third one to exclude it.

```typescript
const dependencies = ngMocks.guts(null, MyModule, MyComponent);
const createComponent = createComponentFactory({
  component: MyComponent,
  ...dependencies,
});
```

If we use [`MockBuilder`](#mockbuilder) we need [`.exclude`](#mockbuilderexclude), [`.mock`](#mockbuildermock) and [`exportAll`](#mockbuilder-exportall-flag) flag.

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

[to the top](#table-of-contents)

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
    MockBuilder(TargetComponent, TargetModule).keep(TargetService),
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

  // A normal setup of the TestBed, TargetService will be replaced
  // with its mock copy.
  beforeEach(() => MockBuilder(TargetComponent).mock(TargetService));

  // Configuring behavior of the mock TargetService.
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

  // A normal setup of the TestBed, TargetService will be replaced
  // with its mock copy.
  beforeEach(() =>
    MockBuilder(TargetComponent).mock(TargetService, mock),
  );
});
```

</p>
</details>

[to the top](#table-of-contents)

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

[to the top](#table-of-contents)
