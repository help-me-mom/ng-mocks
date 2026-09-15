import {
  Component,
  EventEmitter,
  Input,
  model,
  Output,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';

import { MockControlValueAccessorProxy } from '../../common/mock-control-value-accessor-proxy';
import { MockRender } from '../../mock-render/mock-render';
import { ngMocks } from '../mock-helper';

@Component({
  selector: 'model-control-dispatch',
  standalone: false,
  template: '{{ current() }}',
  providers: [
    { provide: NgControl, useValue: { valueAccessor: null } },
  ],
})
class ModelControl {
  // The source unit supplies compiler-equivalent model metadata; the spread
  // regressions verify the real FormField binding on Angular 21 and 22.
  @Input({ alias: 'value', isSignal: true } as never)
  @Output('valueChange')
  public readonly current = model('initial');

  @Output('touch') public readonly touched = new EventEmitter<void>();
}

describe('model-control-dispatch', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ declarations: [ModelControl] }),
  );

  it('uses classic outputs when the attached proxy has no registered callbacks', () => {
    const accessor = new MockControlValueAccessorProxy();
    const placeholders = {
      __simulateChange: jasmine.createSpy('unused change'),
      __simulateTouch: jasmine.createSpy('unused touch'),
    };
    accessor.instance = placeholders;
    @Component({
      selector: 'classic-model-control-dispatch',
      standalone: false,
      template: '{{ value }}',
      // Model the reported injector state independently of Material construction.
      providers: [
        { provide: NgControl, useValue: { valueAccessor: accessor } },
      ],
    })
    class ClassicModelControl {
      @Input() public value = 'initial';
      @Output() public readonly valueChange =
        new EventEmitter<string>();
      @Output() public readonly touch = new EventEmitter<void>();
    }
    TestBed.configureTestingModule({
      declarations: [ClassicModelControl],
    });
    const events: string[] = [];
    const fixture = MockRender(
      `<classic-model-control-dispatch
        [value]="inputValue"
        (valueChange)="inputValue = $event"
        (input)="events.push('input')"
        (blur)="events.push('blur')"
      />`,
      { inputValue: 'initial', events },
    );
    const child = ngMocks.find(ClassicModelControl);
    const instance = ngMocks.get(child, ClassicModelControl);
    const values: string[] = [];
    const touches: unknown[] = [];
    instance.valueChange.subscribe(value => values.push(value));
    instance.touch.subscribe(value => touches.push(value));

    expect(ngMocks.get(child, NgControl).valueAccessor).toBe(
      accessor,
    );
    expect(accessor.isRegistered('__simulateChange')).toBe(false);
    expect(accessor.isRegistered('__simulateTouch')).toBe(false);

    // The connected output updates the host; the proxy's placeholders do not.
    ngMocks.change(child, 'updated');
    fixture.detectChanges();

    expect(fixture.componentInstance.inputValue).toBe('updated');
    expect(instance.value).toBe('updated');
    expect(values).toEqual(['updated']);
    expect(touches).toEqual([]);
    expect(events).toEqual([]);

    ngMocks.touch(child);
    fixture.detectChanges();

    expect(values).toEqual(['updated']);
    expect(touches).toEqual([undefined]);
    expect(events).toEqual([]);
    expect(placeholders.__simulateChange).not.toHaveBeenCalled();
    expect(placeholders.__simulateTouch).not.toHaveBeenCalled();
    expect(accessor.isRegistered('__simulateChange')).toBe(false);
    expect(accessor.isRegistered('__simulateTouch')).toBe(false);
    expect(ngMocks.formatText(child)).toBe('updated');
  });

  it('changes a bound signal model once without dispatching native input or blur', () => {
    const events: string[] = [];
    const fixture = MockRender(
      `<model-control-dispatch
        (input)="events.push('input')"
        (blur)="events.push('blur')"
      />`,
      { events },
    );
    const child = ngMocks.find(ModelControl);
    const instance = ngMocks.get(child, ModelControl);
    const current = instance.current;
    const values: string[] = [];
    const touches: unknown[] = [];
    current.subscribe(value => values.push(value));
    instance.touched.subscribe(value => touches.push(value));

    ngMocks.change(child, 'updated');
    fixture.detectChanges();

    expect(instance.current).toBe(current);
    expect(current()).toBe('updated');
    expect(values).toEqual(['updated']);
    expect(touches).toEqual([]);
    expect(events).toEqual([]);
    expect(ngMocks.formatText(child)).toBe('updated');
  });

  it('touches a bound signal model once without changing its value or dispatching native blur', () => {
    const events: string[] = [];
    const fixture = MockRender(
      `<model-control-dispatch
        (input)="events.push('input')"
        (blur)="events.push('blur')"
      />`,
      { events },
    );
    const child = ngMocks.find(ModelControl);
    const instance = ngMocks.get(child, ModelControl);
    const current = instance.current;
    const values: string[] = [];
    const touches: unknown[] = [];
    current.subscribe(value => values.push(value));
    instance.touched.subscribe(value => touches.push(value));

    ngMocks.touch(child);
    fixture.detectChanges();

    expect(instance.current).toBe(current);
    expect(current()).toBe('initial');
    expect(values).toEqual([]);
    expect(touches).toEqual([undefined]);
    expect(events).toEqual([]);
    expect(ngMocks.formatText(child)).toBe('initial');
  });

  it('preserves a selected CVA before considering signal model outputs', () => {
    const fixture = MockRender(ModelControl);
    const child = ngMocks.find(ModelControl);
    const instance = ngMocks.get(child, ModelControl);
    const ngControl = ngMocks.get(child, NgControl);
    const values: string[] = [];
    const touches: unknown[] = [];
    instance.current.subscribe(value => values.push(value));
    instance.touched.subscribe(value => touches.push(value));
    const accessor = {
      writeValue: jasmine.createSpy('writeValue'),
      onChange: jasmine.createSpy('onChange'),
      onTouched: jasmine.createSpy('onTouched'),
    };
    const original = ngControl.valueAccessor;
    ngControl.valueAccessor = accessor as never;

    try {
      ngMocks.change(child, 'updated');
      ngMocks.touch(child);
      fixture.detectChanges();

      expect(accessor.writeValue.calls.allArgs()).toEqual([
        ['updated'],
      ]);
      expect(accessor.onChange.calls.allArgs()).toEqual([
        ['updated'],
      ]);
      expect(accessor.onTouched.calls.count()).toBe(1);
      expect(instance.current()).toBe('initial');
      expect(values).toEqual([]);
      expect(touches).toEqual([]);
      expect(ngMocks.formatText(child)).toBe('initial');
    } finally {
      ngControl.valueAccessor = original;
    }
  });
});
