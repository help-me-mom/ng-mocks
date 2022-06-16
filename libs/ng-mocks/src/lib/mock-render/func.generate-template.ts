import coreReflectPipeResolve from '../common/core.reflect.pipe-resolve';
import { isNgDef } from '../common/func.is-ng-def';

const generateTemplateAttrWrap = (prop: string, type: 'i' | 'o') => (type === 'i' ? `[${prop}]` : `(${prop})`);

const generateTemplateAttrWithParams = (prop: string, type: 'i' | 'o'): string => {
  let tpl = ` ${generateTemplateAttrWrap(prop, type)}="`;
  tpl += type === 'i' ? prop : `__ngMocksOutput('${prop}', $event)`;
  tpl += '"';

  return tpl;
};

const generateTemplateAttr = (bindings: null | undefined | any[], attr: any, type: 'i' | 'o') => {
  // unprovided params for inputs should render empty placeholders
  if (!bindings && type === 'o') {
    return '';
  }

  let mockTemplate = '';
  const keys = bindings ?? attr;
  for (const definition of attr) {
    const [property, alias] = definition.split(': ');
    mockTemplate +=
      keys.indexOf(alias || property) === -1 ? '' : generateTemplateAttrWithParams(alias || property, type);
  }

  return mockTemplate;
};

export default (declaration: any, { selector, bindings, inputs, outputs }: any): string => {
  let mockTemplate = '';

  // istanbul ignore else
  if (typeof declaration === 'string') {
    mockTemplate = declaration;
  } else if (isNgDef(declaration, 'p') && bindings && bindings.indexOf('$implicit') !== -1) {
    mockTemplate = `{{ $implicit | ${coreReflectPipeResolve(declaration).name} }}`;
  } else if (selector) {
    mockTemplate += `<${selector}`;
    mockTemplate += generateTemplateAttr(bindings, inputs, 'i');
    mockTemplate += generateTemplateAttr(bindings, outputs, 'o');
    mockTemplate += `></${selector}>`;
  }

  return mockTemplate;
};
