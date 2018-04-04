import { Type } from '@angular/core';
import { jitReflector, pipeResolver } from '../common/reflect';
import { MockComponent } from '../mock-component';
import { MockDirective } from '../mock-directive';
import { MockPipe } from '../mock-pipe';

export function MockDeclarations(...declarations: Array<Type<any>>): Array<Type<any>> {
  return declarations.map(MockDeclaration);
}

export function MockDeclaration(declaration: Type<any>): Type<any> {
  if (pipeResolver.isPipe(declaration)) {
    return MockPipe(declaration as any) as any;
  }

  const annotations = jitReflector.annotations(declaration);
  if (annotations.find((annotation) => annotation.template || annotation.templateUrl)) {
    return MockComponent(declaration) as any;
  }

  return MockDirective(declaration) as any;
}
