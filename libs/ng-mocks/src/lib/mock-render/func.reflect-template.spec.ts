import {
  Component,
  Directive,
  Input,
  input,
  reflectComponentType,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import coreReflectDirectiveResolve from '../common/core.reflect.directive-resolve';

import funcReflectTemplate from './func.reflect-template';

describe('funcReflectTemplate', () => {
  it('preserves signal inputs and ordinary input transforms on component clones', () => {
    @Component({
      standalone: false,
      template: '',
    })
    class TargetComponent {
      // Root tests transpile the fixture without Angular's signal transform.
      @Input({ alias: 'publicValue', isSignal: true } as never)
      public readonly value = input(0);

      @Input({ alias: 'publicPlain', transform: String })
      public plain = '';
    }

    const originalInputs =
      reflectComponentType(TargetComponent)?.inputs;
    const originalTemplateInputs = [
      ...(coreReflectDirectiveResolve(TargetComponent).inputs || []),
    ];
    const configure = spyOn(
      TestBed,
      'configureTestingModule',
    ).and.stub();

    const template = funcReflectTemplate(TargetComponent);

    const child =
      configure.calls.mostRecent().args[0].declarations![0];
    const inputs = reflectComponentType(child)?.inputs;
    expect(inputs).toEqual(
      jasmine.arrayContaining([
        jasmine.objectContaining({
          isSignal: true,
          propName: 'value',
          templateName: 'publicValue',
        }),
        jasmine.objectContaining({
          isSignal: false,
          propName: 'plain',
          templateName: 'publicPlain',
          transform: String,
        }),
      ]),
    );
    expect(inputs?.length).toEqual(2);
    expect(reflectComponentType(TargetComponent)?.inputs).toEqual(
      originalInputs,
    );
    expect(template.inputs?.length).toEqual(2);
    expect(template.inputs).toEqual(originalTemplateInputs);
    expect(
      coreReflectDirectiveResolve(TargetComponent).inputs,
    ).toEqual(originalTemplateInputs);
    expect(
      (TargetComponent as any).__prop__metadata__.value.length,
    ).toEqual(1);
    expect(
      (TargetComponent as any).__prop__metadata__.plain.length,
    ).toEqual(1);
  });

  it('preserves signal metadata from effective directive input overrides', () => {
    @Directive({
      selector: '[first],[second]',
      standalone: false,
    })
    class TargetDirective {
      @Input({ alias: 'publicValue', isSignal: true } as never)
      public readonly value = input(0);
    }

    TestBed.configureTestingModule({});
    spyOn((TestBed as any).ngMocksOverrides, 'get').and.returnValue({
      override: {
        set: {
          inputs: [
            {
              alias: 'overrideValue',
              isSignal: true,
              name: 'value',
              required: true,
            },
          ],
        },
      },
    });
    const configure = spyOn(
      TestBed,
      'configureTestingModule',
    ).and.stub();

    funcReflectTemplate(TargetDirective);

    const child =
      configure.calls.mostRecent().args[0].declarations![0];
    expect(child.ɵdir.inputs.overrideValue[1]).toEqual(1);
    expect(child.__prop__metadata__.value).toEqual([
      jasmine.objectContaining({
        alias: 'overrideValue',
        isSignal: true,
        required: true,
      }),
    ]);
    expect((TargetDirective as any).__prop__metadata__.value).toEqual(
      [
        jasmine.objectContaining({
          alias: 'publicValue',
          isSignal: true,
        }),
      ],
    );
  });

  it('preserves ordinary input alias precedence when a property is declared twice', () => {
    @Component({
      inputs: ['value:first', 'value:second'],
      standalone: false,
      template: '',
    })
    class TargetComponent {
      public value = '';
    }

    const originalInputs =
      reflectComponentType(TargetComponent)?.inputs;
    const configure = spyOn(
      TestBed,
      'configureTestingModule',
    ).and.stub();

    funcReflectTemplate(TargetComponent);

    const child =
      configure.calls.mostRecent().args[0].declarations![0];
    expect(reflectComponentType(child)?.inputs).toEqual(
      originalInputs,
    );
    expect(originalInputs).toEqual([
      jasmine.objectContaining({
        propName: 'value',
        templateName: 'second',
      }),
    ]);
  });

  it('accepts an override with undefined input metadata', () => {
    @Component({
      standalone: false,
      template: '',
    })
    class TargetComponent {}

    TestBed.configureTestingModule({});
    spyOn((TestBed as any).ngMocksOverrides, 'get').and.returnValue({
      override: {
        set: { inputs: undefined },
      },
    });
    const configure = spyOn(
      TestBed,
      'configureTestingModule',
    ).and.stub();

    funcReflectTemplate(TargetComponent);

    const child =
      configure.calls.mostRecent().args[0].declarations![0];
    expect(reflectComponentType(child)?.inputs).toEqual([]);
  });
});
