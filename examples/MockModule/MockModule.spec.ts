import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockModule } from 'ng-mocks';
import { DependencyModule } from './dependency.module';
import { TestedComponent } from './tested.component';

describe('MockModule', () => {
  let fixture: ComponentFixture<TestedComponent>;
  let component: TestedComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestedComponent,
      ],
      imports: [
        MockModule(DependencyModule),
      ],
    });

    fixture = TestBed.createComponent(TestedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders nothing without any error', () => {
    expect(component).toBeTruthy();
  });
});
