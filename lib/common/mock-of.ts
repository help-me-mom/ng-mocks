/* tslint:disable variable-name */

import { AnyType } from './core.types';
import { ngMocksMockConfig } from './mock';

// This helps with debugging in the browser. Decorating mock classes with this
// will change the display-name of the class to 'MockOf-<ClassName>` so our
// debugging output (and Angular's error messages) will mention our mock classes
// by name (which will now include the original class' name.
// Additionally, if we set breakpoints, we can inspect the actual class being
// replaced with a mock copy by looking into the 'mockOf' property on the class.
export const MockOf = (mockClass: AnyType<any>, config?: ngMocksMockConfig) => (constructor: AnyType<any>) => {
  Object.defineProperties(constructor, {
    mockOf: { value: mockClass },
    name: { value: `MockOf${mockClass.name}` },
    nameConstructor: { value: constructor.name },
  });

  constructor.prototype.__ngMocksConfig = config;
};
