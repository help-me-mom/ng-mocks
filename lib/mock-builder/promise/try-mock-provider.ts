import { isNgDef } from '../../common/func.is-ng-def';
import ngMocksUniverse from '../../common/ng-mocks-universe';
import helperMockService from '../../mock-service/helper.mock-service';
import mockProvider from '../../mock-service/mock-provider';
import { MockService } from '../../mock-service/mock-service';
import { IMockBuilderConfigMock } from '../types';

const createInstance = (def: any, instance: any, config: IMockBuilderConfigMock, isFunc: boolean): any => {
  const params = isFunc ? { transform: instance } : instance;

  return config.precise ? instance : MockService(def, params);
};

export default (def: any, defValue: Map<any, any>): void => {
  if (isNgDef(def, 'i') && defValue.has(def)) {
    const config: IMockBuilderConfigMock = ngMocksUniverse.config.get(def) || {};
    const instance = defValue.get(def);
    const isFunc = isNgDef(def, 'p') && typeof instance === 'function';
    ngMocksUniverse.builtProviders.set(
      def,
      helperMockService.useFactory(def, () => createInstance(def, instance, config, isFunc)),
    );
  } else if (isNgDef(def, 'i')) {
    ngMocksUniverse.builtProviders.set(def, mockProvider(def));
  }

  if (!isNgDef(def) && defValue.has(def)) {
    const instance = defValue.get(def);
    ngMocksUniverse.builtProviders.set(
      def,
      helperMockService.useFactory(def, () => instance),
    );
  } else if (!isNgDef(def)) {
    ngMocksUniverse.builtProviders.set(def, mockProvider(def));
  }
};
