import { QueryList, TemplateRef, ViewContainerRef } from '@angular/core';

import funcIsMock from '../../common/func.is-mock';
import { MockConfig } from '../../common/mock';

const getValVcr = (entryPoint: MockConfig): Array<[any, ViewContainerRef]> => {
  const result: Array<[any, ViewContainerRef]> = [];

  for (const key of entryPoint.__ngMocksConfig.queryScanKeys || /* istanbul ignore next */ []) {
    const value = (entryPoint as any)[key];
    const vcr = (entryPoint as any)[`__ngMocksVcr_${key}`];
    if (!value || !vcr) {
      continue;
    }

    const scanValue = value instanceof QueryList ? value.toArray() : [value];
    const scanVcr = vcr instanceof QueryList ? vcr.toArray() : [vcr];

    for (let index = 0; index < scanValue.length; index += 1) {
      result.push([scanValue[index], scanVcr[index]]);
    }
  }

  return result;
};

const handleDirective = (
  entryPoint: {
    __template?: TemplateRef<any>;
    __vcr?: ViewContainerRef;
  },
  isExpectedTemplate: (tpl: TemplateRef<any>) => boolean,
  callback: (vcr: ViewContainerRef, tpl: TemplateRef<any>) => boolean,
): boolean => {
  return (
    !!entryPoint.__template &&
    !!entryPoint.__vcr &&
    isExpectedTemplate(entryPoint.__template) &&
    callback(entryPoint.__vcr, entryPoint.__template)
  );
};

const isRightTemplate = (
  localVcr: ViewContainerRef | undefined,
  localValue: any,
  isExpectedTemplate: (tpl: TemplateRef<any>) => boolean,
): boolean => {
  return !!localVcr && localValue instanceof TemplateRef && isExpectedTemplate(localValue);
};

const findDeep = (
  entryPoint: object,
  isExpectedTemplate: (tpl: TemplateRef<any>) => boolean,
  callback: (vcr: ViewContainerRef, tpl: TemplateRef<any>) => boolean,
): boolean => {
  if (!funcIsMock(entryPoint)) {
    throw new Error('Only instances of mock declarations are accepted');
  }

  // structural directive
  if (handleDirective(entryPoint, isExpectedTemplate, callback)) {
    return true;
  }

  for (const [localValue, localVcr] of getValVcr(entryPoint)) {
    if (funcIsMock<{}>(localValue) && findDeep(localValue, isExpectedTemplate, callback)) {
      return true;
    }
    if (isRightTemplate(localVcr, localValue, isExpectedTemplate)) {
      return callback(localVcr, localValue);
    }
  }

  return false;
};

export default ((): typeof findDeep => findDeep)();
