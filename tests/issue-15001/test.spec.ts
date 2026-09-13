import {
  ChangeDetectorRef,
  Component,
  Directive,
  Inject,
  Injectable,
  NgModule,
  Pipe,
  PipeTransform,
  ViewContainerRef,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  isMockOf,
  MockBuilder,
  MockModule,
  MockProvider,
  ngMocks,
} from 'ng-mocks';

let calls: string[] = [];

@Component({
  selector: 'cached-component-15001',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'real component',
})
class TargetComponent {
  public constructor() {
    calls.push('component constructor');
  }

  public read(): string {
    calls.push('component method');

    return 'component';
  }
}

@Directive({
  selector: '[cached-directive-15001]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetDirective {
  public constructor() {
    calls.push('directive constructor');
  }

  public read(): string {
    calls.push('directive method');

    return 'directive';
  }
}

@Pipe({
  name: 'cached15001',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetPipe implements PipeTransform {
  public constructor() {
    calls.push('pipe constructor');
  }

  public transform(value: string): string {
    calls.push('pipe transform');

    return `real:${value}`;
  }
}

@NgModule({
  declarations: [TargetComponent, TargetDirective, TargetPipe],
  providers: [
    {
      provide: TargetComponent,
      useClass: TargetComponent,
      multi: true,
    },
    {
      provide: TargetDirective,
      useClass: TargetDirective,
      multi: true,
    },
    { provide: TargetPipe, useClass: TargetPipe, multi: true },
    {
      provide: TargetPipe,
      multi: true,
      useFactory: () => {
        calls.push('pipe factory');

        return new TargetPipe();
      },
    },
  ],
})
class TargetModule {}

@Injectable()
class Consumer {
  public constructor(
    @Inject(TargetComponent)
    public readonly components: TargetComponent[],
    @Inject(TargetDirective)
    public readonly directives: TargetDirective[],
    @Inject(TargetPipe) public readonly pipes: TargetPipe[],
  ) {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15001
describe('issue-15001', () => {
  beforeEach(() => {
    calls = [];
  });

  for (const mode of ['native', 'MockModule', 'MockBuilder']) {
    it(`preserves multi providers for cached declarations with ${mode}`, async () => {
      if (mode === 'MockBuilder') {
        await MockBuilder()
          .mock(TargetModule)
          .provide([
            Consumer,
            MockProvider(ChangeDetectorRef),
            MockProvider(ViewContainerRef),
          ]);
      } else {
        await TestBed.configureTestingModule({
          imports: [
            mode === 'native'
              ? TargetModule
              : MockModule(TargetModule),
          ],
          providers: [
            Consumer,
            MockProvider(ChangeDetectorRef),
            MockProvider(ViewContainerRef),
          ],
        }).compileComponents();
      }

      // Declarations are resolved before providers, so a cache hit must retain multi.
      const consumer = ngMocks.get(Consumer);
      expect(Array.isArray(consumer.components)).toBe(true);
      expect(Array.isArray(consumer.directives)).toBe(true);
      expect(Array.isArray(consumer.pipes)).toBe(true);
      expect(consumer.components.length).toBe(1);
      expect(consumer.directives.length).toBe(1);
      expect(consumer.pipes.length).toBe(2);
      expect(consumer.components[0] instanceof TargetComponent).toBe(
        true,
      );
      expect(consumer.directives[0] instanceof TargetDirective).toBe(
        true,
      );
      expect(consumer.pipes[0] instanceof TargetPipe).toBe(true);
      expect(consumer.pipes[1] instanceof TargetPipe).toBe(true);
      expect(consumer.pipes[0]).not.toBe(consumer.pipes[1]);
      expect(isMockOf(consumer.components[0], TargetComponent)).toBe(
        mode !== 'native',
      );
      expect(isMockOf(consumer.directives[0], TargetDirective)).toBe(
        mode !== 'native',
      );
      expect(isMockOf(consumer.pipes[0], TargetPipe)).toBe(
        mode !== 'native',
      );
      expect(isMockOf(consumer.pipes[1], TargetPipe)).toBe(
        mode !== 'native',
      );

      if (mode === 'native') {
        expect(calls).toContain('component constructor');
        expect(calls).toContain('directive constructor');
        expect(calls).toContain('pipe constructor');
        expect(calls).toContain('pipe factory');
        expect(
          calls.filter(value => value === 'pipe constructor').length,
        ).toBe(2);
        expect(calls.length).toBe(5);
        expect(consumer.components[0].read()).toBe('component');
        expect(consumer.directives[0].read()).toBe('directive');
        expect(consumer.pipes[0].transform('first')).toBe(
          'real:first',
        );
        expect(consumer.pipes[1].transform('second')).toBe(
          'real:second',
        );
      } else {
        expect(calls).toEqual([]);
        expect(consumer.components[0].read()).toBeUndefined();
        expect(consumer.directives[0].read()).toBeUndefined();
        expect(consumer.pipes[0].transform('first')).toBeUndefined();
        expect(consumer.pipes[1].transform('second')).toBeUndefined();
      }

      expect<object>(ngMocks.get(TargetComponent)).toBe(
        consumer.components,
      );
      expect<object>(ngMocks.get(TargetDirective)).toBe(
        consumer.directives,
      );
      expect<object>(ngMocks.get(TargetPipe)).toBe(consumer.pipes);
      expect(calls.length).toBe(mode === 'native' ? 9 : 0);
    });
  }
});
