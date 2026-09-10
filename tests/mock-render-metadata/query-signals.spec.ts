import {
  Component,
  contentChild,
  contentChildren,
  Directive,
  ElementRef,
  Input,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockRender,
  MockRenderFactory,
  ngMocks,
} from 'ng-mocks';

@Directive({
  selector: '[metadataQueryItem]',
  standalone: true,
})
class ItemDirective {
  @Input() public metadataQueryItem = '';
}

@Component({
  selector: 'target-metadata-queries[queries]',
  standalone: true,
  imports: [ItemDirective],
  template: `
    <ng-content></ng-content>
    @if (showViews()) {
      @if (showFirst()) {
        <span
          metadataQueryItem="view-first"
          class="view-first"
        ></span>
      }
      <div>
        <span
          metadataQueryItem="view-nested"
          class="view-nested"
        ></span>
      </div>
    }
  `,
})
class TargetComponent {
  public readonly showViews = signal(true);
  public readonly showFirst = signal(true);
  public readonly content = contentChild(ItemDirective);
  public readonly requiredContent =
    contentChild.required(ItemDirective);
  public readonly contentElement = contentChild(ItemDirective, {
    read: ElementRef,
  });
  public readonly directContent = contentChildren(ItemDirective);
  public readonly allContent = contentChildren(ItemDirective, {
    descendants: true,
  });
  public readonly contentElements = contentChildren(ItemDirective, {
    descendants: true,
    read: ElementRef,
  });
  public readonly view = viewChild(ItemDirective);
  public readonly requiredView = viewChild.required(ItemDirective);
  public readonly viewElement = viewChild(ItemDirective, {
    read: ElementRef,
  });
  public readonly views = viewChildren(ItemDirective);
  public readonly viewElements = viewChildren(ItemDirective, {
    read: ElementRef,
  });
}

