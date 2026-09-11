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
  selector: 'constructor-14899',
  standalone: false,
  template: '{{ value }}',
})
class ConstructorComponent {
  public readonly value: string;

  public constructor(public readonly dependency: TargetDependency) {
    this.value = dependency.echo();
  }
}

@Component({
  selector: 'inject-14899',
  standalone: false,
  template: '{{ fieldValue }}:{{ bodyValue }}',
})
class InjectComponent {
  public readonly fieldDependency = inject(TargetDependency);
  public readonly fieldValue = this.fieldDependency.echo();
  public readonly bodyDependency: TargetDependency;
  public readonly bodyValue: string;

  public constructor() {
    this.bodyDependency = inject(TargetDependency);
    this.bodyValue = this.bodyDependency.echo();
  }
}

@Injectable({ providedIn: 'root' })
class ConstructorService {
  public readonly value: string;

  public constructor(public readonly dependency: TargetDependency) {
    this.value = dependency.echo();
  }
}

@Injectable({ providedIn: 'root' })
class InjectService {
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
  declarations: [InjectComponent],
  exports: [InjectComponent],
})
class TargetModule {}

// Auto-spy selects mock method implementations; disabling it must not turn
// runtime inject() dependencies into real services during kept construction.
// @see https://github.com/help-me-mom/ng-mocks/issues/14899
describe('issue-14899:default', () => {
  beforeEach(() => ngMocks.autoSpy('default'));
  afterEach(() => ngMocks.autoSpy('reset'));

  beforeEach(() => {
    TargetDependency.constructed = 0;
  });

  describe('component constructor parameters', () => {
    beforeEach(() => MockBuilder(ConstructorComponent));

    it('uses an empty dependency method during construction', () => {
      const fixture = MockRender(ConstructorComponent);
      const dependency = TestBed.inject(TargetDependency);

      expect(fixture.point.componentInstance.dependency).toBe(
        dependency,
      );
      expect(fixture.point.componentInstance.value).toBeUndefined();
      expect(dependency.echo()).toBeUndefined();
      expect(TargetDependency.constructed).toBe(0);
      expect(ngMocks.formatText(fixture)).toEqual('');
    });
  });

  describe('component field and constructor-body inject', () => {
    beforeEach(() => MockBuilder(InjectComponent));

    it('uses the same empty mock during both initialization paths', () => {
      const fixture = MockRender(InjectComponent);
      const component = fixture.point.componentInstance;
      const dependency = TestBed.inject(TargetDependency);

      expect(component.fieldDependency).toBe(dependency);
      expect(component.bodyDependency).toBe(dependency);
      expect(component.fieldValue).toBeUndefined();
      expect(component.bodyValue).toBeUndefined();
      expect(dependency.echo()).toBeUndefined();
      expect(TargetDependency.constructed).toBe(0);
      expect(ngMocks.formatText(fixture)).toEqual(':');
    });
  });

  describe('directly kept service constructor parameters', () => {
    beforeEach(() => MockBuilder(ConstructorService));

    it('uses an empty dependency method during construction', () => {
      const service = MockRender(ConstructorService).point
        .componentInstance;
      const dependency = TestBed.inject(TargetDependency);

      expect(service).toBe(TestBed.inject(ConstructorService));
      expect(service.dependency).toBe(dependency);
      expect(service.value).toBeUndefined();
      expect(dependency.echo()).toBeUndefined();
      expect(TargetDependency.constructed).toBe(0);
    });
  });

  describe('directly kept service field and constructor-body inject', () => {
    beforeEach(() => MockBuilder(InjectService));

    it('uses the same empty mock during both initialization paths', () => {
      const service =
        MockRender(InjectService).point.componentInstance;
      const dependency = TestBed.inject(TargetDependency);

      expect(service).toBe(TestBed.inject(InjectService));
      expect(service.fieldDependency).toBe(dependency);
      expect(service.bodyDependency).toBe(dependency);
      expect(service.fieldValue).toBeUndefined();
      expect(service.bodyValue).toBeUndefined();
      expect(dependency.echo()).toBeUndefined();
      expect(TargetDependency.constructed).toBe(0);
    });
  });

  describe('explicit keep', () => {
    beforeEach(() =>
      MockBuilder(InjectComponent).keep(TargetDependency),
    );

    it('retains the real root dependency', () => {
      const fixture = MockRender(InjectComponent);
      const component = fixture.point.componentInstance;
      const dependency = TestBed.inject(TargetDependency);

      expect(component.fieldDependency).toBe(dependency);
      expect(component.bodyDependency).toBe(dependency);
      expect(component.fieldValue).toBe('real');
      expect(component.bodyValue).toBe('real');
      expect(dependency.echo()).toBe('real');
      expect(TargetDependency.constructed).toBe(1);
      expect(ngMocks.formatText(fixture)).toEqual('real:real');
    });
  });

  describe('explicit mock', () => {
    beforeEach(() =>
      MockBuilder(InjectComponent).mock(TargetDependency, {
        echo: () => 'custom',
      }),
    );

    it('retains the configured method during initialization', () => {
      const fixture = MockRender(InjectComponent);
      const component = fixture.point.componentInstance;
      const dependency = TestBed.inject(TargetDependency);

      expect(component.fieldDependency).toBe(dependency);
      expect(component.bodyDependency).toBe(dependency);
      expect(component.fieldValue).toBe('custom');
      expect(component.bodyValue).toBe('custom');
      expect(dependency.echo()).toBe('custom');
      expect(TargetDependency.constructed).toBe(0);
      expect(ngMocks.formatText(fixture)).toEqual('custom:custom');
    });
  });

  describe('explicit exclude', () => {
    beforeEach(() =>
      MockBuilder(InjectComponent).exclude(TargetDependency),
    );

    it('leaves the root fallback outside runtime mocking', () => {
      const fixture = MockRender(InjectComponent);
      const component = fixture.point.componentInstance;
      const dependency = TestBed.inject(TargetDependency);

      expect(component.fieldDependency).toBe(dependency);
      expect(component.bodyDependency).toBe(dependency);
      expect(component.fieldValue).toBe('real');
      expect(component.bodyValue).toBe('real');
      expect(dependency.echo()).toBe('real');
      expect(TargetDependency.constructed).toBe(1);
      expect(ngMocks.formatText(fixture)).toEqual('real:real');
    });
  });

  describe('kept module', () => {
    beforeEach(() => MockBuilder(TargetModule));

    it('preserves the root dependency of its kept component', () => {
      const fixture = MockRender(InjectComponent);
      const component = fixture.point.componentInstance;
      const dependency = TestBed.inject(TargetDependency);

      expect(component.fieldDependency).toBe(dependency);
      expect(component.bodyDependency).toBe(dependency);
      expect(component.fieldValue).toBe('real');
      expect(component.bodyValue).toBe('real');
      expect(dependency.echo()).toBe('real');
      expect(TargetDependency.constructed).toBe(1);
      expect(ngMocks.formatText(fixture)).toEqual('real:real');
    });
  });

  describe('two-argument MockBuilder', () => {
    beforeEach(() => MockBuilder(InjectComponent, TargetModule));

    it('preserves the existing policy for undiscovered runtime dependencies', () => {
      const fixture = MockRender(InjectComponent);
      const component = fixture.point.componentInstance;
      const dependency = TestBed.inject(TargetDependency);

      expect(component.fieldDependency).toBe(dependency);
      expect(component.bodyDependency).toBe(dependency);
      expect(component.fieldValue).toBe('real');
      expect(component.bodyValue).toBe('real');
      expect(dependency.echo()).toBe('real');
      expect(TargetDependency.constructed).toBe(1);
      expect(ngMocks.formatText(fixture)).toEqual('real:real');
    });
  });
});
