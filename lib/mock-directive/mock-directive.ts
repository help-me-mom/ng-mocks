import { Directive, Type } from '@angular/core';
import { getInputsOutputs } from '../common/reflect';

const cache = new Map<Type<Directive>, Type<Directive>>();

export function MockDirectives<TDirective>(...directives: Array<Type<TDirective>>): Array<Type<TDirective>> {
  return directives.map(MockDirective);
}

export function MockDirective<TDirective>(directive: Type<TDirective>): Type<TDirective> {
  const cacheHit = cache.get(directive);
  if (cacheHit) {
    return cacheHit as Type<TDirective>;
  }

  let annotation: any = {};
  const annotations: any[] = (directive as any).__annotations__;
  if (annotations) {
    annotation = annotations[0];
  } else {
    if (!directive.hasOwnProperty('decorators')) {
      throw new Error(`Cannot find the annotations/decorators for directive ${directive.name}`);
    }
    annotation = (directive as any).decorators[0].args[0];
  }

  const options: Directive = {
    exportAs: annotation.exportAs,
    inputs: getInputsOutputs(directive, 'Input'),
    outputs: getInputsOutputs(directive, 'Output'),
    selector: annotation.selector
  };

  const mockedDirective =  Directive(options)(class DirectiveMock {} as Type<TDirective>);
  cache.set(directive, mockedDirective);

  return mockedDirective;
}
