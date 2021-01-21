const solveOutput = (output: any): string => {
  if (typeof output === 'function') {
    return '($event)';
  }
  if (output && typeof output === 'object' && typeof output.emit === 'function') {
    return '.emit($event)';
  }
  if (output && typeof output === 'object' && typeof output.next === 'function') {
    return '.next($event)';
  }

  return '=$event';
};

const generateTemplateAttrWrap = (prop: string, type: 'i' | 'o') => (type === 'i' ? `[${prop}]` : `(${prop})`);

const generateTemplateAttrWithParams = (params: any, prop: string, type: 'i' | 'o'): string =>
  ` ${generateTemplateAttrWrap(prop, type)}="${prop}${type === 'o' ? solveOutput(params[prop]) : ''}"`;

const generateTemplateAttrWithoutParams = (key: string, value: string, type: 'i' | 'o'): string =>
  ` ${generateTemplateAttrWrap(key, type)}="${value}${type === 'o' ? '.emit($event)' : ''}"`;

const generateTemplateAttr = (params: any, attr: any, type: 'i' | 'o') => {
  let mockTemplate = '';
  for (const definition of attr) {
    const [property, alias] = definition.split(': ');
    mockTemplate += params
      ? generateTemplateAttrWithParams(params, alias || property, type)
      : generateTemplateAttrWithoutParams(alias || property, property, type);
  }

  return mockTemplate;
};

export default (declaration: any, { selector, params, inputs, outputs }: any): string => {
  let mockTemplate = '';

  // istanbul ignore else
  if (typeof declaration === 'string') {
    mockTemplate = declaration;
  } else if (selector) {
    mockTemplate += `<${selector}`;
    mockTemplate += generateTemplateAttr(params, inputs, 'i');
    mockTemplate += generateTemplateAttr(params, outputs, 'o');
    mockTemplate += `></${selector}>`;
  }

  return mockTemplate;
};
