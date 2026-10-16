import helperDefinePropertyDescriptor from './helper.define-property-descriptor';
import helperExtractMethodsFromPrototype from './helper.extract-methods-from-prototype';
import helperExtractPropertyDescriptor from './helper.extract-property-descriptor';

export default (service: any, bindFrom?: object, bindTo?: object, mock?: any): any => {
  const instance = function (...args: any[]) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return (mock || service).apply(bindFrom === this ? bindTo : this, args);
  };

  const properties: Array<string | symbol> = [];
  const methods = helperExtractMethodsFromPrototype(service, properties);
  for (const prop of [...methods, ...properties]) {
    const desc = helperExtractPropertyDescriptor(service, prop);
    helperDefinePropertyDescriptor(instance, prop, desc);
  }

  return instance;
};
