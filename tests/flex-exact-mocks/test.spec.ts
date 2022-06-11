import { Injectable, InjectionToken } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { MockBuilder, ngMocks } from 'ng-mocks';

const TOKEN = new InjectionToken<any>('TOKEN');

@Injectable()
class TargetService {
  public readonly o1$: Observable<void> = new Subject<void>();

  public echo(): Observable<void> {
    return this.o1$;
  }
}

describe('flex-exact-mocks:no-precise', () => {
  const EMPTY = new Subject<any>();
  EMPTY.complete();

  const mockService = { o1$: EMPTY };
  const mockToken = {};
  const mockStr = {};

  beforeEach(() => {
    return MockBuilder()
      .mock(TargetService, mockService)
      .mock(TOKEN, mockToken)
      .mock('token', mockStr);
  });

  it('extends a mock service', () => {
    // By default, a service is extended with its mock copy.
    const service = ngMocks.findInstance(TargetService);
    expect(service.o1$).toBeDefined();
    expect(service.o1$).toBe(mockService.o1$);
    expect(service.echo).toBeDefined();
    expect(service.echo()).toBeUndefined();

    // Tokens should stay as they are.
    const token: typeof mockToken = ngMocks.findInstance(TOKEN);
    expect(token).toBe(mockToken);

    // strings should stay as they are.
    const str: typeof mockStr = ngMocks.findInstance('token');
    expect(str).toBe(mockStr);
  });
});

describe('flex-exact-mocks:precise', () => {
  const EMPTY = new Subject<any>();
  EMPTY.complete();

  const mock = { o1$: EMPTY };
  const mockToken = {};
  const mockStr = {};

  beforeEach(() =>
    MockBuilder()
      .mock(TargetService, mock, { precise: true })
      .mock(TOKEN, mockToken)
      .mock('token', mockStr),
  );

  it('extends a mock service', () => {
    // The instance should be the passed mock copy due to the flag.
    const service = ngMocks.findInstance(TargetService);
    expect(service).toBe(mock as any);

    // The flag does not affect tokens.
    const token: typeof mockToken = ngMocks.findInstance(TOKEN);
    expect(token).toBe(mockToken);

    // The flag does not affect strings.
    const str: typeof mockStr = ngMocks.findInstance('token');
    expect(str).toBe(mockStr);
  });
});
