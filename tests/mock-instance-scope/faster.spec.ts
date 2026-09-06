import { Injectable } from '@angular/core';

import {
  MockBuilder,
  MockInstance,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Injectable()
class TargetService {
  public echo(): string {
    return 'real';
  }
}

describe('mock-instance-scope:faster', () => {
  ngMocks.faster();
  MockInstance.scope();

  let service: TargetService;
  beforeAll(() => MockBuilder().mock(TargetService));
  beforeAll(() => {
    service = MockRender(TargetService).point.componentInstance;
  });

  it('updates a service preserved by faster', () => {
    MockInstance(TargetService, 'echo', () => 'first');

    expect(ngMocks.findInstance(TargetService)).toBe(service);
    expect(service.echo()).toEqual('first');
  });

  it('still tracks the preserved service after a customization scope ends', () => {
    MockInstance(TargetService, 'echo', () => 'second');

    expect(ngMocks.findInstance(TargetService)).toBe(service);
    expect(service.echo()).toEqual('second');
  });
});
