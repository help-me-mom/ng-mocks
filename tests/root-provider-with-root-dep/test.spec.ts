import {
  Component,
  Inject,
  Injectable,
  InjectionToken,
  NgModule,
  VERSION,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender } from 'ng-mocks';

// Thanks A5.
const TOKEN = new (InjectionToken as any)('TOKEN', {
  factory: () => 'token',
});

const injectableTargetServiceArgs = [
  {
    providedIn: 'root',
  } as never,
];

@Injectable(...injectableTargetServiceArgs)
class TargetService {
  public constructor(
    @Inject(TOKEN) public readonly name: string,
    @Inject(TOKEN) public readonly name2: string,
    @Inject(TOKEN) public readonly name3: string,
  ) {}
}

@Component({
  selector: 'target',
  template: ' "name:{{ service ? service.name : \'\' }}" ',
})
class TargetComponent {
  public constructor(public readonly service: TargetService) {}
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
})
class TargetModule {}

describe('root-provider-with-root-dep', () => {
  if (Number.parseInt(VERSION.major, 10) <= 5) {
    it('a5', () => {
      // pending('Need Angular > 5');
      expect(true).toBeTruthy();
    });

    return;
  }

  describe('real', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetModule],
      }).compileComponents(),
    );

    it('finds tokens', () => {
      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toContain(
        '"name:token"',
      );
    });
  });

  describe('mock', () => {
    beforeEach(() => MockBuilder(TargetComponent, TargetModule));

    it('mocks service', () => {
      const fixture = MockRender(TargetComponent);
      expect(fixture.nativeElement.innerHTML).toContain('"name:"');
      // A nested token as a dependency should be replaced with a mock copy.
      expect(TestBed.get(TOKEN)).toBeUndefined();
    });
  });
});
