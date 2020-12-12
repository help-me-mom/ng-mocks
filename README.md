[![chat on gitter](https://img.shields.io/gitter/room/ike18t/ng-mocks)](https://gitter.im/ng-mocks/community)
[![npm version](https://img.shields.io/npm/v/ng-mocks)](https://www.npmjs.com/package/ng-mocks)
[![build status](https://img.shields.io/travis/ike18t/ng-mocks/master)](https://travis-ci.org/github/ike18t/ng-mocks/branches)
[![coverage status](https://img.shields.io/coveralls/github/ike18t/ng-mocks/master)](https://coveralls.io/github/ike18t/ng-mocks?branch=master)
[![language grade](https://img.shields.io/lgtm/grade/javascript/g/ike18t/ng-mocks)](https://lgtm.com/projects/g/ike18t/ng-mocks/context:javascript)

# Create mock components and more out of annoying dependencies in Angular tests

`ng-mocks` is a testing library which helps with
**creating [mock components](#how-to-create-a-mock-component)**,
[directives](#how-to-create-a-mock-directive),
[pipes](#how-to-create-a-mock-pipe),
[services](#how-to-create-a-mock-provider) and
[modules](#how-to-create-a-mock-module)
in tests for Angular 5+ applications.
When you have [a noisy child component](#how-to-create-a-mock-component),
or any other [annoying dependency](#how-to-turn-annoying-declarations-into-mocks-in-an-angular-application),
`ng-mocks` has tools to turn these declarations into their mocks,
keeping interfaces as they are, but suppressing their implementation.

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
where you might check all the features. To focus on a particular one, simply prefix it with `fdescribe` or `fit`.

There is a brief summary of the latest changes in [CHANGELOG](https://github.com/ike18t/ng-mocks/blob/master/CHANGELOG.md).

## Why use this?

Sure, you could flip a flag on schema errors to make your component dependencies not matter.
Or you could use `ng-mocks` to
**create [mock declarations](#how-to-turn-annoying-declarations-into-mocks-in-an-angular-application)**
out of them and have the ability to assert on their inputs or emit on an output to assert on a side effect.

### Find an issue or have a question or a request?

I'm open to contributions.

- [ask a question on gitter](https://gitter.im/ng-mocks/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
- [report it as an issue on github](https://github.com/ike18t/ng-mocks/issues/new)
- or submit a PR

## Table of contents

- [Motivation and easy start](#motivation-and-easy-start)
- [How to install](#install)

* [How to turn an annoying declaration into](#how-to-turn-annoying-declarations-into-mocks-in-an-angular-application)
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

* [How to fix](#how-to-fix-an-error-in-angular-tests)
  - [`TypeError: Cannot read property 'subscribe' of undefined`](#how-to-fix-typeerror-cannot-read-property-subscribe-of-undefined)
  - [`Error: Type is part of the declarations of 2 modules`](#how-to-fix-error-type-is-part-of-the-declarations-of-2-modules)
  - [`Error: Directive has no selector, please add it!`](#how-to-fix-error-directive-has-no-selector-please-add-it)
  - [`Template parse errors: <component> is not a known element`](#how-to-fix-template-parse-errors-component-is-not-a-known-element)

### External resources

- [How to test Angular applications](https://ng-mocks.github.io/)
- [How to configure CI to execute Angular tests automatically](https://satantime.github.io/puppeteer-node/)

---

## Motivation and easy start

Angular testing is fun and easy until you've met complex dependencies,
and setting up the `TestBed` becomes really annoying and time-consuming.

`ng-mocks` helps to bring fun and ease back allowing developers
**to create [mock child components](#how-to-create-a-mock-component)**
and stub dependencies via a few lines of code with help of
[`MockComponent`](#how-to-create-a-mock-component),
[`MockDirective`](#how-to-create-a-mock-directive),
[`MockPipe`](#how-to-create-a-mock-pipe),
[`MockProvider`](#how-to-create-a-mock-provider),
[`MockModule`](#how-to-create-a-mock-module),
or with pro tools such as
[`MockBuilder`](#mockbuilder) with
[`MockRender`](#mockrender).

Let's imagine that in our Angular application we have a base component,
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

This means that our base component depends on the next child components and declarations:
`AppHeaderComponent`,
`AppSearchComponent`,
`AppBodyComponent`,
`AppFooterComponent`,
`SearchService`,
`TranslatePipe`
etc.

We could easily test it with `schemas: [NO_ERRORS_SCHEMA]`
to avoid
[`Template parse errors: <component> is not a known element`](#how-to-fix-template-parse-errors-component-is-not-a-known-element),
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
into **[helper functions](#how-to-turn-annoying-declarations-into-mocks-in-an-angular-application) to get their mock versions**
and to avoid a dependency hassle.

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

Nevertheless, if we count lines of mock declarations,
we see that there are a lot of them, and looks like here might be dozens more for big
components. Also, what happens if someone deletes `AppSearchModule`
from `AppBaseModule`? Doesn't look like the test will fail due to
a missed dependency.

Right, we need a tool that would extract declarations of the module
`AppBaseComponent` belongs to, and create mocks out of them like the code above.
Then, if someone deletes `AppSearchModule` the test fails too.

[`ngMocks.guts`](#ngmocksguts) is the tool for that.
Its first parameter accepts things we want to test (avoid mocks),
the second parameter accepts things out of which we want to create mocks, if it is a module,
its declarations (guts) will be turned into mocks, except the things
from the first parameter, and the third parameter accepts things we want
to exclude at all from the final meta. Any parameter can be `null` if
we need to skip it, or an array if we want to pass several more than one.

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
    AppBaseComponent, // <- kept as it is.
    [AppBaseModule, AppModule],
  ),
);
```

Profit. That should be enough for the start.

The functions above help with an easy start, but they do not cover all
possible cases and do not provide tools for customizing behavior.
Consider reading [`MockBuilder`](#mockbuilder) and [`MockRender`](#mockrender)
if you want **to create [mock child dependencies](#how-to-turn-annoying-declarations-into-mocks-in-an-angular-application) like a pro**
in writing Angular tests.

For example, if we needed `TranslatePipe` to prefix its strings instead of
translating them, and to create a stub `SearchService` with an empty result that would not cause
an error during execution due to a missed observable in its mock object,
the code would look like:

```typescript
beforeEach(() => {
  return MockBuilder(AppBaseComponent, AppBaseModule)
    .mock(TranslatePipe, v => `translated:${v}`)
    .mock(SearchService, {
      search: of([]),
    });
});
```

Profit.
[Subscribe](https://github.com/ike18t/ng-mocks),
[like](https://github.com/ike18t/ng-mocks),
[share](https://twitter.com/intent/tweet?text=Check+ng-mocks+package&url=https%3A%2F%2Fgithub.com%2Fike18t%2Fng-mocks)!

Have a question still? Don't hesitate to [contact us](#find-an-issue-or-have-a-question-or-a-request).

[to the top](#table-of-contents).

Below more detailed documentation begins, please bear with us.

---

## Install

For any Angular project you can use the latest version of the library.

NPM

> npm install ng-mocks --save-dev

Yarn

> yarn add ng-mocks --dev

---

## How to turn annoying declarations into mocks in an Angular application

This section provides vast **information how to create mock dependencies in angular** with real examples and detailed explanations
of all aspects might be useful in writing fully isolated unit tests.

- [get a mock component](#how-to-create-a-mock-component)
- [get a mock directive](#how-to-create-a-mock-directive)
- [get a mock pipe](#how-to-create-a-mock-pipe)
- [get a mock service](#how-to-create-a-mock-service)
- [get a mock provider](#how-to-create-a-mock-provider)
- [get a mock module](#how-to-create-a-mock-module)
- [get a mock observable](#how-to-create-a-mock-observable)
- [get a mock form control](#how-to-create-a-mock-form-control)

---

### How to create a mock component

There is a `MockComponent` function.
It covers everything you need to turn a component into its mock declaration.

- `MockComponent( MyComponent )` - returns a mock class of `MyComponent` component.
- `MockComponents( MyComponent1, SomeComponent2, ... )` - returns an array of mocks.

> **NOTE**: Information about [form control and their mocks](#how-to-create-a-mock-form-control)
> is in a different section.

**A mock component** respects the interface of its original component as
a type of `MockedComponent<T>` and provides:

- the same `selector`
- the same `Inputs` and `Outputs` with alias support
- templates are pure `ng-content` tags to allow transclusion
- supports `@ContentChild` with an `$implicit` context
  - `__render('id', $implicit, variables)` - renders a template
  - `__hide('id')` - hides a rendered template
- supports [`FormsModule`, `ReactiveFormsModule` and `ControlValueAccessor`](#how-to-create-a-mock-form-control)
  - `__simulateChange()` - calls `onChanged` on the mock component bound to a `FormControl`
  - `__simulateTouch()` - calls `onTouched` on the mock component bound to a `FormControl`
- supports `exportAs`

Let's pretend that in our Angular application `TargetComponent` depends on a child component of `DependencyComponent`
and we want to use its mock object in a test.

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
  beforeEach(() => {
    return MockBuilder(TargetComponent).mock(DependencyComponent);
  });

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
  beforeEach(() => {
    return MockBuilder(TestedComponent).mock(DependencyComponent);
  });

  it('sends the correct value to the child input', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // The same as
    // fixture.debugElement.query(
    //   By.css('app-child')
    // ).componentInstance
    // but properly typed.
    const mockComponent = ngMocks.find<DependencyComponent>(
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
    const mockComponent = ngMocks.findInstance(DependencyComponent);

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
    const mockNgTemplate = ngMocks.find('[data-key="something"]')
      .nativeElement.innerHTML;
    expect(mockNgTemplate).toContain('<p>inside template</p>');
  });
});
```

</p>
</details>

[to the top](#table-of-contents)

---

### How to create a mock directive

There is a `MockDirective` function.
It turns a directive into its mock declaration.

- `MockDirective( MyDirective )` - returns a mock class of `MyDirective` directive.
- `MockDirectives( MyDirective1, MyDirective2, ... )` - returns an array of mocks.

> **NOTE**: Information about [form control and their mocks](#how-to-create-a-mock-form-control)
> is in a different section.

**a mock directive** respects the interface of its original directive as
a type of `MockedDirective<T>` and provides:

- the same `selector`
- the same `Inputs` and `Outputs` with alias support
- supports structural directives
  - `__render($implicit, variables)` - renders content
- supports [`FormsModule`, `ReactiveFormsModule` and `ControlValueAccessor`](#how-to-create-a-mock-form-control)
  - `__simulateChange()` - calls `onChanged` on the mock component bound to a `FormControl`
  - `__simulateTouch()` - calls `onTouched` on the mock component bound to a `FormControl`
- supports `exportAs`

Let's assume that an Angular application has `TargetComponent` that depends on a directive of `DependencyDirective` and
we need to use its mock object for facilitating unit tests.

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
  beforeEach(() => {
    return MockBuilder(TargetComponent).mock(DependencyDirective);
  });

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
  beforeEach(() => {
    return MockBuilder(TestedComponent).mock(DependencyDirective);
  });

  it('sends the correct value to the input', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // The same as
    // fixture.debugElement.query(
    //   By.css('span')
    // ).injector.get(DependencyDirective)
    // but easier and more precise.
    const mockDirective = ngMocks.get(
      ngMocks.find('span'),
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
      ngMocks.find('span'),
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
  beforeEach(() => {
    return MockBuilder(TestedComponent).mock(DependencyDirective, {
      // render: true, // <-- a flag to render the directive by default
    });
  });

  it('renders content of the child structural directive', () => {
    const fixture = MockRender(TestedComponent);

    // Let's assert that nothing has been rendered inside of
    // the structural directive by default.
    expect(fixture.nativeElement.innerHTML).not.toContain(
      '>content<',
    );

    // And let's render it manually now.
    const mockDirective = ngMocks.findInstance(DependencyDirective);
    if (isMockOf(mockDirective, DependencyDirective, 'd')) {
      mockDirective.__render();
      fixture.detectChanges();
    }

    // The content of the structural directive should be rendered.
    expect(fixture.nativeElement.innerHTML).toContain('>content<');
  });
});
```

</p>
</details>

[to the top](#table-of-contents)

---

### How to create a mock pipe

`ng-mocks` has a `MockPipe` function that creates mock pipes with an empty or a custom handler.

- `MockPipe( MyPipe )` - returns a mock class of `MyPipe` pipe that always transforms to `undefined`.
- `MockPipe( MyPipe, value => 'fake' )` - returns a mock class of `MyPipe` pipe that transforms to `fake`.
- `MockPipes( MyPipe1, MyPipe2, ... )` - returns an array of mocks.

**A mock pipe** respects the interface of its original pipe as
a type of `MockedPipe<T>` and provides:

- the same `name`
- ability to override the transform function with a type-safe function
- default transform is `() => undefined` to prevent problems with chaining

Let's imagine that in an Angular application `TargetComponent` depends on a pipe of `DependencyPipe` and
we would like to replace it with its mock pipe in a test.

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

To **create a mock pipe** simply pass its class into `MockPipe`:

```typescript
TestBed.configureTestingModule({
  declarations: [
    TargetComponent,
    MockPipe(DependencyPipe, value => `mock:${value}`), // <- profit
  ],
});
```

Or if you want to be like a pro, use [`MockBuilder`](#mockbuilder), its [`.mock`](#mockbuildermock) method
and call [`MockRender`](#mockrender):

```typescript
describe('Test', () => {
  beforeEach(() => {
    return MockBuilder(TargetComponent).mock(
      DependencyPipe,
      value => `mock:${value}`,
    );
  });

  it('should create', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.point.componentInstance).toBeDefined();
    expect(fixture.nativeElement.innerHTML).toContain('mock:foo');

    // An instance of DependencyPipe from the fixture if we need it.
    const pipe = ngMocks.findInstance(DependencyPipe);
    expect(pipe).toBeDefined();
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
  // A fake transform function.
  const fakeTransform = (...args: string[]) => JSON.stringify(args);

  // A spy, just in case if we want to verify
  // how the pipe has been called.
  const spy = jasmine
    .createSpy('transform')
    .and.callFake(fakeTransform);
  // in case of jest
  // const spy = jest.fn().mockImplementation(fakeTransform);

  beforeEach(() => {
    return MockBuilder(TestedComponent).mock(DependencyPipe, spy);
  });

  it('transforms values to json', () => {
    const fixture = MockRender(TestedComponent);

    expect(fixture.nativeElement.innerHTML).toEqual(
      '<component>["foo"]</component>',
    );

    // Also we can find an instance of the pipe in
    // the fixture if it's needed.
    const pipe = ngMocks.findInstance(DependencyPipe);
    expect(pipe.transform).toHaveBeenCalledWith('foo');
    expect(pipe.transform).toHaveBeenCalledTimes(1);
  });
});
```

</p>
</details>

[to the top](#table-of-contents)

---

### How to create a mock service

`ng-mocks` provides a `MockService` function that tries its best
to create mock objects out of services.
It tends to avoid a hassle of providing customized mock objects for huge services.
Simply pass a class into it and its result will be a mock instance that respects the class,
but all methods and properties are customizable dummies.

- `MockService( MyService, overrides? )` - returns a mock instance of `MyService` class.
- `MockService( MyOb )` - returns a mock object of `MyOb` object.

**A mock service instance** is based on its original class, and provides:

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

`MockProvider` might be useful If you want to create a stub for a service or a token in providers.

- `MockProvider( MyService, overrides? )` - creates a factory provider with `MockService(MyService)` under the hood.
- `MockProvider( MY_TOKEN_1, useValue? )` - creates a factory provider that returns `undefined`.
- `MockProvider( MyService, {mock: true} )` - creates a factory provider that extends the mock instance with the passed value.
- `MockProvider( MY_TOKEN_1, 'fake' )` - creates a factory provider that returns the specified value.
- `MockProviders( MyService1, MY_TOKEN_1, ... )` - returns an array of mocks.

Now let's pretend that in an Angular application `TargetComponent` depends on a service of `DependencyService`,
and, in favor of avoiding overhead, its mock object should be used.

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
  beforeEach(() => {
    return MockBuilder(TargetComponent)
      .mock(DependencyService)
      .mock(ObservableService, {
        prop$: EMPTY,
        getStream$: () => EMPTY,
      });
  });

  it('should create', () => {
    const fixture = MockRender(TargetComponent);
    expect(component).toBeDefined();
  });
});
```

**Please note**: The most common error developers meet, when they create mock services, is "**TypeError: Cannot read property 'subscribe' of undefined**".
If you are encountering it too, please read a section called [How to fix `TypeError: Cannot read property 'subscribe' of undefined`](#how-to-fix-typeerror-cannot-read-property-subscribe-of-undefined).

<details><summary>Click to see <strong>a usage example of mock providers in Angular tests</strong></summary>
<p>

The source file is here:
[MockProvider](https://github.com/ike18t/ng-mocks/blob/master/examples/MockProvider/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/examples/MockProvider/test.spec.ts)
to play with.

```typescript
describe('MockProvider', () => {
  const mockObj = { value: 123 };

  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
      imports: [CommonModule],
      providers: [
        MockProvider(Dependency1Service),
        MockProvider(Dependency2Service, { name: 'd2:mock' }),
        MockProvider(UNK_TOKEN, 'mock token'),
        MockProvider(STR_TOKEN, 'mock'),
        MockProvider(OBJ_TOKEN, mockObj),
        MockProvider('pri', 'pri'),
      ],
    }).compileComponents(),
  );

  it('uses mock providers', () => {
    // overriding the token's data that does affect the provided token.
    mockObj.value = 321;
    const fixture = TestBed.createComponent(TargetComponent);
    fixture.detectChanges();
    expect(
      fixture.debugElement.injector.get(Dependency1Service).echo(),
    ).toBeUndefined();
    expect(
      fixture.debugElement.injector.get(Dependency2Service).echo(),
    ).toBeUndefined();
    expect(fixture.debugElement.injector.get(OBJ_TOKEN)).toBe(
      mockObj,
    );
    expect(fixture.nativeElement.innerHTML).not.toContain('"target"');
    expect(fixture.nativeElement.innerHTML).toContain('"d2:mock"');
    expect(fixture.nativeElement.innerHTML).toContain('"mock token"');
    expect(fixture.nativeElement.innerHTML).toContain('"mock"');
    expect(fixture.nativeElement.innerHTML).toContain('"value": 321');
    expect(fixture.nativeElement.innerHTML).toContain('"pri"');
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

- `MockModule( MyModule )` - returns a mock class of `MyModule` module.
- `MockModule( MyModule.forRoots() )` - additionally to a mock class of `MyModule` module returns mock providers.

**A mock module** respects the interface of its original module as
a type of `MockedModule<T>` and provides:

- mocks of all components, directives, pipes and providers
- mocks of all imports and exports
- dummy clones of all services
- dummy abstract methods for services with a `useClass` definition
- mocks of tokens with a `useClass` definition
- respect of tokens with a `useExisting` definition
- empty objects instead of tokens with a `helperUseFactory` definition
- base primitives instead of tokens with a `useValue` definition
- mocks of tokens with a `useValue` definition

If you get an error like: "**Type is part of the declarations of 2 modules**",
then consider usage of [`MockBuilder`](#mockbuilder).
More detailed information about its cause and a solution you can read in a section called [How to fix `Type is part of the declarations of 2 modules`](#how-to-fix-error-type-is-part-of-the-declarations-of-2-modules).

Let's imagine an Angular application where `TargetComponent` depends on a module of `DependencyModule`
and we would like to use its mock object in a test.

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
  beforeEach(() => {
    return MockBuilder(TargetComponent).mock(DependencyModule);
  });

  it('should create', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.point.componentInstance).toBeDefined();
  });
});
```

There is a trick to avoid specifying all dependencies of the `TargetComponent` in the chain:
simply pass its module as the second parameter of [`MockBuilder`](#mockbuilder).
Everything in `TargetModule` will be replaced with their mocks, but not `TargetComponent`, it will stay as it is:

```typescript
// Do not forget to return the promise of MockBuilder.
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
  beforeEach(() => {
    return MockBuilder(TestedComponent).mock(DependencyModule);
  });

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

If we wanted to test the component, we would like to replace its dependencies with their mocks.
In our case it is `TodoService`.

```typescript
TestBed.configureTestingModule({
  declarations: [TodoComponent],
  providers: [MockProvider(TodoService)],
});
```

If we created a fixture, we would face an error about reading properties of `undefined`. This happens because a mock object of `TodoService.list$`
returns a spy, if [auto spy](#auto-spy) has been configured, or `undefined`. Therefore, neither has the `subscribe` property.

Obviously, to solve this, we need to get the method to return an observable stream.
For that, we could extend the mock object via passing overrides as the second parameter into [`MockProvider`](#how-to-create-a-mock-provider).

```typescript
TestBed.configureTestingModule({
  declarations: [TodoComponent],
  providers: [
    MockProvider(TodoService, {
      list$: () => EMPTY,
    }),
  ],
});
```

Profit, now initialization of the component does not throw the error anymore.

If we want to do it for all tests globally, we might use [`ngMocks.defaultMock`](#ngmocksdefaultmock).

```typescript
ngMocks.defaultMock(TodoService, () => ({
  list$: () => EMPTY,
}));
```

Then, every time tests need a mock object of `TodoService`, its `list$()` will return `EMPTY`.

Nevertheless, usually, we want not only to return a stub result as `EMPTY` observable stream,
but also to provide a fake subject, that would simulate its calls.

A possible solution is to create a context variable of `Subject` type for that.

```typescript
let todoServiceList$: Subject<any>; // <- a context variable.

beforeEach(() => {
  todoServiceList$ = new Subject(); // <- create the subject.

  TestBed.configureTestingModule({
    declarations: [TodoComponent],
    providers: [
      MockProvider(TodoService, {
        list$: () => todoServiceList$,
      }),
    ],
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

  return MockBuilder(TodoComponent).mock(TodoService, {
    list$: () => todoServiceList$,
  });
});

it('test', () => {
  const fixture = MockRender(TodoComponent);
  todoServiceList$.next([]);
  // some assertions.
});
```

This all might be implemented with [`MockInstance`](#mockinstance) too,
but it goes beyond the topic.

<details><summary>Click to see <strong>a usage example of a mock observable in Angular tests</strong></summary>
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
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  // Now we need to customize the mock object of the service.
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

    // Checking that a sibling method has been replaced
    // with a mock object too.
    expect(TestBed.inject(TargetService).getValue$).toBeDefined();
    expect(TestBed.inject(TargetService).getValue$()).toBeUndefined();
  });
});
```

</p>
</details>

[to the top](#table-of-contents)

---

### How to create a mock form control

`ng-mocks` respects `ControlValueAccessor` interface if [a directive](#how-to-create-a-mock-directive),
or [a component](#how-to-create-a-mock-component) implements it.
Apart from that, `ng-mocks` provides helper functions to emit changes and touches.

it supports both `FormsModule` and `ReactiveFormsModule`:

- `ngModel`
- `ngModelChange`
- `formControl`
- `formControlName`

* `NG_VALUE_ACCESSOR`
* `ControlValueAccessor`
* `writeValue`
* `registerOnChange`
* `registerOnTouched`

- `NG_VALIDATORS`
- `Validator`
- `NG_ASYNC_VALIDATORS`
- `AsyncValidator`
- `registerOnValidatorChange`
- `validate`

A mock object of `ControlValueAccessor` additionally implements `MockControlValueAccessor` and provides:

- `__simulateChange(value: any)` - calls `onChanged` on the mock component bound to a `FormControl`
- `__simulateTouch()` - calls `onTouched` on the mock component bound to a `FormControl`

* [`isMockControlValueAccessor( instance )`](#ismockcontrolvalueaccessor) - to verify `MockControlValueAccessor`

A mock object of `Validator` or `AsyncValidator` additionally implements `MockValidator` and provides:

- `__simulateValidatorChange()` - calls `updateValueAndValidity` on the mock component bound to a `FormControl`

* [`isMockValidator( instance )`](#ismockvalidator) - to verify `MockValidator`

<details><summary>Click to see <strong>a usage example of a mock FormControl with ReactiveForms in Angular tests</strong></summary>
<p>

The source file is here:
[MockReactiveForms](https://github.com/ike18t/ng-mocks/blob/master/examples/MockReactiveForms/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/examples/MockReactiveForms/test.spec.ts)
to play with.

```typescript
describe('MockReactiveForms', () => {
  // That's our spy on writeValue calls.
  // With auto spy this code isn't needed.
  const writeValue = jasmine.createSpy('writeValue');
  // in case of jest
  // const writeValue = jest.fn();

  // Because of early calls of writeValue, we need to install
  // the spy in the ctor call.
  beforeAll(() =>
    MockInstance(DependencyComponent, () => ({
      writeValue,
    })),
  );

  // To avoid influence in other tests
  // we need to reset MockInstance effects.
  afterAll(MockReset);

  beforeEach(() => {
    return MockBuilder(TestedComponent)
      .mock(DependencyComponent)
      .keep(ReactiveFormsModule);
  });

  it('sends the correct value to the mock form component', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // Let's find the mock form component.
    const mockControl = ngMocks.find(DependencyComponent)
      .componentInstance;

    // During initialization it should be called
    // with null.
    expect(writeValue).toHaveBeenCalledWith(null);

    // Let's simulate its change, like a user does it.
    if (isMockControlValueAccessor(mockControl)) {
      mockControl.__simulateChange('foo');
    }
    expect(component.formControl.value).toBe('foo');

    // Let's check that change on existing formControl
    // causes calls of `writeValue` on the mock component.
    component.formControl.setValue('bar');
    expect(writeValue).toHaveBeenCalledWith('bar');
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
  // That's our spy on writeValue calls.
  // With auto spy this code isn't needed.
  const writeValue = jasmine.createSpy('writeValue');
  // in case of jest
  // const writeValue = jest.fn();

  // Because of early calls of writeValue, we need to install
  // the spy in the ctor call.
  beforeAll(() =>
    MockInstance(DependencyComponent, () => ({
      writeValue,
    })),
  );

  // To avoid influence in other tests
  // we need to reset MockInstance effects.
  afterAll(MockReset);

  beforeEach(() => {
    return MockBuilder(TestedComponent)
      .mock(DependencyComponent)
      .keep(FormsModule);
  });

  it('sends the correct value to the mock form component', async () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // Let's find the mock form component.
    const mockControl = ngMocks.find(DependencyComponent)
      .componentInstance;

    // During initialization it should be called
    // with null.
    expect(writeValue).toHaveBeenCalledWith(null);

    // Let's simulate its change, like a user does it.
    if (isMockControlValueAccessor(mockControl)) {
      mockControl.__simulateChange('foo');
      fixture.detectChanges();
      await fixture.whenStable();
    }
    expect(component.value).toBe('foo');

    // Let's check that change on existing value
    // causes calls of `writeValue` on the mock component.
    component.value = 'bar';
    fixture.detectChanges();
    await fixture.whenStable();
    expect(writeValue).toHaveBeenCalledWith('bar');
  });
});
```

</p>
</details>

[to the top](#table-of-contents)

---

## Extensive example of mocks in Angular tests

The source file is here:
[main](https://github.com/ike18t/ng-mocks/blob/master/examples/main/test.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/examples/main/test.spec.ts)
to play with.

```typescript
@Pipe({
  name: 'translate',
})
class TranslatePipe implements PipeTransform {
  public transform(value: string): string {
    // Just for the test purpose
    // we don't use any translation services.
    return `translated:${value}`;
  }
}

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
          <li>
            <a [routerLink]="['/home']">{{ 'Home' | translate }}</a>
          </li>
          <li>
            <a [routerLink]="['/about']">{{ 'About' | translate }}</a>
          </li>
        </ul>
      </ng-template>
    </app-header>
    <router-outlet></router-outlet>
  `,
})
class AppComponent {
  @Output() public logoClick = new EventEmitter<void>();
  @Input() public title = 'My Application';
}

// A dependency component out of which we want to create a mock
// component with a respect of its inputs, outputs and ContentChild.
@Component({
  selector: 'app-header',
  template: `
    <a (click)="logo.emit()">
      <img src="assets/logo.png" *ngIf="showLogo" />
    </a>
    {{ title }}
    <template [ngTemplateOutlet]="menu"></template>
  `,
})
class AppHeaderComponent {
  @Output() public readonly logo = new EventEmitter<void>();
  @ContentChild('menu') public menu?: TemplateRef<ElementRef>;
  @Input() public showLogo = false;
  @Input() public title = '';
}

// The module where our components are declared.
@NgModule({
  declarations: [AppComponent, AppHeaderComponent, TranslatePipe],
  imports: [CommonModule, RouterModule.forRoot([])],
})
class AppModule {}

describe('main', () => {
  // Usually, we would have something like that.
  // beforeEach(() => {
  //   TestBed.configureTestingModule({
  //     imports: [
  //       CommonModule,
  //       RouterModule.forRoot([]),
  //     ],
  //     declarations: [
  //       AppComponent,
  //       AppHeaderComponent,
  //       TranslatePipe,
  //     ],
  //   });
  //
  //   fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  // });
  // But, usually, instead of AppHeaderComponent and TranslatePipe
  // we want to have mocks.

  // With ng-mocks it can be defined in the next way.
  beforeEach(() => {
    // AppComponent will stay as it is,
    // everything in AppModule will be replaced with their mocks.
    return (
      MockBuilder(AppComponent, AppModule)
        // Adding a special config how to create
        // a mock AppHeaderComponent.
        .mock(AppHeaderComponent, {
          render: {
            // #menu template will be rendered simultaneously
            // with the mock AppHeaderComponent.
            menu: true,
          },
        })
        // a fake transform handler.
        .mock(TranslatePipe, v => `fake:${v}`)
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
    //     MockPipe(TranslatePipe, v => `fake:${v}`),
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
    // But in this case TranslatePipe will return undefined,
    // if we don't customize it via MockInstance or defaultMock.
  });

  it('asserts behavior of AppComponent', () => {
    const logoClickSpy = jasmine.createSpy();
    // in case of jest
    // const logoClickSpy = jest.fn();

    // Instead of TestBed.createComponent(AppComponent) in beforeEach
    // MockRender might be used directly in tests.
    const fixture = MockRender(AppComponent, {
      logoClick: logoClickSpy,
      title: 'Fake Application',
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
    // but type safe and fails if nothing has been found.
    const header = ngMocks.find(AppHeaderComponent);

    // Verifies how AppComponent uses AppHeaderComponent.
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

    // Verifies that AppComponent passes the right menu into
    // AppHeaderComponent.
    const links = ngMocks.findAll(header, 'a');
    expect(links.length).toBe(2);
    const [link1, link2] = links;

    // Checking that TranslatePipe has been used.
    expect(link1.nativeElement.innerHTML).toEqual('fake:Home');
    // An easy way to get a value of an input. The same as
    // links[0].injector.get(RouterLinkWithHref).routerLink
    expect(ngMocks.input(link1, 'routerLink')).toEqual(['/home']);

    expect(link2.nativeElement.innerHTML).toEqual('fake:About');
    expect(ngMocks.input(link2, 'routerLink')).toEqual(['/about']);
  });
});
```

Our tests:

- [sandbox on codesandbox.io](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/e2e.ts)
- [examples from the doc](https://github.com/ike18t/ng-mocks/tree/master/examples)
- [current e2e tests](https://github.com/ike18t/ng-mocks/tree/master/tests)

[to the top](#table-of-contents)

---

## Functions for easy builds of mocks and template rendering

The section provides information about essential functions for creating mocks with minimum coding.

- [`MockBuilder`](#mockbuilder) - creates meta for the testing module where declarations are their mocks
- [`MockRender`](#mockrender) - renders custom templates
- [`MockInstance`](#mockinstance) - extends mocks on an early stage
- [`ngMocks`](#ngmocks) - facilitates work with fixtures

---

### MockBuilder

`MockBuilder` is the simplest way to create mocks out of everything.
It provides a rich toolkit of functions to manipulate the mocks in the way your test requires,
but with minimum overhead.

Usually, we have something simple to test, but time to time, the simplicity is killed by nightmarish dependencies.
The good thing here is that commonly the dependencies have been declared or imported in the same module, where our
tested thing is. Therefore, with help of `MockBuilder` we can quite easily define a testing module,
where everything in the module will be replaced with their mocks, except the tested thing: `MockBuilder( TheThing, ItsModule )`.

MockBuilder tends to provide **a simple instrument to turn Angular dependencies into their mocks**,
does it in isolated scopes,
and has a rich toolkit that supports:

- detection and creation of mocks for root providers
- replacement of modules and declarations in any depth
- exclusion of modules, declarations and providers in any depth

* [Factory function](#mockbuilder-factory)
* [`.keep()`](#mockbuilderkeep)
* [`.mock()`](#mockbuildermock)
* [`.exclude()`](#mockbuilderexclude)
* [`.replace()`](#mockbuilderreplace)
* [`.provide()`](#mockbuilderprovide)
* [`precise` flag](#mockbuilder-precise-flag)
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
[MockBuilder](https://github.com/ike18t/ng-mocks/blob/master/examples/MockBuilder/test.simple.spec.ts).<br>
Prefix it with `fdescribe` or `fit` on
[codesandbox.io](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/examples/MockBuilder/test.simple.spec.ts)
to play with.

```typescript
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
// Do not forget to return the promise of MockBuilder.
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

#### MockBuilder.mock

If we want to turn anything into a mock object, even a part of a kept module we should use `.mock`.

```typescript
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

```typescript
beforeEach(() => {
  return MockBuilder(MyComponent, MyModule).mock(
    SomePipe,
    value => 'My Custom Content',
  );
});
```

For services and tokens, we can optionally provide their stubs.
Please keep in mind that the mock object of the service will be extended with the provided value.

```typescript
beforeEach(() => {
  return MockBuilder(MyComponent, MyModule)
    .mock(SomeService3, anything1)
    .mock(SOME_TOKEN, anything2);
});
```

#### MockBuilder.exclude

If we want to exclude something, even a part of a kept module we should use `.exclude`.

```typescript
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

#### MockBuilder.replace

If we want to replace something with something, we should use `.replace`.
The replacement has to be decorated with the same decorator as the source.
It is not impossible to replace a provider / service, we should use [`.provide`](#mockbuilderprovide) or [`.mock`](#mockbuildermock) for that.

```typescript
beforeEach(() => {
  return MockBuilder(MyComponent, MyModule)
    .replace(SomeModule, SomeOtherModule)
    .replace(SomeComponent, SomeOtherComponent)
    .replace(SomeDirective, SomeOtherDirective)
    .replace(SomePipe, SomeOtherPipe);
});
```

In case of `HttpClientTestingModule` you can use `.replace` too.

```typescript
beforeEach(() => {
  return MockBuilder(MyComponent, MyModule).replace(
    HttpClientModule,
    HttpClientTestingModule,
  );
});
```

In case of `RouterTestingModule` you need to use [`.keep`](#mockbuilderkeep) for both of the modules and to pass an empty array into `.withRoutes`.

```typescript
beforeEach(() => {
  return MockBuilder(MyComponent, MyModule)
    .keep(RouterModule)
    .keep(RouterTestingModule.withRoutes([]));
});
```

#### MockBuilder.provide

If we want to add or replace providers / services, we should use `.provide`. It has the same interface as a regular provider.

```typescript
beforeEach(() => {
  return MockBuilder(MyComponent, MyModule)
    .provide(MyService)
    .provide([SomeService1, SomeService2])
    .provide({ provide: SomeComponent3, useValue: anything1 })
    .provide({ provide: SOME_TOKEN, useFactory: () => anything2 });
});
```

#### MockBuilder `precise` flag

By default, when [`.mock(MyService, mock)`](#mockbuildermock) is used it creates a mock object via
[`MockService(MyService, mock)`](#how-to-create-a-mock-service).
In some cases, we might want to use the exactly passed mock object instead of extension.
For this behavior we need to set `precise` flag to `true`. Tokens are always precise.

```typescript
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

#### MockBuilder `export` flag

If we want to test a component, directive or pipe which, unfortunately, has not been exported,
then we need to mark it with the `export` flag.
Does not matter how deep it is. It will be exported to the level of `TestingModule`.

```typescript
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

#### MockBuilder `exportAll` flag

If we want to use all the declarations of a module which have not been exported,
we need to mark the module with the `exportAll` flag. Then all its imports and declarations will be exported.
If the module is nested, then add the [`export`](#mockbuilder-export-flag) flag beside `exportAll` too.

```typescript
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

#### MockBuilder `dependency` flag

By default, all definitions are added to the `TestingModule` if they are not a dependency of another definition.
Modules are added as imports to the `TestingModule`.
Components, Directive, Pipes are added as declarations to the `TestingModule`.
Tokens and Services are added as providers to the `TestingModule`.
If we do not want something to be added to the `TestingModule` at all, then we need to mark it with the `dependency` flag.

```typescript
beforeEach(() => {
  return (
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
      })
  );
});
```

#### MockBuilder `render` flag

If we want to render a structural directive by default. Now we can do that via adding the `render` flag in its config.

```typescript
beforeEach(() => {
  return MockBuilder(MyComponent, MyModule).mock(MyDirective, {
    render: true,
  });
});
```

If the directive has own context and variables. Then instead of setting `render` to true we can set the context.

```typescript
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

```typescript
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

#### `NG_MOCKS_GUARDS` token

If we want to test guards, we need to [`.keep`](#mockbuilderkeep) them, but what should we do with other guards we do not want to care about at all?
The answer is to exclude `NG_MOCKS_GUARDS` token, it will **remove all the guards from routes** except the explicitly configured ones.

```typescript
beforeEach(() => {
  return MockBuilder(MyGuard, MyModule).exclude(NG_MOCKS_GUARDS);
});
```

#### `NG_MOCKS_INTERCEPTORS` token

Usually, when we want to test an interceptor, we want to avoid influences of other interceptors.
To **remove all interceptors in an angular test** we need to exclude `NG_MOCKS_INTERCEPTORS` token,
then all interceptors will be excluded except the explicitly configured ones.

```typescript
beforeEach(() => {
  return MockBuilder(MyInterceptor, MyModule).exclude(
    NG_MOCKS_INTERCEPTORS,
  );
});
```

#### `NG_MOCKS_ROOT_PROVIDERS` token

There are root services and tokens apart from provided ones in Angular applications.
It might happen that in a test we want these providers to be replaced with their mocks or to be kept.

If we want to replace all root providers with their mocks in an angular test,
we need to pass `NG_MOCKS_ROOT_PROVIDERS` token into [`.mock`](#mockbuildermock).

```typescript
beforeEach(() => {
  return MockBuilder(
    MyComponentWithRootServices,
    MyModuleWithRootTokens,
  ).mock(NG_MOCKS_ROOT_PROVIDERS);
});
```

In contrast to that, we might want to keep all root providers for mock declarations.
For that, we need to keep `NG_MOCKS_ROOT_PROVIDERS` token.

```typescript
beforeEach(() => {
  return MockBuilder(
    MyComponentWithRootServices,
    MyModuleWithRootTokens,
  ).keep(NG_MOCKS_ROOT_PROVIDERS);
});
```

If we do not pass `NG_MOCKS_ROOT_PROVIDERS` anywhere,
then only root providers for kept modules will stay as they are.
All other root providers will be replaced with their mocks, even for kept declarations of mock modules.

#### MockBuilder good to know

Anytime we can change our decision. The last action on the same object wins.
`SomeModule` will be replaced with its mock object.

```typescript
beforeEach(() => {
  return MockBuilder(MyComponent, MyModule)
    .keep(SomeModule)
    .mock(SomeModule)
    .keep(SomeModule)
    .mock(SomeModule);
});
```

[to the top](#table-of-contents)

---

### MockRender

`MockRender` is a simple tool that helps with **shallow rendering in Angular tests**
when we want to assert `Inputs`, `Outputs`, `ChildContent` and custom templates.

The best thing about it is that `MockRender` properly triggers all lifecycle hooks
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
  // Do not forget to return the promise of MockBuilder.
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
    // in case of jest
    // const logoClickSpy = jest.fn();

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

- `MockInstance( MyService, ( instance, injector ) => void)` - sets the callback to initialize an instance.
- `MockInstance( MyService, config: {init: Function} )` - sets the config, currently only `init` is supported, it is the callback.
- `MockInstance( MyService )` - removes initialization from the service.
- `MockReset()` - removes initialization from all services.

The time to use it is definitely when a test fails like:

- [TypeError: Cannot read property 'subscribe' of undefined](#how-to-fix-typeerror-cannot-read-property-subscribe-of-undefined)
- [TypeError: Cannot read property 'pipe' of undefined](#how-to-fix-typeerror-cannot-read-property-subscribe-of-undefined)
- or any other issue like reading properties or calling methods of undefined

Or you want to customize a mock declaration which is accessed via:

- `@ViewChild`
- `@ViewChildren`
- `@ContentChild`
- `@ContentChildren`

Let's pretend a situation when our component uses `ViewChild` to access a child component instance.

```typescript
class RealComponent implements AfterViewInit {
  @ViewChild(ChildComponent) public readonly child: ChildComponent;

  ngAfterViewInit() {
    this.child.update$.subscribe();
  }
}
```

When we test `RealComponent` we would like to have a mock `ChildComponent`,
and it would mean, if we replaced it with a mock `ChildComponent` then its `update$` would be return `undefined`,
therefore our test would fail in `ngAfterViewInit` because of [`TypeError: Cannot read property 'subscribe' of undefined`](#how-to-fix-typeerror-cannot-read-property-subscribe-of-undefined).

In our case, we have a component instance created by Angular, and does not look like `TestBed` provides
a solution here. That's where `ng-mocks` helps again with the `MockInstance` helper function.
It accepts a class as the first parameter, and a tiny callback describing how to customize its instances as the second one.

```typescript
beforeAll(() =>
  MockInstance(ChildComponent, () => ({
    // Now we can customize a mock object of ChildComponent in its ctor call.
    // The object will be extended with the returned object.
    update$: EMPTY,
  })),
);
```

Profit. Now, when Angular creates an instance of `ChildComponent` the callback is called in its ctor and `update$` property
of the instance is an `Observable` instead of `undefined`.

After testing, you should reset changes to avoid their influence in other tests via a call of
`MockInstance(ChildComponent)` without the second parameter or simply
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
  // with its mock object.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(RealComponent).mock(ChildComponent));

  beforeAll(() => {
    // Because TargetComponent is replaced with its mock object,
    // its update$ is undefined and ngAfterViewInit of the parent
    // component will fail on .subscribe().
    // Let's fix it via defining customization for the mock object.
    MockInstance(ChildComponent, () => ({
      // comment the next line to check the failure.
      update$: EMPTY,
    }));
  });

  // Do not forget to reset MockInstance back.
  afterAll(MockReset);

  it('should render', () => {
    // Without the custom initialization rendering would fail here
    // with "Cannot read property 'subscribe' of undefined".
    expect(() => MockRender(RealComponent)).not.toThrow();
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
- [`.defaultMock()`](#ngmocksdefaultmock)
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

If there is a module in the second parameter, then its guts will be replaced with their mocks excluding things from the first parameter.
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

#### ngMocks.defaultMock

Sets default values for mocks in the whole testing environment.

- `ngMocks.defaultMock(MyClass, (instance, injector) => overrides)` - adds an override for a class
- `ngMocks.defaultMock(TOKEN, (value, injector) => value)` - adds an override for a token
- `ngMocks.defaultMock(MyClass)` - removes overrides
- `ngMocks.defaultMock(TOKEN)` - removes overrides

The best place to do that is in `src/test.ts` for jasmine or in `src/setupJest.ts` for jest.

For example, if a service or a component has a property that should be an `Observable`.
Then, we can configure it to be an `EMPTY` stream in the whole test suite.

```typescript
declare class MyComponent {
  public url: string;
  public stream$: Observable<void>;
  public getStream(): Observable<void>;
}
```

```typescript
// src/test.ts

// the returned object will be applied to the component instance.
ngMocks.defaultMock(MyComponent, () => ({
  stream$: EMPTY,
  getStream: () => EMPTY,
}));

// manual override.
ngMocks.defaultMock(MyComponent, instance => {
  instance.stream$ = EMPTY;
});

// overriding tokens.
ngMocks.defaultMock(MY_TOKEN, () => 'DEFAULT_VALUE');

// url will be 'DEFAULT_VALUE'.
ngMocks.defaultMock(MyComponent, (_, injector) => ({
  url: injector.get(MY_TOKEN),
}));

// removing all overrides.
ngMocks.defaultMock(MyComponent);
```

#### ngMocks.get

Returns an attribute or structural directive which belongs to the current element.

- `ngMocks.get( debugElement, directive, notFoundValue? )`

```typescript
const directive = ngMocks.get(fixture.debugElement, Directive);
```

#### ngMocks.findInstance

Returns the first found component, directive, pipe or service which belongs to the current element or its any child.
If the element isn't specified, then the current fixture is used.

- `ngMocks.findInstance( fixture?, directive, notFoundValue? )`
- `ngMocks.findInstance( debugElement?, directive, notFoundValue? )`

```typescript
const directive1 = ngMocks.findInstance(Directive1);
const directive2 = ngMocks.findInstance(fixture, Directive2);
const directive3 = ngMocks.findInstance(
  fixture.debugElement,
  Directive3,
);
const pipe = ngMocks.findInstance(fixture.debugElement, MyPipe);
const service = ngMocks.findInstance(fixture, MyService);
```

#### ngMocks.findInstances

Returns an array of all found components, directives, pipes or services which belong to the current element and all its children.
If the element isn't specified, then the current fixture is used.

- `ngMocks.findInstances( fixture?, directive )`
- `ngMocks.findInstances( debugElement?, directive )`

```typescript
const directives1 = ngMocks.findInstances(Directive1);
const directives2 = ngMocks.findInstances(fixture, Directive2);
const directives3 = ngMocks.findInstances(
  fixture.debugElement,
  Directive3,
);
const pipes = ngMocks.findInstances(fixture.debugElement, MyPipe);
const services = ngMocks.findInstance(fixture, MyService);
```

#### ngMocks.find

Returns a found DebugElement which belongs to a component with the correctly typed componentInstance,
or matches a css selector.
If a root element or a fixture aren't specified, then the current fixture is used.

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
If a root element or a fixture aren't specified, then the current fixture is used.

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

`ng-mocks` provides several functions which help with **detection of mock objects**.
For example, they are useful in situations when we want to render `ChildContent` of a mock component,
or to touch a mock form control.

- [isMockControlValueAccessor](#ismockcontrolvalueaccessor)
- [isMockValidator](#ismockvalidator)
- [isMockOf](#ismockof)
- [isMockedNgDefOf](#ismockedngdefof)
- [getMockedNgDefOf](#getmockedngdefof)
- [isNgDef](#isngdef)
- [getSourceOfMock](#getsourceofmock)
- [isNgInjectionToken](#isnginjectiontoken)

#### isMockControlValueAccessor

This function helps when you need to access callbacks
which were set via `registerOnChange` and `registerOnTouched`
on a mock object that implements `ControlValueAccessor`,
and to call `__simulateChange`, `__simulateTouch` to trigger them.
It verifies whether an instance respects `MockControlValueAccessor` interface.

You need it when you get an error like:

- `Property '__simulateChange' does not exist on type ...`
- `Property '__simulateTouch' does not exist on type ...`

```typescript
const instance = ngMocks.findInstance(MyCustomFormControl);
// instance.__simulateChange('foo'); // doesn't work.
if (isMockControlValueAccessor(instance)) {
  // now works
  instance.__simulateChange('foo');
  instance.__simulateTouch();
}
```

#### isMockValidator

The function is useful when you need to access the callback
which was set via `registerOnValidatorChange`
on a mock object that implements `Validator` or `AsyncValidator`,
and to call `__simulateValidatorChange` to trigger it.
It verifies whether an instance respects `MockValidator` interface.

You need it when you get an error like:

- `Property '__simulateValidatorChange' does not exist on type ...`

```typescript
const instance = ngMocks.findInstance(MyValidatorDirective);
// instance.simulateValidatorChange(); // doesn't work.
if (isMockValidator(instance)) {
  // now works
  instance.__simulateValidatorChange();
}
```

#### isMockOf

This function helps when we want to use `ng-mocks` tools for rendering,
but typescript doesn't recognize `instance` as a mock object.

You need this when you get an error like:

- `Property '__render' does not exist on type ...`
- `Property '__hide' does not exist on type ...`

```typescript
if (isMockOf(instance, SomeComponent, 'c')) {
  instance.__render('block', '$implicit');
  instance.__hide('block');
}
if (isMockOf(instance, StructuralDirective, 'd')) {
  instance.__render('$implicit');
  instance.__hide();
}
```

- `isMockOf( inst, SomeClass, 'm' )` - checks whether `inst` is an instance of `MockedModule<SomeClass>`
- `isMockOf( inst, SomeClass, 'c' )` - checks whether `inst` is an instance of `MockedComponent<SomeClass>`
- `isMockOf( inst, SomeClass, 'd' )` - checks whether `inst` is an instance of `MockedDirective<SomeClass>`
- `isMockOf( inst, SomeClass, 'p' )` - checks whether `inst` is an instance of `MockedPipe<SomeClass>`
- `isMockOf( inst, SomeClass )` - checks whether `inst` is an instance of mock `SomeClass`

#### isMockedNgDefOf

This function helps when we need to verify that a class is actually a mock class.

- `isMockedNgDefOf( MockClass, SomeClass, 'm' )` - checks whether `MockClass` is a mock object of `SomeClass` and a module
- `isMockedNgDefOf( MockClass, SomeClass, 'c' )` - checks whether `MockClass` is a mock object of `SomeClass` and a component
- `isMockedNgDefOf( MockClass, SomeClass, 'd' )` - checks whether `MockClass` is a mock object of `SomeClass` and a directive
- `isMockedNgDefOf( MockClass, SomeClass, 'p' )` - checks whether `MockClass` is a mock object of `SomeClass` and a pipe
- `isMockedNgDefOf( MockClass, SomeClass )` - checks whether `MockClass` is a mock object of `SomeClass`

#### getMockedNgDefOf

This function helps when in a test we want to get a mock class of something configured in TestBed.

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

This function returns the origin of a mock class.

- `getSourceOfMock( MockClass )` - returns the source class of `MockClass`

#### isNgInjectionToken

This function verifies tokens.

- `isNgInjectionToken( TOKEN )` - checks whether `TOKEN` is a token

[to the top](#table-of-contents)

---

### Usage with 3rd-party libraries

`ng-mocks` provides flexibility via [`ngMocks.guts`](#ngmocksguts) and [`MockBuilder`](#mockbuilder)
that allows developers to use other **Angular testing libraries**,
and at the same time to **turn dependencies into mocks**.

For example, if we use `@ngneat/spectator` and its functions
like `createHostFactory`, `createComponentFactory`, `createDirectiveFactory` and so on,
then to get mock declarations properly we need:

- exclude the component we want to test
- to turn declarations of its module into mocks
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

Profit.
[Subscribe](https://github.com/ike18t/ng-mocks),
[like](https://github.com/ike18t/ng-mocks),
[share](https://twitter.com/intent/tweet?text=Check+ng-mocks+package&url=https%3A%2F%2Fgithub.com%2Fike18t%2Fng-mocks)!

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
  beforeEach(() => {
    return MockBuilder(TargetComponent, TargetModule).keep(
      TargetService,
    );
  });

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
  // with its mock object.
  // Do not forget to return the promise of MockBuilder.
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
  // with its mock object.
  beforeEach(() => {
    return MockBuilder(TargetComponent).mock(TargetService, mock);
  });
});
```

</p>
</details>

[to the top](#table-of-contents)

---

### Auto Spy

If you want **automatically to spy all methods of components, directives, pipes and services in Angular tests** then
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

---

## How to fix an error in Angular tests

We may encounter different unpleasant issues, when we create mocks in testing environment.

There is a list of most common issues and their solutions below,
feel free to [contact us](#find-an-issue-or-have-a-question-or-a-request) if you are facing or struggling with them or anything else.

- [`TypeError: Cannot read property 'subscribe' of undefined`](#how-to-fix-typeerror-cannot-read-property-subscribe-of-undefined)
- [`Error: Type is part of the declarations of 2 modules`](#how-to-fix-error-type-is-part-of-the-declarations-of-2-modules)
- [`Error: Directive has no selector, please add it!`](#how-to-fix-error-directive-has-no-selector-please-add-it)
- [`Template parse errors: <component> is not a known element`](#how-to-fix-template-parse-errors-component-is-not-a-known-element)

---

### How to fix `TypeError: Cannot read property 'subscribe' of undefined`

This issue means that something has been replaced with a mock object and returns a dummy result (`undefined`) instead of observable streams.

There is an answer for this error in the section called [How to create a mock observable](#how-to-create-a-mock-observable),
if the error has been triggered by a mock service, and its property is of type of `undefined`.

Or you might check [`MockInstance`](#mockinstance) or [`ngMocks.defaultMock`](#ngmocksdefaultmock)
in case if the error has been caused by a mock component or a mock directive.

[to the top](#table-of-contents)

---

### How to fix `Error: Type is part of the declarations of 2 modules`

If you encounter the issue, highly likely it means that a mock declaration,
usually a mock module, contains something, that is declared in the `TestBed` module directly.

Let's imagine a situation that we have a module which exports declarations, for example directives, we need in our test.
At the same time, we have another module that has other declarations, our component depends on,
we would like to turn into a mock object, but, at the same time, it imports the same module we want to keep as it is
via an import in `TestBed`.

```typescript
TestBed.configureTestingModule({
  imports: [
    SharedModule,
    MockModule(ModuleWithServicesAndSharedModule),
  ],
  declarations: [ComponentToTest],
});
```

The problem is clear: when we create the mock module, [`MockModule`](#how-to-create-a-mock-module) recursively creates its mock dependencies, and, therefore, it creates a mock class of `SharedModule`.
Now imported and mock declarations are part of 2 modules.

To solve this, we need to let [`MockModule`](#how-to-create-a-mock-module) know, that `SharedModule` should stay as it is.

There are good and bad news.
The bad news is that [`MockModule`](#how-to-create-a-mock-module) does not support that,
but the good news is that `ng-mocks` has [`MockBuilder`](#mockbuilder) for such a complicated case.
The only problem now is to rewrite `beforeEach` to use [`MockBuilder`](#mockbuilder) instead of [`MockModule`](#how-to-create-a-mock-module).
A possible solution might look like:

```typescript
beforeEach(() => {
  return MockBuilder(ComponentToTest)
    .keep(SharedModule)
    .mock(ModuleWithServicesAndSharedModule);
});
```

The configuration says that we want to test `ComponentToTest`, which depends on `SharedModule` and `ModuleWithServicesAndSharedModule`, but `SharedModule` should stay as it is.

Now, during the building process, [`MockBuilder`](#mockbuilder) will keep `SharedModule` as it is, although it is a dependency of the mock module, and that avoids declarations of the same things in 2 modules.

More detailed information how to use it you can find in the section called [`MockBuilder`](#mockbuilder).

[to the top](#table-of-contents)

---

### How to fix Error: Directive has no selector, please add it!

This issue means that a module imports a declaration (usually a parent class) which does not have a selector.
Such directives and components are created during a [migration](https://angular.io/guide/migration-undecorated-classes)
if their parent classes haven't been decorated yet.

The right fix is to remove these declarations from modules, only final classes should be specified in there.

If you cannot remove them for a reason, for example, it is a 3rd-party library,
then you need to write tests with usage of [`MockBuilder`](#mockbuilder) and its [`.exclude`](#mockbuilderexclude) feature.

```typescript
beforeEach(() => {
  return MockBuilder(MyComponent, MyModule).exclude(ParentDirective);
});
```

That fixes declarations of the module and resolves the error,
a directive without a selector has been gone from the module definition.

[to the top](#table-of-contents)

---

### How to fix Template parse errors: \<component\> is not a known element

This error might happen in a test when we have a mock module of the module
a testing component depends on, but its declarations have not been exported.

```typescript
@NgModule({
  declarations: [DependencyComponent],
})
class MyModule {}
```

```typescript
beforeEach(() => {
  TestBed.configureTestingModule({
    declarations: [
      MyComponent, // <- the only declaration we care about.
    ],
    imports: [MockModule(MyModule)],
  });
  return TestBed.compileComponents();
});
```

In this case, a test will throw `Template parse errors: <DependencyComponent> is not a known element`.

The problem here is that `DependencyComponent` isn't exported,
and to get access to a mock `DependencyComponent` we need either
to declare it on the same level where `MyComponent` has been declared
or to export `DependencyComponent`.

there are 3 solutions to do it:

1. to call [`MockComponent`](#how-to-create-a-mock-component) on it directly in the `TestBed`

   ```typescript
   beforeEach(() => {
     TestBed.configureTestingModule({
       declarations: [
         MyComponent,
         MockComponent(DependencyComponent),
       ],
     });
     return TestBed.compileComponents();
   });
   ```

2. to use [`ngMocks.guts`](#ngmocksguts),
   it does the same things as the first solution,
   but provides mocks of all imports and declarations from `MyModule`.

   ```typescript
   beforeEach(() => {
     TestBed.configureTestingModule(
       ngMocks.guts(MyComponent, MyModule),
     );
     return TestBed.compileComponents();
   });
   ```

3. to use [`MockBuilder`](#mockbuilder),
   its behavior differs from the solutions above. It creates a mock `MyModule`,
   that exports all its imports and declarations including a mock `DependencyComponent`.

   ```typescript
   // Do not forget to return the promise of MockBuilder.
   beforeEach(() => MockBuilder(MyComponent, MyModule));
   ```

Profit. More detailed information about pros and cons of each approach you can read in
[motivation and easy start from ng-mocks](#motivation-and-easy-start).

[to the top](#table-of-contents)
