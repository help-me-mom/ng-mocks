import { forwardRef } from '@angular/core';

import { AnyType, Type } from '../common/core.types';

export default (provide: AnyType<any>, type: AnyType<any>) => ({
  provide,
  useExisting: (() => {
    const value: Type<any> & { __ngMocksSkip?: boolean } = forwardRef(() => type);
    value.__ngMocksSkip = true;

    return value;
  })(),
});
