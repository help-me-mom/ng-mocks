import {
  Component,
  Injectable as InjectableSource,
  NgModule,
  VERSION,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, NG_MOCKS_ROOT_PROVIDERS } from 'ng-mocks';

// Because of A5 we need to cast Injectable to any type.
// But because of A10+ we need to do it via a middle function.
function Injectable(...args: any[]): any {
  return InjectableSource(...args);
}

@Injectable({
  providedIn: 'root',
})
class TargetService {
  protected readonly name = 'target';

  public echo(): string {
    return this.name;
  }
}

@NgModule({})
class MockModule {
  public constructor(service: TargetService) {
    service.echo();
  }
}

@NgModule({})
class KeepModule {
  public constructor(service: TargetService) {
    service.echo();
  }
}

@Component({
  selector: 'target',
  template: 'target',
})
class TargetComponent {}

@NgModule({
  declarations: [TargetComponent],
  imports: [MockModule, KeepModule],
})
export class TargetModule {}

// The problem here is that by the logic we keep KeepModule and mock MockModule.
// Both of them use a root provider TargetService.
// Because we keep KeepModule the TargetService has to be kept too.
// If we want to mock it, then we need to mock NG_MOCKS_ROOT_PROVIDERS token.
// @see https://github.com/ike18t/ng-mocks/issues/222
describe('issue-222:kept-root-injection', () => {
  if (parseInt(VERSION.major, 10) <= 5) {
    it('a5', () => {
      // pending('Need Angular > 5');
      expect(true).toBeTruthy();
    });

    return;
  }

  describe('real', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).keep(KeepModule),
    );

    it('does not mock kept dependency', () => {
      const service: TargetService = TestBed.get(TargetService);
      expect(service.echo()).toBeDefined();
    });
  });

  describe('NG_MOCKS_ROOT_PROVIDERS', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule)
        .mock(NG_MOCKS_ROOT_PROVIDERS)
        .keep(KeepModule),
    );

    it('does not mock kept dependency', () => {
      const service: TargetService = TestBed.get(TargetService);
      expect(service.echo()).toBeUndefined();
    });
  });
});
