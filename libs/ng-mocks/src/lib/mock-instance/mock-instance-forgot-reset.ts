import funcGetName from '../common/func.get-name';
import ngMocksUniverse from '../common/ng-mocks-universe';

export default (checkReset: Array<[any, any, any?]>) => {
  const showError: string[] = [];

  // istanbul ignore next: because of the installed global scope switcher we cannot test this part
  while (checkReset.length > 0) {
    const [declaration, config] = checkReset.pop() || /* istanbul ignore next */ [];
    if (config === ngMocksUniverse.configInstance.get(declaration)) {
      showError.push(typeof declaration === 'function' ? funcGetName(declaration) : declaration);
    }
  }

  // istanbul ignore if: because of the installed global scope switcher we cannot test this part
  if (showError.length > 0) {
    const globalFlags = ngMocksUniverse.global.get('flags');
    const errorMessage = [
      `MockInstance: side effects have been detected (${showError.join(', ')}).`,
      'Forgot to add MockInstance.scope() or to call MockInstance.restore()?',
    ].join(' ');
    if (globalFlags.onMockInstanceRestoreNeed === 'warn') {
      console.warn(errorMessage);
    } else if (globalFlags.onMockInstanceRestoreNeed === 'throw') {
      throw new Error(errorMessage);
    }
  }
};
