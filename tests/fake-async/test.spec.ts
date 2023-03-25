import {
  Component,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';

import { MockBuilder, MockRenderFactory, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-fake-async',
  template: '{{ counter }}',
})
class TargetComponent implements OnInit, OnDestroy {
  public counter = 0;
  @Input() public value = 0;
  private timer: any;

  public constructor(private readonly zone: NgZone) {}

  public ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  public ngOnInit(): void {
    clearInterval(this.timer);
    this.zone.runOutsideAngular(() => {
      this.timer = setInterval(
        () => (this.counter += this.value),
        1000,
      );
    });
  }
}

// The goal is to ensure that nothing is broken with fakeAsync.
describe('fake-async', () => {
  let calls = 0;

  const factory = MockRenderFactory(TargetComponent, ['value']);
  ngMocks.faster();
  beforeAll(() => MockBuilder(TargetComponent));

  it('checks with 5', fakeAsync(() => {
    const fixture = factory({ value: 1 });
    fixture.whenStable().then(() => {
      fixture.detectChanges();

      expect(ngMocks.formatText(fixture)).toEqual('0');
      tick(1000);
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('1');
      tick(2000);
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('3');

      // for an unknown reason the fixture should be destroyed here.
      fixture.destroy();
      calls += 1;
    });
  }));

  it('checks with 5', fakeAsync(() => {
    const fixture = factory({ value: 5 });
    fixture.whenStable().then(() => {
      fixture.detectChanges();

      expect(ngMocks.formatText(fixture)).toEqual('0');
      tick(1000);
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('5');
      tick(4000);
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('25');

      // for an unknown reason the fixture should be destroyed here.
      fixture.destroy();
      calls += 1;
    });
  }));

  it('controls execution', () => {
    expect(calls).toEqual(2);
  });
});
