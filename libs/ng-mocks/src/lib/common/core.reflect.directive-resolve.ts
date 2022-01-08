// tslint:disable max-func-body-length cyclomatic-complexity

import { Component, Directive } from '@angular/core';

import coreReflectBodyCatch from './core.reflect.body-catch';

export default (def: any): Directive & Partial<Component> =>
  coreReflectBodyCatch((arg: any) => {
    let declaration: undefined | (Directive & Partial<Component>);

    let prototype = def;
    while (prototype && Object.getPrototypeOf(prototype) !== null) {
      if (!declaration && Array.isArray(prototype.__annotations__)) {
        for (const annotation of prototype.__annotations__) {
          if (annotation.ngMetadataName === 'Component' || annotation.ngMetadataName === 'Directive') {
            declaration = annotation;
          }
        }
      }
      if (!declaration && Array.isArray(prototype.decorators)) {
        for (const decorator of prototype.decorators) {
          if (
            decorator.type.prototype.ngMetadataName === 'Component' ||
            decorator.type.prototype.ngMetadataName === 'Directive'
          ) {
            declaration = decorator.args[0];
          }
        }
      }

      prototype = Object.getPrototypeOf(prototype);
      if (declaration) {
        break;
      }
    }

    if (!declaration) {
      throw new Error('Cannot resolve declarations');
    }

    const props = arg.propDecorators ? Object.getOwnPropertyNames(arg.propDecorators) : [];
    if (!declaration.inputs) {
      declaration.inputs = [];
      for (const prop of props) {
        for (const value of arg.propDecorators[prop]) {
          if (value.type.prototype.ngMetadataName === 'Input') {
            declaration.inputs.push(prop + (value.args?.[0] ? `: ${value.args[0]}` : ''));
          }
        }
      }
    }
    if (!declaration.outputs) {
      declaration.outputs = [];
      for (const prop of props) {
        for (const value of arg.propDecorators[prop]) {
          if (value.type.prototype.ngMetadataName === 'Output') {
            declaration.outputs.push(prop + (value.args?.[0] ? `: ${value.args[0]}` : ''));
          }
        }
      }
    }
    if (!declaration.queries) {
      declaration.queries = {};
      let first = true;
      for (const prop of props) {
        for (const value of arg.propDecorators[prop]) {
          if (value.type.prototype.ngMetadataName === 'ContentChild') {
            declaration.queries[prop] = {
              first,
              isViewQuery: false,
              ngMetadataName: value.type.prototype.ngMetadataName,
              selector: value.args[0],
              ...(value.args[1] || {}),
            };
            first = false;
          }
          if (value.type.prototype.ngMetadataName === 'ContentChildren') {
            declaration.queries[prop] = {
              first,
              isViewQuery: false,
              ngMetadataName: value.type.prototype.ngMetadataName,
              selector: value.args[0],
              ...(value.args[1] || {}),
            };
            first = false;
          }
          if (value.type.prototype.ngMetadataName === 'ViewChild') {
            declaration.queries[prop] = {
              first,
              isViewQuery: true,
              ngMetadataName: value.type.prototype.ngMetadataName,
              selector: value.args[0],
              ...(value.args[1] || {}),
            };
            first = false;
          }
          if (value.type.prototype.ngMetadataName === 'ViewChildren') {
            declaration.queries[prop] = {
              first,
              isViewQuery: true,
              ngMetadataName: value.type.prototype.ngMetadataName,
              selector: value.args[0],
              ...(value.args[1] || {}),
            };
            first = false;
          }
        }
      }
    }

    return declaration;
  })(def);
