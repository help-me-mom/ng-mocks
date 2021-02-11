import { AnyType } from '../common/core.types';

export default (provide: AnyType<any>, useExisting: AnyType<any>) => ({
  provide,
  useExisting,
});
