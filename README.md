[![Build Status](https://travis-ci.org/ike18t/ng-mocks.png?branch=master)](https://travis-ci.org/ike18t/ng-mocks)
[![npm version](https://badge.fury.io/js/ng-mocks.svg)](https://badge.fury.io/js/ng-mocks)

# ngMocks
Helper function for creating angular mocks for test.

## Why use this?
Sure, you could flip a flag on schema errors to make your component dependencies not matter.  Or you could use this to mock them out and have the ability to assert on their inputs or emit on an output to assert on a side effect.

## MockComponent(s)

- Mocked component with the same selector
- Inputs and Outputs with alias support
- Each component instance has its own EventEmitter instances for outputs
- Mocked component templates are `ng-content` tags to allow transclusion
- When `@ContentChild` is present, then all of them will be wrapped as `[data-key="_id_"]`
  and `ng-content` with `[data-key="ng-content"]`
- Allows ng-model binding (You will have to add FormsModule to TestBed imports)
- Mocks Reactive Forms (You will have to add ReactiveFormsModule to TestBed imports)
    - __simulateChange - calls `onChanged` on the mocked component bound to a FormControl
    - __simulateTouch - calls `onTouched` on the mocked component bound to a FormControl
- exportAs support

### Usage Example
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponent, MockedComponent, MockRender } from 'ng-mocks';
import { DependencyComponent } from './dependency.component';
import { TestedComponent } from './tested.component';

describe('MockComponent', () => {
  let fixture: ComponentFixture<TestedComponent>;
  let component: TestedComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestedComponent,
        MockComponent(DependencyComponent),
      ]
    });

    fixture = TestBed.createComponent(TestedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should send the correct value to the dependency component input', () => {
    const mockedComponent = fixture.debugElement
      .query(By.css('dependency-component-selector'))
      .componentInstance as DependencyComponent; // casting to retain type safety

    // let's pretend Dependency Component (unmocked) has 'someInput' as an input
    // the input value will be passed into the mocked component so you can assert on it
    component.value = 'foo';
    fixture.detectChanges();

    // if you casted mockedComponent as the original component type then this is type safe
    expect(mockedComponent.someInput).toEqual('foo');
  });

  it('should do something when the dependency component emits on its output', () => {
    spyOn(component, 'trigger');
    const mockedComponent = fixture.debugElement
      .query(By.directive(DependencyComponent))
      .componentInstance as DependencyComponent; // casting to retain type safety

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
    const localFixture = MockRender(`
      <dependency-component-selector>
        <p>inside content</p>
      </dependency-component-selector>
    `);
    // because component does not have any @ContentChild we can access html directly.
    // assert on some side effect
    const mockedNgContent = localFixture.debugElement
      .query(By.directive(DependencyComponent))
      .nativeElement.innerHTML;
    expect(mockedNgContent).toContain('<p>inside content</p>');
  });

  it('should render something inside of the dependency component', () => {
    const localFixture = MockRender(`
      <dependency-component-selector>
        <ng-template #something><p>inside template</p></ng-template>
        <p>inside content</p>
      </dependency-component-selector>
    `);

    // injected ng-content says as it was.
    const mockedNgContent = localFixture.debugElement
      .query(By.directive(DependencyComponent))
      .nativeElement.innerHTML;
    expect(mockedNgContent).toContain('<p>inside content</p>');

    // because component does have @ContentChild we need to render them first with proper context.
    const mockedElement = localFixture.debugElement.query(By.directive(DependencyComponent));
    const mockedComponent: MockedComponent<DependencyComponent> = mockedElement.componentInstance;
    mockedComponent.__render('something');
    localFixture.detectChanges();

    const mockedNgTemplate = mockedElement.query(By.css('[data-key="something"]'))
      .nativeElement.innerHTML;
    expect(mockedNgTemplate).toContain('<p>inside template</p>');
  });
});
```

## MockDirective(s)

* Mocked directive with the same selector
* Inputs and Outputs with alias support
* Each directive instance has its own EventEmitter instances for outputs
* exportAs support

### Usage Example of Attribute Directives
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockDirective, MockHelper } from 'ng-mocks';
import { DependencyDirective } from './dependency.directive';
import { TestedComponent } from './tested.component';

describe('MockDirective', () => {
  let fixture: ComponentFixture<TestedComponent>;
  let component: TestedComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestedComponent,
        MockDirective(DependencyDirective),
      ]
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
    const mockedDirectiveInstance = MockHelper.getDirective(
      fixture.debugElement.query(By.css('span')),
      DependencyDirective,
    );
    expect(mockedDirectiveInstance).toBeTruthy();
    if (mockedDirectiveInstance) {
      expect(mockedDirectiveInstance.someInput).toEqual('foo');
    }
    // assert on some side effect
  });

  it('should do something when the dependency directive emits on its output', () => {
    spyOn(component, 'trigger');
    fixture.detectChanges();

    // again, let's pretend DependencyDirective has an output called 'someOutput'
    // emit on the output that MockDirective setup when generating the mock of Dependency Directive
    const mockedDirectiveInstance = MockHelper.getDirective(
      fixture.debugElement.query(By.css('span')),
      DependencyDirective,
    );
    expect(mockedDirectiveInstance).toBeTruthy();
    if (mockedDirectiveInstance) {
      mockedDirectiveInstance.someOutput.emit({
        payload: 'foo',
      }); // if you casted mockedDirective as the original component type then this is type safe
    }
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
      declarations: [
        TestedComponent,
        MockDirective(DependencyDirective),
      ]
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
    const mockedDirectiveInstance = MockHelper.findDirective(
      fixture.debugElement, DependencyDirective
    ) as MockedDirective<DependencyDirective>;
    fixture.detectChanges();

    // let's pretend Dependency Directive (unmocked) has 'someInput' as an input
    // the input value will be passed into the mocked directive so you can assert on it
    expect(mockedDirectiveInstance).toBeTruthy();
    if (mockedDirectiveInstance) {
      expect(mockedDirectiveInstance.someInput).toEqual('foo');
    }
    // assert on some side effect
  });
});
```
## MockPipe(s)

