// tslint:disable max-func-body-length cyclomatic-complexity

import { NgModule } from '@angular/core';

import coreReflectBodyCatch from './core.reflect.body-catch';

export default (def: any): NgModule =>
  coreReflectBodyCatch((arg: any) => {
    let declaration: undefined | NgModule;

    if (!declaration && Array.isArray(arg.__annotations__)) {
      for (const annotation of arg.__annotations__) {
        if (annotation.ngMetadataName === 'NgModule') {
          declaration = annotation;
        }
      }
    }
    if (!declaration && Array.isArray(arg.decorators)) {
      for (const decorator of arg.decorators) {
        if (decorator.type.prototype.ngMetadataName === 'NgModule') {
          declaration = decorator.args?.[0] || {};
        }
      }
    }

    if (!declaration) {
      throw new Error('Cannot resolve declarations');
    }

    return declaration;
  })(def);
