import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockRender, ngMocks } from 'ng-mocks';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-error-count-display',
  template: '{{ count }} / {{ max }} errors',
})
class ErrorCountDisplayComponent {
  @Input() public count: number | null = 0;
  @Input() public max: number | null = null;
}

// @see https://github.com/ike18t/ng-mocks/issues/522
describe('issue-522', () => {
  let component: ErrorCountDisplayComponent;
  let fixture: ComponentFixture<ErrorCountDisplayComponent>;

  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [ErrorCountDisplayComponent],
    }).compileComponents(),
  );

  // with out params the template has inputs and therefore change detection works
  describe('without params', () => {
    beforeEach(() => {
      fixture = MockRender(ErrorCountDisplayComponent);
      component = fixture.componentInstance;
    });

    it('should have a span with count and max', () => {
      component.count = 1;
      component.max = 2;
      fixture.detectChanges();

      expect(ngMocks.formatText(fixture)).toEqual('1 / 2 errors');
    });
  });

  // with params the template doesn't have inputs and therefore change detection does not work
  describe('with params', () => {
    beforeEach(() => {
      fixture = MockRender(ErrorCountDisplayComponent, {}) as any;
      component = fixture.componentInstance;
    });

    it('does not render new values', () => {
      component.count = 1;
      component.max = 2;
      fixture.detectChanges();

      expect(ngMocks.formatText(fixture)).toEqual('0 / errors');
    });
  });
});
