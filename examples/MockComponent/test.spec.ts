import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  NgModule,
  Output,
  TemplateRef,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'child',
  template: 'child',
})
class ChildComponent {
  @ContentChild('something', {} as any)
  public injectedSomething: TemplateRef<void> | undefined;

  @Input()
  public someInput = '';

  @Output()
  public someOutput = new EventEmitter();

  public childMockComponent() {}
}

@Component({
  selector: 'target-mock-component',
  template: `
    <child [someInput]="value" (someOutput)="trigger($event)"></child>
  `,
})
class TargetComponent {
  public value = '';
  public trigger = (obj: any) => obj;
}

@NgModule({
  imports: [CommonModule],
  declarations: [TargetComponent, ChildComponent],
})
class ItsModule {}

describe('MockComponent', () => {
  beforeEach(() => {
    return MockBuilder(TargetComponent, ItsModule);
  });

  it('sends the correct value to the child input', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // The same as
    // fixture.debugElement.query(
    //   By.css('child')
    // ).componentInstance
    // but properly typed.
    const mockComponent =
      ngMocks.find<ChildComponent>('child').componentInstance;

    // Let's pretend that DependencyComponent has 'someInput' as
    // an input. MyComponent sets its value via
    // `[someInput]="value"`. The input's value will be passed into
    // the mock component so we can assert on it.
    component.value = 'foo';
    fixture.detectChanges();

    // Thanks to ng-mocks, this is type safe.
    expect(mockComponent.someInput).toEqual('foo');
  });

  it('does something on an emit of the child component', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // The same as
    // fixture.debugElement.query(
    //   By.directive(DependencyComponent)
    // ).componentInstance
    // but properly typed.
    const mockComponent = ngMocks.findInstance(ChildComponent);

    // Again, let's pretend DependencyComponent has an output
    // called 'someOutput'. MyComponent listens on the output via
    // `(someOutput)="trigger($event)"`.
    // Let's install a spy and trigger the output.
    ngMocks.stubMember(
      component,
      'trigger',
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn(),
    );
    mockComponent.someOutput.emit({
      payload: 'foo',
    });

    // Assert on the effect.
    expect(component.trigger).toHaveBeenCalledWith({
      payload: 'foo',
    });
  });

  it('renders something inside of the child component', () => {
    const localFixture = MockRender<ChildComponent>(`
      <child>
        <p>inside content</p>
      </child>
    `);

    // We can access html directly asserting on some side effect.
    const mockNgContent = localFixture.point.nativeElement.innerHTML;
    expect(mockNgContent).toContain('<p>inside content</p>');
  });

  it('renders ContentChild of the child component', () => {
    const fixture = MockRender<ChildComponent>(`
      <child>
        <ng-template #something>
          <p>inside template</p>
        </ng-template>
        <p>inside content</p>
      </child>
    `);

    // Injected ng-content rendered everything except templates.
    const mockNgContent = fixture.point.nativeElement.innerHTML;
    expect(mockNgContent).toContain('<p>inside content</p>');
    expect(mockNgContent).not.toContain('<p>inside template</p>');

    // Let's render the template. First, we need to assert that
    // componentInstance is a MockedComponent<T> to access
    // its `__render` method. `isMockOf` function helps here.
    const mockComponent = fixture.point.componentInstance;
    ngMocks.render(
      mockComponent,
      ngMocks.findTemplateRef('something'),
    );

    // The rendered template is wrapped by <div data-key="something">.
    // We can use this selector to assert exactly its content.
    const mockNgTemplate =
      ngMocks.find(ChildComponent).nativeElement.innerHTML;
    expect(mockNgTemplate).toContain('<p>inside template</p>');
  });
});
