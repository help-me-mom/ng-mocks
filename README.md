[![Build Status](https://travis-ci.org/ike18t/mock_component.png?branch=master)](https://travis-ci.org/ike18t/mock_component)
[![npm version](https://badge.fury.io/js/mock-component.svg)](https://badge.fury.io/js/mock-component)

# mock_component
Helper function for creating angular component mocks for test.

It does this by using reflect-metadata to get the component argument's selector, inputs, and outputs.  Afterwards it delegates the work to [Ng2MockComponent](https://github.com/cnunciato/ng2-mock-component) to create the mock component with event emitters for the outputs.

## Usage
```typescript
import { async, TestBed } from '@angular/core/testing';
import { MockComponent } from 'mock-component';
import { DependencyComponent } from './dependency.component';
import { TestedComponent } from './tested.component';

describe('TestedComponent', () => {
  beforeEach(async() => {
    TestBed.configureTestingModule({
      declarations: [
        MockComponent(DependencyComponent)
      ]
    }).compileComponents();
  }));
});
```

###### Another Example
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
    
  it('should test something', (fakeAsync(() => {
    const childComponent = fixture.debugElement.query(By.css('dependency-component-selector'));
    // let's pretend Dependency Component has someOutput as an output so I don't have to do more setup 😉
    let retVal = undefined;
    childComponent.someOutput.subscribe((someValue) => {
      retVal = someValue;
    });
    fixture.debugElement.find(By.css('button')).nativeElement.click();
    fixture.detectChanges();
    tick();
    expect(retVal).toEqual('foo');
    // imagining childComponent has an input you want to assert on as well
    expect(childComponent.someInput).toEqual('bar');
  }));
});
```