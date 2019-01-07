import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockModule, MockRender } from 'ng-mocks';
import { DependencyModule } from './dependency.module';
import { TestedComponent } from './tested.component';

describe('MockRender', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestedComponent,
      ],
      imports: [
        MockModule(DependencyModule),
      ],
    });
  });

  it('renders ', () => {
    const spy = jasmine.createSpy();
    const fixture = MockRender(
      `
        <tested (trigger)="myListener1($event)" [value1]="myParam1" value2="check">
          <ng-template #header>
            something as ng-template
          </ng-template>
          something as ng-content
        </tested>
      `,
      {
        myListener1: spy,
        myParam1: 'something1',
      }
    );

    // assert on some side effect
    const componentInstance = fixture.debugElement.query(By.directive(TestedComponent))
      .componentInstance as TestedComponent;
    componentInstance.trigger.emit('foo');
    expect(componentInstance.value1).toEqual('something1');
    expect(componentInstance.value2).toEqual('check');
    expect(spy).toHaveBeenCalledWith('foo');
  });
});
