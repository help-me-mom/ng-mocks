import { Component, Injectable, NgModule } from '@angular/core';

import { MockBuilder } from 'ng-mocks';

@Injectable()
class RootService {}

@Injectable()
class TargetService {
  someAttribute = '';
  constructor(public readonly root: RootService) {
    this.someAttribute = 'some value';
  }
}

@Component({
  selector: 'target-10020-errors',
  template: 'target',
})
class TargetComponent {
  constructor(
    public readonly target: TargetService,
    public readonly root: RootService,
  ) {}
}

@NgModule({
  declarations: [TargetComponent],
  providers: [TargetService],
})
class TargetModule {}

class MockProviderClass {
  someAttribute = 'mock class value';
}

const mockProviderValue = {
  provide: TargetService,
  useValue: { someAttribute: 'mock value' },
};
const mockProviderClass = {
  provide: TargetService,
  useClass: MockProviderClass,
};
const expectedMessagePattern =
  /A provider object has been incorrectly passed to the MockerBuilder (keep|mock)\(\) method\. Did you mean to use MockerBuilder\.provide\(\)\?/;

describe('issue-10020:errors', () => {
  describe('strict', () => {
    describe('.keep', () => {
      it('throws on using provider value mock with keep', () => {
        const builder = MockBuilder(
          TargetComponent,
          TargetModule,
        ).keep(mockProviderValue);
        expect(() => builder.build()).toThrowError(
          expectedMessagePattern,
        );
      });

      it('throws on using provider class mock with keep', () => {
        const builder = MockBuilder(
          TargetComponent,
          TargetModule,
        ).keep(mockProviderClass);
        expect(() => builder.build()).toThrowError(
          expectedMessagePattern,
        );
      });

      it('throws on using provider value mock with mock', () => {
        const builder = MockBuilder(
          TargetComponent,
          TargetModule,
        ).mock(mockProviderValue);
        expect(() => builder.build()).toThrowError(
          expectedMessagePattern,
        );
      });

      it('throws on using provider class mock with mock', () => {
        const builder = MockBuilder(
          TargetComponent,
          TargetModule,
        ).mock(mockProviderClass);
        expect(() => builder.build()).toThrowError(
          expectedMessagePattern,
        );
      });

      it('succeeds on using provider value mock with provide', () => {
        const builder = MockBuilder(
          TargetComponent,
          TargetModule,
        ).provide(mockProviderValue);
        expect(() => builder.build()).not.toThrow();
      });

      it('succeeds on using provider class mock with provide', () => {
        const builder = MockBuilder(
          TargetComponent,
          TargetModule,
        ).provide(mockProviderClass);
        expect(() => builder.build()).not.toThrow();
      });
    });
  });
});
