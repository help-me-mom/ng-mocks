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
      try {
        if (anyTestBed.get) {
          anyTestBed.get(ENVIRONMENT_NAME);
        } else {
          anyTestBed.inject(ENVIRONMENT_NAME);
        }
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain('SHOW ME');
      }
    });

    it('throws the original error in ServiceA', () => {
      try {
        if (anyTestBed.get) {
          anyTestBed.get(ServiceA);
        } else {
          anyTestBed.inject(ServiceA);
        }
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain('SHOW ME');
      }
    });

    it('throws the original error in ServiceB', () => {
      try {
        if (anyTestBed.get) {
          anyTestBed.get(ServiceB);
        } else {
          anyTestBed.inject(ServiceB);
        }
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain('SHOW ME');
      }
    });

    it('throws the original error in ServiceC', () => {
      try {
        if (anyTestBed.get) {
          anyTestBed.get(ServiceC);
        } else {
          anyTestBed.inject(ServiceC);
        }
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `NullInjectorError: No provider for ${ServiceC.name}`,
        );
      }
    });
  });

  describe('ngMocks.findInstance', () => {
    it('throws the original error in ENVIRONMENT_NAME', () => {
      try {
        ngMocks.findInstance(ENVIRONMENT_NAME);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain('SHOW ME');
      }
    });

    it('throws the original error in ServiceA', () => {
      try {
        ngMocks.findInstance(ServiceA);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain('SHOW ME');
      }
    });

    it('throws the original error in ServiceB', () => {
      try {
        ngMocks.findInstance(ServiceB);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain('SHOW ME');
      }
    });

    it('throws the original error in ServiceC', () => {
      try {
        ngMocks.findInstance(ServiceC);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          'Cannot find an instance',
        );
      }
    });
  });

  describe('ngMocks.get', () => {
    it('throws the original error in ENVIRONMENT_NAME', () => {
      try {
        ngMocks.get(ENVIRONMENT_NAME);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain('SHOW ME');
      }
    });

    it('throws the original error in ServiceA', () => {
      try {
        ngMocks.get(ServiceA);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain('SHOW ME');
      }
    });

    it('throws the original error in ServiceB', () => {
      try {
        ngMocks.get(ServiceB);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain('SHOW ME');
      }
    });

    it('throws the original error in ServiceC', () => {
      try {
        ngMocks.get(ServiceC);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          'Cannot find an instance',
        );
      }
    });
  });
});
