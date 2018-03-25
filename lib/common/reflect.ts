import { Component, Directive, Type } from '@angular/core';

const metaReducer = (propertyMetaData: any) =>
  (acc: string[], meta: any): string[] =>
    acc.concat(propertyMetaData[meta].map((m: any): string =>
      [meta, m.bindingPropertyName || meta].join(':')));

export function getInputsOutputs(directive: Type<Component | Directive>, type: 'Input' | 'Output'): string[] {
  if (!directive) {
    return [];
  }
  const propertyMetadata = (directive as any).__prop__metadata__ || {};
  return Object.keys(propertyMetadata)
               .filter((meta) => propertyMetadata[meta].find((m: any) => m.ngMetadataName === type))
               .reduce(metaReducer(propertyMetadata), [])
               .concat(getInputsOutputs((directive as any).__proto__, type));
}
