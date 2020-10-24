[![npm version](https://badge.fury.io/js/ng-mocks.svg)](https://badge.fury.io/js/ng-mocks)
[![Build Status](https://travis-ci.org/ike18t/ng-mocks.png?branch=master)](https://travis-ci.org/ike18t/ng-mocks)
[![Coverage Status](https://coveralls.io/repos/github/ike18t/ng-mocks/badge.svg?branch=master)](https://coveralls.io/github/ike18t/ng-mocks?branch=master)
[![Gitter](https://badges.gitter.im/ng-mocks/community.svg)](https://gitter.im/ng-mocks/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

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

There is a preconfigured sandbox on [codesandbox.io](https://codesandbox.io/s/github/satanTime/ng-mocks-cs?file=/src/test.spec.ts)
where you might check all the features.

### Why use this?

Sure, you could flip a flag on schema errors to make your component dependencies not matter.
Or you could use `ngMocks` to mock them out and have the ability to assert on their inputs or emit on an output to assert on a side effect.

### Content:

- [How to install](#install)
- [Motivation and easy start](#motivation-and-easy-start)

* [How to mock a component](#how-to-mock-a-component)
* [How to mock a directive](#how-to-mock-a-directive)
* [How to mock a pipe](#how-to-mock-a-pipe)
* [How to mock a service](#how-to-mock-a-service)
* [How to mock a module](#how-to-mock-a-module)
* [How to mock classic and reactive form components](#how-to-mock-classic-and-reactive-form-components)

- [Extensive example](#extensive-example-of-mocks-in-angular-tests)

* [`MockBuilder` in details](#mockbuilder)
* [`MockRender` in details](#mockrender)
* [`MockInstance` in details](#mockinstance)
* [`ngMocks` in details](#ngmocks)
* [Helper functions](#helper-functions)
  - [isMockOf](#ismockof)
  - [isMockedNgDefOf](#ismockedngdefof)
  - [getMockedNgDefOf](#getmockedngdefof)
  - [isNgDef](#isngdef)
  - [getSourceOfMock](#getsourceofmock)
  - [isNgInjectionToken](#isnginjectiontoken)

- [Usage with 3rd-party libraries](#usage-with-3rd-party-libraries)
- [Making tests faster](#making-angular-tests-faster)
- [Auto Spy](#auto-spy)

* [How to test a component](#how-to-test-a-component)
* [How to test a provider of a component](#how-to-test-a-provider-of-a-component)
* [How to test an attribute directive](#how-to-test-an-attribute-directive)
* [How to test a structural directive](#how-to-test-a-structural-directive)
* [How to test a structural directive with context](#how-to-test-a-structural-directive-with-context)
* [How to test a provider of a directive](#how-to-test-a-provider-of-a-directive)
* [How to test a pipe](#how-to-test-a-pipe)
* [How to test a provider](#how-to-test-a-provider)

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

`ngMocks` helps to bring fun and ease back allowing developers **to mock
and/or stub child components** and dependencies via a few lines of code with help of
[`MockComponent`](#how-to-mock-a-component),
[`MockDirective`](#how-to-mock-a-directive),
[`MockPipe`](#how-to-mock-a-pipe),
[`MockService`](#how-to-mock-a-service),
[`MockModule`](#how-to-mock-a-module) and
[`MockBuilder`](#mockbuilder).

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
});
```

And... nobody knows which dependencies the dependencies have.
Although, we definitely know that we do not want to worry about them.

That's where `ngMocks` comes for help. Simply pass all the dependencies
into **helper functions to get their mocked copies** and to avoid dependency hustle.

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
Its first argument accepts things we want to test (avoid mocking) and
the second argument accepts things we want to mock, if it is a module,
its declarations (guts) will be extracted and mocked except the things
from the first argument.

```typescript
const testModuleMeta = ngMocks.guts(AppBaseComponent, AppBaseModule);
// feel free to add extra stuff
// testModuleMeta.providers.push({
//   provide: SearchServce,
//   useValue: SpiedSearchServce,
// });
TestBed.configureTestingModule(testModuleMeta);
```

Profit, but what about lazy loaded modules?

If we have a lazy module, then it alone might be not sufficient, and
we need to add its parent module, for example `AppModule`.
In such a case, simply pass an array of modules as the second
argument.

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

Profit. Subscribe, like, share!

Below more detailed documentation begins, please bear with us.

---

## How to mock a component

There is a `MockComponent` function. It covers almost all needs for mocking behavior.

- `MockComponent(MyComponent)` - returns a mocked copy of `MyComponent` component.
- `MockComponents(MyComponent1, SomeComponent2, ...)` - returns an array of mocked components.

<small>**Hint**: If you see that `MockComponent` does not cover functionality you need,
then I would recommend you to use [`MockBuilder`](#mockbuilder).
It extends features of `MockComponent`.</small>

<small>**Hint**: Don't miss [Motivation and easy start](#motivation-and-easy-start) if you haven't read it yet.</small>

**A mocked copy of an angular component** respects its original component as
a type of `MockedComponent<T>` and provides:

- the same `selector`
- the same `Inputs` and `Outputs` with alias support
- templates are pure `ng-content` tags to allow transclusion
- supports `@ContentChild` with `$implicit` context
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

To mock the child component simply pass `DependencyComponent` into `MockComponent`:

```typescript
beforeEach(() => {
  TestBed.configureTestingModule({
    declarations: [
      TargetComponent,
      MockComponent(DependencyComponent), // <- profit
    ],
  });
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
[examples/MockComponent/test.spec.ts](https://github.com/ike18t/ng-mocks/blob/master/examples/MockComponent/test.spec.ts)

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

---

## How to mock a directive

There is a `MockDirective` function covering almost all needs for mocking behavior.

- `MockDirective(MyDirective)` - returns a mocked copy of `MyDirective` directive.
- `MockDirectives(MyDirective1, MyDirective2, ...)` - returns an array of mocked directives.

<small>**Hint**: If you see that `MockDirective` does not cover functionality you need,
then I would recommend you to use [`MockBuilder`](#mockbuilder).
It extends features of `MockDirective`.</small>

<small>**Hint**: Don't miss [Motivation and easy start](#motivation-and-easy-start) if you haven't read it yet.</small>

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

To **mock the child directive** simply pass `DependencyDirective` into `MockDirective`:

```typescript
beforeEach(() => {
  TestBed.configureTestingModule({
    declarations: [
      TargetComponent,
      MockDirective(DependencyDirective), // <- profit
    ],
  });
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
[examples/MockDirective-Attribute/test.spec.ts](https://github.com/ike18t/ng-mocks/blob/master/examples/MockDirective-Attribute/test.spec.ts)

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
    fixture.detectChanges();

    // Assert on the effect.
    mockedDirective.someOutput.emit({
      payload: 'foo',
    });
  });
});
```

</p>
</details>

<details><summary>Click to see <strong>an example of mocking structural directives in Angular tests</strong></summary>
<p>

It's important to render a structural directive first with the right context,
if you want to assert on its nested elements.

The source file is here:
[examples/MockDirective-Structural/test.spec.ts](https://github.com/ike18t/ng-mocks/blob/master/examples/MockDirective-Structural/test.spec.ts)

```typescript
describe('MockDirective', () => {
  // IMPORTANT: by default structural directives are not rendered.
  // Because they might require context which should be provided.
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

---

## How to mock a pipe

`MockPipe` is a function that mocks pipes for needs in Angular testing.

- `MockPipe(MyPipe)` - returns a mocked copy of `MyPipe` pipe that always returns `undefined`.
- `MockPipe(MyPipe, value => 'stub behavior')` - returns a mocked copy of `MyPipe` pipe.
- `MockPipes(MyPipe1, MyPipe2, ...)` - returns an array of mocked directives.

<small>**Hint**: If you see that `MockPipe` does not cover functionality you need,
then I would recommend you to use [`MockBuilder`](#mockbuilder).
It extends features of `MockPipe`.</small>

<small>**Hint**: Don't miss [Motivation and easy start](#motivation-and-easy-start) if you haven't read it yet.</small>

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

To **mock the child pipe** simply pass `DependencyPipe` into `MockPipe`:

```typescript
beforeEach(() => {
  TestBed.configureTestingModule({
    declarations: [
      TargetComponent,
      MockPipe(DependencyPipe), // <- profit
    ],
  });
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
[examples/MockPipe/test.spec.ts](https://github.com/ike18t/ng-mocks/blob/master/examples/MockPipe/test.spec.ts)

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

---

## How to mock a service

`ngMocks` provides a `MockService` function that tries its best
to facilitate creation of mocked copies of services.
It tends to avoid hustle of providing customized mocks for huge services.
Simply pass a class into it and its result wil be a mocked instance that respects the class,
but all methods and properties are customizable dummies.

- `MockService(MyService)` - returns a mocked instance of `MyService` class.
- `MockService(MyOb)` - returns a mocked clone of `MyOb` object.

<small>**Hint**: If you see that `MockService` does not cover functionality you need,
then I would recommend you to use [`MockBuilder`](#mockbuilder).
It extends features of `MockService`.</small>

<small>**Hint**: Don't miss [Motivation and easy start](#motivation-and-easy-start) if you haven't read it yet.</small>

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
        DependencyService, // <- annoying dependency
      ],
    });

    fixture = TestBed.createComponent(TargetComponent);
    component = fixture.componentInstance;
  });
});
```

To **mock a service** simply pass `DependencyService` into `MockService`:

```typescript
beforeEach(() => {
  TestBed.configureTestingModule({
    declarations: [TargetComponent],
    providers: [
      {
        provide: DependencyService,
        useValue: MockService(DependencyService), // <- profit
      },
    ],
  });
});
```

Or to be like a pro use [`MockBuilder`](#mockbuilder), `.mock` method
and call [`MockRender`](#mockrender):

```typescript
describe('Test', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent).mock(
      DependencyService,
      MockService(DependencyService)
    )
  );

  it('should create', () => {
    const fixture = MockRender(TargetComponent);
    expect(component).toBeDefined();

    const service = fixture.point.componentInstance.service;
    expect(service).toBeDefined();

    // Creating a spy on the getter.
    spyOnProperty(service, 'name', 'get').and.returnValue('mock');
    // for jest
    // spyOnProperty(service, 'name', 'get').mockReturnValue('mock');
    expect(service.name).toEqual('mock');

    // Creating a spy on the setter.
    spyOnProperty(service, 'name', 'set');
    service.name = 'mock';
    expect(ngMocks.stub(service, 'name', 'set')).toHaveBeenCalledWith(
      'mock'
    );

    // Creating a spy on the method.
    spyOn(service, 'nameMethod').and.returnValue('mock');
    // for jest
    // spyOn(service, 'nameMethod').mockReturnValue('mock');
    expect(service.nameMethod('mock')).toEqual('mock');
    expect(ngMocks.stub(service, 'nameMethod')).toHaveBeenCalledWith(
      'mock'
    );
  });
});
```

---

## How to mock a module

There is a `MockModule` function covering almost all needs for mocking behavior.
**Mocking a module in Angular tests** with `ngMocks` is quite easy.
The library does it recursively for modules and mocks all imports, exports and their declarations.

- `MockModule(MyModule)` - returns a mocked copy of `MyModule` module.
- `MockModule(MyModule.forRoots())` - additionally to a mocked copy of `MyModule` module returns mocked providers.

<small>**Hint**: If you see that `MockModule` does not cover functionality you need,
then I would recommend you to use [`MockBuilder`](#mockbuilder).
It extends features of `MockModule`.</small>

<small>**Hint**: Don't miss [Motivation and easy start](#motivation-and-easy-start) if you haven't read it yet.</small>

**A mocked module** respects its original module as
a type of `MockedModule<T>` and provides:

- mocks all components, directives, pipes
- mocks all services as their dummy instances
- mocks all imports and exports
- mocks tokens with `useValue` definition as primitives such as `0`, `false`, `''`, `null` and `undefined`
- ignores all other token to avoid their influence

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

To mock the module simply pass `DependencyModule` into `MockModule`:

```typescript
beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [
      MockModule(DependencyModule), // <- profit
    ],
    declarations: [TargetComponent],
  });
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
simply pass its module as the second argument of [`MockBuilder`](#mockbuilder).
Everything in `TargetModule` will be mocked, but not `TargetComponent`, it will stay as it is:

```typescript
beforeEach(() => MockBuilder(TargetComponent, TargetModule));
```

<details><summary>Click to see <strong>an example of mocking modules in Angular tests</strong></summary>
<p>

The source file is here:
[examples/MockModule/test.spec.ts](https://github.com/ike18t/ng-mocks/blob/master/examples/MockModule/test.spec.ts)

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

---

## How to mock classic and reactive form components

`ngMocks` respects `ControlValueAccessor` interface if a directive, or a component implements it.
Apart from that, `ngMocks` provides helper functions to cause changes and touches.

A mocked instance of `ControlValueAccessor` provides:

- `__simulateChange()` - calls `onChanged` on the mocked component bound to a `FormControl`
- `__simulateTouch()` - calls `onTouched` on the mocked component bound to a `FormControl`

<details><summary>Click to see <strong>an example of mocking Angular form with FormControl in tests</strong></summary>
<p>

The source file is here:
[examples/MockReactiveForms/test.spec.ts](https://github.com/ike18t/ng-mocks/blob/master/examples/MockReactiveForms/test.spec.ts)

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
[examples/MockForms/test.spec.ts](https://github.com/ike18t/ng-mocks/blob/master/examples/MockForms/test.spec.ts)

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

---

## Extensive example of mocks in Angular tests

The source file is here:
[examples/MAIN/test.spec.ts](https://github.com/ike18t/ng-mocks/blob/master/examples/MAIN/test.spec.ts)

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

---

## MockBuilder

`MockBuilder` is the simplest way to mock everything.
It provides a rich toolkit of functions to manipulate the mocked copies in the way your test requires,
but with minimum overhead.

Usually, we have something simple to test and, unfortunately, time to time, we meet nightmarish dependencies.
The good thing here is that commonly the dependencies have been declared or imported in the same module, where our
tested thing has been defined. Therefore, with help of `MockBuilder` we can quite easily define a testing module,
where everything in the module will be mocked except the tested thing: `MockBuilder(TheThing, ItsModule)`.

<details><summary>Click to see <strong>a code sample demonstrating ease of mocking in Angular tests</strong></summary>
<p>

The source file is here:
[examples/MockBuilder/test.spec.ts](https://github.com/ike18t/ng-mocks/blob/master/examples/MockBuilder/test.spec.ts)

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
<br>

The comments below describe functionality of `MockBuilder`.

```typescript
import { MockBuilder } from 'ng-mocks';
import { MyComponent } from './fixtures.components';

// Mocks everything in MyModule (imports, declarations, providers
// and exports), but keeps MyComponent as it is for testing.
const ngModule1 = MockBuilder(MyComponent, MyModule).build();
// It does the next calls:
const ngModule2 = MockBuilder()
  .keep(MyComponent, { export: true })
  .mock(MyModule, { exportAll: true })
  .build();

// If you do not plan further customization of ngModule
// then you do not need to call .build().
// Simply return result of MockBuilder in beforeEach
beforeEach(() => MockBuilder(MyComponent, MyModule));
// It does the next calls:
beforeEach(() => {
  const ngModule = MockBuilder()
    .keep(MyComponent, { export: true })
    .mock(MyModule, { exportAll: true })
    .build();
  TestBed.configureTestingModule(ngModule);
  return TestBed.compileComponents();
});

// If we want to keep a module, component, directive, pipe or provider
// as it is (not mocking). We should use .keep.
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

// If we want to mock something, even a part of a kept module
// we should use .mock.
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

// For pipes we can set their handlers as the 2nd parameter of .mock.
beforeEach(() =>
  MockBuilder(MyComponent, MyModule).mock(
    SomePipe,
    value => 'My Custom Content'
  )
);

// For services and tokens we can optionally provide their mocked
// values. They are added as `useValue` in providers.
beforeEach(() =>
  MockBuilder(MyComponent, MyModule)
    .mock(SomeService3, anything1)
    .mock(SOME_TOKEN, anything2)
);

// If we want to exclude something, even a part of a kept module
// we should use .exclude.
beforeEach(() =>
  MockBuilder(MyComponent, MyModule)
    .exclude(SomeModule)
    .exclude(SomeComponent)
    .exclude(SomeDirective)
    .exclude(SomePipe)
    .exclude(SomeDependency)
    .exclude(SomeInjectionToken)
);

// If we want to replace something with something,
// we should use .replace.
// The replacement has to be decorated with the same decorator
// as the source.
// It is not impossible to replace a provider or a service,
// we should use .provide or .mock for that.
beforeEach(() =>
  MockBuilder(MyComponent, MyModule)
    .replace(SomeModule, SomeOtherModule)
    .replace(SomeComponent, SomeOtherComponent)
    .replace(SomeDirective, SomeOtherDirective)
    .replace(SomePipe, SomeOtherPipe)
);
// In case of HttpClientTestingModule,
// it should be kept instead of replacement.
beforeEach(() =>
  MockBuilder(MyComponent, MyModule)
    .keep(HttpClientModule)
    .keep(HttpClientTestingModule)
);

// If we want to add or replace providers or services
// we should use .provide.
// It has the same interface as a regular provider.
beforeEach(() =>
  MockBuilder(MyComponent, MyModule)
    .provide(MyService)
    .provide([SomeService1, SomeService2])
    .provide({ provide: SomeComponent3, useValue: anything1 })
    .provide({ provide: SOME_TOKEN, useFactory: () => anything2 })
);

// Anytime we can change our decision.
// The last action on the same object wins.
// SomeModule will be mocked.
beforeEach(() =>
  MockBuilder(MyComponent, MyModule)
    .keep(SomeModule)
    .mock(SomeModule)
    .keep(SomeModule)
    .mock(SomeModule)
);

// If we want to test a component, directive or pipe which,
// unfortunately, has not been exported, then we need to mark it
// with the 'export' flag. Does not matter how deep it is. It will be
// exported to the level of TestingModule.
beforeEach(() =>
  MockBuilder(MyComponent, MyModule)
    .keep(SomeDeclaration1, {
      export: true,
    })
    .mock(SomeDeclaration2, {
      export: true,
    })
);

// If we want to use all the declarations of a module which have not
// been exported, we need to mark the module with the 'exportAll' flag.
// Then all its imports and declarations will be exported.
// If the module is nested, then add the `export` flag
// beside `exportAll` too.
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

// By default all definitions (kept and mocked) are added to the
// TestingModule if they are not a dependency of another definition.
// Modules are added as imports to the TestingModule.
// Components, Directive, Pipes are added as declarations to the
// TestingModule.
// Tokens and Services are added as providers to the TestingModule.
// If we do not want something to be added to the TestingModule at
// all, then we need to mark it with the 'dependency' flag.
beforeEach(() =>
  MockBuilder(MyComponent, MyModule)
    .keep(SomeModuleComponentDirectivePipeProvider1, {
      dependency: true,
    })
    .mock(SomeModuleComponentDirectivePipeProvider1, {
      dependency: true,
    })
    .replace(SomeModuleComponentDirectivePipeProvider1, anything1, {
      dependency: true,
    })
);

// If we want to render a structural directive by default.
// Now we can do that via adding the 'render' flag in its config.
beforeEach(() =>
  MockBuilder(MyComponent, MyModule).mock(MyDirective, {
    render: true,
  })
);
// If the directive has own context and variables.
// Then instead of setting 'render' to true we can set the context.
beforeEach(() =>
  MockBuilder(MyComponent, MyModule).mock(MyDirective, {
    render: {
      $implicit: something1,
      variables: { something2: something3 },
    },
  })
);

// If we use ContentChild in a component and we want to render it by
// default, we should use its id for that in the same way as for
// a mocked directive.
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

---

## MockRender

`MockRender` is a simple tool that helps **to render a custom template in an Angular test**
if we need that to cover functionality of components, directives, pipes and services.

> <strong><span style="color: red">Please note</span></strong> that `MockRender(MyComponent)` is not assignable
> to `ComponentFixture<MyComponent>`.
>
> You should use either
> `MockedComponentFixture<MyComponent>` or
> `ComponentFixture<DefaultRenderComponent<MyComponent>>`.
>
> It happens because `MockRender` generates an additional component
> to render the desired thing and its interface differs.

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
[examples/MockRender/test.spec.ts](https://github.com/ike18t/ng-mocks/blob/master/examples/MockRender/test.spec.ts)

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

---

## MockInstance

`MockInstance` is useful when you want to configure spies of a declaration before its render.
It supports: Modules, Components, Directives, Pipes and Services.

> <strong><span style="color: red">Please note</span></strong> that it works only for pure mocked copies without overrides.
> If you provide an own mocked copy via `useValue` or like `.mock(MyService, myMock)` then `MockInstance` does not have an effect.

You definitely need it when a test fails like:

- Cannot read property 'subscribe' of undefined
- Cannot read property 'pipe' of undefined

```typescript
beforeAll(() =>
  MockInstance(MyService, {
    init: (instance: MyService, injector: Injector): void => {
      // Now you can customize a mocked instance of MyService.
      // If you use auto-spy then all methods have been spied already
      // here.
      instance.data$ = EMPTY;
    },
  })
);

afterAll(MockReset);
```

After a test you can reset changes to avoid their influence in other tests via a call of `MockReset()`.

<details><summary>Click to see <strong>an example of mocking services before initialization in Angular tests</strong></summary>
<p>

The source file is here:
[examples/MockInstance/test.spec.ts](https://github.com/ike18t/ng-mocks/blob/master/examples/MockInstance/test.spec.ts)

```typescript
describe('MockInstance', () => {
  // A normal setup of the TestBed, TargetComponent will be mocked.
  beforeEach(() => MockBuilder(RealComponent).mock(TargetComponent));

  beforeAll(() => {
    // Because TargetComponent is mocked its update$ is undefined and
    // ngAfterViewInit of the parent component will fail on
    // .subscribe().
    // Let's fix it via defining customization for the mocked copy.
    MockInstance(TargetComponent, {
      init: (instance, injector) => {
        const subject = new Subject<void>();
        subject.complete();
        // comment the next line to check the failure.
        instance.update$ = subject;
        // if you want you can use injector.get(Service) for more
        // complicated customization.
      },
    });
  });

  // Do not forget to reset MockInstance back.
  afterAll(MockReset);

  it('should render', () => {
    // Without the custom initialization rendering would fail here
    // with "Cannot read property 'subscribe' of undefined".
    const fixture = MockRender(RealComponent);

    // Let's check that the mocked component has been decorated by
    // the custom initialization.
    expect(
      fixture.point.componentInstance.child.update$
    ).toBeDefined();
  });
});
```

</p>
</details>

---

## ngMocks

`ngMocks` provides functions to get attribute and structural directives from an element, find components and mock objects.

- `ngMocks.guts(TestingDeclaration, ItsModule)`
- `ngMocks.guts([Thing1, Thing2], [ToMock1, ToMock2, ToMock3])`

* `ngMocks.get(debugElement, directive, notFoundValue?)`
* `ngMocks.findInstance(debugElement, directive, notFoundValue?)`
* `ngMocks.findInstances(debugElement, directive)`

- `ngMocks.find(fixture, component, notFoundValue?)`
- `ngMocks.find(debugElement, component, notFoundValue?)`
- `ngMocks.findAll(fixture, component)`
- `ngMocks.findAll(debugElement, component)`

* `ngMocks.input(debugElement, input, notFoundValue?)`
* `ngMocks.output(debugElement, output, notFoundValue?)`

- `ngMocks.stub(service, method)`
- `ngMocks.stub(service, methods)`
- `ngMocks.stub(service, property, 'get' | 'set')`

* `ngMocks.faster()` - [optimizes setup](#making-angular-tests-faster) between tests in a suite
* `ngMocks.flushTestBed()` - flushes initialization of TestBed
* `ngMocks.reset()` - resets caches of [`ngMocks`](#ngmocks)

<details><summary>Click to see <strong>an example of all functionality of ngMocks</strong></summary>
<p>

```typescript
// Returns metadata for TestBed module.
// The first argument can be a class or an array of classes
// we want to test: Modules, Components, Directives, Pipes, Services
// and tokens.
// The second argument can be a class or an array of classes
// we want to mock: Modules, Components, Directives, Pipes, Services
// and tokens.
// If there is a module in the second argment, then its guts will be
// mocked excluding things from the first argument.
const ngModuleMeta1 = ngMocks.guts(Component, ItsModule);
const ngModuleMeta2 = ngMocks.guts(
  [Component1, Component2, Service3],
  [ModuleToMock, DirectiveToMock, WhateverToMock]
);

// Returns an attribute or structural directive which belongs to
// the current element.
const directive1: Directive = ngMocks.get(
  fixture.debugElement,
  Directive
);

// Returns the first found attribute or structural directive which
// belongs to the current element or its any child.
const directive2: Directive = ngMocks.findInstance(
  fixture.debugElement,
  Directive
);

// Returns an array of all found attribute or structural directives
// which belong to the current element and all its children.
const directives1: Array<Directive> = ngMocks.findInstances(
  fixture.debugElement,
  Directive
);

// Returns a found DebugElement which belongs to the Component
// with the correctly typed componentInstance.
const component1: MockedDebugElement<Component> = ngMocks.find(
  fixture.debugElement,
  Component
);

// Returns an array of found DebugElements which belong to
// the Component with the correctly typed componentInstance.
const components1: Array<MockedDebugElement<
  Component
>> = ngMocks.findAll(fixture.debugElement, Component);

// Returns a found DebugElement which matches the css selector.
const component2: MockedDebugElement<Component> = ngMocks.find(
  fixture.debugElement,
  'div.container'
);

// Returns an array of found DebugElements which match
// the css selector.
const components: Array<MockedDebugElement<
  Component
>> = ngMocks.findAll(fixture.debugElement, 'div.item');
```

To avoid pain of knowing a name of the component or the directive an input or an output belongs to, you can use next functions:

```typescript
const inputValue: number = ngMocks.input(debugElement, 'param1');
const outputValue: EventEmitter<any> = ngMocks.output(
  debugElement,
  'update'
);
```

In case if we want to mock methods / properties of a service.

```typescript
// Returns a mocked function / spy of the method. If the method
// has not been mocked yet - mocks it.
const spy: Function = ngMocks.stub(instance, methodName);

// Returns a mocked function / spy of the property. If the property
// has not been mocked yet - mocks it.
const spyGet: Function = ngMocks.stub(instance, propertyName, 'get');
const spySet: Function = ngMocks.stub(instance, propertyName, 'set');

// Or override properties and methods.
ngMocks.stub(instance, {
  existingProperty: true,
  existingMethod: jasmine.createSpy(),
});
```

</p>
</details>

---

### Helper functions

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

- `isMockOf(inst, SomeClass, 'm')` - checks whether `inst` is an instance of `MockedModule<SomeClass>`
- `isMockOf(inst, SomeClass, 'c')` - checks whether `inst` is an instance of `MockedComponent<SomeClass>`
- `isMockOf(inst, SomeClass, 'd')` - checks whether `inst` is an instance of `MockedDirective<SomeClass>`
- `isMockOf(inst, SomeClass, 'p')` - checks whether `inst` is an instance of `MockedPipe<SomeClass>`
- `isMockOf(inst, SomeClass)` - checks whether `inst` is an inst of mocked `SomeClass`

#### isMockedNgDefOf

This function helps when we need to verify that a class is actually a mocked copy of a class.

- `isMockedNgDefOf(MockedClass, SomeClass, 'm')` - checks whether `MockedClass` is a mocked copy of `SomeClass` and a module
- `isMockedNgDefOf(MockedClass, SomeClass, 'c')` - checks whether `MockedClass` is a mocked copy of `SomeClass` and a component
- `isMockedNgDefOf(MockedClass, SomeClass, 'd')` - checks whether `MockedClass` is a mocked copy of `SomeClass` and a directive
- `isMockedNgDefOf(MockedClass, SomeClass, 'p')` - checks whether `MockedClass` is a mocked copy of `SomeClass` and a pipe
- `isMockedNgDefOf(MockedClass, SomeClass)` - checks whether `MockedClass` is a mocked copy of `SomeClass`

#### getMockedNgDefOf

This function helps when in a test we want to get a mocked copy of a class created in TestBed.

- `getMockedNgDefOf(SomeClass, 'm')` - returns an existing `MockedModule<SomeClass>` of `SomeClass`
- `getMockedNgDefOf(SomeClass, 'c')` - returns an existing `MockedComponent<SomeClass>` of `SomeClass`
- `getMockedNgDefOf(SomeClass, 'd')` - returns an existing `MockedDirective<SomeClass>` of `SomeClass`
- `getMockedNgDefOf(SomeClass, 'p')` - returns an existing `MockedPipe<SomeClass>` of `SomeClass`
- `getMockedNgDefOf(SomeClass)` - returns an existing mocked class of `SomeClass`

#### isNgDef

This function verifies how a class has been decorated.

- `isNgDef(SomeClass, 'm')` - checks whether `SomeClass` is a module
- `isNgDef(SomeClass, 'c')` - checks whether `SomeClass` is a component
- `isNgDef(SomeClass, 'd')` - checks whether `SomeClass` is a directive
- `isNgDef(SomeClass, 'p')` - checks whether `SomeClass` is a pipe
- `isNgDef(SomeClass)` - checks whether `SomeClass` is a module / component / directive / pipe.

#### getSourceOfMock

This function returns an origin of the mocked copy.

- `getSourceOfMock(MockedClass)` - returns the source class of `MockedClass`

#### isNgInjectionToken

This function verifies tokens.

- `isNgInjectionToken(TOKEN)` - checks whether `TOKEN` is a token

---

## Usage with 3rd-party libraries

`ngMocks` provides flexibility via [`MockBuilder`](#mockbuilder)
that allows developers to use another **Angular testing libraries** for creation of `TestBed`,
and in the same time to **mock all dependencies** via `ngMocks`.

For example if we use `@ngneat/spectator` and its functions
like `createHostFactory`, `createComponentFactory`, `createDirectiveFactory` and so on,
then to mock everything properly we need:

- exclude the component we want to test
- mock its module
- export all declarations the module has

This means we need `.exclude`, `.mock` and `exportAll` flag.

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

---

## Making Angular tests faster

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

---

## Auto Spy

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

---

## How to test a component

Please check [an extensive example](#extensive-example-of-mocks-in-angular-tests),
it covers all aspects of **testing components in angular applications**.

---

## How to test a provider of a component

The source file is here:
[examples/TestProviderInComponent/test.spec.ts](https://github.com/ike18t/ng-mocks/blob/master/examples/TestProviderInComponent/test.spec.ts)

```typescript
describe('TestProviderInComponent', () => {
  // Because we want to test the service, we pass it as the first
  // argument of MockBuilder.
  // Because we do not care about TargetComponent, we pass it as
  // the second argument for being mocked.
  beforeEach(() => MockBuilder(TargetService, TargetComponent));

  it('has access to the service via a component', () => {
    // Let's render the mocked component. It provides as a point
    // to access the service.
    const fixture = MockRender(TargetComponent);

    // The root element is fixture.point and it is the TargetComponent
    // with its injector for extracting internal services.
    const service = fixture.point.injector.get(TargetService);

    // Here we go, now we can assert everything about the service.
    expect(service.value).toEqual('target');
  });
});
```

---

## How to test an attribute directive

The source file is here:
[examples/TestAttributeDirective/test.spec.ts](https://github.com/ike18t/ng-mocks/blob/master/examples/TestAttributeDirective/test.spec.ts)

```typescript
describe('TestAttributeDirective', () => {
  ngMocks.faster(); // the same TestBed for several its.

  // Because we want to test the directive, we pass it as the first
  // argument of MockBuilder. We can omit the second argument,
  // because there are no dependencies.
  beforeEach(() => MockBuilder(TargetDirective));

  it('uses default background color', () => {
    const fixture = MockRender(`<div target></div>`);

    // By default, without the mouse enter, there is no background
    // color on the div.
    expect(fixture.nativeElement.innerHTML).not.toContain(
      'style="background-color: yellow;"'
    );

    // Let's simulate the mouse enter event.
    // fixture.point is out root element from the rendered template,
    // therefore it points to the div we want to trigger the event
    // on.
    fixture.point.triggerEventHandler('mouseenter', null);

    // Let's assert the color.
    expect(fixture.nativeElement.innerHTML).toContain(
      'style="background-color: yellow;"'
    );

    // Now let's simulate the mouse mouse leave event.
    fixture.point.triggerEventHandler('mouseleave', null);

    // And assert that the background color is gone now.
    expect(fixture.nativeElement.innerHTML).not.toContain(
      'style="background-color: yellow;"'
    );
  });

  it('sets provided background color', () => {
    // When we want to test inputs / outputs we need to use the second
    // argument of MockRender, simply pass there variables for the
    // template, they'll become properties of
    // fixture.componentInstance.
    const fixture = MockRender(`<div [color]="color" target></div>`, {
      color: 'red',
    });

    // Let's assert that the background color is red.
    fixture.point.triggerEventHandler('mouseenter', null);
    expect(fixture.nativeElement.innerHTML).toContain(
      'style="background-color: red;"'
    );

    // Let's switch the color, we don't need `.point`, because we
    // access a middle component of MockRender.
    fixture.componentInstance.color = 'blue';
    fixture.detectChanges(); // shaking the template
    fixture.point.triggerEventHandler('mouseenter', null);
    expect(fixture.nativeElement.innerHTML).toContain(
      'style="background-color: blue;"'
    );
  });
});
```

---

## How to test a structural directive

The source file is here:
[examples/TestStructuralDirective/test.spec.ts](https://github.com/ike18t/ng-mocks/blob/master/examples/TestStructuralDirective/test.spec.ts)

```typescript
describe('TestStructuralDirective', () => {
  // Because we want to test the directive, we pass it as the first
  // argument of MockBuilder. We can omit the second argument,
  // because there are no dependencies.
  beforeEach(() => MockBuilder(TargetDirective));

  it('hides and renders its content', () => {
    const fixture = MockRender(
      `
        <div *target="value">
          content
        </div>
    `,
      {
        value: false,
      }
    );

    // Because the value is false the "content" should not be
    // rendered.
    expect(fixture.nativeElement.innerHTML).not.toContain('content');

    // Let's change the value to true and assert that the "content"
    // has been rendered.
    fixture.componentInstance.value = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toContain('content');

    // Let's change the value to false and assert that the
    // "content" has been hidden.
    fixture.componentInstance.value = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).not.toContain('content');
  });
});
```

---

## How to test a structural directive with context

The source file is here:
[examples/TestStructuralDirectiveWithContext/test.spec.ts](https://github.com/ike18t/ng-mocks/blob/master/examples/TestStructuralDirectiveWithContext/test.spec.ts)

```typescript
describe('TestStructuralDirectiveWithContext', () => {
  // Because we want to test the directive, we pass it as the first
  // argument of MockBuilder. We can omit the second argument,
  // because there are no dependencies.
  beforeEach(() => MockBuilder(TargetDirective));

  it('renders passed values', () => {
    const fixture = MockRender(
      `
        <div *target="values; let value; let index = myIndex">
        {{index}}: {{ value }}
        </div>`,
      {
        values: ['hello', 'world'],
      }
    );

    // Let's assert that the 'values' have been rendered as expected
    expect(fixture.nativeElement.innerHTML).toContain('0: hello');
    expect(fixture.nativeElement.innerHTML).toContain('1: world');

    // Let's change the 'values' and assert that the new render
    // has done everything as expected.
    fixture.componentInstance.values = ['ngMocks'];
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toContain('0: ngMocks');
    expect(fixture.nativeElement.innerHTML).not.toContain('0: hello');
    expect(fixture.nativeElement.innerHTML).not.toContain('1: world');
  });
});
```

---

## How to test a provider of a directive

The source file is here:
[examples/TestProviderInDirective/test.spec.ts](https://github.com/ike18t/ng-mocks/blob/master/examples/TestProviderInDirective/test.spec.ts)

```typescript
describe('TestProviderInDirective', () => {
  ngMocks.faster(); // the same TestBed for several its.

  // Because we want to test the service, we pass it as the first
  // argument of MockBuilder.
  // Because we do not care about TargetDirective, we pass it as
  // the second argument for being mocked.
  beforeEach(() => MockBuilder(TargetService, TargetDirective));

  it('has access to the service via a directive', () => {
    // Let's render a div with the directive. It provides a point
    // to access the service.
    const fixture = MockRender(`<div target></div>`);

    // The root element is fixture.point and it has access to the
    // context of the directive. Its injector can extract the service.
    const service = fixture.point.injector.get(TargetService);

    // Here we go, now we can assert everything about the service.
    expect(service.value).toEqual(true);
  });

  it('has access to the service via a structural directive', () => {
    // Let's render a div with the directive. It provides a point to
    // access the service.
    const fixture = MockRender(`<div *target></div>`);

    // The root element is fixture.point and it has access to the
    // context of the directive. Its injector can extract the service.
    const service = fixture.point.injector.get(TargetService);

    // Here we go, now we can assert everything about the service.
    expect(service.value).toEqual(true);
  });
});
```

---

## How to test a pipe

The source file is here:
[examples/TestPipe/test.spec.ts](https://github.com/ike18t/ng-mocks/blob/master/examples/TestPipe/test.spec.ts)

```typescript
describe('TestPipe', () => {
  ngMocks.faster(); // the same TestBed for several its.

  // Because we want to test the pipe, we pass it as the first
  // argument of MockBuilder. We can omit the second argument,
  // because there are no dependencies.
  beforeEach(() => MockBuilder(TargetPipe));

  it('sorts strings', () => {
    const fixture = MockRender(`{{ values | target}}`, {
      values: ['1', '3', '2'],
    });

    expect(fixture.nativeElement.innerHTML).toEqual('1, 2, 3');
  });

  it('reverses strings on param', () => {
    const fixture = MockRender(`{{ values | target:flag}}`, {
      flag: false,
      values: ['1', '3', '2'],
    });

    expect(fixture.nativeElement.innerHTML).toEqual('3, 2, 1');
  });
});
```

---

## How to test a provider

Usually, you don't need `TestBed` if you want to test a simple
provider. It might be a pure unit test.

Nevertheless, `MockBuilder` can help here too. Dependencies will be
mocked if a provider has them, do not forget to provide its module in
this case.

The source file is here:
[examples/TestPipe/test.spec.ts](https://github.com/ike18t/ng-mocks/blob/master/examples/TestPipe/test.spec.ts)

```typescript
describe('TestProvider', () => {
  beforeEach(() => MockBuilder(TargetService));

  it('returns value on echo', () => {
    const service = TestBed.get(TargetService);

    expect(service.echo()).toEqual(service.value);
  });
});
```

---

## Find an issue or have a question or a request?

[Ask a question on gitter](https://gitter.im/ng-mocks/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge),
[report it as an issue on github](https://github.com/ike18t/ng-mocks/issues),
or [submit a PR](https://github.com/ike18t/ng-mocks/pulls). I'm open to contributions.
