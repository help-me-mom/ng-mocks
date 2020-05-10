[![Build Status](https://travis-ci.org/ike18t/ng-mocks.png?branch=master)](https://travis-ci.org/ike18t/ng-mocks)
[![npm version](https://badge.fury.io/js/ng-mocks.svg)](https://badge.fury.io/js/ng-mocks)

# ngMocks

Helper function for creating angular mocks for test.

## Why use this?

Sure, you could flip a flag on schema errors to make your component dependencies not matter.
Or you could use this to mock them out and have the ability to assert on their inputs or emit on an output to assert on a side effect.

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

### Usage Example

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent, MockedComponent, MockHelper, MockRender } from 'ng-mocks';

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
    const mockedComponent = MockHelper.findOrFail<DependencyComponent>(
      fixture.debugElement,
      'dependency-component-selector'
    ).componentInstance;

    // let's pretend Dependency Component (unmocked) has 'someInput' as an input
    // the input value will be passed into the mocked component so you can assert on it
    component.value = 'foo';
    fixture.detectChanges();

    // if you casted mockedComponent as the original component type then this is type safe
    expect(mockedComponent.someInput).toEqual('foo');
  });

  it('should do something when the dependency component emits on its output', () => {
    spyOn(component, 'trigger');
    const mockedComponent = MockHelper.findOrFail(fixture.debugElement, DependencyComponent).componentInstance;

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

    // injected ng-content says as it was.
    const mockedNgContent = localFixture.point.nativeElement.innerHTML;
    expect(mockedNgContent).toContain('<p>inside content</p>');

    // because component does have @ContentChild we need to render them first with proper context.
    const mockedComponent = localFixture.point.componentInstance;
    mockedComponent.__render('something');
    localFixture.detectChanges();

    const mockedNgTemplate = MockHelper.findOrFail(localFixture.debugElement, '[data-key="something"]').nativeElement
      .innerHTML;
    expect(mockedNgTemplate).toContain('<p>inside template</p>');
  });
});
```

## MockDirective(s)

- Mocked directive with the same selector
- Inputs and Outputs with alias support
- Each directive instance has its own EventEmitter instances for outputs
- exportAs support

### Usage Example of Attribute Directives

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockDirective, MockHelper } from 'ng-mocks';

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
    const mockedDirectiveInstance = MockHelper.getDirectiveOrFail(
      MockHelper.findOrFail(fixture.debugElement, 'span'),
      DependencyDirective
    );

    expect(mockedDirectiveInstance.someInput).toEqual('foo');
    // assert on some side effect
  });

  it('should do something when the dependency directive emits on its output', () => {
    spyOn(component, 'trigger');
    fixture.detectChanges();

    // again, let's pretend DependencyDirective has an output called 'someOutput'
    // emit on the output that MockDirective setup when generating the mock of Dependency Directive
    const mockedDirectiveInstance = MockHelper.getDirectiveOrFail(
      MockHelper.findOrFail(fixture.debugElement, 'span'),
      DependencyDirective
    );
    mockedDirectiveInstance.someOutput.emit({
      payload: 'foo',
    }); // if you casted mockedDirective as the original component type then this is type safe
    // assert on some side effect
  });
});
```

### Usage Example of Structural Directives

It's important to render a structural directive first with right context,
when assertions should be done on its nested elements.

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockDirective, MockedDirective, MockHelper } from 'ng-mocks';

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
    const mockedDirectiveInstance = MockHelper.findDirectiveOrFail(
      fixture.debugElement,
      DependencyDirective
    ) as MockedDirective<DependencyDirective>;

    // now we assert that nothing has been rendered inside of the structural directive by default.
    expect(fixture.debugElement.nativeElement.innerText).not.toContain('content');

    // and now we render it manually.
    mockedDirectiveInstance.__render();
    expect(fixture.debugElement.nativeElement.innerText).toContain('content');

    // let's pretend Dependency Directive (unmocked) has 'someInput' as an input
    // the input value will be passed into the mocked directive so you can assert on it
    expect(mockedDirectiveInstance.someInput).toEqual('foo');
    // assert on some side effect
  });
});
```

## MockPipe(s)

- Mocked pipe with the same name.
- Ability to override the transform function with a type-safe function
- Default transform is () => undefined to prevent problems with chaining

Personally, I found the best thing to do for assertions is to override the transform to write the args so that I can assert on the arguments.

### Usage Example

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockHelper, MockPipe } from 'ng-mocks';

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
      const pipeElement = MockHelper.findOrFail(fixture.debugElement, 'span');
      expect(pipeElement.nativeElement.innerHTML).toEqual('["foo"]');
    });
  });
});
```

