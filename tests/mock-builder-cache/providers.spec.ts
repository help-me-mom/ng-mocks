import { Injectable, InjectionToken, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, ngMocks } from 'ng-mocks';

const FIRST = new InjectionToken<string>('FIRST');
const SECOND = new InjectionToken<string>('SECOND');
const TARGET = new InjectionToken<string | boolean>('TARGET');

@NgModule({})
class TargetModule {}

@Injectable()
class TargetService {
  public value = 'original';
}

describe('MockBuilder:cache providers', () => {
  afterEach(ngMocks.reset);

  it('uses changed dependencies with the same factory', () => {
    const useFactory = (value: string) => value;
    MockBuilder()
      .provide({ provide: FIRST, useValue: 'first' })
      .provide({ provide: SECOND, useValue: 'second' })
      .provide({ provide: TARGET, useFactory, deps: [FIRST] })
      .build();

    const module = MockBuilder()
      .provide({ provide: FIRST, useValue: 'first' })
      .provide({ provide: SECOND, useValue: 'second' })
      .provide({ provide: TARGET, useFactory, deps: [SECOND] })
      .build();
    TestBed.configureTestingModule(module);

    expect(ngMocks.get(TARGET)).toBe('second');
    expect(ngMocks.get(FIRST)).toBe('first');
    expect(ngMocks.get(SECOND)).toBe('second');
  });

  it('uses a changed token in ModuleWithProviders', () => {
    MockBuilder()
      .keep({
        ngModule: TargetModule,
        providers: [{ provide: FIRST, useValue: 'value' }],
      })
      .build();

    const module = MockBuilder()
      .keep({
        ngModule: TargetModule,
        providers: [{ provide: SECOND, useValue: 'value' }],
      })
      .build();
    TestBed.configureTestingModule(module);

    expect(ngMocks.get(SECOND)).toBe('value');
    expect(() => ngMocks.get(FIRST)).toThrow();
  });

  it('uses a changed precise flag with the same mock object', () => {
    const mock = { value: 'mock' };
    MockBuilder()
      .mock(TargetService, mock, { precise: false })
      .build();

    const module = MockBuilder()
      .mock(TargetService, mock, { precise: true })
      .build();
    TestBed.configureTestingModule(module);

    expect(ngMocks.get(TargetService)).toBe(mock);
    expect(mock.value).toBe('mock');
  });

  it('reuses equal falsy provider recipes', () => {
    const first = MockBuilder()
      .provide({ provide: TARGET, useValue: false })
      .build();
    const second = MockBuilder()
      .provide({ provide: TARGET, useValue: false })
      .build();
    TestBed.configureTestingModule(second);

    expect(second.providers![0]).toBe(first.providers![0]);
    expect(ngMocks.get(TARGET)).toBe(false);
  });
});
