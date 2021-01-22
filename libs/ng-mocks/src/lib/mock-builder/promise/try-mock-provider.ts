import { isNgDef } from '../../common/func.is-ng-def';
import ngMocksUniverse from '../../common/ng-mocks-universe';
import mockHelperStub from '../../mock-helper/mock-helper.stub';
import helperUseFactory from '../../mock-service/helper.use-factory';
import mockProvider from '../../mock-service/mock-provider';
import { IMockBuilderConfigMock } from '../types';

const createInstance = (existing: any, instance: any, config: IMockBuilderConfigMock, isFunc: boolean): any => {
  const params = isFunc ? { transform: instance } : instance;
  if (config.precise) {
    return params;
  }

  return mockHelperStub(existing, params);
};

export default (def: any, defValue: Map<any, any>): void => {
  if (isNgDef(def, 'i') && defValue.has(def)) {
    const config: IMockBuilderConfigMock = ngMocksUniverse.config.get(def) || {};
    const instance = defValue.get(def);
    const isFunc = isNgDef(def, 'p') && typeof instance === 'function';
    ngMocksUniverse.builtProviders.set(
      def,
      helperUseFactory(def, undefined, existing => createInstance(existing, instance, config, isFunc)),
    );
  } else if (isNgDef(def, 'i')) {
    ngMocksUniverse.builtProviders.set(def, mockProvider(def));
  }

  if (!isNgDef(def) && defValue.has(def)) {
    const instance = defValue.get(def);
    ngMocksUniverse.builtProviders.set(
      def,
      helperUseFactory(def, undefined, () => instance),
    );
  } else if (!isNgDef(def)) {
    ngMocksUniverse.builtProviders.set(def, mockProvider(def));
  }
};