## Mocked Reactive Forms Components

- Set value on the formControl by calling \_\_simulateChange
- Set touched on the formControl by calling \_\_simulateTouch
- Use the `MockedComponent` type to stay typesafe: `MockedComponent<YourReactiveFormComponent>`

### Usage Example

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MockComponent, MockedComponent, MockHelper } from 'ng-mocks';

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
    const mockedReactiveFormComponent = MockHelper.findOrFail<MockedComponent<DependencyComponent>>(
      fixture.debugElement,
      'dependency-component-selector'
    ).componentInstance;

    mockedReactiveFormComponent.__simulateChange('foo');
    expect(component.formControl.value).toBe('foo');
  });
});
```

## MockDeclaration(s)

It figures out if it is a component, directive, or pipe and mocks it for you

## MockModule

- Mocks all components, directives, and pipes using MockDeclaration
- Providers are all mocked as empty objects
- Module Dependencies are also mocked

For providers I typically will use TestBed.get(SomeProvider) and extend it using a library like [ts-mocks](https://www.npmjs.com/package/ts-mocks).

### Usage Example

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

## MockRender

Provides a simple way to render anything for ease of testing directives, pipes, `@Inputs`, `@Outputs`, `@ContentChild` of a component, etc.

It returns a `fixture` of type `MockedComponentFixture` (it extends `ComponentFixture`) with a `point` property.
`fixture.componentInstance` belongs to the middle component for the render, that is quite useless,
when `fixture.point` points to the debugElement of the passed component.

Its type: `let fixture: MockedComponentFixture<ComponentToRender> = MockRender(ComponentToRender)`.

The best thing here is that `fixture.point.componentInstance` is typed to the component's class instead of any.

If you want you can specify providers for the render passing them via the 3rd parameter.
It is useful if you want to mock system tokens / services such as APP_INITIALIZER, DOCUMENT etc.

### Usage Example

```typescript
import { TestBed } from '@angular/core/testing';
import { MockModule, MockRender } from 'ng-mocks';

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

    // assert on some side effect
    const componentInstance = fixture.point.componentInstance as TestedComponent;
    componentInstance.trigger.emit('foo1');
    expect(componentInstance.value1).toEqual('something1');
    expect(componentInstance.value2).toEqual('check');
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

    // assert on some side effect
    const componentInstance = fixture.point.componentInstance; // it is not any, it is TestedComponent.
    componentInstance.trigger.emit('foo2');
    expect(componentInstance.value1).toEqual('something2');
    expect(componentInstance.value2).toBeUndefined();
    expect(spy).toHaveBeenCalledWith('foo2');
  });
});
```

## MockHelper

MockHelper provides functions to get attribute and structural directives from an element, find components and mock objects.

- getDirective
- getDirectiveOrFail
- findDirective
- findDirectiveOrFail
- findDirectives

* find
* findOrFail
* findAll

- mockService

```typescript
// returns attribute or structural directive
// which belongs to current element.
const directive: Directive | undefined = MockHelper.getDirective(fixture.debugElement, Directive);

// returns the first found attribute or structural directive
// which belongs to current element or any child.
const directive: Directive | undefined = MockHelper.findDirective(fixture.debugElement, Directive);

