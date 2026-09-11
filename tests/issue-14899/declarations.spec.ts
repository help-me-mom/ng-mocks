import {
  Directive,
  HostBinding,
  inject,
  Injectable,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable({ providedIn: 'root' })
class FieldDependency {
  public static constructed = 0;

  public constructor() {
    FieldDependency.constructed += 1;
  }

  public echo(): string {
    return 'real-field';
  }
}

@Injectable({ providedIn: 'root' })
class ConstructorDependency {
  public static constructed = 0;

  public constructor() {
    ConstructorDependency.constructed += 1;
  }

  public echo(): string {
    return 'real-constructor';
  }
}

@Directive({
  selector: '[target-14899]',
  standalone: false,
})
class TargetDirective {
  public readonly fieldDependency = inject(FieldDependency);
  public readonly fieldResult = this.fieldDependency.echo();
  public readonly constructorDependency: ConstructorDependency;
  public readonly constructorResult: string;

  @HostBinding('attr.data-result') public readonly result: string;

  public constructor() {
    this.constructorDependency = inject(ConstructorDependency);
    this.constructorResult = this.constructorDependency.echo();
    this.result = `${this.fieldResult}:${this.constructorResult}`;
  }
}

@Pipe({
  name: 'target14899',
  standalone: false,
})
class TargetPipe implements PipeTransform {
  public readonly fieldDependency = inject(FieldDependency);
  public readonly fieldResult = this.fieldDependency.echo();
  public readonly constructorDependency: ConstructorDependency;
  public readonly constructorResult: string;

  public constructor() {
    this.constructorDependency = inject(ConstructorDependency);
    this.constructorResult = this.constructorDependency.echo();
  }

  public transform(value: string): string {
    return `${value}:${this.fieldResult}:${this.constructorResult}`;
  }
}

// Distinct roots ensure a field injection cannot prepopulate the constructor's mock.
// @see https://github.com/help-me-mom/ng-mocks/issues/14899
describe('issue-14899:declarations', () => {
  beforeEach(() => {
    FieldDependency.constructed = 0;
    ConstructorDependency.constructed = 0;
  });
  afterEach(() => ngMocks.autoSpy('reset'));

  describe('auto-spy', () => {
    beforeEach(() =>
      ngMocks.autoSpy(
        typeof jest === 'undefined'
          ? 'jasmine'
          : typeof (window as any).vi === 'undefined'
            ? 'jest'
            : 'vitest',
      ),
    );

    it('mocks both inject paths before the kept directive renders', async () => {
      await MockBuilder(TargetDirective);

      const fixture = MockRender('<div target-14899></div>');
      const directive = ngMocks.get(fixture.point, TargetDirective);
      const fieldDependency = TestBed.inject(FieldDependency);
      const constructorDependency = TestBed.inject(
        ConstructorDependency,
      );

      expect(directive.fieldDependency).toBe(fieldDependency);
      expect(directive.constructorDependency).toBe(
        constructorDependency,
      );
      expect(directive.fieldResult).toBeUndefined();
      expect(directive.constructorResult).toBeUndefined();
      expect(fixture.point.nativeElement.dataset.result).toEqual(
        'undefined:undefined',
      );
      expect(fieldDependency.echo).toHaveBeenCalledTimes(1);
      expect(constructorDependency.echo).toHaveBeenCalledTimes(1);
      expect(FieldDependency.constructed).toBe(0);
      expect(ConstructorDependency.constructed).toBe(0);
    });

    it('mocks both inject paths before the kept pipe renders', async () => {
      await MockBuilder(TargetPipe);

      const fixture = MockRender(TargetPipe, { $implicit: 'value' });
      const pipe = ngMocks.findInstance(fixture, TargetPipe);
      const fieldDependency = TestBed.inject(FieldDependency);
      const constructorDependency = TestBed.inject(
        ConstructorDependency,
      );

      expect(pipe.fieldDependency).toBe(fieldDependency);
      expect(pipe.constructorDependency).toBe(constructorDependency);
      expect(pipe.fieldResult).toBeUndefined();
      expect(pipe.constructorResult).toBeUndefined();
      expect(ngMocks.formatText(fixture)).toEqual(
        'value:undefined:undefined',
      );
      expect(fieldDependency.echo).toHaveBeenCalledTimes(1);
      expect(constructorDependency.echo).toHaveBeenCalledTimes(1);
      expect(FieldDependency.constructed).toBe(0);
      expect(ConstructorDependency.constructed).toBe(0);
    });
  });

  describe('default mock methods', () => {
    beforeEach(() => ngMocks.autoSpy('default'));

    it('uses empty methods for both inject paths before the kept directive renders', async () => {
      await MockBuilder(TargetDirective);

      const fixture = MockRender('<div target-14899></div>');
      const directive = ngMocks.get(fixture.point, TargetDirective);
      const fieldDependency = TestBed.inject(FieldDependency);
      const constructorDependency = TestBed.inject(
        ConstructorDependency,
      );

      expect(directive.fieldDependency).toBe(fieldDependency);
      expect(directive.constructorDependency).toBe(
        constructorDependency,
      );
      expect(directive.fieldResult).toBeUndefined();
      expect(directive.constructorResult).toBeUndefined();
      expect(fixture.point.nativeElement.dataset.result).toEqual(
        'undefined:undefined',
      );
      expect(fieldDependency.echo()).toBeUndefined();
      expect(constructorDependency.echo()).toBeUndefined();
      expect(FieldDependency.constructed).toBe(0);
      expect(ConstructorDependency.constructed).toBe(0);
    });

    it('uses empty methods for both inject paths before the kept pipe renders', async () => {
      await MockBuilder(TargetPipe);

      const fixture = MockRender(TargetPipe, { $implicit: 'value' });
      const pipe = ngMocks.findInstance(fixture, TargetPipe);
      const fieldDependency = TestBed.inject(FieldDependency);
      const constructorDependency = TestBed.inject(
        ConstructorDependency,
      );

      expect(pipe.fieldDependency).toBe(fieldDependency);
      expect(pipe.constructorDependency).toBe(constructorDependency);
      expect(pipe.fieldResult).toBeUndefined();
      expect(pipe.constructorResult).toBeUndefined();
      expect(ngMocks.formatText(fixture)).toEqual(
        'value:undefined:undefined',
      );
      expect(fieldDependency.echo()).toBeUndefined();
      expect(constructorDependency.echo()).toBeUndefined();
      expect(FieldDependency.constructed).toBe(0);
      expect(ConstructorDependency.constructed).toBe(0);
    });
  });
});
