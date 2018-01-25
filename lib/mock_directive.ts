import { Directive, Type } from '@angular/core';

export function MockDirective<TDirective>(directive: Type<TDirective>): Type<TDirective> {
  const annotations = (directive as any).__annotations__[0] || {};
  const propertyMetadata = (directive as any).__prop__metadata__ || {};

  const options: Directive = {
    exportAs: annotations.exportAs,
    inputs: Object.keys(propertyMetadata)
                  .filter((meta) => isInput(propertyMetadata[meta]))
                  .map((meta) => [meta, propertyMetadata[meta][0].bindingPropertyName || meta].join(':')),
    selector: annotations.selector
  };

  return Directive(options)(class DirectiveMock {} as Type<TDirective>);
}

function isInput(propertyMetadata: any): boolean {
  return propertyMetadata[0].ngMetadataName === 'Input';
}
