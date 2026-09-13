import { Directive, Input } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  isMockOf,
  MockDirective,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Directive({ standalone: false })
class BaseDirective {
  @Input({ alias: 'publicValue', transform: Number }) public value:
    number | string = 0;
  @Input({ transform: Number }) public inherited = 0;
}

@Directive({
  selector: '[issue15006Untransformed]',
  standalone: false,
})
class ChildDirective extends BaseDirective {
  @Input('publicValue') public value: number | string = '';
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15006
// Angular 17.1 inherits a transform only when the child has not redeclared its input.
describe('issue-15006:input-transform-removal', () => {
  for (const mock of [false, true]) {
    it(`removes an inherited input transform with mock:${mock}`, async () => {
      await TestBed.configureTestingModule({
        declarations: [
          mock ? MockDirective(ChildDirective) : ChildDirective,
        ],
      }).compileComponents();
      const fixture = MockRender(
        '<span issue15006Untransformed [publicValue]="value" [inherited]="inherited"></span>',
        { value: '3', inherited: '4' },
      );
      const target = ngMocks.findInstance(ChildDirective);

      expect(isMockOf(target, ChildDirective)).toBe(mock);
      expect(target.value).toBe('3');
      expect(target.inherited).toBe(4);

      fixture.componentInstance.value = '7';
      fixture.componentInstance.inherited = '8';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(target.value).toBe('7');
      expect(target.inherited).toBe(8);
    });
  }
});
