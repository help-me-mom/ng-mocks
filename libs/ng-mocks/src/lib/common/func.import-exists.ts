import funcGetName from './func.get-name';
import { isNgDef } from './func.is-ng-def';

const getType = (value: any): string =>
  isNgDef(value, 'p')
    ? 'pipe'
    : isNgDef(value, 'd')
    ? 'directive'
    : isNgDef(value, 'c')
    ? 'component'
    : isNgDef(value, 'm')
    ? 'module'
    : isNgDef(value, 'i')
    ? 'service'
    : isNgDef(value, 't')
    ? 'token'
    : '';

export default (value: any, funcName: string) => {
  if (value === undefined || value === null) {
    throw new Error(`null / undefined has been passed into ${funcName}. Please check that its import is correct.`);
  }

  if (funcName === 'MockPipe' && isNgDef(value, 'p')) {
    return;
  }
  if (funcName === 'MockDirective' && isNgDef(value, 'd')) {
    return;
  }
  if (funcName === 'MockComponent' && isNgDef(value, 'c')) {
    return;
  }
  if (funcName === 'MockModule' && isNgDef(value, 'm')) {
    return;
  }

  const type = getType(value);

  if (type && funcName === 'MockPipe') {
    throw new Error(`${funcName} accepts pipes, whereas ${funcGetName(value)} is a ${type}.`);
  }
  if (type && funcName === 'MockDirective') {
    throw new Error(`${funcName} accepts directives, whereas ${funcGetName(value)} is a ${type}.`);
  }
  if (type && funcName === 'MockComponent') {
    throw new Error(`${funcName} accepts components, whereas ${funcGetName(value)} is a ${type}.`);
  }
  if (type && funcName === 'MockModule') {
    throw new Error(`${funcName} accepts modules, whereas ${funcGetName(value)} is a ${type}.`);
  }
};
