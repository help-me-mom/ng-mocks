import {
  Component,
  Directive,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[dependency]',
})
class DependencyDirective {
  @Input('dependency')
  public someInput = '';

  @Output('dependency-output')
  public someOutput = new EventEmitter();
}

@Component({
  selector: 'tested',
  template: ` <span
    *dependency="value"
    (dependency-output)="trigger($event)"
    >content</span
  >`,
})
class TestedComponent {
  public value = '';
  public trigger = () => {};
}

describe('MockDirective:Structural', () => {
  // IMPORTANT: by default structural directives are not rendered.
  // Because they might require a context which should be provided.
  // Usually a developer knows the context and can render it
  // manually with proper setup.
  beforeEach(() => {
    return MockBuilder(TestedComponent).mock(DependencyDirective, {
      // render: true, // <-- a flag to render the directive by default
    });
  });

  it('renders content of the child structural directive', () => {
    const fixture = MockRender(TestedComponent);

    // Let's assert that nothing has been rendered inside of
    // the structural directive by default.
    expect(fixture.nativeElement.innerHTML).not.toContain(
      '>content<',
    );

    // And let's render it manually now.
    const mockDirective = ngMocks.findInstance(DependencyDirective);
    ngMocks.render(mockDirective, mockDirective);

    // The content of the structural directive should be rendered.
    expect(fixture.nativeElement.innerHTML).toContain('>content<');
  });
});
