import {
  AsyncPipe,
  CommonModule,
  DecimalPipe,
} from '@angular/common';
import {
  Component,
  Injectable,
  NgModule,
  VERSION,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  isMockOf,
  MockComponent,
  MockModule,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Injectable()
class TargetService {}

@Component({
  selector: 'target-4344-standalone',
  template: '{{ 1 | number }}',
})
class TargetComponent {
  constructor(
    public readonly service: TargetService,
    public readonly pipe: AsyncPipe,
  ) {}
}
@NgModule({
  declarations: [TargetComponent],
  imports: [CommonModule],
  exports: [DecimalPipe, TargetComponent],
  providers: [TargetService, AsyncPipe],
})
class TargetModule {}

@Component(
  {
    selector: 'standalone',
    template: '{{ 1 | number }}',
    standalone: true,
    imports: [TargetModule],
    providers: [AsyncPipe],
  } as never /* TODO: remove after upgrade to a14 */,
)
class StandaloneComponent {
  constructor(
    public readonly service: TargetService,
    public readonly pipe: AsyncPipe,
  ) {}
}

ngMocks.globalKeep(TargetComponent);
ngMocks.globalMock(TargetModule);

// @see https://github.com/help-me-mom/ng-mocks/issues/4344
// exporting AsyncPipe from CommonModule which is kept,
// causes an issue, because ng-mocks mocks AsyncPipe, whereas it shouldn't.
// That happens because a previously checked CommonModule doesn't expose its guts anymore.
describe('issue-4344:standalone', () => {
  if (Number.parseInt(VERSION.major, 10) < 14) {
    it('needs >=a14', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MockModule(CommonModule),
        MockComponent(StandaloneComponent),
        MockModule(TargetModule),
      ],
    }).compileComponents();
  });

  it('creates StandaloneComponent', () => {
    expect(() => MockRender(StandaloneComponent)).not.toThrow();

    const targetService = ngMocks.findInstance(TargetService);
    expect(isMockOf(targetService, TargetService)).toEqual(true);

    const asyncPipe = ngMocks.findInstance(AsyncPipe);
    expect(isMockOf(asyncPipe, AsyncPipe)).toEqual(false);
  });

  it('creates TargetComponent', () => {
    expect(() => MockRender(TargetComponent)).not.toThrow();

    const decimalPipe = ngMocks.findInstance(DecimalPipe);
    expect(isMockOf(decimalPipe, DecimalPipe)).toEqual(false);

    const targetService = ngMocks.findInstance(TargetService);
    expect(isMockOf(targetService, TargetService)).toEqual(true);

    const asyncPipe = ngMocks.findInstance(AsyncPipe);
    expect(isMockOf(asyncPipe, AsyncPipe)).toEqual(false);
  });
});
