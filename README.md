[![Build Status](https://travis-ci.org/ike18t/ng-mocks.png?branch=master)](https://travis-ci.org/ike18t/ng-mocks)
[![npm version](https://badge.fury.io/js/ng-mocks.svg)](https://badge.fury.io/js/ng-mocks)

# ngMocks

Helper function for creating angular mocks for test.

The current version can be used and has been tested on:

- Angular 5 (Jasmine, Jest, es5, es2015)
- Angular 6 (Jasmine, Jest, es5, es2015)
- Angular 7 (Jasmine, Jest, es5, es2015)
- Angular 8 (Jasmine, Jest, es5, es2015)
- Angular 9 (Jasmine, Jest, Ivy, es5, es2015)
- Angular 10 (Jasmine, Jest, Ivy, es5, es2015)

## Why use this?

Sure, you could flip a flag on schema errors to make your component dependencies not matter.
Or you could use this to mock them out and have the ability to assert on their inputs or emit on an output to assert on a side effect.

For an easy start check the [MockBuilder](#mockbuilder) first.

```typescript
import { CommonModule } from '@angular/common';
import { Component, ContentChild, ElementRef, EventEmitter, Input, NgModule, Output, TemplateRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// Our main component that we want to test.
@Component({
  selector: 'app-root',
  template: `
    <app-header [showLogo]="true" [title]="title" (logo)="logoClick.emit()">
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
    <a (click)="logo.emit()"><img src="assets/logo.png" *ngIf="showLogo" /></a>
    {{ title }}
    <template [ngTemplateOutlet]="menu"></template>
  `,
})
export class AppHeaderComponent {
  @Input() public showLogo: boolean;
  @Input() public title: string;

  @Output() public logo: EventEmitter<void>;

  @ContentChild('menu', { read: false } as any) public menu: TemplateRef<ElementRef>;
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
  // Instead of AppHeaderComponent we want to have a mock and
  // usually doing it via a helper component
  // or setting NO_ERRORS_SCHEMA.

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
    const logoClickSpy = typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();

    // Instead of TestBed.createComponent(AppComponent)
    // in beforeEach MockRender should be directly used
    // in tests.
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

    // The same as fixture.debugElement.query(By.directive(AppHeaderComponent));
    // but typesafe and fails if nothing was found.
    const header = ngMocks.find(fixture.debugElement, AppHeaderComponent);

    // Asserting how AppComponent uses AppHeaderComponent.
    expect(header.componentInstance.showLogo).toBe(true);
    expect(header.componentInstance.title).toBe('Fake Application');

    // Checking that AppComponents updates AppHeaderComponent.
    fixture.componentInstance.title = 'Updated Application';
    fixture.detectChanges();
    expect(header.componentInstance.title).toBe('Updated Application');

    // Checking that AppComponent listens on outputs of AppHeaderComponent.
    expect(logoClickSpy).not.toHaveBeenCalled();
    header.componentInstance.logo.emit();
    expect(logoClickSpy).toHaveBeenCalled();

    // Asserting that AppComponent passes the right menu into AppHeaderComponent.
    const links = ngMocks.findAll(header, 'a');
    expect(links.length).toBe(2);

    // An easy way to get a value of an input.
    // the same as links[0].injector.get(RouterLinkWithHref).routerLink
    expect(ngMocks.input(links[0], 'routerLink')).toEqual(['/home']);
    expect(ngMocks.input(links[1], 'routerLink')).toEqual(['/about']);
  });
});
```

Our tests:

- [examples from the doc](https://github.com/ike18t/ng-mocks/tree/master/examples)
- [current e2e tests](https://github.com/ike18t/ng-mocks/tree/master/tests)

### Sections:

- [MockBuilder](#mockbuilder) - facilitates creation of a mocked environment
- [MockRender](#mockrender) - facilitates rendering of components
- [MockInstance](#mockinstance) - customizes mocked instances on an early stage
- [ngMocks](#ngmocks) - facilitates interaction with a fixture, DOM etc.

* [MockComponent](#mockcomponents)
* [MockDirective](#mockdirectives)
* [MockPipe](#mockpipes)
* [MockDeclaration](#mockdeclarations)
* [MockModule](#mockmodule)

* [Reactive Forms Components](#mocked-reactive-forms-components)
* [Structural Components](#usage-example-of-structural-directives)
* [Auto Spy](#auto-spy)

---

## MockComponent(s)

- Mocked component with the same selector
- Inputs and Outputs with alias support
- Each component instance has its own EventEmitter instances for outputs
- Mocked component templates are `ng-content` tags to allow transclusion
- Supports `@ContentChild` with \$implicit context.
- Allows ng-model binding (You will have to add FormsModule to TestBed imports)
- Mocks Reactive Forms (You will have to add ReactiveFormsModule to TestBed imports)
  - \_\_simulateChange - calls `onChanged` on the mocked component bound to a FormControl
  - \_\_simulateTouch - calls `onTouched` on the mocked component bound to a FormControl
- exportAs support

<details><summary>Click to see <strong>a usage example</strong></summary>
<p>

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent, MockedComponent, MockRender, ngMocks } from 'ng-mocks';

import { DependencyComponent } from './dependency.component';
import { TestedComponent } from './tested.component';

describe('MockComponent', () => {
  let fixture: ComponentFixture<TestedComponent>;
  let component: TestedComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestedComponent, MockComponent(DependencyComponent)],
    });

    fixture = TestBed.createComponent(TestedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should send the correct value to the dependency component input', () => {
    // the same as fixture.debugElement.query(By.css('dependency-component-selector')).componentInstance
    // but properly typed.
    const mockedComponent = ngMocks.find<DependencyComponent>(fixture.debugElement, 'dependency-component-selector')
      .componentInstance;

    // let's pretend Dependency Component (unmocked) has 'someInput' as an input
    // the input value will be passed into the mocked component so you can assert on it
    component.value = 'foo';
    fixture.detectChanges();

    // if you casted mockedComponent as the original component type then this is type safe
    expect(mockedComponent.someInput).toEqual('foo');
  });

  it('should do something when the dependency component emits on its output', () => {
    spyOn(component, 'trigger');
    const mockedComponent = ngMocks.find(fixture.debugElement, DependencyComponent).componentInstance;

    // again, let's pretend DependencyComponent has an output called 'someOutput'
    // emit on the output that MockComponent setup when generating the mock of Dependency Component
    // if you casted mockedComponent as the original component type then this is type safe
    mockedComponent.someOutput.emit({
      payload: 'foo',
    });

    // assert on some side effect
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

    // because component does not have any @ContentChild we can access html directly.
    // assert on some side effect
    const mockedNgContent = localFixture.point.nativeElement.innerHTML;
    expect(mockedNgContent).toContain('<p>inside content</p>');
  });

  it('should render something inside of the dependency component', () => {
    const localFixture = MockRender<MockedComponent<DependencyComponent>>(`
      <dependency-component-selector>
        <ng-template #something><p>inside template</p></ng-template>
        <p>inside content</p>
      </dependency-component-selector>
    `);

    // injected ng-content stays as it was.
    const mockedNgContent = localFixture.point.nativeElement.innerHTML;
    expect(mockedNgContent).toContain('<p>inside content</p>');

    // because component does have @ContentChild we need to render them first with proper context.
    const mockedComponent = localFixture.point.componentInstance;
    mockedComponent.__render('something');
    localFixture.detectChanges();

    const mockedNgTemplate = ngMocks.find(localFixture.debugElement, '[data-key="something"]').nativeElement.innerHTML;
    expect(mockedNgTemplate).toContain('<p>inside template</p>');
  });
});
```

</p>
</details>

---

## MockDirective(s)

- Mocked directive with the same selector
- Inputs and Outputs with alias support
- Each directive instance has its own EventEmitter instances for outputs
- exportAs support

<details><summary>Click to see <strong>a usage example</strong> of Attribute Directives</summary>
<p>

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockDirective, ngMocks } from 'ng-mocks';

import { DependencyDirective } from './dependency.directive';
import { TestedComponent } from './tested.component';

describe('MockDirective', () => {
  let fixture: ComponentFixture<TestedComponent>;
  let component: TestedComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestedComponent, MockDirective(DependencyDirective)],
    });

    fixture = TestBed.createComponent(TestedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should send the correct value to the dependency component input', () => {
    component.value = 'foo';
    fixture.detectChanges();

    // let's pretend Dependency Directive (unmocked) has 'someInput' as an input
    // the input value will be passed into the mocked directive so you can assert on it
    const mockedDirectiveInstance = ngMocks.get(ngMocks.find(fixture.debugElement, 'span'), DependencyDirective);

    expect(mockedDirectiveInstance.someInput).toEqual('foo');
    // assert on some side effect
  });

  it('should do something when the dependency directive emits on its output', () => {
    spyOn(component, 'trigger');
    fixture.detectChanges();

    // again, let's pretend DependencyDirective has an output called 'someOutput'
    // emit on the output that MockDirective setup when generating the mock of Dependency Directive
    const mockedDirectiveInstance = ngMocks.get(ngMocks.find(fixture.debugElement, 'span'), DependencyDirective);
    mockedDirectiveInstance.someOutput.emit({
      payload: 'foo',
    }); // if you casted mockedDirective as the original component type then this is type safe
    // assert on some side effect
  });
});
```

</p>
</details>

<details><summary>Click to see <strong>a usage example</strong> of Structural Directives</summary>
<p>

It's important to render a structural directive first with the right context,
when assertions should be done on its nested elements.

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockDirective, MockedDirective, ngMocks } from 'ng-mocks';

import { DependencyDirective } from './dependency.directive';
import { TestedComponent } from './tested.component';

describe('MockDirective', () => {
  let fixture: ComponentFixture<TestedComponent>;
  let component: TestedComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestedComponent, MockDirective(DependencyDirective)],
    });

    fixture = TestBed.createComponent(TestedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should send the correct value to the dependency component input', () => {
    component.value = 'foo';
    fixture.detectChanges();

    // IMPORTANT: by default structural directives aren't rendered.
    // Because we can't automatically detect when and with which context they should be rendered.
    // Usually developer knows context and can render it manually with proper setup.
    const mockedDirectiveInstance = ngMocks.findInstance(fixture.debugElement, DependencyDirective) as MockedDirective<
      DependencyDirective
    >;

    // now we assert that nothing has been rendered inside of the structural directive by default.
    expect(fixture.debugElement.nativeElement.innerHTML).not.toContain('>content<');

    // and now we render it manually.
    mockedDirectiveInstance.__render();
    expect(fixture.debugElement.nativeElement.innerHTML).toContain('>content<');

    // let's pretend Dependency Directive (unmocked) has 'someInput' as an input
    // the input value will be passed into the mocked directive so you can assert on it
    expect(mockedDirectiveInstance.someInput).toEqual('foo');
    // assert on some side effect
  });
});
```

</p>
</details>

---

## MockPipe(s)

- Mocked pipe with the same name.
- Ability to override the transform function with a type-safe function
- Default transform is () => undefined to prevent problems with chaining

Personally, I found the best thing to do for assertions is to override the transform to write the args so that I can assert on the arguments.

<details><summary>Click to see <strong>a usage example</strong></summary>
<p>

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockPipe, ngMocks } from 'ng-mocks';

import { DependencyPipe } from './dependency.pipe';
import { TestedComponent } from './tested.component';

describe('MockPipe', () => {
  let fixture: ComponentFixture<TestedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestedComponent,

        // alternatively you can use MockPipes to mock multiple but you lose the ability to override
        MockPipe(DependencyPipe, (...args: string[]) => JSON.stringify(args)),
      ],
    });

    fixture = TestBed.createComponent(TestedComponent);
    fixture.detectChanges();
  });

  describe('with transform override', () => {
    it('should return the result of the provided transform function', () => {
      const pipeElement = ngMocks.find(fixture.debugElement, 'span');
      expect(pipeElement.nativeElement.innerHTML).toEqual('["foo"]');
    });
  });
});
```

</p>
</details>

---

## Mocked Reactive Forms Components

- Set value on the formControl by calling \_\_simulateChange
- Set touched on the formControl by calling \_\_simulateTouch
- Use the `MockedComponent` type to stay typesafe: `MockedComponent<YourReactiveFormComponent>`

<details><summary>Click to see <strong>a usage example</strong></summary>
<p>

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MockComponent, MockedComponent, ngMocks } from 'ng-mocks';

import { DependencyComponent } from './dependency.component';
import { TestedComponent } from './tested.component';

describe('MockReactiveForms', () => {
  let fixture: ComponentFixture<TestedComponent>;
  let component: TestedComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestedComponent, MockComponent(DependencyComponent)],
      imports: [ReactiveFormsModule],
    });

    fixture = TestBed.createComponent(TestedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should send the correct value to the dependency component input', () => {
    const mockedReactiveFormComponent = ngMocks.find<MockedComponent<DependencyComponent>>(
      fixture.debugElement,
      'dependency-component-selector'
    ).componentInstance;

    mockedReactiveFormComponent.__simulateChange('foo');
    expect(component.formControl.value).toBe('foo');

    spyOn(mockedReactiveFormComponent, 'writeValue');
    component.formControl.setValue('bar');
    expect(mockedReactiveFormComponent.writeValue).toHaveBeenCalledWith('bar');
  });
});
```

</p>
</details>

---

## MockDeclaration(s)

It figures out if it is a component, directive, or pipe and mocks it for you

---

## MockModule

- Mocks all components, directives, and pipes using MockDeclaration
- Providers are all mocked as empty objects
- Module Dependencies are also mocked

For providers I typically will use TestBed.get(SomeProvider) and extend it using a library like [ts-mocks](https://www.npmjs.com/package/ts-mocks).

<details><summary>Click to see <strong>a usage example</strong></summary>
<p>

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockModule } from 'ng-mocks';

import { DependencyModule } from './dependency.module';
import { TestedComponent } from './tested.component';

describe('MockModule', () => {
  let fixture: ComponentFixture<TestedComponent>;
  let component: TestedComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestedComponent],
      imports: [MockModule(DependencyModule)],
    });

    fixture = TestBed.createComponent(TestedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders nothing without any error', () => {
    expect(component).toBeTruthy();
  });
});
```

</p>
</details>

---

## MockBuilder

The simplest way to mock everything, but not the component for testing is usage of `MockBuilder`.
Check `examples/MockBuilder/` for real examples. It's useful together with [MockRender](#MockRender).

<details><summary>Click to see <strong>a usage example</strong></summary>
<p>

```typescript
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';

import { MyComponent } from './fixtures.components';
import { MyModule } from './fixtures.modules';

describe('MockBuilder:simple', () => {
  beforeEach(() => MockBuilder(MyComponent, MyModule));
  // the same as
  // beforeEach(() => TestBed.configureTestingModule({{
  //   imports: [MockModule(MyModule)], // but MyComponent wasn't mocked for the testing purposes.
  // }).compileComponents());
  // and we can simply pass it to the TestBed.

  it('should render content ignoring all dependencies', () => {
    const fixture = MockRender(MyComponent);
    expect(fixture).toBeDefined();
    expect(fixture.debugElement.nativeElement.innerHTML).toContain('<div>My Content</div>');
  });
});
```

</p>
</details>

<details><summary>Click to see <strong>a detailed information</strong></summary>
<p>

```typescript
import { MockBuilder } from 'ng-mocks';

// Mocks everything in MyModule (imports, declarations, providers)
// but keeps MyComponent as it is.
const ngModule = MockBuilder(MyComponent, MyModule).build();

// The same as code above.
const ngModule = MockBuilder().keep(MyComponent, { export: true }).mock(MyModule).build();

// If we want to keep a module, component, directive, pipe or provider as it is (not mocking).
// We should use .keep.
const ngModule = MockBuilder(MyComponent, MyModule)
  .keep(SomeModule)
  .keep(SomeComponent)
  .keep(SomeDirective)
  .keep(SomePipe)
  .keep(SomeDependency)
  .keep(SomeInjectionToken)
  .build();
// If we want to mock something, even a part of a kept module we should use .mock.
const ngModule = MockBuilder(MyComponent, MyModule)
  .mock(SomeModule)
  .mock(SomeComponent)
  .mock(SomeDirective)
  .mock(SomePipe)
  .mock(SomeDependency)
  .mock(SomeInjectionToken)
  .build();
// If we want to replace something with something we should use .replace.
// The replacement has to be decorated with the same decorator as the source.
// It's impossible to replace a provider or a service, we should use .provide or .mock for that.
const ngModule = MockBuilder(MyComponent, MyModule)
  .replace(SomeModule, SomeOtherModule)
  .replace(SomeComponent, SomeOtherComponent)
  .replace(SomeDirective, SomeOtherDirective)
  .replace(SomePipe, SomeOtherPipe)
  .build();
// In case of HttpClientTestingModule, it should be kept instead of replacement.
const ngModule = MockBuilder(MyComponent, MyModule).keep(HttpClientModule).keep(HttpClientTestingModule).build();
// For pipes we can set its handler as the 2nd parameter of .mock too.
const ngModule = MockBuilder(MyComponent, MyModule)
  .mock(SomePipe, value => 'My Custom Content')
  .build();
// If we want to add or replace a provider or a service we should use .provide.
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
// If we want to test a component, directive or pipe which wasn't exported
// we should mark it as an 'export'.
// Doesn't matter how deep it is. It will be exported to the level of TestingModule.
const ngModule = MockBuilder(MyComponent, MyModule)
  .keep(SomeModuleComponentDirectivePipeProvider1, {
    export: true,
  })
  .build();
// By default all definitions (kept and mocked) are added to the TestingModule
// if they are not dependency of another definition.
// Modules are added as imports to the TestingModule.
// Components, Directive, Pipes are added as declarations to the TestingModule.
// Providers and Services are added as providers to the TestingModule.
// If we don't want something to be added to the TestingModule at all
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
// If we use ContentChild in a component and we want to render it by default too
// we should use its id for that in the same way as for a mocked directive.
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

Provides a simple way to render anything for ease of testing directives, pipes, `@Inputs`, `@Outputs`, `@ContentChild` of a component, etc.

> Please note, that `MockRender(MyComponent)` is not assignable to `ComponentFixture<MyComponent>`.
>
> You should use either:
> `MockedComponentFixture<MyComponent>` or
> `ComponentFixture<DefaultRenderComponent<MyComponent>>`.
>
> It happens because `MockRender` generates an additional component to render the desired thing
> and its interface differs.

It returns a `fixture` of type `MockedComponentFixture` (it extends `ComponentFixture`) with a `point` property.
`fixture.componentInstance` belongs to the middle component for the render,
when `fixture.point` points to the debugElement of the desired component.

Its type: `let fixture: MockedComponentFixture<ComponentToRender> = MockRender(ComponentToRender)`.

The best thing here is that `fixture.point.componentInstance` is typed to the component's class instead of any.

If you want you can specify providers for the render passing them via the 3rd parameter.
It is useful if you want to mock system tokens / services such as `APP_INITIALIZER`, `DOCUMENT` etc.

And don't forget to call `fixture.detectChanges()` and / or `await fixture.whenStable()` to trigger updates.

<details><summary>Click to see <strong>a usage example</strong></summary>
<p>

```typescript
import { TestBed } from '@angular/core/testing';
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
        <tested (trigger)="myListener1($event)" [value1]="myParam1" value2="check">
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

    // ngMocks.input helps to get current value of an input on a related debugElement.
    expect(ngMocks.input(fixture.point, 'value1')).toEqual('something1');
    expect(ngMocks.input(fixture.point, 'value2')).toEqual('check');

    // ngMocks.output does the same with outputs.
    ngMocks.output(fixture.point, 'trigger').emit('foo1');
    expect(spy).toHaveBeenCalledWith('foo1');
  });

  it('renders component', () => {
    const spy = jasmine.createSpy();
    // generates template like:
    // <tested [value1]="value1" [value2]="value2" (trigger)="trigger"></tested>
    // and returns fixture with a component with properties value1, value2 and empty callback trigger.
    const fixture = MockRender(TestedComponent, {
      trigger: spy,
      value1: 'something2',
    });

    // ngMocks.input helps to get current value of an input on a related debugElement.
    expect(ngMocks.input(fixture.point, 'value1')).toEqual('something2');
    expect(ngMocks.input(fixture.point, 'value2')).toBeUndefined();

    // ngMocks.output does the same with outputs.
    ngMocks.output(fixture.point, 'trigger').emit('foo2');
    expect(spy).toHaveBeenCalledWith('foo2');

    // checking that an updated value has been passed into testing component.
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

`MockInstance` is useful when you want to configure spies of a component before it has been rendered.

MockInstance supports: Modules, Components, Directives, Pipes and Services.

```typescript
MockInstance(MyComponent, {
  init: (instance: MyComponent, injector: Injector): void => {
    // Now you can customize a mocked instance of MyComponent.
    // If you use auto-spy then all methods have been spied already here.
  },
});
```

After a test you can reset changes to avoid their influence in other tests via a call of `MockReset()`.

<details><summary>Click to see <strong>a usage example</strong></summary>
<p>

```typescript
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MockBuilder, MockInstance, MockRender, MockReset } from 'ng-mocks';
import { staticFalse } from 'ng-mocks/dist/tests';
import { EMPTY, Observable, Subject } from 'rxjs';

// A child component that contains update$ the parent component wants to listen to.
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

// A parent component that uses @ViewChild to listen to update$ of its child component.
@Component({
  selector: 'real',
  template: '<target></target>',
})
export class RealComponent implements AfterViewInit {
  @ViewChild(TargetComponent, { ...staticFalse }) public child: TargetComponent;

  ngAfterViewInit() {
    this.child.update$.subscribe();
  }
}

describe('MockInstance', () => {
  // A normal setup of the TestBed, TargetComponent will be mocked.
  beforeEach(() => MockBuilder(RealComponent).mock(TargetComponent));

  beforeEach(() => {
    // Because TargetComponent is mocked its update$ is undefined and
    // ngAfterViewInit of the parent component will fail on .subscribe().
    // Let's fix it via defining custom initialization of the mock.
    MockInstance(TargetComponent, {
      init: (instance, injector) => {
        instance.update$ = EMPTY; // comment this line to check the failure.
        // if you want you can use injector.get(Service) for a more complicated initialization.
      },
    });
  });

  // Don't forget to reset MockInstance back.
  afterEach(MockReset);

  it('should render', () => {
    // Without the custom initialization rendering would fail here with
    // "Cannot read property 'subscribe' of undefined"
    const fixture = MockRender(RealComponent);

    // Let's check that the mocked component has been decorated by the custom initialization.
    expect(fixture.point.componentInstance.child.update$).toBe(EMPTY);
  });
});
```

</p>
</details>

---

## ngMocks

ngMocks provides functions to get attribute and structural directives from an element, find components and mock objects.

- ngMocks.get(debugElement, directive, notFoundValue?)
- ngMocks.findInstance(debugElement, directive, notFoundValue?)
- ngMocks.findInstances(debugElement, directive)

* ngMocks.find(debugElement, component, notFoundValue?)
* ngMocks.findAll(debugElement, component)

- ngMocks.input(debugElement, input, notFoundValue?)
- ngMocks.output(debugElement, output, notFoundValue?)

* ngMocks.stub(service, method)
* ngMocks.stub(service, methods)
* ngMocks.stub(service, property, 'get' | 'set')

- ngMocks.flushTestBed()

<details><summary>Click to see <strong>a usage example</strong></summary>
<p>

```typescript
// returns attribute or structural directive
// which belongs to current element.
const directive: Directive = ngMocks.get(fixture.debugElement, Directive);

// returns the first found attribute or structural directive
// which belongs to current element or any child.
const directive: Directive = ngMocks.findInstance(fixture.debugElement, Directive);

// returns an array of all found attribute or structural directives
// which belong to current element and all its child.
const directives: Array<Directive> = ngMocks.findInstances(fixture.debugElement, Directive);

// returns a found DebugElement which belongs to the Component
// with the correctly typed componentInstance.
const component: MockedDebugElement<Component> = ngMocks.find(fixture.debugElement, Component);

// returns an array of found DebugElements which belong to the Component
// with the correctly typed componentInstance.
const components: Array<MockedDebugElement<Component>> = ngMocks.findAll(fixture.debugElement, Component);

// returns a found DebugElement which belongs to a css selector.
const component: MockedDebugElement<Component> = ngMocks.find(fixture.debugElement, 'div.container');

// returns an array of found DebugElements which belong to a css selector.
const components: Array<MockedDebugElement<Component>> = ngMocks.findAll(fixture.debugElement, 'div.item');
```

To avoid pain of knowing a name of a component or a directive what an input or an output belongs to, you can use next functions:

```typescript
const inputValue: number = ngMocks.input(debugElement, 'param1');
const outputValue: EventEmitter<any> = ngMocks.output(debugElement, 'update');
```

In case if we want to mock methods / properties of a service / provider.

```typescript
// returns a mocked function / spy of the method. If the method hasn't been mocked yet - mocks it.
const spy: Function = ngMocks.stub(instance, methodName);

// returns a mocked function / spy of the property. If the property hasn't been mocked yet - mocks it.
const spyGet: Function = ngMocks.stub(instance, propertyName, 'get');
const spySet: Function = ngMocks.stub(instance, propertyName, 'set');

// or add / override properties and methods.
ngMocks.stub(instance, {
  newPropert: true,
  existingMethod: jasmine.createSpy(),
});
```

```typescript
describe('MockService', () => {
  it('mocks getters, setters and methods in a way that jasmine can mock them w/o an issue', () => {
    const mock: GetterSetterMethodHuetod = MockService(GetterSetterMethodHuetod);
    expect(mock).toBeDefined();

    // Creating a mock on the getter.
    spyOnProperty(mock, 'name', 'get').and.returnValue('mock');
    // for jest
    // spyOnProperty(mock, 'name', 'get').mockReturnValue('mock');
    expect(mock.name).toEqual('mock');

    // Creating a mock on the setter.
    spyOnProperty(mock, 'name', 'set');
    mock.name = 'mock';
    expect(ngMocks.stub(mock, 'name', 'set')).toHaveBeenCalledWith('mock');

    // Creating a mock on the method.
    spyOn(mock, 'nameMethod').and.returnValue('mock');
    // for jest
    // spyOn(mock, 'nameMethod').mockReturnValue('mock');
    expect(mock.nameMethod('mock')).toEqual('mock');
    expect(ngMocks.stub(mock, 'nameMethod')).toHaveBeenCalledWith('mock');

    // Creating a mock on the method that doesn't exist.
    ngMocks.stub(mock, 'fakeMethod');
    spyOn(mock as any, 'fakeMethod').and.returnValue('mock');
    // for jest
    // spyOn(mock as any, 'fakeMethod').mockReturnValue('mock');
    expect((mock as any).fakeMethod('mock')).toEqual('mock');
    expect(ngMocks.stub(mock, 'fakeMethod')).toHaveBeenCalledWith('mock');

    // Creating a mock on the property that doesn't exist.
    ngMocks.stub(mock, 'fakeProp', 'get');
    ngMocks.stub(mock, 'fakeProp', 'set');
    spyOnProperty(mock as any, 'fakeProp', 'get').and.returnValue('mockProp');
    // for jest
    // spyOnProperty(mock as any, 'fakeProp', 'get').mockReturnValue('mockProp');
    spyOnProperty(mock as any, 'fakeProp', 'set');
    expect((mock as any).fakeProp).toEqual('mockProp');
    (mock as any).fakeProp = 'mockPropSet';
    expect(ngMocks.stub(mock as any, 'fakeProp', 'set')).toHaveBeenCalledWith('mockPropSet');
  });
});
```

</p>
</details>

## Auto Spy

Add the next code to `src/test.ts` if you want all mocked methods and functions to be a jasmine spy.

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

## Find an issue or have a request?

Report it as an issue or submit a PR. I'm open to contributions.

<https://github.com/ike18t/ng-mocks>
