import {
  Component,
  Directive,
  Injectable,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable()
class TargetService {
  echo() {
    return `TargetService`;
  }
}

@Directive({
  selector: 'target-2646',
})
class TargetDirective {
  echo() {
    return `TargetDirective`;
  }
}

@Component({
  selector: 'target-2646',
  template: '{{ echo() | target }}',
})
class TargetComponent {
  echo() {
    return `TargetComponent`;
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/2646
// MockBuilder should build a module correctly based on all providers,
// even if declarations derive from services
describe('issue-2646', () => {
  describe('directive', () => {
    @Directive({
      selector: 'target-2646',
    })
    class ServiceToDirective extends TargetService {
      echo() {
        return `ServiceToDirective`;
      }
    }

    describe('real', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          declarations: [ServiceToDirective],
          providers: [ServiceToDirective],
        }).compileComponents(),
      );

      it('covers behavior', () => {
        const fixture = MockRender(ServiceToDirective);
        expect(fixture.point.componentInstance.constructor).toBe(
          ServiceToDirective,
        );

        expect(() =>
          fixture.debugElement.injector.get(ServiceToDirective),
        ).not.toThrow();
        expect(() =>
          fixture.debugElement.injector.get(TargetService),
        ).toThrowError(/No provider/);
      });
    });

    describe('mock', () => {
      beforeEach(() => MockBuilder().mock(ServiceToDirective));

      it('covers behavior', () => {
        const fixture = MockRender(ServiceToDirective);
        expect(
          isMockOf(
            fixture.point.componentInstance,
            ServiceToDirective,
          ),
        ).toEqual(true);

        expect(() =>
          fixture.debugElement.injector.get(ServiceToDirective),
        ).not.toThrow();
        expect(() =>
          fixture.debugElement.injector.get(TargetService),
        ).toThrowError(/No provider/);
      });
    });
  });

  describe('component', () => {
    @Component({
      selector: 'target-2646',
      template: 'target',
    })
    class ServiceToComponent extends TargetService {
      echo() {
        return `ServiceToComponent`;
      }
    }

    describe('real', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          declarations: [ServiceToComponent],
          providers: [ServiceToComponent],
        }).compileComponents(),
      );

      it('covers behavior', () => {
        const fixture = MockRender(ServiceToComponent);
        expect(fixture.point.componentInstance.constructor).toBe(
          ServiceToComponent,
        );

        expect(() =>
          fixture.debugElement.injector.get(ServiceToComponent),
        ).not.toThrow();
        expect(() =>
          fixture.debugElement.injector.get(TargetService),
        ).toThrowError(/No provider/);
      });
    });

    describe('mock', () => {
      beforeEach(() => MockBuilder().mock(ServiceToComponent));

      it('covers behavior', () => {
        const fixture = MockRender(ServiceToComponent);
        expect(
          isMockOf(
            fixture.point.componentInstance,
            ServiceToComponent,
          ),
        ).toEqual(true);

        expect(() =>
          fixture.debugElement.injector.get(ServiceToComponent),
        ).not.toThrow();
        expect(() =>
          fixture.debugElement.injector.get(TargetService),
        ).toThrowError(/No provider/);
      });
    });
  });

  describe('pipe', () => {
    @Pipe({
      name: 'target',
    })
    class PipeFromService
      extends TargetService
      implements PipeTransform
    {
      transform(): string {
        return 'PipeFromService';
      }
    }

    describe('real', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          declarations: [PipeFromService, TargetComponent],
          providers: [PipeFromService],
        }).compileComponents(),
      );

      it('covers behavior', () => {
        const fixture = MockRender(TargetComponent);
        expect(fixture.point.componentInstance.constructor).toBe(
          TargetComponent,
        );
        expect(ngMocks.formatText(fixture)).toEqual(
          'PipeFromService',
        );

        expect(() =>
          fixture.debugElement.injector.get(PipeFromService),
        ).not.toThrow();
        expect(() =>
          fixture.debugElement.injector.get(TargetService),
        ).toThrowError(/No provider/);
      });
    });

    describe('mock', () => {
      beforeEach(() =>
        MockBuilder(TargetComponent).mock(PipeFromService),
      );

      it('covers behavior', () => {
        const fixture = MockRender(TargetComponent);
        expect(fixture.point.componentInstance.constructor).toBe(
          TargetComponent,
        );
        expect(ngMocks.formatText(fixture)).toEqual('');

        expect(() =>
          fixture.debugElement.injector.get(PipeFromService),
        ).not.toThrow();
        expect(() =>
          fixture.debugElement.injector.get(TargetService),
        ).toThrowError(/No provider/);
      });
    });
  });

  describe('module', () => {
    @NgModule({
      declarations: [TargetDirective],
      exports: [TargetDirective],
    })
    class ModuleFromService extends TargetService {
      echo() {
        return 'ModuleFromService';
      }
    }

    describe('real', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          imports: [ModuleFromService],
          providers: [ModuleFromService],
        }).compileComponents(),
      );

      it('covers behavior', () => {
        const fixture = MockRender(TargetDirective);
        expect(fixture.point.componentInstance.constructor).toBe(
          TargetDirective,
        );

        expect(() =>
          fixture.debugElement.injector.get(ModuleFromService),
        ).not.toThrow();
        expect(() =>
          fixture.debugElement.injector.get(TargetService),
        ).toThrowError(/No provider/);
      });
    });

    describe('mock', () => {
      beforeEach(() => MockBuilder().mock(ModuleFromService));

      it('covers behavior', () => {
        const fixture = MockRender(TargetDirective);
        expect(
          isMockOf(fixture.point.componentInstance, TargetDirective),
        ).toEqual(true);

        expect(() =>
          fixture.debugElement.injector.get(ModuleFromService),
        ).not.toThrow();
        expect(() =>
          fixture.debugElement.injector.get(TargetService),
        ).toThrowError(/No provider/);
      });
    });
  });
});
