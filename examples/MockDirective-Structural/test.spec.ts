import { Component, Directive, EventEmitter, Input, Output } from '@angular/core';
import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

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

describe('MockDirective', () => {
  // IMPORTANT: by default structural directives are not rendered.
  // Because they might require context which should be provided.
  // Usually a developer knows the context and can render it
  // manually with proper setup.
  beforeEach(() =>
    MockBuilder(TestedComponent).mock(DependencyDirective, {
      // render: true, // <-- a flag to render the directive by default
    })
  );

  it('renders content of the child structural directive', () => {
    const fixture = MockRender(TestedComponent);

    // Let's assert that nothing has been rendered inside of
    // the structural directive by default.
    expect(fixture.debugElement.nativeElement.innerHTML).not.toContain('>content<');

    // And let's render it manually now.
    const mockedDirective = ngMocks.findInstance(fixture.debugElement, DependencyDirective);
    if (isMockOf(mockedDirective, DependencyDirective, 'd')) {
      mockedDirective.__render();
      fixture.detectChanges();
    }

    // The content of the structural directive should be rendered.
    expect(fixture.debugElement.nativeElement.innerHTML).toContain('>content<');
  });
});
