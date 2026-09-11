import helperMockService from '../mock-service/helper.mock-service';

export default (instance: any, property: keyof any, value: any, enumerable = false, configurable = true) => {
  helperMockService.definePropertyDescriptor(
    instance,
    property,
    {
      enumerable,
      value,
      writable: true,
    },
    { configurable, checkInherited: false },
  );
};
