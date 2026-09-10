import {
  Component,
  Directive,
  EventEmitter,
  forwardRef,
  Input,
  input,
  InjectionToken,
  isSignal,
  Output,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import decorateMock from '../common/decorate.mock';
import { Mock } from '../common/mock';
import { MockComponent } from '../mock-component/mock-component';
import { MockRender } from '../mock-render/mock-render';

import { ngMocks } from './mock-helper';

@Component({
  selector: 'target-output-attributes',
  standalone: false,
  template: '',
})
class TargetComponent {
  // The source unit supplies compiler-equivalent model metadata. Real authoring
  // functions are exercised by the compiled mock-render-metadata spread cases.
  @Input({ alias: 'value', isSignal: true } as never)
  @Output('valueChange')
  public readonly valueChange = input<string>();
}

describe('mock-helper:attributes', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [MockComponent(TargetComponent)],
    }).compileComponents(),
  );

  it('finds each aliased mock output without selecting another emitter', () => {
    @Component({
      selector: 'target-multiple-outputs',
      standalone: false,
      template: '',
    })
    class OutputsComponent {
      @Output('publicFirst') public readonly first =
        new EventEmitter<number>();
      @Output('publicSecond') public readonly second =
        new EventEmitter<number>();
    }

    TestBed.configureTestingModule({
      declarations: [MockComponent(OutputsComponent)],
    });
    const firstValues: number[] = [];
    const secondValues: number[] = [];
    MockRender(
      `<target-multiple-outputs
        (publicFirst)="firstValues.push($event)"
        (publicSecond)="secondValues.push($event)">
      </target-multiple-outputs>`,
      { firstValues, secondValues },
    );
    const target = ngMocks.find(OutputsComponent);
    const first = ngMocks.output(target, 'publicFirst');
    const second = ngMocks.output(target, 'publicSecond');

    expect(first).toBe(target.componentInstance.first);
    expect(second).toBe(target.componentInstance.second);
    expect(first).not.toBe(second);

    first.emit(1);
    second.emit(2);

    expect(firstValues).toEqual([1]);
    expect(secondValues).toEqual([2]);
  });

  it('uses declared output metadata when a custom mock has no output configuration', () => {
    @Component({
      selector: 'target-custom-output',
      standalone: false,
      template: '',
    })
    class OutputComponent {
      @Output('publicChanged') public readonly changed =
        new EventEmitter<number>();
    }

    @Component({
      // eslint-disable-next-line @angular-eslint/no-outputs-metadata-property
      outputs: ['changed:publicChanged'],
      providers: [
        {
          provide: OutputComponent,
          useExisting: forwardRef(() => CustomMock),
        },
      ],
      selector: 'target-custom-output',
      standalone: false,
      template: '',
    })
    class CustomMock extends Mock {
      public readonly changed = new EventEmitter<number>();
    }

    decorateMock(CustomMock, OutputComponent);
    TestBed.configureTestingModule({ declarations: [CustomMock] });
    const values: number[] = [];
    MockRender(
      '<target-custom-output (publicChanged)="values.push($event)"></target-custom-output>',
      { values },
    );
    const target = ngMocks.find(OutputComponent);
    const instance = target.componentInstance;
    const emitter = ngMocks.output(target, 'publicChanged');

    expect((instance as any).__ngMocksConfig.outputs).toBeUndefined();
    expect(emitter).toBe(instance.changed);

    emitter.emit(2);

    expect(values).toEqual([2]);
  });

  it('skips unrelated provider aliases before looking up a child input or output', () => {
    const parentToken = new InjectionToken<ParentDirective>(
      'parent-attributes',
    );

    @Directive({
      providers: [
        {
          provide: parentToken,
          useExisting: forwardRef(() => ParentDirective),
        },
      ],
      selector: '[parentAttributes]',
      standalone: false,
    })
    class ParentDirective {}

    @Directive({
      providers: [
        { provide: parentToken, useExisting: ParentDirective },
      ],
      selector: '[childAttributes]',
      standalone: false,
    })
    class ChildDirective {
      @Input('publicValue') public value = 0;
      @Output('publicChanged') public readonly changed =
        new EventEmitter<number>();
    }

    TestBed.configureTestingModule({
      declarations: [ParentDirective, ChildDirective],
    });
    const values: number[] = [];
    MockRender(
      `<div parentAttributes>
        <span childAttributes [publicValue]="value" (publicChanged)="values.push($event)"></span>
      </div>`,
      { value: 1, values },
    );
    const parent = ngMocks.find('[parentAttributes]');
    const child = ngMocks.find('[childAttributes]');

    // This local token resolves to an inherited instance, which ngMocks.get excludes.
    expect(child.injector.get(parentToken)).toBe(
      parent.injector.get(parentToken),
    );
    expect(child.providerTokens.indexOf(parentToken)).toBeLessThan(
      child.providerTokens.indexOf(ChildDirective),
    );
    expect(() => ngMocks.get(child, parentToken)).toThrow();
    expect(ngMocks.input(child, 'publicValue')).toBe(1);
    expect(ngMocks.output(child, 'publicChanged')).toBe(
      ngMocks.get(child, ChildDirective).changed,
    );

    ngMocks.output(child, 'publicChanged').emit(2);

    expect(values).toEqual([2]);
  });

  it('finds a model emitter through its public alias while keeping input lookup on the signal', () => {
    const values: string[] = [];
    const fixture = MockRender(
      '<target-output-attributes [value]="value" (valueChange)="values.push($event)"></target-output-attributes>',
      { value: 'initial', values },
    );
    const target = ngMocks.find(TargetComponent);
    const inputSignal = target.componentInstance.valueChange;
    const emitter = ngMocks.output(target, 'valueChange');

    expect(isSignal(inputSignal)).toBe(true);
    expect(ngMocks.input(target, 'value')).toBe('initial');
    expect(emitter).not.toBe(inputSignal as never);

    emitter.emit('child');
    fixture.componentInstance.value = 'parent';
    fixture.detectChanges();

    expect(values).toEqual(['child']);
    expect(target.componentInstance.valueChange).toBe(inputSignal);
    expect(ngMocks.input(target, 'value')).toBe('parent');
  });
});
