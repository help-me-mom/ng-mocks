import { ContentChild, ContentChildren, Input, Output, Query, Type, ViewChild, ViewChildren } from '@angular/core';

// Looks like an A9 bug, that queries from @Component aren't processed.
// Also we have to pass prototype, not the class.
// The same issue happens with outputs, but time to time
// (when I restart tests with refreshing browser manually).
// https://github.com/ike18t/ng-mocks/issues/109

/**
 * See comment at the beginning of the file.
 *
 * @internal
 */
export function decorateInputs(cls: Type<any>, inputs?: string[]) {
  if (inputs) {
    for (const input of inputs) {
      const [key, alias] = input.split(': ');
      Input(alias)(cls.prototype, key);
    }
  }
}

/**
 * See comment at the beginning of the file.
 *
 * @internal
 */
export function decorateOutputs(cls: Type<any>, outputs?: string[]) {
  if (outputs) {
    for (const output of outputs) {
      const [key, alias] = output.split(': ');
      Output(alias)(cls.prototype, key);
    }
  }
}

/**
 * See comment at the beginning of the file.
 *
 * @internal
 */
export function decorateQueries(cls: Type<any>, queries?: { [key: string]: Query }) {
  if (queries) {
    for (const key of Object.keys(queries)) {
      // tslint:disable:no-unnecessary-type-assertion
      const query: any = queries[key];
      if (!query) {
        continue;
      }
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
