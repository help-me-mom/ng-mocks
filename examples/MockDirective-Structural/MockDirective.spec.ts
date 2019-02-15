import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockDirective, MockedDirective, MockHelper } from 'ng-mocks';
import { DependencyDirective } from './dependency.directive';
import { TestedComponent } from './tested.component';

describe('MockDirective', () => {
  let fixture: ComponentFixture<TestedComponent>;
  let component: TestedComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestedComponent,
        MockDirective(DependencyDirective),
      ]
    });

    fixture = TestBed.createComponent(TestedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should send the correct value to the dependency component input', () => {
    component.value = 'foo';
    fixture.detectChanges();

    // IMPORTANT: by default structural directives aren't rendered.
    // Because we can't automatically detect when and with which context they should be rendered.
    // Usually developer knows context and can render it manually with proper setup.
    const mockedDirectiveInstance = MockHelper.findDirective(
      fixture.debugElement, DependencyDirective
    ) as MockedDirective<DependencyDirective>;
    fixture.detectChanges();

    // let's pretend Dependency Directive (unmocked) has 'someInput' as an input
    // the input value will be passed into the mocked directive so you can assert on it
    expect(mockedDirectiveInstance).toBeTruthy();
    if (mockedDirectiveInstance) {
      expect(mockedDirectiveInstance.someInput).toEqual('foo');
    }
    // assert on some side effect
  });
});
