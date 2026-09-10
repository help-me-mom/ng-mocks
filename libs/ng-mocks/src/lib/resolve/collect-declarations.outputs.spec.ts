import {
  Component,
  Directive,
  EventEmitter,
  Output,
} from '@angular/core';

import collectDeclarations from './collect-declarations';

describe('collect-declarations:outputs', () => {
  it('deduplicates formatted component aliases without mutating their annotation array', () => {
    const outputs = ['declared : publicDeclared'];

    @Component({
      // eslint-disable-next-line @angular-eslint/no-outputs-metadata-property
      outputs,
      selector: 'target-output-metadata',
      standalone: false,
      template: '',
    })
    class TargetComponent {
      public readonly declared = new EventEmitter<string>();
      @Output() public readonly changed = new EventEmitter<string>();
    }

    const actual = collectDeclarations(TargetComponent);

    expect(actual.Component.outputs).toEqual([
      'declared : publicDeclared',
      'changed',
    ]);
    expect(outputs).toEqual(['declared : publicDeclared']);
  });

  it('deduplicates formatted directive aliases and preserves distinct aliases of one property', () => {
    const outputs = ['declared : first', 'declared : second'];

    @Directive({
      // eslint-disable-next-line @angular-eslint/no-outputs-metadata-property
      outputs,
      selector: '[targetOutputMetadata]',
      standalone: false,
    })
    class TargetDirective {
      public readonly declared = new EventEmitter<string>();
    }

    const actual = collectDeclarations(TargetDirective);

    expect(actual.Directive.outputs).toEqual([
      'declared : first',
      'declared : second',
    ]);
    expect(outputs).toEqual([
      'declared : first',
      'declared : second',
    ]);
  });
});
