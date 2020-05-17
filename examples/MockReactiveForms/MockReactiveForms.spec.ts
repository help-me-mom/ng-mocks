import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MockComponent, MockedComponent, MockHelper } from 'ng-mocks';

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
    const mockedReactiveFormComponent = MockHelper.findOrFail<MockedComponent<DependencyComponent>>(
      fixture.debugElement,
      'dependency-component-selector'
    ).componentInstance;

    mockedReactiveFormComponent.__simulateChange('foo');
    expect(component.formControl.value).toBe('foo');
  });
});
