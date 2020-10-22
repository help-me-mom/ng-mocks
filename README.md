[![npm version](https://badge.fury.io/js/ng-mocks.svg)](https://badge.fury.io/js/ng-mocks)
[![Build Status](https://travis-ci.org/ike18t/ng-mocks.png?branch=master)](https://travis-ci.org/ike18t/ng-mocks)
[![Coverage Status](https://coveralls.io/repos/github/ike18t/ng-mocks/badge.svg?branch=master)](https://coveralls.io/github/ike18t/ng-mocks?branch=master)
[![Gitter](https://badges.gitter.im/ng-mocks/community.svg)](https://gitter.im/ng-mocks/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

# ngMocks - ease of mocking annoying dependencies in Angular unit tests

`ngMocks` is a library providing helper functions for creating mocks of components, directives, pipes, modules and services for unit testing in Angular.

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

- [Usage with 3rd-party libraries](#usage-with-3rd-party-libraries)
- [Making tests faster](#making-angular-tests-faster)
- [Auto Spy](#auto-spy)

---

## Install

It's quite easy, for any Angular project you can use the latest version of the library.

NPM

> npm install ng-mocks --save-dev

Yarn

> yarn add ng-mocks --dev

---

## How to mock a component

Below you can find an example how to mock a component in Angular tests.

A mocked component respects its original component and provides:

- the same selector
- the same `Inputs` and `Outputs` with alias support
- each instance has its own `EventEmitter` instances for outputs
- templates are `ng-content` tags to allow transclusion
- supports `@ContentChild` with `$implicit` context
- supports `FormsModule`, `ReactiveFormsModule` and `ControlValueAccessor`
  - `__simulateChange()` - calls `onChanged` on the mocked component bound to a `FormControl`
  - `__simulateTouch()` - calls `onTouched` on the mocked component bound to a `FormControl`
- supports `exportAs`

Let's pretend that in our Angular application `TargetComponent` depends on a component of `DependencyComponent` and we want to mock it in a test.

Instead of defining `TestBed` via `configureTestingModule`:

```typescript
describe('Test', () => {
  let component: TargetComponent;
  let fixture: ComponentFixture<TargetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TargetComponent, DependencyComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
```

We should use [`MockBuilder`](#mockbuilder) and pass `DependencyComponent` into `.mock` method
and call [`MockRender`](#mockrender) instead of `TestBed.createComponent`:

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

```typescript
describe('MockComponent', () => {
  beforeEach(() =>
    MockBuilder(TestedComponent).mock(DependencyComponent)
  );

  it('should send the correct value to the dependency component input', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // The same as
    // fixture.debugElement.query(
    //   By.css('dependency-component-selector')
    // ).componentInstance
    // but properly typed.
    const mockedComponent: DependencyComponent = ngMocks.find(
      fixture.debugElement,
      'dependency-component-selector'
    ).componentInstance;

    // Let's pretend Dependency Component (unmocked) has 'someInput'
    // as an input, the input's value will be passed into the mocked
    // component so you can assert on it.
    component.value = 'foo';
    fixture.detectChanges();

    // If you cast mockedComponent as the original component type
    // then this is type safe.
    expect(mockedComponent.someInput).toEqual('foo');
  });

  it('should do something when the dependency component emits on its output', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    spyOn(component, 'trigger');
    const mockedComponent = ngMocks.find(
      fixture.debugElement,
      DependencyComponent
    ).componentInstance;

    // Again, let's pretend DependencyComponent has an output
    // called 'someOutput'. An emit on the output that MockComponent
    // setup when generating the mock of Dependency Component.
    // If you cast mockedComponent as the original component type
    // then this is type safe.
    mockedComponent.someOutput.emit({
      payload: 'foo',
    });

    // Assert on some side effect.
    expect(component.trigger).toHaveBeenCalledWith({
      payload: 'foo',
    });
  });

  it('should render something inside of the dependency component', () => {
    const localFixture = MockRender<DependencyComponent>(`
      <dependency-component-selector>
        <p>inside content</p>
      </dependency-component-selector>
    `);

    // Because component does not have any @ContentChild we can access
    // html directly asserting on some side effect.
    const mockedNgContent =
      localFixture.point.nativeElement.innerHTML;
    expect(mockedNgContent).toContain('<p>inside content</p>');
  });

  it('should render something inside of the dependency component', () => {
    const localFixture = MockRender<
      MockedComponent<DependencyComponent>
    >(`
      <dependency-component-selector>
        <ng-template #something><p>inside template</p></ng-template>
        <p>inside content</p>
      </dependency-component-selector>
    `);

    // Injected ng-content stays as it was.
    const mockedNgContent =
      localFixture.point.nativeElement.innerHTML;
    expect(mockedNgContent).toContain('<p>inside content</p>');

    // Because a component does have @ContentChild we need to render
    // them with a proper context first.
    const mockedComponent = localFixture.point.componentInstance;
    mockedComponent.__render('something');
    localFixture.detectChanges();

    const mockedNgTemplate = ngMocks.find(
      localFixture.debugElement,
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

There is an example of mocking a directive in tests of an Angular application below.
`ngMocks` supports both attribute and structural directives.

A mocked directive respects its original directive and provides:

- the same selector
- the same `Inputs` and `Outputs` with alias support
- each instance has its own `EventEmitter` instances for outputs
- supports `@ContentChild` with `$implicit` context
- supports `FormsModule`, `ReactiveFormsModule` and `ControlValueAccessor`
  - `__simulateChange()` - calls `onChanged` on the mocked component bound to a `FormControl`
  - `__simulateTouch()` - calls `onTouched` on the mocked component bound to a `FormControl`
- supports `exportAs`

Let's assume that an Angular application has `TargetComponent` that depends on a directive of `DependencyDirective` and we need to mock it for facilitating unit tests.

Instead of defining `TestBed` via `configureTestingModule`:

```typescript
describe('Test', () => {
  let component: TargetComponent;
  let fixture: ComponentFixture<TargetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TargetComponent, DependencyDirective],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
```

We should use [`MockBuilder`](#mockbuilder) and pass `DependencyDirective` into `.mock` method
and call [`MockRender`](#mockrender) instead of `TestBed.createComponent`:

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

```typescript
describe('MockDirective', () => {
  beforeEach(() =>
    MockBuilder(TestedComponent).mock(DependencyDirective)
  );

  it('should send the correct value to the dependency component input', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    component.value = 'foo';
    fixture.detectChanges();

    // Let's pretend DependencyDirective (unmocked) has 'someInput'
    // as an input. The input's value will be passed into the mocked
    // directive so you can assert on it.
    const mockedDirectiveInstance = ngMocks.get(
      ngMocks.find(fixture.debugElement, 'span'),
      DependencyDirective
    );

    expect(mockedDirectiveInstance.someInput).toEqual('foo');
    // Assert on some side effect.
  });

  it('should do something when the dependency directive emits on its output', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    spyOn(component, 'trigger');
    fixture.detectChanges();

    // Again, let's pretend DependencyDirective has an output called
    // 'someOutput'. An emit on the output that MockDirective setup
    // when generating the mock of DependencyDirective.
    const mockedDirectiveInstance = ngMocks.get(
      ngMocks.find(fixture.debugElement, 'span'),
      DependencyDirective
    );
    // If you cast mockedDirective as the original component type
    // then this is type safe.
    mockedDirectiveInstance.someOutput.emit({
      payload: 'foo',
    });
    // Assert on some side effect.
  });
});
```

</p>
</details>

<details><summary>Click to see <strong>an example of mocking structural directives in Angular tests</strong></summary>
<p>

It's important to render a structural directive first with the right context,
when assertions should be done on its nested elements.

```typescript
describe('MockDirective', () => {
  beforeEach(() =>
    MockBuilder(TestedComponent).mock(DependencyDirective)
  );

  it('should send the correct value to the dependency component input', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    component.value = 'foo';
    fixture.detectChanges();

    // IMPORTANT: by default structural directives are not rendered.
    // Because we cannot automatically detect when and which context
    // they should be rendered with.
    // Usually a developer knows the context and can render it
    // manually with proper setup.
    const mockedDirectiveInstance = ngMocks.findInstance(
      fixture.debugElement,
      DependencyDirective
    ) as MockedDirective<DependencyDirective>;

    // Now we assert that nothing has been rendered inside of
    // the structural directive by default.
    expect(
      fixture.debugElement.nativeElement.innerHTML
    ).not.toContain('>content<');

    // And we render it manually now.
    mockedDirectiveInstance.__render();
    expect(fixture.debugElement.nativeElement.innerHTML).toContain(
      '>content<'
    );

    // Let's pretend DependencyDirective (unmocked) has 'someInput'
    // as an input. The input's value will be passed into the mocked
    // directive so you can assert on it.
    expect(mockedDirectiveInstance.someInput).toEqual('foo');
    // Assert on some side effect.
  });
});
```

</p>
</details>

---

## How to mock a pipe

An example of mocking a pipe can be found below.

A mocked pipe respects its original pipe and provides:

- the same name
- ability to override the transform function with a type-safe function
- default transform is `() => undefined` to prevent problems with chaining

Let's imagine that in an Angular application `TargetComponent` depends on a pipe of `DependencyPipe` and we would like to mock it in a test.

Instead of defining `TestBed` via `configureTestingModule`:

```typescript
describe('Test', () => {
  let component: TargetComponent;
  let fixture: ComponentFixture<TargetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TargetComponent, DependencyPipe],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
```

We should use [`MockBuilder`](#mockbuilder) and pass `DependencyPipe` into `.mock` method
and call [`MockRender`](#mockrender) instead of `TestBed.createComponent`:

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

```typescript
describe('MockPipe', () => {
  beforeEach(() =>
    MockBuilder(TestedComponent).mock(
      DependencyPipe,
      (...args: string[]) => JSON.stringify(args)
    )
  );

  describe('with transform override', () => {
    it('should return the result of the provided transform function', () => {
      const fixture = MockRender(TestedComponent);

      const pipeElement = ngMocks.find(fixture.debugElement, 'span');
      expect(pipeElement.nativeElement.innerHTML).toEqual('["foo"]');
    });
  });
});
```

</p>
</details>

---

## How to mock a service

There is an example below of mocking a service. The technique supports all types of providers including tokens.

A mocked provider is based on its original service / token, and provides:

- all methods are dummies like `() => undefined`
- all properties are linked getters and setters (might not work in some cases, use `ngMocks.stub` then)
- a mocked token returns `undefined` by default

There is a helper function called `MockService`, it tends to avoid hassle of providing customized mocks for huge services.
Simply pass a class into it and its result wil be a mocked instance that respects the class,
but all methods and properties are customizable dummies.

```typescript
const instance = MockService(MyClass);
// instance.method() returns undefined
instance.method = () => 'My Custom Behavior';
```

It also supports objects. All properties that are not objects or functions will be omitted,
the functions will be dummy functions.

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

Now let's pretend that in an Angular application `TargetComponent` depends on service of `DependencyService`,
and it should be mocked to avoid overhead.

Instead of defining `TestBed` via `configureTestingModule`:

```typescript
describe('Test', () => {
  let component: TargetComponent;
  let fixture: ComponentFixture<TargetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
      providers: [DependencyService],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
```

We should use [`MockBuilder`](#mockbuilder) and pass `DependencyService` into `.mock` method
and call [`MockRender`](#mockrender) instead of `TestBed.createComponent`:

```typescript
describe('Test', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent).mock(DependencyService)
  );

  it('should create', () => {
    const fixture = MockRender(TargetComponent);
    expect(component).toBeDefined();
  });
});
```

---

## How to mock a module

Mocking a module in Angular tests with `ngMocks` is quite easy.
The library does it recursively and mocks also all imports, exports and their declarations.

A mocked module provides:

- mocks all components, directives, pipes
- mocks all services as their dummy instances
- mocks all imports and exports

Let's imagine an Angular application where `TargetComponent` depends on a module of `DependencyModule` and we would like to mock in a test.

Instead of defining `TestBed` via `configureTestingModule`:

```typescript
describe('Test', () => {
  let component: TargetComponent;
  let fixture: ComponentFixture<TargetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DependencyModule],
      declarations: [TargetComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
```

We should use [`MockBuilder`](#mockbuilder)
and call [`MockRender`](#mockrender) instead of `TestBed.createComponent`:

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

```typescript
describe('MockModule', () => {
  beforeEach(() =>
    MockBuilder(TestedComponent).mock(DependencyModule)
  );

  it('renders nothing without any error', () => {
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

<details><summary>Click to see <strong>an example of mocking form components and directives in Angular tests</strong></summary>
<p>

```typescript
describe('MockReactiveForms', () => {
  beforeEach(() =>
    MockBuilder(TestedComponent)
      .mock(DependencyComponent)
      .keep(ReactiveFormsModule)
  );

  it('should send the correct value to the dependency component input', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    const mockedReactiveFormComponent = ngMocks.find<
      MockedComponent<DependencyComponent>
    >(fixture.debugElement, 'dependency-component-selector')
      .componentInstance;

    mockedReactiveFormComponent.__simulateChange('foo');
    expect(component.formControl.value).toBe('foo');

    spyOn(mockedReactiveFormComponent, 'writeValue');
    component.formControl.setValue('bar');
    expect(
      mockedReactiveFormComponent.writeValue
    ).toHaveBeenCalledWith('bar');
  });
});
```

</p>
</details>

---

## Extensive example of mocks in Angular tests

```typescript
import { CommonModule } from '@Angular/common';
import {
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Input,
  NgModule,
  Output,
  TemplateRef,
} from '@Angular/core';
import { RouterModule } from '@Angular/router';
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
// of its inputs and outputs.
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
  imports: [CommonModule, RouterModule.forRoot([])],
  declarations: [AppComponent, AppHeaderComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}

describe('main', () => {
  // Usually we would have something like that.
  // beforeEach(() => {
  //   TestBed.configureTestingModule({
  //     imports: [CommonModule],
  //     declarations: [AppComponent, AppHeaderComponent],
  //   });
  //
  //   fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  // });
  // Instead of AppHeaderComponent we want to have a mock and usually
  // doing it via a helper component or setting NO_ERRORS_SCHEMA.

  // With ng-mocks it can be defined in the next way.
  beforeEach(() => {
    // AppComponent will stay as it is,
    // everything in AppModule will be mocked.
    return (
      MockBuilder(AppComponent, AppModule)
        // Adding a special config how to mock AppHeaderComponent.
        .mock(AppHeaderComponent, {
          render: {
            // #menu template will be rendered together
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
    //     AppComponent, // not mocked
    //     MockComponent(AppHeaderComponent),
    //   ],
    // });
    // return testBed.compileComponents();
  });

  it('example', () => {
    const logoClickSpy = jasmine.createSpy();
    // in case of jest
    // const logoClickSpy = jest.fn();

    // Instead of TestBed.createComponent(AppComponent) in beforeEach
    // MockRender should be directly used in tests.
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
    // but typesafe and fails if nothing was found.
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
It provides a rich toolkit of functions to manipulate mocks in the way your test requires with minimum overhead.

Usually, we have something simple to test and, unfortunately, time to time its nightmarish dependencies.
The good thing here is that usually the dependencies are declared or imported in the same module where our thing has
been defined. Therefore, with help of `MockBuilder` we can quite easily define a testing module where everything
in the module will be mocked except the thing: `MockBuilder(TheThing, ItsModule)`.

<details><summary>Click to see <strong>a code sample demonstrating ease of mocking in Angular tests</strong></summary>
<p>

```typescript
import { TestBed } from '@Angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';

import { MyComponent } from './fixtures.components';
import { MyModule } from './fixtures.modules';

describe('MockBuilder:simple', () => {
  beforeEach(() => MockBuilder(MyComponent, MyModule));
  // The same as
  // beforeEach(() => TestBed.configureTestingModule({{
  //   imports: [MockModule(MyModule)],
  // }).compileComponents());
  // but MyComponent was not mocked for the testing purposes
  // and we can simply pass it to the TestBed.

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

<details><summary>Click to see <strong>a detailed information about features of MockBuilder</strong></summary>
<p>

```typescript
import { MockBuilder } from 'ng-mocks';

// Mocks everything in MyModule (imports, declarations, providers
// and exports), but keeps MyComponent as it is.
const ngModule = MockBuilder(MyComponent, MyModule).build();

// The same as code above.
const ngModule = MockBuilder()
  .keep(MyComponent, { export: true })
  .mock(MyModule, { exportAll: true })
  .build();

// If you do not plan a further customization of ngModule
// then you do not need to call .build().
// Simply return result of MockBuilder in beforeEach
beforeEach(() => MockBuilder(MyComponent, MyModule));
// It is the same as:
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
const ngModule = MockBuilder(MyComponent, MyModule)
  .keep(SomeModule)
  .keep(SomeModule.forSome())
  .keep(SomeModule.forAnother())
  .keep(SomeComponent)
  .keep(SomeDirective)
  .keep(SomePipe)
  .keep(SomeDependency)
  .keep(SomeInjectionToken)
  .build();

// If we want to mock something, even a part of a kept module
// we should use .mock.
const ngModule = MockBuilder(MyComponent, MyModule)
  .mock(SomeModule)
  .mock(SomeModule.forSome())
  .mock(SomeModule.forAnother())
  .mock(SomeComponent)
  .mock(SomeDirective)
  .mock(SomePipe)
  .mock(SomeDependency)
  .mock(SomeInjectionToken)
  .build();

// If we want to replace something with something,
// we should use .replace.
// The replacement has to be decorated with the same decorator
// as the source.
// It's impossible to replace a provider or a service,
// we should use .provide or .mock for that.
const ngModule = MockBuilder(MyComponent, MyModule)
  .replace(SomeModule, SomeOtherModule)
  .replace(SomeComponent, SomeOtherComponent)
  .replace(SomeDirective, SomeOtherDirective)
  .replace(SomePipe, SomeOtherPipe)
  .build();

// If we want to exclude something, even a part of a kept module
// we should use .exclude.
const ngModule = MockBuilder(MyComponent, MyModule)
  .exclude(SomeModule)
  .exclude(SomeComponent)
  .exclude(SomeDirective)
  .exclude(SomePipe)
  .exclude(SomeDependency)
  .exclude(SomeInjectionToken)
  .build();
// In case of HttpClientTestingModule,
// it should be kept instead of replacement.
const ngModule = MockBuilder(MyComponent, MyModule)
  .keep(HttpClientModule)
  .keep(HttpClientTestingModule)
  .build();
// For pipes we can set its handler as the 2nd parameter of .mock too.
const ngModule = MockBuilder(MyComponent, MyModule)
  .mock(SomePipe, value => 'My Custom Content')
  .build();
// If we want to add or replace a provider or a service
// we should use .provide.
// It has the same interface as a regular provider.
const ngModule = MockBuilder(MyComponent, MyModule)
  .provide(MyService)
  .provide([SomeService1, SomeService2])
  .provide({ provide: SomeComponent3, useValue: anything1 })
  .provide({ provide: SOME_TOKEN, useFactory: () => anything2 })
  .build();

// If we need to mock, or to use useValue we can use .mock for that.
const ngModule = MockBuilder(MyComponent, MyModule)
  .mock(MyService)
  .mock(SomeService1)
  .mock(SomeService2)
  .mock(SomeComponent3, anything1)
  .mock(SOME_TOKEN, anything2)
  .build();

// Anytime we can change our decision.
// The last action on the same object wins.
const ngModule = MockBuilder(MyComponent, MyModule)
  .keep(SomeModule)
  .mock(SomeModule)
  .keep(SomeModule)
  .mock(SomeModule)
  .build();

// If we want to test a component, directive or pipe which was not
// exported we should mark it as an 'export'.
// Does not matter how deep it is. It will be exported to the level of
// TestingModule.
const ngModule = MockBuilder(MyComponent, MyModule)
  .keep(SomeModuleComponentDirectivePipeProvider1, {
    export: true,
  })
  .build();

// If we want to use declarations of a module which were not
// exported, we should mark the module with the 'exportAll' flag.
// Then all its imports and declarations will be exported.
// If the module is nested, then add `export` beside `exportAll`.
const ngModule = MockBuilder(MyComponent)
  .keep(MyModule, {
    exportAll: true,
  })
  .mock(MyNestedModule, {
    exportAll: true,
    export: true,
  })
  .build();

// By default all definitions (kept and mocked) are added to the
// TestingModule if they are not dependency of another definition.
// Modules are added as imports to the TestingModule.
// Components, Directive, Pipes are added as declarations to the
// TestingModule.
// Providers and Services are added as providers to the TestingModule.
// If we do not want something to be added to the TestingModule at all
// we should mark it as a 'dependency'.
const ngModule = MockBuilder(MyComponent, MyModule)
  .keep(SomeModuleComponentDirectivePipeProvider1, {
    dependency: true,
  })
  .mock(SomeModuleComponentDirectivePipeProvider1, {
    dependency: true,
  })
  .replace(SomeModuleComponentDirectivePipeProvider1, anything1, {
    dependency: true,
  })
  .build();

// Imagine we want to render a structural directive by default.
// Now we can do that via adding a 'render' flag in its config.
const ngModule = MockBuilder(MyComponent, MyModule)
  .mock(MyDirective, {
    render: true,
  })
  .build();

// Imagine the directive has own context and variables.
// Then instead of flag we can set its context.
const ngModule = MockBuilder(MyComponent, MyModule)
  .mock(MyDirective, {
    render: {
      $implicit: something1,
      variables: { something2: something3 },
    },
  })
  .build();

// If we use ContentChild in a component and we want to render it by
// default too, we should use its id for that in the same way as for
// a mocked directive.
const ngModule = MockBuilder(MyComponent, MyModule)
  .mock(MyDirective, {
    render: {
      blockId: true,
      blockWithContext: {
        $implicit: something1,
        variables: { something2: something3 },
      },
    },
  })
  .build();
```

</p>
</details>

---

## MockRender

`MockRender` provides a simple tool on how to render a custom template in an Angular test
in case if we want to cover functionality of components, directives, pipes, `@Inputs`, `@Outputs`, `@ContentChild` etc.

> Please note, that `MockRender(MyComponent)` is not assignable
> to `ComponentFixture<MyComponent>`.
>
> You should use either:
> `MockedComponentFixture<MyComponent>` or
> `ComponentFixture<DefaultRenderComponent<MyComponent>>`.
>
> It happens because `MockRender` generates an additional component
> to render the desired thing and its interface differs.

`MockRender` returns a `fixture` of a type of `MockedComponentFixture` (it extends `ComponentFixture`) with a `point` property.
`fixture.componentInstance` belongs to the middle component for the render,
whereas `fixture.point` points to the `debugElement` of the desired component.

Its type: `let fixture: MockedComponentFixture<ComponentToRender> = MockRender(ComponentToRender)`.

The best thing here is that `fixture.point.componentInstance` is typed to the component's class instead of `any`.

If you want, you can specify providers for the render passing them via the 3rd parameter.
It is useful when you want to mock system tokens / services such as `APP_INITIALIZER`, `DOCUMENT` etc.

And do not forget to call `fixture.detectChanges()` and / or `await fixture.whenStable()` to trigger updates.

<details><summary>Click to see <strong>an example how to render a custom template in an Angular tests</strong></summary>
<p>

```typescript
import { TestBed } from '@Angular/core/testing';
import { MockModule, MockRender, ngMocks } from 'ng-mocks';

import { DependencyModule } from './dependency.module';
import { TestedComponent } from './tested.component';

describe('MockRender', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestedComponent],
      imports: [MockModule(DependencyModule)],
    });
  });

  it('renders template', () => {
    const spy = jasmine.createSpy();
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

    // ngMocks.input helps to get current value of an input on
    // a related debugElement.
    expect(ngMocks.input(fixture.point, 'value1')).toEqual(
      'something1'
    );
    expect(ngMocks.input(fixture.point, 'value2')).toEqual('check');

    // ngMocks.output does the same with outputs.
    ngMocks.output(fixture.point, 'trigger').emit('foo1');
    expect(spy).toHaveBeenCalledWith('foo1');
  });

  it('renders component', () => {
    const spy = jasmine.createSpy();
    // Generates template like:
    // <tested [value1]="value1" [value2]="value2"
    // (trigger)="trigger"></tested>
    // and returns fixture with a component with properties value1,
    // value2 and empty callback trigger.
    const fixture = MockRender(TestedComponent, {
      trigger: spy,
      value1: 'something2',
    });

    // ngMocks.input helps to get current value of an input on
    // a related debugElement.
    expect(ngMocks.input(fixture.point, 'value1')).toEqual(
      'something2'
    );
    expect(ngMocks.input(fixture.point, 'value2')).toBeUndefined();

    // ngMocks.output does the same with outputs.
    ngMocks.output(fixture.point, 'trigger').emit('foo2');
    expect(spy).toHaveBeenCalledWith('foo2');

    // checking that an updated value has been passed into the testing
    // component.
    fixture.componentInstance.value1 = 'updated';
    fixture.detectChanges();
    expect(ngMocks.input(fixture.point, 'value1')).toEqual('updated');
  });
});
```

</p>
</details>

---

## MockInstance

`MockInstance` is useful when you want to configure spies of a declaration before its render.

`MockInstance` supports: Modules, Components, Directives, Pipes and Services.

> NOTE: it works only for pure mocks without overrides.
> If you provide an own mock via `useValue`
> or like `.mock(MyService, myMock)`
> then `MockInstance` does not have an effect.

```typescript
MockInstance(MyService, {
  init: (instance: MyService, injector: Injector): void => {
    // Now you can customize a mocked instance of MyService.
    // If you use auto-spy then all methods have been spied already
    // here.
    instance.data$ = EMPTY;
  },
});
```

After a test you can reset changes to avoid their influence in other tests via a call of `MockReset()`.

<details><summary>Click to see <strong>an example of mocking services before initialization in Angular tests</strong></summary>
<p>

```typescript
import { AfterViewInit, Component, ViewChild } from '@Angular/core';
import {
  MockBuilder,
  MockInstance,
  MockRender,
  MockReset,
} from 'ng-mocks';
import { staticFalse } from 'ng-mocks/dist/tests';
import { EMPTY, Observable, Subject } from 'rxjs';

// A child component that contains update$ the parent component wants
// to listen to.
@Component({
  selector: 'target',
  template: '{{ update$ | async }}',
})
export class TargetComponent {
  public update$: Observable<void>;

  constructor() {
    const subject = new Subject<void>();
    this.update$ = subject;
    subject.complete();
  }
}

// A parent component that uses @ViewChild to listen to update$ of
// its child component.
@Component({
  selector: 'real',
  template: '<target></target>',
})
export class RealComponent implements AfterViewInit {
  @ViewChild(TargetComponent, { ...staticFalse })
  public child: TargetComponent;

  ngAfterViewInit() {
    this.child.update$.subscribe();
  }
}

describe('MockInstance', () => {
  // A normal setup of the TestBed, TargetComponent will be mocked.
  beforeEach(() => MockBuilder(RealComponent).mock(TargetComponent));

  beforeEach(() => {
    // Because TargetComponent is mocked its update$ is undefined and
    // ngAfterViewInit of the parent component will fail on
    // .subscribe().
    // Let's fix it via defining custom initialization of the mock.
    MockInstance(TargetComponent, {
      init: (instance, injector) => {
        // comment this line to check the failure.
        instance.update$ = EMPTY;
        // if you want you can use injector.get(Service) for a more
        // complicated initialization.
      },
    });
  });

  // Do not forget to reset MockInstance back.
  afterEach(MockReset);

  it('should render', () => {
    // Without the custom initialization rendering would fail here
    // with "Cannot read property 'subscribe' of undefined".
    const fixture = MockRender(RealComponent);

    // Let's check that the mocked component has been decorated by
    // the custom initialization.
    expect(fixture.point.componentInstance.child.update$).toBe(EMPTY);
  });
});
```

</p>
</details>

---

## ngMocks

`ngMocks` provides functions to get attribute and structural directives from an element, find components and mock objects.

- `ngMocks.get(debugElement, directive, notFoundValue?)`
- `ngMocks.findInstance(debugElement, directive, notFoundValue?)`
- `ngMocks.findInstances(debugElement, directive)`

* `ngMocks.find(debugElement, component, notFoundValue?)`
* `ngMocks.findAll(debugElement, component)`

- `ngMocks.input(debugElement, input, notFoundValue?)`
- `ngMocks.output(debugElement, output, notFoundValue?)`

* `ngMocks.stub(service, method)`
* `ngMocks.stub(service, methods)`
* `ngMocks.stub(service, property, 'get' | 'set')`

- `ngMocks.faster()` - [optimizes setup](#making-angular-tests-faster) between tests in a suite
- `ngMocks.flushTestBed()` - flushes initialization of TestBed
- `ngMocks.reset()` - resets caches of [`ngMocks`](#ngmocks)

<details><summary>Click to see <strong>an example of all functionality of ngMocks</strong></summary>
<p>

```typescript
// Returns an attribute or structural directive which belongs to
// the current element.
const directive: Directive = ngMocks.get(
  fixture.debugElement,
  Directive
);

// Returns the first found attribute or structural directive which
// belongs to the current element or any child.
const directive: Directive = ngMocks.findInstance(
  fixture.debugElement,
  Directive
);

// Returns an array of all found attribute or structural directives
// which belong to the current element and all its child.
const directives: Array<Directive> = ngMocks.findInstances(
  fixture.debugElement,
  Directive
);

// Returns a found DebugElement which belongs to the Component
// with the correctly typed componentInstance.
const component: MockedDebugElement<Component> = ngMocks.find(
  fixture.debugElement,
  Component
);

// Returns an array of found DebugElements which belong to
// the Component with the correctly typed componentInstance.
const components: Array<MockedDebugElement<
  Component
>> = ngMocks.findAll(fixture.debugElement, Component);

// Returns a found DebugElement which belongs to a css selector.
const component: MockedDebugElement<Component> = ngMocks.find(
  fixture.debugElement,
  'div.container'
);

// Returns an array of found DebugElements which belong to
// a css selector.
const components: Array<MockedDebugElement<
  Component
>> = ngMocks.findAll(fixture.debugElement, 'div.item');
```

To avoid pain of knowing a name of a component or a directive what an input or an output belongs to, you can use next functions:

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

```typescript
describe('MockService', () => {
  it('mocks getters, setters and methods in a way that jasmine can mock them w/o an issue', () => {
    const mock: GetterSetterMethodHuetod = MockService(
      GetterSetterMethodHuetod
    );
    expect(mock).toBeDefined();

    // Creating a mock on the getter.
    spyOnProperty(mock, 'name', 'get').and.returnValue('mock');
    // for jest
    // spyOnProperty(mock, 'name', 'get').mockReturnValue('mock');
    expect(mock.name).toEqual('mock');

    // Creating a mock on the setter.
    spyOnProperty(mock, 'name', 'set');
    mock.name = 'mock';
    expect(ngMocks.stub(mock, 'name', 'set')).toHaveBeenCalledWith(
      'mock'
    );

    // Creating a mock on the method.
    spyOn(mock, 'nameMethod').and.returnValue('mock');
    // for jest
    // spyOn(mock, 'nameMethod').mockReturnValue('mock');
    expect(mock.nameMethod('mock')).toEqual('mock');
    expect(ngMocks.stub(mock, 'nameMethod')).toHaveBeenCalledWith(
      'mock'
    );
  });
});
```

</p>
</details>

---

## Usage with 3rd-party libraries

`ngMocks` provides flexibility via [`MockBuilder`](#mockbuilder)
that allows developers to use another Angular testing libraries for creation of `TestBed`,
and in the same time mock all dependencies via `ngMocks`.

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

Profit.

---

## Making Angular tests faster

There is a `ngMocks.faster` feature that optimizes setup of similar test modules between tests
and reduces required time on their execution.

Imagine a situation when `beforeEach` creates the same setup used by dozens of `it`.
This is the case where `ngMocks.faster` might be useful, simply call it before `beforeEach` and
the tests will run faster.

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

If you want all mocks in your Angular tests to be automatically spied then
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

## Find an issue or have a question or a request?

[Ask a question on gitter](https://gitter.im/ng-mocks/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge),
[report it as an issue on github](https://github.com/ike18t/ng-mocks/issues),
or [submit a PR](https://github.com/ike18t/ng-mocks/pulls). I'm open to contributions.
