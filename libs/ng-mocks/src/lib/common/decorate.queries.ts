import { ContentChild, ContentChildren, Query, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';

import { AnyType } from './core.types';

const map: any = {
  ContentChild,
  ContentChildren,
  ViewChild,
  ViewChildren,
};

const isInternalKey = (key: string): boolean => {
  return key.indexOf('__mock') === 0;
};

const cloneVcrQuery = (query: Query & { ngMetadataName?: string }) => ({
  ...query,
  ngMetadataName: query.ngMetadataName,
  read: ViewContainerRef,
});

const generateFinalQueries = (queries: {
  [key: string]: Query;
}): [Array<[string, Query & { ngMetadataName?: string }]>, string[]] => {
  const final: Array<[string, Query & { ngMetadataName?: string }]> = [];
  const scanKeys: string[] = [];

  for (const key of Object.keys(queries)) {
    const query: Query & { ngMetadataName?: string } = queries[key];
    final.push([key, query]);

    if (!query.isViewQuery && !isInternalKey(key)) {
      scanKeys.push(key);
      final.push([`__ngMocksVcr_${key}`, cloneVcrQuery(query)]);
    }
  }

  return [final, scanKeys];
};

// Looks like an A9 bug, that queries from @Component are not processed.
// Also we have to pass prototype, not the class.
// The same issue happens with outputs, but time to time
// (when I restart tests with refreshing browser manually).
// https://github.com/ike18t/ng-mocks/issues/109
export default function (cls: AnyType<any>, queries?: { [key: string]: Query }): string[] {
  // istanbul ignore if
  if (!queries) {
    return [];
  }
  const [final, keys] = generateFinalQueries(queries);

  for (const [key, query] of final) {
    // istanbul ignore else
    if (query.ngMetadataName) {
      const decorator = map[query.ngMetadataName];
      decorator(query.selector, query)(cls.prototype, key);
      const props = (cls as any).propDecorators;
      if (!props[key]) {
        props[key] = [
          {
            args: [query.selector, query],
            type: decorator,
          },
        ];
      }
    }
  }

  return keys;
}
