import {
  Injectable,
  ɵcompileNgModuleDefs as compileNgModuleDefs,
} from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';

import { MockProvider } from 'ng-mocks';

@Injectable()
class TargetService {}

class TestModule {}

compileNgModuleDefs(TestModule as never, {
  providers: [],
});

// @see https://github.com/help-me-mom/ng-mocks/issues/12725
describe('issue-12725', () => {
  it('uses MockProvider with a compiled platform module', () => {
    expect(() => {
      const testBed = getTestBed() as unknown as {
        ngModule: unknown;
      };
      const ngModule = testBed.ngModule;
      testBed.ngModule = [ngModule, TestModule];

      try {
        TestBed.configureTestingModule({
          providers: [MockProvider(TargetService)],
        });
      } finally {
        testBed.ngModule = ngModule;
      }
    }).not.toThrow();
  });
});
