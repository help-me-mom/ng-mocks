import { Directive, Type } from '@angular/core';

const cache = new Map<Type<Directive>, Type<Directive>>();

export function MockDirective<TDirective>(directive: Type<TDirective>): Type<TDirective> {
  const cacheHit = cache.get(directive);
  if (cacheHit) {
    return cacheHit as Type<TDirective>;
  }

  const annotations = (directive as any).__annotations__[0] || {};
  const propertyMetadata = (directive as any).__prop__metadata__ || {};

  const options: Directive = {
    exportAs: annotations.exportAs,
    inputs: Object.keys(propertyMetadata)
                  .filter((meta) => isInput(propertyMetadata[meta]))
                  .map((meta) => [meta, propertyMetadata[meta][0].bindingPropertyName || meta].join(':')),
    selector: annotations.selector
  };

  const mockedDirective =  Directive(options)(class DirectiveMock {} as Type<TDirective>);
  cache.set(directive, mockedDirective);

  return mockedDirective;
}

function isInput(propertyMetadata: any): boolean {
  return propertyMetadata[0].ngMetadataName === 'Input';
}
