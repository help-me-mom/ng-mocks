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
    }); // if you cast mockedDirective as the original component type then this is type safe
    // assert on some side effect
    expect(fixture).toBeDefined();
  });
});
