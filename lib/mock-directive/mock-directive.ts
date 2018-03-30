import { Directive, EventEmitter, Type } from '@angular/core';
import { directiveResolver } from '../common/reflect';

const cache = new Map<Type<Directive>, Type<Directive>>();

export function MockDirectives<TDirective>(...directives: Array<Type<TDirective>>): Array<Type<TDirective>> {
  return directives.map(MockDirective);
}

export function MockDirective<TDirective>(directive: Type<TDirective>): Type<TDirective> {
  const cacheHit = cache.get(directive);
  if (cacheHit) {
    return cacheHit as Type<TDirective>;
  }

  const { selector, exportAs, inputs, outputs } = directiveResolver.resolve(directive);
  const options: Directive = { exportAs, inputs, outputs, selector };

  // tslint:disable-next-line:no-unnecessary-class
  class DirectiveMock {
    constructor() {
      (options.outputs || []).forEach((output) => {
        (this as any)[output.split(':')[0]] = new EventEmitter<any>();
      });
    }
  }

  const mockedDirective =  Directive(options)(DirectiveMock as Type<TDirective>);
  cache.set(directive, mockedDirective);

  return mockedDirective;
}
