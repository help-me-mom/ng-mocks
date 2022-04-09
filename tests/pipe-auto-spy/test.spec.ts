import { Pipe, PipeTransform } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Pipe({
  name: 'target',
})
class TargetPipe implements PipeTransform {
  public transform(value: string): number {
    return value.length;
  }
}

describe('pipe-auto-spy', () => {
  beforeEach(() => MockBuilder(null, TargetPipe));

  it('has spy out of the box', () => {
    MockRender("{{ 'test' | target }}");
    const pipe = ngMocks.findInstance(TargetPipe);
    expect(pipe.transform).toHaveBeenCalledWith('test');
    expect(pipe.transform).toHaveBeenCalledTimes(1);
  });
});
