import { Injectable, NgModule } from '@angular/core';
import { getTestBedInjection, MockBuilder } from 'ng-mocks';

@Injectable()
abstract class LoggerInterface {
  public abstract log(message: string): void;
}

@Injectable()
class Logger implements LoggerInterface {
  public lastMessage = '';

  public log(message: string): void {
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

  it('provides a mock copy with an implemented abstract method', () => {
    const actual = getTestBedInjection(LoggerInterface);
    expect(actual && actual.log).toBeDefined();
  });
});
