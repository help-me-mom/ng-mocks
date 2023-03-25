import {
  Component,
  Directive,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';

import {
  getMockedNgDefOf,
  MockBuilder,
  MockComponent,
  MockDirective,
  MockModule,
  MockPipe,
  ngMocks,
} from 'ng-mocks';

@Pipe({
  name: 'target',
})
class TargetPipe implements PipeTransform {
  protected name = 'pipe:';

  public transform(value: string): any {
    return `${this.name}${value}`;
  }
}

@Component({
  selector: 'target-get-mocked-ng-def-of',
  template: 'target',
})
class TargetComponent {}

@Directive({
  selector: 'target-get-mocked-ng-def-of',
})
class TargetDirective {}

@Directive({
  selector: 'real',
})
class RealDirective {}

@Directive({
  selector: 'side',
})
class SideDirective {}

@NgModule({
  declarations: [TargetComponent, TargetDirective, TargetPipe],
})
class TargetModule {}

describe('getMockedNgDefOf:legacy', () => {
  it('returns mock for a component', () => {
    const mock = MockComponent(TargetComponent);
    expect(getMockedNgDefOf(TargetComponent, 'c')).toBe(mock);
    expect(getMockedNgDefOf(TargetComponent)).toBe(mock);
  });

  it('returns mock for a directive', () => {
    const mock = MockDirective(TargetDirective);
    expect(getMockedNgDefOf(TargetDirective, 'd')).toBe(mock);
    expect(getMockedNgDefOf(TargetDirective)).toBe(mock);
  });

  it('throws an error outside of MockBuilder', () => {
    MockPipe(TargetPipe);
    expect(() => getMockedNgDefOf(TargetPipe, 'p')).toThrowError(
      'There is no mock for TargetPipe',
    );
    expect(() => getMockedNgDefOf(TargetPipe)).toThrowError(
      'There is no mock for TargetPipe',
    );
  });

  it('returns mock for a module', () => {
    const mock = MockModule(TargetModule);
    expect(getMockedNgDefOf(TargetModule, 'm')).toBe(mock);
    expect(getMockedNgDefOf(TargetModule)).toBe(mock);
  });

  it('throws on untouched declarations', () => {
    expect(() => getMockedNgDefOf(SideDirective)).toThrowError(
      'There is no mock for SideDirective',
    );
  });
});

describe('getMockedNgDefOf:mocks', () => {
  it('returns mock for a module', () => {
    const mock = MockModule(TargetModule);
    expect(getMockedNgDefOf(mock, 'm')).toBe(mock);
    expect(getMockedNgDefOf(mock)).toBe(mock);
  });

  it('returns mock for a component', () => {
    const mock = MockComponent(TargetComponent);
    expect(getMockedNgDefOf(mock, 'c')).toBe(mock);
    expect(getMockedNgDefOf(mock)).toBe(mock);
  });

  it('returns mock for a directive', () => {
    const mock = MockDirective(TargetDirective);
    expect(getMockedNgDefOf(mock, 'd')).toBe(mock);
    expect(getMockedNgDefOf(mock)).toBe(mock);
  });

  it('returns mock for a pipe', () => {
    const mock = MockPipe(TargetPipe);
    expect(getMockedNgDefOf(mock, 'p')).toBe(mock);
    expect(getMockedNgDefOf(mock)).toBe(mock);
  });

  it('throws on untouched declarations', () => {
    expect(() => getMockedNgDefOf(SideDirective)).toThrowError(
      'There is no mock for SideDirective',
    );
  });
});

describe('getMockedNgDefOf:builder', () => {
  ngMocks.faster();

  beforeEach(() => MockBuilder(RealDirective, TargetModule));

  it('returns mock for a module', () => {
    expect(getMockedNgDefOf(TargetModule, 'm')).toBeDefined();
    expect(getMockedNgDefOf(TargetModule)).toBeDefined();
  });

  it('returns mock for a component', () => {
    expect(getMockedNgDefOf(TargetComponent, 'c')).toBeDefined();
    expect(getMockedNgDefOf(TargetComponent)).toBeDefined();
  });

  it('returns mock for a directive', () => {
    expect(getMockedNgDefOf(TargetDirective, 'd')).toBeDefined();
    expect(getMockedNgDefOf(TargetDirective)).toBeDefined();
  });

  it('returns mock for a pipe', () => {
    expect(getMockedNgDefOf(TargetPipe, 'p')).toBeDefined();
    expect(getMockedNgDefOf(TargetPipe)).toBeDefined();
  });

  it('throws on kept declarations', () => {
    expect(() => getMockedNgDefOf(RealDirective)).toThrowError(
      'There is no mock for RealDirective',
    );
  });

  it('throws on untouched declarations', () => {
    expect(() => getMockedNgDefOf(SideDirective)).toThrowError(
      'There is no mock for SideDirective',
    );
  });
});
