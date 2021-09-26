import { Component, Pipe, PipeTransform } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

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
  // A fake transform function.
  const fakeTransform = (...args: string[]) => JSON.stringify(args);

  // A spy, just in case if we want to verify
  // how the pipe has been called.
  const spy =
    typeof jest === 'undefined'
      ? jasmine.createSpy().and.callFake(fakeTransform)
      : jest.fn(fakeTransform);
  // in case of jest
  // const spy = jest.fn().mockImplementation(fakeTransform);

  beforeEach(() => {
    return MockBuilder(TestedComponent).mock(DependencyPipe, spy);
  });

  it('transforms values to json', () => {
    const fixture = MockRender(TestedComponent);

    expect(fixture.nativeElement.innerHTML).toEqual(
      '<component>["foo"]</component>',
    );

    // Also we can find an instance of the pipe in
    // the fixture if it is needed.
    const pipe = ngMocks.findInstance(DependencyPipe);
    expect(pipe.transform).toHaveBeenCalledWith('foo');
    expect(pipe.transform).toHaveBeenCalledTimes(1);
  });
});
