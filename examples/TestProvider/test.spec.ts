import { Injectable } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

// A simple service, might have contained more logic,
// but it is redundant for the test demonstration.
@Injectable()
class TargetService {
  public readonly value = true;

  public echo(): boolean {
    return this.value;
  }
}

describe('TestProviderCommon', () => {
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetService));

  it('returns value on echo', () => {
    const service = MockRender(TargetService).point.componentInstance;

    expect(service.echo()).toEqual(service.value);
  });
});
