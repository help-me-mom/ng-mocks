import { Injectable, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder } from 'ng-mocks';

@Injectable()
abstract class LoggerInterface {
  abstract log(message: string): void;
}

@Injectable()
class Logger implements LoggerInterface {
  public lastMessage = '';

  log(message: string): void {
    this.lastMessage = message;
  }
}

@NgModule({
  providers: [
    {
      provide: LoggerInterface,
      useClass: Logger,
    },
  ],
})
class TargetModule {}

describe('abstract-methods-provider', () => {
  beforeEach(() => MockBuilder().mock(TargetModule));

  it('provides a mocked copy with an implemented abstract method', () => {
    const actual: LoggerInterface = TestBed.get(LoggerInterface);

    expect(actual.log).toBeDefined();
  });
});
