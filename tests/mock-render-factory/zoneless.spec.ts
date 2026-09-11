import {
  ChangeDetectionStrategy,
  Component,
  Input,
  provideZonelessChangeDetection,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockRenderFactory, ngMocks } from 'ng-mocks';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'target-mock-render-factory-zoneless',
  standalone: false,
  template: '{{ value }}',
})
class TargetComponent {
  @Input() public value?: string;
}

describe('mock-render-factory:zoneless', () => {
  // Some included runners load Zone.js, so explicit zoneless setup emits NG0914.
  ngMocks.ignoreOnConsole('warn');

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('schedules the initial params keys when no binding list is provided', async () => {
    const factory = MockRenderFactory<TargetComponent>(
      '<target-mock-render-factory-zoneless [value]="value"></target-mock-render-factory-zoneless>',
    );
    factory.configureTestBed();
    const params = { value: 'initial' };
    const fixture = factory(params);
    await fixture.whenStable();

    params.value = 'first';
    await fixture.whenStable();

    expect(fixture.componentInstance.value).toEqual('first');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('first');
    expect(ngMocks.formatText(fixture)).toEqual('first');

    fixture.componentInstance.value = 'second';
    await fixture.whenStable();

    expect(params.value).toEqual('second');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('second');
    expect(ngMocks.formatText(fixture)).toEqual('second');
  });

  it('schedules an explicit binding absent from the initial params', async () => {
    const factory = MockRenderFactory<TargetComponent>(
      '<target-mock-render-factory-zoneless [value]="value"></target-mock-render-factory-zoneless>',
      ['value'],
    );
    factory.configureTestBed();
    const params: { value?: string } = {};
    const fixture = factory(params);
    await fixture.whenStable();

    expect(ngMocks.input(fixture.point, 'value')).toBeUndefined();
    expect(ngMocks.formatText(fixture)).toEqual('');

    params.value = 'first';
    await fixture.whenStable();

    expect(ngMocks.input(fixture.point, 'value')).toEqual('first');
    expect(ngMocks.formatText(fixture)).toEqual('first');

    fixture.componentInstance.value = 'second';
    await fixture.whenStable();

    expect(params.value).toEqual('second');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('second');
    expect(ngMocks.formatText(fixture)).toEqual('second');
  });

  it('keeps callback clones bound to params when scheduling their replacement', async () => {
    let receiver: unknown;
    const params = {
      label: 'initial',
      callback() {
        receiver = this;

        return this.label;
      },
    };
    const factory = MockRenderFactory(
      '<target-mock-render-factory-zoneless [value]="callback()"></target-mock-render-factory-zoneless>',
      ['label', 'callback'],
    );
    factory.configureTestBed();
    const fixture = factory(params);
    await fixture.whenStable();
    const callback = fixture.componentInstance.callback;

    expect(callback).not.toBe(params.callback);
    expect(fixture.componentInstance.callback).toBe(callback);
    expect(receiver).toBe(params);
    expect(ngMocks.formatText(fixture)).toEqual('initial');

    params.label = 'first';
    await fixture.whenStable();

    expect(fixture.componentInstance.callback).toBe(callback);
    expect(receiver).toBe(params);
    expect(ngMocks.input(fixture.point, 'value')).toEqual('first');
    expect(ngMocks.formatText(fixture)).toEqual('first');

    fixture.componentInstance.callback = function (this: {
      label: string;
    }) {
      receiver = this;

      return `updated:${this.label}`;
    };
    await fixture.whenStable();

    expect(fixture.componentInstance.callback).not.toBe(callback);
    expect(fixture.componentInstance.callback).not.toBe(
      params.callback,
    );
    expect(receiver).toBe(params);
    expect(ngMocks.input(fixture.point, 'value')).toEqual(
      'updated:first',
    );
    expect(ngMocks.formatText(fixture)).toEqual('updated:first');
  });

  it('leaves unselected params to explicit change detection', async () => {
    const factory = MockRenderFactory(
      '<target-mock-render-factory-zoneless [value]="unselected"></target-mock-render-factory-zoneless>',
      ['selected'],
    );
    factory.configureTestBed();
    const params = { selected: 'selected', unselected: 'initial' };
    const fixture = factory(params);
    await fixture.whenStable();

    params.unselected = 'updated';
    await fixture.whenStable();

    expect(fixture.componentInstance.unselected).toEqual('updated');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('initial');
    expect(ngMocks.formatText(fixture)).toEqual('initial');

    fixture.detectChanges();

    expect(ngMocks.input(fixture.point, 'value')).toEqual('updated');
    expect(ngMocks.formatText(fixture)).toEqual('updated');
  });

  it('does not add later params keys to the initial scheduling and proxy set', async () => {
    const params: { later?: string; readValue(): string } = {
      readValue() {
        return this.later ?? 'initial';
      },
    };
    const factory = MockRenderFactory(
      '<target-mock-render-factory-zoneless [value]="readValue()"></target-mock-render-factory-zoneless>',
    );
    factory.configureTestBed();
    const fixture = factory(params);
    await fixture.whenStable();

    params.later = 'updated';
    await fixture.whenStable();

    expect(fixture.componentInstance.later).toBeUndefined();
    expect(ngMocks.input(fixture.point, 'value')).toEqual('initial');
    expect(ngMocks.formatText(fixture)).toEqual('initial');

    // The existing callback can read the new params key during an explicit check.
    fixture.detectChanges();

    expect(ngMocks.input(fixture.point, 'value')).toEqual('updated');
    expect(ngMocks.formatText(fixture)).toEqual('updated');
  });

  it('leaves deep mutations to explicit change detection', async () => {
    const factory = MockRenderFactory(
      '<target-mock-render-factory-zoneless [value]="state.value"></target-mock-render-factory-zoneless>',
    );
    factory.configureTestBed();
    const params = { state: { value: 'initial' } };
    const fixture = factory(params);
    await fixture.whenStable();

    params.state.value = 'updated';
    await fixture.whenStable();

    expect(fixture.componentInstance.state).toBe(params.state);
    expect(ngMocks.input(fixture.point, 'value')).toEqual('initial');
    expect(ngMocks.formatText(fixture)).toEqual('initial');

    fixture.detectChanges();

    expect(ngMocks.input(fixture.point, 'value')).toEqual('updated');
    expect(ngMocks.formatText(fixture)).toEqual('updated');
  });
});
