import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
} from '@angular/core';

import {
  MockBuilder,
  MockProvider,
  MockRender,
  MockService,
  ngMocks,
} from 'ng-mocks';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'target-ng-zone',
  template: '{{ v }}',
})
class TargetComponent {
  public v = 0;

  public constructor(
    private readonly zone: NgZone,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  public update() {
    this.zone.runOutsideAngular(() => {
      this.zone.runTask(() => {
        this.v += 1;
        this.cdr.markForCheck();
      });
    });
  }
}

describe('ng-zone', () => {
  describe('default', () => {
    beforeEach(() => MockBuilder(TargetComponent));

    it('uses real NgZone', () => {
      const fixture = MockRender(TargetComponent);
      expect(ngMocks.formatText(fixture)).toEqual('0');

      fixture.point.componentInstance.update();
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('1');
    });
  });

  describe('mock', () => {
    beforeEach(() => MockBuilder(TargetComponent));

    it('uses mock NgZone', () => {
      const zone: NgZone = MockService(NgZone);
      const fixture = MockRender(TargetComponent, null, {
        providers: [MockProvider(NgZone, zone)],
      });
      expect(ngMocks.formatText(fixture)).toEqual('0');

      fixture.point.componentInstance.update();
      expect(zone.runOutsideAngular).toHaveBeenCalledTimes(1);
    });
  });
});
