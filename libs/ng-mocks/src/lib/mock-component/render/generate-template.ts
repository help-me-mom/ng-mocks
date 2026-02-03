import { Query, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';

const vcrArgs: any = { read: ViewContainerRef, static: false };
const trArgs: any = { read: TemplateRef, static: false };

const viewChildTemplate = (selector: string, key: string): string => {
  const content = `<div data-${key}="${selector}"><ng-template #${key}_${selector}></ng-template></div>`;

  return `<ng-template #ngIf_${key}_${selector}>${content}</ng-template>`;
};

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
    const query: Query & { isSignal?: boolean } = queries[key];
    if (key.indexOf('__mock') === 0) {
      continue;
    }
    if (!isTemplateRefQuery(query)) {
      continue;
    }
    // istanbul ignore if @see tests-e2e/src/issue-8634
    if (query.isSignal) {
      continue;
    }
    if (typeof query.selector === 'string') {
      const selector = query.selector.replace(new RegExp('\\W', 'mg'), '_');
      queries[`__vcrIf_key_${selector}`] = new ViewChild(`ngIf_key_${selector}`, vcrArgs);
      queries[`__trIf_key_${selector}`] = new ViewChild(`ngIf_key_${selector}`, trArgs);
      queries[`__mockView_key_${selector}`] = new ViewChild(`key_${selector}`, vcrArgs);
      queries[`__mockTpl_key_${selector}`] = query;
      parts.push(viewChildTemplate(selector, 'key'));
    }
    queries[`__vcrIf_prop_${key}`] = new ViewChild(`ngIf_prop_${key}`, vcrArgs);
    queries[`__trIf_prop_${key}`] = new ViewChild(`ngIf_prop_${key}`, trArgs);
    queries[`__mockView_prop_${key}`] = new ViewChild(`prop_${key}`, vcrArgs);
    parts.push(viewChildTemplate(key, 'prop'));
  }

  return parts.join('');
};
