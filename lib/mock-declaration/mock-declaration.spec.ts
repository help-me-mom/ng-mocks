import {
  Component,
  Directive,
  Pipe,
  PipeTransform,
} from '@angular/core';

import {
  MockDeclaration,
  MockDeclarations,
} from './mock-declaration';

@Component({
  selector: 'empty-template-container',
  template: '',
})
class TargetComponent {}

@Directive({
  selector: '[target]',
})
class TargetDirective {}

@Pipe({
  name: 'target',
})
class TargetPipe implements PipeTransform {
  protected name = 'target';

  public transform(value: any): string {
    return `${this.name}${value}`;
  }
}

class Target {
  public name = 'target';
}

describe('MockDeclaration', () => {
  it('should process a set correctly', () => {
    const mocks: any[] = MockDeclarations(
      TargetComponent,
      TargetDirective,
      TargetPipe,
    );
    expect(mocks.length).toEqual(3);
    expect(mocks[0].nameConstructor).toEqual('MockMiddleware');
    expect(mocks[1].nameConstructor).toEqual('MockMiddleware');
    expect(mocks[2].nameConstructor).toEqual('MockMiddleware');
  });

  it('should process components with an empty template correctly', () => {
    const mock: any = MockDeclaration(TargetComponent);
    expect(mock.nameConstructor).toEqual('MockMiddleware');
  });

  it('should process directives correctly', () => {
    const mock: any = MockDeclaration(TargetDirective);
    expect(mock.nameConstructor).toEqual('MockMiddleware');
  });

  it('should process pipes correctly', () => {
    const mock: any = MockDeclaration(TargetPipe);
    expect(mock.nameConstructor).toEqual('MockMiddleware');
  });

  it('should skip unknown types', () => {
    const mock: any = MockDeclaration(Target);
    expect(mock.nameConstructor).toBeUndefined();
  });
});
