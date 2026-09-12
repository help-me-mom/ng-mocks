import { Directive, InjectionToken, NgModule } from '@angular/core';

import { getMockedNgDefOf, MockBuilder, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[target]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetDirective {}

@Directive({
  selector: '[replacement]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class ReplacementDirective {}

// View Engine copies literal provider graphs; class instances retain identity.
class Value<T> {
  public constructor(public readonly value: T) {}
}

const shared = { declaration: TargetDirective, label: 'shared' };
const untouched = { label: 'untouched' };
const configuration = {
  first: shared,
  second: shared,
  list: [shared, shared],
  untouched,
};
const sharedArray: Array<typeof TargetDirective | string> = [
  TargetDirective,
  'preserved',
];
const arrays = [sharedArray, sharedArray];
const CONFIG = new InjectionToken<Value<typeof configuration>>(
  'CONFIG',
);
const ARRAYS = new InjectionToken<Value<typeof arrays>>('ARRAYS');

@NgModule({
  declarations: [TargetDirective],
  providers: [
    { provide: CONFIG, useValue: new Value(configuration) },
    { provide: ARRAYS, useValue: new Value(arrays) },
  ],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14927
describe('issue-14927', () => {
  it('excludes declarations through every shared object and array path', async () => {
    await MockBuilder()
      .mock(TargetModule)
      .keep(CONFIG)
      .keep(ARRAYS)
      .exclude(TargetDirective);

    const actual = ngMocks.get(CONFIG).value;
    const actualArrays = ngMocks.get(ARRAYS).value;

    // A cache hit must retain the transformation made on the first path.
    expect(actual.first.declaration).toBeUndefined();
    expect(actual.second.declaration).toBeUndefined();
    expect(actual.first).toBe(actual.second);
    expect(actual.list[0]).toBe(actual.first);
    expect(actual.list[1]).toBe(actual.first);
    expect(actual.first.label).toBe('shared');
    expect(actual.untouched).toBe(untouched);
    expect(actualArrays[0]).toEqual(['preserved']);
    expect(actualArrays[1]).toEqual(['preserved']);
    expect(actualArrays[0]).toBe(actualArrays[1]);
    expect(configuration.first).toBe(shared);
    expect(configuration.second).toBe(shared);
    expect(configuration.list).toEqual([shared, shared]);
    expect(shared.declaration).toBe(TargetDirective);
    expect(arrays[0]).toBe(sharedArray);
    expect(arrays[1]).toBe(sharedArray);
    expect(sharedArray).toEqual([TargetDirective, 'preserved']);
  });

  it('replaces declarations consistently through shared nodes', async () => {
    await MockBuilder()
      .mock(TargetModule)
      .keep(CONFIG)
      .keep(ARRAYS)
      .replace(TargetDirective, ReplacementDirective);

    const actual = ngMocks.get(CONFIG).value;
    const actualArrays = ngMocks.get(ARRAYS).value;

    expect(actual.first.declaration).toBe(ReplacementDirective);
    expect(actual.second.declaration).toBe(ReplacementDirective);
    expect(actual.first).toBe(actual.second);
    expect(actual.list[0]).toBe(actual.first);
    expect(actual.list[1]).toBe(actual.first);
    expect(actual.untouched).toBe(untouched);
    expect(actualArrays[0]).toEqual([
      ReplacementDirective,
      'preserved',
    ]);
    expect(actualArrays[1]).toEqual([
      ReplacementDirective,
      'preserved',
    ]);
    expect(actualArrays[0]).toBe(actualArrays[1]);
    expect(shared.declaration).toBe(TargetDirective);
    expect(sharedArray).toEqual([TargetDirective, 'preserved']);
  });

  it('uses the same mock declaration through shared nodes', async () => {
    await MockBuilder().mock(TargetModule).keep(CONFIG).keep(ARRAYS);

    const actual = ngMocks.get(CONFIG).value;
    const actualArrays = ngMocks.get(ARRAYS).value;

    expect(actual.first.declaration).toBe(
      getMockedNgDefOf(TargetDirective, 'd'),
    );
    expect(actual.first.declaration).not.toBe(TargetDirective);
    expect(actual.second.declaration).toBe(actual.first.declaration);
    expect(actual.first).toBe(actual.second);
    expect(actual.list[0]).toBe(actual.first);
    expect(actual.list[1]).toBe(actual.first);
    expect(actualArrays[0][0]).toBe(actual.first.declaration);
    expect(actualArrays[1][0]).toBe(actual.first.declaration);
    expect(actualArrays[0]).toBe(actualArrays[1]);
    expect(shared.declaration).toBe(TargetDirective);
    expect(sharedArray).toEqual([TargetDirective, 'preserved']);
  });

  it('preserves the original shared graph when no declarations change', async () => {
    await MockBuilder()
      .mock(TargetModule)
      .keep(CONFIG)
      .keep(ARRAYS)
      .keep(TargetDirective);

    expect(ngMocks.get(CONFIG).value).toBe(configuration);
    expect(ngMocks.get(ARRAYS).value).toBe(arrays);
    expect(configuration.first).toBe(configuration.second);
    expect(arrays[0]).toBe(arrays[1]);
  });
});
