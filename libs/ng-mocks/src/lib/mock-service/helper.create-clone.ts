import helperDefinePropertyDescriptor from './helper.define-property-descriptor';
import helperExtractMethodsFromPrototype from './helper.extract-methods-from-prototype';
import helperExtractPropertiesFromPrototype from './helper.extract-properties-from-prototype';
import helperExtractPropertyDescriptor from './helper.extract-property-descriptor';

export default (service: any): any => {
  const instance = function () {
    // tslint:disable-next-line:ban-ts-ignore
    // @ts-ignore
    return service.apply(this, arguments);
  };

  for (const prop of [
    ...helperExtractMethodsFromPrototype(service),
    ...helperExtractPropertiesFromPrototype(service),
  ]) {
    const desc = helperExtractPropertyDescriptor(service, prop);
    helperDefinePropertyDescriptor(instance, prop, desc);
  }

  return instance;
};
