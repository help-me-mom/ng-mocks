import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

@Component({
  selector: 'target-default-14157',
  standalone: false,
  template: '{{ items.length }}',
})
class DefaultOnPushComponent {
  @Input() public items: string[] = [];
}

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'target-eager-14157',
  standalone: false,
  template: '{{ items.length }}',
})
class EagerComponent {
  @Input() public items: string[] = [];
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14157
// Angular 22 uses OnPush when changeDetection is omitted. MockRender should
// preserve that compiled strategy instead of forcing the rendered point.
describe('issue-14157', () => {
  describe('default OnPush', () => {
    beforeEach(() => MockBuilder(DefaultOnPushComponent));

    it('does not update for an unchanged input reference', () => {
      const parameters: { items: string[] } = { items: [] };
      const fixture = MockRender(DefaultOnPushComponent, parameters);

      fixture.componentInstance.items.push('demo');
      fixture.detectChanges();

      expect(fixture.point.nativeElement.textContent).toEqual('0');
    });

    it('updates for a new input reference', () => {
      const parameters: { items: string[] } = { items: [] };
      const fixture = MockRender(DefaultOnPushComponent, parameters);

      fixture.componentInstance.items = ['demo'];
      fixture.detectChanges();

      expect(fixture.point.nativeElement.textContent).toEqual('1');
    });
  });

  describe('explicit Eager', () => {
    beforeEach(() => MockBuilder(EagerComponent));

    it('updates for an unchanged input reference', () => {
      const parameters: { items: string[] } = { items: [] };
      const fixture = MockRender(EagerComponent, parameters);

      fixture.componentInstance.items.push('demo');
      fixture.detectChanges();

      expect(fixture.point.nativeElement.textContent).toEqual('1');
    });
  });
});
