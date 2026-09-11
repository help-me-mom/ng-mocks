import {
  ChangeDetectionStrategy,
  Component,
  Input,
  input,
  isSignal,
  provideZonelessChangeDetection,
  reflectComponentType,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockRender, MockRenderFactory, ngMocks } from 'ng-mocks';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'target-14898',
  standalone: false,
  template: '{{ value }}',
})
class TargetComponent {
  @Input() public value = 'default';
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'signal-14898',
  standalone: false,
  template: '{{ value() }}',
})
class SignalComponent {
  public readonly value = input('default');
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'transformed-14898',
  standalone: false,
  template: '{{ value() }}',
})
class TransformedComponent {
  public static transformed = 0;

  public readonly value = input(2, {
    transform: (value: number | string) => {
      TransformedComponent.transformed += 1;

      return Number(value) * 2;
    },
  });
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14898
describe('issue-14898', () => {
  // Some included runners load Zone.js, so explicit zoneless setup emits NG0914.
  ngMocks.ignoreOnConsole('warn');

  beforeEach(() => {
    TransformedComponent.transformed = 0;
    TestBed.configureTestingModule({
      declarations: [
        TargetComponent,
        SignalComponent,
        TransformedComponent,
      ],
      providers: [provideZonelessChangeDetection()],
    });
  });

  // Settle before mutation: pending initial rendering can hide a missing notification.
  it('schedules repeated class-based params writes after initial rendering settles', async () => {
    const params = { value: 'initial' };
    const fixture = MockRender(TargetComponent, params);
    await fixture.whenStable();

    expect(fixture.point.componentInstance.value).toEqual('initial');
    expect(ngMocks.formatText(fixture)).toEqual('initial');

    params.value = 'first';
    await fixture.whenStable();

    expect(fixture.componentInstance.value).toEqual('first');
    expect(fixture.point.componentInstance.value).toEqual('first');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('first');
    expect(ngMocks.formatText(fixture)).toEqual('first');

    params.value = 'second';
    await fixture.whenStable();

    expect(fixture.componentInstance.value).toEqual('second');
    expect(fixture.point.componentInstance.value).toEqual('second');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('second');
    expect(ngMocks.formatText(fixture)).toEqual('second');
  });

  it('schedules class-based wrapper writes and subsequent params writes', async () => {
    const params = { value: 'initial' };
    const fixture = MockRender(TargetComponent, params);
    await fixture.whenStable();

    expect(fixture.point.componentInstance.value).toEqual('initial');
    expect(ngMocks.formatText(fixture)).toEqual('initial');

    fixture.componentInstance.value = 'first';
    expect(params.value).toEqual('first');
    await fixture.whenStable();

    expect(fixture.point.componentInstance.value).toEqual('first');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('first');
    expect(ngMocks.formatText(fixture)).toEqual('first');

    params.value = 'second';
    await fixture.whenStable();

    expect(fixture.componentInstance.value).toEqual('second');
    expect(fixture.point.componentInstance.value).toEqual('second');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('second');
    expect(ngMocks.formatText(fixture)).toEqual('second');
  });

  it('schedules class-based wrapper writes without params', async () => {
    const fixture = MockRender(TargetComponent);
    await fixture.whenStable();

    expect(fixture.point.componentInstance.value).toBeNull();
    expect(ngMocks.formatText(fixture)).toEqual('');

    fixture.componentInstance.value = 'first';
    await fixture.whenStable();

    expect(fixture.point.componentInstance.value).toEqual('first');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('first');
    expect(ngMocks.formatText(fixture)).toEqual('first');

    fixture.componentInstance.value = 'second';
    await fixture.whenStable();

    expect(fixture.point.componentInstance.value).toEqual('second');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('second');
    expect(ngMocks.formatText(fixture)).toEqual('second');
  });

  it('schedules custom-template params and wrapper writes with MockRender', async () => {
    const params = { value: 'initial' };
    const fixture = MockRender<TargetComponent, { value: string }>(
      '<target-14898 [value]="value"></target-14898>',
      params,
    );
    await fixture.whenStable();

    expect(fixture.point.componentInstance.value).toEqual('initial');
    expect(ngMocks.formatText(fixture)).toEqual('initial');

    params.value = 'first';
    await fixture.whenStable();

    expect(fixture.componentInstance.value).toEqual('first');
    expect(fixture.point.componentInstance.value).toEqual('first');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('first');
    expect(ngMocks.formatText(fixture)).toEqual('first');

    fixture.componentInstance.value = 'second';
    expect(params.value).toEqual('second');
    await fixture.whenStable();

    expect(fixture.point.componentInstance.value).toEqual('second');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('second');
    expect(ngMocks.formatText(fixture)).toEqual('second');
  });

  it('schedules custom-template params and wrapper writes with MockRenderFactory', async () => {
    const factory = MockRenderFactory<TargetComponent, 'value'>(
      '<target-14898 [value]="value"></target-14898>',
      ['value'],
    );
    factory.configureTestBed();
    const params = { value: 'initial' };
    const fixture = factory(params);
    await fixture.whenStable();

    expect(fixture.point.componentInstance.value).toEqual('initial');
    expect(ngMocks.formatText(fixture)).toEqual('initial');

    params.value = 'first';
    await fixture.whenStable();

    expect(fixture.componentInstance.value).toEqual('first');
    expect(fixture.point.componentInstance.value).toEqual('first');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('first');
    expect(ngMocks.formatText(fixture)).toEqual('first');

    fixture.componentInstance.value = 'second';
    expect(params.value).toEqual('second');
    await fixture.whenStable();

    expect(fixture.point.componentInstance.value).toEqual('second');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('second');
    expect(ngMocks.formatText(fixture)).toEqual('second');
  });

  it('preserves explicit detectChanges for custom-template params and wrapper writes', async () => {
    const params = { value: 'initial' };
    const fixture = MockRender<TargetComponent, { value: string }>(
      '<target-14898 [value]="value"></target-14898>',
      params,
    );
    await fixture.whenStable();

    expect(fixture.point.componentInstance.value).toEqual('initial');
    expect(ngMocks.formatText(fixture)).toEqual('initial');

    params.value = 'first';
    fixture.detectChanges();

    expect(fixture.componentInstance.value).toEqual('first');
    expect(fixture.point.componentInstance.value).toEqual('first');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('first');
    expect(ngMocks.formatText(fixture)).toEqual('first');
    await fixture.whenStable();

    fixture.componentInstance.value = 'second';
    fixture.detectChanges();

    expect(params.value).toEqual('second');
    expect(fixture.point.componentInstance.value).toEqual('second');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('second');
    expect(ngMocks.formatText(fixture)).toEqual('second');
  });

  it('preserves class-based ComponentRef.setInput scheduling', async () => {
    const params = { value: 'initial' };
    const fixture = MockRender(TargetComponent, params);
    await fixture.whenStable();

    expect(fixture.point.componentInstance.value).toEqual('initial');
    expect(ngMocks.formatText(fixture)).toEqual('initial');

    fixture.componentRef.setInput('value', 'first');
    expect(params.value).toEqual('first');
    await fixture.whenStable();

    expect(fixture.componentInstance.value).toEqual('first');
    expect(fixture.point.componentInstance.value).toEqual('first');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('first');
    expect(ngMocks.formatText(fixture)).toEqual('first');

    fixture.componentRef.setInput('value', 'second');
    expect(params.value).toEqual('second');
    await fixture.whenStable();

    expect(fixture.componentInstance.value).toEqual('second');
    expect(fixture.point.componentInstance.value).toEqual('second');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('second');
    expect(ngMocks.formatText(fixture)).toEqual('second');
  });

  it('preserves signal identity through scheduled params and wrapper writes', async () => {
    // The root TypeScript-only runner does not transform signal declarations.
    if (
      !reflectComponentType(SignalComponent)?.inputs.some(
        inputMetadata => inputMetadata.propName === 'value',
      )
    ) {
      expect(true).toBeTruthy();

      return;
    }

    const params = { value: 'initial' };
    const fixture = MockRender(SignalComponent, params);
    await fixture.whenStable();
    const value = fixture.point.componentInstance.value;

    expect(isSignal(value)).toBe(true);
    expect(value()).toEqual('initial');
    expect(ngMocks.formatText(fixture)).toEqual('initial');

    params.value = 'first';
    await fixture.whenStable();

    expect(fixture.componentInstance.value).toEqual('first');
    expect(fixture.point.componentInstance.value).toBe(value);
    expect(value()).toEqual('first');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('first');
    expect(ngMocks.formatText(fixture)).toEqual('first');

    fixture.componentInstance.value = 'second';
    expect(params.value).toEqual('second');
    await fixture.whenStable();

    expect(fixture.point.componentInstance.value).toBe(value);
    expect(value()).toEqual('second');
    expect(ngMocks.input(fixture.point, 'value')).toEqual('second');
    expect(ngMocks.formatText(fixture)).toEqual('second');
  });

  it('preserves signal initialization and transforms scheduled wrapper writes without params', async () => {
    // The root TypeScript-only runner does not transform signal declarations.
    if (
      !reflectComponentType(TransformedComponent)?.inputs.some(
        inputMetadata => inputMetadata.propName === 'value',
      )
    ) {
      expect(true).toBeTruthy();

      return;
    }

    const fixture = MockRender(TransformedComponent);
    await fixture.whenStable();
    const value = fixture.point.componentInstance.value;

    expect(isSignal(value)).toBe(true);
    expect(fixture.componentInstance.value).toEqual(2);
    expect(value()).toEqual(2);
    expect(ngMocks.formatText(fixture)).toEqual('2');
    expect(TransformedComponent.transformed).toEqual(0);

    fixture.componentInstance.value = 3;
    await fixture.whenStable();

    expect(fixture.componentInstance.value).toEqual(3);
    expect(fixture.point.componentInstance.value).toBe(value);
    expect(value()).toEqual(6);
    expect(ngMocks.input(fixture.point, 'value')).toEqual(6);
    expect(ngMocks.formatText(fixture)).toEqual('6');
    expect(TransformedComponent.transformed).toEqual(1);

    fixture.componentInstance.value = '4';
    await fixture.whenStable();

    expect(fixture.componentInstance.value).toEqual('4');
    expect(fixture.point.componentInstance.value).toBe(value);
    expect(value()).toEqual(8);
    expect(ngMocks.input(fixture.point, 'value')).toEqual(8);
    expect(ngMocks.formatText(fixture)).toEqual('8');
    expect(TransformedComponent.transformed).toEqual(2);
  });
});
