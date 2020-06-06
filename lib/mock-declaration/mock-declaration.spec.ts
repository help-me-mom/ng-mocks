import { Component } from '@angular/core';

import { MockDeclaration } from './mock-declaration';

@Component({
  selector: 'empty-template-container',
  template: '',
})
export class EmptyTemplateContainer {}

describe('MockDeclaration', () => {
  it('should process components with an empty template correctly', () => {
    const mockedComponent: any = MockDeclaration(EmptyTemplateContainer);
    expect(mockedComponent.nameConstructor).toEqual('ComponentMock');
  });
});
