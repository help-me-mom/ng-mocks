import { Component, Directive, EventEmitter, Input, Output } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[dependency]',
})
class DependencyDirective {
  @Input('dependency-input')
  public someInput = '';

  @Output('dependency-output')
  public someOutput = new EventEmitter();
}

@Component({
  selector: 'tested',
  template: ` <span dependency [dependency-input]="value" (dependency-output)="trigger($event)"></span> `,
})
class TestedComponent {
  public value = '';
  public trigger = () => {};
}

describe('MockDirective:Attribute', () => {
  beforeEach(() => MockBuilder(TestedComponent).mock(DependencyDirective));

  it('sends the correct value to the input', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // The same as
    // fixture.debugElement.query(
    //   By.css('span')
    // ).injector.get(DependencyDirective)
    // but easier and more precise.
    const mockDirective = ngMocks.get(ngMocks.find(fixture.debugElement, 'span'), DependencyDirective);

    // Let's pretend DependencyDirective has 'someInput'
    // as an input. TestedComponent sets its value via
    // `[someInput]="value"`. The input's value will be passed into
    // the mock directive so you can assert on it.
    component.value = 'foo';
    fixture.detectChanges();

    // Thanks to ng-mocks, this is type safe.
    expect(mockDirective.someInput).toEqual('foo');
  });

  it('does something on an emit of the child directive', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // The same as
    // fixture.debugElement.query(
    //   By.css('span')
    // ).injector.get(DependencyDirective)
    // but easier and more precise.
    const mockDirective = ngMocks.get(ngMocks.find(fixture.debugElement, 'span'), DependencyDirective);

    // Again, let's pretend DependencyDirective has an output called
    // 'someOutput'. TestedComponent listens on the output via
    // `(someOutput)="trigger($event)"`.
    // Let's install a spy and trigger the output.
    spyOn(component, 'trigger');
    mockDirective.someOutput.emit();

    // Assert on the effect.
    expect(component.trigger).toHaveBeenCalled();
  });
});
