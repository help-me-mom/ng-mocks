import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockComponent,
  MockDirective,
  MockInstance,
  ngMocks,
} from 'ng-mocks';

let componentConstructions = 0;
let directiveConstructions = 0;
let getterCalls = 0;

@Component({
  selector: 'child-15007',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '',
})
class ChildComponent {
  @HostBinding('attr.data-event')
  @Output('changed')
  public readonly event = new EventEmitter<string>();

  @HostBinding('attr.data-input')
  @Input('label')
  public value = '';

  public constructor() {
    componentConstructions += 1;
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'host-15007',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <child-15007
      [label]="value"
      (changed)="first.push($event)"
    ></child-15007>
    <child-15007
      [label]="value"
      (changed)="second.push($event)"
    ></child-15007>
  `,
})
class HostComponent {
  public value = 'initial';
  public first: string[] = [];
  public second: string[] = [];
}

@Directive({
  selector: '[base15007]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class BaseDirective {
  private readonly emitter = new EventEmitter<string>();

  @Output()
  @HostBinding('attr.data-event')
  public get event(): EventEmitter<string> {
    getterCalls += 1;
    return this.emitter;
  }

  @Input()
  @HostBinding('class.active')
  public enabled = false;

  public constructor() {
    directiveConstructions += 1;
  }
}

@Directive({
  selector: '[child15007]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class ChildDirective extends BaseDirective {}

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'directive-host-15007',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template:
    '<div child15007 [enabled]="active" (event)="events.push($event)"></div>',
})
class DirectiveHostComponent {
  public active = true;
  public events: string[] = [];
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15007
// HostBinding storage must not prevent the same member from becoming a subscribable output.
describe('issue-15007', () => {
  MockInstance.scope();

  beforeEach(() => {
    componentConstructions = 0;
    directiveConstructions = 0;
    getterCalls = 0;
  });

  for (const mock of [false, true]) {
    it(`preserves aliased output bindings and instance-local emitters with mock:${mock}`, async () => {
      await TestBed.configureTestingModule({
        declarations: [
          HostComponent,
          mock ? MockComponent(ChildComponent) : ChildComponent,
        ],
      }).compileComponents();
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      const children = ngMocks.findInstances(fixture, ChildComponent);
      const elements = ngMocks.findAll(fixture, ChildComponent);

      expect(children.length).toBe(2);
      expect(children[0].event === children[1].event).toBe(false);
      expect(
        ngMocks.output(elements[0], 'changed') === children[0].event,
      ).toBe(true);
      children[0].event.emit('first');
      children[0].event.emit('again');
      expect(fixture.componentInstance.first).toEqual([
        'first',
        'again',
      ]);
      expect(fixture.componentInstance.second).toEqual([]);
      children[1].event.emit('second');
      expect(fixture.componentInstance.second).toEqual(['second']);
      expect(fixture.componentInstance.first).toEqual([
        'first',
        'again',
      ]);
      expect(componentConstructions).toBe(mock ? 0 : 2);
      expect(children[0].value).toBe('initial');
      expect(
        elements[0].nativeElement.dataset.event !== undefined,
      ).toBe(!mock);
      expect(elements[0].nativeElement.dataset.input).toBe(
        mock ? undefined : 'initial',
      );

      fixture.componentInstance.value = 'updated';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(children[0].value).toBe('updated');
      expect(children[1].value).toBe('updated');
      expect(elements[0].nativeElement.dataset.input).toBe(
        mock ? undefined : 'updated',
      );
    });

    it(`preserves inherited unaliased getter outputs with mock:${mock}`, async () => {
      await TestBed.configureTestingModule({
        declarations: [
          DirectiveHostComponent,
          mock ? MockDirective(ChildDirective) : ChildDirective,
        ],
      }).compileComponents();
      const fixture = TestBed.createComponent(DirectiveHostComponent);
      fixture.detectChanges();
      const element = ngMocks.find(fixture, ChildDirective);
      const directive = ngMocks.get(element, ChildDirective);

      directive.event.emit('first');
      directive.event.emit('second');
      expect(fixture.componentInstance.events).toEqual([
        'first',
        'second',
      ]);
      expect(directiveConstructions).toBe(mock ? 0 : 1);
      expect(getterCalls > 0).toBe(!mock);
      expect(directive.enabled).toBe(true);
      expect(element.nativeElement.dataset.event !== undefined).toBe(
        !mock,
      );
      expect(element.nativeElement.classList.contains('active')).toBe(
        !mock,
      );

      fixture.componentInstance.active = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(directive.enabled).toBe(false);
      expect(element.nativeElement.classList.contains('active')).toBe(
        false,
      );
    });
  }

  it('preserves an explicitly shared custom emitter', async () => {
    const emitter = new EventEmitter<string>();
    MockInstance(ChildComponent, 'event', emitter);
    await MockBuilder().keep(HostComponent).mock(ChildComponent);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const children = ngMocks.findInstances(fixture, ChildComponent);

    expect(children.length).toBe(2);
    expect(children[0].event === emitter).toBe(true);
    expect(children[1].event === emitter).toBe(true);
    emitter.emit('custom');
    expect(fixture.componentInstance.first).toEqual(['custom']);
    expect(fixture.componentInstance.second).toEqual(['custom']);
    expect(componentConstructions).toBe(0);
    expect(
      ngMocks.find(fixture, ChildComponent).nativeElement.dataset
        .event !== undefined,
    ).toBe(false);
  });
});
