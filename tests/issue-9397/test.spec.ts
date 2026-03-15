import {
  Component,
  forwardRef,
  Inject,
  Injectable,
  VERSION,
} from '@angular/core';
import * as ngCore from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// @see https://github.com/help-me-mom/ng-mocks/issues/9397
describe('issue-9397', () => {
  if (Number.parseInt(VERSION.major, 10) < 14) {
    it('needs a14+', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeAll(() =>
    ngMocks.autoSpy(typeof jest === 'undefined' ? 'jasmine' : 'jest'),
  );
  afterAll(() => ngMocks.autoSpy('reset'));

  @Injectable({
    providedIn: 'root',
  })
  class TodoListService {
    public someMethod(): void {}
  }

  @Component({
    selector: 'target-component',
    template: '',
    ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
  })
  class TargetComponent {
    public readonly todoListService = (ngCore as any).inject(
      TodoListService,
    );

    public someMethod(): void {
      this.todoListService.someMethod();
    }
  }

  @Component({
    selector: 'ctor-target-component',
    template: '',
    ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
  })
  class CtorTargetComponent {
    public constructor(
      @Inject(forwardRef(() => TodoListService))
      public readonly todoListService: TodoListService,
    ) {}

    public someMethod(): void {
      this.todoListService.someMethod();
    }
  }

  @Component({
    selector: 'plain-ctor-target-component',
    template: '',
    ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
  })
  class PlainCtorTargetComponent {
    public constructor(
      public readonly todoListService: TodoListService,
    ) {}

    public someMethod(): void {
      this.todoListService.someMethod();
    }
  }

  class SyntheticProvidedShapeService {
    public someMethod(): void {}
  }

  (SyntheticProvidedShapeService as any)['ɵprov'] = {
    providedIn: 'root',
  };

  @Component({
    selector: 'detached-target-component',
    template: '',
    ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
  })
  class DetachedTargetComponent {
    public readonly detached = new TodoListService();

    public readonly empty = null;

    public readonly synthetic = new SyntheticProvidedShapeService();
  }

  beforeEach(() => MockBuilder(TargetComponent));

  it('auto-spies services injected via inject()', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const todoListService = TestBed.inject(TodoListService);

    component.someMethod();

    expect(todoListService.someMethod).toHaveBeenCalledTimes(1);
    expect(component.todoListService.someMethod).toBe(
      todoListService.someMethod,
    );
  });

  describe('control', () => {
    beforeEach(() => MockBuilder(CtorTargetComponent));

    it('auto-spies services injected via constructor', () => {
      const fixture = MockRender(CtorTargetComponent);
      const component = fixture.point.componentInstance;
      const todoListService = TestBed.inject(TodoListService);

      component.someMethod();

      expect(todoListService.someMethod).toHaveBeenCalledTimes(1);
      expect(component.todoListService.someMethod).toBe(
        todoListService.someMethod,
      );
    });
  });

  describe('plain ctor control', () => {
    beforeEach(() => MockBuilder(PlainCtorTargetComponent));

    it('keeps constructor-based auto-spy for plain parameters', () => {
      const fixture = MockRender(PlainCtorTargetComponent);
      const component = fixture.point.componentInstance;
      const todoListService = TestBed.inject(TodoListService);

      component.someMethod();

      expect(todoListService.someMethod).toHaveBeenCalledTimes(1);
      expect(component.todoListService.someMethod).toBe(
        todoListService.someMethod,
      );
    });
  });

  describe('guards', () => {
    beforeEach(() => MockBuilder(DetachedTargetComponent));

    it('skips standalone properties which are not the injected singleton', () => {
      const fixture = MockRender(DetachedTargetComponent);
      const component = fixture.point.componentInstance;

      expect(component.detached.someMethod).toBe(
        TodoListService.prototype.someMethod,
      );
      expect(component.synthetic.someMethod).toBe(
        SyntheticProvidedShapeService.prototype.someMethod,
      );
    });
  });
});
