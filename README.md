[![Build Status](https://travis-ci.org/ike18t/mock_component.png?branch=master)](https://travis-ci.org/ike18t/mock_component)
[![npm version](https://badge.fury.io/js/mock-component.svg)](https://badge.fury.io/js/mock-component)

# mock_component
Helper function for creating angular component mocks for test.

## Why use this?
Sure, you could flip a flag on schema errors to make your component dependencies not matter.  Or you could use this to mock
them out and have the ability to assert on their inputs or emit on an output to assert on a side effect.

* Mocked component with the same selector.
* Inputs and Outputs with alias support
* Each component instance has its own EventEmitter instances for outputs
* Mocked component templates are ng-content tags to allow transclusion
* Allows ng-model binding (You will have to add FormsModule to TestBed imports)
* exportAs support

## Usage Example
```typescript
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'mock-component';
import { DependencyComponent } from './dependency.component';
import { TestedComponent } from './tested.component';

describe('TestedComponent', () => {
  let fixture: ComponentFixture<TestedComponent>;
  const mockedDependencyComponent = MockComponent(DependencyComponent); // do this if you want to select By.directive

  beforeEach(async() => {
    TestBed.configureTestingModule({
      declarations: [
        mockedDependencyComponent, // to add your already mocked component if you went the by directive route
        // or
        MockComponent(DependencyComponent) // you can do this if you don't mind selecting by css selector
      ]
    })
    .compileComponents();
    .then(() => {
      fixture = TestBed.createComponent(ExampleComponentContainer);
      component = fixture.componentInstance;
    });
  }));

  it('should send the correct value to the dependency component input', () => {
    // let's pretend Dependency Component (unmocked) has 'someInput' as an  input
    // the input value will be passed into the mocked component so you can assert on it
    const mockedComponent = fixture.debugElement
                                  .query(By.css('dependency-component-selector'))
                                  .componentInstance as DependencyComponent; // casting to retain type safety
    expect(mockedComponent.someInput).toEqual('foo'); if you casted mockedComponent as the original component type then this is type safe
  });

  it('should do something when the dependency component emits on its output', () => {
    const mockedComponent = fixture.debugElement
                                   .query(By.directive(mockedDependencyComponent))
                                   .componentInstance as DependencyComponent; // casting to retain type safety
    // again, let's pretend DependencyComponent has an output called 'someOutput'
    // emit on the output that MockComponent setup when generating the mock of Dependency Component
    mockedComponent.someOutput.emit(new Foo()); if you casted mockedComponent as the original component type then this is type safe
    fixture.detectChanges();
    // assert on some side effect
  });
});
```

## Find an issue or have a request?
Report it as an issue or submit at PR.  I'm open to contributions.

## You may also like:

[https://www.npmjs.com/package/mock-directive](https://www.npmjs.com/package/mock-directive)

[https://www.npmjs.com/package/mock-pipe](https://www.npmjs.com/package/mock-pipe)
