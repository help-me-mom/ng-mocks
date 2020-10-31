import { Component, Injectable as InjectableSource, NgModule, Optional } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';

// Because of A5 we need to cast Injectable to any type.
// But because of A10+ we need to do it via a middle function.
function Injectable(...args: any[]): any {
  return InjectableSource(...args);
}

@Injectable({
  providedIn: 'root',
})
class Dep1Service {
  public readonly name = 'dep-1';
}

@Injectable({
  providedIn: 'root',
})
class Dep2Service {
  public readonly name = 'dep-2';
}

// Not root.
@Injectable()
class Dep3Service {
  public readonly name = 'dep-3';
}

@Injectable()
class TargetService {
  public readonly optional?: { name: string };
  public readonly service: { name: string };

  constructor(service: Dep1Service, optional: Dep1Service) {
    this.service = service;
    this.optional = optional;
  }
}

@Component({
  selector: 'target',
  template: `
    "service:{{ service.service ? service.service.name : 'missed' }}" "optional:{{
      service.optional ? service.optional.name : 'missed'
    }}"
  `,
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
  providers: [
    {
      deps: [Dep2Service, [new Optional(), Dep3Service]],
      provide: TargetService,
      useClass: TargetService,
    },
  ],
})
class TargetModule {}

xdescribe('provider-with-custom-dependencies', () => {
  describe('real', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetModule],
      }).compileComponents()
    );

    it('creates component with custom dependencies', () => {
      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();
      // Injects root dependency correctly.
      expect(fixture.nativeElement.innerHTML).toContain('"service:dep-2"');
      // Skips unprovided local dependency.
      expect(fixture.nativeElement.innerHTML).toContain('"optional:missed"');
      // The dependency should not be provided in TestBed.
      expect(() => TestBed.get(Dep3Service)).toThrowError(/No provider for Dep3Service/);
    });
  });

  describe('mock-builder', () => {
    beforeEach(() => MockBuilder(TargetComponent, TargetModule).keep(TargetService));

    it('creates component with mocked custom dependencies', () => {
      const fixture = MockRender(TargetComponent);
      // Injects root dependency correctly, it is not missed, it is mocked.
      expect(fixture.nativeElement.innerHTML).toContain('"service:"');
      // Skips unprovided local dependency despite its mocked copy.
      expect(fixture.nativeElement.innerHTML).toContain('"optional:missed"');
      // The dependency should not be provided in TestBed.
      expect(() => TestBed.get(Dep3Service)).toThrowError(/No provider for Dep3Service/);
    });
  });
});
