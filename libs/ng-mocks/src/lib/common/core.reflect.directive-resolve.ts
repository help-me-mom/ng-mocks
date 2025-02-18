import { Component, Directive, NgModule, Pipe } from '@angular/core';

import collectDeclarations from '../resolve/collect-declarations';

import coreReflectBodyCatch from './core.reflect.body-catch';

export default (
  def: any,
): Directive &
  Partial<Component> &
  Pipe &
  NgModule & {
    hostBindings?: Array<[string, any]>;
    hostListeners?: Array<[string, any, any]>;
    imports?: any[];
    standalone?: boolean;
  } =>
  coreReflectBodyCatch((arg: any) => {
    const declaration = collectDeclarations(arg);
    if (declaration.Component) {
      return declaration.Component;
    }
    if (declaration.Directive) {
      return declaration.Directive;
    }
    if (declaration.Pipe) {
      return declaration.Pipe;
    }

    throw new Error('Cannot resolve declarations');
  })(def);
