import ngMocksUniverse from '../common/ng-mocks-universe';
import mockHelperStubMember from '../mock-helper/mock-helper.stub-member';

export default (def: any): any[] => {
  const callbacks = [];

  const config = ngMocksUniverse.configInstance.get(def);
  if (config?.overloads) {
    for (const [name, stub, encapsulation] of config.overloads) {
      if (name) {
        callbacks.push((instance: any) => {
          mockHelperStubMember(instance, name, stub, encapsulation);
        });
      } else {
        callbacks.push(stub);
      }
    }
  }

  return callbacks;
};
