import { AnyType } from '../common/core.types';

export default (provide: AnyType<any>, useFactory: any) => ({
  multi: true,
  provide,
  useFactory,
});
