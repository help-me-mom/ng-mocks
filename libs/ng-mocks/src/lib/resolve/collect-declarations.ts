// tslint:disable max-func-body-length cyclomatic-complexity

import coreDefineProperty from '../common/core.define-property';

const parse = (def: any): any => {
  if (def.hasOwnProperty('__ngMocksParsed')) {
    return def.__ngMocksDeclarations;
  }

  const parent = Object.getPrototypeOf(def);
  const parentDeclarations = parent ? parse(parent) : {};
  const declarations: Record<string, any> = {
    host: (parentDeclarations.host ? { ...parentDeclarations.host } : {}) as Record<string, string>,
    hostBindings: (parentDeclarations.hostBindings ? [...parentDeclarations.hostBindings] : []) as any[],
    hostListeners: (parentDeclarations.hostListeners ? [...parentDeclarations.hostListeners] : []) as any[],
    inputs: (parentDeclarations.inputs ? [...parentDeclarations.inputs] : []) as string[],
    outputs: (parentDeclarations.outputs ? [...parentDeclarations.outputs] : []) as string[],
    propDecorators: parentDeclarations.propDecorators ? { ...parentDeclarations.propDecorators } : {},
    queries: (parentDeclarations.queries ? { ...parentDeclarations.queries } : {}) as Record<string, any>,
  };

  coreDefineProperty(def, '__ngMocksParsed', true);

  // <=13.0.2
  for (const annotation of def.__annotations__ || []) {
    const ngMetadataName = annotation?.ngMetadataName;
    if (!ngMetadataName) {
      continue;
    }

    declarations[ngMetadataName] = { ...annotation };
  }

  // >13.0.2
  for (const decorator of def.decorators || []) {
    const ngMetadataName = decorator?.type?.prototype?.ngMetadataName;
    if (!ngMetadataName) {
      continue;
    }

    declarations[ngMetadataName] = decorator.args ? { ...decorator.args[0] } : {};
  }

  const props: string[] = [];
  for (const key of def.propDecorators ? Object.getOwnPropertyNames(def.propDecorators) : []) {
    if (props.indexOf(key) === -1) {
      props.push(key);
    }
  }
  for (const key of def.propDecorators ? Object.keys(def.propDecorators) : []) {
    if (props.indexOf(key) === -1) {
      props.push(key);
    }
  }
  for (const prop of props) {
    declarations.propDecorators[prop] = [...(declarations.propDecorators[prop] || []), ...def.propDecorators[prop]];
    for (const decorator of def.propDecorators[prop]) {
      const ngMetadataName = decorator?.type?.prototype?.ngMetadataName;
      if (!ngMetadataName) {
        continue;
      }

      if (ngMetadataName === 'Input') {
        const value = prop + (decorator.args?.[0] ? `: ${decorator.args[0]}` : '');
        if (declarations.inputs.indexOf(value) === -1) {
          declarations.inputs.unshift(value);
        }
      } else if (ngMetadataName === 'Output') {
        const value = prop + (decorator.args?.[0] ? `: ${decorator.args[0]}` : '');
        if (declarations.outputs.indexOf(value) === -1) {
          declarations.outputs.unshift(value);
        }
      } else if (ngMetadataName === 'ContentChild') {
        if (!declarations.queries[prop]) {
          declarations.queries[prop] = {
            ngMetadataName,
            selector: decorator.args[0],
            ...(decorator.args[1] || {}),
          };
        }
      } else if (ngMetadataName === 'ContentChildren') {
        if (!declarations.queries[prop]) {
          declarations.queries[prop] = {
            ngMetadataName,
            selector: decorator.args[0],
            ...(decorator.args[1] || {}),
          };
        }
      } else if (ngMetadataName === 'ViewChild') {
        if (!declarations.queries[prop]) {
          declarations.queries[prop] = {
            ngMetadataName,
            selector: decorator.args[0],
            ...(decorator.args[1] || {}),
          };
        }
      } else if (ngMetadataName === 'ViewChildren') {
        if (!declarations.queries[prop]) {
          declarations.queries[prop] = {
            ngMetadataName,
            selector: decorator.args[0],
            ...(decorator.args[1] || {}),
          };
        }
      } else if (ngMetadataName === 'HostBinding') {
        const key = `[${decorator.args?.[0] || prop}]`;
        if (!declarations.host[key]) {
          declarations.host[key] = prop;
        }
        declarations.hostBindings.push([prop, ...(decorator.args || [])]);
      } else if (ngMetadataName === 'HostListener') {
        const key = `(${decorator.args?.[0] || prop})`;
        if (!declarations.host[key]) {
          declarations.host[key] = `${prop}($event)`;
        }
        declarations.hostListeners.push([prop, ...(decorator.args || [])]);
      }
    }
  }

  if (declarations.Directive) {
    declarations.Directive.inputs = declarations.Directive.inputs || [];
    for (const input of declarations.inputs) {
      if (declarations.Directive.inputs.indexOf(input) === -1) {
        declarations.Directive.inputs.push(input);
      }
    }

    declarations.Directive.outputs = declarations.Directive.outputs || [];
    for (const output of declarations.outputs) {
      if (declarations.Directive.outputs.indexOf(output) === -1) {
        declarations.Directive.outputs.push(output);
      }
    }

    declarations.Directive.queries = {
      ...(declarations.Directive.queries || []),
      ...declarations.queries,
    };

    declarations.Directive.hostBindings = declarations.hostBindings;
    declarations.Directive.hostListeners = declarations.hostListeners;
  }

  if (declarations.Component) {
    declarations.Component.inputs = declarations.Component.inputs || [];
    for (const input of declarations.inputs) {
      if (declarations.Component.inputs.indexOf(input) === -1) {
        declarations.Component.inputs.push(input);
      }
    }

    declarations.Component.outputs = declarations.Component.outputs || [];
    for (const output of declarations.outputs) {
      if (declarations.Component.outputs.indexOf(output) === -1) {
        declarations.Component.outputs.push(output);
      }
    }

    declarations.Component.queries = {
      ...(declarations.Component.queries || []),
      ...declarations.queries,
    };

    declarations.Component.hostBindings = declarations.hostBindings;
    declarations.Component.hostListeners = declarations.hostListeners;
  }

  coreDefineProperty(def, '__ngMocksDeclarations', {
    ...parentDeclarations,
    ...declarations,
  });

  return def.__ngMocksDeclarations;
};

export default (def: any): any => {
  return parse(def);
};
