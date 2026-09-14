import { Component, Directive, Input } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  isMockOf,
  MockComponent,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Directive({ standalone: false })
class BaseDirective {
  @Input({ alias: 'publicValue', transform: Number }) public value:
    number | string = 0;
  @Input({ transform: Number }) public inherited = 0;
}

@Component({
  selector: 'issue15006-transform',
  standalone: false,
  template: '',
})
class ChildComponent extends BaseDirective {
  @Input({ alias: 'publicValue', transform: String }) public value:
    number | string = '';
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15006
// Decorator input transforms are available from Angular 16.1.
describe('issue-15006:input-transforms', () => {
  for (const mock of [false, true]) {
    it(`replaces an inherited input transform with mock:${mock}`, async () => {
      await TestBed.configureTestingModule({
        declarations: [
          mock ? MockComponent(ChildComponent) : ChildComponent,
        ],
      }).compileComponents();
      const fixture = MockRender(
        '<issue15006-transform [publicValue]="value" [inherited]="inherited"></issue15006-transform>',
        { value: 3, inherited: '4' },
      );
      const target = ngMocks.findInstance(ChildComponent);

      expect(isMockOf(target, ChildComponent)).toBe(mock);
      expect(target.value).toBe('3');
      expect(target.inherited).toBe(4);

      fixture.componentInstance.value = 7;
      fixture.componentInstance.inherited = '8';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(target.value).toBe('7');
      expect(target.inherited).toBe(8);
    });
  }
});
