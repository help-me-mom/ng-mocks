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
        expect(() => ngMocks.get(TOKEN)).toThrowError(
          /Cannot find an instance/,
        );
      });
    });
  });
});
