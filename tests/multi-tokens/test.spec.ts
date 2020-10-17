import { Inject, Injectable, InjectionToken, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { getTestBedInjection, MockBuilder } from 'ng-mocks';

const TARGET_TOKEN = new InjectionToken('MY_TOKEN_SINGLE');

@Injectable()
class TargetService {
  public readonly tokens: string[] = [];

  constructor(@Inject(TARGET_TOKEN) tokens: string[]) {
    this.tokens = tokens;
  }
}

@NgModule({
  providers: [
    TargetService,
    {
      multi: true,
      provide: TARGET_TOKEN,
      useValue: '1',
    },
    {
      multi: true,
      provide: TARGET_TOKEN,
      useFactory: () => '2',
    },
  ],
})
class TargetModule {}

@NgModule({
  providers: [
    {
      multi: true,
      provide: TARGET_TOKEN,
      useValue: '3',
    },
    {
      multi: true,
      provide: TARGET_TOKEN,
      useFactory: () => '4',
    },
  ],
})
class TokenModule {}

describe('multi-tokens:real', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TargetModule, TokenModule],
      providers: [
        {
          multi: true,
          provide: TARGET_TOKEN,
          useValue: '5',
        },
        {
          multi: true,
          provide: TARGET_TOKEN,
          useFactory: () => '6',
        },
      ],
    }).compileComponents()
  );

  it('returns all provided tokens', () => {
    const service = getTestBedInjection(TargetService);
    if (service) {
      expect(service.tokens).toEqual(['1', '2', '3', '4', '5', '6']);
    } else {
      fail('Cannot find TargetService');
    }
  });
});

describe('multi-tokens:builder', () => {
  beforeEach(() =>
    MockBuilder()
      .keep(TargetModule)
      .keep(TokenModule)
      .provide({
        multi: true,
        provide: TARGET_TOKEN,
        useValue: '5',
      })
      .provide({
        multi: true,
        provide: TARGET_TOKEN,
        useFactory: () => '6',
      })
  );

  it('returns all provided tokens', () => {
    const service = getTestBedInjection(TargetService);
    if (service) {
      expect(service.tokens).toEqual(['1', '2', '3', '4', '5', '6']);
    } else {
      fail('Cannot find TargetService');
    }
  });
});

describe('multi-tokens:builder:mock', () => {
  beforeEach(() =>
    MockBuilder()
      .keep(TargetModule)
      .mock(TokenModule)
      .provide({
        multi: true,
        provide: TARGET_TOKEN,
        useValue: '5',
      })
      .provide({
        multi: true,
        provide: TARGET_TOKEN,
        useFactory: () => '6',
      })
  );

  it('returns all provided tokens', () => {
    const service = getTestBedInjection(TargetService);
    if (service) {
      expect(service.tokens).toEqual(['1', '2', '5', '6']);
    } else {
      fail('Cannot find TargetService');
    }
  });
});
