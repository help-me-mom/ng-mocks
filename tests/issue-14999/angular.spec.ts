import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  EventEmitter,
  Input,
  Output,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockComponent,
  MockDirective,
  MockPipe,
  MockRender,
  ngMocks,
} from 'ng-mocks';

const request = Symbol('request');
const state = Symbol('state');
const hostRequest = Symbol('host-request');
const sideEffects: string[] = [];

class ParentDeclaration {
  public constructor() {
    sideEffects.push('constructor');
  }

  public [request](): string {
    sideEffects.push('method');

    return 'real';
  }

  public get [state](): string {
    sideEffects.push('getter');

    return 'real';
  }

  public set [state](value: string) {
    sideEffects.push(`setter:${value}`);
  }
}

@Component({
  selector: 'dependency-14999',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'real component',
})
class DependencyComponent extends ParentDeclaration {
  @Input() public value = '';
  @Output() public changed = new EventEmitter<string>();
}

@Directive({
  selector: '[dependency14999]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class DependencyDirective extends ParentDeclaration {
  @Input() public value = '';
  @Output() public changed = new EventEmitter<string>();
}

@Pipe({
  name: 'dependency14999',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class DependencyPipe
  extends ParentDeclaration
  implements PipeTransform
{
  public transform(value: string): string {
    sideEffects.push('transform');

    return `real:${value}`;
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'target-14999-angular',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <dependency-14999
      [value]="value"
      (changed)="componentResult = $event"
    ></dependency-14999>
    <span
      dependency14999
      [value]="value"
      (changed)="directiveResult = $event"
    ></span>
    <b>{{ value | dependency14999 }}</b>
  `,
})
class TargetComponent {
  public value = 'initial';
  public componentResult = '';
  public directiveResult = '';

  public [hostRequest](): string {
    return this.value;
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14999
describe('issue-14999:angular', () => {
  beforeEach(() => {
    sideEffects.length = 0;

    return TestBed.configureTestingModule({
      declarations: [
        TargetComponent,
        MockComponent(DependencyComponent),
        MockDirective(DependencyDirective),
        MockPipe(DependencyPipe, value => `mock:${value}`),
      ],
    }).compileComponents();
  });

  it('mocks inherited component symbols while preserving inputs, outputs and string mirrors', () => {
    const fixture = MockRender(TargetComponent);
    const target = fixture.point.componentInstance;
    const component = ngMocks.get(
      ngMocks.find('dependency-14999'),
      DependencyComponent,
    );

    expect(component instanceof DependencyComponent).toBe(true);
    expect(component.value).toBe('initial');
    expect(sideEffects).toEqual([]);
    expect(
      Object.getOwnPropertyDescriptor(
        fixture.componentInstance,
        hostRequest,
      ),
    ).toBeUndefined();

    fixture.componentInstance.value = 'updated';
    fixture.detectChanges();
    expect(component.value).toBe('updated');
    expect(target[hostRequest]()).toBe('updated');

    component.changed.emit('component event');
    expect(target.componentResult).toBe('component event');

    // Skipped prototype symbols otherwise keep the real implementation reachable.
    expect(component[request]()).toBeUndefined();
    expect(component[state]).toBeUndefined();
    component[state] = 'component state';
    expect(component[state]).toBe('component state');
    expect(sideEffects).toEqual([]);
  });

  it('mocks inherited directive symbols while preserving inputs and outputs', () => {
    const fixture = MockRender(TargetComponent);
    const target = fixture.point.componentInstance;
    const directive = ngMocks.get(
      ngMocks.find('[dependency14999]'),
      DependencyDirective,
    );

    expect(directive instanceof DependencyDirective).toBe(true);
    expect(directive.value).toBe('initial');
    expect(sideEffects).toEqual([]);

    target.value = 'updated';
    fixture.detectChanges();
    expect(directive.value).toBe('updated');

    directive.changed.emit('directive event');
    expect(target.directiveResult).toBe('directive event');

    expect(directive[request]()).toBeUndefined();
    expect(directive[state]).toBeUndefined();
    directive[state] = 'directive state';
    expect(directive[state]).toBe('directive state');
    expect(sideEffects).toEqual([]);
  });

  it('mocks inherited pipe symbols while preserving the configured transform', () => {
    const fixture = MockRender(TargetComponent);
    const pipe = ngMocks.findInstance(DependencyPipe);

    expect(pipe instanceof DependencyPipe).toBe(true);
    expect(ngMocks.formatText(ngMocks.find('b'))).toBe(
      'mock:initial',
    );
    expect(pipe.transform('direct')).toBe('mock:direct');
    expect(sideEffects).toEqual([]);

    fixture.componentInstance.value = 'updated';
    fixture.detectChanges();
    expect(ngMocks.formatText(ngMocks.find('b'))).toBe(
      'mock:updated',
    );

    expect(pipe[request]()).toBeUndefined();
    expect(pipe[state]).toBeUndefined();
    pipe[state] = 'pipe state';
    expect(pipe[state]).toBe('pipe state');
    expect(sideEffects).toEqual([]);
  });
});
