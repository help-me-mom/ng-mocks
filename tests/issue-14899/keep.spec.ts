import {
  Component,
  inject,
  Injectable,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable({ providedIn: 'root' })
class TargetDependency {
  public static constructed = 0;

  public constructor() {
    TargetDependency.constructed += 1;
  }

  public echo(): string {
    return 'real';
  }
}

@Component({
  selector: 'keep-14899',
  standalone: true,
  template: '{{ constructorValue }}:{{ fieldValue }}:{{ bodyValue }}',
})
class TargetComponent {
  public readonly fieldDependency = inject(TargetDependency);
  public readonly fieldValue = this.fieldDependency.echo();
  public readonly bodyDependency: TargetDependency;
  public readonly bodyValue: string;
  public readonly constructorValue: string;

  public constructor(
    public readonly constructorDependency: TargetDependency,
  ) {
    this.constructorValue = constructorDependency.echo();
    this.bodyDependency = inject(TargetDependency);
    this.bodyValue = this.bodyDependency.echo();
  }
}

@Injectable({ providedIn: 'root' })
class TargetService {
  public readonly fieldDependency = inject(TargetDependency);
  public readonly fieldValue = this.fieldDependency.echo();
  public readonly bodyDependency: TargetDependency;
  public readonly bodyValue: string;

  public constructor() {
    this.bodyDependency = inject(TargetDependency);
    this.bodyValue = this.bodyDependency.echo();
  }
}

@NgModule({
  exports: [TargetComponent],
  imports: [TargetComponent],
})
class ChildModule {}

@NgModule({
  providers: [TargetService],
})
class ServiceModule {}

@Component({
  selector: 'keep-host-14899',
  standalone: false,
  template: '<keep-14899></keep-14899>',
})
class HostComponent {}

@NgModule({
  declarations: [HostComponent],
  imports: [ChildModule],
})
class HostModule {}

// Two-argument builders can retain a root dependency without adding a provider.
// Its explicit keep choice must survive until the runtime injection window.
// @see https://github.com/help-me-mom/ng-mocks/issues/14899
describe('issue-14899:keep', () => {
  beforeEach(() => {
    TargetDependency.constructed = 0;
  });
  afterEach(() => ngMocks.autoSpy('reset'));

  describe('default mode', () => {
    beforeEach(() => ngMocks.autoSpy('default'));

    describe('explicitly kept standalone child', () => {
      beforeEach(() =>
        MockBuilder(HostComponent, HostModule)
          .keep(TargetComponent)
          .keep(TargetDependency),
      );

      it('preserves the explicit keep for constructor and inject dependencies', () => {
        const fixture = MockRender(HostComponent);
        const component = ngMocks.findInstance(
          fixture,
          TargetComponent,
        );
        const dependency = TestBed.inject(TargetDependency);

        expect(component.constructorDependency).toBe(dependency);
        expect(component.fieldDependency).toBe(dependency);
        expect(component.bodyDependency).toBe(dependency);
        expect(component.constructorValue).toBe('real');
        expect(component.fieldValue).toBe('real');
        expect(component.bodyValue).toBe('real');
        expect(dependency.echo()).toBe('real');
        expect(TargetDependency.constructed).toBe(1);
        expect(ngMocks.formatText(fixture)).toEqual('real:real:real');
      });
    });

    describe('directly kept service', () => {
      beforeEach(() =>
        MockBuilder(TargetService, ServiceModule).keep(
          TargetDependency,
        ),
      );

      it('preserves the explicit keep throughout service construction', () => {
        const service =
          MockRender(TargetService).point.componentInstance;
        const dependency = TestBed.inject(TargetDependency);

        expect(service).toBe(TestBed.inject(TargetService));
        expect(service.fieldDependency).toBe(dependency);
        expect(service.bodyDependency).toBe(dependency);
        expect(service.fieldValue).toBe('real');
        expect(service.bodyValue).toBe('real');
        expect(dependency.echo()).toBe('real');
        expect(TargetDependency.constructed).toBe(1);
      });
    });

    describe('standalone child of a kept module', () => {
      beforeEach(() =>
        MockBuilder(HostComponent, HostModule).keep(ChildModule),
      );

      it('preserves the kept module root dependency during child rendering', () => {
        const fixture = MockRender(HostComponent);
        const component = ngMocks.findInstance(
          fixture,
          TargetComponent,
        );
        const dependency = TestBed.inject(TargetDependency);

        expect(component.constructorDependency).toBe(dependency);
        expect(component.fieldDependency).toBe(dependency);
        expect(component.bodyDependency).toBe(dependency);
        expect(component.constructorValue).toBe('real');
        expect(component.fieldValue).toBe('real');
        expect(component.bodyValue).toBe('real');
        expect(dependency.echo()).toBe('real');
        expect(TargetDependency.constructed).toBe(1);
        expect(ngMocks.formatText(fixture)).toEqual('real:real:real');
      });
    });
  });

  describe('auto-spy enabled', () => {
    beforeEach(() =>
      ngMocks.autoSpy(
        typeof jest === 'undefined'
          ? 'jasmine'
          : typeof (window as any).vi === 'undefined'
            ? 'jest'
            : 'vitest',
      ),
    );
    beforeEach(() =>
      MockBuilder(HostComponent, HostModule)
        .keep(TargetComponent)
        .keep(TargetDependency),
    );

    it('preserves the same explicit keep with a runner spy factory', () => {
      const fixture = MockRender(HostComponent);
      const component = ngMocks.findInstance(
        fixture,
        TargetComponent,
      );
      const dependency = TestBed.inject(TargetDependency);

      expect(component.constructorDependency).toBe(dependency);
      expect(component.fieldDependency).toBe(dependency);
      expect(component.bodyDependency).toBe(dependency);
      expect(component.constructorValue).toBe('real');
      expect(component.fieldValue).toBe('real');
      expect(component.bodyValue).toBe('real');
      expect(dependency.echo()).toBe('real');
      expect(TargetDependency.constructed).toBe(1);
      expect(ngMocks.formatText(fixture)).toEqual('real:real:real');
    });
  });
});
