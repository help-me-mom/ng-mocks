import { Injectable, NgModule } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

interface TargetService {
  readonly: boolean;
}

@Injectable()
class TargetService {
  public readonly name = 'target';
  public norm = 'normal';

  public constructor() {
    const desc = {
      configurable: false,
      value: false,
    };
    Object.freeze(desc);
    Object.defineProperty(this, 'readonly', desc);
  }

  public echo(): string {
    return this.name;
  }
}

@NgModule({
  providers: [TargetService],
})
class TargetModule {}

describe('ng-mocks-stub', () => {
  beforeEach(() => MockBuilder(TargetModule));

  it('respects configurable=false properties and does not fail', () => {
    const service = MockRender(TargetService).point.componentInstance;

    expect(service.readonly).toEqual(false);
    ngMocks.stub(service, { readonly: true });
    expect(service.readonly).toEqual(false);
  });

  it('switches configurable=false in overrides', () => {
    const service = MockRender(TargetService).point.componentInstance;
    const actual: Partial<TargetService> = {};

    expect(actual.readonly).toEqual(undefined);
    ngMocks.stub(actual, service);
    expect(actual.readonly).toEqual(false);
    actual.readonly = true;
    expect(actual.readonly).toEqual(true);
  });
});
