import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'target-ng-mocks-render-parameters',
  template: '{{ value1 }}:{{ value2 }}',
})
class TargetComponent {
  @Output() public readonly update = new EventEmitter<void>();

  @Input() public value1 = 1;
  @Input() public value2 = 2;
}

describe('ng-mocks-render:params', () => {
  ngMocks.faster();

  beforeEach(() => MockBuilder(TargetComponent));

  it('fails on classic createComponent', () => {
    const fixture = TestBed.createComponent(TargetComponent);
    fixture.changeDetectorRef.detectChanges();

    // nothing is rendered
    expect(ngMocks.formatText(fixture)).toEqual('1:2');

    (fixture.componentInstance as any).value1 = 10;
    fixture.changeDetectorRef.detectChanges();
    // no effect
    expect(ngMocks.formatText(fixture)).toEqual('1:2');

    (fixture.componentInstance as any).value2 = 20;
    fixture.changeDetectorRef.detectChanges();
    // no effect
    expect(ngMocks.formatText(fixture)).toEqual('1:2');

    fixture.componentInstance.update.emit();
    fixture.changeDetectorRef.detectChanges();
    // no effect
    expect(ngMocks.formatText(fixture)).toEqual('1:2');
  });

  it('uses full proxy without params', () => {
    const fixture = MockRender(TargetComponent);

    expect(fixture.componentInstance.value1).toEqual(null as any);
    expect(fixture.componentInstance.value2).toEqual(null as any);
    expect(fixture.point.componentInstance.value1).toEqual(
      null as any,
    );
    expect(fixture.point.componentInstance.value2).toEqual(
      null as any,
    );

    // nothing is rendered
    expect(ngMocks.formatText(fixture)).toEqual(':');

    fixture.componentInstance.value1 = 10;
    fixture.detectChanges();
    // renders value1
    expect(ngMocks.formatText(fixture)).toEqual('10:');

    fixture.componentInstance.value2 = 20;
    fixture.detectChanges();
    // renders value2
    expect(ngMocks.formatText(fixture)).toEqual('10:20');
  });

  it('binds no inputs for empty params', () => {
    const fixture = MockRender(TargetComponent, {});

    // nothing is rendered
    expect(ngMocks.formatText(fixture)).toEqual('1:2');

    (fixture.componentInstance as any).value1 = 10;
    fixture.detectChanges();
    // no effect
    expect(ngMocks.formatText(fixture)).toEqual('1:2');

    (fixture.componentInstance as any).value2 = 20;
    fixture.detectChanges();
    // no effect
    expect(ngMocks.formatText(fixture)).toEqual('1:2');

    fixture.point.componentInstance.update.emit();
    fixture.detectChanges();
    // no effect
    expect(ngMocks.formatText(fixture)).toEqual('1:2');
  });

  it('binds only provided params', () => {
    const fixture = MockRender(TargetComponent, { value1: 5 });

    // renders the provided parameter and the default input value
    expect(ngMocks.formatText(fixture)).toEqual('5:2');

    fixture.componentInstance.value1 = 10;
    fixture.detectChanges();
    // renders value1
    expect(ngMocks.formatText(fixture)).toEqual('10:2');

    (fixture.componentInstance as any).value2 = 20;
    fixture.detectChanges();
    // no effect
    expect(ngMocks.formatText(fixture)).toEqual('10:2');
  });
});
