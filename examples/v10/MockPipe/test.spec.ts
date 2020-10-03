import { Component, Pipe, PipeTransform } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Pipe({ name: 'dependency' })
class DependencyPipe implements PipeTransform {
  transform = (name: string): string => `hi ${name}`;
}

@Component({
  selector: 'tested',
  template: ` <span>{{ 'foo' | dependency }}</span> `,
})
class TestedComponent {}

describe('v10:MockPipe', () => {
  beforeEach(() => MockBuilder(TestedComponent).mock(DependencyPipe, (...args: string[]) => JSON.stringify(args)));

  describe('with transform override', () => {
    it('should return the result of the provided transform function', () => {
      const fixture = MockRender(TestedComponent);

      const pipeElement = ngMocks.find(fixture.debugElement, 'span');
      expect(pipeElement.nativeElement.innerHTML).toEqual('["foo"]');
    });
  });
});
