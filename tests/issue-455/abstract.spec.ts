import {
  Component,
  Inject,
  Injectable as InjectableSource,
  VERSION,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  MockBuilder,
  MockInstance,
  MockRender,
  ngMocks,
} from 'ng-mocks';

// Because of A5 we need to cast Injectable to any type.
// But because of A10+ we need to do it via a middle function.
function Injectable(...args: any[]): any {
  return InjectableSource(...args);
}

interface InjectedAbstraction {
  (): string;
  hello: () => number;
}

@Injectable({
  providedIn: 'root',
  useFactory: () => {
    const fn: InjectedAbstraction = jasmine.createSpy(
      'Base',
    ) as any as InjectedAbstraction;
    fn.hello = jasmine.createSpy('Inner');

    return fn;
  },
})
abstract class InjectedAbstraction {}

@Component({ template: '' })
export class TestWithoutDecoratorComponent {
  public constructor(
    public myInjectedAbstraction: InjectedAbstraction,
  ) {}
}

@Component({ template: '' })
export class TestWithDecoratorComponent {
  public constructor(
    @Inject(InjectedAbstraction)
    public myInjectedAbstraction: InjectedAbstraction,
  ) {}
}

ngMocks.defaultMock(InjectedAbstraction, () => {
  return jasmine
    .createSpy('InjectedAbstraction')
    .and.returnValue('FOO') as any as InjectedAbstraction;
});

describe('issue-455:abstract', () => {
  beforeEach(() => {
    if (parseInt(VERSION.major, 10) <= 5) {
      pending('Need Angular > 5');
    }
  });

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
        const spy = jasmine
          .createSpy('InjectedAbstraction')
          .and.returnValue('BAR');
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
            jasmine
              .createSpy('InjectedAbstraction')
              .and.returnValue('BAR'),
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
            jasmine
              .createSpy('InjectedAbstraction')
              .and.returnValue('QUX'),
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
