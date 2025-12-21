import { Component, Injectable, NgModule } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable()
class RootService {}

@Injectable()
class ComponentService {}

@Component({
  selector: 'target-ng-mocks-get',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'target',
  providers: [ComponentService],
})
class TargetComponent {}

@NgModule({
  declarations: [TargetComponent],
  providers: [RootService],
})
class TargetModule {}

describe('ng-mocks-get', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('gets services', () => {
    MockRender(TargetComponent);
    expect(() => ngMocks.get(RootService)).not.toThrow();
    try {
      ngMocks.get(ComponentService);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        `Cannot find an instance via ngMocks.get(${ComponentService.name})`,
      );
    }
  });
});
