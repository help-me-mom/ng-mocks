import { isNgModuleDefWithProviders } from './func.is-ng-module-def-with-providers';

export default (provider: any): any => {
  return provider && typeof provider === 'object' && provider.provide
    ? provider.provide
    : isNgModuleDefWithProviders(provider)
    ? provider.ngModule
    : provider;
};
