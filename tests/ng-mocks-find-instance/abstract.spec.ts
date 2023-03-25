import { Component, Injectable } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable()
abstract class AbstractService {
  public abstract echo(): string;
}

@Injectable()
class TargetService implements AbstractService {
  public echo(): string {
    return 'target';
  }
}

@Component({
  providers: [
    {
      provide: AbstractService,
      useClass: TargetService,
    },
  ],
  selector: 'target-ng-mocks-find-instance-abstract',
  template: '{{ service.echo() }}',
})
class TargetComponent {
  public constructor(public readonly service: AbstractService) {}
}

describe('ng-mocks-find-instance:abstract', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('find abstract classes', () => {
    MockRender(TargetComponent);
    expect(ngMocks.findInstance(AbstractService)).toBeDefined();
    expect(ngMocks.findInstances(AbstractService).length).toEqual(1);
  });
});
