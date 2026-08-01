import {
  ChangeDetectionStrategy,
  Component,
  Input,
  VERSION,
} from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

@Component({
  selector: 'target-implicit-14157',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ items.length }}',
})
class ImplicitStrategyComponent {
  @Input() public items: string[] = [];
}

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'target-default-14157',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ items.length }}',
})
class ExplicitDefaultComponent {
  @Input() public items: string[] = [];
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14157
// Before Angular 22, an omitted strategy is Default. Angular 22 uses OnPush.
// MockRender should preserve the compiled strategy instead of forcing the
// rendered point.
describe('issue-14157', () => {
  describe('implicit strategy', () => {
    beforeEach(() => MockBuilder(ImplicitStrategyComponent));

    it('uses the framework default for an unchanged input reference', () => {
      const parameters: { items: string[] } = { items: [] };
      const fixture = MockRender(
        ImplicitStrategyComponent,
        parameters,
      );

      fixture.componentInstance.items.push('demo');
      fixture.detectChanges();

      if (Number.parseInt(VERSION.major, 10) >= 22) {
        expect(fixture.point.nativeElement.textContent).toEqual('0');
      } else {
        expect(fixture.point.nativeElement.textContent).toEqual('1');
      }
    });

    it('updates for a new input reference', () => {
      const parameters: { items: string[] } = { items: [] };
      const fixture = MockRender(
        ImplicitStrategyComponent,
        parameters,
      );

      fixture.componentInstance.items = ['demo'];
      fixture.detectChanges();

      expect(fixture.point.nativeElement.textContent).toEqual('1');
    });
  });

  describe('explicit Default', () => {
    beforeEach(() => MockBuilder(ExplicitDefaultComponent));

    it('updates for an unchanged input reference', () => {
      const parameters: { items: string[] } = { items: [] };
      const fixture = MockRender(
        ExplicitDefaultComponent,
        parameters,
      );

      fixture.componentInstance.items.push('demo');
      fixture.detectChanges();

      expect(fixture.point.nativeElement.textContent).toEqual('1');
    });
  });
});
