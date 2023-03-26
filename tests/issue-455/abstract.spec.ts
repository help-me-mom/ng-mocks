import {
  Component,
  Inject,
  Injectable,
  VERSION,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockInstance,
  MockRender,
  ngMocks,
} from 'ng-mocks';

interface InjectedAbstraction {
  (): string;
  hello: () => number;
}

// @TODO remove with A5 support
const injectableArgs = [
  {
    providedIn: 'root',
    useFactory: () => {
      const fn: InjectedAbstraction = (typeof jest === 'undefined'
        ? jasmine.createSpy()
        : jest.fn()) as any as InjectedAbstraction;
      fn.hello =
        typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();

      return fn;
    },
  } as never,
];

@Injectable(...injectableArgs)
abstract class InjectedAbstraction {}

@Component({ template: '' })
class TestWithoutDecoratorComponent {
  public constructor(
    public myInjectedAbstraction: InjectedAbstraction,
  ) {}
}

@Component({ template: '' })
class TestWithDecoratorComponent {
  public constructor(
    @Inject(InjectedAbstraction)
    public myInjectedAbstraction: InjectedAbstraction,
  ) {}
}

ngMocks.defaultMock(InjectedAbstraction, () => {
  return (typeof jest === 'undefined'
    ? jasmine.createSpy().and.returnValue('FOO')
    : jest.fn().mockReturnValue('FOO')) as any as InjectedAbstraction;
});

// @see https://github.com/help-me-mom/ng-mocks/issues/455
describe('issue-455:abstract', () => {
  if (Number.parseInt(VERSION.major, 10) <= 5) {
    it('a5', () => {
      // pending('Need Angular > 5');
      expect(true).toBeTruthy();
    });

    return;
  }

  describe('without inject decorator', () => {
    describe('using TestBed', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          declarations: [TestWithoutDecoratorComponent],
        }).compileComponents(),
      );

      it('should build properly but fails', () => {
        expect(() =>
          TestBed.createComponent(
            TestWithoutDecoratorComponent,
          ).detectChanges(),
        ).not.toThrow();
      });
    });
  });

  describe('without inject decorator', () => {
    describe('using default mock', () => {
      beforeEach(() => MockBuilder(TestWithoutDecoratorComponent));

      it('should build properly but fails', () => {
        const fixture = MockRender(TestWithoutDecoratorComponent);
        expect(
          fixture.point.componentInstance.myInjectedAbstraction(),
        ).toEqual('FOO');
        expect(
          fixture.point.componentInstance.myInjectedAbstraction,
        ).toHaveBeenCalledTimes(1);
      });
    });

    describe('using explicit mock', () => {
      describe('without `precise` flag', () => {
        const spy =
          typeof jest === 'undefined'
            ? jasmine
                .createSpy('InjectedAbstraction')
                .and.returnValue('BAR')
            : jest.fn().mockReturnValue('BAR');
        beforeEach(() =>
          MockBuilder(TestWithoutDecoratorComponent).mock(
            InjectedAbstraction,
            spy as any,
          ),
        );

        // the spy shouldn't be affected.
        beforeEach(() =>
          MockInstance(InjectedAbstraction, 'test' as any, true),
        );
        afterEach(() => MockInstance(InjectedAbstraction));

        it('should build properly but fails', () => {
          const fixture = MockRender(TestWithoutDecoratorComponent);
          expect(
            fixture.point.componentInstance.myInjectedAbstraction(),
          ).toEqual('BAR');
          expect(
            fixture.point.componentInstance.myInjectedAbstraction,
          ).toHaveBeenCalledTimes(1);
          expect(spy).toHaveBeenCalledTimes(1);

          // checking the original spy wasn't affected
          expect(
            (
              fixture.point.componentInstance
                .myInjectedAbstraction as any
            ).test,
          ).toEqual(true);
          expect((spy as any).test).toEqual(undefined);
        });
      });

      describe('with `precise` flag', () => {
        beforeEach(() =>
          MockBuilder(TestWithoutDecoratorComponent).mock(
            InjectedAbstraction,
            typeof jest === 'undefined'
              ? jasmine
                  .createSpy('InjectedAbstraction')
                  .and.returnValue('BAR')
              : jest.fn().mockReturnValue('BAR'),
            { precise: true },
          ),
        );

        it('should build properly and succeed', () => {
          const fixture = MockRender(TestWithoutDecoratorComponent);
          expect(
            fixture.point.componentInstance.myInjectedAbstraction(),
          ).toEqual('BAR');
          expect(
            fixture.point.componentInstance.myInjectedAbstraction,
          ).toHaveBeenCalledTimes(1);
        });
      });
    });
  });

  describe('with inject decorator', () => {
    describe('with provide', () => {
      beforeEach(() =>
        MockBuilder(TestWithDecoratorComponent).provide({
          provide: InjectedAbstraction,
          useFactory: () =>
            typeof jest === 'undefined'
              ? jasmine
                  .createSpy('InjectedAbstraction')
                  .and.returnValue('QUX')
              : jest.fn().mockReturnValue('QUX'),
        }),
      );

      it('should build properly and succeed', () => {
        const fixture = MockRender(TestWithDecoratorComponent);
        expect(
          fixture.point.componentInstance.myInjectedAbstraction(),
        ).toEqual('QUX');
        expect(
          fixture.point.componentInstance.myInjectedAbstraction,
        ).toHaveBeenCalledTimes(1);
      });
    });
  });
});
