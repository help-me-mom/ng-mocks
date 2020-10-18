import { Component, Directive, EventEmitter, Input, Output } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[dependency]',
})
class DependencyDirective {
  @Input('dependency-input')
  someInput = '';

  @Output('dependency-output')
  someOutput = new EventEmitter();
}

@Component({
  selector: 'tested',
  template: ` <span dependency [dependency-input]="value" (dependency-output)="trigger($event)"></span> `,
})
class TestedComponent {
  value = '';
  trigger = () => {};
}

describe('v10:MockDirective', () => {
  beforeEach(() => MockBuilder(TestedComponent).mock(DependencyDirective));

  it('should send the correct value to the dependency component input', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    component.value = 'foo';
    fixture.detectChanges();

    // let's pretend Dependency Directive (unmocked) has 'someInput' as an input
    // the input value will be passed into the mocked directive so you can assert on it
    const mockedDirectiveInstance = ngMocks.get(ngMocks.find(fixture.debugElement, 'span'), DependencyDirective);

    expect(mockedDirectiveInstance.someInput).toEqual('foo');
    // assert on some side effect
  });

  it('should do something when the dependency directive emits on its output', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

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
