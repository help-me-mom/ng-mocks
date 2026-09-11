import {
  ChangeDetectionStrategy,
  Component,
  Injectable,
  NgModule,
  OnDestroy,
} from '@angular/core';

import {
  MockBuilder,
  MockedComponentFixture,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Injectable()
class TargetService implements OnDestroy {
  public destroyed = false;
  public value = 'outer';

  public ngOnDestroy(): void {
    this.destroyed = true;
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'target-ng-mocks-faster-nested',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ service.value }}',
})
class TargetComponent {
  public constructor(public readonly service: TargetService) {}
}

@NgModule({
  declarations: [TargetComponent],
  providers: [TargetService],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14912
describe('ngMocks.faster:nested', () => {
  let fixture: MockedComponentFixture<TargetComponent>;
  let service: TargetService;

  ngMocks.faster();

  beforeAll(() =>
    MockBuilder(TargetComponent, TargetModule).keep(TargetService),
  );
  beforeAll(() => {
    fixture = MockRender(TargetComponent);
    service = fixture.point.componentInstance.service;
  });

  // Finishing either inner scope must preserve the outer beforeAll fixture
  // and its module injector for the sibling that runs afterward.
  describe('first inner scope', () => {
    ngMocks.faster();

    it('uses the outer fixture and module service', () => {
      expect(fixture.componentRef.hostView.destroyed).toBe(false);
      expect(service.destroyed).toBe(false);
      expect(ngMocks.get(TargetService)).toBe(service);

      service.value = 'first inner scope';
      fixture.detectChanges();

      expect(ngMocks.formatText(fixture)).toBe('first inner scope');
    });
  });

  describe('second inner scope', () => {
    ngMocks.faster();

    it('uses the outer fixture and module service', () => {
      expect(fixture.componentRef.hostView.destroyed).toBe(false);
      expect(service.destroyed).toBe(false);
      expect(ngMocks.get(TargetService)).toBe(service);

      service.value = 'second inner scope';
      fixture.detectChanges();

      expect(ngMocks.formatText(fixture)).toBe('second inner scope');
    });
  });
});
