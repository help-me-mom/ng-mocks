import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent, MockedComponent, MockRender, ngMocks } from 'ng-mocks';

import { DependencyComponent } from './dependency.component';
import { TestedComponent } from './tested.component';

describe('MockComponent', () => {
  let fixture: ComponentFixture<TestedComponent>;
  let component: TestedComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestedComponent, MockComponent(DependencyComponent)],
    });

    fixture = TestBed.createComponent(TestedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should send the correct value to the dependency component input', () => {
    // the same as fixture.debugElement.query(By.css('dependency-component-selector')).componentInstance
    // but properly typed.
    const mockedComponent = ngMocks.find<DependencyComponent>(fixture.debugElement, 'dependency-component-selector')
      .componentInstance;

    // let's pretend Dependency Component (unmocked) has 'someInput' as an input
    // the input value will be passed into the mocked component so you can assert on it
    component.value = 'foo';
    fixture.detectChanges();

    // if you cast mockedComponent as the original component type then this is type safe
    expect(mockedComponent.someInput).toEqual('foo');
  });

  it('should do something when the dependency component emits on its output', () => {
    spyOn(component, 'trigger');
    const mockedComponent = ngMocks.find(fixture.debugElement, DependencyComponent).componentInstance;

    // again, let's pretend DependencyComponent has an output called 'someOutput'
    // emit on the output that MockComponent setup when generating the mock of Dependency Component
    // if you cast mockedComponent as the original component type then this is type safe
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
