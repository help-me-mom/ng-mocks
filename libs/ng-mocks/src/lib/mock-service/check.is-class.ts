import checkIsFunc from './check.is-func';

export default (value: any): boolean => {
  if (typeof value !== 'function') {
    return false;
  }

  return !checkIsFunc(value);
};
