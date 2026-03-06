import {
  Component,
  Inject,
  InjectionToken,
  VERSION,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

import { mockReturnValue, createMock } from '../mock-helpers';

interface InjectedAbstraction {
  (): string;
  hello: () => number;
}

const TOKEN: InjectionToken<InjectedAbstraction> =
  new (InjectionToken as any)('InjectedFn', {
    factory: () => {
      const fn: any = createMock();
      fn.hello = createMock();

      return fn;
    },
    providedIn: 'root',
  });

@Component({
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '',
})
class TestWithoutDecoratorComponent {
  public constructor(
    @Inject(TOKEN)
    public token: InjectedAbstraction,
  ) {}
}

@Component({
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '',
})
class TestWithDecoratorComponent {
  public constructor(
    @Inject(TOKEN)
    public token: InjectedAbstraction,
  ) {}
}

ngMocks.defaultMock(
  TOKEN,
  () => mockReturnValue(createMock(), 'FOO') as any,
);

// @see https://github.com/help-me-mom/ng-mocks/issues/455
describe('issue-455:token', () => {
  if (Number.parseInt(VERSION.major, 10) <= 5) {
    it('a5', () => {
      // TODO pending('Need Angular > 5');
      expect(true).toBeTruthy();
    });

    return;
  }

  describe('without inject decorator', () => {
    describe('using TestBed', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          declarations: [TestWithoutDecoratorComponent],
        }),
      );

      it('should build properly but fails', () => {
        expect(() =>
          TestBed.createComponent(TestWithoutDecoratorComponent),
        ).not.toThrow();
      });
    });
  });

  describe('without inject decorator', () => {
    describe('using default mock', () => {
      beforeEach(() => MockBuilder(TestWithoutDecoratorComponent));

      it('should build properly but fails', () => {
        const fixture = MockRender(TestWithoutDecoratorComponent);
        expect(fixture.point.componentInstance.token()).toEqual(
          'FOO',
        );
        expect(
          fixture.point.componentInstance.token,
        ).toHaveBeenCalledTimes(1);
      });
    });

    describe('using explicit mock', () => {
      describe('without `precise` flag', () => {
        beforeEach(() =>
          MockBuilder(TestWithoutDecoratorComponent)
            .mock(TOKEN, mockReturnValue(createMock(), 'BAR') as any)
            .keep(NG_MOCKS_ROOT_PROVIDERS),
        );

        it('should build properly but fails', () => {
          const fixture = MockRender(TestWithoutDecoratorComponent);
          expect(fixture.point.componentInstance.token()).toEqual(
            'BAR',
          );
          expect(
            fixture.point.componentInstance.token,
          ).toHaveBeenCalledTimes(1);
        });
      });

      describe('with `precise` flag', () => {
        beforeEach(() =>
          MockBuilder(TestWithoutDecoratorComponent)
            .mock(
              TOKEN as any,
              mockReturnValue(createMock(), 'BAR') as any,
              { precise: true },
            )
            .keep(NG_MOCKS_ROOT_PROVIDERS),
        );

        it('should build properly and succeed', () => {
          const fixture = MockRender(TestWithoutDecoratorComponent);
          expect(fixture.point.componentInstance.token()).toEqual(
            'BAR',
          );
          expect(
            fixture.point.componentInstance.token,
          ).toHaveBeenCalledTimes(1);
        });
      });
    });
  });

  describe('with inject decorator', () => {
    describe('with provide', () => {
      beforeEach(() =>
        MockBuilder(TestWithDecoratorComponent).provide({
          provide: TOKEN,
          useFactory: () => mockReturnValue(createMock(), 'QUX'),
        }),
      );

      it('should build properly and succeed', () => {
        const fixture = MockRender(TestWithDecoratorComponent);
        expect(fixture.point.componentInstance.token()).toEqual(
          'QUX',
        );
        expect(
          fixture.point.componentInstance.token,
        ).toHaveBeenCalledTimes(1);
      });
    });
  });
});
