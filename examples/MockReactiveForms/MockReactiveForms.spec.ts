import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MockComponent, MockedComponent } from 'ng-mocks';
import { DependencyComponent } from './dependency.component';
import { TestedComponent } from './tested.component';

describe('MockReactiveForms', () => {
  let fixture: ComponentFixture<TestedComponent>;
  let component: TestedComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestedComponent, MockComponent(DependencyComponent)],
      imports: [ReactiveFormsModule],
    });

    fixture = TestBed.createComponent(TestedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should send the correct value to the dependency component input', () => {
    const mockedReactiveFormComponent = fixture.debugElement.query(By.css('dependency-component-selector'))
      .componentInstance as MockedComponent<DependencyComponent>; // casting to retain type safety

    mockedReactiveFormComponent.__simulateChange('foo');
    expect(component.formControl.value).toBe('foo');
  });
});
