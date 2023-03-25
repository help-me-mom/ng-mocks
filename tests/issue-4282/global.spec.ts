import {
  Component,
  inject,
  Injectable,
  NgModule,
  VERSION,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockRender, ngMocks } from 'ng-mocks';

// @TODO remove with A5 support
const injectableTargetServiceArgs = [
  {
    providedIn: 'root',
  } as never,
];

@Injectable(...injectableTargetServiceArgs)
export class TargetService {
  name = 'real';
}

@Component({
  selector: 'target-4282-global',
  template: `{{ service.name }}`,
})
export class TargetComponent {
  readonly service = inject(TargetService);
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
})
class TargetModule {}

ngMocks.globalMock(TargetService);
ngMocks.defaultMock(TargetService, () => ({
  name: 'mock',
}));

// @see https://github.com/help-me-mom/ng-mocks/issues/4282
describe('issue-4282:global', () => {
  if (Number.parseInt(VERSION.major, 10) < 14) {
    it('a14', () => {
      // pending('Need Angular >= 14');
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TargetModule],
    }).compileComponents(),
  );

  it('mocks the injected service', () => {
    const fixture = MockRender(TargetComponent);
    expect(ngMocks.formatText(fixture)).toEqual('mock');
    expect(
      isMockOf(
        fixture.point.componentInstance.service,
        TargetService,
      ),
    ).toEqual(true);
  });
});
