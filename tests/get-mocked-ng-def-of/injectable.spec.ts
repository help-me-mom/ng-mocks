import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  getMockedNgDefOf,
  isMockedNgDefOf,
  MockBuilder,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Injectable()
@Pipe({
  name: 'injectableGetMockedNgDefOf',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetPipe implements PipeTransform {
  public static constructed = 0;

  public constructor() {
    TargetPipe.constructed += 1;
  }

  public transform(value: string): string {
    return `real:${value}`;
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15340
describe('getMockedNgDefOf:injectable', () => {
  beforeEach(() => {
    ngMocks.reset();
    TargetPipe.constructed = 0;
  });
  afterEach(() => ngMocks.reset());

  it('returns the mock declaration when its kind is specified', () => {
    const metadata = MockBuilder()
      .mock(TargetPipe, value => `fixture:${value}`)
      .build();
    const mocks = metadata.declarations!.filter(declaration =>
      isMockedNgDefOf(declaration, TargetPipe, 'p'),
    );
    expect(mocks.length).toBeGreaterThan(0);
    const mock = mocks[0];
    TestBed.configureTestingModule(metadata);
    const fixture = MockRender(
      "{{ 'value' | injectableGetMockedNgDefOf }}",
    );

    // An injectable declaration also has a provider, which is not its mock class.
    expect(mock).toBeDefined();
    expect(mock).toBe(getMockedNgDefOf(TargetPipe, 'p'));
    expect(ngMocks.formatText(fixture)).toBe('fixture:value');
    expect(TargetPipe.constructed).toBe(0);
  });

  it('returns the mock declaration when its kind is omitted', () => {
    const metadata = MockBuilder()
      .mock(TargetPipe, value => `fixture:${value}`)
      .build();
    const mocks = metadata.declarations!.filter(declaration =>
      isMockedNgDefOf(declaration, TargetPipe, 'p'),
    );
    expect(mocks.length).toBeGreaterThan(0);
    const mock = mocks[0];
    TestBed.configureTestingModule(metadata);
    const fixture = MockRender(
      "{{ 'value' | injectableGetMockedNgDefOf }}",
    );

    expect(mock).toBeDefined();
    expect(mock).toBe(getMockedNgDefOf(TargetPipe));
    expect(ngMocks.formatText(fixture)).toBe('fixture:value');
    expect(TargetPipe.constructed).toBe(0);
  });
});
