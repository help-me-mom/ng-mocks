import { ContentChild, ContentChildren, Query, ViewChild, ViewChildren } from '@angular/core';

import { AnyType } from './core.types';

// Looks like an A9 bug, that queries from @Component aren't processed.
// Also we have to pass prototype, not the class.
// The same issue happens with outputs, but time to time
// (when I restart tests with refreshing browser manually).
// https://github.com/ike18t/ng-mocks/issues/109
export default function (cls: AnyType<any>, queries?: { [key: string]: Query }) {
  /* istanbul ignore else */
  if (queries) {
    for (const key of Object.keys(queries)) {
      const query: any = queries[key];
      if (query.ngMetadataName === 'ContentChild') {
        ContentChild(query.selector, query)(cls.prototype, key);
      }
      if (query.ngMetadataName === 'ContentChildren') {
        ContentChildren(query.selector, query)(cls.prototype, key);
      }
      if (query.ngMetadataName === 'ViewChild') {
        ViewChild(query.selector, query)(cls.prototype, key);
      }
      if (query.ngMetadataName === 'ViewChildren') {
        ViewChildren(query.selector, query)(cls.prototype, key);
      }
    }
  }
}
