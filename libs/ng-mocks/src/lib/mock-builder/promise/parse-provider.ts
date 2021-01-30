import funcGetProvider from '../../common/func.get-provider';

export default (
  provider: any,
): {
  multi: boolean;
  provide: any;
} => {
  const provide = funcGetProvider(provider);
  const multi = provide !== provider && provider.multi;

  return {
    multi,
    provide,
  };
};
