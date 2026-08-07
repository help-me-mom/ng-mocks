import {
  ChangeDetectionStrategy,
  Component,
  Input,
  input,
  reflectComponentType,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, MockRenderFactory } from 'ng-mocks';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'target-12061',
  standalone: false,
  template: '{{ value }}:{{ signalValue() }}',
})
class TargetComponent {
  @Input() public value = 'default';
  public readonly signalValue = input('signal-default');
}

// @see https://github.com/help-me-mom/ng-mocks/issues/12061
describe('issue-12061', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('schedules MockRenderFactory prop updates in zoneless tests', async () => {
    const factory = MockRenderFactory(TargetComponent, [
      'value',
      'signalValue',
    ]);
    factory.configureTestBed();
    const props = {
      signalValue: 'signal-initial',
      value: 'initial',
    };
    const fixture = factory(props);

    expect(fixture.point.componentInstance.value).toEqual('initial');

    props.value = 'updated';
    if ((fixture as any).zonelessEnabled) {
      await fixture.whenStable();
    } else {
      fixture.detectChanges();
    }

    expect(fixture.point.componentInstance.value).toEqual('updated');
  });

  it('preserves inherited input accessors', async () => {
    let value = 'initial';
    const writes: string[] = [];
    const prototype = Object.defineProperty({}, 'value', {
      configurable: true,
      enumerable: true,
      get: () => value,
      set: (newValue: string) => {
        writes.push(newValue);
        value = `set:${newValue}`;
      },
    });
    const props = Object.create(prototype) as {
      value: string;
    };
    const factory = MockRenderFactory(TargetComponent, ['value']);
    factory.configureTestBed();
    const fixture = factory(props);

    props.value = 'updated';
    if ((fixture as any).zonelessEnabled) {
      await fixture.whenStable();
    } else {
      fixture.detectChanges();
    }

    expect(writes).toEqual(['updated']);
    expect(value).toEqual('set:updated');
    expect(fixture.point.componentInstance.value).toEqual(
      'set:updated',
    );
  });

  it('supports nonextensible partial input params', () => {
    const factory = MockRenderFactory(TargetComponent, ['value']);
    factory.configureTestBed();
    const props = Object.freeze({}) as {
      value?: string;
    };

    expect(factory(props)).toBeTruthy();
  });

  it('schedules MockRender prop updates in zoneless tests', async () => {
    const props = {
      value: 'initial',
    };
    const fixture = MockRender(TargetComponent, props);

    expect(fixture.point.componentInstance.value).toEqual('initial');

    props.value = 'updated';
    if ((fixture as any).zonelessEnabled) {
      await fixture.whenStable();
    } else {
      fixture.detectChanges();
    }

    expect(fixture.point.componentInstance.value).toEqual('updated');
  });

  it('reschedules repeated params after fixture proxy updates', async () => {
    const props = {
      value: 'initial',
    };
    const fixture = MockRender(TargetComponent, props);

    props.value = 'first';
    if ((fixture as any).zonelessEnabled) {
      await fixture.whenStable();
    } else {
      fixture.detectChanges();
    }

    fixture.componentInstance.value = 'second';
    fixture.detectChanges();
    expect(fixture.point.componentInstance.value).toEqual('second');

    props.value = 'first';
    if ((fixture as any).zonelessEnabled) {
      await fixture.whenStable();
    } else {
      fixture.detectChanges();
    }

    expect(fixture.point.componentInstance.value).toEqual('first');
    expect(fixture.nativeElement.textContent).toContain('first');
  });

  it('schedules signal input prop updates in zoneless tests', async () => {
    if (
      !reflectComponentType(TargetComponent)?.inputs.some(
        inputMetadata => inputMetadata.propName === 'signalValue',
      )
    ) {
      expect(true).toBeTruthy();

      return;
    }

    const props = {
      signalValue: 'signal-initial',
    };
    const fixture = MockRender(TargetComponent, props);

    expect(fixture.point.componentInstance.signalValue()).toEqual(
      'signal-initial',
    );

    props.signalValue = 'signal-updated';
    if ((fixture as any).zonelessEnabled) {
      await fixture.whenStable();
    } else {
      fixture.detectChanges();
    }

    expect(fixture.point.componentInstance.signalValue()).toEqual(
      'signal-updated',
    );
  });

  it('keeps ComponentRef.setInput scheduling on MockRender', async () => {
    const fixture = MockRender(TargetComponent);

    fixture.componentRef.setInput('value', 'updated');
    if ((fixture as any).zonelessEnabled) {
      await fixture.whenStable();
    } else {
      fixture.detectChanges();
    }

    expect(fixture.point.componentInstance.value).toEqual('updated');
  });

  it('matches direct TestBed ComponentRef.setInput scheduling', async () => {
    const fixture = TestBed.createComponent(TargetComponent);

    fixture.componentRef.setInput('value', 'updated');
    if ((fixture as any).zonelessEnabled) {
      await fixture.whenStable();
    } else {
      fixture.detectChanges();
    }

    expect(fixture.componentInstance.value).toEqual('updated');
  });
});
