import { Injectable, NgModule } from '@angular/core';

import { MockBuilder, ngMocks } from 'ng-mocks';

@Injectable()
class TargetService {
  echo() {
    return this.constructor.name;
  }
}

@Injectable()
class FakeService {
  echo() {
    return this.constructor.name;
  }
}

@NgModule({
  providers: [TargetService],
})
class TargetModule {}

describe('issue-2311', () => {
  beforeEach(() => MockBuilder(TargetService, TargetModule));

  it('finds instance', () => {
    const instance = ngMocks.findInstance(TargetService);
    expect(instance.echo()).toEqual('TargetService');
  });

  it('finds instances', () => {
    const instances = ngMocks.findInstances(TargetService);
    const [instance] = instances;
    expect(instances.length).toEqual(1);
    expect(instance.echo()).toEqual('TargetService');
  });

  it('fails to find instance', () => {
    const instance = ngMocks.findInstance(FakeService, undefined);
    expect(instance).toBeUndefined();
  });

  it('fails to find instances', () => {
    const instances = ngMocks.findInstances(FakeService);
    const [instance] = instances;
    expect(instances.length).toEqual(0);
    expect(instance).toBeUndefined();
  });
});
