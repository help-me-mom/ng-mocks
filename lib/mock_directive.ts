import { Directive, Type } from '@angular/core';

export function MockDirective<TDirective>(directive: Type<TDirective>): Type<TDirective> {
  const propertyMetadata = (directive as any).__prop__metadata__ || {};
  const annotations = (directive as any).__annotations__[0] || {};

  const options: any = {
    exportAs: annotations.exportAs,
    selector: annotations.selector,
  };

  options.inputs = Object.keys(propertyMetadata)
                         .filter((meta) => isInput(propertyMetadata[meta]))
                         .map((meta) => [meta, propertyMetadata[meta][0].bindingPropertyName || meta].join(':'));

  const compactReducer = (acc: any, option: any) => {
    if (options[option]) {
      acc[option] = options[option];
      return acc;
    }
  };

  Object.keys(options).reduce(compactReducer, {});

  class DirectiveMock {}

  /* tslint:disable:no-angle-bracket-type-assertion */
  return Directive(options as Directive)(<any> DirectiveMock as Type<TDirective>);
  /* tslint:enable:no-angle-bracket-type-assertion */
}

function isInput(propertyMetadata: any): boolean {
  return propertyMetadata[0].ngMetadataName === 'Input';
}
