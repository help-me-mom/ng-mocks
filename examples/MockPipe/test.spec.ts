import { Component, Pipe, PipeTransform } from '@angular/core';
import { MockBuilder, MockRender } from 'ng-mocks';

@Pipe({ name: 'dependency' })
class DependencyPipe implements PipeTransform {
  public transform = (name: string): string => `hi ${name}`;
}

@Component({
  selector: 'component',
  template: `{{ 'foo' | dependency }}`,
})
class TestedComponent {}

describe('MockPipe', () => {
  beforeEach(() => {
    return MockBuilder(TestedComponent).mock(
      DependencyPipe,
      (...args: string[]) => JSON.stringify(args),
    );
  });

  it('transforms values to json', () => {
    const fixture = MockRender(TestedComponent);

    expect(fixture.nativeElement.innerHTML).toEqual(
      '<component>["foo"]</component>',
    );
  });
});
