import { Component, Injectable, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockRenderFactory, ngMocks } from 'ng-mocks';

let target = 0;

@Injectable()
class TargetService {
  public readonly name: string;

  public constructor() {
    target += 1;

    this.name = `target:${target}`;
  }
}

@NgModule({
  providers: [TargetService],
})
class NestedModule {}

@NgModule({
  imports: [NestedModule],
})
class ServiceModule {}

@Component({
  selector: 'target-623-nested',
  template: '{{ service.name }}',
})
class TargetComponent {
  public constructor(public readonly service: TargetService) {}
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  imports: [ServiceModule],
})
class TargetModule {}

// The test ensures that a provider is available everywhere,
// despite a missing export of its module.
// @see https://github.com/help-me-mom/ng-mocks/issues/623
describe('issue-623:nested', () => {
  const factory = MockRenderFactory(TargetComponent);

  describe('TestBed', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetModule],
      }),
    );
    beforeEach(() => factory.configureTestBed());

    it('succeeds with the directive', () => {
      expect(factory).not.toThrow();

      target = 0;
      expect(ngMocks.formatText(factory())).toEqual('target:1');
      expect(ngMocks.formatText(factory())).toEqual('target:1');
      expect(ngMocks.findInstance(TargetService).name).toEqual(
        'target:1',
      );
    });
  });
});
