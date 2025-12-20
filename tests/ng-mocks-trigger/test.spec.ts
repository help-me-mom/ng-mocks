import {
  Component,
  ElementRef,
  NgModule,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import * as rxjs from 'rxjs';
import { tap } from 'rxjs/operators';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// TODO remove with A5
let fromEvent: any;
try {
  fromEvent = (rxjs as any).fromEvent;
} catch {
  // nothing to do
}

@Component({
  selector: 'target-ng-mocks-trigger',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    false,
  template: `
    <input
      [formControl]="control"
      (focus)="focusTag = $event"
      #element
    />
  `,
})
class TargetComponent implements OnDestroy {
  public readonly control = new FormControl();
  public focusFromEvent: any;
  public focusTag: any;

  private subscription?: rxjs.Subscription;

  @ViewChild('element', {} as never)
  public set element(value: ElementRef) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.subscription = fromEvent
      ? fromEvent(value.nativeElement, 'focus')
          .pipe(
            tap(event => {
              this.focusFromEvent = event;
            }),
          )
          .subscribe()
      : undefined;
  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

@NgModule({
  declarations: [TargetComponent],
  imports: [ReactiveFormsModule],
})
class TargetModule {}

describe('ng-mocks-trigger:test', () => {
  beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

  it('throws on empty elements', () => {
    MockRender(TargetComponent);

    const debugElement = ngMocks.find('div', undefined);
    try {
      ngMocks.trigger(debugElement, 'focus');
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'Cannot trigger focus event undefined element',
      );
    }

    try {
      ngMocks.trigger(debugElement, ngMocks.event('click'));
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'Cannot trigger click event undefined element',
      );
    }
  });

  it('skips on disabled elements', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const debugElement = ngMocks.find('input');

    component.control.disable();
    fixture.detectChanges();
    ngMocks.trigger(debugElement, 'focus');
    if (fromEvent) {
      expect(component.focusFromEvent).toBeUndefined();
    }
    expect(component.focusTag).toBeUndefined();

    component.control.enable();
    fixture.detectChanges();
    ngMocks.trigger(debugElement, 'focus');
    if (fromEvent) {
      expect(component.focusFromEvent).toBeDefined();
    }
    expect(component.focusTag).toBeDefined();
  });
});
