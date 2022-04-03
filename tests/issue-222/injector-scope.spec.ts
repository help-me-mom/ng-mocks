import {
  Component,
  Inject,
  Injectable as InjectableSource,
  NgModule,
  PLATFORM_ID,
  VERSION,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MockBuilder, MockRender } from 'ng-mocks';

// Because of A5 we need to cast Injectable to any type.
// But because of A10+ we need to do it via a middle function.
function Injectable(...args: any[]): any {
  return InjectableSource(...args);
}

@Injectable({
  providedIn: 'root',
})
class KeepService {
  public constructor(@Inject(PLATFORM_ID) public readonly id: any) {}

  public echo(): any {
    return this.id;
  }
}

@NgModule({})
class KeepModule {
  public constructor(service: KeepService) {
    service.echo();
  }
}

@Component({
  selector: 'target',
  template: `target`,
})
class TargetComponent {}

@NgModule({
  declarations: [TargetComponent],
  imports: [BrowserModule, KeepModule],
})
class TargetModule {}

// @see https://github.com/ike18t/ng-mocks/issues/222
describe('issue-222:INJECTOR_SCOPE', () => {
  if (parseInt(VERSION.major, 10) <= 5) {
    it('a5', () => {
      // pending('Need Angular > 5');
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).keep(KeepModule),
  );

  it('does not mock INJECTOR_SCOPE, fails on ivy only', () => {
    // No provider for KeepService
    expect(() => MockRender(TargetComponent)).not.toThrow();
  });
});
