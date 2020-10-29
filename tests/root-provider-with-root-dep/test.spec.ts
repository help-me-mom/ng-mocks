import { Component, Inject, Injectable as InjectableSource, InjectionToken, NgModule, VERSION } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';

// Because of A5 we need to cast Injectable to any type.
// But because of A10+ we need to do it via a middle function.
function Injectable(...args: any[]): any {
  return InjectableSource(...args);
}

// Thanks A5.
const TOKEN = new (InjectionToken as any)('TOKEN', {
  factory: () => 'token',
});

@Injectable({
  providedIn: 'root',
})
class TargetService {
  public readonly name: string;
  public readonly name2: string;
  public readonly name3: string;

  constructor(@Inject(TOKEN) name: string, @Inject(TOKEN) name2: string, @Inject(TOKEN) name3: string) {
    this.name = name;
    this.name2 = name2;
    this.name3 = name3;
  }
}

@Component({
  selector: 'target',
  template: ` "name:{{ service ? service.name : '' }}" `,
})
class TargetComponent {
  public readonly service: TargetService;

  constructor(service: TargetService) {
    this.service = service;
  }
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
})
class TargetModule {}

describe('root-provider-with-root-dep', () => {
  beforeEach(() => {
    if (parseInt(VERSION.major, 10) <= 5) {
      pending('Need Angular > 5');
    }
  });

  describe('real', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetModule],
      }).compileComponents()
    );

    it('finds tokens', () => {
      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toContain('"name:token"');
    });
  });

  describe('mock', () => {
    beforeEach(() => MockBuilder(TargetComponent, TargetModule));

    it('mocks service', () => {
      const fixture = MockRender(TargetComponent);
      expect(fixture.nativeElement.innerHTML).toContain('"name:"');
      // A nested token as a dependency should be mocked.
      expect(TestBed.get(TOKEN)).toBeUndefined();
    });
  });
});
