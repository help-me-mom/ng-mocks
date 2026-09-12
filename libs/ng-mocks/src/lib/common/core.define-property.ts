import helperMockService from '../mock-service/helper.mock-service';

export default (instance: any, property: keyof any, value: any, enumerable = false) => {
  helperMockService.definePropertyDescriptor(instance, property, {
    configurable: true,
    enumerable,
    value,
    writable: true,
  });
};