* Mocked pipe with the same name.
* Ability to override the transform function with a type-safe function
* Default transform is () => undefined to prevent problems with chaining

Personally, I found the best thing to do for assertions is to override the transform to write the args so that I can assert on the arguments.

### Usage Example
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockPipe } from 'ng-mocks';
import { DependencyPipe } from './dependency.pipe';
import { TestedComponent } from './tested.component';

describe('MockPipe', () => {
  let fixture: ComponentFixture<TestedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestedComponent,

        // alternatively you can use MockPipes to mock multiple but you lose the ability to override
        MockPipe(DependencyPipe, (...args) => JSON.stringify(args)),
      ]
    });

    fixture = TestBed.createComponent(TestedComponent);
    fixture.detectChanges();
  });

  describe('with transform override', () => {
    it('should return the result of the provided transform function', () => {
      expect(fixture.debugElement.query(By.css('span')).nativeElement.innerHTML).toEqual('["foo"]');
    });
  });
});
```

## Mocked Reactive Forms Components

- Set value on the formControl by calling __simulateChange
- Set touched on the formControl by calling __simulateTouch
- Use the `MockedComponent` type to stay typesafe: `MockedComponent<YourReactiveFormComponent>`

### Usage Example
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MockComponent, MockedComponent } from 'ng-mocks';
import { DependencyComponent } from './dependency.component';
import { TestedComponent } from './tested.component';

describe('MockReactiveForms', () => {
  let fixture: ComponentFixture<TestedComponent>;
  let component: TestedComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestedComponent,
        MockComponent(DependencyComponent),
      ],
      imports: [
        ReactiveFormsModule,
      ],
    });

    fixture = TestBed.createComponent(TestedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should send the correct value to the dependency component input', () => {
    const mockedReactiveFormComponent = fixture.debugElement
      .query(By.css('dependency-component-selector'))
      .componentInstance as MockedComponent<DependencyComponent>; // casting to retain type safety

    mockedReactiveFormComponent.__simulateChange('foo');
    expect(component.formControl.value).toBe('foo');
  });
});
```

## MockDeclaration(s)
It figures out if it is a component, directive, or pipe and mocks it for you

## MockModule
  * Mocks all components, directives, and pipes using MockDeclaration
  * Providers are all mocked as empty objects
  * Module Dependencies are also mocked

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
      declarations: [
        TestedComponent,
      ],
      imports: [
        MockModule(DependencyModule),
      ],
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
Providers simple way to render anything, change `@Inputs` and `@Outputs` of testing component, directives etc.

### Usage Example
```typescript
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockModule, MockRender } from 'ng-mocks';

import { DependencyModule } from './dependency.module';
import { TestedComponent } from './tested.component';

describe('MockRender', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestedComponent,
      ],
      imports: [
        MockModule(DependencyModule),
      ],
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
    const componentInstance = fixture.debugElement.query(By.directive(TestedComponent))
      .componentInstance as TestedComponent;
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
    const componentInstance = fixture.debugElement.query(By.directive(TestedComponent))
      .componentInstance as TestedComponent;
    componentInstance.trigger.emit('foo2');
    expect(componentInstance.value1).toEqual('something2');
    expect(componentInstance.value2).toBeUndefined();
    expect(spy).toHaveBeenCalledWith('foo2');
  });
});
```

## MockHelper
MockHelper provides 3 methods to get attribute and structural directives from an element. 

`MockHelper.getDirective(fixture.debugElement, Directive)` -
returns attribute or structural directive which belongs to current element.

`MockHelper.findDirective(fixture.debugElement, Directive)` -
returns first found attribute or structural directive which belongs to current element or any child.

`MockHelper.findDirectives(fixture.debugElement, Directive)`
returns all found attribute or structural directives which belong to current element and all its child.

## Other examples of tests
More detailed examples can be found in
[e2e](https://github.com/ike18t/ng-mocks/tree/master/e2e)
and in
[examples](https://github.com/ike18t/ng-mocks/tree/master/examples)
directories in the repo.

## Find an issue or have a request?
Report it as an issue or submit a PR.  I'm open to contributions.

<https://github.com/ike18t/ng-mocks>
