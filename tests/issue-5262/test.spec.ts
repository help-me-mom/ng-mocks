import { InjectionToken, NgModule, VERSION } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

const TOKEN = new InjectionToken('TOKEN');

@NgModule({
  providers: [
    {
      provide: TOKEN,
      useValue: (() => {
        const recursive: any = {
          index: 0,
        };
        // It fails without ivy on the compiler level.
        if (Number.parseInt(VERSION.major, 10) >= 13) {
          recursive.parent = recursive;
        }

        return recursive;
      })(),
    },
  ],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/5262
describe('issue-5262', () => {
  describe('mock', () => {
    beforeEach(() => MockBuilder(null, TargetModule));

    it('does not fail on recursion', () => {
      const token = MockRender(TOKEN);
      expect(token).toBeDefined();
    });
  });

  describe('keep', () => {
    beforeEach(() => MockBuilder(TOKEN, TargetModule));

    it('does not fail on recursion', () => {
      const token = MockRender(TOKEN);
      expect(token).toBeDefined();
    });
  });
});
