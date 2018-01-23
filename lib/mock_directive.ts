import { Directive, Type } from '@angular/core';

export function MockDirective<TDirective>(directive: Type<TDirective>): Type<TDirective> {
  const propertyMetadata = getPropertyMetadata(directive);

  const options = {
    inputs: new Array<string>(),
    selector: getSelector(directive),
  };

  options.inputs = Object.keys(propertyMetadata).filter((meta) => isInput(propertyMetadata[meta]));

  class DirectiveMock {}

  /* tslint:disable:no-angle-bracket-type-assertion */
  return Directive(options as Directive)(<any> DirectiveMock as Type<TDirective>);
  /* tslint:enable:no-angle-bracket-type-assertion */
}

function isInput(propertyMetadata: any): boolean {
  return propertyMetadata[0].ngMetadataName === 'Input';
}

function getSelector(directive: any): string {
  if (directive.__annotations__) {
    return directive.__annotations__[0].selector;
  }
  throw new Error('No annotation or decoration metadata on your directive');
}

function getPropertyMetadata(directive: any): any {
  return directive.__prop__metadata__ || {};
}
