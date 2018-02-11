import { Directive, Type } from '@angular/core';

const cache = new Map<Type<Directive>, Type<Directive>>();

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
    return (directive as any).decorators[0].args[0];
  }

  const propertyMetadata = (directive as any).__prop__metadata__ || {};

  const options: Directive = {
    exportAs: annotation.exportAs,
    inputs: Object.keys(propertyMetadata)
                  .filter((meta) => isInput(propertyMetadata[meta]))
                  .map((meta) => [meta, propertyMetadata[meta][0].bindingPropertyName || meta].join(':')),
    selector: annotation.selector
  };

  const mockedDirective =  Directive(options)(class DirectiveMock {} as Type<TDirective>);
  cache.set(directive, mockedDirective);

  return mockedDirective;
}

function isInput(propertyMetadata: any): boolean {
  return propertyMetadata[0].ngMetadataName === 'Input';
}