describe('mock-render-metadata:query-signals', () => {
  // The root TypeScript-only runner does not transform signal queries.
  // Angular-compiled spread targets execute these cases from Angular 17.2.
  if (
    !(TargetComponent as any).ɵcmp.contentQueries ||
    !(TargetComponent as any).ɵcmp.viewQuery
  ) {
    it('needs compiled signal query metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() => MockBuilder([TargetComponent, ItemDirective]));

  it('retains viewChild and viewChildren metadata and updates read tokens after view changes', () => {
    const fixture = MockRender(TargetComponent, {});
    const target = fixture.point.componentInstance;
    const firstElement = ngMocks.find('.view-first');
    const nestedElement = ngMocks.find('.view-nested');
    const first = ngMocks.get(firstElement, ItemDirective);
    const nested = ngMocks.get(nestedElement, ItemDirective);
    const view = target.view;
    const views = target.views;

    expect(view()).toBe(first);
    expect(target.requiredView()).toBe(first);
    expect(target.viewElement()?.nativeElement).toBe(
      firstElement.nativeElement,
    );
    expect(views()).toEqual([first, nested]);
    expect(
      target.viewElements().map(element => element.nativeElement),
    ).toEqual([
      firstElement.nativeElement,
      nestedElement.nativeElement,
    ]);

    target.showFirst.set(false);
    fixture.detectChanges();

    expect(target.view).toBe(view);
    expect(target.views).toBe(views);
    expect(view()).toBe(nested);
    expect(target.requiredView()).toBe(nested);
    expect(target.viewElement()?.nativeElement).toBe(
      nestedElement.nativeElement,
    );
    expect(views()).toEqual([nested]);
    expect(
      target.viewElements().map(element => element.nativeElement),
    ).toEqual([nestedElement.nativeElement]);

    target.showFirst.set(true);
    fixture.detectChanges();
    const restoredElement = ngMocks.find('.view-first');
    const restored = ngMocks.get(restoredElement, ItemDirective);

    expect(restored).not.toBe(first);
    expect(view()).toBe(restored);
    expect(target.requiredView()).toBe(restored);
    expect(views()).toEqual([restored, nested]);
    expect(
      target.viewElements().map(element => element.nativeElement),
    ).toEqual([
      restoredElement.nativeElement,
      nestedElement.nativeElement,
    ]);

    target.showViews.set(false);
    fixture.detectChanges();

    expect(view()).toBeUndefined();
    expect(target.viewElement()).toBeUndefined();
    expect(views()).toEqual([]);
    expect(target.viewElements()).toEqual([]);
    let message: string | undefined;
    try {
      target.requiredView();
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('NG0951');
  });

  it('retains contentChild and contentChildren metadata through the cloned component', () => {
    // Configure a class-based render first so the complex-selector middleware
    // is exercised, then project children through its generated wrapper.
    const factory = MockRenderFactory(TargetComponent, ['show']);
    factory.configureTestBed();
    TestBed.overrideTemplate(
      factory.declaration as never,
      (factory.declaration as any).tpl.replace(
        '</',
        `@if (show) {
           <span metadataQueryItem="content-first" class="content-first"></span>
         }
         <div><span metadataQueryItem="content-nested" class="content-nested"></span></div></`,
      ),
    );
    const fixture = factory({ show: true });
    const target = fixture.point.componentInstance;
    const firstElement = ngMocks.find('.content-first');
    const nestedElement = ngMocks.find('.content-nested');
    const first = ngMocks.get(firstElement, ItemDirective);
    const nested = ngMocks.get(nestedElement, ItemDirective);
    const content = target.content;
    const allContent = target.allContent;

    expect(content()).toBe(first);
    expect(target.requiredContent()).toBe(first);
    expect(target.contentElement()?.nativeElement).toBe(
      firstElement.nativeElement,
    );
    expect(target.directContent()).toEqual([first]);
    expect(allContent()).toEqual([first, nested]);
    expect(
      target.contentElements().map(element => element.nativeElement),
    ).toEqual([
      firstElement.nativeElement,
      nestedElement.nativeElement,
    ]);

    // Projected queries must exclude the owner's private view directives.
    expect(
      target.views().map(item => item.metadataQueryItem),
    ).toEqual(['view-first', 'view-nested']);
    fixture.componentInstance.show = false;
    fixture.detectChanges();

    expect(target.content).toBe(content);
    expect(target.allContent).toBe(allContent);
    expect(content()).toBe(nested);
    expect(target.requiredContent()).toBe(nested);
    expect(target.contentElement()?.nativeElement).toBe(
      nestedElement.nativeElement,
    );
    expect(target.directContent()).toEqual([]);
    expect(allContent()).toEqual([nested]);
    expect(
      target.contentElements().map(element => element.nativeElement),
    ).toEqual([nestedElement.nativeElement]);

    fixture.componentInstance.show = true;
    fixture.detectChanges();
    const restoredElement = ngMocks.find('.content-first');
    const restored = ngMocks.get(restoredElement, ItemDirective);

    expect(restored).not.toBe(first);
    expect(content()).toBe(restored);
    expect(target.requiredContent()).toBe(restored);
    expect(target.directContent()).toEqual([restored]);
    expect(allContent()).toEqual([restored, nested]);
    expect(
      target.contentElements().map(element => element.nativeElement),
    ).toEqual([
      restoredElement.nativeElement,
      nestedElement.nativeElement,
    ]);
  });

  it('retains empty content query results and required-query errors without projection', () => {
    const fixture = MockRender(TargetComponent, {});
    const target = fixture.point.componentInstance;

    expect(target.content()).toBeUndefined();
    expect(target.contentElement()).toBeUndefined();
    expect(target.directContent()).toEqual([]);
    expect(target.allContent()).toEqual([]);
    expect(target.contentElements()).toEqual([]);
    let message: string | undefined;
    try {
      target.requiredContent();
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('NG0951');
  });
});
