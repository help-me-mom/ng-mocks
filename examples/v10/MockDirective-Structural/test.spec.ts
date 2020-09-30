import { Component, Directive, EventEmitter, Input, Output } from '@angular/core';
import { MockBuilder, MockedDirective, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[dependency]',
})
class DependencyDirective {
  @Input('dependency')
  someInput = '';

  @Output('dependency-output')
  someOutput = new EventEmitter();
}

@Component({
  selector: 'tested',
  template: ` <span *dependency="value" (dependency-output)="trigger($event)">content</span> `,
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
