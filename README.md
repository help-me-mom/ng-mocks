[![Build Status](https://travis-ci.org/ike18t/mock_component.png?branch=master)](https://travis-ci.org/ike18t/mock_component)
[![npm version](https://badge.fury.io/js/mock-component.svg)](https://badge.fury.io/js/mock-component)

# mock_component
Helper function for creating angular component mocks for test.

## Usage
```typescript
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'mock-component';
import { DependencyComponent } from './dependency.component';
import { TestedComponent } from './tested.component';

describe('TestedComponent', () => {
  let fixture: ComponentFixture<TestedComponent>;

  beforeEach(async() => {
    TestBed.configureTestingModule({
      declarations: [
        MockComponent(DependencyComponent)
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestedComponent);
  });

  it('should send the correct value to the dependency component input', () => {
    // let's pretend Dependency Component (unmocked) has 'someInput' as an  input
    // the input value will be passed into the mocked component so you can assert on it
    const childComponent = fixture.debugElement.query(By.css('dependency-component-selector'));
    expect(childComponent.someInput).toEqual('foo');
  });

  it('should do something when the dependency component emits', () => {
    const childComponent = fixture.debugElement.query(By.css('dependency-component-selector'));
    // again, let's pretend Dependency Component (unmocked) has 'someOutput' as an output
    // emit using the output that MockComponent setup when generating the mock
    childComponent.someOutput.emit(new Foo());
    fixture.detectChanges();
    // assert on some behavior
  });
});
```
