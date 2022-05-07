import { Pipe, PipeTransform } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// A simple pipe that accepts an array of strings, sorts them,
// and returns a joined string of the values.
@Pipe({
  name: 'target',
})
class TargetPipe implements PipeTransform {
  public transform(value: string[], asc = true): string {
    let result = [...(value || [])].sort();
    if (!asc) {
      result = result.reverse();
    }

    return result.join(', ');
  }
}

describe('TestPipe', () => {
  ngMocks.faster(); // the same TestBed for several its.

  // Because we want to test the pipe, we pass it as the first
  // parameter of MockBuilder. We can omit the second parameter,
  // because there are no dependencies.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetPipe));

  it('sorts strings', () => {
    const fixture = MockRender(TargetPipe, {
      $implicit: ['1', '3', '2'],
    });

    expect(fixture.nativeElement.innerHTML).toEqual('1, 2, 3');
  });

  it('reverses strings on param', () => {
    const fixture = MockRender('{{ values | target:flag }}', {
      flag: false,
      values: ['1', '3', '2'],
    });

    expect(fixture.nativeElement.innerHTML).toEqual('3, 2, 1');
  });
});
