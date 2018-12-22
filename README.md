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
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng-mocks';
import { DependencyComponent } from './dependency.component';
import { TestedComponent } from './tested.component';

describe('TestedComponent', () => {
  let fixture: ComponentFixture<TestedComponent>;

  beforeEach(async() => {
    TestBed.configureTestingModule({
      declarations: [
        TestedComponent,
        MockComponent(DependencyComponent)
      ]
    })
    .compileComponents();
    .then(() => {
      fixture = TestBed.createComponent(TestedComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('should send the correct value to the dependency component input', () => {
    // let's pretend Dependency Component (unmocked) has 'someInput' as an  input
    // the input value will be passed into the mocked component so you can assert on it
    const mockedComponent = fixture.debugElement
                                   .query(By.css('dependency-component-selector'))
                                   .componentInstance as DependencyComponent; // casting to retain type safety
    expect(mockedComponent.someInput).toEqual('foo'); // if you casted mockedComponent as the original component type then this is type safe
  });

  it('should do something when the dependency component emits on its output', () => {
    const mockedComponent = fixture.debugElement
                                   .query(By.directive(DependencyComponent))
                                   .componentInstance as DependencyComponent; // casting to retain type safety
    // again, let's pretend DependencyComponent has an output called 'someOutput'
    // emit on the output that MockComponent setup when generating the mock of Dependency Component
    mockedComponent.someOutput.emit(new Foo()); // if you casted mockedComponent as the original component type then this is type safe
    fixture.detectChanges();
    // assert on some side effect
  });

  // <mocked-dependency-component><p>inside content</p></mocked-dependency-component>
  it('should render something inside of the dependency component', () => {
    // because component does not have any @ContentChild we can access html directly.
    const mockedNgContent = fixture.debugElement
                                   .query(By.directive(DependencyComponent))
                                   .innerHTML;
    expect(mockedNgContent).toContain('<p>inside content</p>');
    fixture.detectChanges();
    // assert on some side effect
  });

  // <mocked-dependency-component>
  //   <ng-template #something><p>inside something</p></ng-template>
  //   <p>inside content</p>
  // </mocked-dependency-component>
  it('should render something inside of the dependency component', () => {
    // because component does have @ContentChild we need to use wrappers.
    const mockedNgContent = fixture.debugElement
                                   .query(By.directive(DependencyComponent))
                                   .query(By.css('[data-key="ng-content"]'))
                                   .innerHTML;
    expect(mockedNgContent).toContain('<p>inside content</p>');
    
    const mockedNgTemplate = fixture.debugElement
                                   .query(By.directive(DependencyComponent))
                                   .query(By.css('[data-key="something"]'))
                                   .innerHTML;
    expect(mockedNgTemplate).toContain('<p>inside something</p>');
    
    fixture.detectChanges();
    // assert on some side effect
  });
});
```

## MockDirective(s)

* Mocked directive with the same selector
* Inputs and Outputs with alias support
* Each directive instance has its own EventEmitter instances for outputs
* exportAs support

### Usage Example
```typescript
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng-mocks';
import { DependencyDirective } from './dependency.directive';
import { TestedComponent } from './tested.component';

describe('TestedComponent', () => {
  let fixture: ComponentFixture<TestedComponent>;

  beforeEach(async() => {
    TestBed.configureTestingModule({
      declarations: [
        TestedComponent,
        MockDirective(DependencyDirective)
      ]
    })
    .compileComponents();
    .then(() => {
      fixture = TestBed.createComponent(TestedComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('should send the correct value to the dependency component input', () => {
    // let's pretend Dependency Directive (unmocked) has 'someInput' as an input
    // the input value will be passed into the mocked directive so you can assert on it
    const debugElement = fixture.debugElement.query(By.directive(DependencyDirective));
    const mockedDirectiveInstance = debugElement.injector
                                                .get(DependencyDirective) as DependencyDirective; // casting to retain type safety
    expect(mockedDirectiveInstance.someInput).toEqual('foo');
  });

  it('should do something when the dependency directive emits on its output', () => {
    const debugElement = fixture.debugElement.query(By.directive(DependencyDirective));
    const mockedDirectiveInstance = debugElement.injector
                                                .get(DependencyDirective) as DependencyDirective; // casting to retain type safety
    // again, let's pretend DependencyDirective has an output called 'someOutput'
    // emit on the output that MockDirective setup when generating the mock of Dependency Directive
    mockedDirectiveInstance.someOutput.emit(new Foo()); // if you casted mockedDirective as the original component type then this is type safe
    fixture.detectChanges();
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
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng-mocks';
import { DependencyPipe } from './dependency.pipe';
import { TestedComponent } from './tested.component';

describe('TestedComponent', () => {
  let fixture: ComponentFixture<TestedComponent>;

  beforeEach(async() => {
    TestBed.configureTestingModule({
      declarations: [
        TestedComponent,
        MockPipe(DependencyPipe, (...args) => JSON.stringify(args)), // alternatively you can use MockPipes to mock multiple but you lose the ability to override
      ]
    })
    .compileComponents();
    .then(() => {
      fixture = TestBed.createComponent(TestedComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  describe('with transform override', () => {
    it('should return the result of the provided transform function', () => {
      expect(fixture.debugElement.query(By.css('#elementUsingPipe')).nativeElement.innerHTML).toEqual('foo');
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
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponent, MockedComponent } from 'ng-mocks';
import { ReactiveFormComponent } from './dependency.component';
import { TestedComponent } from './tested.component';

describe('TestedComponent', () => {
  let fixture: ComponentFixture<TestedComponent>;

  beforeEach(async() => {
    TestBed.configureTestingModule({
      declarations: [
        TestedComponent,
        MockComponent(DependencyComponent)
      ]
    })
    .compileComponents();
    .then(() => {
      fixture = TestBed.createComponent(TestedComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('should send the correct value to the dependency component input', () => {
    const mockedReactiveFormComponent = fixture.debugElement
                                               .query(By.css('dependency-component-selector'))
                                               .componentInstance as MockedComponent<ReactiveFormComponent>; // casting to retain type safety
                                   
    mockedReactiveFormComponent.__simulateChange('foo');                               
    expect(component.formControl.value).toBe('foo')
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
describe('MockModule', () => {
  let fixture: ComponentFixture<ComponentSubject>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ComponentSubject
      ],
      imports: [
        MockModule(DependencyModule)
      ],
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(ComponentSubject);
      fixture.detectChanges();
    });
  }));
});
```

## MockRender
Providers simple way to render anything, change `@Inputs` and `@Outputs` of testing component, directives etc.

### Usage Example
```typescript
describe('MockRender', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MockModule(AppModule),
      ],
      declarations: [
        Real1Component,
        Real2Component,
      ]
    });
  });

  it('renders ', () => {
    const fixture = MockRender(
      `
        <real-1 (click)="myListener1($event)" [some]="myParam1" other="check">
          something as ng-content
        </real-1>
        <real-2 (click)="myParam2 = $event" [some]="myParam2">
          <ng-template #header>
            something as ng-template
          </ng-template>
        </real-2>
      `,
      {
        myParam1: 'something1',
        myParam2: 'something2',
        myListener1: createSpy('myListener1'),
      }
    );

    // assert on some side effect
    // fixture.componentInstance.myParam1;
    // fixture.componentInstance.myParam2;
    // fixture.componentInstance.myListener1;
  });
});
```

## Find an issue or have a request?
Report it as an issue or submit a PR.  I'm open to contributions.

<https://github.com/ike18t/ng-mocks>
