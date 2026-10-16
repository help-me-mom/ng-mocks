import { Component, Directive, Injectable } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable()
class TargetService {}

@Directive({
  selector: '[target]',
  providers: [TargetService],
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetDirective {
  public constructor(public readonly service: TargetService) {}
}

@Component({
  selector: 'target-lookup-order',
  template: '<span target></span><span target></span>',
  providers: [TargetService],
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetComponent {
  public constructor(public readonly service: TargetService) {}
}

describe('ng-mocks-get:lookup-order', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent).keep(TargetDirective),
  );

  it('keeps the local instance first while plural discovery includes descendants', () => {
    const fixture = MockRender(TargetComponent);
    const local = fixture.point.componentInstance.service;
    const directives = ngMocks.findInstances(TargetDirective);

    expect(ngMocks.get(fixture.point, TargetService)).toBe(local);
    expect(ngMocks.findInstance(fixture.point, TargetService)).toBe(
      local,
    );
    const instances = ngMocks.findInstances(
      fixture.point,
      TargetService,
    );
    expect(instances.length).toBe(3);
    expect(instances[0]).toBe(local);
    expect(instances[1]).toBe(directives[0].service);
    expect(instances[2]).toBe(directives[1].service);
  });
});
