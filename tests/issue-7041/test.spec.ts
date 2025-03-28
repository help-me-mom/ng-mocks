import {
  Inject,
  Injectable,
  InjectionToken,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ngMocks } from 'ng-mocks';

const ENVIRONMENT_NAME = new InjectionToken('ENVIRONMENT_NAME');

@Injectable()
class ServiceA {
  constructor(
    @Inject(ENVIRONMENT_NAME) private readonly envName: string,
  ) {}

  public getCode(): string {
    return this.envName;
  }
}

@Injectable()
class ServiceB {
  constructor(private readonly serviceA: ServiceA) {}

  public getCode(): string {
    return this.serviceA.getCode();
  }
}

@Injectable()
class ServiceC {
  constructor(private readonly serviceA: ServiceA) {}

  public getCode(): string {
    return this.serviceA.getCode();
  }
}

@NgModule({
  providers: [
    {
      provide: ENVIRONMENT_NAME,
      useFactory: () => {
        throw new Error('SHOW ME');
      },
    },
    ServiceA,
    ServiceB,
  ],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/7041
describe('issue-7041', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TargetModule],
    }).compileComponents(),
  );

  describe('TestBed', () => {
    const anyTestBed: any = TestBed;
    it('throws the original error in ENVIRONMENT_NAME', () => {
      expect(() =>
        anyTestBed.get
          ? anyTestBed.get(ENVIRONMENT_NAME)
          : anyTestBed.inject(ENVIRONMENT_NAME),
      ).toThrowError('SHOW ME');
    });

    it('throws the original error in ServiceA', () => {
      expect(() =>
        anyTestBed.get
          ? anyTestBed.get(ServiceA)
          : anyTestBed.inject(ServiceA),
      ).toThrowError('SHOW ME');
    });

    it('throws the original error in ServiceB', () => {
      expect(() =>
        anyTestBed.get
          ? anyTestBed.get(ServiceB)
          : anyTestBed.inject(ServiceB),
      ).toThrowError('SHOW ME');
    });

    it('throws the original error in ServiceC', () => {
      expect(() =>
        anyTestBed.get
          ? anyTestBed.get(ServiceC)
          : anyTestBed.inject(ServiceC),
      ).toThrowError(
        new RegExp(
          `NullInjectorError: No provider for ${ServiceC.name}`,
        ),
      );
    });
  });

  describe('ngMocks.findInstance', () => {
    it('throws the original error in ENVIRONMENT_NAME', () => {
      expect(() =>
        ngMocks.findInstance(ENVIRONMENT_NAME),
      ).toThrowError('SHOW ME');
    });

    it('throws the original error in ServiceA', () => {
      expect(() => ngMocks.findInstance(ServiceA)).toThrowError(
        'SHOW ME',
      );
    });

    it('throws the original error in ServiceB', () => {
      expect(() => ngMocks.findInstance(ServiceB)).toThrowError(
        'SHOW ME',
      );
    });

    it('throws the original error in ServiceC', () => {
      expect(() => ngMocks.findInstance(ServiceC)).toThrowError(
        /Cannot find an instance/,
      );
    });
  });

  describe('ngMocks.get', () => {
    it('throws the original error in ENVIRONMENT_NAME', () => {
      expect(() => ngMocks.get(ENVIRONMENT_NAME)).toThrowError(
        'SHOW ME',
      );
    });

    it('throws the original error in ServiceA', () => {
      expect(() => ngMocks.get(ServiceA)).toThrowError('SHOW ME');
    });

    it('throws the original error in ServiceB', () => {
      expect(() => ngMocks.get(ServiceB)).toThrowError('SHOW ME');
    });

    it('throws the original error in ServiceC', () => {
      expect(() => ngMocks.get(ServiceC)).toThrowError(
        /Cannot find an instance/,
      );
    });
  });
});
