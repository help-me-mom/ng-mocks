import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import { staticFalse } from '../../tests';

@Component({
  selector: 'app-child',
  template: `child`,
})
export class DependencyComponent {
  @ContentChild('something', { ...staticFalse })
  injectedSomething: TemplateRef<{}>;

  @Input()
  someInput = '';

  @Output()
  someOutput = new EventEmitter();
}

@Component({
  selector: 'tested',
  template: ` <app-child [someInput]="value" (someOutput)="trigger($event)"></app-child> `,
})
export class TestedComponent {
  value = '';
  trigger = (obj: any) => {};
}

describe('MockComponent', () => {
  beforeEach(() => MockBuilder(TestedComponent).mock(DependencyComponent));

  it('sends the correct value to the child input', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // The same as
    // fixture.debugElement.query(
    //   By.css('app-child')
    // ).componentInstance
    // but properly typed.
    const mockedComponent = ngMocks.find<DependencyComponent>(fixture, 'app-child').componentInstance;

    // Let's pretend that DependencyComponent has 'someInput' as
    // an input. TestedComponent sets its value via
    // `[someInput]="value"`. The input's value will be passed into
    // the mocked component so you can assert on it.
    component.value = 'foo';
    fixture.detectChanges();

    // If you cast mockedComponent as the original component type
    // then this is type safe.
    expect(mockedComponent.someInput).toEqual('foo');
  });

  it('does something on an emit of the child component', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // The same as
    // fixture.debugElement.query(
    //   By.directive(DependencyComponent)
    // ).componentInstance
    // but properly typed.
    const mockedComponent = ngMocks.find(fixture, DependencyComponent).componentInstance;

    // Again, let's pretend DependencyComponent has an output
    // called 'someOutput'. TestedComponent listens on the output via
    // `(someOutput)="trigger($event)"`.
    // Let's install a spy and trigger the output.
    spyOn(component, 'trigger');
    mockedComponent.someOutput.emit({
      payload: 'foo',
    });

    // Assert on some side effect.
    expect(component.trigger).toHaveBeenCalledWith({
      payload: 'foo',
    });
  });

  it('renders something inside of the child component', () => {
    const localFixture = MockRender<DependencyComponent>(`
      <app-child>
        <p>inside content</p>
      </app-child>
    `);

    // We can access html directly asserting on some side effect.
    const mockedNgContent = localFixture.point.nativeElement.innerHTML;
    expect(mockedNgContent).toContain('<p>inside content</p>');
  });

  it('renders ContentChild of the child component', () => {
    const localFixture = MockRender<DependencyComponent>(`
      <app-child>
        <ng-template #something>
          <p>inside template</p>
        </ng-template>
        <p>inside content</p>
      </app-child>
    `);

    // Injected ng-content rendered everything except templates.
    const mockedNgContent = localFixture.point.nativeElement.innerHTML;
    expect(mockedNgContent).toContain('<p>inside content</p>');
    expect(mockedNgContent).not.toContain('<p>inside template</p>');

    // Let's render the template. First, we need to assert that
    // componentInstance is a MockedComponent<T> to access
    // its `__render` method. `isMockOf` function helps here.
    const mockedComponent = localFixture.point.componentInstance;
    if (isMockOf(mockedComponent, DependencyComponent, 'c')) {
      mockedComponent.__render('something');
      localFixture.detectChanges();
    }

    // The rendered template is wrapped by <div data-key="something">.
    // We can use this selector to assert exactly its content.
    const mockedNgTemplate = ngMocks.find(localFixture, '[data-key="something"]').nativeElement.innerHTML;
    expect(mockedNgTemplate).toContain('<p>inside template</p>');
  });
});
