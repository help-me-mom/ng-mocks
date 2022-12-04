import funcGetType from '../../common/func.get-type';

export default (
  provider: any,
): {
  multi: boolean;
  provide: any;
} => {
  const provide = funcGetType(provider);
  const multi = provide !== provider && provider.multi;

  return {
    multi,
    provide,
  };
};
