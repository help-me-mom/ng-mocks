import { AnyType, SignalInputDef } from './core.types';

// Try to import signal input function from Angular core
// This is available in Angular 17.1+
let inputFn: any;
let signalFn: any;

try {
  // Angular 17.1+ has input() function
  const core = require('@angular/core');
  inputFn = core.input;
  signalFn = core.signal;
} catch {
  // Signal inputs not available in this Angular version
}

/**
 * Checks if signal inputs are supported in the current Angular version.
 */
export const hasSignalInputSupport = (): boolean => {
  return typeof inputFn === 'function';
};

/**
 * Decorates a mock class with signal inputs.
 * For Angular 17.1+ signal-based inputs using the input() function.
 */
export default (cls: AnyType<any>, signalInputs?: SignalInputDef[]): void => {
  if (!signalInputs || signalInputs.length === 0) {
    return;
  }

  if (!hasSignalInputSupport()) {
    // Signal inputs not supported, skip decoration
    return;
  }

  for (const signalInput of signalInputs) {
    const { name } = signalInput;

    // Create a writable signal that can be used as a mock input
    // We use signal() instead of input() because input() creates read-only signals
    // and in tests we need to be able to set values
    if (signalFn) {
      // Define the property on the prototype
      Object.defineProperty(cls.prototype, name, {
        get() {
          // Return the signal instance, allowing both reading and writing
          if (!this[`__ngMocksSignal_${name}`]) {
            this[`__ngMocksSignal_${name}`] = signalFn(undefined);
          }
          return this[`__ngMocksSignal_${name}`];
        },
        set(value: any) {
          // When Angular sets the input, update the signal
          if (this[`__ngMocksSignal_${name}`]) {
            this[`__ngMocksSignal_${name}`].set(value);
          } else {
            this[`__ngMocksSignal_${name}`] = signalFn(value);
          }
        },
        enumerable: true,
        configurable: true,
      });
    }
  }
};
