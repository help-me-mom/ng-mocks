import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { MockBuilder, MockedComponent, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'dependency-component-selector',
  template: `dependency`,
})
class DependencyComponent {
  @ContentChild('something', { static: false } as any)
  injectedSomething: TemplateRef<{}>;

  @Input()
  someInput = '';

  @Output()
  someOutput = new EventEmitter();
}

@Component({
  selector: 'tested',
  template: `
    <dependency-component-selector [someInput]="value" (someOutput)="trigger($event)"></dependency-component-selector>
  `,
})
class TestedComponent {
  value = '';
  trigger = (obj: any) => {};
}

describe('v10:MockComponent', () => {
  beforeEach(() => MockBuilder(TestedComponent).mock(DependencyComponent));

  it('should send the correct value to the dependency component input', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // the same as fixture.debugElement.query(By.css('dependency-component-selector')).componentInstance
    // but properly typed.
    const mockedComponent: DependencyComponent = ngMocks.find(fixture.debugElement, 'dependency-component-selector')
      .componentInstance;

    // let's pretend Dependency Component (unmocked) has 'someInput' as an input
    // the input value will be passed into the mocked component so you can assert on it
    component.value = 'foo';
    fixture.detectChanges();

    // if you casted mockedComponent as the original component type then this is type safe
    expect(mockedComponent.someInput).toEqual('foo');
  });

  it('should do something when the dependency component emits on its output', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    spyOn(component, 'trigger');
    const mockedComponent = ngMocks.find(fixture.debugElement, DependencyComponent).componentInstance;

    // again, let's pretend DependencyComponent has an output called 'someOutput'
    // emit on the output that MockComponent setup when generating the mock of Dependency Component
    // if you casted mockedComponent as the original component type then this is type safe
    mockedComponent.someOutput.emit({
      payload: 'foo',
    });

    // assert on some side effect
    expect(component.trigger).toHaveBeenCalledWith({
      payload: 'foo',
    });
  });

  it('should render something inside of the dependency component', () => {
    const localFixture = MockRender<DependencyComponent>(`
      <dependency-component-selector>
        <p>inside content</p>
      </dependency-component-selector>
    `);

    // because component does not have any @ContentChild we can access html directly.
    // assert on some side effect
    const mockedNgContent = localFixture.point.nativeElement.innerHTML;
    expect(mockedNgContent).toContain('<p>inside content</p>');
  });

  it('should render something inside of the dependency component', () => {
    const localFixture = MockRender<MockedComponent<DependencyComponent>>(`
      <dependency-component-selector>
        <ng-template #something><p>inside template</p></ng-template>
        <p>inside content</p>
      </dependency-component-selector>
    `);

    // injected ng-content stays as it was.
    const mockedNgContent = localFixture.point.nativeElement.innerHTML;
    expect(mockedNgContent).toContain('<p>inside content</p>');

    // because component does have @ContentChild we need to render them first with proper context.
    const mockedComponent = localFixture.point.componentInstance;
    mockedComponent.__render('something');
    localFixture.detectChanges();

    const mockedNgTemplate = ngMocks.find(localFixture.debugElement, '[data-key="something"]').nativeElement.innerHTML;
    expect(mockedNgTemplate).toContain('<p>inside template</p>');
  });
});
