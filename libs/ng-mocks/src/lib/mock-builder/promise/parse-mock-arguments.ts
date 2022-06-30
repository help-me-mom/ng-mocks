import { isNgDef } from '../../common/func.is-ng-def';

export default (
  def: any,
  a1: any,
  a2: any,
  defaultMockValue: any,
): {
  config: any;
  mock: any;
} => {
  let mock: any = def === a1 ? defaultMockValue : a1;
  let config: any = a2 ?? (a1 !== defaultMockValue && typeof a1 === 'object' ? a1 : undefined);
  if (isNgDef(def, 'p') && typeof a1 === 'function' && a1 !== def && !isNgDef(a1, 'p')) {
    mock = {
      transform: a1,
    };
    config = a2;
  } else if (isNgDef(def, 'i') || !isNgDef(def)) {
    config = a2;
  }
  mock = mock === config ? defaultMockValue : mock;

  return {
    config,
    mock,
  };
};
