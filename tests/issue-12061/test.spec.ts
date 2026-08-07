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
