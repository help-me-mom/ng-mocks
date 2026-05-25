import { EventEmitter } from '@angular/core';

import { AnyType, SignalOutputDef } from './core.types';

// Try to import signal output function from Angular core
// This is available in Angular 17.3+
let outputFn: any;

try {
  // Angular 17.3+ has output() function
  const core = require('@angular/core');
  outputFn = core.output;
} catch {
  // Signal outputs not available in this Angular version
}

/**
 * Checks if signal outputs are supported in the current Angular version.
 */
export const hasSignalOutputSupport = (): boolean => {
  return typeof outputFn === 'function';
};

/**
 * A mock OutputRef that mimics Angular's OutputRef interface.
 * This allows tests to subscribe and emit values.
 */
class MockOutputRef<T> {
  private emitter = new EventEmitter<T>();

  /**
   * Subscribes to the output.
   */
  public subscribe(callback: (value: T) => void): { unsubscribe: () => void } {
    const subscription = this.emitter.subscribe(callback);
    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  }

  /**
   * Emits a value. This is used in tests to trigger the output.
   */
  public emit(value: T): void {
    this.emitter.emit(value);
  }
}

/**
 * Decorates a mock class with signal outputs.
 * For Angular 17.3+ signal-based outputs using the output() function.
 */
export default (cls: AnyType<any>, signalOutputs?: SignalOutputDef[]): void => {
  if (!signalOutputs || signalOutputs.length === 0) {
    return;
  }

  for (const signalOutput of signalOutputs) {
    const { name } = signalOutput;

    // Create a MockOutputRef for each signal output
    // This provides a compatible interface for both Angular's OutputRef
    // and allows emit() to be called in tests
    Object.defineProperty(cls.prototype, name, {
      get() {
        if (!this[`__ngMocksOutputRef_${name}`]) {
          this[`__ngMocksOutputRef_${name}`] = new MockOutputRef();
        }
        return this[`__ngMocksOutputRef_${name}`];
      },
      enumerable: true,
      configurable: true,
    });
  }
};
