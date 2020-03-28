import { Component } from '@angular/core';

import { MockDeclaration } from './mock-declaration';

// tslint:disable:max-classes-per-file
@Component({
  selector: 'empty-template-container',
  template: '',
})
export class EmptyTemplateContainer {}
// tslint:enable:max-classes-per-file

describe('MockDeclaration', () => {
  it('should process components with an empty template correctly', () => {
    const mockedComponent: any = MockDeclaration(EmptyTemplateContainer);
    expect(mockedComponent.nameConstructor).toEqual('ComponentMock');
  });
});
