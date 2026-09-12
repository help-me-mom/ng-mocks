import {
  Component,
  Directive,
  EventEmitter,
  Input,
  NgModule,
  Output,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { jest } from '@jest/globals';
import {
  isMockOf,
  MockBuilder,
  MockComponent,
  MockRender,
  MockService,
  ngMocks,
} from 'ng-mocks';

const realCalls: string[] = [];

@Component({
  selector: 'issue-14931-child',
  standalone: false,
  template: 'real child',
})
class ChildComponent {
  @Input() public value = 'real';
  @Output() public changed = new EventEmitter<string>();

  public constructor() {
    realCalls.push('component constructor');
  }

  public run(value: string): string {
    realCalls.push(`component method: ${value}`);

    return value;
  }
}

@Directive({
  selector: '[issue14931]',
  standalone: false,
})
class DependencyDirective {
  @Input() public value = 'real';

  public constructor() {
    realCalls.push('directive constructor');
  }

  public run(value: string): string {
    realCalls.push(`directive method: ${value}`);

    return value;
  }
}

@Pipe({ name: 'issue14931', standalone: false })
class DependencyPipe implements PipeTransform {
  public constructor() {
    realCalls.push('pipe constructor');
  }

  public transform(value: string): string {
    realCalls.push(`pipe transform: ${value}`);

    return `real: ${value}`;
  }
}

@Component({
  selector: 'issue-14931-host',
  standalone: false,
  template: `
    <issue-14931-child [value]="value" (changed)="value = $event">
      <span>{{ value }}</span>
    </issue-14931-child>
    <span issue14931 [value]="value"></span>
    <p>{{ value | issue14931 }}</p>
  `,
})
class HostComponent {
  public value = 'initial';
}

@NgModule({
  declarations: [
    HostComponent,
    ChildComponent,
    DependencyDirective,
    DependencyPipe,
  ],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14931
describe('issue-14931', () => {
  beforeEach(() => {
    realCalls.length = 0;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('creates a component mock with runner-native spies', async () => {
    const mock = MockComponent(ChildComponent);

    await TestBed.configureTestingModule({
      declarations: [mock],
    }).compileComponents();

    const fixture = MockRender(ChildComponent, { value: 'direct' });
    const component = fixture.point.componentInstance;

    expect(MockComponent(ChildComponent)).toBe(mock);
    expect(isMockOf(component, ChildComponent)).toBe(true);
    expect(ngMocks.findInstance(ChildComponent)).toBe(component);
    expect(component.value).toBe('direct');
    expect(ngMocks.formatText(fixture)).toBe('');
    expect(jest.isMockFunction(component.run)).toBe(true);
    expect(component.run).not.toHaveBeenCalled();
    expect(component.run('direct')).toBeUndefined();
    expect(component.run).toHaveBeenCalledWith('direct');
    expect(component.run).toHaveBeenCalledTimes(1);
    expect(realCalls).toEqual([]);
  });

  it('renders a kept host with mocked declarations and updated bindings', async () => {
    await MockBuilder(HostComponent, TargetModule);

    const fixture = MockRender(HostComponent);
    const component = ngMocks.findInstance(ChildComponent);
    const directive = ngMocks.findInstance(DependencyDirective);
    const pipe = ngMocks.findInstance(DependencyPipe);

    expect(
      isMockOf(fixture.point.componentInstance, HostComponent),
    ).toBe(false);
    expect(isMockOf(component, ChildComponent)).toBe(true);
    expect(isMockOf(directive, DependencyDirective)).toBe(true);
    expect(isMockOf(pipe, DependencyPipe)).toBe(true);
    expect(component.value).toBe('initial');
    expect(directive.value).toBe('initial');
    expect(ngMocks.formatText(fixture)).toBe('initial');
    expect(jest.isMockFunction(pipe.transform)).toBe(true);
    expect(pipe.transform).toHaveBeenCalledWith('initial');
    expect(pipe.transform).toHaveBeenCalledTimes(1);
    expect(jest.isMockFunction(directive.run)).toBe(true);
    expect(directive.run).not.toHaveBeenCalled();
    expect(directive.run('test')).toBeUndefined();
    expect(directive.run).toHaveBeenCalledWith('test');
    expect(directive.run).toHaveBeenCalledTimes(1);

    component.changed.emit('updated');
    fixture.detectChanges();

    expect(fixture.point.componentInstance.value).toBe('updated');
    expect(component.value).toBe('updated');
    expect(directive.value).toBe('updated');
    expect(ngMocks.formatText(fixture)).toBe('updated');
    expect(pipe.transform).toHaveBeenLastCalledWith('updated');
    expect(pipe.transform).toHaveBeenCalledTimes(2);
    expect(realCalls).toEqual([]);
  });

  it('restores the configured spy factory after a temporary default', () => {
    const initial = MockService(ChildComponent);

    expect(jest.isMockFunction(initial.run)).toBe(true);
    expect(jest.mocked(initial.run).getMockName()).toBe(
      'ChildComponent.run',
    );
    expect(initial.run).not.toHaveBeenCalled();
    expect(initial.run('initial')).toBeUndefined();
    expect(initial.run).toHaveBeenCalledWith('initial');
    expect(initial.run).toHaveBeenCalledTimes(1);

    ngMocks.autoSpy('default');
    try {
      const plain = MockService(ChildComponent);

      expect(jest.isMockFunction(plain.run)).toBe(false);
      expect(plain.run('plain')).toBeUndefined();
    } finally {
      ngMocks.autoSpy('reset');
    }

    const restored = MockService(ChildComponent);

    expect(jest.isMockFunction(restored.run)).toBe(true);
    expect(jest.mocked(restored.run).getMockName()).toBe(
      'ChildComponent.run',
    );
    expect(restored.run).not.toBe(initial.run);
    expect(restored.run).not.toHaveBeenCalled();
    expect(restored.run('restored')).toBeUndefined();
    expect(restored.run).toHaveBeenCalledWith('restored');
    expect(restored.run).toHaveBeenCalledTimes(1);
    expect(initial.run).toHaveBeenCalledTimes(1);
    expect(realCalls).toEqual([]);
  });
});
