import { Component, Injectable, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender } from 'ng-mocks';

@Injectable()
class Nested1Service {
  public readonly name = 'nested-1';
}

@Injectable()
class Nested2Service {
  public readonly name = 'nested-2';
}

@Injectable()
class Nested3Service {
  public readonly name = 'nested-3';
}

@Injectable()
class Nested4Service {
  public readonly name = 'nested-4';
}

@Injectable()
class TargetService {
  public readonly name = 'target';
}

@Component({
  selector: 'target-root-provider-in-depths',
  template: '{{ service.name }}',
})
class TargetComponent {
  public constructor(public readonly service: TargetService) {}
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  providers: [
    Nested1Service,
    [
      Nested2Service,
      [Nested3Service, [Nested4Service, [TargetService]]],
    ],
  ],
})
class TargetModule {}

describe('root-provider-in-depths', () => {
  describe('real', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetModule],
      }).compileComponents(),
    );

    it('creates component with very nested service', () => {
      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual('target');
    });
  });

  describe('mock-builder', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).keep(TargetService),
    );

    it('creates component with very nested service', () => {
      const fixture = MockRender(TargetComponent);
      expect(fixture.point.nativeElement.innerHTML).toEqual('target');
    });
  });
});
