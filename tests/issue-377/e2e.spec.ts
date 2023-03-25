import {
  Component,
  Inject,
  Injectable,
  InjectionToken,
  NgModule,
  VERSION,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@NgModule({})
class TargetModule {}

const injectableArgs = [
  {
    providedIn: TargetModule,
  } as never,
];

@Injectable(...injectableArgs)
class TargetService {
  private readonly name = 'target';

  public echo(): string {
    return this.name;
  }
}

// TODO Remove any with A5
const TOKEN = new (InjectionToken as any)('TOKEN', {
  factory: () => 'TOKEN',
  providedIn: TargetModule,
});

@Component({
  selector: 'target-377',
  template: 'service:{{ service.echo() }} token:{{ token }}',
})
class TargetComponent {
  public constructor(
    public readonly service: TargetService,
    @Inject(TOKEN) public readonly token: string,
  ) {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/377
describe('issue-377', () => {
  if (Number.parseInt(VERSION.major, 10) <= 5) {
    it('a5', () => {
      // pending('Need Angular > 5');
      expect(true).toBeTruthy();
    });

    return;
  }

  describe('expected', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        declarations: [TargetComponent],
        imports: [TargetModule],
      }).compileComponents(),
    );

    it('sets TestBed correctly', () => {
      const fixture = MockRender(TargetComponent);
      expect(ngMocks.formatText(fixture)).toEqual(
        'service:target token:TOKEN',
      );
    });
  });

  describe('keep', () => {
    beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

    it('sets TestBed correctly', () => {
      const fixture = MockRender(TargetComponent);
      expect(ngMocks.formatText(fixture)).toEqual(
        'service:target token:TOKEN',
      );
    });
  });

  describe('mock', () => {
    beforeEach(() => MockBuilder(TargetComponent).mock(TargetModule));

    it('sets TestBed correctly', () => {
      const fixture = MockRender(TargetComponent);
      expect(ngMocks.formatText(fixture)).toEqual('service: token:');
    });
  });
});
