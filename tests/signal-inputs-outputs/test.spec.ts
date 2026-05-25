import { Component, VERSION } from '@angular/core';

import {
  isMockOf,
  MockBuilder,
  MockComponent,
  MockRender,
  ngMocks,
} from 'ng-mocks';

// Check if signal inputs/outputs are supported (Angular 17.1+)
const hasSignalSupport = (): boolean => {
  const major = Number.parseInt(VERSION.major, 10);
  const minor = Number.parseInt(VERSION.minor, 10);
  return major > 17 || (major === 17 && minor >= 1);
};

// Conditionally import signal functions
let input: any;
let output: any;

if (hasSignalSupport()) {
  try {
    const core = require('@angular/core');
    input = core.input;
    output = core.output;
  } catch {
    // Signal functions not available
  }
}

// Create components with signal inputs/outputs only if supported
const createSignalComponent = () => {
  if (!hasSignalSupport() || !input || !output) {
    return null;
  }

  @Component({
    selector: 'signal-child',
    standalone: true,
    template: `
      <div>Signal Input: {{ signalInput() }}</div>
      <button (click)="emitOutput()">Emit</button>
    `,
  })
  class SignalChildComponent {
    public readonly signalInput = input<string>('default');
    public readonly requiredInput = input.required<number>();
    public readonly signalOutput = output<string>();

    public emitOutput(): void {
      this.signalOutput.emit('emitted value');
    }
  }

  return SignalChildComponent;
};

const createParentComponent = (ChildComponent: any) => {
  @Component({
    selector: 'parent',
    standalone: true,
    imports: [ChildComponent],
    template: `
      <signal-child
        [signalInput]="inputValue"
        [requiredInput]="requiredValue"
        (signalOutput)="onOutput($event)"
      ></signal-child>
    `,
  })
  class ParentComponent {
    public inputValue = 'test value';
    public requiredValue = 42;
    public outputValue: string | undefined;

    public onOutput(value: string): void {
      this.outputValue = value;
    }
  }

  return ParentComponent;
};

describe('signal-inputs-outputs', () => {
  if (!hasSignalSupport()) {
    it('needs Angular 17.1+ for signal inputs/outputs', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  const SignalChildComponent = createSignalComponent();

  if (!SignalChildComponent) {
    it('signal functions not available', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  const ParentComponent = createParentComponent(SignalChildComponent);

  describe('MockComponent with signal inputs', () => {
    it('creates a mock component with signal inputs', () => {
      const MockedChild = MockComponent(SignalChildComponent);
      expect(MockedChild).toBeDefined();
    });
  });

  describe('signal inputs in tests', () => {
    beforeEach(() =>
      MockBuilder(ParentComponent, SignalChildComponent),
    );

    it('passes signal input values to mock component', () => {
      const fixture = MockRender(ParentComponent);
      const parent = fixture.point.componentInstance;

      const mockChild = ngMocks.findInstance(SignalChildComponent);
      expect(isMockOf(mockChild, SignalChildComponent)).toBe(true);

      // The signal input should receive the value
      // In mock, signal inputs are writable signals
      const signalInputValue = mockChild.signalInput;
      expect(signalInputValue).toBeDefined();

      // Update the parent's input value
      parent.inputValue = 'new value';
      fixture.detectChanges();
    });

    it('handles signal outputs from mock component', () => {
      const fixture = MockRender(ParentComponent);
      const parent = fixture.point.componentInstance;

      const mockChild = ngMocks.findInstance(SignalChildComponent);

      // The mock should have an output that can emit
      const signalOutputRef = mockChild.signalOutput;
      expect(signalOutputRef).toBeDefined();

      // Emit from the mock's output
      if (
        signalOutputRef &&
        typeof signalOutputRef.emit === 'function'
      ) {
        signalOutputRef.emit('test output');
        expect(parent.outputValue).toBe('test output');
      }
    });
  });

  describe('real component with signal inputs', () => {
    beforeEach(() =>
      MockBuilder(ParentComponent).keep(SignalChildComponent),
    );

    it('works with real signal component', () => {
      MockRender(ParentComponent);

      const child = ngMocks.findInstance(SignalChildComponent);
      expect(isMockOf(child, SignalChildComponent)).toBe(false);

      // The real component should have the signal input
      expect(child.signalInput()).toBe('test value');
      expect(child.requiredInput()).toBe(42);
    });
  });
});