// returns an array of all found attribute or structural directives
// which belong to current element and all its child.
const directives: Array<Directive> = MockHelper.findDirectives(fixture.debugElement, Directive);

// returns a found DebugElement which belongs to the Component
// with the correctly typed componentInstance or null.
const component: MockedDebugElement<Component> | undefined = MockHelper.find(fixture.debugElement, Component);

// returns an array of found DebugElements which belong to the Component
// with the correctly typed componentInstance.
const components: Array<MockedDebugElement<Component>> = MockHelper.findAll(fixture.debugElement, Component);

// returns a found DebugElement which belongs to a css selector.
const component: MockedDebugElement<Component> | undefined = MockHelper.find(fixture.debugElement, 'div.container');

// returns an array of found DebugElements which belong to a css selector.
const components: Array<MockedDebugElement<Component>> = MockHelper.findAll(fixture.debugElement, 'div.item');
```

```typescript
// throws an error if the desired element wasn't found.
const directive: Directive = MockHelper.getDirectiveOrFail(fixture.debugElement, Directive);
const directive: Directive = MockHelper.findDirectiveOrFail(fixture.debugElement, Directive);
const component: MockedDebugElement<Component> = MockHelper.findOrFail(fixture.debugElement, Component);
const component: MockedDebugElement<Component> = MockHelper.findOrFail(fixture.debugElement, 'div.container');
```

In case if we want to mock methods / properties of a service / provider.

```typescript
// returns a mocked function / spy of the method. If the method hasn't been mocked yet - mocks it.
const spy: Spy = MockHelper.mockService(instance, methodName);

// returns a mocked function / spy of the property. If the property hasn't been mocked yet - mocks it.
const spyGet: Spy = MockHelper.mockService(instance, propertyName, 'get');
const spySet: Spy = MockHelper.mockService(instance, propertyName, 'set');
```

```typescript
// The example below uses auto spy.
describe('MockService', () => {
  it('mocks getters, setters and methods in a way that jasmine can mock them w/o an issue', () => {
    // please note that auto spy should be enabled for this test.
    const mock: GetterSetterMethodHuetod = MockService(GetterSetterMethodHuetod);
    expect(mock).toBeDefined();

    // Creating a mock on the getter.
    MockHelper.mockService<jasmine.Spy>(mock, 'name', 'get').and.returnValue('mock');
    expect(mock.name).toEqual('mock');

    // Creating a mock on the setter.
    MockHelper.mockService(mock, 'name', 'set');
    mock.name = 'mock';
    expect(MockHelper.mockService(mock, 'name', 'set')).toHaveBeenCalledWith('mock');

    // Creating a mock on the method.
    MockHelper.mockService<jasmine.Spy>(mock, 'nameMethod').and.returnValue('mock');
    expect(mock.nameMethod('mock')).toEqual('mock');
    expect(MockHelper.mockService(mock, 'nameMethod')).toHaveBeenCalledWith('mock');

    // Creating a mock on the method that doesn't exist.
    MockHelper.mockService<jasmine.Spy>(mock, 'fakeMethod').and.returnValue('mock');
    expect((mock as any).fakeMethod('mock')).toEqual('mock');
    expect(MockHelper.mockService(mock, 'fakeMethod')).toHaveBeenCalledWith('mock');
  });
});
```

## Auto Spy

Add the next code to `src/test.ts` if you want all mocked methods and functions to be a jasmine spy.

```typescript
import 'ng-mocks/dist/jasmine';

// uncomment in case if existing tests are with spies already.
// jasmine.getEnv().allowRespy(true);
```

In case of jest.

```typescript
import 'ng-mocks/dist/jest';
```

## Other examples of tests

More detailed examples can be found in
[e2e](https://github.com/ike18t/ng-mocks/tree/master/e2e)
and in
[examples](https://github.com/ike18t/ng-mocks/tree/master/examples)
directories in the repo.

## Find an issue or have a request?

Report it as an issue or submit a PR. I'm open to contributions.

<https://github.com/ike18t/ng-mocks>
