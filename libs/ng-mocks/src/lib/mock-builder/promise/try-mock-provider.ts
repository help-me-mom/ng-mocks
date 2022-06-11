import { isNgDef } from '../../common/func.is-ng-def';
import ngMocksUniverse from '../../common/ng-mocks-universe';
import mockHelperStub from '../../mock-helper/mock-helper.stub';
import helperUseFactory from '../../mock-service/helper.use-factory';
import mockProvider from '../../mock-service/mock-provider';
import { IMockBuilderConfigMock } from '../types';

const createInstance = (existing: any, params: any, config: IMockBuilderConfigMock): any => {
  if (config.precise) {
    return params;
  }

  return mockHelperStub(existing, params);
};

export default (def: any, defValue: Map<any, any>): void => {
  if (isNgDef(def, 'i') && defValue.has(def)) {
    const config: IMockBuilderConfigMock = ngMocksUniverse.config.get(def);
    const instance = defValue.get(def);
    ngMocksUniverse.builtProviders.set(
      def,
      helperUseFactory(def, undefined, existing => createInstance(existing, instance, config)),
    );
  } else if (isNgDef(def, 'i')) {
    ngMocksUniverse.builtProviders.set(def, mockProvider(def, true));
  }

  if (!isNgDef(def) && defValue.has(def)) {
    const instance = defValue.get(def);
    ngMocksUniverse.builtProviders.set(
      def,
      helperUseFactory(def, undefined, () => instance),
    );
  } else if (!isNgDef(def)) {
    ngMocksUniverse.builtProviders.set(def, mockProvider(def, true));
  }
};
