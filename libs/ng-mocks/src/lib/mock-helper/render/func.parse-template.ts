import { TemplateRef } from '@angular/core';

import funcIsMock from '../../common/func.is-mock';

export default (param: any): TemplateRef<any> => {
  if (param instanceof TemplateRef) {
    return param;
  }
  if (funcIsMock(param) && param.__template) {
    return param.__template;
  }

  const error = new Error(
    'Unknown template has been passed, only TemplateRef or a mock structural directive are supported',
  );
  (error as any).param = param;

  throw error;
};
