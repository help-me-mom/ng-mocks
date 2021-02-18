import { Directive } from '@angular/core';

import funcParseInputsAndRequiresAttributes from './func.parse-inputs-and-requires-attributes';

@Directive({
  selector: 'target',
})
class TargetDirective {}

describe('func.parse-inputs-and-requires-attributes', () => {
  it('handles binding.name when no nonMinifiedName', () => {
    const value = {};
    const node: any = {
      injector: {
        elDef: {
          element: {
            publicProviders: {
              test: {
                bindings: [
                  {
                    name: 'name',
                  },
                ],
                nodeIndex: 5,
                provider: {
                  value,
                },
              },
            },
          },
        },
        get: () => new TargetDirective(),
      },
    };

    expect(
      funcParseInputsAndRequiresAttributes(node, 'test'),
    ).toEqual([[], ['name'], 5]);
  });
});
