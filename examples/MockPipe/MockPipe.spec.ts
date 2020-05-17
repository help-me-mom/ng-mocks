import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockHelper, MockPipe } from 'ng-mocks';

import { DependencyPipe } from './dependency.pipe';
import { TestedComponent } from './tested.component';

describe('MockPipe', () => {
  let fixture: ComponentFixture<TestedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestedComponent,

        // alternatively you can use MockPipes to mock multiple but you lose the ability to override
        MockPipe(DependencyPipe, (...args: string[]) => JSON.stringify(args)),
      ],
    });

    fixture = TestBed.createComponent(TestedComponent);
    fixture.detectChanges();
  });

  describe('with transform override', () => {
    it('should return the result of the provided transform function', () => {
      const pipeElement = MockHelper.findOrFail(fixture.debugElement, 'span');
      expect(pipeElement.nativeElement.innerHTML).toEqual('["foo"]');
    });
  });
});
