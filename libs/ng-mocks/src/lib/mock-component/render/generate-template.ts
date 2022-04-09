import { Query, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';

const viewChildArgs: any = { read: ViewContainerRef, static: false };

const viewChildTemplate = (selector: string, key: string): string =>
  `<div *ngIf="ngMocksRender_${key}_${selector}" data-${key}="${selector}"><ng-template #${key}_${selector}></ng-template></div>`;

const isTemplateRefQuery = (query: Query): boolean => {
  if (query.isViewQuery) {
    return false; // ignoring all internal @ViewChild
  }
  if (query.read && query.read !== TemplateRef) {
    return false; // ignoring read of instances
  }
  if (typeof query.selector !== 'string' && !query.read) {
    return false; // ignoring class selectors if they do not read TemplateRef
  }

  return true;
};

export default (queries?: Record<keyof any, any>): string => {
  const parts = ['<ng-content></ng-content>'];
  // istanbul ignore if
  if (!queries) {
    return parts.join('');
  }

  for (const key of Object.keys(queries)) {
    const query: Query = queries[key];
    if (!isTemplateRefQuery(query)) {
      continue;
    }
    if (typeof query.selector === 'string') {
      const selector = query.selector.replace(new RegExp('\\W', 'mg'), '_');
      queries[`__mockView_key_${selector}`] = new ViewChild(`key_${selector}`, viewChildArgs);
      queries[`__mockTpl_key_${selector}`] = query;
      parts.push(viewChildTemplate(selector, 'key'));
    }
    queries[`__mockView_prop_${key}`] = new ViewChild(`prop_${key}`, viewChildArgs);
    parts.push(viewChildTemplate(key, 'prop'));
  }

  return parts.join('');
};
