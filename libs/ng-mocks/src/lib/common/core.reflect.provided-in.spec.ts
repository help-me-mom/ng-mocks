import coreReflectProvidedIn from './core.reflect.provided-in';

describe('core.reflect.provided-in', () => {
  it('covers ngInjectableDef', () => {
    expect(
      coreReflectProvidedIn({
        ngInjectableDef: {},
      }),
    ).toEqual(undefined);
    expect(
      coreReflectProvidedIn({
        ngInjectableDef: {
          providedIn: 'root',
        },
      }),
    ).toEqual('root');
  });
});
