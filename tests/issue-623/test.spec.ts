import {
  Component,
  Directive,
  Injectable,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRenderFactory, ngMocks } from 'ng-mocks';

let target = 0;

@Injectable()
class TargetService {
  public readonly name: string;

  public constructor() {
    target += 1;

    this.name = `target:${target}`;
  }
}

@Directive({
  providers: [TargetService],
  selector: '[directive]',
})
class TargetDirective {}

@Component({
  selector: 'target-623',
  template: '{{ service.name }}',
})
class TargetComponent {
  public constructor(public readonly service: TargetService) {}
}

@NgModule({
  declarations: [TargetComponent, TargetDirective],
  exports: [TargetComponent, TargetDirective],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/623
describe('issue-623', () => {
  const withoutDirective = MockRenderFactory(TargetComponent);
  const withDirective = MockRenderFactory(
    '<target-623 directive></target-623>',
  );

  describe('TestBed', () => {
    describe('without-provider', () => {
      ngMocks.faster();
      beforeAll(() =>
        TestBed.configureTestingModule({
          imports: [TargetModule],
        }),
      );
      beforeAll(() => withoutDirective.configureTestBed());
      beforeAll(() => withDirective.configureTestBed());

      it('fails without the directive', () => {
        expect(withoutDirective).toThrowError(
          /No provider for TargetService/,
        );
      });

      it('succeeds with the directive', () => {
        expect(withDirective).not.toThrow();

        target = 0;
        expect(ngMocks.formatText(withDirective())).toEqual(
          'target:1',
        );
        expect(ngMocks.formatText(withDirective())).toEqual(
          'target:2',
        );
        expect(ngMocks.formatText(withDirective())).toEqual(
          'target:3',
        );
      });
    });

    describe('with-provider', () => {
      ngMocks.faster();
      beforeAll(() =>
        TestBed.configureTestingModule({
          imports: [TargetModule],
          providers: [TargetService],
        }),
      );
      beforeAll(() => withoutDirective.configureTestBed());
      beforeAll(() => withDirective.configureTestBed());

      // a single instance is used
      it('fallbacks without the directive', () => {
        target = 0;
        expect(withoutDirective).not.toThrow();

        expect(ngMocks.formatText(withoutDirective())).toEqual(
          'target:1',
        );
        expect(ngMocks.formatText(withoutDirective())).toEqual(
          'target:1',
        );
        expect(ngMocks.formatText(withoutDirective())).toEqual(
          'target:1',
        );
      });

      // an instance is created on every render
      it('uses the directive', () => {
        target = 0;
        expect(withDirective).not.toThrow();

        expect(ngMocks.formatText(withDirective())).toEqual(
          'target:2',
        );
        expect(ngMocks.formatText(withDirective())).toEqual(
          'target:3',
        );
        expect(ngMocks.formatText(withDirective())).toEqual(
          'target:4',
        );
      });
    });
  });

  describe('MockBuilder', () => {
    describe('without-provider', () => {
      ngMocks.faster();
      beforeAll(() => MockBuilder(TargetComponent, TargetModule));
      beforeAll(() => withoutDirective.configureTestBed());
      beforeAll(() => withDirective.configureTestBed());

      it('fails without the directive', () => {
        expect(withoutDirective).toThrowError(
          /No provider for TargetService/,
        );
      });

      it('succeeds with the directive', () => {
        expect(withDirective).not.toThrow();

        // a mock service returns empty name
        expect(ngMocks.formatText(withDirective())).toEqual('');
        expect(ngMocks.formatText(withDirective())).toEqual('');
        expect(ngMocks.formatText(withDirective())).toEqual('');
      });
    });

    describe('w/ provider w/o export', () => {
      beforeEach(() =>
        MockBuilder(TargetComponent, TargetModule).mock(
          TargetService,
        ),
      );
      beforeEach(() => withoutDirective.configureTestBed());

      it('fails without export', () => {
        expect(withoutDirective).toThrowError(
          /No provider for TargetService/,
        );
      });
    });

    describe('w/ provider and w/ export', () => {
      beforeEach(() =>
        MockBuilder(TargetComponent, TargetModule).mock(
          TargetService,
          TargetService,
          { export: true },
        ),
      );
      beforeEach(() => withoutDirective.configureTestBed());

      it('uses the global provider', () => {
        expect(withoutDirective).not.toThrow();
      });
    });

    describe('w/ provider in params', () => {
      beforeEach(() =>
        MockBuilder(TargetComponent, [TargetModule, TargetService]),
      );
      beforeEach(() => withoutDirective.configureTestBed());

      it('uses the global provider', () => {
        expect(withoutDirective).not.toThrow();
      });
    });

    describe('w/ provider as dependency', () => {
      beforeEach(() =>
        MockBuilder(TargetComponent, [TargetModule]).mock(
          TargetService,
          TargetService,
          {
            dependency: true,
            export: true,
          },
        ),
      );
      beforeEach(() => withoutDirective.configureTestBed());

      it('fails with dependency flag', () => {
        expect(withoutDirective).toThrowError(
          /No provider for TargetService/,
        );
      });
    });
  });
});
