import {
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  QueryList,
  AfterContentInit,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  isMockOf,
  MockComponent,
  MockDirective,
  MockRender,
  ngMocks,
} from 'ng-mocks';

let originalCalls: string[] = [];

@Directive({
  selector: '[issue15006Group]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class GroupDirective {}

@Directive({
  selector: '[issue15006Base]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class BaseDirective implements AfterContentInit {
  @ContentChild('first', { read: ElementRef } as never)
  public item?: ElementRef;
  @ContentChildren('first', { descendants: false, read: ElementRef })
  public items?: QueryList<ElementRef>;
  @ContentChild('first', { read: ElementRef } as never)
  public inherited?: ElementRef;

  public ngAfterContentInit(): void {
    originalCalls.push('content init');
  }
}

@Component({
  selector: 'issue15006-child',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '<ng-content></ng-content>',
})
class ChildComponent extends BaseDirective {
  @ContentChild('second', { read: ElementRef } as never)
  public item?: ElementRef;
  @ContentChildren('second', { descendants: true, read: ElementRef })
  public items?: QueryList<ElementRef>;
}

@Directive({
  selector: '[issue15006Child]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class ChildDirective extends BaseDirective {
  @ContentChild('second', { read: ElementRef } as never)
  public item?: ElementRef;
  @ContentChildren('second', { descendants: true, read: ElementRef })
  public items?: QueryList<ElementRef>;
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15006
@Component({
  selector: 'issue15006-annotation',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '<ng-content></ng-content>',
  queries: {
    item: new ContentChild('second', { read: ElementRef } as never),
    items: new ContentChildren('second', {
      descendants: true,
      read: ElementRef,
    }),
  },
})
class AnnotationComponent extends BaseDirective {}

// Child queries must replace inherited metadata before the mock is decorated.
describe('issue-15006', () => {
  beforeEach(() => {
    originalCalls = [];
  });

  for (const mock of [false, true]) {
    it(`preserves annotation query precedence with mock:${mock}`, async () => {
      await TestBed.configureTestingModule({
        declarations: [
          GroupDirective,
          mock
            ? MockComponent(AnnotationComponent)
            : AnnotationComponent,
        ],
      }).compileComponents();
      MockRender(`<issue15006-annotation>
        <span #first class="first">first</span>
        <span #second class="second">second</span>
        <div issue15006Group><span #second class="nested">nested</span></div>
      </issue15006-annotation>`);
      const target = ngMocks.findInstance(AnnotationComponent);

      expect(isMockOf(target, AnnotationComponent)).toBe(mock);
      expect(target.item && target.item.nativeElement).toBe(
        ngMocks.find('.first').nativeElement,
      );
      expect(
        target.items && target.items.map(item => item.nativeElement),
      ).toEqual([ngMocks.find('.first').nativeElement]);
      expect(target.inherited && target.inherited.nativeElement).toBe(
        ngMocks.find('.first').nativeElement,
      );
      expect(originalCalls).toEqual(mock ? [] : ['content init']);
    });

    it(`uses the child's component queries with mock:${mock}`, async () => {
      await TestBed.configureTestingModule({
        declarations: [
          GroupDirective,
          mock ? MockComponent(ChildComponent) : ChildComponent,
        ],
      }).compileComponents();
      MockRender(`<issue15006-child>
        <span #first class="first">first</span>
        <span #second class="second">second</span>
        <div issue15006Group><span #second class="nested">nested</span></div>
      </issue15006-child>`);
      const target = ngMocks.findInstance(ChildComponent);

      expect(isMockOf(target, ChildComponent)).toBe(mock);
      expect(target.item && target.item.nativeElement).toBe(
        ngMocks.find('.second').nativeElement,
      );
      expect(
        target.items && target.items.map(item => item.nativeElement),
      ).toEqual([
        ngMocks.find('.second').nativeElement,
        ngMocks.find('.nested').nativeElement,
      ]);
      expect(target.inherited && target.inherited.nativeElement).toBe(
        ngMocks.find('.first').nativeElement,
      );
      expect(originalCalls).toEqual(mock ? [] : ['content init']);
    });

    it(`uses the child's directive queries with mock:${mock}`, async () => {
      await TestBed.configureTestingModule({
        declarations: [
          GroupDirective,
          mock ? MockDirective(ChildDirective) : ChildDirective,
        ],
      }).compileComponents();
      MockRender(`<div issue15006Child>
        <span #first class="first">first</span>
        <span #second class="second">second</span>
        <div issue15006Group><span #second class="nested">nested</span></div>
      </div>`);
      const target = ngMocks.findInstance(ChildDirective);

      expect(isMockOf(target, ChildDirective)).toBe(mock);
      expect(target.item && target.item.nativeElement).toBe(
        ngMocks.find('.second').nativeElement,
      );
      expect(
        target.items && target.items.map(item => item.nativeElement),
      ).toEqual([
        ngMocks.find('.second').nativeElement,
        ngMocks.find('.nested').nativeElement,
      ]);
      expect(target.inherited && target.inherited.nativeElement).toBe(
        ngMocks.find('.first').nativeElement,
      );
      expect(originalCalls).toEqual(mock ? [] : ['content init']);
    });
  }
});
