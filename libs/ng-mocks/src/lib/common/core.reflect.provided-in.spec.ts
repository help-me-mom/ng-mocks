import coreReflectProvidedIn from './core.reflect.provided-in';

describe('core.reflect.provided-in', () => {
  it('covers ɵprov', () => {
    expect(coreReflectProvidedIn({})).toEqual(undefined);
    expect(
      coreReflectProvidedIn({
        ɵprov: { providedIn: 'root' },
      }),
    ).toEqual('root');
  });
});
