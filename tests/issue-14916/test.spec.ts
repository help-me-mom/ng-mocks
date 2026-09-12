import { Injectable, InjectionToken, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockProvider,
  MockService,
  ngMocks,
} from 'ng-mocks';

@Injectable()
class TargetService {
  public readonly info = {
    get value(): string {
      throw new Error('real getter');
    },
  };

  public constructor() {
    throw new Error('real constructor');
  }
}

const TOKEN = new InjectionToken<{ value: string }>('TOKEN');

@NgModule({
  providers: [
    {
      provide: TOKEN,
      useValue: {
        get value(): string {
          throw new Error('real provider getter');
        },
      },
    },
  ],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14916
describe('issue-14916', () => {
  beforeEach(() =>
    ngMocks.autoSpy(
      typeof jest === 'undefined'
        ? 'jasmine'
        : typeof (window as any).vi === 'undefined'
          ? 'jest'
          : 'vitest',
    ),
  );

  afterEach(() => ngMocks.autoSpy('reset'));

  it('mocks own accessors without reading or writing the original object', () => {
    let reads = 0;
    let writes = 0;
    const shape = {
      get value(): string {
        reads += 1;

        return 'real';
      },
      set value(value: string) {
        writes += 1;
      },
      nested: { request: () => 'real' },
      count: 1,
    };

    // Reading an own property to discover its shape runs real accessor code.
    const mock = MockService(shape);
    expect(reads).toEqual(0);
    expect(mock.value).toBeUndefined();
    mock.value = 'mock';
    expect(mock.value).toEqual('mock');
    expect(reads).toEqual(0);
    expect(writes).toEqual(0);
    expect(mock.count).toBeUndefined();
    expect(mock.nested.request()).toBeUndefined();
    expect(mock.nested.request).toHaveBeenCalled();

    ngMocks.stubMember(mock, 'value', () => 'stubbed', 'get');
    expect(mock.value).toEqual('stubbed');
    expect(reads).toEqual(0);
  });

  it('accepts an explicit accessor shape in a MockProvider override', () => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(TargetService, {
          info: MockService({
            get value(): string {
              throw new Error('real override getter');
            },
          }),
        }),
      ],
    });

    const service = ngMocks.get(TargetService);
    expect(service.info.value).toBeUndefined();
    ngMocks.stubMember(service.info, 'value', () => 'stubbed', 'get');
    expect(service.info.value).toEqual('stubbed');
  });

  it('mocks own accessors in useValue providers', async () => {
    await MockBuilder(null, TargetModule);

    const value = ngMocks.get(TOKEN);
    expect(value.value).toBeUndefined();
    value.value = 'mock';
    expect(value.value).toEqual('mock');
  });
});
