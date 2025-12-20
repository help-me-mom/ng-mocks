import { InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ngMocks } from 'ng-mocks';

const TOKEN = new InjectionToken('TOKEN');

describe('ngMocks.faster', () => {
  describe('no customizations', () => {
    ngMocks.faster();
    ngMocks.throwOnConsole('warn');

    it('does nothing on reset', () => {
      expect(() => {
        TestBed.resetTestingModule();
      }).not.toThrow();
    });
  });

  describe('with customizations', () => {
    beforeAll(() =>
      TestBed.configureTestingModule({
        providers: [
          {
            provide: TOKEN,
            useValue: true,
          },
        ],
      }),
    );

    describe('reset block', () => {
      ngMocks.faster();

      it('works in clear reset', () => {
        try {
          ngMocks.get(TOKEN);
          fail('an error expected');
        } catch (error) {
          expect((error as Error).message).toContain(
            'Cannot find an instance via ngMocks.get(TOKEN)',
          );
        }
      });
    });
  });
});
