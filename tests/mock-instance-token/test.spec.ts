import {
  Inject,
  Injectable,
  InjectionToken,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockInstance } from 'ng-mocks';

const TOKEN = new InjectionToken<string>('TOKEN');

@Injectable()
class TargetService {
  public constructor(
    @Inject(TOKEN) protected readonly name: string,
  ) {}

  public echo(): string {
    return this.name;
  }
}

@NgModule({
  providers: [
    TargetService,
    {
      provide: TOKEN,
      useValue: 'target',
    },
  ],
})
class TargetModule {}

describe('mock-instance-token', () => {
  MockInstance.scope();
  beforeEach(() => MockBuilder(TargetService, TargetModule));

  it('provides tokens', () => {
    MockInstance(TOKEN, () => 'mock');

    const actual = TestBed.get(TargetService).echo();
    expect(actual).toEqual('mock');
  });
});
