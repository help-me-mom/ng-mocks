import coreReflectProvidedIn from '../../common/core.reflect.provided-in';
import ngMocksUniverse from '../../common/ng-mocks-universe';

export default (provide: any): void => {
  if (ngMocksUniverse.touches.has(provide)) {
    return;
  }

  const providedIn = coreReflectProvidedIn(provide);
  if (!providedIn) {
    return;
  }

  if (ngMocksUniverse.config.get('ngMocksDepsSkip').has(providedIn)) {
    ngMocksUniverse.config.get('ngMocksDepsSkip').add(provide);
  }
};
